"""Evens 10-16: give Jarvis a link (or say look for new signals) and it ingests the signal like the Researcher desk:
transcript, frame contact sheets, linked pages, every method, packet to the repo; downloads never stay on the Mac."""
import importlib.util
import json
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
        # only the fallback frame route downloads; watching from the link needs no disk
        with mock.patch.object(S, "free_gb", return_value=1.0), mock.patch.object(S, "download") as dl:
            with self.assertRaises(RuntimeError) as err:
                S.watch_fallback({"id": "x", "url": "u", "kind": "youtube"}, {"work": tempfile.mkdtemp()})
        dl.assert_not_called(); self.assertIn("GB free", str(err.exception))

    def test_the_video_is_deleted_even_when_sheets_fail(self):
        work = Path(tempfile.mkdtemp())
        (work / "cap.en.json3").write_text('{"events": []}')

        def dl(url, w, duration=0):
            p = w / "video.mp4"; p.write_bytes(b"x"); return p
        with mock.patch.object(S, "download", side_effect=dl), mock.patch.object(S, "free_gb", return_value=50), \
             mock.patch.object(S, "contact_sheets", side_effect=RuntimeError("ffmpeg")):
            with self.assertRaises(RuntimeError):  # the fallback frame route (private/unlisted videos)
                S.watch_fallback({"id": "abc", "url": "u", "kind": "youtube"}, {"work": str(work), "duration": 60})
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


class WatchTheVideo(unittest.TestCase):  # Evens 10-16: no download, watch the actual video, 1-2 h must not fail
    SIG = {"kind": "youtube", "id": "abcdefghijk", "url": "https://www.youtube.com/watch?v=abcdefghijk"}

    def test_youtube_is_watched_from_the_link_without_download(self):
        sent = []
        def fake(messages, **k):
            sent.append(messages)
            if len(sent) == 1:
                return '{"start": "00:00", "end": "2:00:00", "action": "opens the app"}\n'
            return '{"kind": "learned_md", "text": "x"}\n{"kind": "method", "name": "m"}\n{"kind": "capability", "name": "c"}\n'
        with mock.patch.object(S, "_watch", side_effect=fake), mock.patch.object(S, "download") as dl:
            out = S.extract(self.SIG, {"title": "t", "duration": 7200, "transcript": "[00:01] hi", "watch": True})
        dl.assert_not_called()
        watched = [c for c in sent if isinstance(c[0]["content"], list) and c[0]["content"][0].get("type") == "video_url"]
        for call in watched:  # visual log, methods, spot-check: each watches the WHOLE video from the link
            self.assertEqual(call[0]["content"][0]["video_url"]["url"], self.SIG["url"])
        self.assertEqual(len(watched), 3); self.assertEqual(len(sent), 4)
        self.assertIn("whole video", out["coverage"]["watched"])
        self.assertEqual(out["capabilities"], [{"name": "c"}])

    def test_an_empty_visual_log_is_a_failure_not_a_blind_packet(self):
        with mock.patch.object(S, "_watch", return_value="I cannot see the video."):
            with self.assertRaises(RuntimeError):
                S.extract(self.SIG, {"title": "t", "duration": 60, "transcript": "", "watch": True})

    def test_two_hours_is_one_watch_at_one_frame_per_second(self):
        part = S.video_part(self.SIG["url"], 7200)
        self.assertNotIn("processing", part["video_url"])  # Gemini default: 1 frame per second + audio

    def test_very_long_videos_still_fit_one_watch(self):
        part = S.video_part(self.SIG["url"], 6 * 3600)
        fps = part["video_url"]["processing"]["fps"]
        self.assertLess(fps * 6 * 3600 * 70, 1_000_000)

    def test_long_answers_are_continued_not_cut(self):
        replies = [("{\"methods\": [{\"name\": \"a\"},", "length"), (" {\"name\": \"b\"}]}", "stop")]
        calls = []
        def post(body):
            calls.append(body)
            text, fin = replies[len(calls) - 1]
            return {"choices": [{"message": {"content": text}, "finish_reason": fin}], "usage": {}}
        with mock.patch.object(S, "_post", side_effect=post):
            got = S._watch([{"role": "user", "content": [{"type": "text", "text": "go"}]}])
        self.assertEqual(S._json(got)["methods"], [{"name": "a"}, {"name": "b"}])
        self.assertEqual(calls[1]["messages"][-1]["role"], "user")
        self.assertEqual(calls[0]["provider"]["order"], ["google-ai-studio"])

    def test_a_video_google_cannot_open_falls_back_to_every_frame(self):
        with mock.patch.object(S, "_watch", side_effect=RuntimeError("private video")), \
             mock.patch.object(S, "watch_fallback", return_value={"methods": [], "coverage": {"frames_kept": 9, "frames_read": 9}}) as fb:
            out = S.extract(self.SIG, {"title": "t", "duration": 60, "transcript": "", "watch": True})
        fb.assert_called_once()
        self.assertEqual(out["coverage"]["frames_read"], 9)

    def test_no_disk_needed_to_watch(self):
        with mock.patch.object(S, "free_gb", return_value=0.5), \
             mock.patch.object(S, "youtube", return_value={"title": "t", "watch": True}), \
             mock.patch.object(S, "extract", return_value={"methods": [], "capabilities": []}), \
             mock.patch.object(S, "write_packet", return_value=Path("/x")), mock.patch.object(S, "ledger"), \
             mock.patch.object(S, "known_ids", return_value=set()):
            got = S._ingest(self.SIG["url"], force=True)
        self.assertEqual(got["status"], "DONE")

    def test_download_timeout_grows_with_length(self):  # fallback path only
        self.assertGreaterEqual(S.download_timeout(7200), 7200)

    def test_capabilities_are_asked_for(self):
        self.assertIn("capabilities", S.EXTRACT_PROMPT)


