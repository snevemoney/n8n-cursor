# Forge — RLjaUES9P8A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/RLjaUES9P8A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/RLjaUES9P8A/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **Codex vs Claude Code** bake-off, mid-May 2026. Thesis planted early: not “which tool is best” but **which tool for the use case in front of you**. Shape: Claude Code = customizable workflow system (hooks, auto-spawn sub-agents, `/ultra-plan`, `/ultra-review`, `/loop`, channels, Agent SDK, Bedrock/Vertex/Foundry). Codex = opinionated shipping machine (native worktrees, in-app browser, computer-use QA, `@Codex` GitHub, `/goal`, GPT Image 2). Overlap is huge (local edit, desktop, VS Code, MCP, skills YAML, plugins, cloud, hooks, sub-agents). Philosophy split: OpenAI lets ChatGPT login into Open Claw / Hermes; Anthropic docs forbid third-party Claude.ai login unless approved. Pricing: Claude Pro $20 / Max 5x $100 / Max 20x $200; Codex on ChatGPT free→Pro $200; $100 Codex promo 2× through May 31 UNVERIFIED. Context: Opus/Sonnet 1M vs GPT ~256k. Live same-prompt three: SMB automation research PDF, Glido landing, fake-data marketing dashboard. Desktop apps. Models: Codex GPT-5.5 high vs Claude Opus-4.7 high. Metrics from session JSONL. Mid-video insert: Claude shipped `/goal` after he recorded the Codex-only claim. Caption-only: visual/click UNKNOWN. Tape $ / token counts UNVERIFIED. Claude / Codex / ChatGPT / Open Claw / Hermes / Skool on-tape.

## B. Atomic Knowledge

### Use-case, not champion; overlap is larger than comparison videos admit
- **Claim:** After heavy use both tools, the question is which workflow for how you want to work. Feature-list videos stop too early.
- **Reasoning:** Both edit local, desktop, VS Code, MCP, skills, plugins, cloud, hooks, sub-agents. “Does it have X” is the wrong question.
- **Mechanism:** Plant thesis first; then unique depth; then same-prompt bake-off; then gut feel (creative vs obedient).
- **Evidence:** Three live builds; neither swept.
- **Conditions:** Mid-May 2026. Models under the harness drive most of the score.
- **Exceptions:** New model drops change numbers. He says re-check docs in 3 months.
- **Action:** Steal the use-case split. Do not install Claude/Codex/Open Claw. Do not quote tape $ as FACT.
- **Confidence:** high on the thesis; numbers UNVERIFIED.
- **Source:** `RLjaUES9P8A` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN (caption-only)
- **Failed / retried:** none on the comparison spine
- **Speech ≠ behavior:** none

### Claude = shapeable system; Codex = shipping pipe
- **Claim:** Claude: ~30 hook events vs Codex ~6; Claude auto-spawns sub-agents, Codex docs say only if asked. Claude: `/ultra-plan` (cloud plan + inline comments → terminal exec), `/ultra-review` (multi-agent review; 3 free then billed), `/loop` (schedule or maintenance), channels (Telegram/Discord/iMessage into a running session), Agent SDK, enterprise auth. Codex: native worktrees per thread, review/stage/commit/push in one desktop, in-app browser + visual comments, polished computer-use QA (severity, expected vs actual, repro, triage), `@Codex` mention → cloud sandbox zero setup, `/goal` (verifiable stop, hours), GPT Image 2 in-app.
- **Reasoning:** Claude is a workflow you shape. Codex is an opinionated machine from “agent done” to “shipped.”
- **Mechanism:** Worktrees = parallel copies so tasks don’t overwrite. Codex browser lives in the desktop; Claude-in-Chrome is a Chrome extension.
- **Evidence:** Feature walk + mid-tape Claude `/goal` ship (he recorded Codex-only, then both have it).
- **Conditions:** Ultra commands research preview. `/goal` was experimental/flagged on Codex.
- **Exceptions:** Same capability often exists on both if you stitch (Ralph Wiggum, Karpathy auto-research, `/loop`).
- **Action:** Steal the *shape* distinction. Do not install either as hive brain.
- **Confidence:** high on the contrast; feature counts UNVERIFIED.
- **Source:** `RLjaUES9P8A` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Claude `/goal` insert after record
- **Speech ≠ behavior:** claimed Codex-only `/goal`, then Claude shipped it

