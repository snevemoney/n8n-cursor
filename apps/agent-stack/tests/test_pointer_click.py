"""Pointer click/arm/cursor flow with every side effect injected, plus the live() no-side-effects guard."""
import os
import subprocess
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from brain import pipeline as P  # noqa: E402

PT = P._pointer_hand()
_TMP = None
_ORIG_LAST = PT.LAST


def setUpModule():  # tests must never read or write the real ~/Library/Caches/jarvis/pointer_last.json (the live Face uses it)
    global _TMP
    import tempfile
    _TMP = tempfile.TemporaryDirectory()
    PT.LAST = Path(_TMP.name) / "pointer_last.json"


def tearDownModule():
    PT.LAST = _ORIG_LAST
    _TMP.cleanup()


MAIN = {"index": 1, "x": 0.0, "y": 0.0, "w": 1512.0, "h": 982.0, "main": True}


def make_io(**kw):
    log = []
    base = dict(
        preflight=lambda: {"post_event_allowed": True},
        mouse=lambda: (665.0, 987.0),
        glide=lambda frm, to, hold: log.append(("glide", frm, to, hold)),
        sleep=lambda s: log.append(("sleep", s)),
        ripple=lambda: log.append(("ripple",)),
        dismiss=lambda: log.append(("dismiss",)),
        click=lambda args: log.append(("click", args)) or {"ok": True},
    )
    base.update(kw)
    return SimpleNamespace(**base), log


class ClickDoTest(unittest.TestCase):
    def test_happy_path_glides_then_clicks_then_restores_to_fresh_mouse_reading(self):
        readings = iter([(665.0, 987.0), (668.0, 985.0)])  # at glide start, and right before the click
        io, log = make_io(mouse=lambda: next(readings))
        got = PT.click_do(1200.0, 365.0, "Routines button", io=io)
        self.assertTrue(got["clicked"]); self.assertEqual(got["spoken"], "Clicked the Routines button.")
        kinds = [e[0] for e in log]
        self.assertEqual(kinds[0], "glide"); self.assertIn("click", kinds); self.assertEqual(kinds[-1], "dismiss")
        click = next(e for e in log if e[0] == "click")[1]
        self.assertEqual(click[:2], ["1200.0", "365.0"])
        self.assertEqual(click[3:5], ["668.0", "985.0"])  # home = where the mouse is NOW, not where it was before the glide
        self.assertLess(kinds.index("glide"), kinds.index("click"))
        self.assertLess(kinds.index("ripple"), kinds.index("click"))

    def test_permission_missing_posts_nothing_and_says_how_to_fix(self):
        io, log = make_io(preflight=lambda: {"post_event_allowed": False})
        got = PT.click_do(10, 10, "Create button", io=io)
        self.assertFalse(got["clicked"]); self.assertEqual(got["why"], "post_event_denied")
        self.assertIn("Accessibility", got["spoken"]); self.assertIn("Nothing was clicked", got["spoken"])
        self.assertEqual([e[0] for e in log], [])

    def test_user_moved_the_mouse_during_the_glide_so_no_click(self):
        readings = iter([(665.0, 987.0), (900.0, 300.0)])
        io, log = make_io(mouse=lambda: next(readings))
        got = PT.click_do(1200.0, 365.0, "Routines button", io=io)
        self.assertFalse(got["clicked"]); self.assertIn("moved the mouse", got["spoken"])
        self.assertNotIn("click", [e[0] for e in log]); self.assertEqual(log[-1], ("dismiss",))

    def test_no_mouse_reading_means_no_click(self):
        io, log = make_io(mouse=lambda: None)
        self.assertFalse(PT.click_do(1, 1, "x", io=io)["clicked"])
        self.assertNotIn("click", [e[0] for e in log])

    def test_helper_failure_is_reported_not_claimed(self):
        io, _ = make_io(click=lambda a: {"ok": False, "why": "click helper gave no answer"})
        got = PT.click_do(1, 1, "x", io=io)
        self.assertFalse(got["clicked"]); self.assertIn("didn't click", got["spoken"])

    def test_destructive_label_needs_strict_confirm(self):
        io, log = make_io()
        got = PT.click_do(5, 5, "Delete button", io=io)
        self.assertFalse(got["clicked"]); self.assertIn("exactly", got["spoken"])
        self.assertEqual(log, [])
        io2, log2 = make_io()
        self.assertTrue(PT.click_do(5, 5, "Delete button", io=io2, strict_ok=True)["clicked"])

    def test_close_button_label_is_destructive_too(self):
        io, _ = make_io()
        self.assertFalse(PT.click_do(5, 5, "Close button on the Finder window", io=io)["clicked"])


