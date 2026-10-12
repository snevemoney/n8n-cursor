# LEARNINGS — what the signals taught us, Aug 10 → Oct 10 2026 (sharing digest, compiled 2026-10-10 ~22:30 ET)
This is a digest for every platform. It is **not** RECS-v2: recommendations stay on hold until the signals-2mo backlog finishes (98 items still waiting on transcripts).
P = `/workspace/research/packets`. W = `/home/box/agent-data/workflows/<slug>/SKILL.md`.

**Stage key (lowest to highest):**
- RECOVERED: captured and the method written down, no local proof.
- CANDIDATE: worth testing, or queued for the import gate.
- EXPERIMENT_REQUIRED: needs a key, hardware or an authorized session.
- LOCALLY_SUPPORTED: recreated on the box and the proof passed (builder-observed, not graded).
- VERIFIED: graded by Watchdog or Evens.

Vendor numbers ($, %, "10x", stars) stay UNVERIFIED unless a line says otherwise.

**Source short names:**
- SYN = P/signals-2wk-synthesis-20261007 (SUMMARY.md, LEDGER-v2.csv)
- FS = P/signals-2wk-fullstudy-20261010 (SUMMARY.md, SKILL_DELTA.md)
- YT = P/youtube-2wk-fullwatch-20261010 (SUMMARY.md, SKILL_DELTA.md)
- 2MO = P/signals-2mo-backlog-20261010 (SUMMARY.md, SKILL_DELTA.md, REPOS_TESTED.md)
- BR = P/bookmark-review-1201-20261008 (STATUS.md, SKILL_PROPOSALS.md, REPOS_TO_GATE.md)

## 1. Harness and loops (how agents should work)
- A verifiable target plus "loop until it passes" beats a clever prompt; the real bottleneck is building verifiers. — LOCALLY_SUPPORTED — FS (Steve8708), W agent-harness-loops
- Plan → fresh-context steps → a verifier that only reports failures. Ships `fresh_verifier_loop.py`. — LOCALLY_SUPPORTED — 2MO SKILL_DELTA
- Write the validation contract before any code, hash it, and add a cheating-agent check (software-factory loop). — LOCALLY_SUPPORTED — YT (lx0Eaane4Ng, vGCJ7diEtrw), W software-factory-loop
- Steering queue, four hooks, a cloud-vs-local router, and `/plan` approval: all three recreations exited 0. — LOCALLY_SUPPORTED — SYN §1.3 (sJpop1juVBQ, zaLQ0AnY9dI, LmV0OiNjw8c)
- Lock 8 decisions (schema, validation, routes, auth, CSS, UI kit, comms, folders) before running agents in parallel; there is a rules-file preflight checker. — LOCALLY_SUPPORTED — YT
- Ship an evidence pack with every agent change: what, why, could-break, downstream, objective. — LOCALLY_SUPPORTED — YT, W verify-then-done
- Self-evolve loop: a frozen eval contract plus a holdout; models propose and deterministic gates accept. — CANDIDATE (its tests ran 1299 pass / 44 fail) — FS (DaizeDong/self-evolve)
- Use an outer keep-alive loop, a daily shared board fed into every prompt, and a per-provider unit budget stop. — LOCALLY_SUPPORTED — YT (kHqjPdttzbw)
- Mine your own STATE/log traces for repeated sequences and turn them into skills (`trace_miner.py`). — LOCALLY_SUPPORTED — 2MO, W research-signal-to-skills
- Give each agent an isolated sandbox or worktree; never share a dirty tree. — LOCALLY_SUPPORTED — FS (svpino, DavidOndrej1), BRIEF overlap #2
- A periodic curator should merge and archive self-made skills so they don't pile up. — RECOVERED — BR (support 1)

## 2. Safety at the tool layer, not the prompt
- Put hard limits in tool gates (allow/ask/deny); prompt guardrails leak to persona and fiction reframes. — LOCALLY_SUPPORTED (6/6 gate) — YT (oetQNZp2MLM), FS (Hamzaonchain), W tool-permission-not-prompt
- Claude Code mods/plugins can allow, rewrite or deny each event. Our `destructive-guard` passed 26/26 in a harness and validated in an npx sandbox on 2.1.296. The box CLI 2.1.250 is below the mods floor (≥2.1.287). — EXPERIMENT_REQUIRED — SYN §1.1, FS, W claude-code-mods
- The guard can be bypassed with `$(… base64 -d)`, so it is a safety net, not a permission system. — LOCALLY_SUPPORTED — SYN §1.1
- Session label: once a session has read untrusted input, it can't write to tools (OpenAPPA pattern). — LOCALLY_SUPPORTED — SYN §1.4 (I_KVMFrUtPk); OpenAPPA repo = CANDIDATE (import gate)
- Check an installer's hash/signature before running it (CPU-Z/HWMonitor hijack ×3 reports). New skill. — LOCALLY_SUPPORTED — 2MO, W installer-supply-chain-check
- Repo gate before any clone: license, archived flag, last push, pinned version. Holds so far: AGPL (VoiceStudio, OpenMontage), curl|bash runtimes (paperclip, claude-mem), cookie import (orca). — LOCALLY_SUPPORTED — 2MO REPOS_TESTED.md, repos/REPO_READS.md
- A standalone AI HTML dashboard leaks all of its data; serve it behind an authenticated API. — LOCALLY_SUPPORTED — YT
- Never ship secrets in a client bundle; there is a scanner for it. — LOCALLY_SUPPORTED — YT (Dave Ebbelaar)
- A calendar-invite MCP hijack is a real vector; connect only accounts you'd trust that vendor with. — RECOVERED — 2MO, YT

