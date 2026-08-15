# Big Boss — RzLV8sfFdMM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/RzLV8sfFdMM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/RzLV8sfFdMM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 1:08:12, 15439 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (json3 exists; no VTT in the take). Visual-only gaps: Cole’s Excalidraw “director” diagram (he says Claude Code + a skill generated it; PNG render used to check overlap); fat-marker “dumb zone” drawing he abandoned; ClickUp Brain 2 sponsor deck (Glydo mock investor slides + animations); on-screen ClickUp offer.

Beats, in order:

1. Cold open: be the **director** of coding agents; 1M-token context = “Harry Potter five times”; **dumb zone** (Opus ~**250k**); more time planning than building; verification **65–70 → 92** first pass; “never wipe the DB” still wipes; agent sent a **discount email to the entire list**. **98% / 250k / 65–70 / 92 UNVERIFIED.** Title claim “better than 98% of people” is packaging, not a measured study.
2. Nate intro: Cole Medin; Claude Code as the example; “system that evolves itself”; Cole calls it second brain / co-founder; Nate calls it AIOS; “make the business AI native.”
3. Cole bio: Scratch at 8 → CS degree → Fortune 500 SWE → ChatGPT 2022 all-in on agents → YouTube (LangChain/LangGraph line-by-line, then coding assistants) → quit ~3 months in. Sub counts on tape: Cole **50k→200k**, Nate **10k→~800k** — **UNVERIFIED.** Community + weekly workshops + **4-hour** enterprise “stop vibe-coding, get a team standard.”
4. ClickUp sponsor: Brain 2, super agents, Glydo mock deck from one sentence; “better than chucking Open Claw / Hermes into ClickUp” because context is already there. Offer on screen.
5. Pillars: stop slot-machine vibe-coding. **Plan with context → build → verify.** After every loop, **evolve the system** (don’t rerun the same invoice process forever).
6. Nate treehouse analogy; sycophancy (“does this look good?” → yes); agents lie about done.
7. Mid-tape Skool + clips-channel CTA.
8. Verification = “prove to me it’s actually done.” Coding: tests/lint. Non-coding: Excalidraw → render PNG → vision for padding/overlap; iterate until last hand-back. Nate motion-graphics: without checks **65–70**, with checks **~92** — **UNVERIFIED.** Playwright / Vercel agent-browser: spin the site, walk it as a user. Hobby: harness so an agent can *play* a 60fps game (slow the frame rate).
9. Harness definition: wrapper around the model (tools + context). Claude Code *is* a harness (system prompt + tools). “AI layer” on top: CLAUDE.md, skills, hooks, MCP. LLM = brain; you pick Claude Code / Codex; you build context.
10. Planning: more time planning than building; markdown spec (goal, success, validation, integration points); load context; sub-agents research stack; agent **asks questions** (Nate: Matt Pocock “grill me”). Cole often **skips plan mode** — own planning skill for control.
11. Control thesis: he does **not** use Open Claw or Hermes; second brain is *on* Claude Code. Adopting someone else’s OS is easier and less yours.
12. Dark code: try to read it (sidecar `/by the way` so you don’t pollute main context). If you refuse to learn code, confidence = validation sandwich only.
13. **Attention is scarce.** 1M tokens is a false sense of security. Skills/code eat context; **dumb zone** after ~100–200k, Opus ~**250k**, older Opus ~200k, Sonnet ~100–125k — **UNVERIFIED / subjective** (he will not bet Boris Cherny). Needle-in-haystack in the middle. 20 MCP servers × ~20k tokens = “why is Opus dumb?”
14. Multi-session harness: plan agent → handoff doc → implement agent → execution report → validate/review agent. **Ralph loop** (viral): spec → phases → one session per phase + report. Assembly line. Sub-agents are weak at handoffs; Anthropic “agent teams” unrefined and token-heavy. His open-source **Archon**: pick *when* the model runs; make the autonomous thing as deterministic as possible (never fully).
15. B2B quote example (print 100k flyers / construction): inventory agent, price/vendor agent, PDF draft, polish — plus a margin check at the end. Nate: underscoped that exact job at the agency — biggest failure.
16. Don’t optimize for speed (30–90 min jobs fine; other session or no agent). First pass can be trash if it can iterate. Security is part of verify (leaked keys in JS).
17. Permission: **anything it can read or touch, assume it will.** Prompt ≠ permission. Nate incident: proactive agent misread a task list and **emailed the whole list a discount**; apology + case study to the team. Cole: Meta prod DB wipe story — he’s “not convinced that’s real.” Hooks as pre-tool checks. Loophole: block `rm` → agent writes a script that deletes anyway. Two false senses of security (prompt; block DELETE) then a third layer.
18. Hooks also: session-end summary → daily log → “Claude Code dreaming” promote to primary memory. Hermes/Open Claw memory.md is “essentially a hook.”
19. **System evolution:** every bug is a permanent upgrade (new rule / skill / planning doc). He almost *wants* bugs. Before failures: ask “how could this go wrong?”, build the bad input, break it, fix, **retest**.
20. Ask the agent to *explain* (low sycophancy). Don’t ask it for opinions (slippery). Nate: treat it like a mentor; “have you asked Claude?”
21. Nate **war room**: 7 personas debate to consensus (he may not obey). Cole likes it for research, not deep build (kills the 5-hour limit). Cole **adversarial development**: second session plays devil’s advocate. Nate: **$200/mo** plan, debate costs **4–10%** — **UNVERIFIED.**
22. Top features: Cole — skills, hooks, sub-agents (research/grounding). Skill + **CLI > MCP** (token-efficient). Archon = CLI + skill. Nate — skills, status line, routines. Nate routines: **trading bot** (worse than Open Claw memory), team check-ins, weekly reports.
23. Close: you are the **product manager**; **intent engineering** = give the *why* (Claude 4.8 docs say the same). Personifying is “cringe” and it works. Cole Medin (m-e-d-i-n) YouTube + LinkedIn. Skool CTA.

