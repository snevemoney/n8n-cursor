# Librarian — RzLV8sfFdMM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/RzLV8sfFdMM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/RzLV8sfFdMM/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** How to Use Claude Code Better Than 98% of People (Nate × Cole Medin podcast)
**Channel:** Nate Herk | AI Automation
**Kind:** podcast (~1:08:12 / ~15439 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT). Packet title is the 98% course hook; tape is a director-of-agents conversation with Cole Medin.

## A. Source Map
1. Cold open (also the thesis): be the **director** of coding agents. 1M-token ads = Harry Potter ×5 and a **false sense of security**. **Dumb zone** — Cole: Opus ~**250k** (Nate: “that’s my exact number”); without verify maybe **65–70**, with checks **92** first pass (UNVERIFIED). Prompt “never wipe a DB” is not a lock; block `rm` and it can still **write a script**. Nate: agent was “proactive,” misread a task list, **emailed the entire list a discount code** — apology, new code, case study. Doctrine: **anything it can read or touch, assume it will.**
2. Intros: Cole = director + Claude Code as **second brain / co-founder**; Nate calls the same object **AIOS**. Cole: Scratch at 8, CS, Fortune 500, all-in after ChatGPT late 2022, quit ~3 months after starting YT (he says same as Nate). Channel: was **50k** when Nate had **10k**; now Cole **~200k**, Nate **almost 800k** (UNVERIFIED; keep with `8QQ_INxAhRs` 620k vs 800k). Community + weekly workshops + **4-hour enterprise** “stop vibe-coding, make a team standard.”
3. Sponsor: **ClickUp Brain 2** — “software to replace all software”; Nate’s team + old agency clients lived there (replaced Slack + PM). Super agents 24/7, `@` them, search everything — he says that’s cooler than chucking Open Claw / Hermes **into** ClickUp. Mock **Glydo** investor deck from one sentence. Offer on-screen (link). ClickUp / Glydo / School stay on tape.
4. Four-step: **plan with context → build → verify → evolve the system.** Vibe coding = slot machine. People stop at “the site looks good / invoices run” and rerun the same process; **system evolution** = engineer so the same problem happens less (employee/co-founder that learns you). Nate: treehouse — draw, buy wood, then **don’t put kids on it** until you test. Sycophancy: “does this look good?” → yes-man. School free guide + **AI Automation Society** YouTube for podcast clips.
5. Verify = **prove it’s done**. Code: tests/lint. Non-code: Cole’s Excalidraw skill renders **PNG**, Claude vision-checks padding/overlap, iterates; first mess is fine — care about the last hand-back. Nate video-edit pipeline: out-of-bounds motion graphics; same 65–70 → 92 claim. Website: Playwright / Vercel agent-browser, start the site, screenshot as a user. Hard case: vibe-coded games — agent can’t play **60 fps**; harness must **slow the frame rate**. Looking at the code/skill is not enough; it must **use** the thing.
6. Harness (Cole, after Nate calls the jargon): wrapper of tools + context around the model. **Claude Code is a harness** (system prompt + tools). The part you build = **AI layer**: `CLAUDE.md`, skills, hooks, MCP (CRM/tasks). Model = brain; pick Claude Code / Codex / etc.; then context + integrations. Nate homework: ask a model what a harness is — bets the car/engine analogy.
7. Plan more than you build. Markdown spec: goal, what success looks like, **validation strategy**, integration points / files to touch. Workflow: load context → **sub-agents research** (stack, similar apps) → plan that **asks questions**. Nate’s Grill Me / Matt Pocock named. Cole **does not use plan mode** — own planning skill (question style + section control). Theme: control/customizability. Cole **does not use Open Claw or Hermes** — second brain **on** Claude Code; adopting someone else’s system is harder to own. Keep dissent with `gb5TlGw6Uks` (Nate’s Hermes course) and `3TdD8Qv5Tk8` (Nate “always start with plan mode”).
8. Dark code: try to understand; ask it to explain; `/byeways` sidecar so the lesson doesn’t pollute the main thread. If you refuse to learn code, **confidence = validation**, not vibes. Sandwich: you stay in plan + verify; the only “go rip” is after a detailed spec + done-definition.
9. Attention is scarce. 1M tokens fill faster than people think (skills + code). **Dumb zone** after the sharp first 100–200k (model-dependent). 20 MCP servers × ~20k tools = always-dumb Opus. Nate: people blame the model; it’s a skills/context problem. Opus 4.8 million = false security. Handoff/compact: both ~**250k** on current Opus; Cole: Opus 4.7 ~**200k**, Sonnet 4.6 ~**100–125k** (subjective; not betting Boris). Lost-in-the-middle / needle-in-haystack **amplified** in the dumb zone.
10. Therefore: **multi-session harness**. Plan session → handoff doc → implement session → execution report → validate/review session. **Ralph loop** (viral): spec → phases → one session per phase → report → next; one agent would hit dumb zone mid-phase-two. Assembly line, not one hero. B2B quote example (construction / print **100k flyers**): inventory agent, price/vendor agent, PDF draft, make-it-pretty; end validation = **margin check**. Nate: agency quote-from-past-work was a **biggest failure** — he underscoped. Knowledge work = the same string of subtasks. Sub-agents for research: yes. Sub-agents as the whole assembly line: **handoffs are hard**. Anthropic **agent teams**: unrefined, token-heavy. Cole’s OSS **Archon**: make the workflow **as deterministic as possible** — **pick when the model works** instead of letting Claude drive the whole thing. Never fully deterministic (fundamentally impossible).
11. Don’t optimize for speed (30–90 min OK; another session or record a video). Verification extends to **security**. Prompts ≠ permission layer. Scoped keys / cannot-touch. Meta prod-wipe story: Cole **unconvinced** it’s real; smaller wipes he believes. Three false securities: (1) “I told it not to,” (2) “I block DELETE,” (3) it writes a script then runs it. Hooks = Cole’s main restrict: pre-tool check (files, web, env, delete). Still loopholes. Nate’s hooks: basically a **done noise**; wants a Cole hooks masterclass. Cole: hooks also **evolve the AI layer** (suggest better rules/skills). Open Claw/Hermes “every 10–20 turns compact → memory.md” is essentially a hook. Cole’s second brain: avoid compaction; on compact or session-end → daily log; nightly **“Claude Code dreaming”** promotes decisions into primary memory. A hook fired live on tape (he forgot to turn a test off).
12. System evolution = directing, not using. Every issue → what rule / plan-doc / skill so it never happens again. **Every bug = permanent upgrade**; he almost **welcomes** bugs; nervous when nothing breaks. Before failures: ask “how could this go wrong?” (code-review skill); invent the bad input; invoke; **retest** after the fix. Nate: treat it like the smartest friend/mentor; “have you asked Claude?” Cole: don’t ask it for **opinions** (sycophancy); ask it to **explain** or run a black/white test.
13. Nate’s agent-teams use: **war room / debate panel** (CEO, beginner, student, sometimes **seven**), independent research, debate, sometimes “until consensus” — he does **not** have to take the answer. Cole likes it; his analog = **adversarial development** (second session prompted to be mean / devil’s advocate). Agent teams OK for research/consensus; **not** for deep build. Nate: 4–10% of **$200** plan (UNVERIFIED); “don’t stop until everyone agrees” can murder the 5-hour limit — why he never shipped a video on it.
14. Favorites: Cole ends at **skills #1, hooks #2, sub-agents #3** (he wobbles the order on tape — keep it). Skill + **CLI > MCP** (token-efficient); Archon = CLI + skill the second brain can dispatch. Nate: skills, **status line**, **routines**. Nate routines: trading bot moved from Open Claw → Claude routines, **doing worse** (memory); plus team check-ins / EoW reports. Close: you are the **product manager**; **intent engineering** / give the **why** (shapes the how); Claude **4.8** docs said the same yesterday. Cole Medin spelling (not Melden/Medlin). School guide CTA. Claude / Codex / Open Claw / Hermes / Archon / ClickUp / Glydo / School stay on tape.
Gap: Cole’s Excalidraw diagram (he generated it). Timestamp UNKNOWN. Speech≠behavior: Cole “I don’t use plan mode” vs Nate’s other tapes; Cole “I don’t use Hermes” vs Nate’s Hermes course; Nate “I don’t use hooks” vs “assume it will touch”; 98% title vs 65/70/92 numbers.

