---
name: vault-receive
description: >-
  After a sitting, emit a typed note into the Obsidian vault so
  the command center can read it. Use when Obsidian did not
  receive Cursor/agent output, or the OS has no data.
---

# Vault receive (Cursor)

Load `scripts/hive/grok-skills/vault-receive.md` and follow it.

**CLI:** `python3 scripts/hive/os/emit-vault-receive.py --desk <desk> --skill <skill> --kind report --item "…"`  
**Vault:** `HIVE_OBSIDIAN_VAULT/00_Outer_Heaven/CONTENT/os/`  
**Mac closed:** SSH `n8ncloud` `root@69.62.66.78:/root/outer-heaven-mirror`. Resolve: `vault-config.py --resolve`. One write target.  
**Parents:** `internal-host-os` (leave a note) · `wiki-ingest` (pages) · `side-effect-not-essay` (emit is the side effect).

Capture stays `~/.grokbot/outer-heaven/`. This skill is the vault landing. Do not rebuild the graph.

Grok `/` copy: `~/.grokbot/skills/vault-receive/SKILL.md`.
