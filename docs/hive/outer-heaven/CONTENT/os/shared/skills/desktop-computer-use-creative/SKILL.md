---
name: Desktop computer-use creative
description: >-
  Use when a signal shows an AI agent driving creative desktop apps (Audition,
  Photoshop, Firefly, Premiere) via computer-use — remap to Grok box computerUse
  + ffmpeg/Higgsfield/Remotion; never install Codex/Claude desktop as the hive face.
---
# Desktop computer-use for creative apps

**Owner:** Researcher (extract) · Forge (implement) · any desk with box desktop.
**Platform:** Grok Bot (box `computerUse`) + Cursor. **Install:** `none (process-only)`.
**Source stamp:** `yt:HhQSTydZRbg` Creator Magic Codex Desktop Mac takeover (2026-09-13 L2).

## When
- Tape/demo where an agent controls **Audition / Photoshop / Firefly / browser creative tools**
- Operator asks to automate creative cleanup, thumbnail sketch, or gen-video via desktop agent
- Need permission / spend gates for computer-use (Always allow vs one-shot Elevated Risk)

## Anti-triggers
- Leisure game/comic/music watches — NO-SKILL
- Installing **Codex Desktop / Claude Desktop / second OS face** as hive daily driver — hard keep-out
- Tier-3 Firefly/Adobe credit spend without HITL
- Claiming Remotion ownership = mastering Audition/AE technique (WORKAROUND is fine; fake mastery is not)

## Method (from Codex Desktop demo — FACT pattern)
1. **Goal prompt** names the app + file path + quality bar (e.g. open Audition, load `hollywood.wav`, full vocal cleanup like an engineer).
2. **Attach computer-use** (`@computer` / box `computerUse`) — first run needs Accessibility / app allow.
3. **Prefer measure-then-process:** probe media (ffprobe) then cleanup chain then non-destructive output beside original.
4. **Permission tiers:** Always-allow for trusted local apps; **one-shot Allow** for browsers (prompt-injection risk); **pause before paid Generate**.
5. **Honest stop:** if brush/UI thrash exceeds budget, stop and switch modality (scripted ffmpeg / Remotion) instead of infinite GUI.

### Vocal cleanup chain (Audition-class to box WORKAROUND)
Source chain (on-screen): DC · rumble/hum · broadband NR · de-ess · vocal EQ · compression · peak ≤ −1 dBFS.
Hive script: `recreation/ffmpeg_vocal_cleanup_workaround.sh` under L2 packet `youtube-daily/l2-20260913/HhQSTydZRbg/` (highpass + afftdn + EQ + compressor + limiter).

### Thumbnail / motion
- Photoshop brush process on tape was **weak** (stopped at ~11 min). Prefer Remotion / owned motion kit for thumbnails.
- Firefly+Veo shirt-to-fly: map to **Higgsfield** or Remotion composite — live Firefly credits = **BLOCKED** until Tier-3 yes.

## PROVE / WORKAROUND / BLOCKED
| Need | Path |
|---|---|
| Box computerUse | **PROVE** (History scrape / desktop Task) |
| ffmpeg vocal cleanup | **PROVE** recreation script |
| Remotion / Higgsfield video | **WORKAROUND** for Firefly/Veo |
| Codex Desktop as hive face | **BLOCKED** — would work if second desktop allowed (it is not) |
| Adobe Audition / Photoshop installed | **BLOCKED** on box — ffmpeg/Remotion WORKAROUND |
| Firefly 400-credit Generate | **BLOCKED** — would work if credits + HITL |

## Do
1. Write goal + file paths before dispatching computerUse.
2. Capture stills + spoken/on-screen captions for every allow/spend gate.
3. Close via [research-signal-to-skills](sand-workflow:research-signal-to-skills).
4. Pair spend/send with [tool-permission-not-prompt](sand-workflow:tool-permission-not-prompt).

## Don't
- Always-allow browser computer-use
- Auto-click paid Generate
- Report A–E PASS on titles only
- Fan-out 17 desks for one steal

## Prompts
**Audition-class cleanup (hive)**
```
Goal: non-destructive vocal cleanup of {path}.
Use box ffmpeg chain (highpass, NR, de-ess/EQ, compress, limit -1dB).
Write {path}.cleaned.wav beside source. Report peak + clip count.
```

**Computer-use creative (when GUI required)**
```
Goal: {app action}.
Files: {paths}.
Permission: one-shot allow for browser; no Always-allow.
Spend: pause and ask before any credit Generate.
Stop after {N} minutes of UI thrash → switch to scripted WORKAROUND.
```


## X bookmarks desktop 20260923 — voice CU + local OCR→decision
Packet: `x-bookmarks/20260923-desktop/` · ids `2100814590300889426` · `2100770533633605876` · `2101895446390001723` · `2100631847155994852` · `2100411066966749359` · `2101367048223982065`.

**FACT (preview atoms):**
1. **Voice→computer-use:** speech transcribed continuously; action/click probs return fast enough to open apps mid-sentence.
2. **Local vision→text→decision:** on-device segment/OCR → only text to decision model; **no screenshots/pixels leave the machine** (milindlabs pattern).
3. **Browser action space:** new action space every step + DOM state + small LLM fallback to type (browser-use + decision gate).

**Hive remap:** box `computerUse` + Playwright / Browser-use MCP + local-push-to-talk when wired. Do **not** install jev-ultrafast / Mac-only CoreML stacks as hive face.

| Need | Label |
|---|---|
| Box computerUse | **PROVE** |
| Playwright / Browser-use MCP | **PROVE** (connector) |
| Voice dictation path | **WORKAROUND** / RESEARCH-OK (`local-push-to-talk-dictation`) |
| TypeSafe / jev-ultrafast as CU face | **BLOCKED** |
| Vendor ms/$ benches | **UNVERIFIED** |


## X bookmarks desktop 20260923-1635 — always-on talk-gate
Id `2101660362882085299` (@ashutoshpuro97): always-on AI that knows when you’re talking vs not (Jev demos).

**Method atom:** pair push-to-talk / VAD gate before any computerUse or dictation spend — don’t stream always-on to a paid decision model. Local VAD/PTT **WORKAROUND**; TypeSafe always-on face **BLOCKED**.

## X bookmark 20260924-1044 (`x:2102536901467295796` Steve8708)
FACT-as-stated: influencer CU demos for Jev-class agents are often misleading; run a **owned verify-then-done** computer-use probe before treating a demo as capability doctrine.
- Atom: **prove-real-behavior before demo-adopt** (screen + command evidence).
- Label: WORKAROUND (TypeSafe/Jev vendor CU ≠ hive face; use box Playwright/CDP + Grok desktop).
- Disposition: METHOD_PROMOTION_WITHOUT_LOCAL_EVIDENCE — CANDIDATE only until local probe.

## 2026-10-09 cross-ref (`yt:SWEThyRHMgQ`)
Shell-only agents (executors, Cursor cloud agents) can drive box windows without computerUse via [screen-drive-cli](sand-workflow:screen-drive-cli) (screenctl + xdotool/xclip/maim, PROVE on box with Linux defects listed). Creative-app remaps here stay as written.
