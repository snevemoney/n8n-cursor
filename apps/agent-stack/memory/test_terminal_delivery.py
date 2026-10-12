"""Exercise real response writers and terminal ownership against isolated disk state."""
import importlib.util
from pathlib import Path
import tempfile
import threading
import unittest

spec = importlib.util.spec_from_file_location("terminal_pipeline", Path(__file__).resolve().parents[1] / "brain/pipeline.py")
PIPE = importlib.util.module_from_spec(spec)
spec.loader.exec_module(PIPE)

class TerminalDeliveryTest(unittest.TestCase):
    def test_model_terminal_cannot_be_overwritten_by_same_generation_wall(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp); gen=PIPE.begin_turn(hive)
            PIPE.write_bus(hive,phase="speak",job_status="done",utterance="ask",spoken="Valid model answer.",gen=gen)
            PIPE.write_bus(hive,phase="idle",job_status="done",utterance="ask",spoken=PIPE.TALK_DARK,gen=gen)
            self.assertEqual(PIPE.load_json(hive/'bus/state.json')['spoken'],"Valid model answer.")

    def test_retry_candidate_cannot_replace_first_terminal(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp); gen=PIPE.begin_turn(hive)
            for answer in ("First answer.","Retry answer.","Duplicate answer."):
                PIPE.write_bus(hive,phase="speak",job_status="done",utterance="ask",spoken=answer,gen=gen)
            self.assertEqual(PIPE.load_json(hive/'bus/state.json')['spoken'],"First answer.")
            newer=PIPE.begin_turn(hive)
            PIPE.write_bus(hive,phase="speak",job_status="done",utterance="new ask",spoken="New answer.",gen=newer)
            self.assertEqual(PIPE.load_json(hive/'bus/state.json')['spoken'],"New answer.")

    def test_model_wins_immediately_before_scoped_timeout(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp); gen=PIPE.begin_turn(hive)
            PIPE.write_bus(hive,phase="speak",job_status="done",utterance="ask",spoken="Timely answer.",gen=gen)
            self.assertFalse(PIPE.cancel_turn_scoped(hive,gen,spoken=PIPE.TALK_DARK,request="ask"))
            self.assertEqual(PIPE.load_json(hive/'bus/state.json')['spoken'],"Timely answer.")

    def test_concurrent_terminal_writers_have_one_owner(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp); gen=PIPE.begin_turn(hive)
            barrier=threading.Barrier(3); accepted=[]
            def writer(text):
                barrier.wait()
                result=PIPE.BUS_IO.commit_response(hive,gen,lambda bus: {**bus,"spoken":text},terminal=True)
                if result is not None: accepted.append(text)
            threads=[threading.Thread(target=writer,args=(text,)) for text in ("Candidate A.","Candidate B.")]
            for thread in threads: thread.start()
            barrier.wait()
            for thread in threads: thread.join(2); self.assertFalse(thread.is_alive())
            self.assertEqual(len(accepted),1)
            self.assertEqual(PIPE.load_json(hive/'bus/state.json')['spoken'],accepted[0])

    def test_wall_winning_first_rejects_late_model(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp); gen=PIPE.begin_turn(hive)
            self.assertTrue(PIPE.cancel_turn_scoped(hive,gen,spoken=PIPE.TALK_DARK,request="ask"))
            PIPE.write_bus(hive,phase="speak",job_status="done",utterance="ask",spoken="Late model.",gen=gen)
            self.assertEqual(PIPE.load_json(hive/'bus/state.json')['spoken'],PIPE.TALK_DARK)

if __name__ == "__main__": unittest.main()
