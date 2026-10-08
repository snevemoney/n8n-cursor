"""Locked regressions for R14: rebuild lock, isolation holes, should-fixes."""

from __future__ import annotations

import io
import json
import os
import sqlite3
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest import mock

from fixtures.tiny_png import MINIMAL_FTYP_MP4, PNG_1X1
from learning_engine.adapters import corpus_reingest, youtube_l2
from learning_engine.cli import main as cli_main
from learning_engine.errors import LockedError, PacketValidationError
from learning_engine.isolation import forbidden_outside_paths
from learning_engine.isolation import main as isolation_main
from learning_engine.io_util import write_jsonl
from learning_engine.packet import base_packet, evidence_item
from learning_engine.storage.sqlite_index import (
    index_judgments,
    index_packets,
    index_lock,
    rebuild_from_jsonl,
)
from learning_engine.validator import (
    MEDIA_HEAD_BYTES,
    _read_media_head,
    confine_evidence_ref,
    count_false_full_visual,
    evidence_media_ok,
    validate_packet,
)


ENGINE = Path(__file__).resolve().parents[1]
ROOT = ENGINE
WORKFLOW = ENGINE.parent / ".github" / "workflows" / "learning-engine.yml"

R6_SCHEMA = """
CREATE TABLE IF NOT EXISTS packets (
    signal_id TEXT PRIMARY KEY,
    source_type TEXT,
    content_access TEXT,
    analysis_scope TEXT,
    verification_state TEXT,
    processing_status TEXT,
    lifecycle_state TEXT,
    source_url TEXT,
    adapter TEXT,
    body_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS judgments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    signal_id TEXT,
    provider TEXT,
    flagged INTEGER,
    label TEXT,
    latency_ms REAL,
    cost_usd REAL,
    body_json TEXT NOT NULL
);
"""


def _ok(**overrides):
    packet = base_packet(
        signal_id="syn-ok",
        source_type="bookmark",
        content_access="transcript",
        analysis_scope="transcript",
        source_text="Post shows an agent loop with a verifier harness",
        evidence=[evidence_item(kind="field", source_ref="REVIEW.csv:gist")],
        verification_state="unknown",
        processing_status="ok",
        lifecycle_state="analyzed",
        evidence_base=".",
    )
    packet.update(overrides)
    return packet


def _full_visual(image_ref: str, video_ref: str):
    return _ok(
        content_access="full_visual",
        analysis_scope="full_visual",
        evidence=[
            evidence_item(kind="frame", source_ref=image_ref),
            evidence_item(kind="file", source_ref=video_ref, note="video"),
        ],
    )


def _cli_err(argv: list[str]) -> tuple[int, dict]:
    stderr = io.StringIO()
    stdout = io.StringIO()
    with mock.patch("sys.stderr", stderr), mock.patch("sys.stdout", stdout):
        rc = cli_main(argv)
    combined = stderr.getvalue() + stdout.getvalue()
    if "Traceback" in combined:
        raise AssertionError(f"traceback leaked:\n{combined}")
    return rc, json.loads(stderr.getvalue())


def _engine_env(extra: dict[str, str] | None = None) -> dict[str, str]:
    env = os.environ.copy()
    env["PYTHONPATH"] = str(ENGINE)
    if extra:
        env.update(extra)
    return env


def _rebuild_cmd(db: Path, jsonl: Path) -> list[str]:
    return [
        sys.executable,
        "-m",
        "learning_engine.cli",
        "store",
        "--packets",
        str(jsonl),
        "--sqlite",
        str(db),
        "--rebuild",
    ]


def _integrity_ok(db: Path) -> bool:
    conn = sqlite3.connect(str(db))
    try:
        row = conn.execute("PRAGMA integrity_check").fetchone()
        return bool(row) and str(row[0]) == "ok"
    finally:
        conn.close()


