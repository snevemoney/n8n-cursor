#!/usr/bin/env python3
"""Contract tests. Temp fixtures only. No Face. No live hive."""
from __future__ import annotations

import json
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import contracts as C  # noqa: E402
import races as R  # noqa: E402


class ScoreboardTest(unittest.TestCase):
    def test_draft_validates_and_keeps_9a_off_9b(self) -> None:
        board = C.draft_scoreboard()
        self.assertEqual(C.validate_scoreboard(board), [])
        by_id = {row["id"]: row for row in board["rows"]}
        self.assertEqual(by_id["chatgpt_sessions"]["layer"], "session")
        self.assertEqual(by_id["chatgpt_job_start"]["layer"], "harness")
        self.assertEqual(by_id["chatgpt_job_start"]["status"], "UNAVAILABLE")
        self.assertEqual(by_id["claude_code_worker"]["status"], "UNAVAILABLE")
        self.assertEqual(by_id["codex_worker"]["status"], "UNAVAILABLE")
        self.assertEqual(board["kpis"]["manual_context_transfers"]["target"], 0)

    def test_session_read_cannot_pass_a_worker(self) -> None:
        self.assertTrue(
            C.worker_pass_from_session_read(
                "codex_worker", "harness", "PASS", "sessions.read history"
            )
        )
        board = C.draft_scoreboard()
        for row in board["rows"]:
            if row["id"] == "codex_worker":
                row["status"] = "PASS"
                row["probe"] = "read local Codex session"
        errors = C.validate_scoreboard(board)
        self.assertTrue(any("session-read" in e for e in errors))

    def test_stale_row_decays_to_unproven(self) -> None:
        old = "2026-01-01T00:00:00Z"
        self.assertEqual(C.decay_status("PASS", old), "UNPROVEN")
        self.assertEqual(C.decay_status("UNAVAILABLE", old), "UNAVAILABLE")


class SessionTest(unittest.TestCase):
    def test_freshness_source_newer_than_index_is_stale(self) -> None:
        self.assertEqual(
            C.freshness_status(
                source_mtime="2026-09-12T20:00:00Z",
                indexed_at="2026-09-12T18:00:00Z",
            ),
            "stale",
        )

    def test_freshness_unknown_without_times(self) -> None:
        self.assertEqual(C.freshness_status(source_mtime=None, indexed_at=None), "unknown")

    def test_expired_source_is_stale(self) -> None:
        now = datetime(2026, 9, 12, tzinfo=timezone.utc)
        src = (now - timedelta(days=3)).strftime("%Y-%m-%dT%H:%M:%SZ")
        self.assertEqual(
            C.freshness_status(source_mtime=src, indexed_at=src, stale_after_sec=86400, now=now),
            "stale",
        )

    def test_file_history_is_not_native_resume(self) -> None:
        self.assertTrue(C.continuation_available("new_handoff"))
        self.assertFalse(
            C.continuation_honest(mode="new_handoff", available=True, claimed_native=True)
        )
        self.assertTrue(
            C.continuation_honest(mode="new_handoff", available=True, claimed_native=False)
        )
        self.assertFalse(C.continuation_available("unavailable"))

    def test_external_session_rejects_fresh_lie(self) -> None:
        row = {
            "platform": "claude",
            "surface": "file",
            "native_session_id": "abc",
            "title": "Jarvis",
            "source_path": "/tmp/claude.md",
            "source_mtime": "2026-09-12T20:00:00Z",
            "indexed_at": "2026-09-12T18:00:00Z",
            "freshness_status": "fresh",
            "continuation_available": False,
            "continuation_mode": "unavailable",
            "provenance": "fixture",
        }
        errors = C.validate_external_session(row)
        self.assertTrue(any("freshness" in e for e in errors))

    def test_external_session_accepts_handoff_mode(self) -> None:
        fresh_at = C.now_iso()
        row = {
            "platform": "codex",
            "surface": "file",
            "native_session_id": "job-1",
            "title": "Watch fence",
            "machine": "mac",
            "workspace": "n8n-cursor",
            "project": "jarvis",
            "branch": "cursor/jarvis-one-pipeline-4282",
            "worktree": None,
            "source_path": "CONTENT/os/sessions/codex/x.md",
            "source_mtime": fresh_at,
            "indexed_at": fresh_at,
            "freshness_status": "fresh",
            "continuation_available": True,
            "continuation_mode": "new_handoff",
            "parent_session": "jarvis-sitting-1",
            "handoff_from": "cursor",
            "handoff_to": None,
            "provenance": "local file",
        }
        self.assertEqual(C.validate_external_session(row), [])


