# Big Boss — eRS3CmvrOvA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 13:39, 3401 words, captions `en-orig` json3). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: install commands, GitHub stars, Context Mode byte charts, ClaudeMem viewer, ultra-review fleet.

Beats, in order:

1. Hook: **400 hours** in Claude Code. Most people ship fancy skills for the video. Businesses want six **boring** skills that save time, money, or mistakes — “clients will pay the most” because they build the best agents at the lowest cost. **Hours / pay UNVERIFIED.**
2. How he knows: real estate, HVAC, coaches, marketing agencies — same problems, different industries. If you want to “make money selling AI in 2026,” start with what they already pay for.
3. **Skill creator** (official Anthropic): describe the job; Claude drafts, tests, iterates, packages. SOP → skill. Problem: people write `SKILL.md` by hand, hit structure, ship flaky. Clients do not pay for this skill; it is the **factory**. Example: real-estate property descriptions. Install `/plugin install skill-creator`; he installs **user-global**.
4. Aside: some of these are **plugins** (skills + hooks + MCP). He will still say “skill.” “I’m not an AI avatar.”
5. **Superpowers:** forces senior-dev shape — plan first, isolated env, tests before code, brainstorm, two-stage review (spec match, then quality). Failure mode: Claude sprints, looks fine, falls apart in prod / on the client. HVAC dispatch / agency reporting: they care that it works. Not one-shot; QA is still your job. 80% first pass vs 60% = fewer debug cycles, lower tokens. **150,000 GitHub stars UNVERIFIED.** Sibling video on tokens.
6. **GSD (Get Stuff Done):** environment vs process. Context rot mid-window: sloppy, forgets requirements, skips, lies “done.” Fresh **sub-agents** per task; main session stays clean. Quality gates: scope-production detection (planner dropped a requirement); security anchored to threat model. Autonomous mode: spec → plan → execute → commit. **Not a token saver** — sub-agents cost; it saves redo hours. Superpowers = process; GSD = clean context so process works. `/gsd-help`.
7. **`/review` + `/ultra-review`:** already in Claude Code. `/review` = local, fast, bugs/edges/design. `/ultra-review` (Opus 4.7 era): upload branch to cloud sandbox; parallel reviewers (logic, security, performance, edges); bug must be **independently reproduced** before it hits the list. Use at end: plan (Superpowers) → execute (GSD) → review before merge. Needs v2.1.86+ and a Claude **account** (API key alone won’t). 10–20 min background. `/review` always; `/ultra-review` for payments / auth / migrations / big refactors. **Not free:** Pro/Max “three free runs” then **$5–20** per run. **$ UNVERIFIED.**
8. **Context Mode:** tool calls dump raw data (Playwright snapshot **56 kB**, 20 GitHub issues **59 kB**); ~30 min → **40%** window is garbage; compact → forgets files/tasks/last ask. Fix: sandbox the call; only the needed slice returns (**56 kB → 299 B**, **46 kB log → 155 B**, **315 kB → 5 kB** — *their* benches). `/contextmode:ctx-stats`. Second half: local SQL of edits/tasks/decisions/errors; on compact, reinject a snapshot. Sessions “30 min → 3 hours.” **UNVERIFIED.**
9. **ClaudeMem:** cross-session memory. New chat = 10 min + thousands of tokens catching up. `claude.md` works if you maintain it. ClaudeMem hooks lifecycle, summarizes via agent SDK into local SQLite + vectors, auto-writes folder-level `claude.md`. Retrieval: compact index → timeline → full details (**~10×** vs dump-all — repo claim). Local web viewer. **Do not `npm install` the SDK only** — hooks never register. Marketplace two-command install.
10. **Bonus 7:** official front-end design skill, install global; less “AI-generated” UI. Also in Claude Design; bring back to Claude Code with the skill.
11. **How to sell:** not the workflow — the **outcome** (10 hours / week, fewer admin mistakes, faster/more leads). New: pick **one** skill, a few workflows, a demo. They buy the value, not your résumé. Then more demos / content / your own automations.
12. CTA: resource guide in free Skool; sibling “how I make money in 2026.” Like.

