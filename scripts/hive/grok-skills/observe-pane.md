---
name: observe-pane
description: >-
  One pane of named jobs — working / yellow-needs-input / done.
  Yellow = ask-principal. Operator is a manager, not a tab-hunter.
  Use when spawning desks or a job goes idle. Cursor plus Grok Bot.
---

# Observe pane

**Stack:** Cursor + Grok Bot. Glance idle, approve, or stop. Do not install Pixel Agents / Claude dashboard.

**Upgrade:** `UPG-nate82-observe-pane`  
**Sources:** `ZAaxx3qyT8g` · `xsAOpqjebOo` · `62Rfe1w9NBc` (timestamps UNKNOWN, caption-only)  
**Cursor copy:** `.cursor/skills/observe-pane/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/observe-pane/SKILL.md`  
**Store:** `docs/hive/outer-heaven/.hive/state.json` `jobs[]`  
**CLI:** `python3 scripts/hive/hive-state.py set-job|get --key jobs`

**Contradiction (keep labeled):** Activity-log skin ≠ seeing the work. Visible pane ≠ yes (`glance-neq-approve`). Hosted ≠ always-on.

## When

`hive-spawn-desks`, coverage-loop, any parallel or long run. Big Boss glance. Watchdog idle.

## Card (one row per named job)

```
ID: <job id>
STATUS: working | yellow | done
YELLOW: ask-principal (Evens)
```

Yellow is needs-input. Silence is not yes.

## Steps

1. Parent writes the job row when work starts (`set-job --status working`).
2. Needs Evens → `--status yellow` and load `ask-principal`. Do not proceed.
3. Done → `--status done` + `state-json` log-run. Open the artifact (`side-effect-not-essay`).
4. Glance the pane (`get --key jobs`). Do not hunt 17 tabs.
5. Kill / approve / deploy stay Evens. A green row is not a hard-step close.

## Spawn job (the wired instance)

`hive-spawn-desks` after `--write`:

```
python3 scripts/hive/hive-state.py set-job --id tape-<video_id> --name tape-self-teach \
  --status working --desk parent --note "17 takes; caption-only"
```

Yellow if a desk blocks on Evens. Done when takes exist — not when mail is sent.

## Stop

Send / pay / deploy / book / publish = operator. Pane ≠ approve.

## X-bookmark merge (2026-08-14)

@BusyFocusApp bar widget (`x:2075611333668540502`) = approve/deny + usage on a glance. **Do not build a menu bar.** Keep yellow = `ask-principal`. Glance ≠ yes.

## Never

Pixel Agents / Claude dashboard · treat glance as yes · 24/7 host from a pane · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