class VisualLog(unittest.TestCase):  # Evens 10-16: any agent can read what happened on screen, timestamped
    SIG = {"kind": "youtube", "id": "abcdefghijk", "url": "https://www.youtube.com/watch?v=abcdefghijk"}
    ROWS = ('{"start": "00:00", "end": "00:05", "scene": "intro", "app_or_ui": "terminal", "on_screen_text": "hi",'
            ' "action": "types", "code_or_command": "npm i", "result_shown": "ok", "said": "hello"}\n'
            '{"start": "00:05", "end": "00:09", "scene": "demo", "app_or_ui": "browser",\n'
            ' "on_screen_text": "x", "action": "clicks Run", "code_or_command": "", "result_shown": "page", "said": ""}\n')

    def test_rows_are_parsed_even_when_a_row_is_split_by_a_continuation(self):
        rows = S.parse_visual_rows(self.ROWS)
        self.assertEqual([r["start"] for r in rows], ["00:00", "00:05"])
        self.assertEqual(rows[1]["action"], "clicks Run")

    def test_the_visual_log_is_its_own_watch_and_feeds_the_methods(self):
        sent = []
        def fake(messages, **k):
            sent.append(messages)
            if len(sent) == 1:
                return self.ROWS
            return '{"kind": "learned_md", "text": "x"}\n{"kind": "method", "name": "m"}\n'
        with mock.patch.object(S, "_watch", side_effect=fake):
            out = S.extract(self.SIG, {"title": "t", "duration": 10, "transcript": "", "watch": True})
        self.assertEqual(sent[0][0]["content"][0]["type"], "video_url")          # 1: watch -> visual log
        self.assertIn("clicks Run", sent[1][0]["content"][1]["text"])            # 2: methods see the log
        self.assertIn("CHECKING", json.dumps(sent[2]))                           # 3: independent spot-check watch
        self.assertNotIn("video_url", json.dumps(sent[-1]))                      # 4: sweep reads, no re-watch
        self.assertEqual(len(sent), 4)
        self.assertEqual(len(out["visual_log"]), 2)

    def test_packet_has_csv_jsonl_and_script(self):
        d = Path(tempfile.mkdtemp())
        rows = S.parse_visual_rows(self.ROWS)
        S.write_visual_log(d, rows)
        import csv as _csv
        got = list(_csv.DictReader((d / "VISUAL-LOG.csv").open()))
        self.assertEqual(got[0]["code_or_command"], "npm i")
        self.assertEqual(len((d / "visual-log.jsonl").read_text().splitlines()), 2)
        script = (d / "SCRIPT.md").read_text()
        self.assertIn("00:05", script); self.assertIn("clicks Run", script)


