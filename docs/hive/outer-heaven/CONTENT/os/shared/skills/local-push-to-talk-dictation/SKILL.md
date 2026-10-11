---
name: Local push-to-talk dictation
description: >-
  Use when replacing Wispr Flow with a local Mac push-to-talk dictation app via
  Cursor — Speech Analyzer / Parakeet, HUD, dictionary; never Claude Code required.
---
# Local push-to-talk dictation

**Owner desk:** Big Boss / Researcher (operator Mac)  
**Sources:** Pat Simmons `yt:IMQw3aHjf2Q` (I Cancelled Wispr Flow & Built This Instead)  
**Remap:** Claude Code one-shot → **Cursor** agent on Mac. Hive does not install a second Claude desktop.

## When
Operator wants push-to-talk dictation that stays on-device (privacy / cost), feeding [voice-ramble-session-context](sand-workflow:voice-ramble-session-context) dumps.

## Architecture (FACT from tape)
Shell (Swift Mac app) · HUD waveform · hotkey (Fn / right-control) · mic audio · STT (macOS Speech Analyzer/Transcriber; Parakeet fallback) · optional local LLM cleanup · text injection at cursor · history + custom dictionary.

## Do
1. Scaffold with Cursor on Mac: push-to-talk, HUD, Accessibility + Mic permissions.
2. Prefer **macOS Speech Analyzer** first (no model download). Parakeet via Hugging Face as optional A/B.
3. Add dictionary corrections (e.g. “Claude Code”, brand names).
4. Wire dumps into voice-ramble / session-bootstrap — dictation is input, not a product SKU.
5. Keep comparison metrics labeled; Wispr valuation / “$280M” / “$2B” / “$15/mo” = **UNVERIFIED** marketing claims.

## Don't
- Require Claude Code / Claude desktop (**WORKAROUND:** Cursor)
- Paste API keys in chat for cloud STT when local path works
- Auto-send dictated text to clients
- Install DeepSeek harness / second agent desktop for this
- Treat Windows path as live on hive Mac without a separate Parakeet build

## Tools
| Need | Path |
|---|---|
| Build | Cursor on Mac — **PROVE** (operator machine) |
| STT primary | macOS Speech Analyzer — **PROVE** when Mac online |
| STT fallback | Parakeet local model (HF curl) — **WORKAROUND** |
| Cloud Wispr | **BLOCKED** — local app **WORKAROUND** |
| Claude Code | **BLOCKED** — Cursor **WORKAROUND** |
| Caption Whisper (YouTube L2) | [whisper-caption-gap](sand-workflow:whisper-caption-gap) — different job — **PROVE** on box |

## Prompts
**ASR source:** `yt:IMQw3aHjf2Q` Whisper LIVE (Pat Simmons). FACT architecture from tape.

**Scaffold Murmur-class app (FACT one-shot plan from tape)**
```
I want a push-to-talk dictation app (Wispr Flow clone class). Look up the product shape.
Architecture for MY machine (Cursor on Mac — NOT Claude Code required):
- Shell: proper Swift macOS app (not terminal-only)
- HUD: waveform while holding hotkey
- Hotkey: Fn or right-control (CGEvent tap)
- Audio: mic
- STT primary: macOS Speech Analyzer / Speech Transcriber (100% local, no API, no model download)
- STT fallback: Parakeet (NVIDIA local; HF curl download — optional A/B)
- Optional cleanup LLM: punctuation / cut ums (local only)
- Injection: text at cursor; watch Electron/AX silent-failure (Cursor classic AX)
- Permissions: Accessibility + Microphone
- Later: history window + custom dictionary (fix “Claude Code”, brand names)
- Design direction optional: quirky tape-recorder — avoid neon vaporwave purple/pink
No cloud STT. No secrets in chat. No DeepSeek harness.
```

**Engine comparison (FACT from tape side-by-side)**
```
Build a tiny comparison HUD: Mac Speech Transcriber vs Parakeet vs (optional) Wispr DB latency read.
Record one rant; report latency + transcript diffs.
Label vendor valuation / $15/mo / $280M / $2B as UNVERIFIED marketing claims.
Prefer Apple native for Mac path (no HF required); ship Parakeet instructions for Windows separately.
```

**Dictionary + feed voice-ramble**
```
Add dictionary phrases: [Claude Code, brand, people].
Prove correction appears in history.
Then dump dictation → goals · constraints · links · success check ([voice-ramble-session-context]).
```

## Tibo morning dump (`yt:4qjEgPojjzM`)
FACT: he dumps the day by voice into an agent that already has tools. Hive: this skill, then short loops. Not ChatGPT Voice / Codex Ultra. $ and token-speed claims **UNVERIFIED**.


## WL26-100 remaining L2 2026-08-27 — Fluid Voice local STT (PROVE ASR)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2-REMAINING.md`

`yt:jMAe1h39rHo` FACT: Fluid Voice runs on-device (live preview while talking). WhisperFlow cloud word-cap = HIS complaint. Hive path stays this skill (Wispr already closed). Do not mint a Fluid Voice SKU. Do not send operator voice to a new cloud STT.

## Wave T addendum 2026-09-09 (`yt:lIDxTzABK94`)
Kevin Stratvert top-5 cloud TTS catalog (ElevenLabs/Murf/Play/WellSaid/Hume + Zapier). Packet: `/workspace/research/youtube-daily/repass-20260909/lIDxTzABK94/`. Prefer this skill’s local PTT path; cloud TTS **BLOCKED** as default; voice-clone needs consent gate (`dQ841`). See `recreation/VOICE_TTS_COMPARE_GATE.md`.

## Screen-aware dictation (`yt:km54y7Xd_7g`) — 2026-09-27 Cap≤1 FACT

Packet: `/workspace/research/youtube-daily/l2-20260927/km54y7Xd_7g/` · channel heyclicky · 120s.

**Steal:** PTT STT is not enough — inject **active-screen context** (AX/OCR/screenshot text) into the dictated payload so the agent/email reply matches the app in front of you (Notes→coding prompt, Gmail→voice reply). Tape also shows companion agent ("Clicky") refusing `xcodebuild` when it risks TCC and keeping a local worker on `:8787`.

**Hive map**
| Tape | Path | Status |
|---|---|---|
| heyclicky Mac HUD + screen context | this skill + compose helper | **WORKAROUND** |
| Live Mac Accessibility capture this fire | operator Mac session | **BLOCKED** — would work if Mac AX available |
| Install heyclicky.com / Clicky SKU | — | **NO-INSTALL** (building mode) |
| Recreation | `l2-20260927/km54y7Xd_7g/recreation/screen_aware_prompt.py` | **PROVE** selftest |

**Prompt add (screen-aware compose)**
```
SCREEN CONTEXT:
[paste AX/OCR/active window text]

DICTATION:
[push-to-talk transcript]

Return: (1) what I mean (2) exact next edit/command (3) risks.
For email: write reply in my voice from thread context + dictation only.
```

**Anti-triggers:** do not mint a Clicky/heyclicky desk or cloud STT SKU; do not treat Remotion as relevant; Whisper YouTube L2 ≠ this product.

## X bookmarks 20261001-1028-desktop (`x:2105367304817250566` @Jhaddix)
Verbose multi-page dictation of current understanding STRENGTHENS the dump path feeding voice-ramble. Dictation remains input, not SKU. Pair [voice-ramble-session-context](sand-workflow:voice-ramble-session-context).