Off-topic / not skipped: HVAC / real estate / coaches as *his* clients; avatar disclaimer; $5–20 ultra-review.

## B. Atomic Knowledge

### Factory first; fancy skills last
- **Claim:** The paid work is boring skills that save time, money, or mistakes. The official skill-creator is the factory that makes the rest, not the SKU you invoice.
- **Reasoning:** Hand-rolled `SKILL.md` is where beginners stall or ship flaky. Clients do not buy the factory; they buy the property-description hours back.
- **Mechanism:** Plain-English job / SOP → draft → test → package. Global install so every repo gets it.
- **Evidence:** Real-estate description example. “Indirectly… all of the other dollars.”
- **Conditions:** You still QA. Factory compresses the learning curve, does not delete it.
- **Exceptions:** He later says do not use all six on day one.
- **Action:** `slice-build` / `interview-to-desk`: one job card, not a plugin haul. Do not install Anthropic’s factory.
- **Confidence:** high for the factory-vs-SKU split
- **Source:** `eRS3CmvrOvA` @ UNKNOWN — “the factory that builds the product”
- **Epistemic:** SOURCE

### Process + clean context + review before merge
- **Claim:** Superpowers (plan/test/review), GSD (fresh workers, gates), `/review` then `/ultra-review` on high-stakes. That is the production path.
- **Reasoning:** Default Claude sprints. Context rot makes it lie “done.” Local review is cheap; reproduced-bug fleet is for payments/auth/migrations.
- **Mechanism:** Isolated env; tests first; two-stage review; sub-agents; scope-drop detection; threat-model verify; reproduced bugs only.
- **Evidence:** HVAC dispatch / reporting as “business depends on it.” 80% vs 60% first pass (napkin). Ultra-review $5–20 **UNVERIFIED.**
- **Conditions:** Production software/automations. Autonomous GSD still needs your QA.
- **Exceptions:** GSD spends more tokens; it buys redo-hours. Ultra-review is not for every commit.
- **Action:** Doctrine: reject 70%; known-good; send/pay paths gated. `/ultra-review` analog = Forge+Watchdog executed checks, not a Claude fleet.
- **Confidence:** high for the path; low for stars / $ / 80%.
- **Source:** `eRS3CmvrOvA` @ UNKNOWN — “plan with Superpowers… execute with… GSD… before you merge… /ultra review”
- **Epistemic:** SOURCE

### Fat tool output and forgotten sessions are the same leak
- **Claim:** Raw snapshots/logs fill the window; compact drops the job. Context Mode keeps garbage out and snapshots the session. ClaudeMem carries *across* sessions so you stop paying the startup tax.
- **Reasoning:** 30 minutes of real work → 40% trash (his/their story). New session = re-explain.
- **Mechanism:** Sandbox → tiny return; SQL event log → reinject; layered retrieval vs dump-all.
- **Evidence:** Byte reductions on tape — vendor benches **UNVERIFIED.** npm-only install warning (hooks never register).
- **Conditions:** Long Claude-Code sessions. Local viewer to *see* what it remembers.
- **Exceptions:** `claude.md` still matters if you maintain it. Memory that writes itself can write the wrong lesson.
- **Action:** Steal thin-output (`YHk45NEpspE`) + durable memory (`c0kaKxM2pHg` checkpoints). Do not install Context Mode / ClaudeMem.
- **Confidence:** high for the leak; low for 10× / 3-hour sessions
- **Source:** `eRS3CmvrOvA` @ UNKNOWN — “40% of your context window is just garbage”
- **Epistemic:** SOURCE

### Sell the outcome; demo one, not six
- **Claim:** Owners pay for hours, fewer mistakes, more/faster leads — not “an AI workflow.” New people: one skill, a few workflows, a demo.
- **Reasoning:** Résumé and plugin lists are not the offer. Experience shows up as better demos and cheaper builds.
- **Mechanism:** Outcome sentence → demo → then more.
- **Evidence:** Close of the video. HVAC/RE/coaches as pattern, not a proof sheet.
- **Conditions:** You can actually show the boring win.
- **Exceptions:** Skill creator is not what they pay for (he said so).
- **Action:** Path A: MUST / clog-leak / proof. Do not hunt HVAC because it was his example. Kill: “I do AI.”
- **Confidence:** high
- **Source:** `eRS3CmvrOvA` @ UNKNOWN — “you need to be selling the outcome”
- **Epistemic:** SOURCE

