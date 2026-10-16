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
    sheets = []
    try:
        video = download(sig["url"], work)
        sheets = contact_sheets(video, work / "sheets")
    finally:
        for v in work.glob("video.*"):
            v.unlink()  # Evens: downloads do not stay on the Mac
    log(f"{vid}: {len(sheets)} contact sheets, video deleted")
    return {"title": meta.get("title"), "channel": meta.get("channel") or meta.get("uploader"),
            "duration": meta.get("duration"), "upload_date": meta.get("upload_date"), "description": meta.get("description"),
            "chapters": meta.get("chapters"), "transcript": transcript, "sheets": sheets, "links": _links(meta.get("description") or "")}


CLIENTS = ("default", "mweb", "tv", "ios")  # live 10-16: the default client got HTTP 403, mweb worked


def download(url: str, work: Path) -> Path:
    """<=720p copy into the temp cache, trying YouTube player clients in turn."""
    errors = []
    for client in CLIENTS:
        extra = [] if client == "default" else ["--extractor-args", f"youtube:player_client={client}"]
        cp = subprocess.run(["yt-dlp", "--no-update", "--no-warnings", *extra, "-f", f"b[height<={MAX_HEIGHT}]/bv*[height<={MAX_HEIGHT}]+ba/b",
                             "--merge-output-format", "mp4", "-o", str(work / "video.%(ext)s"), url],
                            capture_output=True, text=True, timeout=1800)
        got = [p for p in work.glob("video.*") if p.suffix in (".mp4", ".webm", ".mkv")]
        if cp.returncode == 0 and got:
            return got[0]
        errors.append(f"{client}: {(cp.stderr or '').strip().splitlines()[-1:] or ['failed']}")
        for p in work.glob("video.*"):
            p.unlink()
    raise RuntimeError("could not download the video (" + "; ".join(errors) + "); try his Safari route")


def contact_sheets(video: Path, out: Path) -> list:
    """One frame every FRAME_EVERY_S seconds, tiled 6x5 per sheet: sheet N covers minute N-1 (frames left to right,
    top to bottom). This ffmpeg has no drawtext, so the time map is written to sheets/INDEX.md instead of on the frames."""
    out.mkdir(parents=True, exist_ok=True)
    vf = f"fps=1/{FRAME_EVERY_S},scale=384:-2,tile={SHEET_COLS}x{SHEET_ROWS}:padding=4:margin=4"
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-vf", vf, "-q:v", "5", str(out / "sheet_%03d.jpg")],
                   check=True, timeout=3600)
    sheets = sorted(out.glob("sheet_*.jpg"))
    per = FRAME_EVERY_S * SHEET_COLS * SHEET_ROWS
    (out / "INDEX.md").write_text(f"One frame every {FRAME_EVERY_S} s, {SHEET_COLS} across x {SHEET_ROWS} down, read left to "
                                  "right then top to bottom.\n" + "\n".join(
                                      f"- {p.name}: {_mmss(i * per)} to {_mmss((i + 1) * per)}" for i, p in enumerate(sheets)))
    return sheets


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
bottom; each image is labeled with its sheet name). Keep apart what was SAID and what was SHOWN on
screen; never invent a click or a UI path you cannot see; tape numbers and prices are UNVERIFIED.

Return JSON only: {{"learned_md": "...", "methods": [...]}}
learned_md: markdown with these sections: A. Source map (beats in order, with times) · B. Atomic knowledge (claim,
why, conditions, evidence, SOURCE/INFERENCE label) · C. Procedures as ordered steps · D. Shown on screen (what the
sheets show: tools, screens, prompts, code, settings, at which times; say UNKNOWN when not visible) · E. Said vs shown
mismatches · F. Failures and recoveries · G. Decision points (IF -> THEN) · H. Tools/repos/MCPs named, with what they
were used for · I. Challenges (what may be wrong, outdated or hype) · J. Use for Jarvis (how Evens's Mac operator could
apply it) · K. Open questions.
methods: EVERY concrete reusable method in the source (one signal can hold 60; never cap, never merge different ones):
{{"name","family" (computer-use|browser-use|jev-routing|models-ai|jarvis-assistant|workflows|skills|repos-tools|mcp|
wiring-engineering|coding-agents|memory|voice-ui|signal-ingestion|evals|cost-ops|content-creative|business),
"summary","steps":[...],"at":"mm:ss or section","evidence":"shown|said|claimed","tools":[...],"jarvis_use":"one line"}}

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


