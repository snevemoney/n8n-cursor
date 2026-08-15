# Big Boss — xn6Z5PYyAIE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xn6Z5PYyAIE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/xn6Z5PYyAIE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 35:27, 8248 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: Murmur headphone ads, sleep-bottle stills, hypermotion clips, Google Sheet (45 gens → slate), skill markdown, tornado/lighting aside.

Beats, in order:

1. Claim: Higgsfield has the image/video models; Claude talks to it, builds skills, schedules overnight. “100× faster.” Cold-open clips from “one prompt / 5 minutes.”
2. Connect Higgsfield MCP to Claude **web**: custom connector, OAuth, permission scopes (he “always allow”).
3. Demo A: “build a headphone brand from scratch” — research, branding, three SKUs (Halo / buds / open-back), each: product photo, IG ad, UGC video. Duplicate headline on one ad → iterate. Marketing Studio launch video: first cut quiet/weird; he asks hypermotion + 16:9; 16:9 **sensitive-content** refunds credits twice; he says “show me the prompt,” strips words, third try works.
4. Demo B: drop a real product still (sleep). Vague “IG-ready ads.” Agent asks one question. Early gens drop label text — “do not change the reference.” More specific (fast cuts, slow-mo) gets the intro clip. Winning format → “make versions to test.”
5. Move to Claude **Code** desktop. Blank folder. He prefers **CLI over MCP** (fewer tokens, “better for agents”). Three install commands + auth + vendor agent skills.
6. Doctrine: tools are not taste. Import expertise — Perplexity/Twitter/YouTube → `advertisingmasterclass.md` (617 lines, May 2026) so agents are not guessing copy.
7. Log: pull **45** existing Higgsfield assets into a new Google Sheet via **GWS CLI** (product, style, model, prompt, result). Then: read log + masterclass → creative slate (~30, not 100) with priorities. He has to remind it to write the slate into the sheet.
8. Generate top five (rows 3–7): add **status** column, create prompts, generate, mark complete + job ID + URL. Mid-roll: Glydo (he joined the team).
9. First five: product does not match reference (“slot machine”). He drags the real bottle: “must appear exactly.” Also: restricted prompt again → start a **bank of flagged phrases**. Skill = recipe; update the skill after like/dislike.
10. Reverse-engineer a **hypermotion** skill from a favorite prompt into `.claude/skills`. New session fails to invoke it (wrong skill + dictation “re motion”). Reload app; skill asks model vs UGC vs product-only; he picks product-only. Output: motion good, on-label text mush — “worst these models will ever be”; workaround = simpler label.
11. Scale pitch: Sunday routine = read sheet + channel data, add 50 ideas; Monday = generate blank-status rows; later 100–200. Then “one step further”: Potato or **Meta Ads Manager auto-schedule/post** once you trust the batch.
12. CTA: routines sibling video. **$ UNVERIFIED** (credits refunded; no dollar).

Off-topic / not skipped: Murmur as a fake brand; tornado; Glydo sponsorship; OpenClaude/Hermes as other CLI chairs.

## B. Atomic Knowledge

### Vague brief is allowed if you iterate and pick
- **Claim:** “Build a brand / make IG ads / engaging / fast-paced” is enough to start. Claude writes the real prompts. You keep the pick.
- **Reasoning:** Taste is downstream of options. He is not a “master copywriter”; he imports a masterclass and still picks.
- **Mechanism:** One sentence → research + gens → “not good enough” → tighter brief → winner → versions.
- **Evidence:** Murmur three-SKU pack; sleep ads from “Instagram ready.”
- **Conditions:** Human stays in the loop. First pack is a POC, not a ship set.
- **Exceptions:** Quiet/weird Marketing Studio cut shipped until he rejected it.
- **Action:** N options + human pick (same as `IlNwjnIzrOo`). No auto-post.
- **Confidence:** high
- **Source:** `xn6Z5PYyAIE` @ UNKNOWN — “you’re able to take a super vague, high-level idea… and Claude does the hard work of figuring out the prompting”
- **Epistemic:** SOURCE

