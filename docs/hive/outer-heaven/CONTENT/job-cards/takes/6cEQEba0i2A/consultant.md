# Consultant — 6cEQEba0i2A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Prompt caching 80/20. Beats: one day 91M cached tokens ≈ 9M paid (10% of input); week 300M+ cached UNVERIFIED. Claude Code cache window **1 hour** — idle ≥1h un-caches the session. API/sub-agents TTL **5 minutes** (can bump to 1h, costs more). Thorik: Anthropic pages on cache hit-rate (SEVs). High hit = faster, cheaper serve, limits feel bigger. Globally cached: base system + tools (read/write/bash/grep/glob). Rest of tape: how the cache grows and how not to bust it; free token dashboard in Skool. No VTT. UNKNOWN. ~2535 words.

## B. Atomic Knowledge

### Idle time busts the cache; hit-rate is a reliability number
- **Claim:** A 1h window means walk-away-and-return is a cost event. Sub-agents on 5m TTL are a different cost shape.
- **Reasoning:** He wants 80/20, not Thorik’s full paper. Dashboard is a lead magnet.
- **Mechanism:** If we ever care about vendor cache, don’t idle past the window. We do not install Claude to save Claude tokens.
- **Evidence:** “if you leave a session sitting for an hour or longer, then you're going to pay more”
- **Conditions:** 91M / 300M / 10% UNVERIFIED.
- **Exceptions:** Cursor+Grok is a different cache world.
- **Action:** Steal idle-busts-the-meter. Do not install his dashboard. Do not switch to Claude to “save millions.”
- **Confidence:** high as a mechanism; low as our $
- **Source:** `6cEQEba0i2A` @ UNKNOWN — 1h vs 5m TTL
- **Epistemic:** SOURCE


## C. Mental Models

He is reducing anxiety about session limits. He is honest the full article is overwhelming. He still gives a free dashboard.

## D. Procedures

1. Know the idle window if you are on that vendor. 2. Don’t churn context for no reason. 3. Don’t install Claude to save Claude tokens. Avoid: his dashboard as a SKU.

## E. Examples

**Situation:** 91M cached in a day. **Action:** Explain 10% cost + 1h window. **Outcome:** 80/20 talk. **Lesson:** Idle is a leak. Implicit rule: vendor-cache advice is vendor-shaped.

## F. Decision Rules

If the pitch is “save millions of tokens,” we are not on that meter. If we would install Claude Code for caching, stack never.

## G. Contrarian

Field default: caching is too deep. He ships 80/20. Field default: leave the session overnight. He says that busts it.

## H. Assumptions

Token counts UNVERIFIED. Pair `XTBWVVcF3Pk` / `vcU85OrwuV0`.

## I. Questions

What exactly busts the cache in the second half?

## J. Connections

**SYSTEM SYNTHESIS:** Cost-leak tape. Maps to cheapest-pyramid. Not a hive cache product.

## K. Future-Use

Unassigned: idle-window as a cost event; 5m sub-agent TTL vs 1h interactive.

## Steal / Operate-never

### Machine: Idle past the window is a cost event; do not switch stack to save their tokens
- **Epistemic:** SOURCE
- **Workflow / loop:** If on a cached vendor: know TTL → don’t idle past it → don’t churn the prefix → do not install a vendor to “save millions”
- **Questions / signals:** What is the TTL? Are we idling? Are we switching stack for a dashboard?
- **Qualify / frame / objections:** Qualify: they are burning session limits. Frame: 80/20. Objection: “save 91M tokens” — not our meter.
- **Procedure:** No Claude. No token dashboard. No millions-as-FACT.
- **Example that proves it:** 91M cached ≈ 9M paid; 1h Claude Code window; 5m API TTL; Thorik SEVs.
- **Why it works:** Walk-away is a bill. Hit-rate is how limits feel generous.
- **Conditions / exceptions:** His meter. Dated TTLs.
- **Operate-never payload:** Install Claude / his dashboard. Quote 91M/300M as FACT. Switch stack.
- **Hive run (existing skills only):** `slice-build` · `ask-principal`
- **Source:** `6cEQEba0i2A` @ UNKNOWN


### Operate-never
- Install Claude Code / his token dashboard.
- Quote 91M / 300M as FACT.
- Switch stack to save Claude tokens.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “save millions of tokens.” Felt problem is still the leak. We are not on his meter.

**Four-blank after constraint:** No owner hours on this tape.

**Skeptical-customer:** 91M is smash. 1h idle-bust is the honest mechanism. Clients parked.
