"""Canvas sig_z94 (scroll-video asset): a 720p clip, up to 30 s, scrubbed by scrolling, as a ready web asset.

Every frame is a keyframe (GOP 1) so seeking to any scroll position is instant; the page maps scroll progress to
video.currentTime. Output: <out>/clip.mp4 + <out>/index.html. The result is checked with ffprobe, not assumed.
"""
from __future__ import annotations
import json
import subprocess
from pathlib import Path

PAGE = """<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>body{{margin:0;background:#000}}#track{{height:{vh}vh}}video{{position:sticky;top:0;width:100%;height:100vh;object-fit:cover}}</style>
<div id="track"><video id="v" src="clip.mp4" muted playsinline preload="auto"></video></div>
<script>
const v=document.getElementById('v'),t=document.getElementById('track');let want=0,busy=false;
function onScroll(){{const max=t.offsetHeight-innerHeight;want=Math.min(1,Math.max(0,scrollY/max))*(v.duration||0);
if(!busy){{busy=true;requestAnimationFrame(()=>{{v.currentTime=want;busy=false}})}}}}
addEventListener('scroll',onScroll,{{passive:true}});v.addEventListener('loadedmetadata',onScroll);
// hosts without byte ranges cannot seek a streamed video: load it whole once (file:// keeps the plain src)
fetch('clip.mp4').then(r=>r.ok?r.blob():null).then(b=>{{if(b)v.src=URL.createObjectURL(b)}}).catch(()=>{{}});
</script>
"""


def probe(path: Path) -> dict:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries",
                          "stream=height,nb_read_frames:format=duration", "-of", "json", str(path)],
                         capture_output=True, text=True, timeout=300, check=True).stdout
    d = json.loads(out)
    keys = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-skip_frame", "nokey", "-count_frames",
                           "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", str(path)],
                          capture_output=True, text=True, timeout=300, check=True).stdout.strip()
    s = d["streams"][0]
    return {"height": int(s["height"]), "frames": int(s["nb_read_frames"]), "keyframes": int(keys or 0),
            "seconds": round(float(d["format"]["duration"]), 2)}


def make(src: str, out_dir: str, *, seconds: float = 30, start: float = 0, title: str = "Scroll video") -> dict:
    src_p, out = Path(src).expanduser(), Path(out_dir).expanduser()
    if not src_p.is_file():
        raise ValueError(f"no video at {src_p}")
    out.mkdir(parents=True, exist_ok=True)
    clip = out / "clip.mp4"
    seconds = max(1.0, min(float(seconds), 30.0))
    cp = subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(start), "-t", str(seconds), "-i", str(src_p),
                         "-vf", "scale=-2:720,fps=30", "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-g", "1",
                         "-keyint_min", "1", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", str(clip)],
                        capture_output=True, text=True, timeout=900)
    if cp.returncode:
        raise ValueError(f"ffmpeg failed: {cp.stderr.strip()[-300:]}")
    p = probe(clip)
    (out / "index.html").write_text(PAGE.format(title=title.replace("<", ""), vh=int(100 + p["seconds"] * 40)))
    ok = p["height"] == 720 and p["frames"] > 0 and p["keyframes"] == p["frames"]
    return {"ok": ok, "clip": str(clip), "page": str(out / "index.html"), "bytes": clip.stat().st_size, **p}
