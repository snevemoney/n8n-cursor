---
name: Approval-based autopilot (Demkinn #54)
description: >-
  Use when: Routine ready to schedule
---
# Approval-based autopilot (Demkinn #54)

**Owner desk:** HITL Operator  
**Lane:** hive-os  
**Sources:** demkinn skills/54

## When
Routine ready to schedule

## Do
1. Propose schedule
2. Owner approves
3. Dangerous steps stay HITL

## Don't
- Unattended Tier 3

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Tools
| Need | Path |
|---|---|
| Routines | paused until confirm — **PROVE** |

## Prompts
**Autopilot gate**
```
Job:
Propose → owner confirms → execute. No unmuted standing sends.
```

## EXTRACT-BATCH-1 2026-09-01 — Ali Miller workforce (`yt:EzQAgnjTq2k`) FULL

**When:** a routine is ready to schedule, or someone wants agents to “just do smart things.”
**Anti-triggers:** no 34-agent swarm; no unattended send; no new desks; Claude Tag/Slack Loop not required.

FACT from `transcripts/EzQAgnjTq2k/full.txt`:
- “Managing agents” is the wrong frame → set **infrastructure + goals**, wait for **escalations**, keep the same risk tier (still check emails).
- “Do smart things” only works with written goals + tool access + a sense of trigger. Width expands; send/pay does not.
- Two proactive kinds: **defined** (drop recording in folder → transcript + draft socials) vs **undefined** (reason about what to take on). Hive: defined = paused routine; undefined = watchdog propose, not auto-execute.
- Best underused job: **AI as watchdog** (dup work, calendar conflicts, disagreement in meetings) — pair [bot-fleet-auditor](sand-workflow:bot-fleet-auditor).
- Goals review with the workforce. Treat the fleet as product lead, not only engineer.

**Autopilot gate (Ali remap)**
```
Job:
Defined trigger? (folder drop / cron / event) → propose routine, start PAUSED.
Undefined “do smart things”? → watchdog: propose in chat, owner confirms, then run skill.
Send/pay/delete still HITL. Width ≠ unmuted send.
Goals doc path:
Doorbell miss to exec group; ACTION_LOG.jsonl card.
No 100-agent theater. Named desks only.
```

### Tools
| Need | Path |
|---|---|
| Grok routines | paused until confirm — **PROVE** |
| Watchdog tally | bot-fleet-auditor — **PROVE** |
| ClickUp | ACTION_LOG.jsonl — **WORKAROUND** |
| Claude Tag / Loop-Alley Slack | **BLOCKED** would work if we had Slack MCP — exec-group doorbell **WORKAROUND** |
| Unattended send | **BLOCKED** |

## Trust ladder: one-shot before routine (added 2026-10-11, packet `/workspace/research/packets/x-scarfpinkgirl-2107529989612581311` 0:36:45–0:38:45)
Autonomy is earned in four steps. Don't start at "go to bed and let it run".
1. **Watch and correct live.** Run the task with the human observing, and course-correct mid-run.
2. **Turn the session into a skill.** At the end, write the corrected procedure up as a reusable skill (steps, gates, done-when).
3. **One-shot on a fresh run.** Invoke the skill (`/skill-name`) in a fresh session with no extra coaching. It passes only if it completes correctly in one shot. If it doesn't, fix the skill and repeat step 3.
4. **Schedule it as a routine.** Only then attach a trigger or schedule (e.g. new receipt email → file expense report). Send, spend, and other irreversible gates still apply.
**Hard rule:** no routine gets created until step 3 has passed. Record the one-shot run (date, session/link, result) in the skill before scheduling.


## Wired 2026-10-13: safety tools + missed methods (Evens yes, Oct 13 1:14 AM ET)
Tools live in `/workspace/builds` (installed in `~/.local/bin` by `install.sh`, which runs every test first). Packet: `/workspace/research/packets/missed-methods-20261013/`.
**Go-live gate. No routine runs unattended until `routine-gate check <routine>` exits 0.**
1. `routine-gate register <routine> --builder <desk>`: refused when 2 routines are already in flight (WIP limit; see the proposal to Big Boss in the packet). `--force-wip` is logged.
2. `escalation-drill <routine> '<step cmd>'`: runs the loop with the retry cap at 1 and must write a HITL card. The drill proves the route to a human fires.
3. Run once live, then `routine-gate first-run <routine> --output <path>`.
4. A desk that is **not the builder** reads that output: `routine-gate read <routine> --reader <desk> --verdict ok|bad --note …`.
5. `routine-gate check <routine>` → OK = may be scheduled (still PAUSED until the owner confirms, per the steps above).
6. After each run: `routine-gate green|red <routine>`. Three greens in a row = *producing*, and only then does the WIP slot free up.
7. Real loop failures escalate through `escalate-hitl`. The 3rd strike in a row is marked TO-EVENS, and auto-retry stops.
