# Forge — U6k4MeVks_Y
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/U6k4MeVks_Y/transcripts/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/U6k4MeVks_Y/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Chase (Chase AI) **Claude Code beginner → intermediate → pro** road map. Caption-only (`transcripts/full.txt`). Visual/click **UNKNOWN** — he narrates desktop-app settings, browser pane, three landing versions, live `*.vercel.app`. Promise: replace 1,000+ hours trial-and-error UNVERIFIED. **Beginner:** where to run (web / desktop / terminal) — he now pushes **desktop** for non-technical (voice, browser automations, inline artifacts; terminal still inside the app). Settings: **global instructions blank** (rhyme-everything bar); capabilities = load tools when needed + turn the rest on; local sessions on; PRs off if you do not know git; Claude-in-Chrome needs the extension. New chat chrome: **Local** 99.99% (not cloud/remote/WSL/SSH); one folder; **main**, do not check worktree if you do not know git; plus = extra copy folder. Permissions: manual ↔ bypass; sit **auto** (classifier). Model: $20 plan ≈ Opus not Fable; Max $100/$200 ≈ Fable most of the time — prices + “half weekly usage is Fable” UNVERIFIED. Effort low→ultra; extra-high→ultra is not 10× quality; beginners medium/low; he sits Fable medium. **Prompting:** always **plan mode** for new work; microphone **stream of consciousness** + “ask what I’m not thinking about.” Demo: fake SaaS **Lighthouse**, small-startup audience, book-a-call CTA, clean light SaaS. Tech-stack question: do **not** smash Recommended forever — ask it to explain. Annotate the plan; **Accept and auto** (plain Accept drops you into manual). Sponsor: Chase AI Plus / updated masterclass. **Intermediate:** context window = 1M budget, 156k used in demo; performance drops as it fills; rule of thumb rethink at 30–40%, certainly 50%; `/clear` vs `/compact` vs + new chat **in the same folder** (files survive). First landing is generic (no visual context). In-app browser: select, comment, annotate. **Skills** = prompts that constrain a run; plugins ≈ bags of skills; official frontend-design; **skill creator** is the meta-skill (evals/benchmarks). GitHub URL → “add this skill.” Session → skill-from-history. One Pinterest SaaS screenshot + frontend-design → **three versions**; he picks V1 (V3 = “typical AI slop”). Outside apps: **connector / plugin / CLI** — pick one; CLI often more surface + ships skills. Talk-to-deploy: GitHub + Vercel from chat → live `lighthouse-site.vercel.app` UNVERIFIED. **Advanced:** long-horizon = trigger + task + success; `/goal` needs **objective done-when** (Ralph-like); subjective “looks cool” fails. Eternal loop adds **logging**; morning-brief example (YouTube/Twitter/Reddit/Gmail → report @ 7am) → skill → routine. **Graph** = nested micro-loops per step; usually overkill. Ultra Code = custom harness + many sub-agents; `/deep-research` example: 103 agents, 6M tokens on Fable UNVERIFIED; cap agents or route sub-agents to cheaper models. Dynamic-workflow shapes: classify-and-act, fan-out + adversarial, generate-and-filter / tournament, loop-until-done. **Model routing:** models do not grade themselves; official Codex plugin; his **grill-me + Codex** skill (up to five rounds). Custom “agentic OS”: visual wrapper is not the value; value = **skill map of your real work** + automations; Obsidian vault (raw / wiki / output) + **index.md at every level**; headless `claude -p`. Close: Chase Plus again. On-tape: Claude Code, Codex, ChatGPT/Soul, Vercel, GitHub, Obsidian, Gmail. Cursor + Grok only.

## B. Atomic Knowledge

### Plan mode + unknown-unknowns; do not smash Recommended
- **Claim:** New work starts in plan mode so the model is forced to ask questions. Prompting is a microphone dump, not a magic template. End with “what am I not thinking about?” Smash-Recommended forever makes you replaceable and leaves you unable to steer a unique project. You do not need to become a software engineer; you do need **AI software-engineering fundamentals** (what a stack is, when to pick which).
- **Reasoning:** Non-technical + out-of-domain = dark spaces. Plan mode lights them. Differentiation is understanding the question.
- **Mechanism:** Plan → questions (purpose, what it does, size, vibe, stack, CTA) → annotate/revise → Accept **and auto**.
- **Evidence:** Lighthouse dump → design/dev practice, product analytics, landing, clean light SaaS, fake booking form. He asks it to explain “tech stack.”
- **Conditions:** Desktop app; auto permissions; one local folder.
- **Exceptions:** Tiny already-specified edits may not need a full plan (not shown).
- **Action:** Steal plan + dump + unknown-unknowns + explain-the-question. Do not install Claude Code. One slice, not the whole SaaS.
- **Confidence:** high.
- **Source:** `U6k4MeVks_Y` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN (he narrates clicks)
- **Failed / retried:** none in plan; first build is ugly on purpose
- **Speech ≠ behavior:** none

