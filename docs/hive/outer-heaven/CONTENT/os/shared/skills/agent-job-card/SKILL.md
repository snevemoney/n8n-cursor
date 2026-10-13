---
name: Agent job card
description: >-
  Use when defining or refreshing what a hive agent owns and never does — short
  owns/never card that agents actually read each session.
merged_from: [interview-to-desk]
---
# Agent job card

Sources: Simon Scrapes `yt:icM0ewXGvAw`; X bookmark LLM Wiki theme; Outer Heaven cheat sheet mandate; Simon Agentic OS folders `yt:w0S-khYCaB4`.

## When
Onboarding a desk, after agent-job-card, or when an agent keeps guessing its job.

## Do
1. One page (or cheat-sheet row) per agent: **you own X · you never do Y · wakes · done-when · handoff**.
2. Agents must **read** the card before work (Outer Heaven brief / job-cards).
3. Update the card when doctrine changes; Librarian promotes don’ts for all 17.
4. Keep it short enough to load every session — not an 8k-node graph.

## Don’t
- Nameless “40 marketing agents” talk-track with UNVERIFIED $
- Let agents invent scope mid-task
- Duplicate cards in three places without a single SoT

## Tools
| Need | Path |
|---|---|
| Cards / OH brief | Outer Heaven + workflows — **PROVE** |
| Issue link | GitHub MCP — **PROVE** |
| Nameless multi-agent swarm product | **BLOCKED**/NO |

## Prompts
**Job card**
```
Agent/desk:
You own:
You never:
Wakes:
Done-when:
Handoff:
Issue URL (optional):
```

## Steal thicken — Simon 19 mistakes (`yt:icM0ewXGvAw`) FACT
1. Card triad: **where to look · done-when · verify against** (not persona fluff).
2. Phrase **owns** positively; put hard stops in **you never** as short bullets — avoid conflicting “do not X” inside the same ask that requires X’s opposite.
3. Keep card **short enough to load every session** (~job-card rows, not novels). Long cards = lost rules.
4. When spawning CloudAgent/sub: **paste critical never/owns into the spawn prompt** — do not assume inheritance.

**Prompt — short card refresh**
```
Agent:
Where to look:
You own (positive):
You never (≤5 bullets):
Done-when + verify:
Spawn-paste constraints:
```

## Wave-M repass 2026-09-09 (`yt:w0S-khYCaB4`)
File-based A–E PARTIAL: `/workspace/research/youtube-daily/repass-20260909/w0S-khYCaB4/`. Nine-piece map → hive layers; Agenty Academy still **BLOCKED**.

## Wave AA enrich 2026-09-09 — multi-agent job cards (`yt:-1K_ZWDKpU0`)
- Job card = Lead + named specialists + shared checklist + explicit non-parallel deps. Refuse "parallelize everything." Reliability needs terminal/role specificity. Claude face **BLOCKED**.

---

## Merged from `interview-to-desk` (2026-10-11)

- Original description: Use when turning a vague goal or new lane into a named desk — interview until shared understanding, write owns/never, one chief, one-job specialists.
- Unique content carried: interview-until-shared-understanding steps

# Interview to desk

**Sources:** Nate Grok week grill-me `yt:TMPUUyQC5aM`; four Claude projects interview-me `yt:IiZ5HRaeX4s`; Berman chief `yt:5CSXUsljJ_E`.

## When
New desk, new lane job, or operator dumps a vague goal that needs a named owner.

## Do
1. Interview until shared understanding (questions until sure). Do not build mid-confusion.
2. Write a job card: owns / never / wake / done-when / handoff.
3. One pinned chief; specialists are one-job. Delegate-first.
4. Shared wiki vs private desk notes — put durable rules in wiki ([wiki-ingest](sand-workflow:wiki-ingest)).
5. Routine instruction names the **skill** + the **delegate**, not a frozen tool recipe.
6. Log owner / status / link when the desk ships something.
7. After grill-me, ask chief to propose valuable specialists — not a second chief.

## Don’t
- Second chief / hundred-agent swarm
- Composio / ClickUp / GoHighLevel as required stack
- School auto-like, paste secrets, new voice-provider ICP
- Mint agent #18+

## Tools
| Need | Path |
|---|---|
| Job card | agent-job-card — **PROVE** |
| Wiki | wiki-ingest — **PROVE** |
| Claude Projects “interview-me” UI | **BLOCKED** — this skill in Grok/Cursor **WORKAROUND** |

## Prompts
**Interview-me**
```
Goal:
Ask until shared understanding (no build mid-confusion):
Owns / never:
Wake / done-when / handoff:
Chief desk:
Specialists (one-job):
```

## Wired 2026-10-13 (overnight)
- Size every card before dispatch: `ticket-size CARD.md` (counts the card + each `- file: <path>` line at ~4 chars/token). Over 150k tokens → `SPLIT`: cut it into vertical slices (osmani-incremental-slice) so each fits one fresh session. Missed method #8.
