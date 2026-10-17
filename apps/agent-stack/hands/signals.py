"""Jarvis's own signal engine (Evens 2026-10-16: "I should be able to just copy the link and give it to Jarvis ... or
tell Jarvis to look for new signals ... the same way the Researcher bot treats every signal, but in its own way").

Same contract as the Researcher desk (deep-video-learning + multimodal-youtube-learning): the whole source is read,
said vs shown are kept apart, every method is extracted (one signal can hold dozens), and a packet lands in the
n8n-cursor repo so other agents never re-process it. Jarvis's own way:

- YouTube: yt-dlp pulls captions (timestamped transcript) and a <=720p copy into a temp cache; ffmpeg cuts a frame every
  FRAME_EVERY_S seconds into timestamped contact sheets (like the Researcher's sheets); the video is DELETED after.
- X: the post is read in his own Safari (already signed in) in a background tab; every link in it is opened and read
  too, and a YouTube link becomes its own signal.
- Methods: one long-context vision model reads transcript + contact sheets (or post + linked pages) and writes
  LEARNED.md (Researcher-style A-K, SOURCE/INFERENCE labels) and methods.jsonl (every method, no cap).
- Packet: docs/hive/outer-heaven/CONTENT/watch-later/packets/<id>/ in a Jarvis signals worktree, committed on a local
  branch. Pushing is his kept stop (public repo): `push` is a separate step he approves.
- Scan: his YouTube Watch Later and X bookmarks pages in Safari (background), new ids = not already a packet.

CLI: signals.py ingest URL | scan [youtube|x|all] [--ingest N] | push | status
"""
from __future__ import annotations

import base64
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
CACHE = Path(os.environ.get("JARVIS_SIGNAL_CACHE") or Path.home() / "Library/Caches/jarvis/signals")
REPO_MAIN = Path(os.environ.get("JARVIS_SIGNAL_REPO") or Path.home() / "jarvis-main")
WORKTREE = Path(os.environ.get("JARVIS_SIGNAL_WORKTREE") or Path.home() / "jarvis-cowork/jarvis-signals")
BRANCH = "jarvis/signals"
PACKETS = "docs/hive/outer-heaven/CONTENT/watch-later/packets"
LEDGER = CACHE / "ledger.jsonl"
FRAMES = Path(os.environ.get("JARVIS_SIGNAL_FRAMES") or Path.home() / "jarvis-proof/signal-frames")
FRAME_EVERY_S = 2          # one frame every 2 s ("frame by frame" without terabytes)
SHEET_COLS, SHEET_ROWS = 6, 5  # 30 frames per sheet = 60 s of video per sheet
MAX_HEIGHT = 720
MAX_LINKS = 8
EXTRACT_MODELS = ("google/gemini-3.6-flash", "openai/gpt-6.1-sol", "anthropic/claude-sonnet-5.5")  # long context + vision
SHEETS_TO_MODEL = 40
FONT = "/System/Library/Fonts/Helvetica.ttc"

YT_RE = re.compile(r"(?:youtube\.com/(?:watch\?v=|shorts/|live/|embed/)|youtu\.be/)([A-Za-z0-9_-]{11})")
X_RE = re.compile(r"(?:x|twitter)\.com/([A-Za-z0-9_]+)/status/(\d+)")


def _load(name: str, file: str):
    mod = sys.modules.get(name)
    if mod is None:
        spec = importlib.util.spec_from_file_location(name, HERE / file)
        mod = importlib.util.module_from_spec(spec); sys.modules[name] = mod; spec.loader.exec_module(mod)
    return mod


G = _load("agent_stack_gemini_direct", "gemini_direct.py")  # Google AI Studio free tier (watch his Watch Later free)


def log(msg: str) -> None:
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def ledger(row: dict) -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    with LEDGER.open("a") as fh:
        fh.write(json.dumps({"at": time.time(), **row}) + "\n")


# ---- what is a signal ------------------------------------------------------------------------------------------
def classify(url: str) -> dict:
    m = YT_RE.search(url)
    if m:
        return {"kind": "youtube", "id": m.group(1), "url": f"https://www.youtube.com/watch?v={m.group(1)}"}
    m = X_RE.search(url)
    if m:
        return {"kind": "x", "id": f"x-{m.group(2)}", "url": f"https://x.com/{m.group(1)}/status/{m.group(2)}"}
    slug = re.sub(r"[^a-z0-9]+", "-", re.sub(r"^https?://(www\.)?", "", url.lower())).strip("-")[:60]
    return {"kind": "web", "id": f"web-{slug}", "url": url}


def known_ids() -> set:
    """Signals already ingested by anyone: packets in the signals worktree and on his main checkout."""
    ids = set()
    for root in (WORKTREE, REPO_MAIN):
        d = root / PACKETS
        if d.is_dir():
            ids |= {p.name for p in d.iterdir() if p.is_dir()}
    if LEDGER.exists():
        for line in LEDGER.read_text().splitlines():
            try:
                r = json.loads(line)
            except ValueError:
                continue
            if r.get("event") == "packet":
                ids.add(r["id"])
    return ids


# ---- YouTube ---------------------------------------------------------------------------------------------------
def json3_to_text(raw: dict) -> str:
    """YouTube json3 captions -> '[mm:ss] line' text (the Researcher's full.txt, with times)."""
    out, last = [], ""
    for ev in raw.get("events") or []:
        segs = "".join(s.get("utf8", "") for s in ev.get("segs") or []).replace("\n", " ").strip()
        if not segs or segs == last:
            continue
        t = int((ev.get("tStartMs") or 0) / 1000)
        out.append(f"[{t // 60:02d}:{t % 60:02d}] {segs}")
        last = segs
    return "\n".join(out)


def youtube(sig: dict, work: Path) -> dict:
    vid = sig["id"]
    meta = json.loads(subprocess.run(["yt-dlp", "-J", "--no-warnings", sig["url"]], capture_output=True, text=True,
                                     timeout=120, check=True).stdout)
    subprocess.run(["yt-dlp", "--skip-download", "--write-subs", "--write-auto-subs", "--sub-langs", "en.*,en,fr.*",
                    "--sub-format", "json3", "--no-warnings", "-o", str(work / "cap.%(ext)s"), sig["url"]],
                   capture_output=True, text=True, timeout=180)
    caps = sorted(work.glob("cap*.json3"), key=lambda p: ("orig" not in p.name, p.name))
    transcript = json3_to_text(json.loads(caps[0].read_text())) if caps else ""
    log(f"{vid}: transcript {len(transcript.split())} words from {caps[0].name if caps else 'no captions'}")
    # Evens 10-16: no download; Gemini watches the video itself from the link (frames + audio). The frame path below
    # is only for videos Google will not open (private or unlisted).
    return {"title": meta.get("title"), "channel": meta.get("channel") or meta.get("uploader"),
            "duration": meta.get("duration"), "upload_date": meta.get("upload_date"), "description": meta.get("description"),
            "chapters": meta.get("chapters"), "transcript": transcript, "sheets": [], "keyframes": [], "watch": True,
            "work": str(work), "links": _links(meta.get("description") or "")}


def watch_fallback(sig: dict, got: dict) -> dict:
    """Google could not open the link: download a <=720p copy, read EVERY kept frame, delete the copy."""
    if free_gb() < MIN_FREE_GB:
        raise RuntimeError(f"Google could not open this video and his disk has only {free_gb():.1f} GB free for the "
                           f"frame route (needs {MIN_FREE_GB:.0f} GB)")
    work = Path(got.get("work") or CACHE / "work" / sig["id"])
    work.mkdir(parents=True, exist_ok=True)
    try:
        video = download(sig["url"], work, got.get("duration") or 0)
        sheets, keyframes = contact_sheets(video, work / "sheets")
    finally:
        for v in work.glob("video.*"):
            v.unlink()  # Evens: downloads do not stay on the Mac
    log(f"{sig['id']}: fallback frame route, {len(keyframes)} frames, video deleted")
    got.update({"sheets": sheets, "keyframes": keyframes})
    return _extract_frames(sig, got)


CLIENTS = ("default", "mweb", "tv", "ios")  # live 10-16: the default client got HTTP 403, mweb worked


def download_timeout(duration: float) -> int:
    """Live limit was a flat 30 min; a 2 h video at a slow link needs longer."""
    return max(1800, int(float(duration or 0) * 1.5))


def download(url: str, work: Path, duration: float = 0) -> Path:
    """<=720p copy into the temp cache, trying YouTube player clients in turn."""
    errors = []
    for client in CLIENTS:
        extra = [] if client == "default" else ["--extractor-args", f"youtube:player_client={client}"]
        cp = subprocess.run(["yt-dlp", "--no-update", "--no-warnings", *extra, "-f", f"b[height<={MAX_HEIGHT}]/bv*[height<={MAX_HEIGHT}]+ba/b",
                             "--merge-output-format", "mp4", "-o", str(work / "video.%(ext)s"), url],
                            capture_output=True, text=True, timeout=download_timeout(duration))
        got = [p for p in work.glob("video.*") if p.suffix in (".mp4", ".webm", ".mkv")]
        if cp.returncode == 0 and got:
            return got[0]
        errors.append(f"{client}: {(cp.stderr or '').strip().splitlines()[-1:] or ['failed']}")
        for p in work.glob("video.*"):
            p.unlink()
    raise RuntimeError("could not download the video (" + "; ".join(errors) + "); try his Safari route")


# ffmpeg's default duplicate test: only frames identical to the last kept one are dropped. Live 10-16 the old setting
# (hi=64*400:lo=64*160:frac=0.5) kept 3 of 274 frames of a HUD demo and lost every on-screen change but scene cuts.
KEEP_FILTER = "mpdecimate"
KEYFRAME_W = 1280   # readable on-screen text (prompts, code, repo names) for the vision pass; not stored
SHEET_W = 320       # stored contact-sheet tiles (the repo copy)
KEYFRAMES_TO_MODEL = 60    # images attached to the final extraction call (all frames are read via frame_notes)
FRAMES_PER_NOTE_CALL = 40  # images per frame-notes call; every kept frame is read, in order, no sampling
FRAME_NOTES_PROMPT = """These are consecutive frames from a video (time shown before each). For EVERY frame write one line:
"MM:SS — what is on screen": exact visible text (titles, prompts, code, commands, file and repo names, URLs, settings,
numbers), the app or UI shown, and what changed since the previous frame. Do not skip frames, do not summarise across
frames, do not guess what is not visible. Plain lines only."""