class AuthorityTest(unittest.TestCase):
    def test_conflict_picks_live_vault_and_does_not_blend(self) -> None:
        got = C.resolve_authority(
            [
                {"source": "cursor_live", "claim": "A"},
                {"source": "stale_session", "claim": "B"},
                {"source": "live_vault", "claim": "C"},
            ]
        )
        self.assertTrue(got["conflict"])
        self.assertTrue(got["surfaced"])
        self.assertFalse(got["blended"])
        self.assertEqual(got["chosen"], "C")
        self.assertEqual(got["chosen_source"], "live_vault")
        self.assertTrue(got["ok"])

    def test_authority_chain_requires_five_links(self) -> None:
        self.assertTrue(C.validate_authority_chain({}))
        self.assertEqual(
            C.validate_authority_chain(
                {
                    "requested_by": "evens",
                    "routed_by": "jarvis",
                    "executed_by": "cursor",
                    "evidence_from": "live_vault",
                    "verified_by": "jarvis",
                }
            ),
            [],
        )


class HandoffTest(unittest.TestCase):
    def test_whole_transcript_fails(self) -> None:
        dump = "x" * 5000
        got = C.handoff_efficient(selected=dump, whole_transcript=dump, required=["fence"])
        self.assertFalse(got["ok"])
        self.assertTrue(got["whole_transcript"])

    def test_selected_facts_pass(self) -> None:
        got = C.handoff_efficient(
            selected="Stop is a generation fence. Live vault wins.",
            whole_transcript="Stop is a generation fence. Live vault wins." + (" pad" * 400),
            required=["generation fence", "Live vault"],
        )
        self.assertTrue(got["ok"])
        self.assertLessEqual(got["chars"], C.HANDOFF_CHAR_CAP)


class RaceTest(unittest.TestCase):
    def test_repeat_stale_and_tts_are_100(self) -> None:
        out = R.suite(100)
        self.assertEqual(out["stale_generation_rejected"]["status"], "PASS")
        self.assertEqual(out["stale_generation_rejected"]["n_ok"], 100)
        self.assertEqual(out["stop_during_tts"]["status"], "PASS")
        self.assertEqual(out["duplicate_action_blocked"]["status"], "UNPROVEN")
        self.assertTrue(R.duplicate_action_blocked(frame_id="1", prior_frame="1", same_target=True, ui_changed=False))
        self.assertFalse(R.duplicate_action_blocked(frame_id="2", prior_frame="1", same_target=True, ui_changed=True))

    def test_silent_think_is_a_defect(self) -> None:
        self.assertTrue(C.silent_state(job_status="done", phase="think", turning=True, spoken="Stopped."))
        self.assertFalse(C.silent_state(job_status="working", phase="think", turning=True, spoken=""))


