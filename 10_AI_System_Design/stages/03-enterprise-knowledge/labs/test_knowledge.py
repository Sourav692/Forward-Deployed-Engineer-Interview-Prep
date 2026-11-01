from pathlib import Path
import tempfile,unittest,sys
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/"02-distributed-execution/labs"))
from jobs import Jobs
from knowledge import Knowledge
class RetrievalTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.path=Path(self.temp.name)/'knowledge.sqlite';self.k=Knowledge(self.path)
  self.k.ingest('A','supplier-policy',1,'Supplier delivery date requires written confirmation.\n\nEscalate overdue deliveries to procurement.',['alice'])
  self.k.ingest('A','restricted',1,'Supplier delivery secret discount.',['manager'])
  self.k.ingest('B','foreign',1,'Supplier delivery tenant B agreement.',['bob'])
 def tearDown(self):self.temp.cleanup()
 def test_scoped_relevance_and_citations(self):
  hits=self.k.search('A','alice','delivery confirmation');self.assertTrue(hits);self.assertTrue(all(x['doc']=='supplier-policy' for x in hits))
  context=self.k.context('A','alice',hits);self.assertEqual(context[0]['citation'],'supplier-policy:v1:c0');self.assertNotIn('secret',str(context));self.assertNotIn('tenant B',str(context))
 def test_replay_does_not_duplicate_chunks(self):
  self.assertFalse(self.k.ingest('A','supplier-policy',1,'Supplier delivery date requires written confirmation.\n\nEscalate overdue deliveries to procurement.',['alice']))
  with self.k.db() as db:self.assertEqual(db.execute("SELECT count(*) FROM search WHERE doc='supplier-policy'").fetchone()[0],2)
 def test_update_removes_old_content(self):
  self.k.ingest('A','supplier-policy',2,'Supplier date is now confirmed through the portal.',['alice']);context=self.k.context('A','alice',self.k.search('A','alice','portal'))
  self.assertEqual(context[0]['citation'],'supplier-policy:v2:c0');self.assertNotIn('written',str(context))
 def test_tombstone_rejects_late_resurrection(self):
  self.k.delete('A','supplier-policy',3);self.assertFalse(self.k.ingest('A','supplier-policy',2,'Late supplier delivery event.',['alice']))
  self.assertEqual(self.k.search('A','alice','delivery'),[])
 def test_revocation_between_search_and_context(self):
  hits=self.k.search('A','alice','delivery');self.k.permissions('A','supplier-policy',[]);self.assertEqual(self.k.context('A','alice',hits),[])
 def test_stale_version_and_forged_hit_text_rejected(self):
  hits=self.k.search('A','alice','confirmation');hits[0]['text']='forged secret'
  self.assertNotIn('forged',str(self.k.context('A','alice',hits)))
  self.k.ingest('A','supplier-policy',2,'Current portal rule.',['alice']);self.assertEqual(self.k.context('A','alice',hits),[])
 def test_partial_publication_orphan_invisible(self):
  with self.assertRaises(RuntimeError):self.k.ingest('A','supplier-policy',2,'Unpublished portal change.',['alice'],True)
  self.assertEqual(self.k.search('A','alice','portal'),[])
  self.assertTrue(Knowledge(self.path).search('A','alice','confirmation'))
 def test_immutable_blob_conflict(self):
  with self.assertRaisesRegex(ValueError,'immutable'):self.k.ingest('A','supplier-policy',1,'Different body.',['alice'])
 def test_fts_query_syntax_is_not_caller_controlled(self):
  self.assertEqual(self.k.search('A','alice','" OR *'),[])
 def test_durable_ingestion_job_integration(self):
  jobs=Jobs(self.path);job=jobs.submit('A','alice','event-v2','supplier-policy:v2')
  lease=jobs.claim(0);self.assertEqual(lease['id'],job)
  self.k.ingest('A','supplier-policy',2,'Supplier portal confirmation rule.',['alice'])
  self.assertTrue(jobs.finish(job,lease['epoch'],1,'published supplier-policy:v2'))
  self.assertEqual(jobs.get(job,'A','alice')['state'],'completed')
  self.assertTrue(self.k.search('A','alice','portal'))
if __name__=='__main__' :unittest.main(verbosity=2)
