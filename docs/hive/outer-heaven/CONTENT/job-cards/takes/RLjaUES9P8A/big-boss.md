# Big Boss — RLjaUES9P8A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/RLjaUES9P8A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/RLjaUES9P8A/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 26:34, 7082 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: PDF pages, two landing pages, two dashboards, scatter plot, raw token tables, desktop-app chrome.

Beats, in order:

1. Frame: OpenAI looked “mid”; people forgot it for Claude Code; recent videos say Codex is better. He used Codex ~a month. Honest pick at the end.
2. Claude Code gist: task → plan → edit files → run commands → ask permission. Terminal, VS Code, desktop, web preview. Opus/Sonnet/Haiku. Skills, hooks, sub-agents. “Workflow system you shape.”
3. Codex gist: not 2021 Codex. Terminal, desktop, VS Code/Cursor, cloud. GPT family + GPT-Codex + Spark (pro preview). “Opinionated machine” from done → shipped. Native git worktrees. On every ChatGPT plan including free; Claude Code is not free.
4. Thesis planted early: which tool for the use case in front of you. Gut (no KPI): Claude more creative, pushes back; Codex follows instructions, sharper at review/bugs.
5. Overlap: local edits, desktop, VS Code, CLI, MCP, same skills markdown+YAML, plugin marketplace, cloud delegation, hooks, sub-agents. Stop asking “does it have X.”
6. Claude-better list: ~30 hook events vs ~6; auto-spawn sub-agents (Codex docs: only if you ask); `/ultra plan` + `/ultra review` (research preview; 3 free on pro/max then billed); `/loop` maintenance; channels (Telegram/Discord/iMessage into a session); Agent SDK; enterprise auth (Bedrock/Vertex/Foundry).
7. Mid-tape interrupt: Claude just shipped `/goal` too. Capability parity note.
8. Codex-better list: worktrees + review/stage/commit/push in one app; in-app browser + visual comments (vs Claude-in-Chrome extension); computer-use QA (severity, expected vs actual, repro, triage); `@Codex` on GitHub issues/PRs → cloud sandbox; `/goal` with a verifiable stop (hours); GPT Image 2 in-app (Anthropic has no image model).
9. Philosophy split: OpenAI lets ChatGPT login route through OpenClaw/Hermes (Altman tweet May 2). Anthropic docs: no third-party Claude.ai login unless approved. Economics change if you live in those harnesses.
10. Pricing (all UNVERIFIED): Claude Pro $20 / Max 5× $100 / Max 20× $200. Codex on ChatGPT free → Plus $20 → Pro $200. $100 OpenAI tier 2× Codex through May 31. Context: Claude 1M vs GPT ~256k. Community hitting Claude session/weekly limits faster; he feels he gets more work done in Codex before the wall.
11. Live test: same three prompts, both desktop apps, no extra API keys (native web fetch/search). (1) branded SMB automation research PDF (2) Glido landing page from the real site (3) fake-data marketing dashboard. Models: Codex GPT-5.5 high vs Claude Opus-4.7 high.
12. Artifacts: Claude PDF 15pp story-like, hard-to-read title, better header/ToC, picks Zapier/Lindy/Make. Codex PDF 9pp tables, better title spacing, square logo, picks Zapier/Lindy/Relay. He did **not** verify facts. Landing: Claude wins design (forgot logo; wrong partner logos — “easy fix”). Dashboard: both functional; Claude looks better.
13. Metrics he pulled from session JSONL: totals ~26 min Codex vs ~15 min Claude; ~6M tokens each; Claude cost more on API-equivalent (output tokens 2–5×). Dashboard: Claude ~2 min / ~283k tokens vs Codex ~8 min / ~1.64M. Research: Codex faster + fewer tokens (~2.8M vs ~4.7M). Landing: Codex 3:00 vs Claude 4:39. Scatter: Claude more variance; Codex a tight middle bundle. He notes Claude’s 2-min dashboard skewed “Claude is faster”; his prior gut was Codex is usually faster.
14. Honest split: not a sweep. Claude for complex frontend, visual polish, deep planning, auto-delegation, hooks/skills/channels, Agent SDK, Bedrock/Vertex. Codex for research/PDF, unified ship app, `/goal`, `@Codex`, in-workflow images. Practice: plan/brainstorm on Claude, execute/review on Codex.
15. Portability: files in folders → GitHub. Open the other agent; say walk this and update. `claude.md` ↔ `agents.md`. Mid-May 2026 snapshot; re-check docs in 3 months. Free Skool resource guide. Like/CTA.

