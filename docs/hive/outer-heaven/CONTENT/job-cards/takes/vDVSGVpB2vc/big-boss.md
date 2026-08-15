# Big Boss — vDVSGVpB2vc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 16:29, 4250 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Neuroflow landing page, tmux color panes, “Agent Teams Patterns” doc, official docs page.

Beats, in order:

1. Cold open: paste “create a team called Neuroflow” — three Sonnet teammates (front-end, back-end, QA). Tool `team create`. Shared task list. They talk to each other.
2. QA finds **three critical** issues. Lead sends work back. Second QA pass “clears” them. Landing page for a fictional AI startup — he still wants another iterate. Calls it one-shot and “most powerful… if you know how.”
3. Teams ≠ sub-agents: subs return to main only; teams have a lead + shared list + peer talk + send-back loops.
4. Setup: experimental, **disabled by default**. One env var in project `settings.local.json`. He has Claude write it.
5. Train the project: paste official agent-teams docs URL → markdown in `docs/` so the team can read locally.
6. Prompt pattern: goal (why teammates exist) → N agents × model → each role + produce X → name who to message → final deliverables (running app, pass/fail report, decisions doc).
7. Do/don’t: own specific files; define output; name recipients; **3–5** not 10+; give full context (teammates wake with no history).
8. Second live team: researcher / strategist / critic on workspace cleanup. Lead nags researcher to message both. Lead shuts them down only after “save your work.”
9. tmux: split panes, color agents, message individuals; VS Code extension hides the thinking.
10. Three rules: territory (own files), direct message (no required middleman), parallel (1→2→3 may **not** need a team).
11. Wake-up inheritance: permissions (bypass propagates), files, MCP, skills. Plan-approval mode: teammates plan; main (or a reviewer teammate) approves before execute.
12. Pitfalls: permission nag → pre-approve tools; overwrite → file owners; idle agent → assign work/dependency; token burn → fewer agents; lost work → temp files; wrong approval → human approves first.
13. When to use / not: multi-area + parallel + react-to-each-other + high quality. Not: sequential, one context window, same files, simple task. Cost ≈ N sessions. He likes **2–5 max**. Shut down clean; do not force-kill.
14. CTA: another Claude Code video. **$ UNVERIFIED** (N× tokens; no dollar figure on this tape).

Off-topic / not skipped: VS Code vs terminal; Windows tmux workaround; “spin up a team to explain teams”; fictional startup polish.

## B. Atomic Knowledge

### QA that can send work back is the unlock
- **Claim:** The useful loop is not chat. It is a checker that can fail the work and force another pass.
- **Reasoning:** Front and back handed QA a build. QA named three criticals. Lead sent it back. Second pass cleared them.
- **Mechanism:** Shared task list + peer message + lead as quality owner.
- **Evidence:** Demo narrates three criticals → send-back → “resolved.” He still wants another iterate.
- **Conditions:** QA has a fail language. Lead does not ship the first pass.
- **Exceptions:** “Cleared” is his narration. We did not see the bugs. Page is still imperfect.
- **Action:** Maker-checker is the steal. A three-persona landing team is not.
- **Confidence:** high for the loop shape; low for “one-shot”
- **Source:** `vDVSGVpB2vc` @ UNKNOWN — “the QA agent found three critical issues… send all of this work right back”
- **Epistemic:** SOURCE

### Teams are not sub-agents
- **Claim:** Sub-agents work alone and return to main. Teams have a lead, a shared list, and peer talk.
- **Reasoning:** Dependency (“I need something from teammate two”) is why he wants teams. Sequential 1→2→3 may not qualify.
- **Mechanism:** `team create` + send-message tool between teammates.
- **Evidence:** He “had to clear that up” because of confusion.
- **Conditions:** Parallel work that must react. Not a relay.
- **Exceptions:** If they only hand off once, he says use sub-agents and save tokens.
- **Action:** If it is a funnel, it is not a team. `coverage-loop` stays one wired system.
- **Confidence:** high
- **Source:** `vDVSGVpB2vc` @ UNKNOWN — “that honestly might not even call for an agent team”
- **Epistemic:** SOURCE

### Experimental means off until you flip a local flag
- **Claim:** Agent teams are disabled by default. You add a documented variable to project settings.
- **Reasoning:** Official docs say experimental. He copies JSON into `.claude/settings.local.json` via the agent.
- **Mechanism:** One project-level enable. Then natural-language “create a team.”
- **Evidence:** Empty project → settings file → docs ingest.
- **Conditions:** Works in Claude Code wherever he runs it (he likes VS Code).
- **Exceptions:** Feature can change; tape is a moment in time.
- **Action:** Do not enable experimental Claude teams on the hive. Named desks already exist.
- **Confidence:** high that he did it
- **Source:** `vDVSGVpB2vc` @ UNKNOWN — “disabled by default because it’s an experimental feature”
- **Epistemic:** SOURCE