class ClickArmTest(unittest.TestCase):
    def test_arm_draws_arrow_and_starts_persistent_cursor_for_the_confirm_window(self):
        drawn, cur = [], []
        got = PT.click_arm("click Routines", locate_fn=lambda k: {"found": True, "x": 1200.0, "y": 365.0, "label": "Routines", "source": "ocr"},
                           draw_fn=lambda x, y, l, s: drawn.append((x, y, l, s)), cursor_fn=lambda to, hold: cur.append((to, hold)))
        self.assertTrue(got["found"]); self.assertFalse(got["destructive"])
        self.assertEqual(drawn[0][3], PT.ARM_HOLD_SEC); self.assertEqual(cur, [((1200.0, 365.0), PT.ARM_HOLD_SEC)])
        self.assertGreaterEqual(PT.ARM_HOLD_SEC, P.CONFIRM_TTL_SEC)  # the visuals outlive the confirm window, never the reverse

    def test_arm_marks_destructive_targets(self):
        got = PT.click_arm("click delete", locate_fn=lambda k: {"found": True, "x": 5.0, "y": 5.0, "label": "Delete", "role": "AXButton", "source": "ax"},
                           draw_fn=lambda *a: True, cursor_fn=lambda *a: None)
        self.assertTrue(got["destructive"])

    def test_arm_miss_draws_nothing(self):
        got = PT.click_arm("click zzz", locate_fn=lambda k: {"found": False}, draw_fn=lambda *a: self.fail("draw"), cursor_fn=lambda *a: self.fail("cursor"))
        self.assertFalse(got["found"]); self.assertIn("won't click blind", got["spoken"])


class PipelineGateTest(unittest.TestCase):
    def _armed(self, tmp, args):
        P.confirm_arm(Path(tmp), "pointer_click", args, "click delete")

    def test_destructive_pending_ignores_yes_and_accepts_only_confirm(self):
        import tempfile
        with tempfile.TemporaryDirectory() as t:
            self._armed(t, {"x": 1, "y": 2, "label": "Delete button", "destructive": True})
            self.assertIsNone(P.confirm_take(Path(t), "yes"))
            self._armed(t, {"x": 1, "y": 2, "label": "Delete button", "destructive": True})
            got = P.confirm_take(Path(t), "confirm")
            self.assertTrue(got["args"].get("strict_ok"))

    def test_plain_pending_still_accepts_yes(self):
        import tempfile
        with tempfile.TemporaryDirectory() as t:
            self._armed(t, {"x": 1, "y": 2, "label": "Routines button"})
            self.assertEqual(P.confirm_take(Path(t), "yes")["tool"], "pointer_click")

    def test_a_dropped_pending_row_dismisses_the_overlay(self):
        import tempfile
        calls = []
        with tempfile.TemporaryDirectory() as t, mock.patch.object(PT, "dismiss", lambda: calls.append(1)):
            self._armed(t, {"x": 1, "y": 2, "label": "Routines button"})
            self.assertIsNone(P.confirm_take(Path(t), "what's the weather"))
        self.assertEqual(calls, [1])

    def test_confirm_line_for_pointer_click_names_the_target(self):
        self.assertIn("exactly", PT.G.confirm_line("Delete button"))


