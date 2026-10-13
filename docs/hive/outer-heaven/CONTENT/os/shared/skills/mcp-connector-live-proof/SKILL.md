---
name: MCP connector live proof page
description: >-
  Use when refreshing an MCP demo or proving a connector is actually live. Do
  not use to install new vendors or to treat needsAuth/paywall as green.
  Anti-trigger: chat-only status lists with no proof action.
merged_from: [mcp-connector-demo]
---
# MCP connector live proof page

**Owner desk:** Forge
**Lane:** ai-partner-websites
**Sources:** mcp-connector-live-proof/DEMO_BRIEF.md, x-bookmarks Claude artifacts MCP

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

---

## Merged from `mcp-connector-demo` (2026-10-11)

- Original description: Use when shipping proof that an agent or page reads a real connector — live read, HITL for sends, no mocked data.
- Unique content carried: demo shipping checklist (live read, HITL sends)
- Original support files moved to `merged/mcp-connector-demo/` (mini_mcp_stdio.py, test_mini_mcp.py); relative paths in this section resolve there.

# MCP connector demo

Sources: X bookmarks Claude artifacts+MCP; implement-queue MCP P0.

## When
Need proof the site or agent can read a real connector (Gmail, Calendar, GitHub).

## Do
1. One live path that reads an authorized connector.
2. Approve/deny for consequential actions (HITL).
3. Prefer existing Grok plugins over a new OAuth stack.
4. Watchdog clicks the live demo.

## Don't
- Paste secrets into the page
- Auto-send from the demo
- Rebuild Claude desktop just to have MCP

## Enrich — yt:rW3eyvrSqio (Zubair Astra + Zapier MCP · 2026-09-21)
**Pattern:** One MCP bridge once → NL-describe automation → agent builds/runs via connected tools.
**Hive remap:** Codex+GPT-6 Astra+Zapier MCP → Grok+Cursor + owned `user-Gmail` / Drive / Slack. Zapier MCP / Astra / Codex as hive face = **BLOCKED**.
**Proof:** `/workspace/research/youtube-daily/l2-20260921/rW3eyvrSqio/recreation/astra_rebuild_owned.py` (fixture sheet + alerts). Live Gmail→Sheets write **BLOCKED** until Tier-3; alerts **HITL**.
**Don't:** mint-per-URL skill; quote Astra logic claims as FACT; Skool/Zapier rent face.

## Enrich — yt:yjBHheCB6Ek (Derek Cheung n8n vision TA · 2026-09-21)
**Pattern:** External image/tool connector → agent renders result as markdown image URL → structured signal (not raw chat dump).
**Hive remap:** chart-img.com → fixture chart features + local vision stub; prove `![alt](url)` render rule in ledger. Live chart-img key **BLOCKED** (opsec ASK). Broker **NO-SKILL**.
**Proof:** `/workspace/research/youtube-daily/l2-20260921/yjBHheCB6Ek/recreation/vision_signal_action.py` (`meets_proof=true`).
**Don't:** mint-per-URL; ship crypto TA bot; auto-order from vision signal.

## Enrichment pointer — 2026-09-21 yt:57EkKWCsu_4
Pattern `enrich-a-record-from-MCP-tools` (≠ route-gate). Proof: `/workspace/research/youtube-daily/l2-20260921/57EkKWCsu_4/recreation/proof-run.json`.

## Enrich 2026-10-10: wrap occasional software as a stdio MCP (`yt:KQJLw6YNA4I` Syntax 34:51)
FACT: Syntax said MCP servers pay off most for software you open only a few times a year (their example: a DaVinci Resolve MCP). Typing what you want beats relearning the UI.
Steps (PROVE on box):
1. Pick the CLI or API behind the rarely used app. Expose 1–3 verbs as tools with JSON-Schema inputs.
2. Server = newline-delimited JSON-RPC over stdio. Answer `initialize`, `tools/list`, `tools/call`. Ignore notifications (no id).
3. Keep it read-only, or write only to a scratch dir. Any destructive verb stays HITL.
4. Test with a scripted client before wiring it into any agent: `python3 test_mini_mcp.py` → `mini MCP 5/5 PASS`.
Files: `mini_mcp_stdio.py` (ffprobe/ffmpeg example) and `test_mini_mcp.py` in this folder.
Also from the same tape: scope an assistant's calendar access to one calendar (least privilege) before you let it manage a family inbox.