### Context is a budget; files outlive the chat
- **Claim:** Tokens in + tokens out fill a ~1M window. Performance degrades as it fills (middle of a long chat is worst). Reassess ~30% (his personal), 40%, certainly 50%. `/clear` = empty; `/compact` = summary into a new chat; + in the same folder is also a new chat. Web-app fear (“if I leave, it forgets”) is wrong **if work is files**.
- **Reasoning:** Too much in the brain. Messages dominate vs tools/skills.
- **Mechanism:** Watch the breakdown; start a new chat; the folder is the memory.
- **Evidence:** 156k / 1M (~16%) after first build — he stays.
- **Conditions:** Folder-based harness, not a disposable web thread.
- **Exceptions:** Compact if you truly need the summary; he still prefers files.
- **Action:** Steal folder-survives-clear. Hive already: repo + `/clear` analog. Do not quote 1M/156k as FACT.
- **Confidence:** high on the rule; window size UNVERIFIED.
- **Source:** `U6k4MeVks_Y` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none
- **Speech ≠ behavior:** none

### Skills + one screenshot beat a vibe; outside apps = pick one pipe
- **Claim:** A skill is a prompt that makes a repeatable run less random. Skill creator is the skill that writes skills (and can eval). If several skills collide, name the one. One Pinterest ref + official frontend-design + “three divergent versions” → pick. Connectors / plugins / CLIs all mean “Claude can drive the other app”; CLI often more complete. When in doubt, ask the harness what exists and add it.
- **Reasoning:** First Lighthouse pass was generic because there was no visual context. Non-determinism is the default; skills add control.
- **Mechanism:** Drop image → invoke skill → three panes → choose V1. GitHub URL → “add this skill.” Session history → skill-from-run.
- **Evidence:** V1 liked; V2 colors; V3 slop. Then GitHub+Vercel pipeline from one prompt → live URL (he already had CLIs installed).
- **Conditions:** Skill installed; collision needs a nudge.
- **Exceptions:** Talk-to-deploy is operate-never for hive (publish HITL).
- **Action:** Steal visual-context + three-versions + pick-one-pipe. Do not auto-deploy. Do not install Vercel-from-chat.
- **Confidence:** high on context; deploy demo is a magnet.
- **Source:** `U6k4MeVks_Y` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** generic first pass
- **Speech ≠ behavior:** “just talk and it deploys” vs he already had CLIs

### Done-when, loops, graphs, and models that cannot grade themselves
- **Claim:** `/goal` without an **objective success test** is “looks cool.” Loop = trigger + task + success + (if eternal) **log**. Graph = the same loop at every step (YouTube scrape loop, Twitter loop, …) talking to each other — overkill for most. Ultra/deep-research can spawn 100+ agents and burn millions of tokens UNVERIFIED; cap count or route sub-agents cheaper. Models grade themselves as “great.” Second harness (Codex plugin / cheaper local) for adversarial review. Agentic OS = mapped skills + automations; Obsidian raw/wiki/output + index.md; wrapper is optional; `claude -p` is headless.
- **Reasoning:** Long work must survive context death. Subjective success cannot halt a loop. Self-improve needs something to compare against (ideally a score).
- **Mechanism:** Skill the brief → run manually until good → add “look at past logs” → routine at 7am. Deep-research: decompose → parallel search → 3-vote adversarial → synthesize (one run: 103 agents / 6M tokens UNVERIFIED).
- **Evidence:** Morning-brief thought experiment; deep-research report with 21 sources (narrated).
- **Conditions:** Objective criteria exist (five videos / five posts) or you accept mush.
- **Exceptions:** Graph usually unnecessary. Ultra is expensive on Fable.
- **Action:** Steal done-when + log + second-grader. Do not run 100-agent Ultra. Do not install Codex to grade Grok.
- **Confidence:** high on done-when; agent/token counts UNVERIFIED.
- **Source:** `U6k4MeVks_Y` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none shown for /goal
- **Speech ≠ behavior:** none

