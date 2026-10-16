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

        def dl(url, w, duration=0):
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


class ModelJson(unittest.TestCase):  # live 10-16: 3 of 26 videos failed with "Extra data" (two objects back to back)
    def test_fenced_single_object(self):
        self.assertEqual(S._json('```json\n{"methods": [1]}\n```'), {"methods": [1]})

    def test_two_objects_back_to_back_are_merged(self):
        got = S._json('{"learned_md": "x", "methods": [{"name": "a"}]}\n{"methods": [{"name": "b"}]}')
        self.assertEqual(got["learned_md"], "x")
        self.assertEqual([m["name"] for m in got["methods"]], ["a", "b"])

    def test_garbage_still_raises(self):
        with self.assertRaises(ValueError):
            S._json("no json here")


class EveryFrame(unittest.TestCase):  # Evens 10-16 "so jarvis skimmed nothing?": 7 of 26 videos lost half their frames
    def _keys(self, n):
        d = Path(tempfile.mkdtemp())
        out = []
        for i in range(n):
            f = d / f"k_{i:05d}.jpg"; f.write_bytes(b"jpg"); out.append((f, i * 2.0))
        return out

    def test_every_kept_frame_is_read_in_batches(self):
        seen = []
        def fake(messages, **k):
            imgs = [p for p in messages[0]["content"] if p.get("type") == "image_url"]
            seen.append(len(imgs))
            return "notes"
        with mock.patch.object(S, "_openrouter", side_effect=fake):
            notes, read = S.frame_notes(self._keys(95))
        self.assertEqual(sum(seen), 95)
        self.assertTrue(all(n <= S.FRAMES_PER_NOTE_CALL for n in seen))
        self.assertEqual(read, 95)

    def test_filter_only_drops_identical_frames(self):
        self.assertNotIn("400", S.KEEP_FILTER)


class LongVideos(unittest.TestCase):  # Evens 10-16: "what if jarvis encounters videos over 1h-2h?"
    def _got(self, seconds):
        d = Path(tempfile.mkdtemp()); keys = []
        for i in range(0, seconds, 2):
            f = d / f"k_{i:06d}.jpg"; f.write_bytes(b"j"); keys.append((f, float(i)))
        lines = "\n".join(f"[{t // 60:02d}:{t % 60:02d}] line {t}" for t in range(0, seconds, 30))
        return {"title": "t", "duration": seconds, "transcript": lines, "keyframes": keys, "sheets": []}

    def test_two_hour_video_is_read_in_segments_with_nothing_dropped(self):
        got = self._got(7200)
        calls = []
        def fake_one(sig, seg, label):
            calls.append(seg)
            return {"learned_md": label, "methods": [{"name": label}], "capabilities": [{"name": label}],
                    "coverage": {"frames_kept": len(seg["keyframes"]), "frames_read": len(seg["keyframes"])}}
        with mock.patch.object(S, "_extract_one", side_effect=fake_one):
            out = S.extract({"kind": "youtube", "id": "x", "url": "u"}, got)
        self.assertEqual(len(calls), 7200 // S.SEGMENT_S)
        self.assertEqual(sum(len(c["keyframes"]) for c in calls), 3600)            # every frame, once
        self.assertEqual(sum(c["transcript"].count("\n") + 1 for c in calls), 240)  # every transcript line, once
        self.assertEqual(out["coverage"], {"frames_kept": 3600, "frames_read": 3600})
        self.assertEqual(len(out["methods"]), len(calls)); self.assertEqual(len(out["capabilities"]), len(calls))

    def test_short_video_is_one_segment(self):
        with mock.patch.object(S, "_extract_one", return_value={"methods": [], "coverage": {}}) as one:
            S.extract({"kind": "youtube", "id": "x", "url": "u"}, self._got(600))
        self.assertEqual(one.call_count, 1)

    def test_download_timeout_grows_with_length(self):
        self.assertGreaterEqual(S.download_timeout(7200), 7200)
        self.assertEqual(S.download_timeout(300), 1800)

    def test_capabilities_are_asked_for(self):
        self.assertIn("capabilities", S.EXTRACT_PROMPT)


if __name__ == "__main__":
    unittest.main()
