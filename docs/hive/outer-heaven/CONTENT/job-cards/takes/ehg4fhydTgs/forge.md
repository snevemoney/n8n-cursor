# Forge — ehg4fhydTgs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **Claude Code routines** (research preview, **Apr 14** tweet). Beats: prompt that runs on Anthropic web — laptop off; schedule / API / GitHub event → create from terminal, claude.ai/code, or desktop (local vs **remote/GitHub**) → name, prompt, model, repo, **cloud environment**, cadence (min **1h**, not 10m), connectors, permissions → **one-shot**; must not ask you → needs a **GitHub repo**; clones Herc 2, reads CLAUDE.md/skills, then **destroys** the clone (code-change runs may push a **branch**) → `.env` is gitignored → keys live in the **cloud env vars**; network **trusted** (Anthropic-vetted domains) vs **full** vs custom; ClickUp needed **full** → “you typing the prompt later” → YouTube comments: must say **use the env var, don’t look for .env** (first run failed) → **Playwright/Skool** local cookies **don’t exist** remotely; stateless; needs API/cookie-in-header or stay local → Max **$200**: **15** routine runs/day; Pro **~3–5** then **5**; Team/Ent **25**; overage if extra usage UNVERIFIED → fat CLAUDE.md burns the same session limits; maybe a **thin repo per routine** → vs desktop scheduled + `/loop`: routines = cloud, no machine, no local files, fully autonomous, 1h min; local = machine on, local files, configurable prompts, **1 min** min; `/loop` dies with the session → don’t push `.env` even to private (history) → **setup script** before Claude starts → **full** risk: malicious content → exfil; trusted blocks outbound; private-repo risk “low” (his words) → connectors = OAuth, not just keys → runs **as you** → 4 vCPU / 16GB / 30GB disk UNVERIFIED → persist: GitHub branch + session history; destroy: clone → if it isn’t in the repo or an API, it won’t work → specific prompt + skill/order; WAT stays (workflow+agent+tools), not a dumb Python export; can self-correct; leave a memory trail in the repo → FAQ: no cron syntax; no local files; any model; watch via run-now; MCP = connectors; **not** teammate-share (untested on Team); cost = subscription; fail → history (+ Slack him); **test run-now many times** before live. Timestamp UNKNOWN. Claude / ClickUp / Playwright / Skool on-tape.

## B. Atomic Knowledge

### Remote one-shot: env vars, no cookies, no fat repo
- **Claim:** A scheduled agent on someone else’s clone has no `.env` and no browser cookies. Tell it the env. Don’t migrate a cookie scrape. Don’t clone the whole OS for a comment job.
- **Reasoning:** First YouTube run looked for `.env` and died. Skool Playwright had no cookies. Fat CLAUDE.md is a tax every hour.
- **Mechanism:** Cloud env vars + network mode + one-shot prompt + optional thin repo + setup script.
- **Evidence:** ClickUp needed `full`; YouTube needed the sentence; Skool failed.
- **Conditions:** Claude routines as taped.
- **Exceptions:** Code-review jobs can push a branch. Local schedule still wins for cookies/files.
- **Action:** Steal the checklist (env, one-shot, thin context, test-before-live). Do not turn on Claude routines or put keys in GitHub.
- **Confidence:** high on the failure modes; 15/day / $200 UNVERIFIED.
- **Source:** `ehg4fhydTgs` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Routine = you, later, unsupervised. Trusted vs full is an exfil gate. WAT in the cloud ≠ a script dump. `/loop` is session-scoped. 1h floor vs 1m local.

## D. Procedures
1. Don’t enable Claude routines. 2. Don’t push `.env`. 3. Don’t remote-Playwright Skool. 4. If we ever schedule: one-shot, keys in the runner env, test first. 5. Don’t quote 15/day as FACT.

## E. Examples
**Situation:** ClickUp ping.  
**Action:** Env key + `full`.  
**Reasoning:** Trusted blocked the host.  
**Outcome:** Message sent.  
**Lesson:** Network mode is a product.

**Situation:** YouTube 50 comments.  
**Action:** “Use the env, not .env.”  
**Reasoning:** Clone has no secrets file.  
**Outcome:** Second run works.  
**Lesson:** Prompt the secret location.

**Situation:** Skool wins.  
**Action:** Same Playwright prompt remotely.  
**Reasoning:** No cookies.  
**Outcome:** Fail.  
**Lesson:** Stateless = API or stay local.

## F. Decision Rules
- If the job needs local cookies/files → not a remote routine.
- If the prompt can ask a question → it will stall.
- If 15/day / $200 / 4 vCPU appear → UNVERIFIED.
- If Claude/Skool/Playwright CTA → park.

## G. Contrarian
Field “just migrates” local cron to the cloud. He shows it dies without env/cookies. Field wants 10-minute ticks; floor is 1 hour.

## H. Assumptions
Apr 14 preview as demoed. Falsifier: they add cookie jars. We do not run Claude. “Full is fine on a private repo” is his risk call — we don’t take it.

## I. Questions
Do any hive schedules assume a laptop cookie jar?

## J. Connections
SYSTEM SYNTHESIS: `YHk45NEpspE` CLI/cookies. `27Y44JYXZJ8` managed agents still no cron. No Claude / Skool scrape. Secrets stay out of git.

## K. Future-Use
Env-not-.env. One-shot. Thin context. Test-before-live. Don’t buy routines.

## Steal / Operate-never

### Machine: unsupervised run = env + one-shot + no cookies + thin repo; test before the clock
- **Epistemic:** SOURCE
- **Workflow / loop:** write the prompt as if you won’t be there → put keys in runner env → test run-now → then schedule
- **Questions / signals:** Will it look for `.env`? Does it need a cookie? Is the repo the whole OS?
- **Qualify / frame / objections:** `full` can exfil. 1h floor. Caps exist.
- **Procedure:** No Claude routines. No GitHub `.env`. No remote Skool.
- **Example that proves it:** YouTube env sentence; Playwright cookie miss.
- **Why it works:** The clone is not your laptop. The destroy step is the product.
- **Conditions / exceptions:** Claude-specific. Tape caps UNVERIFIED.
- **Operate-never payload:** Claude routines; quote 15/day as FACT; cookie scrape in the cloud.
- **Hive run:** existing HITL schedules only. Deploy HITL.
- **Source:** `ehg4fhydTgs` @ UNKNOWN

### Operate-never
- Enable Claude routines / push secrets / remote-Playwright Skool.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not migrate hive jobs onto Anthropic’s clone. Secrets stay out of git. Deploy HITL.