### Third-party harness economics + subscription vs API
- **Claim:** OpenAI CEO tweet May 2: sign into Open Claw with ChatGPT. Anthropic Agent SDK page: no third-party Claude.ai login/rate limits unless approved. Both agents ride parent subscriptions (no separate API key to start). Community hitting Claude session/weekly limits faster; he *felt* more work in Codex before limit.
- **Reasoning:** If you live in Open Claw/Hermes, ChatGPT login changes the bill. Raw context window is less important than how fast you hit the cap.
- **Mechanism:** Subscription usage ≈ session limit; he still computed API-equivalent $ from tokens.
- **Evidence:** Gut + community complaints; bake-off token charts.
- **Conditions:** Promo windows expire. Tape $ UNVERIFIED.
- **Exceptions:** Dual-sub if you want both shapes.
- **Action:** Do not install Open Claw/Hermes. Do not treat ChatGPT login as hive path.
- **Confidence:** medium (policy + promo dated).
- **Source:** `RLjaUES9P8A` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none
- **Speech ≠ behavior:** none

### Same prompt, different winners; ask the JSONL
- **Claim:** Research PDF: Codex 9p tables vs Claude 15p story; he’d send Codex to a client by a small margin. Landing: Claude design win (forgot logo; wrong sliding logos — one-prompt fix). Dashboard: Claude visual + ~4× faster (~2 min vs ~8) and ~6× fewer tokens (~283k vs ~1.64M) UNVERIFIED. Across three: Claude more output tokens (2–5×); Codex leaner output (output $ higher on GPT-5.5 but he still spent less). Totals ~6M tokens both; Claude wall-clock ~15 min vs Codex ~26 (outlier). Ask the agent to read its session JSONL for time/tokens/cache.
- **Reasoning:** Claude plans tight then executes; Codex grinds iterations (input tokens stack). Front-end/design → Claude. Research/structured docs → Codex. Gut: Claude creative/pushback; Codex obeys + reviews.
- **Mechanism:** Portable folders. `claude.md` ↔ `agents.md`. Clone or say “I built this in X, you are Y, walk it.”
- **Evidence:** Side-by-side; he did not verify PDF facts.
- **Conditions:** GPT-5.5 high vs Opus-4.7 high. Next model drop invalidates numbers.
- **Exceptions:** He usually finds Codex faster; this bake-off Claude was faster — he said so.
- **Action:** Steal use-case routing + JSONL pull. Do not quote $11/$7 as FACT.
- **Confidence:** high on method; metrics UNVERIFIED.
- **Source:** `RLjaUES9P8A` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** Claude landing missing logo
- **Speech ≠ behavior:** “typically Codex faster” vs this run Claude faster

## C. Mental Models
The field wants a winner. He wants a **job in front of you**. Claude = brainstorm / plan / pushback / custom hooks. Codex = execute / review / ship / images. You are making files in folders; you are not locked. Architecture holds; numbers rot. Gut feel after hours matters even without KPIs.

## D. Procedures
1. Do not install Claude Code, Codex, Open Claw, Hermes, ChatGPT as hive. Cursor + Grok only.
2. Do not quote tape $ / token counts / promo as FACT.
3. If the job is complex front-end, deep plan, auto-delegation, hooks/skills/channels, Agent SDK, Bedrock/Vertex → he reaches Claude.
4. If the job is web research, structured PDF, one-window worktrees+ship, long `/goal`, `@` on GitHub, in-app images → he reaches Codex.
5. Plan in one, execute/review in the other is a field pattern he endorses.
6. To move: open the same repo, tell the new agent what built it, swap `claude.md`/`agents.md`.
7. To meter a session: ask the agent to read its JSONL.
8. Re-check docs if watching later than mid-May 2026.
9. Do not send Skool. Do not farm likes.

## E. Examples
**Situation:** Same Glido landing prompt.  
**Action:** Both desktop apps.  
**Reasoning:** Design quality is the score.  
**Outcome:** Claude base better; forgot logo; wrong partner logos.  
**Lesson:** One-prompt fix ≠ lose the bake-off; judge the base.

**Situation:** Dashboard.  
**Action:** Same required elements, fake data.  
**Reasoning:** Interactivity + polish.  
**Outcome:** Both functional; Claude darker/cleaner; Codex cheaper-looking; Claude much faster/leaner this run.  
**Lesson:** Harness + model; n=3 is not a law.

