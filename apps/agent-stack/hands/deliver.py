"""Canvas delbundle: one finished deliverable = one folder with the files, a manifest and a readme, each file checked.

The check is the outcome oracle: media is read back with ffprobe (duration, size), images with sips, PDFs by header
and page count, text by its lines. A file that fails its check is still copied but the bundle says "check failed".
Copies only; the originals are never moved or changed.
"""
from __future__ import annotations
import hashlib
import json
import re
import shutil
import subprocess
import time
from pathlib import Path

ROOT = Path.home() / "ArtCraft Studio/00 Private/Projects/Jarvis/DELIVERIES"
MEDIA = {".mp4", ".mov", ".m4a", ".mp3", ".wav", ".webm", ".mkv"}
IMAGES = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".heic", ".tiff"}


def _check(p: Path) -> str:
    ext = p.suffix.lower()
    try:
        if ext in MEDIA:
            out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height",
                                  "-of", "json", str(p)], capture_output=True, text=True, timeout=60)
            d = json.loads(out.stdout or "{}")
            secs = float((d.get("format") or {}).get("duration") or 0)
            v = next((s for s in d.get("streams", []) if s.get("width")), {})
            return f"plays: {secs:.1f} s" + (f", {v['width']}x{v['height']}" if v else "") if secs > 0 else "check failed: no duration"
        if ext in IMAGES:
            out = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(p)], capture_output=True, text=True, timeout=30).stdout
            wh = re.findall(r"pixel(?:Width|Height): (\d+)", out)
            return f"image {wh[0]}x{wh[1]}" if len(wh) == 2 else "check failed: not an image"
        raw = p.read_bytes()
        if ext == ".pdf":
            return f"pdf, {len(re.findall(rb'/Type\s*/Page[^s]', raw))} pages" if raw.startswith(b"%PDF") else "check failed: not a PDF"
        text = raw.decode("utf-8")
        return f"text, {len(text.splitlines())} lines" if text.strip() else "check failed: empty"
    except (OSError, ValueError, UnicodeDecodeError, subprocess.SubprocessError) as exc:
        return f"check failed: {type(exc).__name__}"


def bundle(title: str, files: list, note: str = "", root: Path = ROOT, now: float | None = None) -> dict:
    srcs = [Path(str(f)).expanduser() for f in files or []]
    missing = [str(s) for s in srcs if not s.is_file()]
    if not srcs or missing:
        raise ValueError(f"files not found: {', '.join(missing) or 'none given'}")
    slug = re.sub(r"[^a-z0-9]+", "-", str(title).lower()).strip("-")[:50] or "delivery"
    out = root / f"{time.strftime('%Y-%m-%d-%H%M', time.localtime(now or time.time()))}-{slug}"
    out.mkdir(parents=True, exist_ok=False)
    rows = []
    for s in srcs:
        dest = out / s.name
        shutil.copy2(s, dest)
        rows.append({"file": s.name, "from": str(s).replace(str(Path.home()), "~"), "bytes": dest.stat().st_size,
                     "sha256": hashlib.sha256(dest.read_bytes()).hexdigest(), "check": _check(dest)})
    ok = all(not r["check"].startswith("check failed") for r in rows)
    (out / "MANIFEST.json").write_text(json.dumps({"title": title, "made": time.strftime("%Y-%m-%d %H:%M"), "all_checked": ok,
                                                   "files": rows}, indent=1))
    (out / "README.md").write_text(f"# {title}\n\n{note}\n\n" + "\n".join(f"- **{r['file']}** — {r['check']} (from {r['from']})"
                                                                     for r in rows) + "\n")
    # canvas sig_x29: every delivery is findable from one index note, newest last
    index = root / "INDEX.md"
    if not index.exists():
        index.write_text("# Jarvis deliveries\n\nEvery finished deliverable, with its checks. Newest last.\n\n")
    with index.open("a", encoding="utf-8") as fh:
        fh.write(f"- {time.strftime('%Y-%m-%d %H:%M')} [{title}]({out.name}/README.md) — "
                 f"{len(rows)} file(s), {'all checks passed' if ok else 'a check failed'}\n")
    return {"ok": ok, "folder": str(out), "files": rows}