## 3. Decisions and model routing (Jev / System-1)
- Jev is a decision model: input plus fixed choices → a distribution. Read the probabilities, not the label, and include an `other` exit. — LOCALLY_SUPPORTED (lab 83 tests) — FS, W system-one-decision-gate
- Confidence = (n·p_max−1)/(n−1), checked on 109 saved answers (max deviation 0.015). Low confidence means "no opinion", so fall back to a frontier model. — LOCALLY_SUPPORTED — FS (ArchiveExplorer)
- Ask one judgment per question; pin phrasing + threshold + version; run in shadow mode before live. — LOCALLY_SUPPORTED (offline) / live EXPERIMENT_REQUIRED (no TYPESAFE key) — FS (polydao, mikenevermiss)
- The same pattern covers null/choice/score types in speculative fan-out, confidence gates and intent routing. — LOCALLY_SUPPORTED (6/6 stub) — YT, W decision-model-patterns
- OpenAI Decisions API exists (public beta, typed answers); the "10x faster" claim is untested. — EXPERIMENT_REQUIRED — SYN §1.5, FS
- Fast browser agents number the page elements, ask for action + element # with confidence, and act at ≥0.7 (no screenshots). — LOCALLY_SUPPORTED (Playwright fixture) — YT
- Cheap model reads/scores/dedupes, frontier model decides, code commits. — RECOVERED — 2MO, W cheap-read-expensive-decide
- Re-check leaderboards and don't pin to one vendor (Gemini fell from #1). — RECOVERED — YT
- Local models suit privacy and batch work, not frontier coding; agents are prefill-heavy, and breakeven against a subscription takes years. — LOCALLY_SUPPORTED (fit math only) — YT, W local-private-agent-lab
- Routing desks by name/title/description: 12/17 correct, 16/17 with a one-line route line first on each card (text stand-in, not live). — EXPERIMENT_REQUIRED (3 live handoffs) — SYN §1.2, W primary-bot-routing

## 4. Grok Bot / platform operations
- Use webhooks, not 15-minute polling routines (96 → 2 runs/day); routine cadence × context cost ≈ 26x. — LOCALLY_SUPPORTED — YT (UXbAuWvUwUE), 2MO `routine_cost.py`, W grokbot-harness
- Record a browser task's network calls once, then call the API directly; API/MCP beats browser. — LOCALLY_SUPPORTED — YT (UXbAuWvUwUE)
- Learn the operator's voice from draft→sent edits. — LOCALLY_SUPPORTED — YT
- Wrap rarely used software as a small MCP or an agent-first CLI (JSON I/O, exit codes, `--yes`). — LOCALLY_SUPPORTED (5/5) — YT (DHH)
- A lead orchestrator with single-job scouts and memory, that pings only on new finds. — LOCALLY_SUPPORTED (3/3) — YT, W named-desk-routines
- A skill/index drift heartbeat (`skill_index_drift.py`) plus a RULINGS file plus short prompts with context files. — LOCALLY_SUPPORTED — 2MO, W session-bootstrap
- Prune the system prompt before adding to it; check token cost after each MCP install. — RECOVERED — 2MO, BR
- X bookmarks API is 403 spend-capped. The desktop fallback works and showed the catalog was undercounted (96 → 1,342 → 1,443). — LOCALLY_SUPPORTED — SYN §1.6
- The box IP gets YouTube 429s and bot-checks. Evens granted an egress-only "route traffic" exception on Oct 7. — LOCALLY_SUPPORTED — SYN, P/hive-smarter-loop-20261009/RECEIPT.md
- Many "CAPTION_GAP" videos are silent (ffprobe finds no audio), so stills + text is the full capture. — LOCALLY_SUPPORTED — 2MO P1
- Whisper on X clips: pipe ffmpeg as float32, force the language, beam 5 (PyAV metadata crash; autodetect fails on music intros). — LOCALLY_SUPPORTED — FS, W whisper-caption-gap

## 5. Motion / video craft (Creative Studio)
- Code-film engine: deterministic `seek(t)`, closed-form springs, subframe tmix, one clock shared by preview and export. — LOCALLY_SUPPORTED (render −13.7 LUFS, 0 pops, 0 frozen) — FS (RaphaelAubryy, twoclipping), W motion-pipeline
- Flow: beat map → 4 stills → draft → full → pop/frozen scans → audio (drop by band energy, SFX at peaks, −14 LUFS) → contact-sheet self-score ≥8. — LOCALLY_SUPPORTED — FS
- Gauntlet: builder ≠ judge, a fresh critic every round, a ledger, measurable checks (`frozen-time.sh`, `loudness.sh`). — LOCALLY_SUPPORTED — FS (motion-video-kit)
- Look expensive: morph not fade, one continuous camera, no hard cuts, an object that carries meaning across beats, real SFX. — RECOVERED (Opus master = Evens-approved bar) — FS, P/apple-premium-storyboard-20260929/opus-learn/
- Render-contract check: render twice and diff for identical output. — LOCALLY_SUPPORTED — FS (0xMovez sheet)
- Workflow: reference videos → renderer → real components (21st) → DESIGN.md brand → 3 storyboards → one still per scene → director notes in camera words. — LOCALLY_SUPPORTED (engine) — FS (rexan_wong, ArchiveExplorer)
- Use DESIGN.md tokens in front matter, linted, to stop generic AI looks. — LOCALLY_SUPPORTED (parser/linter/emitter) — YT, W design-tokens
- "One-prompt" Opus showreels test the engine, not the idea; their claims stay UNVERIFIED. — RECOVERED — SYN §1.7, FS
- Paid generation (Higgsfield, HeyGen, Seedance) needs a cost gate; never in a default path. — LOCALLY_SUPPORTED (mock) — YT, W reference-driven-video-production

## 6. Jarvis and assistants
- Jarvis core = a brain router, a plugin registry, and a risky-action gate that hands control back before the human commits. — LOCALLY_SUPPORTED (6/6) — YT, W jarvis-assistant-core
- Jarvis cost is model turns, not tools; Jev routing cuts it. — LOCALLY_SUPPORTED (ledger) — YT
- Local voice stack Piper → faster-whisper makes an exact round trip; VoiceStudio is AGPL and held. — LOCALLY_SUPPORTED — FS, W dialbot-bland-outbound
- Keep an AI insight only if its quote appears word for word in the source. — LOCALLY_SUPPORTED — YT, W claim-verifier

