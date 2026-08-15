# Workflow — industrial-smb
Status: compiled
Protocol: workflow-compiler
**Provenance:** WORKFLOW → PATTERN → ATOMS → TRANSCRIPT
**Title:** industrial-smb — list-anneal then Path A (hunt parked)
**Compiled:** 2026-08-14

## Classify
- **Who / ICP:** Manufacturing / castings / robotics / B2B industrial
- **Outcome:** list-anneal machine compiled. No dial factory. No list this week.
- **Stage:** dry-run
- **Path / machine:** B→A / `list-anneal → Path A`
- **Constraints:** Clients parked. No auto-dial. playbook-before-send before any send.
- **Operate-never:** Glencoco clone · auto-dial as product · send without playbook
- **Owners:** Lead Hunter, Researcher

Classify written from OPERATOR_FOCUS + runbook + steal-sheet. Atoms were not opened to invent the project.

## Decompose
1. No list-anneal run this week (parked)
2. When unparked: 50 → 60–70% → exclusions → 3–5 Path A
3. Draft-not-send; playbook-before-send is dissent vs inbound-first
4. ICP-specific industrial atoms

## Coverage map
| id | task | coverage | pointer |
|----|------|----------|---------|
| T1 | No list-anneal run this week (parked) | HITL only | list-anneal-funnel |
| T2 | When unparked: 50 → 60–70% → exclusions → 3–5 Path A | have hive skill | list-anneal-funnel |
| T3 | Draft-not-send; playbook-before-send is dissent vs inbound-first | need knowledge | outbound-playbook-funnel |
| T4 | ICP-specific industrial atoms | gap | none in corpus |

## Retrieve (narrow, after classify/decompose)
- **pattern_ids:** `P-sanitize-then-check-pass-neq-send`, `P-inbound-from-demonstrated-build`, `P-category-pitch-fails`
- **support_ids:** `K-0WDkwMxj13s-02`, `K-0YXjEzFfft8-03`, `K-2J3uX8iRNng-02`, `K-3TdD8Qv5Tk8-03`, `K-5IM27lbCwjM-01`, `K-8C6iCpJ9HPo-01`, `K-8MEJen0nblQ-01`, `K-8ktcSaSTvxk-02`, `K-AO5aW01DKHo-03`, `K-B4p9O2P2a3c-03`
- **dissent_ids:** `K-0YXjEzFfft8-04`, `K-0YXjEzFfft8-06`, `K-3TdD8Qv5Tk8-05`, `K-3XIGcM7VICc-06`, `K-5p5cV0yVDvQ-05`, `K-8MEJen0nblQ-04`, `K-B4p9O2P2a3c-05`, `K-irg-2IfAjpo-04`, `K-pbrln2TVeh4-04`, `K-pxzo2lXhWJE-02`, `K-x-2088007687149601254-01`, `K-x-2088007687149601254-03`
- **condition drops:** none

## Steps
### 1. No list-anneal run this week (parked)
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** ASK Evens / leave queued. No list-anneal run this week (parked)
- **Hive skill:** `list-anneal-funnel`
- **pattern_ids:** `P-sanitize-then-check-pass-neq-send`
- **support_ids:** `K-0WDkwMxj13s-02`
- **dissent_ids:** `K-0YXjEzFfft8-04, K-0YXjEzFfft8-06, K-3TdD8Qv5Tk8-05, K-3XIGcM7VICc-06, K-5p5cV0yVDvQ-05, K-8MEJen0nblQ-04`
- **valid_when / less_relevant_when:** Any text into a model or out to a human. Hive `sanitize-in-check-out` / `send-removed` / `warm-draft-hitl`. / Later tapes that celebrate auto-send — keep as HITL-send siblings, do not average.
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/0WDkwMxj13s/full.txt` @ UNKNOWN

### 2. When unparked: 50 → 60–70% → exclusions → 3–5 Path A
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** When unparked: 50 → 60–70% → exclusions → 3–5 Path A
- **Hive skill:** `list-anneal-funnel`
- **pattern_ids:** `P-inbound-from-demonstrated-build`
- **support_ids:** `K-0YXjEzFfft8-03`
- **dissent_ids:** `K-0YXjEzFfft8-04, K-0YXjEzFfft8-06, K-3TdD8Qv5Tk8-05, K-3XIGcM7VICc-06, K-5p5cV0yVDvQ-05, K-8MEJen0nblQ-04`
- **valid_when / less_relevant_when:** You have a real build to show. Path C / inbound. Stack Cursor+Grok. Publish HITL. / No artifact yet; Path A named-client hunt this week (parked); outbound-first playbook-before-send rooms.
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/0YXjEzFfft8/full.txt` @ UNKNOWN

