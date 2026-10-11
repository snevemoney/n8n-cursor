---
name: MCP connector live proof page
description: >-
  Use when refreshing an MCP demo or proving a connector is actually live. Do
  not use to install new vendors or to treat needsAuth/paywall as green.
  Anti-trigger: chat-only status lists with no proof action.
---
# MCP connector live proof page

**Owner desk:** Forge
**Lane:** ai-partner-websites
**Sources:** mcp-connector-demo/DEMO_BRIEF.md, x-bookmarks Claude artifacts MCP

## When
Refresh or extend MCP demo. After any "we have MCP for X" claim.

## Do
1. Live connector fields via GetMcpServerStatus
2. One proof action per connected tool (read-only)
3. Honest empty/error — paywall and needsAuth are not green
4. No secrets in repo
5. Researcher validates refresh

## Don't
- Fake seed sold as live
- Client email send
- Mark `connected` as PROVE when the first tool call returns paywall / auth

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Tools
| Need | Path |
|---|---|
| Connected MCPs | GetMcpServerStatus — **PROVE** (handshake only) |
| needsAuth | list BLOCKED with would-work-if |
| Paywalled connected | handshake PROVE + search/action BLOCKED |

## Prompts
**Live proof page**
```
List connectors: connected · needsAuth · always-on
One proof action per connected tool. No fake green.
Paywall text is BLOCKED, not PROVE.
```

## Remotion hosted MCP (2026-08-26)
**FACT.** Hosted Remotion MCP shuts down no earlier than 2026-08-31. Do not add it as a new hive connector. Path: `npx remotion skills add` / `npx skills add remotion-dev/skills` in the Remotion repo. Studio WebMCP is Codex-only today.
https://www.remotion.dev/docs/ai/mcp · https://www.remotion.dev/docs/ai/skills

## MCP was wrong (WL #90 `f4mI3d-nTrI`)
Title only. Hive path stays official connectors + remotion skills, not hosted Remotion MCP after 2026-08-31.

## WL26-100 L2 2026-08-26 — MCP stateless reset (PROVE tape)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2.md`
Title-only stub superseded. Spec IDs = FACT-from-tape; official spec not fetched this pass.

### MCP was wrong (`yt:f4mI3d-nTrI`) FACT watch+ASR
- Old initialize + session ID pins the client to one instance → `400 session not found` behind a load balancer / dead pod. Sticky sessions / Redis were the costly workaround.
- Spec date on tape **20260728**. SCP 2575 drops handshake; SCP 2567 drops session header. Each request independent. Round-robin; scale-to-zero. Headers **MCP-Method** / **MCP-Name**; TTL + cache-scope on lists. Capabilities ride in request **meta**; optional **server discover**.
- State = tool-minted handle (basket id) as a later argument — not a protocol session.
- Follow-up = **input required** + serialized request state; client reissues (any instance can resume). No surprise push on an open stream.
- Long work: **tasks** official (`tasks/get`, `subscription/listen`). 12-month deprecation floor. SDK v2 / TS split — not a one-line bump.

**Live proof add**
```
Connector is session-pinned? If yes, mark honest risk (400 on rotate) — do not fake green.
App state handle (if needed):
Long job: return task id, do not hold the chat open.
Hosted Remotion MCP: still do not add (sunset ≥ 2026-08-31).
```

## Mobbin 2026-09-03 (signals close) FACT live call

- Plugin `52632771` installed (user). Namespace `user-Mobbin` **connected**, 3 tools (`search_flows`, `search_screens`, `search_sections`).
- Proof action: `search_screens` query "login screen with email and password fields" platform=web mode=standard limit=1.
- Result: **Mobbin MCP requires a paid plan. Upgrade at https://mobbin.com/pricing to continue.**
- Classification: handshake **PROVE**; search **BLOCKED** — **it would work if we had a paid Mobbin plan**. Screenshots + Shadcn remain the WORKAROUND (`figma-to-shadcn-loop`). Do not buy from this desk (Tier 3).
- Tape `yt:B5qFifAe7u0` stays title-only; do not L2 it to rediscover this wall.

## Wave Y 2026-09-09 Tim remap
- `_C57BxSXRbU` tool-stack category remap · `kt5a-TXmWew` Claude-Code-features→Cursor/Grok remap
- Packets under `repass-20260909/_C57BxSXRbU/` and `…/kt5a-TXmWew/` — Claude daily OS **BLOCKED**

## Wave AA enrich 2026-09-09 — Explorium firmographic (`yt:57EkKWCsu_4`)
- Live-proof pattern: SSE MCP (`mcp.explorium.ai/sse` class) + n8n MCP Client + agent + output parser + sheet loop. Treat Explorium as slot, not lock-in. Live key **BLOCKED** pending opsec. Packet `repass-20260909/57EkKWCsu_4/` · `recreation/MCP_FIRMOGRAPHIC_ENRICH_GATE.md`.
