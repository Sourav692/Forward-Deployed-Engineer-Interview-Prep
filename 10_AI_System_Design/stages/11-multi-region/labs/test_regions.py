from dataclasses import replace
import unittest
from regions import Recovery, recover, capacity, unit_cost, Ledger


class Tests(unittest.TestCase):
    def setUp(self):self.plan=Recovery('eu-secondary','eu-primary',('eu-primary','eu-secondary'),True,True,True,True,True,15)

    def test_recovery_budget(self):
        r=recover(self.plan);self.assertTrue(r['eligible']);self.assertTrue(r['meets_rto']);self.assertEqual(r['planned_recovery_seconds'],360)
        self.assertEqual(r['loss_bound_seconds'],35)  # 10:00:40 renewal + 20 s lease - 10:00:25 watermark

    def test_loss_bound_adds_the_lease_not_one_renewal(self):
        # A 45 s gap would pass under "+5 s" (50 s) but a live partitioned writer can lose 65 s.
        r=recover(replace(self.plan,gap_at_isolation_seconds=45));self.assertEqual(r['loss_bound_seconds'],65);self.assertEqual(r['reasons'],['RPO exceeded'])

    def test_independent_safety_gates(self):
        for changes,reason in [({'destination':'us-home'},'residency'),({'destination':'eu-primary'},'failed region is not a recovery target'),({'old_epoch_rejected':False},'writer not fenced'),({'authority_quorum':False},'authority unavailable'),({'approval_current':False},'approval generation not current'),({'audit_ready':False},'audit unavailable'),({'bundle_ready':False},'bundle unavailable'),({'gap_at_isolation_seconds':41},'RPO exceeded')]:
            r=recover(replace(self.plan,**changes));self.assertFalse(r['eligible']);self.assertEqual(r['reasons'],[reason])

    def test_lost_quorum_fails_closed_without_fencing_claim(self):
        r=recover(replace(self.plan,authority_quorum=False,old_epoch_rejected=False))
        self.assertEqual(r['reasons'],['authority unavailable'])

    def test_missed_rto_is_not_a_safety_block(self):
        r=recover(replace(self.plan,restore_seconds=600))
        self.assertTrue(r['eligible']);self.assertEqual(r['reasons'],[]);self.assertFalse(r['meets_rto']);self.assertEqual(r['planned_recovery_seconds'],780)

    def test_exact_boundaries(self):
        self.assertTrue(recover(replace(self.plan,gap_at_isolation_seconds=40))['eligible'])
        r=recover(replace(self.plan,restore_seconds=420));self.assertTrue(r['meets_rto']);self.assertEqual(r['planned_recovery_seconds'],600)

    def test_invalid_times(self):
        for v in (-1,1.5,True):
            with self.assertRaises(ValueError):recover(replace(self.plan,gap_at_isolation_seconds=v))

    def test_capacity_units_and_burst(self):
        self.assertEqual(capacity(60,1000,2),dict(replicas=5,provider_tpm=3600000,in_flight=120))
        self.assertEqual(capacity(100,1000,2)['replicas'],8)
        # 2M TPM quota at 1,000 tokens admits about 33 RPS: 3 replicas, 66 slots.
        self.assertEqual(capacity(33,1000,2),dict(replicas=3,provider_tpm=1980000,in_flight=66))

    def test_invalid_capacity(self):
        for r in (-1,float('nan'),float('inf')):
            with self.assertRaises(ValueError):capacity(r,1000,2)
        with self.assertRaises(ValueError):capacity(60,1000,2,target_utilisation=1)

    def test_unit_cost_before_and_after_failover(self):
        before=unit_cost(1_250_000,1000,4,17_500,800_000)
        self.assertEqual(before['variable_microusd'],5_000_000_000);self.assertEqual(before['per_success_microusd'],28_125)
        after=unit_cost(1_270_000,1000,4,17_500,800_000)
        self.assertEqual(after['total_microusd'],22_580_000_000);self.assertEqual(after['per_success_microusd'],28_225)
        self.assertEqual(unit_cost(1_290_000,1000,4,17_500,800_000)['per_success_microusd'],28_325)
        self.assertEqual(unit_cost(1_250_000,1000,4,17_500,1_000_000)['per_success_microusd'],22_500)
        self.assertIsNone(unit_cost(10,1000,4,0,0)['per_success_microusd'])

    def test_same_attempt_delivered_twice_counts_once(self):
        l=Ledger();l.record('A','op-1','att-1','eu-primary',4000,True);l.record('A','op-1','att-1','eu-primary',4000,True)
        self.assertEqual(l.economics(0),dict(total_microusd=4000,attempts=1,successes=1,per_success_microusd=4000))

    def test_cross_region_retry_is_extra_spend(self):
        l=Ledger();l.record('A','op-1','att-1','eu-primary',4000,False);l.record('A','op-1','att-2','eu-secondary',4000,True)
        l.record('A','op-1','att-2','eu-secondary',4000,True)  # redelivery after failover
        self.assertEqual(l.economics(0),dict(total_microusd=8000,attempts=2,successes=1,per_success_microusd=8000))

    def test_conflicting_revision_rejected(self):
        l=Ledger();l.record('A','op-1','att-2','eu-secondary',4000,True)
        for changed in (('eu-secondary',5000,True),('eu-primary',4000,True),('eu-secondary',4000,False)):
            with self.assertRaises(ValueError):l.record('A','op-1','att-2',*changed)
        l.record('B','op-1','att-1','eu-secondary',3000,False)  # same operation name, other tenant
        self.assertEqual(l.economics(0)['total_microusd'],7000)

    def test_zero_success_and_failed_spend(self):
        l=Ledger();l.record('A','op','att-1','eu-primary',2000,False)
        self.assertEqual(l.economics(0)['total_microusd'],2000);self.assertIsNone(l.economics(0)['per_success_microusd'])


if __name__=='__main__':unittest.main()
