#!/usr/bin/env python3
"""Signal intelligence. Saved material becomes claims, not Hive rules.

Lookup of old sheets stays scripts/hive/os/signal-retrieve.py (≤3 refs, default off).
This store is the claim corpus. It does not implement from a bookmark.

  python3 scripts/hive/eng/signal.py capture --id SIG-1 --platform youtube --url URL --title TITLE
  python3 scripts/hive/eng/signal.py claim --signal SIG-1 --text "..."
  python3 scripts/hive/eng/signal.py candidate --id CAND-1 --signal SIG-1 --kind CANDIDATE_RULE --text "..."
  python3 scripts/hive/eng/signal.py pack --query "runtime verification"
  python3 scripts/hive/eng/signal.py promote --candidate CAND-1
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

_ENG = Path(__file__).resolve().parent
if str(_ENG) not in sys.path:
    sys.path.insert(0, str(_ENG))
from judgment import corpus_features

ROOT = Path(__file__).resolve().parents[3]
DEFAULT = ROOT / "docs/hive/outer-heaven/CONTENT/os/signals"
PACK_CAP = 12
KINDS = (
    "CANDIDATE_METHOD",
    "CANDIDATE_SKILL",
    "CANDIDATE_ARCHITECTURE",
    "CANDIDATE_RULE",
    "CANDIDATE_TOOL",
    "CANDIDATE_EVAL",
    "CANDIDATE_PRODUCT",
    "CANDIDATE_BUSINESS",
)


def store(root: Path | None) -> Path:
    path = root or DEFAULT
    for name in ("raw", "claims", "contradictions", "candidates", "experiments"):
        (path / name).mkdir(parents=True, exist_ok=True)
    return path


def read_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    return data if isinstance(data, dict) else {}


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def emit(payload: dict, ok: bool) -> int:
    print(json.dumps(payload, indent=2))
    print("PASS" if ok else "FAIL", file=sys.stdout if ok else sys.stderr)
    return 0 if ok else 1


def capture(
    root: Path,
    signal_id: str,
    platform: str,
    url: str,
    title: str,
    creator: str = "",
    collection: str = "",
    captured_at: str = "",
) -> int:
    path = root / "raw" / f"{signal_id}.json"
    body = {
        "signal_id": signal_id,
        "source": {"platform": platform, "url": url, "creator": creator},
        "operator": {"saved_by": "evens", "collection": collection},
        "content": {"title": title, "transcript_copied": False},
        "provenance": {
            "exact_source_preserved": False,
            "content_sha256": "",
            "preserved": "url-and-title",
        },
        "authority": "UNTRUSTED_DATA",
        "may_change_goal": False,
        "captured_at": captured_at,
    }
    digest = hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest()
    body["sha256"] = digest
    if path.is_file():
        old = read_json(path)
        if old.get("sha256") != digest:
            return emit({"id": signal_id, "reason": "raw signal is immutable"}, False)
        return emit({"id": signal_id, "stored": False, "reason": "already captured"}, True)
    write_json(path, body)
    return emit({"id": signal_id, "stored": True, "authority": "UNTRUSTED_DATA"}, True)


def add_claim(root: Path, signal_id: str, text: str) -> int:
    raw = root / "raw" / f"{signal_id}.json"
    if not raw.is_file():
        return emit({"reason": "capture the raw signal first"}, False)
    path = root / "claims" / f"{signal_id}.json"
    doc = read_json(path) or {"signal_id": signal_id, "depth": "L2", "claims": []}
    doc["depth"] = "L2"
    claims = list(doc.get("claims") or [])
    if any(c.get("text") == text for c in claims if isinstance(c, dict)):
        return emit({"id": signal_id, "claims": len(claims), "stored": False, "depth": "L2"}, True)
    claims.append({"id": f"{signal_id}-{len(claims)+1:03d}", "text": text, "signal_id": signal_id})
    doc["claims"] = claims
    write_json(path, doc)
    return emit({"id": signal_id, "claims": len(claims), "depth": "L2"}, True)


def file_candidate(root: Path, candidate_id: str, signal_id: str, kind: str, text: str) -> int:
    if kind not in KINDS:
        return emit({"reason": f"unknown candidate kind {kind}"}, False)
    raw = root / "raw" / f"{signal_id}.json"
    if not raw.is_file():
        return emit({"reason": "capture the raw signal first"}, False)
    path = root / "candidates" / f"{candidate_id}.json"
    if path.is_file():
        return emit({"id": candidate_id, "stored": False, "reason": "candidate already filed"}, True)
    raw_doc = read_json(raw)
    source = raw_doc.get("source") if isinstance(raw_doc.get("source"), dict) else {}
    operator = raw_doc.get("operator") if isinstance(raw_doc.get("operator"), dict) else {}
    url = str(source.get("url") or "")
    collection = str(operator.get("collection") or "")
    demo_corpus = collection == "jev-demos" or "jev-demos" in url or raw_doc.get("corpus") == "external_demos"
    if kind == "CANDIDATE_PRODUCT" and demo_corpus:
        demos = raw_doc.get("demos") if isinstance(raw_doc.get("demos"), list) else []
        decision = corpus_features(
            {
                "signal_class": "EXTERNAL_SIGNAL",
                "kind": "demo_corpus",
                "url": url,
                "demos": demos,
            }
        )
        return emit(decision, False)
    doc = {
        "id": candidate_id,
        "kind": kind,
        "signal_id": signal_id,
        "text": text,
        "authority": "UNTRUSTED_DATA",
        "may_change_goal": False,
        "experiment": "",
        "result": "",
        "status": "CANDIDATE",
        "doctrine_write": False,
    }
    write_json(path, doc)
    return emit({"id": candidate_id, "status": "CANDIDATE", "doctrine_write": False}, True)


def pack(root: Path, query: str) -> int:
    words = [w for w in re.split(r"\W+", query.lower()) if len(w) > 3]
    hits: list[dict] = []
    for path in sorted((root / "claims").glob("*.json")):
        doc = read_json(path)
        for claim in doc.get("claims") or []:
            if not isinstance(claim, dict):
                continue
            hay = str(claim.get("text") or "").lower()
            if words and not any(w in hay for w in words):
                continue
            hits.append({"id": claim.get("id"), "text": claim.get("text"), "signal_id": claim.get("signal_id")})
            if len(hits) >= PACK_CAP:
                break
        if len(hits) >= PACK_CAP:
            break
    return emit(
        {
            "query": query,
            "cap": PACK_CAP,
            "claims": hits,
            "note": "pack is claims, not the raw corpus and not a Hive rule",
            "complete": False,
            "loop": "PROTOTYPE",
        },
        True,
    )


def promote(root: Path, candidate_id: str, write_rule: bool) -> int:
    if write_rule:
        return emit({"reason": "a signal cannot write a Hive rule"}, False)
    path = root / "candidates" / f"{candidate_id}.json"
    doc = read_json(path)
    if not doc:
        return emit({"reason": f"no candidate {candidate_id}"}, False)
    experiment = str(doc.get("experiment") or "")
    result = str(doc.get("result") or "")
    if result != "PROVEN" or not experiment:
        return emit(
            {
                "id": candidate_id,
                "reason": "candidate stays a candidate until an experiment is PROVEN on the claimed surface",
            },
            False,
        )
    if doc.get("may_change_goal") is True or doc.get("authority") == "UNTRUSTED_DATA":
        return emit({"reason": "untrusted signal cannot promote itself"}, False)
    doc["status"] = "ADOPTED"
    doc["doctrine_write"] = False
    write_json(path, doc)
    return emit({"id": candidate_id, "status": "ADOPTED", "doctrine_write": False}, True)


def main() -> int:
    ap = argparse.ArgumentParser(description="Hive signal intelligence")
    ap.add_argument("--root", type=Path)
    sub = ap.add_subparsers(dest="cmd", required=True)
    cap = sub.add_parser("capture")
    cap.add_argument("--id", required=True)
    cap.add_argument("--platform", required=True)
    cap.add_argument("--url", required=True)
    cap.add_argument("--title", required=True)
    cap.add_argument("--creator", default="")
    cap.add_argument("--collection", default="")
    cap.add_argument("--captured-at", default="")
    cl = sub.add_parser("claim")
    cl.add_argument("--signal", required=True)
    cl.add_argument("--text", required=True)
    cand = sub.add_parser("candidate")
    cand.add_argument("--id", required=True)
    cand.add_argument("--signal", required=True)
    cand.add_argument("--kind", required=True)
    cand.add_argument("--text", required=True)
    pk = sub.add_parser("pack")
    pk.add_argument("--query", required=True)
    pr = sub.add_parser("promote")
    pr.add_argument("--candidate", required=True)
    pr.add_argument("--write-rule", action="store_true")
    args = ap.parse_args()
    root = store(args.root)
    if args.cmd == "capture":
        return capture(
            root,
            args.id,
            args.platform,
            args.url,
            args.title,
            args.creator,
            args.collection,
            args.captured_at,
        )
    if args.cmd == "claim":
        return add_claim(root, args.signal, args.text)
    if args.cmd == "candidate":
        return file_candidate(root, args.id, args.signal, args.kind, args.text)
    if args.cmd == "pack":
        return pack(root, args.query)
    return promote(root, args.candidate, args.write_rule)


if __name__ == "__main__":
    raise SystemExit(main())
