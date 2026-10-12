#!/usr/bin/env python3
"""Orb + floating widget stay on the existing face. No second product."""
from __future__ import annotations

import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent


class OrbWidgetTest(unittest.TestCase):
    def test_orb_is_one_geodesic(self) -> None:
        text = (HERE / "orb.js").read_text(encoding="utf-8")
        self.assertIn("function icosahedron", text)
        self.assertIn("function subdivide", text)
        self.assertIn("JarvisOrb", text)
        self.assertIn("setEnergy", text)
        self.assertIn("this.voice", text)
        self.assertIn("this.action", text)
        self.assertIn("this._voice", text)
        self.assertIn("this._spin", text)
        self.assertIn("this._proj", text)
        self.assertIn("Math.exp", text)
        self.assertIn("t * 14", text)
        self.assertIn("t * 7", text)
        self.assertIn("voice * 1.4", text)
        self.assertIn("action * 0.9", text)
        self.assertNotIn("projected.slice()", text)
        self.assertNotIn("telegram", text.lower())

    def test_widget_stays_on_localhost(self) -> None:
        text = (HERE / "widget.swift").read_text(encoding="utf-8")
        self.assertIn("127.0.0.1", text)
        self.assertIn("/widget", text)
        self.assertIn("isFloatingPanel", text)
        self.assertIn("canJoinAllSpaces", text)
        self.assertIn("fullScreenAuxiliary", text)
        self.assertIn("isMovableByWindowBackground", text)
        self.assertIn("constrainFrameRect", text)
        self.assertIn("holeHeight", text)
        self.assertIn("passThroughHeight", text)
        self.assertIn("acceptsFirstMouse", text)
        self.assertIn("0.38", text)
        self.assertIn("168", text)
        self.assertNotIn("0.62", text)
        self.assertNotIn("280", text)
        self.assertIn("minSize", text)
        self.assertIn("220", text)
        self.assertIn("640", text)
        self.assertIn("fileURL", text)
        self.assertIn("/api/drop", text)
        self.assertIn(".resizable", text)
        self.assertIn("resizeEdge", text)
        self.assertIn("mediaTypesRequiringUserActionForPlayback", text)
        self.assertIn("insetBy", text)
        self.assertIn("NSEvent.mouseLocation", text)
        self.assertIn("healthz", text)
        self.assertIn("Face is dark", text)
        self.assertIn("Quit Jarvis Orb", text)
        self.assertIn("Reload Face", text)
        self.assertIn("keyEquivalent: \"q\"", text)
        self.assertIn("installMainMenu", text)
        self.assertNotIn("0.0.0.0", text)
        self.assertNotIn("telegram", text.lower())
        self.assertNotIn(":3002", text)
        self.assertTrue((HERE / "widget.sh").is_file())
        sh = (HERE / "widget.sh").read_text(encoding="utf-8")
        self.assertIn("widget.swift", sh)
        self.assertIn("127.0.0.1", sh)
        self.assertNotIn("0.0.0.0", sh)
        self.assertNotIn("telegram", sh.lower())
        install = (HERE / "install-orb-app.sh").read_text(encoding="utf-8")
        self.assertIn("Jarvis Orb.app", install)
        self.assertIn("127.0.0.1", install)
        self.assertIn("$HERE/dist", install)
        self.assertIn("${HOME}/Applications", install)
        self.assertIn("/Applications/Jarvis Orb.app", install)
        self.assertIn("refused: 0.0.0.0 bind", install)
        self.assertNotIn("0.0.0.0:", install)
        self.assertNotIn("telegram", install.lower())
        self.assertNotIn(":3002", install)
        plist = (HERE / "Info.plist").read_text(encoding="utf-8")
        self.assertIn("ca.evenslouis.jarvis-orb", plist)
        self.assertIn("127.0.0.1", plist)
        self.assertIn("NSAllowsLocalNetworking", plist)
        self.assertIn("NSMicrophoneUsageDescription", plist)
        self.assertIn("NSSpeechRecognitionUsageDescription", plist)
        self.assertNotIn("0.0.0.0", plist)
        self.assertNotIn("telegram", plist.lower())
        for name in ("widget.swift", "widget.sh", "install-orb-app.sh", "Info.plist"):
            blob = (HERE / name).read_text(encoding="utf-8").lower()
            self.assertNotIn("safari", blob)
            self.assertNotIn("youtube", blob)

    def test_widget_dock_scales_across_orb_widths(self) -> None:
        css = (HERE / "pane.html").read_text(encoding="utf-8")
        self.assertIn("html.widget #dock", css)
        self.assertIn("max-width: calc(100% - 12px)", css)
        self.assertIn("width: auto", css)
        self.assertIn("clamp(24px, 10.4vw, 44px)", css)
        self.assertIn("clamp(3px, 2.1vw, 14px)", css)
        self.assertIn("html.widget #dock #focusBtn { display: none !important; }", css)
        self.assertIn("html.widget #dock #hideBtn", css)
        self.assertIn("M5 12h14", css)
        self.assertIn("#e24b4b", css)
        self.assertIn("html.widget #dock.slim #stopBtn", css)
        self.assertIn("flex-wrap: nowrap", css)
        self.assertIn("@media (min-width: 400px)", css)
        self.assertNotIn("clamp(20px, 8vw, 28px)", css)

    def test_drag_hole_leaves_the_geodesic(self) -> None:
        text = (HERE / "widget.swift").read_text(encoding="utf-8")
        self.assertIn("static func passThroughHeight", text)
        self.assertIn("acceptsFirstMouse", text)
        self.assertGreaterEqual(text.count("acceptsFirstMouse"), 2)

        def pass_through_height(bounds_height: float, hole: float = 168) -> float:
            return min(hole, max(72.0, bounds_height * 0.38))

        default_panel = pass_through_height(420)
        self.assertLess(default_panel, 200)
        # Geodesic center sits ~252pt from the bottom of a 420 panel.
        self.assertLess(default_panel, 252 - 40)
        self.assertEqual(pass_through_height(880), 168)
        self.assertGreaterEqual(pass_through_height(300), 72)
        self.assertLess(pass_through_height(300), 140)


if __name__ == "__main__":
    unittest.main()
