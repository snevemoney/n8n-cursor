# Big Boss — ehg4fhydTgs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 16:27, 3970 words, captions `en-orig` json3). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: desktop scheduled-task UI, cloud env vars, trusted-domain list, ClickUp/YouTube run history, 0/15 usage.

Beats, in order:

1. Dateline April 14: Claude tweet — **routines** in research preview. Configure a prompt once; run on a **schedule**, **API**, or **event**; runs on Anthropic’s web. Laptop can close.
2. Surfaces: terminal scheduled remote agents; claude.ai/code (he has three web routines); desktop app — four **local** vs four **remote** (GitHub-repo) tasks. New task: name, prompt, model, repository, cloud environment, cadence (hourly / daily / weekdays; **minimum 1 hour**), connectors (Slack/Gmail/…) or raw API keys, permissions.
3. Design constraint: **one-shot**. You are not around. If it must ask you, the automation is pointless.
4. Gotchas — he migrated and they did **not** just work.
5. Test 1 — ClickUp ping, **no** ClickUp connector. Needs a **GitHub repo** to clone (reads `claude.md`, scripts, skills); clone is **destroyed** after. `.env` is gitignored → keys missing. Fix: **cloud environment** env vars (YouTube, ClickUp, …). Network access default **trusted** (Anthropic-verified downloads only); ClickUp needed **full**. Then the test message sent.
6. Routine = someone typing your prompt into Claude Code for you. Same interaction; must be specific enough to one-shot.
7. Test 2 — YouTube Data API: 50 recent comments → bullet rundown → ClickUp. First run looked for `.env`, failed. Even a follow-up failed. Prompt update: “key is an environment variable… don’t look for a `.env`.” Then it fetched. He will migrate real automations later; this was a test.
8. Test 3 — Playwright CLI / Skool “Wins Engagement.” Copied local prompt + a snippet. Failed: remote has **no cookies**; each run is **stateless**; clone dies. Needs an auth form the cloud can hold (API key / header / cookies-as-secret). Exception: if it changes the codebase, it **opens a branch** / leaves output instead of deleting everything.
9. Recap knobs: specific prompt, model, GitHub repo, cloud env, schedule, connectors, permissions.
10. Limits: Max **$200/mo** plan → **15** included routine runs/day (he is 0/15; tests may not count the same). Pro “maybe three or five.” Later in the doc: Pro **5**, Max **15**, Team/Enterprise **25**; extra usage can overage. **$ / quotas UNVERIFIED.**
11. Thin-repo warning: a fat `claude.md` / huge project (Herk2) will drain session limits the same as an interactive chat. Maybe **one repo per routine**.
12. Triggers: schedule, API POST from another automation, GitHub (PRs, pushes, issues, releases).
13. Compare table: routines (cloud, laptop off, no local files, fully autonomous, 1h min) vs desktop scheduled (machine on, local files, configurable prompts) vs `/loop` (session-bound, dies on restart, can be every minute).
14. Do not push `.env` even to private (history, collaborators). Network: trusted / full / none / custom. **Setup script** runs before Claude launches (packages). Trusted vs full: full can be tricked into exfiltrating if it reads malicious content; trusted blocks unknown outbound. “Practical risk for private repos you control is very low” — he still names it.
15. Connectors = OAuth (Slack/ClickUp), different from env keys. Runs **as you**. Test before hourly. Fail → history; optional Slack-on-fail. **Run now** to watch, interrupt, inject, then trust the next shot.
16. Resources: 4 vCPU / 16 GB / 30 GB disk per run. Persist: GitHub branches + session history. Destroy: the clone. Rule: if it is only local and not in the repo or an API, it will not work.
17. Prompt quality: order-of-operations + a named skill beats a mushy “analyze comments.”
18. Why it beats “normal automation”: keeps **WAT** (workflows + agents + tools). A cloud Python script drops the agent. Here the agent reads `claude.md`, self-corrects, can leave a memory trail even though runs are stateless.
19. FAQ speed-run: no cron syntax; no local files; choose model; watch via run-now; connectors ≈ MCP; teammates cannot use your routines (team-plan share untested); cost = normal subscription usage; failures stored.
20. CTA: migrate scheduled tasks so hardware can sleep. Like. Skool doc.

