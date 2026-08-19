# Money Desk — U6k4MeVks_Y
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/U6k4MeVks_Y/transcripts/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/U6k4MeVks_Y/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~11335 words. Chase Claude Code beginner→intermediate→pro roadmap. Caption-only; timestamp UNKNOWN; visual/click UNKNOWN (desktop UI, browser pane, Vercel URL, Ultra run — unobserved). Beats in order: will replace “1000+ hours” of trial and error; desktop vs web vs terminal — for non-technical he now pushes desktop (voice, browser automation, inline artifacts; terminal still available inside desktop); install: search Claude Desktop App, first link, run installer. Beginner settings: global instructions blank unless it applies to every chat (rhyme-every-reply as the stupid example); capabilities: load tools when needed, turn the rest on; Cloud Code tab on; local sessions on; pull requests off if you don’t know what a PR is; Claude in Chrome on if you install the extension. New session: Local 99.99% (not cloud/remote/WSL/SSH); pick one folder; main not worktree if you don’t know git; plus = extra folder copy. Permissions: sit on Auto (bypass + danger classifier); Manual = ask always; Bypass = scary; Plan used later. Model: $20/mo plan cannot afford Fable → sit Opus; Max 5x/20x ($100 / $200) sit Fable most of the time — UNVERIFIED; limits: 5-hour, weekly, Fable cap (only half weekly usage); effort not linear — extra-high→Ultra maybe ~1% better / ~5x spend; he sits Fable medium unless complex or a reset is about to hit and he can burn it. Prompting: no magic format; buy a mic; stream of consciousness; always Plan mode on a new project so it asks the unknown-unknowns; add “what am I not thinking about?”; demo fake SaaS Lighthouse (small-startup → later medium too, product analytics + AI insights, book-a-call CTA, fake booking form, clean light SaaS); when it asks tech stack do not smash Recommended — ask it to explain (moat + learning); accept + auto mode. Mid-roll: Chase AI Plus / updated Claude Code masterclass. Intermediate: watch the context window (1M token budget; demo 156k; performance drops as it fills; rule of thumb 30–40%, he acts at ~30% / 50% = 500k definitely ask); /clear vs /compact vs new chat in the same folder (files survive; web-app fear does not apply); first Lighthouse pass is generic because no visual context. Skills = prompts that make a specific thing happen a specific way (front-end design = avoid slop); plugins ≈ skills (can bundle); official Anthropic front-end design; skill-creator is the most important add (evals/benchmarks); GitHub URL → “add this skill”; invoke /frontend-design or natural language; if multiple similar skills, nudge. Context inject: one Pinterest SaaS screenshot + front-end design → three versions in the browser pane; he picks V1 (V2 colors, V3 “typical AI slop”). Outside apps: pick one of connector / plugin / CLI (CLI often more functions + skills); Gmail/Calendar/Drive connectors; GitHub + Vercel as talk-to-deploy pipeline to a live URL (lighthouse-site.vercel.app on tape); when in doubt ask Claude to find+add the CLI. Advanced: long-horizon = trigger + task + success criteria (+ log if it should run forever); /goal needs an objective done-when (not “looks cool”); compares each iteration to success, starts a new session if fail (Ralph-like); eternal loop = skill + logging/scoring + routine (e.g. 7am morning brief: YT/Twitter/Reddit/Gmail → report); graph = nested micro-loops per step — usually overkill. Ultra / dynamic workflows: custom harness, many sub-agents, expensive; /deep-research prebuilt (fan-out + adversarial + synthesize); he has seen 100+ sub-agents; six agents burned 314k immediately; one run 103 agents and six million tokens, all on Fable, 21 sources; cap sub-agent count or route them to Sonnet/Opus. Model routing: models grade themselves as “great”; official Codex plugin for adversarial review; his “grill meex” skill = groom + Codex↔Fable up to five rounds; cheaper/local models via skill-creator. Agentic OS: visual wrapper is not the value — skill architecture mapped to daily tasks + automations; Obsidian vault (raw → wiki → output + index.md at every level, Karpathy-style) so both human and Claude can navigate; headless `claude -p`; Anthropic rate drama “no longer the case.” Close: Chase Plus / masterclass / exact setup inside Plus.

