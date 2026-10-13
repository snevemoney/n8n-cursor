"""Jev ADVISORY router (jev-methods-20261012): one test class per applied method."""
import importlib.util, json, os, tempfile, threading, time, unittest
from pathlib import Path
from unittest import mock

STACK = Path(__file__).resolve().parents[1]


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


JR = _load("jev_router_test", STACK / "brain" / "jev_router.py")
ENV_ON = {"JARVIS_JEV_ROUTER": "1", "JARVIS_JEV_LIVE": "1", "OPENROUTER_API_KEY": "sk-test-not-real-0000", "JARVIS_JEV_BUDGET_MS": "400"}


def _answers(handler="converse", conf=0.95, complete=0.9, hard=0.02):
    return {"handler": {"type": "choice", "choice": handler, "confidence": conf},
            "needs_expensive": {"noul": 0.2}, "addressed_to_jarvis": {"noul": 0.9},
            "request_complete": {"noul": complete}, "hard_step_hint": {"noul": hard}}


class M1PreflightBudget(unittest.TestCase):
    def setUp(self):
        JR.CACHE._d.clear()

    def test_slow_endpoint_times_out_inside_budget_and_falls_back(self):
        def slow(*a):
            time.sleep(2.0)
            return _answers()
        with mock.patch.dict(os.environ, ENV_ON):
            t = time.monotonic()
            pf = JR.start("let us think about tomorrow", post=slow)
            adv = JR.advise(pf)
            took = time.monotonic() - t
        self.assertLess(took, 0.85)
        self.assertTrue(pf.timed_out)
        self.assertEqual(adv["action"], "proceed")

    def test_error_is_silent(self):
        def boom(*a):
            raise OSError("down")
        with mock.patch.dict(os.environ, ENV_ON):
            pf = JR.start("I had a weird day", post=boom)
            self.assertEqual(JR.advise(pf)["action"], "proceed")
        self.assertEqual(pf.error, "OSError")

    def test_budget_clamped_300_800(self):
        for raw, want in (("50", 300), ("5000", 800), ("junk", 600), ("650", 650)):
            with mock.patch.dict(os.environ, {"JARVIS_JEV_BUDGET_MS": raw}):
                self.assertEqual(JR.budget_ms(), want)

    def test_off_switch(self):
        with mock.patch.dict(os.environ, {"JARVIS_JEV_ROUTER": "0"}):
            self.assertIsNone(JR.start("hi"))
            self.assertEqual(JR.advise(None)["action"], "proceed")


class M2Confidence(unittest.TestCase):
    def setUp(self):
        JR.CACHE._d.clear()

    def test_filler_gets_one_clarifying_question(self):
        with mock.patch.dict(os.environ, {**ENV_ON, "JARVIS_JEV_LIVE": "0"}):
            self.assertEqual(JR.advise(JR.start("um so the"))["action"], "clarify")

    def test_follow_up_never_clarifies(self):
        with mock.patch.dict(os.environ, {**ENV_ON, "JARVIS_JEV_LIVE": "0"}):
            self.assertEqual(JR.advise(JR.start("um"), follow_up=True)["action"], "proceed")

    def test_live_unclear_short_incomplete_clarifies(self):
        with mock.patch.dict(os.environ, ENV_ON):
            pf = JR.start("the blue one", post=lambda *a: _answers("unclear", 0.95, complete=0.1))
            self.assertEqual(JR.advise(pf)["action"], "clarify")

    def test_low_confidence_escalates_to_todays_path(self):
        with mock.patch.dict(os.environ, ENV_ON):
            pf = JR.start("let us think about tomorrow's schedule", post=lambda *a: _answers("other", 0.38))
            adv = JR.advise(pf)
        self.assertEqual(adv["action"], "escalate")

    def test_never_approves(self):
        with mock.patch.dict(os.environ, ENV_ON):
            for u in ("send the invoice to Bob now", "merge the PR", "explain X", "um"):
                pf = JR.start(u, post=lambda *a: _answers("tool", 1.0, hard=0.0))
                self.assertIn(JR.advise(pf)["action"], {"proceed", "clarify", "escalate"})

    def test_hard_step_never_leaves_the_box(self):
        calls = []
        with mock.patch.dict(os.environ, ENV_ON):
            pf = JR.start("deploy it to production now", post=lambda *a: calls.append(1) or _answers())
            JR.advise(pf)
        self.assertEqual(calls, [])
        self.assertEqual(pf.picker["handler"], "hard_step")


