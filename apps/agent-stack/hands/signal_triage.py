"""Free triage of Evens's Watch Later before any paid watching (Evens 2026-10-16: whole Watch Later for $0-20 without
lowering quality). Rules only — no model call. Every video gets a tier, a priority, a lens and a frame rate:

  deep   — AI agents, Jarvis, coding, automation, MCP, tools he builds with: full watch, 1 frame/s, all methods
  studio — motion graphics, design, editing, 3D: studio lens, high frame rate
  biz    — business, marketing, money, investing: full watch, 1 frame/s
  light  — podcasts, interviews, talking heads: full watch at 1 frame / 5 s (the screen barely changes)
  later  — not recognised by the rules: listed, watched only if he promotes it
  skip   — gaming, film/TV theories, gossip, entertainment: listed, not watched unless he asks

Output (repo, next to the other signal indexes): index/triage.csv + TRIAGE.md, and an xlsx he approves.
"""
from __future__ import annotations

import csv
import json
import re
from pathlib import Path

FREE_HOURS_PER_DAY = 8.0  # Google AI Studio free tier: about 8 hours of YouTube video per day

DEEP = re.compile(r"(?i)\b(jarvis|agent(ic|s)?|claude|codex|cursor|copilot|gpt|openai|gemini|grok|llm|mcp|n8n|automat\w*|"
                  r"ai\b|a\.i\.|vibe ?cod\w*|cod(e|ing)|python|javascript|typescript|api|github|repo|prompt\w*|rag\b|"
                  r"workflow|zapier|make\.com|supabase|vercel|lovable|bolt|windsurf|ollama|local model|open.?source|"
                  r"browser.?use|computer.?use|voice ai|second brain|obsidian|notion|saas|no.?code|deploy|server|"
                  r"skill(s)?\b|tool(s)?\b.*(ai|agent)|build(ing)? (an?|my|your) )")
DEEP_CHANNELS = re.compile(r"(?i)nate herk|zubair|cole medin|tech with tim|robonuggets|syntax|chase ai|simon scrapes|"
                           r"ai jason|matthew berman|wes roth|all about ai|david ondrej|liam ottley|greg isenberg|"
                           r"fireship|theo|primeagen|indydevdan|ai search|sam witteveen|prompt engineering")
STUDIO = re.compile(r"(?i)\b(motion graphics?|mograph|after effects|kinetic typ\w*|logo (reveal|animation)|"
                    r"blender|cinema ?4d|c4d|houdini|3d\b|vfx|cgi|davinci|premiere|final cut|color grad\w*|editing|edit like|"
                    r"transitions?|figma|ui design|ux|web ?design|typography|design inspiration|branding|logo design|"
                    r"thumbnail|capcut|remotion|lottie|rive\b)")
BIZ = re.compile(r"(?i)\b(business|startup|founder|ceo|entrepreneur\w*|marketing|sales|agency|clients?|offer|funnel|"
                 r"ecommerce|e-commerce|dropship\w*|amazon fba|shopify|side hustle|make money|revenue|profit|"
                 r"invest\w*|stocks?|etf|portfolio|wealth|finance|tax(es)?|real estate|crypto|bitcoin|trading)")
LIGHT_CHANNELS = re.compile(r"(?i)valuetainment|pbd podcast|diary of a ceo|kevin samuels|joe rogan|lex fridman|"
                            r"impaulsive|flagrant|full send|club shay shay|breakfast club|podcast")
SKIP = re.compile(r"(?i)\b(gameplay|let'?s play|walkthrough|speedrun|gaming|game theory|film theory|food theory|"
                  r"trailer|reaction|reacts?|anime|manga|comics?|marvel|dc\b|movie|tv show|episode \d|season \d|"
                  r"music video|official video|lyrics|top \d+ (games|movies|anime)|ps5|xbox|nintendo|fortnite|"
                  r"gta|call of duty|elden ring|pokemon)")
SKIP_CHANNELS = re.compile(r"(?i)gameranx|game theorists|film theorists|food theorists|new rockstars|dashiegames|"
                           r"spawn wave|variant comics|afrosenju|the infographics show|aba n preach|datruthdt|"
                           r"mediocre tutorials")
STUDIO_MAKING = re.compile(r"(?i)\b(animation|animated|3d|vfx|edit\w*)\b.*\b(tutorial|how (i|to)|made|making|breakdown|"
                           r"workflow|process|course|tips)\b|\b(tutorial|how (i|to)|made|making|breakdown)\b.*\b(animation|"
                           r"animated|3d|vfx|commercial|edit\w*)\b")
