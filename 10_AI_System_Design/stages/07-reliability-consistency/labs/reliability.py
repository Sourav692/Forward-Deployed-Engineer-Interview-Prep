"""Two-file replication/projection fixture, not a consensus or failover service."""
from contextlib import contextmanager
import json,sqlite3,uuid,threading
class Unavailable(Exception):pass
class LostResponse(Exception):pass
@contextmanager
def connection(path):
 db=sqlite3.connect(str(path));db.row_factory=sqlite3.Row
 try:
  with db:yield db
 finally:db.close()
class Primary:
 def __init__(self,path):
  self.path=path;self.available=True
  with connection(path) as db:db.executescript('CREATE TABLE IF NOT EXISTS results(tenant TEXT,user TEXT,key TEXT,payload TEXT,id TEXT,answer TEXT,seq INTEGER,PRIMARY KEY(tenant,user,key)); CREATE TABLE IF NOT EXISTS outbox(seq INTEGER PRIMARY KEY AUTOINCREMENT,event TEXT);')
 def save(self,tenant,user,key,payload,answer,fault=None):
  if not self.available:raise Unavailable('primary unavailable')
  with connection(self.path) as db:
   db.execute('BEGIN IMMEDIATE');old=db.execute('SELECT * FROM results WHERE tenant=? AND user=? AND key=?',(tenant,user,key)).fetchone()
   if old:
    if old['payload']!=payload:raise ValueError('key_conflict')
    return dict(old)
   value={'tenant':tenant,'user':user,'key':key,'payload':payload,'id':str(uuid.uuid4()),'answer':answer}
   seq=db.execute('INSERT INTO outbox(event) VALUES(?)',(json.dumps(value),)).lastrowid;value['seq']=seq
   db.execute('INSERT INTO results VALUES(?,?,?,?,?,?,?)',tuple(value[k] for k in ['tenant','user','key','payload','id','answer','seq']))
   if fault=='before_commit':raise RuntimeError('injected rollback')
  if fault=='after_commit':raise LostResponse('commit durable, response lost')
  return value
 def read(self,tenant,user,key):
  if not self.available:raise Unavailable('primary unavailable')
  with connection(self.path) as db:
   r=db.execute('SELECT * FROM results WHERE tenant=? AND user=? AND key=?',(tenant,user,key)).fetchone();return dict(r) if r else None
 def events(self):
  with connection(self.path) as db:return [(r['seq'],json.loads(r['event']))for r in db.execute('SELECT * FROM outbox ORDER BY seq')]
class Replica:
 def __init__(self,path):
  self.path=path
  with connection(path) as db:db.executescript('CREATE TABLE IF NOT EXISTS projection(tenant TEXT,user TEXT,key TEXT,value TEXT,PRIMARY KEY(tenant,user,key)); CREATE TABLE IF NOT EXISTS applied(seq INTEGER PRIMARY KEY); CREATE TABLE IF NOT EXISTS watermark(id INTEGER PRIMARY KEY,seq INTEGER); INSERT OR IGNORE INTO watermark VALUES(1,0);')
 def apply(self,seq,value):
  with connection(self.path) as db:
   db.execute('BEGIN IMMEDIATE')
   if db.execute('SELECT 1 FROM applied WHERE seq=?',(seq,)).fetchone():return False
   db.execute('INSERT INTO applied VALUES(?)',(seq,));db.execute('INSERT INTO projection VALUES(?,?,?,?) ON CONFLICT(tenant,user,key) DO UPDATE SET value=excluded.value',(value['tenant'],value['user'],value['key'],json.dumps({**value,'seq':seq})))
   mark=db.execute('SELECT seq FROM watermark WHERE id=1').fetchone()[0]
   while db.execute('SELECT 1 FROM applied WHERE seq=?',(mark+1,)).fetchone():mark+=1
   db.execute('UPDATE watermark SET seq=? WHERE id=1',(mark,));return True
 def read(self,tenant,user,key,minimum):
  with connection(self.path) as db:
   if db.execute('SELECT seq FROM watermark WHERE id=1').fetchone()[0]<minimum:return None
   r=db.execute('SELECT value FROM projection WHERE tenant=? AND user=? AND key=?',(tenant,user,key)).fetchone();return json.loads(r[0]) if r else None
 def watermark(self):
  with connection(self.path) as db:return db.execute('SELECT seq FROM watermark WHERE id=1').fetchone()[0]
def history(primary,replica,tenant,user,key,minimum):
 result=replica.read(tenant,user,key,minimum)
 return result if result is not None else primary.read(tenant,user,key)
def authority(primary):
 if not primary.available:raise Unavailable('current authority unavailable; deny protected access')
 return 'primary authority only'
class Breaker:
 def __init__(self,threshold=2,cooldown=5):self.threshold=threshold;self.cooldown=cooldown;self.failures=0;self.opened=None;self.probe=False;self.lock=threading.Lock()
 def permit(self,now):
  with self.lock:
   if self.opened is None:return True
   if now-self.opened<self.cooldown or self.probe:return False
   self.probe=True;return True
 def result(self,success,now):
  with self.lock:
   if success:self.failures=0;self.opened=None;self.probe=False
   else:
    self.failures+=1
    if self.failures>=self.threshold or self.probe:self.opened=now
    self.probe=False
