# Creative Studio — e18sdZLwP7o
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/e18sdZLwP7o/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/e18sdZLwP7o/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: **Build Claude Subagents Better Than 99%**. Caption-only. Visual/click UNKNOWN. Beats: five personas review his book (Linda 58 beginner / David 52 COO / etc.) — score **~8**; main = orchestrator, subs report only to main; **context stay clean** (status ~48k / 5%); Fireflies research on **Haiku** while main is Opus; built-in (explore/plan/research, auto) vs **custom = `.claude/agents/*.md`** same shape as skills (YAML + body); progressive disclosure = name/description only until fire; description = trigger (misfire = should/shouldn’t); tools / disallowed / MCP / skills / color / model / memory; skill vs sub = **same SOP, sub has clean window + parallel + cheaper model**; project vs global; `/agents` generate “plan roaster” (read-only, Haiku, pink, project memory) — Claude dumps a fat description, he **trims**; ice-cream $20 / no fridge: **roast skill** fires first (skill can spawn 5 general subs); unclosed YAML quotes = mechanical miss; explicit “use plan roaster not roast skill” → **22.8k on sub, main stays thin**; specialists not mega-assistant; awesome-claude-code-subagents GitHub — **scan for prompt injection**, read-only verifier; Opus boss + Haiku workers; max-turns; use if pile you’ll never reread / many files / wall of output / repeat / parallel / unbiased fresh; skip if sequential, need to talk to you, or agents must talk (that’s teams); Opus 4.8 **dynamic workflows** (later trigger **ultra code**) — 41 and **210** subs ate session limit. Claude / Codex / Skool on tape.

## B. Atomic Knowledge

### Description is the trigger; body is the work
- **Claim:** Front matter decides fire/misfire. Long Claude-generated descriptions waste disclosure. Trim to “when / phrases.”
- **Evidence:** “the more precise that your descriptions are, the more often Claude Code will actually trigger them, and you won’t get misfires.” He deletes the generated blob.
- **Conditions:** Custom agents/skills.
- **Exceptions:** Mechanical YAML break (unclosed quotes) looks like a judgment miss.
- **Action:** After a miss, ask why it didn’t fire; rewrite description — do not install Claude.
- **Confidence:** SOURCE.
- **Source:** `e18sdZLwP7o` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN (caption-only)
- **Failed / retried:** Roast skill beat plan-roaster; unclosed quotes.
- **Speech ≠ behavior:** He built a roast skill that already spawns five subs — collision is his own stack.

### Sub = specialist with a clean desk
- **Claim:** Main stays the talk track. Subs eat the 300-page pile and return three facts. Skills run in-main; they can still call subs.
- **Evidence:** “22.8K tokens did not pollute our main session”; “each AI be a specialist.”
- **Conditions:** Research, chapter review, cheap read.
- **Exceptions:** Sequential 1-2-3-4; need user Qs; agents must talk (teams, more $).
- **Action:** If you will never reread the pile → delegate.
- **Confidence:** SOURCE.
- **Source:** `e18sdZLwP7o` @ UNKNOWN
- **Epistemic:** SOURCE

### Prompt ≠ permission
- **Claim:** “Don’t send” is weaker than no send-tool. Assume if it can touch, it will. Read-only verifier for borrowed markdown.
- **Evidence:** “if my AI could touch data or could read data, I have to assume that it will.” Open-source injection warning.
- **Conditions:** MCP / tools on a sub.
- **Exceptions:** none on tape.
- **Action:** Disallowed tools on critics; never auto-send.
- **Confidence:** SOURCE.
- **Source:** `e18sdZLwP7o` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Progressive disclosure is token hygiene. Color is a UI label, not a personality. Global = yours across repos; project = ships with the repo. Dynamic/ultra-code can spawn tens–hundreds and burn the session. Force-subs can make worse work. Yes-man models need an adversarial specialist.

## D. Procedures
1. Decide project vs global.
2. Name + tight description + model + tools/disallowed + memory.
3. Trim generated YAML.
4. Test fire; on miss, read description vs prompt (and check quotes).
5. If skill and agent collide, compose them — don’t run twins.
6. Opus talks; Haiku reads piles.
Avoid: Claude/Codex/Skool; 210-sub fireworks; borrowed agents without a read-only scan; auto-send.

## E. Examples
**Situation:** Five personas on the book.  
**Action:** Parallel general-purpose + different prompts.  
**Outcome:** ~8.  
**Lesson:** Fresh lenses, one orchestrator.

**Situation:** “Roast my ice-cream stand.”  
**Action:** Roast skill wins; then explicit plan-roaster.  
**Outcome:** 22.8k stays off main.  
**Lesson:** Collision is a plate — name the winner.

**Situation:** 210 dynamic subs.  
**Action:** Session limit gone.  
**Lesson:** Parallel is not free.

## F. Decision Rules
- If the pile won’t be reread → sub.
- If steps depend or you must answer → stay in main.
- If two triggers overlap → merge, don’t compete.
- If YAML quotes are open → fix mechanics before “smarter prompt.”
- If $ / 99% from this tape → UNVERIFIED.

## G. Contrarian
Mega personal assistant is the fun lie; specialists win. He almost never launches a session *as* a sub (`claude --agent`) — know it, don’t fetish it. Fancy dashboards not in this tape; the color chip is enough.

## H. Assumptions
Book score 8 / 22.8k / 41 / 210 / 99% UNVERIFIED. On-tape Claude. Clients parked. Caption-only: pink agent, status line = unobserved.

## I. Questions
What did the five-persona recap look like on screen? Exact YAML after trim? Did he keep roast skill + plan-roaster?

## J. Connections
- SYSTEM SYNTHESIS → `Ek1NBfnnTH0` (fan-out audit at 100+ folders).
- SYSTEM SYNTHESIS → `0WDkwMxj13s` (bike / keys / no send-tool).
- SYSTEM SYNTHESIS → hive 17 desks (orchestrator + specialists — do not clone Nate).

## K. Future-Use
Trigger-trim + collision compose. Unassigned.

## Steal / Operate-never

### Machine: orchestrator + named specialist, collision-tested
- **Epistemic:** SOURCE
- **Workflow / loop:** tight description → test fire → on miss rewrite YAML → cheap sub eats pile → main speaks
- **Questions / signals:** Will I reread this? Skill already owns the phrase? Quotes closed?
- **Qualify / frame / objections:** More subs ≠ better
- **Procedure:** Read-only on critics; scan borrowed md; Opus/Haiku split is on-tape only
- **Example that proves it:** Ice-cream collision; 22.8k off-main; 210-sub burn
- **Why it works:** Clean context + one job per agent
- **Conditions / exceptions:** Dynamic workflows eat limits
- **Operate-never payload:** Claude/Skool; prompt-injection clones; auto-send
- **Hive run:** existing hive desks only; `ask-principal`
- **Source:** `e18sdZLwP7o` @ UNKNOWN

### Operate-never
- Install Claude / Codex. Join Skool. Download random “awesome” agents.
- Quote 99% / 210 as FACT. Auto-send. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: plate the **pink plan-roaster chip** and the **thin main vs 22.8k sub** — that is the visual of clean context. Adversarial roast is a draft card, unsent. We do not ship Claude personas as our brand. HITL. Clients parked.