## C. Mental Models
Desktop is for non-technical; terminal is still there. Global instructions are a high bar — blank is correct. Auto permissions, not bypass, not babysit-manual. Chat is disposable; **folder is the known-good pile**. Skills are how you make a non-deterministic model repeatable. Context is money and IQ. Effort is not linear. Moat is understanding the question, not hitting Recommended. Long work needs a halt condition a machine can check. Builder must not grade builder. An “OS” is a skill map of work you already do, not a dashboard skin. Obsidian is a navigable file contract (indexes), not magic RAG.

## D. Procedures
1. Do not install Claude Code / Desktop / Codex / Chase Plus. Cursor + Grok.
2. One folder. Local. Do not touch worktrees until you know git.
3. Permissions: auto analog — not bypass. No Gmail send.
4. New slice: plan mode → microphone dump → “what am I not thinking about?” → annotate → accept into implement.
5. When the model asks a stack/architecture question: **explain it**, do not smash recommended.
6. Watch context. At ~30% ask whether to continue. New chat in the same folder. Files survive.
7. Ugly first pixels: add a reference + a design skill + ask for **three** versions; pick.
8. Outside system: connector or plugin or CLI — pick one. Ask the harness; do not cargo-cult all three.
9. Deploy / custom domain / Stripe live = HITL. Preview URL ≠ ship.
10. Long job: write an objective done-when. Optional log. Do not graph unless the steps independently fail.
11. Do not let the same model certify the same model. Second pass.
12. Skill-from-repeat only after a fixture exists. Do not auto-write SKILL.md from this tape.

## E. Examples
**Situation:** Fuzzy Lighthouse landing.  
**Action:** Plan + ramble + “ask what I missed”; then explain tech stack instead of Recommended.  
**Reasoning:** Unknown-unknowns; moat is learning.  
**Outcome:** Plan on the right; comments add mid-size companies; Accept and auto builds a generic page.  
**Lesson:** Plan before pixels; recommended-smash is a trap.

**Situation:** Page is lame.  
**Action:** One Pinterest SaaS shot + frontend-design + three versions; pick V1.  
**Reasoning:** Missing visual context, not missing “try harder.”  
**Outcome:** Departure from the generic pass.  
**Lesson:** Ref + skill + diverge-then-pick.

**Situation:** Wants a real URL.  
**Action:** One prompt: look up GitHub/Vercel CLI/MCP, add, connect, deploy.  
**Reasoning:** Harness drives apps better than a beginner dashboard.  
**Outcome:** `*.vercel.app` (he already had CLIs).  
**Lesson:** Talk-to-deploy is the magnet. Hive: preview ≠ prod. Publish HITL.

**Situation:** Deep-research on dynamic workflows.  
**Action:** Ultra/deep-research; 103 agents / 6M tokens narrated.  
**Reasoning:** Fan-out + adversarial before a hard project.  
**Outcome:** Long report, 21 sources.  
**Lesson:** Cap agents; do not quote the burn as FACT.

## F. Decision Rules
- IF non-technical → he recommends desktop (on-tape). Hive stays Cursor.
- IF instruction is not true for every chat → leave global blank.
- IF you do not know git → main, no worktree, PRs off.
- IF new project → plan + unknown-unknowns.
- IF you do not understand the multiple-choice → ask for the explanation.
- IF context ~30–50% → new chat in the same folder.
- IF first pixels are generic → you skipped visual context.
- IF multiple similar skills → name the one.
- IF outside app → pick one of connector/plugin/CLI.
- IF `/goal` success is “looks cool” → rewrite until a machine can fail it.
- IF the job is daily forever → add a log the next run can read.
- IF graph-shaped → usually overkill.
- IF Ultra without a cap → expect a token fire.
- IF the same model grades itself → add a second grader.
- IF you want an “OS” → map real tasks to skills first; wrapper last.

## G. Contrarian
Field pushes terminal-as-serious. He now pushes desktop for beginners. Field worships prompt templates; he wants a microphone. Field treats Recommended as speed; he treats it as a moat leak. Field fears `/clear`; he trusts the folder. Field builds graph OS on day one; he calls graph overkill. Field thinks the dashboard *is* the OS; he says the skill map is.

