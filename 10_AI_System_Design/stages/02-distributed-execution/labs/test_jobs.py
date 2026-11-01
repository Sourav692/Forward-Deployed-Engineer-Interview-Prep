import concurrent.futures
from pathlib import Path
import tempfile
import unittest
from jobs import Jobs

class JobTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.path=Path(self.temp.name)/'jobs.sqlite';self.jobs=Jobs(self.path);self.id=self.jobs.submit('A','alice','one','supplier pack')
 def tearDown(self):self.temp.cleanup()
 def test_durable_acceptance_and_tenant_scope(self):
  self.assertEqual(Jobs(self.path).get(self.id,'A','alice')['state'],'queued');self.assertIsNone(self.jobs.get(self.id,'B','bob'))
 def test_submission_reuse_and_conflict(self):
  self.assertEqual(self.jobs.submit('A','alice','one','supplier pack'),self.id)
  with self.assertRaisesRegex(ValueError,'conflict'):self.jobs.submit('A','alice','one','changed')
 def test_two_workers_one_active_claim(self):
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:rows=list(pool.map(lambda _:Jobs(self.path).claim(0),range(2)))
  self.assertEqual(sum(x is not None for x in rows),1)
 def test_crash_redelivery_and_fencing(self):
  first=self.jobs.claim(0);second=Jobs(self.path).claim(10)
  self.assertEqual(second['epoch'],first['epoch']+1)
  self.assertFalse(self.jobs.finish(self.id,first['epoch'],11,'stale'))
  self.assertTrue(self.jobs.finish(self.id,second['epoch'],11,'saved'))
  self.assertIsNone(self.jobs.claim(21))
 def test_timeout_after_external_start_is_unknown(self):
  row=self.jobs.claim(0);self.assertTrue(self.jobs.external_start(self.id,row['epoch'],1));self.assertIsNone(self.jobs.claim(10))
  self.assertEqual(self.jobs.get(self.id,'A','alice')['state'],'unknown')
 def test_retry_backoff_and_dead_letter(self):
  row=self.jobs.claim(0);self.assertTrue(self.jobs.retry(self.id,row['epoch'],1));self.assertIsNone(self.jobs.claim(2))
  row=self.jobs.claim(3);self.assertTrue(self.jobs.retry(self.id,row['epoch'],4));row=self.jobs.claim(8);self.assertTrue(self.jobs.retry(self.id,row['epoch'],9))
  self.assertEqual(self.jobs.get(self.id,'A','alice')['state'],'dead')
 def test_deadline_blocks_completion(self):
  row=self.jobs.claim(89);self.assertFalse(self.jobs.finish(self.id,row['epoch'],91,'late'));self.jobs.claim(91)
  self.assertEqual(self.jobs.get(self.id,'A','alice')['state'],'dead')
 def test_agent_allowlist_budget_and_durable_checkpoint(self):
  row=self.jobs.claim(0)
  with self.assertRaisesRegex(ValueError,'not_allowed'):self.jobs.checkpoint(self.id,row['epoch'],1,'send_email','x')
  for tool in ['extract','validate','draft']:self.assertTrue(self.jobs.checkpoint(self.id,row['epoch'],1,tool,'fixture output'))
  with self.assertRaisesRegex(ValueError,'budget'):self.jobs.checkpoint(self.id,row['epoch'],1,'draft','more')
  self.assertEqual(Jobs(self.path).get(self.id,'A','alice')['step'],3)
if __name__=='__main__':unittest.main(verbosity=2)
