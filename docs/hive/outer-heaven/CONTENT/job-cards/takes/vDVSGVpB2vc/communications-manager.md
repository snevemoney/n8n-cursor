# Communications Manager — vDVSGVpB2vc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** How to Build Claude Agent Teams Better Than 99% of People
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 4250 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Open: ‘create a team called Neuroflow’ — three Sonnet teammates (FE/BE/QA). Shared task list; they talk. QA finds three critical issues; main sends work back; second pass clears; landing page for a fictional AI startup. Not perfect; iterate.
- Teams ≠ sub-agents: sub-agents return to main only. Teams have a lead, shared list, peer messages, QA loops. Disabled by default (experimental). One env var in settings.local.json. He pastes official docs into the project as a markdown reference first.
- Prompt pattern: goal first (teammates wake with no chat history) → create a team of N on Haiku/Sonnet/Opus → name roles, outputs, who messages whom. Example deliverables: running localhost app, pass/fail report, decisions doc. Do: own files (no overwrite), named recipients, 3–5 teammates not 10+, full context. Don’t: vague deliverables, assume they know who to talk to.
- Live: research team (researcher/strategist/critic) on a cleanup goal; main nags the researcher to message both peers; output = Agent Teams Patterns + 11 doc gaps. Extension hides thinking; tmux shows colored panes and lets you DM a teammate. Plan-approval mode: teammates plan, main (or you, or a reviewer teammate) approves before execute. They inherit main permissions (bypass = they bypass) plus files/MCP/skills.
- Pitfalls: permission-stops → pre-approve tools; overwritten work → file owners; idle agent → assign work/deps; token burn → fewer agents; lost work → temp files; bad approvals → you approve until you understand. When: multiple areas, parallel, must react, high quality. When not: strict 1-2-3 sequence (use sub-agents), one shared window, same files, simple task. 3 sessions ≈ 3× cost; he caps ~2–5. Shut down cleanly (save/confirm) — don’t force-kill. Like/end.

## B. Atomic Knowledge

### A letter is not a three-pane team — QA-back is the steal, Ultra-swarm is the never
- **Claim:** Neuroflow’s value was the QA sending work back. Cost is roughly N×. Sequential or one-window jobs should stay one thread.
- **Reasoning:** Teammates inherit bypass. A comms draft does not need FE/BE/QA on Sonnet.
- **Mechanism:** Steal: separate checker, named owner, confirm before execute. Do not stand up Claude teams. Do not enable bypass for a mailer.
- **Evidence:** Three criticals then a pass; 3× cost; inherit bypass.
- **Conditions:** A job that truly has peer dependencies.
- **Exceptions:** 99% in the title is marketing. Claude teams as ours is never.
- **Action:** Checker on a draft. Evens is the yes. No send.
- **Confidence:** high
- **Source:** `vDVSGVpB2vc` @ UNKNOWN
- **Epistemic:** SOURCE

### Wake with no history — the goal and the shutdown are the product
- **Claim:** Teammates only get what main feeds. Vague goal = three expensive wanderers. Force-kill loses work; he wants a confirm-save shutdown.
- **Reasoning:** Same as a letter: name the destination; do not leave a half-written send hanging.
- **Mechanism:** Name the deliverable. No hanging Gmail drafts from an agent. No force-send.
- **Evidence:** Goal-first prompt; shutdown request the researcher can refuse if not done.
- **Conditions:** Any multi-agent run.
- **Exceptions:** We do not run the team.
- **Action:** Destination in the card. Dual gate empty.
- **Confidence:** high
- **Source:** `vDVSGVpB2vc` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Own files; name who you message; 3–5 not 10+. **SOURCE**
- If they need each other, team; if 1-2-3, sub-agent. **SOURCE**
- Plan then approve — he still prefers main (or you) as the approver. **SOURCE**

## D. Procedures
- Docs in-repo → env on → goal + roles + owners → plan-approve → watch/shutdown. **SOURCE**
- This desk: one Grok thread. Evens approves. No Claude team. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Fictional startup landing page. → **Action:** FE/BE/QA; three criticals; second pass. → **Reasoning:** Peers can reject. → **Outcome:** Polished-enough one-shot. → **Lesson:** Steal the reject loop, not the swarm. Implicit rule: inherit-bypass is a never.

## F. Decision Rules
- If the job is one letter → not a team.
- If bypass is on → they all bypass → never for mail.
- Refuse: 99% as FACT. Claude teams as ours. tmux comms war-room.
- Optimize: one named checker; Evens is shutdown.

## G. Contrarian
- Field will swarm 10. He caps 2–5 and says simple tasks are overkill. **SOURCE**

## H. Assumptions
- Quality claim is one demo. Falsifier: a teammate that can send.

## I. Questions
- Are we about to fan-out a sentence because a tape said ‘teams’?

## J. Connections
- **SYSTEM SYNTHESIS:** `jZgcWCzxh1I` (width vs depth). `EuzYhzB0vbI` (checker). `e18sdZLwP7o`.

## K. Future-Use
- QA-back as an ops note. No Claude team on hive mail.

## Steal / Operate-never

### Machine: Named checker + confirm-shutdown; never inherit-bypass a mailer; never 10-agent a letter
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Does it need peers? → if no, one thread → Evens is the QA → no send.
- **Questions / signals:** Would this inherit send permissions?
- **Qualify / frame / objections:** Qualify: landing-page demo vs a sentence. Frame: N× cost. Objection: ‘QA found three bugs’ → we already have HITL.
- **Procedure:** 1) No Claude teams. 2) No bypass. 3) No send.
- **Example that proves it:** QA sends three criticals back; second pass clears.
- **Why it works:** Reject-loop is the product; the swarm is the bill.
- **Conditions / exceptions:** Claude Code tapes. Exception: Cursor + Grok.
- **Operate-never payload:** Quote 99% as FACT. Enable experimental teams on hive.
- **Hive run (existing skills only):** `ask-principal`. `golden-test-loop`.
- **Source:** `vDVSGVpB2vc` @ UNKNOWN


### Operate-never (this desk will not operate)
- Enable Claude agent teams on hive mail. Inherit bypass. Quote 99% as FACT. Force-kill a send.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not run a Neuroflow on a letter. I do not send. Clients parked.
