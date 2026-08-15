# Career Strategist — eRS3CmvrOvA
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/eRS3CmvrOvA/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Video (13:39, 3401 words). Caption ingest. Beats in order: (1) 400 hours in Claude Code; most public skills are video-bait; businesses want six boring skills that save time, money, or mistakes — and let you build agents cheaper (hours UNVERIFIED) (2) same pains across real estate, HVAC, coaches, marketing (3) if you want to sell AI in 2026, start with what they already pay for (4) #1 Skill Creator (official): plain English / SOP → packaged skill; factory, not the SKU; global user-scope; `/plugin install` (5) aside: skill vs plugin (hooks/MCP); he is not an avatar (6) #2 Superpowers: plan, isolated env, tests first, two-stage review (spec + quality); #1 fail mode is rushed code; 80% first pass vs 60%; 150k GitHub stars UNVERIFIED (7) #3 GSD (get s*** done): context rot at mid-window; fresh subagents; quality gates (dropped requirements, security); autonomous mode; **not** a token saver — saves redo hours (8) #4 native `/review` and `/ultra review`: local vs cloud fleet; reproduce-before-list; plan w/ Superpowers, execute w/ GSD, ultra before merge of payments/auth/migration; needs Claude Code ≥2.1.86 + account not API key; 10–20 min background; 3 free then $5–20/run (on-tape) (9) #5 Context Mode: tool-call garbage fills ~40% in 30 min; sandbox + shrink (Playwright 56kB→299B — their benches); local SQL of events; inject snapshot after compact; 30 min → 3h story (10) #6 ClaudeMem: cross-session memory, local SQLite+vectors, auto folder CLAUDE.md; 3-layer retrieve; ~10× vs dump; do not npm-install SDK-only (hooks never register) (11) bonus #7 official frontend-design (12) sell the outcome (10h, fewer mistakes, more leads) not the workflow; if new, pick **one**, demo; they buy the value not your hours. Free guide; “how I make money 2026” CTA. Visual/click: UNKNOWN.

## B. Atomic Knowledge

### Boring skills that cut time/money/mistakes are the product
- **Claim:** After 400 hours, the skills that sell are not fancy video skills. They are a factory (skill creator), a senior process (plan/test/review), a clean context (GSD), a review gate, a garbage filter, and a cross-session memory.
- **Reasoning:** Clients pay for systems that work when the business depends on them, not line count.
- **Mechanism:** Each skill attacks a failure mode (blank page, rush, rot, missed bugs, dump, amnesia).
- **Evidence:** “businesses don’t actually want that. They want six types of skills… that save time, save money, or remove mistakes.” @ UNKNOWN
- **Conditions:** Production leftovers, not demo theater.
- **Exceptions:** Frontend-design is a bonus for slides/sites.
- **Action:** Name the failure mode before naming a plugin.
- **Confidence:** high as his filter; 400h UNVERIFIED
- **Source:** `eRS3CmvrOvA` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** context rot, rushed one-shots, session amnesia
- **Speech ≠ behavior:** title “100+ skills” vs six (+bonus)

### Review before merge; one skill if you are new
- **Claim:** `/review` always; `/ultra review` before payments/auth/migrations — bugs must be reproduced. New sellers: pick one skill, a few workflows, a demo. Sell 10 hours / fewer errors / more leads.
- **Reasoning:** A production bug costs more than the review. Buyers do not care about your stack résumé.
- **Mechanism:** Superpowers → GSD → ultra review.
- **Evidence:** “the kind of commit where a production bug costs way more than the time and the tokens” / “Just pick one, learn it… show business owner a demo.” @ UNKNOWN
- **Conditions:** Something that can ship.
- **Exceptions:** Ultra needs an account, not only an API key; not free after a few runs.
- **Action:** Gate the scary merge; do not install six at once.
- **Confidence:** high as sequence
- **Source:** `eRS3CmvrOvA` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** npm-only ClaudeMem install does nothing
- **Speech ≠ behavior:** none

## C. Mental Models
Fancy is content; boring is invoice. Skill creator is a factory. Process + clean context + review is a pipeline. Token spend can be the price of not redoing. Memory files you forget to update are a lie. Same pains across niches — do not invent a unique industry. He is a person, not an avatar (he felt the need to say it).

