# Workflow — local-clinic
Status: compiled
Protocol: workflow-compiler
**Provenance:** WORKFLOW → PATTERN → ATOMS → TRANSCRIPT
**Title:** local-clinic — review-to-book machine (hunt parked)
**Compiled:** 2026-08-14

## Classify
- **Who / ICP:** Dentists, med-spa, physio, vet — Greater Montreal when unparked
- **Outcome:** Review-to-book install machine compiled. No named clinic hunt this week.
- **Stage:** dry-run
- **Path / machine:** A / `review-to-book`
- **Constraints:** OPERATOR_FOCUS icp_id=none. No PHI. Thank-you send HITL. Tape $ UNVERIFIED.
- **Operate-never:** Auto-DM reviews · PHI in drafts · dentist-scrape from AO5aW01DKHo / 3GAxd90fEE4 · Normand send
- **Owners:** Lead Hunter, Consultant, Librarian

Classify written from OPERATOR_FOCUS + runbook + steal-sheet. Atoms were not opened to invent the project.

## Decompose
1. Keep hunt parked until Evens tags icp_id
2. Offer sentence = outcome, not 'AI' / not category
3. Four blanks for Review-to-book Install
4. Warm-draft thank-you + book link (template only, no send)
5. Do not run on-tape dentist scrape / outreach
6. Google-review mining → thank-you path (ICP-specific atom)

## Coverage map
| id | task | coverage | pointer |
|----|------|----------|---------|
| T1 | Keep hunt parked until Evens tags icp_id | HITL only | OPERATOR_FOCUS · ask-principal |
| T2 | Offer sentence = outcome, not 'AI' / not category | need knowledge | outcome-offer-funnel |
| T3 | Four blanks for Review-to-book Install | need knowledge | four-blank-sku |
| T4 | Warm-draft thank-you + book link (template only, no send) | have hive skill | warm-draft-hitl |
| T5 | Do not run on-tape dentist scrape / outreach | need knowledge | operate-never on AO5aW01DKHo-02 |
| T6 | Google-review mining → thank-you path (ICP-specific atom) | gap | no review-mining atom in corpus |

## Retrieve (narrow, after classify/decompose)
- **pattern_ids:** `P-dont-lead-with-word-AI`, `P-category-pitch-fails`, `P-four-blanks-before-build`, `P-sanitize-then-check-pass-neq-send`, `P-book-clock-not-model`
- **support_ids:** `K--6yUeJ3rkvg-01`, `K--6yUeJ3rkvg-02`, `K--Lo_SlSgtnA-02`, `K--cdexJWN8YA-02`, `K--zL_trhnQaI-03`, `K-0WDkwMxj13s-02`, `K-0YXjEzFfft8-03`, `K-27Y44JYXZJ8-01`, `K-2J3uX8iRNng-02`, `K-2OD14-0cot4-03`
- **dissent_ids:** `K--cdexJWN8YA-04`, `K--cdexJWN8YA-05`, `K--cdexJWN8YA-06`, `K--zL_trhnQaI-04`, `K--zL_trhnQaI-05`, `K-0WDkwMxj13s-04`, `K-0WDkwMxj13s-05`, `K-0WDkwMxj13s-06`, `K-x-2088007687149601254-01`, `K-zWLZ3bVVwD8-02`
- **condition drops:** none

## Steps
### 1. Keep hunt parked until Evens tags icp_id
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** ASK Evens / leave queued. Keep hunt parked until Evens tags icp_id
- **Hive skill:** `OPERATOR_FOCUS · ask-principal`
- **pattern_ids:** `P-dont-lead-with-word-AI`
- **support_ids:** `K--6yUeJ3rkvg-01`
- **dissent_ids:** `K--cdexJWN8YA-04, K--cdexJWN8YA-05, K--cdexJWN8YA-06, K--zL_trhnQaI-04, K--zL_trhnQaI-05, K-0WDkwMxj13s-04`
- **valid_when / less_relevant_when:** Prospect is a normal SMB / local / operator. / AI-native buyer; creator/ads buyer who wants the AI trend.
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/-6yUeJ3rkvg/full.txt` @ UNKNOWN

### 2. Offer sentence = outcome, not 'AI' / not category
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** Offer sentence = outcome, not 'AI' / not category
- **Hive skill:** `outcome-offer-funnel`
- **pattern_ids:** `P-category-pitch-fails`
- **support_ids:** `K--6yUeJ3rkvg-02`
- **dissent_ids:** `K--cdexJWN8YA-04, K--cdexJWN8YA-05, K--cdexJWN8YA-06, K--zL_trhnQaI-04, K--zL_trhnQaI-05, K-0WDkwMxj13s-04`
- **valid_when / less_relevant_when:** Custom automation / agency-shaped offer; SKU unknown; cold or outbound. / Named ICP + named offer + Path A MUST (different machine).
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/-6yUeJ3rkvg/full.txt` @ UNKNOWN

