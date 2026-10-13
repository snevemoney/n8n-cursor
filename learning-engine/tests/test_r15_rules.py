"""Locked regressions for R15: backup copy, realpath lock, strict temps, isolation raw."""

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

from learning_engine.cli import main as cli_main
from learning_engine.isolation import forbidden_outside_paths, parse_git_z
from learning_engine.isolation import main as isolation_main
from learning_engine.io_util import write_jsonl
from learning_engine.packet import base_packet, evidence_item
from learning_engine.storage.sqlite_index import (
    TEST_HOOKS_ENV,
    index_judgments,
    index_lock,
    index_packets,
    rebuild_from_jsonl,
    rebuild_tmp_name_re,
    resolve_index_path,
)


ENGINE = Path(__file__).resolve().parents[1]
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


def _store_cmd(db: Path, jsonl: Path, rebuild: bool = False) -> list[str]:
    cmd = [
        sys.executable,
        "-m",
        "learning_engine.cli",
        "store",
        "--packets",
        str(jsonl),
        "--sqlite",
        str(db),
    ]
    if rebuild:
        cmd.append("--rebuild")
    return cmd


def _integrity_ok(db: Path) -> bool:
    conn = sqlite3.connect(str(db))
    try:
        row = conn.execute("PRAGMA integrity_check").fetchone()
        return bool(row) and str(row[0]) == "ok"
    finally:
        conn.close()


def _counts(db: Path) -> tuple[int, int]:
    conn = sqlite3.connect(str(os.path.realpath(db)))
    try:
        packets = int(conn.execute("SELECT COUNT(*) FROM packets").fetchone()[0])
        judgments = int(conn.execute("SELECT COUNT(*) FROM judgments").fetchone()[0])
        return packets, judgments
    finally:
        conn.close()


def _wait_exists(path: Path, timeout: float = 10.0) -> None:
    deadline = time.time() + timeout
    while not path.exists():
        if time.time() > deadline:
            raise TimeoutError(f"timed out waiting for {path}")
        time.sleep(0.02)