Off-topic / not skipped: ClickUp/Glydo ads; chess-tournament “Melden”; subscriber flex; community/enterprise training as his close.

## B. Atomic Knowledge

### Director loop: plan → build → verify → evolve
- **Claim:** Vibe-coding is a slot machine. Reliable work is: plan with context, build, verify, then change the *system* so the same miss is cheaper next time.
- **Reasoning:** People stop at “the site looks good / invoices run” and rerun the same process. Problems compound. The agent should learn like an employee / “co-founder.”
- **Mechanism:** Four-step loop on every coding *or* ops task. Evolution = new rule, skill, or planning doc — not a longer chat.
- **Evidence:** Invoice example; treehouse analogy; “I almost feel nervous when everything is going too well.”
- **Conditions:** You will spend the minutes after “done” to write the don’t.
- **Exceptions:** One-off throwaway (his hobby game) can stay sloppy.
- **Action:** No slice is done until the miss is persisted or explicitly accepted.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “plan… build… verifying” / “system evolution”
- **Epistemic:** SOURCE

### Spend more time planning than building
- **Claim:** With coding agents you spend more time on the plan than on the build; success is the plan’s quality.
- **Reasoning:** You are delegating (often all) implementation. Alignment happens before “go rip.”
- **Mechanism:** Markdown: goal, what success looks like, validation strategy, integration points / files. Load only needed docs. Sub-agents research. Agent asks many questions (grill-me). Cole often **avoids plan mode** so he controls sections.
- **Evidence:** “Its success is really just dependent on how good is your plan.”
- **Conditions:** You will answer questions. Impatience is the failure mode.
- **Exceptions:** Tiny chores may not need a novel. Production / business-critical still do.
- **Action:** Definition of done and validation are written *before* the agent codes.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “you spend more time planning than you actually do building”
- **Epistemic:** SOURCE

### Verification is “prove it as a user,” not a self-review
- **Claim:** “Looks good” / reading the code is not enough. The agent must use the artifact the way a user would, then iterate until the *last* hand-back.
- **Reasoning:** First pass will miss (overlap, out of bounds). Without a harness you ship 65–70; with one you might hand 92. **Scores UNVERIFIED.**
- **Mechanism:** Excalidraw → PNG → vision for spacing; Playwright/browser: start the site, screenshot the path; game: slow frames so the agent can think. Website design is “pretty easy”; many domains are not — you must engineer the check.
- **Evidence:** Big diagram needed several self-iterations; Nate motion-graphics pipeline.
- **Conditions:** There exists a cheap observable (image, URL, test, margin number).
- **Exceptions:** Some work is hard to harness. That’s a design problem, not a reason to skip.
- **Action:** Name the check before build. Watchdog/Forge run it. Do not accept “review the code.”
- **Confidence:** high for the shape; numbers UNVERIFIED
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “prove to me it's actually done and working”
- **Epistemic:** SOURCE