class M3SkillPicker(unittest.TestCase):
    def test_replay_set_accuracy(self):
        rep = JR.replay()
        self.assertGreaterEqual(rep["n"], 40)
        self.assertGreaterEqual(rep["accuracy"], 0.95, rep["misses"])

    def test_confident_picker_does_not_wait_on_network(self):
        JR.CACHE._d.clear()
        def slow(*a):
            time.sleep(1.0)
            return _answers()
        with mock.patch.dict(os.environ, ENV_ON):
            t = time.monotonic()
            JR.advise(JR.start("explain what a candidate means", post=slow))
            self.assertLess(time.monotonic() - t, 0.1)

    def test_pipeline_picker_skips_hands_for_small_talk(self):
        pipe = _load("pipeline_jev_test", STACK / "brain" / "pipeline.py")
        seen = {}

        def talk(prompt, context="", **kw):
            seen.update(kw)
            return {"spoken": "Doing fine, sir.", "wire": "openrouter", "engine": "openrouter"}

        with tempfile.TemporaryDirectory() as d, mock.patch.dict(os.environ, {"JARVIS_JEV_LIVE": "0"}):
            hive = Path(d)
            (hive / "bus").mkdir()
            with mock.patch.object(pipe, "online_talk", side_effect=lambda u, b, talk_fn=None, images=None, **kw: (seen.update(kw) or {"spoken": "Doing fine, sir.", "wire": "openrouter", "engine": "openrouter"})):
                pipe.apply_pipeline("how are you tonight", hive=hive, retrieve_roots=[], talk_fn=talk)
        self.assertEqual(seen.get("hands"), False)

    def test_pipeline_clarifies_filler_without_a_model_call(self):
        pipe = _load("pipeline_jev_test3", STACK / "brain" / "pipeline.py")
        with tempfile.TemporaryDirectory() as d, mock.patch.dict(os.environ, {"JARVIS_JEV_LIVE": "0"}):
            hive = Path(d)
            (hive / "bus").mkdir()
            with mock.patch.object(pipe, "online_talk", side_effect=AssertionError("no model call")):
                out = pipe.apply_pipeline("um so the", hive=hive, retrieve_roots=[], talk_fn=lambda *a, **k: {})
        self.assertIn("only caught part of that", out.get("spoken") or "")


class M4OneCall(unittest.TestCase):
    def test_questions_fit_one_call(self):
        self.assertLessEqual(len(JR.QUESTIONS), 12)
        JR.validate_questions(JR.QUESTIONS)
        with self.assertRaises(ValueError):
            JR.validate_questions({f"q{i}": {"type": "noul", "instructions": "x"} for i in range(13)})

    def test_exactly_one_request_per_turn(self):
        JR.CACHE._d.clear()
        calls = []
        with mock.patch.dict(os.environ, ENV_ON):
            pf = JR.start("I had a weird day", post=lambda *a: calls.append(a[3]) or _answers("other", 0.9))
            JR.advise(pf)
        self.assertEqual(len(calls), 1)
        self.assertEqual(set(pf.summary()) >= {"jev_handler", "needs_expensive", "hard_hint"}, True)


