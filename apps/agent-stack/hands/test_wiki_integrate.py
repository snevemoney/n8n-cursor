import importlib.util, json, tempfile, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("wi_t", Path(__file__).with_name("wiki_integrate.py"))
W = importlib.util.module_from_spec(spec); spec.loader.exec_module(W)


class Integrate(unittest.TestCase):  # Karpathy LLM wiki: a source touches many pages; re-running changes nothing
    def test_methods_land_on_family_and_tool_pages_once(self):
        root = Path(tempfile.mkdtemp()); p = root / "packets" / "abcdefghijk"; p.mkdir(parents=True)
        (p / "methods.jsonl").write_text("\n".join(json.dumps(m) for m in [
            {"name": "prove done", "family": "evals-verification", "summary": "read the side effect back", "tools_repos": ["claude code", "n8n"]},
            {"name": "voice barge-in", "family": "voice-ui", "summary": "duck then stop", "tools_repos": ["pipecat"]}]))
        r = W.integrate(p, root / "wiki")
        self.assertEqual(r["lines"], 5)
        fam = (root / "wiki/families/evals-verification.md").read_text()
        self.assertIn("**prove done**", fam); self.assertIn("../../packets/abcdefghijk/LEARNED.md", fam)
        self.assertIn("voice barge-in", (root / "wiki/tools/pipecat.md").read_text())
        self.assertIn("families/voice-ui.md", (root / "wiki/index.md").read_text())
        self.assertEqual(W.integrate(p, root / "wiki")["lines"], 0)   # idempotent


if __name__ == "__main__":
    unittest.main()