class VisualChecks(unittest.TestCase):  # links to the moment, gaps flagged, independent spot-check
    def _rows(self, spans):
        return [{**{k: "" for k in S.VISUAL_FIELDS}, "start": a, "end": b, "action": f"row {a}"} for a, b in spans]

    def test_every_row_links_to_its_second(self):
        rows = S.add_links(self._rows([("1:02:05", "1:02:09")]), "https://www.youtube.com/watch?v=abcdefghijk")
        self.assertEqual(rows[0]["link"], "https://www.youtube.com/watch?v=abcdefghijk&t=3725s")

    def test_gaps_and_a_short_ending_are_flagged(self):
        gaps = S.coverage_gaps(self._rows([("00:00", "00:20"), ("01:30", "02:00")]), duration=300)
        self.assertIn("00:20-01:30", gaps); self.assertIn("02:00-05:00", gaps)
        self.assertEqual(S.coverage_gaps(self._rows([("00:00", "04:50")]), duration=300), [])

    def test_spot_check_is_a_separate_watch_and_scores_rows(self):
        rows = self._rows([(f"00:{i:02d}", f"00:{i + 1:02d}") for i in range(20)])
        seen = []
        def fake(messages, **k):
            seen.append(messages)
            return '{"checks": [' + ",".join('{"start": "00:%02d", "matches": %s}' % (i, "true" if i % 5 else "false") for i in range(10)) + ']}'
        with mock.patch.object(S, "_watch", side_effect=fake):
            got = S.spot_check("https://www.youtube.com/watch?v=abcdefghijk", 60, rows, n=10)
        self.assertEqual(seen[0][0]["content"][0]["type"], "video_url")
        self.assertEqual(got["checked"], 10); self.assertEqual(got["matched"], 8)


class RobustLongOutput(unittest.TestCase):  # live 10-16: the 2h22m watch fit (861k tokens) but one big JSON broke
    def test_jsonl_output_survives_a_broken_row(self):
        text = ('{"kind": "learned_md", "text": "## A. Source map\\n- 00:00 intro"}\n'
                '{"kind": "method", "name": "m1", "family": "skills"}\n'
                '{"kind": "method", "name": "m2", "fam\n'            # cut mid-row by the output limit
                '{"kind": "capability", "name": "c1"}\n'
                '{"kind": "learned_md", "text": "## B. Atomic"}\n')
        out = S.parse_extract_rows(text)
        self.assertEqual([m["name"] for m in out["methods"]], ["m1"])
        self.assertEqual([c["name"] for c in out["capabilities"]], ["c1"])
        self.assertIn("## B. Atomic", out["learned_md"]); self.assertIn("00:00 intro", out["learned_md"])

    def test_only_access_errors_fall_back_to_the_frame_route(self):
        self.assertTrue(S.watch_blocked(RuntimeError("Gemini could not watch the video (403 PERMISSION_DENIED: Video is private)")))
        self.assertTrue(S.watch_blocked(RuntimeError("This video is unavailable")))
        self.assertFalse(S.watch_blocked(ValueError("Expecting value: line 4 column 12")))
        sig = {"kind": "youtube", "id": "abcdefghijk", "url": "https://www.youtube.com/watch?v=abcdefghijk"}
        with mock.patch.object(S, "_extract_watch", side_effect=ValueError("Expecting value")), \
             mock.patch.object(S, "watch_fallback") as fb:
            with self.assertRaises(ValueError):
                S.extract(sig, {"watch": True})
        fb.assert_not_called()

    def test_each_watch_call_records_why_it_stopped(self):
        rows = []
        with mock.patch.object(S, "_post", return_value={"choices": [{"message": {"content": "x"}, "finish_reason": "stop"}], "usage": {}}), \
             mock.patch.object(S, "ledger", side_effect=rows.append):
            S._watch([{"role": "user", "content": "go"}])
        self.assertEqual(rows[0]["finish"], "stop"); self.assertEqual(rows[0]["chars"], 1)


