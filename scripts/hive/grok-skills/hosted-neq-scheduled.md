---
name: hosted-neq-scheduled
description: >-
  Cloud sandbox ≠ always-on. Classify the wake primitive (event /
  cadence / human-run) before approving 24/7 or a new host. Use when
  someone proposes overnight, laptop-off, managed agents, or cron.
  Cursor plus Grok Bot.
---

# Hosted ≠ scheduled

**Stack:** Cursor + Grok Bot. Default = no new host.

**Upgrade:** `UPG-nate82-hosted-neq-scheduled`  
**Sources:** `27Y44JYXZJ8` · `ehg4fhydTgs` · `hN58VkYLie4` · `UGIZnh6HNLc` (timestamps UNKNOWN, caption-only)  
**Cursor copy:** `.cursor/skills/hosted-neq-scheduled/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/hosted-neq-scheduled/SKILL.md`  
**Merged 2026-08-14:** `eecUhBpTz_g` 30-min cron factory = **scheduled**, not a new 24/7 host. `lRUpu2-KtGQ` event trigger (invoice mail / Slack) vs daily schedule — classify WAKE before adding either. Default no new host.

**Contradiction (keep labeled):** Routines have schedule; managed agents as taped do not. Do not merge into “cloud = 24/7.” Overnight-as-experiment vs unsupervised `/goal` warn.

## When

Any “24/7”, laptop-off, managed-agent, routine, cron, or `/loop` proposal. Big Boss intake. Day Planner cadence. Coverage-loop interval.

## Card (required before always-on)

```
WAKE: event | cadence | human-run
HOST: local | none
SCHEDULE: no | named-interval-by-Evens
RUN-NOW: yes | no
```

Default: `HOST=none` · `SCHEDULE=no` · `WAKE=human-run`. Local file/cookie jobs stay local.

## Steps

1. Classify wake **before** approving always-on. Cannot name WAKE → refuse the host.
2. Run-now before schedule. A job that never ran once does not get cron.
3. `/loop` only if Evens names the interval (`checkable-stop`).
4. Refuse Anthropic routines / managed agents / Trigger.dev / Hermes / Hostinger as stack.
5. 24/7 in this hive means learn + dry-run + score, not auto-money.

## Coverage-loop / Day Planner (the wired instance)

```
WAKE: human-run
HOST: none
SCHEDULE: no (unless Evens names /loop)
RUN-NOW: this session
```

Big Boss asks this card on any new-host or overnight ask.

## Stop

Send / pay / deploy / book / publish = operator. New host is a hard ask.

## Never

Cloud = 24/7 · unsupervised `/goal` · Trigger.dev / managed agents / Anthropic routines as ours · laptop-cookie jobs on a remote box · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