Off-topic / not skipped: OpenClaw/Hermes as third-party harnesses; Ralph Wiggum / Karpathy auto-research as Claude `/goal` analogs; Glido as a prop brand; Zapier/Lindy/Make/Relay as PDF picks; Plus/Skool close.

## B. Atomic Knowledge

### Which tool for the job in front of you
- **Claim:** The question is not which agent is best. It is which one fits this task.
- **Reasoning:** Feature lists converge. Feel and packaging diverge. He plants this before the bake-off.
- **Mechanism:** Same three prompts, two desktop apps, judge the artifact + tokens/time.
- **Evidence:** Thesis at the open and the close. “Not a clean sweep.”
- **Conditions:** Mid-May 2026 models (GPT-5.5 vs Opus-4.7). Next model drop changes the numbers.
- **Exceptions:** Some people just pick one and stay. He allows disagreement.
- **Action:** Name the job before naming the vendor. We already have Cursor + Grok — do not add a second coding OS from a bake-off.
- **Confidence:** high as his doctrine
- **Source:** `RLjaUES9P8A` @ UNKNOWN — “which tool is best for the specific use case that is currently sitting in front of you”
- **Epistemic:** SOURCE

### Overlap is large; stop shopping feature X
- **Claim:** Both edit local files, have desktop/VS Code/CLI, MCP, skills format, marketplaces, cloud delegation, hooks, sub-agents.
- **Reasoning:** Comparison videos that only list features lie by omission.
- **Mechanism:** He lists the shared set, then diverges on shape.
- **Evidence:** Mid-tape Claude ships `/goal` after he recorded Codex-only `/goal`.
- **Conditions:** 2026 agent-harness generation.
- **Exceptions:** Image gen is still Codex-native; Claude needs a third party.
- **Action:** Ask “what workflow do I want,” not “does it have worktrees.”
- **Confidence:** high
- **Source:** `RLjaUES9P8A` @ UNKNOWN — “the overlap is way bigger than most comparison videos admit”
- **Epistemic:** SOURCE

### Claude is a shapable workflow system; Codex is a shipping machine
- **Claim:** Claude = hooks/skills/sub-agents you build out. Codex = tighter path from agent-done to code-in-prod (worktrees, in-app review, push).
- **Reasoning:** Different opinions on how work should flow, not different species.
- **Mechanism:** 30 vs ~6 hook events; auto vs explicit sub-agents; one-window ship vs Chrome extension.
- **Evidence:** His words: “workflow system” vs “unified shipping vibe.”
- **Conditions:** Desktop-app experience; both improving.
- **Exceptions:** Claude can worktrees too; Codex just feels more native.
- **Action:** Steal the two shapes. Do not install either. Hive already has 17 named desks instead of auto-spawned sub-agents.
- **Confidence:** high as his framing
- **Source:** `RLjaUES9P8A` @ UNKNOWN — “less of a tool, and it’s more of a workflow system” / “opinionated machine”
- **Epistemic:** SOURCE

### Gut feel is allowed if you say it is not a KPI
- **Claim:** Claude brainstorms and pushes back. Codex obeys and finds holes. No hard metrics on that feel.
- **Reasoning:** After many hours the feel started to matter more than the feature grid.
- **Mechanism:** He flags it as gut, then uses it in the final pick rule.
- **Evidence:** “none of that is backed by like hard, specific metrics.”
- **Conditions:** His month of Codex + long Claude use. Survivorship.
- **Exceptions:** Bake-off numbers sometimes contradict the gut (Claude was faster on all three here).
- **Action:** Keep feel labeled. Do not promote gut to FACT.
- **Confidence:** medium (his), high that he labeled it
- **Source:** `RLjaUES9P8A` @ UNKNOWN — “just like the gut feeling”
- **Epistemic:** SOURCE

### Same prompt, two harnesses, judge the artifact
- **Claim:** He ran one research PDF, one landing, one dashboard — identical prompts, both desktop apps.
- **Reasoning:** Feature lists are where most videos stop. Artifacts decide.
- **Mechanism:** Native web fetch/search; no extra keys. Side-by-side open.
- **Evidence:** Claude forgot the Glido logo; Codex put it on. Both dashboards filter. He picks Claude’s look, Codex’s PDF by a small margin.
- **Conditions:** One run each. No rewrite loop on tape except “easy fix” talk.
- **Exceptions:** He did not read/verify PDF facts. Logo/icon errors would be a second prompt.
- **Action:** `golden-test-loop` on the artifact, not the blog. One eval set before a model conversation.
- **Confidence:** high for the method; medium for the winners (n=1)
- **Source:** `RLjaUES9P8A` @ UNKNOWN — “the exact same three prompts”
- **Epistemic:** SOURCE

