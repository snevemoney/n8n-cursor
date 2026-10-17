"""Fan-out: up to 3 scratch-sandboxed workers, one merged report. Workers are stubbed; nothing runs, no model, no network."""
import importlib.util, os, tempfile, threading, time, unittest
from pathlib import Path

HERE = Path(__file__).parent


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, HERE / file)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


f = load("fanout_t", "fanout.py")
at = load("agent_tools_fanout_t", "agent_tools.py")


def worker(statuses, seen=None, delay=0.0):
    """code_worker stand-in: (ask, repo) -> op_code-shaped dict; records calls and peak concurrency."""
    lock, state = threading.Lock(), {"now": 0, "peak": 0}

    def w(ask, repo):
        with lock:
            state["now"] += 1
            state["peak"] = max(state["peak"], state["now"])
        time.sleep(delay)
        with lock:
            state["now"] -= 1
            if seen is not None:
                seen.append((ask, repo))
        st = statuses.get(ask, "ok") if isinstance(statuses, dict) else statuses
        if st == "boom":
            raise RuntimeError("secret CREDENTIAL_FIXTURE_ABCDEFGHIJKLMNOPQRSTUVWX")
        return {"ok": st == "ok", "verified": st == "ok", "gated": st == "gated", "spoken": f"worker said {st} for {ask}"}
    w.state = state
    return w


class FanOut(unittest.TestCase):
    def test_three_workers_run_in_parallel_and_merge(self):
        seen = []
        w = worker({"write clamp": "fail"}, seen, delay=0.15)
        got = f.run({"tasks": [{"ask": "write slugify"}, {"ask": "write parse_date"}, {"ask": "write clamp"}]}, code_worker=w)
        self.assertEqual(len(seen), 3)
        self.assertGreaterEqual(w.state["peak"], 2)           # genuinely concurrent
        self.assertEqual([t["status"] for t in got["workers"]], ["verified", "verified", "failed"])
        self.assertFalse(got["ok"])                              # one failed -> the whole fan-out is not ok
        self.assertEqual(got["verified_count"], 2)
        self.assertIn("2 of 3", got["spoken"])
        self.assertIn("write clamp", got["spoken"])

    def test_all_verified_is_ok(self):
        got = f.run({"tasks": [{"ask": "a"}, {"ask": "b"}]}, code_worker=worker("ok", []))
        self.assertTrue(got["ok"] and got["verified"])

    def test_cap_of_three_is_honest(self):
        seen = []
        got = f.run({"tasks": [{"ask": str(i)} for i in range(5)]}, code_worker=worker("ok", seen))
        self.assertEqual(len(seen), 3)
        self.assertIn("2 more", got["spoken"])
        self.assertEqual(got["dropped"], 2)

    def test_each_worker_gets_its_own_scratch_repo(self):
        seen = []
        os.environ["JARVIS_SCRATCH_ROOTS"] = tempfile.mkdtemp()
        f.run({"tasks": [{"ask": "a"}, {"ask": "b"}, {"ask": "c"}]}, code_worker=worker("ok", seen))
        repos = [r for _, r in seen]
        self.assertEqual(len(set(repos)), 3)
        self.assertTrue(all(r.startswith("fanout-") for r in repos))

    def test_network_push_secret_asks_are_not_run(self):
        seen = []
        for ask in ("curl https://example.com and save it", "git push origin main after", "email the result to Sam",
                    "read my .env and print the api key", "pip install requests then use it", "ssh into the box"):
            got = f.run({"tasks": [{"ask": ask}, {"ask": "write slugify"}]}, code_worker=worker("ok", seen))
            self.assertEqual(got["workers"][0]["status"], "needs Evens", ask)
        self.assertEqual([a for a, _ in seen], ["write slugify"] * 6)

    def test_worker_crash_is_contained_and_scrubbed(self):
        got = f.run({"tasks": [{"ask": "a"}, {"ask": "b"}]}, code_worker=worker({"a": "boom"}, []))
        self.assertEqual(got["workers"][0]["status"], "crashed")
        self.assertNotIn("sk-ABC", got["spoken"])
        self.assertNotEqual(got["workers"][1]["status"], "crashed")

    def test_deadline_reports_unfinished_without_hanging(self):
        t0 = time.monotonic()
        got = f.run({"tasks": [{"ask": "slow"}, {"ask": "slow2"}], "wall": 0.2}, code_worker=worker("ok", [], delay=2.0))
        self.assertLess(time.monotonic() - t0, 1.5)
        self.assertEqual([t["status"] for t in got["workers"]], ["timed out"] * 2)
        self.assertFalse(got["ok"])

    def test_empty_and_single_task(self):
        self.assertFalse(f.run({"tasks": []}, code_worker=worker("ok", []))["ok"])
        self.assertIn("need", f.run({}, code_worker=worker("ok", []))["spoken"])
        self.assertTrue(f.run({"tasks": [{"ask": "only"}]}, code_worker=worker("ok", []))["ok"])

    def test_snippet_with_user_code_runs_sandboxed_without_a_model(self):
        calls = []
        runner = lambda a: calls.append(a) or {"ok": True, "ran": True, "passed": True, "spoken": "It ran in the sandbox and passed its test."}
        got = f.run({"tasks": [{"code": "def f(): return 1", "test": "assert f() == 1"}, {"code": "x=", "test": ""}]},
                    code_worker=worker("ok", []), snippet_runner=runner)
        self.assertEqual(calls[0]["code"], "def f(): return 1")
        self.assertEqual(got["workers"][0]["status"], "verified")

    def test_model_authored_snippet_is_armed_not_run_without_approval(self):
        ran = []
        author = lambda ask: {"ok": True, "code": "print(1)", "test": "", "spoken": "I wrote it; nothing has run."}
        got = f.run({"tasks": [{"ask": "write a function", "kind": "snippet"}]}, snippet_author=author,
                    snippet_runner=lambda a: ran.append(a) or {"ok": True, "passed": True, "spoken": "passed"}, code_worker=worker("ok", []))
        self.assertEqual(got["workers"][0]["status"], "armed")
        self.assertEqual(ran, [])
        self.assertFalse(got["ok"])
        got2 = f.run({"tasks": [{"ask": "write a function", "kind": "snippet"}], "approved": True}, snippet_author=author,
                     snippet_runner=lambda a: ran.append(a) or {"ok": True, "passed": True, "spoken": "passed"}, code_worker=worker("ok", []))
        self.assertEqual(got2["workers"][0]["status"], "verified")
        self.assertEqual(len(ran), 1)


