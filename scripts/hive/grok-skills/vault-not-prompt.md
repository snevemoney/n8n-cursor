---
name: vault-not-prompt
description: >-
  Keys live in env or vault only. Never in system prompts, chat, or
  root nano. Use when an agent touches credentials, a host needs
  secrets, or someone pastes a key. 2FA stays human. Cursor plus Grok Bot.
---

# Vault, not prompt

**Stack:** Cursor + Grok Bot. `.env` gitignored means the remote box cannot see it unless you re-inject and *say so*.

**Upgrade:** `UPG-nate82-vault-not-prompt`  
**Sources:** `27Y44JYXZJ8` · `ehg4fhydTgs` · `gb5TlGw6Uks` · `CB5bG4mvnS0` · `tDGiWn0flK8` (timestamps UNKNOWN, caption-only)  
**Cursor copy:** `.cursor/skills/vault-not-prompt/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/vault-not-prompt/SKILL.md`

**Contradiction (keep labeled):** Two places or it is not there. Saved login = keys. Do not flatten “the box has .env” with “the remote can read it.”

## When

Any credential, API key, Twilio/ElevenLabs, Stripe, host env, or 2FA. HITL secrets lane. Forge deploy notes.

## Card (required if a key is in play)

```
SECRET: named, not pasted
PLACE: env | vault
IN-PROMPT: no
2FA: human
```

## Steps

1. Forbid keys in prompts, chat, job cards, and `state.json`.
2. Env or vault only. If the remote host needs it, re-inject and say so — do not assume `.env` traveled.
3. 2FA / admin / password CSV stay human. No computer-use on those surfaces.
4. Key-create is a spend event (`token-receipt` / Personal CFO). Do not mint keys to “just try.”
5. Pair inbound leaks with `sanitize-in-check-out`.

## HITL / Forge job (the wired instance)

Cookbook + HITL Tier-3 secrets: ACTION names the secret, never the value. Shell note already: no secrets in chat. This skill is the lock.

## Stop

Send / pay / deploy / book / publish = operator. Pasting a key is a fail, not a draft.

## Never

Keys in prompts/chat/git · password CSV · Hermes/Hostinger as vault · 2FA computer-use · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