Off-topic / not skipped: Skool cookie scrape; ClickUp as the ping target; $200 Max.

## B. Atomic Knowledge

### Unattended work must be a one-shot with secrets in the *run* env, not the repo
- **Claim:** Remote routines clone git, ignore `.env`, die after. Keys live in the cloud environment. Tell the prompt where the key is or it will hunt `.env` and fail.
- **Reasoning:** You are not there to answer. Stateless + gitignore is the whole bug.
- **Mechanism:** Cloud env vars + explicit “use the environment, don’t look for `.env`.” Trusted vs full network.
- **Evidence:** ClickUp worked after full + env. YouTube failed until the prompt named the env var.
- **Conditions:** Repo is the only filesystem. Cookies/local Playwright do not travel.
- **Exceptions:** Code-changing runs can leave a branch. Local scheduled tasks still have the laptop files.
- **Action:** HITL analog: no unattended send until the prompt one-shots in **run now**. Never commit secrets. We do not operate Claude routines.
- **Confidence:** high
- **Source:** `ehg4fhydTgs` @ UNKNOWN — “Don’t look for a .env”
- **Epistemic:** SOURCE

### Test with “run now” until it cannot ask you
- **Claim:** First migrations fail. Watch a run, inject, correct the prompt, then schedule. If it must ask, it is not an automation.
- **Reasoning:** Hourly unattended is how you ship a bad ClickUp ping or a comment-scrape forever.
- **Mechanism:** Run now → history → edit prompt/env/network → repeat. Optional fail-Slack (that send is still a send).
- **Evidence:** YouTube 12:41 fail vs later success. Skool cookie fail he *did not* schedule around.
- **Conditions:** Preview limits (15/day Max on tape).
- **Exceptions:** He has not run the real schedule yet (0/15).
- **Action:** `golden-test-loop` + `ask-principal`. Unattended ≠ untested.
- **Confidence:** high
- **Source:** `ehg4fhydTgs` @ UNKNOWN — “you should test it multiple times before it goes live”
- **Epistemic:** SOURCE

### Thin the context you clone
- **Claim:** The routine reads the whole repo / `claude.md` and bills like a chat. A fat OS repo is the wrong clone for a comment rundown.
- **Reasoning:** You pay session limits either way. Extra context is not extra quality on a one-shot.
- **Mechanism:** Maybe one GitHub repo per routine; put only what the job needs in `claude.md`.
- **Evidence:** Herk2 as the anti-pattern he names.
- **Conditions:** Knowledge-work OS with “tons of context.”
- **Exceptions:** A code-review routine may *want* the real repo.
- **Action:** `slice-build`: one job, one thin package. Same as `XTBWVVcF3Pk` routing.
- **Confidence:** high
- **Source:** `ehg4fhydTgs` @ UNKNOWN — “maybe you don’t want to put that repo into the cloud”
- **Epistemic:** SOURCE

### Local state (cookies, laptop files) does not survive a cloud clone
- **Claim:** Playwright + Skool cookies worked locally and died remotely. If auth is not in env/API/connector, the run is fiction.
- **Reasoning:** Destroy-after-run is the product. Stateless is the rule of thumb he repeats.
- **Mechanism:** Move to an API/header/cookie-secret the cloud env can hold — or keep that job **local** (machine on).
- **Evidence:** Skool wins automation fail. Compare table: routines have no local file access.
- **Conditions:** Sites with no API (he also built a Skool CLI on `YHk45NEpspE` — still operate-never).
- **Exceptions:** Branch-leaving code jobs.
- **Action:** Do not “migrate” a cookie scrape. Do not operate Skool.
- **Confidence:** high
- **Source:** `ehg4fhydTgs` @ UNKNOWN — “there’s no cookies… every single one of these runs is going to be stateless”
- **Epistemic:** SOURCE