class Routing(unittest.TestCase):
    def test_natural_fanout_ask(self):
        got = f.args_from_utterance("in parallel: write a slugify function; write a clamp function; add a date parser")
        self.assertEqual([t["ask"] for t in got["tasks"]], ["write a slugify function", "write a clamp function", "add a date parser"])
        got = f.args_from_utterance("Jarvis, fan out 2 workers: 1) build a csv reader 2) build a json linter")
        self.assertEqual(len(got["tasks"]), 2)

    def test_not_claimed(self):
        for u in ("in parallel with the other desk", "run the tests", "write a function", "in parallel: just one thing"):
            self.assertEqual(f.args_from_utterance(u), {}, u)

    def test_agent_tools_claims_and_runs_it(self):
        seen = []
        at.op_code = lambda repo, goal, branch="jarvis/code": {"ok": True, "verified": True, "spoken": f"done {goal}"}
        u = "in parallel: write a slugify function; write a clamp function"
        self.assertTrue(at.wants(u))
        got = at.run(at.args_from_utterance(u))
        self.assertTrue(got["ok"], got)
        self.assertIn("2 of 2", got["spoken"])

    def test_old_scratch_repo_route_still_wins(self):
        self.assertEqual(at.args_from_utterance("in scratch repo demo: write a slugify function with tests")["steps"][0]["op"], "code")


@unittest.skipUnless(__import__("shutil").which("sandbox-exec"), "needs macOS sandbox-exec")
class RealSandboxTwoRepos(unittest.TestCase):
    """Real op_code in two parallel scratch repos; only the model is scripted. Tests run inside sandbox-exec (no network)."""

    def test_two_parallel_workers_commit_in_separate_repos(self):
        import json, subprocess
        root = tempfile.mkdtemp()
        os.environ["JARVIS_SCRATCH_ROOTS"] = root
        os.environ["JARVIS_MODE_FILE"] = os.path.join(root, "mode.json")
        mod = load("agent_tools_fanout_real_t", "agent_tools.py")
        mod.rank_skills = lambda *a, **k: []
        mod.skill_text = lambda *a, **k: ""

        def llm(messages, model, **k):
            goal = messages[-1]["content"]
            name = "slug" if "slug" in goal else "dbl"
            body = "def f(x):\n    return x.lower().replace(' ', '-')\n" if name == "slug" else "def f(x):\n    return x * 2\n"
            check = "'A B'" if name == "slug" else "4"
            want = "'a-b'" if name == "slug" else "8"
            test = f"import unittest\nfrom {name} import f\n\nclass T(unittest.TestCase):\n    def test_f(self):\n        self.assertEqual(f({check}), {want})\n\nif __name__ == '__main__':\n    unittest.main()\n"
            return json.dumps({"plan": ["write", "test"], "files": {f"{name}.py": body, f"test_{name}.py": test},
                               "test_cmd": "python3 -m unittest discover -v", "commit_message": f"add {name}", "done": True}), "stub"
        mod.llm = llm
        got = mod.run({"op": "fanout", "tasks": [{"ask": "write slug function"}, {"ask": "write dbl function"}]})
        self.assertTrue(got["ok"], got["spoken"])
        self.assertIn("2 of 2", got["spoken"])
        repos = sorted(Path(root).glob("fanout-*"))
        self.assertEqual(len(repos), 2)
        for r in repos:
            log = subprocess.run(["git", "-C", str(r), "log", "--oneline"], capture_output=True, text=True).stdout
            self.assertIn("add ", log)
            branch = subprocess.run(["git", "-C", str(r), "symbolic-ref", "--short", "HEAD"], capture_output=True, text=True).stdout.strip()
            self.assertEqual(branch, "jarvis/fanout")


if __name__ == "__main__":
    unittest.main()