GOSSIP = re.compile(r"(?i)\b(highlights?|drama|prank|vlog|tier list|diss|beef|exposed|fan calls?|caught|cheat(ed|ing)|"
                    r"reacts?|reaction|roast(ed)?|mukbang|challenge)\b")
LENS_FPS = {"deep": 1.0, "biz": 1.0, "studio": 5.0, "light": 0.2, "later": 0.0, "skip": 0.0}


def seconds(length: str) -> int:
    n = 0
    for part in str(length or "").strip().split(":"):
        if not part.isdigit():
            return 0
        n = n * 60 + int(part)
    return n


def classify(video: dict) -> dict:
    title, channel = str(video.get("title") or ""), str(video.get("channel") or "")
    hay = f"{title} · {channel}"
    if GOSSIP.search(hay) or SKIP_CHANNELS.search(channel):
        tier, prio, why = "skip", 9, "entertainment/gossip"
    elif STUDIO.search(title) or STUDIO_MAKING.search(title):
        tier, prio, why = "studio", 2, "design/motion craft in the title"
    elif DEEP_CHANNELS.search(channel) or DEEP.search(title):
        tier, why = "deep", ("AI/automation creator" if DEEP_CHANNELS.search(channel) else "AI/agents/coding in the title")
        prio = 1 if re.search(r"(?i)jarvis|agent|claude|codex|computer.?use|browser.?use|mcp|zubair", hay) else 2
    elif SKIP.search(title):
        tier, prio, why = "skip", 9, "entertainment/gaming"
    elif LIGHT_CHANNELS.search(channel):
        tier, prio, why = "light", 5, "podcast/interview (talking heads)"
    elif BIZ.search(title):
        tier, prio, why = "biz", 3, "business/money in the title"
    else:
        tier, prio, why = "later", 7, "not recognised: listed, watched only if he promotes it"
    secs = seconds(video.get("length"))
    return {"id": video.get("id"), "title": title, "channel": channel, "length": video.get("length") or "", "seconds": secs,
            "tier": tier, "priority": prio, "lens": "studio" if tier == "studio" else "learn", "fps": LENS_FPS[tier],
            "reason": why, "link": video.get("link") or ""}


def plan(rows: list) -> dict:
    hours = {t: round(sum(r["seconds"] for r in rows if r["tier"] == t) / 3600, 1) for t in LENS_FPS}
    count = {t: sum(1 for r in rows if r["tier"] == t) for t in LENS_FPS}
    watch_h = sum(h for t, h in hours.items() if t not in ("skip", "later"))
    return {"count": count, "hours": hours, "watch_hours": round(watch_h, 1),
            "free_days": round(watch_h / FREE_HOURS_PER_DAY, 1)}


def run(watch_later: Path, done_ids: set, out_dir: Path) -> dict:
    vids = json.loads(watch_later.read_text())
    rows = sorted((classify(v) for v in vids if v.get("id") not in done_ids), key=lambda r: (r["priority"], r["seconds"]))
    out_dir.mkdir(parents=True, exist_ok=True)
    fields = ["priority", "tier", "lens", "fps", "id", "title", "channel", "length", "seconds", "reason", "link", "evens_override"]
    with (out_dir / "triage.csv").open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=fields, extrasaction="ignore")
        w.writeheader(); w.writerows({**r, "evens_override": ""} for r in rows)
    p = plan(rows)
    lines = ["# Watch Later triage (free, rules only)", "",
             f"{len(rows)} videos not yet learned. Change any row's `evens_override` (deep/studio/biz/light/skip) to move it.", "",
             "| Tier | Videos | Hours | How it is watched |", "|---|---|---|---|"]
    how = {"deep": "full watch, 1 frame/s, every method", "studio": "studio lens, 5 frames/s", "biz": "full watch, 1 frame/s",
           "light": "full watch, 1 frame / 5 s", "later": "listed; promote to watch", "skip": "listed only"}
    lines += [f"| {t} | {p['count'][t]} | {p['hours'][t]} | {how[t]} |" for t in LENS_FPS]
    lines += ["", f"To watch: **{p['watch_hours']} h** → about **{p['free_days']} days** on the free tier "
              f"({FREE_HOURS_PER_DAY:g} h of video per day), priority 1 first."]
    (out_dir / "TRIAGE.md").write_text("\n".join(lines) + "\n")
    return {**p, "rows": len(rows)}


if __name__ == "__main__":
    import sys
    sys.path.insert(0, str(Path(__file__).parent))
    import signals as S
    print(json.dumps(run(S.CACHE / "watch-later.json", S.known_ids(), S.worktree() / S.INDEX)))