def frame_notes(keys: list) -> tuple:
    """Read every kept frame in batches (Evens 10-16: "so jarvis skimmed nothing?"; 7 of 26 videos had half their
    frames dropped by a 60-image cap). Returns (notes text, frames read)."""
    notes, read = [], 0
    for at in range(0, len(keys), FRAMES_PER_NOTE_CALL):
        batch = keys[at:at + FRAMES_PER_NOTE_CALL]
        content = [{"type": "text", "text": FRAME_NOTES_PROMPT}]
        for k, t in batch:
            content.append({"type": "text", "text": f"frame at {_mmss(int(t))}:"})
            content.append({"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + base64.b64encode(Path(k).read_bytes()).decode()}})
        notes.append(_openrouter([{"role": "user", "content": content}], max_tokens=8000).strip())
        read += len(batch)
    return "\n".join(notes), read


def contact_sheets(video: Path, out: Path) -> tuple:
    """Look at one frame every FRAME_EVERY_S seconds and keep only frames where the screen changed (live 10-16: 27 of
    192 frames, still every step of the tutorial). Returns (sheets, keyframes): small 6x5 contact sheets for the repo,
    with sheets/INDEX.md giving every frame's time, and full-size keyframes for the model to read (deleted after)."""
    out.mkdir(parents=True, exist_ok=True)
    keys = out.parent / "keyframes"
    keys.mkdir(exist_ok=True)
    cp = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(video), "-vf",
                         f"fps=1/{FRAME_EVERY_S},{KEEP_FILTER},scale='min({KEYFRAME_W},iw)':-2,showinfo",
                         "-fps_mode", "vfr", "-q:v", "4", str(keys / "k_%05d.jpg")],
                        capture_output=True, text=True, timeout=3600)
    if cp.returncode != 0:
        raise RuntimeError("ffmpeg frame pass failed: " + cp.stderr[-300:])
    times = [float(m) for m in re.findall(r"pts_time:([0-9.]+)", cp.stderr)]
    keyframes = sorted(keys.glob("k_*.jpg"))
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-framerate", "1", "-i", str(keys / "k_%05d.jpg"), "-vf",
                    f"scale={SHEET_W}:-2,tile={SHEET_COLS}x{SHEET_ROWS}:padding=4:margin=4", "-q:v", "6",
                    str(out / "sheet_%03d.jpg")], check=True, timeout=3600)
    sheets = sorted(out.glob("sheet_*.jpg"))
    per = SHEET_COLS * SHEET_ROWS
    lines = [f"Looked at one frame every {FRAME_EVERY_S} s; kept {len(keyframes)} frames where the screen changed. "
             f"{SHEET_COLS} across x {SHEET_ROWS} down, left to right then top to bottom."]
    for n, sh in enumerate(sheets):
        lines.append(f"- {sh.name}: " + ", ".join(_mmss(int(t)) for t in times[n * per:(n + 1) * per]))
    (out / "INDEX.md").write_text("\n".join(lines) + "\n")
    return sheets, [(k, times[i] if i < len(times) else 0.0) for i, k in enumerate(keyframes)]


def _mmss(t: int) -> str:
    return f"{t // 60:02d}:{t % 60:02d}"


def _links(text: str) -> list:
    return list(dict.fromkeys(re.findall(r"https?://[^\s)\]>\"']+", text)))[:MAX_LINKS]


# ---- X (his Safari, signed in, background tab) -----------------------------------------------------------------
POST_JS = r"""const a=[...document.querySelectorAll('article')];const main=a[0];
if(!main)return JSON.stringify({error:'no post on the page yet'});
const links=[...new Set([...a.slice(0,6)].flatMap(x=>[...x.querySelectorAll('a[href]')]).map(l=>{const t=(l.innerText||'').trim();
 return (t.startsWith('http')?t.replace(/…$/,''):'')||l.href}).filter(h=>/^https?:/.test(h)&&!/x\.com\/(hashtag|search|i\/|[^/]+\/(photo|analytics|likes|retweets))|^https?:\/\/(x|twitter)\.com\/[^/]+$/.test(h)))];
return JSON.stringify({text:a.slice(0,6).map(x=>x.innerText).join('\n---\n').slice(0,20000),links:links.slice(0,30)})"""


def x_post(sig: dict, work: Path, safari=None) -> dict:
    SD = _load("agent_stack_safari_dom_signals", "safari_dom.py")
    J = SD.J
    st: dict = {}
    d = safari or SD.SafariDOM(st, lambda r: {"text": "no hands"}, lambda x, y: None)
    try:
        d.act({"action": "new_tab", "url": sig["url"]})
        post = {}
        for _ in range(10):
            post = d.js(J.wrap(POST_JS))
            if not post.get("error"):
                break
            time.sleep(1.5)
        if post.get("error"):
            raise RuntimeError(f"could not read the post: {post['error']}")
        if "log in" in post.get("text", "").lower()[:300] and "password" in post.get("text", "").lower():
            raise RuntimeError("LOGIN NEEDED: X wants him signed in in Safari")
        pages = []
        for url in [u for u in post.get("links") or [] if not X_RE.search(u)][:MAX_LINKS]:
            d.act({"action": "navigate", "url": url})
            got = d.js(J.READ)
            pages.append({"url": url, "final": got.get("url"), "title": got.get("title"), "text": (got.get("text") or "")[:12000]})
            log(f"{sig['id']}: read link {got.get('url')}")
        return {"title": post.get("text", "").split("\n")[0][:120], "transcript": post.get("text", ""), "pages": pages,
                "links": post.get("links") or [], "sheets": []}
    finally:
        try:
            d.act({"action": "close_tab"})
        except Exception:  # noqa: BLE001 - closing his-browser tab is best effort
            pass


def web_page(sig: dict, work: Path, safari=None) -> dict:
    """Any other page: read in his Safari (handles sign-ins and script-heavy sites), background tab."""
    SD = _load("agent_stack_safari_dom_signals", "safari_dom.py")
    d = safari or SD.SafariDOM({}, lambda r: {"text": "no hands"}, lambda x, y: None)
    try:
        d.act({"action": "new_tab", "url": sig["url"]})
        got = d.js(SD.J.READ)
        text = str(got.get("text") or "")
        return {"title": got.get("title") or sig["url"], "transcript": text[:60000], "sheets": [], "links": _links(text)}
    finally:
        try:
            d.act({"action": "close_tab"})
        except Exception:  # noqa: BLE001
            pass


# ---- methods ---------------------------------------------------------------------------------------------------
EXTRACT_PROMPT = """You are Jarvis's signal analyst, working the way Evens's Researcher desk works (deep-video-learning +
multimodal-youtube-learning), in your own words. Read the WHOLE source below: the transcript (with [mm:ss] times) and,
for videos, the contact sheets (one frame every {every} s; sheet N covers minute N-1, frames left to right then top to
bottom; each image is labeled with its sheet name; sheets/INDEX.md, given below, lists every frame's time). Keep apart what was SAID and what was SHOWN on
screen; never invent a click or a UI path you cannot see; tape numbers and prices are UNVERIFIED.

Return JSON only: {{"learned_md": "...", "methods": [...], "capabilities": [...]}}
learned_md: markdown with these sections: A. Source map (beats in order, with times) · B. Atomic knowledge (claim,
why, conditions, evidence, SOURCE/INFERENCE label) · C. Procedures as ordered steps · D. Shown on screen (what the
sheets show: tools, screens, prompts, code, settings, at which times; say UNKNOWN when not visible) · E. Said vs shown
mismatches · F. Failures and recoveries · G. Decision points (IF -> THEN) · H. Tools/repos/MCPs named, with what they
were used for · I. Challenges (what may be wrong, outdated or hype) · J. Use for Jarvis (how Evens's Mac operator could
apply it) · K. Open questions.
methods: EVERY concrete reusable method in the source (one signal can hold 60; never cap, never merge different ones):
{{"name","family" (computer-use|browser-use|jev-routing-decisions|models-ai|jarvis-assistant|workflows-automation|skills|
repos-tools-install|mcp-connectors|wiring-engineering-architecture|coding-agents|memory-knowledge|voice-ui|
signal-ingestion-research|evals-verification|cost-ops|content-creative|business-other),
"summary","steps":[...],"at":"mm:ss or section","evidence":"shown|said|claimed","tools":[...],"jarvis_use":"one line"}}
capabilities: EVERY ability the thing in the source has (what it can DO for its user, e.g. "opens apps by voice",
"remembers past chats", "controls the browser in the background"), one entry each:
{{"name","what_it_does","evidence":"shown working|said|claimed","at":"mm:ss","built_with":[tools/repos/models],
"jarvis_has":"yes|partly|no|unknown" (Jarvis = Evens's Mac operator: voice Face, own-cursor computer use, background
Safari DOM control, native-app Accessibility, shell/files, research, signal learning, kept stops for send/pay/delete)}}

SOURCE: {title} ({kind}, {meta})
{body}"""


def _openrouter(messages: list, max_tokens: int = 32000) -> str:
    online = _load("agent_stack_online_signals", "../brain/online.py")
    key = online.openrouter_api_key()
    if not key:
        raise RuntimeError("the OpenRouter key is not available")
    last = ""
    for model in EXTRACT_MODELS:
        try:
            data = online._http_json(online.OPENROUTER_URL, data={
                "model": model, "messages": messages, "max_tokens": max_tokens, "usage": {"include": True},
                "response_format": {"type": "json_object"}},
                headers={"Authorization": f"Bearer {key}", "X-Title": "Jarvis signals"}, timeout=600)
        except Exception as exc:  # noqa: BLE001 - next model
            last = f"{model}: {type(exc).__name__}"
            continue
        msg = ((data.get("choices") or [{}])[0].get("message") or {})
        text = str(msg.get("content") or "").strip()
        if text:
            ledger({"event": "model", "model": model, "usage": data.get("usage")})
            return text
        last = f"{model}: empty"
    raise RuntimeError(f"no model answered ({last})")


WATCH_MODELS = ("google/gemini-3.6-flash", "google/gemini-3.7-flash", "google/gemini-3.8-flash")
WATCH_PROVIDER = {"order": ["google-ai-studio"], "allow_fallbacks": False}  # the only route that opens YouTube links
WATCH_FULL_FPS_S = 9000      # up to 2.5 h: 1 frame per second + audio fits the 1M context in one watch
WATCH_TOKENS_PER_FRAME = 70  # Gemini low media resolution (66) plus margin
WATCH_CONTEXT = 900_000      # leave room for the transcript and the answer
MAX_CONTINUE = 8             # a long answer is continued, never cut


STUDIO_MAX_FPS = 10  # motion graphics: fast moves need more than 1 frame/s