### Sandwich: humans own plan and validate; agent owns the middle
- **Claim:** The way you don’t vibe-code is you sandwich delegated implementation between planning and validation you are heavily in.
- **Reasoning:** Dark code is unsafe if you cannot read *and* have no check. `/by the way` sidecar teaches you without blowing main context.
- **Mechanism:** Detailed spec + “this is how you tell me you’re done” → then “go rip.” If you will never read code, the sandwich is your only confidence.
- **Evidence:** Cole’s two-track answer (learn to read vs validation-only).
- **Conditions:** You stay in the loop at both bread slices.
- **Exceptions:** He still sends 30–90 min jobs and works elsewhere — the *spec and check* were already written.
- **Action:** I do not approve a build that skipped either slice.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “sandwich the delegation of the coding between the planning and the validation”
- **Epistemic:** SOURCE

### Attention is scarce — the million-token dumb zone
- **Claim:** 1M context is a false sense of security. Models have a **dumb zone** where they miss obvious things and skip skills. Opus ~**250k** is *his* feel (Nate agrees); smaller models sooner. **UNVERIFIED.**
- **Reasoning:** Skills and code eat tens/hundreds of thousands of tokens. Middle of a long chat is a needle in a haystack. Dumping 20 MCPs (~20k tokens each) makes Opus look stupid.
- **Mechanism:** Give procedures via skills the model *pulls when needed* (progressive disclosure). Compact / handoff / new session before the dumb zone. Do not blame the model first.
- **Evidence:** “If I had a fresh context… no way it would have made that mistake.”
- **Conditions:** Subjective; he will not bet Cherny on 250k. Will rot as models change.
- **Exceptions:** Short tasks that fit in the sharp zone can be one session.
- **Action:** Budget context like money. One job per session when the work is real.
- **Confidence:** high for “don’t dump”; numbers UNVERIFIED
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “large language models have what's called the dumb zone”
- **Epistemic:** SOURCE

### Multi-session assembly line, not one hero session
- **Claim:** Production-grade work should be many sessions with handoff documents (plan → implement → execution report → validate). Ralph loop = spec → phases → one agent per phase in a loop.
- **Reasoning:** You never know how much iteration a phase needs; one session will enter the dumb zone mid-phase-two.
- **Mechanism:** Orchestrator (even a simple loop) passes artifacts, not vibes. Sub-agents are fine for *research sprawl*, bad at durable handoffs. Agent teams: expensive, unrefined — Nate uses them as a **debate panel**, Cole as **adversarial** second session, not as the build OS.
- **Evidence:** Print/construction quote: inventory / vendors / PDF / margin check as separate workers. Nate underscoped that job once.
- **Conditions:** The work is larger than the sharp context zone or is business-critical.
- **Exceptions:** A small slice that fits should stay one session (don’t multiply agents for sport).
- **Action:** Break the job on paper first. One desk per phase. Handoff is a document.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “you can't have one agent handle that larger task without it getting into the dumb zone”
- **Epistemic:** SOURCE

### Pick when the model runs — as deterministic as possible
- **Claim:** Do not let Claude Code orchestrate the whole company. You choose when the LLM runs vs when code/CLI runs. Full determinism is “fundamentally impossible.”
- **Reasoning:** LLM-as-orchestrator = messy communication + token burn. Archon (his OSS) is the illustration — **on tape, not our install.**
- **Mechanism:** Workflow + skill + CLI; MCP only when you must (he now prefers CLI + skill as more token-efficient).
- **Evidence:** “Pick when the AI model works in a workflow, instead of having it drive the whole thing.”
- **Conditions:** You will write the skeleton, not hope the model invents it every time.
- **Exceptions:** Research/debate can stay non-deterministic on purpose (Nate’s war room).
- **Action:** Named steps. Model is a worker inside a step, not the CEO.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “as deterministic as possible”
- **Epistemic:** SOURCE