### He did not verify the research facts
- **Claim:** Both PDFs have clickable sources. He will not read and verify the facts.
- **Reasoning:** Time. He is scoring layout and shape, not truth.
- **Mechanism:** “I just don’t really feel like doing that right now.”
- **Evidence:** On-tape skip. Localhost links do not click through; browser does.
- **Conditions:** Demo scoring, not a client deliverable.
- **Exceptions:** He still says he would send Codex’s PDF to a client “by a small margin.”
- **Action:** Watchdog does not accept “looks like a report.” Facts stay unchecked = not done.
- **Confidence:** high that he skipped
- **Source:** `RLjaUES9P8A` @ UNKNOWN — “I’m not going to read and verify all of these facts”
- **Epistemic:** SOURCE

### Underlying model is the hidden variable
- **Claim:** Harness name ≠ performance. GPT-5.5 high vs Opus-4.7 high drove tokens, cost, and feel.
- **Reasoning:** Next Opus/GPT drop would move the scatter.
- **Mechanism:** He shows OpenRouter-style unit prices ($5/M input both; GPT output $5 more) then notes GPT wrote far fewer output tokens so Claude “cost” more.
- **Evidence:** Subscription user — he was not billed $11 vs $7; those numbers are API-equivalent / limit-burn. **$ UNVERIFIED.**
- **Conditions:** These two models, these three jobs.
- **Exceptions:** His prior gut (“Codex is faster”) lost this sample.
- **Action:** Score the model+job pair. Do not crown a harness.
- **Confidence:** high as a warning
- **Source:** `RLjaUES9P8A` @ UNKNOWN — “performance is going to be determined by the underlying model that is powering the harness”
- **Epistemic:** SOURCE

### Ask the agent to read its own JSONL
- **Claim:** Session logs already have time, tokens, cache reads. He asked each tool to parse its JSONL.
- **Reasoning:** That is how the scatter and the per-experiment tables exist.
- **Mechanism:** “just ask it to read the JSONL and pull that data.”
- **Evidence:** Totals and the efficiency plot.
- **Conditions:** Desktop sessions that write JSONL.
- **Exceptions:** Preview limits (Codex desktop would not open PDFs in-app).
- **Action:** Receipts from the log, not vibes. Cheap read.
- **Confidence:** high
- **Source:** `RLjaUES9P8A` @ UNKNOWN — “ask either Claude Code or Codex to read its JSONL”
- **Epistemic:** SOURCE

### Plan with one brain, execute/review with another
- **Claim:** A common pattern he endorses: Claude for planning/strategy, Codex to review or execute the plan.
- **Reasoning:** Matches the gut: pushback vs obedience.
- **Mechanism:** Portable repo; open the other agent; “walk through it.”
- **Evidence:** Closing advice, not a timed experiment.
- **Conditions:** You already pay for both — he thinks there is value in two subs. **$ UNVERIFIED.**
- **Exceptions:** Frontend-heavy work he would keep on Claude through build.
- **Action:** Steal the split (expensive plan, cheaper/obedient execute). Do not buy both from this tape.
- **Confidence:** medium as a rule; high that he said it
- **Source:** `RLjaUES9P8A` @ UNKNOWN — “planning and brainstorming… with Claude Code and then bringing in Codex”
- **Epistemic:** SOURCE

### Skills live in portable folders
- **Claim:** You are making files in folders. GitHub is the lock-pick. `claude.md` becomes `agents.md`. The new agent figures out the rest.
- **Reasoning:** Six months on one harness is not a marriage.
- **Mechanism:** Clone or open; one prompt to remap.
- **Evidence:** Closing mindset. Mid-May 2026 — re-check numbers in 3 months; architecture may hold.
- **Conditions:** Project is already on disk.
- **Exceptions:** Third-party harness login rules (OpenClaw) still differ by vendor.
- **Action:** Keep hive skills in the repo. Do not treat a vendor app as the source of truth.
- **Confidence:** high
- **Source:** `RLjaUES9P8A` @ UNKNOWN — “portable skills inside portable folders”
- **Epistemic:** SOURCE

### Third-party harness login is an economics fork
- **Claim:** OpenAI publicly allows ChatGPT login inside OpenClaw/Hermes. Anthropic forbids third-party use of Claude.ai login/limits unless approved.
- **Reasoning:** If you live in those wrappers, Codex is the cheaper path (no separate API key).
- **Mechanism:** Altman tweet May 2 (on tape). Anthropic Agent SDK page quote.
- **Evidence:** He bets ChatGPT subs spiked. Unverified.
- **Conditions:** People already in OpenClaw/Hermes.
- **Exceptions:** Solo hive is not in those wrappers.
- **Action:** Operate-never those harnesses. Keep the fork as a “vendor TOS is part of the price” lesson.
- **Confidence:** high that he described the fork
- **Source:** `RLjaUES9P8A` @ UNKNOWN — “using your Claude subscription inside of a third-party tool… isn’t allowed”
- **Epistemic:** SOURCE

