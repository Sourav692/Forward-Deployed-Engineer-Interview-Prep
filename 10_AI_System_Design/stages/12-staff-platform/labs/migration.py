"""Durable migration metadata controller; no HTTP facade or business execution.

Trusted callers perform policy evaluation outside this slice. Every cutover and
rollback still requires CURRENT eligibility. A stored old route is not permission.
"""
import json
import sqlite3
from hashlib import sha256


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
        self.db.execute('CREATE TABLE IF NOT EXISTS apps (tenant TEXT, app TEXT, generation INTEGER, route TEXT, previous TEXT, PRIMARY KEY(tenant,app))')
        self.db.execute('CREATE TABLE IF NOT EXISTS changes (tenant TEXT, app TEXT, key TEXT, digest TEXT, target TEXT, state TEXT, compared INTEGER, mismatches INTEGER, PRIMARY KEY(tenant,app,key))')
        self.db.commit()

    def close(self):self.db.close()

    def seed(self,tenant,app,route):
        with self.db:self.db.execute('INSERT INTO apps VALUES (?,?,0,?,NULL)',(tenant,app,route))

    def propose(self,tenant,key,manifest,allowed_regions,approved_bundles):
        digest=identity(manifest)
        if tenant!=manifest['tenant'] or manifest['region'] not in allowed_regions or manifest['bundle'] not in approved_bundles:
            raise PermissionError('tenant, region or bundle policy')
        if not key or len(key)>128:raise ValueError('invalid key')
        app=manifest['app'];target=manifest['region']+'/'+manifest['bundle']
        with self.db:
            if self.db.execute('SELECT 1 FROM apps WHERE tenant=? AND app=?',(tenant,app)).fetchone() is None:raise KeyError('unknown app')
            row=self.db.execute('SELECT digest,state FROM changes WHERE tenant=? AND app=? AND key=?',(tenant,app,key)).fetchone()
            if row:
                if row[0]!=digest:raise ValueError('idempotency conflict')
                return row[1]
            self.db.execute('INSERT INTO changes VALUES (?,?,?,?,?,?,0,0)',(tenant,app,key,digest,target,'proposed'))
        return 'proposed'

    def shadow(self,tenant,app,key,compared,mismatches,side_effect_free):
        if not side_effect_free:raise PermissionError('shadow must not execute business effects')
        if type(compared) is not int or type(mismatches) is not int or not 0<=mismatches<=compared:
            raise ValueError('invalid comparison counts')
        with self.db:
            cur=self.db.execute("UPDATE changes SET state='shadow',compared=?,mismatches=? WHERE tenant=? AND app=? AND key=? AND state IN ('proposed','shadow')",(compared,mismatches,tenant,app,key))
            if cur.rowcount!=1:raise ValueError('unknown or closed change')

    def cutover(self,tenant,app,key,generation,current_eligible,fail_before_commit=False):
        if not current_eligible:raise PermissionError('current policy or readiness blocks')
        # BEGIN IMMEDIATE serialises local metadata writers. This is not remote fencing.
        try:
            self.db.execute('BEGIN IMMEDIATE')
            row=self.db.execute('SELECT target,state,compared,mismatches FROM changes WHERE tenant=? AND app=? AND key=?',(tenant,app,key)).fetchone()
            if not row or row[1]!='shadow' or row[2]<100 or row[3]!=0:raise ValueError('shadow evidence blocked')
            cur=self.db.execute('UPDATE apps SET previous=route,route=?,generation=generation+1 WHERE tenant=? AND app=? AND generation=?',(row[0],tenant,app,generation))
            if cur.rowcount!=1:raise ValueError('stale generation')
            self.db.execute("UPDATE changes SET state='cutover' WHERE tenant=? AND app=? AND key=?",(tenant,app,key))
            if fail_before_commit:raise OSError('injected pre-commit failure')
            self.db.commit()
        except Exception:
            self.db.rollback();raise
        return self.status(tenant,app)

    def rollback(self,tenant,app,generation,current_previous_eligible):
        if not current_previous_eligible:raise PermissionError('previous route is no longer eligible')
        with self.db:
            cur=self.db.execute('UPDATE apps SET route=previous,previous=route,generation=generation+1 WHERE tenant=? AND app=? AND generation=? AND previous IS NOT NULL',(tenant,app,generation))
            if cur.rowcount!=1:raise ValueError('stale generation or no previous route')
        return self.status(tenant,app)

    def status(self,tenant,app):
        row=self.db.execute('SELECT generation,route,previous FROM apps WHERE tenant=? AND app=?',(tenant,app)).fetchone()
        if row is None:raise KeyError('unknown app')
        return dict(zip(('generation','route','previous'),row))
