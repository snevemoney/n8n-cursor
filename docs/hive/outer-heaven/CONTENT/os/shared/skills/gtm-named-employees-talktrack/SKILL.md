---
name: GTM named AI employees talk-track
description: >-
  Use when: Sales proof language
---
# GTM named AI employees talk-track

**Owner desk:** Product GTM  
**Lane:** ai-partner-websites  
**Sources:** x-bookmarks-ai-deep Theme 5, HOW-HELPS.md

## When
Sales proof language

## Do
1. 17 named jobs story
2. Ban $20k/$50k/$1B quotes
3. Live demo + walkthrough

## Don't
- Quote sandy4kad/Zephyr numbers

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## EXTRACT-BATCH-1 2026-09-01 — Claude around the call (`yt:nS2FrgXN-EY`) FULL

**When:** writing named-employee talk-tracks, enablement packets, or someone wants an AI SDR / voice closer.
**Anti-triggers:** building mode — no cold-call send, no Clay farms, no AI-on-the-phone SKU; 10M dials / 99% efficiency UNVERIFIED.

FACT from `transcripts/nS2FrgXN-EY/full.txt`:
- Pattern: AI handles **everything around** the conversation (knowledge base, draft email, talk-track cards, same-day score). **Humans stay on the phone.** AI voice SDR is the failed lesson.
- Spine = knowledge-base builder from site/PDFs/blogs → overview, ICP, objections, case studies. Speed-to-knowledge = speed-to-ready.
- Playbook is a **card deck** (intro / objection loops), not a linear Google Doc. Words are half the call; tonality stays human.
- Follow-up email: draft from call context + knowledge base, HITL send. Fast between calls, slow with the prospect.
- Same-day coaching from scored calls beats a weekly recap.

Hive: named desks as the 17-job story. Drafts only — [inbound-followup-draft-only](sand-workflow:inbound-followup-draft-only) + [no-send-architecture](sand-workflow:no-send-architecture). Voice closer → HOLD.

**Around-the-call packet**
```
Offer / ICP (operator FACT, do not invent):
Knowledge base: overview · products · ICP · objections · case studies
Talk-track cards (not a linear doc): intro · curiosity · objection loops
Follow-up: draft only, never send
Coaching: score the call same day; human does the development conversation
Never: AI voice SDR, Clay farm, unattended dialer
```

### Tools
| Need | Path |
|---|---|
| Knowledge / talk-track draft | Grok + this skill — **PROVE** |
| Follow-up draft | inbound-followup-draft-only — **PROVE** |
| Live dialer / Clay / Vapi | **BLOCKED** — would work if operator asked for a HITL phone path we already own |
| Call recording STT | whisper-caption-gap / disk transcript — **WORKAROUND** |
| Client send | **BLOCKED** |