### Do not change the reference
- **Claim:** If a real product exists, every gen must match colors and text. “Don’t change anything.”
- **Reasoning:** Blind prompts invent a generic bottle. Conversion dies if the SKU is wrong.
- **Mechanism:** Tag/drag the still. Hard rule in the prompt and later in the skill. Store it under `data/assets`.
- **Evidence:** First sleep ads drop captions; first five slate gens look nothing like the bottle; regenerate-with-lock fixes the stills.
- **Conditions:** You have a canonical still. Video models may still mush on-label type (he admits).
- **Exceptions:** Hypermotion video kept bad text; he would change the physical label rather than rage.
- **Action:** Reference lock is a checkable stop before a batch.
- **Confidence:** high
- **Source:** `xn6Z5PYyAIE` @ UNKNOWN — “it has to appear as shown in this reference image every single time”
- **Epistemic:** SOURCE

### Sensitive-content: show the prompt, strip, persist
- **Claim:** 16:9 hypermotion refunded credits twice. He asked why, read the prompt, removed words, third try worked. Later he wants a skill bank of flagged phrases.
- **Reasoning:** The filter is a word list you can learn. Repeating the same prompt is how you light credits on fire.
- **Mechanism:** “Show me the prompt” → edit → retry. Bake “never these five phrases” into a skill.
- **Evidence:** Two refunds + a later restriction mid-slate.
- **Conditions:** Vendor filter exists. Words that trip it are **UNVERIFIED** (not listed).
- **Exceptions:** He does not publish the bad words on tape.
- **Action:** Fail → inspect prompt → persist. Do not reroll blind.
- **Confidence:** high
- **Source:** `xn6Z5PYyAIE` @ UNKNOWN — “why did that get denied? Show me the prompt.”
- **Epistemic:** SOURCE

### CLI over MCP when an agent will hammer the vendor
- **Claim:** MCP and CLI can do the same jobs. MCP tool-lists are token-expensive. CLI is “faster / more efficient / better for agents.”
- **Reasoning:** POC in Claude chat + MCP. Production-shaped studio in Code + CLI.
- **Mechanism:** Three copy-paste install commands + OAuth + vendor skills.
- **Evidence:** He says it when leaving web Claude.
- **Conditions:** His Claude week. Hive already has Higgsfield/AE in Creative — do not install his CLI as OS.
- **Exceptions:** Web MCP is how he got the cold-open clips.
- **Action:** Steal “cheap interface for the agent,” not the vendor.
- **Confidence:** high for his rationale
- **Source:** `xn6Z5PYyAIE` @ UNKNOWN — “from a token perspective, it’s actually more expensive to use an MCP”
- **Epistemic:** SOURCE

### Import expertise; do not pretend the agent is a CMO
- **Claim:** If you are not a master advertiser, research a playbook into the project (`advertisingmasterclass.md`, 617 lines) and make agents read it.
- **Reasoning:** Tools multiply taste you already have — or taste you imported. Empty taste → slot machine.
- **Mechanism:** Deep research on TikTok/Meta/X attention → markdown in-repo → `@` it when slating.
- **Evidence:** He does “this all the time” with threads, YouTube, Perplexity.
- **Conditions:** The doc can be wrong (May 2026 organic playbook). Still better than vibes.
- **Exceptions:** First five “research-based” clips include a 5s he does not love — research ≠ winner.
- **Action:** Context docs before a batch. `context-docs` / `wiki-ingest` analog. No new skill file from this tape.
- **Confidence:** high
- **Source:** `xn6Z5PYyAIE` @ UNKNOWN — “you can utilize other people’s expertise, and you can bring that in”
- **Epistemic:** SOURCE

