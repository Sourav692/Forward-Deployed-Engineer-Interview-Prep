"""Durable migration metadata controller; no HTTP facade or business execution.

Trusted callers perform policy evaluation outside this slice. Every cutover and
rollback still requires CURRENT eligibility. A stored old route is not permission.
One SQLite file stands in for the regional migration controller's change records
and one cell's route record. It has no signatures, pull loop or staleness timer.
Generations only rise: rollback writes a new one, so a rolled-back one never returns.
"""
import json
import sqlite3
from hashlib import sha256

SAMPLE_FLOOR=100  # fixed demonstration gate; 0 mismatches in 100 bounds the rate at about 3% (95%)


def identity(manifest):
    required={'tenant','app','owner','region','bundle','budget_rps'}
    if set(manifest) != required or any(not isinstance(manifest[k],str) or not manifest[k] for k in required-{'budget_rps'}):
        raise ValueError('manifest schema')
    if type(manifest['budget_rps']) is not int or not 1<=manifest['budget_rps']<=100:
        raise ValueError('budget out of range')
    return sha256(json.dumps(manifest,sort_keys=True,separators=(',',':')).encode()).hexdigest()


class Platform:
    def __init__(self,path):
        self.db=sqlite3.connect(path)
        self.db.executescript('''
            CREATE TABLE IF NOT EXISTS apps (tenant TEXT, app TEXT, generation INTEGER, route TEXT, previous TEXT, PRIMARY KEY(tenant,app));
            CREATE TABLE IF NOT EXISTS changes (tenant TEXT, app TEXT, key TEXT, digest TEXT, target TEXT, state TEXT, PRIMARY KEY(tenant,app,key));
            -- Append-only: a later report can add samples but never erase a recorded mismatch.
            CREATE TABLE IF NOT EXISTS evidence (tenant TEXT, app TEXT, key TEXT, baseline_generation INTEGER, baseline_route TEXT, compared INTEGER, mismatches INTEGER);
            -- Append-only route history: every cutover and rollback, with who and why.
            CREATE TABLE IF NOT EXISTS history (tenant TEXT, app TEXT, generation INTEGER, action TEXT, from_route TEXT, to_route TEXT, actor TEXT, reason TEXT);
        ''')
        self.db.commit()

    def close(self):self.db.close()

    def seed(self,tenant,app,route):
        with self.db:self.db.execute('INSERT INTO apps VALUES (?,?,0,?,NULL)',(tenant,app,route))

    def propose(self,tenant,key,manifest,allowed_regions,approved_bundles):
        digest=identity(manifest)
        if tenant!=manifest['tenant']:raise PermissionError('tenant, region or bundle policy')
        if not key or len(key)>128:raise ValueError('invalid key')
        app=manifest['app']
        # A same-key retry inspects recorded intent, so a later revocation cannot hide it.
        row=self.db.execute('SELECT digest,state FROM changes WHERE tenant=? AND app=? AND key=?',(tenant,app,key)).fetchone()
        if row:
            if row[0]!=digest:raise ValueError('idempotency conflict')
            return row[1]
        if manifest['region'] not in allowed_regions or manifest['bundle'] not in approved_bundles:
            raise PermissionError('tenant, region or bundle policy')
        with self.db:
            if self.db.execute('SELECT 1 FROM apps WHERE tenant=? AND app=?',(tenant,app)).fetchone() is None:raise KeyError('unknown app')
            # INSERT, not upsert: a concurrent same-key proposal fails on the primary key.
            self.db.execute('INSERT INTO changes VALUES (?,?,?,?,?,?)',(tenant,app,key,digest,manifest['region']+'/'+manifest['bundle'],'proposed'))
        return 'proposed'

    def shadow(self,tenant,app,key,compared,mismatches,side_effect_free):
        if not side_effect_free:raise PermissionError('shadow must not execute business effects')
        if type(compared) is not int or type(mismatches) is not int or not 0<=mismatches<=compared:
            raise ValueError('invalid comparison counts')
        with self.db:
            if self.db.execute("SELECT 1 FROM changes WHERE tenant=? AND app=? AND key=? AND state IN ('proposed','shadow')",(tenant,app,key)).fetchone() is None:
                raise ValueError('unknown or closed change')
            # Bind the report to the route it was compared against.
            generation,route=self.db.execute('SELECT generation,route FROM apps WHERE tenant=? AND app=?',(tenant,app)).fetchone()
            self.db.execute('INSERT INTO evidence VALUES (?,?,?,?,?,?,?)',(tenant,app,key,generation,route,compared,mismatches))
            self.db.execute("UPDATE changes SET state='shadow' WHERE tenant=? AND app=? AND key=?",(tenant,app,key))

    def cutover(self,tenant,app,key,generation,current_eligible,fail_before_commit=False):
        if not current_eligible:raise PermissionError('current policy or readiness blocks')
        # BEGIN IMMEDIATE serialises local metadata writers. This is not remote fencing.
        try:
            self.db.execute('BEGIN IMMEDIATE')
            row=self.db.execute('SELECT target,state FROM changes WHERE tenant=? AND app=? AND key=?',(tenant,app,key)).fetchone()
            current=self.db.execute('SELECT generation,route FROM apps WHERE tenant=? AND app=?',(tenant,app)).fetchone()
            if not row or row[1]!='shadow' or current is None:raise ValueError('shadow evidence blocked')
            compared,mismatches,stale=self.db.execute(
                'SELECT SUM(compared),SUM(mismatches),SUM(baseline_generation!=? OR baseline_route!=?) FROM evidence WHERE tenant=? AND app=? AND key=?',
                (current[0],current[1],tenant,app,key)).fetchone()
            if stale:raise ValueError('stale evidence')
            if compared<SAMPLE_FLOOR or mismatches!=0:raise ValueError('shadow evidence blocked')
            cur=self.db.execute('UPDATE apps SET previous=route,route=?,generation=generation+1 WHERE tenant=? AND app=? AND generation=?',(row[0],tenant,app,generation))
            if cur.rowcount!=1:raise ValueError('stale generation')
            self.db.execute("UPDATE changes SET state='cutover' WHERE tenant=? AND app=? AND key=?",(tenant,app,key))
            self.db.execute('INSERT INTO history VALUES (?,?,?,?,?,?,?,?)',(tenant,app,generation+1,'cutover',current[1],row[0],'migration controller','change '+key))
            if fail_before_commit:raise OSError('injected pre-commit failure')
            self.db.commit()
        except Exception:
            self.db.rollback();raise
        return self.status(tenant,app)

    def apply(self,tenant,app,generation,route,current_eligible):
        """Cell applies a pulled generation whose signature is assumed verified.

        A signature proves origin, not present permission, so current eligibility is
        checked here. A generation not above the current one is refused, so N+1 cannot
        return after a local rollback wrote N+2."""
        if not current_eligible:raise PermissionError('current policy or readiness blocks')
        with self.db:
            # One conditional UPDATE is the compare-and-set: it applies only if still newer.
            cur=self.db.execute('UPDATE apps SET previous=route,route=?,generation=? WHERE tenant=? AND app=? AND generation<?',(route,generation,tenant,app,generation))
            if cur.rowcount!=1:raise ValueError('older generation or unknown app')
            self.db.execute('INSERT INTO history VALUES (?,?,?,?,?,?,?,?)',(tenant,app,generation,'apply',None,route,'control plane','published generation'))
        return self.status(tenant,app)

    def rollback(self,tenant,app,generation,current_previous_eligible,actor,reason):
        if not current_previous_eligible:raise PermissionError('previous route is no longer eligible')
        if not actor or not reason:raise ValueError('rollback needs actor and reason')
        try:
            self.db.execute('BEGIN IMMEDIATE')
            row=self.db.execute('SELECT route,previous FROM apps WHERE tenant=? AND app=? AND generation=? AND previous IS NOT NULL',(tenant,app,generation)).fetchone()
            if row is None:raise ValueError('stale generation or no previous route')
            # Writes generation N+2 carrying N's route. Clearing previous blocks a rollback of the
            # rollback: going forward again needs a fresh, gated change.
            self.db.execute('UPDATE apps SET route=previous,previous=NULL,generation=generation+1 WHERE tenant=? AND app=?',(tenant,app))
            self.db.execute('INSERT INTO history VALUES (?,?,?,?,?,?,?,?)',(tenant,app,generation+1,'rollback',row[0],row[1],actor,reason))
            self.db.commit()
        except Exception:
            self.db.rollback();raise
        return self.status(tenant,app)

    def inspect(self,tenant,app,key):
        """Read-only view of a change. Needs no current approval, so it works after revocation."""
        row=self.db.execute('SELECT state,target FROM changes WHERE tenant=? AND app=? AND key=?',(tenant,app,key)).fetchone()
        if row is None:raise KeyError('unknown change')
        compared,mismatches=self.db.execute('SELECT COALESCE(SUM(compared),0),COALESCE(SUM(mismatches),0) FROM evidence WHERE tenant=? AND app=? AND key=?',(tenant,app,key)).fetchone()
        return dict(state=row[0],target=row[1],compared=compared,mismatches=mismatches,**self.status(tenant,app))

    def history(self,tenant,app):
        rows=self.db.execute('SELECT generation,action,from_route,to_route,actor,reason FROM history WHERE tenant=? AND app=? ORDER BY generation',(tenant,app))
        return [dict(zip(('generation','action','from','to','actor','reason'),r)) for r in rows]

    def status(self,tenant,app):
        row=self.db.execute('SELECT generation,route,previous FROM apps WHERE tenant=? AND app=?',(tenant,app)).fetchone()
        if row is None:raise KeyError('unknown app')
        return dict(zip(('generation','route','previous'),row))
