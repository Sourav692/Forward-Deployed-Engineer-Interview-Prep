from pathlib import Path
import sys,tempfile,unittest,json,sqlite3
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'03-enterprise-knowledge/labs'))
from knowledge import Knowledge
from security import Security,issue,verify,encode
class SecurityTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.k=Knowledge(Path(self.temp.name)/'security.sqlite');self.s=Security(self.k)
  self.k.ingest('A','policy',1,'Supplier confirmation rule.',['alice']);self.hits=self.k.search('A','alice','confirmation');self.s.membership('A','alice',1,60)
  self.claims={'iss':'fixture-idp','aud':'ai-app','sub':'alice','tenant':'A','exp':60,'actions':['retrieve','generate'],'epoch':1};self.token=issue(self.claims)
 def tearDown(self):self.temp.cleanup()
 def test_verified_scope_ignores_spoofed_headers(self):self.assertEqual(len(self.s.context(self.token,self.hits,1,{'X-Tenant':'B'})),1)
 def test_signature_tamper_is_not_identity(self):
  payload=encode(json.dumps({**self.claims,'tenant':'B','kid':'current'}).encode());bad=payload+'.'+self.token.split('.')[1]
  with self.assertRaises(PermissionError):verify(bad,1)
 def test_expiry_audience_issuer_and_not_before(self):
  for changes in [{'exp':1},{'aud':'worker'},{'iss':'attacker'},{'nbf':10}]:
   with self.assertRaises(PermissionError):verify(issue({**self.claims,**changes}),1)
 def test_rotation_and_retired_key(self):
  rotated=issue(self.claims,'next');self.assertEqual(verify(rotated,1).tenant,'A')
  with self.assertRaises(PermissionError):verify(self.token,1,keys={'next':b'public-rotation-fixture'})
 def test_other_tenant_cannot_resolve_citation(self):
  self.s.membership('B','bob',1,60);token=issue({**self.claims,'sub':'bob','tenant':'B'})
  self.assertEqual(self.s.context(token,self.hits,1),[])
 def test_revoked_document_not_disclosed(self):
  self.k.permissions('A','policy',[]);self.assertEqual(self.s.context(self.token,self.hits,1),[])
 def test_stale_membership_and_epoch_fail_closed(self):
  self.s.membership('A','alice',1,1)
  with self.assertRaises(PermissionError):self.s.context(self.token,self.hits,1)
  self.s.membership('A','alice',2,60)
  with self.assertRaises(PermissionError):self.s.context(self.token,self.hits,1)
 def test_worker_audience_and_capability_are_bounded(self):
  worker=issue({**self.claims,'aud':'ingestion-worker','actions':['extract']});p=verify(worker,1,audience='ingestion-worker')
  self.assertFalse(self.s.egress(p,'approved-model','tenant/A/provider'))
  with self.assertRaises(PermissionError):verify(worker,1)
 def test_audit_failure_blocks_output_and_no_sensitive_body_in_audit(self):
  self.s.context(self.token,self.hits,1)
  with self.k.db() as db:
   row=dict(db.execute('SELECT * FROM audit').fetchone());self.assertNotIn('Supplier',str(row));self.assertNotIn(self.token,str(row))
   db.execute("CREATE TRIGGER audit_failure BEFORE INSERT ON audit BEGIN SELECT RAISE(ABORT,'audit unavailable'); END")
  with self.assertRaisesRegex(sqlite3.IntegrityError,'audit unavailable'):self.s.context(self.token,self.hits,1)
 def test_provider_and_secret_reference_are_scoped(self):
  p=verify(self.token,1);self.assertTrue(self.s.egress(p,'approved-model','tenant/A/provider'));self.assertFalse(self.s.egress(p,'unapproved','tenant/A/provider'));self.assertFalse(self.s.egress(p,'approved-model','tenant/B/provider'))
if __name__=='__main__':unittest.main(verbosity=2)
