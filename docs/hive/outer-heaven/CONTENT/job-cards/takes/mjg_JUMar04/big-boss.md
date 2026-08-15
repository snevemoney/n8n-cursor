# Big Boss — mjg_JUMar04
Status: filled
Protocol: deep-video-learning
**Source:** `/Users/evenslouis/.grokbot/research-packets/watchlater-15-20260813/transcripts/mjg_JUMar04/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/mjg_JUMar04/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Ledger: 6:50, ~1280 words, Can It Code? Godot snow/walker. Timestamp UNKNOWN on `full.txt`. Visual-only gaps: Pinterest reference, color bible, snow height field, footprint buffer, Blender house, Meshy character, lighting presets, bear decimation stages, interior roof-cut, and the fade-behind-tree ray are described, not seen.

Beats, in order:

1. This tape is “how I built this,” Godot, “not one prompt.”
2. Four models, split jobs: “Fable 5” hard calls (what/why); “Opus 5” mechanics; “GPT 56” Blender (sometimes mechanics); “Kimik 83” Blender/aesthetics; “Soul” named in the list.
3. Failed starts: a few projects finished none — “looked right” but no gameplay loop.
4. This one: a Pinterest scene stopped him. Reference for *feeling*, not a copy. Color bible: daylight photo → he wants after dark; every color translated first. “Nothing goes in the game without it.”
5. Rule: do not ask for the whole game in one prompt. Best model writes the plan. Every job = clean session. Every job ends in a test. Fail → one job goes back, not the game. Fresh chat so the model is not carrying nine jobs. Fewer tokens, fewer mistakes.
6. First job: ground. Fable plans, Opus writes. Flat start. Each corner asked “how high are you?” ~110,000 of them, 60 times a second. Heights not saved once because boots and wind change them. Query only ~120 meters that slide with the character.
7. Placeholders: house, trees, car. Then snow that respects height (deep/thin). Deep = walk, thin = run. Footprints.
8. Footprint trick: every step paints one fixed-size picture, not a list. Snow reads it, wind erases, enemy writes the same buffer. “A thousand tracks cost the same as one.”
9. Replace placeholders: nobody modeled the house by hand. AI wrote a Blender script; every line adds one piece. Wrong roof → fix one line, rerun. Same for trees and car.
10. Subscribe CTA.
11. Tip: do not ask AI for realistic meshes. Simple shapes. “Boxes and a roof. The light does the rest.”
12. Character: GPT concept images → “Mesh AI” / Meshy, 8,000 polys. Texture later mapped to color bible. Used Meshy animations; rigged mesh is simpler/different colors — he will fix in-engine.
13. Lighting control panel with sliders/presets: flat, nightfall, deep night, whiteout/blizzard, sunrise, pale day/midday. Same scene, different day.
14. Enemies: very few; every meeting should be able to kill you. Two: starving man, bears. Bear from Sketchfab CC; too realistic → AI decimates in Blender (three stages shown). Man sees you; bear smells you on the wind (prototype). Press F, gun finds target. Bear cannot be outrun; warns, charges, knocks down; for now you just lie there.
15. House interior is the same location: step inside, roof and front wall come off. Second system: objects between camera and player fade; camera ray at the character.
16. CTA: more deep-dives if comments want them.

Off-topic / not skipped: model zoo names; Sketchfab attribution; Meshy polycount; subscribe mid-tape.

## B. Atomic Knowledge

### Whole-game prompt is the fail he already ran
- **Claim:** Prior projects “looked right” and had no gameplay loop. Do not ask for the whole game in one prompt.
- **Reasoning:** A pretty scene is not a loop. One mega-prompt carries nine jobs and burns tokens.
- **Mechanism:** Best model writes the plan. One job, one fresh chat, one test. Fail returns one job, not the title.
- **Evidence:** He says he finished none of the earlier looks-right attempts. This tape is the process that got a walker into snow.
- **Conditions:** Works when “job” is small enough to test (ground, then snow, then footprints).
- **Exceptions:** Character mesh is a vendor hop (Meshy), not a Godot session.
- **Action:** `slice-build`. One system per session. Refuse the whole site/game in one prompt.
- **Confidence:** high
- **Source:** `mjg_JUMar04` @ UNKNOWN — “Do not ask for the whole game in one prompt”
- **Epistemic:** SOURCE

### Color bible before geometry
- **Claim:** Translate the reference into a night palette first. Nothing enters the game without it.
- **Reasoning:** The Pinterest still is daylight; he wants the same place after dark. Feeling is a constraint, not a vibe adjective.
- **Mechanism:** Reference → color translation → later map textures back to the bible.
- **Evidence:** He states the rule before “okay, let’s make a game.”
- **Conditions:** There is a still that stopped him. He is not inventing taste from zero.
- **Exceptions:** Rigged Meshy character comes in with wrong colors; bible is the later fix, not a block on import.
- **Action:** Definition of done includes the palette constraint before “make it pretty.”
- **Confidence:** high
- **Source:** `mjg_JUMar04` @ UNKNOWN — “nothing goes in the game without it”
- **Epistemic:** SOURCE

### Placeholders, then light, then real meshes
- **Claim:** House/trees/car start as placeholders. Real Blender models come later. Do not ask AI for realistic meshes; boxes + roof + light.
- **Reasoning:** Light does more than mesh density. Realistic mesh asks fail.
- **Mechanism:** Scripted Blender: one line per piece; wrong roof = fix the line, rerun. Lighting panel with daytime presets.
- **Evidence:** He walks placeholders → scripted house → “much better” → same for trees/car → slider presets change the scene.
- **Conditions:** Engine can expose sliders. He asks the model to build the panel.
- **Exceptions:** Character is Meshy, not boxes. Bear is Sketchfab then decimate.
- **Action:** Steal placeholder→light→mesh. Do not open a game-studio SKU.
- **Confidence:** high
- **Source:** `mjg_JUMar04` @ UNKNOWN — “don’t ask AI for realistic meshes” / “the light does the rest”
- **Epistemic:** SOURCE

### One job, one test, sliding window
- **Claim:** Ground height is recomputed in a 120-meter window that follows the player, 110k samples, 60 fps, because boots and wind change height.
- **Reasoning:** Saving the whole map once would be stale. Never ask about the whole map.
- **Mechanism:** Per-frame local query. Footprints share one fixed image buffer so a thousand tracks cost one.
- **Evidence:** He explains why he does not cache answers; deep vs thin snow changes walk/run.
- **Conditions:** Prototype scale. Not a shipped title.
- **Exceptions:** Interior roof-cut and fade-ray are separate systems, still small jobs.
- **Action:** Scope the window, not the world. Forge analog: test the slice, not the atlas.
- **Confidence:** high that he said it; UNVERIFIED that 110k @ 60 is real perf.
- **Source:** `mjg_JUMar04` @ UNKNOWN — “I never ask about the whole map, only a hundred and twenty meters”
- **Epistemic:** SOURCE

### Few lethal encounters, same space as shelter
- **Claim:** Very few enemies; each meeting can kill you. Interior is the same house with roof/wall removed. Bear cannot be outrun.
- **Reasoning:** Tension is density of threat, not mob count. Shelter is a camera trick, not a load.
- **Mechanism:** Two enemy types; Sketchfab bear decimated in three stages; F to lock; knock-down currently ends in lying there.
- **Evidence:** He calls the smell/see AI “still a prototype.”
- **Conditions:** Combat is unfinished (lie there).
- **Exceptions:** None on tape for adding a third enemy.
- **Action:** Learn “few + lethal + same space.” Do not build the bear.
- **Confidence:** medium (prototype)
- **Source:** `mjg_JUMar04` @ UNKNOWN — “every meeting should be able to kill you”
- **Epistemic:** SOURCE

## C. Mental Models

- **Looks-right is a trap.** Loop or it is not a game. **SOURCE**
- **Best model plans; other models execute.** Split by job, not by “use the smartest for everything.” **SOURCE**
- **Fresh chat is hygiene.** Nine jobs in one context is how you get nine mistakes. **SOURCE**
- **Feeling is a bible, not a prompt adjective.** **SOURCE**
- **Cost of a thousand = cost of one** if you paint a buffer, not a list. **SOURCE**
- **Light > mesh.** **SOURCE**
- **Same location, two readings** (outside danger / inside cutaway). **SOURCE**

## D. Procedures

1. **Stop on a reference.** Catch feeling; do not copy.
2. **Translate the palette** (day → night). Lock the bible.
3. **Best model writes the plan.** Do not prompt the title.
4. **One job, new session.** Ground, then props, then snow, then footprints, then meshes, then light, then character, then enemies, then interior.
5. **Every job ends in a test.** Fail = rewind that job.
6. **Placeholders first.** Scripted simple meshes. Light panel with presets.
7. **Vendor hop only when needed** (Meshy character, Sketchfab bear) then decimate/recolor to the bible.
8. **Keep systems local** (120 m window, one footprint image, same house).

**Qualify / frame:** Godot prototype, not a hive game studio. Themes only this cycle.
**Objections:** “Just prompt the game” — he already finished none that way.
**Avoid:** His model zoo as our stack; Meshy/Godot/Blender as required OS; whole-game prompt; game SKU.
**When to change:** If there is no test at the end of the job, the job is not done. If the bible is missing, stop before geometry.

## E. Examples

**Situation:** Several pretty prototypes, no loop.  
**Action:** This time: reference → bible → plan → ground job with a test.  
**Reasoning:** The miss was loop, not art.  
**Outcome:** A walker in deep/thin snow with footprints.  
**Lesson:** Slice until a verb exists (walk/run). Implicit rule: pretty without a verb is a failed start.

**Situation:** Roof looks wrong.  
**Action:** Do not sculpt the mesh. Fix one script line, rerun Blender.  
**Reasoning:** The house is a program, not a sculpture.  
**Outcome:** House replaced; scene “much better.”  
**Lesson:** Regenerable beats handmade. Implicit rule: if you cannot rerun it, you cannot fix one line.

**Situation:** Bear is too realistic for a low-poly world.  
**Action:** Download CC Sketchfab; AI decimate in three stages.  
**Reasoning:** Match the bible/poly budget; do not regenerate a worse bear.  
**Outcome:** Three decimation stills (unseen here).  
**Lesson:** Import + reduce can beat generate. Implicit rule: attribution stays (he names CC).

## F. Decision Rules

- If the ask is “the whole game” → refuse; write the plan; cut one job.
- If a job fails → rewind that job, not the project.
- If a mesh must look real → refuse; boxes + light, or import+decimate.
- If state would be a long list (footprints) → one buffer.
- If the player needs shelter → change the camera, do not load a second map (on this tape).
- Optimize: tokens per job, test per job, feeling locked early.
- Refuse (this desk): game-studio lane, his model names as hive stack, whole-title prompt.

## G. Contrarian

- Against vibe-the-whole-game: he names four models and a test per job.
- Against realistic AI mesh: boxes and light.
- Against saving the heightmap once: the world is live.
- Against a second interior scene: same house, walls off.
- Field assumes a 6:50 tape is a trailer. He treats it as a process doc.

## H. Assumptions

**His:** Fable/Opus/GPT/Kimik split is stable; 110k height queries are cheap enough; Meshy 8k is “perfectly fine”; few lethal enemies are more fun; comments will request the deep dive.

**Ours:** Captions complete enough (~1280 words). Perf numbers and visual quality **UNVERIFIED**. Domain-specific: game prototype. Hive: no game studio this cycle. Cursor + Grok only.

**Falsifiers:** Fresh chats lose the bible. Scripted boxes never look like the reference. Sliding window pops. Knock-down-and-lie is not a loop.

**Disagreement (keep labeled):** He is building a game. We steal `slice-build` and the bible, not a Godot SKU. **SYSTEM SYNTHESIS**

## I. Questions

- What is the actual win/lose besides “lie there”? Not on tape.
- Who owns the color bible when four models rotate?
- Did any of the unfinished pretty projects have a bible and still die?
- Soul’s job is named in the list and never assigned — what did it do?

## J. Connections

- **SYSTEM SYNTHESIS** → `slice-build` (bible → plan → one system).
- **SYSTEM SYNTHESIS** → `cinematic-recipe` / `motion-pipeline` (reference, light, previs).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (every job ends in a test).
- **SYSTEM SYNTHESIS** → `session-bootstrap` (plan first, then short loops).
- **SYSTEM SYNTHESIS** → doctrine: reject 70% done; click/play the slice.
- Do not register a game lane.

## K. Future-Use

- Lighting-preset panel as a Creative “director board” for site heroes (unassigned).
- One-buffer-not-a-list as a Forge note for cheap state (unassigned).
- Same-space cutaway as a walkthrough trick (unassigned).
- Model-per-job roster — do not copy names; keep the split idea.

## Steal / Operate-never

### Machine: Bible → plan → one job → test (not the whole game)
- **Epistemic:** SOURCE (his rule + demo order) / SYSTEM SYNTHESIS (hive `slice-build`)
- **Workflow / loop:** trigger (a still that stops you) → lock feeling as a color bible → best model writes the plan → open a **clean** session for job 1 → implement → play/test → pass or rewind that job → placeholders → light → real simple meshes → next job. Never one prompt for the title.
- **Questions / signals:** “What is the verb?” “Is the bible locked?” “Is this one job?” “What is the test?” “Am I asking for a realistic mesh?”
- **Qualify / frame / objections:** Frame as build hygiene, not a game offer. Objection: one prompt is faster — he already finished none. Objection: need realistic assets — he says light + boxes, or import+decimate.
- **Procedure:** D steps 1–8. Checkable stops: (1) bible exists, (2) plan exists, (3) job has a test, (4) a verb works (walk/run in snow).
- **Example that proves it:** Pinterest night-translation → ground height window → snow slows you → footprints on one image → then house script. Lesson: the loop appeared before the pretty meshes.
- **Why it works:** Context pollution is the silent fail. Feeling without a bible drifts. Lists of state get expensive. Conditions: one operator who will play the slice. Exceptions: Meshy/Sketchfab hops; combat unfinished; model names on tape only.
- **Conditions / exceptions:** Cursor + Grok only. No Godot/Meshy/Blender as hive OS. No game-studio SKU this cycle. Clients parked.
- **Operate-never payload:** Whole-game prompt; game lane; quote model zoo as our stack; new `icp_id`.
- **Hive run (existing skills only):** `slice-build` · `session-bootstrap` · `golden-test-loop` · `cinematic-recipe` / `motion-pipeline` (themes) · `ask-principal` (no publish of a game).
- **Source:** `mjg_JUMar04` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Game studio / sprite-engine SKU this cycle
- Install Fable / Opus / GPT / Kimik / Meshy / Godot as hive OS
- Whole-title prompt as a build plan
- New `icp_id` / unpark Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not greenlight a snow game.

- **Done** on a build slice: bible + plan + one tested job. “Looks like a game” is not done.
- **Delegate without being asked:** Forge gets one system. Creative gets the still + light, not a bear. I do not add an 18th “game desk.”
- **Skeptical review:** Four model names are costume. The fresh-chat + test is the job. I will not approve “just prompt the whole site.”
- **One system this take:** one slice with a verb. Not the walker, not Godot.
- Live hunt stays parked. Leisure theme ≠ a lane row.