## B. Atomic Knowledge
### Plan-mode-then-explain-the-question
- **Claim:** New project starts in Plan mode with a stream-of-consciousness plus “what am I not thinking about?” When you do not understand a question (tech stack), do not smash Recommended — make it explain.
- **Reasoning:** Unknown-unknowns are the failure mode for non-technical users. Recommended-loop makes you replaceable and leaves you unable to steer a unique project.
- **Mechanism:** Plan → questions → comment the plan → accept + auto. You still do not need to become an engineer; you need building-block literacy.
- **Evidence:** On-tape Lighthouse: purpose/design/audience/CTA/fake booking form; he adds medium companies via plan comments. Visual UI UNKNOWN.
- **Conditions:** You have a fuzzy A→Z. You will sit in Plan before execute.
- **Exceptions:** Does not require Claude Code. The gate (plan + explain) ports. Fake book-a-call is a demo, not a SKU.
- **Action:** Steal the gate. Do not install Claude Code / buy Max to sit Fable.
- **Confidence:** high as a procedure
- **Source:** U6k4MeVks_Y @ UNKNOWN
- **Epistemic:** SOURCE
### Context-window-is-a-budget
- **Claim:** Tokens are the currency; the context window is a ~1M budget; performance drops as it fills; start a new chat in the same folder before 30–50%.
- **Reasoning:** Too much in the brain, especially middle-of-session facts. Files in the folder survive /clear; you are not starting from zero like a web chat.
- **Mechanism:** /clear = fresh; /compact = summary then new; plus-button = new chat, old one still referenceable. He acts around 30%.
- **Evidence:** Demo had spent 156k (~15%). 500k = definitely ask. Timestamp UNKNOWN.
- **Conditions:** You can see a usage meter or you treat 30% as a stop.
- **Exceptions:** 1M / 156k / Fable weekly cap UNVERIFIED. Effort extra-high→Ultra ~1% / ~5x is his feel, not a receipt.
- **Action:** Steal the 30% new-chat rule as `token-receipt`. Do not buy $20/$100/$200 to play the meter.
- **Confidence:** high as a heuristic; digits UNVERIFIED
- **Source:** U6k4MeVks_Y @ UNKNOWN
- **Epistemic:** SOURCE
### One-screenshot-plus-a-skill
- **Claim:** A generic “clean light SaaS” prompt produces slop. One screenshot + a front-end-design skill + “three divergent versions” produces a pick.
- **Reasoning:** Skills make a non-deterministic model somewhat deterministic. Context engineering is the intermediate game: thoughts + external tools/skills.
- **Mechanism:** Add skill (official plugin or GitHub URL → “add this skill”) → drop screenshot → ask for N versions → pick one.
- **Evidence:** On-tape: Pinterest SaaS landing; V1 chosen, V2 colors, V3 slop. Browser-pane comments UNKNOWN as clicks.
- **Conditions:** You have one visual reference and one named skill.
- **Exceptions:** Skill-creator → turn the session into a skill is a later move, not step one. Multiple similar skills need a nudge.
- **Action:** Steal screenshot+skill+N-versions. Do not install Anthropic plugins as ours.
- **Confidence:** high as a demonstrated-from-speech sequence (transcript-implied)
- **Source:** U6k4MeVks_Y @ UNKNOWN
- **Epistemic:** SOURCE
### Goal-needs-a-done-when
- **Claim:** /goal and any loop need an objective success check. “Looks cool” cannot stop the loop. Eternal loops also need a log so later runs can compare.
- **Reasoning:** Without a done-when it will iterate forever or stop on a vibe. Subjective briefs (morning report) need countable minima (5 YT + 5 tweets + …) or a score.
- **Mechanism:** Trigger + task + success (+ log if recurring) → skill → run manually until good → routine/schedule. Graph = nested micro-loops — usually overkill.
- **Evidence:** On-tape morning-brief example; /deep-research 103 agents / 6M tokens / 314k on six agents — UNVERIFIED, expensive on Fable.
- **Conditions:** You can write a pass/fail sentence. You will cap sub-agents or route them cheaper if you ever ran this — we do not.
- **Exceptions:** Ultra/deep-research is a token fire. Codex-grades-Claude is a vendor sandwich.
- **Action:** Steal done-when + log. HOLD Ultra / 6M-token runs / Codex plugin / Chase Plus.
- **Confidence:** high as a loop spec; token burns UNVERIFIED
- **Source:** U6k4MeVks_Y @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: desktop is enough for non-technical now; the moat is learning the questions, not Recommended. Priority: Plan → context budget → skills/context → one outside-app path → done-when loops; graph/Ultra/OS are later. Experience: he sits Fable medium; burns Fable only near reset or on hard jobs. Contrarian: global instructions should be blank; magic prompt formats are dead; the visual OS wrapper is not the value (skills + vault are). Uncertainty: effort-vs-quality is not linear; morning-report success is hard to make objective.

## D. Procedures
Beginner order: desktop app → blank global instructions → Auto permissions → one folder → Local → Plan + mic dump + “what am I missing?” → explain unknown questions → accept+auto. Intermediate: watch context; /clear or /compact or new chat in-folder at ~30%; add one skill; add one screenshot; pick among versions; for any outside app pick connector OR plugin OR CLI (ask Claude to add it); GitHub+Vercel as the example deploy pipe. Advanced: /goal only with a done-when; recurring = skill + log + routine; graph only if you need micro-loops; Ultra/deep-research with an explicit sub-agent cap and cheaper sub-models; second-model grade if you cannot grade the work; OS = map daily tasks to skills, then maybe automate, vault raw/wiki/output + indexes. Caption-only: every UI click UNKNOWN.

## E. Examples
**Situation:** First Lighthouse pass, “clean light SaaS,” no screenshot. **Action:** He calls it ugly/generic; drops one Pinterest image + front-end design; asks for three divergent versions; picks V1. **Reasoning:** Context + a skill changes the end state more than a longer prompt. **Outcome:** Three versions in the browser pane (speech). **Lesson:** One image beats “make it look like SaaS.”

