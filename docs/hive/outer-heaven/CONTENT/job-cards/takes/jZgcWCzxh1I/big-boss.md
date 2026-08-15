# Big Boss — jZgcWCzxh1I
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/jZgcWCzxh1I/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/jZgcWCzxh1I/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 16:31, 3,948 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: the HTML skill-ranking page, the 41-Haiku dashboard, the ladder diagram, Lovable site, and the JavaScript workflow file are described, not seen. Speaker: Nate Herk.

Beats, in order:

1. Demo: a “dynamic workflow” audited his skills. **41 Haiku** scoring agents in parallel → one Opus synthesis agent → HTML ranked worst-to-best with fix feedback and future-careful patterns.
2. Cost aside: “ton of input tokens” / “5 million input tokens” / not much output / “wasn’t super expensive.” Later: one workflow prompt burned **half of a $200/month** subscription and took **30+ minutes**. All **UNVERIFIED**.
3. Question: what is a workflow vs skills / sub-agents / agent teams / `{slash} goal`? Did they ship it to burn tokens?
4. Definitions: skill = reusable recipe. Sub-agent = parallel, own window, talks only back to main. Agent teams = small crew, talk to each other, task list, war rooms / councils. Workflow = Claude Code writes a **JavaScript file** that spins many alone-workers; results merge back. Plan lives in the script, not in the chat.
5. Ladder: more complexity / function → more risk / money. Confirm before a workflow runs; “takes a lot to get them to actually run.”
6. **Lovable sponsor** (on-tape): natural language apps, one-click connectors, publish to a live URL, analytics, MCP. He started sites in Lovable, later moved to “Cloud Code.” On-tape names: n8n, Claude, ChatGPT, Cursor, Codex, Open Claw, Hermes. Publish is a hard step on tape.
7. Ladder restated: main session → skills (repeat) → sub-agents (messy side task) → agent teams (crew that talks) → `{slash} goal` (loop until done=true) → dynamic workflows (width / 50+ horizontal).
8. His use: most of his Claude Code is automations / knowledge work, not app software. He does **not** think he will use workflows much. Features exist for heavy code (PR sweep, 400-file migration). Desktop-crawl example ate the tokens.
9. Know the **what**; you do not always need the **how**. Use it only if it solves a pain you have now. Seeing a feature ≠ falling behind.
10. Skill nests inside workflow (“skill is the how, workflow is the how many”). `{slash} goal` = depth / loop; workflow = width / plan-then-merge. Combining them is “a great way to burn money.”
11. Bound the scope, name the deliverable; put workers on Haiku. Vague `{slash} goal` loops because done is undefined.
12. `{slash} deep research` auto-invokes a workflow: parallel research, vote on claims, cited report.
13. Decision test: “Does this break into many pieces that can run individually at the same time?” If yes, try a workflow. Single edits / quick questions / knowledge work: no.
14. His audit prompt: grade global + project skills on clarity, front-matter pass/fail, trigger quality; one final agent ranks worst-to-best. He had to say **yes, run it**. Can view the raw script. `{slash} workflows` to watch / stop. Default save was global; he forced project `.claude/workflows`.
15. **Ultra code** = X-high effort + every prompt is a workflow; bypasses permissions; “very expensive.”
16. Word “workflow” rainbow-highlights; best invoke: “set me up a dynamic workflow to do this.”
17. One-slide recap + free Skool CTA (classroom / YouTube resources / 7-day challenge / AI OS course).

Off-topic / not skipped: sponsor publish button; MCP laundry list; “terminal boy” is the next tape.

## B. Atomic Knowledge

### A ladder, not a pile of same-shaped agents
- **Claim:** Skills, sub-agents, agent teams, `{slash} goal`, and dynamic workflows feel similar and are not the same. What changes is how many agents are in the loop and whether they can talk.
- **Reasoning:** Same recipe (skill) can run in any layer. The layer is width, talk, and who holds the plan.
- **Mechanism:** Skill = recipe. Sub-agent = isolated worker → main. Team = group chat + roles. Workflow = generated JS script, many mute workers, merge at end. Goal = loop until done=true.
- **Evidence:** He draws the ladder; he will not use workflows for knowledge work.
- **Conditions:** Use the lowest layer that fits. Exceptions: he cannot “confidently say” workflows cost more than teams; both can go rogue.
- **Action:** 17 named desks already are the team layer. Do not add a 41-agent workflow farm.
- **Confidence:** high for the distinctions; medium for his cost ranking.
- **Source:** `jZgcWCzxh1I` @ UNKNOWN — “what’s changing here is how many agents are in the loop, and if they can talk to each other”
- **Epistemic:** SOURCE

