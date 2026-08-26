# Researcher — vDVSGVpB2vc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~4250 words). Title: How to Build Claude Agent Teams Better Than 99% of People. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Demo: “create a team called Neuroflow of three teammates using Sonnet” — frontend, backend, QA. `team create` → three parallel agents, shared task list, they talk. FE+BE send to QA; QA finds **3 critical issues**; main sends work back; second QA pass clears; “one-shot” fictional AI landing page (copy, color, motion). Not perfect; still “most powerful feature” if used right. (2) vs sub-agents: subs work alone and return to main. Teams: lead/PM + shared tasks + **peer messages** (dependencies, QA bounce). Main watches quality/done. (3) Setup: experimental, **off by default**. Copy docs JSON into project `settings.local.json` (he asks Claude to write it). Then: paste agent-teams docs URL → “master reference guide” in `docs/` so the project can look locally (same trick he uses for fat MCPs). (4) Prompt pattern: goal first (teammates wake with **no history**, only the spawn prompt) → “create a team of N using {Haiku|Sonnet|Opus}” → per-agent role, produce-X, talk-to-Y. Example: fullstack REST+React, localhost, users/posts, QA report, decisions doc. Name recipients (“when done, message FE”). (5) Do: own files; define output; name recipients; **3–5** teammates not 10+; give full context. Don’t: shared files (overwrite); vague deliverables; assume they know who to ping; swarms. (6) Live “research team” (researcher/strategist/critic) on the new project: spawn prompts shown (`in`); main nags researcher to message *both* others; shutdown request at end (“save your work”). Output: Agent Teams Patterns doc, 11 doc gaps. (7) VS Code extension = you only see main. **tmux** (Windows workaround; he had Claude walk it): colored panes, talk to one teammate, approve, watch. (8) Three rules: territory (own files), direct message (no required middleman), true parallel (if it’s strictly 1→2→3 you may only need sub-agents). Wake-up inheritance: **main’s permissions** (bypass / allow-all-bash flow downhill), plus all files/MCP/skills. **Plan-approval mode:** teammates plan, main (or you, or a reviewer teammate) approves before execute. He prefers main-as-approver. (9) Pitfalls: permission nag → pre-approve tools; overwrite → file owners; idle agent → assign work/dependency; token burn → fewer agents; lost work → temp files; wrong approvals → you approve until you learn the flow. When: multi-area, parallel, must react to each other, high quality. When not: sequential, need one shared window, same files, simple. Cost ≈ N sessions. Shut down cleanly (teammate can refuse if not saved) vs force-kill. **Do not flatten** vs `jZgcWCzxh1I` (workflow = no peer talk, plan-in-JS) · `5p5cV0yVDvQ` always-allow send. All $ / “99%” / 3 issues UNVERIFIED.

## B. Atomic Knowledge

### Teams are for peer talk + bounce, not for a bucket brigade
- **Claim:** If the work is strictly sequential or a single focused return, use sub-agents. Teams exist so QA can reject FE/BE and they can message without the main as a mailbox — *and* so they can run at the same time.
- **Reasoning:** N teammates ≈ N× cost. 10+ is a swarm tax. 3–5 is his band.
- **Mechanism:** Shared task list + send-message + main as quality/shutdown. Neuroflow: 3 issues → bounce → pass.
- **Evidence:** “if it’s 1-2-3… maybe that’s just sub agents.”
- **Conditions:** Experimental flag. Sonnet in the demos.
- **Exceptions:** A “research team” that is mostly sequential still produced a long doc — he used a team anyway.
- **Action:** Steal talk-vs-return. Hive: `hive-spawn-desks` already covers crew; do not enable Claude teams.
- **Confidence:** high as the split.
- **Source:** `vDVSGVpB2vc` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** first QA fail then pass
- **Speech ≠ behavior:** “one-shot” after an explicit second pass.

### Spawn prompt is the only memory; name the recipient
- **Claim:** Teammates start empty. Goal + role + “when done, message X” must be in the spawn. Main will nag if you don’t (researcher told to send to both).
- **Reasoning:** No chat history downhill. They *can* read the repo after wake.
- **Mechanism:** Natural-language team create; inspect the `in` prompt per teammate.
- **Evidence:** Shutdown “save your work”; 11-gap doc from the research team.
- **Conditions:** Fresh project in the setup half.
- **Exceptions:** Local docs/ guide he generated so later teams can read it.
- **Action:** Steal goal-first + named recipients + inspect spawn text.
- **Confidence:** high.
- **Source:** `vDVSGVpB2vc` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** researcher missed a recipient until nagged
- **Speech ≠ behavior:** none.

### Permissions and files flow downhill — plan is the brake
- **Claim:** Bypass / allow-all-bash on main is inherited. Everyone can use every MCP/skill. File overlap = overwrite. Plan-approval (main or you or a reviewer teammate) is how you stop a swarm from executing a bad plan. Clean shutdown > kill.
- **Reasoning:** A team is not a sandbox from the parent. tmux is how you *see* a runaway.
- **Mechanism:** settings.local.json flag; pre-approve tools; file owners; temp files if work is vanishing; 2–5 cap.
- **Evidence:** Pitfall list; “if you’re on bypass… all of your agents are.”
- **Conditions:** Experimental teams as taped.
- **Exceptions:** He still likes main (not human) as default plan approver — hive would keep human on send.
- **Action:** Steal inheritance warning + file territory + clean shutdown. Operate-never: bypass teams.
- **Confidence:** high as the warning.
- **Source:** `vDVSGVpB2vc` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** permission nags (named as common)
- **Speech ≠ behavior:** “you approve until you learn” vs “probably better [if] the main session [approves].”