### Teammates wake with no history — feed the goal and the docs
- **Claim:** New teammates only get what the lead prompt injects. They can read the repo; they do not inherit the chat.
- **Reasoning:** Without a goal they do not know why the others exist. Without local docs they re-fetch or guess.
- **Mechanism:** Goal paragraph + role + “when done, message X” + official-docs markdown in `docs/`.
- **Evidence:** Researcher spawn prompt shown (“you are the researcher… include anything that might be helpful”).
- **Conditions:** Deliverables named (running app, pass/fail, decisions doc).
- **Exceptions:** They can still read files and MCP; “no context” means no prior conversation.
- **Action:** Definition of done in the spawn prompt. Vague “help” is how they overwrite.
- **Confidence:** high
- **Source:** `vDVSGVpB2vc` @ UNKNOWN — “when the agents wake up, they have no context”
- **Epistemic:** SOURCE

### Own the files or they overwrite each other
- **Claim:** Each agent owns specific files. Shared edit is the failure mode.
- **Reasoning:** Parallel writers on one path collide. Territory is the first of his three key rules.
- **Mechanism:** Prompt assigns owners. Pitfall fix: “assign file owners” if deliverables feel overridden.
- **Evidence:** Do-list and pitfalls both name overwrite.
- **Conditions:** Parallel teams. Sequential one-file work should not be a team.
- **Exceptions:** They may send files across; they should not all edit the same one.
- **Action:** `slice-build` = one system, one owner. Parallel only when work does not collide.
- **Confidence:** high
- **Source:** `vDVSGVpB2vc` @ UNKNOWN — “if you don’t do this and agents are sharing files, they might overwrite each other’s work”
- **Epistemic:** SOURCE

### Name the recipient; do not assume they know who to talk to
- **Claim:** Prompt must say “when done, message the front-end” / “wait for the back-end.”
- **Reasoning:** No history. Peer talk only works if the address is in the spawn.
- **Mechanism:** Send-message tool + named teammate.
- **Evidence:** Lead later nags: “Did you send your structured inventory to both… You were asked to message both teammates.”
- **Conditions:** Dependencies written in the plan.
- **Exceptions:** Idle agent = you forgot to assign work or a dependency.
- **Action:** Named desks, named handoffs. Not “the team will figure it out.”
- **Confidence:** high
- **Source:** `vDVSGVpB2vc` @ UNKNOWN — “do name recipients, don’t just assume”
- **Epistemic:** SOURCE

### Two to five, not a swarm — cost is N sessions
- **Claim:** Three sessions ≈ 3× tokens. He caps **2–5**. 10+ is 10× and “massive.”
- **Reasoning:** Teams are slower and more expensive; quality only if used right. Simple work is overkill.
- **Mechanism:** One session per teammate plus lead.
- **Evidence:** Do/don’t and when-not both say it. **$ UNVERIFIED** (no dollar).
- **Conditions:** Complex, multi-area, need peer reaction.
- **Exceptions:** He also burns leftover session budget on “fun” debate panels in `vfWTyEreOEc` — different tape.
- **Action:** 17 named desks is the workforce. I do not add Neuroflow.
- **Confidence:** high for his rule; zero for our bill
- **Source:** `vDVSGVpB2vc` @ UNKNOWN — “I like to stay around maybe two to five agents max”
- **Epistemic:** SOURCE

### Bypass and tool rights propagate
- **Claim:** Teammates inherit main-session permissions. Bypass-all means bypass-all.
- **Reasoning:** Convenience is the pitch. Blast radius is the cost.
- **Mechanism:** Wake-up inheritance: permissions, files, MCP, skills.
- **Evidence:** He states it as “very important.”
- **Conditions:** Useful if you pre-approve a small tool list. Dangerous if main is wide open.
- **Exceptions:** Permission-nag pitfall → pre-approve specific tools, not “all bash.”
- **Action:** Do not propagate bypass-permissions to a swarm. Hive hard steps stay HITL.
- **Confidence:** high
- **Source:** `vDVSGVpB2vc` @ UNKNOWN — “if you’re on bypass permissions, then all of your agents are going to be on bypass permissions”
- **Epistemic:** SOURCE

