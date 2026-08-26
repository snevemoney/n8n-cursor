# Creative Studio — vDVSGVpB2vc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: Claude **agent teams** vs sub-agents. Beats: paste “create Neuroflow, three teammates, Sonnet” (front-end / back-end / QA); `team create`; shared task list; they message each other; QA finds **three critical issues**; main sends work back; second QA pass “resolved”; one-shot fictional-AI landing (copy, color, animations) — “not perfect… iterate”; teams disabled by default — env in `settings.local.json`; dump official docs → local `docs/` master guide; prompt pattern: **goal first** (teammates wake with no history) + “create a team of X using Y model” + named roles + who messages whom + final deliverables (running app, pass/fail report, decisions doc); dos: own files, named recipients, 3–5 teammates not 10+, full context; don’ts: vague deliverables, shared-file overwrite, assume they know who to talk to; research-team demo (researcher / strategist / critic) — main nags “message both”; clean **shutdown request** vs force-kill; VS Code extension hides thinking — **tmux** split panes + talk to one teammate; three rules: territory, direct DM, true parallel (1→2→3 is not a team); inherit main permissions / MCP / skills; **plan-approval** before execute; pitfalls: permission spam → pre-approve tools; overwrite → file owners; idle agent → assign work/deps; token burn → fewer agents; lost work → temp files; wrong approval → you approve first; when: multi-area + parallel + react + high quality; when not: sequential, one context window, same files, simple; 3 sessions ≈ 3× cost (UNVERIFIED). Skool not the close. Visual: Neuroflow spawn, colored tmux panes, QA bounce.

## B. Atomic Knowledge

### Teams talk; sub-agents report
- **Claim:** Sub-agents work alone and return to the lead. Teams share a list and DM each other, so QA can reject and bounce work without the lead rewriting every handoff.
- **Evidence:** “individual teammates can talk to each other… one of the teammates will basically say, ‘Hey, this isn’t good enough.’ and send the work back.”
- **Conditions:** Experimental flag on; more expensive and slower on tape.
- **Exceptions:** Sequential 1-2-3 with no talk = sub-agents, not a team.
- **Action:** Learn the bounce; do not install Claude Code.
- **Confidence:** SOURCE as demo feel.
- **Source:** `vDVSGVpB2vc` @ UNKNOWN
- **Epistemic:** SOURCE

### Wake with a goal, not a role name
- **Claim:** Teammates get no prior history — only the prompt the lead feeds. A goal + named recipients + checkable deliverables is the context.
- **Evidence:** “when the agents wake up, they have no context… only get the prompt that the main session feeds into them.”
- **Conditions:** Fresh spawn.
- **Exceptions:** They can still read the repo after wake.
- **Action:** Write the goal and “when done, message X” before you name models.
- **Confidence:** SOURCE.
- **Source:** `vDVSGVpB2vc` @ UNKNOWN
- **Epistemic:** SOURCE

### File territory or they overwrite
- **Claim:** Shared files = colliding edits. Each teammate owns files and a deliverable; they send copies, they do not co-edit the same path.
- **Evidence:** “if you don’t do this and agents are sharing files, they might overwrite each other’s work.”
- **Conditions:** Parallel writers.
- **Exceptions:** Read-only shared inventory is fine if one owner writes the final.
- **Action:** Name owners in the prompt; treat overwrite as a failed plate.
- **Confidence:** SOURCE.
- **Source:** `vDVSGVpB2vc` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
QA is a teammate, not a rubber stamp. 3–5 is a team; 10+ is a swarm tax. Clean shutdown is a close; force-kill is a mess. Extension view ≠ tmux view. Bypass on the lead = bypass on the swarm.

## D. Procedures
(Learn.) Enable flag locally → dump vendor docs to markdown → prompt: goal + N + model + roles + DM graph + deliverables → spawn → watch QA bounce → main asks “did you message both?” → save + shutdown request → iterate the landing, do not ship the one-shot.
Avoid: Claude Code / tmux-as-stack; 99% / 3× as FACT; 10+ swarm; bypass-all inherited; Skool.

## E. Examples
**Situation:** Neuroflow landing.  
**Action:** QA finds three criticals; lead sends back; second pass “resolved.”  
**Lesson:** The still is lonely-pixel → three connected pixels, not “99%.”

**Situation:** Research team.  
**Action:** Lead: “Did you send your structured inventory to both…?”  
**Lesson:** Named recipients must be checked, not assumed.

## F. Decision Rules
- If the work is sequential and silent → sub-agent, not a team.
- If two writers share a file → stop; assign territory.
- If you cannot see them go wrong → you cannot shut the bad path early.
- If $ / 3× / 99% from this tape → UNVERIFIED.

## G. Contrarian
The “most powerful feature” still needs a human to iterate the one-shot site. Teams are sold as unfair; the tape says slower, costlier, experimental, and easy to overwrite.

## H. Assumptions
3× cost, 3 criticals, one-shot polish UNVERIFIED. On-tape Claude / VS Code / tmux. Clients parked.

## I. Questions
What were the three criticals? Visual of the unfair thumb (lonely orange → three pixels)? Did shutdown ever refuse?

## J. Connections
- SYSTEM SYNTHESIS → `EuzYhzB0vbI` (checkable done + bounce).
- SYSTEM SYNTHESIS → `e18sdZLwP7o` (sub-agents vs teams).
- SYSTEM SYNTHESIS → `cinematic-recipe` (lonely-vs-team still).

## K. Future-Use
QA-bounce + file-territory as the team stamp. Unassigned.

## Steal / Operate-never

### Machine: goal + territory + named bounce
- **Epistemic:** SOURCE
- **Workflow / loop:** write the goal the swarm wakes into → 3–5 named roles, each owns files → name who DMs whom and the checkable close → watch QA reject → clean shutdown, then human iterate
- **Questions / signals:** Did they message both? Same file twice? Sequential fake-team?
- **Qualify / frame / objections:** Quality is the bounce, not the headcount
- **Procedure:** Docs-in-repo before spawn; plan-approval before execute
- **Example that proves it:** Three criticals returned; second pass “resolved”; landing still “not perfect”
- **Why it works:** No history at wake; talk is the unlock; overwrite is the failure
- **Conditions / exceptions:** Experimental; $ UNVERIFIED
- **Operate-never payload:** Claude Code install; 99% / 3× as FACT; 10+ swarm; inherit bypass
- **Hive run:** `cinematic-recipe`; `golden-test-loop`; `ask-principal`
- **Source:** `vDVSGVpB2vc` @ UNKNOWN

### Operate-never
- Install Claude Code / Codex / ChatGPT / Gemini. Join Skool.
- Quote 99% / 3× as FACT. Auto-ship the one-shot landing. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: **lonely pixel → three connected pixels** is the plate; title does the 99% boast — we do not. QA bounce is the motion, not Neuroflow. One-shot landing is a draft, not a publish. HITL. Clients parked.
