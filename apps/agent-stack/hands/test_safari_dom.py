"""Evens 2026-10-16: any browser workflow in HIS Safari, in the background (his mouse and tab untouched), Jarvis's
own cursor, a login wall is handed to him, and send/pay/delete buttons wait for his OK. No Chrome tool."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

H = Path(__file__).parent
spec = importlib.util.spec_from_file_location("sd_test", H / "safari_dom.py"); SD = importlib.util.module_from_spec(spec); spec.loader.exec_module(SD)
spec = importlib.util.spec_from_file_location("op_sd_test", H / "operator.py"); O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)

PAGE = {"url": "https://github.com/x", "title": "x", "ready": "complete", "elements": '1 a "Pull requests"', "text": "hello",
        "login": False, "scroll": "0/100", "dialogs": []}


class FakeSafari:
    def __init__(self, label="Pull requests", login=False, visible=False):
        self.label, self.login, self.visible = label, login, visible
        self.osa_calls, self.js_calls, self.hands, self.cursor = [], [], [], []

    def osa(self, lines, *args, **k):
        self.osa_calls.append((lines, args))
        text = " ".join(lines)
        if "do JavaScript" in text:
            code = args[0]
            self.js_calls.append(code)
            if "label:lab(e)" in code:
                return json.dumps({"label": self.label, "tag": "button", "type": "", "form": True})
            if "W.__jref=[]" in code:
                return json.dumps({**PAGE, "login": self.login})
            if "readyState,text" in code:
                return json.dumps({"url": "u", "ready": "complete", "text": "hello"})
            return json.dumps({"ok": 1, "cx": 36.4, "cy": 29.6, "iw": 1070, "ih": 747, "dialogs": []})
        if "make new tab" in text:
            return "77,15"
        if "index of current tab of front window" in text:
            return "77,3"
        if "visible of window" in text:
            return "true" if self.visible else "false"
        if "bounds of window" in text:
            return "364, 1158, 1434, 2018"
        return ""

    def driver(self, state=None):
        return SD.SafariDOM(state if state is not None else {}, lambda r: self.hands.append(r) or {"text": "ok"},
                            lambda x, y: self.cursor.append((x, y)), osa_fn=self.osa)


class Background(unittest.TestCase):
    def setUp(self):
        p = mock.patch.object(SD.time, "sleep"); p.start(); self.addCleanup(p.stop)

    def test_new_tab_is_jarvis_own_and_not_made_current(self):
        f = FakeSafari(); st = {}
        f.driver(st).act({"action": "new_tab", "url": "example.com"})
        script = " ".join(" ".join(l) for l, _ in f.osa_calls)
        self.assertIn("make new tab at end of tabs", script)
        self.assertNotIn("set current tab", script); self.assertNotIn("activate", script)
        self.assertEqual(st["safari_tab"], [77, 15]); self.assertEqual(st["safari_own"], [[77, 15]])

    def test_click_happens_in_the_page_not_with_his_mouse(self):
        f = FakeSafari(); st = {"safari_tab": [77, 15]}
        got = f.driver(st).act({"action": "click", "ref": 1})
        self.assertEqual(f.hands, [])          # his real pointer is never used
        self.assertEqual(f.cursor, [])         # tab not visible -> no overlay glide
        self.assertTrue(any("e.click()" in c for c in f.js_calls))
        self.assertTrue(all("tab 15 of window id 77" in " ".join(l) for l, a in f.osa_calls if "do JavaScript" in " ".join(l)))
        self.assertIn("Pull requests", got["text"])

    def test_own_cursor_glides_when_the_tab_is_visible(self):
        f = FakeSafari(visible=True)
        f.driver({"safari_tab": [77, 15]}).act({"action": "click", "ref": 1})
        self.assertEqual(f.cursor, [(400, 1301)]); self.assertEqual(f.hands, [])

    def test_show_puts_it_on_his_screen(self):
        f = FakeSafari()
        f.driver({"safari_tab": [77, 15]}).act({"action": "show"})
        script = " ".join(" ".join(l) for l, _ in f.osa_calls)
        self.assertIn("set current tab of window id 77 to tab 15", script)
        self.assertIn("set index of window id 77 to 1", script); self.assertIn("activate", script)

    def test_his_tabs_are_never_closed(self):
        f = FakeSafari()
        got = f.driver({"safari_tab": [77, 3]}).act({"action": "close_tab"})
        self.assertIn("his tab", got["text"])

    def test_every_action_is_in_the_schema(self):
        t = next(t for t in O.TOOLS if t["function"]["name"] == "safari")
        self.assertEqual(tuple(t["function"]["parameters"]["properties"]["action"]["enum"]), SD.ACTIONS)
        names = {t["function"]["name"] for t in O.TOOLS}
        self.assertNotIn("browser", names); self.assertIn("never open Chrome", O.SYSTEM)


class LoginAndStops(unittest.TestCase):
    def test_login_wall_is_handed_to_him(self):
        f = FakeSafari(login=True)
        got = f.driver({"safari_tab": [77, 15]}).act({"action": "snapshot"})
        self.assertIn("LOGIN NEEDED", got["text"]); self.assertIn("never type his password", got["text"])

    def test_send_button_is_a_kept_stop(self):
        self.assertTrue(FakeSafari(label="Send").driver({"safari_tab": [77, 15]}).stop_reason({"action": "click", "ref": 2}))
        self.assertFalse(FakeSafari(label="Pull requests").driver({"safari_tab": [77, 15]}).stop_reason({"action": "click", "ref": 2}))
        self.assertTrue(FakeSafari(label="Place order").driver({"safari_tab": [77, 15]}).stop_reason({"action": "type", "ref": 2, "submit": True}))


class ApprovalFlow(unittest.TestCase):
    def test_held_click_runs_once_after_his_yes(self):
        hive = Path(tempfile.mkdtemp())
        with mock.patch.object(O, "_jev_tier", return_value={"tier": "mid", "conf": 0.9}):
            t = O.Task.create(hive, "send the reply")
        call = {"tool": "safari", "args": {"action": "click", "ref": 9}, "call_id": "a"}
        ran = []
        with mock.patch.object(O.Tools, "preflight", return_value="clicks 'Send'"), \
             mock.patch.object(O.Tools, "safari", side_effect=lambda a: ran.append(a) or {"text": "sent"}):
            O.step_once(t, O.Tools(t.path), lambda m, tools: {"ok": True, "calls": [call]})
            self.assertEqual(ran, [])
            self.assertIn("needs Evens's OK", t.read("messages.json")[-1]["content"])
            st = t.read("state.json"); st["status"] = "RUNNING"; st["pid"] = O.os.getpid(); t.write("state.json", st)
            (hive / "operator-tasks" / "latest.json").write_text(json.dumps({"task_id": t.path.name}))
            O.tell(hive, "yes, send it")
            O.step_once(t, O.Tools(t.path), lambda m, tools: {"ok": True, "calls": [call]})
            self.assertEqual(ran, [{"action": "click", "ref": 9}])
            O.step_once(t, O.Tools(t.path), lambda m, tools: {"ok": True, "calls": [call]})
            self.assertEqual(len(ran), 1)  # one yes = one action


if __name__ == "__main__":
    unittest.main()
