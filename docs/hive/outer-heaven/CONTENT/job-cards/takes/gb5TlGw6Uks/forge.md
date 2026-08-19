# Forge — gb5TlGw6Uks
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/gb5TlGw6Uks/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/gb5TlGw6Uks/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **Hermes Agent from zero** (~58 min). Caption-only. Visual/click **UNKNOWN**. Landing: self-improving skill loop; **private VPS**, not Mac mini. Docs: **684** skills / **91** built-in UNVERIFIED (Excalidraw without installing it). Voice note 1:16: tools, memory, write skills, crons, search past chats, Telegram. His crons: AI news → Skool; **YouTube comment replies** (transcript + “knowledge about me”); Skool engagement; morning summaries; server checks; research; follow-ups. HyperFrames: first pass **wrong tool** / bad spacing; it researched, asked to install, second pass better. Vs Claude Code (desk knowledge work, he drives it) vs Open Claw (Steinberger; 350k stars UNVERIFIED; he says Claw **broke on updates**) vs Hermes (lighter, self-improve, open models optional). Shared GitHub repo as the pile any harness can sit on (`claude.md` vs `agents.md` terminology). **Five pillars** (Hermes helped name them; Excalidraw zip): (1) **memory** — `user.md` + `memory.md` at session start; Memento/stateless; SQL session search; no secrets/temp status in memory; still say “chuck that in memory.” (2) **skills** — recipe / `SKILL.md` + YAML front matter / progressive disclosure; auto-skill from repeats; hub ~520 community + 16 Anthropic UNVERIFIED. (3) **soul.md** — vibe; six Hermes, different personalities; YouTube comments = sarcastic not rude; soul evolves. (4) **crons** — NL “spin up a cron”; isolated fresh session; `context_from` / `workdir` / `--no-agent` (WAT: workflow without the agent); crons cannot recursively create crons; Claude routines need hardware or Max **15/day** UNVERIFIED. (5) **self-improve loop** — work → persist memory/skills/history; automatic ≠ magic; user must correct. Honorable: `agents.md` / `claude.md` as *local* project (he will not deep-dive Hermes-in-terminal; that stays Claude Code). Skool resource guide. **Setup:** Hostinger VPS (KVM 2, Ubuntu 24.04); annual + code **NATEHERK 10%**; Docker one-click vs root; **Claude Code project `VPS_agents` / `youtube-hermes/.env`** as the org brain (he is not a VPS person). Admin user/pass left default, copied to `.env`. Onboard: Codex GPT OAuth (ChatGPT sub as cheapest besides open models) → GPT 5.5 → Telegram BotFather + user-info bot allowlist. Telegram hello fails (gateway stopped); Hermes restarts it. Telegram leaked **Herkelman** from profile — he flinches, then explains. GitHub backup first (VPS death). Fine-grained token: 30 days (he will delete; “probably never expire”), all repos, contents R+W. **Do not paste token in chat** — `hermes config set GITHUB_TOKEN` → `/opt/data/.env`. Fine-grained lacked create-repo; nano-not-found; he was in **root** looking at the wrong `.env` — fix = docker-container `.env`. Classic token; Telegram allow-always for nightly commit. Cron: midnight Central; container UTC so it **hourly self-checks Chicago** (DST). CLI = cockpit / deep work; Telegram = remote / low-risk / context ambiguous. Two skill paths: describe outcome vs install URL. **Intern mindset:** own Gmail/agent-mail, not his; strict scopes; **named keys per agent** (OpenRouter/Perplexity); would not give an intern the card. VPS firewall (“Uppet Guard”); ask Hermes+Claude to lock down; optional nightly **audit / try-to-get-in** skills. Maintain: wrong twice → patch skill/memory; same instruction twice → write a skill; tone → soul; break → stale `memory.md` is #1. Compaction at ~170k / 136k threshold failed → fallback marker. Scale: VPS = office; **one container per agent** (own keys); least privilege; decision tree (different perms/memory/ongoing schedule/audience → split); start with one; mega-agent = high confusion + high risk. Dashboard/Kanban: he barely uses; tunnel feels broken first time → **save the three commands as a skill**. Close: Skool + Hostinger coupon. On-tape: Hermes, Hostinger, Open Claw, Claude Code, Codex, Telegram, HyperFrames, Glydo STT, Skool. Cursor + Grok only.

