from dataclasses import replace
import unittest
from regions import Recovery, recover, capacity, Ledger


class Tests(unittest.TestCase):
    def setUp(self):self.plan=Recovery('eu-secondary',('eu-primary','eu-secondary'),True,True,True,True,20)

    def test_recovery_budget(self):
        r=recover(self.plan);self.assertTrue(r['eligible']);self.assertEqual(r['planned_rto_seconds'],360);self.assertEqual(r['possible_loss_seconds'],20)

    def test_independent_safety_gates(self):
        for changes,reason in [({'destination':'us'},'residency'),({'fence_confirmed':False},'writer not fenced'),({'policy_current':False},'current policy unavailable'),({'audit_ready':False},'audit unavailable'),({'bundle_ready':False},'bundle unavailable'),({'copy_lag_seconds':61},'RPO exceeded')]:
            r=recover(replace(self.plan,**changes));self.assertFalse(r['eligible']);self.assertIn(reason,r['reasons'])

    def test_exact_rpo_boundary(self):self.assertTrue(recover(replace(self.plan,copy_lag_seconds=60))['eligible'])

    def test_invalid_times(self):
        for v in (-1,1.5,True):
            with self.assertRaises(ValueError):recover(replace(self.plan,copy_lag_seconds=v))

    def test_capacity_units_and_burst(self):
        self.assertEqual(capacity(60,1000,2),dict(replicas=5,provider_tpm=3600000,in_flight=120))
        self.assertEqual(capacity(100,1000,2)['replicas'],8)

    def test_invalid_capacity(self):
        for r in (-1,float('nan'),float('inf')):
            with self.assertRaises(ValueError):capacity(r,1000,2)
        with self.assertRaises(ValueError):capacity(60,1000,2,target_utilisation=1)

    def test_usage_duplicate_and_conflict(self):
        l=Ledger();l.record('A','op','eu',5000,True);l.record('A','op','eu',5000,True)
        self.assertEqual(l.economics(5000)['per_success_microusd'],10000)
        with self.assertRaises(ValueError):l.record('A','op','us',5000,True)
        l.record('B','op','us',3000,False);self.assertEqual(l.economics(5000)['total_microusd'],13000)

    def test_zero_success_and_failed_spend(self):
        l=Ledger();l.record('A','op','eu',2000,False)
        self.assertEqual(l.economics(0)['total_microusd'],2000);self.assertIsNone(l.economics(0)['per_success_microusd'])


if __name__=='__main__':unittest.main()