### Clean shutdown after each confirms save
- **Claim:** Lead asks each teammate to save. They may refuse if not done. Force-kill loses work.
- **Reasoning:** Checkable stop is confirm-then-close, not kill-the-panes.
- **Mechanism:** Shutdown request message; teammate can say “don’t shut me down yet.”
- **Evidence:** Research-team close: “You’re done. Save your work.”
- **Conditions:** Works when someone is watching (tmux helps).
- **Exceptions:** Early wrong-path → shut that one down; that is not force-kill of a finished team.
- **Action:** `coverage-loop` dry-run ends in a save confirm. Not a force-kill.
- **Confidence:** high
- **Source:** `vDVSGVpB2vc` @ UNKNOWN — “rather than just force killing it right away where things might be all out of control”
- **Epistemic:** SOURCE

### Plan first — teammates should not execute on a shrug
- **Claim:** Plan-approval mode: teammates plan; main (or a reviewer teammate) approves before execute. He still says “always start in plan mode.”
- **Reasoning:** Ambiguous work wastes N× tokens. Approval is the cheap check.
- **Mechanism:** Plan-approval mode; optional human-approves-every-plan until you understand the flow.
- **Evidence:** Pitfall: “wrong approval” → you approve first.
- **Conditions:** Complex multi-agent jobs.
- **Exceptions:** He lets main approve rather than the human on every plan — that is his taste, not a hive rule.
- **Action:** Plan is a checkable stop. Evens is the visionary on anything that spends or ships.
- **Confidence:** high for the pattern
- **Source:** `vDVSGVpB2vc` @ UNKNOWN — “they have to basically get their plan approved by the main agent before they’re actually allowed to go execute”
- **Epistemic:** SOURCE

## C. Mental Models

- **Checker with send-back > more chatters.** QA is the product. **SOURCE**
- **Relay is not a team.** 1→2→3 is a funnel. **SOURCE**
- **No history at wake.** Goal and recipients must be in the spawn. **SOURCE**
- **Territory before parallelism.** Overwrite is the smell. **SOURCE**
- **N workers ≈ N× bill.** Cap the headcount. **SOURCE**
- **Inheritance is a loaded gun.** Bypass on main is bypass on all. **SOURCE**
- **Confirm save, then close.** Force-kill is how you lose the artifact. **SOURCE**
- **“One-shot polished site” is the thumbnail.** He still wants another iterate. **INFERENCE**

## D. Procedures

1. **Qualify:** Is this parallel + reactive + multi-file, or a relay? If relay, do not spawn a team.
2. **Name owners and files** before anyone writes.
3. **Write the goal** (why teammates exist) + deliverables (what “done” looks like).
4. **Name recipients** in each spawn (“when done, message X”).
5. **Cap 2–5.** Refuse 10+.
6. **Plan / approve** before execute.
7. **Checker can fail** and send back. Lead does not ship pass one.
8. **Watch** (or at least require status). Kill a wrong-path worker early.
9. **Shutdown:** ask save; wait for confirm; then close.
10. **Questions / signals:** “Who owns this file?” “Is this a relay?” “Did QA fail it?” “Did they confirm save?”
11. **Objections:** “They talked to each other so it’s better” — talk is not a pass. “Three criticals cleared” — we did not see the bugs.
12. **Avoid:** Claude teams as hive OS; bypass-all; tmux theater; fictional-startup as a SKU.
13. **When to change:** Same files, sequential steps, or a simple task → one desk, not a team.

## E. Examples

**Situation:** Neuroflow builds a fictional landing page. QA finds three criticals.  
**Action:** Lead sends work back; second QA pass “clears”; he still wants another iterate.  
**Reasoning:** Checker without send-back is a comment thread.  
**Outcome:** Polished-looking page; bugs UNVERIFIED; not shipped as a product.  
**Lesson:** Send-back is the machine. “One-shot” is the ad. Implicit rule: first pass is not done.

**Situation:** Research team. Researcher might have messaged only one teammate.  
**Action:** Lead asks: did you send the inventory to both? Researcher confirms. Then critic runs.  
**Reasoning:** Named recipients still need a nag.  
**Outcome:** Reports land; 11 doc gaps listed.  
**Lesson:** Spawn prompt is not enough; lead checks the handoff. Implicit rule: verify the message, not the vibe.

**Situation:** Work looks done. Lead says shut down and save.  
**Action:** Each teammate gets a shutdown request; they may refuse if unfinished.  
**Reasoning:** Force-kill loses dirty buffers.  
**Outcome:** Clean close (narrated).  
**Lesson:** Confirm-then-close. Implicit rule: done includes saved.

## F. Decision Rules

- If the work is 1→2→3 → do not make a team.
- If two writers share a file → stop; assign owners.
- If there is no checker who can fail → it is a swarm, not a loop.
- If headcount > 5 → refuse.
- If main is on bypass-all → do not spawn.
- If save is unconfirmed → do not close.
- Optimize: quality via send-back, not via more personas.
- Refuse (this desk): Claude Code teams, tmux swarm, Neuroflow as a hive SKU.

## G. Contrarian