## B. Atomic Knowledge

### Five pillars: memory / skill / soul / cron / persist-after-correct
- **Claim:** Agents wake stateless (Memento). Durable facts live in `user.md` + `memory.md`. Skills are recipes with YAML-when-to-fire (progressive disclosure). Soul is vibe for anyone who talks to it (including YouTube). Crons are proactive isolated sessions; they must be self-contained; `--no-agent` is a script. The loop only works if the human corrects and asks to save.
- **Reasoning:** Desk Claude Code is sit-and-drive. Hermes/Claw are phone/Telegram. Same GitHub pile, different harness words.
- **Mechanism:** “Chuck that in memory.” Skill-from-repeat. NL cron. Isolated session does not inherit the chat.
- **Evidence:** HyperFrames first pass wrong tool; second after research+install. Telegram gateway dead → self-heal. Nightly sync skill + DST hourly check.
- **Conditions:** Always-on box (VPS/Docker). He will not vibe-code a game from Telegram.
- **Exceptions:** Claude Code stays the daily driver for knowledge work.
- **Action:** Steal pillars + isolated cron + correct-then-persist. Do not install Hermes/VPS.
- **Confidence:** high on the model; star/skill counts UNVERIFIED.
- **Source:** `gb5TlGw6Uks` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** HyperFrames wrong tool; Telegram gateway; wrong `.env` layer; compaction fail
- **Speech ≠ behavior:** “never expire tokens” vs he uses 30 days because he will delete

### Keys not chat; intern not your Gmail; one container per job
- **Claim:** Token in the thread hits history / vendor servers — `config set` into container `.env`. Fine-grained vs classic scopes will bite (create-repo missing). Root terminal ≠ container filesystem. Named keys so spend is attributable. Own mailbox. Least privilege. Split when perms, long memory, schedule, or audience differ. Mega-agent is the bad pattern.
- **Reasoning:** You would not hand an intern the card. VPS is an office building; containers are rooms with their own keys.
- **Mechanism:** Claude Code `VPS_agents` project remembers IP/passwords/security because he will not. Firewall via research, not folklore.
- **Evidence:** Fine-grained fail → delete key in the *container* `.env` → classic token → private repo appears. Telegram knew “Herkelman” from the profile.
- **Conditions:** Docker one-click as taught. Nightly gitignore must exclude `.env`.
- **Exceptions:** Local open model + he still does not want it in history.
- **Action:** Steal config-set-not-chat, named keys, split-on-privilege. Do not paste secrets. Do not “attack the box” as a cron. Do not auto-reply YouTube.
- **Confidence:** high.
- **Source:** `gb5TlGw6Uks` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** token scope; nano; root vs docker `.env`
- **Speech ≠ behavior:** leaves Hostinger admin default in the demo

### Dashboard is optional; first-time tunnel becomes a three-command skill
- **Claim:** He almost never opens the Hermes dashboard/Kanban. CLI for deep work; Telegram for low-risk remote. First dashboard attempt feels broken; persist the three commands once it works. Wrong twice → patch; stale memory is the #1 weirdness.
- **Reasoning:** On-the-go agent does not need a camera board. Sitting-down work is Claude Code.
- **Mechanism:** Ask Hermes to open the dashboard with VPS+container facts; when it works, “save as a skill.”
- **Evidence:** Compaction fail + fallback marker — paste and ask “explain.”
- **Conditions:** Tunnel/gateway required for local dashboard.
- **Exceptions:** Multi-agent coding might use Kanban (he does not).
- **Action:** Steal don’t-live-in-the-dashboard + skill-the-repeat-fix. Do not install the dashboard.
- **Confidence:** high.
- **Source:** `gb5TlGw6Uks` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** first dashboard (warned)
- **Speech ≠ behavior:** none