class StudioLens(unittest.TestCase):  # Evens 10-16: motion-graphics / design videos watched for studio work
    SIG = {"kind": "youtube", "id": "abcdefghijk", "url": "https://www.youtube.com/watch?v=abcdefghijk"}

    def test_motion_videos_pick_the_studio_lens(self):
        self.assertEqual(S.pick_lens({"title": "Kinetic typography in After Effects"}), "studio")
        self.assertEqual(S.pick_lens({"title": "Logo reveal | motion graphics showreel"}), "studio")
        self.assertEqual(S.pick_lens({"title": "Build an n8n agent in 20 minutes"}), "learn")
        self.assertEqual(S.pick_lens({"title": "Build an n8n agent"}, asked="studio"), "studio")

    def test_studio_watches_more_frames_per_second_and_still_fits(self):
        fps = S.video_part(self.SIG["url"], 180, lens="studio")["video_url"]["processing"]["fps"]
        self.assertGreaterEqual(fps, 5)
        long = S.video_part(self.SIG["url"], 3600, lens="studio")["video_url"]["processing"]["fps"]
        self.assertLess(long * 3600 * 102, 1_000_000); self.assertGreaterEqual(long, 0.2)

    def test_studio_packet_has_shot_log_style_and_recipes(self):
        sent = []
        def fake(messages, **k):
            sent.append(messages)
            if len(sent) == 1:
                return ('{"start": "00:00", "end": "00:02", "shot": "logo hit", "palette": "#0A0A0A, #00E5FF",'
                        ' "motion": "scale 0->100% overshoot, 12 frames", "recreate": "EffectCraft: text layer, scale keyframes"}\n')
            if "CHECKING" in json.dumps(messages):
                return '{"checks": [{"start": "00:00", "matches": true}]}'
            return '{"kind": "learned_md", "text": "## Palette"}\n{"kind": "method", "name": "overshoot logo hit", "family": "content-creative"}\n'
        with mock.patch.object(S, "_watch", side_effect=fake):
            out = S.extract(self.SIG, {"title": "Logo animation", "duration": 120, "transcript": "", "watch": True, "lens": "studio"})
        self.assertIn("motion", S.STUDIO_FIELDS); self.assertIn("recreate", S.STUDIO_FIELDS)
        self.assertIn("shot by shot", json.dumps(sent[0]).lower())
        self.assertEqual(out["lens"], "studio"); self.assertEqual(out["visual_log"][0]["palette"], "#0A0A0A, #00E5FF")
        d = Path(tempfile.mkdtemp())
        S.write_visual_log(d, out["visual_log"], lens="studio")
        self.assertTrue((d / "STUDIO-LOG.csv").exists()); self.assertIn("EffectCraft", (d / "SCRIPT.md").read_text())

    def test_the_operator_can_ask_for_the_studio_lens(self):
        t = next(t for t in O.TOOLS if t["function"]["name"] == "signal")
        self.assertIn("lens", t["function"]["parameters"]["properties"])