- Against “more agents = more power”: he caps 2–5 and names when *not* to use teams.
- Against “sub-agents are the same”: peer talk + send-back is the difference he cares about.
- Against “watch the chat and trust it”: tmux exists because the extension hides thinking.
- Field assumes the landing page proved teams. He still wants another iterate.

## H. Assumptions

**His:** Claude Code is the OS; experimental teams are worth enabling; Sonnet is enough; official docs ingested locally make teams “effective”; tmux is teachable; leftover context should be spent on teams.

**Ours:** Captions complete enough (4250 words). “Three criticals resolved” and “one-shot” are survivorship + edit. Domain-specific: software-shaped demo, not a client book-flow. Clients parked.

**Falsifiers:** Overwrite still happens with named owners. QA rubber-stamps. Token bill dwarfs the page. Experimental flag breaks.

**Disagreement (keep labeled):** Hive will not operate Claude agent teams. The **named-owner + send-back + confirm-save** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What were the three criticals. Not on tape.
- Does plan-approval by main (not Evens) hide bad plans?
- How often does “cleared” regress on a third pass?
- Windows tmux workaround — he skipped the setup.
- Real $ for 3× Sonnet on a landing page — not on tape.

## J. Connections

- **SYSTEM SYNTHESIS** → `golden-test-loop` (QA send-back; keep only what the checker passes).
- **SYSTEM SYNTHESIS** → `hive-spawn-desks` (named owners, no file collision; 17 is the cap).
- **SYSTEM SYNTHESIS** → `slice-build` (one landing, one owner).
- **SYSTEM SYNTHESIS** → `coverage-loop` (clean shutdown; one wired system).
- **SYSTEM SYNTHESIS** → `interview-to-desk` (no 18th teammate named Neuroflow).
- **SYSTEM SYNTHESIS** → `vfWTyEreOEc` (same teams feature, ranked #8, used as debate panel — different use).
- Do not force a Path A client out of a fictional AI startup.

## K. Future-Use

- Send-back language as a Watchdog job card (unassigned).
- File-owner map before any parallel Forge run (unassigned).
- Shutdown-confirm as a coverage-loop footer (unassigned).
- “When not to team” as a Big Boss refuse list (this take).
- Plan-approval as `ask-principal` when the plan spends or ships (unassigned).

## Steal / Operate-never

### Machine: Named owners + checker send-back + confirm-save
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (work that is actually parallel) → name file owners → write goal + deliverables + recipients → cap 2–5 → plan/approve → makers work → checker can fail and send back → lead verifies handoffs → each confirms save → close. Checkable stops: owner map; checker fail language; save confirm.
- **Questions / signals:** “Relay or team?” “Who owns this file?” “Did QA fail it?” “Did they confirm save?”
- **Qualify / frame / objections:** Command physics, not Neuroflow. “One-shot site” is the magnet. Objection: they talked so it’s better — talk is not a pass.
- **Procedure:** D steps 1–9.
- **Example that proves it:** Three criticals → send-back → second pass. Researcher nagged to message both. Shutdown after save. Lesson: checker and confirm are the machine; the swarm is the costume.
- **Why it works:** Parallel writers need territory. Quality needs a fail. Close needs a save. Conditions: multi-area work, a real checker, a lead who nags. Exceptions: sequential work; same file; simple task; we never saw the bugs.
- **Conditions / exceptions:** Cursor + Grok only (Claude Code / tmux / Sonnet teams stay on tape). Clients parked.
- **Operate-never payload:** Enable experimental Claude teams; bypass-permissions for all; tmux swarm as hive OS; quote three-criticals / one-shot / 2–5 as FACT.
- **Hive run (existing skills only):** `golden-test-loop` · `hive-spawn-desks` · `slice-build` · `coverage-loop` · `interview-to-desk` · `ask-principal` (anything that ships).
- **Source:** `vDVSGVpB2vc` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Claude Code agent teams / tmux swarm / bypass-permissions for all
- Quote three critical / one-shot site / 2–5 agents / N× cost as FACT
- Nate Neuroflow / Skool as a hive SKU
- New hunt ICP. Clients parked. No Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not spawn Neuroflow.

- **Done** on a parallel slice: named file owners + a checker who can fail + save confirmed. Chat between workers is not done.
- **Delegate without being asked:** Watchdog/Forge already are maker-checker. I do not add a QA persona because three pixels looked polished. Day Planner does not get a 10-agent swarm.
- **Skeptical review:** “Most powerful feature I’ve ever used” is the cold open. Experimental + disabled-by-default is the fine print.
- **One system this take:** a lead + a separate checker that can reject. Not a three-persona landing-page team. Not tmux theater.
- Live hunt stays parked. I do not rotate the workforce to Claude teams.
