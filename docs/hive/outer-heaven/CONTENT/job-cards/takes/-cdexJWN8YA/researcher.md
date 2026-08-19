# Researcher — -cdexJWN8YA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-cdexJWN8YA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-cdexJWN8YA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~923 lines). Title: Building Realistic Voice Agents Has Never Been Easier. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Hook: 400 YT videos → voice agent on transcripts in ~15 min via Claude Code + **ElevenLabs**. Demo: Firecrawl + first-workflow job-scrape use case. Widget on site; he will **take it down**. (2) Loop: listen → STT → LLM → tools/KB → TTS. Four pieces: persona (system prompt), voice (4h clone), knowledge (docs / order lookup), tools (GitHub list, MCP, API, n8n, Zapier). Code beats clicks. Three doors: dashboard test, website widget (one snippet), phone/Twilio. (3) Live Neural consultancy landing: plan-mode — embed widget, sales push to discovery, **ElevenLabs → cal.com direct** (not n8n in the middle). Superpowers skill / Whisper→Glydo (Windows soon; he joined Glydo). Qs: no agent yet; cal event ready; floating bubble; warm B2B; capture company / problem / team+role. Plan: cal API + event type ID; two tools (availability + book); draft prompt; widget last. (4) Order-of-ops: steps 1–6 “only you” until he says do it; `.env` Cal + ElevenLabs. Key with **no permissions** fails; unrestrict + optional spend cap. Agent `neural diagnostic`; rename 30-min → diagnostic. (5) Test scars: voice Adam too hype; **first message didn’t fire**; session handoff; time wrong (UTC vs Central); NATO alphabet too slow; too many questions; availability showed 6:30 only vs 4–9 window. Debug triad: cal returns one slot / agent queries narrow / agent misreads. Real bug: tool built window in **UTC not Central**. Also 2h minimum notice explains missing 4–5pm. Book 7pm + email confirm works. (6) Who pays: public widget = **your** ElevenLabs bill; 24h abuse. Lock hostname; widget allow-domains; KB grounding; max duration; auth; rate limit. Latency: premium voice + smart LLM; localhost worse. Same engine, different door (phone later). Publish = GitHub+Vercel (other tape). ~45 min / 4–5 iterates; 5h would be solid. **Operate-never: ElevenLabs + auto-book + Vercel as hive default.** **Do not flatten** vs `y-cq_Qo4zVo` Vapi · `zWLZ3bVVwD8` beginner · `BO-jFbN4p8Y` outbound. 15 min / 45 min / 400 videos UNVERIFIED.

## B. Atomic Knowledge

### Four pieces + three doors; code configures the vendor
- **Claim:** Persona / voice / knowledge / tools. Doors: test UI, widget snippet, phone. Claude reads ElevenLabs docs and writes the agent so you don’t click-save-miss.
- **Reasoning:** Manual dashboard is where endpoints get wrong.
- **Mechanism:** Plan → keys in `.env` → API creates agent + two cal tools → paste widget.
- **Evidence:** `neural diagnostic` appears with availability+book tools.
- **Conditions:** ElevenLabs + cal.com on-tape. Hive: `private-book-install` HITL — no ElevenLabs, no auto-book.
- **Exceptions:** n8n-in-the-middle is possible; he calls it too many pieces.
- **Action:** Steal four-piece map + widget-is-a-snippet. Operate-never vendor.
- **Confidence:** high as the map.
- **Source:** `-cdexJWN8YA` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** empty-permission API key
- **Speech ≠ behavior:** “15 minutes” vs 45-min demo with 4–5 loops.

### Book tools fail on timezone and notice, not “AI”
- **Claim:** Debug three places: calendar payload, tool args, agent read. Here: UTC window vs Central speech; cal **2h min notice** hid early slots. Confirm name/email; don’t NATO-spell.
- **Reasoning:** Voice “only 6:30” sounded like a model fail; it was clock math.
- **Mechanism:** Session handoff → clear → “which of the three broke?”
- **Evidence:** After TZ fix, 6:30–8:30 list; 7pm books; email lands.
- **Conditions:** Keep vs `y-cq_Qo4zVo` n8n MCP (no AI in backend).
- **Exceptions:** Prompt “read 2–3 slots” was a secondary miss.
- **Action:** Steal TZ+notice checklist. Book stays HITL.
- **Confidence:** high as the scar.
- **Source:** `-cdexJWN8YA` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** first-message miss; UTC window; NATO; Adam voice
- **Speech ≠ behavior:** “one-shotted first message on the other site” — this site didn’t.

