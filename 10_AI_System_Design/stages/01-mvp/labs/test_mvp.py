"""HTTP integration checks for the representative slice; no external services."""

import json
import tempfile
import threading
import unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from mvp import App, make_server


class MVPTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.database = Path(self.temp.name) / "requests.sqlite"
        self.app = App(self.database)
        self.server = make_server(self.app)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        self.temp.cleanup()

    def call(self, path, body=None, token="demo-a", key="one"):
        headers = {"Authorization": f"Bearer {token}", "Idempotency-Key": key,
                   "Content-Type": "application/json"}
        data = json.dumps(body).encode() if body is not None else None
        req = Request(f"http://127.0.0.1:{self.server.server_port}{path}", data, headers)
        try:
            response = urlopen(req, timeout=3)
        except HTTPError as exc:
            response = exc
        with response:
            return response.status, json.load(response)

    def test_success_persists_across_app_recreation(self):
        status, result = self.call("/requests", {"prompt": "Draft supplier reply"})
        self.assertEqual(status, 201)
        restarted = App(self.database)
        status, saved = restarted.handle("GET", "/requests/" + result["id"], "demo-a")
        self.assertEqual((status, saved["answer"]), (200, result["answer"]))

    def test_authentication_prevents_model_call_and_write(self):
        status, _ = self.call("/requests", {"prompt": "Hello"}, token="unknown")
        self.assertEqual(status, 401)
        self.assertEqual(self.app.model.calls, 0)
        self.assertEqual(self.call("/requests")[1]["requests"], [])

    def test_tenant_scope_and_untrusted_body_claim(self):
        _, result = self.call("/requests", {"prompt": "Hello", "tenant_id": "B"})
        self.assertEqual(self.call("/requests/" + result["id"], token="demo-b")[0], 404)
        self.assertEqual(self.call("/requests", token="demo-b")[1]["requests"], [])
        self.assertEqual(len(self.call("/requests")[1]["requests"]), 1)

    def test_timeout_is_durable_and_retry_does_not_repeat_provider(self):
        status, result = self.call("/requests", {"prompt": "Hello", "mode": "timeout"})
        self.assertEqual(status, 504)
        saved = self.call("/requests/" + result["id"])[1]
        self.assertEqual((saved["status"], saved["error"]), ("failed", "provider_timeout"))
        self.assertEqual(self.call("/requests", {"prompt": "Hello"})[0], 409)
        self.assertEqual(self.app.model.calls, 1)

    def test_completed_key_replays_and_changed_prompt_conflicts(self):
        _, first = self.call("/requests", {"prompt": "Hello"})
        status, second = self.call("/requests", {"prompt": "Hello"})
        self.assertEqual((status, second), (200, first))
        self.assertEqual(self.call("/requests", {"prompt": "Different"})[0], 409)
        self.assertEqual(self.app.model.calls, 1)

    def test_final_commit_failure_never_returns_success(self):
        with self.app.connect() as db:
            db.execute("CREATE TRIGGER fail_completion BEFORE UPDATE ON requests "
                       "WHEN NEW.status='completed' BEGIN "
                       "SELECT RAISE(ABORT,'injected storage failure'); END")
        status, result = self.call("/requests", {"prompt": "Hello"})
        self.assertEqual((status, result["error"]), (503, "storage_unavailable"))
        rows = self.call("/requests")[1]["requests"]
        self.assertEqual(rows[0]["status"], "processing")
        self.assertEqual(self.call("/requests", {"prompt": "Hello"})[0], 409)
        self.assertEqual(self.app.model.calls, 1)

    def test_invalid_inputs_make_no_model_calls(self):
        for body in ({"prompt": ""}, {"prompt": "a" * 4001}, {"prompt": []},
                     {"prompt": " " * 4000 + "a"}, {"prompt": "   "}):
            self.assertEqual(self.call("/requests", body)[0], 400)
        self.assertEqual(self.call("/requests", {"prompt": "Hello"}, key=" ")[0], 400)
        self.assertEqual(self.app.model.calls, 0)

    def raw_post(self, data, content_type="application/json"):
        req = Request(f"http://127.0.0.1:{self.server.server_port}/requests", data,
                      {"Content-Type": content_type, "Authorization": "Bearer demo-a",
                       "Idempotency-Key": "raw"})
        try:
            response = urlopen(req, timeout=3)
        except HTTPError as exc:
            response = exc
        with response:
            return response.status, json.load(response)

    def test_malformed_and_nonobject_json_rejected(self):
        for raw in (b"{broken", b"[]", b'"text"'):
            self.assertEqual(self.raw_post(raw)[0], 400)
        self.assertEqual(self.app.model.calls, 0)
        self.assertEqual(self.call("/requests")[1]["requests"], [])

    def test_oversized_encoded_body_rejected(self):
        self.assertEqual(self.raw_post(b"x" * 20001)[0], 413)
        self.assertEqual(self.app.model.calls, 0)

    def test_wrong_media_type_rejected(self):
        self.assertEqual(self.raw_post(b'{"prompt":"Hello"}', "text/plain")[0], 415)
        self.assertEqual(self.app.model.calls, 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
