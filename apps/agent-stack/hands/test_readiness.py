import importlib.util, os, unittest
from pathlib import Path
from unittest import mock
spec = importlib.util.spec_from_file_location("readiness_t", Path(__file__).with_name("readiness.py"))
R = importlib.util.module_from_spec(spec); spec.loader.exec_module(R)
OK_PERMS = lambda: '{"accessibility": true, "screen_recording": true}'
OK_ROUTES = lambda: ([], ["a", "b"])

class Readiness(unittest.TestCase):
    def setUp(self):
        p = mock.patch.dict(os.environ, {"OPENROUTER_API_KEY": "test-not-a-key"}); p.start(); self.addCleanup(p.stop)

    def test_out_of_credit_is_red_and_said_plainly(self):
        got = R.report(credit=lambda: {"total_credits": 75, "total_usage": 75.2}, models=lambda: ["qwen3:4b"], perms=OK_PERMS, routes=OK_ROUTES, bus={})
        self.assertEqual(got["state"], "RED"); self.assertEqual(got["rows"]["budget"]["state"], "RED")
        self.assertIn("out of credit (-0.20 dollars)", got["spoken"]); self.assertNotIn("test-not-a-key", str(got))

    def test_senses_say_which_are_on_and_what_they_cost(self):
        state, line = R.senses({"watch": {"armed": True}, "focus": {"armed": False}})
        self.assertEqual(line, "On: watch (paid vision). Off: eyes, focus.")
        self.assertTrue(R.senses({"mic": "mute"})[1].endswith("Ears off: the Orb's mic is muted."))

    def test_all_good_is_one_line(self):
        with mock.patch.object(R, "disk", return_value=("GREEN", "90 GB free on the Mac.")):
            got = R.report(credit=lambda: {"total_credits": 80, "total_usage": 10}, models=lambda: ["qwen3:4b"], perms=OK_PERMS, routes=OK_ROUTES, bus={})
        self.assertEqual(got["state"], "GREEN"); self.assertEqual(got["spoken"], "Everything I need to work is ready.")

    def test_missing_grant_names_it_and_who_can_fix_it(self):
        got = R.report(credit=lambda: {"total_credits": 80, "total_usage": 1}, models=lambda: [], perms=lambda: '{"accessibility": false, "screen_recording": true}', routes=lambda: (["loop_runner.TASKS"], ["x", "y"]))
        self.assertIn("Accessibility not granted", got["rows"]["permissions"]["line"]); self.assertIn("only Evens", got["spoken"])
        self.assertEqual(got["rows"]["local model"]["state"], "AMBER")
        self.assertIn("1 of 2 places my code points to are missing: loop_runner.TASKS", got["rows"]["routes"]["line"])

if __name__ == "__main__": unittest.main()
