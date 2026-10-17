import importlib.util,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('bus', Path(__file__).with_name('bus_io.py'));bus=importlib.util.module_from_spec(spec);spec.loader.exec_module(bus)
class CancelReceipt(unittest.TestCase):
 def test_cancel_has_current_failure_receipt(self):
  with tempfile.TemporaryDirectory() as tmp:
   hive=Path(tmp);gen=bus.begin_turn(hive)
   bus.mutate_bus(hive,lambda b:{**b,'response_ok':True,'response_ok_gen':gen-1,'terminal_response_gen':gen-1})
   self.assertTrue(bus.cancel_turn_scoped(hive,gen,spoken=bus.DARK_LINE))
   state=bus.mutate_bus(hive,lambda b:b)
   self.assertFalse(state['response_ok']);self.assertEqual(state['response_ok_gen'],gen);self.assertEqual(state['terminal_response_gen'],gen)
   self.assertIsNone(bus.commit_response(hive,gen,lambda b:{**b,'spoken':'late success'},terminal=True))
 def test_stale_cancellation_cannot_replace_new_turn(self):
  with tempfile.TemporaryDirectory() as tmp:
   hive=Path(tmp);old=bus.begin_turn(hive);current=bus.begin_turn(hive)
   self.assertFalse(bus.cancel_turn_scoped(hive,old,spoken=bus.DARK_LINE))
   state=bus.mutate_bus(hive,lambda b:b)
   self.assertEqual(state['turn_gen'],current);self.assertNotEqual(state.get('terminal_response_gen'),old)
 def test_user_stop_and_duplicate_cancellation(self):
  with tempfile.TemporaryDirectory() as tmp:
   hive=Path(tmp);gen=bus.begin_turn(hive)
   self.assertTrue(bus.cancel_turn_scoped(hive,gen))
   self.assertFalse(bus.cancel_turn_scoped(hive,gen,spoken=bus.DARK_LINE))
   state=bus.mutate_bus(hive,lambda b:b)
   self.assertTrue(state['response_ok']);self.assertEqual(state['terminal_response_gen'],gen)
 def test_cancel_clears_stale_task_verified_flags(self):
  """A cancelled generation must not keep a prior turn's task_verified as current success."""
  with tempfile.TemporaryDirectory() as tmp:
   hive=Path(tmp);gen=bus.begin_turn(hive)
   bus.mutate_bus(hive,lambda b:{**b,'task_verified':True,'task_verified_gen':gen,
                                 'response_ok':True,'response_ok_gen':gen,'spoken':'Done.'})
   self.assertTrue(bus.cancel_turn_scoped(hive,gen,spoken=bus.DARK_LINE,request='save file'))
   state=bus.mutate_bus(hive,lambda b:b)
   self.assertFalse(state['response_ok'])
   self.assertEqual(state['response_ok_gen'],gen)
   self.assertEqual(state.get('spoken'),bus.DARK_LINE)
   self.assertNotIn('task_verified',state)
   self.assertNotIn('task_verified_gen',state)
   # Late terminal writers stay fenced.
   self.assertIsNone(bus.commit_response(hive,gen,lambda b:{**b,'spoken':'Saved.','task_verified':True},terminal=True))
 def test_new_turn_does_not_inherit_verified_flags(self):
  with tempfile.TemporaryDirectory() as tmp:
   hive=Path(tmp);old=bus.begin_turn(hive)
   bus.mutate_bus(hive,lambda b:{**b,'task_verified':True,'task_verified_gen':old})
   self.assertEqual(bus.begin_turn(hive),old+1)
   state=bus.mutate_bus(hive,lambda b:b)
   self.assertNotIn('task_verified',state)
   self.assertNotIn('task_verified_gen',state)
if __name__=='__main__':unittest.main()