## C. Mental Models

- **Use-case first, vendor second.** Thesis he repeats. **SOURCE**
- **Shape over feature count.** Customizable system vs shipping machine. **SOURCE**
- **Gut is data if labeled.** Feel after hours, not a benchmark. **SOURCE**
- **n=3 is a demo, not a science.** He wants 100 runs to see the lines. **SOURCE**
- **Harness ≠ model.** Next Opus/GPT rewrite the scatter. **SOURCE**
- **Portable folders beat loyalty.** **SOURCE**
- **“Codex is back” is a comeback narrative.** Title physics, not our stack decision. **INFERENCE**

## D. Procedures

1. **Name the job** (research PDF / visual frontend / long execute / review).
2. **Do not start from a feature matrix.** Assume overlap.
3. **Same prompt, two runs** if you are actually comparing. One artifact each.
4. **Score the artifact** (layout, function, missing logo). Do not skip fact-check if it will be sent.
5. **Pull JSONL** for time/tokens. Label $ UNVERIFIED if subscription-billed.
6. **Separate model from harness** in the write-up.
7. **Pick for this job.** Optional: plan on the pushback brain, execute on the obedient one.
8. **Keep the repo portable.** Rename the instruction file; do not rewrite the work.
9. **Re-check docs in 90 days.** Research-preview commands graduate or die.
10. **Qualify / frame:** creator bake-off, not a hive stack RFP. Glido/Chipotle-style props.
11. **Objections:** “Codex is better now” — answer with n=1, unverified $, and skipped facts.
12. **Avoid:** installing Claude/Codex/OpenClaw; quoting $20/$100/$200 as ours.
13. **When to change:** if the job is send/deploy, stop. HITL.

## E. Examples

**Situation:** Same Glido landing prompt, two desktop apps.  
**Action:** He opens both pages side by side.  
**Reasoning:** Look is the product for this job.  
**Outcome:** Claude wins base design; forgot the logo; partner icons wrong. Codex has the logo, flatter sections.  
**Lesson:** First-pass visual winner ≠ finished. Implicit rule: “easy fix” is still a second loop.

**Situation:** He needs numbers for the YouTube recap.  
**Action:** Each agent reads its JSONL.  
**Reasoning:** Session logs beat memory.  
**Outcome:** Scatter + per-job tokens. Claude dashboard cheap/fast; Codex research leaner.  
**Lesson:** Ask the worker for its own receipts. Implicit rule: gut can lose a sample.

**Situation:** Someone asks which tool to subscribe to.  
**Action:** He lists buckets, then says keep an open mind; folders move.  
**Reasoning:** Tools ship weekly.  
**Outcome:** Skool guide + “double-check in 3 months.”  
**Lesson:** Architecture > this week’s price. Implicit rule: a bake-off is a snapshot.

## F. Decision Rules

- If the job is visual/frontend/planning → he reaches for Claude. We reach for Cursor + Grok and still score the look.
- If the job is structured research/PDF/review → he reaches for Codex. We still fact-check.
- If you only have a feature list → you do not have a comparison.
- If facts were not read → the PDF is not client-ready.
- If a command is research preview → do not build a company on it.
- Optimize: one job, one scored artifact.
- Refuse: install either harness; OpenClaw; quote tape $ as FACT; new hunt.

## G. Contrarian

- Against “one king LLM”: he refuses a forever winner.
- Against feature-matrix YouTube: overlap first, then shape.
- Against loyalty to six months of Claude: portable folders.
- Against his own prior gut (Codex faster): this sample said Claude.
- Field assumes you must pick a side. He says some people should run both — we do not buy both.

## H. Assumptions

**His:** Desktop apps are the fair arena; native web search is enough; n=3 teaches; two subscriptions can be rational; OpenClaw economics matter to his audience; Skool guide is the conversion.

**Ours:** Captions complete enough (7082 words). Visual quality of pages/PDFs **UNVERIFIED** (not seen). All $ / token totals / 2× promo / 1M vs 256k = **UNVERIFIED**. Domain-specific: coding-agent shopping, not Path A.

**Falsifiers:** 100-run scatter flips the winners. PDF facts are wrong and a client would have been burned. Next model drop erases the shape difference. Portable-folder swap is not actually cheap.