### Width vs depth; do not combine them casually
- **Claim:** `{slash} goal` is depth (keep going until a criterion is true). Workflow is width (many pieces in parallel, then synthesize). Combining them is powerful and a way to burn money.
- **Reasoning:** Goal without a named done loops. Workflow without independent pieces is overkill.
- **Mechanism:** One agent, many turns vs 50+ agents, one plan, merge.
- **Evidence:** Two visualizations he describes; desktop-crawl burned half a $200 plan (**UNVERIFIED**).
- **Conditions:** Parallel pieces that do not need each other. Exceptions: knowledge work / single edit → stay at main or skill.
- **Action:** Ask: does this break into many independent pieces? If no, refuse the wide job.
- **Confidence:** high
- **Source:** `jZgcWCzxh1I` @ UNKNOWN — “goal is a loop… workflow is more of a width play”
- **Epistemic:** SOURCE

### Bound the scope, name the deliverable, confirm before the farm runs
- **Claim:** Vague requests loop or spawn too many full-window calls. Each agent is a full model call. He had to explicitly say yes. Ultra code skips that caution.
- **Reasoning:** Input tokens dominate when many workers each read context. Specificity is the cost control.
- **Mechanism:** Named grade rubric + one synthesis agent + Haiku workers + human confirm + optional view-raw-script. Save the script in the **project**, not a hidden global folder.
- **Evidence:** 41-skill audit prompt; `{slash} workflows` monitor; he relocated files into the project.
- **Conditions:** Human still confirms. Exceptions: ultra code “bypasses a lot of those permissions.”
- **Action:** Confirm-before-wide is the checkable stop. Ultra / unsupervised parallel is operate-never.
- **Confidence:** high
- **Source:** `jZgcWCzxh1I` @ UNKNOWN — “bound the scope, name the deliverable” / “I had to explicitly say, yes, run it”
- **Epistemic:** SOURCE

### Feature ≠ you are falling behind
- **Claim:** Understand the what. You do not always need the how. Use it only if it solves a pain you have now. He will not use workflows much.
- **Reasoning:** Some features are built for heavy code (PR / 400-file migration), not automation/knowledge work.
- **Mechanism:** Ladder test + “does this break into many pieces?”
- **Evidence:** His own usage pattern; token-burn desktop crawl as a warning, not a recipe.
- **Conditions:** Honest about the job you actually run. Exceptions: deep-research slash as a named width job if you need cited parallel research.
- **Action:** Do not rotate the hive because a vendor shipped “dynamic workflows.”
- **Confidence:** high
- **Source:** `jZgcWCzxh1I` @ UNKNOWN — “that doesn’t always mean you need the how… or you’re falling behind”
- **Epistemic:** SOURCE

### Cheap workers, expensive synthesis
- **Claim:** Put the many scorers on Haiku; one final agent ranks / synthesizes (he used Opus).
- **Reasoning:** Width is token-heavy on input. Output was small. Synthesis is the expensive brain.
- **Mechanism:** 41 parallel Haiku → one Opus HTML.
- **Evidence:** Opening demo. $ / 5M tokens **UNVERIFIED**.
- **Conditions:** The pieces are independent and the merge job is named. Exceptions: he does not show the scores were good — only that an HTML appeared.
- **Action:** Doctrine already: cheap brain for grunt, expensive for calls. Do not run 41 expensive brains.
- **Confidence:** high as a pattern; low as a cost receipt.
- **Source:** `jZgcWCzxh1I` @ UNKNOWN — “all of those workers being on Haiku” / “one final agent ranks”
- **Epistemic:** SOURCE

## C. Mental Models

- **Ladder of risk.** Each step up buys talk or width and spends money / rogue-risk. **SOURCE**
- **Skill is how; workflow is how many.** Nest recipes; do not confuse them. **SOURCE**
- **Who holds the plan.** Chat holds it for sub-agents; the JS file holds it for workflows. **SOURCE**
- **Confirm is a feature.** You should not accidentally invoke a wide job. Ultra code deletes that feature. **SOURCE**
- **Know-what ≠ must-use.** Pain-now is the gate. **SOURCE**
- **Sponsor publish is not our publish.** Lovable one-click live URL stays on tape. **INFERENCE**
- **41 Haiku is a demo, not a headcount.** Hive already has 17 named desks. **SYSTEM SYNTHESIS**

