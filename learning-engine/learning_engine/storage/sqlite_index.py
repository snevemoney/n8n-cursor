"""SQLite derived index over packets and judgments. stdlib sqlite3 only.

JSONL is the source of truth. SQLite is a rebuildable index. Packet identity
is (source_type, signal_id) so the same id from bookmark, corpus, and
youtube_l2 are three rows. Judgments are unique per
(run_id, source_type, signal_id, provider).
"""

from __future__ import annotations

import fcntl
import json
import os
import re
import secrets
import sqlite3
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Iterator

from learning_engine.errors import IndexSchemaError, JsonlError, LockedError
from learning_engine.io_util import read_jsonl

LEGACY_MIGRATED_RUN_ID = "legacy-migrated"
FAIL_MIGRATION_AFTER: str | None = None
FAIL_REBUILD_AFTER: str | None = None
FAIL_INDEX_AFTER: str | None = None
FAIL_CLEANUP: bool = False
REBUILD_TMP_SUFFIX = ".rebuilding"
REBUILD_SIDE_SUFFIXES = (
    ".rebuilding",
    ".rebuilding-journal",
    ".rebuilding-wal",
    ".rebuilding-shm",
)
PROTECTED_DB_SIDES = ("-journal", "-wal", "-shm")
TEST_HOOKS_ENV = "LEARNING_ENGINE_TEST_HOOKS"

_lock_depth: dict[str, int] = {}
_lock_fds: dict[str, int] = {}

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


def resolve_index_path(sqlite_path: Path | str) -> Path:
    """Lock, temp, and replace names follow the real file, not a symlink alias."""
    return Path(os.path.realpath(sqlite_path))


def _lock_key(sqlite_path: Path) -> str:
    return str(resolve_index_path(sqlite_path))


def _lock_file(sqlite_path: Path) -> Path:
    real = resolve_index_path(sqlite_path)
    return real.with_name(real.name + ".lock")


def acquire_index_lock(sqlite_path: Path) -> None:
    key = _lock_key(sqlite_path)
    depth = _lock_depth.get(key, 0)
    if depth > 0:
        _lock_depth[key] = depth + 1
        return
    lock_path = _lock_file(sqlite_path)
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(str(lock_path), os.O_CREAT | os.O_RDWR, 0o644)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        os.close(fd)
        raise LockedError(str(lock_path)) from None
    _lock_fds[key] = fd
    _lock_depth[key] = 1


def release_index_lock(sqlite_path: Path) -> None:
    key = _lock_key(sqlite_path)
    depth = _lock_depth.get(key, 0)
    if depth <= 1:
        fd = _lock_fds.pop(key, None)
        _lock_depth.pop(key, None)
        if fd is not None:
            try:
                fcntl.flock(fd, fcntl.LOCK_UN)
            except OSError:
                pass
            os.close(fd)
        return
    _lock_depth[key] = depth - 1


@contextmanager
def index_lock(sqlite_path: Path) -> Iterator[None]:
    acquire_index_lock(sqlite_path)
    try:
        yield
    finally:
        release_index_lock(sqlite_path)


def _maybe_pause_rebuild(point: str) -> None:
    """Inert unless LEARNING_ENGINE_TEST_HOOKS=1. Test-only pause after backup."""
    if os.environ.get(TEST_HOOKS_ENV) != "1":
        return
    if os.environ.get("LEARNING_ENGINE_PAUSE_REBUILD") != point:
        return
    gate = os.environ.get("LEARNING_ENGINE_REBUILD_GATE")
    if not gate:
        return
    Path(gate).write_text(point, encoding="utf-8")
    resume = Path(str(gate) + ".resume")
    deadline = time.time() + 30
    while not resume.exists():
        if time.time() > deadline:
            raise TimeoutError(f"rebuild pause at {point} timed out")
        time.sleep(0.02)


def _table_names(conn: sqlite3.Connection) -> set[str]:
    rows = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    return {str(row[0]) for row in rows}


def _packets_columns(conn: sqlite3.Connection) -> list[str]:
    return [str(row[1]) for row in conn.execute("PRAGMA table_info(packets)")]


def _packets_pk(conn: sqlite3.Connection) -> list[str]:
    return [str(row[1]) for row in conn.execute("PRAGMA table_info(packets)") if row[5]]


