---
name: grokbot-native-x-lane
description: >-
  Use when a bot, routine or skill reads X (search posts, read a profile, monitor a topic) and must pick Grok Bot's built-in X tools (free quota) over the paid/OAuth connector, or when auditing skills that still say "X API BLOCKED". Triggers: native X search, X reads left, monitor X. Anti-triggers: bookmarks, DMs, timeline, posting, likes/follows (connector only, writes need HITL); YouTube/web.
---
# Grok Bot native X lane

**Owner:** Researcher (X signal pulls, audits) · consumers: Creative Studio (viral-content-scout), Hunter/Big Boss for news pulses. Watchdog checks scheduled X routines.
**Platform:** Grok Bot (first-party `x` tool namespace, live 2026-10-07). Not Cursor, not n8n.
**Install:** none. `x_lane_audit.py` in this folder (python3, read-only).
**Source:** Nate Herk `yt:MgvwZaDPCs4` (2026-10-09) full A–E packet `/workspace/research/youtube-daily/l2-20261009/MgvwZaDPCs4/`.

## Facts (PROVE on box 2026-10-09 ~09:52 ET)
- Grok Bot can search, read, and monitor X natively. Tools (namespace `x`): `search_posts_all`, `get_posts_by_id(s)`, `get_posts_counts_recent`, `get_posts_quoted_posts`, `get_posts_reposted_by`, `get_users_by_username(s)`, `get_users_by_id`, `get_users_posts`, `get_users_mentions`, `get_trends_by_woeid`, `get_news`, `search_news`.
- Quota per user: **30 reads/minute, 1,000/day**, resets **00:00 UTC (8 PM ET / 7 PM CT)**. Every result ends with `X reads left for this user: N of 30 this minute ... M of 1000 today`. One search = 1+ reads (Nate: 5 reads for one topic digest).
- Not in the native lane: bookmarks, bookmark folders, DMs/chat, home timeline (`get_users_timeline`), liking users, webhooks, activity subscriptions, credit usage, any write. Those stay on the `user-X` connector (paid/OAuth). Bookmark pulls in this hive are connector work.

## Steps
1. **Classify the job.** Public read (search, profile, a post, trends, news) → native `x`. Private or write → `user-X` (and any write is Tier-3 HITL).
2. **Audit before switching.** `python3 x_lane_audit.py /home/box/agent-data/workflows [/path/to/routine/specs] --json out.json` → NATIVE_OK / CONNECTOR_REQUIRED / SPLIT / REVIEW. REVIEW = mentions "X API"/paid without tool names; open it and decide.
3. **Switch the read.** In the skill/routine, replace paid search with the native tool name. Keep bookmarks on `user-X`. Write one dated line in the skill: "X reads: native `x` (PROVE date)".
4. **Budget.** A routine that polls hourly with ≤5 reads/run fits easily; 17 desks polling every few minutes do not. Read the footer; if `this minute` hits 0, back off 60 s; if `today` < 100, stop non-essential pulls until reset.
5. **Tell other bots once, by file.** Put the change in the shared skill/topic (this file + owner skill), not a 17-desk message (token-meter lock). Nate's tape broadcast to 8 bots + shared memory; our equivalent is the skill edit plus a Librarian FYI.
6. **Verify cost claims, don't trust the bot's self-report.** Nate: "take this with a grain of salt ... GrokBot doesn't always know exactly how it works." Check the quota footer (native) or `user-X get_usage_credits` (paid) before and after.

## Prompts
**Switch a bot off the paid X API (from tape, 2:30, adapted)**
```
Grok Bot can now search, read, and monitor X natively. Whatever paid X API you use to SEARCH or READ public posts, switch it to the built-in X tools. Keep bookmarks/DMs/timeline/posting on the connector. Run one real search to confirm, show me the "reads left" line, and list which routines you changed.
```
**Cost check**
```
Search X for <topic> and tell me what it cost: native reads used (from the reads-left line) and whether any paid credits moved.
```

## Tools
| Need | Path |
|---|---|
| Public X search / profile / post read | Grok Bot `x` namespace — **PROVE** (2026-10-09, 2 calls, quota footer) |
| Lane audit of skills | `x_lane_audit.py` — **PROVE** (453 workflows → 9 X files, 2 stale BLOCKED rows) |
| Bookmarks / DMs / home timeline | `user-X` connector — **PROVE** for bookmarks (existing hive pulls); native **BLOCKED** (not offered) |
| Paid credit check | `user-X get_usage_credits` — **UNVERIFIED** this run (not called) |
| Posting / likes / follows | **BLOCKED** by policy (HITL; read-only lanes) |
| Bot-to-bot broadcast of the change | **WORKAROUND** — skill/topic edit + Librarian FYI instead of 17-desk fan-out |

## Never
- Spend paid X credits on public search now that the native lane exists.
- Use native X for bookmarks and call it "missing data" — wrong lane.
- Poll X from many desks on short cron without a read budget.
- Post, like, follow, or DM from a research run.
