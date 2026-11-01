from pathlib import Path
import sys,tempfile,unittest,sqlite3
for previous in ['03-enterprise-knowledge','05-overload-fairness','06-enterprise-security','08-evaluation-releases']:sys.path.insert(0,str(Path(__file__).resolve().parents[2]/previous/'labs'))
from knowledge import Knowledge
from admission import Gate
from security import Security,issue
from evaluation import DATASET,manifest,predictions,evaluate,digest
from releases import Releases
from gateway import Gateway,UnknownProvider
from inference import memory_plan
class InferenceTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.path=Path(self.temp.name)/'inference.sqlite';self.k=Knowledge(self.path);self.k.ingest('A','policy',1,'Supplier confirmation requires the portal.',['alice']);self.hits=self.k.search('A','alice','confirmation')
  self.s=Security(self.k);self.s.membership('A','alice',1,60);self.token=issue({'iss':'fixture-idp','aud':'ai-app','sub':'alice','tenant':'A','exp':60,'actions':['retrieve','generate'],'epoch':1})
  self.bundle=manifest('hosted-approved');self.r=Releases(self.path,self.bundle,evaluate(DATASET,predictions(),self.bundle));self.hash=digest(self.bundle)
  self.registry={self.hash:{'provider':'approved-model','private':True,'ready':True,'max_context':8192,'max_output':512}}
  self.gate=Gate(self.path,requests=10,tokens=100000,concurrency=4,tenant_requests=10);self.calls=0
  def transport(profile,context,prompt):self.calls+=1;return 'Portal confirmation draft.'
  self.g=Gateway(self.path,self.s,self.gate,self.r,self.registry,transport)
 def tearDown(self):self.temp.cleanup()
 def test_approved_route_composes_real_prior_gates(self):
  result=self.g.run(self.token,'one','Supplier draft',self.hits);self.assertEqual(result['state'],'completed');self.assertEqual(self.calls,1)
 def test_private_path_and_readiness_are_required(self):
  for field in ['private','ready']:
   self.registry[self.hash][field]=False
   with self.assertRaises(PermissionError):self.g.run(self.token,field,'Supplier draft',self.hits)
   self.registry[self.hash][field]=True
  self.assertEqual(self.calls,0)
 def test_unknown_registry_and_unapproved_provider(self):
  saved=self.registry.pop(self.hash)
  with self.assertRaises(PermissionError):self.g.run(self.token,'missing','Supplier draft',self.hits)
  self.registry[self.hash]={**saved,'provider':'unapproved'}
  with self.assertRaises(PermissionError):self.g.run(self.token,'provider','Supplier draft',self.hits)
 def test_context_and_output_envelope(self):
  for values in [{'input_tokens':8000},{'output_cap':600}]:
   with self.assertRaises(ValueError):self.g.run(self.token,'large','Supplier draft',self.hits,**values)
  self.assertEqual(self.calls,0)
 def test_quota_rejects_before_transport(self):
  self.g.gate=Gate(self.path,requests=10,tokens=100,concurrency=4,tenant_requests=10)
  self.assertEqual(self.g.run(self.token,'limited','Supplier draft',self.hits)['state'],'blocked');self.assertEqual(self.calls,0)
 def test_unknown_never_retries_or_falls_back(self):
  def timeout(*_):self.calls+=1;raise UnknownProvider('response lost')
  self.g.transport=timeout;self.assertEqual(self.g.run(self.token,'one','Supplier draft',self.hits)['state'],'unknown')
  self.assertEqual(self.g.run(self.token,'one','Supplier draft',self.hits)['state'],'unknown');self.assertEqual(self.calls,1)
 def test_same_key_after_release_change_keeps_original_bundle(self):
  first=self.g.run(self.token,'one','Supplier draft',self.hits)
  next_bundle=manifest('self-hosted-approved');h=self.r.approve(next_bundle,evaluate(DATASET,predictions(),next_bundle));self.r.canary(h,100,0)
  second=self.g.run(self.token,'one','Supplier draft',self.hits);self.assertEqual(second,first);self.assertEqual(self.calls,1)
 def test_revoked_original_evidence_blocks_saved_replay(self):
  self.g.run(self.token,'one','Supplier draft',self.hits);self.k.permissions('A','policy',[])
  with self.assertRaises(PermissionError):self.g.run(self.token,'one','Supplier draft',self.hits)
 def test_conflicting_operation_is_not_new_generation(self):
  self.g.run(self.token,'one','Supplier draft',self.hits)
  with self.assertRaisesRegex(ValueError,'conflict'):self.g.run(self.token,'one','changed',self.hits)
  self.assertEqual(self.calls,1)
 def test_memory_arithmetic_and_no_throughput_claim(self):
  base=memory_plan();self.assertEqual(base['FP16 KV cache (GiB)'],4);self.assertEqual(base['Assumed total (GiB)'],22.9);self.assertEqual(base['Memory decision'],'within assumed VRAM')
  self.assertEqual(memory_plan(context=8192)['Memory decision'],'exceeds assumed VRAM');self.assertEqual(memory_plan(bits=4)['FP16 KV cache (GiB)'],4);self.assertEqual(memory_plan(bits=4)['Assumed total (GiB)'],11.73)
 def test_result_commit_failure_does_not_acknowledge_or_retry(self):
  from reliability import connection
  with connection(self.path) as db:db.execute("CREATE TRIGGER fail_saved_answer BEFORE UPDATE ON inference_ops WHEN NEW.state='completed' BEGIN SELECT RAISE(ABORT,'injected final write failure'); END")
  with self.assertRaisesRegex(sqlite3.IntegrityError,'final write failure'):self.g.run(self.token,'one','Supplier draft',self.hits)
  replay=self.g.run(self.token,'one','Supplier draft',self.hits);self.assertEqual(replay['state'],'dispatching');self.assertIsNone(replay['answer']);self.assertEqual(self.calls,1)
 def test_partly_revoked_original_context_cannot_replay_old_answer(self):
  self.k.ingest('A','other-policy',1,'Other supplier confirmation.',['alice']);hits=self.k.search('A','alice','confirmation')
  self.g.run(self.token,'mixed','Supplier draft',hits);self.k.permissions('A','policy',[])
  remaining=self.k.search('A','alice','confirmation')
  with self.assertRaises(PermissionError):self.g.run(self.token,'mixed','Supplier draft',remaining)
if __name__=='__main__':unittest.main(verbosity=2)