## C. Mental Models
Claude Code = desk. Hermes = pocket intern on a locked box. Open Claw broke on updates — that is why he switched (fingers crossed). Any harness can sit on the same GitHub pile. Automatic ≠ magic. Intern, not spouse: own accounts, named spend, least privilege. VPS = office; container = desk with a locked drawer. One good personal agent before a farm. Mega-agent is high risk. CLI cockpit / Telegram remote. He is self-taught by asking the agent to explain.

## D. Procedures
1. Do not install Hermes, Hostinger, Open Claw, HyperFrames, Glydo, or Skool. Cursor + Grok.
2. Do not auto-reply YouTube or auto-post Skool. Identity/voice stay HITL.
3. Do not paste tokens in chat. Config/env only. Rotate if leaked.
4. Do not run “try to get into the VPS” crons.
5. Pillars to steal as *ideas*: durable memory files, recipe skills + YAML when-to-fire, soul/tone file, isolated scheduled jobs that cannot spawn more jobs, persist only after a human correction.
6. Org analog: one folder/project that remembers where each agent lives (IP, env, scope) — not a second vendor.
7. If a tool is wrong on pass one: name the tool, ask it to research, approve install HITL.
8. If the same instruction is said twice: write a skill. If tone is off: edit soul. If weird: read `memory.md` for stale facts.
9. Split only when perms/memory/schedule/audience differ. Start with one.
10. Hard steps HITL. Tape $ / stars / 15-routines / 10% coupon UNVERIFIED.

## E. Examples
**Situation:** “Make a HyperFrames video about Hermes.”  
**Action:** First pass uses some other tool; spacing broken. He asks what it used; it researches, asks to install, second pass better.  
**Reasoning:** NL is not a tool binding.  
**Outcome:** Diagrams stay in bounds.  
**Lesson:** First-pass wrong tool is why verification exists.

**Situation:** Wants GitHub backup before dumping his life into the agent.  
**Action:** Fine-grained token via `config set`; create-repo denied; wrong `.env` layer; classic token; always-allow commits; nightly skill; UTC/DST hourly self-check.  
**Reasoning:** VPS death must not erase the intern. Secrets not in chat.  
**Outcome:** Private repo + cron.  
**Lesson:** Scope, layer, and timezone are the actual work.

**Situation:** Telegram hello does nothing.  
**Action:** Tell Hermes; it finds gateway stopped; restarts.  
**Reasoning:** Same agent can debug its own channel.  
**Outcome:** Typing indicator returns.  
**Lesson:** Isolated channel health ≠ model health.

**Situation:** Voice “my name is Nate.”  
**Action:** Agent writes Herkelman.  
**Reasoning:** Telegram profile, not magic.  
**Outcome:** He is briefly scared.  
**Lesson:** Channels leak identity. Do not give the intern your real inbox.

## F. Decision Rules
- IF desk knowledge work → he uses Claude Code (on-tape). Hive: Cursor.
- IF on-the-go / cron / Telegram → he uses Hermes. Hive: do not install.
- IF Open Claw keeps breaking on updates → he switched (anecdote).
- IF secret → env/config, never the thread.
- IF intern would not get it → agent does not get it.
- IF spend → named key per agent.
- IF same ask twice → skill. IF wrong twice → patch skill/memory.
- IF weird behavior → stale memory first.
- IF cron → isolated, self-contained, no recursive cron spawn.
- IF need a script not a brain → `--no-agent`.
- IF different perms/memory/schedule/audience → new container, not a mega-agent.
- IF dashboard works after pain → three-command skill, then stop living there.
- IF YouTube comments / Skool posts → operate-never for hive.

