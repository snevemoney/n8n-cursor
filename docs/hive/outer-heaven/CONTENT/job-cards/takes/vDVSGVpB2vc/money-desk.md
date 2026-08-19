# Money Desk — vDVSGVpB2vc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~4250 words. Nate: Claude Code agent teams vs sub-agents — teammates talk, share a task list, QA can send work back. Caption-only; timestamp UNKNOWN. Beats in order: cold open — ‘create a team called Neuroflow of three teammates using Sonnet’ (FE, BE, QA) → team_create → three parallel agents + main session, shared list, they talk. FE+BE send to QA; QA finds 3 critical issues; main sends work back; second QA pass clears all three; one-shot fictional-AI-startup landing (copy, colors, animations) — not perfect, iterate. Unlock vs sub-agents: subs work alone and return to main; teams have a lead/PM, shared list, peer DM, reject/retry loops; main only herds quality. Setup: experimental, off by default; one env var in settings.json (he pastes official docs JSON; CC writes `.claude/settings.local.json` at project level). Then: paste agent-teams docs URL → ‘master reference guide in docs/’ so the project has local md (enable, when-to-use, display modes, task mgmt, hooks, best practices). Prompt pattern: goal first (teammates wake with no history — only the spawn prompt) + ‘create a team of X using {Haiku|Sonnet|Opus}’ + named roles + what each produces + who they message when done + final deliverables for main. Example goal: working fullstack REST+React on localhost, users+posts, QA pass/fail report, doc of what/why/how-to-run. Dos: each agent owns files (no overwrite); define output not vague; name recipients; 3–5 teammates not 10+ (10× $); give full context. Live #2: ‘research team’ clean-up — researcher/strategist/critic Sonnet; he opens the spawn prompt (‘you are the researcher… when done send five use cases to critic via send_message’); main nags researcher to message *both* strategist and critic; finish → main ‘shut down teammates, save work’; output Agent Teams Patterns + 11 doc gaps. Extension UI hides thinking; tmux terminal = color panes (blue FE / green BE / yellow QA), you can DM any teammate, approve, inject. Three rules: own territory/files; peer DM not only via main; parallel not a 1→2→3 bucket brigade (that’s subs). Wake-up: inherit main permissions (bypass/bash); can use project files, MCP, skills. Plan-approval mode: teammates plan, main (or you, or a reviewer teammate) must approve before execute — he prefers main, echoes ‘always start in plan mode.’ Pitfalls: permission-stops → pre-approve tools; overwritten deliverables → file owners; idle agent → assign work/deps in the prompt; token burn → fewer agents; lost work → temp files they can recall; wrong approvals → you approve until you learn the flow. When: multi-area, parallel, must react/assign/talk, high-quality multi-step. When not: sequential 1-2-3; need one conversation/window; same files; simple task. Cost: 3 sessions ≈ 3×; stay 2–5; shut down clean (teammate can refuse ‘I’m not done’) vs force-kill. Close: like + other CC card. No School/Plus card this tape.

## B. Atomic Knowledge
### Teams-talk-subs-return
- **Claim:** Sub-agents work alone and hand a result to main. Teams share a list, DM each other, and a QA can reject and send work back. Sequential 1→2→3 is not a team.
- **Reasoning:** Neuroflow: QA found 3 criticals; second pass cleared them. Research team: main had to nag the researcher to message both peers.
- **Mechanism:** Name recipients and the reject loop in the spawn prompt. Own files. 3–5 not 10+.
- **Evidence:** On-tape 3 criticals cleared; 11 doc gaps; tmux color panes.
- **Conditions:** The job needs peer talk or a reject loop.
- **Exceptions:** Claude Code / tmux / bypass-permissions are not ours. 3× cost is his napkin.
- **Action:** Steal talk-vs-return. Do not install CC. Do not analog 3×.
- **Confidence:** high as a ladder
- **Source:** vDVSGVpB2vc @ UNKNOWN
- **Epistemic:** SOURCE
### Wake-with-no-history-so-goal-first
- **Claim:** Teammates inherit permissions/MCP/skills/files but get no chat history — only the spawn prompt. Goal + why-the-peers-exist must be in that prompt.
- **Reasoning:** He trains the project on the official docs first so later spawns can read local md.
- **Mechanism:** Write goal, roles, deliverables, who-messages-whom. Plan-approve before execute.
- **Evidence:** On-tape fullstack localhost goal; researcher spawn text he reads aloud.
- **Conditions:** You are about to spawn peers.
- **Exceptions:** Bypass inherited by all teammates is a blast radius. HITL approve if money/send.
- **Action:** Steal goal-in-the-spawn. Do not bypass as us.
- **Confidence:** high
- **Source:** vDVSGVpB2vc @ UNKNOWN
- **Epistemic:** SOURCE
### Clean-shutdown-not-force-kill
- **Claim:** Main asks each teammate to save and confirm done. A teammate can say ‘not yet.’ Force-kill loses work. Idle/burn → fewer agents or assigned deps.
- **Reasoning:** Extension hides thinking; tmux lets you see a teammate go off-path and stop them.
- **Mechanism:** Save-to-files. Confirm shutdown. Watch panes if you can. Pre-approve tools to stop permission-chicken.
- **Evidence:** On-tape main ‘you’re done, save’; 11-gap doc survived shutdown.
- **Conditions:** A team is running.
- **Exceptions:** CC teams not ours. Token burn is a reason to stay at subs (`jZgcWCzxh1I` width-vs-depth).
- **Action:** Steal confirm-shutdown. HOLD the feature.
- **Confidence:** high as hygiene
- **Source:** vDVSGVpB2vc @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: teams are the quality/reject-loop rung, not a daily default. Priority: file owners, named DMs, 3–5, plan-approve, clean shutdown. Experience: Neuroflow landing + research-team doc. Contrarian: 1-2-3 sequential is subs. Uncertainty: experimental flag; 3× napkin.

