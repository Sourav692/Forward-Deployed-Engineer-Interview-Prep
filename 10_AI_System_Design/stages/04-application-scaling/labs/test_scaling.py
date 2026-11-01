from pathlib import Path
import sys,tempfile,unittest
for previous in ['01-mvp','03-enterprise-knowledge']:sys.path.insert(0,str(Path(__file__).resolve().parents[2]/previous/'labs'))
from knowledge import Knowledge
from mvp import App
from scaling import PassageCache,capacity
class ScalingTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.path=Path(self.temp.name)/'shared.sqlite';self.k=Knowledge(self.path)
  self.k.ingest('A','policy',1,'Supplier confirmation required.',['alice']);self.hit=self.k.search('A','alice','confirmation')[0];self.cache=PassageCache()
 def tearDown(self):self.temp.cleanup()
 def test_cross_replica_history_uses_shared_store(self):
  a,b=App(self.path),App(self.path);status,result=a.handle('POST','/requests','demo-a',{'prompt':'Supplier draft'},'same')
  self.assertEqual(status,201);self.assertEqual(b.handle('GET','/requests/'+result['id'],'demo-a')[0],200);self.assertEqual(b.handle('GET','/requests/'+result['id'],'demo-b')[0],404)
  self.assertEqual(b.handle('POST','/requests','demo-a',{'prompt':'Supplier draft'},'same')[0],200);self.assertEqual(b.model.calls,0)
 def test_warm_hit_still_checks_policy(self):
  self.cache.resolve(self.k,'A','alice',self.hit,0);self.cache.resolve(self.k,'A','alice',self.hit,1)
  self.assertEqual((self.cache.source_reads,self.cache.policy_reads,self.cache.hits),(1,2,1))
 def test_revocation_blocks_warm_cache(self):
  self.cache.resolve(self.k,'A','alice',self.hit,0);self.k.permissions('A','policy',[])
  self.assertIsNone(self.cache.resolve(self.k,'A','alice',self.hit,1))
 def test_version_update_rejects_old_key(self):
  self.cache.resolve(self.k,'A','alice',self.hit,0);self.k.ingest('A','policy',2,'Supplier portal confirmation.',['alice'])
  self.assertIsNone(self.cache.resolve(self.k,'A','alice',self.hit,1));new=self.k.search('A','alice','portal')[0]
  self.assertIn('portal',self.cache.resolve(self.k,'A','alice',new,1)['text'])
 def test_deletion_blocks_warm_cache(self):
  self.cache.resolve(self.k,'A','alice',self.hit,0);self.k.delete('A','policy',2);self.assertIsNone(self.cache.resolve(self.k,'A','alice',self.hit,1))
 def test_same_id_different_tenant_is_not_shared(self):
  self.cache.resolve(self.k,'A','alice',self.hit,0);self.k.ingest('B','policy',1,'Supplier tenant B confirmation.',['bob'])
  hit=self.k.search('B','bob','confirmation')[0];self.assertIn('tenant B',self.cache.resolve(self.k,'B','bob',hit,1)['text'])
 def test_eviction_expiry_and_cache_outage(self):
  self.cache.resolve(self.k,'A','alice',self.hit,0);self.cache.resolve(self.k,'A','alice',self.hit,30);self.assertEqual(self.cache.source_reads,2)
  for index in range(3):
   doc='other'+str(index);self.k.ingest('A',doc,1,'Supplier confirmation '+str(index),['alice']);hit=next(h for h in self.k.search('A','alice',str(index)) if h['doc']==doc);self.cache.resolve(self.k,'A','alice',hit,31)
  self.assertEqual(len(self.cache.entries),2);self.cache.unavailable=True
  self.assertIsNotNone(self.cache.resolve(self.k,'A','alice',self.hit,32))
 def test_capacity_boundaries(self):
  self.assertEqual(capacity(1,0,100,120)['Planned capacity (RPS)'],28)
  self.assertEqual(capacity(4,0,100,120)['Limiting budget'],'database')
  self.assertEqual(capacity(4,80,100,120)['Unserved offered rate (RPS)'],0)
  self.assertEqual(capacity(8,80,100,60)['Limiting budget'],'provider')
if __name__=='__main__':unittest.main(verbosity=2)
