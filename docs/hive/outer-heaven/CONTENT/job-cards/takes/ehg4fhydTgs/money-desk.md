# Money Desk — ehg4fhydTgs
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/ehg4fhydTgs/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~3970 words. Nate: Claude Code Routines (research preview, tweet Apr 14) — one-shot prompts on Anthropic web so the laptop can close. Caption-only; timestamp UNKNOWN. Beats in order: schedule / API / GitHub-event; create from terminal, claude.ai/code, or desktop. His desktop: 4 local scheduled + 4 remote-in-GitHub. New task = name + prompt + model + repo + cloud environment + cadence (hourly/daily/weekdays; min 1h, not 10 min) + connectors (Slack/Gmail) or API keys + permissions. Must one-shot — nobody is there to answer a question. Gotcha 1: remote clones the GitHub repo (Herc2), reads CLAUDE.md/scripts/skills, then destroys the clone. `.env` is gitignored → no keys in the clone. Fix: cloud environment env vars (YouTube, ClickUp, …). Network access default trusted (Anthropic-vetted domains only); ClickUp needed **full** or the send failed; then ‘testing remote tasks/credentials’ landed in internal ClickUp. Prompt = the same sentence you’d type locally. Gotcha 2: YouTube-comments routine — first run 12:41 looked for `.env`, errored; even a follow-up miss; rewrite: ‘key is an environment variable, use it, don’t look for .env’ → fetch worked. Gotcha 3: School Wins Engagement used Playwright CLI + local cookies; remote has no cookies, clone is stateless, deleted after. Needs an auth-in-headers/API path. Exception: if it changes the codebase it opens a branch / keeps output. Limits: Max $200 = 15 routine runs/day (he’s 0/15, tests only); Pro ~3–5; Team/Enterprise 25; extra-usage orgs can overage. Same session-limit drain as chatting CC. Fat Herc2 CLAUDE.md may be the wrong repo — consider one repo per routine. Compare: routines = Anthropic cloud, machine off, no session, survive restart, **no local files**, fully autonomous, min 1h. Desktop scheduled + `/loop` = machine on; loop dies with the session; local files yes; permissions configurable; min can be 1 min. Don’t push `.env` even to private (history/collab). Setup script runs before CC launches (packages). Trusted vs full: full = if the run reads malicious text it could exfil; trusted blocks unknown outbound; private-repo practical risk ‘very low’ he still names. Connectors = OAuth (Slack/ClickUp), not just env keys. Runs as you. Resource card: 4 vCPU / 16GB / 30GB disk — don’t hoist a giant repo. Persist: GitHub branches + session history; clone dies. Rule: if it isn’t in the repo or reachable by API, it won’t work. Prompts: skill + order-of-ops, not a vague ‘analyze comments.’ Why it beats a Python cron: keeps WAT (workflow+agent+tools); self-corrects mid-run; can leave a memory trail even though each run is stateless. FAQ speed-run: no cron syntax; no local files; pick any model; Run now + watch + talk after / interrupt; MCP = connectors; teammates no (maybe Team, untested); cost = normal sub usage; failures stay in history (optional Slack-on-fail); test many times before live. Close: migrate scheduled tasks; laptop off. School doc. Like CTA.

## B. Atomic Knowledge
### Remote-is-the-repo-plus-env-not-your-laptop
- **Claim:** The clone sees GitHub + cloud env vars + connectors. It does not see `.env`, local cookies, or Playwright sessions. After the job the clone dies unless it opened a branch.
- **Reasoning:** ClickUp worked only after network=full and keys in the environment. YouTube failed until the prompt said ‘don’t look for .env.’ School cookie automation cannot migrate.
- **Mechanism:** Put keys in the cloud env. Say so in the prompt. One-shot. Don’t hoist a fat CLAUDE.md repo if the job is small.
- **Evidence:** On-tape 12:41 miss then rewrite hit; 0/15 of 15 Max runs; 4 vCPU/16GB/30GB.
- **Conditions:** The job must run with the lid closed.
- **Exceptions:** Claude Code / Anthropic cloud / School scrape / auto-ClickUp / auto-Slack are not ours. $200 / 15/day UNVERIFIED.
- **Action:** Steal repo-plus-env. Do not migrate cookie bots. HITL any send.
- **Confidence:** high as a gotcha set
- **Source:** ehg4fhydTgs @ UNKNOWN
- **Epistemic:** SOURCE
### One-shot-or-it-is-not-an-automation
- **Claim:** Nobody is there. If it must ask, the schedule is theater. Test with Run now until it does not need you.
- **Reasoning:** Vague YouTube prompt failed; skill+order-of-ops is the shape he wants. Failures stay in history; optional Slack-on-fail is still a send.
- **Mechanism:** Write the prompt as the only human turn. Run now. Then schedule.
- **Evidence:** On-tape ClickUp one-liner vs YouTube rewrite vs School cookie fail.
- **Conditions:** Lid-closed job.
- **Exceptions:** Auto-send ClickUp/Slack/email = HITL. Full network = exfil risk he names.
- **Action:** Steal Run-now-until-one-shot. Do not set full+hourly as us.
- **Confidence:** high
- **Source:** ehg4fhydTgs @ UNKNOWN
- **Epistemic:** SOURCE
### Keep-the-agent-or-keep-the-machine
- **Claim:** Routines keep WAT (workflow+agent+tools) and self-correct; a compiled Python cron keeps tools+workflow and drops the agent. Price: no local files, 1h min, 15/day on Max, same token drain as chat.
- **Reasoning:** Desktop scheduled / `/loop` still need the machine. Loop dies with the session.
- **Mechanism:** Pick lid-closed+repo vs lid-open+local files. Don’t pretend they are the same SKU.
- **Evidence:** On-tape three-column compare (routines / desktop / loop).
- **Conditions:** You are choosing where the agent lives.
- **Exceptions:** CC routines are not ours. Trigger.dev / n8n glue in later tapes is also not ours.
- **Action:** Steal the compare table. HOLD the product.
- **Confidence:** high as a decision rule
- **Source:** ehg4fhydTgs @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: lid-closed agent > compiled cron if you keep CLAUDE.md. Priority: env vars, one-shot, thin repo, trusted unless a named domain needs full. Experience: three live fails (env, .env-hunt, cookies). Contrarian: don’t put Herc2 in the cloud for a comment job. Uncertainty: Pro daily cap; Team sharing untested.

