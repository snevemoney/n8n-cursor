---
name: sanitize-in-check-out
description: >-
  No-AI sanitize before the model; check after. Pass ≠ send. Use when
  text goes into a model or out to a human/DB, inbox-to-task-routing,
  or a draft leaves Comms/HITL. Cursor plus Grok Bot.
---

# Sanitize in / check out

**Stack:** Cursor + Grok Bot. Two nodes. Pass is not send-OK.

**Upgrade:** `UPG-nate82-sanitize-in-check-out`  
**Sources:** `oWdJMJp2HgM` · `NQhsLVmuItA` (timestamps UNKNOWN, caption-only)  
**Cursor copy:** `.cursor/skills/sanitize-in-check-out/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/sanitize-in-check-out/SKILL.md`  
**CLI:** `python3 scripts/hive/sanitize-check.py --text "..." --direction in|out`  
**Fixture:** `python3 scripts/hive/sanitize-check.py --fixture`

**Contradiction (keep labeled):** Stock secret-keys missed a password line and caught a key-shaped string. That miss is a required test. Do not buy the Guardrail node. Do not treat pass as send.

## When

Inbox → model → draft. Any path that sends text into a model or out to a human/DB. Wired job = `inbox-to-task-routing` + Comms/HITL drafts.

## Card (required around the model)

```
IN: redact (no AI) → model
OUT: check → fail halt | pass
PASS-NEQ-SEND: true
```

## Steps

1. Inbound: `sanitize-check.py --direction in`. Redact keys **and** password lines. Fail → halt. Do not prompt the model with the original secret.
2. Model runs on the redacted text only.
3. Outbound: `sanitize-check.py --direction out`. Hits → halt. Pass → still HITL (`send-removed`).
4. Fixture must include `bad-password-line`. Secret-keys ≠ password.
5. Original may still sit beside the placeholder on disk — do not ship it.

## Inbox job (the wired instance)

Before classify/draft in `inbox-to-task-routing`:

```
python3 scripts/hive/sanitize-check.py --text "<snippet>" --direction in
```

After a draft:

```
python3 scripts/hive/sanitize-check.py --text "<draft>" --direction out
```

`verdict=pass` + `next=HITL`. Never send.

## Stop

Send / pay / deploy / book / publish = operator. This skill never sends.

## Never

Pass as send-OK · skip the password fixture · Guardrail node as hive SSOT · password CSV · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