def _current_packets_schema(conn: sqlite3.Connection) -> bool:
    cols = set(_packets_columns(conn))
    return "source_type" in cols and "signal_id" in cols and _packets_pk(conn) == [
        "source_type",
        "signal_id",
    ]


def _judgments_columns(conn: sqlite3.Connection) -> list[str]:
    if "judgments" not in _table_names(conn):
        return []
    return [str(row[1]) for row in conn.execute("PRAGMA table_info(judgments)")]


def _judgments_need_migrate(conn: sqlite3.Connection) -> bool:
    cols = _judgments_columns(conn)
    return bool(cols) and "run_id" not in cols


def _packets_need_migrate(conn: sqlite3.Connection) -> bool:
    if "packets" not in _table_names(conn):
        return False
    cols = set(_packets_columns(conn))
    if "signal_id" not in cols:
        return False
    return not _current_packets_schema(conn)


def _source_type_sql(cols: list[str]) -> str:
    infer = """
        CASE
            WHEN lower(signal_id) LIKE 'yt:%' THEN 'youtube_l2'
            WHEN lower(signal_id) LIKE 'youtube%' THEN 'youtube_l2'
            WHEN lower(signal_id) LIKE 'bm:%' THEN 'bookmark'
            WHEN lower(signal_id) LIKE 'bookmark%' THEN 'bookmark'
            WHEN lower(signal_id) LIKE 'corpus%' THEN 'corpus'
            ELSE 'unknown'
        END
    """
    if "source_type" in cols:
        return f"""
            CASE
                WHEN source_type IS NOT NULL AND TRIM(source_type) != '' THEN source_type
                ELSE {infer}
            END
        """
    return infer


def _maybe_fail_migration(point: str) -> None:
    if FAIL_MIGRATION_AFTER == point:
        raise RuntimeError(f"simulated mid-migration failure after {point}")


def _apply_schema(conn: sqlite3.Connection) -> None:
    """Apply SCHEMA without executescript's implicit commit."""
    for raw in SCHEMA.split(";"):
        stmt = raw.strip()
        if stmt:
            conn.execute(stmt)


def _legacy_judgment_run_id_sql(jcols: set[str]) -> str:
    """Distinct run_id per legacy row so the same provider cannot overwrite itself."""
    for col in (
        "run_id",
        "run_marker",
        "run",
        "started_at",
        "created_at",
        "timestamp",
        "ts",
    ):
        if col in jcols:
            return (
                "CASE "
                f"WHEN {col} IS NOT NULL AND TRIM(CAST({col} AS TEXT)) != '' "
                f"THEN '{LEGACY_MIGRATED_RUN_ID}-' || TRIM(CAST({col} AS TEXT)) "
                f"ELSE '{LEGACY_MIGRATED_RUN_ID}-' || CAST(rowid AS TEXT) "
                "END"
            )
    key = "id" if "id" in jcols else "rowid"
    return f"'{LEGACY_MIGRATED_RUN_ID}-' || CAST({key} AS TEXT)"


