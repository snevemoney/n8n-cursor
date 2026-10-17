"""Jarvis operator: one model-driven tool loop over general computer capabilities (Evens 2026-10-15).

The model gets the goal and a small set of primitive tools, picks one, the harness runs it, the real result goes
back, and it repeats until done, blocked or out of budget. No per-app or per-sentence routes. Every call passes
hands/authority.py first; a refusal is returned to the model as data so it can choose another way.

Durable: each task lives in <hive>/operator-tasks/<id>/ (request.json, messages.json, trace.jsonl, state.json,
control.json), so it survives restarts and can be resumed or stopped. Runs as its own worker process.
Usage: python3 hands/operator.py run <task_dir>
"""
from __future__ import annotations

import base64
import html
import importlib.util
import json
import os
import re
import shlex
import signal
import subprocess
import threading
import sys
import tempfile
import time
import urllib.request
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
STACK = HERE.parent
MAX_STEPS = int(os.environ.get("JARVIS_OPERATOR_STEPS") or 400)          # Evens 10-16: jobs can run for hours
TIME_BUDGET_S = float(os.environ.get("JARVIS_OPERATOR_SECONDS") or 21600)  # 6 h; brakes, gates and the cost cap still apply
QUIET_S = 600  # a long job says one line of progress at least every 10 minutes
OUT_CHARS = 8000
HANDS_APP = Path.home() / "Applications" / "Jarvis Hands.app"
TERMINAL = {"done", "ask_owner"}

SYSTEM = (
    "You are Jarvis, Evens's assistant on his Mac. You work the way Claude Code, Codex and the other frontier agents "
    "work: ONE agent in a loop. You read the whole conversation, decide, use tools, check the real result, and keep "
    "going until the thing is actually done. There is no other brain behind you and nobody to hand work to.\n"
    "Study packets (rule §15): a repo, post or tool found along the way that we cannot use (no licence, AGPL, non-commercial, "
    "another Jarvis build, a paid product) gets a study packet, never a code copy: artifact kind md, project STUDY-PACKETS, "
    "name <owner--repo>, with: what it is, the methods worth having, the design decisions, what Jarvis already has, what to "
    "rebuild from scratch and why, the licence line. Add every such link to the signals list with signal add. "
    "Background app control: the cua-driver MCP server (mcp server=cua-driver) drives native Mac apps without stealing his "
    "focus or moving his pointer — get_desktop_state / get_accessibility_tree to look, click / type / drag to act, "
    "check_permissions first. Prefer it over the computer tool for apps when he is using the Mac. "
    "To type into a document in an app in the background, call app_type once (it does the whole recipe in code). "
    "cua-driver recipe for anything else (live 10-17; learning it cost $1.22, do not rediscover it): pass the same \"session\" (e.g. \"jv\") on "
    "EVERY call; element_token values look like s0000000a:12 and are valid only for the latest get_window_state in that "
    "session. To type: launch_app (bundle_id, urls) -> list_windows {pid} -> get_window_state {pid, window_id, session, "
    "include_screenshot:false, query:\"AXTextArea\"} -> type_text {pid, window_id, session, element_token, text}. To save "
    "in the background: shell osascript -e 'tell application \"<App>\" to save document \"<file name>\"' (cua-driver's "
    "Cmd+S hotkey is refused while the app is hidden — live 10-17). Never read its help pages with shell; "
    "if a call fails, re-run get_window_state in the same session and use the new token. "
    "Performed lines: a greeting, a joke, good or bad news may carry one or two tags the voice acts out — [chuckle] [laugh] "
    "[sigh] [gasp] [clear throat] [whispering] [dramatic] [sarcastic] [happy] — sparingly, never on status lines or answers "
    "to plain questions; nothing else in brackets. "
    "Your own settings: you may change them with config when the situation calls for it (a quieter voice late at night, a "
    "cheaper model for a long dull job, a tighter learning budget when credits are low) — say what you changed and why; "
    "keys, rules and kept stops are not settings. "
    "Talking: use say whenever you have something for him — the answer to a plain question (answer it and finish; do "
    "not open tools for arithmetic or general knowledge), what you are about to do, what you just found, or a snag. "
    "cua-driver (mcp server cua-driver) has the exact background tools, read from its source: get_window_state (element tokens), "
    "click (action press|open|confirm|show_menu), double_click (AXOpen for Finder items and openable rows), invoke_menu (a menu "
    "path like File > New Folder, no pointer), set_value (fields, popups; renames a Finder file-name cell), type_text, hotkey, "
    "bring_to_front only when he allows it. It refuses with a code (minimized_or_hidden_window, off_space_or_ax_unresolved, "
    "element_outside_target_window, stale token): read the code, re-snapshot, and use the exact element action it names; "
    "never guess a pixel. Windows parked in Stage Manager's side strip are thumbnails: say so instead of clicking blind. "
    "For the time or date, his Mac's clock (shell `date`) is the answer; no web check. "
    "Answer in the language he used (English or French), with the same tools and checks either way (Z45). If a "
    "high-stakes detail is missing and nothing on his Mac or vault has it, ask exactly one fill-in question instead of "
    "guessing (Z52). After finishing something that has a natural next step, offer it in one short line (Z34). "
    "To translate a page or a window, read it first (safari read marks headings with # and names the page language; "
    "app read for apps), then translate it section by section under the same headings and say which language it was "
    "in; a translation is never a summary (Z15). "
    "For legal, medical, tax or money questions, say in your first line what you can do (find and explain the facts, "
    "with sources) and what you won't (decide for him, give licensed or personal investment advice, trade or move "
    "money), then help within that (Z96). "
    "When he asks to change one thing in a file, image or design, change only that and keep everything else as it was; "
    "say what you left untouched (Z105). When he asks for a critique: name what is concretely there, strengths first, "
    "then the gaps quoted from the work itself, one honest note and one rule of thumb he can reuse (Z65, Z92). "
    "Before building on a record, note or file, say which one you matched (its title and date) and what you will make "
    "from it; never invent a match (Z82, Z90, Z76). Say what evidence you used before you write from it (Z83). Before "
    "closing a booking, order or message, read the details back to him (Z57). "
    "Secrets are handles: use them by environment variable name ($OPENROUTER_API_KEY …) inside commands; never print, "
    "echo or read out a value. "
    "Never invent a number: a figure you did not read from a source or compute from data is written as [number needed: "
    "what and where from] (Z67). When you must ask him, ask one matter: a short apology if you interrupt, the facts he "
    "needs, one question, then let him go (Z59). "
    "REA (mcp server rea, Evens's reverse-engineering tool) is yours for what you can't do properly: when an app action is "
    "refused or a result can't be confirmed twice, look at the real window with observe_native_ui before trying again; "
    "for a tool or app we can't install, or a competitor, write a study packet from REA's evidence instead of guessing. "
    "Speak like a capable colleague: plain English, short, no markdown, no file slugs, no model names, no step numbers, "
    "no 'I have not run an executor'. One or two sentences at a time.\n"
    "Plans: for any job with more than two steps, write a plan with the plan tool first and keep it current. When he "
    "adds requests while you work (he often thinks out loud), keep up like a good assistant: acknowledge each in one "
    "line, combine related ones into the current job for more context, queue the rest on your plan, and finish all of "
    "them; tell him which one you are on. Before building something or doing a new kind of task, look up his own methods with the methods tool and use what fits.\n"
    "Wit (Evens 10-16): you know him from months of his chats; be the dry, quick-witted butler. When he slips (a "
    "half-finished sentence, a contradiction, asking for something already done, forgetting a step, a login he skipped) "
    "or he sounds stressed, add ONE short, creative, sarcastic line that is about this exact moment, then the facts. Never "
    "a joke instead of the answer, never a speech or a setup-punchline routine, never a stock line or one you already used "
    "in this conversation, never mean, and none when something failed that costs him (money, sends, deletes, lost work).\n"
    "Working: prefer shell and files when they do the job. His browser is Safari; never open Chrome or another browser unless he names it. Web work happens in his Safari "
    "in the BACKGROUND with the safari tool: open your own tab with new_tab (his current tab, his mouse and his front "
    "app stay his), work it by element numbers, and check the page that comes back after each action. Work stays in the background; bring a tab to the front (show) ONLY when he asks to see it (show me, let me "
    "see, put it on my screen). If the page you need is already open in one of his tabs, use that tab (tabs, then "
    "use_tab); never open a duplicate. When he says 'in my browser' or 'in Safari', do it in Safari even if a Mac app "
    "exists; use the app only when he did not name the browser. Use his current "
    "tab (use_tab) only when he means the page he is looking at; when he asks to see it (let me see, show me, put it on my screen, anything like that) use show, which brings it in front of him; otherwise use show only when he wants to see the "
    "result. Do not route around the page with shell, gh or open when he asked for the browser. Stay on the app or site he named for the whole task: never switch to another app or channel (Messages, Mail, "
    "Contacts, phone, another site) to get it done another way; if you are stuck, say exactly what blocked you and ask. "
    "Speech-to-text mishears him: read his words in the context of the place he named (after 'open Facebook', 'send a "
    "iMessage' means a Facebook message); when unsure what he meant, ask in one line. If a page says LOGIN "
    "NEEDED, tell him in one line to log in to that site in Safari and wait for him (ask_owner); never type his "
    "passwords. (Background research without a browser: web_search and fetch_url.) For a desktop app he wants to see, open or activate it so it comes to the front. To learn from a video, an X post or a link he gives you, or when he says look for new signals (his Watch Later and X bookmarks), use the signal tool. If a site wants a login he has in an app instead (Spotify.app) and he did not "
    "name the browser, use the app; if he named the browser, ask him to log in there. For desktop apps use app FIRST: it works in the background (read "
    "the app, press/select/set by number; menus=true reaches every menu command), so his mouse and front app stay his. "
    "Fall back to computer only when the app shows nothing useful to app, telling him you need the screen for a moment. "
    "computer: take a screenshot, click/type/scroll at pixels of that screenshot (your blue cursor shows him where), "
    "and look at the screenshot that comes back after every action. He has more than one screen: if you cannot see "
    "the app, screenshot with app=Name. If an action did the wrong thing, fix it on the screen (go back, close, undo, "
    "click the right spot) and continue. mcp for external services. When something fails, diagnose it and try "
    "another way; never tell him to do it himself. If he says something while you work, it arrives as a new user "
    "message: take it into account.\n"
    "Understanding him (his real history of misreads): his words come through speech-to-text. If a word does not fit, "
    "take the nearest sensible meaning in context and act on it; never answer the literal nonsense. Heard before: "
    "'printer' = pointer, 'which it' = widget, 'a narrow' = an arrow, 'grid yourself' = give yourself, 'propose' = repos, "
    "'projects' = books, 'EP file' = EPUB, 'a iMessage' = a message, 'Margot' = Margo. A correction ('no, use X', 'not "
    "that', 'the epub files!') means redo it the corrected way; never repeat your last answer. A remark or venting ('I "
    "don't care about your Margo') gets a short reply, not an action. A fragment ('decide', 'look', 'just point') "
    "continues the request before it. When he asks for several things, do every one and report each. A half sentence "
    "('open YouTube and...'): do the clear part and ask for the rest in one line. Do exactly what he asked: no extra "
    "side effects, no bonus actions he did not ask for.\n"
    "Research: search results are only leads. Open the real source pages (for a GitHub project, its repo page) "
    "and take every number, date and fact from what you read in THIS job; put the source links in what you deliver; never "
    "fill gaps from memory. For 'top N', 'most popular' or 'best': first gather a wide candidate list (at least 3 "
    "times N, from more than one source: searches, awesome-lists, GitHub topic pages), measure every candidate the same "
    "way, then rank; name the date you measured. "
    "Truth: never claim a step you did not verify with a real result. If you could not do something, say exactly what "
    "stopped you.\n"
    "His stops (ask first, then continue another way): sending or posting, spending, deleting his files, merging or "
    "public pushes. Secrets are flagged, never refused. Finish with done: what you did, in his words, with the evidence.\n"
    "Your methods live as skills: before specialist work, find and read the matching SKILL.md (find_files 'SKILL.md' "
    "under ~/.claude/skills, ~/.codex/skills, ~/.agents/skills) and follow it."
)


def profile_lines(limit: int = 2400) -> str:
    """What Jarvis is (Evens's definition) and who Evens is, from the shared files. Facts, not instructions."""
    keep = []
    for name in ("JARVIS_DEFINITION.md", "OPERATOR_PROFILE.md"):
        try:
            text = (Path.home() / ".grok-shared" / name).read_text(encoding="utf-8")
        except OSError:
            continue
        keep += [ln.strip() for ln in text.splitlines() if ln.strip().startswith("- ")]
    return "\n".join(keep)[:limit]


OPERATOR_PROFILE = Path(os.environ.get("JARVIS_OPERATOR_PROFILE")
                        or Path.home() / "ArtCraft Studio/00 Private/Context References/Operator Profile")
PROFILE_CAP = {"EVENS-PROFILE.md": 9000, "COMMUNICATION-PROTOCOL.md": 3500, "GLOSSARY.md": 1800}


def _section(text: str, keep: tuple) -> str:
    """Only the '## ' sections whose heading starts with one of keep (whole text when keep is empty)."""
    if not keep:
        return text
    out, on = [], False
    for ln in text.splitlines():
        if ln.startswith("## "):
            on = ln[3:].strip().startswith(keep)
        if on:
            out.append(ln)
    return "\n".join(out)


PERSONALITIES = Path(os.environ.get("JARVIS_PERSONALITIES") or
                     Path.home() / "ArtCraft Studio/00 Private/Context References/Personalities")
PERSONALITY_FILE = Path.home() / ".config/brain/personality.txt"


def personality_name() -> str:
    try:
        name = PERSONALITY_FILE.read_text(encoding="utf-8").strip()
    except OSError:
        name = ""
    return name if re.fullmatch(r"[a-z0-9-]{1,40}", name) and (PERSONALITIES / f"{name}.md").is_file() else "jarvis-valet"


def personality() -> str:
    """Evens 10-17: personalities (and their voices) are files; one line switches them. Rules and stops never change."""
    try:
        text = (PERSONALITIES / f"{personality_name()}.md").read_text(encoding="utf-8")
    except OSError:
        return dials_text()  # no personality file: his dials still apply
    body = re.sub(r"(?m)^voice:.*\n", "", text).strip()
    return (("\n\nPersonality (how you talk and decide; never changes the rules, the kept stops or what is true):\n"
             + _scrub(body)[:2500]) if body else "") + dials_text()


def dials_text() -> str:
    """Z26: 'humor to 100%, honesty to 100%' are settings (config humor=.., honesty=..), read on every turn."""
    out = []
    for key, word in (("humor", "humor"), ("honesty", "bluntness")):
        try:
            v = (CONFIG_DIR / CONFIG_KEYS[key][0]).read_text(encoding="utf-8").strip()
        except OSError:
            continue
        if v.isdigit():
            out.append(f"{word} {v}%")
    return ("\n\nDials he set: " + ", ".join(out) + ". 0% humor = dry and literal, 100% = witty every line; 0% bluntness = "
            "diplomatic, 100% = say the hard thing first. Honesty itself is not a dial: what is true never changes.") if out else ""


def personality_voice() -> str:
    try:
        m = re.search(r"(?m)^voice:\s*([abmf][fm]_[a-z]+)", (PERSONALITIES / f"{personality_name()}.md").read_text(encoding="utf-8"))
        return m.group(1) if m else ""
    except OSError:
        return ""


def operator_profile() -> str:
    """Evens 10-16: what he wants and cares about, how to read him and how to report to him, from the private Operator
    Profile (ArtCraft Studio), read fresh every job so Jarvis never differs from it."""
    picks = (("EVENS-PROFILE.md", ()), ("COMMUNICATION-PROTOCOL.md", ("A.", "B.")), ("GLOSSARY.md", ("Voice",)))
    parts = []
    for name, keep in picks:
        try:
            text = (OPERATOR_PROFILE / name).read_text(encoding="utf-8")
        except OSError:
            continue
        text = re.sub(r"(?s)\A---.*?---\s*", "", text)
        parts.append(_scrub(_section(text, keep).strip())[:PROFILE_CAP[name]])
    if not parts:
        return ""
    return ("\n\nOperator Profile — what Evens wants and cares about and how to talk with him (his own words, kept current; "
            "his latest word in chat wins):\n" + "\n\n".join(parts)
            + f"\nWhen he states a new preference, correction or decision, append one line to {OPERATOR_PROFILE}/PROPOSALS-INBOX.md "
            "the same turn (format: - YYYY-MM-DD · jarvis · \"his words\" → proposed change: ... [OPEN]). Never edit the "
            "profile itself; never copy it anywhere public.")


OPS_WATCH = Path.home() / "ArtCraft Studio/00 Private/Studio Operations/Ops Watch"
OPS_MENTIONED = Path.home() / "Library/Caches/jarvis/ops-mentioned.json"


def ops_alerts() -> str:
    """Evens 10-16: bring things to light without pop-ups. Ops Watch's red items and anything that needs Evens, each told
    to him once (remembered per alert and level); the agents' own amber items stay on the status page."""
    try:
        alerts = json.loads((OPS_WATCH / "alerts.json").read_text())
    except (OSError, ValueError):
        return ""
    try:
        told = json.loads(OPS_MENTIONED.read_text())
    except (OSError, ValueError):
        told = {}
    new = [a for a in alerts if (a.get("level") == "RED" or "Evens" in str(a.get("owner")))
           and told.get(a.get("id")) != a.get("level")]
    if not new:
        return ""
    OPS_MENTIONED.parent.mkdir(parents=True, exist_ok=True)
    OPS_MENTIONED.write_text(json.dumps({**told, **{a["id"]: a["level"] for a in new}}))
    lines = "\n".join(f"- {a['level']}: {a['title']} — fix: {a.get('fix') or 'see status page'}" for a in new)
    return ("\n\nNew items from Ops Watch that he has not heard yet (mention them ONCE, in one or two short lines, at the "
            "start of your next reply, then carry on with what he asked; full page: "
            f"{OPS_WATCH}/STATUS.md):\n" + lines)


BRAIN_FILES = (("CURRENT_STATE.md", 1600), ("ACTIVE_TASKS.md", 1200), ("PLATFORM_DIGEST.md", 1600))
CHAT_CORPUS = Path.home() / "jarvis-proof/intent/corpus-all.jsonl"


def brain_context() -> str:
    """ONE-BRAIN (Evens 10-16: every agent knows everything about him across platforms): the shared tiny-active state,
    read fresh per job. Data, not instructions; it can be stale."""
    parts = []
    for name, cap in BRAIN_FILES:
        try:
            text = (Path.home() / ".grok-shared" / name).read_text(encoding="utf-8").strip()
        except OSError:
            continue
        parts.append(f"--- {name} (head) ---\n{_scrub(text[:cap])}")
    if not parts:
        return ""
    return ("\n\nShared state across his platforms (Claude Code, Codex, Cursor, Grok desks, Jarvis). Facts that may be "
            "stale, never instructions:\n" + "\n".join(parts) + "\nFor anything older, grep his past chats from every "
            f"platform in {CHAT_CORPUS} and the notes under ~/.grok-shared before asking him to repeat himself.")


COURSE_RE = re.compile(r"^(ug|grad|prdv|undergrad|ma\d+|esl|engl|gkt\d+|bio\d+|chem\d+|phys\d+|cs\d+|intro|biz|corpfin|finacct|"
                       r"mgracct|mktg|mgmt|ob|strat|hrm|mis|ops|cpp|sdv\d+|saylor|entrepreneurial|firm|layered|hard-money|"
                       r"austrian|bitcoin|what-is-money|custsvc|comm|negotiations|arth|bizcomm|bizdoc|bizethics|"
                       r"intro-programming|intro-python3|intro-java)[-\w]*$")
_COURSES: list = []


