"""Evens 2026-10-16: "Jarvis doesn't speak like the others, doesn't output like the others, doesn't execute like the
others ... it is still not a complete harness." One agent loop for every turn, like Claude Code/Codex:
- it talks while it works (say), not only at the end;
- a new line while it is working reaches the SAME loop (you interrupt the agent, you don't queue a second job);
- it carries the conversation, so "another one" and "it" resolve without repeating.
"""
import importlib.util
import json
import os
import tempfile
from unittest import mock
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
        # Evens 10-17 "Jarvis repeats itself": the done summary is spoken only when nothing was said this turn (card keeps it)
        self.assertEqual(said, ["Opening Safari now."])

    def test_the_answer_is_not_spoken_twice(self):  # live 10-16: say + done carried the same answer, both spoken
        t = O.Task.create(self.hive, "search facebook for juliana")
        line = "I searched Facebook for Juliana in your Safari. The top results are a post by Juliana Carisle."
        model = scripted([("say", {"text": line})], [("done", {"summary": "Searched Facebook for Juliana in a background "
                                                                       "Safari tab. The top results are a post by Juliana Carisle."})])
        O.run(t.path, model_fn=model)
        self.assertEqual([r["text"] for r in t.rows("speech.jsonl")], [line])

    def test_a_plain_text_answer_is_spoken(self):  # bench 10-16 T01: "391." never reached the speech log
        t = O.Task.create(self.hive, "what is 17 times 23")
        O.run(t.path, model_fn=lambda m, tools: {"ok": True, "text": "391."})
        self.assertEqual([r["text"] for r in t.rows("speech.jsonl")], ["391."])

    def test_a_new_line_reaches_the_running_loop(self):
        t = O.Task.create(self.hive, "render a video")
        O.tell(self.hive, "make it 10 seconds instead")
        self.assertTrue(O.running(self.hive))
        seen = []
        O.step_once(t, O.Tools(t.path), lambda m, tools: seen.append(m) or {"ok": True, "text": "ok"})
        self.assertIn("make it 10 seconds instead", json.dumps(seen[0]))

    def test_lines_said_during_a_step_are_never_lost(self):  # Evens 10-16: he keeps talking while Jarvis works
        t = O.Task.create(self.hive, "list Claude Code's changes in my repo")
        st = t.read("state.json"); st.update(status="RUNNING", pid=os.getpid()); t.write("state.json", st)
        def model(m, tools):  # he talks while this step runs
            O.tell(self.hive, "also open YouTube")
            O.tell(self.hive, "and use the GitHub MCP for it")
            return {"ok": True, "calls": [{"tool": "say", "args": {"text": "Looking."}, "call_id": "a"}]}
        O.step_once(t, O.Tools(t.path), model)
        seen = []
        O.step_once(t, O.Tools(t.path), lambda m, tools: seen.append(m) or {"ok": True, "text": "ok"})
        text = json.dumps(seen[0])
        self.assertIn("also open YouTube", text); self.assertIn("use the GitHub MCP", text)
        self.assertIn("Acknowledge it", text)

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


class PrivateApps(unittest.TestCase):
    """Live 10-16: asked to message Juliana on Facebook, Jarvis opened his Contacts and Messages on its own."""

    def test_the_calls_from_that_job_are_held(self):
        for name, args in [("shell", {"command": "osascript -e 'tell application \"Contacts\" to get {name} of people'"}),
                           ("open", {"target": "Messages"}),
                           ("computer", {"action": "screenshot", "app": "Messages"}),
                           ("shell", {"command": "osascript -e 'tell application \"System Events\" to tell process \"Messages\" to click menu item 1'"})]:
            self.assertTrue(O._private_app(name, args), args)
        self.assertEqual(O._private_app("open", {"target": "Safari"}), "")
        self.assertEqual(O._private_app("shell", {"command": "ls ~/Documents"}), "")

    def test_held_unless_he_named_it(self):
        hive = Path(tempfile.mkdtemp())
        t = O.Task.create(hive, "Open Facebook, find Juliana in my friends list and send her hi")
        ran = []
        with mock.patch.object(O.Tools, "open", side_effect=lambda a: ran.append(a) or {"text": "exit 0"}):
            O.step_once(t, O.Tools(t.path), lambda m, tools: {"ok": True, "calls": [{"tool": "open", "args": {"target": "Messages"}, "call_id": "a"}]})
        self.assertEqual(ran, []); self.assertIn("did not ask for", t.read("messages.json")[-1]["content"])
        t2 = O.Task.create(hive, "open my Messages app")
        with mock.patch.object(O.Tools, "open", side_effect=lambda a: ran.append(a) or {"text": "exit 0"}):
            O.step_once(t2, O.Tools(t2.path), lambda m, tools: {"ok": True, "calls": [{"tool": "open", "args": {"target": "Messages"}, "call_id": "b"}]})
        self.assertEqual(len(ran), 1)

    def test_it_is_told_to_stay_on_the_named_channel(self):
        self.assertIn("Stay on the app or site he named", O.SYSTEM)


class NotStuck(unittest.TestCase):
    """Evens 10-16: figure out when it is stuck or lacks evidence and keep going; tell him only when it needs him."""

    def setUp(self):
        self.hive = Path(tempfile.mkdtemp())

    def test_cant_is_sent_back_and_unproven_actions_too(self):
        t = O.Task.create(self.hive, "message Juliana on Facebook")
        model = scripted([("done", {"summary": "I can't send messages on Facebook."})],
                         [("done", {"summary": "I can't, there is no tool for that."})],
                         [("done", {"summary": "Still can't."})])
        st = O.run(t.path, model_fn=model)
        self.assertEqual(st["status"], "DONE")
        notes = [m["content"] for m in t.read("messages.json") if m.get("role") == "tool"]
        self.assertTrue(any("about to tell him you can't" in n for n in notes))
        self.assertTrue(any("second time" in n for n in notes))

    def test_a_technical_snag_is_not_asked(self):
        t = O.Task.create(self.hive, "open my Notion page")
        model = scripted([("ask_owner", {"question": "The page has no open window and I can't find the button."})],
                         [("done", {"summary": "Opened it.", "evidence": "snapshot shows the page"})])
        st = O.run(t.path, model_fn=model)
        self.assertEqual(st["status"], "DONE")

    def test_a_real_need_is_asked(self):
        t = O.Task.create(self.hive, "message Juliana hi")
        model = scripted([("ask_owner", {"question": "Facebook wants you to log in. Please sign in and tell me."})])
        st = O.run(t.path, model_fn=model)
        self.assertEqual(st["status"], "WAITING_OWNER")
