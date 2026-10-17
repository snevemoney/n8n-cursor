import importlib.util, json, tempfile, time, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("lapse_op_t", Path(__file__).with_name("lapse.py"))
L = importlib.util.module_from_spec(spec); spec.loader.exec_module(L)

class OperatorQuestionLapses(unittest.TestCase):  # Z56 for operator jobs
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.hive = Path(self.tmp.name)
        self.job = self.hive / "operator-tasks" / "t1"; self.job.mkdir(parents=True)
        (self.hive / "operator-tasks" / "latest.json").write_text(json.dumps({"task_id": "t1"}))
        (self.job / "request.json").write_text(json.dumps({"goal": "book the dentist for Tuesday"}))
        self.bus = {}
    def tearDown(self): self.tmp.cleanup()

    def mutate(self, hive, fn): self.bus = fn(self.bus)

    def state(self, **kw): (self.job / "state.json").write_text(json.dumps({"status": "IDLE", **kw}))

    def test_an_unanswered_question_lapses_once_with_what_is_undone(self):
        now = time.time(); self.state(asked_at=now - 200, asked="Which time, 10 or 2?")
        inbox = self.hive / "inbox"
        line = L.op_tick(self.hive, mutate_fn=self.mutate, inbox=inbox, now=now)
        self.assertIn("question lapsed", line); self.assertIn("book the dentist for Tuesday", line)
        self.assertEqual(self.bus["say"]["text"], line); self.assertEqual(len(list(inbox.iterdir())), 1)
        self.assertIsNone(L.op_tick(self.hive, mutate_fn=self.mutate, inbox=inbox, now=now + 60))  # once

    def test_answered_or_recent_questions_stay_quiet(self):
        now = time.time(); self.state(asked_at=now - 30, asked="Which time?")
        self.assertIsNone(L.op_tick(self.hive, mutate_fn=self.mutate, now=now))
        self.state(asked="Which time?")  # he answered: asked_at was cleared
        self.assertIsNone(L.op_tick(self.hive, mutate_fn=self.mutate, now=now + 999))

if __name__ == "__main__": unittest.main()
