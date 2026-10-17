"""Pointer pure logic: displays, coordinates, target ranking, destructive read-back, take-over, vision budget."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from hands import pointer_geom as G  # noqa: E402

MAIN = {"index": 1, "x": 0.0, "y": 0.0, "w": 1512.0, "h": 982.0, "main": True}
LEFT = {"index": 2, "x": -1920.0, "y": -100.0, "w": 1920.0, "h": 1080.0, "main": False}  # secondary, negative origin
ABOVE = {"index": 3, "x": 0.0, "y": -1080.0, "w": 1920.0, "h": 1080.0, "main": False}


class DisplayTest(unittest.TestCase):
    def test_choose_display_by_containment(self):
        self.assertEqual(G.choose_display([MAIN, LEFT], (-500, 50))["index"], 2)
        self.assertEqual(G.choose_display([MAIN, LEFT], (700, 500))["index"], 1)
        self.assertEqual(G.choose_display([MAIN, LEFT, ABOVE], (10, -5))["index"], 3)

    def test_choose_display_edges_are_half_open(self):
        self.assertEqual(G.choose_display([MAIN, LEFT], (0, 10))["index"], 1)  # x == 0 belongs to main
        self.assertEqual(G.choose_display([MAIN, LEFT], (-0.5, 10))["index"], 2)

    def test_choose_display_off_screen_falls_back_to_nearest_then_main(self):
        self.assertEqual(G.choose_display([MAIN, LEFT], (-2500, 0))["index"], 2)
        self.assertEqual(G.choose_display([MAIN, LEFT], (9999, 9999))["index"], 1)
        self.assertIsNone(G.choose_display([], (0, 0)))

    def test_capture_args_use_global_rect_not_screencapture_index(self):
        self.assertEqual(G.capture_args(LEFT), ["-R", "-1920,-100,1920,1080"])
        self.assertNotIn("-D", G.capture_args(MAIN))

    def test_point_on_any_display(self):
        self.assertTrue(G.on_any_display([MAIN, LEFT], -3, 5))
        self.assertFalse(G.on_any_display([MAIN, LEFT], 2000, 5))


class CoordTest(unittest.TestCase):
    def test_box_to_global_secondary_display(self):  # vision box [ymin,xmin,ymax,xmax] 0-1000 -> global top-left points
        got = G.box_to_global([500, 0, 600, 100], LEFT)
        self.assertAlmostEqual(got["x"], -1920 + 0.05 * 1920)
        self.assertAlmostEqual(got["y"], -100 + 0.55 * 1080)
        self.assertAlmostEqual(got["w"], 192.0)
        self.assertAlmostEqual(got["h"], 108.0)

    def test_box_is_clamped_into_the_display(self):
        got = G.box_to_global([-50, 990, 1100, 1300], MAIN)
        self.assertTrue(MAIN["x"] <= got["x"] <= MAIN["x"] + MAIN["w"])
        self.assertTrue(MAIN["y"] <= got["y"] <= MAIN["y"] + MAIN["h"])

    def test_to_appkit_flips_about_main_height(self):
        self.assertEqual(G.to_appkit(100, 50, 982), (100, 932))
        self.assertEqual(G.to_appkit(-300, -400, 982), (-300, 1382))  # display above main has negative CG y -> y above main height

    def test_crop_origin_clamped(self):
        self.assertEqual(G.crop_origin(10, 10, 1512, 982, 240), (0, 0))
        self.assertEqual(G.crop_origin(1510, 980, 1512, 982, 240), (1272, 742))
        self.assertEqual(G.crop_origin(700, 500, 1512, 982, 240), (580, 380))

    def test_retina_scale(self):
        self.assertEqual(G.retina_scale(3024, 1512), 2.0)
        self.assertEqual(G.retina_scale(1280, 1512), 1280 / 1512)
        self.assertEqual(G.retina_scale(0, 1512), 1.0)


class DestructiveTest(unittest.TestCase):
    def test_flags_destructive_labels(self):
        for l in ["Close button on the Finder window", "Delete button", "Send", "Remove from cart", "Empty Trash", "Log out",
                  "Pay now", "Submit order", "Post", "Publish", "Quit", "Don't Save", "Discard changes", "Uninstall"]:
            self.assertTrue(G.is_destructive(l), l)

    def test_plain_labels_are_not_destructive(self):
        for l in ["Routines button", "Create button", "Settings", "Reel", "Send feedback form link".replace("Send", "Sand"), "", "Closet"]:
            self.assertFalse(G.is_destructive(l), l)

    def test_confirm_line_names_the_target_and_warns_when_destructive(self):
        plain = G.confirm_line("Routines button")
        self.assertIn("Routines button", plain)
        self.assertNotIn("undone", plain)
        risky = G.confirm_line("Delete button")
        self.assertIn("Delete button", risky)
        self.assertIn("exactly", risky)
        self.assertIn("confirm", risky)

    def test_strict_confirm_only_accepts_the_word_confirm(self):
        self.assertTrue(G.strict_confirm("confirm"))
        self.assertTrue(G.strict_confirm("  Confirm. "))
        self.assertFalse(G.strict_confirm("yes"))
        self.assertFalse(G.strict_confirm("ok go ahead"))
        self.assertFalse(G.strict_confirm("confirm and also delete everything"))


class TakeOverTest(unittest.TestCase):
    def test_small_jitter_is_not_a_takeover(self):
        self.assertFalse(G.user_took_over((100, 100), (110, 95)))

    def test_real_move_is_a_takeover(self):
        self.assertTrue(G.user_took_over((100, 100), (400, 300)))

    def test_missing_reading_is_treated_as_takeover(self):  # cannot prove the mouse is where we left it -> do not click
        self.assertTrue(G.user_took_over((100, 100), None))


class RankTest(unittest.TestCase):
    def test_ax_exact_beats_vision_when_they_disagree(self):
        ax = {"source": "ax", "x": 40, "y": 600, "label": "Create", "score": 9}
        vis = {"source": "vision", "x": 600, "y": 300, "label": "Create button", "confidence": 0.9}
        got = G.rank_candidates([vis, ax], ["create"], MAIN)
        self.assertEqual(got["source"], "ax")
        self.assertFalse(got["agreed"])

    def test_agreement_is_reported(self):
        ax = {"source": "ax", "x": 40, "y": 600, "label": "New post", "score": 5}
        vis = {"source": "vision", "x": 55, "y": 610, "label": "Create button", "confidence": 0.8}
        got = G.rank_candidates([vis, ax], ["create"], MAIN)
        self.assertTrue(got["agreed"])

    def test_weak_ax_loses_to_confident_vision(self):
        ax = {"source": "ax", "x": 900, "y": 20, "label": "Create account", "score": 3}
        vis = {"source": "vision", "x": 40, "y": 600, "label": "Create button", "confidence": 0.9}
        self.assertEqual(G.rank_candidates([ax, vis], ["create"], MAIN)["source"], "vision")

    def test_candidate_off_the_users_display_is_dropped(self):  # an arrow on the other screen is invisible to him
        vis = {"source": "vision", "x": -500, "y": 300, "label": "Create button", "confidence": 0.95}
        self.assertIsNone(G.rank_candidates([vis], ["create"], MAIN))

    def test_low_confidence_vision_is_dropped(self):
        self.assertIsNone(G.rank_candidates([{"source": "vision", "x": 5, "y": 5, "label": "x", "confidence": 0.5}], ["x"], MAIN))

    def test_ocr_needs_an_exact_word(self):
        ocr_bad = {"source": "ocr", "x": 100, "y": 100, "label": "NEW"}
        ocr_ok = {"source": "ocr", "x": 100, "y": 100, "label": "Routines"}
        self.assertIsNone(G.rank_candidates([ocr_bad], ["create", "reel"], MAIN))
        self.assertEqual(G.rank_candidates([ocr_ok], ["routines"], MAIN)["source"], "ocr")

    def test_vision_beats_ocr_for_icons_and_empty_is_none(self):
        vis = {"source": "vision", "x": 40, "y": 600, "label": "Create button", "confidence": 0.8}
        ocr = {"source": "ocr", "x": 700, "y": 100, "label": "create"}
        self.assertEqual(G.rank_candidates([ocr, vis], ["create"], MAIN)["source"], "vision")
        self.assertIsNone(G.rank_candidates([], ["x"], MAIN))


class BudgetTest(unittest.TestCase):
    def test_remaining(self):
        self.assertEqual(G.remaining(110.0, 100.0), 10.0)
        self.assertEqual(G.remaining(100.0, 105.0), 0.0)

    def test_ask_models_stops_when_budget_is_gone(self):
        now = [0.0]
        calls = []

        def call(model, timeout):
            calls.append((model, round(timeout, 1)))
            now[0] += 7.0
            raise OSError("slow")
        raw, errs = G.ask_models(call, ["a", "b", "c"], budget=12.0, per_call=8.0, clock=lambda: now[0])
        self.assertIsNone(raw)
        self.assertEqual(calls, [("a", 8.0), ("b", 5.0)])  # 3rd would have 0 s left (<2 s floor) -> not tried
        self.assertEqual(len(errs), 2)

    def test_ask_models_returns_first_success(self):
        raw, errs = G.ask_models(lambda m, t: "ok-" + m, ["a", "b"], budget=12.0, per_call=8.0, clock=lambda: 0.0)
        self.assertEqual((raw, errs), ("ok-a", []))


if __name__ == "__main__":
    unittest.main()