### 3. Four blanks for Review-to-book Install
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** Four blanks for Review-to-book Install
- **Hive skill:** `four-blank-sku`
- **pattern_ids:** `P-four-blanks-before-build`
- **support_ids:** `K--Lo_SlSgtnA-02`
- **dissent_ids:** `K--cdexJWN8YA-04, K--cdexJWN8YA-05, K--cdexJWN8YA-06, K--zL_trhnQaI-04, K--zL_trhnQaI-05, K-0WDkwMxj13s-04`
- **valid_when / less_relevant_when:** Partner/outcomes offer. Hive `outcome-offer-funnel` / `four-blank-sku`. Clients parked. / Order-taking demo with no KPI; tape 13%/McKinsey stats as FACT.
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/-Lo_SlSgtnA/full.txt` @ UNKNOWN

### 4. Warm-draft thank-you + book link (template only, no send)
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** Warm-draft thank-you + book link (template only, no send)
- **Hive skill:** `warm-draft-hitl`
- **pattern_ids:** `P-sanitize-then-check-pass-neq-send`
- **support_ids:** `K--cdexJWN8YA-02`
- **dissent_ids:** `K--cdexJWN8YA-04, K--cdexJWN8YA-05, K--cdexJWN8YA-06, K--zL_trhnQaI-04, K--zL_trhnQaI-05, K-0WDkwMxj13s-04`
- **valid_when / less_relevant_when:** Any text into a model or out to a human. Hive `sanitize-in-check-out` / `send-removed` / `warm-draft-hitl`. / Later tapes that celebrate auto-send — keep as HITL-send siblings, do not average.
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/-cdexJWN8YA/full.txt` @ UNKNOWN

### 5. Do not run on-tape dentist scrape / outreach
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** Do not run on-tape dentist scrape / outreach
- **Hive skill:** `operate-never on AO5aW01DKHo-02`
- **pattern_ids:** `P-book-clock-not-model`
- **support_ids:** `K--zL_trhnQaI-03`
- **dissent_ids:** `K--cdexJWN8YA-04, K--cdexJWN8YA-05, K--cdexJWN8YA-06, K--zL_trhnQaI-04, K--zL_trhnQaI-05, K-0WDkwMxj13s-04`
- **valid_when / less_relevant_when:** Intake→book / private-book-install. Hive: no Vapi, no ElevenLabs, no auto-book. / Voice-vendor auto-book (operate-never). Caption-only UI path.
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/-zL_trhnQaI/full.txt` @ UNKNOWN

### 6. Google-review mining → thank-you path (ICP-specific atom)
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** STOP this task. Coverage-gap card. Do not invent atoms. No atom teaches Google-review → thank-you → book. Machine lives on steal-sheet / runbook skills. Dentist mentions on tape are scrape/outreach operate-never.
- **Hive skill:** `no review-mining atom in corpus`
- **pattern_ids:** `P-book-clock-not-model`
- **support_ids:** `K-0WDkwMxj13s-02`
- **dissent_ids:** `K--cdexJWN8YA-04, K--cdexJWN8YA-05, K--cdexJWN8YA-06, K--zL_trhnQaI-04, K--zL_trhnQaI-05, K-0WDkwMxj13s-04`
- **valid_when / less_relevant_when:** Intake→book / private-book-install. Hive: no Vapi, no ElevenLabs, no auto-book. / Voice-vendor auto-book (operate-never). Caption-only UI path.
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/0WDkwMxj13s/full.txt` @ UNKNOWN


## Next non-HITL desk work
Lead Hunter: NO_ACTION hunt. Librarian: runbook pointer. Researcher: gap — no review-mining atom in corpus.

## Audits
- **coverage:** pass — every task has hive skill, sourced step, HITL, or explicit gap
- **context-misuse:** pass — atoms gated on parked/HITL/vendor operate-never; caption-only not used as UI
- **contradiction:** pass — dissent_ids listed; VIEW A ⊥ VIEW B; playbook-before-send not averaged with inbound-first
- **gaps:** local-clinic
- **dissent kept visible:** K--cdexJWN8YA-04, K--cdexJWN8YA-05, K--cdexJWN8YA-06, K--zL_trhnQaI-04, K--zL_trhnQaI-05, K-0WDkwMxj13s-04, K-0WDkwMxj13s-05, K-0WDkwMxj13s-06, K-x-2088007687149601254-01, K-zWLZ3bVVwD8-02

## Operate-never
Auto-DM reviews · PHI in drafts · dentist-scrape from AO5aW01DKHo / 3GAxd90fEE4 · Normand send
Send / pay / deploy / book / publish stay Evens.