### Full network is a real exfil path he names and then downplays
- **Claim:** Trusted blocks unknown outbound. Full is required for some APIs. Malicious content in a run could send data out.
- **Reasoning:** Unattended + full + “runs as you” is a send-shaped risk.
- **Mechanism:** Access levels; custom allow-list as a middle path he mentions.
- **Evidence:** ClickUp needed full. He says practical risk is low on private repos you control.
- **Conditions:** Research preview; his threat model is light.
- **Exceptions:** He still “wanted to at least acknowledge that.”
- **Action:** Watchdog: unattended + full network is a HITL architecture issue, not a vibe. We do not turn it on.
- **Confidence:** high that he said it; medium on “very low”
- **Source:** `ehg4fhydTgs` @ UNKNOWN — “tricked into sending data to an external server”
- **Epistemic:** SOURCE

## C. Mental Models

- **Unattended = one-shot or it is theater.** **SOURCE**
- **The clone is not your laptop.** **SOURCE**
- **Secrets in the run env, never in git history.** **SOURCE**
- **Fat OS context is a bill on a small job.** **SOURCE**
- **Keep the agent in the loop (WAT), but test before the clock.** **SOURCE**
- **15/day and $200 are magnets / dated quotas.** **INFERENCE**
- **“Laptop off” is the sell.** **INFERENCE**

## D. Procedures

1. **Write the one-shot** with order of operations and “keys are in env, not `.env`.”
2. **Put only the needed repo** (or a thin repo) on the clone.
3. **Put secrets in the run environment.** Do not push `.env`.
4. **Pick the smallest network** that works (trusted → custom → full).
5. **Run now** until it finishes without asking. Read the history.
6. **If it needs cookies/local files → do not migrate.** Keep local or drop the job.
7. **Only then** attach a schedule. Fail-notify is still a send (HITL).

**Qualify / frame:** Claude-routines tape, not a hive scheduler SKU.
**Objections:** “Just copy the local prompt” — Skool cookies prove that lie. “Trusted is enough” — ClickUp needed full on his tape.
**Avoid:** Claude routines; auto-ClickUp/Slack; Skool scrape; quote 15/day as ours.
**When to change:** if run-now still asks a question, do not schedule.

## E. Examples

**Situation:** ClickUp test without the connector.  
**Action:** Env vars + switch trusted → full; one-shot “send a message in the internal channel.”  
**Reasoning:** Clone has no `.env`; trusted blocked the API.  
**Outcome:** Test message delivered.  
**Lesson:** Unattended needs env + network + a prompt that cannot stall. Implicit rule: first run will fail.

**Situation:** YouTube comments analysis.  
**Action:** Same keys already in env; prompt still hunted `.env` until he forbade it.  
**Reasoning:** Interactive habit leaks into the one-shot.  
**Outcome:** Fail at 12:41; success after the sentence.  
**Lesson:** Tell the unattended worker *where* the secret lives. Implicit rule: copy-paste from local is incomplete.

**Situation:** Skool wins via Playwright cookies.  
**Action:** Copy local prompt to remote; it dies.  
**Reasoning:** Stateless clone, no cookie jar.  
**Outcome:** He does not pretend it migrated.  
**Lesson:** Local state jobs stay local — or get a real API. Implicit rule: we still do not operate the Skool path.

## F. Decision Rules

- If a human must answer → it is not a routine.
- If the secret is only in `.env` / cookies → remote will fail.
- If the repo is an OS dump → thin it or do not clone it.
- If network must be full → name the exfil risk; do not treat “low” as a control.
- If run-now has not passed twice → do not attach the clock.
- Optimize: unattended success on a thin job.
- Refuse: Claude routines as hive OS; auto-send Slack/ClickUp; Skool; quote $200 / 15 as FACT.

## G. Contrarian

- Against “cloud Python is the grown-up migrate” (he wants the agent to stay).
- Against “copy the local cron.”
- Against trusted-as-always-enough.
- Against pushing `.env` to a private repo “because it’s private.”
- Field assumes laptop-off is free. He shows a 1-hour floor, daily caps, and session-limit drain.

## H. Assumptions

**His:** WAT-in-the-cloud is worth the meter; private-repo exfil risk is low; 15/5/25 numbers are stable; teammates-not-sharing is fine; Skool will get a non-cookie path later.

**Ours:** Captions complete enough (3970 words). Quotas, $200, hardware sizes **UNVERIFIED** / dated. Domain-specific: Claude scheduled tasks. Cookie scrape is operate-never even when it “works” locally.

