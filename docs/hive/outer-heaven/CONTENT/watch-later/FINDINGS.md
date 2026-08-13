# Research: YouTube Watch Later
**Type:** watchlater
**Source:** native Chrome tab `youtube.com/playlist?list=WL` (this cloud session)
**URL:** https://www.youtube.com/playlist?list=WL
**Logged in:** False
**Items analyzed:** 0
**Coverage:** 0/0 items in ledger
**Analyzed:** 2026-08-13
**Skill:** scripts/hive/grok-skills/researcher-research-to-system.md

## Executive summary

- **FACT:** Native browser opened `youtube.com/playlist?list=WL` but the session is **signed out**.
- **FACT:** Item count is **0** — this is an auth miss, not proof the playlist is empty.
- **DON'T:** Invent Watch Later videos, substitute subscriptions, or treat Gmail YouTube mail as the queue.
- **P0:** Re-run scrape on the **operator-logged** YouTube tab (Grok computer / local Chrome), then this CLI with `--from-json`.

## Probe evidence

- Native Chrome window title 'YouTube - Google Chrome' already open; URL youtube.com/playlist?list=WL
- Left sidebar Sign in CTA: 'Sign in to like videos, comment, and subscribe'
- Header avatar/notification slots were empty placeholders
- DevTools: document.title === 'YouTube'
- DevTools: document.querySelectorAll('ytd-playlist-video-renderer').length === 0
- DevTools: document.body.innerText === Home / Shorts / Subscriptions / You only
- Console: googlevideo.com 403s; no playlist rows rendered
- Cookie DB after visit: visitor-only (GPS, PREF, VISITOR_INFO1_LIVE, VISITOR_PRIVACY_METADATA, YSC, __Secure-ROLLOUT_TOKEN, __Secure-YNID) — no SAPISID or LOGIN_INFO
- Chrome CDP port 9222 was flagged on the process but not listening; scrape used the on-screen tab + DevTools, not a fresh logged-out navigation away from WL
- Cloud agent Chrome is not the operator's desktop YouTube session

## Themes / clusters

_None — no items. Ledger is empty on purpose._

## Actionable implementables (ranked)

| Priority | Action | Owner agent(s) | Hive target |
|----------|--------|----------------|-------------|
| P0 | Re-scrape WL from a logged-in YouTube session | Researcher | CONTENT/watch-later/latest.json |
| P1 | Keep watchlater as a first-class research type | Researcher | researcher-watchlater-implement.py |
| P2 | Remember cloud Chrome ≠ operator Google session | Librarian | OPERATOR_MEMORY LESSONS |

## Quarantine / ignore

- Do not use Gmail YouTube memberships or live alerts as a Watch Later stand-in.
- **UNVERIFIED / not WL:** Gmail YouTube mail shows channel memberships (What's The Dirt, Grid, MCT, King Akademiks, hoe_math, President Rose) and a 2026-08-12 Zaffy live alert. Explicitly **not** the Watch Later queue.

## What we implemented

- `scrape-youtube-watch-later.py` + `researcher-watchlater-implement.py` + `watchlater` CLI.
- Skill, doctrine, cookbook, scenario, verify self-tests.
- Repo mirror: `docs/hive/outer-heaven/CONTENT/watch-later/`