def video_part(url: str, duration: float, lens: str = "learn") -> dict:
    """The whole video as one input. Studio lens: up to 10 frames/s for motion. Anything too long for that (or a
    learn video over 2.5 h) gets fewer frames per second so it still fits ONE watch."""
    part = {"type": "video_url", "video_url": {"url": url}}
    dur = max(1.0, float(duration or 0))
    fit = WATCH_CONTEXT / (dur * (WATCH_TOKENS_PER_FRAME + 32))
    if lens == "studio":
        part["video_url"]["processing"] = {"type": "static", "fps": max(0.1, round(min(STUDIO_MAX_FPS, fit), 2))}
    elif dur > WATCH_FULL_FPS_S:
        part["video_url"]["processing"] = {"type": "static", "fps": max(0.1, min(1.0, round(fit, 2)))}
    return part


STUDIO_WORDS = re.compile(r"(?i)motion graphic|mograph|after effects|kinetic typ|logo (?:reveal|animation)|title sequence|"
                          r"showreel|\breel\b|animation|animated|vfx|\bcgi\b|transition|cinematic|color grad|"
                          r"music video|\bcommercial\b|\bad\b|design inspiration|ui animation|lottie|rive\b|"
                          r"houdini|cinema ?4d|\bc4d\b|blender (?:render|animation)|typography|editing style|edit like")


def pick_lens(got: dict, asked: str = "") -> str:
    """learn = methods, capabilities, click-by-click log; studio = design shot log, style, recreate recipes."""
    if asked in ("learn", "studio"):
        return asked
    hay = " ".join(str(got.get(k) or "") for k in ("title", "channel")) + " " + str(got.get("description") or "")[:600]
    return "studio" if STUDIO_WORDS.search(hay) else "learn"


def _post(body: dict) -> dict:
    online = _load("agent_stack_online_signals", "../brain/online.py")
    key = online.openrouter_api_key()
    if not key:
        raise RuntimeError("the OpenRouter key is not available")
    return online._http_json(online.OPENROUTER_URL, data=body,
                             headers={"Authorization": f"Bearer {key}", "X-Title": "Jarvis signals"}, timeout=1800)


def _watch(messages: list, max_tokens: int = 65000) -> str:
    """Gemini on Google AI Studio watches the video. An answer that hits the output limit is continued from where it
    stopped (the model still has the whole video), so a 2 h video's 100+ methods are never truncated."""
    last = ""
    for model in WATCH_MODELS:
        convo, text = list(messages), ""
        try:
            for _ in range(MAX_CONTINUE):
                # live 10-16: on a 2 h video Gemini's thinking used the whole output budget (27 chars came back);
                # low thinking leaves the budget for the answer (236 rows, 0 reasoning tokens).
                data = _post({"model": model, "provider": WATCH_PROVIDER, "messages": convo, "max_tokens": max_tokens,
                              "reasoning": {"effort": "low"}, "usage": {"include": True}})
                if data.get("error"):
                    raise RuntimeError(str(data["error"])[:300])
                choice = (data.get("choices") or [{}])[0]
                piece = str((choice.get("message") or {}).get("content") or "")
                ledger({"event": "model", "model": model, "usage": data.get("usage"), "watch": True,
                        "finish": choice.get("finish_reason"), "chars": len(piece)})
                text += piece
                if choice.get("finish_reason") != "length":
                    break
                convo = convo + [{"role": "assistant", "content": piece},
                                 {"role": "user", "content": "Continue exactly where you stopped, mid-JSON if needed. Do not repeat anything."}]
            if text.strip():
                return text
            last = f"{model}: empty"
        except Exception as exc:  # noqa: BLE001 - next model; the caller falls back to the frame route
            last = f"{model}: {str(exc)[:200]}"
    raise RuntimeError(f"Gemini could not watch the video ({last})")


WATCH_PROMPT_HEAD = """You are WATCHING the video itself (every frame and the audio), not reading a summary. Recover
everything shown and said, start to end. The transcript below is only an aid for exact wording; what is SHOWN on screen
(UI, text, code, prompts, settings, results) comes from your own watching. Give mm:ss for everything.

"""


VISUAL_FIELDS = ("start", "end", "scene", "app_or_ui", "on_screen_text", "action", "code_or_command", "result_shown", "said")
VISUAL_PROMPT = """Write the VISUAL LOG of this video: a shot-by-shot record of everything that happens on screen, so
someone who never sees the video knows exactly what was shown, in order. One row every time anything visible changes
(new screen, scene, window, tab, slide, panel, typed text, click, menu, terminal output, generated result, overlay),
and at least one row every 30 s even when nothing changes. In tutorials and screen recordings expect a new row
every 5-15 s; write the whole video to its last second, however long the log gets (it can continue in more messages). Never merge two changes into one row, never skip a part.
Copy on-screen text, code, commands, prompts, file names, URLs, settings and numbers VERBATIM. Say UNCLEAR rather
than guess.
Output ONLY JSON Lines: one JSON object per line, no array, no prose, fields:
{"start":"mm:ss","end":"mm:ss","scene":"short name","app_or_ui":"app / site / window","on_screen_text":"verbatim",
"action":"what the person or the software does (clicks X, types Y, opens Z)","code_or_command":"verbatim code, command
or prompt shown, else empty","result_shown":"what appears as a result","said":"what is being said at that moment, short"}
Use h:mm:ss when the video is longer than an hour."""


STUDIO_FIELDS = ("start", "end", "shot", "composition", "palette", "typography", "motion", "transition", "camera",
                 "effects_layers", "sound_sync", "on_screen_text", "recreate")
STUDIO_PROMPT = """You are a motion designer studying this video shot by shot for studio inspiration. Write the STUDIO LOG:
one row per shot or distinct animated beat (a new move, element, transition or cut), never two beats in one row, no gaps.
Be concrete and measurable: palette as approximate hex values, typography (style, weight, case, size relative to frame,
kinetic behaviour), motion (what moves, from where to where, easing such as ease-out/overshoot/linear, speed and
duration in seconds or frames, stagger), transition (cut, wipe, morph, match cut, whip...), camera (push, pan, orbit,
parallax, depth), effects and layers (glow, blur, grain, particles, masks, 3D, shape layers), sound sync (hits on beat,
whooshes), on-screen text verbatim, and "recreate": short concrete steps to rebuild the beat in EffectCraft (After
Effects-class: comps, layers, keyframes, effects) or FilmCraft (editing). Say UNCLEAR rather than guess.
Output ONLY JSON Lines, one object per line, fields:
{"start","end","shot","composition","palette","typography","motion","transition","camera","effects_layers","sound_sync",
"on_screen_text","recreate"}  (times as m:ss.s when beats are under a second, else mm:ss)"""
STUDIO_EXTRACT = """From your watch and the STUDIO LOG below, write the studio takeaways.
learned_md sections: A. Style guide (palette with hex, type system, grid/composition rules, motion rules: easing,
timing, stagger, pacing) · B. Signature techniques (what makes it look like this) · C. Shot list summary with times ·
D. How to recreate the whole piece in EffectCraft / FilmCraft (comp setup, layer structure, order of work) ·
E. What to steal for Evens's studio and what to avoid · F. Open questions.
methods: one per reusable technique ({"name","family":"content-creative","summary","steps":[EffectCraft/FilmCraft steps],
"at":"time","evidence":"shown","tools":[...],"jarvis_use":"how Jarvis could rebuild it with ArtCraft"}).
capabilities: one per technique the piece demonstrates ({"name","what_it_does","evidence":"shown working","at",
"built_with":[...],"jarvis_has":"yes|partly|no|unknown" — can Jarvis already produce it with ArtCraft?}).

Then up to 5 lines {"kind":"guideline","rule":"one reusable rule","at":"mm:ss"}: rules about timing, rhythm,
structure, easing, composition, hierarchy, pacing or sound sync that any studio piece could follow (measurable where
possible, e.g. "entrances ease out in 10-14 frames"). They are methods to reverse-engineer, then change: never adopt the
source's palette, artwork, characters, melody or copy as a rule.
Then up to 3 lines {"kind":"check","text":"a general, measurable done-check","at":"mm:ss"} for the CHECKLIST.
Also write ONE line {"kind":"studio_type","value":"..."} naming the studio content type this inspires, exactly one of:
Video Editing · Explainer Videos · Brand & Identity · Marketing & Social · Product Launch · Slides & Decks ·
Photo & Retouching · Print & 3D (CAD) · Audio & Podcast · Info Products & Templates · Client Deliverables.

SOURCE: {title} ({meta})"""


GAP_ROUNDS = 3


SIGNAL_BUDGET_USD = float(os.environ.get("JARVIS_SIGNAL_BUDGET_USD") or 20)   # Evens 10-16: $0-20 for the whole Watch Later
BUDGET_SINCE = float(os.environ.get("JARVIS_SIGNAL_BUDGET_SINCE") or 1792198800)  # 2026-10-16 21:00 ET: start of the $20 budget


class BudgetWait(RuntimeError):
    """Free tier full for today and the paid budget is used up: the queue waits (never spends past his cap)."""


def paid_spent() -> float:
    """Paid model spend on signals since the budget started (free-tier calls cost nothing and are not counted)."""
    if not LEDGER.exists():
        return 0.0
    total = 0.0
    for line in LEDGER.read_text(errors="ignore").splitlines():
        try:
            r = json.loads(line)
        except ValueError:
            continue
        if r.get("event") == "model" and float(r.get("at", 0)) >= BUDGET_SINCE and not r.get("free"):
            total += float((r.get("usage") or {}).get("cost") or 0)
    return total


def spot_sampled(video_id: str) -> bool:
    """1 video in 10 gets the independent spot-check (a fresh watch grades the log) — a statistical quality sample."""
    import hashlib
    return int(hashlib.sha256(str(video_id).encode()).hexdigest()[:4], 16) % 10 == 0


class _PaidWatcher:
    """OpenRouter: every pass re-sends the video."""

    def __init__(self, url: str, duration: float, lens: str):
        self.video = video_part(url, duration, lens)
        self.free = False

    def ask(self, prompt: str) -> str:
        return _watch([{"role": "user", "content": [self.video, {"type": "text", "text": prompt}]}])


class _FreeWatcher:
    """Google AI Studio free tier: one stateful session per video."""

    def __init__(self, url: str, duration: float, fps: float):
        self.s = G.VideoSession(url, int(duration or 0), fps)
        self.free = True

    def ask(self, prompt: str) -> str:
        t = self.s.ask(prompt)
        ledger({"event": "model", "model": "google/" + G.MODEL, "free": True, "watch": True, "chars": len(t),
                "usage": {"cost": 0, "prompt_tokens": getattr(self.s, "input_tokens", 0)}})
        return t


