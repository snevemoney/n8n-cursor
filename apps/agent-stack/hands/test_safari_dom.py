"""Evens 2026-10-16: "Jarvis still can't navigate on my browser" / "it opened Chrome instead of my Safari".
The operator drives HIS Safari by page elements; clicks are real mouse clicks at the element; no Chrome tool exists."""
import importlib.util
import json
import unittest
from pathlib import Path
from unittest import mock

H = Path(__file__).parent
spec = importlib.util.spec_from_file_location("sd_test", H / "safari_dom.py"); SD = importlib.util.module_from_spec(spec); spec.loader.exec_module(SD)
spec = importlib.util.spec_from_file_location("op_sd_test", H / "operator.py"); O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)

PAGE = json.dumps({"url": "https://github.com/x", "title": "x", "elements": '1 a "Pull requests"', "text": "hello"})


class Driver(unittest.TestCase):
    def make(self):
        self.sent, self.cursor, self.osa_calls = [], [], []

        def run_js(code):
            if "data-jref=\"1\"" in code and "innerWidth" in code:
                return json.dumps({"cx": 36.4, "cy": 29.6, "iw": 1070, "ih": 747, "tag": "a"})
            return PAGE
        d = SD.SafariDOM(lambda r: self.sent.append(r) or {"text": "ok"}, lambda x, y: self.cursor.append((x, y)),
                         run_js=run_js, osa=lambda lines, *a, **k: self.osa_calls.append((lines, a)) or ("364, 1158, 1434, 2018" if "bounds" in lines[0] else ""))
        d._settle = lambda s: None
        return d

    def test_click_is_a_real_mouse_click_at_the_element_and_returns_the_page(self):
        d = self.make()
        with mock.patch.object(SD.time, "sleep"):
            got = d.act({"action": "click", "ref": "1"})
        # live geometry 10-16: window {364,1158,1434,2018} on display 2, page 1070x747 -> toolbar 113
        self.assertEqual(self.cursor, [(400, 1301)])
        self.assertEqual(self.sent, [{"op": "click", "x": 400, "y": 1301, "count": 1, "button": "left"}])
        self.assertIn("Pull requests", got["text"])

    def test_navigate_changes_his_current_tab_not_a_new_one(self):
        d = self.make()
        d.act({"action": "navigate", "url": "github.com/snevemoney/n8n-cursor/pulls"})
        lines = " ".join(" ".join(l) for l, _ in self.osa_calls)
        self.assertIn("set URL of current tab of front window", lines)
        self.assertNotIn("make new tab", lines)
        self.assertEqual(self.osa_calls[-1][1], ("https://github.com/snevemoney/n8n-cursor/pulls",))

    def test_type_focuses_then_types_real_keys(self):
        d = self.make()
        d.act({"action": "type", "ref": "1", "text": "drake", "submit": True})
        self.assertEqual(self.sent, [{"op": "type", "text": "drake"}, {"op": "key", "keys": "return"}])


class NoChrome(unittest.TestCase):
    def test_operator_has_safari_and_no_chrome_launching_tool(self):
        names = {t["function"]["name"] for t in O.TOOLS}
        self.assertIn("safari", names); self.assertNotIn("browser", names)
        self.assertIn("never open Chrome", O.SYSTEM)


if __name__ == "__main__":
    unittest.main()


class SchemaMatchesDriver(unittest.TestCase):
    def test_enum_is_the_driver_actions(self):
        t = next(t for t in O.TOOLS if t["function"]["name"] == "safari")
        self.assertEqual(tuple(t["function"]["parameters"]["properties"]["action"]["enum"]), SD.ACTIONS)