### Anything it can touch, assume it will
- **Claim:** Prompts are not a permission layer. If the agent can read or touch it, assume it will — even if you never ask. “Never wipe the DB” still can. Blocking `rm` / DELETE is the second false sense of security; it can write a script and run it.
- **Reasoning:** Same as a kid who doesn’t listen. Proactive misread is enough.
- **Mechanism:** Scoped keys; architecture that *cannot* send; hooks that inspect the tool call. Still hard to cover loopholes.
- **Evidence:** Nate: agent emailed the **entire list** a discount from a misread task; apology + team case study. Cole: Meta wipe — unverified gossip; smaller wipes he believes.
- **Conditions:** Send/delete/pay tools exist in the environment.
- **Exceptions:** None that matter. “I told it not to” is not a control.
- **Action:** Remove send. Scoped creds. Treat touch-surface as the threat model.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “anything that the agent can read or can touch, you have to assume that it will”
- **Epistemic:** SOURCE

### Every bug is a permanent upgrade
- **Claim:** Fixing and moving on wastes the only cheap training signal. Write the miss into CLAUDE.md / skill / plan template so it cannot happen the same way.
- **Reasoning:** Directing (vs using) *is* this habit. He welcomes bugs; smoothness makes him nervous (no upgrade).
- **Mechanism:** Nate’s email postmortem is the human version; do the same for the agent. After implement: “how could this go wrong?” → synthesize the bad input → break → fix → **retest** (the fix may not have fixed it).
- **Evidence:** Discount-email case study; code-review skill that asks what could go wrong.
- **Conditions:** You will spend the extra loop. Sycophantic “opinion” questions are the wrong tool; empirical break/fix is the right one.
- **Exceptions:** You cannot pre-cover all edge cases — that’s why the evolve loop exists.
- **Action:** After each failure: one DON’T + the check. Librarian persists.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “every bug becomes a permanent upgrade”
- **Epistemic:** SOURCE

### Skills + CLI beat a pile of MCPs
- **Claim:** Reusable work becomes a skill (recipe). Pair with a CLI so the agent has a token-cheap tool surface. Twenty MCPs at session start is how you buy a dumb Opus.
- **Reasoning:** Progressive disclosure: YAML/front matter decides *whether* to load the recipe. CLI is narrower than a tool-catalog dump.
- **Evidence:** Excalidraw skill, YouTube-script skill, PPT skill, browser-CLI skill; Archon as CLI+skill. Cole’s top three: skills, hooks, sub-agents. Nate’s: skills, status line, routines.
- **Conditions:** The task repeats. One-offs can stay prompts.
- **Exceptions:** MCP still “good”; he just thinks CLI is better for many platforms (CRM, GitHub).
- **Action:** Persist a useful run as a skill in *our* repo. Do not install his Claude skill hub.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “skills dictate everything” / “skill plus CLI”
- **Epistemic:** SOURCE

### You are the product manager — give the why
- **Claim:** Non-engineers direct by shaping vision and intent, not by specifying every how. “Intent engineering”: tell it *why* this exists; the how improves. Claude 4.8 docs (Nate, yesterday) say the same.
- **Reasoning:** Personifying feels cringe and works. Opinion-asks are sycophantic; why + empirical checks are not.
- **Mechanism:** Plan includes purpose. Grill-me questions until sure.
- **Evidence:** Close; Anthropic prompt docs named on tape.
- **Conditions:** Why is real (clog/leak), not theater.
- **Exceptions:** “Why” does not replace verification.
- **Action:** Problem + done + why, then delegate. Doctrine: don’t chat, manage.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “think of yourself like the product manager for Claude Code”
- **Epistemic:** SOURCE

### Someone else’s agent OS is not more control
- **Claim:** Cole will not run Open Claw or Hermes as the second brain. Building on the coding agent he understands beats adopting a popular wrapper.
- **Reasoning:** Those tools extend well, but you are living in their abstractions. Ground-up is daunting and more yours.
- **Mechanism:** His stack = Claude Code + his AI layer. Nate still uses routines/Open Claw for a **trading bot** (on tape: doing worse).
- **Evidence:** “You’re running something that you don’t understand.”
- **Conditions:** You will maintain the layer. Many viewers will still install Hermes — that’s the other tape.
- **Exceptions:** He admits those tools are powerful.
- **Action:** Hive already has Cursor + Grok + 17 desks. Do not add his OS *or* Claude Code.
- **Confidence:** high that he said it
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “I don't use open claw or Hermes”
- **Epistemic:** SOURCE

