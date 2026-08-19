---
name: mcp-on-private-demo
description: >-
  Live demo may call connectors per viewer. Public share = no
  connectors. Use when Forge/GTM ship a private demo that reads
  Gmail/Calendar/GitHub. Cursor plus Grok Bot. Status WIRED.
---

# MCP on private demo

**Owner:** Forge · Product GTM. **Stack:** Cursor + Grok Bot. Our connectors, not Claude artifacts.  
**Cursor copy:** `.cursor/skills/mcp-on-private-demo/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/mcp-on-private-demo/SKILL.md`  
**Status:** WIRED 2026-08-14. Not accepted forever.

**Source:** `x:2077489907350856038` @ClaudeDevs — artifacts can call MCP (fetch + act per viewer). **Not available on publicly-shared artifacts.** Tweet is the complete condition.

**Dissent:** Vendor is Claude Code artifacts (on-tape). We steal the **condition** (private demo yes / public share no), not the Claude product. Do not install Claude Code.

## When

A live demo should read a real inbox/calendar/repo **for the viewer**. After `slice-build` / Path C demo.

## Card

```
SURFACE: private preview (auth or unlisted)
CONNECTORS: only what inventory already allows
PUBLIC SHARE: connectors off
HARD STEP: send / pay / write-back stay Evens
```

## Steps

1. Name the demo URL. If it is a public share, **do not** attach connectors.
2. Allow-list connectors from `AGENT_TOOL_INVENTORY.json` (`assume-it-will-touch`). Keys in vault (`vault-not-prompt`).
3. Fetch/display only. Any send / calendar write / GitHub merge = HITL.
4. `click-live-site` + `verify-after-browser` on the private URL.

## Stop

Public publish of a connector-live demo = Evens. Send/pay/deploy = Evens.

## Never

Public-share + live MCP · Claude artifacts product · instance-wide execute MCP · send / pay / deploy / book / publish
