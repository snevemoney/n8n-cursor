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
