"""corpus artifacts/<id>/META.json → research-packet v0.

Looks for TRANSCRIPT.md (any case), *.vtt, caption files, stills/, and raw/.
full_visual is claimed only when frame evidence refs AND a video file exist
on disk. META completeness keys that are missing stay unknown, not true.

status OK maps to processing_status ok, then becomes partial when
classification contains PARTIAL — a cautious choice, documented in README.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from learning_engine.adapters.common import (
    clip_source_text,
    collect_packet,
    convert_summary,
    empty_convert_report,
    existing_frames,
    existing_raw_files,
    existing_transcripts,
    existing_videos,
    map_status,
    pick_source_transcript,
    rel_ref,
)
from learning_engine.io_util import write_jsonl
from learning_engine.packet import base_packet, evidence_item


def find_meta_files(input_path: Path) -> list[Path]:
    if input_path.is_file() and input_path.name == "META.json":
        return [input_path]
    if not input_path.is_dir():
        raise FileNotFoundError(f"corpus input is not a directory: {input_path}")
    artifacts = input_path / "artifacts"
    root = artifacts if artifacts.is_dir() else input_path
    return sorted(p for p in root.rglob("META.json") if p.name == "META.json")


def _completeness_flag(completeness: dict[str, Any] | None, key: str) -> bool | None:
    if not completeness or key not in completeness:
        return None
    value = completeness[key]
    if value is True:
        return True
    if value is False:
        return False
    return None


def _read_transcript_text(path: Path) -> str:
    raw = path.read_text(encoding="utf-8", errors="replace")
    if path.suffix.lower() == ".json":
        try:
            obj = json.loads(raw)
        except json.JSONDecodeError:
            return raw
        if isinstance(obj, dict):
            for key in ("text", "transcript", "source_text"):
                if isinstance(obj.get(key), str):
                    return obj[key]
        return raw
    return raw


def _resolve_declared_raw(folder: Path, name: str) -> Path | None:
    for candidate in (folder / name, folder / "raw" / name, folder / "raw" / Path(name).name):
        if candidate.is_file():
            return candidate
    return None


def meta_to_packet(meta_path: Path, meta: dict[str, Any]) -> dict[str, Any]:
    folder = meta_path.parent
    signal_id = str(meta.get("id") or folder.name)
    completeness = meta.get("completeness") if isinstance(meta.get("completeness"), dict) else None
    has_video = _completeness_flag(completeness, "has_local_video")
    has_transcript_flag = _completeness_flag(completeness, "has_transcript")
    has_keyframes_flag = _completeness_flag(completeness, "has_keyframes")

    frames = existing_frames(folder)
    transcripts = existing_transcripts(folder)
    videos = existing_videos(folder)
    raw_on_disk = existing_raw_files(folder)

    evidence: list[dict[str, Any]] = [
        evidence_item(kind="metadata", source_ref=rel_ref(folder, meta_path), note="META.json")
    ]
    index_md = folder / "INDEX.md"
    if index_md.is_file():
        evidence.append(evidence_item(kind="file", source_ref=rel_ref(folder, index_md)))
    for path in frames:
        evidence.append(evidence_item(kind="frame", source_ref=rel_ref(folder, path)))
    for path in transcripts:
        evidence.append(evidence_item(kind="transcript", source_ref=rel_ref(folder, path)))
    cited: set[str] = {rel_ref(folder, p) for p in [*frames, *transcripts, meta_path]}
    raw_files = meta.get("raw_files") if isinstance(meta.get("raw_files"), list) else []
    for name in raw_files:
        if not isinstance(name, str):
            continue
        candidate = _resolve_declared_raw(folder, name)
        if candidate is None:
            continue
        ref = rel_ref(folder, candidate)
        if ref in cited:
            continue
        evidence.append(evidence_item(kind="file", source_ref=ref, note="META.raw_files"))
        cited.add(ref)
    for path in raw_on_disk:
        ref = rel_ref(folder, path)
        if ref in cited:
            continue
        kind = "file"
        if path.suffix.lower() == ".json" or path.name.lower().endswith(".info.json"):
            kind = "metadata"
        evidence.append(evidence_item(kind=kind, source_ref=ref, note="raw/"))
        cited.add(ref)
    for path in videos:
        ref = rel_ref(folder, path)
        if ref in cited:
            continue
        evidence.append(evidence_item(kind="file", source_ref=ref, note="video"))
        cited.add(ref)

    picked = pick_source_transcript(transcripts)
    source_text = _read_transcript_text(picked) if picked else ""
    source_text, source_chars, truncated = clip_source_text(source_text)

    if frames and videos:
        content_access = "full_visual"
        analysis_scope = "full_visual"
    elif frames and transcripts:
        content_access = "frames"
        analysis_scope = "frames"
    elif frames:
        content_access = "frames"
        analysis_scope = "frames"
    elif transcripts or has_transcript_flag is True:
        content_access = "transcript"
        analysis_scope = "transcript"
    elif (meta.get("status") or "").upper() == "FAILED":
        content_access = "preview_only"
        analysis_scope = "preview_only"
    else:
        content_access = "none"
        analysis_scope = "none"

    url = meta.get("url")
    source_url = url if isinstance(url, str) and url.strip() else None
    author = meta.get("author_username")
    source_author = author if isinstance(author, str) and author.strip() else None
    retrieved = meta.get("retrieved_at")
    retrieved_at = retrieved if isinstance(retrieved, str) and retrieved.strip() else None

    scores: dict[str, Any] = {}
    if isinstance(meta.get("classification"), str):
        scores["classification"] = meta["classification"]
    if isinstance(meta.get("transcript_chars"), (int, float)):
        scores["transcript_chars"] = meta["transcript_chars"]
    if isinstance(meta.get("stills_count"), (int, float)):
        scores["stills_count_declared"] = meta["stills_count"]
    scores["frames_on_disk"] = len(frames)
    scores["transcripts_on_disk"] = len(transcripts)
    scores["videos_on_disk"] = len(videos)
    scores["source_text_chars"] = source_chars
    scores["source_text_truncated"] = truncated

    extra_completeness = {
        "has_local_video": has_video if has_video is not None else "unknown",
        "has_transcript": has_transcript_flag if has_transcript_flag is not None else "unknown",
        "has_keyframes": has_keyframes_flag if has_keyframes_flag is not None else "unknown",
        "frames_found": len(frames),
        "transcripts_found": len(transcripts),
        "videos_found": len(videos),
    }

    processing = map_status(str(meta.get("status")) if meta.get("status") is not None else None)
    if isinstance(meta.get("classification"), str) and "PARTIAL" in meta["classification"].upper():
        if processing == "ok":
            processing = "partial"

    return base_packet(
        signal_id=signal_id,
        source_type="corpus",
        content_access=content_access,
        analysis_scope=analysis_scope,
        source_text=source_text,
        evidence=evidence,
        verification_state="unknown",
        processing_status=processing,
        lifecycle_state="extracted",
        scores=scores,
        source_url=source_url,
        source_author=source_author,
        retrieved_at=retrieved_at,
        adapter="corpus_reingest",
        input_ref=str(meta_path),
        extra={"completeness": extra_completeness},
    )


def convert_report(input_path: Path, *, strict: bool = False) -> dict[str, Any]:
    report = empty_convert_report()
    for meta_path in find_meta_files(input_path):
        def _build(path: Path = meta_path) -> dict[str, Any]:
            meta = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(meta, dict):
                raise ValueError(f"{path}: META.json must be an object")
            return meta_to_packet(path, meta)

        if not collect_packet(report, str(meta_path), _build, strict=strict) and strict:
            break
    return report


def convert(input_path: Path, *, strict: bool = False) -> list[dict[str, Any]]:
    return convert_report(input_path, strict=strict)["packets"]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Convert corpus META.json folders into packets")
    parser.add_argument("--input", required=True, help="Corpus root or artifacts/ directory")
    parser.add_argument("--output", required=True, help="JSONL output path")
    parser.add_argument("--strict", action="store_true", help="Fail on the first invalid packet")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    report = convert_report(Path(args.input), strict=args.strict)
    n = write_jsonl(Path(args.output), report["packets"])
    summary = convert_summary("corpus_reingest", report, args.output)
    summary["packets"] = n
    print(json.dumps(summary))
    if args.strict and report["invalid"]:
        return 1
    return 0 if report["packets"] or not report["invalid"] else 1


if __name__ == "__main__":
    sys.exit(main())
