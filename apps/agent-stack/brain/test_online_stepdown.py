import importlib.util, io, os, unittest, urllib.error
from pathlib import Path
from unittest import mock
spec = importlib.util.spec_from_file_location("online_stepdown_t", Path(__file__).with_name("online.py"))
O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)

def refused(msg):
    return urllib.error.HTTPError("u", 402, "pay", {}, io.BytesIO(msg.encode()))

class StepDownOnLowCredit(unittest.TestCase):
    def run_with(self, answers):
        caps = []
        def fake(url, data, headers, timeout):
            caps.append(data["max_tokens"]); a = answers.pop(0)
            if isinstance(a, Exception): raise a
            return a
        ok = {"choices": [{"message": {"content": "OK"}, "finish_reason": "stop"}], "usage": {}}
        with mock.patch.object(O, "_http_json", side_effect=fake), mock.patch.dict(os.environ, {"OPENROUTER_API_KEY": "test-not-a-key"}):
            got = O.call_openrouter_messages([{"role": "user", "content": "hi"}], [], model_chain=("m1", "m2"), max_tokens=12000)
        return got, caps, ok

    def test_a_too_high_ceiling_is_retried_lower_on_the_same_model(self):
        ok = {"choices": [{"message": {"content": "OK"}, "finish_reason": "stop"}], "usage": {}}
        got, caps, _ = self.run_with([refused('{"error":{"message":"requires more credits, or fewer max_tokens"}}'), ok])
        self.assertTrue(got["ok"]); self.assertEqual(got["model"], "m1"); self.assertEqual(caps, [12000, 4000])

    def test_other_payment_errors_move_on_and_still_report_402(self):
        got, caps, _ = self.run_with([refused('{"error":{"message":"key disabled"}}'), refused('{"error":{"message":"key disabled"}}')])
        self.assertFalse(got["ok"]); self.assertIn("402", got["error"]); self.assertEqual(caps, [12000, 12000])

if __name__ == "__main__": unittest.main()
