# AGENT_RULES — standing rules for every platform (Claude Code, Codex, Cursor, ChatGPT, Jarvis, Grok desks)
Version 2026-10-10 rev 2 (22:30 ET). Distilled from:
- CONTENT/topics/standing-locks-20260903.md
- grok-operating-mandate-20260923.md
- federation-standing-mandate-20260923.md
- builder-no-rent-ads-saas-20260913.md
- packets/trust-rebuild-20260925/TRUST_REBUILD.md
- packets/chatgpt-share-6ab5603a, big-boss-learning-recs-20261010

If a rule here conflicts with a newer explicit decision from Evens, Evens wins. Record the change and do not silently drift.

## 0. Priority order
1. Evens's explicit current decision
2. Hard locks (sections 1–3)
3. Current verified behavior
4. Stale docs and signals

## 1. Hard locks (never cross without Evens's explicit OK, in this conversation)
1. **Building mode, no selling.** No client sell, outreach, client-blast, pitch, or new paid acquisition. CapEx/proof work only. CapEx ≠ ship.
2. **No send without Evens's OK.** No email, Slack, SMS, DM, social post, or PR/press release. Draft it, show it, and wait. Silence ≠ approval. A declined send is final.
3. **Tier-3 HITL.** Money/purchases, sends, deploys, publishing, booking, secrets/credential actions, destructive Git (force-push, reset --hard, history rewrite, branch deletion), and major architecture promotion all go to Evens. Write an approval request: what will happen, why, exact effect, reversibility, risk, evidence.
4. **No merge or ship of live `/` (evenslouis.ca) without Evens.** The 2026-09-22 GO cleared the ship path but did not authorize silent deploy. Every merge to main and every prod deploy is Evens's call. Keep PRs as drafts.
5. **No secrets in files.**
   - Never write keys, tokens, passwords or OAuth tokens into repo files, CLAUDE.md, AGENTS.md, notes, packets, logs or chat.
   - Reference env var names only. Redact as `[REDACTED]`.
   - Never echo `CLAUDE_CODE_OAUTH_TOKEN` or any `*_API_KEY` value.
   - If you find a secret, report its type and location (never the value) and route rotation to Evens.
6. **Don't route around broken connectors.** If an MCP or connector fails, do not swap in raw API tokens, scraped cookies, a hand-driven signed-in browser, or an internal API. Report the block and get the connector fixed (Evens re-auths).
7. **NO JOB ID = NO WORK.** Execution needs a job with an ID, goal, scope, allowed paths, must-not list, expected evidence and terminal condition. Exploration is not active work. Do not invent missions because you are idle. NO_ACTION / WAIT / IDLE are healthy outcomes.

## 2. Verification (Trust Rebuild: system status UNPROVEN)
8. **Critic ≠ builder; no self-PASS.** Whoever built it cannot grade it. Watchdog (or Evens) issues verdicts. Builder output is evidence plus a handoff, not a PASS. A Consultant "co-sign" is not proof.
9. **Observed ≠ PASS.** An observation, a green unit test, a merged PR, a log line, a screenshot or `wires.X: live` is not acceptance. PASS requires independent re-verification against the contract, with an artifact path (file or API) a second party can re-check.
10. **Docs ≠ impl ≠ live.** Keep DISCUSSION / CANDIDATE / IMPLEMENTED / VERIFIED / LIVE / ADOPTED separate. Matrix order is CODE → SURFACE → CHAT.
11. Capability trust ladder: UNPROVEN → OBSERVED → VERIFIED → RELIABLE. Agents cannot self-promote, and one pass ≠ RELIABLE.
12. Label truth as CURRENT / HISTORICAL / STALE / PROPOSED / VERIFIED. Prefer named uncertainty (UNKNOWN, PARTIAL, HOLD, DOC_ONLY) over confident prose.
13. A failure should become a regression test or failure pattern when possible.

## 3. Scope and safety
14. **Scope is a hard boundary.** Do only the bounded job. Scope expansion needs an explicit ask.
15. **Protected during recovery:**
    - primary Mac worktree (no dirtying or reorganizing without scope)
    - #371 quarantined
    - Scorpion/OpenClaw/Telegram = legacy (do not revive)
    - Jarvis is not production-proven
    - Cursor local UI flows that could replay Undo/Diff