class LiveGuardTest(unittest.TestCase):
    """The 15:43 bug: test suites reached the real hand and drew arrows. Nothing may touch the screen outside the live Face."""

    def _boom(self, *a, **k):
        raise AssertionError("side effect outside live Face")

    def test_not_live_under_pytest(self):
        self.assertFalse(PT.live())

    def test_live_only_for_serve_py_without_test_runner(self):
        env = {k: v for k, v in os.environ.items() if k not in ("PYTEST_CURRENT_TEST", "JARVIS_POINTER_OFF")}
        with mock.patch.dict(os.environ, env, clear=True), mock.patch.object(sys, "argv", ["/x/face/serve.py"]):
            with mock.patch.dict(sys.modules, {"pytest": None}):
                sys.modules.pop("pytest")
                self.assertTrue(PT.live())
            self.assertFalse(PT.live())  # pytest is imported again -> a test runner is in this process
        with mock.patch.dict(os.environ, env, clear=True), mock.patch.object(sys, "argv", ["/x/mouth/test_turn.py"]):
            self.assertFalse(PT.live())
        with mock.patch.dict(os.environ, {**env, "JARVIS_POINTER_OFF": "1"}, clear=True), mock.patch.object(sys, "argv", ["/x/face/serve.py"]):
            self.assertFalse(PT.live())

    def test_every_effectful_entry_point_is_inert_when_not_live(self):
        with mock.patch.object(subprocess, "Popen", self._boom), mock.patch.object(subprocess, "run", self._boom), \
                mock.patch.object(os, "kill", self._boom), mock.patch("urllib.request.urlopen", self._boom):
            self.assertFalse(PT.draw(10, 10, "x"))
            self.assertFalse(PT.hover(10, 10))
            self.assertFalse(PT.locate(["a"])["found"])
            self.assertFalse(PT.close_button()["found"])
            self.assertFalse(PT.locate_vision("create reel")["found"])
            self.assertFalse(PT.locate_ax(["a"])["found"])
            self.assertIsNone(PT.dock_hint(["safari"]))
            self.assertFalse(PT.cursor_demo()["ok"])
            self.assertFalse(PT.click_do(1, 1, "x")["clicked"])
            self.assertFalse(PT.click_preflight().get("ok", False))
            PT.dismiss()
            PT.cursor_start((0, 0), (5, 5), 3)
            PT.cursor_signal("USR1")

    def test_default_run_and_click_arm_never_touch_the_screen_in_tests(self):
        with mock.patch.object(subprocess, "Popen", self._boom), mock.patch.object(subprocess, "run", self._boom):
            got = PT.run("where do I click to open Routines")
            self.assertFalse(got["found"])
            self.assertFalse(PT.click_arm("click Routines")["found"])


class DrawCursorLiveTest(unittest.TestCase):
    """With live() forced on and the OS calls mocked: what would be launched, and in what order."""

    def _live(self):
        return mock.patch.object(PT, "live", lambda: True), mock.patch.object(PT, "_bin", lambda n: Path("/x/" + n)), \
            mock.patch.object(PT, "displays", lambda: [MAIN])

    def test_draw_replaces_the_previous_arrow_and_skips_off_screen_targets(self):
        a, b, c = self._live()
        with a, b, c, mock.patch.object(subprocess, "run") as run, mock.patch.object(subprocess, "Popen") as pop:
            self.assertTrue(PT.draw(100.0, 200.0, "Create button", 120))
            self.assertEqual(run.call_args_list[0].args[0][:3], ["pkill", "-TERM", "-f"])
            self.assertEqual(pop.call_args.args[0][:2], ["/x/pointer_arrow", "100.0"])
            self.assertEqual(pop.call_args.args[0][-1], "120")
            pop.reset_mock()
            self.assertFalse(PT.draw(5000.0, 200.0, "Create button"))  # off every display
            pop.assert_not_called()

    def test_cursor_start_passes_hold_and_replaces_the_previous_cursor(self):
        a, b, c = self._live()
        with a, b, c, mock.patch.object(subprocess, "run") as run, mock.patch.object(subprocess, "Popen") as pop:
            self.assertTrue(PT.cursor_start((10, 20), (300, 400), 120))
            self.assertEqual(run.call_args.args[0], ["pkill", "-TERM", "-f", "Caches/jarvis/pointer_cursor"])
            self.assertEqual(pop.call_args.args[0], ["/x/pointer_cursor", "10.0", "20.0", "300.0", "400.0", "--hold", "120", "--label", "Jarvis"])

    def test_signals_go_only_to_the_cursor_process(self):
        a, b, c = self._live()
        with a, b, c, mock.patch.object(subprocess, "run") as run:
            PT.cursor_signal("USR1")
            self.assertEqual(run.call_args.args[0], ["pkill", "-USR1", "-f", "Caches/jarvis/pointer_cursor"])
            PT.dismiss()
            self.assertEqual([c.args[0][-1] for c in run.call_args_list[1:]], ["Caches/jarvis/pointer_arrow", "Caches/jarvis/pointer_cursor"])


