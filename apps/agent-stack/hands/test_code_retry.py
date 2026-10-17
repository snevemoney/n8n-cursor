"""Model-written code: retry path (first attempt fails tests, second fixes) and non-Python runners.

The model is stubbed with scripted replies, so these run offline and never touch :4018 or OpenRouter.
"""
import importlib.util, json, os, shutil, tempfile, unittest
from pathlib import Path


def load_tools():
    spec = importlib.util.spec_from_file_location("agent_tools_retry_t", Path(__file__).with_name("agent_tools.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.rank_skills = lambda *a, **k: []
    return mod


def scripted(replies):
    """llm() stand-in: returns each reply once, in order, and records the prompts it was given."""
    seen = []

    def fake(messages, model, **k):
        seen.append(messages[-1]["content"])
        return (json.dumps(replies[min(len(seen), len(replies)) - 1]), "stub-model")
    fake.seen = seen
    return fake


PY_TEST = ("import unittest\nfrom slug import slugify\n\nclass T(unittest.TestCase):\n"
           "    def test_basic(self):\n        self.assertEqual(slugify('Hello World'), 'hello-world')\n"
           "if __name__ == '__main__':\n    unittest.main()\n")
PY_BAD = "def slugify(s):\n    return s.lower()\n"          # leaves the space -> test fails
PY_GOOD = "def slugify(s):\n    return s.lower().replace(' ', '-')\n"


class CodeRetry(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        os.environ["JARVIS_SCRATCH_ROOTS"] = self.tmp
        os.environ["JARVIS_MODE_FILE"] = os.path.join(self.tmp, "mode.json")
        self.a = load_tools()

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_failed_first_attempt_is_fixed_on_second(self):
        first = {"plan": ["slugify"], "files": {"slug.py": PY_BAD, "test_slug.py": PY_TEST}, "commit_message": "slugify"}
        second = {"files": {"slug.py": PY_GOOD}, "commit_message": "slugify: replace spaces", "done": True}
        self.a.llm = scripted([first, second])
        got = self.a.op_code("retry-py", "write slugify with a test")
        self.assertTrue(got["ok"], got["spoken"])
        statuses = {s["what"]: s["status"] for s in got["steps"]}
        self.assertEqual(statuses["iter 1 test"], "failed")       # the first attempt really failed
        self.assertEqual(statuses["iter 2 test"], "verified")     # and the retry really passed
        self.assertEqual(statuses["commit"], "verified")
        # iteration 2 was shown iteration 1's failing output, so the fix was driven by evidence
        self.assertIn("FAIL", self.a.llm.seen[1])
        self.assertIn("test_basic", self.a.llm.seen[1])

    def test_never_passing_attempts_stop_at_the_cap_and_do_not_commit(self):
        bad = {"files": {"slug.py": PY_BAD, "test_slug.py": PY_TEST}, "commit_message": "x"}
        self.a.llm = scripted([bad])
        self.a.MAX_ITERS = 3
        got = self.a.op_code("retry-never", "write slugify with a test")
        self.assertFalse(got["ok"])
        self.assertEqual(len([s for s in got["steps"] if s["what"].endswith(" test") and s["what"].startswith("iter")]), 3)
        self.assertFalse(any(s["what"] == "commit" for s in got["steps"]))
        self.assertIn("NOT done", got["spoken"])
        log = self.a._git(Path(self.tmp) / "retry-never", "log", "--oneline")
        self.assertEqual(log.stdout.strip(), "")                   # nothing committed


class NodeRunner(unittest.TestCase):
    NODE_TEST = ("const test = require('node:test');\nconst assert = require('node:assert');\n"
                 "const { add } = require('./add');\ntest('adds', () => assert.strictEqual(add(2, 3), 5));\n")

    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        os.environ["JARVIS_SCRATCH_ROOTS"] = self.tmp
        os.environ["JARVIS_MODE_FILE"] = os.path.join(self.tmp, "mode.json")
        self.a = load_tools()
        if not shutil.which("node"):
            self.skipTest("node is not installed here")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_node_test_runner_passes_and_fails_honestly(self):
        self.a.op_repo("njs", "init")
        self.a.op_repo("njs", "write", path="add.js", content="exports.add = (a, b) => a - b;\n")
        self.a.op_repo("njs", "write", path="add.test.js", content=self.NODE_TEST)
        bad = self.a.op_repo("njs", "test", cmd="node --test")
        self.assertFalse(bad["ok"], bad)                           # a - b fails the test
        self.assertIn("adds", bad["output"])
        self.a.op_repo("njs", "write", path="add.js", content="exports.add = (a, b) => a + b;\n")
        good = self.a.op_repo("njs", "test", cmd="node --test")
        self.assertTrue(good["ok"], good)

    def test_code_loop_retries_a_node_project(self):
        first = {"files": {"add.js": "exports.add = (a, b) => a - b;\n", "add.test.js": self.NODE_TEST},
                 "test_cmd": "node --test", "commit_message": "add"}
        second = {"files": {"add.js": "exports.add = (a, b) => a + b;\n"}, "test_cmd": "node --test",
                  "commit_message": "add: fix sign", "done": True}
        self.a.llm = scripted([first, second])
        got = self.a.op_code("retry-node", "write add(a,b) in node with a test")
        self.assertTrue(got["ok"], got["spoken"])


if __name__ == "__main__":
    unittest.main()
