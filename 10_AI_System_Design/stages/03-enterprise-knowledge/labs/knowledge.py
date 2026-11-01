"""Local versioned text ingestion and permission-filtered FTS5 retrieval.

Blob table models immutable object storage; no real connector/PDF/model is used.
"""
from contextlib import contextmanager
import json
import re
import sqlite3

class Knowledge:
 def __init__(self,path):
  self.path=str(path)
  with self.db() as db:
   db.executescript('''CREATE TABLE IF NOT EXISTS blobs(tenant TEXT,doc TEXT,version INTEGER,text TEXT,PRIMARY KEY(tenant,doc,version));
   CREATE TABLE IF NOT EXISTS documents(tenant TEXT,doc TEXT,version INTEGER,readers TEXT,deleted INTEGER DEFAULT 0,policy_epoch INTEGER DEFAULT 1,PRIMARY KEY(tenant,doc));
   CREATE VIRTUAL TABLE IF NOT EXISTS search USING fts5(tenant UNINDEXED,doc UNINDEXED,version UNINDEXED,chunk UNINDEXED,text);''')
 @contextmanager
 def db(self):
  db=sqlite3.connect(self.path);db.row_factory=sqlite3.Row
  try:
   with db:yield db
  finally:db.close()
 def ingest(self,tenant,doc,version,text,readers,fail_before_index=False):
  if not isinstance(version,int) or version<1 or not text.strip() or len(text)>20000:raise ValueError('invalid source event')
  with self.db() as db:
   row=db.execute('SELECT text FROM blobs WHERE tenant=? AND doc=? AND version=?',(tenant,doc,version)).fetchone()
   if row and row['text']!=text:raise ValueError('immutable_version_conflict')
   db.execute('INSERT OR IGNORE INTO blobs VALUES(?,?,?,?)',(tenant,doc,version,text))
  if fail_before_index:raise RuntimeError('injected publish failure')
  with self.db() as db:
   db.execute('BEGIN IMMEDIATE')
   current=db.execute('SELECT version FROM documents WHERE tenant=? AND doc=?',(tenant,doc)).fetchone()
   if current and current['version']>=version:return False
   db.execute('DELETE FROM search WHERE tenant=? AND doc=?',(tenant,doc))
   for index,chunk in enumerate(x.strip() for x in text.split('\n\n') if x.strip()):
    db.execute('INSERT INTO search VALUES(?,?,?,?,?)',(tenant,doc,version,index,chunk))
   db.execute('INSERT INTO documents(tenant,doc,version,readers,deleted) VALUES(?,?,?,?,0) ON CONFLICT(tenant,doc) DO UPDATE SET version=excluded.version,readers=excluded.readers,deleted=0,policy_epoch=documents.policy_epoch+1',(tenant,doc,version,json.dumps(readers)))
  return True
 def delete(self,tenant,doc,version):
  with self.db() as db:
   db.execute('BEGIN IMMEDIATE')
   row=db.execute('SELECT version FROM documents WHERE tenant=? AND doc=?',(tenant,doc)).fetchone()
   if row and version<=row['version']:return False
   db.execute('DELETE FROM search WHERE tenant=? AND doc=?',(tenant,doc))
   db.execute("INSERT INTO documents(tenant,doc,version,readers,deleted) VALUES(?,?,?,'[]',1) ON CONFLICT(tenant,doc) DO UPDATE SET version=excluded.version,deleted=1,readers='[]',policy_epoch=documents.policy_epoch+1",(tenant,doc,version))
  return True
 def permissions(self,tenant,doc,readers):
  with self.db() as db:db.execute('UPDATE documents SET readers=?,policy_epoch=policy_epoch+1 WHERE tenant=? AND doc=?',(json.dumps(readers),tenant,doc))
 def search(self,tenant,user,query,k=3):
  terms=re.findall(r'\w+',query,flags=re.UNICODE)
  if not terms:return []
  expression=' OR '.join('"'+term+'"' for term in terms)
  with self.db() as db:
   rows=db.execute('''SELECT search.doc,search.version,search.chunk,search.text
    FROM search JOIN documents d ON d.tenant=search.tenant AND d.doc=search.doc
    WHERE search MATCH ? AND d.tenant=? AND search.version=d.version AND d.deleted=0
    AND EXISTS(SELECT 1 FROM json_each(d.readers) WHERE value=?)
    ORDER BY bm25(search),search.doc,search.chunk LIMIT ?''',(expression,tenant,user,k)).fetchall()
  return [dict(x) for x in rows]
 def context(self,tenant,user,hits):
  result=[]
  with self.db() as db:
   for hit in hits:
    row=db.execute('SELECT * FROM documents WHERE tenant=? AND doc=?',(tenant,hit['doc'])).fetchone()
    if row and not row['deleted'] and row['version']==int(hit['version']) and user in json.loads(row['readers']):
     # Resolve trusted stored text, never accept caller-supplied hit text.
     text=db.execute('SELECT text FROM search WHERE tenant=? AND doc=? AND version=? AND chunk=?',(tenant,hit['doc'],hit['version'],hit['chunk'])).fetchone()
     if text:result.append({'citation':f"{hit['doc']}:v{hit['version']}:c{hit['chunk']}",'text':text['text']})
  return result