def _db_counts(db: Path) -> tuple[int, int, set[str]]:
    conn = sqlite3.connect(str(db))
    try:
        packets = int(conn.execute("SELECT COUNT(*) FROM packets").fetchone()[0])
        judgments = int(conn.execute("SELECT COUNT(*) FROM judgments").fetchone()[0])
        types = {
            str(row[0])
            for row in conn.execute("SELECT DISTINCT source_type FROM packets")
        }
        return packets, judgments, types
    finally:
        conn.close()


def _seed_index(db: Path, jsonl: Path) -> tuple[int, int, set[str]]:
    packets = []
    for source_type, n in (("bookmark", 10), ("corpus", 10), ("youtube_l2", 10)):
        for i in range(n):
            packets.append(_ok(signal_id=f"{source_type}-{i}", source_type=source_type))
    index_packets(db, packets)
    write_jsonl(jsonl, packets)
    judgments = []
    for i, packet in enumerate(packets):
        judgments.append(
            {
                "source_type": packet["source_type"],
                "signal_id": packet["signal_id"],
                "provider": "kw",
                "flagged": i % 2,
                "label": "keep",
            }
        )
    for i in range(10):
        judgments.append(
            {
                "source_type": "bookmark",
                "signal_id": "bookmark-0",
                "provider": f"extra-{i}",
                "flagged": 0,
                "label": "keep",
            }
        )
    index_judgments(db, judgments, run_id="run-seed")
    return _db_counts(db)


def _wait_exists(path: Path, timeout: float = 10.0) -> None:
    deadline = time.time() + timeout
    while not path.exists():
        if time.time() > deadline:
            raise TimeoutError(f"timed out waiting for {path}")
        time.sleep(0.02)


def _stderr_json(text: str) -> dict:
    line = text.strip().splitlines()[-1] if text.strip() else ""
    return json.loads(line)


def _fv_ids(packets: list[dict]) -> list[str]:
    return sorted(
        str(packet["signal_id"])
        for packet in packets
        if packet.get("content_access") == "full_visual"
        or packet.get("analysis_scope") == "full_visual"
    )