## D. Procedures
His order: enable env var → local docs ingest → goal+roles+recipients prompt → spawn → watch/nag → QA reject loop → shutdown-save. Our order: do not enable. Steal talk-vs-return and goal-in-spawn. Caption-only: clicks UNKNOWN.

## E. Examples
**Situation:** Neuroflow landing. **Action:** FE+BE → QA. **Reasoning:** reject loop. **Outcome:** 3 criticals then pass; polished-ish one-shot. **Lesson:** QA-as-teammate is the product.

**Situation:** Researcher forgot a peer. **Action:** main nags. **Reasoning:** spawn said message both. **Outcome:** inventory reaches strategist+critic. **Lesson:** Named recipients still need a herder.

**Situation:** Extension vs tmux. **Action:** same prompt. **Reasoning:** see thinking. **Outcome:** color panes + per-agent DM. **Lesson:** If you cannot see them, you cannot stop a wrong path.

## F. Decision Rules
IF sequential or one window or same files → subs not teams. IF peer talk / reject / parallel specialties → team, 3–5, file owners. IF permission-stops → pre-approve, don’t bypass as us. IF 10+ / 3× / experimental → UNVERIFIED / not ours. Refuse: CC teams as ours; inherited bypass.

## G. Contrarian
Rejects ‘teams = more sub-agents.’ Rejects 10+ swarms. Rejects force-kill.

## H. Assumptions
Experimental, off by default. Landing is a toy. 3× is rhetoric. Survivorship: his docs ingest already existed as a habit. Falsifier: QA rubber-stamps. Speech≠behavior: ‘one-shot’ then ‘we’d iterate.’

## I. Questions
Did Neuroflow’s 3 criticals match real bugs? Any receipt we can open that teams beat subs on a paid job? What’s the live flag name?

## J. Connections
SYSTEM SYNTHESIS: talk-vs-return = `jZgcWCzxh1I` team vs workflow. Goal-in-spawn = `ehg4fhydTgs` one-shot. Clean shutdown = confirm-before-run. CC operate-never. 3× → `pricing-margin-roi-guardrails` UNVERIFIED.

## K. Future-Use
Unassigned: inherit-permissions-as-blast-radius. Plan-approver-as-a-teammate-role.

## Steal / Operate-never

### Machine: Peer-talk-and-reject-loop-or-stay-at-subs
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: a job with specialties that must react → action: goal-first spawn, named recipients, file owners, 3–5, plan-approve, QA can send back → checkable stop: QA pass + files saved + clean shutdown confirm, not a force-kill
- **Questions / signals:** Must they talk? Who owns which files? What’s the reject loop? Can we see the panes?
- **Qualify / frame / objections:** Frame: teams ≠ more subs. Objection: ‘just add agents’ — 10+ is 10× and idle seats.
- **Procedure:** Do not enable CC teams. Steal the ladder. HITL any send. Tape 3× UNVERIFIED.
- **Example that proves it:** Neuroflow 3 criticals then pass; researcher nagged to message both. UNVERIFIED $.
- **Why it works:** Quality comes from a peer who can say no. Sequential handoff does not need a team tax.
- **Conditions / exceptions:** Works as a rung. Exception: CC / tmux / bypass / 3× as FACT operate-never.
- **Operate-never payload:** Claude Code agent teams · inherited bypass · 10+ swarm · 3× as analog
- **Hive run (existing skills only):** `ask-principal` · `golden-test-loop` · `pricing-margin-roi-guardrails` · `input-required-gate`
- **Source:** vDVSGVpB2vc @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote 3× / 10× / 3 criticals as FACT or as our analog.
- Enable Claude Code agent teams. Inherit bypass permissions. Force-kill a run that can send.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD agent teams. Steal talk-vs-return, goal-in-spawn, clean-shutdown. Any send stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
