# CLUSTER-ops — Nate 82 (OPS/GOVERNANCE)

Status: hive-wide SYSTEM_UPGRADE rows **WIRED** (doctrine + hook). Desk files still UNTESTED parts — do not dump 17 SKUs. Clients parked.  
Desks: `big-boss` · `hitl-operator` · `watchdog` · `day-planner` · `career-strategist`  
Corpus: `SHORTLIST-year-agents.md` (82) · existing takes + LEARNED (no transcript re-walk)  
Stack: Cursor + Grok only. Clients parked. Employment stays the career floor.  
Operate-never: send / pay / deploy / book / publish HITL. No LESSONS merge. No atom dump. No vendor install.

Parts, not Nate clones. Tape $ UNVERIFIED. Contradictions stay labeled (do not flatten).

Desk files: [big-boss](big-boss.md) · [hitl-operator](hitl-operator.md) · [watchdog](watchdog.md) · [day-planner](day-planner.md) · [career-strategist](career-strategist.md)

This cluster owns most **infra**. Desk files hold 3–8 local upgrades. Hive-wide rows live **here**, not as a marketing-agent skill.

---

## Hive-wide SYSTEM_UPGRADE_CANDIDATE (WIRED — hooks below)

### UPG-nate82-state-json

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: Durable facts and run logs belong in a typed store the next run can read — not only the chat. On tape: business_profile.json, in-instance tables, memory.md, “write logs the next session can read.”
Applicability: ALL desks that wake more than once
Proposed change: introduce a hive state.json (or equivalent) with typed fields + last-run log; filter one row into the model; do not dump the store; IDs may be monotonic (delete ≠ reset)
Evidence: tDGiWn0flK8 · QCjMBOEhpLE · lcNN3X9gXls · gb5TlGw6Uks · 27Y44JYXZJ8 · timestamps UNKNOWN (caption-only)
Status: WIRED
Next: next coverage-loop iteration must log-run one key; do not migrate hive SSOT to n8n Data tables
```

Skill: `state-json` · hive-funnels row · coverage-loop `hive-state.py log-run` · filter one key. JSON: `system-upgrades/nate82-state-json.json`.

**Contradiction (keep labeled):** Native table lost to Sheets at ~400 rows. Stale `memory.md` was named #1 weird. Hosted managed agents were stateless except the system prompt.

### UPG-nate82-verify-after-browser

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: After a browser (or computer-use) action, observe state and compare expected instead of assuming success. Headed break-it; fail list is done.
Applicability: ALL browser-using agents
Proposed change: action → observe state → compare expected → retry/escalate
Evidence: CB5bG4mvnS0 · EuzYhzB0vbI · timestamps UNKNOWN
Status: WIRED
Next: dry-run click-live-site with the ACT/EXPECTED/OBSERVED card; no headed send/pay/publish; do not wire state.json or separate-verifier this turn
```

Skill: `verify-after-browser` · hive-funnels row · `click-live-site` card · Forge/Watchdog/HITL load-first · spawn note (conditional). JSON: `system-upgrades/nate82-verify-after-browser.json`.

**Contradiction (keep labeled):** He used browser despite an X API. Abbey Road verify-loop hit the cap and still failed. 85 / 100 scenario counts UNVERIFIED. Planted form bugs ≠ agent-found.

### UPG-nate82-separate-verifier

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: Maker-checker. A read-only second desk grades against last-known-good. The lead does not pass its own pane. Subjective “until satisfied” needs a dedicated scorer or a hard cap.
Applicability: ALL multi-agent / loop jobs
Proposed change: every ship path names a verifier desk (default Watchdog) with no Send/Pay tools; eval = hypothesis + labeled set + per-row misses
Evidence: e18sdZLwP7o · EuzYhzB0vbI · vDVSGVpB2vc · 8IUWeF3B-hk · lcNN3X9gXls · timestamps UNKNOWN
Status: WIRED
Next: dry-run one golden path with Watchdog filling GRADE; do not enable Claude teams
```

Skill: `separate-verifier` · hive-funnels row · Watchdog grades Forge on `golden-test-loop` / `click-live-site`. JSON: `system-upgrades/nate82-separate-verifier.json`.

**Contradiction (keep labeled):** Five personas + self-score 8/10 is not a fixture. “One-shot” landing page was a QA bounce. Do not flatten eval-tab with arena scores.

### UPG-nate82-no-send-tool

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: If the worker has a Send/Execute tool, assume it will fire. Always-allow search→details→execute sent mail on tape. First paid outreach agent did not send.
Applicability: ALL agents
Proposed change: strip Send/Pay/Deploy/Book/Publish from worker tool lists (`send-removed`); drafts only; Evens is the last inch
Evidence: 5p5cV0yVDvQ · e18sdZLwP7o · HN0oWxbF2bM · HNKlFTd1maM · 9IzGe0BBj_c · mPflFTQUCGk · oWdJMJp2HgM · timestamps UNKNOWN
Status: WIRED
Next: keep send-removed; do not enable instance-MCP execute
```

