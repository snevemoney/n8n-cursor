---
name: ask-principal
description: Agent acts, then asks the human when unsure, then resumes. Never close a booking, take cards, or send. Use for voice, calendar, email, and any world action. No second voice vendor.
---

# Ask-principal (funnel)

**Alias:** `confirm-then-actuate` — same loop, same card. Do not run a second doctrine.

**Stack:** Grok Bot state machine. HITL Operator owns the hard step.

**Spine:** `send-removed` → `confirm-then-actuate` → `input-required-gate`.

## When
Voice, booking, inbox action, or any step that could spend money or speak for Evens.

## Gate card (one string)
Every hard step uses this card before Evens sees it:

`ACTION / WHY / AGENT / RISK / REVERSIBILITY`

Roster `APPROVE` / `EDIT` / `REJECT` maps onto **ACTION** (the verb Evens picks). Do not invent a second card shape. Do not add TARGET.

## State machine
`act → if unsure, ask principal → resume → never touch money/PII`

## Steps
1. Do the cheap research/admin.
2. Ambiguity (time full, indoor/outdoor, which lead) → **ask Evens** with the five-field card. Do not guess.
3. After the answer, continue the same job.
4. PIN / scope: calendar, email, files. **No cards. No PII dump.**
5. Report when the loop ends.

## Ramp (Swadia)
Visible → efficient → automatic → **then** hand off judgment. Not the reverse.

## Stop
Send, pay, deploy, book, publish = operator. No Vapi / second voice stack.

## Labeled merge (shard 3 · 2026-08-17)
Labeled merge, not a new skill. Caption-only Nate tapes. $ UNVERIFIED. Claude/Codex/Gemini/Vapi/Sora/Gamma/Base44/Hermes = operate-never.
- `KGXFkUlBHxw` — Log meeting → poll → draft → **approve**. Preserve HITL. Gamma/Fireflies on-tape = operate-never. Send stays Evens.
Do not mint a duplicate skill. Do not file `website-assets` unless Evens names a landing machine we lack.

## Never
- Auto-book / auto-dial
- Closing the restaurant (or the deal) without a callback
- Giving Grok Bot card access “because Jarvis did”
- Gmail send or ack-reply send path
- A second gate schema alongside this card

**Merged 2026-08-14:** `I7mpF7_pnPM` kill on opportunity cost. `vLlIBT0HSSc` no employer send / no unpark to “practice FDE.” Silence is not yes.

## Shard-2 labeled merges (2026-08-17 · shard 2)
Labeled merge, not a new skill. Caption-only. $ UNVERIFIED. Evens can override slugs (Q6).
- `-cdexJWN8YA` — Four pieces (persona, voice, knowledge, tools) and three doors (test, widget snippet, phone). Clock/TZ bugs look like AI bugs. Public widget = your meter. Operate-never: ElevenLabs · auto-book cal.com · Vercel publish · public unpaid widget.
- `xJ5oz63mIec` — Three deploy doors. Deploy is a hard step. Steal the card, not the vendor. Claude automations operate-never. Operate-never: auto-deploy · Claude hosted agents · Vercel as hive default.

## Repeat-signal shard 0 (2026-08-17)
Labeled merges, not new skills. Caption-only. $ UNVERIFIED. Claude/Vapi/n8n-cloud operate-never.

| tape | fragment |
|------|----------|
| `-Lo_SlSgtnA` | `thin-form-then-qualify-log-then-human` |
| `3QclAjmu5Tw` | `retest-the-wall-then-hitl-callback` |
| `8C6iCpJ9HPo` | `no-cta-inbound-then-value-then-number` |
| `AYsg5gAMWyo` | `ready-row-lock-still-poll-hitl-post` |
| `HNKlFTd1maM` | `four-deal-ladder-then-roi-sop` |
| `Lg5TYWPSg6M` | `their-number-then-fraction-then-objective-pay` |
| `Pi-m8R068r4` | `hours-deposit-then-they-ask-the-next-rung` |
| `RzLV8sfFdMM` | `plan-sandwich-prove-evolve` |
| `X80ljdCPM_U` | `eval-then-wrap-tools` |
| `a5sJNwfZ528` | `pin-then-linear-builder` |
| `eFOTQpbGcy8` | `safe-hours-then-constraint` |
| `oWdJMJp2HgM` | `sanitize-in-check-out` |
| `tNOk29fs_aY` | `cron-idea-brand-stop-before-publish` |
| `w9-gfaV5vlM` | `diagnose-solve-value-price` |

## Labeled merge (shard 1 · 2026-08-17)
Labeled merge, not a new skill. Caption-only. $ UNVERIFIED.
- `-Q_P7HFydZk` — Log-all then approve-some. Meeting logged always; deck optional and gated. Fireflies/Gamma operate-never. Send stays Evens.

## Repeat-signal leftover sweep (2026-08-17)
Labeled merges, not new skills. Caption-only. $ UNVERIFIED. Claude/Vapi/n8n-cloud operate-never.

