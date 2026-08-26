# Librarian — vDVSGVpB2vc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/vDVSGVpB2vc/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** How to Build Claude Agent Teams Better Than 99% of People
**Channel:** Nate Herk | AI Automation
**Kind:** video (~4250 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Demo: “Neuroflow” team of 3 Sonnet (FE/BE/QA). `team create`; shared task list; they talk. QA finds **3 critical** issues → send back → second pass → landing page for a fictional AI startup (copy, motion). “Most powerful feature” if used right.
2. Teams ≠ sub-agents: sub-agents return to main; teams have a lead, shared list, **peer DM**. Enable via experimental env in `settings.local.json` (docs; disabled by default). He has Code paste the JSON. Then: fetch teams docs → `docs/` master guide (MCP-doc habit).
3. Prompt pattern: goal first (teammates wake with **no history** — only the spawn prompt) → “create a team of N on model X” → role + produce + who to message. Example: fullstack REST+React, localhost, users/posts, QA report, decisions doc. Dos: own files; named recipients; **3–5** not 10+; full context; named outputs. Don’t: vague deliverables; assume they know who to talk to.
4. Live “research team” (researcher/strategist/critic) on the new project: spawn prompts shown; main nags researcher to message **both**; output = Agent Teams Patterns + **11 doc gaps**. Main then **shutdown** (“save your work”). Extension hides thinking; **tmux** split panes = watch + DM each color (Windows workaround; Code walked him through).
5. Three rules: territory (own files); direct DM (not always via main); parallel (if it is strictly 1→2→3, maybe not a team). Wake-up: inherit **permissions** (bypass = all bypass); share files/MCP/skills. Plan-approval mode: teammates plan, main (or you, or a reviewer teammate) approves before execute.
6. Pitfalls: permission stops → pre-approve tools; overwrite → file owners; idle agent → assign work/deps; token burn → fewer agents; lost work → temp files; bad approvals → you approve first.
7. When: multi-area, parallel, react-to-each-other, high-quality loops. Not: sequential, one window, same files, simple. Cost ≈ N sessions. Shut down cleanly (teammate can refuse if not done) vs force-kill.
Gap: tmux setup, Neuroflow site. Timestamp UNKNOWN. Claude on-tape. “99%” is title.

## B. Atomic Knowledge

### Teams are peer-talk + shared list; they inherit your bypass
- **Claim:** Use a team when specialists must talk and loop (QA bounce). Spawn with a goal because they have no history. 3–5 max. File owners. Confirm shutdown. Bypass on main = bypass on all.
- **Reasoning:** Sequential 1-2-3 does not need a team (sub-agents cheaper). 10+ is 10× $.
- **Mechanism:** experimental flag → goal+roles+named DMs → plan-approve → parallel → clean shutdown.
- **Evidence:** QA 3-critical loop; 11-gap doc; tmux colors; shutdown request.
- **Conditions:** Experimental. Token × N UNVERIFIED as exact.
- **Exceptions:** If you need one conversation history, do not team.
- **Action:** File peer-talk vs sub-agent + inherit-bypass. Do not install Claude teams as hive. Bypass-all is a send-adjacent door.
- **Confidence:** high as a when-to-team machine
- **Source:** `vDVSGVpB2vc` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** first QA fail then pass
- **Speech ≠ behavior:** “one-shot website” vs iterate-after; “99%” unmeasured

## C. Mental Models
No history at wake. Territory or overwrite. Parallel+talk or don’t team. Shutdown is a save, not a kill.

## D. Procedures
1. Ask: must they talk, or only return to me?
2. Enable the flag; paste official docs into `docs/`.
3. Goal + N + model + named recipients + file owners + final artifacts.
4. Stay 3–5; plan-approve; pre-approve tools if they stall.
5. Watch in tmux if you need to steer; shutdown only after they confirm saved.
Avoid: Claude as hive; 10-agent swarms; bypass-all as default; title-99% as FACT.

## E. Examples
**QA bounce:** Situation — FE/BE ship. Action — QA finds 3 critical, main sends back. Outcome — pass + landing page. Lesson — the loop is the product.

**Shutdown:** Situation — research team done. Action — main asks each to save. Outcome — they can refuse if not done. Lesson — clean stop.

## F. Decision Rules
- IF the path is strictly sequential → sub-agents.
- IF main is on bypass → assume every teammate is.
- IF an agent is idle → the prompt missed a dependency.
- Refuse: Claude teams as hive; 99% as FACT.

## G. Contrarian
Against “more agents = better.” Against treating teams as a prettier sub-agent.

## H. Assumptions
Complements `jZgcWCzxh1I` (teams talk; workflows don’t). Caption-only.

## I. Questions
What were the 3 critical bugs? Did plan-approval cut tokens?

## J. Connections
SYSTEM SYNTHESIS → `jZgcWCzxh1I`; `e18sdZLwP7o`; `4OOS96i2gfI`.

## K. Future-Use
Peer-talk vs return-only + inherit-bypass + clean-shutdown as atoms.

## Steal / Operate-never

### Machine: team only when specialists must talk; spawn with goal; shut down clean
- **Epistemic:** SOURCE
- **Workflow / loop:** flag on → goal+roles+owners → plan-approve → QA bounce → confirm save → checkable stop = named artifacts + a teammate “I’m done,” not a force-kill
- **Questions / signals:** Talk or return? Same files? Sequential?
- **Qualify / frame / objections:** Expensive and slow; quality if used right.
- **Procedure:** D above.
- **Example that proves it:** Neuroflow QA loop; 11-gap doc.
- **Why it works:** Peer reject is a quality gate you cannot get from mute workers.
- **Conditions / exceptions:** Experimental; N× cost.
- **Operate-never payload:** Claude teams as hive; bypass-all; 99% as FACT.
- **Hive run:** Same when-to-team question in Cursor. Do not add Claude teams.
- **Source:** `vDVSGVpB2vc` @ UNKNOWN

### Operate-never
- Claude agent teams as hive. Bypass-all inherited. Quote 99% as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File teams-talk vs workflow-mute next to the dynamic-workflow ladder. Do not stand up a hive Neuroflow.
