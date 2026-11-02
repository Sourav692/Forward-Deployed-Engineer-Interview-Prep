import tempfile,unittest
from pathlib import Path
from migration import Platform


class Tests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.path=Path(self.tmp.name)/'platform.sqlite';self.p=Platform(self.path)
        self.p.seed('A','supplier','eu/old');self.m=dict(tenant='A',app='supplier',owner='supplier-team',region='eu',bundle='new',budget_rps=20)

    def tearDown(self):self.p.close();self.tmp.cleanup()

    def propose(self,key='move'):return self.p.propose('A',key,self.m,{'eu'},{'new'})
    def ready(self):self.propose();self.p.shadow('A','supplier','move',100,0,True)

    def test_manifest_policy_scope(self):
        for change in ({'tenant':'B'},{'region':'us'},{'bundle':'unknown'}):
            with self.assertRaises(PermissionError):self.p.propose('A','k',self.m|change,{'eu'},{'new'})
        with self.assertRaises(ValueError):self.p.propose('A','k',self.m|{'budget_rps':0},{'eu'},{'new'})

    def test_durable_idempotency_and_conflict(self):
        self.propose();self.p.close();self.p=Platform(self.path);self.assertEqual(self.propose(),'proposed')
        with self.assertRaises(ValueError):self.p.propose('A','move',self.m|{'budget_rps':21},{'eu'},{'new'})

    def test_shadow_no_effect_and_gate(self):
        self.propose()
        with self.assertRaises(PermissionError):self.p.shadow('A','supplier','move',100,0,False)
        self.p.shadow('A','supplier','move',100,1,True)
        with self.assertRaises(ValueError):self.p.cutover('A','supplier','move',0,True)
        self.assertEqual(self.p.status('A','supplier')['route'],'eu/old')

    def test_sample_floor(self):
        self.propose();self.p.shadow('A','supplier','move',99,0,True)
        with self.assertRaises(ValueError):self.p.cutover('A','supplier','move',0,True)
        # Evidence is append-only: one more matched sample at the same baseline reaches the floor.
        self.p.shadow('A','supplier','move',1,0,True);self.assertEqual(self.p.cutover('A','supplier','move',0,True)['generation'],1)

    def test_current_policy_and_generation(self):
        self.ready()
        with self.assertRaises(PermissionError):self.p.cutover('A','supplier','move',0,False)
        with self.assertRaisesRegex(ValueError,'stale generation'):self.p.cutover('A','supplier','move',1,True)
        self.assertEqual(self.p.cutover('A','supplier','move',0,True)['generation'],1)

    def test_atomic_failure_and_recovery(self):
        self.ready()
        with self.assertRaises(OSError):self.p.cutover('A','supplier','move',0,True,True)
        self.p.close();self.p=Platform(self.path)
        self.assertEqual(self.p.status('A','supplier'),dict(generation=0,route='eu/old',previous=None))
        self.assertEqual(self.p.history('A','supplier'),[])
        self.assertEqual(self.p.cutover('A','supplier','move',0,True)['route'],'eu/new')

    def test_lost_ack_inspection_and_no_second_cutover(self):
        self.ready();self.p.cutover('A','supplier','move',0,True)
        self.p.close();self.p=Platform(self.path);self.assertEqual(self.propose(),'cutover')
        with self.assertRaises(ValueError):self.p.cutover('A','supplier','move',0,True)
        self.assertEqual(self.p.status('A','supplier')['generation'],1)

    def test_rollback_requires_current_eligibility(self):
        self.ready();self.p.cutover('A','supplier','move',0,True)
        with self.assertRaises(PermissionError):self.p.rollback('A','supplier',1,False,'sre-1','canary failed')
        with self.assertRaises(ValueError):self.p.rollback('A','supplier',1,True,'','canary failed')
        self.assertEqual(self.p.rollback('A','supplier',1,True,'sre-1','canary failed')['route'],'eu/old')
        with self.assertRaises(ValueError):self.p.rollback('A','supplier',1,True,'sre-1','canary failed')

    def test_mismatch_evidence_cannot_be_erased(self):
        self.propose();self.p.shadow('A','supplier','move',100,7,True);self.p.shadow('A','supplier','move',100,0,True)
        with self.assertRaisesRegex(ValueError,'shadow evidence blocked'):self.p.cutover('A','supplier','move',0,True)
        self.assertEqual(self.p.inspect('A','supplier','move')['mismatches'],7)

    def test_evidence_bound_to_baseline_generation(self):
        self.ready();self.p.propose('A','other',self.m|{'bundle':'b2'},{'eu'},{'new','b2'})
        self.p.shadow('A','supplier','other',100,0,True);self.p.cutover('A','supplier','other',0,True)
        # 'move' was compared against eu/old at generation 0; the route is now eu/b2 at generation 1.
        with self.assertRaisesRegex(ValueError,'stale evidence'):self.p.cutover('A','supplier','move',1,True)
        self.assertEqual(self.p.status('A','supplier')['route'],'eu/b2')

    def test_history_kept_and_rollback_of_rollback_blocked(self):
        self.ready();self.p.cutover('A','supplier','move',0,True);self.p.rollback('A','supplier',1,True,'sre-1','canary failed')
        self.assertEqual(self.p.history('A','supplier'),[
            dict(generation=1,action='cutover',**{'from':'eu/old','to':'eu/new'},actor='migration controller',reason='change move'),
            dict(generation=2,action='rollback',**{'from':'eu/new','to':'eu/old'},actor='sre-1',reason='canary failed')])
        with self.assertRaisesRegex(ValueError,'no previous route'):self.p.rollback('A','supplier',2,True,'sre-1','undo rollback')

    def test_rolled_back_generation_never_returns(self):
        self.ready();self.p.cutover('A','supplier','move',0,True);self.p.rollback('A','supplier',1,True,'sre-1','canary failed')
        # The control plane reconnects and offers N+1 again; the cell is at N+2 and refuses it.
        with self.assertRaisesRegex(ValueError,'older generation'):self.p.apply('A','supplier',1,'eu/new',True)
        self.assertEqual(self.p.status('A','supplier'),dict(generation=2,route='eu/old',previous=None))
        # A newer signed generation still needs current eligibility before its compare-and-set.
        with self.assertRaises(PermissionError):self.p.apply('A','supplier',3,'eu/b2',False)
        self.assertEqual(self.p.apply('A','supplier',3,'eu/b2',True),dict(generation=3,route='eu/b2',previous='eu/old'))

    def test_inspection_after_revocation(self):
        self.ready();self.p.cutover('A','supplier','move',0,True)
        # Bundle 'new' is revoked: a new proposal is forbidden, but the recorded change stays inspectable.
        self.assertEqual(self.p.propose('A','move',self.m,{'eu'},set()),'cutover')
        with self.assertRaises(PermissionError):self.p.propose('A','fresh',self.m,{'eu'},set())
        self.assertEqual(self.p.inspect('A','supplier','move'),dict(state='cutover',target='eu/new',compared=100,mismatches=0,generation=1,route='eu/new',previous='eu/old'))

    def test_tenant_cannot_read_another_app(self):
        self.ready()
        with self.assertRaises(KeyError):self.p.status('B','supplier')
        with self.assertRaises(ValueError):self.p.cutover('B','supplier','move',0,True)


if __name__=='__main__':unittest.main()
