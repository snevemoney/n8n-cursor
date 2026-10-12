---
name: Dialbot Bland outbound
description: >-
  Use when giving Grok Bot outbound phone calls via Bland (Dialbot template),
  phone-tree info gather, or Matt Palmer dial-bot setup. Anti-triggers: inbound
  text-HITL only (use phone-hitl-routine), voice-SDR farms, client cold-calls,
  buying Bland credits without Tier-3 HITL.
---
# Dialbot → Bland outbound calls

**Owner:** Researcher (method) · Forge (connector install) · Operator (Tier-3 credits)
**Platform:** Grok Bot
**Install:** Dialbot template `https://x.ai/bot/NJXi2SWEuhNxjOjspMMPi` + Bland connector/API (not in plugins catalog as of 2026-09-12)
**Source:** `yt:Fmr_72cYZo8` Matt Palmer — packet `/workspace/research/youtube-daily/l2-20260912/Fmr_72cYZo8/`

## When
Operator wants a Grok Bot that can **place** phone calls and report transcripts (hours check, phone-tree, info gather).

## Do
1. Install Dialbot template (link above). Template intentionally omits bundling Bland so importers wire their own connector.
2. First-run: supply **Bland API key** + **voice ID** via Grok **secure vault** prompts — never paste in chat.
3. Bland: `app.bland.ai` → Settings → API key; Voices/Studio → stock (maya/Josh) or clone UUID; add credits (**Tier-3 HITL**).
4. Confirm destination number, purpose, talking points before dial.
5. After call: read Bland console transcript/recording; tune prompt if agent hangs up early.
6. Optional: chain other bots → Dialbot.

## Don't
- Paste API keys or phone numbers in chat
- Buy credits / call real businesses without operator yes
- Nefarious / spam / unattended SDR farms (presenter ban risk)
- Claim live PROVE when Bland MCP/connector is missing
- Collapse this into phone-hitl-routine (that skill is inbound nudge only)

## Tools
| Need | Path |
|---|---|
| Dialbot template | `https://x.ai/bot/NJXi2SWEuhNxjOjspMMPi` — **PROVE** link exists |
| Method packet | `/workspace/research/youtube-daily/l2-20260912/Fmr_72cYZo8/` — **PROVE** |
| Bland plugin SearchPlugins | none (2026-09-12) — **BLOCKED** would work if Bland connector listed + auth |
| Bland MCP in status | absent — **BLOCKED** would work if Bland MCP connected |
| Live outbound call | **BLOCKED** would work if API key + credits + voice ID + connector |
| Inbound phone nudge | phone-hitl-routine — **WORKAROUND** for different job |
| Twilio-docs MCP | docs only — **WORKAROUND** not Bland calling |

## Prompts
**First-run setup**
```
Install Dialbot template. Ask for Bland API key + voice ID via secure vault only.
Confirm: number, purpose, talking points. Then dial. Report transcript + recording link.
Never paste secrets in chat. Stop if credits/connector missing — say BLOCKED would work if we had X.
```

**Info-gather call**
```
Call {number}. Goal: {questions}. Confirm with me first. After hangup, summarize answers + confidence. If voice agent fails, note prompt fix.
```

## Recreation status (2026-09-12)
- Evidence A–E on disk (stills, demo clip, captions).
- Live ring **not** reproduced on hive (no Bland connector/credits).


## X bookmarks 20260930-1616-desktop — AI voice apps repo catalog

Packet: `/workspace/research/packets/x-bookmarks/20260930-1616-desktop/` · `x:2105353229991293360` @RoundtableSpace.

**FACT (status expand):** Named 10 public GitHub repos for AI voice apps:
1. `openai/whisper` 2. `SYSTRAN/faster-whisper` 3. `hexgrad/kokoro` 4. `fishaudio/fish-speech`
5. `myshell-ai/OpenVoice` 6. `FunAudioLLM/CosyVoice` 7. `livekit/agents` 8. `coqui-ai/TTS`
9. `rhasspy/piper` 10. `snakers4/silero-vad`

**Map:** Catalog = RESEARCH-OK watchlist / import-gate propose cluster — **not** hive install this fire.
- Box STT path stays [summarize-audio-video](sand-workflow:summarize-audio-video) (**PROVE**).
- Outbound phone stays Bland Dialbot (**BLOCKED** until connector+credits).
- LiveKit Agents / Piper / Kokoro / OpenVoice / CosyVoice / Fish Speech / Coqui / Silero = **CANDIDATE** research; do not replace Bland as hive face without Tier-3 + import-gate.

| Need | Label |
|---|---|
| Box Whisper CAPTION_GAP | **PROVE** |
| Bland Dialbot outbound | **BLOCKED** (connector+credits) |
| Catalog repos as hive deps | **CANDIDATE** → awesome-skill-import-gate (cluster ≤1 GAP) |

Anti: auto-clone all 10; mint voice-studio skill; swap Bland for LiveKit without operator. Install: **none this fire**. NO mint.

## 2026-10-10 full study — local voice stack proof (X @RoundtableSpace 10-repo list, @liambraus "free ElevenLabs" = `debpalash/VoiceStudio`)
- **Piper verified on box** (`/tmp` venv, `pip install piper-tts`, voice `en_US-lessac-medium` 63 MB from `huggingface.co/rhasspy/piper-voices`): text → 4.4 s WAV in ~1 s CPU; round-trip through faster-whisper `base` returned the sentence word-for-word. Use for offline narration drafts / scratch VO; Bland stays the phone face.
- `debpalash/VoiceStudio` (the 19k-star "646 languages" repo in the video, identified from keyframes): AGPL-3.0, Electron + Python backend, default engine k2-fsa/OmniVoice, local API + MCP server. Not run (torch-scale install; AGPL needs review before any product use) → CANDIDATE behind import gate.