### Log every generation before you scale
- **Claim:** 45 assets pulled to a sheet: product, style, model, prompt, result, later status / job ID / URL. Without a log you cannot learn or slate.
- **Reasoning:** Scale without a database is more slot machine. Log is how you see what converted (if you later add spend data).
- **Mechanism:** GWS CLI writes tabs (generations / by product / by style / planning / slate).
- **Evidence:** 45-row pull. Slate ~30 with priorities. Status column added only when he asked.
- **Conditions:** Vendor API returns job metadata. He had to nag “put it in the sheet.”
- **Exceptions:** Spend/conversion columns are imagined, not wired.
- **Action:** Definition of done for a gen includes a row. No overnight 100 without a log.
- **Confidence:** high
- **Source:** `xn6Z5PYyAIE` @ UNKNOWN — “we need to have a database where everything lives”
- **Epistemic:** SOURCE

### Slate → generate N → mark status (do not duplicate)
- **Claim:** Ideate a matrix, then generate only blank-status priority rows, then mark complete. Sunday plan / Monday generate is the scale story.
- **Reasoning:** Blank status is how you avoid double-rendering. Priority is how you do not generate 100 on day one.
- **Mechanism:** Sheet as queue. Routine injects “pick 30 with blank status.”
- **Evidence:** Rows 3–7 run. He asked for a status column after noticing it missing.
- **Conditions:** Human still reviews. First five failed reference lock.
- **Exceptions:** Auto-post to Potato/Meta is the last sentence — operate-never.
- **Action:** Queue + status is the steal. Overnight 100 and auto-post are not.
- **Confidence:** high
- **Source:** `xn6Z5PYyAIE` @ UNKNOWN — “pick 30 videos with a blank status. And that’s how we ensure that we’re not duplicating”
- **Epistemic:** SOURCE

### Blind prompt is a slot machine; skill is the recipe
- **Claim:** Without guidelines, models wander (wrong bottle, generic sleep, restricted words). A skill is the pancake recipe. Reverse-engineer from a **liked** output. Update the skill after like/dislike. New sessions must actually **invoke** it (reload; name it; watch the skill call).
- **Reasoning:** Consistency is the product. First-shot skill is not perfect. Dictation can miss the name.
- **Mechanism:** Favorite prompt → `.claude/skills/hypermotion-video` → new session → confirm invoke → one clarifying question (model/UGC/product-only).
- **Evidence:** Failed invoke ran `higgsfield generate` instead. After reload, motion “crazy good,” type still mush.
- **Conditions:** Skill registered. Reference asset in-repo.
- **Exceptions:** Marketing Studio may not pin a single model unless you pass a flag.
- **Action:** Skill-from-winner after a pick gate. Confirm invoke. Do not auto-write a hive `SKILL.md`.
- **Confidence:** high
- **Source:** `xn6Z5PYyAIE` @ UNKNOWN — “if we don’t have guidelines… we’re just kind of blindly prompting. We’re pulling the lever on the slot machine”
- **Epistemic:** SOURCE

### Auto-post is the last temptation on the tape
- **Claim:** After you “trust” the batch, plug into Potato or Meta Ads Manager and schedule/post autonomously.
- **Reasoning:** He treats trust as a feeling after skills accumulate. Publish is still a hard step here.
- **Mechanism:** Routines + “trusted” skills → vendor post.
- **Evidence:** Closing scale-up paragraph.
- **Conditions:** He says “once you actually get it in a place where you trust.”
- **Exceptions:** No proof of a trusted batch on this tape (first five missed the bottle).
- **Action:** Operate-never: auto-post. Publishing Engine = HITL.
- **Confidence:** high that he said it
- **Source:** `xn6Z5PYyAIE` @ UNKNOWN — “schedule and post these things automatically”
- **Epistemic:** SOURCE

## C. Mental Models

- **Options then pick.** Vague in, N out, human chooses. **SOURCE**
- **Reference is law.** The still is the SKU. **SOURCE**
- **Inspect the denied prompt.** Do not reroll the same words. **SOURCE**
- **Imported taste beats empty taste.** Masterclass.md is a crutch he admits. **SOURCE**
- **No log, no scale.** **SOURCE**
- **Status column is the lock.** Blank = not started. **SOURCE**
- **Slot machine until a recipe.** **SOURCE**
- **“Worst it will ever be” is cope, not a ship rule.** **INFERENCE**
- **Trust-then-auto-post is the magnet.** We stop at trust-then-HITL. **SYSTEM SYNTHESIS**