| tape | fragment |
|------|----------|
| `-zL_trhnQaI` | `constraint-kpi-then-formalize` |
| `0Ujdys4LqNs` | `stable-query-three-sources-pin-the-plan` |
| `0WDkwMxj13s` | `4c-default-tab` |
| `2J3uX8iRNng` | `same-prompt-bench` |
| `3XIGcM7VICc` | `relative-roi-then-taste-then-vending` |
| `5p5cV0yVDvQ` | `description-and-toggle-acl` |
| `62Rfe1w9NBc` | `glance-idle-then-stop-or-load` |
| `8MEJen0nblQ` | `outcome-story-catalyst-router` |
| `8QQ_INxAhRs` | `4c-router-keys-grill-verify` |
| `AO5aW01DKHo` | `interview-never-rules-wat` |
| `BO-jFbN4p8Y` | `dirty-input-gate` |
| `CvA8-aScqio` | `referee-ask-then-payoff-test` |
| `ECfusvK5tEU` | `research-write-dont-send` |
| `EuzYhzB0vbI` | `reason-act-observe-until-metric-or-cap` |
| `FHsY924cEAk` | `post-publish-moneyball-party` |
| `Fu6vOfzFmcw` | `folder-ingest-count-then-gold-q` |
| `HbsbqMQE-lI` | `paste-pin-apply-or-dont-automate` |
| `IlNwjnIzrOo` | `name-share-pack-pick-then-motion` |
| `KVFfApQZhE4` | `enroll-then-gold-q-with-locator` |
| `ONmaDdOBGig` | `goal-plus-stakes-plus-verify-loop` |
| `PQBYZQqan2g` | `one-job-bots-routed-by-description` |
| `QrJhdTbK3TU` | `toggle-search-allowlist-cite` |
| `R0qF17BVl9w` | `file-goal-tournament-then-red-team` |
| `RDytbVDzMF4` | `script-beat-motion` |
| `UCKLHU5AkEM` | `prop-scene-noise-alphanumeric-eval` |
| `UGIZnh6HNLc` | `write-local-host-cloud-prove-idempotency` |
| `XNQBCRcwXV4` | `a-b-thin-skills-not-sweep` |
| `YF0XPMXLHOA` | `diagnose-hours-then-fraction-price` |
| `ZwQ8rJhVCr4` | `classify-question-then-pick-retrieval` |
| `c0kaKxM2pHg` | `grill-checkpoint-flag` |
| `glM8godEcic` | `lookup-then-seven-verbs` |
| `iIfOprq2kCM` | `gap-close-in-your-function` |
| `iRBs8PCBCaA` | `offline-plate-vs-interactive-world` |
| `iTY8Q449YNQ` | `roast-verify-handoff-goal` |
| `jZgcWCzxh1I` | `width-vs-depth-ladder` |
| `lcNN3X9gXls` | `table-as-control-plane-then-log-and-eval` |
| `pbrln2TVeh4` | `roast-then-slice-then-prove` |
| `rXpHzWXjHrw` | `name-tools-approve-inspect-secrets-and-sources` |
| `tDGiWn0flK8` | `wat-plan-assets-run-heal` |
| `vFepZE_wrfg` | `plan-interrogate` |
| `x-2088007687149601254` | `inbound-from-demonstrated-build` |
| `xn6Z5PYyAIE` | `reference-log-winner-skill` |
| `xsAOpqjebOo` | `split-research-watch-idle-approve-subs` |
| `zWLZ3bVVwD8` | `file-kb-now-tz-eoc-prod` |
| `13eo8dWa1Gw` | `isolated-workers-follow-one-destination` |
| `ESIxitOLYoQ` | `list-anneal-funnel` |
| `EzQAgnjTq2k` | `goals-wiki-width-same-risk` |
| `IVx8OSMbTss` | `six-p-sprint-waitlist-aha-charge` |
| `IWdvG9Up8Mc` | `triangle-gate-one-dream-letter` |
| `TL8V41Ea6oM` | `four-pillars-one-promotion-ladder` |
| `eMPWBunaOic` | `new-project-dump-then-short-loops` |
| `f4mI3d-nTrI` | `stateless-call-named-handle-roundtrip` |
| `hGdG-04TkDs` | `niche-outcome-director-proof-one-channel` |
| `kwSVtQ7dziU` | `macro-action-metric-named-workers` |
| `mjg_JUMar04` | `bible-plan-one-job-test` |
| `nS2FrgXN-EY` | `pack-cards-human-mouth-same-day` |
| `sboNwYmH3AY` | `purpose-named-vault-raw-wiki-lint` |
| `whIp1SOahOM` | `inquire-report-human-yes-second-call` |
| `2071996301311381827` | `named-team-not-swarm` |
| `2072255044544512004` | `named-team-not-swarm` |
| `2072687270709309589` | `lead-web-find` |
| `2072980099050410259` | `filter-then-llm` |
| `2073320835658772937` | `website-emit-from-ref` |
| `2074438871526379532` | `filter-then-llm` |
| `2077489907350856038` | `mcp-on-private-demo` |
| `2077827886149439547` | `named-team-not-swarm` |
| `2086976486771155361` | `filter-then-llm` |
| `2088359756096532965` | `dark-factory` |

Also proven from `CAP--Q_P7HFydZk-log-all-approve-some` (`log-all-approve-some`).