### 3. Draft-not-send; playbook-before-send is dissent vs inbound-first
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** Draft-not-send; playbook-before-send is dissent vs inbound-first
- **Hive skill:** `outbound-playbook-funnel`
- **pattern_ids:** `P-category-pitch-fails`
- **support_ids:** `K-2J3uX8iRNng-02`
- **dissent_ids:** `K-0YXjEzFfft8-04, K-0YXjEzFfft8-06, K-3TdD8Qv5Tk8-05, K-3XIGcM7VICc-06, K-5p5cV0yVDvQ-05, K-8MEJen0nblQ-04`
- **valid_when / less_relevant_when:** Custom automation / agency-shaped offer; SKU unknown; cold or outbound. / Named ICP + named offer + Path A MUST (different machine).
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/2J3uX8iRNng/full.txt` @ UNKNOWN

### 4. ICP-specific industrial atoms
- **IF:** IF clients parked → NO_ACTION hunt
- **Do:** STOP this task. Coverage-gap card. Do not invent atoms. 0 industrial-specific atoms. Transferable: draft-not-send, category-pitch-fails. list-anneal is a hive skill, not an atom cluster.
- **Hive skill:** `none in corpus`
- **pattern_ids:** `P-category-pitch-fails`
- **support_ids:** `K-3TdD8Qv5Tk8-03`
- **dissent_ids:** `K-0YXjEzFfft8-04, K-0YXjEzFfft8-06, K-3TdD8Qv5Tk8-05, K-3XIGcM7VICc-06, K-5p5cV0yVDvQ-05, K-8MEJen0nblQ-04`
- **valid_when / less_relevant_when:** Custom automation / agency-shaped offer; SKU unknown; cold or outbound. / Named ICP + named offer + Path A MUST (different machine).
- **confidence:** caption-only; declared unless noted; tape $ UNVERIFIED
- **knowledge_type mix:** declared + implicit dissent labeled — not mixed
- **Transcript:** `packets/3TdD8Qv5Tk8/full.txt` @ UNKNOWN


## Next non-HITL desk work
Researcher: gap card. Lead Hunter: no anneal. Keep playbook-before-send vs inbound-first unflattened.

## Audits
- **coverage:** pass — every task has hive skill, sourced step, HITL, or explicit gap
- **context-misuse:** pass — atoms gated on parked/HITL/vendor operate-never; caption-only not used as UI
- **contradiction:** pass — dissent_ids listed; VIEW A ⊥ VIEW B; playbook-before-send not averaged with inbound-first
- **gaps:** industrial-smb
- **dissent kept visible:** K-0YXjEzFfft8-04, K-0YXjEzFfft8-06, K-3TdD8Qv5Tk8-05, K-3XIGcM7VICc-06, K-5p5cV0yVDvQ-05, K-8MEJen0nblQ-04, K-B4p9O2P2a3c-05, K-irg-2IfAjpo-04, K-pbrln2TVeh4-04, K-pxzo2lXhWJE-02, K-x-2088007687149601254-01, K-x-2088007687149601254-03

## Operate-never
Glencoco clone · auto-dial as product · send without playbook
Send / pay / deploy / book / publish stay Evens.
