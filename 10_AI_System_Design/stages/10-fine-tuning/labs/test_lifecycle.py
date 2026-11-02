import unittest
from lifecycle import Lifecycle, dataset


def rows():
    return [dict(id=str(i),group='supplier-'+str(i),split=s,input='approved supplier text',target='schema output',approved=True) for i,s in enumerate(('train','validation','test'))]


class Tests(unittest.TestCase):
    def setUp(self):
        self.c=Lifecycle(); self.d=dataset('A','v1',rows()); self.c.register(self.d)
        self.c.submit('A','job','v1','base-1','recipe-1')

    def candidate(self):
        self.c.checkpoint('A','job',100,'checkpoint-sha'); self.c.complete('A','job','adapter-sha')

    def report(self, **changes):
        return dict(artifact='adapter-sha',dataset=self.d.checksum,evaluator='supplier-v1',schema_pass=198,safety_failures=0,n=200,**changes)

    def test_dataset_leakage_and_consent(self):
        r=rows();r[1]['group']=r[0]['group']
        with self.assertRaises(ValueError):dataset('A','v2',r)
        r=rows();r[0]['approved']=False
        with self.assertRaises(ValueError):dataset('A','v2',r)

    def test_immutable_data_and_input_copy(self):
        r=rows();d=dataset('A','v2',r);r[0]['target']='changed';self.assertNotEqual(d.checksum,dataset('A','v2',r).checksum)
        r=rows();r[0]['target']='changed'
        with self.assertRaises(ValueError):self.c.register(dataset('A','v1',r))

    def test_idempotency_and_tenant_scope(self):
        self.assertEqual(self.c.submit('A','job','v1','base-1','recipe-1'),'queued')
        with self.assertRaises(ValueError):self.c.submit('A','job','v1','base-2','recipe-1')
        with self.assertRaises(ValueError):self.c.submit('B','job','v1','base-1','recipe-1')

    def test_checkpoint_and_failed_early_completion(self):
        with self.assertRaises(ValueError):self.c.complete('A','job','adapter')
        self.c.checkpoint('A','job',100,'sha')
        with self.assertRaises(ValueError):self.c.checkpoint('A','job',99,'sha')
        self.c.checkpoint('A','job',200,'sha2');self.assertEqual(self.c.jobs['A','job']['checkpoint'],(200,'sha2'))

    def test_identity_and_invalid_metrics(self):
        self.candidate()
        for change in ({'artifact':'other'},{'dataset':'other'},{'evaluator':'other'},{'n':0},{'schema_pass':201},{'safety_failures':-1},{'n':True}):
            report=self.report();report.update(change)
            with self.assertRaises(ValueError):self.c.evaluate('A','job',report)

    def test_safety_failure_blocks_approval(self):
        self.candidate();r=self.report();r['safety_failures']=1
        self.assertFalse(self.c.evaluate('A','job',r))
        with self.assertRaises(ValueError):self.c.approve('A','job','release-approver',0)
        self.assertEqual(self.c.pointer,{})

    def test_approval_role_generation_and_copy(self):
        self.candidate();r=self.report();self.assertTrue(self.c.evaluate('A','job',r));r['schema_pass']=0
        with self.assertRaises(PermissionError):self.c.approve('A','job','trainer',0)
        self.assertEqual(self.c.approve('A','job','release-approver',0)[0],'adapter-sha')
        with self.assertRaises(ValueError):self.c.approve('A','job','release-approver',0)

    def test_candidate_does_not_change_live_pointer(self):
        self.candidate();self.c.evaluate('A','job',self.report());self.assertEqual(self.c.pointer,{})


if __name__=='__main__':unittest.main()
