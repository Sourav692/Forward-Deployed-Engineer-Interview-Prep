"""Durable job/queue teaching slice. Logical clocks make crash tests deterministic.

SQLite is a single-host queue here, not a network broker or multi-host deployment.
Stage 1's requests table/API remains unchanged in its own executable.
"""
from contextlib import contextmanager
import json
import sqlite3
import uuid

class Jobs:
    def __init__(self, path):
        self.path=str(path)
        with self.db() as db:
            db.execute('''CREATE TABLE IF NOT EXISTS jobs(
                id TEXT PRIMARY KEY, tenant TEXT, user TEXT, key TEXT, payload TEXT,
                state TEXT, epoch INTEGER DEFAULT 0, lease_until REAL DEFAULT 0,
                available REAL DEFAULT 0, attempts INTEGER DEFAULT 0,
                external_started INTEGER DEFAULT 0, result TEXT,
                step INTEGER DEFAULT 0, deadline REAL,
                UNIQUE(tenant,user,key))''')
    @contextmanager
    def db(self):
        db=sqlite3.connect(self.path,timeout=5);db.row_factory=sqlite3.Row
        try:
            with db:yield db
        finally:db.close()
    def submit(self, tenant, user, key, payload, deadline=90):
        if not all(isinstance(x,str) and x.strip() for x in [tenant,user,key,payload]):raise ValueError('invalid job')
        with self.db() as db:
            row=db.execute('SELECT * FROM jobs WHERE tenant=? AND user=? AND key=?',(tenant,user,key)).fetchone()
            if row:
                if row['payload']!=payload:raise ValueError('key_conflict')
                return row['id']
            job=str(uuid.uuid4())
            # Unique reservation is the final arbiter when submissions race.
            try:db.execute("INSERT INTO jobs(id,tenant,user,key,payload,state,deadline) VALUES(?,?,?,?,?,'queued',?)",(job,tenant,user,key,payload,deadline))
            except sqlite3.IntegrityError:
                row=db.execute('SELECT * FROM jobs WHERE tenant=? AND user=? AND key=?',(tenant,user,key)).fetchone()
                if row['payload']!=payload:raise ValueError('key_conflict')
                return row['id']
        return job
    def get(self, job, tenant, user):
        with self.db() as db:
            row=db.execute('SELECT * FROM jobs WHERE id=? AND tenant=? AND user=?',(job,tenant,user)).fetchone()
            return dict(row) if row else None
    def claim(self, now, lease=10):
        if lease<=0:raise ValueError('lease must be positive')
        with self.db() as db:
            db.execute('BEGIN IMMEDIATE')
            # A previously started external call cannot be retried safely merely
            # because its worker vanished. Preserve ambiguity for reconciliation.
            db.execute("UPDATE jobs SET state='unknown' WHERE state='leased' AND lease_until<=? AND external_started=1",(now,))
            db.execute("UPDATE jobs SET state='dead' WHERE state IN ('queued','leased') AND (deadline<=? OR (attempts>=3 AND lease_until<=?))",(now,now))
            row=db.execute("SELECT * FROM jobs WHERE (state='queued' AND available<=?) OR (state='leased' AND lease_until<=? AND external_started=0) ORDER BY rowid LIMIT 1",(now,now)).fetchone()
            if row is None:return None
            db.execute("UPDATE jobs SET state='leased',epoch=epoch+1,attempts=attempts+1,lease_until=? WHERE id=?",(now+lease,row['id']))
            return dict(db.execute('SELECT * FROM jobs WHERE id=?',(row['id'],)).fetchone())
    def change(self, job, epoch, now, statement, values=(), guard=""):
        with self.db() as db:
            cursor=db.execute('UPDATE jobs SET '+statement+" WHERE id=? AND epoch=? AND state='leased' AND lease_until>? AND deadline>?"+guard,(*values,job,epoch,now,now))
            return cursor.rowcount==1
    def external_start(self, job, epoch, now):
        return self.change(job,epoch,now,'external_started=1')
    def finish(self, job, epoch, now, result):
        return self.change(job,epoch,now,"state='completed',result=?",(result,))
    def retry(self, job, epoch, now):
        # This path is for known-safe failures before external effects only.
        with self.db() as db:
            row=db.execute('SELECT * FROM jobs WHERE id=?',(job,)).fetchone()
        if not row or row['external_started']:return False
        state='dead' if row['attempts']>=3 else 'queued'
        return self.change(job,epoch,now,'state=?,available=?',(state,now+2**row['attempts']))
    def checkpoint(self, job, epoch, now, tool, output):
        if tool not in ('extract','validate','draft'):raise ValueError('tool_not_allowed')
        with self.db() as db:
            row=db.execute('SELECT * FROM jobs WHERE id=?',(job,)).fetchone()
        if row['step']>=3:raise ValueError('step_budget_exhausted')
        return self.change(job,epoch,now,'step=step+1,result=?',(json.dumps({'tool':tool,'output':output}),),guard=' AND step<3')