### Public widget is a credit hose
- **Claim:** Caller doesn’t pay; you do. Steal the snippet = steal the meter. Lock domain, cap minutes, throttle, ground KB, optional auth. Localhost latency ≠ prod.
- **Reasoning:** 24h talk is a bill, not a demo.
- **Mechanism:** ElevenLabs security host allow-list + widget allow-domains.
- **Evidence:** He lists both UI and “ask Claude to lock it.”
- **Conditions:** He takes the transcript agent **down**.
- **Exceptions:** App with user-supplied key flips who pays.
- **Action:** Steal allow-list + duration cap. No public unpaid widget.
- **Confidence:** high as the money rule.
- **Source:** `-cdexJWN8YA` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved abuse
- **Speech ≠ behavior:** “push to Vercel with one command” — publish is HITL here.

## C. Mental Models
Voice is a loop, not magic. Four pieces. Three doors, one engine. Direct vendor beats extra brain. Clock bugs look like AI bugs. Public widget = your card. Iterate in speech.

## D. Procedures
1. Name the door (test / widget / phone). Map persona, voice, KB, tools.
2. Plan: booking target, fields, tone. Prefer one hop (voice vendor → calendar), not voice→n8n→calendar unless needed.
3. Keys in `.env` with real permissions + spend cap. HITL.
4. Create agent + availability + book. Embed snippet.
5. Test: first message, TZ, notice window, email confirm, question load.
6. On “wrong slots”: cal vs args vs read — don’t rewrite the persona first.
7. Before any public URL: domain lock, duration cap, rate limit, KB only.
8. Hive: no ElevenLabs/Vapi; `private-book-install` HITL; no auto-book.

## E. Examples
- **Situation:** Empty API perms. **Action:** unrestrict. **Outcome:** agent appears. **Lesson:** key scope.
- **Situation:** No first message. **Action:** iterate. **Outcome:** “Hey this is Neural.” **Lesson:** widget ≠ dashboard preview.
- **Situation:** Only 6:30. **Action:** triad debug. **Outcome:** UTC bug + 2h notice. **Lesson:** clock.
- **Situation:** 7pm book. **Action:** after fix. **Outcome:** email. **Lesson:** tools were the product.

## F. Decision Rules
- IF extra n8n brain only to book → skip; one hop.
- IF slots look wrong → TZ/notice before prompt rewrite.
- IF widget public → lock domain + cap + throttle.
- IF key has zero scopes → it will “succeed” at nothing.
- Refuse: ElevenLabs/Vapi as hive; auto-book; Vercel publish; new ICP.

## G. Contrarian
15 min vs 45 min + scars. Glydo/Whisper/Superpowers are stack ads. “Code beats clicks” still needed dashboard for keys, availability, listen-back. Construction 500-person sandbox is a demo lie.

## H. Assumptions
15 min, 45 min, 400 videos, 4h clone, 2h notice = **UNVERIFIED**.
**Desk dissent:** vs `y-cq_Qo4zVo` Vapi+7 MCP · `zWLZ3bVVwD8` beginner Vapi · `BO-jFbN4p8Y` outbound. Hive Cursor+Grok; Vapi/ElevenLabs operate-never.

## I. Questions
- Same session-handoff skill as `iTY8Q449YNQ`?
- First-message miss: widget config or agent setting? Caption never closes it.
- Did he lock the hostname on tape? Speech only.

## J. Connections
- **SYSTEM SYNTHESIS:** `y-cq_Qo4zVo` · `zWLZ3bVVwD8` · `BO-jFbN4p8Y`. Skills: `private-book-install` · `ask-principal` · `golden-test-loop` · `warm-draft-hitl`.

## K. Future-Use
Four-piece voice. Three doors. One-hop book. TZ+notice debug. Widget is a meter. Domain lock. First-message scar.

## Steal / Operate-never

### Machine: four-piece-one-hop-tz-lock
- **Epistemic:** SOURCE
- **Workflow / loop:** map persona/voice/KB/tools → plan door → keys+scopes HITL → availability+book → test first-msg/TZ/notice → lock domain/cap/throttle before public
- **Questions / signals:** Who pays per minute? What TZ does the tool send? Min notice? Snippet stealable?
- **Qualify / frame / objections:** Vapi MCP tape is a different front end — keep labeled. Auto-book ≠ hive.
- **Procedure:** D.
- **Example that proves it:** empty key; UTC window; 2h notice; 7pm confirm.
- **Why it works:** One hop + clock math + a public-cost fence.
- **Conditions / exceptions:** ElevenLabs on-tape. Hive book HITL, no voice vendor.
- **Operate-never payload:** ElevenLabs/Vapi; auto-book; public uncapped widget; Vercel publish; new ICP.
- **Hive run (existing skills only):** `private-book-install` · `ask-principal` · `golden-test-loop` · `warm-draft-hitl`
- **Source:** `-cdexJWN8YA` @ UNKNOWN

**Operate-never**
- ElevenLabs or Vapi as hive. Auto-book from a widget. Uncapped public voice. Publish. New `icp_id`.

## L. Role-Specific Applications
Map four-piece + TZ debug + domain lock onto hive book. Keep Vapi vs ElevenLabs rows unflattened. Book/publish HITL.