## D. Procedures
His order: GitHub repo → cloud env keys → network trusted/full/custom → one-shot prompt that names the env → Run now until green → then hourly+. Our order: do not stand up CC routines. Steal repo≠laptop and one-shot. Caption-only: UI UNKNOWN.

## E. Examples
**Situation:** ClickUp ping, no connector. **Action:** env key + network full. **Reasoning:** trusted blocked the host. **Outcome:** test message in internal channel. **Lesson:** Trusted is a denylist for the send.

**Situation:** YouTube 50 comments. **Action:** first prompt assumed `.env`. **Reasoning:** local habit. **Outcome:** 12:41 error; rewrite ‘use the environment variable’ worked. **Lesson:** Say where the secret lives.

**Situation:** School Playwright. **Action:** copy local prompt to remote. **Reasoning:** same words. **Outcome:** no cookies, clone dies. **Lesson:** Stateless remote ≠ local browser.

## F. Decision Rules
IF secret is in `.env` → it will not be on the remote. IF the job needs cookies → stay local or get an API. IF CLAUDE.md is a novel → different repo. IF $200 / 15/day / 4vCPU → UNVERIFIED. Refuse: CC routines as ours; auto-ClickUp; School scrape; push `.env`.

## G. Contrarian
Rejects ‘just copy the local scheduled task.’ Rejects compiling the agent away to a Python cron as the same thing. Rejects full-network as free.

## H. Assumptions
Research preview Apr 14. Caps and resource card may move. ClickUp ‘full’ is one vendor. Survivorship: his Herc2 already existed. Falsifier: remote one-shot still asks. Speech≠behavior: School cookie bot he will not actually migrate.

## I. Questions
What’s the live Pro/Max daily cap? Any receipt we can open that a routine replaced a laptop-on cron? Did Team sharing ever work?

## J. Connections
SYSTEM SYNTHESIS: keys-in-env = `YHk45NEpspE`. One-shot = `jZgcWCzxh1I` confirm-before-run. Cookie-won’t-travel = PP School CLI (`YHk45NEpspE`) vs Playwright. WAT kept = wrapper thesis `brB-hSiV2iU`. CC/auto-send operate-never.

## K. Future-Use
Unassigned: one-repo-per-routine as a context-tax cut. Trusted-vs-full as an exfil knob.

## Steal / Operate-never

### Machine: Repo-plus-env-one-shot-or-keep-the-lid-open
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: a job that must run with the laptop shut → action: thin repo + cloud env keys + one-shot prompt that names the env + Run now until it does not ask → checkable stop: a history row that did the send/read without a human turn
- **Questions / signals:** Is the secret in gitignore? Cookies or API? Fat CLAUDE.md? Trusted enough?
- **Qualify / frame / objections:** Frame: lid-closed agent vs lid-open files. Objection: ‘copy the local task’ — cookies and `.env` stay home.
- **Procedure:** Do not install CC. Do not set hourly ClickUp. HITL any send. Tape caps UNVERIFIED.
- **Example that proves it:** ClickUp needed full; YouTube needed ‘don’t look for .env’; School cookies died. UNVERIFIED 15/day.
- **Why it works:** The clone is not your laptop. A prompt that assumes `.env` is a local habit, not an automation.
- **Conditions / exceptions:** Works as a gotcha set. Exception: CC / School scrape / auto-send / $200 / 15/day as FACT operate-never.
- **Operate-never payload:** Claude Code routines · auto-ClickUp/Slack · School Playwright · push .env · 15/day as analog
- **Hive run (existing skills only):** `playbook-before-send` · `ask-principal` · `input-required-gate` · `pricing-margin-roi-guardrails`
- **Source:** ehg4fhydTgs @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote $200 / 15-per-day / 4vCPU as FACT or as our analog.
- Stand up Claude Code routines. Auto-send ClickUp/Slack. Migrate a cookie/Playwright bot. Push `.env`.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD Claude Code Routines. Steal repo-plus-env and Run-now-until-one-shot. Any send stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
