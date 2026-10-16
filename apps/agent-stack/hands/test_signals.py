"""Evens 10-16: give Jarvis a link (or say look for new signals) and it ingests the signal like the Researcher desk:
transcript, frame contact sheets, linked pages, every method, packet to the repo; downloads never stay on the Mac."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest import mock

H = Path(__file__).parent
spec = importlib.util.spec_from_file_location("sig_test", H / "signals.py"); S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)
spec = importlib.util.spec_from_file_location("op_sig_test", H / "operator.py"); O = importlib.util.module_from_spec(spec); spec.loader.exec_module(O)
spec = importlib.util.spec_from_file_location("auth_sig_test", H / "authority.py"); A = importlib.util.module_from_spec(spec); spec.loader.exec_module(A)


class Classify(unittest.TestCase):
    def test_links(self):
        self.assertEqual(S.classify("https://youtu.be/-6yUeJ3rkvg?si=x")["id"], "-6yUeJ3rkvg")
        self.assertEqual(S.classify("https://www.youtube.com/watch?v=ud7wzdiM0gk&t=4")["kind"], "youtube")
        self.assertEqual(S.classify("https://x.com/someone/status/2092998070157861368")["id"], "x-2092998070157861368")
        self.assertEqual(S.classify("https://example.com/post")["kind"], "web")

    def test_captions_keep_time(self):
        raw = {"events": [{"tStartMs": 0, "segs": [{"utf8": "hello"}]}, {"tStartMs": 65000, "segs": [{"utf8": "agents loop"}]}]}
        self.assertEqual(S.json3_to_text(raw), "[00:00] hello\n[01:05] agents loop")


class Safety(unittest.TestCase):
    def test_no_download_when_the_disk_is_full(self):
        with mock.patch.object(S, "free_gb", return_value=1.0), mock.patch.object(S, "CACHE", Path(tempfile.mkdtemp())):
            got = S.ingest("https://youtu.be/-6yUeJ3rkvg", force=True)
        self.assertEqual(got["status"], "FAILED"); self.assertIn("GB free", got["text"])

    def test_the_video_is_deleted_even_when_sheets_fail(self):
        work = Path(tempfile.mkdtemp())
        (work / "cap.en.json3").write_text('{"events": []}')

        def dl(url, w):
            p = w / "video.mp4"; p.write_bytes(b"x"); return p
        with mock.patch.object(S.subprocess, "run", return_value=mock.Mock(stdout='{"title": "t"}', returncode=0)), \
             mock.patch.object(S, "download", side_effect=dl), \
             mock.patch.object(S, "contact_sheets", side_effect=RuntimeError("ffmpeg")):
            with self.assertRaises(RuntimeError):
                S.youtube({"id": "abc", "url": "u", "kind": "youtube"}, work)
        self.assertEqual(list(work.glob("video.*")), [])

    def test_push_is_his_kept_stop(self):
        self.assertEqual(A.authorize("signal", {"action": "push"})[0], A.ASK)
        self.assertEqual(A.authorize("signal", {"action": "ingest", "url": "u"})[0], A.ALLOW)


class Tool(unittest.TestCase):
    def test_ingest_runs_in_the_background(self):
        t = O.Tools(Path(tempfile.mkdtemp()))
        with mock.patch.object(O.Tools, "shell", return_value={"text": "started background job ab12"}) as sh:
            got = t.signal({"action": "ingest", "url": "https://youtu.be/-6yUeJ3rkvg"})
        self.assertTrue(sh.call_args[0][0]["background"]); self.assertIn("signals.py", sh.call_args[0][0]["command"])
        self.assertIn("background job", got["text"])
        self.assertIn("signal", {x["function"]["name"] for x in O.TOOLS})


if __name__ == "__main__":
    unittest.main()
