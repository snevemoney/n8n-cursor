"""SQLite derived index over packets and judgments. stdlib sqlite3 only.

JSONL is the source of truth. SQLite is a rebuildable index. Packet identity
is (source_type, signal_id) so the same id from bookmark, corpus, and
youtube_l2 are three rows. Judgments are unique per
(run_id, source_type, signal_id, provider).
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from learning_engine.io_util import read_jsonl

SCHEMA = """
CREATE TABLE IF NOT EXISTS packets (
    source_type TEXT NOT NULL,
    signal_id TEXT NOT NULL,
    content_access TEXT,
    analysis_scope TEXT,
    verification_state TEXT,
    processing_status TEXT,
    lifecycle_state TEXT,
    source_url TEXT,
    adapter TEXT,
    body_json TEXT NOT NULL,
    PRIMARY KEY (source_type, signal_id)
);
CREATE TABLE IF NOT EXISTS runs (
    run_id TEXT PRIMARY KEY,
    started_at TEXT,
    provider TEXT,
    notes TEXT
);
CREATE TABLE IF NOT EXISTS judgments (
    run_id TEXT NOT NULL,
    source_type TEXT NOT NULL,
    signal_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    flagged INTEGER,
    label TEXT,
    latency_ms REAL,
    cost_usd REAL,
    body_json TEXT NOT NULL,
    PRIMARY KEY (run_id, source_type, signal_id, provider)
);
CREATE TABLE IF NOT EXISTS harness_results (
    run_id TEXT PRIMARY KEY,
    body_json TEXT NOT NULL,
    FOREIGN KEY (run_id) REFERENCES runs(run_id)
);
CREATE INDEX IF NOT EXISTS idx_packets_source ON packets(source_type);
CREATE INDEX IF NOT EXISTS idx_judgments_run ON judgments(run_id);
"""


def _packets_schema_ok(conn: sqlite3.Connection) -> bool:
    cols = {row[1] for row in conn.execute("PRAGMA table_info(packets)")}
    if not cols:
        return True
    pks = [row[1] for row in conn.execute("PRAGMA table_info(packets)") if row[5]]
    return "source_type" in cols and pks == ["source_type", "signal_id"]


def connect(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    if not _packets_schema_ok(conn):
        conn.executescript(
            "DROP TABLE IF EXISTS harness_results;"
            "DROP TABLE IF EXISTS judgments;"
            "DROP TABLE IF EXISTS runs;"
            "DROP TABLE IF EXISTS packets;"
        )
    conn.executescript(SCHEMA)
    return conn


def index_packets(path: Path, packets: Iterable[dict[str, Any]]) -> int:
    conn = connect(path)
    n = 0
    with conn:
        for packet in packets:
            conn.execute(
                """
                INSERT OR REPLACE INTO packets (
                    source_type, signal_id, content_access, analysis_scope,
                    verification_state, processing_status, lifecycle_state,
                    source_url, adapter, body_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    packet.get("source_type"),
                    packet.get("signal_id"),
                    packet.get("content_access"),
                    packet.get("analysis_scope"),
                    packet.get("verification_state"),
                    packet.get("processing_status"),
                    packet.get("lifecycle_state"),
                    packet.get("source_url"),
                    packet.get("adapter"),
                    json.dumps(packet, ensure_ascii=False),
                ),
            )
            n += 1
    conn.close()
    return n


def packet_counts_by_source_type(path: Path) -> dict[str, int]:
    conn = connect(path)
    rows = conn.execute(
        "SELECT source_type, COUNT(*) FROM packets GROUP BY source_type"
    ).fetchall()
    conn.close()
    return {str(source): int(count) for source, count in rows}


def rebuild_from_jsonl(sqlite_path: Path, jsonl_path: Path) -> dict[str, Any]:
    """Rebuild the packets table from JSONL. JSONL is the source of truth."""
    packets = list(read_jsonl(jsonl_path))
    conn = connect(sqlite_path)
    with conn:
        conn.execute("DELETE FROM packets")
    conn.close()
    indexed = index_packets(sqlite_path, packets)
    counts: dict[str, int] = {}
    for packet in packets:
        key = str(packet.get("source_type") or "unknown")
        counts[key] = counts.get(key, 0) + 1
    return {
        "ok": True,
        "indexed": indexed,
        "jsonl_lines": len(packets),
        "by_source_type": packet_counts_by_source_type(sqlite_path),
        "jsonl_by_source_type": counts,
        "sqlite": str(sqlite_path),
        "jsonl": str(jsonl_path),
    }


def start_run(
    path: Path,
    run_id: str,
    *,
    provider: str = "",
    notes: str = "",
) -> str:
    conn = connect(path)
    started = datetime.now(timezone.utc).isoformat()
    with conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO runs (run_id, started_at, provider, notes)
            VALUES (?, ?, ?, ?)
            """,
            (run_id, started, provider, notes),
        )
    conn.close()
    return run_id


def index_judgments(
    path: Path,
    judgments: Iterable[dict[str, Any]],
    *,
    run_id: str,
) -> int:
    conn = connect(path)
    start_run(path, run_id)
    n = 0
    with conn:
        for row in judgments:
            conn.execute(
                """
                INSERT OR REPLACE INTO judgments (
                    run_id, source_type, signal_id, provider,
                    flagged, label, latency_ms, cost_usd, body_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    run_id,
                    row.get("source_type") or "unknown",
                    row.get("signal_id"),
                    row.get("provider"),
                    1 if row.get("flagged") else 0,
                    row.get("label"),
                    row.get("latency_ms"),
                    row.get("cost_usd"),
                    json.dumps(row, ensure_ascii=False),
                ),
            )
            n += 1
    conn.close()
    return n


def index_harness_result(path: Path, run_id: str, report: dict[str, Any]) -> None:
    conn = connect(path)
    with conn:
        conn.execute(
            "INSERT OR REPLACE INTO harness_results (run_id, body_json) VALUES (?, ?)",
            (run_id, json.dumps(report, ensure_ascii=False)),
        )
    conn.close()