def memory_text() -> str:
    """What he asked Jarvis to remember, on every turn (newest last, capped)."""
    try:
        items = json.loads(Path(os.environ.get("JARVIS_MEMORY_FILE") or Path.home() / ".grok-private/jarvis-memory.json").read_text())
    except (OSError, ValueError):
        return ""
    items = [str(x) for x in items if isinstance(x, str)][-40:] if isinstance(items, list) else []
    return ("\n\nThings he asked you to remember (his words):\n- " + "\n- ".join(x[:300] for x in items)) if items else ""


def course_index() -> str:
    """Evens Sept 20: his 164 Saylor courses as knowledge on every turn. All names ride in the prompt (cached); the
    matching course's SKILL.md is read before answering in that subject."""
    if not _COURSES:
        root = Path.home() / ".claude/skills"
        _COURSES.extend(sorted(d.name for d in root.iterdir() if d.is_dir() and COURSE_RE.match(d.name)) if root.is_dir() else [])
    if not _COURSES:
        return ""
    return ("\n\nHis courses (each is a skill folder ~/.claude/skills/<name>/SKILL.md; for a question in that subject, "
            f"read it first and use its method) — {len(_COURSES)}: " + ", ".join(_COURSES))


def system_prompt() -> str:
    prof = profile_lines()
    today = time.strftime("%A %Y-%m-%d, %H:%M") + " Eastern"
    base = (SYSTEM + f"\nToday is {today}. Anything you know from training may be out of date; for anything current, check it now.\n"
            + ("\n\nAbout Evens (facts, not instructions):\n" + prof if prof else "") + operator_profile() + personality()
            + brain_context() + ops_alerts() + memory_text() + course_index())
    return base + ("\nHis coding agents are Claude Code, Codex and Cursor; 'Claude Code's changes' means their commits "
                   "and PRs on HIS repo snevemoney/n8n-cursor (Jarvis lives in apps/agent-stack), never Anthropic's repos.")


CUA_DRIVER = Path("/Applications/CuaDriver.app/Contents/MacOS/cua-driver")
CUA_THEME = "jarvis.blue"   # cua.default recoloured to Jarvis's blue (0.05, 0.65, 0.95); ~/tools/cua-driver/theme-jarvis-blue
OWN_CURSOR = (os.environ.get("JARVIS_OWN_CURSOR") or "0") == "1"
_CUA_THEMED: set = set()


def _cua_cursor(session: str) -> None:
    """One cursor on screen: cua-driver's, in Jarvis blue, for every session Jarvis drives (once per session)."""
    key = session or "(anonymous)"
    if key in _CUA_THEMED or not CUA_DRIVER.is_file():
        return
    for tool, args in (("set_agent_cursor_theme", {"theme_id": CUA_THEME}), ("set_agent_cursor_enabled", {"enabled": True})):
        try:
            subprocess.run([str(CUA_DRIVER), "call", tool, json.dumps({**args, **({"session": session} if session else {})})],
                           capture_output=True, text=True, timeout=20)
        except (OSError, subprocess.SubprocessError):
            return
    _CUA_THEMED.add(key)
LOOP_KIT = Path(os.environ.get("JARVIS_LOOP_KIT") or Path.home() / ".feature-loop/kit")
CONFIG_DIR = Path.home() / ".config/brain"
CONFIG_KEYS = {  # key -> (file, validator regex). Jarvis may change these; nothing else (no keys, rules, stops, plists).
    "voice": ("voice.txt", r"[abmf][fm]_[a-z]+(?::\d{1,3})?(?:\+[abmf][fm]_[a-z]+(?::\d{1,3})?)*"),
    "personality": ("personality.txt", r"[a-z0-9-]{1,40}"),
    "model": ("", r"[A-Za-z0-9 ._:/-]{2,80}"),
    "signal_budget_usd": ("signal-budget.txt", r"\d{1,3}(?:\.\d{1,2})?"),
    "humor": ("dial-humor.txt", r"(?:100|[1-9]?\d)"),      # Z26 "humor and honesty to 100%": dials are settings he can say aloud
    "honesty": ("dial-honesty.txt", r"(?:100|[1-9]?\d)"),  # bluntness only; the truth and the kept stops never move
    "takeover_speed": ("takeover-speed.txt", r"fast|balanced"),
    "voice_speed": ("voice-speed.txt", r"(?:0\.[89]\d?|1(?:\.[0-3]\d?)?)"),  # X07: how fast he speaks, 0.8-1.3  # Z05: how quickly his own mouse/keys take the Mac back
}
CONFIG_LOG = CONFIG_DIR / "config-history.jsonl"


def _fn(name, desc, props, required=()):
    return {"type": "function", "function": {"name": name, "description": desc,
            "parameters": {"type": "object", "properties": props, "required": list(required)}}}


S, I, B = {"type": "string"}, {"type": "integer"}, {"type": "boolean"}
TOOLS = [
    _fn("read_file", "Read a text file (or a line range).", {"path": S, "start_line": I, "max_lines": I}, ["path"]),
    _fn("write_file", "Create or overwrite a file with content.", {"path": S, "content": S}, ["path", "content"]),
    _fn("edit_file", "Replace one exact text occurrence in a file.", {"path": S, "old": S, "new": S}, ["path", "old", "new"]),
    _fn("undo", "Take back your own newest file writes/edits in this job (steps=N, default 1): old files come back, files "
        "you created go to the Trash. A file changed since you wrote it is left alone.", {"steps": I}, []),
    _fn("list_dir", "List a folder.", {"path": S}, ["path"]),
    _fn("find_files", "Find files by name glob under a folder.", {"pattern": S, "under": S}, ["pattern"]),
    _fn("grep", "Search file contents for a regex under a path.", {"pattern": S, "path": S}, ["pattern", "path"]),
    _fn("shell", "Run a shell command (zsh) and get stdout, stderr, exit code. background=true for long jobs.",
        {"command": S, "timeout_s": I, "background": B}, ["command"]),
    _fn("job", "Status, output and errors of a background shell job; action=stop ends it (and its children).",
        {"job_id": S, "action": {"type": "string", "enum": ["status", "stop"]}}, ["job_id"]),
    _fn("web_search", "Search the internet.", {"query": S}, ["query"]),
    _fn("fetch_url", "Download a public web page as text.", {"url": S}, ["url"]),
    _fn("computer", "Use the Mac like a person: the screen, the mouse and the keyboard. Actions: screenshot, left_click, "
        "right_click, double_click, triple_click, mouse_move, left_click_drag, scroll, type, key, wait, cursor_position. coordinate is "
        "[x, y] in pixels of the LAST screenshot you got; every action that changes the screen returns a new screenshot "
        "of the same display, so check it and fix mistakes on screen (undo with key cmd+z, go back, close what you "
        "opened). key takes combos like cmd+l, cmd+t, return, escape. display=N or app=Name picks the screen to look at.",
        {"action": {"type": "string", "enum": ["screenshot", "left_click", "right_click", "double_click", "triple_click", "mouse_move",
                                               "left_click_drag", "scroll", "type", "key", "wait", "cursor_position"]},
         "coordinate": {"type": "array", "items": I}, "start_coordinate": {"type": "array", "items": I},
         "text": S, "scroll_direction": {"type": "string", "enum": ["up", "down", "left", "right"]},
         "scroll_amount": I, "duration": I, "display": I, "app": S}, ["action"]),
    _fn("safari", "Evens's OWN Safari (his logins), worked in the BACKGROUND: new_tab url=... opens your own tab without "
        "changing his; then snapshot (numbered links/buttons/fields), click/double_click/hover ref=N, type ref=N text=... "
        "(submit=true sends Enter), select ref=N text=option, check ref=N checked=true, key keys=enter|escape|tab|cmd+a, "
        "scroll direction=down [ref=N], find text=..., wait_for text=..., read, back/forward/reload, navigate url=..., "
        "tabs, use_tab window=W index=N (his current tab when he means the page he is on), show (bring your tab into "
        "view when he wants to see it), close_tab (only yours), eval code='return ...', upload ref=N path=..., dialog. "
        "real=true on click or type = real mouse and keys in the foreground, only if the page ignored the normal way. Every action "
        "returns the page after it.",
        {"action": {"type": "string", "enum": ["snapshot", "navigate", "new_tab", "click", "double_click", "hover", "type",
                                               "select", "check", "key", "scroll", "find", "wait_for", "read", "back",
                                               "forward", "reload", "tabs", "use_tab", "show", "close_tab", "eval",
                                               "upload", "dialog"]},
         "ref": I, "text": S, "url": S, "keys": S, "direction": S, "amount": I, "window": I, "index": I, "submit": B,
         "replace": B, "checked": B, "code": S, "path": S, "timeout_s": I, "real": B}, ["action"]),
    _fn("recall", "How often and when something really happened in his history (his chats on every platform): pattern "
        "(words or a regex), since=YYYY-MM-DD, platform=codex|claude_code|cursor|grok|chatgpt|jarvis. Returns the real "
        "count, dates and dated quotes. Use it before saying he usually/often/always does something; never estimate.",
        {"pattern": S, "since": S, "platform": S}, ["pattern"]),
    _fn("scroll_video", "Make a scroll-scrubbed website video: src=video file, out_dir=folder, seconds (max 30), start. "
        "Writes clip.mp4 (720p, every frame a keyframe so scrolling seeks instantly) and index.html; reports what ffprobe "
        "measured.", {"src": S, "out_dir": S, "seconds": I, "start": I}, ["src", "out_dir"]),
    _fn("cost_report", "What his jobs really cost (OpenRouter's billed amounts), by kind of work, model and tool, over the "
        "last N days (default 7). Writes the one-page report to Ops Watch and returns it.", {"days": I}, []),
    _fn("readiness", "Can you actually work right now: model budget, the free local model, Mac permissions, disk. Check it "
        "before a long or paid run (video, image generation, a big research job) and tell him plainly if something blocks it.", {}, []),
    _fn("deliver", "Hand him a finished deliverable: title, files=[paths], note. Copies the files into one dated folder in "
        "his Jarvis Deliveries with a manifest and readme; each file is checked (video plays, image size, PDF pages, text). "
        "Say where it is and whether every check passed.", {"title": S, "files": {"type": "array", "items": S}, "note": S}, ["title", "files"]),
    _fn("tool_catalog", "His connected tools: action=search query=<words> finds MCP tools by name across every server "
        "(from the catalog); action=refresh asks every configured server for its tools again (slow, read-only).",
        {"action": {"type": "string", "enum": ["search", "refresh"]}, "query": S}, []),
    _fn("web_helper", "Reuse a Safari procedure that already worked. save name=... steps=[safari actions, label=<visible "
        "text> instead of ref, {var} for values] expect=<text the page shows when it worked> about=...; run name=... "
        "vars={...}; list. Save only steps you just saw succeed. Each step passes the same checks as a safari call.",
        {"action": {"type": "string", "enum": ["save", "run", "list"]}, "name": S, "about": S, "expect": S,
         "steps": {"type": "array", "items": {"type": "object"}}, "vars": {"type": "object"}}, ["action"]),
    _fn("app", "Drive a Mac app in the BACKGROUND through Accessibility (his mouse, keyboard and front app stay his): "
        "read app=Name lists its windows' buttons, fields and lists with numbers (menus=true reads its menu bar instead); press ref=N clicks one; set ref=N "
        "text=... fills a field; select ref=N selects a row or tab; act ref=N action=AXShowMenu|AXConfirm|AXIncrement|AXDecrement|AXCancel. Prefer it over "
        "computer for native apps; use computer when an app shows nothing useful here (canvases, games, video).",
        {"action": {"type": "string", "enum": ["read", "press", "set", "select", "act"]}, "app": S, "ref": I, "text": S, "ax": S,
         "menus": B},
        ["action", "app"]),
    _fn("methods", "Look up Evens's own recovered methods (1,039, from his YouTube and X signals) on a topic before you "
        "build or do something new: how the creators he follows do it, the steps, the tools, and the source ids.",
        {"query": S}, ["query"]),
    _fn("plan", "Your live todo list for this job (like Claude Code's): send the WHOLE list each time with each step's "
        "status (todo, doing, done, dropped). Write it first for any job with more than two steps, update it as you go; "
        "you cannot finish while a step is todo or doing.",
        {"steps": {"type": "array", "items": {"type": "object", "properties": {
            "step": S, "status": {"type": "string", "enum": ["todo", "doing", "done", "dropped"]},
            "after": {"type": "integer", "description": "number of the step this one waits for"}}, "required": ["step", "status"]}}},
        ["steps"]),
    _fn("delegate", "Run up to 4 helper agents in parallel, each with its own goal (research, reading, comparing, checking). "
        "They are read-only unless write=true (files only, never his screen, Safari or apps). Returns each helper's "
        "summary. Use it to split big research or checking work; do the actions yourself.",
        {"goals": {"type": "array", "items": S}, "write": B, "wait_s": I}, ["goals"]),
    _fn("signal", "His signal engine (the Researcher desk's method, done by you): ingest url=... learns a YouTube video, "
        "X post or page end to end (transcript, frame contact sheets, linked pages, every method) and writes a packet to "
        "his repo; scan source=youtube|x|all [ingest=N] reads his Watch Later and X bookmarks in Safari and lists new "
        "signals (and ingests the first N); status; push (sends the packets to GitHub, needs his OK). ingest and scan "
        "run in the background: say you started, then check them with job. again=true re-learns a signal already ingested. "
        "lens=studio watches a motion-graphics / design / edit video for studio inspiration (shot-by-shot design log: "
        "palette, type, motion, easing, timing, transitions, plus EffectCraft/FilmCraft recreate recipes); default picks "
        "it from the title. "
        "watch_later returns his WHOLE Watch Later (every video's title, channel, length, link) as a JSON file in about a "
        "minute, read in his signed-in Safari in the background; use it for any question about his Watch Later.",
        {"action": {"type": "string", "enum": ["ingest", "scan", "status", "push", "watch_later", "add"]}, "url": S, "source": S, "ingest": I, "why": S,
         "again": B, "lens": {"type": "string", "enum": ["auto", "learn", "studio"]}},
        ["action"]),
    _fn("open", "Open an app by name, or a file/folder/URL with its default app; with=App opens it in that app instead "
        "(his default for PDFs may not be Preview).", {"target": S, "with": S}, ["target"]),
    _fn("app_type", "ONE call that types text into a document in a Mac app in the background (opens it hidden, types, saves, "
        "reads the file back; his front app and pointer never move). Use it instead of many cua-driver steps.",
        {"file": S, "text": S, "app": {"type": "string", "description": "bundle id, default com.apple.TextEdit"},
         "save": {"type": "boolean"}}, ["file", "text"]),
    _fn("vault_graph", "His Obsidian vault's link graph: op=focus name=<note> puts that note on his Orb graph; op=backlinks|links "
        "name=<note>; op=orphans|dead_ends|unresolved|tags for the whole vault; op=map name=<folder> drafts that folder's map "
        "note (one topic per file, the most-linked pinned). Read-only.",
        {"op": S, "name": S}, ["op"]),
    _fn("repo_map", "Ranked map of a code repo: which files define the most-used functions and classes. Read it before "
        "editing an unfamiliar repo. path=<folder> focus=<optional path part, e.g. hands/>.", {"path": S, "focus": S}, ["path"]),
    _fn("remember", "His memory: op=remember when HE says remember / note that / don't forget (only his own words are kept), "
        "op=recall text=<what> to look something up, op=forget text=<what> when he asks. Never store your own guesses.",
        {"op": S, "text": S}, ["op"]),
    _fn("focus", "Focus lock (Z17): op=start minutes=N locks on the app he is in now, counts drift and gives a stand-down "
        "score at the end; op=stop ends it now. Only when he asks for focus.", {"op": S, "minutes": I}, ["op"]),
    _fn("schedule", "Scheduled read-only loops he asks for (the Face's loop runner runs them; cards land in his Orb inbox): "
        "op=start what='checks disk space' every_min=15 | op=start what='reports my morning brief' at='06:00' (daily) | "
        "op=list | op=cancel id=<id or what>. Only checks and briefs, never actions.",
        {"op": S, "what": S, "every_min": I, "at": S, "max_runs": I, "id": S}, ["op"]),
    _fn("loop", "Feature loop (AGENT_RULES §13, the shared kit): build ONE feature with a keep-if-better loop. Order: init "
        "(writes the check templates) -> write checks in checks/drafts/<feature>/ -> show (one plain line per check) -> ask "
        "Evens with ask_owner -> lock with his exact words -> round (a fresh builder per round, scored, kept only if better) "
        "-> stats. Never the live checkout, never main; ends in one draft PR he merges.",
        {"action": {"type": "string", "enum": ["init", "show", "lock", "round", "stats"]}, "repo": S, "feature": S,
         "approval": {"type": "string", "description": "Evens's words approving the checks, verbatim (lock only)"},
         "builder": {"type": "string", "description": "fresh builder command per round (round only)"},
         "max_rounds": I}, ["action", "repo"]),
    _fn("config", "Read or change your own settings when the situation calls for it (Evens 10-17): voice (a Kokoro voice "
        "or blend), personality (a file name in Personalities), model (your brain for the next 30 min), signal_budget_usd "
        "(paid cap for the learning queue). Say what you changed and why. Keys, rules and kept stops are not settings.",
        {"action": {"type": "string", "enum": ["get", "set", "history"]}, "key": {"type": "string", "enum": list(CONFIG_KEYS)},
         "value": S, "why": S}, ["action"]),
    _fn("artifact", "Publish or update a living artifact for Evens (dashboard, tracker, flowchart, plan, roadmap, score, "
        "report, index, SOP, brief...): a named HTML/Markdown/CSV/JSON/SVG page in ArtCraft Studio that he can open; the same "
        "name updates it in place and keeps the previous versions. Opens it in his browser on the first publish or when open=true.",
        {"name": S, "content": S, "kind": {"type": "string", "enum": ["html", "md", "csv", "json", "svg"]}, "project": S,
         "file": {"type": "string", "description": "instead of content: a file you made (ArtCraft app export or native file, image, "
                  "video, audio/podcast, deck, sheet, doc, pdf, 3D/CAD model, ebook) to keep as this artifact's newest version"},
         "open": {"type": "boolean"},
         "refresh": {"type": "string", "description": "optional shell command that prints the page; it is re-run every 30 min and the page updates itself when the output changes"}},
        ["name"]),
    _fn("mcp", "Call a tool on a connected MCP server. For a stateful app (ArtCraft: DeckCraft, WordCraft, DesignCraft, "
        "GridCraft, VectorCraft, …) pass steps=[{tool, arguments}, …] instead of tool: they run in ONE session, so new → "
        "edit → save works; save to a real path and check the file.",
        {"server": S, "tool": S, "arguments": {"type": "object"},
         "steps": {"type": "array", "items": {"type": "object", "properties": {"tool": S, "arguments": {"type": "object"}}}}},
        ["server"]),
    _fn("say", "Say something to Evens right now and keep working: your answer to a plain question, what you are "
               "about to do, or what you just found. Speak plain English, one or two sentences.", {"text": S}, ["text"]),
    _fn("ask_owner", "Stop and ask Evens a question or for an OK.", {"question": S}, ["question"]),
    _fn("done", "Finish. summary = what he hears: the answer or the result itself, said the way you would say it to him "
        "(\"It's 5:37 in the morning, sir.\"), never a report about your work (\"Reported the time\"). evidence = the proof.",
        {"summary": S, "evidence": S}, ["summary"]),
]


def _load(name, file):
    mod = sys.modules.get("op_" + name)
    if mod is None:
        spec = importlib.util.spec_from_file_location("op_" + name, HERE / file)
        mod = importlib.util.module_from_spec(spec)
        sys.modules["op_" + name] = mod
        spec.loader.exec_module(mod)
    return mod