**Situation:** Research PDF, no API keys.  
**Action:** Native web fetch/search.  
**Reasoning:** Research-heavy.  
**Outcome:** Codex tables, 9p, fewer tokens; Claude story, 15p. He’d send Codex.  
**Lesson:** He did not verify facts. Taste ≠ truth.

**Situation:** Finished Codex `/goal` section.  
**Action:** Claude shipped `/goal`.  
**Reasoning:** Comparison videos rot in hours.  
**Outcome:** Inserted correction.  
**Lesson:** Capability exists on both; packaging differs until it doesn’t.

## F. Decision Rules
- IF the question is “which is best” → refuse; ask the job.
- IF you already pay for one → you already have a top agent; dual-sub is optional.
- IF you live in third-party harnesses → tape says ChatGPT login is allowed, Claude login is not (as taped).
- IF hitting Claude limits weekly → he felt Codex lasted longer (UNVERIFIED).
- IF front-end polish → Claude this bake-off.
- IF structured research doc → Codex this bake-off.
- IF watching in 3 months → re-read docs; keep the architecture.
- IF moving tools → portable folders, not rewrite.

## G. Contrarian
Comparison YouTube lists features and crowns a winner. He says overlap is huge, `/goal` shipped on both mid-edit, and the honest take is a split. Field assumes lock-in; he says markdown in git is portable.

## H. Assumptions
Subscriptions + models as taped mid-May 2026. n=3, one outlier. He did not read the PDFs for truth. Promo and hook-event counts UNVERIFIED. Falsifier: next Opus/GPT drop. Hive does not install either. Clients parked.

## I. Questions
Does Claude still auto-spawn while Codex requires ask? Do thought-level / hook counts still hold? Is the OpenAI third-party login still endorsed? Would 100 runs separate the scatter?

## J. Connections
SYSTEM SYNTHESIS: `2J3uX8iRNng` local bake-off + verify-until-done. `xJ5oz63mIec` WAT + which runner. `ZRb7D6R64hM` Claude levels. `e18sdZLwP7o` sub-agents. Do not install Claude/Codex. Cursor + Grok.

## K. Future-Use
Use-case routing. JSONL session pull. Portable `md` swap. Feature-list videos expire; architecture (shape vs ship) may hold.

## Steal / Operate-never

### Machine: same-prompt bake-off → use-case route; folders are portable
- **Epistemic:** SOURCE
- **Workflow / loop:** plant thesis → unique depth → 3 identical prompts → JSONL metrics → route by job (plan/design vs execute/docs) → if moving, tell the other agent to walk the repo
- **Questions / signals:** What is the job in front of me? Do I need pushback or obedience? Will I hit a weekly cap? Is this front-end or research?
- **Qualify / frame / objections:** “Which is best” is the wrong frame. n=3 + model-under-harness. Numbers rot.
- **Procedure:** No Claude/Codex/Open Claw install. No tape $ as FACT. No Skool. Re-check docs after mid-May 2026.
- **Example that proves it:** Dashboard Claude ~2 min / ~283k vs Codex ~8 min / ~1.64M UNVERIFIED; landing Claude base + missing logo; PDF he’d send Codex; `/goal` shipped on Claude mid-edit.
- **Why it works:** Overlap is real; packaging and default behavior differ; files in git are not a vendor.
- **Conditions / exceptions:** Mid-May 2026. Next model drop. He usually finds Codex faster — this run Claude was.
- **Operate-never payload:** Install Claude/Codex/ChatGPT/Open Claw/Hermes; quote $20/$100/$200/promo as FACT; send Skool; swap hive brain.
- **Hive run:** none. Cursor + Grok. Deploy HITL.
- **Source:** `RLjaUES9P8A` @ UNKNOWN

### Operate-never
- Do not install Claude Code, Codex, ChatGPT, Open Claw, Hermes.
- Do not quote tape prices, token totals, or “2× promo” as FACT.
- Do not send Skool or farm likes.
- Do not treat this bake-off as a hive-brain swap.
- Clients parked. Deploy HITL.

## L. Role-Specific Applications
Forge keeps the **use-case split** and the **JSONL pull**. We do not install either harness. If we ever compare runners, same prompt + session log, n bigger than 3, tape $ stays UNVERIFIED. Portable-folder mindset already matches Cursor + Grok. No Skool. No dual-sub pitch.