class R15HotJournalRebuild(unittest.TestCase):
    def test_rebuild_after_killed_store_is_ok_or_unchanged(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            jsonl = Path(tmp) / "p.jsonl"
            packets = [_ok(signal_id=f"keep-{i}") for i in range(5)]
            write_jsonl(jsonl, packets)
            index_packets(db, packets)
            index_judgments(
                db,
                [
                    {
                        "source_type": "bookmark",
                        "signal_id": f"keep-{i}",
                        "provider": "kw",
                        "flagged": 0,
                        "label": "keep",
                    }
                    for i in range(5)
                ],
                run_id="seed",
            )
            conn = sqlite3.connect(str(db))
            conn.execute("PRAGMA journal_mode=DELETE")
            conn.close()
            child = subprocess.run(
                [
                    sys.executable,
                    "-c",
                    (
                        "import os, signal, sqlite3, sys\n"
                        "c = sqlite3.connect(sys.argv[1])\n"
                        "c.isolation_level = None\n"
                        "c.execute('PRAGMA journal_mode=DELETE')\n"
                        "c.execute('BEGIN IMMEDIATE')\n"
                        "c.execute("
                        "\"INSERT OR REPLACE INTO packets "
                        "(source_type, signal_id, body_json) "
                        "VALUES ('bookmark','hot-uncommitted','{}')\")\n"
                        "os.kill(os.getpid(), signal.SIGKILL)\n"
                    ),
                    str(db),
                ],
                check=False,
            )
            self.assertNotEqual(child.returncode, 0)
            before = db.read_bytes()
            rc, payload = 0, {}
            stderr = io.StringIO()
            stdout = io.StringIO()
            with mock.patch("sys.stderr", stderr), mock.patch("sys.stdout", stdout):
                rc = cli_main(
                    ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
                )
            if rc == 0:
                self.assertTrue(_integrity_ok(db))
                packets_n, judgments_n = _counts(db)
                self.assertEqual(packets_n, 5)
                self.assertEqual(judgments_n, 5)
                conn = sqlite3.connect(str(db))
                hot = conn.execute(
                    "SELECT COUNT(*) FROM packets WHERE signal_id='hot-uncommitted'"
                ).fetchone()[0]
                conn.close()
                self.assertEqual(hot, 0)
            else:
                err = json.loads(stderr.getvalue())
                self.assertFalse(err["ok"])
                self.assertTrue(err["error"])
                self.assertEqual(db.read_bytes(), before)

    def test_unrecoverable_source_leaves_file_unchanged(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            db.write_bytes(b"not-a-sqlite-database")
            before = db.read_bytes()
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            rc, err = _cli_err(
                ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
            )
            self.assertEqual(rc, 1)
            self.assertFalse(err["ok"])
            self.assertEqual(db.read_bytes(), before)


class R15RealpathLockAndSymlink(unittest.TestCase):
    def test_alias_and_real_share_lock_key(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            real_dir = Path(tmp) / "real"
            alias_dir = Path(tmp) / "alias"
            real_dir.mkdir()
            alias_dir.mkdir()
            real = real_dir / "idx.sqlite"
            alias = alias_dir / "idx.sqlite"
            index_packets(real, [_ok()])
            alias.symlink_to(real)
            self.assertEqual(resolve_index_path(alias), Path(os.path.realpath(real)))
            jsonl = Path(tmp) / "x.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="via-alias")])
            with index_lock(real):
                proc = subprocess.run(
                    _store_cmd(alias, jsonl, rebuild=True),
                    cwd=str(ENGINE),
                    env=_engine_env(),
                    capture_output=True,
                    text=True,
                    check=False,
                )
            self.assertEqual(proc.returncode, 1)
            self.assertEqual(json.loads(proc.stderr)["error"], "locked")

    def test_alias_rebuild_preserves_symlink(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            real_dir = Path(tmp) / "real"
            alias_dir = Path(tmp) / "alias"
            real_dir.mkdir()
            alias_dir.mkdir()
            real = real_dir / "idx.sqlite"
            alias = alias_dir / "idx.sqlite"
            index_packets(real, [_ok(signal_id="old")])
            index_judgments(
                real,
                [
                    {
                        "source_type": "bookmark",
                        "signal_id": "old",
                        "provider": "kw",
                        "flagged": 0,
                        "label": "keep",
                    }
                ],
                run_id="seed",
            )
            alias.symlink_to(real)
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="new")])
            stderr = io.StringIO()
            with mock.patch("sys.stderr", stderr):
                rc = cli_main(
                    [
                        "store",
                        "--packets",
                        str(jsonl),
                        "--sqlite",
                        str(alias),
                        "--rebuild",
                    ]
                )
            self.assertEqual(rc, 0, stderr.getvalue())
            self.assertTrue(alias.is_symlink())
            self.assertEqual(os.path.realpath(alias), os.path.realpath(real))
            self.assertTrue(_integrity_ok(real))
            packets_n, judgments_n = _counts(real)
            self.assertEqual(packets_n, 1)
            self.assertEqual(judgments_n, 1)

    def test_store_through_alias_racing_rebuild(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            real_dir = Path(tmp) / "real"
            alias_dir = Path(tmp) / "alias"
            real_dir.mkdir()
            alias_dir.mkdir()
            real = real_dir / "idx.sqlite"
            alias = alias_dir / "idx.sqlite"
            packets = [_ok(signal_id="keep")]
            index_packets(real, packets)
            index_judgments(
                real,
                [
                    {
                        "source_type": "bookmark",
                        "signal_id": "keep",
                        "provider": "kw",
                        "flagged": 0,
                        "label": "keep",
                    }
                ],
                run_id="seed",
            )
            alias.symlink_to(real)
            rebuild_jsonl = Path(tmp) / "rebuild.jsonl"
            store_jsonl = Path(tmp) / "store.jsonl"
            write_jsonl(rebuild_jsonl, [_ok(signal_id="keep")])
            write_jsonl(store_jsonl, [_ok(signal_id="alias-extra")])
            gate = Path(tmp) / "gate"
            proc_a = subprocess.Popen(
                _store_cmd(real, rebuild_jsonl, rebuild=True),
                cwd=str(ENGINE),
                env=_engine_env(
                    {
                        TEST_HOOKS_ENV: "1",
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
                proc_b = subprocess.run(
                    _store_cmd(alias, store_jsonl, rebuild=False),
                    cwd=str(ENGINE),
                    env=_engine_env(),
                    capture_output=True,
                    text=True,
                    check=False,
                )
                self.assertEqual(proc_b.returncode, 1)
                self.assertEqual(json.loads(proc_b.stderr)["error"], "locked")
                Path(str(gate) + ".resume").write_text("go", encoding="utf-8")
                _out_a, err_a = proc_a.communicate(timeout=15)
                rc_a = proc_a.returncode
            except Exception:
                proc_a.kill()
                proc_a.communicate()
                raise
            self.assertEqual(rc_a, 0, err_a)
            self.assertTrue(alias.is_symlink())
            self.assertTrue(_integrity_ok(real))
            _packets_n, judgments_n = _counts(real)
            self.assertEqual(judgments_n, 1)


class R15StrictTempNames(unittest.TestCase):
    def test_user_rebuilding_decoys_do_not_block_or_delete(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            index_packets(db, [_ok(signal_id="old")])
            name = db.name
            keep = db.parent / f"{name}.rebuilding.keep"
            bak = db.parent / f"{name}.rebuilding.old.bak"
            decoy_dir = db.parent / f"{name}.rebuilding.d"
            near = db.parent / f"{name}.rebuilding.123.zz"
            keep.write_text("user-keep", encoding="utf-8")
            bak.write_text("user-bak", encoding="utf-8")
            decoy_dir.mkdir()
            inside = decoy_dir / "stay.txt"
            inside.write_text("inside", encoding="utf-8")
            near.write_text("near-miss", encoding="utf-8")
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="new")])
            stderr = io.StringIO()
            with mock.patch("sys.stderr", stderr):
                rc = cli_main(
                    ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
                )
            self.assertEqual(rc, 0, stderr.getvalue())
            self.assertEqual(keep.read_text(encoding="utf-8"), "user-keep")
            self.assertEqual(bak.read_text(encoding="utf-8"), "user-bak")
            self.assertTrue(decoy_dir.is_dir())
            self.assertEqual(inside.read_text(encoding="utf-8"), "inside")
            self.assertEqual(near.read_text(encoding="utf-8"), "near-miss")
            pat = rebuild_tmp_name_re(name)
            self.assertIsNone(pat.fullmatch(keep.name))
            self.assertIsNone(pat.fullmatch(bak.name))
            self.assertIsNone(pat.fullmatch(decoy_dir.name))
            self.assertIsNone(pat.fullmatch(near.name))

    def test_legacy_rebuild_leaves_no_tmp_lock(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "legacy.sqlite"
            conn = sqlite3.connect(str(db))
            conn.executescript(R6_SCHEMA)
            conn.execute(
                "INSERT INTO packets (signal_id, source_type, body_json) "
                "VALUES ('legacy','bookmark','{}')"
            )
            conn.execute(
                "INSERT INTO judgments (signal_id, provider, flagged, label, body_json) "
                "VALUES ('legacy','kw',0,'keep','{}')"
            )
            conn.commit()
            conn.close()
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok(signal_id="new")])
            rc = cli_main(
                ["store", "--packets", str(jsonl), "--sqlite", str(db), "--rebuild"]
            )
            self.assertEqual(rc, 0)
            leftovers = [
                path
                for path in db.parent.iterdir()
                if ".rebuilding." in path.name and path.name.endswith(".lock")
            ]
            self.assertEqual(leftovers, [])


class R15IsolationRenameAndSymlink(unittest.TestCase):
    def test_rename_from_outside_is_rejected(self) -> None:
        raw = (
            ":100644 000000 abc def D\0apps/agent-stack/X\0"
            ":000000 100644 000 abc A\0learning-engine/X\0"
        )
        entries = parse_git_z(raw)
        self.assertEqual([e.path for e in entries], ["apps/agent-stack/X", "learning-engine/X"])
        stdout = io.StringIO()
        with mock.patch("sys.stdin", io.StringIO(raw)), mock.patch(
            "sys.argv", ["isolation"]
        ), mock.patch("sys.stdout", stdout):
            rc = isolation_main(None)
        self.assertEqual(rc, 1)
        self.assertIn("apps/agent-stack/X", stdout.getvalue())

    def test_symlink_add_inside_tree_is_rejected(self) -> None:
        raw = ":000000 120000 000 abc A\0learning-engine/evil\0"
        stdout = io.StringIO()
        with mock.patch("sys.stdin", io.StringIO(raw)), mock.patch(
            "sys.argv", ["isolation"]
        ), mock.patch("sys.stdout", stdout):
            rc = isolation_main(None)
        self.assertEqual(rc, 1)
        self.assertIn("learning-engine/evil", stdout.getvalue())

    def test_regular_tree_file_still_allowed(self) -> None:
        raw = ":100644 100644 abc def M\0learning-engine/foo.py\0"
        stdout = io.StringIO()
        with mock.patch("sys.stdin", io.StringIO(raw)), mock.patch(
            "sys.argv", ["isolation"]
        ), mock.patch("sys.stdout", stdout):
            rc = isolation_main(None)
        self.assertEqual(rc, 0)

    def test_empty_stdin_still_errors(self) -> None:
        stdout = io.StringIO()
        with mock.patch("sys.stdin", io.StringIO("")), mock.patch(
            "sys.argv", ["isolation"]
        ), mock.patch("sys.stdout", stdout):
            rc = isolation_main(None)
        self.assertEqual(rc, 1)
        self.assertIn("empty path list", stdout.getvalue())


class R15WorkflowRawDiff(unittest.TestCase):
    @unittest.skipUnless(WORKFLOW.is_file(), "learning-engine.yml is not present")
    def test_isolation_step_uses_raw_no_renames_z(self) -> None:
        text = WORKFLOW.read_text(encoding="utf-8")
        self.assertIn("set -euo pipefail", text)
        self.assertIn("git diff --raw --no-renames -z", text)


class R15EvalFailureAndRoot(unittest.TestCase):
    def test_eval_locked_has_path_and_does_not_write_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            jsonl = Path(tmp) / "p.jsonl"
            report = Path(tmp) / "report.json"
            write_jsonl(jsonl, [_ok()])
            index_packets(db, [_ok()])
            with index_lock(db):
                proc = subprocess.run(
                    [
                        sys.executable,
                        "-m",
                        "learning_engine",
                        "eval",
                        "--provider",
                        "lexicon",
                        "--packets",
                        str(jsonl),
                        "--output",
                        str(report),
                        "--sqlite",
                        str(db),
                    ],
                    cwd=str(ENGINE),
                    env=_engine_env(),
                    capture_output=True,
                    text=True,
                    check=False,
                )
            self.assertEqual(proc.returncode, 1, proc.stderr)
            err = json.loads(proc.stderr)
            self.assertEqual(err["error"], "locked")
            self.assertIn("path", err)
            self.assertTrue(err["path"])
            self.assertFalse(report.exists())

    def test_empty_root_is_json_rc1(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            rc, err = _cli_err(["validate", "--input", str(jsonl), "--root", ""])
            self.assertEqual(rc, 1)
            self.assertFalse(err["ok"])
            self.assertIn("not a directory", err["error"])

    def test_pause_hook_inert_without_test_hooks(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            db = Path(tmp) / "idx.sqlite"
            jsonl = Path(tmp) / "p.jsonl"
            write_jsonl(jsonl, [_ok()])
            index_packets(db, [_ok(signal_id="old")])
            gate = Path(tmp) / "gate"
            env = _engine_env(
                {
                    "LEARNING_ENGINE_PAUSE_REBUILD": "after_copy",
                    "LEARNING_ENGINE_REBUILD_GATE": str(gate),
                }
            )
            env.pop(TEST_HOOKS_ENV, None)
            proc = subprocess.run(
                _store_cmd(db, jsonl, rebuild=True),
                cwd=str(ENGINE),
                env=env,
                capture_output=True,
                text=True,
                check=False,
                timeout=10,
            )
            self.assertEqual(proc.returncode, 0, proc.stderr)
            self.assertFalse(gate.exists())


class R15IsolationPathsStillWork(unittest.TestCase):
    def test_padded_path_still_rejected(self) -> None:
        bad = forbidden_outside_paths([" learning-engine/evil.sh", "learning-engine/ok.py"])
        self.assertEqual(bad, [" learning-engine/evil.sh"])


if __name__ == "__main__":
    unittest.main()
