import importlib.util, json, tempfile, time, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("cbf_t", Path(__file__).with_name("cost_by_feature.py"))
C = importlib.util.module_from_spec(spec); spec.loader.exec_module(C)

def job(root, name, cost, kind, tools, started):
    d = root / name; d.mkdir()
    (d / "state.json").write_text(json.dumps({"cost_usd": cost, "kind": kind, "model": "m", "started": started}))
    calls = [{"function": {"name": t}} for t in tools]
    (d / "messages.json").write_text(json.dumps([{"role": "user", "content": f"do {name}"}, {"role": "assistant", "tool_calls": calls}]))

class CostByFeature(unittest.TestCase):
    def test_billed_totals_by_kind_and_tool_with_old_jobs_left_out(self):
        with tempfile.TemporaryDirectory() as t:
            root, now = Path(t), time.time()
            job(root, "a", 0.02, "screen", ["app", "say"], now - 60)
            job(root, "b", 0.01, "research", ["web_search", "app"], now - 120)
            job(root, "old", 5.0, "screen", ["app"], now - 30 * 86400)
            job(root, "free", None, "chat", [], now - 30)
            page = C.report(root, days=7, now=now)
        self.assertIn("3 jobs, **$0.03 billed**", page)
        self.assertIn("| screen | 1 | 0.0200 |", page); self.assertIn("| app | 2 | 0.0300 |", page)
        self.assertIn("| no tool | 1 | 0.0000 |", page); self.assertNotIn("| say |", page)
        self.assertIn("“do a”", page)

if __name__ == "__main__": unittest.main()