## D. Procedures

1. Name the job (audit / research / migration) and the **single deliverable**.
2. Ask: does it break into many **independent** pieces? If no → main session or one skill.
3. If yes and you still want width: write the rubric (what to grade, who merges).
4. Put piece-workers on the cheap model; one named synthesizer.
5. **Confirm** before the farm runs. View the script if offered.
6. Watch the run; stop if it crawls past the named scope (desktop-crawl smell).
7. Checkable stop: ranked artifact exists **and** a human opened it. Do not treat “HTML appeared” as proof the grades are right.
8. Save the repeatable script in the **project**, not a hidden global folder.
9. Do not combine width + endless done-loop unless Evens names that risk.
10. CTA / Skool / Lovable publish stay off the hive weekday.

**Qualify / frame:** vendor-feature explainer + sponsor. Not a client SKU.
**Objections:** “We need dynamic workflows to keep up” — he said he will not use them much. “41 agents” — that is a skill audit demo, not a workforce.
**Avoid:** ultra code; unsupervised parallel; quoting $200 / 5M tokens as FACT; installing Claude Code.
**When to change:** if the job is one edit or knowledge work, step down the ladder.

## E. Examples

**Situation:** 41 skills need a grade.  
**Action:** Parallel Haiku scorers + one Opus ranker; human says yes; HTML worst-to-best.  
**Reasoning:** Independent files, named rubric, cheap width, expensive merge.  
**Outcome:** A page of ranks and fix notes. Cost claims **UNVERIFIED**.  
**Lesson:** Width only when pieces do not need each other. Implicit rule: confirm before spawn.

**Situation:** He asked a workflow to crawl the whole desktop / repos.  
**Action:** Many sub-agents search; session burns ~half a $200 plan (**UNVERIFIED**), 30+ minutes.  
**Reasoning:** Unbounded scope. Each agent is a full window.  
**Outcome:** Token shock used as a warning.  
**Lesson:** Bound the job or do not run width. Implicit rule: “search everything” is not a deliverable.

**Situation:** Word “workflow” appears in normal speech.  
**Action:** UI rainbow-highlights; it does not always invoke. He says “set me up a dynamic workflow to do this” when he means it.  
**Reasoning:** The word is overloaded.  
**Outcome:** Accidental invoke is reduced; ultra code still bypasses.  
**Lesson:** Explicit invoke + confirm. Implicit rule: do not live in ultra.

## F. Decision Rules

- If the job is repeatable → skill, not a new agent.
- If it is a messy side task → one sub-agent, not a team.
- If workers must debate → small named crew (we already have 17). Not a generated JS farm.
- If done is a criterion over time → goal/loop, with done named.
- If many independent pieces → width **after** confirm.
- If knowledge work / one edit → stay at the bottom of the ladder.
- If ultra / “bypass permissions” → refuse.
- Optimize: named deliverable + cheap workers + one synthesizer. Refuse: 41-agent hive, Claude Code install, tape $ as FACT.

## G. Contrarian

- Against “new feature = daily driver”: he will not use workflows much.
- Against “they shipped it to burn tokens”: he doubts that; still warns it will burn you if unbounded.
- Against “agent team and workflow are the same”: talk vs mute-merge; plan in chat vs plan in script.
- Field assumes more agents is more OS. He treats more agents as more bill and more rogue.

## H. Assumptions

**His:** Claude Code is the OS; Haiku is cheap enough for 41; HTML rank page is useful; Lovable is the on-ramp; Skool is the close; ultra code is a joke-and-warning.

**Ours:** Captions complete enough (3,948 words). Visual quality of the HTML and the 41-agent UI **UNVERIFIED**. $200 / 5M tokens / 30 minutes = **UNVERIFIED**. Domain-specific: vendor CLI, not a plumber book-flow. Cursor + Grok is the stack; his Claude Code / Lovable / Codex names stay on tape.

**Falsifiers:** Width job with a named deliverable still cheaper as one expensive brain. Confirm gate gets removed in the product (ultra as default). Rank HTML is wrong and nobody checks.