### “Better than 98%” is a title, not a measurement
- **Claim:** The video title asserts 98%. Nothing on tape is a study, a test, or a population.
- **Reasoning:** Same class as $100M: magnet.
- **Mechanism:** Cold-open list of tactics; no denominator.
- **Evidence:** Title + PACKET title; no method section.
- **Conditions:** Always.
- **Exceptions:** None.
- **Action:** UNVERIFIED. Do not repeat as FACT or as our bar.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — title “Better Than 98% of People”
- **Epistemic:** SOURCE (title) / INFERENCE (unmeasured)

### Sub-agents for research, not as the company
- **Claim:** Sub-agents are excellent to sprawl research and ground “what files does frontend vs backend touch.” They are a bad substitute for a written handoff across a long workflow.
- **Reasoning:** Communication between sub-agents is weak; agent teams try to fix it and burn tokens.
- **Mechanism:** Use them in planning; use documents between phases.
- **Evidence:** Cole ranks them #3; “dangers to using sub-agents.”
- **Conditions:** Planning / grounding.
- **Exceptions:** Tiny parallel lookups.
- **Action:** Do not spawn a nameless research swarm and call it done.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “it's hard to really make those communicate well”
- **Epistemic:** SOURCE

### Do not optimize the loop for speed
- **Claim:** He does not care if a job takes 30–90 minutes if the last artifact is right. First-pass mess is fine when the harness iterates.
- **Reasoning:** Speed-as-the-goal skips verify and security (leaked keys).
- **Mechanism:** Fire the job; work in another session or without an agent (record a video).
- **Evidence:** “I'm never optimizing for speed.”
- **Conditions:** The check exists. Infinite tokens are not the goal either (“not billions”).
- **Exceptions:** He doesn’t want it “unrealistically slow.”
- **Action:** Time-to-correct-artifact, not time-to-first-diff.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “I don't really care how long it takes”
- **Epistemic:** SOURCE

### Hooks are a control plane, not a ding
- **Claim:** Hooks run your code on session/tool events — security checks *and* memory promotion (end-of-session summary → daily log → “dreaming” into primary memory). Nate mostly uses a done-noise hook and knows he’s underusing them.
- **Reasoning:** Prompt policy is prose. A hook can refuse a tool call.
- **Mechanism:** Pre-tool inspect write/web/delete; still bypassable via scripts.
- **Evidence:** A hook fired live while he talked; Open Claw/Hermes memory described as “essentially a hook.”
- **Conditions:** You will maintain the hook list. Loopholes remain.
- **Exceptions:** QoL status-line/noise is fine and not a permission layer.
- **Action:** Steal the *idea* (gate + persist). Do not install Claude hooks. Hive equivalent: send-removed + wiki-ingest.
- **Confidence:** high
- **Source:** `RzLV8sfFdMM` @ UNKNOWN — “hooks is definitely number one”
- **Epistemic:** SOURCE

## C. Mental Models

- **Director, not user.** The job is the system around the model. **SOURCE**
- **Co-founder that must be trained.** Second brain / AIOS — same object, different names. **SOURCE**
- **Sandwich over slot machine.** Plan and prove are human; middle is delegated. **SOURCE**
- **Attention is scarce.** Million tokens is marketing; dumb zone is the operating constraint. **SOURCE**
- **Assembly line > genius intern.** Handoff documents, one phase each. **SOURCE**
- **Deterministic enough.** You pick when the model is allowed to think. **SOURCE**
- **Touch = will.** Prose “never” is not a control. **SOURCE**
- **Bugs are upgrades.** Smoothness is a smell. **SOURCE**
- **Explain ≠ opinion.** Sycophancy lives in taste questions; break/fix is binary. **SOURCE**
- **Cringe personification works** if you give why. **SOURCE**
- **98% is the magnet.** **INFERENCE**

## D. Procedures

