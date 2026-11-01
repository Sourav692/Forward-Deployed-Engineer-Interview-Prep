from pathlib import Path
import tempfile,unittest,concurrent.futures
from reliability import Primary,Replica,history,authority,Unavailable,LostResponse,Breaker
class ReliabilityTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();p=Path(self.temp.name);self.primary=Primary(p/'primary.sqlite');self.replica=Replica(p/'replica.sqlite')
 def tearDown(self):self.temp.cleanup()
 def test_atomic_rollback_has_no_result_or_outbox(self):
  with self.assertRaises(RuntimeError):self.primary.save('A','alice','one','prompt','answer','before_commit')
  self.assertIsNone(self.primary.read('A','alice','one'));self.assertEqual(self.primary.events(),[])
 def test_lost_response_replays_committed_result(self):
  with self.assertRaises(LostResponse):self.primary.save('A','alice','one','prompt','answer','after_commit')
  first=self.primary.read('A','alice','one');replay=self.primary.save('A','alice','one','prompt','unused')
  self.assertEqual(first,replay);self.assertEqual(len(self.primary.events()),1)
 def test_conflict_and_tenant_scope(self):
  self.primary.save('A','alice','one','prompt','answer')
  with self.assertRaisesRegex(ValueError,'conflict'):self.primary.save('A','alice','one','changed','answer')
  self.assertIsNone(self.primary.read('B','bob','one'))
 def test_lagged_history_uses_primary(self):
  result=self.primary.save('A','alice','one','prompt','answer');self.assertIsNone(self.replica.read('A','alice','one',result['seq']))
  self.assertEqual(history(self.primary,self.replica,'A','alice','one',result['seq'])['id'],result['id'])
 def test_duplicate_projection_is_idempotent(self):
  self.primary.save('A','alice','one','prompt','answer');event=self.primary.events()[0]
  self.assertTrue(self.replica.apply(*event));self.assertFalse(self.replica.apply(*event));self.assertEqual(self.replica.watermark(),1)
 def test_out_of_order_watermark_is_contiguous(self):
  self.primary.save('A','alice','one','p1','a1');self.primary.save('A','alice','two','p2','a2');events=self.primary.events()
  self.replica.apply(*events[1]);self.assertEqual(self.replica.watermark(),0);self.assertIsNone(self.replica.read('A','alice','two',2))
  self.replica.apply(*events[0]);self.assertEqual(self.replica.watermark(),2);self.assertIsNotNone(self.replica.read('A','alice','two',2))
 def test_unavailable_authority_never_uses_replica(self):
  self.primary.available=False
  with self.assertRaises(Unavailable):authority(self.primary)
 def test_no_primary_fallback_when_unavailable(self):
  self.primary.available=False
  with self.assertRaises(Unavailable):history(self.primary,self.replica,'A','alice','missing',1)
 def test_recreate_primary_preserves_committed_state(self):
  self.primary.save('A','alice','one','prompt','answer');self.assertEqual(Primary(self.primary.path).read('A','alice','one')['answer'],'answer')
 def test_circuit_open_single_probe_and_recovery(self):
  b=Breaker();b.result(False,0);b.result(False,1);self.assertFalse(b.permit(5));self.assertTrue(b.permit(6));self.assertFalse(b.permit(6));b.result(True,6);self.assertTrue(b.permit(7))
 def test_failed_probe_reopens(self):
  b=Breaker();b.result(False,0);b.result(False,0);self.assertTrue(b.permit(5));b.result(False,5);self.assertFalse(b.permit(9))
 def test_one_probe_under_concurrent_callers(self):
  b=Breaker();b.result(False,0);b.result(False,0)
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:allowed=list(pool.map(lambda _:b.permit(5),range(4)))
  self.assertEqual(allowed.count(True),1)
if __name__=='__main__':unittest.main(verbosity=2)