def _migrate_legacy_txn(conn: sqlite3.Connection) -> None:
    """One transaction: packets → composite key, judgments → distinct legacy run_ids, then runs."""
    cols = _packets_columns(conn)
    if "signal_id" not in cols:
        raise IndexSchemaError(
            "SQLite packets table has no signal_id. Refusing to drop tables. "
            "Rebuild into a new file from JSONL."
        )
    packet_migrate = _packets_need_migrate(conn)
    judgment_migrate = _judgments_need_migrate(conn)
    if packet_migrate:
        conn.execute("ALTER TABLE packets RENAME TO packets_legacy")
        _maybe_fail_migration("after_packets_rename")
    if judgment_migrate:
        conn.execute("ALTER TABLE judgments RENAME TO judgments_legacy")
    _apply_schema(conn)
    if packet_migrate:
        select_cols = {
            "source_type": _source_type_sql(cols),
            "signal_id": "signal_id",
            "content_access": "content_access" if "content_access" in cols else "NULL",
            "analysis_scope": "analysis_scope" if "analysis_scope" in cols else "NULL",
            "verification_state": "verification_state" if "verification_state" in cols else "NULL",
            "processing_status": "processing_status" if "processing_status" in cols else "NULL",
            "lifecycle_state": "lifecycle_state" if "lifecycle_state" in cols else "NULL",
            "source_url": "source_url" if "source_url" in cols else "NULL",
            "adapter": "adapter" if "adapter" in cols else "NULL",
            "body_json": "body_json" if "body_json" in cols else "'{}'",
        }
        conn.execute(
            f"""
            INSERT OR REPLACE INTO packets (
                source_type, signal_id, content_access, analysis_scope,
                verification_state, processing_status, lifecycle_state,
                source_url, adapter, body_json
            )
            SELECT {select_cols['source_type']}, {select_cols['signal_id']},
                   {select_cols['content_access']}, {select_cols['analysis_scope']},
                   {select_cols['verification_state']}, {select_cols['processing_status']},
                   {select_cols['lifecycle_state']}, {select_cols['source_url']},
                   {select_cols['adapter']}, {select_cols['body_json']}
            FROM packets_legacy
            """
        )
        _maybe_fail_migration("after_packets_copy")
        conn.execute("DROP TABLE packets_legacy")
    if judgment_migrate:
        jcols = {
            str(row[1]) for row in conn.execute("PRAGMA table_info(judgments_legacy)")
        }
        provider = "provider" if "provider" in jcols else "'unknown'"
        flagged = "flagged" if "flagged" in jcols else "0"
        label = "label" if "label" in jcols else "NULL"
        latency = "latency_ms" if "latency_ms" in jcols else "NULL"
        cost = "cost_usd" if "cost_usd" in jcols else "NULL"
        body = "body_json" if "body_json" in jcols else "'{}'"
        infer = _source_type_sql([])
        run_id_sql = _legacy_judgment_run_id_sql(jcols)
        legacy_n = int(conn.execute("SELECT COUNT(*) FROM judgments_legacy").fetchone()[0])
        conn.execute(
            f"""
            INSERT INTO judgments (
                run_id, source_type, signal_id, provider,
                flagged, label, latency_ms, cost_usd, body_json
            )
            SELECT {run_id_sql},
                   COALESCE(
                       (SELECT p.source_type FROM packets p
                        WHERE p.signal_id = judgments_legacy.signal_id LIMIT 1),
                       {infer}
                   ),
                   signal_id, {provider}, {flagged}, {label}, {latency}, {cost}, {body}
            FROM judgments_legacy
            """
        )
        migrated_n = int(conn.execute("SELECT COUNT(*) FROM judgments").fetchone()[0])
        if migrated_n != legacy_n:
            raise IndexSchemaError(
                "SQLite migration lost judgments: "
                f"legacy={legacy_n} migrated={migrated_n}. Database left unchanged."
            )
        started = datetime.now(timezone.utc).isoformat()
        conn.execute(
            """
            INSERT INTO runs (run_id, started_at, provider, notes)
            SELECT DISTINCT run_id, ?, '', 'migrated from pre-composite schema'
            FROM judgments
            WHERE run_id LIKE ?
            """,
            (started, LEGACY_MIGRATED_RUN_ID + "%"),
        )
        conn.execute("DROP TABLE judgments_legacy")
    _maybe_fail_migration("before_commit")


def _migrate_legacy_file(path: Path) -> None:
    """Migrate on a copy. Original bytes stay until the transaction commits."""
    path = resolve_index_path(path)
    with index_lock(path):
        _migrate_legacy_file_locked(path)


def _migrate_legacy_file_locked(path: Path) -> None:
    path = resolve_index_path(path)
    tmp = path.with_name(path.name + ".migrating")
    if tmp.exists() and (tmp.is_dir() or not tmp.is_file()):
        raise IndexSchemaError(
            f"SQLite migration aborted; leftover temp path is not a regular file: {tmp}",
            path=str(tmp),
        )
    try:
        _backup_sqlite(path, tmp)
        conn = sqlite3.connect(str(tmp))
        conn.isolation_level = None
        try:
            conn.execute("BEGIN IMMEDIATE")
            _migrate_legacy_txn(conn)
            conn.execute("COMMIT")
        except Exception as exc:
            try:
                conn.execute("ROLLBACK")
            except sqlite3.Error:
                pass
            conn.close()
            tmp.unlink(missing_ok=True)
            raise IndexSchemaError(
                f"SQLite migration failed; database left unchanged. {exc}"
            ) from exc
        conn.close()
        os.replace(str(tmp), str(path))
    except IndexSchemaError:
        raise
    except Exception as exc:
        tmp.unlink(missing_ok=True)
        raise IndexSchemaError(
            f"SQLite migration failed; database left unchanged. {exc}"
        ) from exc