def make_watcher(url: str, duration: float, lens: str, fps: float = 0.0):
    """Free first (his Gemini key, within today's 8 h), paid only inside SIGNAL_BUDGET_USD, else wait."""
    if G.has_key() and G.free_room(int(duration or 0)):
        rate = fps or (min(STUDIO_MAX_FPS, 5.0) if lens == "studio" else 1.0)
        return _FreeWatcher(url, duration, rate)
    if paid_spent() >= SIGNAL_BUDGET_USD:
        raise BudgetWait(f"free tier full for today and the ${SIGNAL_BUDGET_USD:g} signal budget is used; waiting for tomorrow")
    return _PaidWatcher(url, duration, lens)


def watch_visual_log(url: str, duration: float, lens: str, body: str, watcher=None) -> list:
    """The log of everything shown. Live 10-16: on a 2h22m course the log stopped at 118:13, so every stretch with no
    row is sent back for another watch (the whole video again, rows only for the missing stretch) until none is left."""
    fields = STUDIO_FIELDS if lens == "studio" else VISUAL_FIELDS
    head = STUDIO_PROMPT if lens == "studio" else VISUAL_PROMPT
    w = watcher or _PaidWatcher(url, duration, lens)
    rows = parse_visual_rows(w.ask(head + "\n\nTRANSCRIPT (aid only):\n" + body[:300000]), fields)
    for _ in range(GAP_ROUNDS):
        gaps = coverage_gaps(rows, duration) if rows else []
        if not gaps:
            break
        more = parse_visual_rows(w.ask(head + "\n\nYour log so far is MISSING these stretches of the video: " + ", ".join(gaps)
                                       + ". Watch them and write rows ONLY for those stretches, same format, to their last second."),
                                 fields)
        if not more:
            break
        seen = {(r["start"], r.get("action") or r.get("shot")) for r in rows}
        rows = rows + [r for r in more if (r["start"], r.get("action") or r.get("shot")) not in seen]
    return sorted(rows, key=lambda r: _secs(r["start"]))


def parse_visual_rows(text: str, fields: tuple = None) -> list:
    """JSON Lines from the model; a row split by a continuation or a stray newline is still read."""
    dec, rows, at = json.JSONDecoder(), [], 0
    while True:
        at = text.find("{", at)
        if at < 0:
            return rows
        try:
            obj, end = dec.raw_decode(text, at)
        except ValueError:
            at += 1
            continue
        if isinstance(obj, dict) and obj.get("start") is not None:
            rows.append({k: str(obj.get(k) or "") for k in (fields or VISUAL_FIELDS)})
        at = end


MAX_VISUAL_GAP_S = 30
SPOT_CHECKS = 10
SPOT_PROMPT = """You are CHECKING someone else's visual log against the video. For each row below, look at the video
at that time range and say whether the row is right: the app/UI, the action, the on-screen text and any code are
really there at that time. Be strict: wrong time, wrong text or invented detail = false.
Return JSON only: {"checks": [{"start": "...", "matches": true|false, "actual": "what is really on screen, short"}]}

ROWS TO CHECK:
"""


def _secs(t: str) -> int:
    parts = str(t or "").strip().split(":")
    if not parts or not all(p.isdigit() for p in parts):
        return -1
    n = 0
    for p in parts:
        n = n * 60 + int(p)
    return n


def _clock(t: int) -> str:
    return f"{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}" if t >= 3600 else _mmss(t)


def add_links(rows: list, url: str) -> list:
    """Every row gets a link that opens the video at that second (any agent or person can check it)."""
    sep = "&" if "?" in url else "?"
    return [{**r, "link": f"{url}{sep}t={max(0, _secs(r['start']))}s"} for r in rows]


def coverage_gaps(rows: list, duration: float, max_gap: int = MAX_VISUAL_GAP_S) -> list:
    """Stretches of the video no row describes (a skim shows up instead of hiding)."""
    spans = sorted((a, max(a, b)) for a, b in ((_secs(r["start"]), _secs(r["end"])) for r in rows) if a >= 0)
    gaps, covered = [], 0
    for a, b in spans:
        if a - covered > max_gap:
            gaps.append(f"{_clock(covered)}-{_clock(a)}")
        covered = max(covered, b)
    end = int(float(duration or 0))
    if end and end - covered > max_gap:
        gaps.append(f"{_clock(covered)}-{_clock(end)}")
    return gaps


def spot_check(url: str, duration: float, rows: list, n: int = SPOT_CHECKS, lens: str = "learn") -> dict:
    """A separate watch grades n rows spread over the whole video (critic is not the writer, AGENT_RULES 8)."""
    if not rows:
        return {"checked": 0, "matched": 0, "details": []}
    step = max(1, len(rows) // n)
    pick = rows[::step][:n]
    keys = ("start", "end", "shot", "motion", "palette", "on_screen_text") if lens == "studio" else \
        ("start", "end", "app_or_ui", "action", "on_screen_text", "code_or_command")
    ask = "\n".join(json.dumps({k: r.get(k, "") for k in keys})
                    for r in pick)
    got = _json(_watch([{"role": "user", "content": [video_part(url, duration, lens), {"type": "text", "text": SPOT_PROMPT + ask}]}],
                       max_tokens=8000))
    checks = [c for c in got.get("checks") or [] if isinstance(c, dict)]
    return {"checked": len(checks), "matched": sum(1 for c in checks if c.get("matches") is True), "details": checks}


def _studio_text(rows: list) -> str:
    return "\n".join(" | ".join(f"{k}: {r[k]}" for k in STUDIO_FIELDS if r.get(k)) for r in rows)


def _visual_text(rows: list) -> str:
    return "\n".join(f"{r['start']}-{r['end']} | {r['app_or_ui']} | {r['scene']} | did: {r['action']} | text: {r['on_screen_text']}"
                     + (f" | code: {r['code_or_command']}" if r["code_or_command"] else "")
                     + f" | result: {r['result_shown']}" + (f" | said: {r['said']}" if r["said"] else "") for r in rows)


def write_visual_log(d: Path, rows: list, lens: str = "learn") -> None:
    """VISUAL-LOG.csv (any agent, any spreadsheet), visual-log.jsonl (programs), SCRIPT.md (read like a script).
    Studio lens: STUDIO-LOG.csv / studio-log.jsonl and a shot list with recreate recipes."""
    import csv
    if lens == "studio":
        _write_studio_log(d, rows)
        return
    with (d / "VISUAL-LOG.csv").open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(VISUAL_FIELDS) + ["link"], restval="", extrasaction="ignore")
        w.writeheader(); w.writerows(rows)
    (d / "visual-log.jsonl").write_text("".join(json.dumps(r) + "\n" for r in rows))
    lines = ["# SCRIPT — what happens on screen, in order", "",
             "Written by Jarvis from watching the whole video (Gemini, 1 frame/s + audio). Columns are in VISUAL-LOG.csv.", ""]
    for r in rows:
        when = f"[{r['start']}–{r['end']}]({r['link']})" if r.get("link") else f"{r['start']}–{r['end']}"
        lines.append(f"**{when}** · [{r['app_or_ui'] or r['scene']}] {r['action']}".rstrip())
        if r["on_screen_text"]:
            lines.append(f"  - On screen: {r['on_screen_text']}")
        if r["code_or_command"]:
            lines.append(f"  - Code / command / prompt: `{r['code_or_command']}`")
        if r["result_shown"]:
            lines.append(f"  - Result: {r['result_shown']}")
        if r["said"]:
            lines.append(f"  - Said: \"{r['said']}\"")
    (d / "SCRIPT.md").write_text("\n".join(lines) + "\n")


ROWS_FORMAT = """

OUTPUT FORMAT (this replaces the JSON shape above): JSON Lines, one JSON object per line, never an array or a wrapper:
{"kind":"learned_md","text":"one section (or part of one) of the markdown analysis"}  -- sections A..K in order
{"kind":"method", ...the method fields above...}  -- one line per method
{"kind":"capability", ...the capability fields above...}  -- one line per capability
A long answer may be continued in another message: just keep writing lines."""


def parse_extract_rows(text: str) -> dict:
    """learned_md / methods / capabilities from JSON Lines; a row cut by the output limit loses only that row."""
    dec, at, learned, methods, caps, stype, guides, checks = json.JSONDecoder(), 0, [], [], [], "", [], []
    while True:
        at = text.find("{", at)
        if at < 0:
            break
        try:
            obj, end = dec.raw_decode(text, at)
        except ValueError:
            at += 1
            continue
        at = end
        if not isinstance(obj, dict):
            continue
        kind = obj.pop("kind", "")
        if kind == "learned_md":
            learned.append(str(obj.get("text") or ""))
        elif kind == "method" and obj.get("name"):
            methods.append(obj)
        elif kind == "capability" and obj.get("name"):
            caps.append(obj)
        elif kind == "studio_type" and obj.get("value"):
            stype = str(obj["value"])
        elif kind == "guideline" and obj.get("rule"):
            guides.append(obj)
        elif kind == "check" and obj.get("text"):
            checks.append(obj)
    out = {"learned_md": "\n\n".join(learned), "methods": methods, "capabilities": caps}
    if stype:
        out["studio_type"] = stype
    if guides:
        out["guidelines"] = guides
    if checks:
        out["checks"] = checks
    return out


BLOCKED = re.compile(r"(?i)private|unavailable|not available|permission|forbidden|\b40[34]\b|cannot (?:access|open)|"
                     r"unsupported (?:url|video)|age[- ]restrict|members[- ]only|sign in to confirm")


def watch_blocked(exc: Exception) -> bool:
    """Only Google refusing the video sends it to the frame route; a bad answer is retried as a watch."""
    return bool(BLOCKED.search(str(exc)))


def _write_studio_log(d: Path, rows: list) -> None:
    import csv
    with (d / "STUDIO-LOG.csv").open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(STUDIO_FIELDS) + ["link"], restval="", extrasaction="ignore")
        w.writeheader(); w.writerows(rows)
    (d / "studio-log.jsonl").write_text("".join(json.dumps(r) + "\n" for r in rows))
    lines = ["# SCRIPT — shot list for studio work", "",
             "Written by Jarvis from watching the whole video (Gemini, high frame rate + audio). Columns are in STUDIO-LOG.csv.", ""]
    labels = (("composition", "Composition"), ("palette", "Palette"), ("typography", "Type"), ("motion", "Motion"),
              ("transition", "Transition"), ("camera", "Camera"), ("effects_layers", "Effects / layers"),
              ("sound_sync", "Sound sync"), ("on_screen_text", "On screen"), ("recreate", "Recreate"))
    for r in rows:
        when = f"[{r['start']}–{r['end']}]({r['link']})" if r.get("link") else f"{r['start']}–{r['end']}"
        lines.append(f"**{when}** · {r.get('shot') or 'shot'}")
        lines += [f"  - {lab}: {r[k]}" for k, lab in labels if r.get(k)]
    (d / "SCRIPT.md").write_text("\n".join(lines) + "\n")


