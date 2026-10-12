#!/usr/bin/env python3
"""Safari/see unit tests. No headed Safari. No Chrome."""
from __future__ import annotations

import importlib.util
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parent / "see.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_see", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class SeeTest(unittest.TestCase):
    def test_safari_open_rejects_non_http(self) -> None:
        out = MOD.safari_open("file:///etc/passwd")
        self.assertFalse(out["ok"])
        self.assertIn("http", out["spoken"])

    def test_safari_front_parses_title_url(self) -> None:
        proc = mock.Mock(returncode=0, stdout="Example\nhttps://example.com\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            out = MOD.safari_front()
        self.assertTrue(out["ok"])
        self.assertEqual(out["title"], "Example")
        self.assertEqual(out["url"], "https://example.com")
        self.assertNotIn("Chrome", out["spoken"])

    def test_grab_screen_writes_path(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-see-") as tmp:
            hive = Path(tmp)
            dest = hive / "bus" / "see.jpg"
            dest.parent.mkdir()

            def fake_run(argv, timeout=20.0):
                Path(argv[-1]).write_bytes(b"jpg")
                return subprocess.CompletedProcess(argv, 0, "", "")

            with mock.patch.object(MOD, "_run", side_effect=fake_run):
                out = MOD.grab_screen(hive)
            self.assertTrue(out["ok"])
            self.assertTrue(Path(out["path"]).is_file())

    def test_safari_act_refuses_pay_click(self) -> None:
        out = MOD.safari_click("Pay now")
        self.assertFalse(out["ok"])
        self.assertIn("will not click", out["spoken"].lower())
        self.assertNotIn("Chrome", out["spoken"])

    def test_safari_tabs_parses(self) -> None:
        proc = mock.Mock(returncode=0, stdout="Hive | https://evenslouis.ca\nMail | https://mail.google.com\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            out = MOD.safari_tabs()
        self.assertTrue(out["ok"])
        self.assertEqual(len(out["tabs"]), 2)
        self.assertIn("evenslouis.ca", out["spoken"])

    def test_safari_act_open_http(self) -> None:
        proc = mock.Mock(returncode=0, stdout="", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            out = MOD.safari_act("open https://evenslouis.ca in safari")
        self.assertTrue(out["ok"])
        self.assertIn("https://evenslouis.ca", out["spoken"])

    def test_safari_extract_links_uses_js_raw(self) -> None:
        with mock.patch.object(
            MOD,
            "safari_js",
            return_value={"ok": True, "result": "Hive | https://evenslouis.ca\n", "spoken": "ok"},
        ):
            out = MOD.safari_extract_links()
        self.assertTrue(out["ok"])
        self.assertIn("https://evenslouis.ca", out["raw"])
        empty = mock.patch.object(MOD, "safari_js", return_value={"ok": True, "result": "NONE", "spoken": "ok"})
        with empty:
            dark = MOD.safari_extract_links()
        self.assertTrue(dark["unknown"])
        self.assertEqual(dark["raw"], "")

    def test_safari_visible_titles_empty_is_unknown(self) -> None:
        with mock.patch.object(MOD, "safari_js", return_value={"ok": True, "result": "NONE", "spoken": "ok"}):
            out = MOD.safari_visible_titles()
        self.assertTrue(out["unknown"])
        self.assertEqual(out["titles"], [])
        with mock.patch.object(
            MOD,
            "safari_js",
            return_value={"ok": True, "result": "Row from JS\nSecond row", "spoken": "ok"},
        ):
            listed = MOD.safari_visible_titles()
        self.assertEqual(listed["titles"], ["Row from JS", "Second row"])

    def _osascript_script(self, run_mock) -> str:
        argv = run_mock.call_args[0][0]
        self.assertEqual(argv[0], "osascript")
        return argv[2]

    def test_safari_act_open_youtube_hits_youtube_not_face(self) -> None:
        proc = mock.Mock(returncode=0, stdout="", stderr="")
        phrases = (
            "Hi Jarvis open YouTube",
            "open YouTube",
            "go to YouTube",
            "go on YouTube",
            "YouTube",
        )
        with mock.patch.object(MOD, "_run", return_value=proc) as run:
            for phrase in phrases:
                out = MOD.safari_act(phrase)
                self.assertTrue(out["ok"], phrase)
                self.assertEqual(out.get("url"), MOD.YOUTUBE_HOME, phrase)
                self.assertIn(MOD.YOUTUBE_HOME, out["spoken"], phrase)
                self.assertIn("You asked to", out["spoken"], phrase)
                self.assertNotIn("as requested", out["spoken"].lower(), phrase)
                script = self._osascript_script(run)
                self.assertIn(MOD.YOUTUBE_HOME, script, phrase)
                self.assertNotIn("127.0.0.1:4018", script, phrase)
                self.assertNotIn("playlist?list=WL", script, phrase)

    def test_safari_act_watch_later_hits_wl_playlist(self) -> None:
        proc = mock.Mock(returncode=0, stdout="", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc) as run:
            out = MOD.safari_act("what's on my watch later")
        self.assertTrue(out["ok"])
        self.assertEqual(out.get("url"), MOD.WATCH_LATER_URL)
        self.assertIn(MOD.WATCH_LATER_URL, out["spoken"])
        script = self._osascript_script(run)
        self.assertIn("playlist?list=WL", script)
        self.assertNotIn("127.0.0.1:4018", script)
        self.assertNotIn("MrBeast", out["spoken"])
        self.assertNotIn("invent", out["spoken"].lower())

    def test_safari_scroll_keys_sends_page_down(self) -> None:
        proc = mock.Mock(returncode=0, stdout="OK\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc) as run:
            out = MOD.safari_scroll_keys("down")
        script = self._osascript_script(run)
        self.assertIn("key code 121", script)
        self.assertIn("System Events", script)
        self.assertNotIn("do JavaScript", script)
        self.assertEqual(out.get("path"), "keys")
        self.assertTrue(out["ok"])

    def test_safari_act_bare_scroll_uses_cgevent_not_js(self) -> None:
        with mock.patch.object(
            MOD,
            "safari_scroll_cgevent",
            return_value={"ok": True, "path": "cgevent", "spoken": "Safari scrolled down with page keys"},
        ) as hid:
            with mock.patch.object(MOD, "safari_scroll_keys") as keys:
                with mock.patch.object(MOD, "safari_js") as js:
                    with mock.patch.object(
                        MOD,
                        "safari_front",
                        return_value={"ok": True, "title": "YouTube", "url": "https://www.youtube.com/"},
                    ):
                        out = MOD.safari_act("scroll")
        hid.assert_called_once()
        keys.assert_not_called()
        js.assert_not_called()
        self.assertEqual(out.get("path"), "cgevent")
        self.assertIn("You asked to scroll", out["spoken"])
        self.assertIn("scrolled the tab", out["spoken"])
        self.assertNotIn("page keys", out["spoken"])
        self.assertNotIn("cgevent", out["spoken"].lower())
        self.assertNotIn("as requested", out["spoken"].lower())
        self.assertNotIn("https://www.youtube.com/", out["spoken"])

    def test_safari_scroll_js_fallback_when_keys_dark(self) -> None:
        with mock.patch.object(
            MOD,
            "safari_scroll_cgevent",
            return_value={"ok": False, "unknown": True, "path": "cgevent", "spoken": "UNKNOWN. hid dark"},
        ):
            with mock.patch.object(
                MOD,
                "safari_scroll_keys",
                return_value={"ok": False, "unknown": True, "path": "keys", "spoken": "UNKNOWN. keys dark"},
            ):
                with mock.patch.object(
                    MOD,
                    "safari_js",
                    return_value={"ok": True, "wire": "safari", "result": "OK", "spoken": "ok"},
                ) as js:
                    out = MOD.safari_scroll("down")
        js.assert_called_once()
        self.assertIn("scrollBy", js.call_args[0][0])
        self.assertEqual(out.get("path"), "js")
        self.assertIn("scrolled the tab", out["spoken"])
        self.assertNotIn("JavaScript", out["spoken"])
        self.assertNotIn("Apple Events", out["spoken"])

    def test_safari_act_screenshot_and_share_grab_front(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-see-grab-") as tmp:
            hive = Path(tmp)
            dest = hive / "bus" / "see.jpg"
            dest.parent.mkdir()

            def fake_run(argv, timeout=12.0):
                if argv and argv[0] == "screencapture":
                    Path(argv[-1]).write_bytes(b"jpg")
                    return subprocess.CompletedProcess(argv, 0, "", "")
                return subprocess.CompletedProcess(argv, 0, "Front tab\nhttps://example.com\n", "")

            with mock.patch.object(MOD, "_run", side_effect=fake_run) as run:
                shot = MOD.safari_act("screenshot", hive=hive)
                share = MOD.safari_act("share my screen", hive=hive)
            self.assertTrue(shot["ok"])
            self.assertTrue(share["ok"])
            self.assertEqual(shot["safari"]["url"], "https://example.com")
            self.assertTrue(Path(shot["screen"]["path"]).is_file())
            self.assertTrue(Path(share["screen"]["path"]).is_file())
            bins = [c.args[0][0] for c in run.call_args_list]
            self.assertIn("osascript", bins)
            self.assertIn("screencapture", bins)
            self.assertNotIn("127.0.0.1:4018", shot["spoken"])
            self.assertNotIn(str(dest), shot["spoken"])
            self.assertNotIn("as requested", shot["spoken"].lower())
            self.assertIn("grabbed the front tab", shot["spoken"])

    def test_see_block_names_image(self) -> None:
        block = MOD.see_block(
            {
                "safari": {"title": "Hive", "url": "https://evenslouis.ca"},
                "screen": {"path": "/tmp/see.jpg"},
            }
        )
        self.assertIn("Safari only", block)
        self.assertNotIn("Use Chrome", block)
        self.assertIn("https://evenslouis.ca", block)
        self.assertIn("/tmp/see.jpg", block)


if __name__ == "__main__":
    unittest.main()
