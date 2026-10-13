---
name: MCP connector demo
description: >-
  Use when shipping proof that an agent or page reads a real connector — live read, HITL for sends, no mocked data.
---

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