STUDIO_ROOT = Path(os.environ.get("ARTCRAFT_STUDIO") or Path.home() / "ArtCraft Studio")
STUDIO_FILES = ("STYLE.md", "SCRIPT.md", "STUDIO-LOG.csv", "VISUAL-CHECK.md")


def file_in_studio(sig: dict, got: dict, ext: dict, packet: Path) -> Path:
    """Evens 10-16: studio-lens notes live where the studio works: 01 Internal/Playbooks/<type>/refs/<id> - <title>/
    (the existing "techniques to study, then change (never copy assets)" slot), plus one appended line in REFS.md.
    Studio rule 5: the source is cited, no transcript is copied in."""
    books = STUDIO_ROOT / "01 Internal" / "Playbooks"
    types = {p.name for p in books.iterdir() if p.is_dir()} if books.exists() else set()
    stype = ext.get("studio_type") if ext.get("studio_type") in types else "Video Editing"
    title = re.sub(r"[^\w &().,'-]+", " ", str(got.get("title") or sig["id"])).strip()[:80] or sig["id"]
    d = books / stype / "refs" / f"{sig['id']} - {title}"
    d.mkdir(parents=True, exist_ok=True)
    os.chmod(d, 0o755)
    for name in STUDIO_FILES:
        if (packet / name).exists():
            shutil.copy2(packet / name, d / name)
            os.chmod(d / name, 0o644)
    (d / "README.md").write_text(
        f"# {got.get('title')}\n\n- Source: {sig['url']}\n- Channel: {got.get('channel') or 'unknown'}"
        f" · {got.get('duration') or '?'} s\n- Watched by Jarvis: {(ext.get('coverage') or {}).get('watched', 'whole video')}\n"
        f"- Repo packet: docs/hive/outer-heaven/CONTENT/watch-later/packets/{sig['id']}/\n- Techniques: {len(ext.get('methods') or [])}\n\n"
        "Techniques to study, then change. Never copy the source's assets. STYLE.md = style guide and recreate plan; "
        "SCRIPT.md = shot list with EffectCraft/FilmCraft recipes; STUDIO-LOG.csv = every beat, with links to the second.\n")
    os.chmod(d / "README.md", 0o644)
    refs = books / stype / "refs" / "REFS.md"
    line = f"- {sig['id']} - [{title}]({sig['url']}) — Jarvis studio watch, {len(ext.get('methods') or [])} techniques: `refs/{d.name}/`\n"
    old = refs.read_text() if refs.exists() else f"# {stype} — references\n\n"
    if f"- {sig['id']} -" not in old:
        refs.write_text(old.rstrip("\n") + "\n" + line)
    update_playbook(sig, got, {**ext, "studio_type": stype}, d)
    return d


def _at_link(url: str, at: str) -> str:
    return f"{url}{'&' if '?' in url else '?'}t={max(0, _secs(at))}s"


def _norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(text).lower()).strip()


def _insert_before(text: str, heading_re: str, block: str) -> str:
    """Put block at the end of the section whose heading matches heading_re (before the next ## heading)."""
    m = re.search(heading_re, text, re.M)
    if not m:
        return text.rstrip("\n") + "\n\n" + block
    nxt = re.search(r"^## ", text[m.end():], re.M)
    cut = m.end() + nxt.start() if nxt else len(text)
    head = text[:cut].rstrip("\n") + "\n"
    return head + block + ("\n" + text[cut:] if nxt else "")


def update_playbook(sig: dict, got: dict, ext: dict, ref: Path) -> dict:
    """Evens 10-16: each studio video updates its playbook in the playbook's own format; nothing existing is
    rewritten and nothing is added twice. GUIDELINES.md: [S] method rules with the source link to the second.
    CHECKLIST.md: general done-checks. TECHNIQUES.md: the technique catalog. SKILL.md: a pointer section."""
    book = ref.parent.parent
    rel = f"refs/{ref.name}/"
    done = {}
    g = book / "GUIDELINES.md"
    if g.exists() and ext.get("guidelines"):
        text = g.read_text(); have = _norm(text); add = []
        for r in [r for r in ext["guidelines"] if isinstance(r, dict) and r.get("rule")][:5]:
            if _norm(r["rule"]) and _norm(r["rule"]) not in have:
                add.append(f"- [S] {r['rule'].strip().rstrip('.')} — *source:* {_at_link(sig['url'], r.get('at'))} "
                           f"(Jarvis studio watch, {rel}SCRIPT.md)")
        if add:
            g.write_text(_insert_before(text, r"^## Method rules.*$", "\n".join(add) + "\n"))
        done["guidelines"] = len(add)
    c = book / "CHECKLIST.md"
    if c.exists() and ext.get("checks"):
        text = c.read_text(); have = _norm(text); add = []
        for k in [k for k in ext["checks"] if isinstance(k, dict) and k.get("text")][:3]:
            if _norm(k["text"]) and _norm(k["text"]) not in have:
                add.append(f"- [ ] {k['text'].strip()} — *from:* {_at_link(sig['url'], k.get('at'))}")
        if add:
            if not re.search(r"^## Reference techniques", text, re.M):
                text = text.rstrip("\n") + "\n\n## Reference techniques (from watched references)\n"
            c.write_text(_insert_before(text, r"^## Reference techniques.*$", "\n".join(add) + "\n"))
        done["checks"] = len(add)
    t = book / "TECHNIQUES.md"
    text = t.read_text() if t.exists() else (
        f"# {book.name} — Techniques from watched references\n\nEvery technique Jarvis recovered from a studio watch, with "
        "the moment it appears and how to rebuild it in ArtCraft. Study, then change: never copy the source's assets.\n")
    add = []
    for m in ext.get("methods") or []:
        if not isinstance(m, dict) or not m.get("name") or f"### {m.get('name')}" in text:
            continue
        steps = "".join(f"\n  {i}. {st}" for i, st in enumerate(m.get("steps") or [], 1))
        add.append(f"\n### {m.get('name')}\n- From: [{got.get('title')}]({_at_link(sig['url'], m.get('at'))}) · `{rel}`\n"
                   f"- What: {m.get('summary') or ''}\n- Rebuild:{steps or ' see ' + rel + 'SCRIPT.md'}\n")
    if add:
        t.write_text(text.rstrip("\n") + "\n" + "".join(add))
        os.chmod(t, 0o644)
    done["techniques"] = len(add)
    k = book / "SKILL.md"
    if k.exists():
        text = k.read_text()
        if f"`{rel}`" not in text:
            if not re.search(r"^## Techniques from watched references", text, re.M):
                text = (text.rstrip("\n") + "\n\n## Techniques from watched references\n"
                        "Read `TECHNIQUES.md` (full catalog with rebuild steps) before starting; each reference below has a "
                        "shot list with EffectCraft/FilmCraft recipes.\n")
            line = f"- {got.get('title')} — {len(ext.get('methods') or [])} techniques · `{rel}`\n"
            k.write_text(_insert_before(text, r"^## Techniques from watched references.*$", line))
    return done


def extract(sig: dict, got: dict) -> dict:
    """YouTube: Gemini watches the whole video from the link, in one context (no download, no parts). Other sources and
    videos Google cannot open: text + every kept frame."""
    if not got.get("watch"):
        return _extract_frames(sig, got)
    try:
        return _extract_watch(sig, got)
    except Exception as exc:  # noqa: BLE001
        if isinstance(exc, BudgetWait) or not watch_blocked(exc):
            raise  # a bad answer or the budget is not a reason to download; the queue retries later
        log(f"{sig['id']}: Google would not open the video ({str(exc)[:160]}); frame route")
        return watch_fallback(sig, got)


def _extract_watch(sig: dict, got: dict) -> dict:
    lens = pick_lens(got, got.get("lens") or "")
    w = make_watcher(sig["url"], got.get("duration") or 0, lens, float(got.get("fps") or 0))
    body = got.get("transcript") or "(no captions)"
    if got.get("description"):
        body = f"DESCRIPTION:\n{got['description'][:4000]}\n\nTRANSCRIPT (aid only):\n{body}"
    meta = f"channel {got.get('channel')}, {got.get('duration')} s"
    # 1. the log of everything shown, timestamped (Evens 10-16: any agent reads what happened on screen)
    rows = watch_visual_log(sig["url"], got.get("duration") or 0, lens, body, w)
    if not rows:
        raise RuntimeError("the watch returned no visual log")  # never a packet that is blind to the screen
    rows = add_links(rows, sig["url"])
    gaps = coverage_gaps(rows, got.get("duration") or 0)
    log(f"{sig['id']}: {lens} log {len(rows)} rows, gaps {gaps or 'none'}")
    vis = _studio_text(rows) if lens == "studio" else _visual_text(rows)
    # 2. methods + capabilities (or style + techniques), watching again with the log beside it
    if lens == "studio":
        prompt = WATCH_PROMPT_HEAD + STUDIO_EXTRACT.replace("{title}", str(got.get("title"))).replace("{meta}", meta)
    else:
        prompt = WATCH_PROMPT_HEAD + EXTRACT_PROMPT.format(every=1, title=got.get("title"), kind="youtube video", meta=meta,
                                                           body=body[:600000])
    prompt += "\n\nLOG (your own shot-by-shot watch, cite its times):\n" + vis[:1500000]
    out = parse_extract_rows(w.ask(prompt + ROWS_FORMAT))
    if not out["methods"]:
        raise RuntimeError("the watch returned no methods")
    out["visual_log"], out["lens"] = rows, lens
    if spot_sampled(sig["id"]):
        try:
            spot = spot_check(sig["url"], got.get("duration") or 0, rows, lens=lens)
        except Exception as exc:  # noqa: BLE001 - recorded, never hidden
            spot = {"checked": 0, "matched": 0, "error": str(exc)[:200]}
    else:
        spot = {"checked": 0, "matched": 0, "sampled": False, "note": "not in this video's 1-in-10 quality sample"}
    out["visual_check"] = {"rows": len(rows), "gaps": gaps, "spot_check": spot}
    # 3. atomic sweep from the written record (no extra watch)
    sweep_ask = w.ask if getattr(w, "free", False) else (lambda text: _watch([{"role": "user", "content": text}]))
    sweep = parse_extract_rows(sweep_ask(SWEEP_PROMPT.format(
        learned=str(out.get("learned_md") or "")[:200000], first=json.dumps(out["methods"])[:100000],
        body=("LOG:\n" + vis + "\n\nTRANSCRIPT:\n" + body)[:900000])
        + "\n\nOUTPUT FORMAT (replaces the JSON shape above): JSON Lines, one {\"kind\":\"method\", ...fields} per line."))
    if isinstance(sweep.get("methods"), list) and len(sweep["methods"]) >= len(out["methods"]):
        out["methods"] = sweep["methods"]
    if getattr(w, "free", False):
        how = f"whole video by Gemini ({G.MODEL}, Google AI Studio free tier) from the YouTube link, {getattr(w.s, "fps", 1.0):g} frame/s + audio"
    else:
        fps = (w.video["video_url"].get("processing") or {}).get("fps", 1)
        how = f"whole video by Gemini (paid, OpenRouter) from the YouTube link, {fps} frame/s + audio"
    out["coverage"] = {"watched": f"{how}, {lens} lens, no download"}
    return out


