"""Local teaching API: SQLite persistence, fixture identity, deterministic model stub.

Run: python3 mvp.py --database /tmp/stage1-demo.sqlite --port 8767
This deliberately makes no hosted-model calls. Never expose it beyond loopback.
"""

import argparse
import json
import sqlite3
import time
import uuid
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse


class ProviderTimeout(Exception):
    """The provider did not return within its allotted time."""


class ModelAdapter:
    """Replace this fixture with an HTTP client behind the same boundary later.

    A real client must enforce connect/read/total deadlines, cap output tokens,
    and disable automatic retries for this stage's request contract.
    """

    def __init__(self):
        self.calls = 0

    def generate(self, prompt, mode):
        self.calls += 1
        if mode == "timeout":
            raise ProviderTimeout("simulated provider deadline")
        return "Draft: Please confirm the supplier delivery date before replying."


SCHEMA = """
CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    request_key TEXT NOT NULL,
    prompt TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('processing','completed','failed')),
    answer TEXT,
    error TEXT,
    created_at REAL NOT NULL,
    UNIQUE(tenant_id, user_id, request_key)
);
CREATE INDEX IF NOT EXISTS history_scope
ON requests(tenant_id, user_id, created_at DESC);
"""

# Public fixture tokens, not secrets or an OAuth implementation. The handler
# derives tenant/user from this trusted mapping and ignores caller tenant claims.
IDENTITIES = {"demo-a": ("A", "alice"), "demo-b": ("B", "bob")}


class App:
    def __init__(self, database, model=None):
        self.database = str(database)
        self.model = model or ModelAdapter()
        with self.connect() as db:
            db.executescript(SCHEMA)

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.database, timeout=1)
        db.row_factory = sqlite3.Row
        try:
            with db:
                yield db
        finally:
            db.close()

    def handle(self, method, path, token, body=None, key=None):
        identity = IDENTITIES.get(token)
        if identity is None:
            return 401, {"error": "unauthenticated"}
        tenant, user = identity
        if method == "GET" and path == "/requests":
            with self.connect() as db:
                rows = db.execute(
                    "SELECT id,status,created_at FROM requests "
                    "WHERE tenant_id=? AND user_id=? "
                    "ORDER BY created_at DESC LIMIT 50", (tenant, user)
                ).fetchall()
            return 200, {"requests": [dict(row) for row in rows]}
        if method == "GET" and path.startswith("/requests/"):
            with self.connect() as db:
                row = db.execute(
                    "SELECT id,status,answer,error FROM requests "
                    "WHERE id=? AND tenant_id=? AND user_id=?",
                    (path.removeprefix("/requests/"), tenant, user)
                ).fetchone()
            return (200, dict(row)) if row else (404, {"error": "not_found"})
        if method != "POST" or path != "/requests":
            return 404, {"error": "not_found"}
        body = body or {}
        prompt = body.get("prompt")
        mode = body.get("mode", "success")
        if (not isinstance(prompt, str) or not prompt.strip() or len(prompt) > 4000
                or not isinstance(key, str) or not key.strip() or len(key) > 100
                or mode not in ("success", "timeout")):
            return 400, {"error": "invalid_input"}

        request_id = str(uuid.uuid4())
        try:
            # Commit before the slow external boundary; never hold the write
            # transaction open while waiting for a model response.
            with self.connect() as db:
                db.execute(
                    "INSERT INTO requests VALUES (?,?,?,?,?,'processing',NULL,NULL,?)",
                    (request_id, tenant, user, key, prompt, time.time())
                )
        except sqlite3.IntegrityError:
            with self.connect() as db:
                row = db.execute(
                    "SELECT * FROM requests WHERE tenant_id=? AND user_id=? "
                    "AND request_key=?", (tenant, user, key)
                ).fetchone()
            if row is None or row["prompt"] != prompt:
                return 409, {"error": "key_conflict"}
            if row["status"] != "completed":
                return 409, {"id": row["id"], "error": row["status"]}
            return 200, {"id": row["id"], "status": "completed", "answer": row["answer"]}

        try:
            answer = self.model.generate(prompt, mode)
        except ProviderTimeout:
            with self.connect() as db:
                db.execute(
                    "UPDATE requests SET status='failed',error='provider_timeout' WHERE id=?",
                    (request_id,)
                )
            return 504, {"id": request_id, "error": "provider_timeout"}

        # Only a committed answer may be returned as a completed request. A DB
        # failure here is intentionally not hidden or reclassified as success.
        with self.connect() as db:
            db.execute(
                "UPDATE requests SET status='completed',answer=? WHERE id=?",
                (answer, request_id)
            )
        return 201, {"id": request_id, "status": "completed", "answer": answer}


def make_server(app, port=0):
    class Handler(BaseHTTPRequestHandler):
        def dispatch(self):
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if not 0 <= length <= 20000:
                    self.reply(413, {"error": "body_too_large"})
                    return
                if (self.command == "POST"
                        and self.headers.get_content_type() != "application/json"):
                    self.reply(415, {"error": "unsupported_media_type"})
                    return
                raw = self.rfile.read(length)
                body = json.loads(raw) if raw else None
                if body is not None and not isinstance(body, dict):
                    raise ValueError("expected an object")
                auth = self.headers.get("Authorization", "")
                token = auth[7:] if auth.startswith("Bearer ") else ""
                status, result = app.handle(
                    self.command, urlparse(self.path).path, token, body,
                    self.headers.get("Idempotency-Key")
                )
            except (ValueError, json.JSONDecodeError):
                status, result = 400, {"error": "invalid_json_or_length"}
            except sqlite3.Error:
                status, result = 503, {"error": "storage_unavailable"}
            self.reply(status, result)

        def reply(self, status, result):
            data = json.dumps(result).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            if status == 401:
                self.send_header("WWW-Authenticate", 'Bearer realm="stage1-demo"')
            self.end_headers()
            self.wfile.write(data)

        do_GET = dispatch
        do_POST = dispatch

        def log_message(self, *_):
            # Avoid recording prompts or fixture credentials in access logs.
            pass

    return ThreadingHTTPServer(("127.0.0.1", port), Handler)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", required=True)
    parser.add_argument("--port", type=int, default=8767)
    args = parser.parse_args()
    server = make_server(App(args.database), args.port)
    print(f"Local fixture API: http://127.0.0.1:{server.server_port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