## 7. System truth (our own failures as lessons)
- A stage "passing" or a file existing is not done: the corpus claimed 105+ complete, and only 48 of 889 were. — VERIFIED (Watchdog 2026-09-25) — P/progress-truth-canary-20260925/WATCHDOG-VERIFY-20260925.md
- PR591 R13: green CI hid a concurrent-rebuild data-loss race and a fail-open guard. — VERIFIED FAIL (Watchdog R13; fixes not re-graded) — P/jarvis-learning-engine-20261008/WATCHDOG-CRITIC-PR591-R13-20261008.md
- Two summary files in one packet disagreed: 2MO FULL_VERIFIED 163 (first pass) vs 287/288 (continuation). Always cite the section timestamp. — LOCALLY_SUPPORTED — 2MO SUMMARY "Continuation run"
- 562-skill storms get refused. A new skill needs 2+ independent sources; YouTube minted 4 NEW and only software-factory-loop has 2 sources, so dedupe the other 3. — CANDIDATE — SYN §4, YT SKILL_DELTA, big-boss recs #22
- 1,201 old bookmarks: only 16 high and 164 medium usefulness; 459 noise and 432 leisure. Most bookmarks are not lessons. — LOCALLY_SUPPORTED — BR STATUS.md

## Counts (for context)
- SYN: 2,148 ledger rows (verified yes 26 / partial 104 / no 303 / n.a. 1,715).
- FS: 57 X (32 FULL_VERIFIED / 13 PARTIAL / 1 FAILED); 0 skills minted, 7 enriched.
- YT: 655 watched, 89 builder (35 FULL / 37 PARTIAL / 3 FAILED); 4 NEW skills.
- 2MO: 1,733 unique (latest FULL_VERIFIED 287, PARTIAL 98); 2 new + 17 enriched skills.
- BR: 1,191 DONE / 10 FAILED; 99 proposals.

<!-- BEGIN brain-export:auto -->
<!-- generated by brain-export on the box; edit sources, not this block -->
Generated 2026-10-11 20:49 ET. Verification labels: **yes** = verified/recreated, **partial** = partly verified, **no** = recorded claim, not verified.

## Signals backlog status (Aug 10 – Sep 25)
Source: `/workspace/research/packets/signals-2mo-backlog-20261010/SUMMARY.md`