class StudioFiling(unittest.TestCase):  # Evens 10-16: studio notes stored in ArtCraft Studio to help do work
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        for t in ("Video Editing", "Brand & Identity"):
            (self.root / "01 Internal" / "Playbooks" / t / "refs").mkdir(parents=True)
        (self.root / "01 Internal/Playbooks/Video Editing/refs/REFS.md").write_text("# refs\n- old line\n")
        self.packet = Path(tempfile.mkdtemp())
        for f in ("STYLE.md", "SCRIPT.md", "STUDIO-LOG.csv", "full.txt"):
            (self.packet / f).write_text(f)

    def test_studio_notes_go_to_the_playbook_refs_and_the_list_is_appended(self):
        sig = {"id": "abcdefghijk", "url": "https://www.youtube.com/watch?v=abcdefghijk", "kind": "youtube"}
        with mock.patch.object(S, "STUDIO_ROOT", self.root):
            d = S.file_in_studio(sig, {"title": "Logo: reveal/2"}, {"studio_type": "Video Editing", "methods": [1, 2]}, self.packet)
            S.file_in_studio(sig, {"title": "Logo: reveal/2"}, {"studio_type": "Video Editing", "methods": [1, 2]}, self.packet)
        self.assertEqual(d.parent, self.root / "01 Internal/Playbooks/Video Editing/refs")
        self.assertNotIn("/", d.name.replace(" - ", ""))   # title made safe for a folder name
        self.assertTrue((d / "STYLE.md").exists()); self.assertTrue((d / "STUDIO-LOG.csv").exists())
        self.assertFalse((d / "full.txt").exists())        # no transcript dump (Studio rule 5)
        self.assertIn(sig["url"], (d / "README.md").read_text())
        refs = (self.root / "01 Internal/Playbooks/Video Editing/refs/REFS.md").read_text()
        self.assertIn("- old line", refs); self.assertEqual(sum(l.startswith("- abcdefghijk -") for l in refs.splitlines()), 1)  # appended once, old kept

    def test_unknown_type_falls_back_to_video_editing(self):
        with mock.patch.object(S, "STUDIO_ROOT", self.root):
            d = S.file_in_studio({"id": "x1", "url": "u", "kind": "youtube"}, {"title": "t"}, {"studio_type": "Made Up"}, self.packet)
        self.assertEqual(d.parent.parent.name, "Video Editing")

    def test_the_model_names_the_content_type(self):
        out = S.parse_extract_rows('{"kind": "studio_type", "value": "Brand & Identity"}\n{"kind": "method", "name": "m"}\n')
        self.assertEqual(out["studio_type"], "Brand & Identity")
        self.assertIn("studio_type", S.STUDIO_EXTRACT)