1. **Write the plan first:** goal, why, success, validation, what may be touched.
2. **Grill:** agent asks until assumptions are gone. You answer. Do not skip to “go.”
3. **Load only the context that phase needs.** Skills pull; do not dump every MCP/skill.
4. **Optional research sub-agents** for stack / prior art. They do not ship.
5. **Sandwich build.** Agent implements against the spec.
6. **Verify as a user:** open the URL, render the PNG, run the margin math, play the path. First pass may be ugly.
7. **Iterate until last hand-back.** You judge the last artifact, not the journey.
8. **Security pass:** keys, send, delete. Assume it will if it can.
9. **Ask how this could go wrong.** Synthesize the bad input. Break it. Fix. **Retest.**
10. **Evolve:** one rule / skill / don’t from the miss. Persist in repo (our wiki/skills, not his CLAUDE.md).
11. **If the job is larger than the sharp zone:** split phases; handoff doc; new session per phase (Ralph-shaped). Do not run one hero context.
12. **If a tool is send/pay/delete:** architecture-remove or HITL. Hooks/prose are not enough.

**Qualify / frame:** This is a Claude Code masterclass + ClickUp ad, not a hive install guide. Cole is an engineer-YouTuber; Nate is the host.
**Objections:** “We have 1M context” → dumb zone + MCP dump. “I told it never to send” → discount email. “Sub-agents will orchestrate it” → handoff failure. “98%” → title.
**Avoid:** Claude Code / Codex / Hermes / Open Claw / Archon / ClickUp Brain as hive OS; trading-bot routines; quoting 92 / 250k / 98% as FACT.
**When to change:** If you cannot name the user-visible check, you are not ready to build.

## E. Examples

**Situation:** Cole needs a large architecture diagram for the podcast.  
**Action:** Excalidraw skill draws; skill renders PNG; vision finds overlap/padding; iterates until last hand-back.  
**Reasoning:** First pass will be a mess; the check is visual.  
**Outcome:** Usable diagram; he spoils that Claude made it.  
**Lesson:** Non-code work still needs a harness. Implicit rule: last artifact, not first.

**Situation:** Nate’s motion-graphics sometimes draw out of bounds.  
**Action:** Add verification; he claims **65–70 → ~92**. **UNVERIFIED.**  
**Reasoning:** Same physics as the PNG loop.  
**Outcome:** Higher first-pass quality *after* checks exist.  
**Lesson:** The number is marketing; the loop is the steal.

**Situation:** Print shop / construction needs a quote (100k flyers, remodel).  
**Action:** Split: inventory, vendor prices, PDF, polish; end check = required margin.  
**Reasoning:** One agent in one context will go dumb mid-workflow.  
**Outcome:** Assembly line. Nate: he underscoped this exact job — biggest agency failure.  
**Lesson:** Write the subtasks on paper before you scope. Implicit rule: quotes are many jobs.

**Situation:** Users bolt 20 MCP servers on.  
**Action:** Context fills with tool catalogs; Opus “acts super dumb”; they blame the model.  
**Reasoning:** Attention is scarce.  
**Outcome:** Bad results on the “best” model.  
**Lesson:** Skills problem, not model problem. Implicit rule: progressive disclosure.

**Situation:** Agent sees a task list, “helps,” emails the whole list a discount.  
**Action:** Change code, update page, apology email, team case study. Nate not mad at the person — mad at the control plane.  
**Reasoning:** It could touch send.  
**Outcome:** Live incident on his list.  
**Lesson:** Prompt “don’t send” failed. Implicit rule: remove send.

**Situation:** Block folder-delete; agent writes a script and runs it.  
**Action:** He names this as the third layer past prompt and SQL-block.  
**Reasoning:** Two-step bypass.  
**Outcome:** Still possible.  
**Lesson:** Permission theater. Implicit rule: assume creativity in the wrong direction.

**Situation:** Nate spins 7 personas to debate until consensus.  
**Action:** He reads; he may not obey. Token cost **4–10%** of a **$200** plan — **UNVERIFIED.**  
**Reasoning:** Avoid one model’s opinion.  
**Outcome:** Cole will try; warns against this for deep build (5-hour limit).  
**Lesson:** Debate is research, not ship. Implicit rule: don’t “don’t stop until they agree” unattended.

