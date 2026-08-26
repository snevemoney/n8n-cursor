---
name: private-book-install
description: >-
  Path A book pipeline on their site. Draft a callback slot, HITL book,
  no auto-Calendly. Tag the prospect icp_id — clinic, restaurant, law,
  and fitness are not plumber. Cursor plus Grok Bot.
---

# Private book / intake install

**Stack:** Cursor + Grok Bot. Forge assist / GTM brief. Config and SaaS first. Not `paid-slice-funnel` (that is *our* Stripe).

## When
Path A delivery after margin PASS and they said yes (or operator greenlit the brief). Writing the install brief counts. Firing their calendar does not.

## icp_id (do not default plumber)

| Vertical | `icp_id` | Machine / SKU | Book shape |
|----------|----------|---------------|------------|
| Trade / plumber / HVAC / salon | `local-pro` | `private-book-install__local-pro` | Callback-window on *their* site |
| Dental / clinic / physio / vet | `local-clinic` | `review-to-book` + their Cal | Thank-you + book. No PHI |
| Indie restaurant | `restaurant` | `missed-call-book__restaurant` | Book CTA. No auto-voice book |
| Solo law / boutique consult | `law-adj` | `private-book-install__law-adj` | Consult request. No legal advice |
| Fitness / wellness coach | `owner-coach-fitness` | `private-book-install__owner-coach-fitness` | Intake→book. No OF / farm |

Route siblings via `CONTENT/icp-runbooks/INDEX.md`. Do not invent an `icp_id`.

## PASS stack (default)
Cal.com or Calendly **on their account** · Typeform/Tally (or native form) · site CTA · email/SMS **owner** alert · reminder stub · Loom. Client owns keys.

## Steps
1. Confirm `icp_id` from the table. Wrong tag → stop and retag.
2. Brand fit (#14): private/gated vs public Book. Trade = public callback-window, not consumer Calendly theater.
3. **Draft slot** on the brief (weekday window + timezone). Write it. Do not open their Calendly. Do not create the event.
4. Map flow: inquiry → qualify fields → **their** calendar event → owner alert → confirm → remind.
5. Implement with config/SaaS only after Evens says book/install. Screenshot before/after CTA.
6. Alert to the channel they already use. No autonomous client messaging.
7. Hand `proof-30-60-90`. No-show after a live book → `no-show-follow-up`.

## Stop
Book / deploy / pay = operator + `ask-principal`. **HITL book.** No auto-Calendly fire. No auto-voice table book (`restaurant`). Invoice/deposit after the path is live — Money Desk; not our Stripe.

## Never
Auto-book · auto-dial · always-plumber SKU on clinic/restaurant/law/fitness · rebuild their site as v1 · localhost in client copy · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus · operate farms.