Skill: already `send-removed` · do not redo. JSON: `system-upgrades/nate82-no-send-tool.json`.

**Contradiction (keep labeled):** He warns about sensitive access, then always-allows send. Inbox course auto-replies CS. Guardrail pass ≠ send. Assigned-verb MCP is the safer sibling — still on-tape.

### UPG-nate82-assume-it-will-touch

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: Permissions are tools, not vibes. If it can read it, assume it will. Bypass / allow-all on the lead flows downhill. Prompt “don’t” is not a lock.
Applicability: ALL spawned specialists / teams
Proposed change: allow-list tools + MCP + max-turns at spawn; file territory; no inherited bypass; description-tune is the trigger API
Evidence: e18sdZLwP7o · vDVSGVpB2vc · 5p5cV0yVDvQ · gb5TlGw6Uks · timestamps UNKNOWN
Status: WIRED
Next: keep AGENT_TOOL_INVENTORY as the lock; refuse borrowed agent markdown
```

Skill: `assume-it-will-touch` · hive-funnels row · spawn / tape-self-teach territory. JSON: `system-upgrades/nate82-assume-it-will-touch.json`.

**Contradiction (keep labeled):** “It can never send data” is a caption. He prefers main-as-approver; hive keeps Evens on hard steps.

---

### UPG-nate82-checkable-stop

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: A loop is trigger + action + stop. Metric = Y or a hard cap. Idle / needs-input / open-artifact-twice are stops. “Until satisfied” is a weak stop.
Applicability: ALL looping agents
Proposed change: no loop ships without a written done-check + cap + cost field
Evidence: EuzYhzB0vbI · ZAaxx3qyT8g · xsAOpqjebOo · 62Rfe1w9NBc · timestamps UNKNOWN
Status: WIRED
Next: dry-run the next coverage-loop iteration with the card filled; do not arm overnight /loop
```

Skill: `checkable-stop` · hive-funnels row · coverage-loop job card · spawn mission card. JSON: `system-upgrades/nate82-checkable-stop.json`.

**Contradiction (keep labeled):** “Don’t prompt, write loops” vs “most tasks one terminal.” Overnight-as-experiment vs unsupervised-`/goal` warn.

### UPG-nate82-sanitize-in-check-out

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: Two nodes: no-AI sanitize before the model; AI/keyword check after. Stack + threshold. Test the miss (secret-keys ≠ password). Original may still sit beside the placeholder.
Applicability: ALL paths that send text into a model or out to a human/DB
Proposed change: inbound redact → model → outbound check → fail halt; pass still HITL
Evidence: oWdJMJp2HgM · NQhsLVmuItA · timestamps UNKNOWN
Status: WIRED
Next: run sanitize-check.py --fixture on new inbound paths; do not treat pass as send-OK
```

Skill: `sanitize-in-check-out` · hive-funnels row · inbox-to-task-routing + Comms/HITL. JSON: `system-upgrades/nate82-sanitize-in-check-out.json`.

### UPG-nate82-hosted-neq-scheduled

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: Cloud sandbox ≠ always-on. Managed agents as taped had no cron. Routines had ≥1h + stateless clone (no laptop cookies). Local file/cookie jobs stay local. Run-now before schedule.
Applicability: ANY “24/7” or laptop-off proposal
Proposed change: classify wake primitive (event / cadence / human-run) before approving always-on; default no new host
Evidence: 27Y44JYXZJ8 · ehg4fhydTgs · hN58VkYLie4 · UGIZnh6HNLc · timestamps UNKNOWN
Status: WIRED
Next: refuse Anthropic routines / managed agents / Trigger.dev; keep the split as a Big Boss intake question
```

Skill: `hosted-neq-scheduled` · hive-funnels row · Big Boss + Day Planner + coverage-loop `/loop`. JSON: `system-upgrades/nate82-hosted-neq-scheduled.json`.

**Contradiction (keep labeled):** Routines have schedule; managed agents do not. Do not merge into “cloud = 24/7.”

### UPG-nate82-vault-not-prompt

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: Keys in system prompts / chat / root nano miss. Env or vault only. `.env` gitignored means the remote box cannot see it unless you re-inject and *say so*.
Applicability: ALL agents that touch credentials
Proposed change: forbid keys in prompts/chat; env/config only; 2FA stays human
Evidence: 27Y44JYXZJ8 · ehg4fhydTgs · gb5TlGw6Uks · CB5bG4mvnS0 · tDGiWn0flK8 · timestamps UNKNOWN
Status: WIRED
Next: keep secrets out of state.json and job cards; no password CSV; no Hermes/Hostinger
```

Skill: `vault-not-prompt` · hive-funnels row · HITL secrets + Forge. JSON: `system-upgrades/nate82-vault-not-prompt.json`.

### UPG-nate82-api-macro-vision

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: API first (fast/cheap/consistent) → deterministic pixel macro if the path never changes → vision browser last, headed, watched.
Applicability: ALL computer-use / browser jobs
Proposed change: intake must write the ladder choice before a vision agent is allowed
Evidence: CB5bG4mvnS0 · timestamp UNKNOWN
Status: WIRED
Next: headed break-it on localhost forms only; no Codex
```