def connect(path: Path) -> sqlite3.Connection:
    path = resolve_index_path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    names = _table_names(conn)
    if "packets" not in names:
        conn.executescript(SCHEMA)
        return conn
    if _current_packets_schema(conn) and not _judgments_need_migrate(conn):
        conn.executescript(SCHEMA)
        return conn
    cols = set(_packets_columns(conn))
    if "signal_id" in cols or _judgments_need_migrate(conn):
        conn.close()
        _migrate_legacy_file(path)
        return sqlite3.connect(str(path))
    raise IndexSchemaError(
        "SQLite index has an unrecognized packets schema. "
        "Refusing to drop tables or judgments. Recreate the index from JSONL in a new file."
    )


def index_packets(path: Path, packets: Iterable[dict[str, Any]]) -> int:
    path = resolve_index_path(path)
    with index_lock(path):
        return _index_packets_locked(path, packets)


def _index_packets_locked(path: Path, packets: Iterable[dict[str, Any]]) -> int:
    existed = path.exists()
    conn: sqlite3.Connection | None = None
    try:
        conn = connect(path)
        if FAIL_INDEX_AFTER == "after_connect":
            raise RuntimeError("simulated insert failure")
        n = 0
        with conn:
            for packet in packets:
                _insert_packet_row(conn, packet)
                n += 1
        conn.close()
        return n
    except Exception:
        if conn is not None:
            try:
                conn.close()
            except sqlite3.Error:
                pass
        if not existed:
            _remove_new_db(path)
        raise


def packet_counts_by_source_type(path: Path) -> dict[str, int]:
    path = resolve_index_path(path)
    with index_lock(path):
        return _packet_counts_locked(path)


def _packet_counts_locked(path: Path) -> dict[str, int]:
    conn = connect(path)
    rows = conn.execute(
        "SELECT source_type, COUNT(*) FROM packets GROUP BY source_type"
    ).fetchall()
    conn.close()
    return {str(source): int(count) for source, count in rows}


def _insert_packet_row(conn: sqlite3.Connection, packet: dict[str, Any]) -> None:
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


def _rebuild_into(path: Path, packets: list[dict[str, Any]], types: list[str]) -> int:
    conn = connect(path)
    conn.isolation_level = None
    conn.execute("BEGIN IMMEDIATE")
    try:
        if types:
            placeholders = ",".join("?" for _ in types)
            conn.execute(
                f"DELETE FROM packets WHERE source_type IN ({placeholders})",
                types,
            )
        if FAIL_REBUILD_AFTER == "after_delete":
            raise RuntimeError("simulated rebuild failure after delete")
        for packet in packets:
            _insert_packet_row(conn, packet)
        conn.execute("COMMIT")
    except Exception:
        try:
            conn.execute("ROLLBACK")
        except sqlite3.Error:
            pass
        conn.close()
        raise
    conn.close()
    return len(packets)


def _rebuild_tmp_path(sqlite_path: Path) -> Path:
    return sqlite_path.with_name(sqlite_path.name + REBUILD_TMP_SUFFIX)


def _create_rebuild_tmp(sqlite_path: Path) -> Path:
    token = f"{os.getpid()}.{secrets.token_hex(8)}"
    tmp = sqlite_path.with_name(f"{sqlite_path.name}.rebuilding.{token}")
    fd = os.open(str(tmp), os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o644)
    os.close(fd)
    return tmp


def rebuild_tmp_name_re(db_name: str) -> re.Pattern[str]:
    """Exact generated temps only: <db>.rebuilding.<pid>.<16 hex>[sidecar]."""
    return re.compile(
        rf"^{re.escape(db_name)}\.rebuilding\.\d+\.[0-9a-f]{{16}}"
        rf"(-journal|-wal|-shm|\.lock)?$"
    )


def _legacy_exact_temps(sqlite_path: Path) -> list[Path]:
    name = sqlite_path.name
    return [sqlite_path.with_name(name + suffix) for suffix in REBUILD_SIDE_SUFFIXES]


