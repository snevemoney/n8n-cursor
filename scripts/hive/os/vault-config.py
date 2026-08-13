#!/usr/bin/env python3
"""Resolve Obsidian vault + Mac cache paths for Outer Heaven (stdlib-only)."""
from __future__ import annotations

import json
import os
from pathlib import Path

DEFAULT_VAULT = Path.home() / "Documents/My_Billion_Dollar_Vault"


def _cache_path() -> Path:
    env = os.environ.get("OUTER_HEAVEN_CACHE", "").strip()
    if env:
        return Path(env).expanduser()
    return Path.home() / ".grokbot/outer-heaven"
OS_CONFIG = Path.home() / ".grokbot/os-config.json"
REPO_MIRROR = Path(__file__).resolve().parents[3] / "docs/hive/outer-heaven"


def _load_os_config() -> dict:
    if not OS_CONFIG.is_file():
        return {}
    try:
        return json.loads(OS_CONFIG.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def vault_root() -> Path | None:
    """Return Obsidian vault root if configured or default exists."""
    env = os.environ.get("HIVE_OBSIDIAN_VAULT", "").strip()
    if env:
        p = Path(env).expanduser()
        return p if p.is_dir() else None
    cfg = str(_load_os_config().get("HIVE_OBSIDIAN_VAULT", "")).strip()
    if cfg:
        p = Path(cfg).expanduser()
        if p.is_dir():
            return p
    return DEFAULT_VAULT if DEFAULT_VAULT.is_dir() else None


def cache_root() -> Path:
    """Fast local write path — canonical capture target."""
    root = _cache_path()
    root.mkdir(parents=True, exist_ok=True)
    return root


def vault_outer_heaven() -> Path | None:
    v = vault_root()
    if not v:
        return None
    oh = v / "00_Outer_Heaven"
    oh.mkdir(parents=True, exist_ok=True)
    return oh


def read_root(prefer: str = "auto") -> Path:
    """Best path for agents to read Outer Heaven content."""
    if prefer == "cache":
        return cache_root()
    if prefer == "vault":
        voh = vault_outer_heaven()
        if voh and voh.is_dir():
            return voh
        return cache_root()
    if prefer == "mirror":
        return REPO_MIRROR if REPO_MIRROR.is_dir() else cache_root()
    # auto: cache if populated, else vault, else git mirror
    cache = cache_root()
    if (cache / "OPERATOR_MEMORY.md").is_file() or (cache / "CHRONICLE").is_dir():
        return cache
    voh = vault_outer_heaven()
    if voh and (voh / "OPERATOR_MEMORY.md").is_file():
        return voh
    return REPO_MIRROR if REPO_MIRROR.is_dir() else cache


def write_root() -> Path:
    """Canonical capture write path (always fast local cache)."""
    return cache_root()


def vault_path_for_agents() -> str:
    v = vault_root()
    return str(v) if v else "(unset — set HIVE_OBSIDIAN_VAULT or ~/.grokbot/os-config.json)"


# Back-compat alias used by older imports
def outer_heaven_root() -> Path:
    return read_root("auto")


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--show", action="store_true", help="Vault root path")
    ap.add_argument("--outer-heaven", action="store_true", help="Read root for agents")
    ap.add_argument("--cache", action="store_true", help="Cache root path")
    ap.add_argument("--write-root", action="store_true", help="Capture write root")
    args = ap.parse_args()
    if args.cache:
        print(cache_root())
    elif args.write_root:
        print(write_root())
    elif args.outer_heaven:
        print(read_root("auto"))
    elif args.show:
        v = vault_root()
        print(v or "")
    else:
        print(vault_path_for_agents())