**Falsifiers:** Run-now green and the hourly still asks. Full network exfils. Thin repo missing a skill the job needs.

**Disagreement (keep labeled):** Hive will not operate Claude routines or auto-ClickUp. The **one-shot + env-not-git + thin clone + run-now-before-clock** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Did tests count against 15/day? (He was 0/15.)
- Team-plan share: still untested on tape.
- Setup-script supply chain: who reviews it?
- Memory trail across stateless runs: where does it write?

## J. Connections

- **SYSTEM SYNTHESIS** → `YHk45NEpspE` (Skool no-API; cookies vs CLI).
- **SYSTEM SYNTHESIS** → `ZAaxx3qyT8g` (unattended long work still needs a stop).
- **SYSTEM SYNTHESIS** → `ask-principal` (any Slack/ClickUp send).
- **SYSTEM SYNTHESIS** → `golden-test-loop` · `slice-build` · `agent-job-card`.
- **SYSTEM SYNTHESIS** → doctrine 7: if it has Send, assume it will send.
- Do not migrate hive jobs onto Anthropic’s web.

## K. Future-Use

- Run-now-twice rule for any scheduler (unassigned).
- Thin-package-per-job as a Forge default (unassigned).
- Trusted/custom/full as a Watchdog question on any egress (unassigned).
- “WAT vs dead script” as a Researcher note: keep judgment, not the vendor host (unassigned).

## Steal / Operate-never

### Machine: One-shot + secrets in the run env + thin clone + run-now before the clock
- **Epistemic:** SOURCE (gotchas) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (someone wants laptop-off / cron) → write a one-shot that names where secrets live → thin the package to what the job needs → put secrets in the run env, never git → smallest network that works → run now until it cannot ask → only then attach a schedule → any notify/send is HITL.
- **Questions / signals:** “Will it ask me?” “Is this only in `.env` or cookies?” “What did we clone?” “Did run-now pass twice?”
- **Qualify / frame / objections:** Scheduler tape, not a Claude SKU. Laptop-off is the magnet. Objection: just copy local — Skool cookies are the counterexample.
- **Procedure:** D steps 1–7. Checkable stops: (1) one-shot prompt, (2) no secrets in git, (3) thin package, (4) run-now clean, (5) send still gated.
- **Example that proves it:** YouTube fail-until-env-named; ClickUp needed full; Skool cookies did not migrate. Lesson: unattended is a different machine than local.
- **Why it works:** Stateless clones only see repo + env + APIs. Testing is the only substitute for you being there. Conditions: a job that can one-shot; an API the cloud can reach. Exceptions: local-only jobs; daily caps; full-network risk he downplays.
- **Conditions / exceptions:** Cursor + Grok only. Claude routines / ClickUp / Slack / Skool / Playwright-cloud stay on tape. Clients parked. Tape $ / 15-per-day UNVERIFIED.
- **Operate-never payload:** Claude 24/7 agents; auto-send; cookie scrape; quote $200 / 15 / 5 as FACT; new hunt.
- **Hive run (existing skills only):** `golden-test-loop` · `slice-build` · `ask-principal` · `agent-job-card` (owns/never includes “no unattended send”) · `playbook-before-send`.
- **Source:** `ehg4fhydTgs` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Claude routines / desktop scheduled tasks / `/loop` as hive OS
- Auto-ClickUp / auto-Slack / auto-Gmail · Skool cookie scrape
- Quote $200 · 15/day · 5/25 as FACT
- Push `.env` · full-egress unattended as a product
- New `icp_id` / unpark Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not approve laptop-off as a personality.

- **Done** on an unattended slice: one-shot + env-not-git + run-now clean. “It runs on the web” is not done. Any message it sends is HITL.
- **Delegate without being asked:** HITL owns send. Watchdog owns egress and secrets. Forge refuses a fat-repo clone for a small job. Communications does not get a Gmail connector because it was in the dropdown.
- **Skeptical review:** 24/7 is a title. He is 0/15 on the real schedule. I will not host the hive on Anthropic because ClickUp got a test ping.
- **One system this take:** one tested one-shot. Not a routine farm.
- Live hunt stays parked.