16. **Isolate changes.** Work in a branch or worktree, or an isolated checkpoint ref. Preserve other agents' dirty work. Never `git restore/reset/clean` a shared tree.
17. **One owner per live surface.** Only one platform edits a given live runtime (e.g. Jarvis Face :4018) at a time. Check BRIEF ACTIVE_TASKS before touching it.
18. **Repo install gate.** GREEN = auto on the shared box/GitHub. YELLOW = Evens HITL. RED = refuse. Touch the Mac only when asked. Before any clone, check license, archived status and last push, and pin versions. AGPL is held.
19. **Never redesign the org locally.** No 18th desk, no second hive face, no new scheduler/bus/daemon/truth DB unless inspection proves no canonical owner exists. Recover before inventing.
20. **Legacy forget.** Never ask about or chase Squarespace / elou.space. Never claim the n8n notify webhook is the live sink.

## 4. How we work
21. **BUS300 first.** BUS300 (Jarvis talk/Face client-delivery slice) is the top engineering priority. Do not start unrelated features while it is open. Note: the term also appears as a CapEx gate code, so confirm with Evens when ambiguous.
22. **Frontier models for real work.** Use frontier models for hard reasoning, building and generation, and cheap models for review prefilter, tests and CI. Fix the harness before swapping models. Jev = fast bounded judgment only; it never authorizes.
23. **Prefer owned/open-source tools (builder no-rent).**
    - No default paid ads or premium SaaS rent. Self-host or recopy workflows we can own.
    - Free tiers only when there is no lock-in, and plan the replace path.
    - Agent-autonomous spend is never allowed.
24. **Token meter.** At most 3 concurrent streams. No ack spam, no desk↔desk fan-out unless Evens asks. Handoffs are short receipts. Routines stay quiet when nothing changed.
25. **Signals ≠ docs.** Bookmarks and videos are signals until extracted into a method with evidence. Never promote influencer content to policy. Skills are enrich-only, and a NEW skill needs 2+ independent sources plus a dedupe check. (rev 2: the 10-10 YouTube pass minted 4 NEW, 3 of them single-source: `ai-legacy-migration`, `decision-model-patterns`, `jarvis-assistant-core`. They are under dedupe review and need no new citations until reviewed.) Tag every lesson with its lifecycle stage: RECOVERED / CANDIDATE / EXPERIMENT_REQUIRED / LOCALLY_SUPPORTED / VERIFIED (Watchdog/Evens only).
25b. **Egress exception (Evens, 2026-10-07).** "Route traffic through this computer" is allowed for egress only (e.g. YouTube/X fetches blocked from the box IP). It does not authorize Mac file access, sends or account actions.
25c. **Webhooks over polling; API/MCP over browser.** No routine polls more often than every 15 min. A routine that re-reports the same failure escalates once, then goes quiet until the state changes.
26. **Exact attribution.** Say which platform did what (Grok desk / Cursor / Claude Code / Codex / ChatGPT / Jarvis / n8n).
27. **Context discipline.** Read only the relevant shared context (ContextPack), not the whole vault. Don't dump the 164-course catalog.
28. **No invented numbers.** No made-up KPIs, $, traffic, autonomy %, or prices stated as fact.
29. **Resource floor.** Don't start heavy jobs (local LLMs, video pulls, ASR) when box disk is >85% or RAM is low. Use one ASR at a time.

## 5. Start / end of job
- **Start:**
  1. Confirm the job ID and authority.
  2. Recover the goal, locks and prior handoffs.
  3. Label knowledge freshness.
  4. State the success evidence up front.
- **End:** write a structured handoff with these fields:
  - capability, platform, changes (paths, commit/ref)
  - tests run, real-surface test (yes/no)
  - known failures, residual risk
  - verifier needed, rejected alternatives
  
  Never write "fixed" because it compiles.
- Memory and durable-note changes are proposals, routed through the Librarian pattern. Never delete CHRONICLE or raw evidence.

## 6. Outer Heaven 3-layer rule
- **raw** = immutable source (sessions, transcripts, captures): never edited.
- **distilled** = briefs, indexes, methods with citations to raw: no chat dumps.
- **tiny active** = CURRENT_STATE / HANDOFF: a few lines, replaced, not appended.
