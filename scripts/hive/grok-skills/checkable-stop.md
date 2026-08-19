---
name: checkable-stop
description: >-
  No loop ships without a written done-check, hard cap, and cost field.
  Metric = Y or a named stop. Until-satisfied is a weak stop. Use when
  looping agents, coverage-loop, /loop, until they can do them all, or
  a job has no written stop. Cursor plus Grok Bot.
---

# Checkable stop

**Stack:** Cursor + Grok Bot. A loop is trigger + action + stop. Architecture, not a vibe.

**Upgrade:** `UPG-nate82-checkable-stop`  
**Sources:** `EuzYhzB0vbI` · `ZAaxx3qyT8g` · `xsAOpqjebOo` · `62Rfe1w9NBc` (timestamps UNKNOWN, caption-only) · **merged `eecUhBpTz_g`** (priority: fix → review → next accepted → triage; mission.md may **reject**) · **merged `U6k4MeVks_Y`** (objective done-when; `/goal` unsupervised stays never)  
**Cursor copy:** `.cursor/skills/checkable-stop/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/checkable-stop/SKILL.md`

**Contradiction (keep labeled):** “Don’t prompt, write loops” vs “most tasks one terminal.” Overnight-as-experiment vs unsupervised-`/goal` warn. Do not flatten.

## When

Any looping job: `coverage-loop`, Cursor `/loop`, a spawn that can repeat, cadence/cron, “until they can do them all,” “until satisfied.”

## Card (required before the loop runs)

```
DONE-CHECK: <metric = Y or named stop>
CAP: <max iterations | max tapes | max minutes>
COST: <tokens / time / money — tape $ = UNVERIFIED>
STOP-KIND: metric | cap | idle | needs-input | open-twice
```

Write the card on the job. Silence is not a stop.

## Steps

1. Name trigger + action. If you cannot name the stop, do not start the loop.
2. Fill the card. Weak stops (`until satisfied`, `looks good`, `overnight default`) → rewrite or refuse.
3. Valid stops: metric = Y · hard cap · idle · needs-input · open-the-artifact-twice vs last-known-good.
4. Hit the stop → halt. Cap hit with metric unmet → halt and report. Do not raise the cap yourself.
5. Soft-done still needs Evens on send / pay / deploy / book / publish.

## Coverage-loop job (the wired instance)

One iteration = one tape **or** one BUSINESS-MODEL-FIT row.

```
DONE-CHECK: score fields written (`can_complete_task` · `blocking_missing` · `last_loop`) and this session wired ONE system or dry-ran
CAP: 1 tape or 1 model row this session
COST: this session only; do not arm Cursor `/loop` unless Evens names the interval
STOP-KIND: metric
```

Do not enter stage Loop without that card filled.

## Spawn / job-cards

`hive-spawn-desks` / `tape-self-teach` prompts must include the card. One tape · one desk file · no 17×N is the cap for a teach walk.

## Stop

Send / pay / deploy / book / publish = operator. This skill never closes a hard step. Overnight / 24/7 default is never.

## Never

Until-satisfied · looks-good · arm `/loop` without Evens naming the interval · unsupervised `/goal` · raise your own cap · flatten write-loops vs one-terminal · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