class DraftFileTest(unittest.TestCase):
    def test_write_draft_roundtrip(self) -> None:
        import tempfile

        with tempfile.TemporaryDirectory(prefix="eval-draft-") as tmp:
            path = Path(tmp) / "scoreboard.draft.json"
            C.write_draft_scoreboard(path)
            board = json.loads(path.read_text(encoding="utf-8"))
            self.assertEqual(C.validate_scoreboard(board), [])

    def test_historical_stamp_cannot_refresh_old_evidence(self) -> None:
        board = C.apply_bite3_verifier_stamp(C.draft_scoreboard(), checked_at=C.now_iso())
        rows = {row["id"]: row for row in board["rows"]}
        for name in ("stop", "voice"):
            self.assertEqual(rows[name]["checked_at"], "2026-09-13T02:11:19Z")
            self.assertEqual(rows[name]["status"], "UNPROVEN")
            self.assertTrue(C.scoreboard_row_stale(rows[name]["checked_at"]))
        self.assertEqual(C.validate_scoreboard(board), [])

    def test_bite3_stamp_validates_and_leaves_watch_unproven(self) -> None:
        board = C.apply_bite3_verifier_stamp(C.draft_scoreboard(), checked_at="2026-09-13T02:12:00Z")
        self.assertEqual(C.validate_scoreboard(board), [])
        by_id = {row["id"]: row for row in board["rows"]}
        self.assertEqual(by_id["stop"]["status"], "PASS")
        self.assertEqual(by_id["voice"]["status"], "PASS")
        self.assertEqual(by_id["watch"]["status"], "UNPROVEN")
        self.assertEqual(by_id["mac_computer"]["status"], "UNPROVEN")
        self.assertEqual(by_id["chatgpt_job_start"]["status"], "UNAVAILABLE")
        self.assertEqual(by_id["stop"]["n_ok"], 2)
        self.assertEqual(by_id["voice"]["n_ok"], 2)

    def test_mac_computer_stamp_pass_only_on_live_eight(self) -> None:
        dry = C.apply_mac_computer_stamp(
            C.draft_scoreboard(),
            {"ok": True, "live": False, "n_runs": 8, "n_ok": 8, "artifact": "eval/computer/last.json"},
            checked_at="2026-09-14T04:00:00Z",
        )
        self.assertEqual({row["id"]: row for row in dry["rows"]}["mac_computer"]["status"], "UNPROVEN")
        wait = C.apply_mac_computer_stamp(
            C.draft_scoreboard(),
            {
                "ok": False,
                "live": False,
                "n_runs": 8,
                "n_ok": 3,
                "artifact": "eval/computer/last.json",
                "rows": [{"spoken": "needs-input: Evens must arm Watch"}],
            },
            checked_at="2026-09-14T04:00:30Z",
        )
        self.assertEqual({row["id"]: row for row in wait["rows"]}["mac_computer"]["status"], "UNPROVEN")
        miss = C.apply_mac_computer_stamp(
            C.draft_scoreboard(),
            {"ok": False, "live": True, "n_runs": 8, "n_ok": 7, "artifact": "eval/computer/last.json"},
            checked_at="2026-09-14T04:01:00Z",
        )
        self.assertEqual({row["id"]: row for row in miss["rows"]}["mac_computer"]["status"], "FAIL")
        hit = C.apply_mac_computer_stamp(
            C.draft_scoreboard(),
            {"ok": True, "live": True, "n_runs": 8, "n_ok": 8, "artifact": "eval/computer/last.json"},
            checked_at="2026-09-14T04:02:00Z",
        )
        self.assertEqual(C.validate_scoreboard(hit), [])
        self.assertEqual({row["id"]: row for row in hit["rows"]}["mac_computer"]["status"], "PASS")
        self.assertEqual({row["id"]: row for row in hit["rows"]}["mac_computer"]["n_ok"], 8)

    def test_conversation_p0_stays_fail_until_observed_pass(self) -> None:
        board = C.apply_conversation_p0_open(C.draft_scoreboard(), checked_at="2026-09-13T03:00:00Z")
        self.assertEqual(C.validate_scoreboard(board), [])
        by_id = {row["id"]: row for row in board["rows"]}
        self.assertEqual(by_id["conversation"]["status"], "FAIL")
        self.assertIn("P0 conversation routed through store", by_id["conversation"]["reason"])
        self.assertEqual(board["defects"]["p0"], 1)
        self.assertEqual(by_id["watch"]["status"], "UNPROVEN")
        passed = C.apply_conversation_verifier_stamp(
            board,
            checked_at="2026-09-13T03:10:00Z",
            n_runs=3,
            n_ok=3,
            reason="independent Face verifier PASS; general MODEL_TALK; private miss HONEST_UNKNOWN; recovery talk",
            p50_ms=100,
            p95_ms=200,
            max_ms=200,
        )
        self.assertEqual(C.validate_scoreboard(passed), [])
        by_id = {row["id"]: row for row in passed["rows"]}
        self.assertEqual(by_id["conversation"]["status"], "PASS")
        self.assertEqual(passed["defects"]["p0"], 0)
        self.assertEqual(by_id["watch"]["status"], "UNPROVEN")


if __name__ == "__main__":
    unittest.main()
