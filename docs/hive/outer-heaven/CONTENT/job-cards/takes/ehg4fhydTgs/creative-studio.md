# Creative Studio — ehg4fhydTgs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Claude Code **routines** (research preview, Apr 14 tweet): a prompt that runs on Anthropic web — schedule / API / GitHub event; laptop can close. Beats: terminal, claude.ai/code, or desktop scheduled tasks (local vs remote-in-repo); name, prompt, model, repo, **cloud environment**, cadence (min **1 hour**), connectors, permissions; one-shot — must not ask questions; clone Herk2, read CLAUDE.md/skills, then **destroy** the clone (unless it pushed a branch); `.env` is gitignored → keys live in the cloud env; ClickUp failed on **trusted** network, worked on **full**; YouTube comments needed “use the env var, don’t look for `.env`”; Skool/Playwright cookie path **failed** (no local cookies, stateless) — need API/header auth; 15 remote runs/day on $200 Max, Pro ~3–5, Team/Ent 25 (UNVERIFIED); compare table: routines = cloud, no machine, no local files, fully autonomous, 1h min; desktop schedule / `/loop` need the box; trusted vs full (malicious-content exfil risk on full); 4 vCPU / 16GB / 30GB disk; test with Run now; WAT kept (workflow+agent+tools) vs a dumb Python push; fail → Slack him. Skool doc. Visual: local vs remote lists.

## B. Atomic Knowledge

### Remote = clone + env + one-shot
- **Claim:** The machine is a GitHub clone plus cloud env vars. If the prompt expects `.env` or local cookies, it dies. Afterward the clone is gone.
- **Evidence:** “every single one of these runs is going to be stateless, and after the run, the GitHub clone just gets deleted.”
- **Conditions:** Exception: code-change/review can push a branch.
- **Exceptions:** ClickUp guessed env; YouTube did not until he said so.
- **Action:** Write the prompt as if a stranger types it on a clean laptop; hive does not stand up Anthropic routines.
- **Confidence:** SOURCE.
- **Source:** `ehg4fhydTgs` @ UNKNOWN
- **Epistemic:** SOURCE

### Trusted vs full is the real permission
- **Claim:** Default trusted = Anthropic-vetted domains. ClickUp needed full. Full means a poisoned page could theoretically phone home.
- **Evidence:** “if Claude reads malicious content during a run, then it theoretically could be tricked into sending data to an external server.”
- **Conditions:** He calls practical risk low on a private repo you control.
- **Exceptions:** Custom allow-list exists.
- **Action:** Least privilege; do not default full.
- **Confidence:** SOURCE.
- **Source:** `ehg4fhydTgs` @ UNKNOWN
- **Epistemic:** SOURCE

### Keep the agent, or you only shipped tools
- **Claim:** A cloud Python script drops the A in WAT. A routine still reads CLAUDE.md, self-corrects, can leave a memory trail even though the VM dies.
- **Evidence:** “we’re keeping the W A and the T all running together.”
- **Conditions:** Fat Herk2 repo may be the wrong clone (too much context tax). Maybe one repo per routine.
- **Exceptions:** 15/day cap; still burns the same subscription.
- **Action:** Steal “one-shot + Run now until it does not ask”; do not migrate hive jobs to Anthropic.
- **Confidence:** SOURCE.
- **Source:** `ehg4fhydTgs` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
A routine is you, later, typing the same prompt. Browser automations that need cookies stay local. Giant CLAUDE.md on a tiny job is a tax. Test many times before the hour-fire.

## D. Procedures
(Learn.) Repo + cloud env keys + network rung + one-shot prompt (“keys are in the environment”) → Run now → watch → then schedule. Do not push `.env`. Do not expect local cookies.
Avoid: Claude routines; Skool/Playwright scrape; full-network default; 15/day as FACT.

## E. Examples
**Situation:** ClickUp “just testing.”  
**Action:** Trusted fail → full + env key → message lands.  
**Lesson:** Network rung is part of the prompt.

**Situation:** Same Skool-wins prompt remotely.  
**Action:** Playwright, no cookies, clone dies.  
**Lesson:** Stateless web ≠ last session’s browser.

## F. Decision Rules
- If it needs local files or cookies → keep it on the machine.
- If the prompt might ask a question → it is not a routine yet.
- If the repo is the whole OS → consider a thin repo.
- If 15/5/25 or $200 from this tape → UNVERIFIED.

## G. Contrarian
“24/7 Claude agents, easy” still has a 1-hour floor, a daily cap, and a cookie wall. Easy is the laptop-off, not the migrate.

## H. Assumptions
Apr 14, 15/day, hardware sizes UNVERIFIED. On-tape Claude/ClickUp/YouTube/Skool. Clients parked. Skool scrape stays operate-never.

## I. Questions
What does the trusted domain list look like? Visual of local vs remote task lists? Did Pro stay at 5?

## J. Connections
- SYSTEM SYNTHESIS → `YHk45NEpspE` (CLI vs cookie; Skool no API).
- SYSTEM SYNTHESIS → `5p5cV0yVDvQ` (least privilege / env).
- SYSTEM SYNTHESIS → `ask-principal` (autonomous send).

## K. Future-Use
“Stateless clone + env, not .env” as a remote-job card. Unassigned.

## Steal / Operate-never

### Machine: one-shot remote, env not cookies
- **Epistemic:** SOURCE
- **Workflow / loop:** thin repo → cloud env keys → least-privilege network → one-shot prompt → Run now until silent → then schedule
- **Questions / signals:** Will it ask? Does it need cookies? Is CLAUDE.md too fat?
- **Qualify / frame / objections:** Laptop-off ≠ cookie-session
- **Procedure:** Fail → notify; do not push secrets
- **Example that proves it:** ClickUp full-network; YouTube “use the env”; Skool cookies dead
- **Why it works:** The prompt is you-later; the VM has only what you injected
- **Conditions / exceptions:** 1h min; daily cap; branch persist
- **Operate-never payload:** Claude routines; Skool browser; auto-Slack; 15/day as FACT
- **Hive run:** `ask-principal`; `info-gain-cite`
- **Source:** `ehg4fhydTgs` @ UNKNOWN

### Operate-never
- Stand up Anthropic routines. Push `.env`. Default full network.
- Skool/Playwright scrape. Join Skool. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: **local vs remote task lists** and the ClickUp test message are the plate. Do not migrate a cookie job. HITL. Clients parked.