## D. Procedures

1. **Qualify:** Creative-ops demo (fake headphone brand + sleep prop). Not a client SKU. Not a hunt.
2. **Lock the reference** (canonical still in a known folder) before a batch.
3. **Import a taste doc** if the operator is not the CMO. Do not invent a new hive skill.
4. **Log existing gens** (prompt, model, result).
5. **Slate** with priorities. Generate N, not 100.
6. **Status** in/out. Mark complete with a URL.
7. **Human pick.** Reverse-engineer a recipe from winners. Persist flagged phrases.
8. **Confirm the recipe actually invoked** on the next session.
9. **Stop before post.** Routines that generate drafts only.
10. **Questions / signals:** “Does the bottle match?” “What words got refunded?” “Did the skill fire?” “Is status blank?”
11. **Objections:** “100× overnight” — first five missed the SKU. “Trust it, then Meta” — publish is HITL.
12. **Avoid:** Higgsfield as hive OS; auto-post; quote credits as FACT.
13. **When to change:** If reference drifts, halt the batch.

## E. Examples

**Situation:** 16:9 hypermotion denied twice, credits refunded.  
**Action:** “Show the prompt,” strip words, third try works; later wants a flagged-phrase skill.  
**Reasoning:** Same prompt will fail again.  
**Outcome:** Clip lands; words unknown.  
**Lesson:** Inspect and persist. Implicit rule: refund is a signal, not a reroll.

**Situation:** Slate top-five generates generic blue bottles.  
**Action:** Drag the real still; “must appear exactly”; regenerate.  
**Reasoning:** Blind prompt is a slot machine.  
**Outcome:** Stills match; a 5s video still weak.  
**Lesson:** Reference lock before volume. Implicit rule: status=complete does not mean on-SKU.

**Situation:** Hypermotion skill exists but the new session runs the generic generate skill.  
**Action:** Stop; confirm file; reload app; name the skill; answer product-only.  
**Reasoning:** Uninvoked recipe is not a recipe.  
**Outcome:** Motion good; label text mush.  
**Lesson:** Check invoke. Implicit rule: “we have a skill” ≠ it ran.

## F. Decision Rules

- If there is no canonical still → do not batch.
- If a gen is denied → inspect prompt, persist the ban, then retry.
- If status is not blank → do not generate again.
- If the skill did not log an invoke → stop.
- If the next step is Meta/Potato post → refuse.
- Optimize: pick-among-options + log. Not overnight 100.
- Refuse (this desk): auto-post, Higgsfield OS, 100-ad cron.

## G. Contrarian

- Against “one prompt, 5 minutes, done”: the tape is iterate / deny / miss-the-bottle / miss-the-skill.
- Against “the agent is the creative director”: he imports a 617-line crutch.
- Against MCP-everywhere: he moves to CLI for token cost.
- Field assumes overnight ads are the product. He still has to pick.

## H. Assumptions

**His:** Higgsfield + Claude is a creative agency; GWS CLI is the database; Sunday/Monday routines will scale past humans; trust ⇒ auto-post; Glydo is the voice chair; fake brands prove the machine.

**Ours:** Captions complete enough (8248 words). Visual quality **UNVERIFIED**. Murmur and sleep are props. Clients parked. Creative already has Higgsfield/AE — learn, do not vendor-swap the hive.

**Falsifiers:** Reference lock still fails on video type. Flagged-phrase bank is wrong. Sheet status races. Auto-post burns a real ad account.

**Disagreement (keep labeled):** Hive will not operate his Claude+Higgsfield agency or auto-post. The **reference lock → slate → N gens → status → skill-from-winner** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Which words tripped sensitive-content? Not listed.
- Did anyone ever add real Meta spend back into the sheet?
- Potato = which vendor? Not specified.
- Sibling routines tape — he points, does not bind an id.