**Situation:** Deep-research on dynamic workflows, Fable Ultra. **Action:** Six agents / 314k immediately; later 103 agents / 6M tokens; 21-source report. **Reasoning:** Fan-out + adversarial + synthesize. **Outcome:** He uses it as the “this is expensive” proof and says cap agents or route to Sonnet. **Lesson:** A done-when without a budget is a bill. Digits UNVERIFIED.

## F. Decision Rules
IF non-technical → desktop, not terminal-shame. IF the instruction is not true of every chat → leave global blank. IF $20 plan → he says sit Opus (we still do not buy). IF new project → Plan. IF you don’t understand the question → explain, don’t Recommended. IF context ~30% → new chat in the same folder. IF first visual is generic → screenshot + skill + N versions. IF outside app → pick one of three attach paths. IF /goal → write a done-when. IF Ultra/deep-research → cap agents / cheaper subs. IF the model grades itself → second model (his Codex path — we do not install). IF Chase Plus / masterclass → not a SKU. Refuse: Fable window spend, Vercel live without HITL, auto-book from the fake form.

## G. Contrarian
Rejects “you must use the terminal or you’re missing out.” Rejects magic prompt templates. Rejects Recommended-as-a-lifestyle. Rejects “automation OS = the pretty dashboard.” Rejects subjective /goal success. Field assumes more effort = more quality — he says extra-high→Ultra is ~1% / ~5x.

## H. Assumptions
Assumes a Claude subscription and a folder. Survivorship: his Plus curriculum + one Pinterest save. Dates/limits (Fable half-week, 1M window) may be stale. Falsifier: desktop app lags terminal again; /compact summaries lie. Disagreement: hive does not install Claude Code, Codex, Vercel CLI, or Chase Plus. Speech≠behavior: fake book-a-call CTA on a practice site. Caption-only: we did not see the live URL work.

## I. Questions
Is Fable still half the weekly cap? Did lighthouse-site.vercel.app stay up? What is the actual grill-meex stop condition after five rounds? Is `claude -p` still same-price?

## J. Connections
SYSTEM SYNTHESIS: Plan-before-build = `session-bootstrap`. 30% new-chat = proposed `token-receipt`. Screenshot+skill = `context-docs` + `golden-test-loop` (pick among versions). Done-when = `golden-test-loop`. Vault raw/wiki/output = `wiki-ingest`. Sibling: `dYrrEKXtttk` (refuse the included-until-DATE meter). Do not buy Max to sit Fable.

## K. Future-Use
Unassigned: skill-creator → session-to-skill as a future job-card compiler (do not auto-write SKILL.md). Morning-brief loop as a Day Planner observe. Headless OS as a never unless Evens names it.

## Steal / Operate-never

### Machine: Plan-explain-30-percent-screenshot-done-when
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: new project or a fuzzy A→Z → action: Plan + stream-of-consciousness + explain unknown questions → watch context, new chat ~30% → one skill + one screenshot + N versions → any loop needs a done-when (+ log if recurring) → checkable stop: a picked version and a pass/fail sentence, not “looks cool”
- **Questions / signals:** What am I not thinking about? Can I explain the tech-stack question? Am I past 30%? Is success countable?
- **Qualify / frame / objections:** Frame: learn the building blocks, don’t Recommended. Objection: “just use Ultra” — ~1% / ~5x and 6M-token burns. Objection: “I need the pretty OS” — skills + vault are the value.
- **Procedure:** Desktop/blank-global/Auto/one-folder is his beginner kit — we do not install it. Port the gates to Cursor + Grok.
- **Example that proves it:** Lighthouse generic → one Pinterest + front-end design → three versions → V1. Deep-research 103 agents / 6M tokens as the bill warning. UNVERIFIED.
- **Why it works:** Unknown-unknowns and empty context produce slop. A done-when stops a loop. Files survive a new chat.
- **Conditions / exceptions:** Works as gates. Exception: $20/$100/$200, Fable cap, 1M/156k/314k/6M, Chase Plus, Codex, Vercel live stay operate-never.
- **Operate-never payload:** Claude Code desktop · Fable/Opus/Max · Chase AI Plus · Codex plugin · Vercel/GitHub as ours · Ultra uncapped · fake book-a-call · auto-deploy
- **Hive run (existing skills only):** `session-bootstrap` · `context-docs` · `wiki-ingest` · `golden-test-loop` · `ask-principal` · `pricing-margin-roi-guardrails`
- **Source:** U6k4MeVks_Y @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote $20 / $100 / $200, “1000+ hours,” 1M / 156k / 314k / 6M tokens, 103 agents, Fable weekly cap, ~1%/5x as FACT or as our COGS.
- Chase AI Plus / masterclass / exact OS setup as a SKU. Do not buy.
- Install Claude Code / Codex / Chrome extension / Vercel CLI. Auto-deploy a live URL. Auto-book.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD every Claude bill and Chase Plus. Steal Plan-before-execute, 30% new-chat, screenshot+skill+N-versions, and done-when. Port to Cursor + Grok only. Early rung $500–1K/mo CAD. Do not analog Fable spend.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
