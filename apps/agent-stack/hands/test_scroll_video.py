import importlib.util, shutil, subprocess, tempfile, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("scroll_video_t", Path(__file__).with_name("scroll_video.py"))
V = importlib.util.module_from_spec(spec); spec.loader.exec_module(V)

@unittest.skipUnless(shutil.which("ffmpeg"), "ffmpeg not installed")
class ScrollVideo(unittest.TestCase):
    def test_every_frame_is_a_keyframe_at_720p_and_the_page_scrubs_it(self):
        with tempfile.TemporaryDirectory() as d:
            src = Path(d) / "src.mp4"
            subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "testsrc=size=1920x1080:rate=30:duration=3", str(src)], check=True)
            got = V.make(str(src), str(Path(d) / "out"), seconds=60)
            page = Path(got["page"]).read_text()
        self.assertTrue(got["ok"]); self.assertEqual(got["height"], 720)
        self.assertEqual(got["keyframes"], got["frames"]); self.assertLessEqual(got["seconds"], 30)
        self.assertIn("v.currentTime=want", page); self.assertIn('src="clip.mp4"', page)

    def test_missing_source_is_a_clear_error(self):
        with self.assertRaises(ValueError): V.make("/nonexistent.mov", tempfile.mkdtemp())

if __name__ == "__main__": unittest.main()