Skill: `api-macro-vision` · hive-funnels row · Forge slice-build / click-live-site. JSON: `system-upgrades/nate82-api-macro-vision.json`.

**Contradiction (keep labeled):** X-browser-despite-API is his cost/format exception.

### UPG-nate82-side-effect-not-essay

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: Chat-refine can leave the system prompt unchanged. OAuth connected ≠ tool called. Check the external side effect and diff v1/v2 text.
Applicability: ALL wrapper / “it learned” UIs
Proposed change: ship check = side effect + prompt diff + (if URL) click-live-site
Evidence: 27Y44JYXZJ8 · timestamps UNKNOWN
Status: WIRED
Next: Watchdog fills CLAIM / SIDE-EFFECT / DIFF on the next smoke
```

Skill: `side-effect-not-essay` · hive-funnels row · Watchdog golden-test-loop / click-live-site. JSON: `system-upgrades/nate82-side-effect-not-essay.json`.

### UPG-nate82-filter-then-llm

```
SYSTEM_UPGRADE_CANDIDATE
Type: Agent infrastructure
Discovery: Deterministic narrow (email = from, workflow = name) then LLM. Dumping hundreds of rows is tokens + hallucination. Types/formats are the tool contract.
Applicability: ALL retrieval-into-prompt paths
Proposed change: require a filter key before a table/store is passed to a model
Evidence: QCjMBOEhpLE · lcNN3X9gXls · HN0oWxbF2bM · timestamps UNKNOWN
Status: WIRED
Next: do not stand up n8n tables as hive SSOT; do not dump state.json log[]
```

Skill: `filter-then-llm` · hive-funnels row · inbox-to-task-routing + `hive-state.py get --key`. JSON: `system-upgrades/nate82-filter-then-llm.json`.

### UPG-nate82-observe-pane (from CLUSTER-gtm)

WIRED as `observe-pane` — `state.json` jobs[] · yellow = ask-principal · spawn `set-job`. JSON: `system-upgrades/nate82-observe-pane.json`.

### UPG-nate82-token-receipt (from CLUSTER-money)

WIRED as `token-receipt` — coverage-loop COST + Money Desk · `hive-state.py receipt`. JSON: `system-upgrades/nate82-token-receipt.json`.

---

## Desk map (3–8 each — see files)

| Desk | Upgrade count | Spine |
|------|---------------|--------|
| `big-boss` | 8 | loops, climb-when-forced, named specialists, board, interview, hosted≠scheduled, ladder, assume-touch |
| `hitl-operator` | 8 | draft-then-card, no-send-tool, 2FA/admin, sanitize/check, path blast, plan-approve, side-effect, needs-input |
| `watchdog` | 8 | separate verifier, verify-after-browser, assume-touch, labeled eval, gold-Q, guard-miss, open-twice, step log |
| `day-planner` | 8 | shoot-and-return, cadence-not-24/7, inbox four-path, run-now, dump-to-fresh, title-trigger, desk-vs-pocket, stay L1 |
| `career-strategist` | 8 | employment floor, problem-solver, mess-pay, receipts, don’t-send first SKU, n8n-as-bike, views≠paid, fresh-window prep |

## Cluster contradictions (do not flatten)

- Write loops vs most tasks one terminal (`EuzYhzB0vbI`).
- Overnight experiment vs unsupervised `/goal` warn (`ZAaxx3qyT8g`).
- Routines have cadence; managed agents as taped do not (`ehg4fhydTgs` vs `27Y44JYXZJ8`).
- Always-allow send vs “you are in full control” (`5p5cV0yVDvQ`).
- Inbox course auto-replies vs first paid agent did not send (`HN0oWxbF2bM` vs `HNKlFTd1maM`).
- Main-as-approver vs hive Evens-on-hard-step (`vDVSGVpB2vc`).
- Random $1,650 vs later ROI script vs complexity price (`ySl-SyboPa4` / `YF0XPMXLHOA` / `HNKlFTd1maM` agent 3).
- Flashy videos win views; practical ones paid; he still makes flashy (`w9-gfaV5vlM`).
- Quit-job inbound flood is survivorship; employment stays the floor.

## Operate-never (cluster)

- Send / pay / deploy / book / publish.
- Install Claude Code, Codex, Hermes, OpenClaw, Trigger.dev, Vapi, n8n-cloud, Skool, Hostinger as stack.
- Instance-MCP execute / always-allow / password CSV / 2FA computer-use.
- New `icp_id`. Unpark clients. Quote tape $ as FACT.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write `SKILL.md`.