class R14RebuildLockInterleave(unittest.TestCase):
    def test_forced_interleave_one_locked_judgments_kept(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            db = root / "idx.sqlite"
            jsonl = root / "all.jsonl"
            expected_p, expected_j, expected_types = _seed_index(db, jsonl)
            gate = root / "gate"
            proc_a = subprocess.Popen(
                _rebuild_cmd(db, jsonl),
                cwd=str(ENGINE),
                env=_engine_env(
                    {
                        "LEARNING_ENGINE_PAUSE_REBUILD": "after_copy",
                        "LEARNING_ENGINE_REBUILD_GATE": str(gate),
                    }
                ),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            try:
                _wait_exists(gate)
                temps = list(root.glob(db.name + ".rebuilding.*"))
                self.assertTrue(temps, "A must leave a unique live temp after copy")
                before_b = db.read_bytes()
                proc_b = subprocess.run(
                    _rebuild_cmd(db, jsonl),
                    cwd=str(ENGINE),
                    env=_engine_env(),
                    capture_output=True,
                    text=True,
                    check=False,
                )
                self.assertEqual(proc_b.returncode, 1)
                err_b = _stderr_json(proc_b.stderr)
                self.assertEqual(err_b["error"], "locked")
                self.assertEqual(db.read_bytes(), before_b)
                self.assertTrue(all(path.is_file() for path in temps))
                Path(str(gate) + ".resume").write_text("go", encoding="utf-8")
                rc_a = proc_a.wait(timeout=15)
                out_a, err_a = proc_a.communicate()
            except Exception:
                proc_a.kill()
                raise
            self.assertEqual(rc_a, 0, err_a)
            self.assertNotIn("Traceback", (out_a or "") + (err_a or ""))
            self.assertTrue(_integrity_ok(db))
            packets, judgments, types = _db_counts(db)
            self.assertEqual(packets, expected_p)
            self.assertEqual(judgments, expected_j)
            self.assertEqual(types, expected_types)


class R14RebuildLockStress(unittest.TestCase):
    def test_natural_race_twenty_trials(self) -> None:
        trials = 20
        for trial in range(trials):
            with tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                db = root / "idx.sqlite"
                jsonl = root / "all.jsonl"
                expected_p, expected_j, expected_types = _seed_index(db, jsonl)
                procs = [
                    subprocess.Popen(
                        _rebuild_cmd(db, jsonl),
                        cwd=str(ENGINE),
                        env=_engine_env(),
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True,
                    )
                    for _ in range(2)
                ]
                results = []
                for proc in procs:
                    out, err = proc.communicate(timeout=20)
                    results.append((proc.returncode, out, err))
                self.assertTrue(
                    _integrity_ok(db), f"trial {trial} integrity_check failed"
                )
                packets, judgments, types = _db_counts(db)
                lost = (
                    packets < expected_p
                    or judgments < expected_j
                    or types != expected_types
                )
                rcs = [rc for rc, _, _ in results]
                if rcs == [0, 0] and lost:
                    self.fail(
                        f"trial {trial} both rc 0 with lost rows "
                        f"packets={packets}/{expected_p} judgments={judgments}/{expected_j} "
                        f"types={types}"
                    )
                self.assertFalse(
                    lost,
                    f"trial {trial} lost rows rcs={rcs} "
                    f"packets={packets}/{expected_p} judgments={judgments}/{expected_j} "
                    f"types={types} stderr={[err for _, _, err in results]}",
                )
                for rc, _, err in results:
                    if rc != 0:
                        payload = _stderr_json(err)
                        self.assertEqual(payload["error"], "locked", payload)
                self.assertTrue(
                    0 in rcs,
                    f"trial {trial} no successful rebuild rcs={rcs} "
                    f"stderr={[err for _, _, err in results]}",
                )


class R14IsolationNormalize(unittest.TestCase):
    def test_rejects_whitespace_controls_empty_dotdot_absolute(self) -> None:
        bad = forbidden_outside_paths(
            [
                " learning-engine/evil.sh",
                "learning-engine/evil.sh ",
                "learning-engine/\tevil.sh",
                "learning-engine/\x00evil.sh",
                "learning-engine/evil\x7f.sh",
                "",
                "..",
                "../learning-engine/foo.py",
                "learning-engine/../apps/x",
                "/learning-engine/foo.py",
                "learning-engine/ok.py",
            ]
        )
        self.assertIn(" learning-engine/evil.sh", bad)
        self.assertIn("learning-engine/evil.sh ", bad)
        self.assertIn("learning-engine/\tevil.sh", bad)
        self.assertIn("learning-engine/\x00evil.sh", bad)
        self.assertIn("learning-engine/evil\x7f.sh", bad)
        self.assertIn("", bad)
        self.assertIn("..", bad)
        self.assertIn("../learning-engine/foo.py", bad)
        self.assertIn("learning-engine/../apps/x", bad)
        self.assertIn("/learning-engine/foo.py", bad)
        self.assertNotIn("learning-engine/ok.py", bad)

    def test_empty_stdin_is_error_unless_allow_empty(self) -> None:
        stdout = io.StringIO()
        with mock.patch("sys.stdin", io.StringIO("")), mock.patch("sys.stdout", stdout):
            rc = isolation_main([])
        self.assertEqual(rc, 1)
        self.assertIn("empty path list", stdout.getvalue())

        stdout = io.StringIO()
        with mock.patch("sys.stdin", io.StringIO("")), mock.patch(
            "sys.argv", ["isolation"]
        ), mock.patch("sys.stdout", stdout):
            rc = isolation_main(None)
        self.assertEqual(rc, 1)
        self.assertIn("empty path list", stdout.getvalue())

        stdout = io.StringIO()
        with mock.patch("sys.stdout", stdout):
            rc = isolation_main(["--allow-empty"])
        self.assertEqual(rc, 0)

        stdout = io.StringIO()
        with mock.patch("sys.stdin", io.StringIO("")), mock.patch(
            "sys.argv", ["isolation", "--allow-empty"]
        ), mock.patch("sys.stdout", stdout):
            rc = isolation_main(None)
        self.assertEqual(rc, 0)


class R14WorkflowPipefail(unittest.TestCase):
    def test_isolation_step_uses_bash_pipefail(self) -> None:
        text = WORKFLOW.read_text(encoding="utf-8")
        self.assertIn("shell: bash", text)
        self.assertIn("set -euo pipefail", text)
        self.assertIn("git diff --name-only", text)


class R14EvidenceConfine(unittest.TestCase):
    def test_rejects_dotdot_absolute_and_outside_symlink(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "root"
            outside = Path(tmp) / "outside"
            root.mkdir()
            outside.mkdir()
            (root / "frame.png").write_bytes(PNG_1X1)
            (root / "clip.mp4").write_bytes(MINIMAL_FTYP_MP4)
            (outside / "secret.png").write_bytes(PNG_1X1)
            link = root / "escape.png"
            link.symlink_to(outside / "secret.png")

            with self.assertRaises(PacketValidationError) as ctx:
                validate_packet(
                    _ok(evidence=[evidence_item(kind="field", source_ref="../secret")]),
                    root=root,
                )
            self.assertIn("escapes --root", str(ctx.exception))

            with self.assertRaises(PacketValidationError):
                confine_evidence_ref("../secret", root)

            with self.assertRaises(PacketValidationError) as ctx:
                validate_packet(
                    _ok(
                        evidence=[
                            evidence_item(kind="field", source_ref=str(outside / "secret.png"))
                        ]
                    ),
                    root=root,
                )
            self.assertIn("escapes --root", str(ctx.exception))

            with self.assertRaises(PacketValidationError) as ctx:
                validate_packet(_full_visual("escape.png", "clip.mp4"), root=root)
            self.assertIn("escapes --root", str(ctx.exception))

            validate_packet(_full_visual("frame.png", "clip.mp4"), root=root)

    def test_corpus_youtube_known_roots_same_full_visual(self) -> None:
        pairs = [
            (corpus_reingest, ROOT / "fixtures" / "corpus"),
            (youtube_l2, ROOT / "fixtures" / "youtube_l2"),
            (youtube_l2, ROOT / "fixtures" / "youtube_burnin"),
            (youtube_l2, ROOT / "fixtures" / "youtube_repass"),
        ]
        for adapter, convert_root in pairs:
            packets = adapter.convert(convert_root)
            before = _fv_ids(packets)
            for packet in packets:
                validate_packet(packet, root=convert_root)
            self.assertEqual(_fv_ids(packets), before, convert_root)
            self.assertEqual(count_false_full_visual(packets, root=convert_root), 0)


class R14MediaHeadBytes(unittest.TestCase):
    def test_media_reads_only_first_64_bytes(self) -> None:
        self.assertEqual(MEDIA_HEAD_BYTES, 64)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            huge = root / "frame.png"
            huge.write_bytes(PNG_1X1 + (b"\x00" * 1_000_000))
            (root / "clip.mp4").write_bytes(MINIMAL_FTYP_MP4)
            reads: list[int] = []
            real_open = Path.open

            def spy(self, *args, **kwargs):
                handle = real_open(self, *args, **kwargs)
                orig = handle.read

                def read(n: int = -1):
                    reads.append(n)
                    return orig(n)

                handle.read = read  # type: ignore[method-assign]
                return handle

            item = evidence_item(kind="frame", source_ref="frame.png")
            with mock.patch.object(Path, "open", spy):
                self.assertTrue(evidence_media_ok(item, root))
                head = _read_media_head(huge)
            self.assertEqual(len(head), 64)
            self.assertTrue(reads)
            self.assertTrue(all(isinstance(n, int) and 0 < n <= 64 for n in reads))
            validate_packet(_full_visual("frame.png", "clip.mp4"), root=root)


class R14MigratingDirAbort(unittest.TestCase):
    def test_migrating_directory_aborts_and_writes_nothing(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "legacy.sqlite"
            conn = sqlite3.connect(str(db))
            conn.executescript(R6_SCHEMA)
            conn.execute(
                "INSERT INTO packets (signal_id, source_type, body_json) VALUES ('legacy','bookmark','{}')"
            )
            conn.execute(
                "INSERT INTO judgments (signal_id, provider, flagged, label, body_json) "
                "VALUES ('legacy','kw',0,'keep','{}')"
            )
            conn.commit()
            conn.close()
            before = db.read_bytes()
            migrating = Path(str(db) + ".migrating")
            migrating.mkdir()
            keep = migrating / "keep"
            keep.write_text("stay", encoding="utf-8")
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="new")])
            rc, err = _cli_err(
                ["store", "--packets", str(jsonl), "--sqlite", str(db)]
            )
            self.assertEqual(rc, 1)
            self.assertFalse(err["ok"])
            self.assertIn("not a regular file", err["error"])
            self.assertEqual(err["path"], str(migrating))
            self.assertEqual(db.read_bytes(), before)
            self.assertTrue(migrating.is_dir())
            self.assertEqual(keep.read_text(encoding="utf-8"), "stay")


class R14ValidateNonexistentRoot(unittest.TestCase):
    def test_nonexistent_root_is_json_rc1(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            rc, err = _cli_err(
                ["validate", "--input", str(jsonl), "--root", "/nonexistent"]
            )
            self.assertEqual(rc, 1)
            self.assertFalse(err["ok"])
            self.assertIn("not a directory", err["error"])
            self.assertEqual(err["path"], "/nonexistent")

            missing = Path(tmp) / "missing.jsonl"
            rc2, err2 = _cli_err(
                ["validate", "--input", str(missing), "--root", "/nonexistent"]
            )
            self.assertEqual(rc2, 1)
            self.assertFalse(err2["ok"])
            self.assertIn("not a directory", err2["error"])


class R14JournalSidesSurviveFailedFirstRebuild(unittest.TestCase):
    def test_failed_first_rebuild_keeps_journal_wal_shm(self) -> None:
        import learning_engine.storage.sqlite_index as idx

        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "fresh.sqlite"
            journal = Path(str(db) + "-journal")
            wal = Path(str(db) + "-wal")
            shm = Path(str(db) + "-shm")
            journal.write_text("user-journal", encoding="utf-8")
            wal.write_text("user-wal", encoding="utf-8")
            shm.write_text("user-shm", encoding="utf-8")
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            idx.FAIL_REBUILD_AFTER = "after_delete"
            try:
                with self.assertRaises(Exception):
                    rebuild_from_jsonl(db, jsonl)
            finally:
                idx.FAIL_REBUILD_AFTER = None
            self.assertEqual(journal.read_text(encoding="utf-8"), "user-journal")
            self.assertEqual(wal.read_text(encoding="utf-8"), "user-wal")
            self.assertEqual(shm.read_text(encoding="utf-8"), "user-shm")
            self.assertFalse(db.exists())


class R14LockReentrantAndLockedJson(unittest.TestCase):
    def test_same_process_reentrant_other_process_locked(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            index_packets(db, [_ok()])
            with index_lock(db):
                with index_lock(db):
                    proc = subprocess.run(
                        _rebuild_cmd(db, jsonl),
                        cwd=str(ENGINE),
                        env=_engine_env(),
                        capture_output=True,
                        text=True,
                        check=False,
                    )
                self.assertEqual(proc.returncode, 1)
                err = _stderr_json(proc.stderr)
                self.assertEqual(err["error"], "locked")
            self.assertEqual(str(LockedError(str(db) + ".lock")), "locked")


if __name__ == "__main__":
    unittest.main()