def _generated_rebuild_temps(sqlite_path: Path) -> list[Path]:
    parent = sqlite_path.parent
    if not parent.is_dir():
        return []
    pat = rebuild_tmp_name_re(sqlite_path.name)
    return [child for child in parent.iterdir() if pat.fullmatch(child.name)]


def _stale_rebuild_candidates(sqlite_path: Path) -> list[Path]:
    """Legacy exact names plus generated temps that match the strict regex."""
    found: list[Path] = []
    seen: set[str] = set()
    for path in _legacy_exact_temps(sqlite_path) + _generated_rebuild_temps(sqlite_path):
        key = str(path)
        if key not in seen:
            found.append(path)
            seen.add(key)
    return found


def _first_non_file_temp(sqlite_path: Path) -> Path | None:
    """Abort only when a legacy exact name exists and is not a regular file."""
    for path in _legacy_exact_temps(sqlite_path):
        try:
            if not path.exists() and not path.is_symlink():
                continue
        except OSError:
            continue
        if path.is_dir() or not path.is_file():
            return path
    return None


def _pragma_integrity(conn: sqlite3.Connection) -> str:
    row = conn.execute("PRAGMA integrity_check").fetchone()
    return str(row[0]) if row else "empty"


def _backup_sqlite(src_path: Path, dst_path: Path) -> None:
    """Open src (rolls back a hot journal) and copy via the sqlite3 backup API."""
    src: sqlite3.Connection | None = None
    dst: sqlite3.Connection | None = None
    try:
        src = sqlite3.connect(str(src_path))
        dst = sqlite3.connect(str(dst_path))
        src.backup(dst)
        check = _pragma_integrity(dst)
        if check != "ok":
            raise IndexSchemaError(
                f"SQLite integrity_check failed after backup: {check}",
                path=str(src_path),
            )
    finally:
        if dst is not None:
            dst.close()
        if src is not None:
            src.close()


def _drop_tmp_sidecars(tmp: Path) -> None:
    for suffix in ("-journal", "-wal", "-shm", ".lock"):
        _safe_remove(Path(str(tmp) + suffix))


def _safe_remove(path: Path) -> str | None:
    """Unlink a regular file only. Never rmtree. Never raise."""
    try:
        exists = path.exists() or path.is_symlink()
    except OSError as exc:
        return f"{path}: {exc}"
    if not exists:
        return None
    if path.is_dir() or not (path.is_file() or path.is_symlink()):
        return None
    if FAIL_CLEANUP:
        return f"{path}: simulated cleanup failure"
    try:
        path.unlink(missing_ok=True)
        return None
    except OSError as exc:
        return f"{path}: {exc}"


def _clear_stale_rebuild_temps(sqlite_path: Path) -> str | None:
    notes: list[str] = []
    for path in _legacy_exact_temps(sqlite_path):
        warning = _safe_remove(path)
        if warning:
            notes.append(warning)
    for path in _generated_rebuild_temps(sqlite_path):
        try:
            is_file = path.is_file() or path.is_symlink()
            is_dir = path.is_dir()
        except OSError as exc:
            notes.append(f"{path}: {exc}")
            continue
        if is_dir or not is_file:
            notes.append(f"{path}: not a regular file; left in place")
            continue
        warning = _safe_remove(path)
        if warning:
            notes.append(warning)
    return "; ".join(notes) if notes else None


def _remove_new_db(sqlite_path: Path) -> str | None:
    """Unlink only the DB file we created. Never touch -journal/-wal/-shm."""
    return _safe_remove(sqlite_path)


def _rebuild_error(
    exc: BaseException,
    *,
    existed: bool,
    jsonl_path: Path,
    sqlite_path: Path,
    cleanup_warning: str | None,
) -> IndexSchemaError:
    if isinstance(exc, IndexSchemaError):
        msg = str(exc)
    elif existed:
        msg = f"SQLite rebuild failed; database left unchanged. {exc}"
    else:
        msg = f"SQLite rebuild failed; no database was created. {exc}"
    return IndexSchemaError(
        msg,
        path=str(getattr(exc, "path", None) or jsonl_path),
        line=getattr(exc, "line", None),
        cleanup_warning=cleanup_warning,
    )