## C. Mental Models
Talking crew ≠ returning workers ≠ JS workflow width (`jZgcWCzxh1I`). Empty-context spawn. Territory or overwrite. Inheritance is a loaded gun. Cost is linear in teammates. Clean shutdown is part of the job. Docs-local is how you stop re-fetching the same URL.

## D. Procedures
1. Only if the job needs parallel specialists who must bounce (on-tape). Else stop.
2. Enable experimental flag in *project* settings (he pastes docs JSON). Hive: don’t.
3. Optional: fetch official docs into `docs/` as a local guide.
4. Prompt: goal → N (3–5) + model → per-agent role/output/who-to-message → named final artifacts.
5. Assign file owners. Pre-approve only the tools you mean.
6. Prefer plan-approval before execute. Watch in tmux if you need to message one pane.
7. Main nags missing sends; then shutdown-with-save, don’t kill.
8. Hive: `hive-spawn-desks` + `ask-principal`; no Claude teams; no bypass.

## E. Examples
- **Situation:** Neuroflow landing page. **Action:** FE/BE/QA team. **Outcome:** 3 criticals, bounce, then pass. **Lesson:** “one-shot” was a loop.
- **Situation:** Research team. **Action:** three Sonnets on a new repo. **Outcome:** 11-gap doc; researcher needed a nag to CC both. **Lesson:** name every recipient.
- **Situation:** Extension vs tmux. **Action:** same prompt. **Outcome:** extension = main-only; tmux = talk-to-one. **Lesson:** visibility is a product feature.
- **Situation:** Bypass on main. **Action:** spawn team. **Outcome:** all inherit. **Lesson:** don’t.

## F. Decision Rules
- IF they must talk and run in parallel → team (on-tape).
- IF 1→2→3 or one return → sub-agent.
- IF >5 teammates → he says don’t.
- IF files overlap → you will overwrite.
- IF main is on bypass → the team is on bypass.
- IF you can’t see panes → you can’t steer a runaway.
- Refuse: enable teams in hive; quote 99% as FACT; new ICP.

## G. Contrarian
“Better than 99%” is the title; the body is a pitfalls list. The polished landing page is a second-pass after QA. Teaching “ask Claude to write the experimental flag” is how features spread without the human reading the JSON. Main-as-approver conflicts with hive HITL on hard steps.

## H. Assumptions
3 critical issues, token-multiples, experimental-default-off = **UNVERIFIED** as counts; inheritance is his stated behavior.
**Desk dissent:** Steal talk-vs-return + inheritance. Do not turn on Claude teams. Keep workflow-width (`jZgcWCzxh1I`) as a different rung.

## I. Questions
- Exact env var name (he says “this JSON” — do not invent)?
- Plan-approval: teammate-as-reviewer ever demoed?
- Windows tmux workaround steps (unshown)?

## J. Connections
- **SYSTEM SYNTHESIS:** `jZgcWCzxh1I` (width, no peer talk) · `5p5cV0yVDvQ` (always-allow) · `hive-spawn-desks` · `XNQBCRcwXV4`. Skills: `hive-spawn-desks` · `ask-principal` · `input-required-gate` · `golden-test-loop`.

## K. Future-Use
Peer-talk vs return. Named recipients in spawn. File territory. Permission inheritance. Clean shutdown. Local docs-guide trick.

## Steal / Operate-never

### Machine: talking-crew-with-territory
- **Epistemic:** SOURCE
- **Workflow / loop:** decide talk+parallel vs return-only → if team: goal + 3–5 named roles + file owners + who-messages-whom → plan-approve → watch/nag missing sends → shutdown-with-save
- **Questions / signals:** Must they bounce? Same files? Is main on bypass? Can I see each pane?
- **Qualify / frame / objections:** N× cost. Experimental. Hive already has desks.
- **Procedure:** D.
- **Example that proves it:** QA bounce on Neuroflow; researcher missed a CC; inherit-bypass warning.
- **Why it works:** Empty-context agents only do what the spawn and the peer messages say; territory stops overwrite.
- **Conditions / exceptions:** On-tape Claude only. Hive does not enable it.
- **Operate-never payload:** Bypass teams; 10+ swarm; experimental flag in hive; new ICP.
- **Hive run (existing skills only):** `hive-spawn-desks` · `ask-principal` · `input-required-gate`
- **Source:** `vDVSGVpB2vc` @ UNKNOWN

**Operate-never**
- Enable Claude agent teams / bypass. Quote 99% as FACT. New `icp_id`. Send / pay / deploy.

## L. Role-Specific Applications
Map talking-crew onto `hive-spawn-desks` vocabulary. Keep workflow-width as a separate rung. Do not port the experimental flag.