class M5Cache(unittest.TestCase):
    def test_hit_skips_network_and_expires(self):
        now = [100.0]
        c = JR.DecisionCache(ttl_s=10, clock=lambda: now[0])
        c.put("Hello there!", {"handler": "converse"})
        self.assertEqual(c.get("hello there")["handler"], "converse")
        now[0] += 11
        self.assertIsNone(c.get("hello there"))

    def test_hard_steps_not_cached_and_size_bounded(self):
        c = JR.DecisionCache(ttl_s=60, size=3)
        self.assertFalse(c.put("pay it", {"handler": "tool", "hard_hint": 0.9}))
        for i in range(5):
            c.put(f"u{i}", {"handler": "other"})
        self.assertEqual(len(c._d), 3)

    def test_second_turn_uses_cache(self):
        JR.CACHE._d.clear()
        calls = []
        with mock.patch.dict(os.environ, ENV_ON):
            for _ in range(2):
                pf = JR.start("I had a weird day", post=lambda *a: calls.append(1) or _answers("other", 0.9))
                JR.advise(pf)
        self.assertEqual(len(calls), 1)
        self.assertTrue(pf.cache_hit)


class M6ShadowLog(unittest.TestCase):
    def test_row_has_latency_path_outcome_and_no_text(self):
        with tempfile.TemporaryDirectory() as d, mock.patch.dict(os.environ, {**ENV_ON, "JARVIS_JEV_LIVE": "0"}):
            pf = JR.start("my private words about lunch")
            JR.log_turn(Path(d), pf, advice=JR.advise(pf), latency_ms=1234, path="openrouter", outcome="MODEL_TALK",
                        tool="converse", hard_step=False)
            raw = (Path(d) / "bus" / JR.LOG_NAME).read_text()
        row = json.loads(raw)
        for k in ("latency_ms", "path", "outcome", "advice", "picker", "source", "timed_out"):
            self.assertIn(k, row)
        self.assertNotIn("lunch", raw)
        self.assertNotIn("sk-test", raw)
        self.assertFalse(row["authoritative"])

    def test_pipeline_writes_row_for_hard_step_without_preflight(self):
        pipe = _load("pipeline_jev_test2", STACK / "brain" / "pipeline.py")
        with tempfile.TemporaryDirectory() as d:
            hive = Path(d)
            (hive / "bus").mkdir()
            out = pipe.apply_pipeline("send the invoice to Bob now", hive=hive, retrieve_roots=[], talk_fn=lambda *a, **k: {})
            row = json.loads((hive / "bus" / JR.LOG_NAME).read_text().splitlines()[-1])
        self.assertEqual(out.get("verb") or out.get("tool"), "refuse_hard_step")
        self.assertEqual(row["path"], "refuse_hard_step")
        self.assertNotIn("source", row)  # the preflight never ran: the regex gate answered first
        self.assertNotIn("invoice", json.dumps(row))


class M7LiveEndpoint(unittest.TestCase):
    def test_no_key_means_no_network(self):
        env = {k: v for k, v in os.environ.items() if k not in {"OPENROUTER_API_KEY", "LITELLM_KEY_JARVIS"}}
        with mock.patch.dict(os.environ, env, clear=True):
            self.assertIsNone(JR._endpoint())

    def test_openrouter_key_from_env_routes_to_decisions(self):
        env = {k: v for k, v in os.environ.items() if k != "LITELLM_KEY_JARVIS"}
        env["OPENROUTER_API_KEY"] = "sk-test-not-real-0000"
        with mock.patch.dict(os.environ, env, clear=True):
            kind, url, _ = JR._endpoint()
        self.assertEqual(kind, "openrouter")
        self.assertIn("/decisions", url)

    def test_key_never_in_summary(self):
        JR.CACHE._d.clear()
        with mock.patch.dict(os.environ, ENV_ON):
            pf = JR.start("I had a weird day", post=lambda *a: _answers("other", 0.9))
            JR.advise(pf)
        self.assertNotIn("sk-test", json.dumps(pf.summary()))


if __name__ == "__main__":
    unittest.main()
