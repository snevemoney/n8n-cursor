#!/usr/bin/env python3
"""Typed living-tab job. No Chrome. No invented watch.json."""
from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "cursor_browser.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_cursor_browser", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()
WATCH_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"


class CursorBrowserJobTest(unittest.TestCase):
    def test_queue_writes_typed_pending_job(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-cb-queue-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            got = MOD.queue(hive, f"watch this youtube {WATCH_URL}")
            self.assertTrue(got["ok"])
            self.assertEqual(got["spoken"], MOD.QUEUE_SPOKEN)
            self.assertTrue(got["job_id"])
            job = json.loads((hive / "bus" / "cursor-browser-job.json").read_text(encoding="utf-8"))
            self.assertEqual(MOD.validate(job), [])
            self.assertEqual(job["id"], got["job_id"])
            self.assertEqual(job["verb"], "watch")
            self.assertEqual(job["status"], "pending")
            self.assertEqual(job["video_id"], "dQw4w9WgXcQ")
            self.assertEqual(job["url"], WATCH_URL)
            self.assertEqual(job["cap"]["videos"], 1)
            self.assertEqual(job["cap"]["max_frames"], 36)
            self.assertGreaterEqual(job["cap"]["sample_sec"], 5)
            self.assertLessEqual(job["cap"]["sample_sec"], 10)
            self.assertEqual(
                job["result_path"],
                "CONTENT/watch-later/packets/dQw4w9WgXcQ/watch.json",
            )

    def test_safari_phrases_do_not_write_watch_job(self) -> None:
        for phrase in (
            "open YouTube",
            "go to YouTube",
            "go on YouTube",
            "watch later",
            "what's on my watch later",
            "scroll",
            "scroll down",
            "screenshot",
        ):
            self.assertFalse(MOD.is_queue_utterance(phrase), phrase)
            self.assertTrue(MOD.is_safari_only_utterance(phrase), phrase)

    def test_cursor_phrases_queue_and_watch_url_queues(self) -> None:
        self.assertTrue(MOD.is_queue_utterance("watch this youtube"))
        self.assertTrue(MOD.is_queue_utterance("cursor-video-watch"))
        self.assertTrue(MOD.is_queue_utterance("use the cursor browser"))
        self.assertTrue(MOD.is_queue_utterance(WATCH_URL))
        self.assertTrue(MOD.is_status_utterance("what did you watch"))
        self.assertFalse(MOD.is_queue_utterance("what did you watch"))

    def test_actuate_without_browser_is_unknown_no_fake_watch_json(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-cb-unknown-") as tmp:
            hive = Path(tmp)
            root = Path(tmp) / "outer"
            root.mkdir()
            (hive / "bus").mkdir()
            queued = MOD.queue(hive, f"cursor-video-watch {WATCH_URL}")
            self.assertEqual(queued["job"]["status"], "pending")
            got = MOD.actuate(hive, has_browser=False, root=root)
            self.assertFalse(got["ok"])
            self.assertTrue(got["unknown"])
            self.assertIn("UNKNOWN", got["spoken"])
            job = MOD.read(hive)
            self.assertEqual(job["status"], "UNKNOWN")
            dest = MOD.result_file(job, root=root)
            self.assertIsNotNone(dest)
            self.assertFalse(dest.is_file(), "must not invent watch.json")

    def test_actuate_marks_done_only_when_watch_json_exists(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-cb-done-") as tmp:
            hive = Path(tmp)
            root = Path(tmp) / "outer"
            (hive / "bus").mkdir()
            queued = MOD.queue(hive, f"watch this youtube {WATCH_URL}")
            dest = MOD.result_file(queued["job"], root=root)
            dest.parent.mkdir(parents=True)
            dest.write_text(
                json.dumps(
                    {
                        "video_id": "dQw4w9WgXcQ",
                        "video_url": WATCH_URL,
                        "sampling_interval_sec": 5,
                        "frames": [{"timestamp": "00:00", "description": "player on screen"}],
                        "transcript": [],
                    }
                )
                + "\n",
                encoding="utf-8",
            )
            got = MOD.actuate(hive, has_browser=False, root=root)
            self.assertTrue(got["ok"])
            self.assertEqual(MOD.read(hive)["status"], "done")
            self.assertIn("dQw4w9WgXcQ", got["spoken"])
            self.assertIn("1 frames", got["spoken"])
            asked = MOD.read_result(hive, root=root)
            self.assertTrue(asked["ok"])
            self.assertIn("dQw4w9WgXcQ", asked["spoken"])

    def test_status_without_frames_is_unknown(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-cb-status-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            MOD.queue(hive, f"watch this youtube {WATCH_URL}")
            got = MOD.read_result(hive, root=Path(tmp) / "outer")
            self.assertFalse(got["ok"])
            self.assertTrue(got["unknown"])
            self.assertNotIn("frames on disk", got["spoken"])


if __name__ == "__main__":
    unittest.main()