**Disagreement (keep labeled):** Hive will not operate Claude Code, Codex, OpenClaw, or ChatGPT. The **use-case-first**, **same-prompt bake-off**, **JSONL receipts**, and **portable folder** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Would a second run of each prompt flip the visual winners?
- What is in the JSONL that he did not read aloud?
- Did either PDF cite real, working sources?
- How much of “Codex follows instructions” is GPT-5.5 vs the harness?
- Sibling “100 hours” claim in the title vs “past month” in the open — not reconciled on tape.

## J. Connections

- **SYSTEM SYNTHESIS** → `golden-test-loop` (same prompt, score the artifact).
- **SYSTEM SYNTHESIS** → `click-live-site` (he still had to open pages; Codex in-app browser is the analog).
- **SYSTEM SYNTHESIS** → `competitive-teardown` (two channels, same job).
- **SYSTEM SYNTHESIS** → `wiki-ingest` (portable instruction files).
- **SYSTEM SYNTHESIS** → `interview-to-desk` (named specialists vs auto-spawned sub-agents).
- **SYSTEM SYNTHESIS** → `ask-principal` (any subscribe/install).
- Do not force a Path A client out of Glido.

## K. Future-Use

- JSONL-as-receipt for Watchdog (unassigned).
- `/goal` verifiable stop as a Forge “done” analog (unassigned).
- In-app QA severity/repro as a computer-use pattern (unassigned).
- TOS/login fork as Money Desk “price includes the wrapper” (unassigned).
- 90-day re-check reminder for Librarian (unassigned).

## Steal / Operate-never

### Machine: Name the job → same prompt twice → score the artifact + JSONL → keep the repo portable
- **Epistemic:** SOURCE (bake-off) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (someone says “switch to X”) → name the job → assume feature overlap → run the same prompt on the current stack (and only then on a candidate) → open the artifact → fact-check if it will leave the building → pull session receipts → label $ UNVERIFIED → pick for this job → do not marry the harness → instruction file stays in the repo.
- **Questions / signals:** “What is the job in front of us?” “Did we score the file or the blog?” “Did anyone read the facts?” “Is this the model or the harness?”
- **Qualify / frame / objections:** Bake-off tape, not an RFP. “Codex is back” is the magnet. Objection: we need both subs — answer: Cursor + Grok; two paid coding OS is a yes from Evens only.
- **Procedure:** D steps 1–9. Checkable stops: (1) job named, (2) artifact opened, (3) facts checked or explicitly parked, (4) receipts pulled, (5) no vendor install.
- **Example that proves it:** Same dashboard prompt — Claude ~2 min / 283k tokens, Codex ~8 min / 1.64M; both work; he still picks Claude’s look. Lesson: time, tokens, and taste can split.
- **Why it works:** Features converge; artifacts do not. Gut without a log lies. Folders move. Conditions: one operator, same prompt, n is small. Exceptions: he skipped PDF verification; title “100 hours” vs “past month.”
- **Conditions / exceptions:** Cursor + Grok only. Claude Code / Codex / ChatGPT / OpenClaw / Hermes / Skool stay on tape. Clients parked.
- **Operate-never payload:** Install either harness; auto-ship the landing; quote $20/$100/$200 / 6M tokens / 2× promo as FACT; OpenClaw; new hunt.
- **Hive run (existing skills only):** `golden-test-loop` · `click-live-site` · `competitive-teardown` · `wiki-ingest` · `slice-build` (one page, not two OS) · `ask-principal` (any subscribe) · `agent-job-card` (owns/never).
- **Source:** `RLjaUES9P8A` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Claude Code / Codex / ChatGPT / OpenClaw / Hermes
- Auto-ship a first-pass landing or unverified PDF
- Quote $20 / $100 / $200 / 2× / 6M tokens / “100 hours” as FACT
- New `icp_id` / unpark Normand / coding-agent hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not pick a new coding religion from a YouTube scatter plot.

- **Done** on this slice: the job is named and the artifact is scored. Not a Codex install. Not a second subscription.
- **Delegate without being asked:** Watchdog pulls receipts; Forge rejects “easy fix later” as done; Creative scores look; I do not open a Claude vs Codex lane.
- **Skeptical review:** “Biggest comeback” is the cold open. n=3, facts unread, $ UNVERIFIED. I will not approve a stack swap because GPT Image 2 lives in the app.
- **One system this take:** one eval set before any model conversation. Not a 30-hour dual-harness shop.
- Live hunt stays parked. I do not rotate to “AI coding agency” because a Glido page slapped.