## D. Procedures
1. Ask: time, money, or mistake?
2. If new: pick one of the six, build a demo, speak outcome.
3. If building software: plan/test/review (Superpowers pattern) in a clean context (GSD pattern).
4. Fast review always; expensive reproduced review before scary merge.
5. Keep raw tool output out of the window; persist decisions across sessions.
6. Do not SDK-install a hook-based plugin.
7. Sell the leftover, not the plugin name.

Questions: What failure mode? Is this a scary merge? Did I pick one or six? Signals: 30-minute slump; “it’s done” after rot. Qualify: production vs video-bait.

## E. Examples
**Situation:** Real estate wants property descriptions.  
**Action:** Skill creator from an SOP, not hand-rolled markdown.  
**Reasoning:** Factory compresses the curve.  
**Outcome:** Spoken.  
**Lesson:** Factory ≠ the SKU.

**Situation:** HVAC dispatch / agency reporting.  
**Action:** Superpowers so it does not one-shot-miss an edge.  
**Reasoning:** They need it to run.  
**Outcome:** 80% vs 60% first pass (his numbers).  
**Lesson:** Process is the product.

## F. Decision Rules
- IF the skill is for a cool video → skip.
- IF new → one skill + demo, not the suite.
- IF payments/auth/migration → reproduced review.
- IF the session is 30 minutes in and sloppy → context problem, not “Claude is dumb.”
- IF install instructions say npm-only on a hook plugin → refuse that path.
- IF pitching → outcome language.

## G. Contrarian
Rejects “collect 100 skills.” Rejects selling the workflow. Rejects GSD as a token-saver (it spends to save hours).

## H. Assumptions
**Theirs:** Same six map to every niche; published shrink benches are real; 150k stars = quality. Survivorship: 400 hours. **Ours:** All counts/$ UNVERIFIED. HVAC/real estate are **examples, not a hive hunt.** On-tape Claude plugins stay on-tape. Falsifier: a fancy skill that actually is the leftover. Speech≠behavior: “skills” vs “some are plugins.”

## I. Questions
- Which one skill would he pick if he could only keep one for a first demo?
- How often does ultra review find a reproduced bug vs a miss?
- What is the token cost of GSD vs the redo it prevents?

## J. Connections
- SYSTEM SYNTHESIS → `w9-gfaV5vlM` / `4OOS96i2gfI` (outcome, not agent).
- SYSTEM SYNTHESIS → `golden-test-loop` / `context-docs` / `session-bootstrap`.
- SYSTEM SYNTHESIS → do not auto-write the six as hive SKILL.md.

## K. Future-Use
Unassigned: failure-mode → process map (rush, rot, amnesia, dump). Scary-merge review gate. Not a hunt. Not a `/plugin install`.

## Steal / Operate-never

### Machine: failure-mode skills + outcome demo
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** name time/money/mistake → pick one process (factory / plan-test / clean context / review / anti-dump / memory) → demo the leftover → review before scary merge → sell the outcome
- **Questions / signals:** Video-bait or production? 30-min rot? Scary commit?
- **Qualify / frame / objections:** Boring wins. Objection to six-at-once: pick one. Objection to GSD as cheap: it spends tokens.
- **Procedure:** Account not API key for ultra. Do not npm-only hook plugins.
- **Example that proves it:** Property-description factory; HVAC needs tests (E).
- **Why it works:** Buyers pay for fewer failures; fancy skills are content (B/C).
- **Conditions / exceptions:** All six are Claude-shaped. Hive maps the *jobs*, not the installs.
- **Operate-never payload:** `/plugin install`; quoting 400h / 150k / $5–20 as FACT; HVAC/coach outreach; new `icp_id`.
- **Hive run (existing skills only):** `golden-test-loop` · `context-docs` · `session-bootstrap` · `slice-build` · `ask-principal`
- **Source:** `eRS3CmvrOvA` @ UNKNOWN

### Operate-never
- Install Claude Code plugins. Cursor + Grok only.
- Quote tape hours / stars / $ as FACT.
- Hunt HVAC/real estate/coaches. Clients parked.
- Send / pay / deploy / book / publish.
- Auto-write `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
Employment still covers baseline. The career map is six failure modes (no factory, rush, rot, no review, dump, amnesia) — not six installs. Gym one outcome demo in Cursor + Grok. Do not run the 2026 sell-AI closer as a hunt.