## G. Contrarian
Field wants Mac mini / always-on home box. He uses a rented VPS + Docker. Field treats Hermes as a Claude Code replacement. He will not. Field lives in the dashboard. He almost never opens it. Field pastes the token in chat “because it will put it in `.env`.” He refuses. Field spins six souls on day one. He says start with one.

## H. Assumptions
684/91/520/16 skills, 140k/350k stars, $100/year VPS, 10% coupon, 15 Claude routines/day, 170k/136k compaction = **UNVERIFIED**. Hostinger + Skool are the magnet. “Attack your own VPS” is a dangerous suggestion even as a skill. Clients parked. Codex OAuth / ChatGPT sub stay on-tape.

## I. Questions
What is our analog of `VPS_agents` (one folder that knows where each desk lives) without a second vendor?  
Which hive skill already is “wrong twice → patch”?  
When is a scheduled job allowed to speak in public (never, unless Evens names it)?

## J. Connections
SYSTEM SYNTHESIS: `U6k4MeVks_Y` skills + `/goal` + folder. `8QQ_INxAhRs` keys not prompts (email blast). `iTY8Q449YNQ` verify. `3GAxd90fEE4` WAT + `--no-agent` rhyme. `zWLZ3bVVwD8` / `y-cq_Qo4zVo` voice/Telegram on-tape. Hive: `coverage-loop`, `agent-job-card`, `ask-principal`, `golden-test-loop`. No Hermes / Hostinger / Open Claw / comment bot.

## K. Future-Use
Stateless + durable files. YAML-when-to-fire. Isolated cron. Config-set not chat. Named keys. Split-on-privilege. Stale memory as first debug. Three-command skill for a painful tunnel. Unassigned. No new SKILL.md from this tape.

## Steal / Operate-never

### Machine: scoped intern on a locked box (learn the loop, do not buy the box)
- **Epistemic:** SOURCE
- **Workflow / loop:** one always-on job → own accounts/keys → secrets in env not chat → GitHub as death-backup → isolated schedule → human corrects → persist memory/skill → split only when privilege/memory/schedule/audience diverge
- **Questions / signals:** Would I give an intern this? Is the token in the thread? Is this the container `.env` or the root? Is memory stale?
- **Qualify / frame / objections:** Dashboard is optional. Telegram is remote, not a cockpit. Mega-agent is the failure mode.
- **Procedure:** D 3–9.
- **Example that proves it:** Token-in-env; wrong layer; HyperFrames retry; Telegram leak; nightly DST cron.
- **Why it works:** Stateless agents only improve if experience is filed; blast radius stays in one container.
- **Conditions / exceptions:** Do not install the VPS. “Try to get in” stays never.
- **Operate-never payload:** Hermes, Hostinger, comment-reply, Skool, coupon, token-in-chat.
- **Hive run:** `golden-test-loop` + `ask-principal`. Cursor Task desks, not six Hermes souls.
- **Source:** `gb5TlGw6Uks` @ UNKNOWN

### Operate-never
- Do not install Hermes / Hostinger VPS / Open Claw / HyperFrames / Glydo / Skool.
- Do not auto-reply YouTube or auto-post Skool.
- Do not paste tokens in chat. Do not leave default admin as a habit.
- Do not run nightly “attack the box” skills.
- Do not quote 684/91 skills, stars, 15 routines, 10% off as FACT.
- Clients parked. Deploy HITL. Cursor + Grok only.

## L. Role-Specific Applications
Forge steals **intern-not-card**, **config-set-not-chat**, **isolated cron**, **stale-memory-first**, **split-on-privilege**, **don’t-live-in-the-dashboard**. Overwrites the prior shallow take. Does not steal Hermes, Hostinger, or a comment bot. Cursor + Grok.
