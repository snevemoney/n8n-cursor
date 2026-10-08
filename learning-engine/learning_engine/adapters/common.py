"""Shared adapter helpers. Never invent a URL, author, or file."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Callable

from learning_engine.errors import PacketValidationError
from learning_engine.validator import validate_packet

FRAME_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}
VIDEO_SUFFIXES = {".mp4", ".webm", ".mkv", ".mov", ".m4v"}
CAPTION_SUFFIXES = {".txt", ".json", ".md", ".vtt"}
TRANSCRIPT_EXACT = {
    "transcript.md",
    "transcript.txt",
    "transcript.json",
    "transcript.vtt",
    "transcript-burnin.json",
    "ocr-frames.txt",
    "stills_captions.json",
    "player-caption-samples.json",
    "captions.json",
    "captions_clean.txt",
    "captions_timeline.txt",
    "captions_w1.txt",
    "whisper.txt",
}
SOURCE_TEXT_MAX_CHARS = 50_000
YT_CAPTION_MIN_TOKENS = 5
CAPTION_JSON_TEXT_KEYS = frozenset({"text", "caption", "transcript", "source_text"})
HALLUCINATION_PHRASES = (
    "thank you for watching",
    "thanks for watching",
    "thank you",
    "thanks",
    "you",
    "music",
)
HALLUCINATION_SYMBOLS = frozenset("🎵🎶♪♫")
OPERATOR_LINE = re.compile(
    r"^(?:\*{1,2}|_+)?\s*(?:Source|Fetched|_?source)\s*(?:\*{1,2}|_+)?\s*:",
    re.IGNORECASE,
)
KIND_LANGUAGE_LINE = re.compile(
    r"^(?:\*{1,2}|_+)?\s*(?:Kind|Language)\s*(?:\*{1,2}|_+)?\s*:",
    re.IGNORECASE,
)
DIAGNOSTIC_LINE = re.compile(
    r"^(?:yt-dlp\b|whisper(?:\+subs)?\b|MemAvailable\b|timedtext\b)",
    re.IGNORECASE,
)
ARROW_TIMESTAMP = re.compile(
    r"^\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?\s+-->\s+\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?\s*"
)
BRACKET_TIMESTAMP = re.compile(r"^\[\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?\]\s*")
VTT_CUE_NUMBER = re.compile(r"^\d+$")
MD_HEADING = re.compile(r"^#{1,6}\s+\S")
CAPTION_GAP_TOKEN = re.compile(r"CAPTION_GAP", re.IGNORECASE)
PROVENANCE_LINE = re.compile(r"^_source:\s*(.+?)_\s*$", re.IGNORECASE)
INLINE_VTT_TAGS = re.compile(
    r"<\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?>|"
    r"</?(?:c|v|lang|ruby|rt)(?:\s+[^>]*)?>",
    re.IGNORECASE,
)
CUE_SETTING_TOKEN = re.compile(r"^[A-Za-z][A-Za-z0-9-]*:\S+$")


def existing_files(folder: Path, suffixes: set[str] | None = None) -> list[Path]:
    if not folder.is_dir():
        return []
    out: list[Path] = []
    for path in sorted(folder.rglob("*")):
        if not path.is_file():
            continue
        if suffixes and path.suffix.lower() not in suffixes:
            continue
        out.append(path)
    return out


def existing_frames(folder: Path) -> list[Path]:
    hits: list[Path] = []
    if not folder.is_dir():
        return hits
    for path in sorted(folder.rglob("*")):
        if not path.is_file():
            continue
        name = path.name.lower()
        suffix = path.suffix.lower()
        if suffix not in FRAME_SUFFIXES:
            continue
        parent = path.parent.name.lower()
        if (
            name.startswith("frame-")
            or name.startswith("still-")
            or "frame" in name
            or "still" in name
            or parent in {"frames", "stills"}
            or "frames" in {part.lower() for part in path.parts}
            or "stills" in {part.lower() for part in path.parts}
        ):
            hits.append(path)
    return hits


def existing_transcripts(folder: Path) -> list[Path]:
    """Case-insensitive: TRANSCRIPT.md, *.vtt, captions*.{txt,json,md,vtt}, *transcript*."""
    hits: list[Path] = []
    if not folder.is_dir():
        return hits
    seen: set[Path] = set()
    for path in sorted(folder.rglob("*")):
        if not path.is_file():
            continue
        name = path.name.lower()
        match = False
        if name in TRANSCRIPT_EXACT:
            match = True
        elif "transcript" in name:
            match = True
        elif name.endswith(".vtt"):
            match = True
        elif name.startswith("captions") and path.suffix.lower() in CAPTION_SUFFIXES:
            match = True
        if match and path not in seen:
            seen.add(path)
            hits.append(path)
    return hits


def existing_videos(folder: Path) -> list[Path]:
    if not folder.is_dir():
        return []
    return [
        path
        for path in sorted(folder.rglob("*"))
        if path.is_file() and path.suffix.lower() in VIDEO_SUFFIXES
    ]


def existing_raw_files(folder: Path) -> list[Path]:
    raw = folder / "raw"
    if not raw.is_dir():
        return []
    return [path for path in sorted(raw.rglob("*")) if path.is_file()]


def pick_source_transcript(paths: list[Path]) -> Path | None:
    if not paths:
        return None

    def rank(path: Path) -> tuple[int, str]:
        name = path.name.lower()
        if name == "transcript.md":
            return (0, name)
        if name.endswith(".en-orig.vtt"):
            return (1, name)
        if name.endswith(".en.vtt"):
            return (2, name)
        if name.endswith(".vtt"):
            return (3, name)
        if name.startswith("captions_clean"):
            return (4, name)
        if "transcript" in name:
            return (5, name)
        return (6, name)

    return sorted(paths, key=rank)[0]


def looks_like_vtt(raw: str) -> bool:
    for line in raw.replace("\r\n", "\n").split("\n"):
        if line.strip().upper().startswith("WEBVTT"):
            return True
    return False


def strip_leading_timestamp(line: str) -> str:
    """Drop a leading cue or bracket timestamp; keep words on the same line."""
    rest = ARROW_TIMESTAMP.sub("", line, count=1)
    rest = BRACKET_TIMESTAMP.sub("", rest, count=1)
    return rest.strip()


def remainder_is_cue_settings(text: str) -> bool:
    if not text:
        return True
    return all(CUE_SETTING_TOKEN.match(token) for token in text.split())


def is_vtt_block_header(line: str) -> bool:
    """VTT NOTE/STYLE/REGION headers only. Never match spoken 'region, which…'."""
    upper = line.upper()
    if upper in {"NOTE", "STYLE", "REGION"}:
        return True
    return upper.startswith("NOTE ")


def clean_transcript(raw: str) -> dict[str, Any]:
    """Spoken words plus optional provenance. Evidence refs stay on the original file."""
    in_vtt = looks_like_vtt(raw)
    lines_out: list[str] = []
    provenance: list[str] = []
    skip_until_blank = False
    in_header = True
    for line in raw.replace("\r\n", "\n").split("\n"):
        stripped = line.strip()
        if skip_until_blank:
            if not stripped:
                skip_until_blank = False
            continue
        if not stripped:
            continue
        prov = PROVENANCE_LINE.match(stripped)
        if prov:
            provenance.append(prov.group(1).strip())
            continue
        upper = stripped.upper()
        if upper.startswith("WEBVTT"):
            continue
        if in_header and KIND_LANGUAGE_LINE.match(stripped):
            continue
        if OPERATOR_LINE.match(stripped):
            continue
        if in_vtt and is_vtt_block_header(stripped):
            if stripped.upper() in {"NOTE", "STYLE", "REGION"}:
                skip_until_blank = True
            continue
        if in_vtt and VTT_CUE_NUMBER.match(stripped):
            continue
        if MD_HEADING.match(stripped):
            continue
        if DIAGNOSTIC_LINE.match(stripped):
            continue
        if contains_caption_gap_token(stripped):
            continue
        body = strip_leading_timestamp(stripped)
        if body != stripped and remainder_is_cue_settings(body):
            continue
        stripped = body
        if not stripped:
            continue
        stripped = INLINE_VTT_TAGS.sub("", stripped)
        stripped = re.sub(r"\s+", " ", stripped).strip()
        if stripped:
            in_header = False
            lines_out.append(stripped)
    return {
        "text": "\n".join(lines_out).strip(),
        "transcript_source": provenance[0] if provenance else None,
        "provenance": provenance,
    }


def spoken_text(raw: str) -> str:
    """Spoken words only. Evidence refs still point at the original file."""
    return str(clean_transcript(raw)["text"])


def is_cjk_char(char: str) -> bool:
    code = ord(char)
    return (
        0x3040 <= code <= 0x30FF
        or 0x3400 <= code <= 0x4DBF
        or 0x4E00 <= code <= 0x9FFF
        or 0xF900 <= code <= 0xFAFF
        or 0xAC00 <= code <= 0xD7AF
        or 0x20000 <= code <= 0x2A6DF
    )


def unicode_word_tokens(text: str) -> list[str]:
    """Unicode words. CJK runs count each character, not spaces."""
    tokens: list[str] = []
    buf: list[str] = []

    def flush_latin() -> None:
        if buf:
            tokens.append("".join(buf))
            buf.clear()

    for char in text:
        if is_cjk_char(char):
            flush_latin()
            tokens.append(char)
        elif char.isalpha():
            buf.append(char)
        else:
            flush_latin()
    flush_latin()
    return tokens


def is_suspect_hallucination(text: str) -> bool:
    """True when cleaned text is only Whisper leftovers or music symbols."""
    stripped = text.strip()
    if not stripped:
        return False
    had_signal = bool(unicode_word_tokens(stripped)) or any(
        symbol in stripped for symbol in HALLUCINATION_SYMBOLS
    )
    if not had_signal:
        return False
    remaining = stripped.lower()
    for symbol in HALLUCINATION_SYMBOLS:
        remaining = remaining.replace(symbol, " ")
    for phrase in HALLUCINATION_PHRASES:
        remaining = remaining.replace(phrase, " ")
    return not unicode_word_tokens(remaining)


def contains_caption_gap_token(raw: str) -> bool:
    return bool(CAPTION_GAP_TOKEN.search(raw))


def is_caption_gap_line(line: str) -> bool:
    return contains_caption_gap_token(line)


def extract_caption_gap(raw: str) -> str | None:
    for line in raw.replace("\r\n", "\n").split("\n"):
        stripped = line.strip()
        if not contains_caption_gap_token(stripped):
            continue
        cleaned = stripped.strip("*_ ").strip()
        cleaned = re.sub(r"^\*+|\*+$", "", cleaned).strip()
        return cleaned or "CAPTION_GAP"
    return None


def json_caption_texts(obj: Any) -> list[str]:
    """Only caption-text fields. Never ids, descriptions, URLs, or source labels."""
    out: list[str] = []
    if isinstance(obj, dict):
        for key, value in obj.items():
            name = str(key).lower()
            if name in CAPTION_JSON_TEXT_KEYS:
                if isinstance(value, str):
                    out.append(value)
                elif isinstance(value, list):
                    for item in value:
                        if isinstance(item, str):
                            out.append(item)
                        else:
                            out.extend(json_caption_texts(item))
            elif isinstance(value, (dict, list)):
                out.extend(json_caption_texts(value))
    elif isinstance(obj, list):
        for item in obj:
            out.extend(json_caption_texts(item))
    return out


def read_transcript_payload(path: Path) -> str:
    """File body, or caption-text fields only from JSON."""
    raw = path.read_text(encoding="utf-8", errors="replace")
    if path.suffix.lower() != ".json":
        return raw
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError:
        return raw
    fields = json_caption_texts(obj)
    return "\n".join(fields) if fields else ""


def is_caption_format_file(path: Path) -> bool:
    name = path.name.lower()
    if name.endswith(".vtt"):
        return True
    if name in {"captions_timeline.txt", "stills_captions.json", "player-caption-samples.json"}:
        return True
    return name.startswith("captions") and path.suffix.lower() in CAPTION_SUFFIXES


def is_transcript_md(path: Path) -> bool:
    return path.name.lower() == "transcript.md"


def caption_file_is_speech(raw: str) -> bool:
    cleaned = spoken_text(raw)
    tokens = unicode_word_tokens(cleaned)
    if len(tokens) < YT_CAPTION_MIN_TOKENS:
        return False
    return not is_suspect_hallucination(cleaned)


def source_declares_caption_gap(value: Any) -> bool:
    return isinstance(value, str) and contains_caption_gap_token(value)


def meta_affirms_transcript(meta: dict[str, Any], has_transcript_flag: bool | None) -> bool:
    if has_transcript_flag is True:
        return True
    chars = meta.get("transcript_chars")
    return isinstance(chars, (int, float)) and chars > 0


def meta_denies_transcript(meta: dict[str, Any], has_transcript_flag: bool | None) -> bool:
    """META is authoritative. Affirm wins when both signals are present."""
    if meta_affirms_transcript(meta, has_transcript_flag):
        return False
    if has_transcript_flag is False:
        return True
    chars = meta.get("transcript_chars")
    return isinstance(chars, (int, float)) and chars == 0


def ae_denies_transcript(ae: dict[str, Any]) -> bool:
    if source_declares_caption_gap(ae.get("transcript_source")):
        return True
    overall = ae.get("overall") if isinstance(ae.get("overall"), dict) else {}
    return source_declares_caption_gap(overall.get("transcript_source"))


def ae_affirms_transcript(ae: dict[str, Any]) -> bool:
    value = ae.get("transcript_source")
    if not isinstance(value, str) or not value.strip():
        return False
    return not source_declares_caption_gap(value)


def youtube_speech_files(
    paths: list[Path],
    read_text: Callable[[Path], str],
) -> tuple[list[Path], list[Path], Path | None, str | None]:
    """Return (speech files, non-speech files, clean TRANSCRIPT.md, gap_note)."""
    speech: list[Path] = []
    other: list[Path] = []
    clean_md: Path | None = None
    gap_note: str | None = None
    for path in paths:
        raw = read_text(path)
        if is_transcript_md(path):
            if contains_caption_gap_token(raw):
                other.append(path)
                gap_note = gap_note or extract_caption_gap(raw) or "CAPTION_GAP"
            else:
                speech.append(path)
                clean_md = path
            continue
        if is_caption_format_file(path):
            if caption_file_is_speech(raw):
                speech.append(path)
            else:
                other.append(path)
            continue
        other.append(path)
    return speech, other, clean_md, gap_note


def pick_youtube_cleaned(
    clean_md: Path | None,
    speech: list[Path],
    read_text: Callable[[Path], str],
) -> dict[str, Any]:
    empty: dict[str, Any] = {"text": "", "transcript_source": None, "provenance": []}
    if clean_md is not None:
        return clean_transcript(read_text(clean_md))
    best = empty
    for path in speech:
        cleaned = clean_transcript(read_text(path))
        if len(str(cleaned["text"])) > len(str(best["text"])):
            best = cleaned
    return best


def pick_youtube_source_text(
    clean_md: Path | None,
    speech: list[Path],
    read_text: Callable[[Path], str],
) -> str:
    return str(pick_youtube_cleaned(clean_md, speech, read_text)["text"])


def bidirectional_disagreement(
    *,
    has_speech: bool,
    declared_gap: bool,
    declared_speech: bool,
    declared_label: str | None,
) -> str | None:
    if declared_gap and has_speech:
        label = declared_label or "declared_no_transcript"
        return f"declared no transcript ({label}); content has speech"
    if declared_speech and not has_speech:
        label = declared_label or "declared_transcript"
        return f"declared transcript ({label}); content has no speech"
    return None


def clip_source_text(text: str, limit: int = SOURCE_TEXT_MAX_CHARS) -> tuple[str, int, bool]:
    n = len(text)
    if n <= limit:
        return text, n, False
    return text[:limit], n, True


def rel_ref(root: Path, path: Path) -> str:
    try:
        return str(path.resolve().relative_to(root.resolve()))
    except ValueError:
        return str(path)


def map_verified(value: str | None) -> str:
    raw = (value or "").strip().lower()
    mapping = {
        "yes": "verified",
        "partial": "partial",
        "no": "unverified",
        "n.a.": "not_applicable",
        "n/a": "not_applicable",
        "na": "not_applicable",
    }
    return mapping.get(raw, "unknown" if raw else "unknown")


def map_status(value: str | None) -> str:
    raw = (value or "").strip().upper()
    mapping = {
        "DONE": "ok",
        "OK": "ok",
        "FAILED": "failed",
        "PARTIAL": "partial",
        "PENDING": "pending",
        "IN_PROGRESS": "pending",
        "QUARANTINED": "failed",
    }
    return mapping.get(raw, "unknown" if raw else "unknown")


def empty_convert_report() -> dict[str, Any]:
    return {"packets": [], "invalid": []}


def collect_packet(
    report: dict[str, Any],
    ref: str,
    builder: Callable[[], dict[str, Any]],
    *,
    strict: bool,
) -> bool:
    """Validate and keep a packet. Return False when this item failed.

    Default path records the reason and continues. `--strict` still records
    the reason; callers stop the walk when this returns False.
    """
    try:
        packet = validate_packet(builder())
        report["packets"].append(packet)
        return True
    except (PacketValidationError, ValueError, OSError, json.JSONDecodeError) as exc:
        report["invalid"].append({"ref": ref, "reason": str(exc)})
        return False if strict else True


def convert_summary(
    adapter: str,
    report: dict[str, Any],
    output: str | None = None,
    *,
    strict: bool = False,
) -> dict[str, Any]:
    invalid_n = len(report["invalid"])
    ok = True
    if invalid_n and (strict or not report["packets"]):
        ok = False
    payload: dict[str, Any] = {
        "ok": ok,
        "adapter": adapter,
        "packets": len(report["packets"]),
        "invalid": invalid_n,
        "invalid_items": report["invalid"],
    }
    if output is not None:
        payload["output"] = output
    return payload
