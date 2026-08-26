# Librarian — -cdexJWN8YA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-cdexJWN8YA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-cdexJWN8YA/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Building Realistic Voice Agents Has Never Been Easier
**Channel:** Nate Herk | AI Automation
**Kind:** video (~7804 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Hook: Claude Code + **ElevenLabs** in NL. 15-min "Nate's AI" on **400** YouTube transcripts (Firecrawl mention in the live call). Widget on his site — **he will take it down**. Manual ElevenLabs = prompt, first message, KB (doc vs Supabase/Pinecone/NotebookLM), tools. Four pieces: **persona / voice / knowledge / tools**. Three doors: dashboard test, **website widget** (one snippet), **phone** (Twilio). Same engine, different door. Code beats clicks.
2. Live: VS Code + paid Claude Code on a **Neural** consultancy landing (Code-spun). Plan mode: embed widget, sales persona, push **cal.com** booking (name/email → book; not ElevenLabs→n8n→cal). Superpowers skill + **Whisper** on tape; he plugs **Glydo** (faster/private; Windows "in a week"; he joined the team). Answers: no agent yet; cal account + event ready; direct API; floating bubble; warm B2B; capture company / problem / team+role. Plan: cal key + event ID, check-availability + book tools, prompt, widget. Why ElevenLabs: **4-hour voice clone** + UI. Affiliate link.
3. Code first dumps dashboard work on him; he says do it; `.env` for Cal + ElevenLabs. ElevenLabs key with **no permissions** fails — unrestrict or scope; optional monthly spend cap. Minutes later: agent **Neural Diagnostic**, 30-min event, rename tip. Localhost widget. Failures: voice "Adam" too AI; **first message doesn't fire** (worked one-shot on another site); session-handoff / clear. Next: first message works; **time wrong** (UTC vs Central); must confirm name/email spelling; NATO alphabet too slow; temperature down; cal availability 9–5 then he opens 9 a.m.–9 p.m. for the demo.
4. Construction-founder roleplay: too many questions; tool returns **only 6:30** though calendar looks open. Debug fork: cal wrong / agent query wrong / agent misreads. Transcript turn 16: tool built the window in **UTC not Central** — real bug; "read back 2–3 slots" was secondary. Localhost latency worse than live. Widget: colors, text-while-on-call, live transcript (Code added). After fix: "don't ask, book tonight" → 6:30–8:30 Central; books **7:00**; confirm email lands. Missing 4:30/5:00 = cal **2-hour minimum notice**, not the tool. ~**4–5 iterates / ~45 min** (vs 15-min hook).
5. Who pays: public widget = **your** ElevenLabs bill; 24h abuse possible. Steal the snippet = steal the agent. Lock **hostname allow-list** (dashboard + widget). Ground on real docs. Cap duration / require auth / rate-limit public pages. Premium voice + smart LLM = more latency. Then: same agent on a phone. Publish path spoken: GitHub → **Vercel** (not shown). Lock-down brainstorm before you leave it up.
Gap: full prompt, tool schemas. Timestamp UNKNOWN. 400 / 15 min / 45 min UNVERIFIED. ElevenLabs / cal.com / Glydo / Vercel / Claude on-tape. Neural ICP parked. Complements `y-cq_Qo4zVo` (Vapi) — do not flatten.

## B. Atomic Knowledge

### Four parts, one engine, many doors; debug the tool clock; lock the host before it's public
- **Claim:** Persona / voice / knowledge / tools. Widget, dashboard, and phone share the agent. NL + keys beat dashboard clicking — until permissions, first-message, and **timezone on the tool** break. Iterate in the ear, not the docs. Session-handoff before the window rots. Public widget is a **credit attack surface**. Hostname lock + duration cap + grounding. 15-min hook vs 45-min live. He will not leave the transcript bot up.
- **Reasoning:** Same handoff as `iTY8Q449YNQ`. Book is a hard step. Hive does not install ElevenLabs/Vapi/Glydo.
- **Mechanism:** plan → keys with scopes → two cal tools → listen → name the fail (voice / greeting / TZ / notice) → handoff → lock host → HITL publish.
- **Evidence:** no-permission key; first-message miss; UTC window; 2-hour notice; confirm email; take-down of the 400-video bot.
- **Conditions:** 15/45 min, 400 videos UNVERIFIED.
- **Exceptions:** Do not auto-book. Do not leave an unlocked widget.
- **Action:** File four-parts, same-engine-three-doors, TZ-on-the-tool, host-allow-list, who-pays. Do not publish the widget.
- **Confidence:** high as a voice-widget anatomy
- **Source:** `-cdexJWN8YA` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** permissions; first message; UTC; NATO; 6:30-only
- **Speech ≠ behavior:** "15 minutes / never been easier" vs 4–5 iterates and a TZ bug; "take it down" vs he still teaches publish-to-Vercel

## C. Mental Models
Loop not magic. Same engine, different door. Code beats clicks until the clock is wrong. Who pays for talk time. Stealable snippet. Latency is a voice×model tax. Skool room.

## D. Procedures
1. Name persona, voice, knowledge, tools.
2. Plan; put scoped keys in `.env`.
3. Check-availability + book as two tools.
4. Listen; write the fail in one sentence.
5. Handoff/clear; fix TZ on the **tool**, not only the prompt.
6. Check cal limits (min notice) before blaming the model.
7. Hostname allow-list + duration cap before any public URL.
Avoid: ElevenLabs as hive; unlocked widget; auto-book; Glydo as hive STT.

## E. Examples
**UTC window:** Situation — only 6:30 shown. Action — three-way debug. Outcome — tool used UTC. Lesson — the clock lives on the tool call.

**2-hour notice:** Situation — still no 4:30. Action — open cal limits. Outcome — working as designed. Lesson — booking product ≠ model bug.

## F. Decision Rules
- IF the key has no scopes → it will create nothing.
- IF slots look wrong → check TZ, then min-notice, then the prompt.
- IF the widget is public → lock host and cap minutes.
- IF someone can copy the snippet → they can spend your credits.
- Refuse: auto-book; Vercel publish as this session's job; ElevenLabs as hive.

## G. Contrarian
Against dashboard-first. Against n8n-in-the-middle for a simple book (this tape). Against leaving a demo widget up (he says he won't).

## H. Assumptions
Caption-only. Complements `y-cq_Qo4zVo` / `zWLZ3bVVwD8`. Keep 15 vs 45. Keep Whisper→Glydo as on-tape, not a stack change.

## I. Questions
Did hostname lock ever get configured on Neural? Did the 400-video bot stay down?

## J. Connections
SYSTEM SYNTHESIS → session-handoff; book HITL; do not flatten Vapi vs ElevenLabs.

## K. Future-Use
Four-parts + TZ-on-tool + host-allow-list + who-pays as atoms.

## Steal / Operate-never

### Machine: listen, name the fail, fix the tool clock, lock the host
- **Epistemic:** SOURCE
- **Workflow / loop:** plan → scoped keys → two tools → listen → debug fork → handoff → allow-list → HITL book/publish
- **Questions / signals:** Did it greet? Whose TZ? Min notice? Who pays per minute?
- **Qualify / frame / objections:** Neural is a demo consultancy. 15 minutes is a hook.
- **Procedure:** D above.
- **Example that proves it:** UTC bug; 2-hour notice; take-down of the transcript bot.
- **Why it works:** The ear finds what the dashboard hid.
- **Conditions / exceptions:** Times UNVERIFIED. Hive does not embed ElevenLabs.
- **Operate-never payload:** Unlocked widget. Auto-book. Glydo/ElevenLabs as hive. Vercel-now.
- **Hive run:** File who-pays + host-lock. Book stays HITL.
- **Source:** `-cdexJWN8YA` @ UNKNOWN

### Operate-never
- ElevenLabs / Vapi / Glydo / Claude as hive. Auto-book. Unlocked public widget. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
Upgrade old take: add UTC-tool + 2-hour notice + who-pays. Do not stand Neural. Hard steps HITL.
