# Big Boss — kwSVtQ7dziU
Status: filled
Protocol: deep-video-learning
**Source:** `/Users/evenslouis/.grokbot/research-packets/watchlater-15-20260813/transcripts/kwSVtQ7dziU/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kwSVtQ7dziU/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Interview (PACKET title: “Skill Issue: Andrej Karpathy on Code Agents”; No Priors; captions `en`; ~15519 words). Visual-only: Steinberger tiled Codex, Dobby/WhatsApp home, jobs charts, microGPT. Host Sarah/Conviction. Outro: no-priors.com.

Beats, in order:

1. Cold open: “Code’s not even the right verb” — express will to agents ~16h/day. Agent/Claw layers taken for granted; next is many of them + optimize the instructions. “Everything is a skill issue.”
2. December flip: ~80/20 writing code → ~20/80 (then less) delegating. Hasn’t typed a line “probably since December.” Normal people have not noticed.
3. Capacity limit: if it fails, skill issue (instructions, memory, parallelization) more than missing capability. Peter Steinberger: many Codex tiles, ~20 min high-effort, 10 repos, macro actions (functionality, not a function), review as you care.
4. Waiting = start another agent. Token throughput is the new GPU-flops anxiety. Leftover subscription quota feels like unused GPUs. “What token throughput do you command?”
5. Mastery = up the stack: multi-agent teams, then persistent “Claw” (loops without you in the middle, sandbox, memory beyond compaction). OpenClaw/Peter: soul doc, personality, memory, WhatsApp as the one portal. Claude teammate vs Codex dry; sycophancy dialed so praise feels earned.
6. Dobby the elf (January “claw psychosis”): LAN scan finds Sonos (no password), lights, HVAC, shades, pool/spa, security. Change-detect → Quinn on camera → WhatsApp (“FedEx truck”). Six apps → one natural-language house. Customer of software becomes the agent; apps should be APIs. Treadmill app as the anti-pattern. This should be table-stakes in 1–3 years, no write-coding.
7. He did **not** give full email/calendar: suspicious, new, security/privacy. Distracted after a week.
8. Auto-research: remove yourself as the bottleneck; maximize tokens without being in the loop. NanoChat already hand-tuned for two decades; overnight loop found weight-decay / Adam-beta misses. Labs: idea queue + workers; humans should not enact. `program.md` *is* the research org; contest = same hardware, different markdown; meta-loop writes a better program.md. Onion: LLM → agent → Claw → many → instructions → optimize instructions. Infinite = psychosis.
9. Caveats: auto-research needs **objective, cheap eval** (same-behavior faster CUDA = perfect). Soft intent / when-to-ask is weak (RL on verifiable rewards). Jagged: brilliant systems PhD × 10-year-old. Joke still “atoms / make everything up” — not on the RL rails. Labs stuff a monoculture; he expects more speciation (Lean-math, smaller cognitive cores). Fine-tune-without-losing-capabilities is an undeveloped science vs cheap context.
10. Untrusted internet pool: expensive to find a commit, cheap to verify val-loss. Blockchain-ish commits, no money, leaderboard. Security: arbitrary code is sketchy. Folding@home / SETI analog. Swarm *might* run circles around trusted-lab compute. Donate flops to a track you care about (cancer). Information-market aside (Tehran photo $10 / Polymarket) — on tape; hive kill.
11. BLS jobs charts (2024 outlook): digital “ghosts” unhobble bits at light speed; atoms lag. Not a headcount forecast — demand elasticity. Guidance: keep up; jobs are task bundles; tool *now*; long-term uncertain; economists’ job. Engineering demand up locally = Jevons (ATMs → more branches → more tellers). Software cheaper → more demand. Long-term labs automate researchers (“glorified auto”).
12. Why not rejoin a lab (Noam’s question): outside = freer speech, aligned with humanity, not financially captured; inside = judgment doesn’t drift, you’re in the room but not in charge when stakes get high. Ideal: go back and forth. Open source ~6–8 months behind (was ~18). Linux analog: industry wants a safe common platform; capex makes it harder. Simple use-cases go local; frontier stays Nobel/Linux-to-Rust hard. Closed-only intelligence = systemic risk (Eastern European prior). Wants *more* labs / ensembles, not two people behind a door. “By accident we’re in an okay spot.”
13. Robotics: self-driving was first robotics app; most startups died on capex + time. Atoms ~million× harder; digital unhobbling first, then sensor/actuator **interfaces**, then physical TAM (maybe larger). Periodic (materials) / bio sensors / paid training data as “sensors.” Agentic web still missing price-for-a-photo mechanisms. *Daemon* book: humans as sensors/actuators of the machine.
14. microGPT: 200 lines = algorithm without efficiency complexity. He no longer explains to people — **explains to agents**; skill = scripted curriculum. Docs should be markdown for agents, not HTML for humans. Agent cannot *invent* the 200-line boil-down; it can teach it. “The things that agents can’t do is your job now.”
15. Outro.

Off-topic / not skipped: Conviction whispered-office; Jensen “we’re all busier”; Quinn; *Daemon*; Polymarket/Iran photo; BLS methodology unknown to him.

## B. Atomic Knowledge

### Failure is a skill issue until the metric says otherwise
- **Claim:** After the December capability jump, most “it doesn’t work” is instructions, memory, parallelization, or missing a macro-action — not a missing model. The operator is the binding constraint (token throughput).
- **Reasoning:** Typing-speed bottleneck died. Unused quota feels like idle GPUs. Steinberger’s tiles show work in 20-minute functionality chunks, reviewed in proportion to how much you care about that code.
- **Mechanism:** Many harnesses, many checkouts, non-overlapping functionality, review, start the next while you wait. Persistent Claw for work that should loop when you are not looking.
- **Evidence:** 80/20 → 20/80 → “haven’t typed a line since December.” Peter photo. “What token throughput do you command?”
- **Conditions:** The task can be stated as a macro-action. You can review or you accept the risk.
- **Exceptions:** Jagged failures and unevaluable work are *not* skill issues — see next atoms.
- **Action:** Manage macro-actions and review. Do not chat a line of code. Do not treat leftover context as rest.
- **Confidence:** high as his lived loop; 16h/day is lifestyle, not a hive KPI
- **Source:** `kwSVtQ7dziU` @ 00:00:27 — “everything is a skill issue” / @ 00:05:45 — “token throughput”
- **Epistemic:** SOURCE

### Auto-loop only where eval is cheap; `program.md` is the org
- **Claim:** Remove yourself as the in-loop researcher only when there is an objective metric. The org *is* markdown (roles, cadence, risk). You can run competing orgs and, later, a loop that rewrites the markdown.
- **Reasoning:** He had two decades of hand-tuning; an overnight loop still found interacting hyperparameters. Humans have too much (un)confidence to enact every idea. If you cannot evaluate, you cannot auto-research.
- **Mechanism:** Objective + bounds + go. Idea queue + workers. Feature branch, humans merge. Contest: same hardware, different program.md. Meta: feed what worked back into a better program.md.
- **Evidence:** NanoChat overnight finds. CUDA same-behavior-faster = “perfect fit.” Joke that never improved = off-rails.
- **Conditions:** Verifiable reward. Security if untrusted workers send code.
- **Exceptions:** Soft intent, taste, “when to ask” — RL-weak. Going too many onion layers while the thing still bursts at the seams is net-negative.
- **Action:** Definition of done *is* the metric. No metric → no unsupervised loop. Hive analog: golden smokes, not “let it cook.”
- **Confidence:** high
- **Source:** `kwSVtQ7dziU` @ 00:24:09 — “if you can't evaluate then you can't auto research”
- **Epistemic:** SOURCE

### Jagged models need a human for nuance and a deny-list for reach
- **Claim:** You are talking to a brilliant systems PhD and a 10-year-old in one body. Soft goals and clarifying questions fail. He still will not give a Claw full email/calendar.
- **Reasoning:** Labs improve what they can reward. Jokes (and taste) sit outside that. Dobby can LAN-scan a passwordless Sonos; that is power and a smell. Persistence without a deny-list is how you lose the house and the inbox.
- **Mechanism:** Personality/soul doc for the teammate feel; WhatsApp as one portal; keep high-risk surfaces off until the edges are not rough.
- **Evidence:** “Didn't want to give it like full access to my digital life yet.” Sonos open. FedEx WhatsApp. Sycophancy dialed so he tries to earn praise.
- **Conditions:** Local/home toys vs money/identity surfaces.
- **Exceptions:** He thinks the home pattern becomes free table-stakes in 1–3 years for less technical people — still not a send grant.
- **Action:** Ask-principal before any new surface. If it has Send (or ring, or LAN), assume it will.
- **Confidence:** high
- **Source:** `kwSVtQ7dziU` @ 00:16:03 — “didn't want to give it like full access” / @ 00:24:54 — jaggedness
- **Epistemic:** SOURCE

### Cheap to verify, expensive to find — keep a trusted checker
- **Claim:** Untrusted workers can search; a trusted pool only checks the candidate (val-loss, energy, tests). That is how a swarm could, in principle, beat a lab’s trusted compute.
- **Reasoning:** 10,000 dead ideas, one commit that trains. Folding@home shape. Arbitrary code you will run is “sketchy.”
- **Mechanism:** Commits that stack; proof-of-work = experiments; reward = leaderboard (no money on his design). Trusted verify. Do not romanticize the blockchain metaphor — he says not to push it.
- **Evidence:** Auto-research-at-home sketch. SETI/Folding analog.
- **Conditions:** The check is actually cheap and safe. The metric is not herdable/overfit (he flags herding; more metrics as coverage).
- **Exceptions:** No metric, or a metric that can be gamed, or code you cannot sandbox — then the swarm is a liability.
- **Action:** `golden-test-loop`: untrusted workers, keep only what a cheap check passes. Do not run stranger code.
- **Confidence:** high as a shape; “swarm beats labs” is speculation
- **Source:** `kwSVtQ7dziU` @ 00:33:48 — “untrusted pool of workers”
- **Epistemic:** SOURCE (shape) / INFERENCE (hive mapping)

### Your job is the few bits the agent cannot invent
- **Claim:** Education and docs redirect through agents. Humans keep the boil-down, the curriculum hints, the judgment that is not on the rails. Agents already teach the rest, soon better.
- **Reasoning:** microGPT is 200 lines once you strip efficiency. An agent can explain it three ways and cannot invent the 200. HTML-for-humans is the old library; markdown-for-agents is the new one. Skill = scripted progression.
- **Mechanism:** Write the bits you feel strongly about; let the agent route explanation to the reader’s language.
- **Evidence:** Failed attempt to have an agent write microGPT. “The things that agents can't do is your job now.”
- **Conditions:** The artifact is simple enough that an agent *gets* it once shown.
- **Exceptions:** He still thinks he can explain some things better *today*. He calls that a losing battle.
- **Action:** Job cards and skills are those few bits. Do not spend the week rewriting a lecture the agent can give.
- **Confidence:** high
- **Source:** `kwSVtQ7dziU` @ 01:03:13 — “I'm explaining it to agents” / @ 01:05:58 — “The things that agents can't do is your job now”
- **Epistemic:** SOURCE

### Digital unhobbles first; do not quote the jobs chart as fate
- **Claim:** Bits move ~million× easier than atoms. Digital professions will *change* (not automatically shrink). Software getting cheaper can *raise* demand (Jevons / ATMs). Robotics/physical lags and may be a bigger TAM later. Interfaces (sensors/actuators, labs, paid data) sit in between.
- **Reasoning:** BLS 2024 outlook is a coloring exercise for his own thought, methodology not fully known to him. Long-term is economists’ work. Labs are trying to automate the researcher.
- **Mechanism:** Keep up; treat AI as a tool on a task bundle *now*.
- **Evidence:** ATM/teller story. Self-driving graveyard. Periodic / bio sensors. Open source 6–8 months back as a power balance he likes.
- **Conditions:** Local to software/digital. Physical capex + conviction.
- **Exceptions:** He refuses a clean headcount forecast. Information-markets / betting examples are speculation.
- **Action:** No job-loss % as FACT. No betting SKU. Steal “tool on the bundle now” and “atoms lag.”
- **Confidence:** medium as forecast; high as “don’t treat the chart as proof”
- **Source:** `kwSVtQ7dziU` @ 00:42:23 — “Jevons paradox”
- **Epistemic:** SOURCE (Jevons/ATMs) / UNVERIFIED (BLS / 60% Linux / months-behind)

## C. Mental Models

- **Skill issue, not missing model** — until the eval says the model is the seam. **SOURCE**
- **You are the token bottleneck.** Unused quota is idle GPUs. **SOURCE**
- **Macro actions over repositories, not lines.** **SOURCE**
- **Persistence (Claw) is a different layer than a session.** **SOURCE**
- **Personality is load-bearing** (soul doc, earned praise). **SOURCE**
- **Software’s customer becomes the agent; expose APIs.** **SOURCE**
- **No eval → no auto-research.** **SOURCE**
- **Jagged: PhD × child.** Soft things stay off-rails. **SOURCE**
- **Org = markdown you can A/B.** **SOURCE**
- **Cheap verify, expensive search.** **SOURCE**
- **Outside the lab you can speak; inside you can see.** Ping-pong. **SOURCE**
- **Open-source-behind is a feature** (common platform, anti-centralization). **SOURCE**
- **Atoms lag; interfaces next.** **SOURCE**
- **Explain to agents; keep the few bits.** **SOURCE**
- **16h psychosis is the magnet, not a KPI.** **INFERENCE**

## D. Procedures

1. **State a macro-action** (a functionality, a research objective), not a line of code.
2. **Split non-overlapping work** across named workers; start the next while you wait.
3. **Review in proportion to care** (and to blast radius).
4. **If you want a loop without you:** write the metric, the bounds, and the `program.md`. If you cannot write the metric, do not start the loop.
5. **Keep a trusted check** (golden smoke, val-loss, click-through). Untrusted output is a candidate, not a merge.
6. **Deny-list reach:** no full mail/calendar/money until the edges are not rough. LAN toys ≠ inbox.
7. **Write the few bits** (job card, curriculum skill, boil-down). Let the agent teach the rest.
8. **For “what happens to jobs”:** task-bundle + tool *now*; do not publish a % .
9. **Hard step:** merge / pay / deploy / give-a-surface stay HITL.

**Qualify / frame:** research-and-harness interview, not a home-automation SKU and not a jobs forecast.
**Objections:** “Just let it run.” Answer: no eval, jagged, he withheld email. “Agents replace the desk.” Answer: few bits are the job; 17 named, not a tiled nameless farm.
**Avoid:** Claude/Codex/Claw as hive OS; WhatsApp house as product; betting/information markets; quoting BLS or 16h as FACT.
**When to change:** if the same loop wastes compute on an obvious miss, you are off-rails — stop, do not add tiles.

## E. Examples

**Situation:** He is waiting on one agent.  
**Action:** Open another tile / another harness; spend the quota.  
**Reasoning:** He is the bottleneck.  
**Outcome:** Macro-actions in parallel; review as he cares.  
**Lesson:** Waiting is a manage fail if another non-overlapping job exists. Implicit rule: leftover tokens are unused GPUs.

**Situation:** NanoChat already “fairly well tuned” by a two-decade researcher.  
**Action:** Overnight auto-research with an objective.  
**Reasoning:** Interacting hyperparameters are a search, not a vibe.  
**Outcome:** Finds he missed (weight decay, Adam betas).  
**Lesson:** Eval + bounds + go. Implicit rule: the human should not be the inner loop when the check is cheap.

**Situation:** Dobby finds Sonos with no password and plays the study.  
**Action:** He is amazed; still withholds email/calendar.  
**Reasoning:** Home APIs vs digital-life blast radius.  
**Outcome:** Six apps → one chat; inbox stays human.  
**Lesson:** Reach is a grant. Implicit rule: LAN success is not an identity grant.

**Situation:** Agent cannot invent microGPT’s 200 lines.  
**Action:** He keeps the boil-down; agents teach it.  
**Reasoning:** Efficiency complexity ≠ algorithm.  
**Outcome:** Education redirects through agents; his job is the few bits.  
**Lesson:** Write the skill/curriculum, not the lecture. Implicit rule: if the agent gets it, stop teaching it yourself.

## F. Decision Rules

- If there is no metric → no unsupervised loop.
- If work overlaps on the same files → do not dual-wield without a plan doc.
- If the surface is mail/money/identity → deny until asked.
- If output is from an untrusted worker → verify cheap, do not run wild code.
- If the task is “explain the library” → markdown for agents, not a new course.
- If someone quotes jobs % from this tape → UNVERIFIED; refuse as FACT.
- Optimize: tokens on evaluable macro-actions, humans on few bits + merge.
- Refuse (this desk): nameless tile farm as the company; Claw/WhatsApp OS; betting markets; 16h as a duty.

## G. Contrarian

- Against “the model isn’t good enough”: skill issue first.
- Against “stay in the research loop”: you are holding it back when eval exists.
- Against “one oracle model”: speciation, ensembles of labs, open-source-behind.
- Against “write docs for humans”: write for agents.
- Against “join the lab or matter”: outside can be the higher-impact seat; inside you are not in charge.
- Against “robots are next quarter”: atoms lag; digital unhobbles first.
- Field assumes more agents = more progress. He says the onion is infinite and the seams still burst.

## H. Assumptions

**His:** December flip is real and under-noticed; leftover quota is a moral fail; Claw+WhatsApp is the UX people already imagined; auto-research generalizes to any cheap eval; open-source-behind is a healthy balance; Jevons will hold locally for software.

**Ours:** Captions complete enough (~15519w). 16h / since-December / 6–8 months / 60% Linux / BLS bars = **UNVERIFIED**. Sonos-no-password is a demo smell, not a product. Domain-specific: frontier research + personal harness, not Path A.

**Falsifiers:** Unevaluable work “auto-researched” into mush. Untrusted commit is malicious and the check misses. Full-inbox Claw leaks. Jevons fails and software headcount collapses (he already says long-term is uncertain). Agent invents a simpler microGPT and his “few bits” shrink.

**Disagreement (keep labeled):** Hive will not operate Claude/Codex/Claw/WhatsApp or a betting data-market. The **macro-action + eval-or-no-loop + trusted check + deny-list + few-bits** machines are still stolen. 17 named desks, not Steinberger’s anonymous tiles. **SYSTEM SYNTHESIS**

## I. Questions

- What is his actual review checklist when he “doesn’t care much” about the code?
- How does he detect he is in a wrong-loop (the 10-year-old) besides frustration?
- program.md contest — did it run, or only proposed?
- Quinn + camera: what is the false-positive rate? (not on tape)
- Sibling Conviction / OpenClaw tapes — do not invent ids.

## J. Connections

- **SYSTEM SYNTHESIS** → Big Boss: manage don’t chat; define done (the metric); skeptical review; delegate without being asked (start the next tile).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (untrusted workers, cheap check).
- **SYSTEM SYNTHESIS** → `agent-job-card` / `interview-to-desk` (program.md = roles).
- **SYSTEM SYNTHESIS** → `ask-principal` / send-removed (no full digital life).
- **SYSTEM SYNTHESIS** → doctrine #11 cheap/expensive brain; #6 reject 70%; #8 known-good pile.
- **SYSTEM SYNTHESIS** → `EzQAgnjTq2k` (width ≠ risk; factory/org as code).
- **SYSTEM SYNTHESIS** → kill list: betting / prediction markets; job-loss % as FACT.
- Do not force a home-automation ICP.

## K. Future-Use

- program.md A/B as a Forge experiment on one desk’s instructions (unassigned).
- Soul/personality as a job-card tone line (unassigned; not sycophancy).
- “Explain to agents” as Librarian default for skills (unassigned).
- Sensor/actuator interface companies as a later research bucket (unassigned; not this cycle).
- Ensemble-of-labs as a Watchdog stance on single-vendor lock (unassigned).

## Steal / Operate-never

### Machine: Macro-action + metric → parallel named workers → trusted check → human keeps the few bits
- **Epistemic:** SOURCE (interview) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (capability jump / idle quota / research objective) → write the macro-action and, if looping, the metric + bounds + program.md → split non-overlapping work to named workers → spend tokens (start the next while you wait) → cheap verify (golden / val-loss / click) → merge only what passes → deny mail/money/identity until asked → humans write only the bits agents cannot invent → if no metric, stay in the loop yourself.
- **Questions / signals:** “What is the macro-action?” “What is the eval?” “Does this overlap?” “Is this reach we have not granted?” “Is this a few-bit or an agent-explain?”
- **Qualify / frame / objections:** Harness doctrine, not a Claw SKU. Objection: let it run overnight — answer: only with eval; he still withheld email. Objection: more tiles — answer: onion is infinite; seams still burst.
- **Procedure:** D steps 1–8. Checkable stops: (1) macro-action written, (2) metric or explicit no-loop, (3) non-overlap, (4) trusted check run, (5) deny-list intact, (6) few bits written down.
- **Example that proves it:** Overnight NanoChat finds vs Dobby-without-inbox vs agent-cannot-write-microGPT. Lesson: loop what you can check; grant reach separately; keep the boil-down.
- **Why it works:** Search is wide; verify can be cheap; humans are the slow inner loop *and* the only source of unevaluable judgment. Conditions: evaluable work, named workers, a deny-list. Exceptions: jagged soft tasks; untrusted code; physical/atoms work.
- **Conditions / exceptions:** Cursor + Grok only (Claude / Codex / Claw / WhatsApp / Quinn stay on tape). No auto-merge. Clients parked. 16h / BLS / months-behind UNVERIFIED.
- **Operate-never payload:** Nameless tile farm; Claw/WhatsApp house as hive OS; full-inbox grant; run stranger commits; betting/information markets; job-loss % as FACT; 16h psychosis as a duty.
- **Hive run (existing skills only):** `interview-to-desk` · `agent-job-card` · `golden-test-loop` · `ask-principal` · `slice-build` (one loop, not the whole onion) · `click-live-site` (verify) · doctrine cheap/expensive brain.
- **Source:** `kwSVtQ7dziU` @ 00:24:09

**Operate-never (this desk will not operate — still walked the tape):**

- Claude / Codex / Claw / WhatsApp as hive OS
- Unsupervised auto-research on unevaluable work
- Betting / Polymarket / “pay $10 for a Tehran photo” SKU
- Quote 16h / job-loss % / BLS bars / 6–8 months as FACT
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- New `icp_id` / unpark Normand / home-automation hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not tile ten Codex windows and call that a company.

- **Done** on an agent slice: macro-action written + metric-or-explicit-no-loop + a trusted check run + deny-list intact. “We spent the quota” is not done.
- **Delegate without being asked:** Forge/Watchdog own the cheap check; Librarian owns the few bits; HITL owns merge and any new surface; I do not add a nameless 18th tile because Peter’s monitor looked full.
- **Skeptical review:** Skill-issue is empowering and a way to never stop. I will not approve 16-hour psychosis or a passwordless LAN agent as proof we should open Gmail.
- **One system this take:** one evaluable loop with a program.md. Not the whole onion.
- Live hunt stays parked. I do not rotate to robotics or information markets because atoms are “a bigger TAM.”
