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

    def test_current_policy_and_generation(self):
        self.ready()
        with self.assertRaises(PermissionError):self.p.cutover('A','supplier','move',0,False)
        with self.assertRaises(ValueError):self.p.cutover('A','supplier','move',1,True)
        self.assertEqual(self.p.cutover('A','supplier','move',0,True)['generation'],1)

    def test_atomic_failure_and_recovery(self):
        self.ready()
        with self.assertRaises(OSError):self.p.cutover('A','supplier','move',0,True,True)
        self.p.close();self.p=Platform(self.path)
        self.assertEqual(self.p.status('A','supplier'),dict(generation=0,route='eu/old',previous=None))
        self.assertEqual(self.p.cutover('A','supplier','move',0,True)['route'],'eu/new')

    def test_lost_ack_inspection_and_no_second_cutover(self):
        self.ready();self.p.cutover('A','supplier','move',0,True)
        self.p.close();self.p=Platform(self.path);self.assertEqual(self.propose(),'cutover')
        with self.assertRaises(ValueError):self.p.cutover('A','supplier','move',0,True)
        self.assertEqual(self.p.status('A','supplier')['generation'],1)

    def test_rollback_requires_current_eligibility(self):
        self.ready();self.p.cutover('A','supplier','move',0,True)
        with self.assertRaises(PermissionError):self.p.rollback('A','supplier',1,False)
        self.assertEqual(self.p.rollback('A','supplier',1,True)['route'],'eu/old')
        with self.assertRaises(ValueError):self.p.rollback('A','supplier',1,True)

    def test_tenant_cannot_read_another_app(self):
        self.ready()
        with self.assertRaises(KeyError):self.p.status('B','supplier')
        with self.assertRaises(ValueError):self.p.cutover('B','supplier','move',0,True)


if __name__=='__main__':unittest.main()
