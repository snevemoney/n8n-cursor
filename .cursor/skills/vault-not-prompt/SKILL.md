---
name: vault-not-prompt
description: >-
  Keys live in env or vault only. Never in system prompts, chat, or
  root nano. Use when an agent touches credentials, a host needs
  secrets, or someone pastes a key. 2FA stays human. Cursor plus Grok Bot.
---

# Vault, not prompt (Cursor)

Load `scripts/hive/grok-skills/vault-not-prompt.md` and follow it.

**Card:** `SECRET` named not pasted · `PLACE: env|vault` · `IN-PROMPT: no` · `2FA: human`.  
**Wired job:** HITL Tier-3 secrets + Forge deploy notes + cookbook “no secrets in chat.”  
**Remote:** `.env` gitignored does not travel unless you re-inject and say so.

Hard step: send / pay / deploy / book / publish stay Evens. Pasting a key is a fail.

Grok `/` copy: `~/.grokbot/skills/vault-not-prompt/SKILL.md`.
