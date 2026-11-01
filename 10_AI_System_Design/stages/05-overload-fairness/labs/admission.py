"""Atomic last-hop request/token/concurrency guard, with logical time.

No HTTP gateway or distributed quota service is deployed. Reservations are
conservative: unknown external outcomes retain slots until reconciliation.
"""
from contextlib import contextmanager
import sqlite3

class Gate:
 def __init__(self,path,requests=2,tokens=2000,concurrency=2,tenant_requests=2):
  if min(requests,tokens,concurrency,tenant_requests)<=0:raise ValueError('positive configured budgets required')
  self.path=str(path);self.request_cap=requests;self.token_cap=tokens;self.concurrency=concurrency;self.tenant_cap=tenant_requests
  with self.db() as db:db.executescript('CREATE TABLE IF NOT EXISTS buckets(scope TEXT PRIMARY KEY,balance REAL,updated REAL); CREATE TABLE IF NOT EXISTS reservations(tenant TEXT,user TEXT,key TEXT,payload TEXT,tokens INTEGER,state TEXT,PRIMARY KEY(tenant,user,key));')
 @contextmanager
 def db(self):
  db=sqlite3.connect(self.path,timeout=5);db.row_factory=sqlite3.Row
  try:
   with db:yield db
  finally:db.close()
 def reserve(self,tenant,user,key,payload,tokens,now,deadline):
  if not all(isinstance(x,str) and x.strip() for x in [tenant,user,key,payload]) or not isinstance(tokens,int) or tokens<=0:raise ValueError('invalid request')
  with self.db() as db:
   db.execute('BEGIN IMMEDIATE')
   old=db.execute('SELECT * FROM reservations WHERE tenant=? AND user=? AND key=?',(tenant,user,key)).fetchone()
   if old:
    if old['payload']!=payload or old['tokens']!=tokens:return 'conflict'
    return 'duplicate:'+old['state']
   if deadline<=now:return 'expired'
   if tokens>self.token_cap:return 'too_large'
   if db.execute("SELECT count(*) FROM reservations WHERE state IN ('active','unknown')").fetchone()[0]>=self.concurrency:return 'limited:concurrency'
   checks=[('global:requests',self.request_cap,1,1),('global:tokens',self.token_cap,1000,tokens),('tenant:'+tenant+':requests',self.tenant_cap,1,1)]
   balances=[]
   for scope,cap,refill,cost in checks:
    row=db.execute('SELECT * FROM buckets WHERE scope=?',(scope,)).fetchone()
    if row and now<row['updated']:raise ValueError('clock moved backwards')
    balance=cap if not row else min(cap,row['balance']+max(0,now-row['updated'])*refill)
    if balance<cost:return 'limited:'+scope
    balances.append((scope,balance-cost,now))
   for values in balances:db.execute('INSERT INTO buckets VALUES(?,?,?) ON CONFLICT(scope) DO UPDATE SET balance=excluded.balance,updated=excluded.updated',values)
   db.execute("INSERT INTO reservations VALUES(?,?,?,?,?,'active')",(tenant,user,key,payload,tokens))
   return 'accepted'
 def settle(self,tenant,user,key,outcome):
  if outcome not in ('completed','unknown'):raise ValueError('explicit terminal knowledge required')
  with self.db() as db:
   return db.execute("UPDATE reservations SET state=? WHERE tenant=? AND user=? AND key=? AND state='active'",(outcome,tenant,user,key)).rowcount==1
