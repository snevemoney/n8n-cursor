"""Real child process probes worker.lock before the queue's spawn call returns."""
import os,subprocess,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
from brain.mission_controller import MissionController
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'hands'))
from test_coding_workflow_guard import CodingWorkflowGuardTests,D,T,ID
class QueueLock(unittest.TestCase):
 def test_child_acquires_worker_lock_before_spawn_returns_while_parent_keeps_steering(self):
  fixture=CodingWorkflowGuardTests()
  with tempfile.TemporaryDirectory() as tmp:
   h,root,repo,runtime,scratch,hand=fixture.fixture(tmp);a,b=T.ExecutionTests().context(hand)
   def spawn(task,token):
    code='import fcntl,sys\nf=open(sys.argv[1],"a")\nfcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)\ns=open(sys.argv[2],"a")\ntry:\n fcntl.flock(s,fcntl.LOCK_EX|fcntl.LOCK_NB)\n raise RuntimeError("parent lost steering ownership")\nexcept BlockingIOError:pass\nprint("worker-acquired",flush=True)\n'
    child=subprocess.Popen([sys.executable,'-I','-S','-c',code,str(root/'worker.lock'),str(root/'steering.lock')],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    out,err=child.communicate(timeout=4);self.assertEqual(child.returncode,0,err);self.assertEqual(out.strip(),'worker-acquired');return child
   with a,b,fixture.setup(hand),patch.object(D,'_spawn_worker',side_effect=spawn),patch.object(D,'_identity',return_value='offline exited child'):
    got=MissionController(D).queue_research_build(h,ID);self.assertEqual(got['status'],'QUEUED')
if __name__=='__main__':unittest.main()