class RememberTest(unittest.TestCase):
    def test_remember_is_inert_outside_the_live_face(self):
        import tempfile
        with tempfile.TemporaryDirectory() as d, mock.patch.object(PT, "LAST", Path(d) / "last.json"):
            PT.remember(1.0, 2.0, "x")
            self.assertFalse((Path(d) / "last.json").exists())
            self.assertIsNone(PT.last_target())

    def test_remember_roundtrip_when_live(self):
        import tempfile
        with tempfile.TemporaryDirectory() as d, mock.patch.object(PT, "LAST", Path(d) / "last.json"), \
                mock.patch.object(PT, "CACHE", Path(d)), mock.patch.object(PT, "live", lambda: True):
            PT.remember(1.0, 2.0, "Routines button")
            self.assertEqual(PT.last_target()["label"], "Routines button")


class MiscTest(unittest.TestCase):
    def test_capture_cmd_is_a_global_rect_for_the_chosen_display(self):
        d = {"index": 2, "x": -1920.0, "y": -100.0, "w": 1920.0, "h": 1080.0}
        self.assertEqual(PT.capture_cmd(d, "/tmp/a.png"), ["screencapture", "-x", "-R", "-1920,-100,1920,1080", "-t", "png", "/tmp/a.png"])

    def test_bin_state(self):
        self.assertEqual(PT.G.bin_state(10.0, None), "missing")
        self.assertEqual(PT.G.bin_state(10.0, 20.0), "fresh")
        self.assertEqual(PT.G.bin_state(30.0, 20.0), "stale")
        self.assertEqual(PT.G.bin_state(None, 20.0), "fresh")


class LocateSmartTest(unittest.TestCase):
    def ls(self, ax=None, vis=None, ocr=None, kws=("create",)):
        return PT.locate_smart("create a reel", list(kws), ax_fn=lambda k: ax or {"found": False}, vision_fn=lambda u: vis or {"found": False},
                               ocr_fn=lambda k: ocr or {"found": False}, disp=MAIN)

    def test_strong_ax_wins_without_asking_vision(self):
        got = PT.locate_smart("create a reel", ["create"], ax_fn=lambda k: {"found": True, "x": 40, "y": 600, "label": "Create", "role": "AXButton", "score": 9, "source": "ax"},
                              vision_fn=lambda u: self.fail("vision not needed"), ocr_fn=lambda k: self.fail("ocr"), disp=MAIN)
        self.assertEqual(got["source"], "ax")

    def test_vision_when_no_ax(self):
        got = self.ls(vis={"found": True, "x": 40, "y": 600, "label": "Create button", "source": "vision", "confidence": 0.9})
        self.assertEqual(got["source"], "vision")

    def test_vision_said_not_found_is_final(self):
        got = self.ls(vis={"found": False, "why": "not clearly on your screen"}, ocr={"found": True, "x": 1, "y": 1, "label": "create"})
        self.assertFalse(got["found"])

    def test_vision_error_falls_back_to_exact_ocr_word_only(self):
        err = {"found": False, "error": True, "why": "vision unavailable"}
        self.assertEqual(self.ls(vis=err, ocr={"found": True, "x": 100, "y": 100, "label": "Create", "source": "ocr"})["source"], "ocr")
        self.assertFalse(self.ls(vis=err, ocr={"found": True, "x": 100, "y": 100, "label": "NEW", "source": "ocr"})["found"])

    def test_target_on_another_display_is_not_pointed_at(self):
        got = self.ls(vis={"found": True, "x": -500, "y": 600, "label": "Create button", "source": "vision", "confidence": 0.9})
        self.assertFalse(got["found"]); self.assertIn("your screen", got["why"])


class BudgetedVisionTest(unittest.TestCase):
    def test_vision_budget_is_bounded(self):
        self.assertLessEqual(PT.VISION_BUDGET_SEC, 15)  # the 46 s refusal came from 3 models x 20 s + refine


if __name__ == "__main__":
    unittest.main()