class PlaybookUpdates(unittest.TestCase):  # Evens 10-16: each studio video updates the playbook .md files
    GUIDE = ("# 06 Video Editing — Guidelines\n\n## Method rules — [S] sourced, [C] our convention\n"
             "- [S] Storyboard first. — *source:* x\n\n## Folder specifics\n- [C] Only footage Evens owns.\n")
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.book = self.root / "01 Internal/Playbooks/Video Editing"
        (self.book / "refs").mkdir(parents=True)
        (self.book / "GUIDELINES.md").write_text(self.GUIDE)
        (self.book / "CHECKLIST.md").write_text("# Done check\n\n## VID\n- [ ] verify_video PASS\n")
        (self.book / "SKILL.md").write_text("# Skill\n\n## Recipe\n1. Brief\n")
        self.sig = {"id": "abcdefghijk", "url": "https://www.youtube.com/watch?v=abcdefghijk", "kind": "youtube"}
        self.ext = {"studio_type": "Video Editing",
                    "guidelines": [{"rule": "Overshoot logo hits by 8-12% and settle within 6 frames", "at": "00:04"}],
                    "checks": [{"text": "Every logo hit settles within 6 frames of the beat", "at": "00:04"}],
                    "methods": [{"name": "Overshoot logo hit", "summary": "scale pop", "steps": ["EffectCraft: scale keys"], "at": "00:04"}]}

    def _run(self):
        with mock.patch.object(S, "STUDIO_ROOT", self.root):
            ref = self.book / "refs" / "abcdefghijk - Logo"
            ref.mkdir(exist_ok=True)
            S.update_playbook(self.sig, {"title": "Logo"}, self.ext, ref)

    def test_rules_go_inside_the_method_rules_section_in_its_format(self):
        self._run()
        g = (self.book / "GUIDELINES.md").read_text()
        rule_at, folder_at = g.index("Overshoot logo hits"), g.index("## Folder specifics")
        self.assertLess(rule_at, folder_at)
        self.assertIn("- [S] Overshoot logo hits by 8-12% and settle within 6 frames — *source:* "
                      "https://www.youtube.com/watch?v=abcdefghijk&t=4s", g)
        self.assertIn("- [S] Storyboard first.", g)  # existing lines untouched

    def test_checklist_skill_and_techniques_are_updated(self):
        self._run()
        self.assertIn("- [ ] Every logo hit settles within 6 frames of the beat", (self.book / "CHECKLIST.md").read_text())
        self.assertIn("TECHNIQUES.md", (self.book / "SKILL.md").read_text())
        self.assertIn("### Overshoot logo hit", (self.book / "TECHNIQUES.md").read_text())

    def test_ingesting_again_adds_nothing_twice(self):
        self._run(); first = {f: (self.book / f).read_text() for f in ("GUIDELINES.md", "CHECKLIST.md", "SKILL.md", "TECHNIQUES.md")}
        self._run()
        for f, text in first.items():
            self.assertEqual((self.book / f).read_text(), text, f)

    def test_the_model_is_asked_for_rules_and_checks_without_copying_the_look(self):
        out = S.parse_extract_rows('{"kind": "guideline", "rule": "r", "at": "00:01"}\n{"kind": "check", "text": "c"}\n')
        self.assertEqual(out["guidelines"][0]["rule"], "r"); self.assertEqual(out["checks"][0]["text"], "c")
        self.assertIn("never", S.STUDIO_EXTRACT.split('"guideline"')[1][:400].lower())


class LongWatchCompleteness(unittest.TestCase):  # live 10-16: 2h22m log stopped at 118:13; thinking ate the budget
    SIG = {"kind": "youtube", "id": "abcdefghijk", "url": "https://www.youtube.com/watch?v=abcdefghijk"}

    def test_watch_calls_keep_thinking_low_so_the_answer_gets_the_budget(self):
        bodies = []
        with mock.patch.object(S, "_post", side_effect=lambda b: bodies.append(b) or {"choices": [{"message": {"content": "x"}, "finish_reason": "stop"}]}), \
             mock.patch.object(S, "ledger"):
            S._watch([{"role": "user", "content": "go"}])
        self.assertEqual(bodies[0]["reasoning"], {"effort": "low"})

    def test_missing_minutes_are_filled_by_another_watch_until_no_gap(self):
        first = "\n".join('{"start": "%d:00", "end": "%d:59", "action": "a%d"}' % (m, m, m) for m in range(0, 118))
        fill = "\n".join('{"start": "%d:00", "end": "%d:59", "action": "b%d"}' % (m, m, m) for m in range(118, 143))
        calls = []
        def fake(messages, **k):
            calls.append(json.dumps(messages))
            return first if len(calls) == 1 else fill
        with mock.patch.object(S, "_watch", side_effect=fake):
            rows = S.watch_visual_log(self.SIG["url"], 8572, "learn", "")
        self.assertEqual(len(calls), 2)
        self.assertIn("1:57:59", calls[1])                    # the follow-up names the missing stretch
        self.assertEqual(S.coverage_gaps(rows, 8572), [])
        self.assertEqual([r["start"] for r in rows], sorted([r["start"] for r in rows], key=S._secs))

    def test_density_is_asked_for(self):
        self.assertIn("5-15 s", S.VISUAL_PROMPT)


if __name__ == "__main__":
    unittest.main()
