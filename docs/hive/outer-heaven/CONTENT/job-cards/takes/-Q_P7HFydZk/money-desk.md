# Money Desk — -Q_P7HFydZk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/-Q_P7HFydZk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~812 words. Beats in order: Auto proposal decks after a call: two parts — (1) meeting ends → log sheet (date, title, attendees, gist, ID, status) via Fireflies webhook → wait → fetch → if exists → clean JSON attendees → log; (2) new row → pull details → human approval whether to generate a deck (not always needed) → proposal agent → Gamma API → professional slides. Guardrail: limit to last item if two meetings end together. Cleanup code: speaker labels once until the next person (not every sentence). CTA full (approval/Gamma not fully walked on this ingest). json3/captions start 00:00 unless noted. Visual UI not in text.

## B. Atomic Knowledge
### Human-approval-before-Gamma
- **Claim:** After the row logs, a human says whether to generate a deck — “we don’t always need that.”
- **Reasoning:** Approval is the cost control and the taste control.
- **Mechanism:** Log → approve → Gamma.
- **Evidence:** On-tape approval node.
- **Conditions:** A meeting row exists.
- **Exceptions:** Gamma is a vendor bill. Deck is not auto-sent to the client on this clip.
- **Action:** Steal approve-before-generate. Do not buy Gamma. Do not auto-send the deck. Long `KGXFkUlBHxw`.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE
### Log-first-then-optional-artifact
- **Claim:** Part 1 only logs; part 2 is optional.
- **Reasoning:** Not every call deserves a paid deck.
- **Mechanism:** Fireflies → sheet. Then maybe slides.
- **Evidence:** Fields: date/title/attendees/gist/id/status.
- **Conditions:** Fireflies connected.
- **Exceptions:** Webhook secrets. Two-meetings guardrail.
- **Action:** Steal log-then-optional. Fireflies/Gamma on-tape.
- **Confidence:** high
- **Source:** `-Q_P7HFydZk` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: follow-up decks are a big part of the job (from his full-time days) and can be automated after a gate. Priority: approval because not every meeting needs slides.

## D. Procedures
Procedure: meeting end → log → human yes/no → only then generate. Avoid: deck on every call. When to change: if two rows land, process last only (his guardrail).

## E. Examples
**Situation:** Hop off a potential-client call. **Action:** Fireflies logs the row; he shows approval before Gamma. **Reasoning:** Don’t always need a deck. **Outcome:** Teaser; cleanup of speaker labels. **Lesson:** Optional artifact after a log is the machine; Gamma send is not.

## F. Decision Rules
If every call auto-decks → HOLD (meter). If Gamma/Fireflies → on-tape. If send deck to client → HITL. Refuse: proposal-bot SKU.

## G. Contrarian
Contrarian to “automate the whole follow-up.” He inserts approval.

## H. Assumptions
Ingest cuts before the Gamma success. Full `KGXFkUlBHxw`. Fireflies webhook is a secret surface.

## I. Questions
Does approval fire in Slack/email? What does Gamma cost per deck? Did a client get a deck from this?

## J. Connections
SYSTEM SYNTHESIS: long `KGXFkUlBHxw`. Approval = `input-required-gate`. Optional artifact = `token-receipt`. Do not auto-send = `ask-principal`.

## K. Future-Use
Unassigned: last-item guardrail when two events collide — future workflow hygiene.

## Steal / Operate-never

### Machine: Log-then-approve-then-optional-deck
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: meeting ends → action: log gist/attendees → human yes/no on a deck → checkable stop: no Gamma/no send without yes
- **Questions / signals:** “Do we need a deck this time?”
- **Qualify / frame / objections:** Frame: proposal automation. Objection: “automatically” in the title — body has approval.
- **Procedure:** No Fireflies/Gamma as ours. No auto-send to the prospect.
- **Example that proves it:** Fireflies webhook → sheet row → approval node → (teased) Gamma deck.
- **Why it works:** Not every call is a paid render. Approval is the margin control.
- **Conditions / exceptions:** Exception: ingest does not show a sent client deck.
- **Operate-never payload:** Gamma · Fireflies · auto-deck every call · auto-send proposal.
- **Hive run (existing skills only):** `input-required-gate` · `ask-principal` · `slice-build` · proposed `token-receipt`
- **Source:** `-Q_P7HFydZk` @ UNKNOWN


### Operate-never (this desk will not operate)
- Auto-generate or auto-send a Gamma deck.
- Install Fireflies/Gamma as ours.
- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD Gamma/Fireflies spend and auto-send. PASS log-then-approve. No SKU.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