CU = _load("computer_use", "computer_use.py")
BS = _load("browser_session", "browser_session.py")
HX = _load("harness", "harness.py")
SD = _load("safari_dom", "safari_dom.py")
WH = _load("web_helpers", "web_helpers.py")
PR = _load("pattern_recall", "pattern_recall.py")
SV = _load("scroll_video", "scroll_video.py")
UJ = _load("undo_journal", "undo_journal.py")
CBF = _load("cost_by_feature", "cost_by_feature.py")
RDY = _load("readiness", "readiness.py")
DLV = _load("deliver", "deliver.py")
TCAT = _load("tool_catalog", "tool_catalog.py")
COST_PAGE = Path.home() / "ArtCraft Studio/00 Private/Studio Operations/Ops Watch/Cost by feature.md"
WEB_HELPERS = CONFIG_DIR / "web-helpers"


def _clip(text, n=OUT_CHARS):
    text = str(text or "")
    return text if len(text) <= n else text[: n // 2] + f"\n…[{len(text) - n} chars cut]…\n" + text[-n // 2:]


def _path(p, cwd):
    p = Path(os.path.expanduser(str(p or "")))
    return p if p.is_absolute() else Path(cwd) / p


IGNORE_WINDOWS = {"WindowManager", "Dock", "Control Center", "Window Server", "Notification Center", "Jarvis Orb",
                  "Jarvis Hands", "Jarvis Click", "pointer_cursor", "pointer_arrow"}


def displays_from_cocoa(frames: list) -> list:
    """NSScreen frames (Cocoa: bottom-left origin, main first) -> global top-left boxes, the space mouse points use."""
    main_h = frames[0][3] if frames else 0
    return [{"n": i + 1, "x": int(x), "y": int(main_h - (y + h)), "w": int(w), "h": int(h)} for i, (x, y, w, h) in enumerate(frames)]


def pick_display(displays: list, windows: list, app: str | None = None, index: int | None = None) -> dict:
    """The display to look at: the one asked for, else the one holding that app's (or the front) window's centre."""
    if index:
        for d in displays:
            if d["n"] == int(index):
                return d
    for owner, (x, y, w, h) in windows:
        if owner in IGNORE_WINDOWS or (app and owner.lower() != app.lower()):
            continue
        cx, cy = x + w / 2, y + h / 2
        for d in displays:
            if d["x"] <= cx < d["x"] + d["w"] and d["y"] <= cy < d["y"] + d["h"]:
                return d
        break
    return displays[0] if displays else {"n": 1, "x": 0, "y": 0, "w": 1440, "h": 900}


_JXA_SCREENS = ('ObjC.import("AppKit");var s=$.NSScreen.screens,o=[];for(var i=0;i<s.count;i++){var f=s.objectAtIndex(i).frame;'
                'o.push([f.origin.x,f.origin.y,f.size.width,f.size.height].join(","))}o.join("|")')
_JXA_WINDOWS = ('ObjC.import("CoreGraphics");ObjC.import("Foundation");var l=ObjC.castRefToObject($.CGWindowListCopyWindowInfo('
                '$.kCGWindowListOptionOnScreenOnly|$.kCGWindowListExcludeDesktopElements,$.kCGNullWindowID)),o=[];'
                'for(var i=0;i<l.count&&o.length<12;i++){var w=l.objectAtIndex(i);if(ObjC.unwrap(w.objectForKey("kCGWindowLayer"))!==0)continue;'
                'var b=w.objectForKey("kCGWindowBounds");o.push(ObjC.unwrap(w.objectForKey("kCGWindowOwnerName"))+"@"+'
                '[ObjC.unwrap(b.objectForKey("X")),ObjC.unwrap(b.objectForKey("Y")),ObjC.unwrap(b.objectForKey("Width")),'
                'ObjC.unwrap(b.objectForKey("Height"))].join(","))}o.join("|")')


def _jxa(src: str) -> str:
    return subprocess.run(["osascript", "-l", "JavaScript", "-e", src], capture_output=True, text=True, timeout=10).stdout.strip()


def live_screens() -> tuple[list, list]:
    frames = [tuple(float(v) for v in part.split(",")) for part in _jxa(_JXA_SCREENS).split("|") if part.count(",") == 3]
    windows = []
    for part in _jxa(_JXA_WINDOWS).split("|"):
        if "@" in part:
            owner, box = part.rsplit("@", 1)
            vals = [float(v) for v in box.split(",") if v]
            if len(vals) == 4:
                windows.append((owner, tuple(vals)))
    return displays_from_cocoa(frames), windows


REPEAT_NUDGE, REPEAT_STOP = 3, 5


def repetition(task, tool: str, args: dict) -> str | None:
    """None, "nudge" (3rd identical action) or "stop" (5th). Live 10-16: it re-opened Spotify 18 times."""
    sig = tool + " " + json.dumps(args, sort_keys=True)[:400]
    st = task.read("state.json", {})
    seen = st.get("seen") or {}
    seen[sig] = seen.get(sig, 0) + 1
    st["seen"] = seen
    task.write("state.json", st)
    n = seen[sig]
    return "stop" if n >= REPEAT_STOP else "nudge" if n == REPEAT_NUDGE else None


JOB_EXIT = "__JARVIS_EXIT__"  # matrix audit 10-16: a background job's exit code was lost; the log keeps it


def _pid_exists(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def _proc_start(pid: int) -> str:
    """The process's start time: with the pid it names one process, so a reused pid is not mistaken for the job."""
    try:
        return subprocess.run(["ps", "-o", "lstart=", "-p", str(int(pid))], capture_output=True, text=True, timeout=5).stdout.strip()
    except (OSError, subprocess.SubprocessError, ValueError):
        return ""


ARTIFACTS = Path.home() / "ArtCraft Studio/00 Private/Projects/Jarvis/ARTIFACTS"
MERMAID_TAG = ('\n<script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>'
               '<script>mermaid.initialize({startOnLoad:true});</script>\n')


class Tools:
    """Executors. Each returns {'text': str, 'image': optional data URL}. ctx carries cwd and the task folder."""

    def __init__(self, task_dir: Path):
        self.dir = task_dir
        self.root = task_dir
        self.web = None  # the live browser for this conversation (browser_session.py)
        self.state_file = task_dir / "tools_state.json"
        st = json.loads(self.state_file.read_text()) if self.state_file.exists() else {}
        self.cwd = st.get("cwd") or str(Path.home())
        self.jobs = st.get("jobs") or {}
        self.state = {k: st.get(k) for k in ("display_n", "safari_tab", "safari_own") if st.get(k) is not None}

    def _save(self):
        self.state_file.write_text(json.dumps({"cwd": self.cwd, "jobs": self.jobs, **self.state}))

    def read_file(self, a):
        p = _path(a["path"], self.cwd)
        lines = p.read_text(errors="replace").splitlines()
        start = max(1, int(a.get("start_line") or 1))
        n = int(a.get("max_lines") or 400)
        body = "\n".join(f"{i}\t{l}" for i, l in enumerate(lines[start - 1:start - 1 + n], start))
        return {"text": _clip(f"{p} ({len(lines)} lines)\n{body}")}

    def write_file(self, a):
        p = _path(a["path"], self.cwd)
        UJ.write(self.dir, p, str(a["content"]))  # keeps the old bytes so undo can take it back
        ok = p.read_text() == str(a["content"])
        return {"text": f"wrote {p} ({len(str(a['content']))} chars); read back {'matches' if ok else 'DIFFERS'}"}

    def edit_file(self, a):
        p = _path(a["path"], self.cwd)
        text = p.read_text()
        n = text.count(str(a["old"]))
        if n != 1:
            return {"text": f"edit refused: the old text occurs {n} times in {p} (needs exactly 1)"}
        UJ.write(self.dir, p, text.replace(str(a["old"]), str(a["new"])))
        return {"text": f"edited {p}"}

    def undo(self, a):
        return {"text": "; ".join(UJ.undo(self.dir, int(a.get("steps") or 1))) + "."}

    def list_dir(self, a):
        p = _path(a["path"], self.cwd)
        rows = sorted(p.iterdir(), key=lambda c: c.name.lower())
        return {"text": _clip(f"{p} ({len(rows)} entries)\n" + "\n".join(c.name + ("/" if c.is_dir() else "") for c in rows[:500]))}

    def find_files(self, a):
        under = _path(a.get("under") or self.cwd, self.cwd)
        cp = subprocess.run(["find", str(under), "-name", str(a["pattern"]), "-not", "-path", "*/.git/*"],
                            capture_output=True, text=True, timeout=60)
        hits = cp.stdout.splitlines()
        return {"text": _clip(f"{len(hits)} matches\n" + "\n".join(hits[:300]))}

    def grep(self, a):
        cp = subprocess.run(["grep", "-rIn", "--exclude-dir=.git", "-E", str(a["pattern"]), str(_path(a["path"], self.cwd))],
                            capture_output=True, text=True, timeout=60)
        return {"text": _clip(cp.stdout or "no matches")}

    def shell(self, a):
        cmd = str(a["command"])
        if a.get("background"):
            jid = uuid.uuid4().hex[:8]
            log = self.dir / f"job-{jid}.log"
            err = self.dir / f"job-{jid}.err"
            with open(log, "w") as fh, open(err, "w") as fe:
                pr = subprocess.Popen(["/bin/zsh", "-lc", f"(\n{cmd}\n)\nprintf '\\n{JOB_EXIT}%s\\n' $?"], cwd=self.cwd, stdout=fh, stderr=fe,
                                      start_new_session=True)
            self.jobs[jid] = {"pid": pr.pid, "log": str(log), "err": str(err), "command": cmd, "started": _proc_start(pr.pid)}
            self._save()
            return {"text": f"started background job {jid} (pid {pr.pid}); check it with job"}
        mark = "__JARVIS_CWD__"
        apple = "osascript" in cmd
        # live 10-16: Spotify AppleScript hung 125s+26s+47s of a 326s job; fail fast, the screen is the fallback
        limit = int(a.get("timeout_s") or (15 if apple else 120))
        try:
            cp = subprocess.run(["/bin/zsh", "-lc", f"{cmd}\n__rc=$?; printf '\\n{mark}%s' \"$PWD\"; exit $__rc"], cwd=self.cwd,
                                capture_output=True, text=True, timeout=limit)
        except subprocess.TimeoutExpired:
            if apple:
                return {"text": f"timed out after {limit}s: AppleScript to an app hangs when macOS is waiting for Automation "
                                "permission. Do it on the screen with computer instead; do not retry AppleScript for this app."}
            return {"text": f"timed out after {limit}s; rerun with background=true for long commands"}
        out, _, where = cp.stdout.rpartition(mark)
        if where.strip() and Path(where.strip()).is_dir():
            self.cwd = where.strip()  # cd persists between commands, like a terminal
            self._save()
        else:
            out = cp.stdout
        return {"text": _clip(f"exit {cp.returncode} (cwd {self.cwd})\n{out}\n{('stderr:\n' + cp.stderr) if cp.stderr else ''}")}

    def job(self, a):
        j = self.jobs.get(str(a["job_id"]))
        if not j:
            return {"text": "no such job"}
        pid = int(j["pid"])
        alive = lambda: (_proc_start(pid) == j["started"]) if j.get("started") else _pid_exists(pid)
        if a.get("action") == "stop" and alive():
            try:
                os.killpg(pid, signal.SIGTERM)  # the job's own session: the command and everything it started
                for _ in range(30):
                    try:
                        os.waitpid(pid, os.WNOHANG)
                    except ChildProcessError:
                        pass
                    if not alive():
                        break
                    time.sleep(0.1)
                else:
                    os.killpg(pid, signal.SIGKILL)
            except (ProcessLookupError, PermissionError):
                pass
            j["stopped"] = time.time()
            self._save()
        text = Path(j["log"]).read_text(errors="replace")
        errs = Path(j["err"]).read_text(errors="replace").strip() if j.get("err") and Path(j["err"]).is_file() else ""
        code = re.search(JOB_EXIT + r"(\d+)", text)
        running = alive() and not code  # the exit line is the truth: a finished child can linger as a zombie of this worker
        if code:
            try:
                os.waitpid(pid, os.WNOHANG)
            except (ChildProcessError, OSError):
                pass
        head = ("running" if running else f"finished, exit {code.group(1)}" if code else
                "stopped by me before it finished" if j.get("stopped") else "finished, exit code unknown (it exited early)")
        body = text.replace(code.group(0), "") if code else text
        return {"text": _clip(head + "\n" + body + (f"\nstderr:\n{errs}" if errs else ""))}

    def web_search(self, a):
        got = _load("web_search", "web_search.py").run(str(a["query"]))
        return {"text": _clip(got.get("spoken") or json.dumps(got, default=str))}

    def fetch_url(self, a):
        url = str(a["url"])
        if not _load("web_search", "web_search.py").public_url(url):
            return {"text": "refused: only public http(s) pages"}
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 Jarvis"})
        raw = urllib.request.urlopen(req, timeout=20).read(2_000_000).decode("utf-8", "replace")
        text = re.sub(r"(?is)<(script|style).*?</\1>", " ", raw)
        text = html.unescape(re.sub(r"(?s)<[^>]+>", " ", text))
        return {"text": _clip(re.sub(r"\s+", " ", text).strip())}

    def screenshot(self, a):
        """The display his front window (or the named app, or display N) is on; pixels map to global mouse points."""
        shot = Path(tempfile.mkstemp(suffix=".png")[1])
        try:
            displays, windows = live_screens()
            d = pick_display(displays, windows, app=a.get("app"), index=a.get("display"))
            subprocess.run(["screencapture", "-x", "-D", str(d["n"]), str(shot)], check=True, timeout=10)
            subprocess.run(["sips", "-Z", str(d["w"]), "-s", "format", "jpeg", str(shot), "--out", str(shot) + ".jpg"],
                           capture_output=True, timeout=20)
            data = base64.b64encode(Path(str(shot) + ".jpg").read_bytes()).decode()
            others = "; ".join(f"display {o['n']} at ({o['x']},{o['y']}) {o['w']}x{o['h']}" for o in displays if o["n"] != d["n"])
            front = next((o for o, _ in windows if o not in IGNORE_WINDOWS), "")
            return {"text": (f"screenshot of display {d['n']} of {len(displays)} ({d['w']}x{d['h']} points); front app: {front}. "
                             f"Image pixel (px,py) = mouse point ({d['x']}+px, {d['y']}+py). "
                             + (f"Other displays: {others}. Pass display=N or app=Name to look there." if others else "")),
                    "image": "data:image/jpeg;base64," + data}
        except (subprocess.SubprocessError, OSError, ValueError) as exc:
            return {"text": f"screenshot failed: {exc}. Screen Recording permission may be missing for Jarvis."}
        finally:
            for f in (shot, Path(str(shot) + ".jpg")):
                try:
                    f.unlink()
                except OSError:
                    pass

    def _display(self, a) -> dict:
        displays, windows = live_screens()
        if a.get("display") or a.get("app"):
            d = pick_display(displays, windows, app=a.get("app"), index=a.get("display"))
        else:
            last = self.state.get("display_n")
            d = next((x for x in displays if x["n"] == last), None) or pick_display(displays, windows)
        self.state["display_n"] = d["n"]
        self._save()
        return d, displays, windows

    def _shot(self, d: dict, displays: list, windows: list, lead: str = "") -> dict:
        shot = Path(tempfile.mkstemp(suffix=".png")[1])
        try:
            subprocess.run(["screencapture", "-x", "-D", str(d["n"]), str(shot)], check=True, timeout=10)
            w = int(d["w"] * CU.image_scale(d))
            subprocess.run(["sips", "-Z", str(w), "-s", "format", "jpeg", str(shot), "--out", str(shot) + ".jpg"],
                           capture_output=True, timeout=20)
            data = base64.b64encode(Path(str(shot) + ".jpg").read_bytes()).decode()
        except (subprocess.SubprocessError, OSError) as exc:
            return {"text": f"{lead}screenshot failed: {exc}. Screen Recording permission may be missing for Jarvis."}
        finally:
            for f in (shot, Path(str(shot) + ".jpg")):
                try:
                    f.unlink()
                except OSError:
                    pass
        others = "; ".join(f"display {o['n']}" for o in displays if o["n"] != d["n"])
        front = next((o for o, _ in windows if o not in IGNORE_WINDOWS), "")
        return {"text": (f"{lead}Screenshot of display {d['n']} of {len(displays)}, front app {front}. Coordinates are "
                         f"pixels of this image." + (f" Also: {others} (pass display=N or app=Name)." if others else "")),
                "image": "data:image/jpeg;base64," + data}

    def computer(self, a):
        action = str(a.get("action") or "screenshot")
        if action not in CU.ACTIONS:
            return {"text": f"unknown action {action}; use one of {', '.join(CU.ACTIONS)}"}
        d, displays, windows = self._display(a)
        if action == "wait":
            time.sleep(min(10, max(1, int(a.get("duration") or 2))))
            return self._shot(d, displays, windows, "Waited. ")
        if action == "cursor_position":
            g = _jxa('ObjC.import("AppKit");var p=$.NSEvent.mouseLocation;p.x+","+p.y').split(",")
            try:
                gx, gy = float(g[0]), displays[0]["h"] - float(g[1])
                return {"text": "cursor at pixel " + str(list(CU.to_image(d, gx, gy))) + f" of display {d['n']}"}
            except (ValueError, IndexError):
                return {"text": "cursor position unknown"}
        if action == "screenshot":
            return self._shot(d, displays, windows)
        try:
            req = CU.hands_request(action, a, d)
        except (KeyError, TypeError, IndexError):
            return {"text": f"{action} needs coordinate [x, y] (and start_coordinate for a drag)"}
        if req and "x" in req:
            self._show_cursor(req["x"], req["y"])  # the blue Jarvis cursor glides to the spot first
        if req and req.get("op") == "scroll" and "x" in req:
            self._hands({"op": "move", "x": req.pop("x"), "y": req.pop("y")})
        got = self._hands(req) if req else {"text": "ok"}
        if "not installed" in got.get("text", "") or '"trusted": false' in got.get("text", "").replace(" ", " "):
            return got
        CU.settle(action)
        return self._shot(d, displays, windows, f"Did {action}. ")

    def delegate(self, a):
        goals = [str(g)[:2000] for g in (a.get("goals") or []) if str(g).strip()][:4]
        if not goals:
            return {"text": "delegate needs goals"}
        hive = Path(self.root).parent.parent
        kids = []
        for g in goals:
            t = Task.create(hive, g, child=True)
            t.write("state.json", {**t.read("state.json"), "helper": True, "may_write": bool(a.get("write")),
                                   "parent": Path(self.root).name})
            log = open(t.path / "worker.log", "w")
            subprocess.Popen([sys.executable, str(Path(__file__).resolve()), "run", str(t.path)], stdout=log,
                             stderr=subprocess.STDOUT, start_new_session=True, cwd=str(Path.home()))
            kids.append(t)
        end = time.monotonic() + min(1200, int(a.get("wait_s") or 600))
        while time.monotonic() < end and any(k.read("state.json").get("status") in ("QUEUED", "RUNNING") for k in kids):
            time.sleep(2)
        out = []
        for g, k in zip(goals, kids):
            st = k.read("state.json")
            out.append(f"Helper '{g[:80]}': {st.get('status')} — {st.get('summary') or st.get('question') or 'no answer yet'}"
                       + (f" Evidence: {st.get('evidence')}" if st.get("evidence") else ""))
        return {"text": _clip("\n\n".join(out))}

    def app(self, a):
        name = str(a.get("app") or "").strip()
        act = str(a.get("action") or "read")
        if not name:
            return {"text": "app needs app=Name"}
        if act == "read":
            got = self._hands_json({"op": "ax_tree", "app": name, "max": 400, "menus": bool(a.get("menus"))})
            if not got.get("ok"):
                return {"text": f"could not read {name}: {got.get('why') or got.get('text')}"}
            els = got.get("elements") or []
            self.state.setdefault("ax_refs", {})[name.lower()] = [e["path"] for e in els]
            self.state.setdefault("ax_keys", {})[name.lower()] = [[e.get("role"), e.get("label")] for e in els]
            self.state.setdefault("ax_read_at", {})[name.lower()] = time.time()
            self._save()
            owner = _ax_owners(els)  # live 10-17: two "Close tab" buttons, one was his document's; name whose each is
            lines = [f"{i + 1} {e['role'].replace('AX', '')} {e['label']!r}" + (f" in {owner[i]!r}" if owner.get(i) else "")
                     + (f" = {e['value']!r}" if e.get("value") else "")
                     + ("" if e.get("enabled", True) else " [disabled]") + (f" ({', '.join(x.replace('AX', '') for x in e['actions'])})" if e.get("actions") else "")
                     for i, e in enumerate(els)]
            return {"text": _clip(f"{name}: {len(els)} elements (use ref=N)\n" + "\n".join(lines))}
        refs = (self.state.get("ax_refs") or {}).get(name.lower()) or []
        n = int(a.get("ref") or 0)
        if not 1 <= n <= len(refs):
            return {"text": f"no element {n} in {name}; read the app first"}
        if time.time() - float((self.state.get("ax_read_at") or {}).get(name.lower()) or 0) > AX_FRESH_S:
            # matrix "observations": a read older than AX_FRESH_S may point at a moved or replaced element. Re-read and
            # find the same element (role + label) before acting; never act on a stale address.
            old = ((self.state.get("ax_keys") or {}).get(name.lower()) or [])
            want = old[n - 1] if n - 1 < len(old) else None
            self.app({"action": "read", "app": name, "menus": False})
            keys = (self.state.get("ax_keys") or {}).get(name.lower()) or []
            refs = (self.state.get("ax_refs") or {}).get(name.lower()) or []
            if want is not None and want not in keys:
                return {"text": f"{name} changed since you read it; element {n} is gone. Read the app again and pick again."}
            if want is not None:
                n = keys.index(want) + 1
            elif not 1 <= n <= len(refs):  # a read saved before labels were recorded: same number, fresh address
                return {"text": f"no element {n} in {name} any more; read the app again"}
        req = {"op": "ax_set", "app": name, "path": refs[n - 1], "attr": "AXSelected", "bool": True} if act == "select" else \
            {"op": "ax_set", "app": name, "path": refs[n - 1], "value": str(a.get("text") or "")} if act == "set" else \
            {"op": "ax_act", "app": name, "path": refs[n - 1], "action": str(a.get("ax") or "AXPress")}
        got = self._hands_json(req)
        fr = got.get("frame") or []
        if len(fr) == 4 and fr[2] > 0:
            self._show_cursor(fr[0] + fr[2] / 2, fr[1] + fr[3] / 2)  # his own blue overlay cursor, not his pointer
        if not got.get("ok") and act == "press" and "25206" in str(got.get("why")):
            # live 10-17 (cua-driver source, double_click.rs): Finder items and openable rows refuse AXPress and want AXOpen
            got = self._hands_json({**req, "action": "AXOpen"}); act = "open"
        if not got.get("ok"):
            return {"text": f"{act} on {n} failed: {got.get('why')}. Read the app again, or use computer."}
        before = list((self.state.get("ax_keys") or {}).get(name.lower()) or [])
        time.sleep(0.6)
        after = self.app({"action": "read", "app": name})
        same = act in ("press", "open") and before and before == list((self.state.get("ax_keys") or {}).get(name.lower()) or [])
        # live 10-17: "Did press" on a Preview tab's close button in a Stage Manager-parked window; nothing happened
        check = (" CHECK: nothing in the app changed after that, so it may not have taken (a window parked in Stage "
                 "Manager often ignores presses). Verify before saying it is done, or try another way.") if same else ""
        return {"text": f"Did {act} on {n}." + (f" The field now shows {got.get('value')!r}." if act == "set" else "") + check + "\n" + after["text"]}

    def _hands_json(self, req: dict) -> dict:
        got = self._hands(req)
        try:
            return json.loads(got.get("raw") or got.get("text") or "{}")
        except (ValueError, TypeError):
            return {"ok": False, "why": got.get("text")}

    def methods(self, a):
        rows = HX.find_methods(str(a.get("query") or ""))
        if not rows:
            return {"text": "no matching methods in his catalog"}
        return {"text": _clip("\n\n".join(
            f"{m.get('name')} [{m.get('family')}, Jarvis: {m.get('jarvis_status')}]: {m.get('summary')}\n"
            + ("Steps: " + " → ".join(m.get("steps") or []) + "\n" if m.get("steps") else "")
            + f"Sources: {', '.join((m.get('sources') or [])[:5])}" for m in rows))}

    def plan(self, a):
        steps = [{"step": str(x.get("step") or "")[:200], "status": str(x.get("status") or "todo"),
                  **({"after": int(x["after"])} if str(x.get("after") or "").isdigit() else {})}
                 for x in (a.get("steps") or []) if isinstance(x, dict) and x.get("step")][:30]
        task = Task(self.root)
        task.write("state.json", {**task.read("state.json"), "plan": steps})
        mark = {"todo": "[ ]", "doing": "[>]", "done": "[x]", "dropped": "[-]"}
        warn = []  # canvas "graph": a step that waits on another (after=N) cannot run before N is done
        for i, x in enumerate(steps, 1):
            n = x.get("after")
            if n is None:
                continue
            if not 1 <= n <= len(steps) or n == i:
                warn.append(f"step {i} waits on step {n}, which is not another step in this plan")
            elif x["status"] in ("doing", "done") and steps[n - 1]["status"] not in ("done", "dropped"):
                warn.append(f"step {i} is {x['status']} but it waits on step {n} ({steps[n - 1]['step']}), which is not done")
        return {"text": "Plan:\n" + "\n".join(f"{mark.get(x['status'], '[ ]')} {i}. {x['step']}" + (f" (after {x['after']})" if x.get("after") else "")
                                        for i, x in enumerate(steps, 1))
                        + ("\nCHECK: " + "; ".join(warn) + "." if warn else "")}

    def signal(self, a):
        script = Path(__file__).with_name("signals.py")
        act = str(a.get("action") or "status")
        if act == "ingest":
            if not str(a.get("url") or "").strip():
                return {"text": "ingest needs url"}
            cmd = f"{sys.executable} {shlex.quote(str(script))} ingest {shlex.quote(str(a['url']).strip())}" + (" --force" if a.get("again") else "") \
                + (f" --lens {a['lens']}" if a.get("lens") in ("learn", "studio") else "")
        elif act == "add":  # rule §15: a repo, post or tool found along the way joins the shared signals list
            url = str(a.get("url") or "").strip()
            if not url:
                return {"text": "add needs url"}
            L = _load("agent_stack_signal_ledger", "signal_ledger.py"); S = _load("agent_stack_signals_for_add", "signals.py")
            try:
                row = L.shared(S.worktree(), lambda rows: dict(L.add(rows, url, title=str(a.get("why") or "")[:120], source=str(a.get("source") or ""))),
                               f"signals list: jarvis added {url[:80]}")
                return {"text": f"on the list: {row.get('id')} ({row.get('status')})"}
            except Exception as exc:  # noqa: BLE001
                return {"text": f"could not add to the shared list: {exc}"}
        elif act == "scan":
            n = int(a.get("ingest") or 0)
            cmd = f"{sys.executable} {shlex.quote(str(script))} scan {shlex.quote(str(a.get('source') or 'all'))}" + (f" --ingest {n}" if n else "")
        else:
            act = "watchlater" if act == "watch_later" else act
            cp = subprocess.run([sys.executable, str(script), act], capture_output=True, text=True, timeout=900)
            return {"text": _clip((cp.stdout or cp.stderr or "").strip())}
        return self.shell({"command": cmd, "background": True})

    def safari(self, a):
        got = SD.SafariDOM(self.state, self._hands, self._show_cursor).act(a)
        self._save()  # the working tab and the tabs Jarvis opened survive between steps
        return got

    def scroll_video(self, a):
        try:
            got = SV.make(str(a.get("src") or ""), str(a.get("out_dir") or ""), seconds=float(a.get("seconds") or 30),
                          start=float(a.get("start") or 0))
        except (ValueError, OSError, subprocess.SubprocessError) as exc:
            return {"text": f"scroll video: {exc}"}
        return {"text": ("made" if got["ok"] else "made, but the check failed") + f": {got['page']} with {got['clip']} "
                        f"({got['height']}p, {got['seconds']} s, {got['keyframes']}/{got['frames']} keyframes, {got['bytes']} bytes)"}

    def cost_report(self, a):
        tasks = self.dir.parent if self.dir.parent.name == "operator-tasks" else STACK.parents[1] / "docs/hive/outer-heaven/.hive/operator-tasks"
        page = CBF.report(tasks, days=int(a.get("days") or 7))
        try:
            COST_PAGE.parent.mkdir(parents=True, exist_ok=True)
            COST_PAGE.write_text(page)
            where = f"\n(saved to {COST_PAGE})"
        except OSError as exc:
            where = f"\n(could not save the page: {exc})"
        return {"text": _clip(page + where)}

    def readiness(self, a):
        got = RDY.report()
        return {"text": f"{got['state']}: {got['spoken']}\n" + "\n".join(f"- {k}: {v['state']} — {v['line']}" for k, v in got["rows"].items())}

    def deliver(self, a):
        try:
            got = DLV.bundle(str(a.get("title") or ""), a.get("files") or [], str(a.get("note") or ""))
        except (ValueError, OSError) as exc:
            return {"text": f"deliver: {exc}"}
        return {"text": ("Delivered, every file checked: " if got["ok"] else "Delivered, but a check failed: ") + got["folder"]
                        + "\n" + "\n".join(f"- {r['file']}: {r['check']}" for r in got["files"])}

    def tool_catalog(self, a):
        if a.get("action") == "refresh":
            at = _load("agent_tools", "agent_tools.py")
            names = [x["name"] for x in _load("mcp_inventory", "mcp_inventory.py").inventory()[0]]
            TCAT.refresh(names, lambda n: at.op_mcp_list(n, TCAT.PER_SERVER_S))
        return {"text": TCAT.search(str(a.get("query") or ""))}

    def recall(self, a):
        try:
            got = PR.recall(str(a.get("pattern") or ""), [CHAT_CORPUS], since=str(a.get("since") or ""),
                            platform=str(a.get("platform") or ""))
        except ValueError as exc:
            return {"text": f"recall: {exc}"}
        return {"text": PR.say(got, str(a.get("pattern")))}

    def web_helper(self, a):
        act = str(a.get("action") or "list")
        try:
            if act == "save":
                h = WH.save(WEB_HELPERS, str(a.get("name") or ""), a.get("steps"), str(a.get("expect") or ""), str(a.get("about") or ""))
                return {"text": f"saved helper {h['name']} v{h['version']} ({h['status']}); run it once to prove it"}
            if act == "run":
                def gate(step):
                    decision, why = _authority().authorize("safari", step)
                    return why if decision != "allow" else self.preflight("safari", step)
                return {"text": WH.run(WEB_HELPERS, str(a.get("name") or ""), a.get("vars") or {}, self.safari, gate)["text"]}
            return {"text": WH.listing(WEB_HELPERS)}
        except (ValueError, OSError) as exc:
            return {"text": f"web helper: {exc}"}

    def preflight(self, name: str, args: dict) -> str:
        """A kept stop the generic authority cannot see from the arguments alone (the label of a page button)."""
        if name == "safari":
            return SD.SafariDOM(self.state, self._hands, self._show_cursor).stop_reason(args)
        return ""

    def browser(self, a):
        if self.web is None:
            self.web = BS.BrowserSession()
        try:
            return self.web.call(str(a.get("tool") or "browser_snapshot"), a.get("args") or {})
        except Exception as exc:  # noqa: BLE001 - every failure is data for the model
            return {"text": f"browser error: {type(exc).__name__}: {exc}"}

    def browser_open(self) -> bool:
        return self.web is not None and self.web.proc is not None and self.web.proc.poll() is None

    def close(self) -> None:
        if self.web is not None:
            self.web.close()

    def _hands(self, req):
        if not (HANDS_APP / "Contents" / "MacOS" / "jarvis_hands").exists():
            return {"text": "mouse/keyboard helper is not installed (face/overlay/build_hands_app.sh)"}
        fd, res = tempfile.mkstemp(suffix=".json")
        os.close(fd)
        os.unlink(res)
        subprocess.run(["open", "-g", "-n", "-a", str(HANDS_APP), "--args", "--do", json.dumps(req), "--out", res],
                       capture_output=True, timeout=15)
        end = time.time() + 10
        while time.time() < end:
            if os.path.exists(res) and os.path.getsize(res) > 0:
                time.sleep(0.05)
                got = json.loads(Path(res).read_text())
                os.unlink(res)
                return {"text": json.dumps(got)}
            time.sleep(0.05)
        return {"text": "mouse/keyboard helper gave no answer"}

    def _show_cursor(self, x, y) -> None:
        """Evens 10-16: "still no floating cursor". Jarvis's blue cursor glides to the target before the action lands
        (the same overlay the Watch clicks use). Best effort: a missing overlay never blocks the action.
        Evens 10-17: "so jarvis's cursor is off" — the cua-driver cursor (Jarvis Blue theme) is the one cursor now."""
        if not OWN_CURSOR:
            return
        try:
            spec = importlib.util.spec_from_file_location("agent_stack_pointer_operator", Path(__file__).with_name("pointer.py"))
            ph = importlib.util.module_from_spec(spec); spec.loader.exec_module(ph)
            if not ph.live():
                return
            try:
                frm = tuple(ph.cursor_display()["cursor"])
            except Exception:  # noqa: BLE001
                frm = (x, y)
            if ph.cursor_start(frm, (float(x), float(y)), 3):
                time.sleep(ph.GLIDE_SEC)
        except Exception:  # noqa: BLE001
            return

    def mouse(self, a):
        act = str(a.get("action") or "click")
        if act in ("move", "click", "double_click", "right_click", "drag") and "x" in a and "y" in a:
            self._show_cursor(a["x"], a["y"])
        if act == "move":
            return self._hands({"op": "move", "x": a["x"], "y": a["y"]})
        if act in ("click", "double_click", "right_click"):
            return self._hands({"op": "click", "x": a["x"], "y": a["y"], "count": 2 if act == "double_click" else 1,
                                "button": "right" if act == "right_click" else "left"})
        if act == "drag":
            return self._hands({"op": "drag", "x": a["x"], "y": a["y"], "x2": a["x2"], "y2": a["y2"]})
        if act == "scroll":
            return self._hands({"op": "scroll", "dy": a.get("dy", -5)})
        return {"text": f"unknown mouse action {act}"}

    def keyboard(self, a):
        if a.get("keys"):
            return self._hands({"op": "key", "keys": str(a["keys"])})
        return self._hands({"op": "type", "text": str(a.get("text") or "")})

    def app_type(self, a):
        """Evens 10-17 "make it cost 0.01 or less": the whole background-typing recipe in code, no model steps.
        Live recipe: launch_app (focus suppressed) -> list_windows -> get_window_state AXTextArea token (same session)
        -> type_text (accessibility route, read back) -> AppleScript save -> read the file."""
        f = Path(os.path.expanduser(str(a["file"]))).resolve()
        bundle = str(a.get("app") or "com.apple.TextEdit")
        if not f.parent.is_dir():
            return {"text": f"no such folder: {f.parent}"}
        f.touch(exist_ok=True)

        def cua(tool, args):
            cp = subprocess.run([str(CUA_DRIVER), "call", tool, json.dumps({**args, "session": "jarvis"})],
                                capture_output=True, text=True, timeout=60)
            try:
                return json.loads(cp.stdout)
            except ValueError:
                return {"error": (cp.stdout + cp.stderr)[-300:]}

        _cua_cursor("jarvis")
        app = cua("launch_app", {"bundle_id": bundle, "urls": [f.as_uri()]})
        pid = app.get("pid")
        if not isinstance(pid, int) or pid <= 0:
            # live 10-17 (REA #1, the driver's own answer): with the app already running, launch_app returns pid -1 and
            # window_ready false. The running process is in list_apps.
            apps = cua("list_apps", {})
            pid = next((x.get("pid") for x in (apps.get("apps", []) if isinstance(apps, dict) else [])
                        if x.get("bundle_id") == bundle and x.get("running") and int(x.get("pid") or 0) > 0), None)
        if not pid:
            return {"text": f"could not open {f.name} in {bundle}: {str(app)[:200]}"}
        wid, end = None, time.time() + APP_WINDOW_WAIT_S
        while wid is None:
            # live 10-17 hand proof: the window appears a moment after launch returns; one look missed it
            wins = cua("list_windows", {"pid": pid})
            wins = [w for w in (wins.get("windows", []) if isinstance(wins, dict) else []) if f.name in str(w.get("title", ""))]
            wins.sort(key=lambda w: not w.get("is_on_screen"))  # the same file opened twice: the visible copy first
            wid = wins[0].get("window_id") if wins else None
            if wid is None and time.time() > end:
                break
            if wid is None:
                time.sleep(0.4)
        if wid is None:
            return {"text": f"opened {f.name} but found no window for it"}
        state = cua("get_window_state", {"pid": pid, "window_id": wid, "include_screenshot": False, "query": "AXTextArea"})
        tok = next((e.get("element_token") for e in state.get("elements", []) if e.get("role") == "AXTextArea"), None)
        if not tok:
            return {"text": "no text area in that window"}
        typed = cua("type_text", {"pid": pid, "window_id": wid, "element_token": tok, "text": str(a["text"])})
        if typed.get("effect") != "confirmed":
            return {"text": f"typing not confirmed: {str(typed)[:200]}"}
        if a.get("save", True):
            name = (app.get("name") or "TextEdit").replace('"', "")
            subprocess.run(["osascript", "-e", f'tell application "{name}" to save document "{f.name}"'],
                           capture_output=True, text=True, timeout=30)
        on_disk = f.read_text(errors="replace")
        ok = str(a["text"]) in on_disk
        return {"text": f"typed {len(str(a['text']))} chars into {f.name} in the background (confirmed by read-back); "
                        f"{'saved, file on disk contains it' if ok else 'NOT on disk yet'}; front app untouched"}

    def vault_graph(self, a):
        got = _load("vault_graph", "vault_graph.py").answer(str(a.get("op") or ""), str(a.get("name") or ""))
        if got.get("ok") and str(a.get("op")) == "focus" and self.dir.parent.name == "operator-tasks":
            t = Task(self.dir)  # Z70: the Orb lights this note (orb_view carries it)
            t.write("state.json", {**t.read("state.json"), "graph_focus": {"note": got["note"], "at": time.time()}})
        return {"text": _clip(got["text"] + (f"\n\n{got['map']}" if got.get("map") else ""))}

    def repo_map(self, a):
        return {"text": _clip(_load("repo_map", "repo_map.py").answer(str(a.get("path") or self.cwd), str(a.get("focus") or ""))["text"])}

    def remember(self, a):
        mem = _load("remember_hand", "remember.py")
        op = str(a.get("op") or "recall")
        if op == "recall":
            got = mem.run({"op": "recall", "text": str(a.get("text") or "")})
        else:
            # his words decide what is stored or forgotten, never the model's paraphrase (Oct 14 rule)
            msgs = Task(self.dir).read("messages.json", []) if (self.dir / "messages.json").exists() else []
            got = mem.run({"op": op, "text": str(a.get("text") or "")}, utterance=_his_line(_his_last_words(msgs)))
        return {"text": str(got.get("spoken") or got)}

    def focus(self, a):
        pipe = _load_brain("pipeline")
        hive = STACK.parents[1] / "docs/hive/outer-heaven/.hive"
        got = pipe.focus_stand_down(hive) if str(a.get("op")) == "stop" else pipe.focus_arm(hive, int(a.get("minutes") or 0) or None)
        return {"text": str(got.get("spoken") or got.get("summary") or got)}

    def schedule(self, a):
        got = _load("loop_hand", "loop.py").run({k: v for k, v in a.items() if v not in (None, "")})
        return {"text": str(got.get("spoken") or got)}

    def loop(self, a):
        """Evens 10-16/17 'looping capabilities': the kit at ~/.feature-loop/kit, with its rules enforced here too."""
        kit = LOOP_KIT
        if not (kit / "scripts/round.py").is_file():
            return {"text": f"the loop kit is not installed at {kit}"}
        if os.environ.get("JARVIS_ONE_MIND", "0") != "1":
            return {"text": "loops are off for me (JARVIS_ONE_MIND is not 1). Ask Evens to turn them on, or run the kit yourself in shell."}
        repo = Path(os.path.expanduser(str(a.get("repo") or ""))).resolve()
        live = Path.home() / "jarvis-main"
        if not repo.is_dir() or repo == live or live in repo.parents:
            return {"text": "refused: a loop runs in its own worktree on a loop/* branch, never in the live checkout (~/jarvis-main)."}
        act, feat = str(a.get("action")), re.sub(r"[^a-z0-9-]", "", str(a.get("feature") or "").lower())
        if act != "stats" and not feat:
            return {"text": "feature name needed (letters, digits, dashes)"}
        if act == "init":
            cmd = f"bash {shlex.quote(str(kit / 'scripts/init.sh'))} {shlex.quote(str(repo))} {feat}"
        elif act == "show":
            cmd = f"{sys.executable} {shlex.quote(str(kit / 'scripts/lock_checks.py'))} show {feat} --root {shlex.quote(str(repo))}"
        elif act == "lock":
            words = str(a.get("approval") or "").strip()
            if len(words) < 3:
                return {"text": "refused: lock needs Evens's approval words, verbatim (ask him with ask_owner first)."}
            cmd = (f"{sys.executable} {shlex.quote(str(kit / 'scripts/lock_checks.py'))} lock {feat} --root {shlex.quote(str(repo))} "
                   f"--approved-by Evens --approval {shlex.quote(words)}")
        elif act == "round":
            builder = str(a.get("builder") or "").strip()
            if not builder:
                return {"text": "round needs a builder command (a fresh agent per round)."}
            cmd = (f"{sys.executable} {shlex.quote(str(kit / 'scripts/round.py'))} {feat} --root {shlex.quote(str(repo))} "
                   f"--builder {shlex.quote(builder)}" + (f" --max {int(a['max_rounds'])}" if a.get("max_rounds") else ""))
            return self.shell({"command": cmd, "background": True})
        else:
            cmd = f"bash {shlex.quote(str(kit / 'scripts/stats.sh'))}"
        cp = subprocess.run(["/bin/zsh", "-lc", cmd], capture_output=True, text=True, timeout=600, cwd=str(repo))
        return {"text": _clip(f"exit {cp.returncode}\n{cp.stdout}\n{cp.stderr}")}

    def config(self, a):
        key, action = str(a.get("key") or ""), str(a.get("action") or "get")
        if action == "history":
            rows = CONFIG_LOG.read_text().splitlines()[-20:] if CONFIG_LOG.exists() else []
            return {"text": "\n".join(rows) or "no changes yet"}
        if key not in CONFIG_KEYS:
            return {"text": f"not a setting you can change: {key or '(none)'}; settings are {', '.join(CONFIG_KEYS)}"}
        fname, pat = CONFIG_KEYS[key]
        if key == "model":
            bm = _load("brain_model", "brain_model.py")
            if action == "get":
                return {"text": f"model: {bm.current() or 'default (' + bm.default_model() + ')'}"}
            got = bm.set_model(str(a.get("value") or ""), by="jarvis", reason=str(a.get("why") or ""))
            self._log_config(key, "", str(a.get("value") or ""), str(a.get("why") or ""))
            return {"text": str(got.get("spoken") or got)}
        f = CONFIG_DIR / fname
        old = f.read_text().strip() if f.exists() else ""
        if action == "get":
            return {"text": f"{key}: {old or '(default)'}"}
        val = str(a.get("value") or "").strip()
        if not re.fullmatch(pat, val):
            return {"text": f"refused: {val!r} is not a valid {key}"}
        if key == "personality" and not (PERSONALITIES / f"{val}.md").is_file():
            return {"text": f"refused: no personality file named {val}; available: " + ", ".join(sorted(p.stem for p in PERSONALITIES.glob("*.md") if p.stem != "README"))}
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        f.write_text(val + "\n")
        self._log_config(key, old, val, str(a.get("why") or ""))
        return {"text": f"{key}: {old or '(default)'} -> {val}. Takes effect on the next turn (voice: next spoken line). Logged; say 'undo' to restore {old or 'the default'}."}

    def _log_config(self, key: str, old: str, new: str, why: str) -> None:
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        with CONFIG_LOG.open("a") as fh:
            fh.write(json.dumps({"at": time.strftime("%Y-%m-%d %H:%M"), "key": key, "old": old, "new": new, "why": why[:200],
                                 "by": "jarvis", "task": self.dir.name}) + "\n")
        Task(self.root).trace({"event": "config", "key": key, "old": old, "new": new, "why": why[:200]})

    def artifact(self, a):
        """Evens 10-16: interactive artifacts that update as we build. One folder per artifact, newest file is the page,
        history/ keeps every earlier version, INDEX.md lists them all for any agent or Obsidian."""
        src = Path(os.path.expanduser(str(a.get("file") or ""))) if a.get("file") else None
        if src is not None and not src.is_file():
            return {"text": f"no such file: {src}"}
        if src is None and a.get("content") is None:
            return {"text": "artifact needs content (a page) or file (anything you made)"}
        kind = (src.suffix[1:].lower() if src is not None else str(a.get("kind") or "html").lower()) or "bin"
        slug = re.sub(r"[^a-z0-9]+", "-", str(a["name"]).lower()).strip("-")[:60] or "artifact"
        root = ARTIFACTS / re.sub(r"[^A-Za-z0-9 _-]+", "", str(a.get("project") or "Jarvis")).strip() / slug
        page = root / f"{slug}.{kind}"
        first = not page.exists()
        if not first:
            (root / "history").mkdir(exist_ok=True)
            page.rename(root / "history" / f"{time.strftime('%Y%m%d-%H%M%S')}.{kind}")
        root.mkdir(parents=True, exist_ok=True)
        if src is not None:
            import shutil
            shutil.copy2(src, page)
            body = None
        else:
            body = str(a["content"])
        if body is not None:
            if kind == "html" and ("class=\"mermaid\"" in body or "```mermaid" in body) and "mermaid.min.js" not in body:
                body = re.sub(r"```mermaid\n(.*?)```", r'<pre class="mermaid">\1</pre>', body, flags=re.S) + MERMAID_TAG
            page.write_text(body)
        index = ARTIFACTS / "INDEX.md"
        line = f"- [{a['name']}]({page.relative_to(ARTIFACTS)}) — {kind}, updated {time.strftime('%Y-%m-%d %H:%M')}"
        lines = [l for l in (index.read_text().splitlines() if index.exists() else ["# Jarvis artifacts", ""])
                 if not l.startswith(f"- [{a['name']}](")]
        index.write_text("\n".join(lines + [line]) + "\n")
        if a.get("refresh"):
            (root / "refresh.json").write_text(json.dumps({"command": str(a["refresh"]), "set": time.strftime("%Y-%m-%d %H:%M")}))
        if first or a.get("open"):
            subprocess.run(["open", str(page)], capture_output=True, timeout=20)
        n = len(list((root / "history").glob("*"))) if (root / "history").exists() else 0
        return {"text": f"{'published' if first else 'updated'} {page} ({n} earlier versions kept){' and opened it' if first or a.get('open') else ''}"}

    def open(self, a):
        t = str(a["target"])
        looks_path = t.startswith(("/", "~", ".")) or bool(re.match(r"^[a-z][a-z0-9+.-]*:", t))  # paths, URLs, spotify: URIs
        argv = ["open", os.path.expanduser(t)] if looks_path else ["open", "-a", t]
        if looks_path and str(a.get("with") or "").strip():  # macread: "open it in Preview" when PdfCraft owns .pdf
            argv = ["open", "-a", str(a["with"]).strip(), os.path.expanduser(t)]
        cp = subprocess.run(argv, capture_output=True, text=True, timeout=20)
        return {"text": f"exit {cp.returncode} {cp.stderr.strip()}".strip()}

    def say(self, a):
        line = str(a.get("text") or "").strip()
        if line:
            Task(self.root).speak(line)
        return {"text": "said"}

    def mcp(self, a, approved=False):
        steps = a.get("steps") or [{"tool": a.get("tool"), "arguments": a.get("arguments") or {}}]
        gaps = [f"{st.get('tool')} needs {', '.join(m)}" for st in steps if isinstance(st, dict)
                for m in [TCAT.missing_args(str(a.get("server") or ""), str(st.get("tool") or ""), st.get("arguments") or {})] if m]
        if gaps:  # mcpschemas: the server's own schema, checked before the call (not a server-side error mid-session)
            return {"text": "Not run: " + "; ".join(gaps) + ". Call it again with that filled in."}
        if str(a.get("server")) == "cua-driver" and CUA_DRIVER.is_file():
            # live 10-17 hand proof: every MCP call opened a fresh connection, and cua-driver ties a named session to one
            # connection, so "session is not available to this transport" on every second call. Its own `call` goes
            # through the persistent daemon where Jarvis's session lives. The same write gate applies first.
            at = _load("agent_tools", "agent_tools.py")
            tool, args = str(a.get("tool") or ""), dict(a.get("arguments") or {})
            if not at.NAME_OK.match(tool):
                return {"text": "cua-driver needs a tool name"}
            writing = bool(at.WRITE_TOOL.search(tool) or not at.READ_TOOL.match(tool))
            if writing and approved is not True and not (at._open_access() and not at.OPEN_MCP_HARD.search(tool)):
                return {"text": f"cua-driver.{tool} could change something; that needs Evens first. I didn't call it."}
            args.setdefault("session", "jarvis")
            _cua_cursor(args["session"])
            try:
                cp = subprocess.run([str(CUA_DRIVER), "call", tool, json.dumps(args)], capture_output=True, text=True, timeout=120)
            except (OSError, subprocess.SubprocessError) as exc:
                return {"text": f"cua-driver.{tool} failed: {exc}"}
            out = (cp.stdout or "").strip() or (cp.stderr or "").strip()
            return {"text": _clip((f"cua-driver.{tool} answered: " if cp.returncode == 0 else f"cua-driver.{tool} failed: ") + out)}
        if isinstance(a.get("steps"), list):  # one session for a stateful workflow (new -> edit -> save)
            got = _load("agent_tools", "agent_tools.py").op_mcp_steps(str(a["server"]), a["steps"], approved=approved)
            return {"text": _clip(str(got.get("spoken") or got))}
        got = _load("agent_tools", "agent_tools.py").op_mcp(str(a["server"]), str(a["tool"]), a.get("arguments") or {},
                                                            approved=approved)
        return {"text": _clip(got.get("spoken") or json.dumps(got, default=str))}


class Task:
    """Durable record of one operator task."""

    def __init__(self, path: Path):
        self.path = Path(path)

    @classmethod
    def create(cls, hive: Path, goal: str, turns: list | None = None, child: bool = False) -> "Task":
        tid = uuid.uuid4().hex
        d = Path(hive) / "operator-tasks" / tid
        d.mkdir(parents=True)
        t = cls(d)
        goal = _his_words(goal)
        t.write("request.json", {"task_id": tid, "goal": goal, "created": time.time()})
        history = []
        for row in (turns or [])[-6:]:  # the conversation continues: "another one", "it", "do that again"
            if str(row.get("user") or "").strip():
                history.append({"role": "user", "content": _his_words(str(row["user"]))[:1500]})
            if str(row.get("jarvis") or "").strip():
                history.append({"role": "assistant", "content": str(row["jarvis"])[:1500]})
        pick = choose_model(goal)
        t.write("messages.json", [{"role": "system", "content": system_prompt() + HX.recall_text(hive, goal)
                                   + jev_tool_hint(pick)}, *history, {"role": "user", "content": goal}])
        t.write("state.json", {"task_id": tid, "status": "QUEUED", "step": 0, "tier": pick["tier"], "model": pick["model"],
                               "kind": pick.get("kind", "any"), "chain": pick.get("chain") or [pick["model"]],
                               "model_why": pick["why"], "jev": pick.get("jev") or {}})
        if not child:  # a helper job never becomes the job his next line talks to
            (Path(hive) / "operator-tasks" / "latest.json").write_text(json.dumps({"task_id": tid}))
        return t

    def drain_inbox(self) -> list:
        """His lines that arrived while a step ran, oldest first; the inbox is emptied."""
        with FileLock(self.path / "messages.lock"):
            lines = [r.get("text", "") for r in self.rows("inbox.jsonl")]
            if lines:
                (self.path / "inbox.jsonl").write_text("")
        return [x for x in lines if str(x).strip()]

    def speak(self, line: str, filler: bool = False) -> None:
        """One spoken line, now. The Face streams these while the loop keeps working. A filler ("still on it") never
        stands in for the answer (live 10-17: the slow-tool line silenced the time he asked for)."""
        with (self.path / "speech.jsonl").open("a", encoding="utf-8") as fh:
            fh.write(json.dumps({"at": time.time(), "text": _mask_env_secrets(plain(line)), **({"filler": True} if filler else {})}) + "\n")

    def rows(self, name: str) -> list:
        out = []
        try:
            for line in (self.path / name).read_text(encoding="utf-8").splitlines():
                try:
                    out.append(json.loads(line))
                except ValueError:
                    pass
        except OSError:
            pass
        return out

    def read(self, name, default=None):
        f = self.path / name
        return json.loads(f.read_text()) if f.exists() else default

    def write(self, name, obj):
        tmp = self.path / (name + ".tmp")
        tmp.write_text(json.dumps(obj, default=str))
        tmp.replace(self.path / name)

    def trace(self, row):
        with open(self.path / "trace.jsonl", "a") as fh:
            fh.write(json.dumps({**row, "at": time.time()}, default=str) + "\n")

    def cancelled(self) -> bool:
        return bool((self.read("control.json", {}) or {}).get("cancel"))


SECRET_ENV_RE = re.compile(r"(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIAL|AUTH|COOKIE|SESSION)", re.I)


def _secret_values() -> list:
    """Values of secret-named environment variables (credential handles: tools use $NAME; the value never reaches the
    model, the trace or his ears). Longest first so a key that contains another is masked whole."""
    vals = {v for k, v in os.environ.items() if SECRET_ENV_RE.search(k) and isinstance(v, str) and len(v) >= 8}
    return sorted(vals, key=len, reverse=True)


def _mask_env_secrets(text: str) -> str:
    for v in _secret_values():
        if v in text:
            text = text.replace(v, "[REDACTED SECRET]")
    return text


def _his_words(text: str) -> str:
    """Canvas sig_z99: a key he pastes in chat never reaches the model, the job files or the logs."""
    masked = _scrub(text)
    if masked == text:
        return text
    return masked + ("\n(He pasted a secret; it was masked and you never saw it. Tell him plainly it is safer in his env "
                     "file under its name, e.g. OPENROUTER_API_KEY in ~/.config/brain/env, and never ask him to paste it.)")


def _scrub(text: str) -> str:
    text = _mask_env_secrets(str(text or ""))
    try:
        spec = importlib.util.spec_from_file_location("agent_stack_workspace_read_operator", Path(__file__).with_name("workspace_read.py"))
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
        return mod.scrub_text(text)
    except Exception:  # noqa: BLE001 - without the scrubber, keep nothing rather than raw keys
        return "[secret output withheld: the masking step failed]"


def _authority():
    return _load("authority", "authority.py")


# Per-job model choice (Evens 10-16: "use claude models only when necessary. make jev classify which model to use,
# like the methods in my signals": match-model-to-task, cheap-read-expensive-decide, per-prompt best-value router).
TIERS = ("cheap", "mid", "frontier")
KINDS = ("chat", "screen", "code", "research", "creative", "files")
# Best value first within each pool; every model here takes tools; screen pools take images. OpenRouter ids, live 10-16.
# Claude only where it is the strongest pick for the job (screen control, frontier code/design).
POOLS = {
    "cheap": {"any": ["deepseek/deepseek-v4-flash", "openai/gpt-6-luna", "google/gemini-2.5-flash-lite"],
              "screen": ["deepseek/deepseek-v4-flash", "anthropic/claude-haiku-5.5", "google/gemini-2.5-flash-lite"],  # Evens 10-17 "pick deepseek when needed": app reads are text
              "code": ["deepseek/deepseek-v4-flash", "openai/gpt-5.1-codex-mini", "openai/gpt-6-luna"]},
    "mid": {"any": ["deepseek/deepseek-v4-pro", "x-ai/grok-4.3", "google/gemini-3.6-flash"],
            "screen": ["anthropic/claude-sonnet-5.5", "openai/gpt-6.1-sol", "google/gemini-3.6-flash"],
            "code": ["openai/gpt-5.1-codex", "deepseek/deepseek-v4-pro", "moonshotai/kimi-k2.7-code"],
            "research": ["openai/gpt-6.1-sol", "google/gemini-3.6-flash", "x-ai/grok-4.3"],  # bench 10-16: grok cut corners on multi-source research
            "creative": ["google/gemini-3.6-flash", "x-ai/grok-4.3", "anthropic/claude-sonnet-5.5"]},
    "frontier": {"any": ["anthropic/claude-opus-5.5", "openai/gpt-6.1-sol", "google/gemini-4-argon"],
                 "screen": ["anthropic/claude-sonnet-5.5", "openai/gpt-6.1-sol", "anthropic/claude-opus-5.5"],
                 "code": ["anthropic/claude-opus-5.5", "openai/gpt-5.3-codex", "openai/gpt-6.1-sol"],
                 "research": ["google/gemini-4-argon", "x-ai/grok-4.7", "openai/gpt-6.1-sol"],
                 "creative": ["anthropic/claude-opus-5.5", "google/gemini-4-argon", "openai/gpt-6.1-sol"]},
}
for _t, _env in (("cheap", "JARVIS_TIER_CHEAP"), ("mid", "JARVIS_TIER_MID"), ("frontier", "JARVIS_TIER_FRONTIER")):
    if os.environ.get(_env):  # one-model override per tier
        POOLS[_t] = {"any": [os.environ[_env].strip()]}
TIER_MODELS = {t: POOLS[t]["any"][0] for t in TIERS}
CHEAP_FIRST = (os.environ.get("JARVIS_CHEAP_FIRST") or "1") != "0"
APP_WINDOW_WAIT_S = 6.0
CHEAP_ESCALATE_STEPS = int(os.environ.get("JARVIS_CHEAP_ESCALATE_STEPS") or 25)  # live 10-17: a calculator sum is 5+ presses; 8 cut a working job
CHEAP_NE = float(os.environ.get("JARVIS_CHEAP_NEEDS_EXPENSIVE") or 0.2)  # Jev's needs_expensive below this = cheap job  # Evens 10-17 "make it cost 0.01 or less"
JEV_MIN_CONF = 0.6  # below it Jev has no opinion and the job goes UP a tier, never down (jev-preflight rule)
SCORES = Path(os.environ.get("JARVIS_SCORES_FILE") or Path.home() / "Library/Caches/jarvis/model-scores.json")  # tests: temp file
MIN_SAMPLES = 3


def pool(tier: str, kind: str) -> list:
    tiers = POOLS.get(tier) or POOLS["mid"]
    return list(tiers.get(kind) or tiers["any"])


def _scores() -> dict:
    try:
        return json.loads(SCORES.read_text())
    except (OSError, ValueError):
        return {}


def record_outcome(kind: str, model: str, ok: bool) -> None:
    """Per (kind, model) finished/total: the best-value pick learns from real jobs, not from a price list."""
    data = _scores()
    row = data.setdefault(f"{kind}|{model}", {"ok": 0, "n": 0})
    row["n"] += 1; row["ok"] += int(bool(ok))
    try:
        SCORES.parent.mkdir(parents=True, exist_ok=True)
        tmp = SCORES.with_suffix(f".{os.getpid()}.tmp"); tmp.write_text(json.dumps(data, indent=1)); os.replace(tmp, SCORES)
    except OSError:
        pass


def best_in_pool(tier: str, kind: str) -> list:
    """Pool order (cheapest first), except a model that keeps failing this kind of job drops to the back."""
    cands = pool(tier, kind)
    data = _scores()
    def rate(m):
        r = data.get(f"{kind}|{m}") or {}
        return (r.get("ok", 0) / r["n"]) if r.get("n", 0) >= MIN_SAMPLES else 1.0
    return sorted(cands, key=lambda m: -rate(m))  # stable: ties keep best-value order
VISION_FREE = {"deepseek/deepseek-v4-flash", "deepseek/deepseek-v4-pro", "deepseek/deepseek-chat-v3.1"}


def next_tier(tier: str) -> str | None:
    i = TIERS.index(tier) if tier in TIERS else 0
    return TIERS[i + 1] if i + 1 < len(TIERS) else None


def _jev_tier(goal: str) -> dict | None:
    """Jev's live preflight: {"tier", "conf"} or None. Never raises; one call, bounded wait."""
    try:
        jev = _load_brain("jev_router")
        pf = jev.start(goal, live=True)
        live = pf.result(wait=True) if pf is not None else None
        tier = (live or {}).get("model_tier")
        conf = float((live or {}).get("model_tier_conf") or 0)
        ne = (live or {}).get("needs_expensive")
        JEV_LAST.clear(); JEV_LAST.update(live=bool(live), tier=tier, ne=ne, keys=sorted((live or {}).keys())[:12])
        if isinstance(ne, (int, float)) and ne < CHEAP_NE and tier != "cheap":
            # live 10-17: Jev labelled a 3-step Calculator click "mid" at needs_expensive 0.14, so it ran on the Sonnet pin
            # ($0.07). Evens: "make it cost 0.01 or less". A job Jev itself rates this cheap starts cheap; it escalates
            # to his pin after CHEAP_ESCALATE_STEPS steps if it is still going.
            tier, conf = "cheap", round(1 - ne, 3)
        if tier not in TIERS and isinstance(ne, (int, float)):
            # live 10-17: Jev answered in 0.3 s but without model_tier, so every job fell to the Sonnet pin ($0.05 for one line)
            tier = "cheap" if ne < 0.35 else "mid" if ne < 0.7 else "frontier"
            conf = round(max(ne, 1 - ne), 3)
        if tier in TIERS:
            kind = (live or {}).get("task_kind")
            return {"tier": tier, "conf": conf, "kind": kind if kind in KINDS else "any"}
    except Exception as e:  # noqa: BLE001
        JEV_LAST.clear(); JEV_LAST.update(error=f"{type(e).__name__}: {e}"[:200])
        return None
    return None


JEV_LAST: dict = {}  # live 10-17: jobs fell to the Sonnet pin with no record of what Jev said; choose_model writes this out


def _owner_model() -> str:
    try:
        return _load("brain_model", "brain_model.py").current()
    except Exception:  # noqa: BLE001
        return ""


TOOL_BY_KIND = {  # Evens 10-16 "use jev to decide which tool to use": Jev's preflight kind -> first tool to reach for
    "files": "native files (read_file, write_file, edit_file, list_dir, grep) before any app or browser",
    "code": "shell + files in the repo (tests first), MCP when a connector fits; never the screen for code",
    "research": "web_search then fetch_url / safari read on the real pages; cite what you opened",
    "screen": "safari (DOM) for sites, Accessibility actions for apps, computer (pixels) only as the last resort",
    "creative": "the installed ArtCraft app through mcp, or an artifact page; save native + export",
    "chat": "answer with say; no tools unless he asks for an action",
}


def jev_tool_hint(pick: dict) -> str:
    kind = pick.get("kind") or "any"
    if kind not in TOOL_BY_KIND:
        return ""
    return (f"\nJev's preflight reads this as a {kind} job ({pick.get('why', '')}): start with {TOOL_BY_KIND[kind]}. "
            "It is a pick, not a stop: send, post, pay, delete, merge and publish stay Evens's.")


def choose_model(goal: str) -> dict:
    """{"tier", "model", "why"}: his own switch wins; else Jev's tier; no opinion -> mid."""
    owner = _owner_model()
    jev = _jev_tier(goal)
    if owner and not (CHEAP_FIRST and jev and jev.get("tier") == "cheap" and jev.get("conf", 0) >= JEV_MIN_CONF):
        return {"tier": "owner", "model": owner, "why": "Evens switched the model", "jev": dict(JEV_LAST, picked=jev)}
    kind = (jev or {}).get("kind") or "any"
    if jev and jev.get("conf", 0) >= JEV_MIN_CONF:
        tier, why = jev["tier"], f"jev {jev['tier']}/{kind} {jev['conf']:.2f}"
    else:
        tier, why = "mid", ("jev no opinion" if not jev else f"jev low conf {jev['conf']:.2f}")
    chain = best_in_pool(tier, kind)
    return {"tier": tier, "kind": kind, "model": chain[0], "chain": chain, "why": why, "jev": dict(JEV_LAST, picked=jev)}


def _load_brain(name: str):
    mod = sys.modules.get(f"op_brain_{name}")
    if mod is None:
        spec = importlib.util.spec_from_file_location(f"op_brain_{name}", STACK / "brain" / f"{name}.py")
        mod = importlib.util.module_from_spec(spec); sys.modules[f"op_brain_{name}"] = mod; spec.loader.exec_module(mod)
    return mod


def _local():
    mod = sys.modules.get("op_local_model")
    if mod is None:
        spec = importlib.util.spec_from_file_location("op_local_model", Path(__file__).with_name("local_model.py"))
        mod = importlib.util.module_from_spec(spec); sys.modules["op_local_model"] = mod; spec.loader.exec_module(mod)
    return mod


JARVIS_NOTE_RE = re.compile(r"^\s*(?:Before you finish|Not run|\(It has been|\(While you were|Heads up:)")


def _goal_of(messages: list) -> str:
    """His latest request: Jarvis's own check-backs are user-role notes and are skipped (live 10-17 10:53: the 'prove it'
    note was judged as the request and the local model refused 'Open Calculator' as coding)."""
    for m in reversed(messages):
        if m.get("role") == "user" and isinstance(m.get("content"), str) and m["content"].strip() \
                and not JARVIS_NOTE_RE.match(m["content"]):
            return m["content"]
    return ""


def _with_local_fallback(paid_fn):
    """Evens 10-16: no OpenRouter credits (HTTP 402) -> the free local model takes the turn for small things; anything
    beyond it gets "This free local model can't ___. Add credits to OpenRouter to continue with more capable models." """
    def fn(messages, tools):
        got = paid_fn(messages, tools)
        if got.get("ok") or "402" not in str(got.get("error") or ""):
            return got
        L = _local()
        say = lambda text: {"ok": True, "tool": "", "args": {}, "call_id": "", "text": text, "model": "local:" + L.LOCAL_MODEL,
                            "no_credit": True}  # a refusal, not an answer: the job ends as model-unavailable, not done
        if not L.ready():
            return say("OpenRouter has no credits, and the free local model isn't installed yet. " + L.ADD_CREDITS)
        goal = _goal_of(messages)
        why = L.cant(goal)
        if why:
            return say(why)
        last_user = max((i for i, m in enumerate(messages) if m.get("role") == "user" and isinstance(m.get("content"), str)), default=0)
        if sum(1 for m in messages[last_user:] if m.get("role") == "assistant") >= L.LOCAL_STEP_CAP:
            return say(f"This free local model can't finish long multi-step tasks. {L.ADD_CREDITS}")
        got = L.call(messages, tools)
        return {**got, "no_credit": True} if got.get("refused") else got  # its refusal ends the job as model-unavailable
    return fn


def _model_fn(tier: str = "mid", chain: list | None = None):
    online_spec = importlib.util.spec_from_file_location("op_online", STACK / "brain" / "online.py")
    online = sys.modules.get("op_online")
    if online is None:
        online = importlib.util.module_from_spec(online_spec)
        sys.modules["op_online"] = online
        online_spec.loader.exec_module(online)
    if hasattr(online, "load_existing_env"):
        online.load_existing_env()
    owner = _owner_model()
    if tier == "owner" and owner:
        chain = [owner, *(chain or [])]  # his pin first; the job's own chain behind it
    else:
        chain = list(chain or pool(tier, "any"))  # the job's pool; the next one only answers if the first errors
    # live 10-17 (Z15 run): the pin had no credit and the job fell straight to the free local model while DeepSeek
    # still answered. The cheap pool always rides last, before the local model.
    chain = tuple(dict.fromkeys([*chain, *pool("cheap", "any")]))
    return _with_local_fallback(lambda messages, tools: online.call_openrouter_messages(
        messages, tools, model_chain=chain, max_tokens=12000, allow_reasoning=True, attempt_sec=120.0))


MID_WORK_S = 8.0


def inbox_note(state: dict, messages: list) -> str:
    """The "while you were working" wrapper only when he really spoke mid-work. Live 10-17: an idle session wrapped his
    plain "Hello Jarvis" as an interruption and he got re-greeted; the wrapper also made every line sound like a backlog."""
    mid_work = state.get("status") == "RUNNING" and time.time() - float(state.get("turn_at") or 0) > MID_WORK_S and len(messages) > 3
    if not mid_work:
        return ""
    return ("(While you were working, Evens added the following. Acknowledge it in one short line with say, put each "
            "request on your plan, merge it into this job if it is related, otherwise do it after or alongside; drop "
            "nothing.)\n")


def step_once(task: Task, tools: Tools, model_fn) -> str | None:
    """One model turn plus its tool calls. Returns a terminal status or None to continue."""
    messages = task.read("messages.json")
    new = task.drain_inbox()
    if new:
        messages.append({"role": "user", "content": inbox_note(task.read("state.json"), messages) + "\n".join(f"- {x}" if len(new) > 1 else x for x in new)})
        task.write("messages.json", messages)
    if len(messages) > HX.COMPACT_AT:
        messages = HX.compact(messages, task.rows("trace.jsonl"))
        task.write("messages.json", messages)
    spoke = [float(r.get("at") or 0) for r in task.rows("speech.jsonl")]
    st0 = task.read("state.json")
    if time.time() - max(spoke + [float(st0.get("turn_at") or time.time())]) > QUIET_S and \
            not (messages[-1].get("role") == "user" and "one line" in str(messages[-1].get("content"))):
        messages.append({"role": "user", "content": "(It has been over 10 minutes. Give Evens one line of progress with say, then continue.)"})
    got = model_fn(HX.context_view(messages), TOOLS)
    metered = HX.add_usage(task.read("state.json"), got.get("usage"))
    task.write("state.json", metered)
    if HX.over_cap(metered):
        task.speak(f"This job has cost {metered['cost_usd']:.2f} dollars so far, so I paused it. Say go on and I'll continue.")
        task.write("state.json", {**metered, "status": "WAITING_OWNER", "question": "cost ceiling reached", "pending_cap": True})
        return "WAITING_OWNER"
    if not got.get("ok"):
        task.trace({"event": "model_error", "error": got.get("error")})
        return "MODEL_UNAVAILABLE"
    calls = got.get("calls") or ([{"tool": got["tool"], "args": got.get("args") or {}, "call_id": got.get("call_id") or "call_0"}]
                                 if got.get("tool") else [])
    if not calls:  # plain text with no tool call: treat as the final answer, spoken like every other line
        text = str(got.get("text") or "").strip()
        if got.get("no_credit"):
            # live 10-17: "I couldn't work that out ... Add credits" was recorded as DONE; it is a blocked job
            task.speak(text)
            task.write("state.json", {**task.read("state.json"), "status": "MODEL_UNAVAILABLE", "summary": text, "no_credit": True})
            return "MODEL_UNAVAILABLE"
        held = _done_gate(task, "done", {"summary": text})
        if held:  # matrix audit 10-16: prose after real actions closed jobs unchecked; it gets the same check as done
            messages += [{"role": "assistant", "content": text or "(no text)"},
                         {"role": "user", "content": held + " Finish with the done tool, with what you checked in evidence."}]
            task.write("messages.json", messages)
            return None
        if text:
            task.speak(text)  # bench 10-16: "391." was the answer but never reached the speech log
        task.write("state.json", {**task.read("state.json"), "status": "DONE", "summary": text, "evidence": ""})
        return "DONE"
    messages.append({"role": "assistant", "content": got.get("text") or None, "tool_calls": [
        {"id": c["call_id"], "type": "function", "function": {"name": c["tool"], "arguments": json.dumps(c["args"])}} for c in calls]})
    images, terminal = [], None
    for c in calls:
        name, args = c["tool"], c["args"] or {}
        looking = name == "say" or (name == "computer" and args.get("action") in ("screenshot", "wait", "cursor_position")) \
            or (name == "browser" and str(args.get("tool") or "").endswith(("snapshot", "take_screenshot", "wait_for"))) \
            or (name == "safari" and args.get("action") in ("snapshot", "read", "tabs"))
        rep = repetition(task, name, args) if name not in TERMINAL and not looking else None
        if rep == "stop":
            st = task.read("state.json")
            if not st.get("replanned"):
                # Evens 10-16: "figure out when it is stuck and continue until done; tell me only if you need me".
                task.write("state.json", {**st, "replanned": True})
                messages.append({"role": "tool", "tool_call_id": c["call_id"], "content": (
                    "Not run: you are stuck in a loop (same call five times). Stop and re-plan: list in one line what you "
                    "tried and why it failed, then take a genuinely different approach (another element, real=true, the "
                    "screen instead of the page, a shell check, a different route inside the same app or site).")})
                continue
            task.speak("I've tried every way I can see and keep hitting the same wall. Here's where it's stuck, and I need you.")
            terminal = ("WAITING_OWNER", {"question": f"I repeated {name} without progress even after changing approach."})
            messages.append({"role": "tool", "tool_call_id": c["call_id"], "content": "stopped: repeated without progress"})
            continue
        decision, why = _authority().authorize(name, args)
        st_now = task.read("state.json")
        if st_now.get("helper") and name in HELPER_FENCED and not (st_now.get("may_write") and name in ("write_file", "edit_file")):
            decision, why = "deny", "helpers only read and research; the main job does the actions"
        if decision == "allow" and name not in TERMINAL:
            private = _private_app(name, args)
            if private and not re.search(PRIVATE_APPS[private], _his_last_words(messages), re.I):
                # live 10-16: asked to message someone on Facebook, it opened his Contacts and Messages on its own
                decision, why = "ask", f"that opens his {private}, which he did not ask for"
        if decision == "allow" and name not in TERMINAL:
            held = tools.preflight(name, args) if hasattr(tools, "preflight") else ""
            if held:
                decision, why = "ask", f"that {held}"
        if decision == "ask":
            # OpenClaude/Claude Code: needs permission -> ask -> resume if approved. His yes lets THIS exact call run once.
            fp = _fingerprint(name, args)
            st = task.read("state.json")
            if st.get("granted") == fp:
                st.pop("granted", None); st.pop("pending_ok", None)
                task.write("state.json", st)
                task.trace({"event": "approved", "tool": name, "why": why})
                decision = "allow"
            else:
                task.write("state.json", {**st, "pending_ok": fp, "pending_what": why})
        held = _done_gate(task, name, args) if name == "done" else _ask_gate(task, args) if name == "ask_owner" else ""
        if held:
            # Claude Code-style stop check: the loop does not end on "I can't" or an unproven action; once per turn.
            result = {"text": held}
        elif name in TERMINAL:
            result = {"text": "ok"}
            terminal = ("DONE" if name == "done" else "WAITING_OWNER", args)
        elif decision == "deny":
            result = {"text": f"refused: {why}. Choose another way."}
        elif decision == "ask":
            result = {"text": f"needs Evens's OK first: {why}. Not run. Ask him in one plain line with ask_owner; if he says "
                              "yes, make exactly the same call again and it will go through."}
        elif not hasattr(Tools, name) or name.startswith("_"):
            result = {"text": f"unknown tool {name}"}
        elif name in DRIVING_TOOLS and owner_touched():
            # Z29 (matrix "takeover"/"driving"): his hand on the mouse or keyboard means hands off, at once.
            task.trace({"event": "takeover", "tool": name})
            task.speak("You took over, so my hands are off. Say go on when you want me to continue.")
            terminal = ("WAITING_OWNER", {"question": "you took over; say go on to continue"})
            result = {"text": "not run: Evens is using the mouse or keyboard; wait for his go on"}
        else:
            fp_now = _fingerprint(name, args)
            st_e = task.read("state.json")
            if name in ACTING_TOOLS and (st_e.get("uncertain") or {}).get("fp") == fp_now:
                # matrix "effectretry": the same action errored or timed out last time; it may already have happened
                task.write("state.json", {**st_e, "uncertain": None})
                result = {"text": "Not run yet: the last identical attempt errored or timed out, so it may already have taken "
                                  "effect. Check first (read the file/app/page, take a screenshot); if it did not happen, make "
                                  "the same call again and it will run."}
            else:
                if name in DRIVING_TOOLS:
                    task.write("state.json", {**task.read("state.json"), "driving": {"tool": name, "since": time.time()}})
                slow = threading.Timer(SLOW_TOOL_S, lambda: task.speak(slow_line(name), filler=True))  # Z81: never silent on a slow tool
                slow.daemon = True
                if name not in ("say", "plan", "done", "ask_owner"):
                    slow.start()
                missing = [k for k in _required().get(name, ()) if args.get(k) in (None, "")]
                try:
                    if missing:  # toolcontract: a clear refusal, not "error: KeyError: 'content'"
                        raise _Missing(f"Not run: {name} needs {', '.join(missing)}. Call it again with that filled in.")
                    with input_lease(name, task.path.name):
                        result = getattr(tools, name)(args)
                except _Missing as gap:
                    result = {"text": str(gap)}
                except LeaseBusy as busy:
                    result = {"text": f"Not run: {busy}. Wait a moment or work in the background (app, app_type) instead."}
                except Exception as exc:  # noqa: BLE001 — every failure is data for the model
                    result = {"text": f"error: {type(exc).__name__}: {exc}"}
                finally:
                    slow.cancel()
                if name in DRIVING_TOOLS:
                    task.write("state.json", {**task.read("state.json"), "driving": None})
                if name in ACTING_TOOLS and re.match(r"(?:error:|.*\btimed? ?out\b)", str(result.get("text") or ""), re.I | re.S):
                    task.write("state.json", {**task.read("state.json"), "uncertain": {"fp": fp_now, "at": time.time()}})
        if decision == "allow" and str(why).startswith("flag"):
            # Evens 10-16: secrets are flagged, never a stop; values stay masked in messages, trace and the model
            result = {**result, "text": "Heads up: this holds secrets; values are masked. " + _scrub(str(result.get("text") or ""))}
        if rep == "nudge":
            result = {**result, "text": str(result.get("text") or "") + "\nNOTE: this is the third time you ran exactly this. "
                      "It is not working; do something different (look at the right screen, use another way) or ask Evens."}
        result = {**result, "text": _scrub(str(result.get("text") or ""))}  # credential handles: never a secret value in context or logs
        task.trace({"event": "tool", "tool": name, "call_id": c["call_id"], "args": args, "decision": decision, "result": result.get("text", "")[:2000]})
        messages.append({"role": "tool", "tool_call_id": c["call_id"], "content": result.get("text", "")})
        if result.get("image"):
            images.append(result["image"])
    if images:
        st = task.read("state.json")
        if st.get("model") in VISION_FREE:  # this model cannot see: same tier, a screen-capable pool
            # the cheap screen pool leads with DeepSeek for text-only app reads; an image needs a model that can see
            chain = [m for m in best_in_pool(st.get("tier") or "mid", "screen") if m not in VISION_FREE] or \
                [m for m in best_in_pool("mid", "screen") if m not in VISION_FREE]
            st.update(kind="screen", model=chain[0], chain=chain, model_why="needs to see the screen")
            task.write("state.json", st)
    for img in images[-1:]:  # only the newest screenshot rides along
        messages.append({"role": "user", "content": [{"type": "text", "text": "The screen now:"},
                                                     {"type": "image_url", "image_url": {"url": img}}]})
    task.write("messages.json", messages)
    if terminal:
        status, args = terminal
        state = task.read("state.json")
        line = str(args.get("summary") or args.get("question") or "")
        spoke = [r for r in task.rows("speech.jsonl") if float(r.get("at") or 0) >= float(state.get("turn_at") or 0)
                 and not r.get("filler")]
        if line.strip() and (status == "WAITING_OWNER" or not spoke):
            # Evens 10-16 "sometimes Jarvis repeats its response twice": say + done carried the same answer and both
            # were spoken. The done summary is spoken only when nothing was said this turn; a question always is.
            task.speak(line.strip())
        state.update(status=status, summary=plain(line), evidence=str(args.get("evidence") or ""))
        if status == "WAITING_OWNER":  # Z56: the lapse pump follows up once if he never answers
            state.update(asked_at=time.time(), asked=plain(line), lapse_said=False)
        task.write("state.json", state)
        return status
    return None


def _repeats(new: str, old: str) -> bool:
    """True when `new` mostly says what `old` already said (most of its content words were in it)."""
    words = lambda t: {w for w in re.findall(r"[a-z0-9']{3,}", t.lower()) if w not in ("the", "and", "your", "you", "for", "that")}
    n, o = words(new), words(old)
    return bool(n) and len(n & o) / len(n) >= 0.6


def run(task_dir: Path, *, model_fn=None, max_steps: int = MAX_STEPS, budget_s: float = TIME_BUDGET_S,
        session: bool = False) -> dict:
    task = Task(task_dir)
    tools = Tools(task.path)
    fixed_fn = model_fn
    st0 = task.read("state.json")
    tier, kind = st0.get("tier") or "mid", st0.get("kind") or "any"
    model_fn = fixed_fn or _model_fn(tier, st0.get("chain"))
    state = task.read("state.json")
    state.update(status="RUNNING", pid=os.getpid(), started=state.get("started") or time.time(), turn_at=time.time())
    task.write("state.json", state)
    start = time.monotonic()
    while True:
        state = task.read("state.json")
        if task.cancelled():
            status = "CANCELLED"
        elif state["step"] >= max_steps:
            status = "STEP_LIMIT"
        elif time.monotonic() - start > budget_s:
            status = "TIME_LIMIT"
        else:
            state["step"] += 1
            task.write("state.json", state)
            status = step_once(task, tools, model_fn)
            now = task.read("state.json")
            if now.get("tier") != tier or now.get("kind") != kind:  # it moved for eyes
                tier, kind = now.get("tier"), now.get("kind") or kind
                model_fn = fixed_fn or _model_fn(tier, now.get("chain"))
            owner_pin = _owner_model() if CHEAP_FIRST else ""
            if status is None and tier == "cheap" and owner_pin and now.get("step", 0) >= CHEAP_ESCALATE_STEPS:
                # cheap-first safety net: a job still going after N cheap steps is not cheap; his pinned model takes it
                # live 10-17: the pinned model failed (no credits) and the job fell to the local model mid-task. The cheap
                # chain that was doing the work stays behind the pin as its fallback.
                fallback = [m for m in (now.get("chain") or []) if m != owner_pin]
                now.update(tier="owner", model=owner_pin, chain=[owner_pin, *fallback], model_why=f"still working after {CHEAP_ESCALATE_STEPS} cheap steps")
                task.write("state.json", now); task.trace({"event": "escalate", "to": "owner", "model": owner_pin})
                tier = "owner"
                model_fn = fixed_fn if fixed_fn else _model_fn(tier, now["chain"])
                continue
            if status == "MODEL_UNAVAILABLE" and tier in TIERS and next_tier(tier) and not now.get("no_credit"):
                # the cheaper model failed: escalate ONE tier and keep the same job (match-model-to-task)
                record_outcome(kind, str(now.get("model") or ""), False)
                tier = next_tier(tier)
                chain = best_in_pool(tier, kind)
                now.update(tier=tier, model=chain[0], chain=chain, model_why=f"escalated after a failure on {now.get('model')}")
                task.write("state.json", now)
                task.trace({"event": "escalate", "to": tier, "model": chain[0]})
                model_fn = fixed_fn if fixed_fn else _model_fn(tier, chain)
                continue
            if status is None:
                continue
        state = task.read("state.json")
        state.update(status=status, finished=time.time())
        if status == "CANCELLED":  # matrix "conc": his stop reaches the background commands this job started
            stopped = [jid for jid in list(tools.jobs) if tools.job({"job_id": jid, "action": "stop"})["text"].startswith("stopped by me")]
            if stopped:
                state["stopped_jobs"] = stopped
        task.write("state.json", state)
        verified = status == "DONE" and not state.get("unverified")
        if status == "DONE":
            state["verified"] = verified
            task.write("state.json", state)
        if verified and not fixed_fn:  # audit 10-16: never learn a procedure from an unproven finish
            try:
                rows = [json.loads(l) for l in (task.path / "trace.jsonl").read_text().splitlines() if l.strip()]
                HX.remember(task.path.parent.parent, task.read("request.json").get("goal", ""), state.get("summary") or "",
                            rows, str(state.get("model") or ""))
            except (OSError, ValueError):
                pass  # a missing note never fails the job
        failed = (f"ran out of {'steps' if status == 'STEP_LIMIT' else 'time'}" if status in ("STEP_LIMIT", "TIME_LIMIT")
                  else f"finished unverified: {state.get('unverified')}" if status == "DONE" and state.get("unverified") else "")
        if failed and not fixed_fn:  # canvas scars: a failed method is remembered so the next similar job avoids it
            try:
                rows = [json.loads(l) for l in (task.path / "trace.jsonl").read_text().splitlines() if l.strip()]
                HX.remember(task.path.parent.parent, task.read("request.json").get("goal", ""), state.get("summary") or "",
                            rows, str(state.get("model") or ""), failed=failed)
            except (OSError, ValueError):
                pass
        if state.get("tier") != "owner" and status in ("DONE", "MODEL_UNAVAILABLE", "STEP_LIMIT", "TIME_LIMIT"):
            record_outcome(state.get("kind") or "any", str(state.get("model") or ""), verified)
        if status in ("DONE", "WAITING_OWNER") and session and not task.read("state.json").get("helper"):
            # A live session like Codex/Claude Code: the page stays open and his next line continues THIS agent.
            if _idle_until_spoken_to(task):
                start = time.monotonic()
                continue
            state = task.read("state.json")
        tools.close()
        return state


IDLE_S = float(os.environ.get("JARVIS_SESSION_IDLE_S") or 7200)


def _code_stamp() -> tuple:
    here = Path(__file__).resolve().parent
    return tuple(int(p.stat().st_mtime) for p in sorted(here.glob("*.py")) if not p.name.startswith("test_"))


def _idle_until_spoken_to(task) -> bool:
    """IDLE until a new user message arrives (True: carry on) or the idle time runs out / he cancels (False)."""
    seen = len(task.read("messages.json", []))
    st = task.read("state.json"); st.update(status="IDLE", idle_since=time.time()); task.write("state.json", st)
    end = time.monotonic() + IDLE_S
    code = _code_stamp()
    while time.monotonic() < end:
        if task.cancelled() or _code_stamp() != code:
            st = task.read("state.json")
            task.write("state.json", {**st, "status": "CANCELLED" if task.cancelled() else "DONE", "ended": "session closed"})
            # live 10-16: an idle session kept the pre-deploy tool list ("no signal engine tool"); a new deploy ends it,
            # and his next line starts a fresh job that carries the conversation.
            return False
        msgs = task.read("messages.json", [])
        if (len(msgs) > seen and msgs[-1].get("role") == "user") or task.rows("inbox.jsonl"):
            st = task.read("state.json")
            # live 10-17: a new request to an idle session hit the ceiling of the LAST job ("cost 1.52 so far, say go on")
            # before doing anything. Each request gets its own budget on top of what the session already spent.
            st.pop("asked_at", None)  # he answered (or moved on): no lapse
            st.update(status="RUNNING", step=0, turn_at=time.time(), pending_cap=False,
                      cost_cap=round(float(st.get("cost_usd") or 0) + HX.JOB_COST_CAP, 2))
            # live 10-17: five cheap Calculator/Finder requests ran on the Sonnet pin because they joined an idle session
            # that kept the FIRST request's model. Every new request gets its own pick (cheap-first per request).
            line = next((r.get("text") for r in task.rows("inbox.jsonl")[-1:]), "") or str(msgs[-1].get("content") or "")
            pick = choose_model(str(line)[:2000])
            st.update(tier=pick["tier"], model=pick["model"], chain=pick.get("chain") or [pick["model"]],
                      kind=pick.get("kind", "any"), model_why=pick["why"], jev=pick.get("jev") or {})
            task.write("state.json", st)
            return True
        time.sleep(1.0)
    st = task.read("state.json")
    task.write("state.json", {**st, "status": "DONE", "ended": "idle timeout"})
    return False


def start(hive: Path, goal: str, turns: list | None = None) -> dict:
    """Create a task and run it in its own worker process (survives the Orb turn)."""
    task = Task.create(hive, goal, turns=turns)
    log = open(task.path / "worker.log", "w")
    subprocess.Popen([sys.executable, str(Path(__file__).resolve()), "run", str(task.path)], stdout=log,
                     stderr=subprocess.STDOUT, start_new_session=True, cwd=str(Path.home()))
    return {"task_id": task.path.name, "path": str(task.path)}


def resume(hive: Path, task_id: str) -> dict:
    task = Task(Path(hive) / "operator-tasks" / task_id)
    state = task.read("state.json")
    if state.get("status") == "RUNNING" and _alive(state.get("pid")):
        return {"task_id": task_id, "status": "RUNNING"}
    task.write("control.json", {"cancel": False})
    state.update(status="QUEUED")
    task.write("state.json", state)
    log = open(task.path / "worker.log", "a")
    subprocess.Popen([sys.executable, str(Path(__file__).resolve()), "run", str(task.path)], stdout=log,
                     stderr=subprocess.STDOUT, start_new_session=True, cwd=str(Path.home()))
    return {"task_id": task_id, "status": "QUEUED"}


RECOVER_S = 1800


def recover(hive: Path, max_age_s: float = RECOVER_S) -> list:
    """After a Jarvis restart or a Mac reboot: jobs that were RUNNING/QUEUED with a dead worker and touched in the last
    half hour carry on from their saved conversation (blueprint slice 3: durable jobs)."""
    out = []
    root = Path(hive) / "operator-tasks"
    if not root.is_dir():
        return out
    for d in root.iterdir():
        try:
            st = json.loads((d / "state.json").read_text())
        except (OSError, ValueError):
            continue
        if st.get("status") in ("RUNNING", "QUEUED") and not _alive(st.get("pid")) and \
                time.time() - (d / "state.json").stat().st_mtime < max_age_s:
            Task(d).trace({"event": "recovered", "after": "restart"})
            resume(Path(hive), d.name)
            out.append(d.name)
    return out


def _alive(pid) -> bool:
    """A job's worker is alive only if that pid exists AND is still a Jarvis worker (fault trial 10-17: a dead worker's
    pid reused by an unrelated program made the job look RUNNING forever)."""
    try:
        pid = int(pid)
        os.kill(pid, 0)
    except (OSError, ValueError, TypeError):
        return False
    if pid == os.getpid():
        return True  # this very process runs the job (in-process runs and tests)
    try:
        cmd = subprocess.run(["ps", "-p", str(pid), "-o", "command="], capture_output=True, text=True, timeout=5).stdout
    except (OSError, subprocess.SubprocessError):
        return True  # cannot tell: do not declare a live job dead
    return "operator.py" in cmd or "serve.py" in cmd


def running(hive: Path) -> bool:
    """A job is running only if its worker is alive (live 10-16: a killed job stayed RUNNING and swallowed the next ask)."""
    st = status(hive)
    tid = str(st.get("task_id") or "")
    if tid and Task(Path(hive) / "operator-tasks" / tid).cancelled():
        return False  # live 10-16: a cancelled session still shutting down swallowed the next request
    if st.get("status") in ("RUNNING", "IDLE"):
        return _alive(st.get("pid"))
    if st.get("status") == "QUEUED":
        try:
            created = float(json.loads((Path(hive) / "operator-tasks" / st["task_id"] / "request.json").read_text())["created"])
        except (OSError, ValueError, KeyError):
            return False
        return time.time() - created < 30
    return False


YES_RE = re.compile(r"^\W*(yes|yeah|yep|ok|okay|sure|go ahead|go for it|do it|send it|post it|confirm|confirmed|approved?|"
                    r"oui|vas-y|d'accord)\b", re.I)


PRIVATE_APPS = {"Messages": r"\b(i?messages?|imessage|text)\b", "Contacts": r"\bcontacts?\b", "Mail": r"\b(e-?mail|mail|inbox)\b",
                "Photos": r"\bphotos?\b", "Notes": r"\bnotes?\b", "Calendar": r"\b(calendar|agenda|schedule)\b",
                "FaceTime": r"\bface ?time\b", "Reminders": r"\breminders?\b", "WhatsApp": r"\bwhats ?app\b",
                "Signal": r"\bsignal app\b", "Telegram": r"\btelegram\b"}


def _private_app(name: str, args: dict) -> str:
    """The private app a tool call would open, read or drive, if any."""
    text = "\n".join(str(args.get(k)).strip() for k in ("target", "command", "app") if args.get(k))
    if name not in ("open", "shell", "computer", "app") or not text:
        return ""
    for app in PRIVATE_APPS:
        if re.search(rf"(application \\?\"{app}\\?\"|-a {app}\b|^{app}$|process \\?\"{app}\\?\"|\b{app}\.app\b)", text, re.I | re.M):
            return app
    return ""


def _his_last_words(messages: list) -> str:
    return next((str(m.get("content")) for m in reversed(messages) if m.get("role") == "user" and isinstance(m.get("content"), str)), "")


HELPER_FENCED = {"web_helper", "computer", "safari", "open", "write_file", "edit_file", "mcp", "signal", "delegate", "say", "ask_owner"}

SECONDHAND = ("medium.com", "reddit.com", "quora.com", "x.com", "twitter.com", "youtube.com", "youtu.be", "tiktok.com",
              "facebook.com", "instagram.com", "linkedin.com/pulse", "linkedin.com/posts", "substack.com")


def _only_secondhand(text: str) -> bool:
    """True when links are cited and every one is a post/forum/video page rather than a primary source."""
    urls = re.findall(r"https?://(?:www\.)?([^\s)\]>\"']+)", text)
    return bool(urls) and all(any(u.lower().startswith(d) or f".{d}" in u.lower().split("/")[0] for d in SECONDHAND) for u in urls)


def _unread_cited(text: str, rows: list) -> list:
    """GitHub projects cited in what he gets but never opened in this job (bench 10-16: a license 'not listed in the
    search snippet' because the repo page was never read)."""
    opened = " ".join(json.dumps(r.get("args")).lower() for r in rows if r.get("tool") in ("fetch_url", "safari", "shell"))
    cited = dict.fromkeys(m.lower().rstrip("/.") for m in re.findall(r"github\.com/[\w.-]+/[\w.-]+", text))
    return [c for c in cited if c not in opened]


QUESTION_RE = re.compile(r"\?\s*$|^\s*(?:what|when|who|whom|whose|where|which|why|how|is|are|was|were|do|does|did|can|could|"
                         r"will|would|should|quel(?:le)?s?|quand|qui|où|ou|comment|pourquoi|combien|est-ce)\b", re.I)
META_DONE_RE = re.compile(  # a short line that reports on the work ("Reported the current time") instead of answering
    r"\s*(?:sir[,.]?\s*)?(?:i\s+(?:have\s+)?)?(?:[a-z]+ed|got|found|gave|told|said|did|ran|made|showed|shown|done|"
    r"answered|sent|brought|fetched)\b(?:\s+[\w'-]+){0,6}\s*[.!]?\s*$", re.I)


def _his_line(goal: str) -> str:
    """The words he said (the goal may carry a wrapper and 'Evens's exact words: …')."""
    m = re.search(r"Evens's exact words:\s*(.+)$", goal or "", re.S)
    return (m.group(1) if m else goal or "").strip().splitlines()[-1] if (m or goal) else ""


ACTION_RE = re.compile(r"\b(open|click|press|type|save|create|make|rename|move|delete|install|run|build|deploy|send|"
                       r"write|edit|fix|download|upload|play|switch|turn (?:on|off)|navigate|scroll|drag)\b", re.I)
RESEARCH_RE = re.compile(r"\b(research|look up|latest|current(?:ly)?|right now|this week|compare|comparison|"
                         r"most popular|top \d+|stars|price|prices|news|what'?s new|review of)\b", re.I)
CANT_RE = re.compile(r"\b(i\s+can(?:'|no)?t|cannot|i\s+don'?t\s+have\s+(?:access|a\s+way|the\s+ability)|unable\s+to|"
                     r"isn'?t\s+available|not\s+available|no\s+\w+(?:\s+\w+)?\s+tool|outside\s+what\s+i\s+can)\b", re.I)
DRIVING_TOOLS = {"web_helper", "app", "computer", "app_type", "safari", "open"}   # the ones that move things on his Mac
TAKEOVER_S = float(os.environ.get("JARVIS_TAKEOVER_S") or 2.0)


def owner_touched(idle_s: float | None = None) -> bool:
    """True when his mouse or keyboard moved in the last TAKEOVER_S seconds (HIDIdleTime, no permission needed).
    Jarvis's own AX actions and app_type produce no HID events, so any recent event is his."""
    try:
        if idle_s is None:
            out = subprocess.run(["ioreg", "-c", "IOHIDSystem", "-d", "4"], capture_output=True, text=True, timeout=5).stdout
            m = re.search(r'"HIDIdleTime" = (\d+)', out)
            idle_s = int(m.group(1)) / 1e9 if m else 1e9
        return idle_s < takeover_window()
    except Exception:  # noqa: BLE001
        return False


def takeover_window() -> float:
    """Z05 takeover speed: 'fast' hands back after 0.7 s of his input, 'balanced' (default) after 2 s."""
    try:
        mode = (CONFIG_DIR / CONFIG_KEYS["takeover_speed"][0]).read_text().strip()
    except OSError:
        mode = ""
    return 0.7 if mode == "fast" else TAKEOVER_S


SLOW_TOOL_S = float(os.environ.get("JARVIS_SLOW_TOOL_S") or 20)
SLOW_WORDS = {"shell": "that command", "job": "that job", "web_search": "the search", "fetch_url": "that page",
              "delegate": "the helper", "signal": "the video", "artifact": "the page", "mcp": "that tool",
              "computer": "the screen", "safari": "Safari", "app": "that app", "app_type": "the typing", "open": "opening it",
              "find_files": "the file search", "grep": "the text search", "list_dir": "that folder", "read_file": "that file",
              "write_file": "saving", "edit_file": "the edit", "methods": "the method search", "vault_graph": "the vault scan",
              "schedule": "the schedule", "config": "the setting", "loop": "the loop", "browser": "the browser"}


def slow_line(tool: str) -> str:
    return f"Still on it; {SLOW_WORDS.get(tool, 'this step')} is taking a moment."


AX_FRESH_S = 20.0
FOREGROUND_TOOLS = {"computer", "mouse", "keyboard"}   # the ones that move HIS pointer or press real keys
INPUT_LOCK = Path.home() / ".config/brain/input.lock"
LEASE_WAIT_S = 20.0


class LeaseBusy(Exception):
    pass


class input_lease:
    """matrix "inputlease": one job at a time may move the real pointer or press real keys (jobs run in parallel
    processes; two of them clicking at once would fight). Background tools (app, app_type, safari) need no lease."""

    def __init__(self, tool: str, job: str):
        self.tool, self.job, self.fh = tool, job, None

    def __enter__(self):
        if self.tool not in FOREGROUND_TOOLS:
            return self
        import fcntl
        INPUT_LOCK.parent.mkdir(parents=True, exist_ok=True)
        self.fh = open(INPUT_LOCK, "a+")
        end = time.time() + LEASE_WAIT_S
        while True:
            try:
                fcntl.flock(self.fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except OSError:
                if time.time() > end:
                    self.fh.close(); self.fh = None
                    raise LeaseBusy("another job is using the mouse and keyboard right now")
                time.sleep(0.3)
        self.fh.seek(0); self.fh.truncate(); self.fh.write(self.job); self.fh.flush()
        return self

    def __exit__(self, *exc):
        if self.fh:
            import fcntl
            fcntl.flock(self.fh, fcntl.LOCK_UN); self.fh.close()
        return False


ACTING_TOOLS = {"deliver", "undo", "web_helper", "scroll_video", "computer", "safari", "open", "shell", "write_file", "edit_file", "mcp", "signal", "artifact", "config", "loop", "app_type", "app", "schedule", "focus"}


# Evens 10-17 "Jarvis is still not always talking plain English": the card read "Used app_type to create and type into
# /private in the background". The prompt asks for plain English; the model slips, so every line he sees or hears passes here.
TOOL_WORDS = {"app_type": "background typing", "read_file": "reading the file", "write_file": "writing the file",
              "edit_file": "editing the file", "list_dir": "listing the folder", "find_files": "a file search",
              "grep": "a text search", "shell": "a command", "web_search": "a web search", "fetch_url": "opening the page",
              "computer": "the screen", "safari": "Safari", "mcp": "a connected tool", "ask_owner": "asking you",
              "cua-driver": "background control", "cua_driver": "background control", "osascript": "a script",
              "AppleScript": "a script", "AXPress": "a click", "AXOpen": "opening it", "get_window_state": "reading the window"}
_SEG = r"[^\s/,;:)\]'\"]+"
_PATH_RE = re.compile(r"(?<![\w.])(?:~|/(?:private|tmp|Users|var|opt|Applications|Volumes|Library))"  # spaces only inside folders
                      r"(?:/" + _SEG + r"(?: " + _SEG + r")*(?=/))*(?:/" + _SEG + r")?/?")
_TOOL_RE = re.compile(r"\b(" + "|".join(re.escape(k) for k in sorted(TOOL_WORDS, key=len, reverse=True)) + r")\b")
_SNAKE_RE = re.compile(r"\b[a-z]+(?:_[a-z0-9]+)+\b")


_KEEP_RE = re.compile(r"https?://[^\s)>\]]+|`[^`]*`|“[^”]*”|\"[^\"]*\"")


def plain(line: str) -> str:
    """What he reads and hears: file names instead of paths, words instead of tool and function names.
    URLs, quoted and backticked text are left exactly as written."""
    t = _PATH_RE.sub(lambda m: (lambda base: f"“{base}”" if base else "a folder")(m.group(0).rstrip("/.").rsplit("/", 1)[-1]), str(line or ""))
    out, pos = [], 0
    for m in _KEEP_RE.finditer(t):
        out.append(_words(t[pos:m.start()])); out.append(m.group(0)); pos = m.end()
    out.append(_words(t[pos:]))
    return "".join(out)


def _words(t: str) -> str:
    t = _TOOL_RE.sub(lambda m: TOOL_WORDS[m.group(1)], t)
    return _SNAKE_RE.sub(lambda m: m.group(0).replace("_", " "), t)


SIGHT_RE = re.compile(r"\b(?:your screen (?:shows|has)|i (?:can )?see (?:a|an|the|your)\b|"
                      r"(?:is|are) (?:open|showing|displayed) (?:on|in) (?:your|the) (?:screen|window|display))", re.I)
LOOK_TOOLS = {"computer", "screenshot", "app", "safari", "mcp", "browser"}


OWNER_ROLES = {"AXRadioButton", "AXTab", "AXRow", "AXOutlineRow", "AXCell", "AXWindow", "AXSheet"}


def _ax_owners(els: list) -> dict:
    """For elements whose label repeats, the nearest labelled ancestor (tab, row, window) found from the AX paths."""
    by_path = {tuple(e.get("path") or ()): e for e in els}
    counts = {}
    for e in els:
        counts[(e.get("role"), e.get("label"))] = counts.get((e.get("role"), e.get("label")), 0) + 1
    out = {}
    for i, e in enumerate(els):
        if counts[(e.get("role"), e.get("label"))] < 2:
            continue
        path = tuple(e.get("path") or ())
        for cut in range(len(path) - 1, 0, -1):
            anc = by_path.get(path[:cut])
            if anc and anc.get("role") in OWNER_ROLES and (anc.get("label") or anc.get("value")):
                out[i] = anc.get("label") or anc.get("value")
                break
    return out


class _Missing(Exception):
    pass


def _required() -> dict:
    return {t["function"]["name"]: tuple(t["function"]["parameters"].get("required") or ()) for t in TOOLS}


def _done_gate(task, name: str, args: dict) -> str:
    """Text that sends `done` back once per turn, or "" to let it finish. Live misreads: false "I can't"/"no tool"
    (10 of 55), and actions reported as done that did not take (typing ignored, clicks that changed nothing)."""
    st = task.read("state.json")
    turn = st.get("turn_at") or 0
    n = int(st.get("gated_n") or 0) if st.get("gated_turn") == turn else 0
    summary = str(args.get("summary") or "")
    rows = [r for r in task.rows("trace.jsonl") if float(r.get("at") or 0) >= float(turn) and r.get("event") == "tool"]
    acted = any(r.get("tool") in ACTING_TOOLS for r in rows)
    why = ""
    open_steps = [x["step"] for x in (st.get("plan") or []) if x.get("status") in ("todo", "doing")]
    goal = str(task.read("request.json").get("goal") or "")
    read_pages = [r for r in rows if r.get("tool") == "fetch_url" or (r.get("tool") == "safari" and
                  (r.get("args") or {}).get("action") in ("read", "snapshot", "navigate", "new_tab", "find"))]
    wrote = " ".join(json.dumps(r.get("args")) for r in rows if r.get("tool") in ("write_file", "shell", "edit_file"))
    if RESEARCH_RE.search(goal) and n < 2 and (not read_pages or not re.search(r"https?://", summary + " " + wrote)):
        why = ("Before you finish: this is research, and you have " + ("not opened any source page" if not read_pages else
               "not put source links in what you delivered") + ". Search results are leads: open the real pages "
               "(fetch_url or safari read; for a GitHub project its repo page), take the numbers from them, cite the links, "
               "and fix anything you wrote from memory.")
    elif RESEARCH_RE.search(goal) and n < 2 and _unread_cited(summary + " " + wrote, rows):
        why = ("Before you finish: you cite pages you never opened in this job: " + ", ".join(_unread_cited(summary + " " + wrote, rows)[:5])
               + ". Open each one and correct anything taken from search snippets.")
    elif RESEARCH_RE.search(goal) and n < 2 and _only_secondhand(summary + " " + wrote):
        # X16 source quality: errors spread from secondhand pages; one primary source per claim
        why = ("Before you finish: every source you cite is secondhand (posts, forums, videos). Open at least one primary "
               "source for the main claims (the official site, the repository, the paper or the data itself), check the "
               "facts against it, and cite it.")
    elif QUESTION_RE.search(_his_line(goal)) and META_DONE_RE.match(summary) and n < 2:
        # live 10-17: "What time is it?" -> date said 05:21, but he heard "Proved the current time."
        why = ("Before you finish: he asked a question. Your summary reports on your work instead of answering it. "
               "Call done again with the answer itself, the way you would say it to him (for example: \"It's 5:21 in the "
               "morning, sir.\"), and keep the proof in evidence.")
    elif ACTION_RE.search(goal) and not acted and n < 2 and not st.get("told_into") \
            and not (RESEARCH_RE.search(goal) and read_pages):  # research that read its sources did the work
        # matrix "vrec"/"honesty": a request to do something was closed with prose and no tool ever acted
        why = ("Before you finish: he asked you to do something, and no tool acted this turn. Do it (app, computer, "
               "shell, files, Safari, MCP), or finish with exactly what blocked you and the error you saw.")
    elif open_steps and n < 2:
        why = ("Before you finish: your plan still has open steps: " + "; ".join(open_steps[:6]) + ". Do them, or mark "
               "them dropped with the reason, then finish.")
    elif SIGHT_RE.search(summary) and not any(r.get("tool") in LOOK_TOOLS for r in rows) and n < 2:
        # Z54 no-source sight: never describe his screen from memory or guesswork
        why = ("Before you finish: you describe what is on his screen, but you did not look this turn. Take a screenshot "
               "(computer), read the app (app read) or the page (safari read), then answer from what you saw; or tell him "
               "plainly you can't see it.")
    elif CANT_RE.search(summary):
        why = ("Before you finish: you are about to tell him you can't." + (
            " This is the second time: the same idea will not work, change the approach completely." if n else "") + " You have shell, files, his Safari (safari), the "
               "screen (computer), apps (open), MCP, web search and the signal engine. Try once more another way inside "
               "the app or site he named, or finish with exactly what blocked you and the evidence (the error you saw).")
    elif acted and not str(args.get("evidence") or "").strip():
        why = ("Before you finish: prove it. Check the result for real (snapshot/read the page, take a screenshot, run a "
               "check command) and call done again with what you saw in evidence. If the check shows it did not work, "
               "fix it instead.")
    if why and n >= 2:  # two checks sent back: finish rather than loop, but never as a verified result
        task.write("state.json", {**st, "unverified": why.split(":", 1)[-1].strip()[:300]})
        task.trace({"event": "unverified_done", "why": why[:300]})
        return ""
    if why:
        task.write("state.json", {**st, "gated_turn": turn, "gated_n": n + 1})
    return why


NEEDS_HIM_RE = re.compile(  # bench 10-16 W02: "OK to run a read-only script?" reached him; only real needs pass now
    r"\b(log\s*in|sign\s*in|password|two.?factor|verification code|code\s+(?:sent|on your phone)|captcha|"
    r"send|post|publish|pay|buy|purchase|delete|remove|push|merge|transfer|subscribe|book|"
    r"which\s+(?:one|of|do you)|what\s+do\s+you\s+mean|did\s+you\s+mean)\b|\bor\b[^?]{0,80}\?", re.I)


def _ask_gate(task, args: dict) -> str:
    """ask_owner only when he is really needed (a kept stop, a login only he can do, a choice only he can make).
    Technical snags go back to the loop once per turn (live 10-16: 'Messages has no open window... OK to proceed?')."""
    st = task.read("state.json")
    q = str(args.get("question") or "")
    if st.get("pending_ok") or NEEDS_HIM_RE.search(q) or st.get("asked_turn") == st.get("turn_at"):
        return ""
    task.write("state.json", {**st, "asked_turn": st.get("turn_at")})
    return ("Not asked: this sounds like a technical snag, not something only he can decide. Only ask him for an OK on a "
            "send/payment/delete/push, a login only he can do, or a choice only he can make. Solve this yourself "
            "(another way inside the same app or site, a check, real=true, the screen), then continue the task.")


def _fingerprint(name: str, args: dict) -> str:
    return name + ":" + json.dumps(args or {}, sort_keys=True, default=str)


APPROVALS = Path(os.environ.get("JARVIS_APPROVALS_FILE") or Path.home() / ".config/brain/approvals.jsonl")  # tests use a temp file


def record_approval(job: str, what: str, fingerprint: str, words: str, channel: str = "orb") -> None:
    """Z60: every yes he gives to a kept stop is written down: who, what, the exact call it covers, his words, the
    channel, when. One call only (the fingerprint); nothing standing is created."""
    try:
        APPROVALS.parent.mkdir(parents=True, exist_ok=True)
        with APPROVALS.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps({"at": time.strftime("%Y-%m-%d %H:%M:%S"), "who": "Evens", "job": job, "what": what[:300],
                                 "covers": fingerprint, "scope": "this one call", "words": _scrub(words)[:300],
                                 "channel": channel}) + "\n")
    except OSError:
        pass


def tell(hive: Path, line: str) -> dict:
    """Evens speaks while the loop works: his line joins THAT conversation (never a second job). Like talking to
    Claude Code mid-task (Evens 10-16: "it is still not a complete harness")."""
    state = status(hive)
    tid = str(state.get("task_id") or "")
    if not tid or not running(hive):
        return {"ok": False}
    task = Task(Path(hive) / "operator-tasks" / tid)
    st = task.read("state.json")
    if st.get("pending_cap") and (YES_RE.search(str(line)) or re.search(r"\b(go on|keep going|continue)\b", str(line), re.I)):
        # his "go on" at the cost ceiling raises THIS job's ceiling by one more step (bench 10-16: it re-paused at once)
        st = {**st, "cost_cap": round(float(st.get("cost_cap") or HX.JOB_COST_CAP) + HX.JOB_COST_CAP, 2), "pending_cap": False}
        task.write("state.json", st)
    if st.get("pending_ok") and YES_RE.search(str(line)):
        task.write("state.json", {**st, "granted": st["pending_ok"]})  # his yes covers the one action he was asked about
        record_approval(tid, st.get("pending_what") or "", st["pending_ok"], str(line))
    # Evens 10-16: lines he says while Jarvis works must never be lost. They used to be appended to messages.json while
    # a step was running, and the step's own save overwrote them. Now they wait in an inbox that every step drains.
    with FileLock(task.path / "messages.lock"):
        if duplicate_line(task, str(line)):
            return {"ok": True, "task_id": tid, "duplicate": True}
        with (task.path / "inbox.jsonl").open("a", encoding="utf-8") as fh:
            fh.write(json.dumps({"at": time.time(), "text": _his_words(str(line))[:4000]}) + "\n")
    return {"ok": True, "task_id": tid}


DUP_S = 20.0


def duplicate_line(task, line: str) -> bool:
    """Live 10-17: the Orb delivered the same request three times (recognition restarts); the same words within 20 s
    are one line. Compared against the inbox and the last user message."""
    norm = re.sub(r"[^a-z0-9 ]+", "", line.lower()).strip()
    if not norm:
        return False
    now = time.time()
    for r in task.rows("inbox.jsonl")[-5:]:
        if now - float(r.get("at") or 0) < DUP_S and re.sub(r"[^a-z0-9 ]+", "", str(r.get("text", "")).lower()).strip() == norm:
            return True
    msgs = task.read("messages.json", [])
    last = next((m for m in reversed(msgs) if m.get("role") == "user"), None)
    st = task.read("state.json")
    if last and now - float(st.get("turn_at") or 0) < DUP_S:
        body = str(last.get("content") or "").split(")\n")[-1]
        if re.sub(r"[^a-z0-9 ]+", "", body.lower()).strip() == norm:
            return True
    return False


class FileLock:
    def __init__(self, path):
        self.path = Path(path)

    def __enter__(self):
        import fcntl
        self.fh = open(self.path, "a+")
        fcntl.flock(self.fh, fcntl.LOCK_EX)
        return self

    def __exit__(self, *exc):
        import fcntl
        fcntl.flock(self.fh, fcntl.LOCK_UN); self.fh.close()


def cancel(hive: Path, task_id: str) -> None:
    Task(Path(hive) / "operator-tasks" / task_id).write("control.json", {"cancel": True})


def status(hive: Path, task_id: str | None = None) -> dict:
    root = Path(hive) / "operator-tasks"
    if not task_id:
        latest = root / "latest.json"
        task_id = json.loads(latest.read_text())["task_id"] if latest.exists() else ""
    if not task_id or not (root / task_id).exists():
        return {"status": "NONE"}
    task = Task(root / task_id)
    st = task.read("state.json")
    if st.get("status") in ("RUNNING", "QUEUED", "IDLE") and st.get("pid") and not _alive(st.get("pid")):
        # matrix 10-16 "jobtruth": two records said RUNNING while their PIDs were gone. What he is told is the truth.
        st = {**st, "status": "STALLED", "recorded_status": st["status"], "worker_alive": False}
    return {**st, "goal": task.read("request.json", {}).get("goal", "")}


def events(hive: Path, task_id: str = "", since: int = 0) -> dict:
    """matrix "eventreplay": every line a job speaks, numbered, so the Orb shows each exactly once, in order, even after
    a reconnect or a turn that returned before the job finished. Read-only."""
    root = Path(hive) / "operator-tasks"
    latest = status(hive)
    tid = task_id if task_id and (root / task_id).is_dir() and re.fullmatch(r"[A-Za-z0-9_-]{1,64}", task_id) else str(latest.get("task_id") or "")
    if not tid:
        return {"task_id": "", "latest_task_id": "", "seq": 0, "lines": [], "status": "NONE"}
    rows = Task(root / tid).rows("speech.jsonl")
    since = max(0, int(since or 0))
    lines = [{"seq": i, "text": str(r.get("text") or ""), "at": r.get("at")} for i, r in enumerate(rows) if i >= since and str(r.get("text") or "").strip()]
    lt = str(latest.get("task_id") or "")
    lseq = len(Task(root / lt).rows("speech.jsonl")) if lt and lt != tid else len(rows)
    st = status(hive, tid)
    return {"task_id": tid, "status": st.get("status"), "seq": len(rows), "lines": lines[-50:], "latest_task_id": lt, "latest_seq": lseq}


def orb_view(hive: Path) -> dict:
    """What the Orb shows beside the card (matrix: receiptcard, gatehud, driving, chips): tools run this turn, the
    model pick, cost, the driving flag and a few chips to tap. Read-only; never the model's own words."""
    st = status(hive)
    tid = str(st.get("task_id") or "")
    tools_run: dict = {}
    if tid:
        task = Task(Path(hive) / "operator-tasks" / tid)
        since = float(st.get("turn_at") or 0)
        for r in task.rows("trace.jsonl"):
            if r.get("event") == "tool" and float(r.get("at") or 0) >= since and r.get("tool") not in ("say", "done", "plan"):
                tools_run[r["tool"]] = tools_run.get(r["tool"], 0) + 1
    goals = []
    root = Path(hive) / "operator-tasks"
    if root.is_dir():
        for d in sorted(root.iterdir(), key=lambda x: x.stat().st_mtime, reverse=True)[:8]:
            g = str((json.loads((d / "request.json").read_text()).get("goal") if (d / "request.json").exists() else "") or "").split("\n")[0].strip()
            if g and g not in goals and len(g) < 90 and g.lower() not in ("stop", "go on"):
                goals.append(g)
    chips = (["How is it going?"] if st.get("status") in ("RUNNING", "QUEUED") else []) + \
            (["Go on"] if st.get("status") == "WAITING_OWNER" else []) + ["Good morning, what's on today?"] + goals[:2]
    jev = st.get("jev") or {}
    return {"task_id": tid, "status": st.get("status"), "step": st.get("step"), "cost_usd": st.get("cost_usd"), "tier": st.get("tier"),
            "model": st.get("model"), "kind": st.get("kind"), "jev": {k: jev.get(k) for k in ("tier", "ne", "picked") if k in jev},
            "driving": st.get("driving"), "verified": st.get("verified"), "tools_run": tools_run, "chips": chips[:4],
            "graph_focus": st.get("graph_focus"),
            "plan": [{"step": x.get("step"), "status": x.get("status")} for x in (st.get("plan") or [])][:30]}


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "run":
        print(json.dumps(run(Path(sys.argv[2]), session=True), default=str))  # the worker stays for his next line
