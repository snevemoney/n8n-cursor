# Researcher — ehg4fhydTgs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~3970 words). Title: How to Build 24/7 Claude Agents. Easy. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Apr 14 tweet: **routines** research preview — a prompt that runs on Anthropic web infra on a schedule, API call, or event. Laptop can close. Create from terminal scheduled-remote, claude.ai/code, or desktop app. His desktop: four *local* scheduled tasks + four *remote* (GitHub-backed). New task = name + prompt + model + repo + cloud environment + cadence (hourly / daily / weekdays; **min 1 hour**, not every 10 min) + connectors + permissions. One-shot: you are not there — it must not stop to ask. (2) ClickUp test without the ClickUp connector: needed a GitHub repo. Web clones Herc2, reads CLAUDE.md / scripts / skills, then **destroys** the clone. `.env` is gitignored → no keys in the clone. Keys go in the **cloud environment** vars (YouTube, ClickUp, …). Network access default **trusted** (Anthropic-vetted domains); ClickUp needed **full**. Then the test message posted. Routine = “someone types your prompt on your laptop for you.” (3) YouTube comments: “analyze 50 recent comments… key is an env var… don’t look for `.env`.” First run 12:41 failed (looked for `.env`); even a follow-up fail; prompt update then worked. (4) School community Playwright CLI automation: cookies live on the laptop; remote run is **stateless**, no local cookies; clone deleted after. Needs an auth-in-the-request endpoint (cookie/header/API key) or stay local. Exception: if it changes the codebase it **pushes a branch** / leaves output. (5) Limits: Max $200 → **15 routine runs/day** (he is 0/15 while testing). Pro “maybe 3 or 5” then later **5/day**; Team/Enterprise **25/day**; extra-usage orgs can overage. Same session-limit drain as chatting. Fat CLAUDE.md / fat repo = wasted context — consider a **thin repo per routine**. (6) Compare: routines (cloud, machine off, persist across restart, **no** local files, fully autonomous, min 1h) vs desktop scheduled tasks (machine on, local files, configurable permissions, min ~1 min) vs `/loop` (machine on, **dies with the session**, min ~1 min). Triggers: schedule / API POST / GitHub (PR, push, issue, release). (7) Env: don’t commit `.env` even to private (history + collaborators). Network: trusted vs full vs none vs custom. **Setup script** runs before Claude launches (packages). Full-network risk: malicious content could exfil; trusted would block. Practical risk “very low” on private repos you control — he still flags it. Connectors = OAuth (Slack/ClickUp), different from raw keys. Everything runs **as you**. (8) Resources: 4 vCPU / 16GB RAM / 30GB disk per run. Persists: GitHub branches + session history. Destroyed: the clone. Rule: if it isn’t in the repo or reachable by API, it won’t work. Prompts must be one-shot-specific (skill + order of ops), not vague “analyze comments” unless a skill owns it. (9) Why it beats “normal automation”: keeps WAT (workflow + agent + tools) in the cloud — not a dead Python script. Agent reads CLAUDE.md, self-corrects, can leave a memory trail even though runs are stateless. FAQ: no cron syntax; no local files; pick any model; watch via Run now; talk after / interrupt; connectors = MCP; teammates cannot use your routines (team-plan share untested); cost = normal sub usage; failures stored; should Run-now test many times; optional Slack-on-fail. **Do not flatten** vs `R0qF17BVl9w` / `ONmaDdOBGig` `/goal` overnight (those need the machine / session). vs `5p5cV0yVDvQ` always-allow send. vs instance-MCP tapes. All $ / 15-run caps UNVERIFIED.

## B. Atomic Knowledge