## C. Mental Models

- **Boring that moves a number > fancy for the video.** **SOURCE**
- **Factory ≠ invoice line.** **SOURCE**
- **Sprint-to-code is the #1 fail.** **SOURCE**
- **Context rot is a lie-“done” machine.** **SOURCE**
- **Review that reproduces beats nitpicks.** **SOURCE**
- **Sub-agents cost tokens; redo costs hours.** **SOURCE**
- **400 hours / 150k stars / $5–20 are magnets.** **INFERENCE**

## D. Procedures

1. **Name the outcome** (hours, mistakes, leads) before naming a skill.
2. **Pick one** factory-or-process loop; do not haul six plugins.
3. **Plan / isolate / test** before production code.
4. **Keep the main thread thin**; fat output stays outside.
5. **Review** on every change; heavier reproduced review on pay/auth/data.
6. **Demo the outcome.** QA is still the human.
7. **Do not npm-install a half tool** (his hook warning = “looks installed, does nothing”).

**Qualify / frame:** Plugin catalog tape. Claude / GSD / ClaudeMem stay on tape. HVAC/RE/coaches are *his* book, not ours.
**Objections:** “Businesses want agents” — they want time/money/mistakes. “Ultra-review is expensive” — he reserves it for costly bugs; we reserve HITL/Forge.
**Avoid:** install commands; quote $5–20 / 150k / 400h as FACT; rotate hunt to HVAC.
**When to change:** if first pass is “looks fine” and nobody clicked, it is not 80%.

## E. Examples

**Situation:** RE agency wastes hours on property descriptions.  
**Action:** Skill-creator from a spoken SOP, not a hand-rolled md.  
**Reasoning:** Factory compresses structure/flake.  
**Outcome:** Example-only.  
**Lesson:** Invoice the hours, not the factory. Implicit rule: SOP in → reusable job out.

**Situation:** HVAC dispatch / reporting will be production.  
**Action:** Superpowers plan/test/review; GSD clean workers; review before merge.  
**Reasoning:** Sprint-code misses edges the business will hit.  
**Outcome:** “Works when their business depends on it” as the standard.  
**Lesson:** QA is the job. Implicit rule: 80% first pass is a win only if someone runs it.

**Situation:** Playwright snapshot 56 kB into the window.  
**Action:** Context Mode sandbox; return 299 B.  
**Reasoning:** Garbage causes compact-amnesia.  
**Outcome:** Vendor bench **UNVERIFIED.**  
**Lesson:** Thin the tool return. Implicit rule: same steal as Printing Press without the vendor.

## F. Decision Rules

- If it is for a video and not for hours/money/mistakes → do not install it as OS.
- If the change touches pay/auth/migrations → heavier reproduced review.
- If the window is filling with raw tool text → stop; thin it.
- If you cannot demo the outcome → you are not selling.
- If install is “SDK only” → it is not installed.
- Optimize: first-pass correctness and redo-hours, not plugin count.
- Refuse: Claude plugin haul; HVAC hunt; $ as FACT; auto-commit autonomous mode as ship.

## G. Contrarian

- Against fancy skills as the product.
- Against one-shot Claude as production.
- Against “more context = more better” (raw dumps).
- Against selling the workflow diagram.
- Field assumes six plugins = a practice. He says pick one and demo.

## H. Assumptions

**His:** 400 hours and 6-of-100+ are a real filter; HVAC/RE/coaches generalize; vendor benches are honest; 80/60 is felt; autonomous GSD is safe enough to mention; Skool guide is the conversion.

**Ours:** Captions complete enough (3401 words). Hours, stars, bytes, $5–20, 10×, 3-hour sessions **UNVERIFIED**. Domain-specific: Claude-Code agency YouTube. His ICPs are not ours.

**Falsifiers:** Factory skills still flake on a client. Ultra-review misses a pay bug. Auto-memory writes a wrong decision and it ships. Autonomous commit sends.

