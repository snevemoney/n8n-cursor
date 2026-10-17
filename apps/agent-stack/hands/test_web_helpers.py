import importlib.util, json, tempfile, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("web_helpers_t", Path(__file__).with_name("web_helpers.py"))
W = importlib.util.module_from_spec(spec); spec.loader.exec_module(W)
STEPS = [{"action": "navigate", "url": "https://example.com/?q={q}"}, {"action": "click", "label": "More information"}]

class FakeSafari:
    def __init__(self, page): self.page, self.calls = page, []
    def __call__(self, step):
        self.calls.append(step)
        if step["action"] == "find": return {"text": json.dumps({"elements": [[7, "More information..."]]})}
        return {"text": self.page}

class WebHelpers(unittest.TestCase):
    def setUp(self): self.tmp = tempfile.TemporaryDirectory(); self.root = Path(self.tmp.name)
    def tearDown(self): self.tmp.cleanup()

    def test_saved_helper_replays_by_label_and_is_proven_when_the_page_shows_the_result(self):
        W.save(self.root, "example-more", STEPS, "IANA", "open the example page details")
        s = FakeSafari("IANA-managed reserved domains")
        got = W.run(self.root, "example-more", {"q": "x"}, s, lambda step: "")
        self.assertTrue(got["ok"]); self.assertIn({"action": "navigate", "url": "https://example.com/?q=x"}, s.calls)
        self.assertIn({"action": "click", "ref": 7}, s.calls)
        self.assertEqual(W.latest(self.root, "example-more")["status"], "proven")

    def test_a_kept_stop_stops_the_helper_before_that_step(self):
        W.save(self.root, "buy", [{"action": "click", "label": "Place order"}], "Thanks")
        s = FakeSafari("cart")
        got = W.run(self.root, "buy", {}, s, lambda step: "clicks a button that pays")
        self.assertFalse(got["ok"]); self.assertIn("pays", got["text"])
        self.assertNotIn({"action": "click", "ref": 7}, s.calls)

    def test_wrong_page_after_the_run_stays_candidate(self):
        W.save(self.root, "example-more", STEPS, "IANA")
        got = W.run(self.root, "example-more", {"q": "x"}, FakeSafari("404 not found"), lambda step: "")
        self.assertFalse(got["ok"]); self.assertEqual(W.latest(self.root, "example-more")["status"], "candidate")

    def test_changed_steps_make_a_new_version_and_refs_or_eval_are_refused(self):
        self.assertEqual(W.save(self.root, "h", STEPS, "IANA")["version"], 1)
        self.assertEqual(W.save(self.root, "h", STEPS, "IANA")["version"], 1)
        self.assertEqual(W.save(self.root, "h", STEPS[:1], "IANA")["version"], 2)
        for bad in ([{"action": "click", "ref": 3}], [{"action": "eval", "code": "1"}]):
            with self.assertRaises(ValueError): W.save(self.root, "h", bad, "IANA")

    def test_missing_vars_are_named_not_sent(self):
        W.save(self.root, "h", STEPS, "IANA"); s = FakeSafari("")
        self.assertIn("q", W.run(self.root, "h", {}, s, lambda step: "")["text"]); self.assertEqual(s.calls, [])

if __name__ == "__main__": unittest.main()