## H. Assumptions
1,000 hours, plan prices ($20/$100/$200), Fable weekly cap, 1M window, 103 agents, 6M tokens, live Vercel URL = **UNVERIFIED**. Speech≠behavior: deploy walkthrough assumes CLIs already present. Survivorship: he sells Chase Plus. Codex/ChatGPT as second graders stay on-tape. Clients parked.

## I. Questions
What is our objective done-when for the next long slice (not “looks cool”)?  
Which existing hive skill is the analog of “skill creator” without installing Anthropic’s?  
When does a second-model grade earn the tokens vs a human click-pass?

## J. Connections
SYSTEM SYNTHESIS: `iTY8Q449YNQ` roast / verify / session-handoff / `/goal`. `tDGiWn0flK8` plan + WAT + folder contract. `8QQ_INxAhRs` Four C’s + keys not prompts. `xn6Z5PYyAIE` reference image as first-class. `RLjaUES9P8A` Claude vs Codex bake-off (do not flatten). Hive: `session-bootstrap`, `slice-build`, `golden-test-loop`, `cinematic-recipe`, `click-live-site`. Cursor + Grok. No Claude Code / Codex / Vercel-from-chat.

## K. Future-Use
Blank global / high bar. Plan + unknown-unknowns. Explain-the-question. Folder survives clear. Three-versions then pick. One pipe to an outside app. Objective `/goal`. Loop = trigger/task/success/log. Graph = nested loops (rare). Second grader. Vault + index.md. All unassigned; no new skill file from this tape.

## Steal / Operate-never

### Machine: plan-dump-unknowns → one folder → visual context → three versions → pick
- **Epistemic:** SOURCE
- **Workflow / loop:** plan mode → stream of consciousness + “what am I missing?” → explain stack questions → accept → build → if generic, add ref+skill+3 versions → pick → new chat when context rot
- **Questions / signals:** Is this a new topic? Do I understand the multiple-choice? Do files exist if I `/clear`?
- **Qualify / frame / objections:** Recommended-smash = no moat. Bypass = scary. Worktree before git literacy = no.
- **Procedure:** D 2–7.
- **Example that proves it:** Lighthouse generic → Pinterest + frontend-design → V1.
- **Why it works:** Unknown-unknowns surface in plan; pixels need pixels; chat is cheap, files are not.
- **Conditions / exceptions:** Caption-only clicks UNKNOWN. Tape $ UNVERIFIED.
- **Operate-never payload:** Install Claude Code; one-shot the whole SaaS; mark preview done.
- **Hive run:** `session-bootstrap` + `slice-build` + `cinematic-recipe`. One landing, not the product.
- **Source:** `U6k4MeVks_Y` @ UNKNOWN

### Machine: objective done-when + log (+ optional second grader)
- **Epistemic:** SOURCE
- **Workflow / loop:** write halt test → run → compare → if fail, new iteration using prior → if eternal, write a log the next run reads
- **Questions / signals:** Can a machine fail this? Is “cool” in the success line?
- **Qualify / frame / objections:** Graph only if each step needs its own loop. Ultra without a cap is a burn.
- **Procedure:** D 10–11.
- **Example that proves it:** Morning brief needs countable sources or it cannot halt; deep-research 103/6M as the warning.
- **Why it works:** Loops without a test never stop; models bless their own homework.
- **Conditions / exceptions:** Token/agent counts UNVERIFIED. Do not install Codex.
- **Operate-never payload:** 100-agent Ultra as a product; auto-deploy; Gmail send.
- **Hive run:** `golden-test-loop`; proposed adversarial click-pass. No Codex plugin.
- **Source:** `U6k4MeVks_Y` @ UNKNOWN

### Operate-never
- Do not install Claude Code / Desktop / Codex / ChatGPT / Obsidian-as-required / Chase Plus.
- Do not talk-to-deploy (GitHub + Vercel from chat). Publish HITL.
- Do not bypass permissions. Do not Gmail send.
- Do not one-shot the whole site. Do not mark a `*.vercel.app` as shipped.
- Do not quote $20/$100/$200, 1,000 hours, 103 agents, 6M tokens, Fable cap as FACT.
- Clients parked. Cursor + Grok only.

## L. Role-Specific Applications
Forge steals **plan + unknown-unknowns**, **folder survives clear**, **ref + three versions**, **objective done-when**, **second grader**, **vault indexes**. Does not steal the desktop app, talk-to-deploy, Ultra-as-default, or Chase Plus. Overwrites the prior shallow steal-first take. Cursor + Grok.
