#!/usr/bin/env python3
"""Shared helpers for Outer Heaven library (paths, secrets, chronicle append)."""
from __future__ import annotations

import hashlib
import importlib.util
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]

SECRET_PATTERNS = [
    re.compile(r"(?i)(api[_-]?key|secret|password|token|bearer)\s*[:=]\s*\S+"),
    re.compile(r"\bsk-[a-zA-Z0-9]{20,}\b"),
    re.compile(r"\bBearer\s+[A-Za-z0-9._\-+/=]{20,}\b"),
    re.compile(r"-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----"),
    re.compile(r"(?i)HIVE_WEBHOOK_SECRET\s*=\s*\S+"),
    re.compile(r"(?i)N8N_API_KEY\s*=\s*\S+"),
    re.compile(r"(?i)CE_HIVE_TOKEN\s*=\s*\S+"),
]


def _vault_config():
    vc_path = ROOT / "scripts/hive/os/vault-config.py"
    if not vc_path.is_file():
        return None
    spec = importlib.util.spec_from_file_location("vault_config", vc_path)
    if not spec or not spec.loader:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def library_root() -> Path:
    """Write path for capture scripts — always fast local cache."""
    vc = _vault_config()
    if vc:
        return vc.write_root()
    return Path.home() / ".grokbot/outer-heaven"


def read_library_root() -> Path:
    """Read path for agents — cache → vault → git mirror."""
    vc = _vault_config()
    if vc:
        return vc.read_root("auto")
    vault = _vault_outer_heaven_legacy()
    if vault.is_dir():
        return vault
    return ROOT / "docs/hive/outer-heaven"


def _vault_outer_heaven_legacy() -> Path:
    import os

    v = os.environ.get("HIVE_OBSIDIAN_VAULT", "").strip()
    if v:
        return Path(v).expanduser() / "00_Outer_Heaven"
    return Path("__missing__")


def chronicle_path(for_date: datetime | None = None) -> Path:
    dt = for_date or datetime.now(timezone.utc)
    return library_root() / "CHRONICLE" / f"{dt.strftime('%Y-%m')}.md"


def strip_secrets(text: str) -> str:
    out = text
    for pat in SECRET_PATTERNS:
        out = pat.sub("[REDACTED]", out)
    return out


def file_hash(path: Path) -> str:
    h = hashlib.sha256()
    h.update(str(path).encode())
    h.update(str(path.stat().st_mtime_ns).encode())
    h.update(path.read_bytes())
    return h.hexdigest()[:16]


def parse_transcript_index(index_path: Path) -> set[str]:
    if not index_path.is_file():
        return set()
    text = index_path.read_text(encoding="utf-8", errors="replace")
    hashes = set(re.findall(r"\|\s*([a-f0-9]{16})\s*\|", text))
    return hashes


def append_index_row(index_path: Path, row: dict[str, str]) -> None:
    index_path.parent.mkdir(parents=True, exist_ok=True)
    if not index_path.is_file():
        index_path.write_text(
            "# Transcript index\n\n"
            "Auto-updated by `mine-transcripts.py`.\n\n"
            "| Hash | Path | Workspace | Mined at | Chronicle entry |\n"
            "|------|------|-----------|----------|-----------------|\n",
            encoding="utf-8",
        )
    line = (
        f"| {row['hash']} | `{row['path']}` | {row['workspace']} | "
        f"{row['mined_at']} | {row['entry']} |\n"
    )
    with index_path.open("a", encoding="utf-8") as f:
        f.write(line)


def append_chronicle_entry(
    *,
    source: str,
    workspace: str,
    summary: str,
    projects: list[str] | None = None,
    tags: list[str] | None = None,
    agents: list[str] | None = None,
    files_touched: list[str] | None = None,
    survivability: str = "ops",
    correlation_id: str | None = None,
) -> Path:
    root = library_root()
    root.mkdir(parents=True, exist_ok=True)
    (root / "CHRONICLE").mkdir(parents=True, exist_ok=True)

    now = datetime.now(timezone.utc)
    path = chronicle_path(now)
    if not path.is_file():
        path.write_text(
            f"# Outer Heaven Chronicle — {now.strftime('%Y-%m')}\n\nAppend-only.\n\n---\n\n",
            encoding="utf-8",
        )

    cid = correlation_id or f"oh-{now.strftime('%Y%m%d%H%M%S')}"
    projects = projects or []
    tags = tags or []
    agents = agents or []
    files_touched = files_touched or []

    summary = strip_secrets(summary.strip())
    yaml_block = f"""```yaml
date: {now.isoformat().replace('+00:00', 'Z')}
source: {source}
workspace: {workspace}
agents: [{', '.join(agents)}]
projects: [{', '.join(projects)}]
tags: [{', '.join(tags)}]
correlationId: {cid}
survivability: {survivability}
```

## Summary

{summary}
"""
    if files_touched:
        yaml_block += "\n## Files touched\n\n" + "\n".join(f"- {x}" for x in files_touched[:30]) + "\n"

    yaml_block += f"\n## Survivability signal\n\n- {survivability}\n\n---\n\n"

    with path.open("a", encoding="utf-8") as f:
        f.write(yaml_block)

    return path


def write_last_capture(steps: dict[str, str]) -> Path:
    """Record capture cycle step outcomes to cache."""
    import json

    root = library_root()
    root.mkdir(parents=True, exist_ok=True)
    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "steps": steps,
    }
    path = root / "last-capture.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return path