**Disagreement (keep labeled):** Hive will not operate Claude Code dynamic workflows or a 41-Haiku farm. The **ladder**, **bound-and-confirm**, and **cheap-width / expensive-merge** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Did anyone verify the worst-to-best ranks against a human grade?
- Where did the default global workflow files live, and who else can invoke them?
- What is the actual $ of 5M input vs “not super expensive”?
- Deep-research vote: what is the vote rule?
- Would he still say “I won’t use this” after a 400-file migration?

## J. Connections

- **SYSTEM SYNTHESIS** → doctrine #11 cheap/expensive brain; #5 manage don’t chat; #6 reject 70% (HTML ≠ checked).
- **SYSTEM SYNTHESIS** → `agent-job-card` (skill = recipe, not a new desk).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (one synthesis check over 41 votes).
- **SYSTEM SYNTHESIS** → `slice-build` (one audit, not “search the desktop”).
- **SYSTEM SYNTHESIS** → `ask-principal` (confirm before wide; publish stays HITL).
- **SYSTEM SYNTHESIS** → `interview-to-desk` (named roles, not generated hundreds).
- Sibling: later Opus 4.8 / ultra-code tapes (`q5lg3npxjAc`) — confirm before treating as a pair.

## K. Future-Use

- Skill-audit rubric (clarity / front matter / trigger / one highest-value fix) as a Librarian lint (unassigned).
- `{slash} workflows` monitor as a Watchdog surface analog (unassigned).
- Deep-research vote-on-claims as a Researcher pattern (learn only).
- “Rainbow word ≠ invoke” as a HITL naming lesson (unassigned).

## Steal / Operate-never

### Machine: Lowest ladder rung that fits → bound → confirm → cheap width / expensive merge
- **Epistemic:** SOURCE (ladder + audit + burn) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (big job) → name deliverable → test “many independent pieces?” → if no, skill/sub-agent → if yes, rubric + cheap workers + one synthesizer → human confirm → watch/stop → open the artifact → save recipe in the project.
- **Questions / signals:** “Does this break into independent pieces?” “What is done?” “Who merges?” “Did I confirm?”
- **Qualify / frame / objections:** Vendor feature tape + sponsor. “41 agents” is a demo. Objection: falling behind — he said know-what ≠ must-use.
- **Procedure:** D steps 1–8. Checkable stops: (1) deliverable named, (2) confirm, (3) human opened the HTML, (4) script in the project.
- **Example that proves it:** Skill audit → 41 Haiku + Opus rank → yes-run → HTML. Desktop crawl unbounded → half-plan burn (**UNVERIFIED**). Lesson: width needs a fence.
- **Why it works:** Independent pieces + named merge beats one chat swallowing 41 files. Conditions: confirm gate, cheap workers. Exceptions: knowledge work does not need this; ultra deletes the gate.
- **Conditions / exceptions:** Cursor + Grok only. No Claude Code / Lovable / Skool install. Clients parked.
- **Operate-never payload:** 41-agent farm; ultra code; quote $ as FACT; Lovable publish; nameless workers.
- **Hive run (existing skills only):** `agent-job-card` · `interview-to-desk` · `slice-build` · `golden-test-loop` · `ask-principal` · `wiki-ingest`.
- **Source:** `jZgcWCzxh1I` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Claude Code dynamic workflows / ultra code / 41-Haiku farm as hive OS
- Install Claude / Codex / ChatGPT / Gemini / Lovable / Coda / Vapi / Abacus / Skool
- Quote $200 half-plan · 5M tokens · 30 minutes as FACT
- Lovable one-click publish / n8n-MCP as hive
- New `icp_id` / unpark Normand / rotate hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not chat 41 scorers into existence.

- **Done** on a wide job: named deliverable + confirm + cheap workers + one synthesizer + human opened the artifact. A generated JS file is not done.
- **Delegate without being asked:** Watchdog treats “HTML appeared” as unverified; Forge rejects unbounded crawl; Librarian would own a skill-audit rubric if Evens keeps it; I do not add desks.
- **Skeptical review:** Dynamic workflows are a vendor width toy. I will not approve a nameless farm because a skill audit looked cool.
- **One system this take:** one bounded audit with a confirm gate. Not “use the new feature.”
- Live hunt stays parked. I do not rotate because Claude shipped a ladder.
