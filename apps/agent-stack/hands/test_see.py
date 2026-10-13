#!/usr/bin/env python3
"""Safari/see unit tests. No headed Safari. No Chrome."""
from __future__ import annotations

import importlib.util
import os
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
    def test_safari_window_bounds_parses_safari_box(self) -> None:
        proc = mock.Mock(returncode=0, stdout="40, 40, 1100, 900\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            box = MOD.safari_window_bounds()
        self.assertEqual(box, (40.0, 40.0, 1100.0, 900.0))

    def test_safari_activate_dry_skips_osascript(self) -> None:
        os.environ["AGENT_STACK_DRY_WATCH"] = "1"
        try:
            with mock.patch.object(MOD, "_run") as run:
                out = MOD.safari_activate()
            self.assertTrue(out["ok"])
            self.assertTrue(out.get("dry"))
            run.assert_not_called()
        finally:
            os.environ.pop("AGENT_STACK_DRY_WATCH", None)

    def test_safari_open_rejects_non_http(self) -> None:
        out = MOD.safari_open("file:///etc/passwd")
        self.assertFalse(out["ok"])
        self.assertIn("http", out["spoken"])

    def test_safari_read_timeout_has_safe_speech_and_structured_diagnostic(self) -> None:
        for name, timeout in (("safari_front", 12.0), ("safari_tabs", 8.0)):
            with self.subTest(reader=name):
                error = subprocess.TimeoutExpired(["osascript", "-e", "PRIVATE_COMMAND_BODY"], timeout)
                with mock.patch.object(MOD, "_run", side_effect=error):
                    out = getattr(MOD, name)()
                self.assertFalse(out["ok"])
                self.assertNotIn("PRIVATE_COMMAND_BODY", out["spoken"])
                self.assertNotIn("osascript", out["spoken"])
                self.assertEqual(out["diagnostic"], {"kind": "timeout", "operation": name, "timeout_seconds": timeout})

    def test_current_tab_read_does_not_enumerate_all_tabs(self) -> None:
        for ask, expected in (("Read the current Safari tab URL. Do not navigate.", "front"), ("List Safari tabs", "tabs")):
            with self.subTest(ask=ask), mock.patch.object(MOD, "safari_front", return_value={"ok": True, "url": "https://current.test", "spoken": "Current tab."}) as front, mock.patch.object(MOD, "safari_tabs", return_value={"ok": True, "spoken": "Tabs."}) as tabs:
                MOD.safari_act(ask)
                self.assertEqual(front.call_count, int(expected == "front"))
                self.assertEqual(tabs.call_count, int(expected == "tabs"))

    def test_safari_front_preserves_url_when_title_is_empty(self) -> None:
        proc = mock.Mock(returncode=0, stdout="\nhttps://example.com\n", stderr="")
        with mock.patch.object(MOD, "_run", return_value=proc):
            out = MOD.safari_front()
        self.assertEqual(out["title"], "")
        self.assertEqual(out["url"], "https://example.com")
        self.assertTrue(out["open"])

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
            self.assertNotIn("frame_bounds", out)

    def test_grab_screen_crops_to_bounds(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-see-crop-") as tmp:
            hive = Path(tmp)
            dest = hive / "bus" / "see.jpg"
            dest.parent.mkdir()
            seen: list[list[str]] = []

            def fake_run(argv, timeout=20.0):
                seen.append(list(argv))
                Path(argv[-1]).write_bytes(b"jpg")
                return subprocess.CompletedProcess(argv, 0, "", "")

            with mock.patch.object(MOD, "_run", side_effect=fake_run):
                out = MOD.grab_screen(hive, bounds=(40.0, 40.0, 1100.0, 900.0))
            self.assertTrue(out["ok"])
            self.assertEqual(out.get("frame_bounds"), {"x": 40.0, "y": 40.0, "w": 1060.0, "h": 860.0})
            self.assertIn("-R", seen[0])
            self.assertIn("40,40,1060,860", seen[0])

    def test_map_point_uses_frame_bounds(self) -> None:
        px, py = MOD._map_point(0.5, 0.25, (40.0, 40.0, 1100.0, 900.0))
        self.assertAlmostEqual(px, 570.0)
        self.assertAlmostEqual(py, 255.0)

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
        with mock.patch.object(MOD, "safari_front", return_value={"ok": True, "open": True, "url": "https://evenslouis.ca"}), mock.patch.object(MOD, "_run", return_value=proc):
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
        with mock.patch.object(MOD, "safari_front", return_value={"ok": True, "open": True, "url": "https://www.youtube.com"}), mock.patch.object(MOD, "_run", return_value=proc) as run:
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
        with mock.patch.object(MOD, "safari_front", return_value={"ok": True, "open": True, "url": "https://www.youtube.com/playlist?list=WL"}), mock.patch.object(MOD, "_run", return_value=proc) as run:
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
                        return_value={"ok": True, "title": "YouTube", "url": "https://www.youtube.com"},
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

            with mock.patch.object(MOD, "_run", side_effect=fake_run) as run, mock.patch.object(MOD, "frontmost_app", return_value={"ok": True, "app": "Safari"}), mock.patch.object(MOD, "safari_window_bounds", return_value=(0, 0, 800, 600)):
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

    def test_mac_act_dry_does_not_click(self) -> None:
        os.environ["AGENT_STACK_DRY_MAC"] = "1"
        try:
            click = MOD.mac_act("click", x=0.4, y=0.5)
            typed = MOD.mac_act("type", text="hello")
            scroll = MOD.mac_act("scroll", direction="down")
            stop = MOD.mac_act("stop")
            refuse = MOD.mac_act("type", text="pay this invoice now")
        finally:
            os.environ.pop("AGENT_STACK_DRY_MAC", None)
        self.assertTrue(click.get("dry"))
        self.assertTrue(typed.get("dry"))
        self.assertTrue(scroll.get("dry"))
        self.assertEqual(stop.get("op"), "stop")
        self.assertFalse(refuse.get("ok"))
        self.assertIn("will not send", refuse["spoken"].lower())

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




class SafariNavigationProofTest(unittest.TestCase):
    def test_command_success_without_observed_target_is_not_navigation_success(self):
        with mock.patch.object(MOD, '_run', return_value=subprocess.CompletedProcess([], 0, '', '')), mock.patch.object(MOD, 'safari_front', return_value={'ok': True, 'open': True, 'url': 'https://old.example'}):
            result = MOD.safari_open('https://target.example')
        self.assertFalse(result['ok'])
        self.assertNotIn('Opened in Safari', result['spoken'])
        self.assertEqual(result['verification']['scope'], 'navigation_url')
        self.assertFalse(result['verification']['passed'])

    def test_observed_target_proves_only_navigation_url(self):
        with mock.patch.object(MOD, '_run', return_value=subprocess.CompletedProcess([], 0, '', '')), mock.patch.object(MOD, 'safari_front', return_value={'ok': True, 'open': True, 'url': 'https://target.example'}):
            result = MOD.safari_open('https://target.example')
        self.assertTrue(result['ok'])
        self.assertTrue(result['verification']['passed'])
        self.assertEqual(result['verification']['scope'], 'navigation_url')

    def test_delayed_url_is_reobserved_without_reissuing_navigation(self):
        observations = [{'ok': True, 'open': True, 'url': 'https://old.example'}, {'ok': True, 'open': True, 'url': 'https://target.example'}]
        with mock.patch.object(MOD, '_run', return_value=subprocess.CompletedProcess([], 0, '', '')) as run, mock.patch.object(MOD, 'safari_front', side_effect=observations) as observe:
            result = MOD.safari_open('https://target.example')
        self.assertTrue(result['ok'])
        self.assertEqual(run.call_count, 1)
        self.assertEqual(observe.call_count, 2)

    def test_missing_target_stops_after_bounded_reads_without_reopening(self):
        with mock.patch.object(MOD, '_run', return_value=subprocess.CompletedProcess([], 0, '', '')) as run, mock.patch.object(MOD, 'safari_front', return_value={'ok': True, 'open': True, 'url': 'https://old.example'}) as observe, mock.patch.object(MOD, 'POLL_SEC', 0):
            result = MOD.safari_open('https://target.example')
        self.assertFalse(result['ok'])
        self.assertEqual(run.call_count, 1)
        self.assertEqual(observe.call_count, MOD.MAX_READS)  # bounded reads while the page loads, never a re-open


class SafariDownloadProofTest(unittest.TestCase):
    def test_existing_file_is_not_a_new_download(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            (home / 'Downloads').mkdir()
            (home / 'Downloads/proof.txt').write_text('old')
            with mock.patch.object(MOD.Path, 'home', return_value=home), mock.patch.object(MOD, 'safari_js') as js:
                result = MOD.safari_click('Download', expected_file='proof.txt')
            self.assertFalse(result['ok'])
            js.assert_not_called()

    def test_dispatch_without_file_is_not_success(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp, mock.patch.object(MOD.Path, 'home', return_value=Path(tmp)), mock.patch.object(MOD, 'safari_js', side_effect=[{'ok': True, 'result': '{\"url\":\"https://fixture.test\",\"origin\":123,\"targets\":[]}'}, {'ok': True, 'result': 'OK download'}]), mock.patch.object(MOD.time, 'sleep'):
            result = MOD.safari_click('Download', expected_file='proof.txt')
        self.assertFalse(result['ok'])
        self.assertFalse(result['verification']['passed'])

    def test_new_file_is_observed_after_action(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            (home / 'Downloads').mkdir()
            def action(script):
                if script.startswith('JSON.stringify'):
                    return {'ok': True, 'result': '{"url":"https://fixture.test","origin":123,"targets":[]}'}
                (home / 'Downloads/proof.txt').write_text('new proof')
                return {'ok': True, 'result': 'OK download'}
            with mock.patch.object(MOD.Path, 'home', return_value=home), mock.patch.object(MOD, 'safari_js', side_effect=action), mock.patch.object(MOD.time, 'sleep'):
                result = MOD.safari_click('Download', expected_file='proof.txt')
            self.assertTrue(result['ok'])
            self.assertEqual(result['verification']['scope'], 'download_file_created')
            self.assertEqual(result['verification']['bytes'], 9)


class SafariExactTargetTest(unittest.TestCase):
    def run_page(self, labels, *, changed_url=False, changed_target=False, expired=False, swapped_visibility=False):
        import json
        clicks = []
        calls = []
        def evaluate(script):
            calls.append(script)
            current_labels = labels + ['Another control'] if changed_target and len(calls) > 1 else labels
            harness = "const location={href:'https://fixture.test'};const performance={timeOrigin:123};const clicked=[];const nodes=" + json.dumps(current_labels) + ";const document={querySelectorAll:()=>nodes.map((text,i)=>({innerText:text,value:'',getAttribute:()=>'',disabled:false,getBoundingClientRect:()=>({width:10,height:10}),click:()=>clicked.push(i)}))};const getComputedStyle=()=>({visibility:'visible',display:'block'});"
            if swapped_visibility:
                visible = 0 if len(calls) == 1 else 1
                harness = harness.replace("getAttribute:()=>'',disabled", "getAttribute:()=>'',fixtureIndex:i,disabled")
                harness = harness.replace("const getComputedStyle=()=>({visibility:'visible',display:'block'});",
                    "const getComputedStyle=n=>({visibility:n.fixtureIndex===" + str(visible) + "?'visible':'hidden',display:'block'});")
            if expired and len(calls) > 1:
                harness += "const actualNow=Date.now;Date.now=()=>actualNow()+9000;"
            if changed_url and len(calls) > 1:
                harness += "location.href='https://other.test';"
            proc = subprocess.run(['node', '-e', harness + "const result=" + script + ";console.log(JSON.stringify({result,clicked}));"], capture_output=True, text=True, check=True)
            observed = json.loads(proc.stdout)
            clicks.extend(observed['clicked'])
            return {'ok': True, 'result': observed['result']}
        with mock.patch.object(MOD, 'safari_js', side_effect=evaluate):
            result = MOD.safari_click('Download proof file')
        return result, clicks

    def test_visibility_swap_between_identical_controls_is_stale(self):
        result, clicks = self.run_page(['Download proof file', 'Download proof file'], swapped_visibility=True)
        self.assertEqual(clicks, [])
        self.assertFalse(result['ok'])
        self.assertEqual(result['diagnostic']['kind'], 'stale_observation')

    def test_observation_expiring_before_action_fails_closed(self):
        result, clicks = self.run_page(['Download proof file'], expired=True)
        self.assertFalse(result['ok'])
        self.assertEqual(clicks, [])
        self.assertEqual(result['diagnostic']['kind'], 'stale_observation')

    def test_changed_page_between_observe_and_act_is_rejected(self):
        result, clicks = self.run_page(['Download proof file'], changed_url=True)
        self.assertFalse(result['ok'])
        self.assertEqual(clicks, [])
        self.assertEqual(result['diagnostic']['kind'], 'stale_observation')

    def test_changed_controls_on_same_page_are_rejected(self):
        result, clicks = self.run_page(['Download proof file'], changed_target=True)
        self.assertFalse(result['ok'])
        self.assertEqual(clicks, [])

    def test_similar_target_before_exact_is_not_clicked(self):
        result, clicks = self.run_page(['Download proof file invoice', 'Download proof file'])
        self.assertEqual(clicks, [1])
        self.assertTrue(result['ok'])

    def test_duplicate_exact_target_fails_closed(self):
        result, clicks = self.run_page(['Download proof file', 'Download proof file'])
        self.assertEqual(clicks, [])
        self.assertFalse(result['ok'])

    def test_similar_only_target_fails_closed(self):
        result, clicks = self.run_page(['Download proof file invoice'])
        self.assertEqual(clicks, [])
        self.assertFalse(result['ok'])


class SafariOpenTimeoutProofTest(unittest.TestCase):
    def test_timeout_does_not_leak_command_or_report_success(self):
        with mock.patch.object(MOD, '_run', side_effect=subprocess.TimeoutExpired(['osascript','PRIVATE_COMMAND'], 12)), mock.patch.object(MOD, 'safari_front', return_value={'ok': True, 'open': True, 'url': 'https://old.test'}):
            result = MOD.safari_open('https://target.test')
        self.assertFalse(result['ok'])
        self.assertNotIn('PRIVATE_COMMAND', result['spoken'])
        self.assertNotIn('osascript', result['spoken'])

    def test_timeout_after_navigation_recovers_by_readback_without_reopen(self):
        with mock.patch.object(MOD, '_run', side_effect=subprocess.TimeoutExpired(['osascript'], 12)) as run, mock.patch.object(MOD, 'safari_front', return_value={'ok': True, 'open': True, 'url': 'https://target.test'}):
            result = MOD.safari_open('https://target.test')
        self.assertTrue(result['ok'])
        self.assertEqual(run.call_count, 1)
        self.assertTrue(result['verification']['passed'])


class SafariDownloadHashTest(unittest.TestCase):
    def test_wrong_content_is_not_verified(self):
        import hashlib
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            (home / 'Downloads').mkdir()
            def action(script):
                if script.startswith('JSON.stringify'):
                    return {'ok': True, 'result': '{"url":"https://fixture.test","origin":123,"targets":[]}'}
                (home / 'Downloads/proof.txt').write_bytes(b'wrong content')
                return {'ok': True, 'result': 'OK download'}
            with mock.patch.object(MOD.Path, 'home', return_value=home), mock.patch.object(MOD, 'safari_js', side_effect=action), mock.patch.object(MOD.time, 'sleep'):
                result = MOD.safari_click('Download', expected_file='proof.txt', expected_sha256=hashlib.sha256(b'expected content').hexdigest())
            self.assertFalse(result['ok'])
            self.assertFalse(result['verification']['passed'])

    def test_matching_content_is_verified(self):
        import hashlib
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            (home / 'Downloads').mkdir()
            def action(script):
                if script.startswith('JSON.stringify'):
                    return {'ok': True, 'result': '{"url":"https://fixture.test","origin":123,"targets":[]}'}
                (home / 'Downloads/proof.txt').write_bytes(b'expected content')
                return {'ok': True, 'result': 'OK download'}
            digest = hashlib.sha256(b'expected content').hexdigest()
            with mock.patch.object(MOD.Path, 'home', return_value=home), mock.patch.object(MOD, 'safari_js', side_effect=action), mock.patch.object(MOD.time, 'sleep'):
                result = MOD.safari_click('Download', expected_file='proof.txt', expected_sha256=digest)
            self.assertTrue(result['ok'])
            self.assertEqual(result['verification']['sha256'], digest)


class SafariDelayedDownloadTest(unittest.TestCase):
    def test_three_second_download_is_observed_without_reclick(self):
        import hashlib
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            (home / 'Downloads').mkdir()
            elapsed = [0.0]
            def wait(seconds):
                elapsed[0] += seconds
                if elapsed[0] >= 3 and not (home / 'Downloads/proof.txt').exists():
                    (home / 'Downloads/proof.txt').write_bytes(b'delayed')
            def action(script):
                if script.startswith('JSON.stringify'):
                    return {'ok': True, 'result': '{"url":"https://fixture.test","origin":123,"targets":[]}'}
                return {'ok': True, 'result': 'OK download'}
            with mock.patch.object(MOD.Path, 'home', return_value=home), mock.patch.object(MOD, 'safari_js', side_effect=action) as js, mock.patch.object(MOD.time, 'sleep', side_effect=wait):
                result = MOD.safari_click('Download', expected_file='proof.txt', expected_sha256=hashlib.sha256(b'delayed').hexdigest())
            self.assertTrue(result['ok'])
            self.assertEqual(js.call_count, 2)


class SafariExpectedPageTest(unittest.TestCase):
    def test_changed_active_page_after_navigation_is_not_clicked(self):
        import json
        observation = {'ok': True, 'result': json.dumps({'url': 'https://other.test', 'origin': 123, 'targets': []})}
        with mock.patch.object(MOD, 'safari_js', return_value=observation) as js:
            out = MOD.safari_click('Download', expected_url='https://target.test')
        self.assertFalse(out['ok'])
        self.assertEqual(js.call_count, 1)
        self.assertEqual(out['diagnostic']['kind'], 'stale_page')


class SafariDocumentReadinessTest(unittest.TestCase):
    def test_url_readback_before_document_load_reobserves_without_navigation(self):
        import json
        blank = {'ok': True, 'result': json.dumps({'url': 'about:blank', 'origin': 1, 'targets': []})}
        ready = {'ok': True, 'result': json.dumps({'url': 'https://target.test', 'origin': 2, 'targets': []})}
        with mock.patch.object(MOD, 'safari_js', side_effect=[blank, ready, {'ok': True, 'result': 'OK download'}]) as js, mock.patch.object(MOD, 'safari_front', return_value={'ok': True, 'url': 'https://target.test'}), mock.patch.object(MOD.time, 'sleep'):
            out = MOD.safari_click('Download', expected_url='https://target.test')
        self.assertTrue(out['ok'])
        self.assertEqual(js.call_count, 3)

    def test_readiness_url_timeout_reobserves_before_action(self):
        import json
        blank = {"ok": True, "result": json.dumps({"url": "about:blank", "origin": 1, "targets": []})}
        ready = {"ok": True, "result": json.dumps({"url": "https://target.test", "origin": 2, "targets": []})}
        timed = {"ok": False, "diagnostic": {"kind": "timeout", "operation": "safari_front"}}
        with mock.patch.object(MOD, "safari_js", side_effect=[blank, ready, {"ok": True, "result": "OK download"}]) as js, mock.patch.object(MOD, "safari_front", side_effect=[timed, {"ok": True, "url": "https://target.test"}]) as front, mock.patch.object(MOD.time, "sleep"):
            out = MOD.safari_click("Download", expected_url="https://target.test")
        self.assertTrue(out["ok"])
        self.assertEqual(front.call_count, 2)
        self.assertEqual(js.call_count, 3)

    def test_blank_document_is_not_reported_as_confirmed_page_change(self):
        import json
        blank = {"ok": True, "result": json.dumps({"url": "about:blank", "origin": 1, "targets": []})}
        with mock.patch.object(MOD, "safari_js", return_value=blank) as js, mock.patch.object(MOD, "safari_front", return_value={"ok": False, "diagnostic": {"kind": "timeout"}}), mock.patch.object(MOD.time, "sleep"):
            out = MOD.safari_click("Download", expected_url="https://target.test")
        self.assertFalse(out["ok"])
        self.assertEqual(out["diagnostic"]["kind"], "document_not_ready")
        self.assertFalse(out["diagnostic"]["action_issued"])
        self.assertEqual(js.call_count, 1)

    def test_readiness_does_not_start_observation_after_deadline(self):
        import json
        clock = [0.0]
        blank = {"ok": True, "result": json.dumps({"url": "about:blank", "origin": 1, "targets": []})}
        def reach_deadline(_):
            clock[0] = 2.0
        with mock.patch.object(MOD, "safari_js", return_value=blank) as js, mock.patch.object(MOD, "safari_front", return_value={"ok": True, "url": "https://target.test"}), mock.patch.object(MOD.time, "sleep", side_effect=reach_deadline), mock.patch.object(MOD.time, "monotonic", side_effect=lambda: clock[0]):
            out = MOD.safari_click("Download", expected_url="https://target.test")
        self.assertFalse(out["ok"])
        self.assertEqual(js.call_count, 1, "deadline must prevent a new page observation")

    def test_changed_tab_during_document_wait_stops(self):
        import json
        blank = {'ok': True, 'result': json.dumps({'url': 'about:blank', 'origin': 1, 'targets': []})}
        with mock.patch.object(MOD, 'safari_js', return_value=blank) as js, mock.patch.object(MOD, 'safari_front', return_value={'ok': True, 'url': 'https://other.test'}):
            out = MOD.safari_click('Download', expected_url='https://target.test')
        self.assertFalse(out['ok'])
        self.assertEqual(js.call_count, 1)


class SafariCancellationTest(unittest.TestCase):
    def test_cancel_after_observation_prevents_click(self):
        import json
        observed = {'ok': True, 'result': json.dumps({'url': 'https://target.test', 'origin': 123, 'targets': []})}
        checks = iter([False, True])
        with mock.patch.object(MOD, 'safari_js', return_value=observed) as js:
            out = MOD.safari_click('Download', cancelled=lambda: next(checks))
        self.assertFalse(out['ok'])
        self.assertEqual(js.call_count, 1)
        self.assertFalse(out['diagnostic']['action_issued'])

    def test_cancelled_before_observation_does_nothing(self):
        with mock.patch.object(MOD, 'safari_js') as js:
            out = MOD.safari_click('Download', cancelled=lambda: True)
        self.assertFalse(out['ok'])
        js.assert_not_called()


class SafariCancellationAfterDispatchTest(unittest.TestCase):
    def test_stop_during_file_wait_does_not_claim_no_action_or_success(self):
        import json
        checks = iter([False, False, True])
        observed = {'ok': True, 'result': json.dumps({'url': 'https://target.test', 'origin': 123, 'targets': []})}
        with tempfile.TemporaryDirectory() as tmp, mock.patch.object(MOD.Path, 'home', return_value=Path(tmp)), mock.patch.object(MOD, 'safari_js', side_effect=[observed, {'ok': True, 'result': 'OK download'}]) as js:
            out = MOD.safari_click('Download', expected_file='proof.txt', cancelled=lambda: next(checks))
        self.assertFalse(out['ok'])
        self.assertTrue(out['diagnostic']['action_issued'])
        self.assertEqual(js.call_count, 2)
        self.assertIn('may still finish', out['spoken'])

class SafariMissingTargetReceiptTest(unittest.TestCase):
    def test_missing_target_retains_fresh_observation_and_no_action(self):
        import json
        observed = {'ok': True, 'result': json.dumps({'url': 'https://target.test', 'origin': 123, 'targets': []})}
        with mock.patch.object(MOD, 'safari_js', side_effect=[observed, {'ok': True, 'result': 'NONE'}]) as js:
            result = MOD.safari_click('Download', expected_url='https://target.test')
        self.assertFalse(result['ok'])
        self.assertEqual(result['diagnostic'], {'kind': 'missing_target', 'action_issued': False})
        self.assertEqual(result['observation']['url'], 'https://target.test')
        self.assertEqual(result['observation']['document_origin'], 123)
        self.assertEqual(js.call_count, 2)

class SafariJavaScriptTransportTest(unittest.TestCase):
    def test_page_none_result_is_not_no_window(self):
        with mock.patch.object(MOD, '_run', return_value=subprocess.CompletedProcess([], 0, 'NONE\n', '')):
            result = MOD.safari_js("'NONE'")
        self.assertTrue(result['ok'])
        self.assertEqual(result['result'], 'NONE')
    def test_no_window_is_a_distinct_transport_result(self):
        with mock.patch.object(MOD, '_run', return_value=subprocess.CompletedProcess([], 0, '__JARVIS_NO_SAFARI_WINDOW__\n', '')) as run:
            result = MOD.safari_js("'NONE'")
        self.assertFalse(result['ok'])
        self.assertIn('__JARVIS_NO_SAFARI_WINDOW__', run.call_args[0][0][-1])

class SafariJavaScriptFailureTruthTest(unittest.TestCase):
    def test_timeout_preserves_unknown_outcome_without_leaking_command(self):
        error = subprocess.TimeoutExpired(['osascript', '-e', 'PRIVATE_COMMAND_BODY'], 8)
        with mock.patch.object(MOD, '_run', side_effect=error):
            result = MOD.safari_js("document.querySelector('button').click()")
        self.assertFalse(result['ok'])
        self.assertNotIn('PRIVATE_COMMAND_BODY', str(result))
        self.assertEqual(result['diagnostic'], {'kind': 'timeout', 'operation': 'safari_js', 'timeout_seconds': 8, 'action_outcome': 'unknown'})
    def test_os_error_has_safe_structured_diagnostic(self):
        with mock.patch.object(MOD, '_run', side_effect=OSError(5, 'PRIVATE_COMMAND_BODY')):
            result = MOD.safari_js("'NONE'")
        self.assertFalse(result['ok'])
        self.assertNotIn('PRIVATE_COMMAND_BODY', str(result))
        self.assertEqual(result['diagnostic']['errno'], 5)
    def test_script_failure_does_not_leak_raw_stderr(self):
        with mock.patch.object(MOD, '_run', return_value=subprocess.CompletedProcess([], 1, '', 'PRIVATE_COMMAND_BODY')):
            result = MOD.safari_js("'NONE'")
        self.assertFalse(result['ok'])
        self.assertNotIn('PRIVATE_COMMAND_BODY', str(result))
        self.assertEqual(result['diagnostic']['exit_code'], 1)

class MacTypeUncertainTest(unittest.TestCase):
    def test_timeout_cannot_prove_no_keystrokes(self):
        with mock.patch.object(MOD, "_dry_mac", return_value=False), mock.patch.object(MOD, "_run", side_effect=subprocess.TimeoutExpired("osascript", 6)):
            result = MOD.mac_type("unique text")
        self.assertFalse(result["ok"])
        self.assertTrue(result["execution_uncertain"])

class DesktopCaptureOwnershipTest(unittest.TestCase):
    def test_background_safari_does_not_define_foreground_capture(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive = Path(tmp)
            image = hive / "screen.jpg"
            image.write_bytes(b"fixture image")
            with mock.patch.object(MOD, "desktop_capture_bounds", return_value=(-1200, -900, 1920, 1080)), mock.patch.object(MOD, "safari_front", return_value={"ok": True, "open": True, "title": "Background Safari", "url": "https://background.example"}), mock.patch.object(MOD, "frontmost_app", return_value={"ok": True, "app": "Calculator"}), mock.patch.object(MOD, "safari_window_bounds", return_value=(10, 10, 800, 600)) as bounds, mock.patch.object(MOD, "grab_screen", return_value={"ok": True, "path": str(image), "bytes": 13}) as capture:
                result = MOD.snapshot(hive=hive, grab=True)
            capture.assert_called_once_with(hive, bounds=(-1200, -900, 1920, 1080))
            bounds.assert_not_called()
            self.assertEqual(result["state"]["app"], "Calculator")
            self.assertEqual(result["state"]["url"], "")
            self.assertEqual(result["state"]["title"], "")

class ScreenshotCoordinateTest(unittest.TestCase):
    def test_top_left_and_offset_display_are_not_vertically_mirrored(self):
        bounds = (-1200., -900., 0., 0.)
        self.assertEqual(MOD._map_point(0., 0., bounds), (-1200., -900.))
        self.assertEqual(MOD._map_point(.25, .75, bounds), (-900., -225.))

class MissingCaptureGeometryTest(unittest.TestCase):
    def test_click_without_capture_geometry_never_loads_mouse_driver(self):
        with mock.patch.object(MOD, "_dry_mac", return_value=False), mock.patch.object(MOD, "_frame_bounds_from_hive", return_value=None), mock.patch.object(MOD.ctypes, "CDLL", side_effect=AssertionError("mouse driver loaded without capture geometry")):
            result = MOD.mac_click(.3, .7)
        self.assertFalse(result["ok"])
        self.assertEqual(result["reason"], "missing_capture_geometry")

class InvalidMouseCoordinateTest(unittest.TestCase):
    def test_nonfinite_geometry_and_out_of_frame_targets_never_dispatch(self):
        cases = [(float("nan"), .5, {"x": 0, "y": 0, "w": 800, "h": 600}),
                 (1.2, .5, {"x": 0, "y": 0, "w": 800, "h": 600}),
                 (.5, .5, {"x": float("inf"), "y": 0, "w": 800, "h": 600})]
        for x, y, bounds in cases:
            with self.subTest(x=x, bounds=bounds), mock.patch.object(MOD, "_dry_mac", return_value=False), mock.patch.object(MOD.ctypes, "CDLL", side_effect=AssertionError("invalid target reached driver")):
                result = MOD.mac_click(x, y, frame_bounds=bounds)
                self.assertFalse(result["ok"])
                self.assertFalse(result["action_issued"])

class NativeInputEmissionFenceTest(unittest.TestCase):
    def test_click_revoked_during_event_preparation_releases_without_posting(self):
        lib = mock.Mock()
        lib.CGEventCreateMouseEvent.side_effect = [11,12]
        with mock.patch.object(MOD,'_dry_mac',return_value=False), mock.patch.object(MOD,'BEFORE_HID',None), mock.patch.object(MOD,'_mac_act_proven',side_effect=[True,True,False]), mock.patch.object(MOD.ctypes,'CDLL',return_value=lib):
            result = MOD.mac_click(.2,.3,hive=Path('/temporary-fixture'),gen=1,
                                   frame_bounds={'x':0,'y':0,'w':800,'h':600})
        self.assertFalse(result['ok'],result)
        lib.CGEventPost.assert_not_called()
        self.assertEqual(lib.CFRelease.call_count,2)

    def test_typing_revoked_before_subprocess_dispatch_never_launches(self):
        with mock.patch.object(MOD,'_dry_mac',return_value=False), mock.patch.object(MOD,'BEFORE_HID',None), mock.patch.object(MOD,'_mac_act_proven',side_effect=[True,False]), mock.patch.object(MOD,'_run') as run:
            result = MOD.mac_type('bounded fixture',hive=Path('/temporary-fixture'),gen=1)
        self.assertFalse(result['ok'],result)
        run.assert_not_called()

    def test_scroll_revoked_during_event_preparation_releases_without_posting(self):
        lib=mock.Mock()
        lib.CGEventSourceCreate.return_value=10
        lib.CGEventCreateKeyboardEvent.side_effect=[11,12]
        result=MOD._cgevent_page_keys(lib,MOD.VK_PAGE_DOWN,'down',gate=lambda:False)
        self.assertFalse(result['ok'],result)
        lib.CGEventPost.assert_not_called()
        self.assertEqual(lib.CFRelease.call_count,3)

class ContextlessNativeInputTest(unittest.TestCase):
    def test_contextless_calls_cannot_emit_native_input_even_with_a_true_callback(self):
        for operation in ('click','type','scroll'):
            for callback in (None,lambda:True):
                with self.subTest(operation=operation,callback=callback is not None):
                    lib=mock.Mock()
                    lib.CGEventCreateMouseEvent.side_effect=[11,12]
                    lib.CGEventSourceCreate.return_value=10
                    lib.CGEventCreateKeyboardEvent.side_effect=[11,12]
                    proc=subprocess.CompletedProcess(['fixture'],0,'','')
                    with mock.patch.object(MOD,'_dry_mac',return_value=False), mock.patch.object(MOD,'BEFORE_HID',None), mock.patch.object(MOD.ctypes,'CDLL',return_value=lib), mock.patch.object(MOD,'_run',return_value=proc) as run:
                        result=MOD.mac_act(operation,x=.2,y=.3,text='bounded fixture',gate=callback,
                            frame_bounds={'x':0,'y':0,'w':800,'h':600})
                    self.assertFalse(result['ok'],result)
                    lib.CGEventPost.assert_not_called()
                    run.assert_not_called()

    def test_partial_context_cannot_emit_native_input(self):
        for kwargs in ({'hive':Path('/temporary-fixture')},{'gen':1}):
            with self.subTest(kwargs=kwargs),mock.patch.object(MOD,'_dry_mac',return_value=False),mock.patch.object(MOD,'_run') as run:
                result=MOD.mac_act('type',text='bounded fixture',**kwargs)
            self.assertFalse(result['ok'],result)
            run.assert_not_called()

class ExactTypingPayloadTest(unittest.TestCase):
    def test_requested_text_reaches_transport_unchanged_as_data(self):
        for body in ('  preserve both ends  ', 'x'*300+'-END', 'Évens — 한글 🍁', 'quote " slash \\ literal $(command)', '   '):
            with self.subTest(body=body):
                proc=subprocess.CompletedProcess(['fixture'],0,'','')
                with mock.patch.object(MOD,'_dry_mac',return_value=False), mock.patch.object(MOD,'_run',return_value=proc) as run:
                    result=MOD.mac_type(body)
                self.assertTrue(result['ok'],result)
                argv=run.call_args.args[0]
                self.assertEqual(argv[-1],body)
                self.assertIn('item 1 of argv',argv[2])
                self.assertNotIn(body,argv[2])
                self.assertFalse(result.get('task_verified',True),result)
                self.assertEqual(result['verification']['scope'],'input_dispatch')

    def test_text_that_cannot_be_an_argv_value_is_rejected_without_dispatch(self):
        with mock.patch.object(MOD,'_dry_mac',return_value=False),mock.patch.object(MOD,'_run') as run:
            result=MOD.mac_type('left\x00right')
        self.assertFalse(result['ok'],result)
        run.assert_not_called()

class NativeForegroundBindingTest(unittest.TestCase):
    def setUp(self):
        reader=mock.patch.object(MOD,'read_focused_text',return_value={'value':'AB','selection':{'location':1,'length':0}})
        reader.start();self.addCleanup(reader.stop)

    def test_foreground_mismatch_or_unavailable_blocks_reserved_input(self):
        import json
        for foreground in ({"ok":True,"app":"Notes"},{"ok":False,"app":""},{"ok":True,"app":""}):
            with self.subTest(foreground=foreground), tempfile.TemporaryDirectory() as tmp:
                hive=Path(tmp);(hive/'bus').mkdir()
                (hive/'bus'/'state.json').write_text(json.dumps({"turn_gen":1,"watch":{"armed":True,"allow":["Safari","Notes"],"ledger":{"fixture":{"phase":"reserved","gen":1,"app":"Safari","text_binding":{"value_sha256":"38164fbd17603d73f696b8b4d72664d735bb6a7c88577687fd2ae33fd6964153","selection":{"location":1,"length":0}},"focus":{"pid":41,"window":"window-1","element":"field-1","role":"AXTextField"},"command_sha256":MOD._watch_policy().command_fingerprint({"op":"type","text":"bounded fixture"})}}}}))
                with mock.patch.object(MOD,'_dry_mac',return_value=False),mock.patch.object(MOD,'frontmost_app',return_value=foreground),mock.patch.object(MOD,'_type_into_focused_field') as run:
                    out=MOD.mac_act('type',text='bounded fixture',hive=hive,gen=1)
                self.assertFalse(out['ok'],out)
                run.assert_not_called()

    def test_matching_foreground_preserves_authorized_typing(self):
        import json
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);(hive/'bus').mkdir()
            (hive/'bus'/'state.json').write_text(json.dumps({"turn_gen":1,"watch":{"armed":True,"allow":["Safari"],"ledger":{"fixture":{"phase":"reserved","gen":1,"app":"Safari","text_binding":{"value_sha256":"38164fbd17603d73f696b8b4d72664d735bb6a7c88577687fd2ae33fd6964153","selection":{"location":1,"length":0}},"focus":{"pid":41,"window":"window-1","element":"field-1","role":"AXTextField"},"command_sha256":MOD._watch_policy().command_fingerprint({"op":"type","text":"bounded fixture"})}}}}))
            with mock.patch.object(MOD,'_dry_mac',return_value=False),mock.patch.object(MOD,'frontmost_app',return_value={"ok":True,"app":"Safari","text_binding":{"value_sha256":"38164fbd17603d73f696b8b4d72664d735bb6a7c88577687fd2ae33fd6964153","selection":{"location":1,"length":0}},"focus":{"pid":41,"window":"window-1","element":"field-1","role":"AXTextField"}}),mock.patch.object(MOD,'_type_into_focused_field',return_value={'ok':True,'task_verified':False}) as run:
                out=MOD.mac_act('type',text='bounded fixture',hive=hive,gen=1)
            self.assertTrue(out['ok'],out)
            self.assertEqual(run.call_count,1)

    def test_foreground_change_at_final_typing_fence_blocks_dispatch(self):
        import json
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);(hive/'bus').mkdir()
            (hive/'bus'/'state.json').write_text(json.dumps({"turn_gen":1,"watch":{"armed":True,"allow":["Safari","Notes"],"ledger":{"fixture":{"phase":"reserved","gen":1,"app":"Safari","text_binding":{"value_sha256":"38164fbd17603d73f696b8b4d72664d735bb6a7c88577687fd2ae33fd6964153","selection":{"location":1,"length":0}},"focus":{"pid":41,"window":"window-1","element":"field-1","role":"AXTextField"},"command_sha256":MOD._watch_policy().command_fingerprint({"op":"type","text":"bounded fixture"})}}}}))
            with mock.patch.object(MOD,'_dry_mac',return_value=False),mock.patch.object(MOD,'frontmost_app',side_effect=[{"ok":True,"app":"Safari","text_binding":{"value_sha256":"38164fbd17603d73f696b8b4d72664d735bb6a7c88577687fd2ae33fd6964153","selection":{"location":1,"length":0}},"focus":{"pid":41,"window":"window-1","element":"field-1","role":"AXTextField"}},{"ok":True,"app":"Safari","text_binding":{"value_sha256":"38164fbd17603d73f696b8b4d72664d735bb6a7c88577687fd2ae33fd6964153","selection":{"location":1,"length":0}},"focus":{"pid":41,"window":"window-1","element":"field-1","role":"AXTextField"}},{"ok":True,"app":"Notes"}]),mock.patch.object(MOD,'BEFORE_HID',None),mock.patch.object(MOD,'_type_into_focused_field') as run:
                out=MOD.mac_act('type',text='bounded fixture',hive=hive,gen=1)
            self.assertFalse(out['ok'],out)
            run.assert_not_called()

class DesktopObservationValidityTest(unittest.TestCase):
    def capture(self, hive, *, safari_ok=False, app="Calculator", app_ok=True, screen_kind="valid", foreground_after=None):
        image=hive/'capture.jpg'
        if screen_kind=="valid":image.write_bytes(b"image fixture")
        elif screen_kind=="empty":image.write_bytes(b"")
        screen={"ok":True,"path":str(image),"frame_bounds":{"x":0,"y":0,"w":800,"h":600}}
        if screen_kind=="no_path":screen.pop("path")
        if screen_kind=="failed":screen['ok']=False
        apps=[{"ok":app_ok,"app":app},{"ok":True,"app":foreground_after or app}]
        with mock.patch.object(MOD,'safari_front',return_value={"ok":safari_ok,"open":safari_ok,"title":"Safari","url":"https://fixture.test"}),mock.patch.object(MOD,'frontmost_app',side_effect=apps),mock.patch.object(MOD,'desktop_capture_bounds',return_value=(0,0,800,600)),mock.patch.object(MOD,'safari_window_bounds',return_value=(0,0,800,600)),mock.patch.object(MOD,'grab_screen',return_value=screen) as grab:
            return MOD.snapshot(hive=hive,grab=True),grab.call_count

    def test_other_app_capture_does_not_depend_on_safari_health(self):
        with tempfile.TemporaryDirectory() as tmp:
            out,_=self.capture(Path(tmp))
        self.assertTrue(out['ok'],out)
        self.assertEqual(out['state']['app'],'Calculator')
        self.assertEqual(out['state']['url'],'')

    def test_missing_failed_or_empty_capture_cannot_bind_action_frame(self):
        for kind in ('missing','empty','no_path','failed'):
            with self.subTest(kind=kind),tempfile.TemporaryDirectory() as tmp:
                out,_=self.capture(Path(tmp),safari_ok=True,screen_kind=kind)
            self.assertFalse(out['ok'],out)
            self.assertFalse(out['frame_id'],out)

    def test_unknown_or_failed_foreground_does_not_capture_an_action_frame(self):
        for app,ok in (('',True),('Calculator',False)):
            with self.subTest(app=app,ok=ok),tempfile.TemporaryDirectory() as tmp:
                out,calls=self.capture(Path(tmp),safari_ok=True,app=app,app_ok=ok)
            self.assertFalse(out['ok'],out)
            self.assertFalse(out['frame_id'],out)
            self.assertEqual(calls,0)

    def test_focus_changed_during_capture_invalidates_frame(self):
        with tempfile.TemporaryDirectory() as tmp:
            out,_=self.capture(Path(tmp),safari_ok=True,foreground_after='Notes')
        self.assertFalse(out['ok'],out)
        self.assertFalse(out['frame_id'],out)

    def test_foreground_safari_still_requires_safari_observation(self):
        with tempfile.TemporaryDirectory() as tmp:
            out,_=self.capture(Path(tmp),app='Safari')
        self.assertFalse(out['ok'],out)


class NativeAXIdentityTest(unittest.TestCase):
    def test_equal_native_objects_share_identity_and_different_objects_do_not(self):
        import threading
        lib=mock.Mock();lib.CFRetain.side_effect=lambda ref:ref
        lib.CFEqual.side_effect=lambda a,b:(a//10)==(b//10)
        with mock.patch.object(threading,'_jarvis_ax_focus_refs',[],create=True):
            first=MOD._ax_identity(lib,11,41,'window')
            same=MOD._ax_identity(lib,12,41,'window')
            other=MOD._ax_identity(lib,21,41,'window')
            restarted=MOD._ax_identity(lib,11,42,'window')
            field=MOD._ax_identity(lib,11,41,'element')
        self.assertEqual(first,same);self.assertEqual(len({first,other,restarted,field}),4)
        self.assertNotEqual(first,str(11));self.assertEqual(lib.CFRetain.call_count,4)

    def test_expired_identity_is_released_and_cannot_be_reused(self):
        import threading
        lib=mock.Mock();lib.CFRetain.side_effect=lambda ref:ref;lib.CFEqual.return_value=True
        with mock.patch.object(threading,'_jarvis_ax_focus_refs',[],create=True),mock.patch.object(MOD.time,'monotonic',side_effect=[0,MOD._AX_FOCUS_TTL+1]):
            first=MOD._ax_identity(lib,11,41,'window');second=MOD._ax_identity(lib,11,41,'window')
        self.assertNotEqual(first,second);lib.CFRelease.assert_called_once_with(11)

    def test_identity_cache_is_bounded_and_releases_evicted_refs(self):
        import threading
        lib=mock.Mock();lib.CFRetain.side_effect=lambda ref:ref;lib.CFEqual.return_value=False
        with mock.patch.object(threading,'_jarvis_ax_focus_refs',[],create=True),mock.patch.object(MOD,'_AX_FOCUS_LIMIT',2):
            for ref in (11,21,31):MOD._ax_identity(lib,ref,41,'window')
            self.assertEqual(len(threading._jarvis_ax_focus_refs),2)
        lib.CFRelease.assert_called_once_with(11)

    def test_native_focus_rejects_wrong_process_and_releases_resources(self):
        import ctypes
        lib=mock.Mock();lib.AXUIElementCreateSystemWide.return_value=1;lib.AXUIElementSetMessagingTimeout.return_value=0
        def pid(element,dest):ctypes.cast(dest,ctypes.POINTER(ctypes.c_int))[0]=42;return 0
        lib.AXUIElementGetPid.side_effect=pid
        with mock.patch.object(MOD,'_ax_library',return_value=lib),mock.patch.object(MOD,'_ax_copy',return_value=2):result=MOD._native_focus(41)
        self.assertEqual(result,{});self.assertEqual(lib.CFRelease.call_args_list,[mock.call(2),mock.call(1)])

    def test_native_focus_denies_missing_window_or_unresponsive_ax(self):
        import ctypes
        for copies in ((2,None),(None,)):
            lib=mock.Mock();lib.AXUIElementCreateSystemWide.return_value=1;lib.AXUIElementSetMessagingTimeout.return_value=0
            def pid(element,dest):ctypes.cast(dest,ctypes.POINTER(ctypes.c_int))[0]=41;return 0
            lib.AXUIElementGetPid.side_effect=pid
            with mock.patch.object(MOD,'_ax_library',return_value=lib),mock.patch.object(MOD,'_ax_copy',side_effect=copies):self.assertEqual(MOD._native_focus(41),{})
            self.assertIn(mock.call(1),lib.CFRelease.call_args_list)

    def test_frontmost_process_parse_binds_native_focus_pid(self):
        proc=subprocess.CompletedProcess([],0,'Safari\n41\n','')
        focus={'pid':41,'window':'window-1','element':'field-1','role':'AXTextField'}
        with mock.patch.object(MOD,'_run',return_value=proc),mock.patch.object(MOD,'_native_focus',return_value=focus) as native:
            result=MOD.frontmost_app()
        self.assertEqual(result['focus'],focus);native.assert_called_once_with(41)

    def test_capture_invalidates_same_app_window_change(self):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);image=hive/'capture.jpg';image.write_bytes(b'fixture')
            before={'ok':True,'app':'Calculator','focus':{'pid':41,'window':'window-1','element':''}}
            after={**before,'focus':{**before['focus'],'window':'window-2'}}
            with mock.patch.object(MOD,'safari_front',return_value={'ok':False}),mock.patch.object(MOD,'frontmost_app',side_effect=[before,after]),mock.patch.object(MOD,'desktop_capture_bounds',return_value=(0,0,800,600)),mock.patch.object(MOD,'grab_screen',return_value={'ok':True,'path':str(image)}):
                result=MOD.snapshot(hive=hive,grab=True)
            self.assertFalse(result['ok']);self.assertFalse(result['frame_id'])

    def test_native_focus_reads_exact_window_field_and_role(self):
        import ctypes
        lib=mock.Mock();lib.AXUIElementCreateSystemWide.return_value=1;lib.AXUIElementSetMessagingTimeout.return_value=0;lib.AXUIElementGetTypeID.return_value=7;lib.CFStringGetTypeID.return_value=9
        lib.CFGetTypeID.side_effect=lambda ref:9 if ref==6 else 7;lib.CFEqual.return_value=True
        def pid(element,dest):ctypes.cast(dest,ctypes.POINTER(ctypes.c_int))[0]=41;return 0
        lib.AXUIElementGetPid.side_effect=pid
        def string(value,buffer,length,encoding):buffer.value=b'AXTextField';return True
        lib.CFStringGetCString.side_effect=string
        with mock.patch.object(MOD,'_ax_library',return_value=lib),mock.patch.object(MOD,'_ax_copy',side_effect=[2,3,4,5,6,None]),mock.patch.object(MOD,'_ax_identity',side_effect=['window-id','field-id']) as identity:
            result=MOD._native_focus(41)
        self.assertEqual(result,{'pid':41,'window':'window-id','element':'field-id','role':'AXTextField'})
        self.assertEqual(identity.call_args_list,[mock.call(lib,3,41,'window'),mock.call(lib,4,41,'element')])
        self.assertEqual(lib.CFRelease.call_args_list,[mock.call(i) for i in (6,5,4,3,2,1)])

class LiteralNativeEntryTest(unittest.TestCase):
    def _fixture(self, body, *, settable=True, final_focus=True, final_permission=True, code=0, public=False, changed_value=False):
        import threading,time,ctypes
        lib=mock.Mock();lib.CFRetain.side_effect=lambda ref:ref
        lib.CFStringCreateWithCString.return_value=81;lib.CFStringCreateWithCharacters.return_value=82
        def editable(ref,key,dest):ctypes.cast(dest,ctypes.POINTER(ctypes.c_bool))[0]=settable;return 0
        lib.AXUIElementIsAttributeSettable.side_effect=editable;lib.AXUIElementSetAttributeValue.return_value=code
        focus={'pid':41,'window':'window-1','element':'field-1','role':'AXTextField'}
        old={'ok':True,'app':'Safari','focus':focus};changed={**old,'focus':{**focus,'element':'field-2'}}
        rows=[{'id':'field-1','ref':71,'lib':lib,'pid':41,'kind':'element','seen':time.monotonic()}]
        with mock.patch.object(threading,'_jarvis_ax_focus_refs',rows,create=True),mock.patch.object(MOD,'frontmost_app',side_effect=[old,old if final_focus else changed]),mock.patch.object(MOD,'_mac_act_proven',return_value=final_permission),mock.patch.object(MOD,'_run') as run,mock.patch.object(MOD,'_dry_mac',return_value=False),mock.patch.object(MOD,'BEFORE_HID',None),mock.patch.object(MOD,'read_focused_text',side_effect=[{'value':'AB','selection':{'location':1,'length':0}}, {'value':'edited' if changed_value else 'AB','selection':{'location':1,'length':0}}]):
            result=(MOD.mac_type if public else MOD._type_into_focused_field)(body,hive=Path('/fixture'),gen=1,gate=lambda:True)
        run.assert_not_called()
        return result,lib

    def test_literal_unicode_multiline_entry_sets_text_without_keystrokes(self):
        import ctypes
        body='  Ω 😀 ; "literal"\nline two\t '
        result,lib=self._fixture(body,public=True)
        self.assertTrue(result['ok']);self.assertFalse(result['task_verified']);self.assertFalse(result['submitted'])
        args=lib.CFStringCreateWithCharacters.call_args.args
        encoded=bytes(ctypes.cast(args[1],ctypes.POINTER(ctypes.c_uint16 * args[2])).contents)
        self.assertEqual(encoded.decode('utf-16-le'),'A'+body+'B')
        self.assertEqual(lib.CFStringCreateWithCString.call_args.args[1],b'AXValue')
        lib.AXUIElementSetAttributeValue.assert_called_once_with(71,81,82)
        self.assertIn(mock.call(71),lib.CFRelease.call_args_list)

    def test_unsupported_or_revoked_or_changed_field_never_mutates(self):
        for kwargs in ({'settable':False},{'final_focus':False},{'final_permission':False},{'changed_value':True}):
            with self.subTest(kwargs=kwargs):
                result,lib=self._fixture('literal',**kwargs)
                self.assertFalse(result['ok']);self.assertFalse(result.get('execution_uncertain',False))
                lib.AXUIElementSetAttributeValue.assert_not_called()

    def test_native_setter_error_is_uncertain_and_never_replayed(self):
        result,lib=self._fixture('literal',code=-25204)
        self.assertFalse(result['ok']);self.assertTrue(result['execution_uncertain'])
        lib.AXUIElementSetAttributeValue.assert_called_once()

    def test_missing_identity_lease_does_not_fallback_to_keys(self):
        import threading
        with mock.patch.object(threading,'_jarvis_ax_focus_refs',[],create=True),mock.patch.object(MOD,'frontmost_app',return_value={'ok':True,'focus':{'pid':41,'element':'missing'}}),mock.patch.object(MOD,'_run') as run:
            result=MOD._type_into_focused_field('literal',hive=Path('/fixture'),gen=1,gate=lambda:True)
        run.assert_not_called();self.assertFalse(result['ok'])


class NativeTextRereadTest(unittest.TestCase):
    def test_reread_decodes_full_utf16_value_and_selection_and_releases_refs(self):
        import threading,time,ctypes
        value='A😀Ω\nB';encoded=value.encode('utf-16-le');units=len(encoded)//2
        lib=mock.Mock();lib.CFRetain.side_effect=lambda ref:ref
        lib.CFGetTypeID.side_effect=lambda ref:9 if ref==81 else 10
        lib.CFStringGetTypeID.return_value=9;lib.AXValueGetTypeID.return_value=10;lib.AXValueGetType.return_value=4;lib.CFStringGetLength.return_value=units
        def characters(ref,span,buffer):
            source=(ctypes.c_uint16*units).from_buffer_copy(encoded)
            for i in range(units):buffer[i]=source[i]
        lib.CFStringGetCharacters.side_effect=characters
        def selected(ref,kind,dest):
            span=ctypes.cast(dest,ctypes.POINTER(MOD._CFRange))[0];span.location=1;span.length=2;return True
        lib.AXValueGetValue.side_effect=selected
        row={'id':'field-id','ref':71,'lib':lib,'pid':41,'kind':'element','seen':time.monotonic()}
        with mock.patch.object(threading,'_jarvis_ax_focus_refs',[row],create=True),mock.patch.object(MOD,'_ax_copy',side_effect=[81,82]):
            result=MOD.read_focused_text({'pid':41,'element':'field-id','role':'AXTextArea'})
        self.assertEqual(result,{'value':value,'selection':{'location':1,'length':2}})
        self.assertEqual(lib.CFRelease.call_args_list,[mock.call(82),mock.call(81),mock.call(71)])
        self.assertEqual(lib.CFStringGetCharacters.argtypes[1],MOD._CFRange)

    def test_secure_field_is_not_read_as_plain_text(self):
        with mock.patch.object(MOD,'_borrow_ax_field') as borrow:
            self.assertIsNone(MOD.read_focused_text({'pid':41,'element':'field-id','role':'AXSecureTextField'}))
        borrow.assert_not_called()


class TextCaptureBindingTest(unittest.TestCase):
    def _capture(self,before,after):
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);image=hive/'capture.jpg';image.write_bytes(b'identical image')
            app={'ok':True,'app':'Calculator','focus':{'pid':41,'window':'window-1','element':'field-1','role':'AXTextArea'}}
            with mock.patch.object(MOD,'safari_front',return_value={'ok':False}),mock.patch.object(MOD,'frontmost_app',return_value=app),mock.patch.object(MOD,'desktop_capture_bounds',return_value=(0,0,800,600)),mock.patch.object(MOD,'read_focused_text',side_effect=[before,after]),mock.patch.object(MOD,'grab_screen',return_value={'ok':True,'path':str(image)}):
                return MOD.snapshot(hive=hive,grab=True)

    def test_field_change_during_capture_invalidates_action_frame(self):
        before={'value':'PRIVATE field','selection':{'location':0,'length':0}}
        for after in ({'value':'edited','selection':{'location':0,'length':0}}, {'value':'PRIVATE field','selection':{'location':1,'length':0}},None):
            with self.subTest(after=after):
                result=self._capture(before,after)
                self.assertFalse(result['ok']);self.assertFalse(result['frame_id']);self.assertEqual(result['diagnostic']['kind'],'field_changed')

    def test_observation_keeps_hash_and_selection_without_raw_value(self):
        import hashlib,json
        before={'value':'PRIVATE field','selection':{'location':1,'length':2}}
        result=self._capture(before,before)
        self.assertTrue(result['ok']);self.assertEqual(result['state']['text_binding'],{'value_sha256':hashlib.sha256(b'PRIVATE field').hexdigest(),'selection':{'location':1,'length':2}})
        self.assertNotIn('PRIVATE field',json.dumps(result))


if __name__ == "__main__":
    unittest.main()
