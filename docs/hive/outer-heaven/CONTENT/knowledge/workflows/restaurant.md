# Workflow — restaurant
Status: compiled
Protocol: workflow-compiler
**Provenance:** WORKFLOW → PATTERN → ATOMS → TRANSCRIPT
**Title:** restaurant — missed-call-book (hunt parked)
**Compiled:** 2026-08-14

## Classify
- **Who / ICP:** Independent restaurant, not chains
- **Outcome:** missed-call-book machine compiled. No named restaurant hunt.
- **Stage:** dry-run
- **Path / machine:** A / `missed-call-book`
- **Constraints:** Never auto-book a table. Voice vendor = ask-principal. Clients parked.
- **Operate-never:** AI voice auto-book · Glencoco dial · OpenTable-only with no leak
- **Owners:** Lead Hunter, Consultant

Classify written from OPERATOR_FOCUS + runbook + steal-sheet. Atoms were not opened to invent the project.

## Decompose
1. Hunt parked
2. Book CTA + HITL follow-up, not a second voice vendor
3. Public widget / voice meter is a credit hose
4. ICP-specific restaurant atoms

## Coverage map
| id | task | coverage | pointer |
|----|------|----------|---------|
| T1 | Hunt parked | HITL only | OPERATOR_FOCUS |
| T2 | Book CTA + HITL follow-up, not a second voice vendor | need knowledge | missed-call-book · ask-principal |
| T3 | Public widget / voice meter is a credit hose | need knowledge | P-public-widget-is-a-credit-hose |
| T4 | ICP-specific restaurant atoms | gap | none in corpus |

## Retrieve (narrow, after classify/decompose)
- **pattern_ids:** `P-book-clock-not-model`, `P-public-widget-is-a-credit-hose`, `P-dont-lead-with-word-AI`, `P-sanitize-then-check-pass-neq-send`
- **support_ids:** `K--Lo_SlSgtnA-01`, `K--cdexJWN8YA-01`, `K--cdexJWN8YA-03`, `K-0Ujdys4LqNs-02`, `K-0WDkwMxj13s-02`, `K-0YXjEzFfft8-03`, `K-2J3uX8iRNng-02`, `K-3TdD8Qv5Tk8-03`, `K-5IM27lbCwjM-01`, `K-5p5cV0yVDvQ-04`
- **dissent_ids:** `K-3TdD8Qv5Tk8-06`, `K-3XIGcM7VICc-06`, `K-8MEJen0nblQ-04`, `K-B4p9O2P2a3c-05`, `K-B4p9O2P2a3c-06`, `K-BO-jFbN4p8Y-05`, `K-BO-jFbN4p8Y-06`, `K-irg-2IfAjpo-04`, `K-x-2088007687149601254-01`, `K-zWLZ3bVVwD8-02`
- **condition drops:** none

## Steps
### 1. Hunt parked
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** ASK Evens / leave queued. Hunt parked
- **Hive skill:** `OPERATOR_FOCUS`
- **pattern_ids:** `P-book-clock-not-model`
- **support_ids:** `K--Lo_SlSgtnA-01`
- **dissent_ids:** `K-3TdD8Qv5Tk8-06, K-3XIGcM7VICc-06, K-8MEJen0nblQ-04, K-B4p9O2P2a3c-05, K-B4p9O2P2a3c-06, K-BO-jFbN4p8Y-05`
- **valid_when / less_relevant_when:** Intake→book / private-book-install. Hive: no Vapi, no ElevenLabs, no auto-book. / Voice-vendor auto-book (operate-never). Caption-only UI path.
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/-Lo_SlSgtnA/full.txt` @ UNKNOWN

### 2. Book CTA + HITL follow-up, not a second voice vendor
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** Book CTA + HITL follow-up, not a second voice vendor
- **Hive skill:** `missed-call-book · ask-principal`
- **pattern_ids:** `P-public-widget-is-a-credit-hose`
- **support_ids:** `K--cdexJWN8YA-01`
- **dissent_ids:** `K-3TdD8Qv5Tk8-06, K-3XIGcM7VICc-06, K-8MEJen0nblQ-04, K-B4p9O2P2a3c-05, K-B4p9O2P2a3c-06, K-BO-jFbN4p8Y-05`
- **valid_when / less_relevant_when:** Any book/voice surface. Hive no ElevenLabs / no Vapi. / App with user-supplied key (who pays flips).
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/-cdexJWN8YA/full.txt` @ UNKNOWN

### 3. Public widget / voice meter is a credit hose
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** Public widget / voice meter is a credit hose
- **Hive skill:** `P-public-widget-is-a-credit-hose`
- **pattern_ids:** `P-dont-lead-with-word-AI`
- **support_ids:** `K--cdexJWN8YA-03`
- **dissent_ids:** `K-3TdD8Qv5Tk8-06, K-3XIGcM7VICc-06, K-8MEJen0nblQ-04, K-B4p9O2P2a3c-05, K-B4p9O2P2a3c-06, K-BO-jFbN4p8Y-05`
- **valid_when / less_relevant_when:** Prospect is a normal SMB / local / operator. / AI-native buyer; creator/ads buyer who wants the AI trend.
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/-cdexJWN8YA/full.txt` @ UNKNOWN

### 4. ICP-specific restaurant atoms
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** STOP this task. Coverage-gap card. Do not invent atoms. 0 restaurant-specific atoms. Transferable: book-clock, no public widget, draft-not-send, don't-lead-with-AI.
- **Hive skill:** `none in corpus`
- **pattern_ids:** `P-sanitize-then-check-pass-neq-send`
- **support_ids:** `K-0Ujdys4LqNs-02`
- **dissent_ids:** `K-3TdD8Qv5Tk8-06, K-3XIGcM7VICc-06, K-8MEJen0nblQ-04, K-B4p9O2P2a3c-05, K-B4p9O2P2a3c-06, K-BO-jFbN4p8Y-05`
- **valid_when / less_relevant_when:** Any text into a model or out to a human. Hive `sanitize-in-check-out` / `send-removed` / `warm-draft-hitl`. / Later tapes that celebrate auto-send — keep as HITL-send siblings, do not average.
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/0Ujdys4LqNs/full.txt` @ UNKNOWN


## Next non-HITL desk work
Researcher: coverage-gap card. Lead Hunter NO_ACTION. Do not invent restaurant atoms.

## Audits
- **coverage:** pass — every task has hive skill, sourced step, HITL, or explicit gap
- **context-misuse:** pass — atoms gated on parked/HITL/vendor operate-never; caption-only not used as UI
- **contradiction:** pass — dissent_ids listed; VIEW A ⊥ VIEW B; playbook-before-send not averaged with inbound-first
- **gaps:** restaurant
- **dissent kept visible:** K-3TdD8Qv5Tk8-06, K-3XIGcM7VICc-06, K-8MEJen0nblQ-04, K-B4p9O2P2a3c-05, K-B4p9O2P2a3c-06, K-BO-jFbN4p8Y-05, K-BO-jFbN4p8Y-06, K-irg-2IfAjpo-04, K-x-2088007687149601254-01, K-zWLZ3bVVwD8-02

## Operate-never
AI voice auto-book · Glencoco dial · OpenTable-only with no leak
Send / pay / deploy / book / publish stay Evens.