def rebuild_from_jsonl(sqlite_path: Path, jsonl_path: Path) -> dict[str, Any]:
    """Replace packet rows only for source_types present in JSONL. Judgments stay.

    Exclusive lock on the realpath, sqlite3 backup into a unique temp, replace
    only after integrity_check. A symlink alias stays a symlink.
    """
    requested = Path(sqlite_path)
    sqlite_path = resolve_index_path(sqlite_path)
    with index_lock(sqlite_path):
        result = _rebuild_from_jsonl_locked(sqlite_path, jsonl_path)
    result["sqlite"] = str(requested)
    return result


def _rebuild_from_jsonl_locked(sqlite_path: Path, jsonl_path: Path) -> dict[str, Any]:
    sqlite_path = resolve_index_path(sqlite_path)
    existed = sqlite_path.exists()
    blocked = _first_non_file_temp(sqlite_path)
    if blocked is not None:
        raise IndexSchemaError(
            f"SQLite rebuild aborted; leftover temp path is not a regular file: {blocked}",
            path=str(blocked),
        )
    stale_warning = _clear_stale_rebuild_temps(sqlite_path)
    tmp: Path | None = None
    packets: list[dict[str, Any]] = []
    try:
        packets = list(read_jsonl(jsonl_path))
        types = sorted({str(packet.get("source_type") or "unknown") for packet in packets})
        tmp = _create_rebuild_tmp(sqlite_path)
        if existed:
            _backup_sqlite(sqlite_path, tmp)
        _maybe_pause_rebuild("after_copy")
        indexed = _rebuild_into(tmp, packets, types)
        check_conn = sqlite3.connect(str(tmp))
        try:
            check = _pragma_integrity(check_conn)
        finally:
            check_conn.close()
        if check != "ok":
            raise IndexSchemaError(
                f"SQLite integrity_check failed before replace: {check}",
                path=str(sqlite_path),
            )
        _drop_tmp_sidecars(tmp)
        os.replace(str(tmp), str(sqlite_path))
        tmp = None
    except JsonlError as exc:
        extra = _clear_stale_rebuild_temps(sqlite_path)
        if tmp is not None:
            extra = "; ".join(
                item for item in (extra, _safe_remove(tmp), _drop_tmp_sidecars_note(tmp)) if item
            ) or extra
        warning = "; ".join(item for item in (stale_warning, extra) if item) or None
        if warning:
            exc.cleanup_warning = warning
        raise
    except Exception as exc:
        extra = _clear_stale_rebuild_temps(sqlite_path)
        if tmp is not None:
            extra = "; ".join(
                item for item in (extra, _safe_remove(tmp), _drop_tmp_sidecars_note(tmp)) if item
            ) or extra
        warning = "; ".join(item for item in (stale_warning, extra) if item) or None
        raise _rebuild_error(
            exc,
            existed=existed,
            jsonl_path=jsonl_path,
            sqlite_path=sqlite_path,
            cleanup_warning=warning,
        ) from exc
    counts: dict[str, int] = {}
    for packet in packets:
        key = str(packet.get("source_type") or "unknown")
        counts[key] = counts.get(key, 0) + 1
    return {
        "ok": True,
        "indexed": indexed,
        "jsonl_lines": len(packets),
        "replaced_source_types": types,
        "by_source_type": packet_counts_by_source_type(sqlite_path),
        "jsonl_by_source_type": counts,
        "sqlite": str(sqlite_path),
        "jsonl": str(jsonl_path),
    }


def _drop_tmp_sidecars_note(tmp: Path) -> str | None:
    _drop_tmp_sidecars(tmp)
    return None


def start_run(
    path: Path,
    run_id: str,
    *,
    provider: str = "",
    notes: str = "",
) -> str:
    path = resolve_index_path(path)
    with index_lock(path):
        return _start_run_locked(path, run_id, provider=provider, notes=notes)


def _start_run_locked(
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
    path = resolve_index_path(path)
    with index_lock(path):
        return _index_judgments_locked(path, judgments, run_id=run_id)


def _index_judgments_locked(
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
    path = resolve_index_path(path)
    with index_lock(path):
        _index_harness_result_locked(path, run_id, report)


def _index_harness_result_locked(path: Path, run_id: str, report: dict[str, Any]) -> None:
    conn = connect(path)
    with conn:
        conn.execute(
            "INSERT OR REPLACE INTO harness_results (run_id, body_json) VALUES (?, ?)",
            (run_id, json.dumps(report, ensure_ascii=False)),
        )
    conn.close()