### Remote one-shot = prompt + repo + env vars + network mode
- **Claim:** A routine is you-not-there Claude: clone repo, inject cloud env vars (because `.env` is absent), run the prompt once, destroy the clone. Trusted network is the default; some APIs need full.
- **Reasoning:** Gitignore is correct; the cloud box is not your laptop. If you don’t say “use the env var,” it will hunt `.env` and fail.
- **Mechanism:** Cloud environment settings: name, network (trusted/full/custom/none), env vars, optional setup script. Cadence ≥ 1 hour.
- **Evidence:** ClickUp worked after full + keys in env. YouTube failed until the prompt forbade `.env`.
- **Conditions:** Research preview as of his Apr 14 tweet. GitHub required for the path he showed.
- **Exceptions:** Code-changing runs persist a branch. Local scheduled tasks still exist for cookie/browser jobs.
- **Action:** Steal the remote-vs-local split. Hive: no Anthropic routines; no full-network “as you” agents.
- **Confidence:** high as the scar set.
- **Source:** `ehg4fhydTgs` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** YouTube `.env` miss; Playwright cookies miss
- **Speech ≠ behavior:** “easy 24/7” vs two failed migrations and a 15/day cap.

### Stateless remote cannot see laptop cookies
- **Claim:** Browser/Playwright automations that depend on local session cookies will not port. Each run is a fresh clone. Auth must travel in the request (key/header/cookie you store in env) or the job stays on the desktop scheduler.
- **Reasoning:** Destroy-after-run is the security/cost model. Memory must be written back to git or an API if you want a trail.
- **Mechanism:** Desktop scheduled task / `/loop` keep local files; routines do not. `/loop` also dies on restart.
- **Evidence:** School Wins Engagement copy-paste failed: “no cookies… clone just gets deleted.”
- **Conditions:** Sites with no public API.
- **Exceptions:** He hints they later found a non-browser School path — not shown.
- **Action:** Steal “auth-in-band or stay local.” Map `send-removed` / HITL for anything that posts.
- **Confidence:** high.
- **Source:** `ehg4fhydTgs` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** School remote port
- **Speech ≠ behavior:** none.

### Thin repo + one-shot prompt + Run-now or it drains you
- **Claim:** Routines spend the same session budget as chat. A fat OS repo (Herc2) is the wrong clone for a comment-summarizer. Caps: Pro 5 / Max 15 / Team 25 per day (he also guessed 3–5 for Pro earlier). Min interval 1 hour. Test with Run now until it one-shots.
- **Reasoning:** Autonomous + “runs as you” + full network is an exfil shape if the prompt or repo is hostile.
- **Mechanism:** Per-routine thin repo; specific skill + order of ops; Slack-on-fail; history of every run.
- **Evidence:** “maybe you don’t want to put that repo into the cloud”; 4 vCPU / 16GB / 30GB; WAT kept (agent can self-correct).
- **Conditions:** $200 Max numbers UNVERIFIED.
- **Exceptions:** Extra-usage orgs can exceed on overage.
- **Action:** Steal thin-repo + test-before-schedule. Operate-never: full-network hourly agent, commit `.env`, auto-send.
- **Confidence:** high as policy; caps UNVERIFIED.
- **Source:** `ehg4fhydTgs` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** first YouTube run
- **Speech ≠ behavior:** teammate-share “maybe on team plan” — untested.

## C. Mental Models
Laptop-off is bought with statelessness. Gitignore wins; you must re-inject secrets. Trusted vs full is an exfil brake. WAT-in-the-cloud ≠ a dead cron script — and that is why it can also go wrong without you. Local cookies are a wall. Fat context is a tax on every hourly run.

## D. Procedures
1. Decide local vs remote: need cookies/local files → desktop scheduler or `/loop`. Else routine (on-tape).
2. Thin GitHub repo (not the whole OS) + CLAUDE.md that only the job needs.
3. Cloud env: keys as env vars; never commit `.env`.
4. Network: stay trusted unless a named domain fails; full = exfil risk.
5. Optional setup script for packages.
6. Write a one-shot prompt (skill + order). Tell it “use env, not `.env`.”
7. Run now; watch; patch prompt; repeat until it one-shots.
8. Then schedule (≥1h) or API/GitHub trigger.
9. Hive: do not enable Anthropic routines; posting stays HITL (`send-removed`, `ask-principal`).

