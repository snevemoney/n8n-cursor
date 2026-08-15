# HITL Operator — ehg4fhydTgs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/LEARNED.md`
**ICP:** parked unless Evens named one.

Evens is the visionary. Operate ≠ learn. Role did not filter what was learned. Stack stays Cursor + Grok. Clients parked. No send / pay / deploy / book / publish. Tape $ UNVERIFIED.

## A. Source Map

**Title (PACKET):** Claude Code Routines: Scheduled Agents That Run While You're Away
**Speaker / channel:** Nate Herk | AI Automation
**Kind / words:** Claude Code remote routines walkthrough · 3970 words
**Gaps:** No VTT cited in this take. Timestamps UNKNOWN. Visual-only UI clicks inferred only as INFERENCE.

Beats in order:

- Routines (research preview): a prompt that runs on Anthropic web infra on a schedule, API, or GitHub event. Laptop can be closed. Desktop app: local vs remote (GitHub) tasks. Cadence hourly+ (not every 10 min). Connectors: Slack, Gmail, APIs. Permissions: how Claude should act.
- SOURCE: these are one-shot; you are not around; 'you probably want to make sure that it doesn't ever have to stop and ask you questions. Otherwise, what's the point of the automation?'
- Needs a GitHub repo clone; .env is gitignored so keys go in the cloud environment. Network access trusted vs full — ClickUp only worked on full. Full risk: if Claude reads malicious content it could send data out; trusted would block. Demo: send a message in the internal ClickUp channel.
- YouTube comments analysis: must say 'use the env var, don't look for .env.' Playwright Skool automation failed remotely (no cookies; each run stateless; clone destroyed). Exception: code-change runs push a branch. Limits: Max $200 → 15 routine runs/day; Pro ~5 UNVERIFIED. 4 vCPU / 16GB / 30GB.
- Compare: routines (cloud, no local files, fully autonomous, 1h min) vs desktop scheduled vs /loop. Prompt must be specific + skill + order. Test with Run now before live. Fail → history; he suggests Slack him if fail. Claude.md on a huge repo wastes context. Do not push secrets.

## B. Atomic Knowledge

### Unattended one-shot is the point — and the never
- **Claim:** Remote routines are designed so they never stop to ask. Permissions can be fully autonomous. He still says test Run-now before live.
- **Reasoning:** One-shot unattended + Gmail/Slack/ClickUp connectors is auto-send. Full network is data-exfil risk he named.
- **Mechanism:** Write a specific prompt → Run now while Evens watches → only then schedule a no-send job → stop
- **Evidence:** On-tape: ClickUp message sent; 'doesn't ever have to stop and ask'; full vs trusted; 15/day on $200 Max.
- **Conditions:** On-tape demo / short captions.
- **Exceptions:** Tape $ and vendor names stay on-tape.
- **Action:** Steal test-before-live + env-not-in-git + trusted-network. Never unattended send. No Claude stack.
- **Confidence:** medium — caption ingest, timestamp UNKNOWN
- **Source:** `ehg4fhydTgs` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models

- If it has to ask, he thinks the automation failed. We think the ask is the product.
- Stateless clone + no cookies is a real constraint, not a bug.
- WAT (workflow+agent+tools) in the cloud is still a vendor we do not install.

## D. Procedures

- Keep: specific prompt, order of operations, Run-now test, env vars not in git, trusted network, fail-notify.
- Strip: Gmail/Slack/ClickUp send, full network, Playwright-on-Skool, unattended 'don't ask', Claude as stack.
- Do not schedule a world action. $200 / 15-runs UNVERIFIED.

## E. Examples

- **On-tape run** — Situation: ClickUp test → Action: Full network + env key → Reasoning: Trusted blocked it → Outcome: Internal channel message sent → Lesson: The first success was a send

- **On-tape run** — Situation: Skool Playwright cron → Action: Copy local prompt to remote → Reasoning: No cookies on a fresh clone → Outcome: Failed → Lesson: Unattended browser ≠ logged-in you

## F. Decision Rules

- If the prompt says don't ask questions → it cannot own send/book/publish.
- If network is full → treat as exfil risk; do not operate.
- If they have not Run-now'd → do not schedule.
- If Claude/Anthropic is the runtime → on-tape only.

## G. Contrarian

- Field wants laptop-closed agents. He names the ask as the failure mode. We name the ask as the gate.

## H. Assumptions

- Claude Code / $200 Max / 15 runs / Skool Playwright on-tape. Do not install.

## I. Questions

- Did any routine ever send Gmail, or only ClickUp test?
- Can teammates share routines on Team plan? He did not test.

## J. Connections

- Siblings: `EuzYhzB0vbI` (loops) · `HbsbqMQE-lI` (paste-once before cron) · `mPflFTQUCGk` (always-allow).
- SYSTEM SYNTHESIS → `coverage-loop` · `ask-principal` · `input-required-gate`.

## K. Future-Use

- Run-now-before-cron + env-not-in-git as hygiene. Parked. No Claude.

## Steal / Operate-never

Informed by A–K. Auto-send / auto-book stay operate-never. The machine is still stolen.

### Machine: Run-now test, then Evens (no unattended send)
- **Epistemic:** SYSTEM SYNTHESIS
- **Workflow / loop:** specific prompt → Run now while watched → fix → schedule only no-send work → Evens on any world action → stop
- **Questions / signals:** Does it ask? Can it hit Gmail/Slack/ClickUp? Trusted or full? Secrets in git?
- **Qualify / frame / objections:** Don't-ask-me is a no on send. Full network is a no. Claude is a no.
- **Procedure:** Steal test-before-live + env hygiene. Do not install Claude. Do not schedule send.
- **Example that proves it:** **On-tape run** — Situation: ClickUp routine → Action: Full access so it could send → Reasoning: Trusted failed → Outcome: Message in internal channel → Lesson: Unattended send worked — that is the never
- **Why it works:** He wants one-shot because he is away. Away is exactly when this desk holds the hard step.
- **Conditions / exceptions:** Hard steps stay HITL.
- **Operate-never payload:** Unattended Gmail/Slack/ClickUp. Full-network routines. Claude as stack. Quote $200/15-runs as FACT. Skool Playwright.
- **Hive run (existing skills only):** `ask-principal` · `coverage-loop` · `input-required-gate` · `confirm-then-actuate`
- **Source:** `ehg4fhydTgs` @ UNKNOWN

### Operate-never (this desk will not operate)

- Unattended Claude routines that send. Full network. Install Claude Code.
- Quote $200 Max / 15 runs as FACT.
- Auto-send / auto-book / auto-voice-book / auto-publish / auto-pay / auto-deploy.
- Quote tape $ / student counts / job-loss % / token burns as FACT.
- Install on-tape vendors (Claude Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool) as our stack. Cursor + Grok only.
- New `icp_id`. Unpark Normand. Outreach / hunt because a tape was interesting.
- Always-allow MCP / classifier / guardrail-pass as Evens.
- Merge `LESSONS-FROM-TAPE.md`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications

This is not a 24/7-Claude-operate tape. ACTION = steal Run-now + env hygiene; REJECT unattended send and Claude as stack.