## J. Connections

- **SYSTEM SYNTHESIS** → `IlNwjnIzrOo` / `jBanaNBY-sM` (options → pick → motion; no auto-post).
- **SYSTEM SYNTHESIS** → `clip-factory` / `motion-pipeline` / `cinematic-recipe` (still → clip; previs).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (reference lock; invoke check).
- **SYSTEM SYNTHESIS** → `one-channel-deep` (human ships).
- **SYSTEM SYNTHESIS** → `vFepZE_wrfg` (skill from liked output; persist the patch).
- **SYSTEM SYNTHESIS** → `xJ5oz63mIec` (routines = inject a prompt; unattended post = unwanted action).
- Do not force a Path A client out of Murmur or a sleep bottle.

## K. Future-Use

- Flagged-phrase bank as a Creative/Watchdog list (unassigned).
- Status-column queue as a clip-factory footer (Creative).
- Invoke-check as a Forge fail if the named skill did not run (unassigned).
- GWS-CLI analog is not a hive install — sheet-as-log is enough (unassigned).

## Steal / Operate-never

### Machine: Reference lock → slate → generate N → status → skill from winner
- **Epistemic:** SOURCE (demos) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (need creatives) → lock canonical still → import taste doc if needed → log what exists → slate priorities → generate N blank-status rows → human pick → persist flags + reverse-engineer a recipe from winners → confirm next session invokes it → Evens ships. Checkable stops: still matches; row written; skill invoked; nothing posted.
- **Questions / signals:** “Does the SKU match?” “What got refunded?” “Did the skill fire?”
- **Qualify / frame / objections:** Content ops, not a client SKU. “100× overnight” is the magnet. Objection: first five completed — they missed the bottle.
- **Procedure:** D steps 1–9.
- **Example that proves it:** Denied 16:9 → show prompt. Generic bottles → lock still. Skill file existed but did not run. Lesson: lock, log, pick, confirm invoke. Auto-post is the trap.
- **Why it works:** Taste needs options. SKU needs a still. Scale needs a queue. Consistency needs a recipe that actually fires. Conditions: one operator, a pick gate, a log. Exceptions: video type still mush; no conversion data on tape.
- **Conditions / exceptions:** Cursor + Grok only (Claude / Higgsfield MCP-CLI / Glydo / Potato / Meta auto-post stay on tape). Clients parked. We already have Higgsfield/AE — do not vendor-swap.
- **Operate-never payload:** Auto-post; overnight 100; Sunday/Monday unsupervised Meta; quote credits / 100× / 45 gens as FACT.
- **Hive run (existing skills only):** `clip-factory` · `motion-pipeline` · `golden-test-loop` · `one-channel-deep` · `ask-principal` (publish) · `slice-build` · `context-docs`.
- **Source:** `xn6Z5PYyAIE` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-post to Potato / Meta / IG / TikTok
- Overnight 100-ad cron / unsupervised Marketing Studio
- Install Claude + Higgsfield CLI as hive OS / Glydo
- Quote 5 minutes / 100× / 45 gens / 617 lines / refunded credits as FACT
- Nate Skool / fake Murmur / sleep-pill hunt
- New hunt ICP. Clients parked. No Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not run a midnight ad factory.

- **Done** on a creative slice: canonical still locked + N options + Evens picks + row logged + nothing posted. Status=complete on a wrong bottle is not done.
- **Delegate without being asked:** Creative Studio packages stills/clips; Publishing Engine does not ship; Watchdog checks reference + invoke; Forge treats uninvoked skills as a fail.
- **Skeptical review:** Cold open is the winner reel. The body is denies, generic bottles, and a skill that did not fire. I will not approve Meta auto-post because a hypermotion slapped.
- **One system this take:** one slate of N, pick gate, log. Not 100 overnight. Not Potato.
- Live hunt stays parked. I do not rotate to “creative agency” because Murmur looked expensive.