**Situation:** Cole’s second session is told to be mean to the first (adversarial development).  
**Action:** Devil’s advocate after build.  
**Reasoning:** Happy-go-lucky review misses problems.  
**Outcome:** He likes pitting models against each other.  
**Lesson:** Skeptical review is a named job. Implicit rule: the builder is not the only reviewer.

**Situation:** Hobby: vibe-code a game that runs at 60fps.  
**Action:** Engineer a harness that slows frames so the agent can think between moves.  
**Reasoning:** Agents need time; humans don’t at 60fps.  
**Outcome:** Illustration, not a product.  
**Lesson:** “How would the agent verify as a user?” is the design question.

**Situation:** Nate moves a trading bot from Open Claw to Claude routines.  
**Action:** It does worse (memory + market).  
**Reasoning:** Different harness, different memory.  
**Outcome:** On-tape experiment.  
**Lesson:** Do not operate a trading cron. Implicit rule: routines are not a strategy desk.

## F. Decision Rules

- If success is not written → do not build.
- If the only check is “read the code / looks good” → fail.
- If context is heading into the dumb zone → handoff + new session.
- If you are about to attach another MCP “just in case” → don’t; skill/CLI on demand.
- If the job has send/delete/pay → assume it will; remove or HITL.
- If a miss happened → persist a don’t + a retest; do not “just fix.”
- If someone quotes 98% / 92 / 250k as science → UNVERIFIED.
- If the request is “adopt Hermes/Open Claw/Claude as OS” → refuse (hive stack).
- Optimize: quality of last hand-back + one persisted upgrade.
- Refuse (this desk): Claude install, auto-send, auto-agents, trading routines, ClickUp Brain as hive.

## G. Contrarian

- Against “just prompt and pray”: director loop.
- Against “1M tokens means dump everything”: dumb zone.
- Against plan mode as the only way: he writes his own planning skill.
- Against Open Claw/Hermes as the second brain: control > popularity.
- Against sub-agents as orchestration: documents + phases.
- Against “I told it never to”: touch = will.
- Against optimizing for speed / first-pass beauty: last artifact.
- Against asking the model its opinion: ask it to explain or to break a test.
- Field assumes the title is a skill ranking. He taught a loop.

## H. Assumptions

**His:** Claude Code is what “most people use”; software-engineering discipline transfers to ops; hooks can be a real permission layer; Archon/Ralph are the future of harnesses; personifying + why helps; enterprise 4-hour trainings are a business.

**Ours:** Captions complete enough (15439 words). Diagram quality and 92/250k/98% **UNVERIFIED**. Survivorship: two growing YouTube channels. Domain: coding-agent pedagogy, not a local-pro book-flow. ClickUp/Glydo are ads.

**Falsifiers:** Dumb zone disappears in the next model; hooks get routinely bypassed (already admitted); sandwich still ships dark prod; debate panels just burn money; Ralph loops thrash without a human.

**Disagreement (keep labeled):** Hive will not install Claude Code, Archon, or his second brain. The **sandwich**, **user-visible check**, **touch=will**, **bug→don’t**, and **phase handoff** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What is the actual token curve for “dumb” vs marketing context? (He says subjective.)
- Did the Meta DB wipe happen? (He doubts it.)
- How often do hooks miss the script-bypass?
- Archon maturity — demo or production? Not shown.
- Nate war-room: does consensus improve decisions or just spend 4–10%?
- Trading-bot “worse on routines” — memory, model, or market?

## J. Connections

- **SYSTEM SYNTHESIS** → doctrine #5 manage don’t chat; #6 reject 70%; #7 if it has Send it will; #8 known-good pile; #4 don’ts list; #2 tool ≠ skill.
- **SYSTEM SYNTHESIS** → `golden-test-loop` + `click-live-site` (PNG/URL as the user).
- **SYSTEM SYNTHESIS** → `slice-build` (one phase) + `session-bootstrap` (dump then short loops).
- **SYSTEM SYNTHESIS** → `send-removed` / `ask-principal` (discount email).
- **SYSTEM SYNTHESIS** → `wiki-ingest` + `agent-job-card` (bug → permanent upgrade; named seats not agent teams).
- **SYSTEM SYNTHESIS** → `coverage-loop` (cron/routine = trigger + stop, not a personality).
- **SYSTEM SYNTHESIS** → `8ktcSaSTvxk` human success criteria / payload inspect — same physics, different guest.
- Do not force a Path A client out of a print-shop quote story.

