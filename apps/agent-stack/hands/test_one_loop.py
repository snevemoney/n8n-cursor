"""Evens 2026-10-16: "Jarvis doesn't speak like the others, doesn't output like the others, doesn't execute like the
others ... it is still not a complete harness." One agent loop for every turn, like Claude Code/Codex:
- it talks while it works (say), not only at the end;
- a new line while it is working reaches the SAME loop (you interrupt the agent, you don't queue a second job);
- it carries the conversation, so "another one" and "it" resolve without repeating.
"""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("agent_stack_operator_one_loop", Path(__file__).with_name("operator.py"))
O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)


def scripted(*rounds):
    """Each round: list of (tool, args) the model 'calls' that step."""
    calls = iter(rounds)
    seen = []

    def model_fn(messages, tools):
        seen.append(list(messages))
        try:
            row = next(calls)
        except StopIteration:
            row = [("done", {"summary": "finished"})]
        return {"ok": True, "text": "", "calls": [{"call_id": f"c{i}", "tool": t, "args": a} for i, (t, a) in enumerate(row)]}
    model_fn.seen = seen
    return model_fn


class OneLoop(unittest.TestCase):
    def setUp(self):
        self.hive = Path(tempfile.mkdtemp())

    def test_say_speaks_while_working(self):
        t = O.Task.create(self.hive, "open Safari and read the page")
        model = scripted([("say", {"text": "Opening Safari now."})], [("done", {"summary": "Read it."})])
        O.run(t.path, model_fn=model)
        said = [r["text"] for r in t.rows("speech.jsonl")]
        self.assertEqual(said, ["Opening Safari now.", "Read it."])

    def test_the_answer_is_not_spoken_twice(self):  # live 10-16: say + done carried the same answer, both spoken
        t = O.Task.create(self.hive, "search facebook for juliana")
        line = "I searched Facebook for Juliana in your Safari. The top results are a post by Juliana Carisle."
        model = scripted([("say", {"text": line})], [("done", {"summary": "Searched Facebook for Juliana in a background "
                                                                       "Safari tab. The top results are a post by Juliana Carisle."})])
        O.run(t.path, model_fn=model)
        self.assertEqual([r["text"] for r in t.rows("speech.jsonl")], [line])

    def test_a_new_line_reaches_the_running_loop(self):
        t = O.Task.create(self.hive, "render a video")
        O.tell(self.hive, "make it 10 seconds instead")
        msgs = t.read("messages.json")
        self.assertEqual(msgs[-1], {"role": "user", "content": "make it 10 seconds instead"})
        self.assertTrue(O.running(self.hive))

    def test_a_dead_worker_is_not_running(self):
        t = O.Task.create(self.hive, "old job")
        st = t.read("state.json"); st.update(status="RUNNING", pid=999999); t.write("state.json", st)
        self.assertFalse(O.running(self.hive)); self.assertFalse(O.tell(self.hive, "new ask")["ok"])

    def test_the_conversation_carries(self):
        t = O.Task.create(self.hive, "open FilmCraft", turns=[{"user": "open Blender", "jarvis": "Blender is open."}])
        msgs = t.read("messages.json")
        self.assertIn("open Blender", json.dumps(msgs))
        self.assertIn("Blender is open.", json.dumps(msgs))

    def test_plain_questions_need_no_tools(self):
        t = O.Task.create(self.hive, "what is 17 times 23?")
        model = scripted([("say", {"text": "17 times 23 is 391."})], [("done", {"summary": ""})])
        state = O.run(t.path, model_fn=model)
        self.assertEqual(state["status"], "DONE")
        self.assertEqual([r["text"] for r in t.rows("speech.jsonl")], ["17 times 23 is 391."])


if __name__ == "__main__":
    unittest.main()
