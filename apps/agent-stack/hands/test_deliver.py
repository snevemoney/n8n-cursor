import importlib.util, json, shutil, subprocess, tempfile, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("deliver_t", Path(__file__).with_name("deliver.py"))
D = importlib.util.module_from_spec(spec); spec.loader.exec_module(D)

class DeliverableBundle(unittest.TestCase):
    def test_bundle_copies_checks_and_says_what_failed(self):
        with tempfile.TemporaryDirectory() as t:
            src = Path(t) / "src"; src.mkdir()
            (src / "notes.md").write_text("# Plan\nline two\n"); (src / "broken.pdf").write_text("not a pdf")
            got = D.bundle("Weekly Plan!", [src / "notes.md", src / "broken.pdf"], "what he asked for", root=Path(t) / "out")
            man = json.loads((Path(got["folder"]) / "MANIFEST.json").read_text())
            self.assertFalse(got["ok"]); self.assertTrue(Path(got["folder"]).name.endswith("weekly-plan"))
            self.assertEqual([r["check"] for r in man["files"]], ["text, 2 lines", "check failed: not a PDF"])
            self.assertTrue((src / "notes.md").exists())  # originals stay
            idx = (Path(t) / "out" / "INDEX.md").read_text()
            self.assertIn("[Weekly Plan!](", idx); self.assertIn("a check failed", idx)
            with self.assertRaises(ValueError): D.bundle("x", [src / "nope.md"], root=Path(t) / "out")

    @unittest.skipUnless(shutil.which("ffmpeg"), "ffmpeg")
    def test_video_is_checked_by_playing_its_header(self):
        with tempfile.TemporaryDirectory() as t:
            v = Path(t) / "clip.mp4"
            subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "testsrc=size=320x240:rate=10:duration=2", str(v)], check=True)
            got = D.bundle("clip", [v], root=Path(t) / "out")
        self.assertTrue(got["ok"]); self.assertEqual(got["files"][0]["check"], "plays: 2.0 s, 320x240")

if __name__ == "__main__": unittest.main()
