"""Trusted local release-control fixture; not a public administrative API."""
from pathlib import Path
import hashlib,json,sys
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'07-reliability-consistency/labs'))
from reliability import connection
from evaluation import digest
class Releases:
 def __init__(self,path,baseline,report):
  self.path=path
  with connection(path) as db:db.executescript('CREATE TABLE IF NOT EXISTS approved(hash TEXT PRIMARY KEY,bundle TEXT,report TEXT); CREATE TABLE IF NOT EXISTS pointer(id INTEGER PRIMARY KEY,stable TEXT,previous TEXT,candidate TEXT,percent INTEGER,generation INTEGER);')
  baseline_hash=self.approve(baseline,report)
  with connection(path) as db:db.execute('INSERT OR IGNORE INTO pointer VALUES(1,?,?,NULL,0,0)',(baseline_hash,baseline_hash))
 def approve(self,bundle,report):
  if bundle.get('gates')!='teaching-gate-v1' or report.get('gates')!={'quality':95,'max_latency':2000,'max_cost':3} or report.get('passed') is not True or report.get('bundle_hash')!=digest(bundle) or report.get('dataset_hash')!=bundle.get('dataset') or report.get('evaluator')!=bundle.get('evaluator'):raise ValueError('unbound_or_failed_report')
  value=digest(bundle)
  with connection(self.path) as db:db.execute('INSERT OR IGNORE INTO approved VALUES(?,?,?)',(value,json.dumps(bundle,sort_keys=True),json.dumps(report,sort_keys=True)))
  return value
 def canary(self,candidate,percent,expected):
  if not 0<=percent<=100:raise ValueError('invalid percentage')
  with connection(self.path) as db:
   if not db.execute('SELECT 1 FROM approved WHERE hash=?',(candidate,)).fetchone():raise ValueError('unapproved bundle')
   return db.execute('UPDATE pointer SET candidate=?,percent=?,generation=generation+1 WHERE id=1 AND generation=?',(candidate,percent,expected)).rowcount==1
 def route(self,tenant,user,eligible=('A',)):
  with connection(self.path) as db:r=db.execute('SELECT * FROM pointer WHERE id=1').fetchone()
  bucket=int(hashlib.sha256((tenant+':'+user).encode()).hexdigest()[:8],16)%100
  return r['candidate'] if tenant in eligible and r['candidate'] and bucket<r['percent'] else r['stable']
 def promote(self,expected):
  with connection(self.path) as db:return db.execute('UPDATE pointer SET previous=stable,stable=candidate,candidate=NULL,percent=0,generation=generation+1 WHERE id=1 AND generation=? AND candidate IS NOT NULL',(expected,)).rowcount==1
 def rollback(self,expected):
  with connection(self.path) as db:return db.execute('UPDATE pointer SET stable=CASE WHEN candidate IS NULL THEN previous ELSE stable END,candidate=NULL,percent=0,generation=generation+1 WHERE id=1 AND generation=?',(expected,)).rowcount==1
 def shadow_event(self,bundle_hash):return {'bundle_hash':bundle_hash,'mode':'shadow','business_side_effects_allowed':False}

def safe_event(attributes):
 result={k:attributes[k] for k in ['request_id','bundle_hash','cohort','outcome'] if isinstance(attributes.get(k),str)}
 for name in ['latency_ms','token_count']:
  if type(attributes.get(name)) in (int,float) and attributes[name]>=0:result[name]=attributes[name]
 return result