## B. Atomic Knowledge

### Plan → build → verify → evolve
- **Claim:** Vibe coding is prompt-and-pray. Director loop: plan with context, build, prove done, then change the system so the same miss happens less. First pass can be ugly; last hand-back is what you buy.
- **Evidence:** “plan with context, build… verifying” / “every bug becomes a permanent upgrade”
- **Action:** File the four-step; 65–70 / 92 UNVERIFIED
- **Confidence:** high as shared doctrine
- **Source:** `RzLV8sfFdMM` @ UNKNOWN
- **Epistemic:** SOURCE

### Dumb zone — attention is scarce
- **Claim:** 1M tokens is a false ceiling. Sharp zone ~first 100–200k; Opus dumb ~250k (both say); smaller models earlier. Lost-in-the-middle gets worse there. Don’t front-load 20 MCPs.
- **Evidence:** “dumb zone” / “250,000 tokens” / “false sense of security”
- **Action:** File dumb-zone; counts UNVERIFIED; multi-session before the wall
- **Confidence:** high as their shared feel; numbers subjective
- **Source:** `RzLV8sfFdMM` @ UNKNOWN
- **Epistemic:** SOURCE

### Anything it can touch, assume it will
- **Claim:** Prompts are not a permission layer. Block delete and it can write a script. Nate’s list-blast happened from a misread task. Hooks help; they are not airtight. Scoped keys / cannot-touch.
- **Evidence:** “even if you never ask it to” / entire-list discount email / “write a script to do that”
- **Action:** File assume-it-will; send stays HITL; hooks ≠ hive product
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN
- **Epistemic:** SOURCE