**Disagreement (keep labeled):** Hive will not operate his six plugins. The **factory-vs-SKU + plan/test/review + thin-context + outcome-demo** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What were the other 94+ skills he tried, and what failed? (Not listed.)
- Scope-production detection: false positives?
- Who pays the $5–20 — client or he? Do not analog.
- ClaudeMem wrong-memory: how do you delete?

## J. Connections

- **SYSTEM SYNTHESIS** → `YHk45NEpspE` (thin tool output).
- **SYSTEM SYNTHESIS** → `c0kaKxM2pHg` (durable write vs window).
- **SYSTEM SYNTHESIS** → `eFOTQpbGcy8` (sell hours, not the tool).
- **SYSTEM SYNTHESIS** → `golden-test-loop` · `click-live-site` · `slice-build` · `agent-job-card`.
- **SYSTEM SYNTHESIS** → `client-delivery-kit` analog only — do not fork a skills SaaS.
- Do not add HVAC / RE / coaches as `icp_id`.

## K. Future-Use

- “Looks installed, hooks never registered” as a Forge smell (unassigned).
- Reproduced-bug rule for Watchdog (unassigned).
- Outcome sentence as GTM default (unassigned; no hunt).
- Front-end-design bonus as Creative taste note (unassigned; our stack).

## Steal / Operate-never

### Machine: Outcome first → one factory loop → plan/test/review on a thin context → demo, don’t haul plugins
- **Epistemic:** SOURCE (catalog + sell close) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (someone wants “skills” or a client-shaped demo) → write the outcome (hours / mistakes / leads) → pick **one** loop → plan and isolate → keep fat output out of the working thread → review (heavier if pay/auth/data) → human clicks → demo the outcome → do not auto-commit ship (HITL).
- **Questions / signals:** “What number moves?” “Is this for the video or the business?” “What entered the window?” “Did anyone run it?”
- **Qualify / frame / objections:** Catalog tape, not a Claude practice. HVAC is his example. Objection: we need all six — he says new people pick one.
- **Procedure:** D steps 1–7. Checkable stops: (1) outcome sentence, (2) one loop not six, (3) review ran, (4) demo clicked, (5) tape $ UNVERIFIED.
- **Example that proves it:** Property-description hours via factory; HVAC dispatch via plan/test/review. Lesson: boring + verified. Implicit rule: factory is not the invoice.
- **Why it works:** Owners buy results. Sprint-code and fat context create redo. Conditions: a real SOP/outcome; a human QA. Exceptions: GSD costs tokens; ultra-review is a paid vendor meter; memory can write wrong.
- **Conditions / exceptions:** Cursor + Grok only. Claude plugins / Skool stay on tape. Clients parked. His ICPs are not a hunt rotate.
- **Operate-never payload:** Install the six; quote 400h / 150k / $5–20 as FACT; HVAC/RE hunt; autonomous commit; “I do AI.”
- **Hive run (existing skills only):** `slice-build` · `golden-test-loop` · `click-live-site` · `agent-job-card` · `interview-to-desk` · `ask-principal` · Consultant clog/leak (no new ICP).
- **Source:** `eRS3CmvrOvA` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Claude skill-creator / Superpowers / GSD / Context Mode / ClaudeMem / ultra-review as hive OS
- Quote 400 hours · 150k stars · $5–20 · 10× · 56 kB as FACT
- New `icp_id` (HVAC / RE / coaches) · unpark Normand
- Autonomous commit / auto-merge · Skool
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not approve a six-plugin shopping list.

- **Done** on a skill slice: outcome sentence + one loop + a clicked demo. “We installed Superpowers” is not done.
- **Delegate without being asked:** Forge owns plan/test/review. Watchdog owns thin context and reproduced bugs. GTM/Consultant own the outcome sentence. Lead Hunter does not open HVAC because it was example one. HITL owns merge/pay.
- **Skeptical review:** 400 hours is a flex. 150k stars is a magnet. I will not rotate the stack or the hunt for a plugin haul.
- **One system this take:** one boring outcome loop.
- Live hunt stays parked.