## E. Examples
- **Situation:** ClickUp ping, no connector. **Action:** env key + network full. **Outcome:** test message lands. **Lesson:** connector ≠ required if the API is in env and network allows it.
- **Situation:** YouTube 50 comments. **Action:** first prompt assumes `.env`. **Outcome:** fail, fail, then env-explicit prompt works. **Lesson:** say where the secret lives.
- **Situation:** School Playwright. **Action:** copy local prompt to remote. **Outcome:** no cookies, clone deleted. **Lesson:** stateless ≠ laptop.
- **Situation:** Fat Herc2 as the clone. **Action:** (warning, not a full fail). **Outcome:** he recommends a per-routine repo. **Lesson:** context is a meter.

## F. Decision Rules
- IF the job needs local cookies or files → do not remote it.
- IF `.env` is gitignored (correct) → put keys in cloud env and *say so* in the prompt.
- IF trusted blocks the host → he used full; hive still refuses auto-send on full.
- IF the repo is an OS → make a thin repo.
- IF you have not Run-now succeeded → do not schedule.
- IF you want every-minute → desktop or `/loop`, not routines.
- Refuse: Anthropic routine install; commit secrets; quote 15/day as FACT; new ICP.

## G. Contrarian
Title says easy 24/7; body is a gotcha list (gitignore, trusted, cookies, 15/day, 1h floor, fat repo). “Fully autonomous” is the opposite of hive HITL. Full network + runs-as-you is the prompt-injection shape he names and then downgrades to “very low.” Playwright-on-School is the kind of scrape hive already operate-nevers.

## H. Assumptions
Apr 14 date, $200 / 15 runs, Pro 5, Team 25, 4 vCPU/16GB/30GB = **UNVERIFIED**.
**Desk dissent:** Learn remote-vs-local and env-not-dotenv. Do not stand up Claude routines. Keep overnight-`/goal` tapes as a different machine-on path.

## I. Questions
- Exact trusted-domain list (he “linked” — not in captions)?
- Team-plan sharing — still untested.
- Non-browser School path he skipped?
- API trigger auth model?

## J. Connections
- **SYSTEM SYNTHESIS:** `R0qF17BVl9w` · `ONmaDdOBGig` · `ZAaxx3qyT8g` (overnight / machine-on) · `5p5cV0yVDvQ` (always-allow send) · `YHk45NEpspE` (CLI vs MCP). Skills: `ask-principal` · `send-removed` · `input-required-gate` · `inbox-to-task-routing`.

## K. Future-Use
Remote one-shot checklist. Env-not-dotenv scar. Cookie wall. Thin-repo-per-job. Trusted vs full exfil. WAT-kept vs dead cron. Run-now before schedule.

## Steal / Operate-never

### Machine: remote-oneshot-vs-local-cookies
- **Epistemic:** SOURCE
- **Workflow / loop:** classify local-files/cookies vs API-reachable → if remote: thin repo + env vars + explicit “don’t use .env” + trusted-first network + one-shot prompt + Run-now until green → then schedule/API/GitHub
- **Questions / signals:** Will the clone see this secret? Will this host pass trusted? Does the job need a browser jar? Is the repo an OS?
- **Qualify / frame / objections:** 24/7 is capped (15/day on his Max). Autonomous + full + as-you is an exfil shape.
- **Procedure:** D.
- **Example that proves it:** ClickUp full+env works; YouTube `.env` miss; School cookies miss.
- **Why it works:** Cloud can only see git + env + network. Specificity replaces the human in the loop — which is why hive still inserts HITL on send.
- **Conditions / exceptions:** Caps / $ UNVERIFIED. Hive does not enable Anthropic routines.
- **Operate-never payload:** Full-network hourly poster; commit `.env`; Playwright scrape; quote 15/day as FACT; new ICP.
- **Hive run (existing skills only):** `ask-principal` · `send-removed` · `input-required-gate` · `inbox-to-task-routing`
- **Source:** `ehg4fhydTgs` @ UNKNOWN

**Operate-never**
- Enable Claude routines / full-network auto-send. Commit secrets. Quote tape $ / caps as FACT. New `icp_id`. Send / pay / deploy.

## L. Role-Specific Applications
File remote-vs-local and env-not-dotenv. Do not migrate hive jobs onto Anthropic web routines. Keep `/goal` overnight as a separate machine-on row.
