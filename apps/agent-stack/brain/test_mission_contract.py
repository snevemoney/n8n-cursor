import importlib.util,sys,unittest
from pathlib import Path
from dataclasses import replace
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('mission_contract_test',HERE/'mission_contract.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
spec=importlib.util.spec_from_file_location('mission_browser_test',HERE.parent/'hands/browser_runtime.py')
br=importlib.util.module_from_spec(spec);sys.modules[spec.name]=br;spec.loader.exec_module(br)

def flow(fid='a'):
 return br.BrowserFlow(fid,'mission','Read price','https://example.com',('example.com',),('price visible',),
   {'kind':'dom','checks':[{'selector':'#price','text_equals':'20'}]})
def proof():return {'verified':True,'verifier_id':'independent-read','evidence':{'url':'https://example.com','checks':[{'text':'20'}]}}
def result(fid='a'):return {'flow_id':fid,'revision':0,'verified':True,'evidence':proof()}
def receipts(*flows):return {(f.mission_id,f.flow_id,f.revision):m.verification_receipt(f,proof()) for f in flows}

class MissionAcceptanceTests(unittest.TestCase):
 def test_worker_success_without_independent_receipt_is_not_mission_success(self):
  out=m.verify_browser_mission([flow()],[result()],{},{});self.assertFalse(out['verified'])
  self.assertEqual(out['failures'][0]['reason'],'independent_verifier_receipt_missing')
 def test_missing_required_task_blocks_even_when_all_returned_workers_pass(self):
  a,b=flow(),flow('b');out=m.verify_browser_mission([a,b],[result()],{},receipts(a,b))
  self.assertFalse(out['verified']);self.assertEqual(out['failures'][0]['reason'],'required_worker_result_missing')
 def test_complete_independent_receipts_allow_success(self):
  a,b=flow(),flow('b');out=m.verify_browser_mission([a,b],[result(),result('b')],{},receipts(a,b))
  self.assertTrue(out['verified']);self.assertEqual(len(out['accepted']),2)
 def test_only_explicit_steering_can_exclude_required_task(self):
  a,b=flow(),flow('b');out=m.verify_browser_mission([a,b],[result()],{'cancel_flows':['b']},receipts(a))
  self.assertTrue(out['verified']);self.assertEqual(out['required_task_ids'],['a'])
 def test_duplicate_result_and_stale_revision_block(self):
  f=flow()
  self.assertFalse(m.verify_browser_mission([f],[result(),result()],{},receipts(f))['verified'])
  self.assertFalse(m.verify_browser_mission([f],[result()],{'flow_updates':{'a':{'revision':1}}},receipts(f))['verified'])
 def test_changed_acceptance_invalidates_old_receipt(self):
  f=flow();changed=replace(f,objective='Read different price')
  out=m.verify_browser_mission([changed],[result()],{},receipts(f))
  self.assertFalse(out['verified']);self.assertEqual(out['failures'][0]['reason'],'verifier_receipt_contract_mismatch')
 def test_forged_result_or_malformed_proof_cannot_self_certify(self):
  f=flow()
  for bad in ({}, {'verified':True}, {'verified':True,'verifier_id':'id','evidence':{}},proof()|{'verified':False}):
   ledger={(f.mission_id,f.flow_id,0):m.verification_receipt(f,bad)}
   self.assertFalse(m.verify_browser_mission([f],[result()],{},ledger)['verified'])
  self.assertFalse(m.verify_browser_mission([f],[result()|{'evidence':proof()|{'verifier_id':'forged'}}],{},receipts(f))['verified'])
 def test_worker_mutation_cannot_change_independent_ledger(self):
  f=flow();worker_proof=proof();receipt=m.verification_receipt(f,worker_proof)
  worker_proof['evidence']['checks'][0]['text']='forged'
  self.assertEqual(receipt['proof']['evidence']['checks'][0]['text'],'20')
  row=result()|{'evidence':worker_proof}
  self.assertFalse(m.verify_browser_mission([f],[row],{}, {('mission','a',0):receipt})['verified'])
 def test_cancelled_or_empty_mission_never_passes(self):
  f=flow();self.assertFalse(m.verify_browser_mission([f],[result()],{'cancel':True},receipts(f))['verified'])
  self.assertFalse(m.verify_browser_mission([],[],{}, {})['verified'])
if __name__=='__main__':unittest.main()
