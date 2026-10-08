"""SQLite index over packets and judgments. stdlib sqlite3 only."""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any, Iterable


SCHEMA = """
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
CREATE INDEX IF NOT EXISTS idx_judgments_signal ON judgments(signal_id);
CREATE INDEX IF NOT EXISTS idx_packets_source ON packets(source_type);
"""


def connect(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
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
                    signal_id, source_type, content_access, analysis_scope,
                    verification_state, processing_status, lifecycle_state,
                    source_url, adapter, body_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    packet.get("signal_id"),
                    packet.get("source_type"),
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


def index_judgments(path: Path, judgments: Iterable[dict[str, Any]]) -> int:
    conn = connect(path)
    n = 0
    with conn:
        for row in judgments:
            conn.execute(
                """
                INSERT INTO judgments (
                    signal_id, provider, flagged, label, latency_ms, cost_usd, body_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
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
