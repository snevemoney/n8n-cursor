# Big Boss — 6cEQEba0i2A
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/6cEQEba0i2A/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Video (PACKET: 10:43, 2535 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (json3 present; no VTT in the take). Visual-only gaps: the token dashboard, Thork/Anthropic graphics, four-turn cache diagram, and the session-handoff demo are described, not seen.

Beats, in order:

1. Hook: **91 million** tokens saved in a day via cache read; **300 million+** in a week. Don’t freak out — automatic if you use Claude Code / Claude. **UNVERIFIED**.
2. Promise: 80/20 of prompt caching so you save session limits. Free **token dashboard**. Why sessions burn, how to stop it.
3. Cost: cached tokens = **10%** of normal input. 91M cached ≈ paying for ~9M. **UNVERIFIED**.
4. TTL: Claude **subscription / Claude Code** cache window = **1 hour**. Idle ≥1 hour → session un-caches. **API / sub-agents** TTL = **5 minutes** (can pay to bump to 1 hour). Cannot change the 5-minute default otherwise.
5. Thork (Anthropic): they alert on prompt-cache **hit rate** and declare **SEVs** if low. High hit: faster feel, lower serve cost, limits feel generous, long sessions practical. Low hit: lose-lose.
6. He finds Thork’s article overwhelming; wants 80/20 only.
7. Layers (Thork graphic): base system instructions **globally** cached; tools (read/write/bash/grep/glob) globally cached; per-project Claude.md / memory cached per project; session state; user messages grow each turn.
8. Four-turn example: turn 1 no cache (write). Turn 2+ (inside TTL) only new reply+message processed. Wait an hour **or** change system prompt → **full recache**. Expensive if you are on turn 16.
9. Dashboard language: **cache create** = first write (one-time, pays off next turn unless uncached). **Cache read** = reuse (10× cheaper).
10. Community confusion: extra-usage / over weekly limit → you are on **API billing** → default **5 min** TTL (“very dangerous”). People thought Anthropic silently switched sub TTL from 1h to 5m; he says they did **not**. Claude.ai web caching **undocumented**; he assumes like subscription, not 100% sure. Docs mix Claude Code and API.
11. **Three habits (~95% of people):** (1) don’t pause too long — if over an hour, **new session**; (2) start fresh on task switch — `/compact` **breaks cache**, or `/clear`, or his **session handoff skill**; (3) Claude chat: big docs → **project**, not paste (projects “probably more optimized”).
12. Handoff demo: project with **205,000** tokens. Skill summarizes work, files, open decisions, where to pick up. `/copy` → `/clear` → paste. Usually **<1 minute** vs slow compact. Feels like he lost nothing.
13. Mantra: keep it alive, keep it focused, start fresh when you switch.
14. What breaks cache: **model switch** (prefix match). `/model` mid-session recaches everything. **`/opus plan`** (Opus plan, Sonnet execute) = a model switch **every plan toggle** — “fresh cache.” He used to teach this as a token hack; now he warns it resets cache. Long-run it may still save; understand the reset.
15. Editing Claude.md **mid-session is safe** — edits apply on restart, cache stays.
16. Dashboard: local device (laptop ≠ desktop). GitHub repo via **free School / classroom / All YouTube resources**. Give the repo to Claude Code: “set this up on localhost”; pulls **past** sessions.
17. Handoff skill also in the free School.
18. Closer: know the 80/20; you do not need the full article if you are not on API that hard. Like / thanks.

Off-topic / not skipped: Skool magnet; Thork SEVs; 205k token session; opus-plan apology.

## B. Atomic Knowledge

### Cache hit is the silent session saver
- **Claim:** Cache reads cost ~10% of input; big “saved tokens” numbers are mostly this, automatic.
- **Reasoning:** You do not install a new product. You stop **breaking** the cache.
- **Mechanism:** Prefix match; create once, read later.
- **Evidence:** 91M / 300M / 10% spoken. **UNVERIFIED**.
- **Conditions:** Inside TTL, same model, same system prefix.
- **Exceptions:** First turn always creates. Sub-agents default 5 minutes.
- **Action:** Treat cache-break as a cost event. Do not quote 91M as FACT.
- **Confidence:** high for the shape; low for the millions
- **Source:** `6cEQEba0i2A` @ UNKNOWN — “cached tokens only cost you 10% of normal input”
- **Epistemic:** SOURCE — $ / counts **UNVERIFIED**

### TTL is two clocks, and people mix them
- **Claim:** Subscription/Claude Code = 1 hour. API and sub-agents = 5 minutes (API can pay for 1 hour).
- **Reasoning:** Over weekly limit you fall into API clock without noticing.
- **Mechanism:** Two TTLs; extra-usage territory.
- **Evidence:** He spends a long confusion section. Web Claude.ai = unknown.
- **Conditions:** Multi-session days, sub-agents, over-cap weeks.
- **Exceptions:** Rumor of a silent 1h→5m switch on subs — he says false.
- **Action:** Know which clock you are on. Hive analog: don’t leave an expensive thread idle, then dump a novel into it.
- **Confidence:** high that he taught two clocks
- **Source:** `6cEQEba0i2A` @ UNKNOWN — “cash window on a Claude subscription is an hour”
- **Epistemic:** SOURCE

### Three habits are the 80/20
- **Claim:** Don’t pause >1h (handoff instead). Don’t switch tasks in a fat session. Don’t paste big docs into chat — use a project.
- **Reasoning:** Most burns are idle, unfocused, or giant pastes — not missing a research paper.
- **Mechanism:** New session / clear / project files.
- **Evidence:** “three habits that cover 95% of people.” 95% **UNVERIFIED**.
- **Conditions:** Subscription-shaped work.
- **Exceptions:** API users need the 5-minute discipline harder.
- **Action:** Keep alive, keep focused, start fresh on switch.
- **Confidence:** high as procedure
- **Source:** `6cEQEba0i2A` @ UNKNOWN — “keep it alive, keep it focused, and start fresh when you switch”
- **Epistemic:** SOURCE

### Session handoff beats compact for him
- **Claim:** A skill writes a resume (work, files, open decisions, pickup). Clear. Paste. Usually under a minute. Compact is slow and **breaks cache**.
- **Reasoning:** You want a **new** prefix with the **substance** kept.
- **Mechanism:** Summarize → `/clear` → paste.
- **Evidence:** 205k token project demo.
- **Conditions:** The summary must be honest. A bad handoff loses decisions.
- **Exceptions:** He still lists `/compact` as an option; he just prefers handoff.
- **Action:** Steal handoff-as-artifact. `context-docs` / `session-bootstrap`. Do not take his School skill file.
- **Confidence:** high as his preference
- **Source:** `6cEQEba0i2A` @ UNKNOWN — “my replacement for doing /compact”
- **Epistemic:** SOURCE

### Model switch recaches the world
- **Claim:** `/model` or Opus-plan↔Sonnet-execute invalidates the prefix. Next request rereads the whole history cold.
- **Reasoning:** Each model has its own cache.
- **Evidence:** He apologizes for teaching opus-plan as a pure save. Long-run it may still win; each toggle is a cold start.
- **Conditions:** Any mid-session model hop.
- **Exceptions:** Claude.md edit mid-session does **not** break cache (applies on restart).
- **Action:** Pick the brain **before** the thread (`2OD14-0cot4` 80/20). Do not flip mid-flight to “save.”
- **Confidence:** high
- **Source:** `6cEQEba0i2A` @ UNKNOWN — “each plan toggle is a model switch and starts a fresh cache”
- **Epistemic:** SOURCE

### Changing the system prompt on a long thread is an expensive move
- **Claim:** System-layer change forces recache from turn 1. Brutal on turn 16.
- **Reasoning:** Prefix no longer matches.
- **Mechanism:** System / tools / output style at the base of the stack.
- **Evidence:** Four-turn graphic + “way over here on the right.”
- **Conditions:** Long conversations.
- **Exceptions:** Project-layer Claude.md mid-edit is deferred (safe now, applies later).
- **Action:** Don’t rewrite the constitution mid-boss-fight. New session + handoff.
- **Confidence:** high
- **Source:** `6cEQEba0i2A` @ UNKNOWN — “everything from the very beginning has to get fully recached”
- **Epistemic:** SOURCE

### Labs SEV their own hit rate because it is their cost too
- **Claim:** Anthropic pages itself if cache hit is low. High hit makes the product feel faster and the subscription feel bigger.
- **Reasoning:** Serve cost and user-felt limits are the same lever.
- **Mechanism:** Internal alerts (Thork quote).
- **Evidence:** Spoken. Not shown. **UNVERIFIED**.
- **Conditions:** Color on why caching is “automatic” and still worth understanding.
- **Exceptions:** Their SEV is not our runbook.
- **Action:** Remember generous-feeling limits can be a cache artifact (`3QclAjmu5Tw` weather).
- **Confidence:** medium
- **Source:** `6cEQEba0i2A` @ UNKNOWN — “declare SEVs if they’re too low”
- **Epistemic:** SOURCE

### Local dashboards do not travel
- **Claim:** Token dashboard is device-local. Laptop ≠ PC. It backfills from past session files once pointed at the repo.
- **Reasoning:** Visibility is good; do not pretend it is a cloud SSOT.
- **Mechanism:** Localhost + historical logs.
- **Evidence:** Spoken limitation + “not like you’re going to start fresh.”
- **Conditions:** One machine habit.
- **Exceptions:** School/GitHub distribution is a magnet, not a hive install.
- **Action:** Observe-only if Evens ever wants counts. Do not join School to get the repo.
- **Confidence:** high
- **Source:** `6cEQEba0i2A` @ UNKNOWN — “if you switch over to a laptop, then your dashboard is going to look different”
- **Epistemic:** SOURCE

### You do not need the whole paper
- **Claim:** Caching can be infinitely nuanced. Most people need the 80/20. He is not on API that hard.
- **Reasoning:** Stay updated; refuse depth that does not change behavior.
- **Mechanism:** Three habits + a few break rules.
- **Evidence:** Closer.
- **Conditions:** Knowledge-work users.
- **Exceptions:** Heavy API / sub-agent fleets need the 5-minute chapter.
- **Action:** Cheap brain for grunt includes “don’t study the whole cache paper.”
- **Confidence:** high
- **Source:** `6cEQEba0i2A` @ UNKNOWN — “most of the stuff right now, I just don’t need to know”
- **Epistemic:** SOURCE

## C. Mental Models

- **Breaks are the cost, not the sticker.** Idle, switch, model hop. **SOURCE**
- **Two clocks.** Hour vs five minutes. **SOURCE**
- **Handoff is a product.** Resume > compact. **SOURCE**
- **Prefix is sacred.** Model and system are the prefix. **SOURCE**
- **Deferred edits are safe.** Claude.md now, apply later. **SOURCE**
- **80/20 over Thork.** **SOURCE**
- **Visibility is local.** Dashboard ≠ truth across devices. **SOURCE**

## D. Procedures

1. **Before a long sit:** pick the model/brain. Do not plan to hop.
2. **Work inside the clock** (his 1h sub / 5m API). If you will idle past the clock → handoff now.
3. **One task per fat thread.** Switch task → handoff + clear.
4. **Handoff artifact:** what we did, files, open decisions, pickup line.
5. **Big documents** live in a project/folder, not a paste (`context-docs`).
6. **Do not `/opus plan` style hop** unless you accept a cold cache.
7. **Do not rewrite system prompt** on a long thread; new session.
8. **Optional:** look at create vs read if you have a local counter. Do not install his dashboard from School.

**Qualify / frame:** Claude token-hygiene tape + School magnet. Not a hive billing project.
**Objections:** “We should set up the dashboard” — magnet. “Opus plan saves limits” — he just apologized.
**Avoid:** Quote 91M / 300M / 10% / 205k as FACT. Join School. Compact-as-default without knowing it breaks cache.
**When to change:** If Evens is actually on metered API. Still Cursor + Grok.

## E. Examples

**Situation:** 91M cache-read day.  
**Action:** He opens with the number, then says it is automatic.  
**Reasoning:** Shock, then “don’t install anything.”  
**Outcome:** Viewer stays for habits.  
**Lesson:** The win is not breaking it. Implicit rule: millions are a hook, not a KPI we copy.

**Situation:** 205k-token HTML project, about to pause.  
**Action:** Handoff skill → copy → clear → paste.  
**Reasoning:** Compact is slow and breaks cache; he wants a clean prefix with memory.  
**Outcome:** “Right back where I was,” <1 min.  
**Lesson:** Resume artifact. Implicit rule: substance travels; the thread does not have to.

**Situation:** He used to teach Opus-plan / Sonnet-execute.  
**Action:** Apology: each toggle is a cold cache.  
**Reasoning:** Two models, two prefixes.  
**Outcome:** Viewers who copied the hack may have been recaching all day.  
**Lesson:** Yesterday’s save is today’s leak. Implicit rule: pick the brain first (`2OD14-0cot4`).

## F. Decision Rules

- If idle will exceed the clock → handoff, don’t sit.
- If the task changed → new session.
- If you want a different model → new session, not a mid-thread hop.
- If the doc is big → project/folder, not paste.
- If a $ or million-token number is on tape → **UNVERIFIED**.
- Optimize: hit rate via habits, not via a dashboard SKU.
- Refuse: School install, Claude Code, quote millions as FACT.

## G. Contrarian

- Against “compact is the professional move” — he replaced it.
- Against opus-plan as a free lunch (his own old video).
- Against reading the whole Anthropic cache paper.
- Against treating extra-usage as “still my subscription clock.”

## H. Assumptions

**His:** 1h/5m numbers are current; prefix-match model is enough; handoff summaries are faithful; 95% of people only need three habits; School is the distribution channel.

**Ours:** Captions complete enough (2535 words). All token millions and $ **UNVERIFIED**. Domain-specific: Claude Code. Hive analog is thread hygiene in Cursor, not his repo.

**Falsifiers:** TTL changed again. Handoff drops open decisions. Compact is faster/better on new builds. Local dashboard misreads logs.

**Disagreement (keep labeled):** We will not operate Claude Code or his School dashboard. The **handoff / one-task / pick-brain-first** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Exact Claude.ai web TTL? He does not know.
- Handoff skill quality vs a human-written resume?
- How often extra-usage silently flips people to 5 minutes?
- Sibling “token hacks” tape from `3QclAjmu5Tw` — do not invent id.

## J. Connections

- **SYSTEM SYNTHESIS** → `2OD14-0cot4`: pick engine before the thread; directory split vs mid-hop.
- **SYSTEM SYNTHESIS** → `3QclAjmu5Tw`: doubled bars still need hygiene.
- **SYSTEM SYNTHESIS** → `session-bootstrap` / `context-docs`: dump then short loops; judgment in files.
- **SYSTEM SYNTHESIS** → doctrine 11: cheap/expensive; don’t hop to save.
- **SYSTEM SYNTHESIS** → `EuzYhzB0vbI`: long loops have a cost; 12h often useless.
- Do not force a Path A client out of a cache lecture.

## K. Future-Use

- Handoff template as a Day Planner / Librarian artifact (unassigned).
- Create-vs-read as Money Desk observe-only (unassigned).
- “Old hack now a leak” log for Watchdog (unassigned).
- School classroom as a magnet pattern (learn; do not join).

## Steal / Operate-never

### Machine: Keep the thread alive and focused; hand off before the clock or the task dies
- **Epistemic:** SOURCE (three habits + handoff + model-switch) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (work starts) → pick brain/model first → one task per fat thread → if idle will pass the clock or the task changes → write handoff (done so far, files, open decisions, pickup) → new thread → paste resume → big docs in a folder not a paste → never mid-thread model hop to “save” → do not join School for a dashboard.
- **Questions / signals:** “Will I idle past the clock?” “Did the task change?” “Am I about to switch models?” “Is this a paste that belongs in a project?”
- **Qualify / frame / objections:** Claude cache tape. Objection: dashboard — magnet. Objection: opus-plan — he apologized.
- **Procedure:** D steps 1–8. Checkable stops: (1) brain picked, (2) handoff written before clear, (3) no mid-thread hop, (4) no School install.
- **Example that proves it:** 205k session → handoff <1 min → clear → continue. Counter: opus-plan toggle recaches the novel. Lesson: resume is the product; prefix hops are the leak.
- **Why it works:** Cache is prefix-shaped; idle and hops burn the cheap 10% path; compact throws the prefix without a good resume. Conditions: you know the clock. Exceptions: 5-minute API/sub-agents; web TTL unknown; millions unverified.
- **Conditions / exceptions:** Cursor + Grok only. Claude / School / his GitHub stay on tape. Clients parked.
- **Operate-never payload:** Install Claude Code; quote 91M/300M/10% as FACT; School join; compact-without-handoff as policy.
- **Hive run (existing skills only):** `session-bootstrap` · `context-docs` · `slice-build` (one system) · doctrine cheap/expensive · `ask-principal`.
- **Source:** `6cEQEba0i2A` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Claude Code / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote 91M / 300M / 10% / 205k / 95% as FACT
- New `icp_id` / unpark Normand / token-dashboard SKU
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not recache a novel because someone flipped a model to feel thrifty.

- **Done** on a session-hygiene slice: brain picked, one task, handoff written before a clear. A localhost dashboard from School is not done.
- **Delegate without being asked:** Day Planner kills zombie threads. Librarian keeps the resume. I do not approve opus-plan-style hops as a “hack.”
- **Skeptical review:** “Save you millions of Claude tokens” is the title. Those millions are **UNVERIFIED** and Claude-shaped. I will not approve a stack change to chase them.
- **One system this take:** handoff-before-clear. Not a token analytics product.
- Live hunt stays parked. I do not rotate to “AI cost ops” as a business.
