import json, os, subprocess, sys, tempfile, unittest
from pathlib import Path
SERVER = Path(__file__).with_name("gate_mcp.py")

def session(path, calls):
    msgs = [{"jsonrpc": "2.0", "id": 0, "method": "initialize", "params": {"protocolVersion": "2025-06-18"}},
            {"jsonrpc": "2.0", "method": "notifications/initialized"}]
    msgs += [{"jsonrpc": "2.0", "id": i + 1, "method": "tools/call", "params": {"name": n, "arguments": a}} for i, (n, a) in enumerate(calls)]
    out = subprocess.run([sys.executable, str(SERVER)], input="\n".join(json.dumps(m) for m in msgs) + "\n",
                         capture_output=True, text=True, timeout=30, env={**os.environ, "JARVIS_DECISIONS_FILE": str(path)}).stdout
    return [json.loads(l) for l in out.splitlines()]

class GateOverMcp(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.f = Path(self.tmp.name) / "Decisions Needed.md"; self.f.write_text("# Decisions needed\n")
    def tearDown(self): self.tmp.cleanup()

    def ask(self, **a):
        r = session(self.f, [("ask_decision", a)])
        self.assertEqual(r[0]["result"]["serverInfo"]["name"], "jarvis-gate"); self.assertEqual(len(r), 2)  # no reply to the notification
        return json.loads(r[1]["result"]["content"][0]["text"])

    def answer(self, gid, words):
        self.f.write_text(self.f.read_text().replace(f"answer: \n", f"answer: {words}\n") if gid in self.f.read_text() else "")
        return json.loads(session(self.f, [("get_decision", {"id": gid})])[1]["result"]["content"][0]["text"])

    def test_yes_no_round_trip_through_his_list(self):
        got = self.ask(question="Turn Jarvis loops on?", kind="yes_no", **{"from": "Codex"})
        line = self.f.read_text().splitlines()[-1]
        self.assertIn(f"(Codex) {got['id']}: Turn Jarvis loops on? [yes / no] answer:", line)
        self.assertEqual(json.loads(session(self.f, [("get_decision", {"id": got["id"]})])[1]["result"]["content"][0]["text"])["status"], "waiting")
        self.assertEqual(self.answer(got["id"], "Yes, go ahead")["answer"], "yes")

    def test_pick_one_and_unclear_answers_are_never_guessed(self):
        got = self.ask(question="Where should the backup go?", kind="pick_one", options=["SSD drive", "Cloud folder", "Skip"])
        self.assertEqual(self.answer(got["id"], "maybe later")["status"], "unclear")
        got2 = self.ask(question="Rate the new voice", kind="scale")
        self.assertEqual(self.answer(got2["id"], "4")["answer"], "4")

    def test_bad_requests_are_errors_not_lines(self):
        r = session(self.f, [("ask_decision", {"question": "Pick?", "kind": "pick_one", "options": ["only one"]}),
                             ("get_decision", {"id": "../etc"})])
        self.assertTrue(r[1]["result"]["isError"] and r[2]["result"]["isError"])
        self.assertEqual(self.f.read_text(), "# Decisions needed\n")

if __name__ == "__main__": unittest.main()
