from pathlib import Path
import tempfile,unittest
from evaluation import DATASET,digest,manifest,predictions,evaluate
from releases import Releases,safe_event
from reliability import Primary
class ReleaseTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.path=Path(self.temp.name)/'releases.sqlite';self.baseline=manifest();self.good=evaluate(DATASET,predictions(),self.baseline);self.r=Releases(self.path,self.baseline,self.good)
  self.candidate=manifest('fixture-model-v2');self.report=evaluate(DATASET,predictions(),self.candidate);self.hash=self.r.approve(self.candidate,self.report)
 def tearDown(self):self.temp.cleanup()
 def test_good_candidate_and_slices(self):self.assertTrue(self.report['passed']);self.assertEqual(self.report['slices']['security'],{'passed':2,'total':2})
 def test_quality_regression(self):self.assertFalse(evaluate(DATASET,predictions('quality'),self.candidate)['passed'])
 def test_safety_blocks_even_relaxed_aggregate(self):
  r=evaluate(DATASET,predictions('leak'),self.candidate,quality=80);self.assertEqual(r['quality_pct'],87.5);self.assertFalse(r['passed']);self.assertEqual(r['known_safety_violations'],1)
 def test_latency_and_cost_regressions(self):
  for kind in ['latency','cost']:self.assertFalse(evaluate(DATASET,predictions(kind),self.candidate)['passed'])
 def test_missing_duplicate_and_invalid_measurements_fail_closed(self):
  for output in [predictions()[:-1],predictions()+[predictions()[0]], [{**x,'cost_units':float('nan')}for x in predictions()]]:self.assertFalse(evaluate(DATASET,output,self.candidate)['passed'])
 def test_dataset_binding(self):self.assertFalse(evaluate(DATASET[:-1],predictions()[:-1],self.candidate)['passed'])
 def test_report_cannot_approve_another_bundle(self):
  with self.assertRaises(ValueError):self.r.approve(manifest('different'),self.report)
 def test_compare_and_swap_prevents_stale_rollout(self):
  self.assertTrue(self.r.canary(self.hash,10,0));self.assertFalse(self.r.canary(self.hash,100,0));self.assertTrue(self.r.promote(1))
 def test_sticky_eligible_cohort(self):
  self.r.canary(self.hash,100,0);self.assertEqual(self.r.route('A','alice'),self.hash);self.assertEqual(self.r.route('A','alice'),self.r.route('A','alice'));self.assertEqual(self.r.route('B','bob'),digest(self.baseline))
 def test_rollback_preserves_committed_history_and_shadow_has_no_effects(self):
  history=Primary(self.path);before=history.save('A','alice','op','prompt','saved answer');self.r.canary(self.hash,100,0);self.r.promote(1);self.assertTrue(self.r.rollback(2))
  self.assertEqual(history.read('A','alice','op')['id'],before['id']);self.assertEqual(self.r.route('A','alice'),digest(self.baseline));self.assertFalse(self.r.shadow_event(self.hash)['business_side_effects_allowed'])
 def test_telemetry_redaction(self):
  event=safe_event({'request_id':'r1','bundle_hash':self.hash,'cohort':'canary','outcome':'refused','latency_ms':10,'prompt':'private','bearer':'secret','context':'private source'})
  self.assertNotIn('private',str(event));self.assertNotIn('secret',str(event))
 def test_refusal_label_cannot_hide_answer_text(self):
  output=predictions();output[6]['answer']='restricted text';self.assertFalse(evaluate(DATASET,output,self.candidate)['passed'])
 def test_weakened_gate_policy_cannot_be_approved(self):
  report=evaluate(DATASET,predictions('quality'),self.candidate,quality=80);self.assertTrue(report['passed'])
  with self.assertRaises(ValueError):self.r.approve(self.candidate,report)
 def test_aborting_later_canary_keeps_current_stable(self):
  self.r.canary(self.hash,100,0);self.r.promote(1)
  third=manifest('v3');third_hash=self.r.approve(third,evaluate(DATASET,predictions(),third));self.r.canary(third_hash,10,2)
  self.assertTrue(self.r.rollback(3));self.assertEqual(self.r.route('A','alice'),self.hash)
if __name__=='__main__':unittest.main(verbosity=2)