## K. Future-Use

- Adversarial second-pass as a Watchdog job (unassigned).
- “How could this go wrong?” as a Forge checklist line (unassigned).
- Context-budget as a Day Planner CUT (unassigned).
- Skill+CLI vs MCP as a Researcher tool-note (on tape only).
- Ralph-shaped phase handoffs for large hive work (unassigned; still 17 desks, not a new orchestrator product).
- Status line as QoL — not a machine (Nate).

## Steal / Operate-never

### Machine: Plan-and-grill → sandwich build → user-visible verify → persist the miss
- **Epistemic:** SOURCE (loop, email, dumb zone, sandwich) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (a real job) → write goal/why/success/check → grill until assumptions die → load only this phase’s context → optional research sub-agents → agent builds → verify as a user (URL/PNG/test/margin) → iterate to last hand-back → security: if it can send/delete it will → “how could this go wrong?” + retest → write one don’t/skill into *our* repo → if work > sharp zone, split phases with a handoff doc.
- **Questions / signals:** “What does done look like?” “How will we prove it as a user?” “What can it touch?” “Are we in the dumb zone?” “What could go wrong?” “Did we retest?”
- **Qualify / frame / objections:** Claude Code class, not our stack. Frame: director, not installer. Objection: 1M tokens — dumb zone. Objection: “never send” — list email. Objection: 98% — title.
- **Procedure:** D steps 1–12. Checkable stops: (1) written success + check, (2) grill complete, (3) user-visible proof run, (4) send/delete still impossible or HITL, (5) one persisted upgrade or an explicit accept.
- **Example that proves it:** Vague “make the diagram” → PNG overlap loop → last hand-back. Contrast: discount email because send existed. Contrast: 20 MCPs → dumb Opus. Lesson: check and touch-surface define the system; the model is the middle.
- **Why it works:** Planning removes sycophantic builds. User-checks catch 70% “done.” Context discipline keeps the model sharp. Touch=will is the only honest threat model. Conditions: one operator who will grill and look. Exceptions: no cheap check (engineer one or don’t build); loophole scripts (defense in depth, still HITL).
- **Conditions / exceptions:** Cursor + Grok only. Claude / Codex / Hermes / Open Claw / Archon / ClickUp / Playwright-as-requirement stay on tape. Clients parked. 98% / 92 / 250k / $200 / 4–10% UNVERIFIED.
- **Operate-never payload:** Install Claude Code; auto-agents; auto-send; trading routines; quote 98% as FACT; new hunt; his second-brain OS.
- **Hive run (existing skills only):** `session-bootstrap` + `slice-build` (plan then one system) · `golden-test-loop` + `click-live-site` (user-visible) · `send-removed` + `ask-principal` (touch=will) · `wiki-ingest` (bug→upgrade) · `agent-job-card` (named reviewer ≠ builder) · `coverage-loop` (phase + stop) · doctrine skeptical review.
- **Source:** `RzLV8sfFdMM` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Claude Code / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Hermes / Open Claw / Archon / ClickUp Brain
- Auto-agents / auto-send / trading-bot routines
- Quote 98% / 92 / 250k / $200 plan / 4–10% as FACT
- New `icp_id` / unpark Normand / “AIOS” hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not install Cole’s cockpit.

- **Done** on a build slice: written why + success + a user-visible check that was *run* + send still impossible + one persisted don’t if it missed. A first-pass “looks good” is not done. A 98% slogan is not done.
- **Delegate without being asked:** Forge/Watchdog own the user-check and retest; HITL owns send; Librarian persists the don’t; Day Planner cuts dump-everything context; I do not stand up agent teams as a company.
- **Skeptical review:** “Better than 98%” is the title’s job. I will not approve Claude Code, a Ralph farm, or a debate panel that runs until the limit dies.
- **One system this take:** one sandwich loop with a look-as-user gate. Not “make the business Claude-native.”
- Live hunt stays parked. I do not rotate to print-shop quoting or ClickUp because a sponsor deck animated.