### Sandwich the code between plan and proof
- **Claim:** Cole skips stock plan mode for a planning skill. Nate (other tapes) lives in plan mode — do not flatten. Dark code: sidecar `/byeways` to understand; if you won’t read code, validation is your only confidence.
- **Evidence:** “usually I don’t use plan mode” / “sandwich the delegation… between the planning and the validation”
- **Action:** File sandwich; keep plan-mode dissent with `3TdD8Qv5Tk8`
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN
- **Epistemic:** SOURCE

### Assembly line over one hero session
- **Claim:** Ralph / handoff docs / pick-when-the-model-works (Archon). Sub-agents research well, communicate badly. Agent teams: Nate’s war room OK; Cole says unrefined + expensive for builds. Quote/estimate is the non-code example; Nate underscoped that job at the agency.
- **Evidence:** “you can’t have one agent handle that larger task without it getting into the dumb zone” / “pick when the AI model works”
- **Action:** File assembly-line + handoff-doc; Archon/Hermes/Open Claw stay on tape
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN
- **Epistemic:** SOURCE

### Verify means use it, not look at it
- **Claim:** PNG+vision for diagrams; Playwright/browser for sites; slow-framerate for games. “How could this go wrong?” then retest. Empirical tests beat opinions (sycophancy).
- **Evidence:** “prove to me it’s actually done” / “use the application… as you would”
- **Action:** File use-it-verify; 92% UNVERIFIED
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN
- **Epistemic:** SOURCE

### Why shapes how — you are the PM
- **Claim:** Intent / why in the spec. Claude 4.8 docs said the same (Nate, yesterday). Personifying is “cringe” and still helps. Cole: skills + CLI beat MCP for tokens.
- **Evidence:** “give like the why” / “product manager for Claude Code”
- **Action:** File why-in-the-spec; do not install Archon
- **Confidence:** high as close
- **Source:** `RzLV8sfFdMM` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Director not slot-machine. Treehouse then kids. Co-founder that learns. Harness + AI layer. Dumb zone / needle in haystack. Assembly line / Ralph. Assume it will touch. Three false securities. Welcome bugs. Smartest friend, not oracle. War room vs adversarial session. Skill+CLI. Intent engineering.

## D. Procedures
Load only the context this job needs → research sub-agents → questions (Grill) → written spec (goal / success / validation / files) → build → prove by using (PNG, browser, test input) → persist the miss into rule/skill/memory → optional second session as devil’s advocate. Avoid: 20 MCPs up front; one hero session past 250k; prompt-as-ACL; “don’t stop until they agree” on a $200 meter; Open Claw/Hermes as the second brain (Cole); plan-mode as the only plan (Cole). Signals: Excalidraw PNG loop; list-blast; hook fired live; trading-bot worse on routines.

## E. Examples
**List-blast:** Situation — proactive agent, task-list misread. Action — whole-list discount email; apology; case study to the team. Reasoning — MCP without scoped send. Outcome — they treat it as a system bug. Lesson — assume-it-will; send is HITL.

**Excalidraw PNG:** Situation — big diagram, overlap. Action — render image, vision-check, iterate. Reasoning — first pass can be trash. Outcome — last hand-back is closer. Lesson — verify by using.