def _extract_frames(sig: dict, got: dict) -> dict:
    body = got.get("transcript") or "(no transcript)"
    for p in got.get("pages") or []:
        body += f"\n\n=== LINKED PAGE {p.get('final') or p.get('url')} — {p.get('title')} ===\n{p.get('text')}"
    if got.get("description"):
        body = f"DESCRIPTION:\n{got['description'][:4000]}\n\nTRANSCRIPT:\n{body}"
    meta = f"channel {got.get('channel')}, {got.get('duration')} s" if sig["kind"] == "youtube" else sig["url"]
    content = [{"type": "text", "text": EXTRACT_PROMPT.format(every=FRAME_EVERY_S, title=got.get("title"), kind=sig["kind"],
                                                              meta=meta, body=body[:600000])}]
    sheets = got.get("sheets") or []
    if sheets and (Path(sheets[0]).parent / "INDEX.md").exists():
        content[0]["text"] += "\n\nFRAME TIMES (sheets/INDEX.md):\n" + (Path(sheets[0]).parent / "INDEX.md").read_text()[:20000]
    keys = got.get("keyframes") or []
    read = 0
    if keys:  # every kept frame is read first; the notes go into the extraction with an even spread of the images
        notes, read = frame_notes(keys)
        content[0]["text"] += "\n\nFRAME NOTES (every kept frame, in order):\n" + notes[:2000000]
    if keys:
        step = max(1, -(-len(keys) // KEYFRAMES_TO_MODEL))
        for k, t in keys[::step]:
            content.append({"type": "text", "text": f"frame at {_mmss(int(t))}:"})
            content.append({"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + base64.b64encode(Path(k).read_bytes()).decode()}})
    else:
        step = max(1, -(-len(sheets) // SHEETS_TO_MODEL))
        for s in sheets[::step]:
            content.append({"type": "text", "text": f"{Path(s).name}:"})
            content.append({"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + base64.b64encode(Path(s).read_bytes()).decode()}})
    out = _json(_openrouter([{"role": "user", "content": content}]))
    out["coverage"] = {"frames_kept": len(keys), "frames_read": read}
    if not isinstance(out.get("methods"), list):
        raise RuntimeError("the model returned no methods list")
    # live 10-16: one pass folded a whole tutorial into 2 methods. A second, method-only pass splits every distinct
    # technique, command, setting and shown feature into its own method (the Researcher's granularity).
    sweep = _json(_openrouter([{"role": "user", "content": SWEEP_PROMPT.format(
        learned=str(out.get("learned_md") or "")[:60000], first=json.dumps(out["methods"])[:20000], body=body[:300000])}]))
    if isinstance(sweep.get("methods"), list) and len(sweep["methods"]) >= len(out["methods"]):
        out["methods"] = sweep["methods"]
    return out


def _coverage_line(ext: dict) -> str:
    c = ext.get("coverage") or {}
    if c.get("watched"):
        return f"Watched: {c['watched']}\n"
    if not c.get("frames_kept"):
        return "Frames: none (text only)\n"
    return f"Frames: read {c.get('frames_read')} of {c.get('frames_kept')} kept (one frame every {FRAME_EVERY_S} s, identical frames dropped)\n"


def _json(raw: str) -> dict:
    """The model's JSON. Live 10-16: long videos sometimes came back as two objects back to back ("Extra data"),
    the second holding the rest of the methods; all objects are read and their methods lists joined."""
    text = re.sub(r"^```(?:json)?|```$", "", raw.strip()).strip()
    dec, at, parts = json.JSONDecoder(), 0, []
    while at < len(text):
        while at < len(text) and text[at] in " \t\r\n,`":
            at += 1
        if at >= len(text):
            break
        obj, at = dec.raw_decode(text, at)
        parts.append(obj)
    if not parts or not isinstance(parts[0], dict):
        raise ValueError("the model returned no JSON object")
    out = dict(parts[0])
    for extra in parts[1:]:
        if not isinstance(extra, dict):
            continue
        for k, v in extra.items():
            if k == "methods" and isinstance(v, list):
                out["methods"] = list(out.get("methods") or []) + v
            else:
                out.setdefault(k, v)
    return out


SWEEP_PROMPT = """Split this signal into ATOMIC methods. A method is one distinct, reusable thing someone could copy:
a technique, a command or setup step that does its own job, a configuration choice, a prompt pattern, an architecture
choice, a tool or repo used for a specific purpose, a product feature shown working (e.g. "recallable memory",
"hardware monitor panel", "auto-start at login"), a verification or debugging trick, a failure-and-fix. Never merge two
of these into one. Never invent: only what the analysis or source shows or says. Return JSON {{"methods": [...]}} with
the same fields as the first pass (name, family, summary, steps, at, evidence, tools, jarvis_use). Expect many more
than the first pass when the source shows several features or steps.

ANALYSIS:
{learned}

FIRST PASS (too coarse):
{first}

SOURCE:
{body}"""


# ---- packet in the repo ----------------------------------------------------------------------------------------
def worktree() -> Path:
    if not (WORKTREE / ".git").exists():
        subprocess.run(["git", "-C", str(REPO_MAIN), "fetch", "-q", "origin", "main"], check=False, timeout=180)
        has = subprocess.run(["git", "-C", str(REPO_MAIN), "rev-parse", "--verify", "-q", BRANCH], capture_output=True).returncode == 0
        args = ["git", "-C", str(REPO_MAIN), "worktree", "add", "--no-checkout", str(WORKTREE)] + (
            [BRANCH] if has else ["-b", BRANCH, "origin/main"])
        subprocess.run(args, check=True, capture_output=True, text=True, timeout=600)
        # only the packets folder: a full checkout is ~2.4 GB and his disk is nearly full
        subprocess.run(["git", "-C", str(WORKTREE), "sparse-checkout", "set", "--no-cone", f"/{PACKETS}/"], check=True,
                       capture_output=True, text=True, timeout=120)
        subprocess.run(["git", "-C", str(WORKTREE), "checkout"], check=True, capture_output=True, text=True, timeout=600)
    return WORKTREE


def write_packet(sig: dict, got: dict, ext: dict, work: Path) -> Path:
    root = worktree()
    d = root / PACKETS / sig["id"]
    if (d / "LEARNED.md").exists() and "jarvis-signal-engine" not in (d / "LEARNED.md").read_text(errors="ignore")[:300]:
        d = d / "jarvis-pass"  # another desk's packet: never overwritten; Jarvis's frame-level pass sits beside it
    d.mkdir(parents=True, exist_ok=True)
    (d / "full.txt").write_text(got.get("transcript") or "")
    if got.get("pages"):
        (d / "linked-pages.md").write_text("\n\n".join(f"## {p.get('title')}\n{p.get('final') or p.get('url')}\n\n{p.get('text')}"
                                                     for p in got["pages"]))
    if got.get("sheets"):
        # Evens 10-16: "keep everything stored in the repo" -> sheets live in the packet (sheets/ + INDEX.md)
        (d / "sheets").mkdir(exist_ok=True)
        for s in got["sheets"]:
            shutil.copy2(s, d / "sheets" / Path(s).name)
        idx = Path(got["sheets"][0]).parent / "INDEX.md"
        if idx.exists():
            shutil.copy2(idx, d / "sheets" / "INDEX.md")
    n = len(ext["methods"])
    (d / "PACKET.md").write_text(
        f"# PACKET — {sig['id']}\nProtocol: jarvis-signal-engine (Jarvis's own pass; Researcher contract: whole source, said vs shown, every method)\n"
        f"**Source:** {sig['url']}\n**Title:** {got.get('title')}\n**Kind:** {sig['kind']}"
        + (f" · channel {got.get('channel')} · {got.get('duration')} s · uploaded {got.get('upload_date')}" if sig["kind"] == "youtube" else "")
        + f"\n**Ingested:** {time.strftime('%Y-%m-%d %H:%M')} by Jarvis\n**Contact sheets:** {len(got.get('sheets') or [])} "
          f"(one frame every {FRAME_EVERY_S} s, {SHEET_COLS}x{SHEET_ROWS} per sheet)\n**Methods:** {n} (methods.jsonl)\n"
          f"**Links:** {', '.join(got.get('links') or []) or 'none'}\n")
    (d / "LEARNED.md").write_text(f"# LEARNED — {sig['id']}\nProtocol: jarvis-signal-engine\n" + _coverage_line(ext) + "\n" + str(ext.get("learned_md") or ""))
    if ext.get("visual_log"):
        write_visual_log(d, ext["visual_log"], ext.get("lens") or "learn")
    if ext.get("lens") == "studio":
        (d / "STYLE.md").write_text(f"# STYLE — {got.get('title')}\n\n" + str(ext.get("learned_md") or ""))
    if ext.get("visual_check"):
        vc = ext["visual_check"]; sp = vc.get("spot_check") or {}
        (d / "VISUAL-CHECK.md").write_text(
            f"# Visual log check — {sig['id']}\n\n- Rows: {vc.get('rows')}\n- Gaps over {MAX_VISUAL_GAP_S} s with no row: "
            f"{', '.join(vc.get('gaps') or []) or 'none'}\n- Independent spot-check (separate watch): {sp.get('matched')}/{sp.get('checked')} "
            f"rows match the video{(' · error: ' + sp['error']) if sp.get('error') else ''}\n\n"
            + "".join(f"- {c.get('start')}: {'MATCH' if c.get('matches') else 'MISMATCH'} — {c.get('actual', '')}\n" for c in sp.get("details") or []))
    (d / "capabilities.jsonl").write_text("".join(json.dumps({**c, "source_id": sig["id"]}) + "\n" for c in ext.get("capabilities") or []))
    (d / "methods.jsonl").write_text("\n".join(json.dumps({**m, "source_id": sig["id"]}) for m in ext["methods"]) + "\n")
    subprocess.run(["git", "-C", str(root), "add", str(d.relative_to(root))], check=True)
    subprocess.run(["git", "-C", str(root), "commit", "-q", "-m", f"signals: {sig['id']} — {n} methods ({sig['kind']})\n\n"
                    "Ingested by Jarvis's signal engine."], check=True)
    return d


MIN_FREE_GB = float(os.environ.get("JARVIS_SIGNAL_MIN_FREE_GB") or 4)  # live 10-16: his disk hit 0 bytes mid-job


def free_gb(path: Path = Path.home()) -> float:
    return shutil.disk_usage(path).free / 1e9


def ingest(url: str, force: bool = False, lens: str = "") -> dict:
    """One signal at a time (a lock queues parallel asks), so downloads never pile up on his disk."""
    import fcntl
    CACHE.mkdir(parents=True, exist_ok=True)
    with open(CACHE / "ingest.lock", "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        return _ingest(url, force, lens)


def _ingest(url: str, force: bool = False, lens: str = "") -> dict:
    sig = classify(url.strip())
    if sig["id"] in known_ids() and not force:
        return {"id": sig["id"], "status": "ALREADY", "text": f"{sig['id']} is already a packet; nothing to do"}
    work = CACHE / "work" / sig["id"]
    work.mkdir(parents=True, exist_ok=True)
    ledger({"event": "start", **sig})
    try:
        got = youtube(sig, work) if sig["kind"] == "youtube" else x_post(sig, work) if sig["kind"] == "x" else web_page(sig, work)
        got["lens"] = lens
        log(f"{sig['id']}: extracting methods")
        ext = extract(sig, got)
        d = write_packet(sig, got, ext, work)
        if ext.get("lens") == "studio":
            try:
                ext["studio_path"] = str(file_in_studio(sig, got, ext, d))
            except Exception as exc:  # noqa: BLE001 - the packet is saved; the filing failure is reported
                ext["studio_path"] = f"not filed in ArtCraft Studio: {exc}"
        ledger({"event": "packet", "id": sig["id"], "methods": len(ext["methods"]), "path": str(d), "coverage": ext.get("coverage")})
        extra = [classify(u)["url"] for u in got.get("links") or [] if classify(u)["kind"] == "youtube"]
        return {"id": sig["id"], "status": "DONE", "methods": len(ext["methods"]), "packet": str(d), "also_signals": extra,
                "studio": ext.get("studio_path"),
                "text": f"{got.get('title')}: {len(ext['methods'])} methods, packet {d}"}
    except Exception as exc:  # noqa: BLE001 - the operator reads the reason and tries another way
        ledger({"event": "failed", "id": sig["id"], "error": str(exc)[:500]})
        return {"id": sig["id"], "status": "FAILED", "text": f"{sig['id']} failed: {exc}"}
    finally:
        shutil.rmtree(work, ignore_errors=True)  # nothing downloaded stays on the Mac


# ---- scan his lists --------------------------------------------------------------------------------------------
WL_ALL_JS = r"""const cfg=(window.ytcfg&&ytcfg.data_)||{};const key=cfg.INNERTUBE_API_KEY,ctx=cfg.INNERTUBE_CONTEXT;
if(!key||!ctx)return JSON.stringify({error:'no innertube config on this page'});
const ids=new Set();let tok=null;let lastStatus=0;
const info={};const txt=(t)=>t?(t.simpleText||(t.runs||[]).map(r=>r.text).join('')):'';
function walk(o){if(!o||typeof o!=='object')return;if(o.playlistVideoRenderer&&o.playlistVideoRenderer.videoId){const v=o.playlistVideoRenderer;ids.add(v.videoId);
 info[v.videoId]={title:txt(v.title),channel:txt(v.shortBylineText),length:txt(v.lengthText)};}
 if(o.continuationCommand&&o.continuationCommand.token)tok=o.continuationCommand.token;for(const k in o)walk(o[k]);}
walk(window.ytInitialData);let pages=0;
while(tok&&pages<60){const t=tok;tok=null;pages++;
 const h={'Content-Type':'application/json','X-Goog-AuthUser':'0','X-Origin':location.origin};
 const sid=(document.cookie.match(/(?:^|; )(?:SAPISID|__Secure-3PAPISID)=([^;]+)/)||[])[1];
 if(sid){const ts=Math.floor(Date.now()/1000);const buf=await crypto.subtle.digest('SHA-1',new TextEncoder().encode(ts+' '+sid+' '+location.origin));
  h['Authorization']='SAPISIDHASH '+ts+'_'+[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');}
 const r=await fetch('/youtubei/v1/browse?key='+key+'&prettyPrint=false',{method:'POST',credentials:'include',headers:h,body:JSON.stringify({context:ctx,continuation:t})});
 if(!r.ok){lastStatus=r.status;break;}walk(await r.json());}
return JSON.stringify({ids:[...ids],videos:[...ids].map(i=>Object.assign({id:i,link:'https://www.youtube.com/watch?v='+i},info[i]||{})),pages:pages,http:lastStatus,signin:!!document.querySelector('a[href*="ServiceLogin"]')})"""
WL_JS = r"""return JSON.stringify({ids:[...new Set([...document.querySelectorAll('a[href*="watch?v="]')].map(a=>(a.href.match(/v=([A-Za-z0-9_-]{11})/)||[])[1]).filter(Boolean))],
 signin:!!document.querySelector('a[href*="ServiceLogin"]')})"""
XB_JS = r"""return JSON.stringify({ids:[...new Set([...document.querySelectorAll('article a[href*="/status/"]')].map(a=>(a.href.match(/(?:x|twitter)\.com\/[^/]+\/status\/\d+/)||[])[0]).filter(Boolean))],
 signin:/\/login|\/i\/flow\/login/.test(location.href)})"""


def scan(source: str = "all", scrolls: int = 12) -> dict:
    SD = _load("agent_stack_safari_dom_signals", "safari_dom.py")
    found, notes = [], []
    pages = {"youtube": ("https://www.youtube.com/playlist?list=WL", WL_JS, "https://www.youtube.com/watch?v="),
             "x": ("https://x.com/i/bookmarks", XB_JS, "https://")}
    for name in (["youtube", "x"] if source == "all" else [source]):
        url, js, prefix = pages[name]
        d = SD.SafariDOM({}, lambda r: {"text": "no hands"}, lambda x, y: None)
        try:
            d.act({"action": "new_tab", "url": url})
            seen, still = set(), 0
            if name == "youtube":
                # the whole list (live 10-16: scrolling a hidden tab stopped at 100 of ~1,800): page through it the way
                # YouTube's own page does, inside his signed-in tab; Safari does not await, so poll for the result
                d.js(SD.J.wrap("window.__jwl=null;(async()=>{try{window.__jwl=await (async()=>{" + WL_ALL_JS +
                               "})()}catch(e){window.__jwl=JSON.stringify({error:String(e)})}})();return JSON.stringify({ok:1})"))
                for _ in range(90):
                    time.sleep(2)
                    got = d.js(SD.J.wrap("return window.__jwl||JSON.stringify({pending:1})"))
                    if not got.get("pending"):
                        break
                if got.get("ids"):
                    seen |= set(got["ids"])
                    CACHE.mkdir(parents=True, exist_ok=True)
                    (CACHE / "watch-later.json").write_text(json.dumps(got.get("videos") or [], indent=0))
                    notes.append(f"youtube: whole list, {got.get('pages')} pages" + (f" (stopped on HTTP {got['http']})" if got.get("http") else ""))
                    scrolls = 0  # done; the scroll pass below is the fallback
            for _ in range(scrolls):
                got = d.js(SD.J.wrap(js))  # fallback / X bookmarks: read what is rendered, scroll, repeat
                if got.get("signin"):
                    notes.append(f"LOGIN NEEDED: {name} wants him signed in in Safari")
                    break
                before = len(seen)
                seen |= set(got.get("ids") or [])
                still = still + 1 if len(seen) == before else 0
                if still >= 2:
                    break
                d.act({"action": "scroll", "direction": "down", "amount": 2500})
                time.sleep(1.2)
            found += [prefix + i for i in sorted(seen)]
            notes.append(f"{name}: {len(seen)} items")
        finally:
            try:
                d.act({"action": "close_tab"})
            except Exception:  # noqa: BLE001
                pass
    have = known_ids()
    new = [u for u in found if classify(u)["id"] not in have]
    ledger({"event": "scan", "source": source, "found": len(found), "new": len(new)})
    return {"found": len(found), "new": new, "notes": notes,
            "text": f"{len(found)} saved items, {len(new)} new signals. " + " ".join(notes)}


def push() -> dict:
    """Push the signals branch (his kept stop: the operator only calls this after his yes)."""
    root = worktree()
    cp = subprocess.run(["git", "-C", str(root), "push", "-u", "origin", BRANCH], capture_output=True, text=True, timeout=600,
                        env={**os.environ, "EVENS_OK": "yes"})
    return {"ok": cp.returncode == 0, "text": (cp.stdout + cp.stderr)[-1500:]}


INDEX = "docs/hive/outer-heaven/CONTENT/watch-later/index"
FAMILY = {"jev-routing": "jev-routing-decisions", "workflows": "workflows-automation", "repos-tools": "repos-tools-install",
          "mcp": "mcp-connectors", "wiring-engineering": "wiring-engineering-architecture", "memory": "memory-knowledge",
          "signal-ingestion": "signal-ingestion-research", "evals": "evals-verification", "business": "business-other",
          "app-reverse-engineering": "coding-agents", "debugging": "coding-agents", "knowledge-management": "memory-knowledge",
          "system-architecture": "wiring-engineering-architecture", "testing-verification": "evals-verification",
          "prompt-engineering": "models-ai"}
CATALOG = Path.home() / "jarvis-proof/signals-corpus-20261016/methods-catalog.jsonl"


STANDARD = ("computer-use", "browser-use", "jev-routing-decisions", "models-ai", "jarvis-assistant", "workflows-automation",
            "skills", "repos-tools-install", "mcp-connectors", "wiring-engineering-architecture", "coding-agents",
            "memory-knowledge", "voice-ui", "signal-ingestion-research", "evals-verification", "cost-ops",
            "content-creative", "business-other")
FAMILY_WORDS = (("browser", "browser-use"), ("computer", "computer-use"), ("screen", "computer-use"), ("mcp", "mcp-connectors"),
                ("route", "jev-routing-decisions"), ("decision", "jev-routing-decisions"), ("voice", "voice-ui"), ("ui", "voice-ui"),
                ("memory", "memory-knowledge"), ("knowledge", "memory-knowledge"), ("eval", "evals-verification"),
                ("test", "evals-verification"), ("verif", "evals-verification"), ("cost", "cost-ops"), ("ops", "cost-ops"),
                ("code", "coding-agents"), ("debug", "coding-agents"), ("engineer", "wiring-engineering-architecture"),
                ("architect", "wiring-engineering-architecture"), ("security", "wiring-engineering-architecture"),
                ("repo", "repos-tools-install"), ("tool", "repos-tools-install"), ("install", "repos-tools-install"),
                ("skill", "skills"), ("workflow", "workflows-automation"), ("automat", "workflows-automation"),
                ("signal", "signal-ingestion-research"), ("research", "signal-ingestion-research"), ("model", "models-ai"),
                ("prompt", "models-ai"), ("ai", "models-ai"), ("jarvis", "jarvis-assistant"), ("assistant", "jarvis-assistant"),
                ("content", "content-creative"), ("creative", "content-creative"), ("video", "content-creative"),
                ("design", "content-creative"))


def family_of(name) -> str:
    f = FAMILY.get(name or "", name or "")
    if f in STANDARD:
        return f
    low = str(f).lower()
    return next((std for word, std in FAMILY_WORDS if word in low), "business-other")


def _visual_rows(d: Path) -> int:
    for f in (d / "jarvis-pass" / "visual-log.jsonl", d / "visual-log.jsonl"):
        if f.exists():
            return sum(1 for l in f.read_text().splitlines() if l.strip())
    return 0


def build_index() -> dict:
    """Machine-readable index of every signal, next to the packets (Evens 10-16: store signals properly, CSV and more):
    videos.csv (every Watch Later video + whether and how it was learned), methods.csv (every method: the recovered
    catalog plus every Jarvis packet), families.csv (methods per family and Jarvis status). GridCraft/WordCraft render
    the readable versions from these."""
    import csv
    root = worktree()
    out = root / INDEX
    out.mkdir(parents=True, exist_ok=True)
    packets = root / PACKETS
    vids = json.loads((CACHE / "watch-later.json").read_text()) if (CACHE / "watch-later.json").exists() else []
    seen = {v["id"] for v in vids}
    for d in sorted(p for p in packets.iterdir() if p.is_dir()):
        if d.name not in seen:
            vids.append({"id": d.name, "link": "", "title": "", "channel": "", "length": ""})
    methods, per_packet, caps = [], {}, []
    for d in sorted(p for p in packets.iterdir() if p.is_dir()):
        for f in (d / "methods.jsonl", d / "jarvis-pass" / "methods.jsonl"):
            if f.exists():
                rows = [json.loads(l) for l in f.read_text().splitlines() if l.strip()]
                per_packet[d.name] = per_packet.get(d.name, 0) + len(rows)
                for m in rows:
                    methods.append({"source": "jarvis-signal-engine", "signal_id": d.name, "name": m.get("name"),
                                    "family": family_of(m.get("family")), "evidence": m.get("evidence"), "at": m.get("at"),
                                    "summary": m.get("summary"), "steps": " | ".join(m.get("steps") or []),
                                    "tools": ", ".join(m.get("tools") or []), "jarvis_use": m.get("jarvis_use"),
                                    "jarvis_status": "", "priority": ""})
        for f in (d / "capabilities.jsonl", d / "jarvis-pass" / "capabilities.jsonl"):
            if f.exists():
                for c in (json.loads(l) for l in f.read_text().splitlines() if l.strip()):
                    caps.append({"signal_id": d.name, "name": c.get("name"), "what_it_does": c.get("what_it_does"),
                                 "evidence": c.get("evidence"), "at": c.get("at"),
                                 "built_with": ", ".join(c.get("built_with") or []), "jarvis_has": c.get("jarvis_has")})
    if CATALOG.exists():
        for line in CATALOG.read_text().splitlines():
            m = json.loads(line)
            methods.append({"source": "recovery-2026-10-16", "signal_id": "; ".join((m.get("sources") or [])[:6]),
                            "name": m.get("name"), "family": m.get("family"), "evidence": m.get("evidence"), "at": "",
                            "summary": m.get("summary"), "steps": " | ".join(m.get("steps") or []),
                            "tools": ", ".join(m.get("tools_repos") or []), "jarvis_use": m.get("jarvis_use"),
                            "jarvis_status": m.get("jarvis_status"), "priority": m.get("priority")})
    with (out / "videos.csv").open("w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["video_id", "title", "channel", "duration", "duration_seconds", "link", "packet", "researcher_notes",
                    "jarvis_frames", "frames_read", "visual_rows", "methods"])
        for v in vids:
            d = packets / v["id"]
            lrn = (d / "LEARNED.md").read_text(errors="ignore")[:300] if (d / "LEARNED.md").exists() else ""
            jarvis = (d / "sheets").exists() or (d / "jarvis-pass").exists()
            mine = d / "jarvis-pass" / "LEARNED.md" if (d / "jarvis-pass" / "LEARNED.md").exists() else d / "LEARNED.md"
            cov = re.search(r"Frames: read (\d+) of (\d+)", mine.read_text(errors="ignore")[:600]) if mine.exists() else None
            secs = 0
            for part in str(v.get("length") or "").split(":"):
                secs = secs * 60 + int(part) if part.isdigit() else secs
            dur = (f"{secs // 3600}h {secs % 3600 // 60}m {secs % 60}s" if secs >= 3600 else f"{secs // 60}m {secs % 60}s") if secs else ""
            w.writerow([v["id"], v.get("title"), v.get("channel"), dur, secs or "", v.get("link"),
                        "yes" if d.exists() else "no", "yes" if lrn and "jarvis-signal-engine" not in lrn else "no",
                        "yes" if jarvis else "no", f"{cov.group(1)}/{cov.group(2)}" if cov else ("watched" if mine.exists() and "Watched:" in mine.read_text(errors="ignore")[:600] else ""),
                        _visual_rows(d), per_packet.get(v["id"], 0)])
    with (out / "capabilities.csv").open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["signal_id", "name", "what_it_does", "evidence", "at", "built_with", "jarvis_has"])
        w.writeheader(); w.writerows(caps)
    with (out / "methods.csv").open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(methods[0].keys()) if methods else ["name"])
        w.writeheader(); w.writerows(methods)
    fam = {}
    for m in methods:
        f = fam.setdefault(m.get("family") or "other", {"HAVE": 0, "PARTIAL": 0, "MISSING": 0, "NOT_FOR_JARVIS": 0, "UNGRADED": 0})
        f[m.get("jarvis_status") or "UNGRADED"] = f.get(m.get("jarvis_status") or "UNGRADED", 0) + 1
    with (out / "families.csv").open("w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["family", "methods", "have", "partial", "missing", "not_for_jarvis", "ungraded"])
        for k, f in sorted(fam.items(), key=lambda kv: -sum(kv[1].values())):
            w.writerow([k, sum(f.values()), f["HAVE"], f["PARTIAL"], f["MISSING"], f["NOT_FOR_JARVIS"], f["UNGRADED"]])
    done = sum(1 for v in vids if (packets / v["id"]).exists())
    (out / "README.md").write_text(
        "# Signals index\n\nGenerated by Jarvis's signal engine (`signals.py index`); regenerate after every run.\n\n"
        f"- `videos.csv`: {len(vids)} videos (his Watch Later + packets), {done} learned.\n"
        f"- `methods.csv`: {len(methods)} methods (recovered catalog + Jarvis packets), with family, evidence, steps, tools, "
        "Jarvis status.\n- `families.csv`: methods per family and Jarvis status.\n"
        f"- `capabilities.csv`: {len(caps)} capabilities seen in the sources (what each thing can do, and whether Jarvis has it).\n"
        "- `*.xlsx`: the same data as formatted GridCraft workbooks; `METHODS-REPORT.docx`: readable report (WordCraft).\n")
    return {"videos": len(vids), "learned": done, "methods": len(methods), "capabilities": len(caps), "families": len(fam), "path": str(out),
            "text": f"index: {len(vids)} videos ({done} learned), {len(methods)} methods, {len(fam)} families in {out}"}


def status() -> dict:
    rows = [json.loads(l) for l in LEDGER.read_text().splitlines()] if LEDGER.exists() else []
    done = [r for r in rows if r.get("event") == "packet"]
    failed = [r for r in rows if r.get("event") == "failed"]
    ahead = subprocess.run(["git", "-C", str(WORKTREE), "rev-list", "--count", f"origin/main..{BRANCH}"], capture_output=True,
                           text=True).stdout.strip() if (WORKTREE / ".git").exists() else "0"
    return {"packets": len(done), "failed": len(failed), "unpushed_commits": ahead,
            "last": [f"{r['id']} ({r.get('methods')} methods)" for r in done[-5:]],
            "text": f"{len(done)} signals ingested, {len(failed)} failed, {ahead} commits waiting to be pushed"}


def main(argv: list) -> int:
    if not argv:
        print(__doc__)
        return 2
    cmd = argv[0]
    if cmd == "ingest" and len(argv) > 1:
        out = ingest(argv[1], force="--force" in argv, lens=argv[argv.index("--lens") + 1] if "--lens" in argv else "")
    elif cmd == "scan":
        out = scan(argv[1] if len(argv) > 1 and not argv[1].startswith("--") else "all")
        n = int(argv[argv.index("--ingest") + 1]) if "--ingest" in argv else 0
        out["ingested"] = [ingest(u) for u in out["new"][:n]]
    elif cmd == "watchlater":
        sc = scan("youtube")
        vids = json.loads((CACHE / "watch-later.json").read_text()) if (CACHE / "watch-later.json").exists() else []
        out = {"count": len(vids), "path": str(CACHE / "watch-later.json"), "notes": sc.get("notes"),
               "sample": vids[:3], "text": f"{len(vids)} Watch Later videos with title, channel, length and link in "
                                          f"{CACHE / 'watch-later.json'} (JSON list)"}
    elif cmd == "index":
        out = build_index()
    elif cmd == "push":
        out = push()
    else:
        out = status()
    print(json.dumps(out, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
