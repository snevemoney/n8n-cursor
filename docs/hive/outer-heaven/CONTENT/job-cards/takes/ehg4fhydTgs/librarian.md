# Librarian — ehg4fhydTgs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** How to Build 24/7 Claude Agents. Easy.
**Channel:** Nate Herk | AI Automation
**Kind:** video (~3970 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Apr 14 research preview: **Routines** = a prompt on Anthropic’s web (schedule / API / GitHub event). Laptop can close. Create from terminal, claude.ai/code, or desktop Scheduled Tasks (local vs remote-in-GitHub). Cadence hourly+ (not every 10 min). Connectors + API keys + permissions. **One-shot** — if it must ask you, it is not an automation.
2. Needs a GitHub repo: clones Herc 2, reads CLAUDE.md/skills, then **destroys** the clone. `.env` is gitignored → keys live in the **cloud environment** vars. Network: default **trusted** (Anthropic-vetted domains) failed ClickUp; **full** sent the test message. Prompt the env var explicitly (“don’t look for `.env`”) — ClickUp guessed, YouTube comments did not (12:41 fail → prompt fix).
3. Playwright/Skool cookie automation **will not** port: remote has no local cookies; each run is stateless. Need an API/header/cookie endpoint. Exception: code-changing runs push a **branch** / keep output. Else the clone dies.
4. Limits (his read): Max $200 = **15** routine runs/day; Pro ~3–5 then later **5**; Team/Enterprise **25**; overage if extra usage on (UNVERIFIED). Resources: 4 vCPU / 16GB / 30GB. Fat repo wastes context **and** session limits (same as chatting). Maybe **one repo per routine**.
5. Compare: routines (cloud, no machine, persist, no local files, fully autonomous, min 1h) vs desktop scheduled (machine on, local files, configurable perms, min 1 min) vs `/loop` (session-bound, dies on restart). Setup script runs before Code. Full-network risk: malicious content could exfil; trusted blocks outbound; private-repo practical risk “very low” (his). Connectors = OAuth, not just keys. Runs as you.
6. Persist: GitHub branches + session history; clone dies. If local-only and no API, it will not work. Prompts must be specific (skill + order of ops). Why it “beats” a compiled script: keeps **W+A+T** (workflow+agent+tools) so it can self-correct; can leave a memory trail even if stateless.
7. FAQ: no cron syntax; no local files; pick any model; watch via Run now; connectors≈MCP; teammates cannot use yours (team plan untested); cost = subscription; failures in history; **test Run now many times** before live. Skool doc.
Gap: trusted-domain list, setup-script demo. Timestamp UNKNOWN. Claude/GitHub/ClickUp/Skool/Playwright on-tape.

## B. Atomic Knowledge

### Remote one-shot = repo + env vars + explicit “not .env” + no cookies
- **Claim:** A routine is you-typed-this-prompt on a disposable GitHub clone. Keys in the cloud env, not the repo. Trusted vs full is a real door. Cookie/browser jobs stay local. Fat CLAUDE.md is a tax. 15/day on Max is a cap, not 24/7.
- **Reasoning:** Clone has no gitignored secrets and no laptop cookies. Vague prompts ask questions you are not there to answer.
- **Mechanism:** repo + env vars + network mode + one-shot prompt + Run-now until it one-shots.
- **Evidence:** ClickUp trusted-fail/full-ok; YouTube 12:41 miss; Skool Playwright cookie miss; branch-persist exception.
- **Conditions:** 15/5/25 and $200 UNVERIFIED. Min 1 hour.
- **Exceptions:** Code edits persist as a branch.
- **Action:** File remote-clone rules. Do not install Claude routines as hive. Do not treat 15/day as 24/7. Full-network is a send-adjacent door.
- **Confidence:** high as a portability machine
- **Source:** `ehg4fhydTgs` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** trusted ClickUp; YouTube .env hunt; Skool cookies
- **Speech ≠ behavior:** title “24/7” vs 15 runs/day and 1-hour minimum

## C. Mental Models
If Claude cannot reach it in the repo or via API, it does not exist. Stateless except branches. W+A+T vs compiled tools-only. One-shot or it is not an automation.

## D. Procedures
1. Ask: must the laptop be closed? If no, prefer local schedule.
2. Put keys in env vars; tell the prompt not to open `.env`.
3. Start trusted; open full only for a named domain you accept.
4. Do not port cookie/Playwright jobs.
5. Consider a thin repo per routine if CLAUDE.md is huge.
6. Run now until it one-shots; then schedule.
Avoid: Claude routines as hive; 15/day as 24/7; pushing `.env`; always-allow full network; Skool cookie bots.

## E. Examples
**YouTube comments:** Situation — key in env. Action — first prompt hunted `.env`. Outcome — fail at 12:41. Lesson — say the lookup path.

**Skool Playwright:** Situation — local cookies. Action — same prompt remote. Outcome — no session. Lesson — stateless clone.

## F. Decision Rules
- IF it needs cookies or local files → not a routine.
- IF it must ask a question → rewrite until one-shot.
- IF network is full → treat as exfil door.
- Refuse: Claude as hive; title-24/7 as FACT; send from a routine without HITL.

## G. Contrarian
Against “cloud Python script” (loses the agent). Against “just migrate the local cron.”

## H. Assumptions
Complements `EuzYhzB0vbI` (I-don’t-need-24/7-agents) and `UGIZnh6HNLc`. Caption-only. Quotas UNVERIFIED.

## I. Questions
Did Pro stay at 5? Did a memory-trail file actually survive deletes?

## J. Connections
SYSTEM SYNTHESIS → `EuzYhzB0vbI`; `UGIZnh6HNLc`; `xJ5oz63mIec`; `27Y44JYXZJ8` (no cron on managed agents).

## K. Future-Use
Remote-clone rules + one-shot-or-not + trusted-vs-full as atoms.

## Steal / Operate-never

### Machine: one-shot remote prompt on a thin repo; keys in env; test Run-now
- **Epistemic:** SOURCE
- **Workflow / loop:** write the prompt as if you will be gone → env vars + network mode → Run now until it one-shots → schedule → checkable stop = a ClickUp/Slack artifact or a branch, not a question
- **Questions / signals:** Cookie? `.env` hunt? Fat repo? Daily cap?
- **Qualify / frame / objections:** Keeps W+A+T; not 24/7.
- **Procedure:** D above.
- **Example that proves it:** trusted ClickUp fail; YouTube `.env`; Skool cookies.
- **Why it works:** The clone is the whole world.
- **Conditions / exceptions:** 15/day UNVERIFIED; branches persist.
- **Operate-never payload:** Claude routines as hive; 24/7 title as FACT; full-network always; cookie Skool bots; auto-send.
- **Hive run:** Same one-shot rule on whatever scheduler we already have. Do not add Claude web routines.
- **Source:** `ehg4fhydTgs` @ UNKNOWN

### Operate-never
- Claude routines as hive. Quote 15/day or $200 as FACT. Push `.env`. Always-allow full network. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File title≠quota (24/7 vs 15/day) next to other title≠body tapes. Do not add a hive 24/7 Claude.
