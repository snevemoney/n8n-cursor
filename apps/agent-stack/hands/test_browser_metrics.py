import importlib.util,json,sys,tempfile,unittest,unittest.mock
from pathlib import Path
spec=importlib.util.spec_from_file_location('tested_browser_metrics',Path(__file__).with_name('browser_metrics.py'))
metrics=importlib.util.module_from_spec(spec);spec.loader.exec_module(metrics)
class EvidenceMetrics(unittest.TestCase):
    def test_accuracy_requires_independent_labels_not_success(self):
        decision={'observation_id':'o','decision_id':'d','operation':'CLICK','target_id':'e1'}
        evidence={'results':[{'verified':True,'actions':[{}]}],'trace':[{'event':'jev.decision','decision':decision}]}
        self.assertIsNone(metrics.summarize(evidence)['operation_accuracy'])
        labels={('o','d'):{'chosen_operation':'CLICK','chosen_target':'e1','operation_correct':False,'target_correct':False}}
        result=metrics.summarize(evidence,labels)
        self.assertEqual(result['verified_completion_rate'],1);self.assertEqual(result['operation_accuracy'],0);self.assertEqual(result['target_accuracy'],0)
        labels[('o','d')]['chosen_target']='e2'
        with self.assertRaises(ValueError):metrics.summarize(evidence,labels)
    def test_control_target_is_not_element_target_accuracy(self):
        evidence={'trace':[{'event':'jev.decision','decision':{'observation_id':'o','decision_id':'d','operation':'STOP_CANDIDATE','target_id':'none'}}]}
        labels={('o','d'):{'chosen_operation':'STOP_CANDIDATE','chosen_target':'none','operation_correct':True,'target_correct':True}}
        result=metrics.summarize(evidence,labels)
        self.assertEqual(result['operation_accuracy'],1);self.assertIsNone(result['target_accuracy']);self.assertEqual(result['element_target_label_count'],0)
    def test_cost_and_latency_aggregation_preserves_failed_run(self):
        run=lambda mode,duration,verified,cost:{'mode':mode,'duration':duration,'results':[{'verified':verified,'actions':[{}]}],'calls':[{'role':'frontier_baseline' if mode=='frontier' else 'jev','latency':duration/2,'usage':{'cost':cost}}]}
        result=metrics.summarize({'runs':[run('jev',4,True,.1),run('jev',8,False,.2),run('frontier',10,True,.5)]})
        self.assertEqual(result['by_mode']['jev']['mean_duration_seconds'],6);self.assertAlmostEqual(result['by_mode']['jev']['mean_model_cost'],.15)
        self.assertEqual(result['by_mode']['jev']['verified_flows'],1);self.assertEqual(result['by_mode']['jev']['flows'],2)
        self.assertIsNone(result['runs'][0]['max_concurrent_flows_observed'])
    def test_first_pass_and_recovery_are_separate_from_eventual_success(self):
        results=[{'verified':True,'retries':0,'actions':[]},{'verified':True,'retries':0,'revision_budget':{'used_retries':2},'actions':[]},{'verified':False,'retries':1,'actions':[]}]
        out=metrics.summarize({'results':results})
        self.assertEqual(out['first_pass_verified_flows'],1)
        self.assertAlmostEqual(out['first_pass_completion_rate'],1/3)
        self.assertEqual(out['recovery_flow_count'],2)
        self.assertEqual(out['recovery_success_rate'],.5)
        self.assertIsNone(metrics.summarize({'results':[{'verified':True}]})['first_pass_completion_rate'])

    def test_frontier_avoidance_counts_distinct_observed_steps(self):
        decision=lambda obs:{'observation_id':obs}
        trace=[{'event':'jev.decision','flow_id':'a','decision':decision('o1')},
            {'event':'frontier.decision','flow_id':'a','decision':decision('o1')},
            {'event':'jev.decision','flow_id':'a','decision':decision('o2')},
            {'event':'verification.fail','proof':{'page_identity_verified':False}},
            {'event':'verification.fail','proof':{'page_identity_verified':True}},
            {'event':'verification.pass','proof':{'page_identity_verified':True}}]
        out=metrics.summarize({'trace':trace,'calls':[{'role':'planner'},{'role':'synthesis'},{'role':'escalation'}]})
        self.assertEqual(out['decision_step_count'],2)
        self.assertEqual(out['frontier_call_avoidance'],.5)
        self.assertEqual(out['frontier_step_calls'],1)
        self.assertEqual(out['wrong_page_verifications'],1)
        self.assertAlmostEqual(out['wrong_page_rate'],1/3)
        self.assertIsNone(metrics.summarize({})['wrong_page_rate'])

    def test_label_file_must_bind_exact_evidence_bytes(self):
        with tempfile.TemporaryDirectory() as tmp:
            evidence=Path(tmp)/'proof.json';evidence.write_text('{}')
            labels=Path(tmp)/'labels.json';labels.write_text(json.dumps({'sources':{'benchmark_sha256':'wrong'},'labels':[]}))
            with unittest.mock.patch.object(sys,'argv',['metrics',str(evidence),'--labels',str(labels)]),self.assertRaisesRegex(ValueError,'do not bind'):
                metrics.main()
    def test_required_scope_does_not_turn_skips_into_failed_requirements(self):
        out=metrics.summarize({'results':[{'verified':True},{'verified':True},{'verified':False,'excluded_by_operator':True}]})
        self.assertEqual(out['required_flow_count'],2);self.assertEqual(out['skipped_flow_count'],1)
        self.assertEqual(out['required_completion_rate'],1);self.assertAlmostEqual(out['verified_completion_rate'],2/3)
        self.assertIsNone(metrics.summarize({'results':[{'verified':False,'excluded_by_operator':True}]})['required_completion_rate'])
    def test_outer_trace_is_preserved_without_replacing_inner_trace(self):
        trace=[{'event':'flow.started','flow_id':'a'},{'event':'jev.decision','flow_id':'a','decision':{'observation_id':'o'}}]
        wrapped={'source_hash':'actual','trace':trace,'result':{'results':[{'verified':True}],'calls':[{'role':'jev','latency':1}]}}
        out=metrics.summarize(wrapped);self.assertEqual(out['decision_step_count'],1);self.assertEqual(out['max_concurrent_flows_observed'],1)
        self.assertEqual(out['source_hash'],'actual')
        wrapped['result']['trace']=[];self.assertEqual(metrics.summarize(wrapped)['decision_step_count'],0)

if __name__=='__main__':unittest.main()
