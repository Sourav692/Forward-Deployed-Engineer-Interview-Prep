from pathlib import Path
import concurrent.futures,sys,tempfile,unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'02-distributed-execution/labs'))
from jobs import Jobs
from admission import Gate
from scheduler import simulate
class OverloadTests(unittest.TestCase):
 def setUp(self):self.temp=tempfile.TemporaryDirectory();self.path=Path(self.temp.name)/'guard.sqlite'
 def tearDown(self):self.temp.cleanup()
 def test_atomic_concurrency_cap(self):
  Gate(self.path,requests=20,tokens=10000,concurrency=2,tenant_requests=20)
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
   outcomes=list(pool.map(lambda i:Gate(self.path,20,10000,2,20).reserve('A','alice',str(i),'draft',100,0,10),range(4)))
  self.assertEqual(outcomes.count('accepted'),2)
 def test_request_budget_and_refill(self):
  gate=Gate(self.path,requests=1,tokens=10000,concurrency=3)
  self.assertEqual(gate.reserve('A','alice','one','draft',100,0,10),'accepted')
  self.assertEqual(gate.reserve('A','alice','two','draft',100,0,10),'limited:global:requests')
  self.assertEqual(gate.reserve('A','alice','two','draft',100,1,10),'accepted')
 def test_token_budget_is_independent(self):
  gate=Gate(self.path,requests=5,tokens=100,concurrency=5,tenant_requests=5)
  self.assertEqual(gate.reserve('A','alice','one','draft',60,0,10),'accepted')
  self.assertEqual(gate.reserve('A','alice','two','draft',60,0,10),'limited:global:tokens')
 def test_same_key_replays_without_an_extra_reservation(self):
  gate=Gate(self.path);self.assertEqual(gate.reserve('A','alice','one','draft',100,0,10),'accepted')
  self.assertEqual(gate.reserve('A','alice','one','draft',100,0,10),'duplicate:active')
  self.assertEqual(gate.reserve('A','alice','one','changed',100,0,10),'conflict')
  gate.settle('A','alice','one','completed');self.assertEqual(gate.reserve('A','alice','one','draft',100,0,10),'duplicate:completed')
 def test_unknown_keeps_slot_and_expired_work_is_not_started(self):
  gate=Gate(self.path,concurrency=1);gate.reserve('A','alice','one','draft',100,0,10);gate.settle('A','alice','one','unknown')
  self.assertEqual(gate.reserve('B','bob','two','draft',100,1,10),'limited:concurrency')
  self.assertEqual(gate.reserve('B','bob','three','draft',100,10,10),'expired')
 def test_tenant_budget_limits_noisy_neighbour(self):
  gate=Gate(self.path,requests=10,tokens=10000,concurrency=10,tenant_requests=1)
  self.assertEqual(gate.reserve('A','alice','one','draft',100,0,10),'accepted')
  self.assertEqual(gate.reserve('A','alice','two','draft',100,0,10),'limited:tenant:A:requests')
  self.assertEqual(gate.reserve('B','bob','one','draft',100,0,10),'accepted')
 def test_four_scheduling_policies_keep_physical_capacity(self):
  expected={'fifo':'12/0/0','priority':'0/6/6','rr':'4/4/4','wrr':'6/3/3'}
  for policy,counts in expected.items():
   result=simulate(policy);self.assertEqual(result['Served A/B/C'],counts);self.assertEqual(result['Total completions'],12);self.assertEqual(result['Rejected at admission'],18);self.assertEqual(result['Expired queued jobs'],12)
 def test_retry_amplification_and_no_starvation_claim(self):
  self.assertEqual(simulate(retries=2)['Rejected at admission'],78)
  self.assertEqual(simulate(policy='priority')['Served A/B/C'],'0/6/6')
 def test_deadline_and_work_conservation(self):
  for policy in ['fifo','priority','rr','wrr']:
   self.assertEqual(simulate(policy,burst=0)['Total completions'],12)
   self.assertEqual(simulate(policy,deadline=1)['Total completions'],3)
 def test_guarded_provider_boundary_after_durable_claim(self):
  jobs=Jobs(self.path);job=jobs.submit('A','alice','job','supplier draft');lease=jobs.claim(0);gate=Gate(self.path)
  self.assertEqual(gate.reserve('A','alice',job,lease['payload'],100,1,lease['deadline']),'accepted')
  self.assertTrue(jobs.external_start(job,lease['epoch'],1));self.assertTrue(jobs.finish(job,lease['epoch'],2,'fixture answer'))
  self.assertTrue(gate.settle('A','alice',job,'completed'))
if __name__=='__main__':unittest.main(verbosity=2)