**Agency quotes:** Situation — past proposals × many factors. Action — Nate underscoped. Reasoning — one blob, not an assembly line. Outcome — named as a biggest failure. Lesson — split research / price / PDF / margin-check.

## F. Decision Rules
- If the job won’t fit the sharp zone → split sessions + handoff docs.
- If you need confidence → use-it verify, not “looks good.”
- If it can send/delete → scoped keys + hooks + HITL; never prompt-only.
- If you want an opinion → war room / adversary, not one sycophant (and watch the meter).
- If Cole vs Nate on plan mode / Hermes → keep both rows.
- Refuse: Claude/Archon/ClickUp/School as hive; 250k/92%/800k/$200/4–10% as FACT; auto-send.

## G. Contrarian
Against vibe-coding. Against 1M-token swagger. Against prompt-as-permission. Against one-hero-session production work. Against Open Claw/Hermes as the owned brain (Cole). Against stock plan mode (Cole). Against asking the model for its opinion. Against speed-as-the-score. Against welcoming a clean run (Cole wants a bug to harvest).

## H. Assumptions
250k / 200k / 125k / 65–70 / 92 / 50k→200k / 10k→800k / 4–10% / $200 / 98% title — UNVERIFIED. Meta wipe unverified even on tape (Cole doubts). ClickUp + School + Glydo are the cart. Cole’s “don’t adopt Hermes” **disagrees** with Nate’s Hermes course — do not flatten. Nate plan-mode **disagrees** with Cole. Trading-bot worse on routines vs Open Claw memory — keep. Hive stays Cursor + Grok.

## I. Questions
What is actually in Cole’s dreaming → primary memory file? Did the list-blast MCP get a send-block hook? Archon maturity? Receipts for 92 vs 65?

## J. Connections
SYSTEM SYNTHESIS → `3TdD8Qv5Tk8` (plan mode; dark code; laptop cron) · `gb5TlGw6Uks` (Hermes vs Cole’s no-Hermes) · `iTY8Q449YNQ` (roast / verify / session-handoff / `/goal`) · `DTCyvo6cC54` (Grill; he sits L2) · `e18sdZLwP7o` / `ZRb7D6R64hM` (sub-agents vs agent teams) · `HN0oWxbF2bM` (auto-reply never) · `8MEJen0nblQ` (don’t sell AI; ClickUp sponsor again) · `xJ5oz63mIec` (15 runs / 24/7).

## K. Future-Use
Director-loop, dumb-zone, assume-it-will, sandwich, assembly-line handoff, use-it-verify, why-in-the-spec as atoms. Do not install Claude Code / Archon as hive.

## Steal / Operate-never

### Machine: director loop + dumb-zone splits + assume-it-will
- **Epistemic:** SOURCE (guest + host; vendors on-tape)
- **Workflow / loop:** scarce context in → questions → spec with why + done-test → build → prove by using → persist the miss → next session if near 250k feel → checkable stop = named rule/skill that prevents the same miss
- **Questions / signals:** Are we in the dumb zone? Can it send? Did we retest? Is this one hero session?
- **Qualify / frame / objections:** “Better than 98%” is the title; the tape is director + Cole
- **Procedure:** sidecar to understand; hooks/keys not prompts; war room only for research
- **Example that proves it:** list-blast; Excalidraw PNG; underscoped quotes
- **Why it works:** attention is scarce; models yes-man; touch ≠ permission
- **Conditions / exceptions:** Cole ≠ Nate on plan mode and Hermes; agent teams expensive
- **Operate-never payload:** Claude/Archon/ClickUp/School as hive; auto-send; quote 92%/250k/800k as FACT
- **Hive run:** `ask-principal` · `coverage-loop` · `agent-job-card`
- **Source:** `RzLV8sfFdMM` @ UNKNOWN

### Operate-never
- Claude Code / Archon / Open Claw / Hermes / ClickUp Brain / School as hive. Auto-send email or “proactive” list blast.
- Quote 98% / 92% / 65–70 / 250k / 800k / 4–10% / $200 as FACT. Prompt-as-ACL. One-hero production session.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Overwrite `takes/librarian.md`.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File director-loop and assume-it-will as labeled rows — do not flatten Cole-vs-Nate on plan mode or Hermes. Job cards name the verify step and the send lock. No Cole classroom wiki.