def extract(sig: dict, got: dict) -> dict:
    body = got.get("transcript") or "(no transcript)"
    for p in got.get("pages") or []:
        body += f"\n\n=== LINKED PAGE {p.get('final') or p.get('url')} — {p.get('title')} ===\n{p.get('text')}"
    if got.get("description"):
        body = f"DESCRIPTION:\n{got['description'][:4000]}\n\nTRANSCRIPT:\n{body}"
    meta = f"channel {got.get('channel')}, {got.get('duration')} s" if sig["kind"] == "youtube" else sig["url"]
    content = [{"type": "text", "text": EXTRACT_PROMPT.format(every=FRAME_EVERY_S, title=got.get("title"), kind=sig["kind"],
                                                              meta=meta, body=body[:600000])}]
    sheets = got.get("sheets") or []
    step = max(1, -(-len(sheets) // SHEETS_TO_MODEL))  # long videos: every Nth sheet, spread over the whole video
    for s in sheets[::step]:
        content.append({"type": "text", "text": f"{Path(s).name}:"})
        content.append({"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + base64.b64encode(Path(s).read_bytes()).decode()}})
    out = _json(_openrouter([{"role": "user", "content": content}]))
    if not isinstance(out.get("methods"), list):
        raise RuntimeError("the model returned no methods list")
    # live 10-16: one pass folded a whole tutorial into 2 methods. A second, method-only pass splits every distinct
    # technique, command, setting and shown feature into its own method (the Researcher's granularity).
    sweep = _json(_openrouter([{"role": "user", "content": SWEEP_PROMPT.format(
        learned=str(out.get("learned_md") or "")[:60000], first=json.dumps(out["methods"])[:20000], body=body[:300000])}]))
    if isinstance(sweep.get("methods"), list) and len(sweep["methods"]) >= len(out["methods"]):
        out["methods"] = sweep["methods"]
    return out


def _json(raw: str) -> dict:
    return json.loads(re.sub(r"^```(?:json)?|```$", "", raw.strip()).strip())


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
    d.mkdir(parents=True, exist_ok=True)
    (d / "full.txt").write_text(got.get("transcript") or "")
    if got.get("pages"):
        (d / "linked-pages.md").write_text("\n\n".join(f"## {p.get('title')}\n{p.get('final') or p.get('url')}\n\n{p.get('text')}"
                                                     for p in got["pages"]))
    if got.get("sheets"):
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
    (d / "LEARNED.md").write_text(f"# LEARNED — {sig['id']}\nProtocol: jarvis-signal-engine\n\n" + str(ext.get("learned_md") or ""))
    (d / "methods.jsonl").write_text("\n".join(json.dumps({**m, "source_id": sig["id"]}) for m in ext["methods"]) + "\n")
    subprocess.run(["git", "-C", str(root), "add", str(d.relative_to(root))], check=True)
    subprocess.run(["git", "-C", str(root), "commit", "-q", "-m", f"signals: {sig['id']} — {n} methods ({sig['kind']})\n\n"
                    "Ingested by Jarvis's signal engine."], check=True)
    return d


MIN_FREE_GB = float(os.environ.get("JARVIS_SIGNAL_MIN_FREE_GB") or 4)  # live 10-16: his disk hit 0 bytes mid-job


def free_gb(path: Path = Path.home()) -> float:
    return shutil.disk_usage(path).free / 1e9


def ingest(url: str, force: bool = False) -> dict:
    """One signal at a time (a lock queues parallel asks), so downloads never pile up on his disk."""
    import fcntl
    CACHE.mkdir(parents=True, exist_ok=True)
    with open(CACHE / "ingest.lock", "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        return _ingest(url, force)


def _ingest(url: str, force: bool = False) -> dict:
    sig = classify(url.strip())
    if free_gb() < MIN_FREE_GB:
        return {"id": sig["id"], "status": "FAILED", "text": f"his disk has only {free_gb():.1f} GB free; I will not download "
                f"until there is at least {MIN_FREE_GB:.0f} GB"}
    if sig["id"] in known_ids() and not force:
        return {"id": sig["id"], "status": "ALREADY", "text": f"{sig['id']} is already a packet; nothing to do"}
    work = CACHE / "work" / sig["id"]
    work.mkdir(parents=True, exist_ok=True)
    ledger({"event": "start", **sig})
    try:
        got = youtube(sig, work) if sig["kind"] == "youtube" else x_post(sig, work) if sig["kind"] == "x" else web_page(sig, work)
        log(f"{sig['id']}: extracting methods")
        ext = extract(sig, got)
        d = write_packet(sig, got, ext, work)
        ledger({"event": "packet", "id": sig["id"], "methods": len(ext["methods"]), "path": str(d)})
        extra = [classify(u)["url"] for u in got.get("links") or [] if classify(u)["kind"] == "youtube"]
        return {"id": sig["id"], "status": "DONE", "methods": len(ext["methods"]), "packet": str(d), "also_signals": extra,
                "text": f"{got.get('title')}: {len(ext['methods'])} methods, packet {d}"}
    except Exception as exc:  # noqa: BLE001 - the operator reads the reason and tries another way
        ledger({"event": "failed", "id": sig["id"], "error": str(exc)[:500]})
        return {"id": sig["id"], "status": "FAILED", "text": f"{sig['id']} failed: {exc}"}
    finally:
        shutil.rmtree(work, ignore_errors=True)  # nothing downloaded stays on the Mac


# ---- scan his lists --------------------------------------------------------------------------------------------
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
            for _ in range(scrolls):
                got = d.js(SD.J.wrap(js))
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
        out = ingest(argv[1], force="--force" in argv)
    elif cmd == "scan":
        out = scan(argv[1] if len(argv) > 1 and not argv[1].startswith("--") else "all")
        n = int(argv[argv.index("--ingest") + 1]) if "--ingest" in argv else 0
        out["ingested"] = [ingest(u) for u in out["new"][:n]]
    elif cmd == "push":
        out = push()
    else:
        out = status()
    print(json.dumps(out, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