**Current status (rebuilt from disk 2026-10-11 16:35 ET; the bottom line below is the first run's snapshot).** 1,734 unique signals: FULL_VERIFIED 339, UNVERIFIABLE_READONLY 207, PARTIAL_EXTERNAL 21, REJECTED 10, BLOCKED_CURSOR_USAGE 2, FAILED 7 (2 deleted sources, 5 YouTube videos the runner gave up on after 3 attempts: bot-check/403, or ASR over the 4 GiB memory cap), ALREADY_DONE 186, LEISURE_SKIP 797, NOT_A_QUEUED_SIGNAL 165, and PARTIAL 0. No item is waiting on a transcript: Forge's YouTube runner finished at 13:10 ET and long_asr.sh finished at 16:07 ET. Final item-level report: FINAL_REPORT.md. Live tables: SUMMARY_TABLES.md.

### Still unfinished and why
1. **Transcripts pending (221 items).** 130 X bookmark videos are in `asr/x_queue2.txt`, running now. 91 YouTube ids go to Forge's runner after that (`asr/yt_queue.txt`). YouTube bot-checked the runner at 16:27 ET today, so failures there are possible; the runner retries up to 3 attempts. After transcripts land, the method still has to be read from each one (RESUME.md).
2. **145 claims held unverified.** These are vendor or creator claims (star counts, "30x", benchmark numbers) with no test possible read-only or without accounts.
3. **37 folded into skills as claims.** The lesson is recorded, but recreation isn't feasible (vendor features, paid generation, Mac-only apps).
4. **24 enrichment proposals not applied.** Support was 1 or the claim unverified (social-autopost, docker-builds, self-hosting, client-onboarding and similar).
5. **17 tools exist but were not functionally tested.** 11 have the link confirmed (HTTP 200) and 6 are untested; all need an account, a key, a GPU or an install (Fugu, VibeVoice 7B, Shopify toolkit, Cloudflare /crawl and others).
6. **BLOCKED_CURSOR_USAGE: 1.** c9nRxEy1kUY, the pi-agent OpenRouter replay; the spec is in `_cursor_jobs/`. No cloud agents were launched.
7. **FAILED: 2.** One tweet was deleted (2032582087111323809) and one YouTube id is gone (y12yZ7bQizk).
8. **Coverage gaps.** There are no YouTube digests for Aug 10–Sep 9 except the repass, and none for Sep 19–25. Recovering them needs a signed-in history scroll, which I didn't do under the read-only rule.

## Skills touched by transcript-waiting items
Source: `/workspace/research/packets/signals-2mo-backlog-20261010/FINAL_REPORT.md`

FULL_VERIFIED 134, UNVERIFIABLE_READONLY 41, LEISURE_SKIP 41, PARTIAL_EXTERNAL 12, REJECTED 5, FAILED 5
local-private-agent-lab 14, wiki-ingest 6, tool-permission-not-prompt 4, agent-harness-loops 3, host-automations-outside-subscription 3, claude-code-mods 3, match-model-to-task 3, landing-page-design 3, software-factory-loop 2, motion-pipeline 2, context-before-tokens 2, system-one-decision-gate 2, phone-hitl-routine 1, one-person-marketing-desk 1, cinematic-site-recipe 1, reference-driven-video-production 1, speed-to-lead-demo 1, discovery-spiced-constraint 1, value-based-pricing 1, aios-five-layers 1, curated-skill-systems 1, grok-role-bots-triggers 1, grokbot-harness 1, buyable-automation-skus 1, public-web-extract-md 1, jev-preflight 1, n8n-legacy-ops 1, session-bootstrap 1, installer-supply-chain-check 1, awesome-skill-import-gate 1, ui-compose 1

## Lessons from signals (LEDGER-v2)
Source: `/workspace/research/packets/signals-2wk-synthesis-20261007/LEDGER-v2.csv` (2148 rows; showing verified, partial and skill-enriched, deduped)


### builder-tool (29)
- [partial] A code knowledge graph (GitNexus) lets an agent check call chains and blast radius before it edits (tool power claim UNVERIFIED). (reviewed 2026-10-08: repo to import-gate: GitNexus (link in ; 2026-09-23)
- [partial] Shopify ships an AI Toolkit so Claude Code, Codex and Cursor can manage a store directly (for client shop work; UNVERIFIED here). (reviewed 2026-10-08: tool/API to test: Shopify AI Toolkit; 2026-09-23)
- [yes] Claude Code can be pointed at a local Ollama model with ANTHROPIC_BASE_URL/ANTHROPIC_MODEL, keeping the same agent loop at $0 for low-stakes tasks (quality vs Claude models UNVERIFIED). (reviewed 2026-10-08: tool/API to test: Claude Code via ANTHR; 2026-09-23)
- [partial] Persistent-memory plugins for Claude Code (e.g. claude-mem) are popular; token-saving claims UNVERIFIED, and they need the import gate. (reviewed 2026-10-08: repo to import-gate: Claude Code perman; 2026-09-23)
- [partial] gitingest turns any Git repo into one LLM-ready text file, useful for feeding a repo to a model for review. (reviewed 2026-10-08: tool/API to test: gitingest; 2026-09-23)
- [yes] A role-indexed shortlist of the most-cited skill repos (superpowers, gstack, impeccable, taste-skill, ui-ux-pro-max, claude-mem, last30days, Agent-Reach) is a ready candidate queue for the import gate. (reviewed 2026-10-08: skill-enrichment proposal: awesome-skil; 2026-09-23)
- [partial] anydoc gives agents free document reading with OCR, tables and formulas and no API key (speed figures UNVERIFIED). (reviewed 2026-10-08: tool/API to test: anydoc OCR (free, no ; 2026-09-23)
- [partial] Ollama can expose local models inside Claude Desktop's model picker with one toggle (UNVERIFIED here; would need testing on a desktop). (reviewed 2026-10-08: tool/API to test: Ollama Claude integra; 2026-09-23)
- [partial] orca runs Codex, Claude Code and OpenCode side by side in separate git worktrees, and codebase-memory-mcp claims large token savings by indexing the codebase (star and token figures UNVERIFIED). (reviewed 2026-10-08: skill-enrichment proposal: awesome-skil; 2026-09-23)
- [partial] There is an obsidian-skills pack that lets Claude Code / Codex operate an Obsidian vault directly (import gate before use). (reviewed 2026-10-08: repo to import-gate: obsidian-skills; 2026-09-23)
- [yes] Claude Artifacts can call MCP connectors per viewer, so a shared dashboard pulls live data with each viewer's own credentials and no refresh job (feature claim UNVERIFIED here). (reviewed 2026-10-08: skill-enrichment proposal: awesome-skil; 2026-09-23)
- [partial] Carry many skills as metadata; load full instructions only on task match—never dump the library into static context. (LOCALLY_SUPPORTED (Batch #06 correction lifecycle); maps: cu; 2026-09-23)
- [partial] Ship agents on eval bars with rubrics, not demos; version AGENTS.md/skills/evals as owned code; keep prototype≠production explicit. (LOCALLY_SUPPORTED (Batch #06 correction lifecycle); maps: ag; 2026-09-23)
- [partial] Role-specialist agent packs exist for Claude Code/Cursor; useful as wording reference for desk cards, not a wholesale install. (reviewed 2026-10-08: repo to import-gate: 61-agent "agency" ; 2026-09-24)
- [yes] Claude Code routines run a saved prompt + repo + connectors on a schedule, API call or event on Anthropic's servers, a candidate for unattended repo jobs (research preview; not tested here). (reviewed 2026-10-08: skill-enrichment proposal: agent-harnes; 2026-09-24)
- [partial] Pick the Claude automation by constraint: Routines for unattended jobs, desktop scheduled tasks when local access is needed, /loop for right-now repetition. (reviewed 2026-10-08: skill-enrichment proposal: agent-harnes; 2026-09-24)
- [partial] Four CLAUDE.md rules worth checking against ours: think before coding, simplicity first, surgical edits only, set the goal before starting (star count UNVERIFIED). (reviewed 2026-10-08: repo to import-gate: Karpathy-style CLA; 2026-09-24)
- [partial] crawl4ai (LLM-ready markdown, no key) and markitdown cover most fetch-and-clean needs; stealth tools (Scrapling, curl-impersonate) raise terms-of-service risk and need a gate. (reviewed 2026-10-08: skill-enrichment proposal: web-scraping; 2026-09-24)
- [partial] Retrieving screenshots instead of parsed HTML keeps tables and layout that text parsers drop; PixelRAG also ships a Claude Code plugin to read rendered pages (accuracy claims UNVERIFIED). (reviewed 2026-10-08: repo to import-gate: StarTrail-org/Pixe; 2026-09-24)
- [partial] The ECC Claude Code pack enforces plan → tests first → implement → security scan; the pattern is worth copying even without installing the whole pack (stars UNVERIFIED). (reviewed 2026-10-08: repo to import-gate: ECC (everything-cl; 2026-09-24)
- [yes] Claude artifacts can now call MCP connectors per viewer, enabling small live dashboards without shared credentials (not for publicly shared artifacts). (reviewed 2026-10-08: skill-enrichment proposal: claude-code-; 2026-09-24)
- [partial] Firecrawl's Developer Index gives coding agents a search over repos, docs and issues so they use current APIs (recall claim UNVERIFIED). (reviewed 2026-10-08: tool/API to test: Firecrawl Developer I; 2026-09-24)
- [partial] herdr shows up again as the terminal manager for CLI agents next to Grok Bot, so it is a recurring candidate for the test gate. (reviewed 2026-10-08: tool/API to test: herdr + tool/API to t; 2026-09-24)
- [partial] Claude Code mods are plugins with register(on) hooks; /plugin installs go through the same import gate as awesome lists; Claude as hive face stays BLOCKED (Cursor+Grok Bot WORKAROUND). (skill enriched: awesome-skill-import-gate; 2026-10-02)
- [yes] Send parallel / DB / Sentry paper-cut fixes to Cursor cloud agents and UI work to local, finish where you start, and document env setup so cloud agents can boot. (full pass A–E; skill enriched: agent-harness-loops; sentry-f; 2026-10-02)
- [no] Claude Code built-in "You should Know" plugin = /plugin class: study is fine, any install goes through the import gate. (skill enriched: research-signal-to-skills; awesome-skill-imp; 2026-10-05)
- [partial] Mods = plugin + hooks module exporting register(on); middleware observes, rewrites or denies events; requires Claude Code ≥2.1.287. (STRENGTHENS → claude-code-mods created Oct 6; 2026-10-05)
- [partial] Claude Code mods hook every event (observe / rewrite / deny); a destructive-command guard passed 26/26 in a harness but live use needs Claude Code ≥2.1.287 (box has 2.1.250). (full pass A–E; skill created: claude-code-mods (owner Forge); 2026-10-06)
- [partial] A Claude Code mod is a plugin with a hooks module exporting register(on); middleware can observe, rewrite or deny each event. (covered by web-intel Oct 5 (primary source); feeds claude-co; 2026-10-06)

### harness (21)
- [no] One-chief Grok Bot harness notes (SpaceX livestream lore UNVERIFIED). (skill enriched: agent-harness-loops; 2026-09-23)
- [no] Multi-agent same-data race → stale/overwrite. (skill enriched: agent-harness-loops; 2026-09-23)
- [yes] A nine-step scope→architect→develop→audit→sync→check→test→document→debug loop that files decisions and proves real behaviour stops AI code decay. (full pass A–E; skills enriched: jsm-ae-* (10); agent-harness; 2026-09-23)
- [partial] Pick vibe/structured/agentic by stakes before prompting; same tool can do either—discipline is the harness, not the brand. (LOCALLY_SUPPORTED (Batch #06 correction lifecycle); maps: js; 2026-09-23)
- [partial] Without both deterministic tests and trajectory/response evals, you are vibe coding—no matter how fancy the prompts. (LOCALLY_SUPPORTED (Batch #06 correction lifecycle); maps: ve; 2026-09-23)
- [partial] Agent = Model + Harness; on failure check tools/rules/hooks/sandbox/observability before swapping the model. (LOCALLY_SUPPORTED (Batch #06 correction lifecycle); maps: ag; 2026-09-23)
- [partial] On agent failure, inspect tools/rules/hooks/sandbox/context noise/observability before swapping models. (LOCALLY_SUPPORTED (Batch #06 correction lifecycle); maps: ME; 2026-09-23)
- [partial] Allow vibe for exploration; require agentic harness for production; name which branches/envs allow which mode. (LOCALLY_SUPPORTED (Batch #06 correction lifecycle); maps: ME; 2026-09-23)
- [partial] Paperclip models an agent company as org chart + goals + task ownership + budgets; worth a read-only look at its budget and ownership model, not an install. (reviewed 2026-10-08: repo to import-gate: Paperclip (npx pap; 2026-09-24)
- [no] One-job bots + handoffs. (skill enriched: agent-harness-loops; 2026-09-24)
- [no] Google first-agents tutorial pointer. (skill enriched: agent-harness-loops + video held (Cap); 2026-09-24)
- [no] OpenAI Astra computer-use pitch RESEARCH-OK. (skill enriched: agent-harness-loops + video held (Cap); 2026-09-25)
- [no] Cloudroom local→cloud teleport Cap → map to owned Cursor CloudAgent keep-running-after-laptop-shut. (skill enriched: agent-harness-loops + video held (Cap); 2026-09-25)
- [no] Steve8708 verifiable-loop title atom → owned goal→act→verify / Decoding AI sibling. (skill enriched: agent-harness-loops + video held (Cap); 2026-09-29)
- [no] Svpino self-host multi-agent + polydao Jev harness PDF pointer — Cap held; map to owned harness / import-gate keep-out. (skill enriched: agent-harness-loops + video held (Cap); 2026-09-29)
- [yes] A coding-agent harness = steering queue + 4 core tools + 6 modules with compaction; steering_queue_demo.py ran exit 0. (full pass A–E; skill enriched: agent-harness-loops; 2026-09-29)
- [no] /plan approval atom STRENGTHENS; Antigravity face BLOCKED; Cap HELD. (skill enriched: agent-harness-loops + video held (Cap); 2026-09-30)
- [no] Isolated per-agent sandboxes STRENGTHENS_EXISTING. (skill enriched: agent-harness-loops; 2026-09-30)
- [no] Self-evolve external-eval STRENGTHENS; repo URL not in DOM. (skill enriched: agent-harness-loops; 2026-09-30)
- [partial] Put a fast decision model at four hooks / six places in the harness with progressive skill disclosure; demo ran exit 0 with a stub (Typesafe API BLOCKED). (full pass A–E; skill enriched: agent-harness-loops (decision; 2026-09-30)
- [partial] Typesafe Decisions API stayed BLOCKED (no key), so the hook demo runs on a stub. (skill enriched: agent-harness-loops (re-PROVE exit 0 with st; 2026-09-30)

### model/api (20)
- [no] Tool+args router with no free-text LLM. (skill enriched: match-model-to-task; system-one-decision-gat; 2026-09-23)
- [no] Live spoken → which slide to pull (real-time decide). (skill enriched: system-one-decision-gate; desktop-computer-u; 2026-09-23)
- [no] NL feed filter as cheap decision primitive. (skill enriched: cheap-read-expensive-decide; 2026-09-23)
- [no] Decision model = Y/N/MC + confidence. (skill enriched: system-one-decision-gate; 2026-09-23)
- [no] Top use cases: real-time loops, CU action select, tool risk. (skill enriched: cheap-read-expensive-decide; desktop-compute; 2026-09-23)
- [no] Same Grok↔decide loop. (skill enriched: cheap-read-expensive-decide; agent-harness-l; 2026-09-23)
- [no] Micro-decisions: retry / tool / done? / risk / top-k docs. (skill enriched: system-one-decision-gate; 2026-09-23)
- [no] Clip-topic selection as cheap decide over long video (claim UNVERIFIED). (skill enriched: cheap-read-expensive-decide; 2026-09-23)
- [no] Request→structured state→cheap decide; expensive model out of loop. (skill enriched: system-one-decision-gate; cheap-read-expensi; 2026-09-23)
- [no] Typed decisions software consumes directly. (skill enriched: system-one-decision-gate; 2026-09-23)
- [no] Prompt→Grok→decide→Grok acts loop. (skill enriched: cheap-read-expensive-decide; agent-harness-l; 2026-09-23)
- [partial] Sakana Fugu packages multi-agent orchestration behind one model API (frontier-parity claim UNVERIFIED). (reviewed 2026-10-08: tool/API to test: Sakana Fugu API (saka; 2026-09-23)
- [no] Per-prompt model menu (cost+latency), not one global tier. (skill enriched: match-model-to-task; cheap-read-expensive-de; 2026-09-23)
- [partial] Route frontier models to hard reasoning and cheap models to deterministic grunt—encode routing in the harness. (LOCALLY_SUPPORTED (Batch #06 correction lifecycle); maps: ma; 2026-09-23)
- [no] Jev as next-step router. (skill enriched: match-model-to-task; jev-craft-gate; 2026-09-24)
- [no] Ms control-layer / router. (skill enriched: cheap-read-expensive-decide; 2026-09-24)
- [no] Train small Jev-like classifier locally. (skill enriched: jev-craft-gate (EXPERIMENT_REQUIRED); 2026-09-24)
- [no] Altman cheaper-model Cap news-demo; vendor claims UNVERIFIED. (skill enriched: match-model-to-task; cheap-read-expensive-de; 2026-09-30)
- [no] Confidence-score routing Cap HELD. (skill enriched: match-model-to-task; cheap-read-expensive-de; 2026-09-30)
- [partial] OpenAI Decisions API returns typed yes/no / choice / score answers and is a candidate cheap routing gate; the "10x faster" claim is UNVERIFIED. (skill enriched: cheap-read-expensive-decide; primary-bot-rou; 2026-10-07)

### motion/video (16)
- [no] Remotion ships official agent skills installable with npx skills add remotion-dev/skills (import gate, not auto-installed). (skill enriched: remotion-official-skills-import; 2026-09-23)
- [no] Remotion published the full prompt history behind a demo, usable as a brief-to-render recreation guide. (skill enriched: remotion-brief-to-render; 2026-09-23)
- [partial] For scroll-motion sites, use the official greensock gsap-skills so the agent writes real GSAP APIs, animate only transform/opacity with reduced-motion support, and add a cost-approval gate before paid Higgsfield runs. (reviewed 2026-10-08: skill-enrichment proposal: higgsfield-v; 2026-09-23)
- [partial] HyperFrames renders video from HTML inside Codex/Claude Code; quality depends on writing a frame.md and storyboard first. (reviewed 2026-10-08: skill-enrichment proposal: remotion-vid; 2026-09-24)
- [no] Opus/Claude motion demos → Remotion+Higgsfield path. (skill enriched: remotion-brief-to-render; when-remotion + vi; 2026-09-24)
- [no] Launch breakdown + marketing-video cents/min. (skill enriched: reference-driven-video-production + video he; 2026-09-24)
- [no] Launch breakdown + Astra motion + Opus/Astra A/B. (skill enriched: motion-pipeline; reference-driven-video-prod; 2026-09-25)
- [no] Launch breakdown + Opus one-prompt. (skill enriched: remotion-brief-to-render; when-remotion + vi; 2026-09-25)
- [no] Opus+AE+Higgsfield launch demo; Cap HELD. (skill enriched: motion-pipeline + video held (Cap); 2026-09-30)
- [no] Opus motion-studio prompt cluster (WORKAROUND). (skill enriched: motion-pipeline; remotion-brief-to-render; 2026-09-30)
- [no] Recoverable repo echris6/motion-video-kit (CANDIDATE import-gate). (skill enriched: motion-pipeline; remotion-brief-to-render; w; 2026-09-30)
- [no] Claude→Blender Cap; Blender BLOCKED → Remotion WORKAROUND. (skill enriched: motion-pipeline; remotion-brief-to-render; w; 2026-09-30)
- [no] Jev+Opus one-brief Cap HELD. (skill enriched: motion-pipeline; landing-page-design; remoti; 2026-09-30)
- [no] HeyGen Video API Cap; hive face Remotion+Higgsfield. (skill enriched: motion-pipeline; reference-driven-video-prod; 2026-10-01)
- [no] Cap HELD Article/video. (skill enriched: remotion-brief-to-render; motion-pipeline; w; 2026-10-01)
- [no] A shared Opus/Fable 5.5 motion-design prompt maps to the own motion kit; prompt body unread so the atom is UNVERIFIED. (skill enriched (STRENGTHENS mapping): own-motion-kit; ae-aki; 2026-10-07)

### grok-bot-platform (9)
- [partial] Let Grok Bot coordinate while installed coding CLIs do the heavy work, so Grok Bot's rate limit only pays for coordination (herdr UNVERIFIED; installs need gate). (reviewed 2026-10-08: skill-enrichment proposal: grokbot-harn; 2026-09-23)
- [partial] Open-source OpenBot copies the Grok Bot model (per-bot computer, pre-decided actions, human take-the-wheel handoff); reference only, Grok Bot stays the face. (reviewed 2026-10-08: repo to import-gate: OpenBot (open-sour; 2026-09-23)
- [yes] X API bookmark reads return 403 spend-cap and buying credits does not unlock them; fail closed rather than restamp an old dump as live. (system lesson; BLOCKED (fallback desktop scrape); 2026-09-23)
- [no] Grok Bot native weekly features. (skill enriched: grokbot-harness + video held (Cap); 2026-09-24)
- [yes] A community repo distils the xAI 72-hour Grok Bot build streams into an AGENTS.md, 40 antipatterns and 69 bot role cards; compare its rules to grokbot-harness before adopting any (third-party, UNVERIFIED). (reviewed 2026-10-08: skill-enrichment proposal: grokbot-harn; 2026-09-25)
- [yes] When the X API is spend-capped, the desktop CDP scrape is the working ingest path. (system lesson; 2026-10-02)
- [partial] Grok Bot Primary Bot routes tasks across bots and may overlap the 17-desk + Big Boss routing; flagged to Big Boss, no self-applied change. (GAP_FOUND → primary-bot-routing created Oct 7; 2026-10-05)
- [yes] The box IP is blocked by YouTube for transcripts; the desktop browser path is the one that works. (system lesson; 2026-10-05)
- [partial] Grok Bot Primary Bot routes by bot name/title/description; adding one route line per desk card lifted proxy routing from 12/17 to 16/17. (full pass A–E; skill created: primary-bot-routing (owner Big; 2026-10-06)

### voice (8)
- [partial] OpenWhispr offers offline, on-device dictation, a privacy-safe option for voice notes (not tested). (reviewed 2026-10-08: tool/API to test: OpenWhispr; 2026-09-23)
- [partial] Microsoft's open VibeVoice ASR claims hour-long, diarized transcription in one pass, a candidate for local meeting/video transcripts (claims UNVERIFIED). (reviewed 2026-10-08: tool/API to test: Microsoft VibeVoice A; 2026-09-24)
- [no] Nemotron 3 Diarization RESEARCH-OK. (skill enriched: whisper-caption-gap; 2026-09-24)
- [partial] When YouTube timedtext returns 429, transcribe ≤5 window slices with box Whisper small instead of the whole file. (full pass A–E logged; skill enriched: whisper-caption-gap (A; 2026-09-25)
- [yes] Box Whisper CLI works for caption gaps; VPS Whisper and a second desktop stayed BLOCKED. (skill enriched: whisper-caption-gap; 2026-09-25)
- [partial] Screen-aware dictation feeds what is on screen as context into push-to-talk compose; recreated as a script, Mac HUD path blocked. (full pass A–E; skill enriched: local-push-to-talk-dictation ; 2026-09-27)
- [no] Liambraus local OSS ElevenLabs-class TTS pointer — Cap held; map as alternative watch, hosted CLI path stays PROVE. (skill enriched: elevenlabs-agents-as-code + video held (Cap); 2026-09-29)
- [no] Recoverable 10-repo voice catalog (CANDIDATE import-gate). (skill enriched: dialbot-bland-outbound; whisper-caption-gap;; 2026-09-30)

### computer-use (6)
- [no] Browser-use + decision: action space/step, DOM state, small LLM type fallback. (skill enriched: desktop-computer-use-creative; cheap-read-ex; 2026-09-23)
- [no] Local CoreML segment+OCR → text-only to decision; no pixels leave machine. (skill enriched: desktop-computer-use-creative; 2026-09-23)
- [no] Voice-controlled Mac CU; app opens mid-sentence. (skill enriched: desktop-computer-use-creative; local-push-to; 2026-09-23)
- [no] CU tool; decide what to type; no LLM required (OS claim). (skill enriched: desktop-computer-use-creative; 2026-09-23)
- [no] VAD/talk-gate before always-on decision spend. (skill enriched: desktop-computer-use-creative; 2026-09-23)
- [no] Verify CU demos before adopt. (skill enriched: desktop-computer-use-creative + video held (; 2026-09-24)

### data/compliance (6)
- [yes] MIMIC data is licensed for research only, not for product use. (fact recorded (ProofCheck); 2026-10-05)
- [yes] PhysioNet DUA prohibits sending MIMIC through third-party APIs, so no MIMIC into hosted LLMs. (fact recorded (ProofCheck); 2026-10-05)
- [yes] MIMIC-IV-Note is discharge summaries + radiology reports only, no nursing notes. (fact recorded (ProofCheck); 2026-10-05)
- [yes] HIPAA de-identification (Safe Harbor or Expert Determination) must remove identifiers from free text too. (fact recorded (ProofCheck); 2026-10-05)
- [yes] Synthea (Apache-2.0) can emit templated clinical notes from a synthetic record, giving a legal harness golden set with ground truth per claim. (EXPERIMENT_CANDIDATE (owner Forge); 2026-10-05)
- [yes] Asclepius synthetic notes are cc-by-nc-sa, so they cannot back a sold product. (dropped (NO-SKILL); 2026-10-05)

### ui/design (4)
- [partial] When agent UI drifts from the reference, generate a first pass from the screenshot with screenshot-to-code, then adapt (tool not named in post). (reviewed 2026-10-08: repo to import-gate: screenshot-to-code; 2026-09-23)
- [no] Homepage 4-ways craft pointer. (skill enriched: landing-page-design; cinematic-site-recipe; ; 2026-09-25)
- [no] Libraries-dev + Dynamic Island + Grok notch/widgets → Shadcn/web island. (skill enriched: ai-product-ui-primitives; ui-compose + video; 2026-09-25)
- [no] Shaders open-sourced 200+ WebGPU components usable in any framework; install only via import gate. (skill enriched (STRENGTHENS mapping): ai-product-ui-primitiv; 2026-10-07)

### business (4)
- [no] SEO as closed checklist + cheap gate. (skill enriched: aeo-answer-ready-audit; 2026-09-23)
- [partial] Sprint through Pain→Promise→Product→Plumbing→Packaging→Proof via existing skill; never rebuild Client Pack or bypass Stripe HITL. (LOCALLY_SUPPORTED (Batch #06 correction lifecycle); maps: sa; 2026-09-23)
- [partial] Mine primary-data pain with collectors; keep understanding human—never start from a generic idea prompt. (LOCALLY_SUPPORTED (Batch #06 correction lifecycle); maps: ai; 2026-09-23)
- [yes] Validate the pain and do marketing before code, pick a boring sticky stack; ARR figures in the video are UNVERIFIED. (full pass A–E; skill enriched: saas-sprint-six-ps; stack-pic; 2026-10-02)

### prompting (2)
- [partial] Wire skills as a graph of small markdown nodes with an index that maps every node and gives execution steps, so the agent follows links instead of reading one flat file. (reviewed 2026-10-08: skill-enrichment proposal: research-sig; 2026-09-23)
- [no] Verbose context dump atom. (skill enriched: voice-ramble-session-context; grill-me-into-; 2026-10-01)

### safety (2)
- [yes] Defend prompt injection at the tool layer: label any session that read untrusted data and block it from writing out; vendor bench numbers UNVERIFIED. (full pass A–E; skill enriched: tool-permission-not-prompt; r; 2026-10-01)
- [partial] A guard mod in front of destructive shell commands (rm -rf, force-push, --no-verify) is the first mod worth building. (EXPERIMENT_CANDIDATE → built in harness Oct 6 (26/26); 2026-10-05)

### news (1)
- [no] Rank weekly AI news by impact rather than hype; vendor model claims in the wrap stay UNVERIFIED. (skill enriched: ai-news-importance-rank; match-model-to-task; 2026-10-02)

## Skill delta (2-month backlog)
Source: `/workspace/research/packets/signals-2mo-backlog-20261010/SKILL_DELTA.md`

# SKILL_DELTA: signals-2mo-backlog-20261010

Every edited file was backed up first to `skill-backups/<slug>.SKILL.md`. All changes are appended sections headed "Enrich 2026-10-10: X-bookmark backlog study" (or a citation line). Nothing was deleted or rewritten. Proofs live in `recreations/`.

## New skills (2)
| skill | why it isn't a duplicate | proof |
|---|---|---|
| `installer-supply-chain-check` | No existing skill covered checking an installer's hash or signature (grep found none). Three independent reports of the CPU-Z/HWMonitor download hijack. Ships `verify_download.py`. | `recreations/supply_chain.proof.json` (match → 0, tampered → 1) |
| `excalidraw-argue-visually` | No diagram skill existed. Source repo `coleam00/excalidraw-diagram-skill` has no licence, so the recipe and `spec_to_excalidraw.py` are our own. | `recreations/excalidraw.proof.json`, `recreations/out.excalidraw` (bound arrows valid; not rendered because renders are off) |

## Enriched skills (17)
| skill | added | proof / status |
|---|---|---|
| agent-harness-loops | plan → fresh-context steps → fail-only verifier; graph structure for long runs; budget-stop on taste assets; delete before automating. Ships `fresh_verifier_loop.py`. | fresh_verifier_loop.proof.json |
| research-signal-to-skills | mine your own STATE/log traces for repeated sequences. Ships `trace_miner.py`. | trace_miner.proof.json (it rediscovered the runner skill) |
| grokbot-harness | routine cadence × context cost (`routine_cost.py`, about 26x); grokbot-field-notes gated; single weekly usage meter | routine_cost.proof.json; meter is a vendor statement |
| ui-compose | fixed colour-step rule (`color_step_lint.py`); artboards before code; ship components with a customisation skill | color_step_lint.proof.json |
| claude-code-mods | prune the system prompt before adding; in-app browser note; MCP-free `tools.py` (print, don't return; `tools_cli_dispatch.py`); Cursor MCP citation | tools_cli_dispatch.proof.json |
| session-bootstrap | RULINGS file; short prompt plus context files; skill/index drift heartbeat (`skill_index_drift.py`) | skill_index_drift.proof.json |
| awesome-skill-import-gate | 43-repo static gate results; skill-finder note; gitingest one-shot digest | REPOS_TESTED.md; gitingest.proof.json |
| landing-page-design | DESIGN.md seed sites; gsap-skills motion rules plus a Higgsfield cost gate; scroll-scrubbed video for fake 3D; style bible plus verifier | gsap-skills static gate; other points are claims |
| tool-permission-not-prompt | Eito calendar-invite MCP hijack, added as a citation to the existing session-label gate | existing I_KVMFrUtPk proof |
| reference-driven-video-production | Seedance/Higgsfield prompting, folded here instead of a new `higgsfield-video` skill (9 bookmarks) | claims only; no paid generations |
| remotion-brief-to-render | Remotion Skills 2.0; HyperFrames frame.md/storyboard first | hyperframes static gate |
| lead-web-find | crawl4ai/markitdown fetch stack; stealth scrapers must pass the gate; outreach with the prospect's own asset needs consent | crawl4ai/Scrapling static gate |
| match-model-to-task | local-model box for low-stakes traffic (BLOCKED: no GPU) | claim |
| primary-bot-routing | chief of staff with activity log and human handback; release ideas at absorb rate | claim (matches the one-face rule) |
| n8n-kit-researcher | AI workflow builder: draft, then review, pin data, test, activate | claim (needs an n8n instance) |
| cheap-read-expensive-decide | cheap model scores and dedupes, code commits | claim |
| golden-test-loop | evidence-driven testing: capture BEFORE while reproducing, then AFTER | matches existing proofs |

## Declined or remapped proposals (from bookmark-review SKILL_PROPOSALS.md, 99 lessons)
- New-skill candidates `higgsfield-video`, `remotion-video`, `outbound-lead-research`, `web-scraping` and `youtube-competitive-research` were remapped into existing skills (above) to avoid duplicates.
- `social-autopost`, `client-onboarding`, `docker-builds` and `self-hosting` each had support 1 with UNVERIFIED claims. They were not created; the items stay PARTIAL ("enrichment proposal not applied").
- Proposals that existing text already covered (Routines and /loop, artifacts calling MCP, MCP token cost, master-note memory consolidation, budget caps, skill index/curator) got no new text.
- 2026-10-10 20:31 ET: one-person-marketing-desk ENRICHED (Don't: hired-UGC views are not demand) from RrPvLrW8iJY, single anecdote.
- 2026-10-10 22:31 ET finisher run (backups in skill-backups/*.bak-20261010-*):
  - agent-harness-loops ENRICHED from v46nTP-XNXc (agent never owns its own grader, blast-radius tiers, repo map, single writer); proof recreations/oracle_lock_gate.sh.
  - wiki-ingest ENRICHED from lTd3DwajYks, znj-WpMj1dI, UuX4zk9jTAg, rajhAtWSU44 (index-first vault, RO/RW/private mounts plus git save points, vault map, "graph ≠ brain" counter-evidence); proof recreations/vault_index.py.
  - local-private-agent-lab ENRICHED from L4UV6b2Xc64 (resale/depreciation, prefill wait on long prompts; 32k tok at 50 tok/s = 640 s checked).
  - cinematic-site-recipe ENRICHED from 60a0nHFefn4 (still first, then start-frame hero video; audience+action brief).
  - host-automations-outside-subscription ENRICHED from IpObINj_FPE and Vt5APRiFBSU (agent builds the hosted automation via MCP, stops at missing connections, end-to-end test).

## 2026-10-11 12:55 ET finisher run
- curated-skill-systems ← HIRDzMtuWFk (save proven scripts in skills, 3-prompt trigger test, smallest durable fix, verify before return). Proof run1230/skill_trigger_test (finding: speed-to-lead-demo shadowed by document-processing-micro-demo's thin description).
- context-before-tokens ← cyIWQHYoUg8 (deterministic code map, push vs pull, blast radius). Proof run1230/code_map.
- software-factory-loop ← AbpyqAfxZ8c (owainlewis/factory label gates, zero-token idle polling, versioned scheduled jobs, worktree trust boundary). Proof run1230/factory_labels.
- grokbot-harness ← dEBMnnJMmCI (signed allowlisted webhook bridge, teach-then-scriptify). Proof run1230/webhook_bridge.
- grok-role-bots-triggers ← w16-JRiCaZ8 (product pods, weekly report rollup, approval-gated growth loop).
- buyable-automation-skus ← XYMcBrFSJ4c (urgent → ping not draft; 7/14/21 invoice ladder). Proof run1230/boring_ops.
- local-private-agent-lab ← illvibK_ZmY (Ollama hub map). No new skills minted; E4gkCE6_xiQ covered by agent-harness-loops.
<!-- END brain-export:auto -->
