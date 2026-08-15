# Librarian — gb5TlGw6Uks
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/gb5TlGw6Uks/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/gb5TlGw6Uks/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Hermes Agent from zero to your own assistant (1-hour course)
**Channel:** Nate Herk | AI Automation
**Kind:** video (~58 min / ~14572 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT). Upgraded prior short steal/never take to A–L.

## A. Source Map
1. Hook: Hermes (Nous Research, MIT, open source) “grows with you” — self-improving skill loop. Landing: 684 skills listed, 91 built-in (Excalidraw / voice / transcription without him installing). Telegram voice note 1:16 introducing itself. Crons on tape: daily AI news into **School**, YouTube comment replies (transcript + knowledge about him), School engagement, morning business summaries, server checks, research reports, follow-up reminders. HyperFrames first pass failed (didn’t use HyperFrames; spacing off); he asked what tool it used; it researched, asked to install, second pass better. Mindset: if confused, ask Hermes; paste an X post and say implement. Telegram demo first; other channels exist.
2. What it is: own infra (Mac mini / laptop / VPS / Docker / Android Termux). Messaging: Telegram today; Discord, Slack, WhatsApp, iMessage possible. 140,000 GitHub stars (UNVERIFIED). Five pillars (he says Hermes helped invent the structure; Excalidraw zip from a paste — diagrams imperfect, he expanded SQL).
3. Vs Claude Code vs Open Claw vs Codex: Claude Code = sit-and-drive knowledge work, **90% of his day UNVERIFIED**; lives in terminal next to code; dispatch/remote exists, he barely uses it. Open Claw / Hermes = on-the-go Telegram, wake-and-respond, walk-and-work. Open Claw: Peter Steinberger → OpenAI; independent OSS; **350,000** stars (UNVERIFIED); larger team; Nvidia Nemo Claw enterprise stack. Hermes lighter/faster/self-improve; built for tinkering OSS models (Claude, Llama) — he is **not** using OSS models yet. He switched because Open Claw **broke a lot** on updates; Hermes “doesn’t seem to do that as much, fingers crossed.” He uses Claude Code **with** Hermes: coding agents work in a directory; sync knowledge/skills to GitHub; plop Claude / Codex / Hermes on the same repo; terminology differs (`CLAUDE.md` / `AGENTS.md`) — ask the agent to adapt. Claude Code project manages Hermes/Open Claw so he never forgets.
4. Pillar 1 memory: durable context across sessions. `user.md` = who you are / style / don’t-likes. `memory.md` = environments / projects / business context. Loaded at session start. Model wakes **stateless** (Memento). Holistic load files so you don’t repeat. Hermes **auto-extracts** into those files — still say “chuck that in memory” / “never do this again, user.md.” Session search via SQL. Do **not** store secrets or temporary task status.
5. Pillar 2 skills: procedural memory / pancake recipe so the batch does not burn. `SKILL.md` + YAML front matter = progressive disclosure (don’t load full skill unless invoked). Hermes can create/patch skills after real work; skills hub **520+** community (dissent vs 684 landing); **16** Anthropic official (Canvas, front-end, skill-creator). Install via command or paste URL.
6. Pillar 3 soul: `soul.md` shapes vibe (concise / rude / sarcastic-not-rude YouTube comments). No YAML. Evolves from feedback. Skill example on tape: generate-image YAML then markdown. Don’t be intimidated by markdown.
7. Pillar 4 crons: natural-language schedule; fresh **isolated** session (does not inherit current chat); result back to original chat; may update local files. `context_from` = pass job output; `work_dir` = project folder; `--no-agent` = script only (WAT: deploy workflow on Modal, not the agent). Cron sessions **cannot recursively create more crons**; prompts must be self-contained. Claude Code routines/loops need infra on; new Claude routine **15/day on Max** (UNVERIFIED) — keep with `xJ5oz63mIec` 24/7-title vs 15-remote-runs dissent. Hermes does not replace Claude Code.
8. Pillar 5 self-improve: persist experience as memory + skills + searchable history. Automatic ≠ magic; loop works when user corrects, asks save, lets it create/update skills after complex work. Honorable mention: `AGENTS.md` / `CLAUDE.md` = local project goal (global files are user/soul/memory). This tape is **not** a terminal deep-dive — terminal-style work stays Claude Code.
9. Setup: free School resource guide (classroom → all YouTube resources). **Hostinger** VPS (also hosts his n8n / Open Claw / Claude Code); one-click Hermes; KVM 2; annual ~**$100** UNVERIFIED; code **NATEHERK 10%** on 12/24-mo. Ubuntu 24.04 LTS. Root install vs Docker one-click — he does Docker (isolation). Strong opinion: Claude Code project **UpIt agents** inventory (Bull trading, main Hermes, UpIt OS, Klaus PA) — passwords, env, IP, Docker-vs-root, security, integrations. Speech-to-text: **Glydo** (he left Whisper; now on Glydo team).
10. Onboard: admin user/pass into Claude `.env`. Inference: OpenAI Codex OAuth — ChatGPT sub ($20/$100/$200) instead of API keys; cheapest besides OSS. Model GPT 5.5. Telegram via BotFather; allow-list **user ID** via user-info bot (home channel = only him). Tools out of box: vision, browser, image gen, TTS, terminal, task planning, skills. **85** skills already installed (dissent vs 91 built-in). Hello works in CLI; Telegram dead until he asks Hermes — gateway was **stopped**; it restarted itself.
11. Onboard yap 5–10 min. Scary beat: it knew “Herkelman” from **Telegram profile**, not the voice note. First must: private GitHub backup so VPS death ≠ memory death; then nightly cron. Fine-grained PAT failed (no create-repo); he shows delete-key path: nano not on root; `.env` lives **inside the container**, not VPS root. Classic token + `hermes config set GITHUB_TOKEN` — **never paste token in chat** (history + vendor servers); rotate if you did. Telegram permission: allow once / session / **always allow** — he always-allows repo create so nightly sync can run unattended. Skill **nightly GitHub sync**; container UTC so it runs **hourly and self-checks Central** (Chicago midnight) instead of a DST-breaking fixed UTC. Demo: he later **pauses** that cron.
12. CLI = cockpit / deep work / slash commands / visible context. Telegram = remote control / schedule / low-risk knowledge work; same brain, less visibility; context is **token-based** not message-based; auto-compaction ambiguous in Telegram — don’t vibe-code hard apps from Telegram. Dashboard / Kanban exists; he **never** uses it (tunnel/gateway friction). Camera board for multi-agent tasks — he doesn’t live there.
13. First-skill paths: describe an outcome (GitHub cron) **or** install from hub / Claude project. Watch whether it invokes the skill; if not, update YAML front matter. Own accounts / named spend keys (OpenRouter, Perplexity) / intern-access test — not your credit card. Firewall via asking Hermes + Claude Code; optional nightly/weekly security audit skill (he says they can “try to attack it” — operate-never as a product).
14. Maintain: wrong **twice** → correct on the spot + update skill/memory. Same instruction twice → write a skill. Tone off → edit soul. New schedule → skill then cron. Weird behavior → check `memory.md` (**stale memory = #1 cause**). Not a tool you finish; a teammate you train. Read memory/soul anytime. HyperFrames 5-sec soul video: “helpful, knowledgeable, direct… Nate, I’m your action engine.” Compaction: ~**170k** tokens over ~**136k** threshold; compress **failed**; fallback context marker; he pauses cron. Scale: VPS = office building; each agent = own container / keys / coffee mug. Least privilege (marketing ≠ QuickBooks). Decision tree: different permissions/secrets/tools? separate long-term memory? ongoing repeated work? own schedule or audience? → new agent. Else keep in main. One-off ≠ new container. Start with one well. Bad pattern: mega-agent all keys all crons. Main Hermes as COO/EA plans delegation. Close: School guide + Hostinger **Nate Herc 10%**. Hermes / Open Claw / Claude / Codex / Hostinger / Glydo / School stay on tape.
Gap: the five Excalidraw diagrams (imperfect). Timestamp UNKNOWN. Speech≠behavior: “always allow” nightly git vs later pause-the-cron; 684 vs 520 vs 91 vs 85 skill counts; 10% code spelling NateHERK vs Nate Herc.

## B. Atomic Knowledge

### Model wakes stateless — files we own
- **Claim:** Agents wake with no memory (Memento). `user.md` + `memory.md` (+ soul / CLAUDE.md / AGENTS.md) must be holistic at session start. Auto-extract exists; still say “chuck that in memory.” Do not store secrets or temp task status in memory files.
- **Evidence:** “it wakes up stateless” / “your job to make sure that those files are pretty holistic” / “do not store secrets or temporary task status”
- **Action:** File as OPERATOR_MEMORY / job-card / this take — not a Telegram brain
- **Confidence:** high as doctrine
- **Source:** `gb5TlGw6Uks` @ UNKNOWN
- **Epistemic:** SOURCE

### Skill = recipe; YAML = progressive disclosure
- **Claim:** Skill is how to do it again (pancakes same every time). Front matter decides invoke; body loads only then. Hermes can create/patch after real work. If it should invoke and doesn’t, patch YAML.
- **Evidence:** chocolate-chip pancake recipe / “progressive disclosure” / “update the YAML front matter”
- **Action:** Map to existing hive skills; do not ingest 91/684/520 Hermes skills
- **Confidence:** high
- **Source:** `gb5TlGw6Uks` @ UNKNOWN
- **Epistemic:** SOURCE

### Cron = isolated session; cannot spawn crons
- **Claim:** Scheduled run is a fresh isolated session; `context_from` / `work_dir` / `--no-agent` (script only). Cron cannot recursively create crons; prompts must be self-contained. Claude Max routines 15/day claimed.
- **Evidence:** “fresh isolated session” / “Cron sessions cannot recursively create more Cron jobs” / “limited to 15 of those a day”
- **Action:** File isolation + no-recurse; 15/day UNVERIFIED; keep with `xJ5oz63mIec`
- **Confidence:** high as his rule; count UNVERIFIED
- **Source:** `gb5TlGw6Uks` @ UNKNOWN
- **Epistemic:** SOURCE

### Keys never in the chat
- **Claim:** `hermes config set` into container `.env`. Fine-grained PAT failed (no create-repo). Root nano missed the file — `.env` is **in the Docker container**. Chat-paste = history + vendor; rotate. Named keys per agent; intern-access test.
- **Evidence:** “without putting it into the AI conversation window” / nano on root vs container / “you wouldn’t just give them your credit card”
- **Action:** File config-set + container-not-root + named spend keys
- **Confidence:** high
- **Source:** `gb5TlGw6Uks` @ UNKNOWN
- **Epistemic:** SOURCE

### CLI cockpit vs Telegram remote
- **Claim:** Same agent; Telegram has less control, ambiguous compaction, token-not-message context. Don’t vibe-code hard apps from Telegram. Dashboard/Kanban/camera board exist; he rarely opens them (tunnel/gateway).
- **Evidence:** “CLI is kind of like the cockpit, and Telegram is more like your remote control” / “I don’t use it at all”
- **Action:** File costume; our sit-and-drive is Cursor; on-the-go send stays HITL
- **Confidence:** high as his split
- **Source:** `gb5TlGw6Uks` @ UNKNOWN
- **Epistemic:** SOURCE

### Split when memory/keys/schedule/audience differ
- **Claim:** VPS = office; each agent = own container and keys. Mega-agent = confusion + single-point risk. Start with one; migrate markdown skills later. Tree: different perms? separate memory? ongoing repeated work? own audience/schedule?
- **Evidence:** “one mega agent with all the API keys” = bad / “least privilege”
- **Action:** File split-tree; do not install a Hermes farm
- **Confidence:** high as his scale rule
- **Source:** `gb5TlGw6Uks` @ UNKNOWN
- **Epistemic:** SOURCE

### Stale memory is the #1 weird-behavior cause
- **Claim:** Wrong twice → update skill/memory. Same instruction twice → write a skill. Tone → soul. Breaks → read `memory.md`. Compaction can fail (~170k over ~136k) and insert a fallback marker.
- **Evidence:** “Stale memory is the number one cause of weird agent behavior” / compaction failed
- **Action:** File correct-twice + read-the-file; token counts UNVERIFIED
- **Confidence:** high as maintain rule
- **Source:** `gb5TlGw6Uks` @ UNKNOWN
- **Epistemic:** SOURCE

### GitHub is the wake-after-death disk
- **Claim:** First setup act after yap: private repo + nightly sync so VPS corruption ≠ lost teammate. Nightly skill used hourly UTC self-check for Chicago midnight (DST). He **paused** the demo cron.
- **Evidence:** “if Hermes goes down… you still have all of that saved” / hourly self-check / “I told it to pause that cron”
- **Action:** File portable-repo; always-allow + pause = speech≠behavior
- **Confidence:** high
- **Source:** `gb5TlGw6Uks` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Sit-and-drive (Claude Code) vs on-the-go (Hermes/Open Claw). Stateless wake / Memento. Skill = recipe. Soul = vibe. Cron = proactive isolated loop. Automatic ≠ magic. CLI cockpit vs Telegram remote. VPS = office building; container = desk with its own mug and keys. Intern-access test. One well-trained main before a farm. Ask the agent about itself. Open Claw broke on updates — that is why he is here, not a crown.

## D. Procedures
Provision VPS (or skip — operate-never for us) → Docker one-click vs root → save admin to a **local** inventory project → Codex OAuth or other provider → BotFather + user-ID allow-list → test CLI then Telegram (gateway may be stopped) → yap 5–10 min → private GitHub via config-set token (not chat) → nightly sync skill → firewall via research, not cargo-cult → correct twice / skill the repeat / edit soul for tone / read memory when weird. Avoid: token-in-chat; mega-agent; Telegram vibe-code; one-click without knowing container vs root. Signals: Excalidraw zip; HyperFrames miss then install; Herkelman-from-Telegram; nano-not-found; compaction fail.

## E. Examples
**HyperFrames miss:** Situation — “make a video about what Hermes is.” Action — first pass wrong tool, spacing off; he asked what tool; it researched, asked to install, second pass better. Reasoning — ask it to look up its own docs. Outcome — usable diagrams. Lesson — one NL request is not a guarantee; first pass can skip the named tool.

**Herkelman scare:** Situation — voice note said “Nate.” Action — memory wrote Nate Herkelman. Reasoning — Telegram profile, not magic. Outcome — he names the leak. Lesson — channels leak identity into memory.

**Fine-grained PAT fail:** Situation — create private repo. Action — token lacked create-repo; delete from **container** `.env`; classic token; config-set. Reasoning — show the ugly path. Outcome — private repo + nightly skill. Lesson — container ≠ VPS root; don’t paste keys in chat.

## F. Decision Rules
- If sit-and-drive knowledge/code → he uses Claude Code (hive: Cursor + Grok; do not flatten his crown).
- If on-the-go schedule / Telegram → he uses Hermes (we do not install).
- If Open Claw is crashing on updates → he switched; not a hive host.
- If a fact is durable → memory; if how-to-repeat → skill; if vibe → soul; if project-local → AGENTS.md/CLAUDE.md.
- If cron → isolated + self-contained; no recursive cron-create.
- If secret → config-set / named key / intern test; never chat paste.
- If new agent → only when memory, keys, tools, schedule, or audience differ.
- If wrong twice or same instruction twice → persist.
- Refuse: Hermes/Open Claw/Hostinger/Glydo/School as hive; auto YouTube replies; 684/91/85/520/90%/140k/350k/15/day/$100/10% as FACT; always-allow send.

## G. Contrarian
Against Mac-mini-required (VPS/Docker/Termux). Against one-click-without-inventory. Against mega-agent. Against Telegram-as-IDE. Against “automatic = magic.” Against giving the intern your credit card. Against Open Claw as the only on-the-go (he left it because it broke). Dashboard/Kanban exist — he still doesn’t live there.

## H. Assumptions
Stars, skill counts (684 / 520 / 91 / 85 / 16), 90% of day, $100/year, 10% code, 15 Claude routines/day, 170k/136k tokens, 1:16 voice — all UNVERIFIED. Hostinger + School + Glydo are the cart. Claude Code remains **his** daily driver — hive stack stays Cursor + Grok (`35WuZxbAY68` graduated-for-Nate; do not flatten). 15/day Claude routines keep dissent with `xJ5oz63mIec` (24/7 title vs 15 remote runs). Always-allow git vs pause-cron = speech≠behavior. Comment-reply cron is shown as a feature — operate-never for us.

## I. Questions
What is actually in production `user.md` / `soul.md` (he never dumps them)? Did nightly sync stay paused after the demo? Receipts for Open Claw crash frequency vs Hermes? Does Codex OAuth stay cheaper than API once usage is real? Firewall “attack yourself” skill — did he ship it or only pitch it?

## J. Connections
SYSTEM SYNTHESIS → `DTCyvo6cC54` (he sits at L2; chunk≠whole-object; Grill) · `3GAxd90fEE4` (cron ≠ watching agent; bash leaked key) · `xJ5oz63mIec` (15 remote runs/day) · `35WuZxbAY68` (Cursor graduated **for Nate**) · `8QQ_INxAhRs` (portable folders; keys not prompts) · `HN0oWxbF2bM` (CS auto-reply never) · `jBanaNBY-sM` (he **did** post TikTok; continue-on-error) · `tDGiWn0flK8` (persist `business_profile.json`) · `RLjaUES9P8A` (portable md; hive stays Cursor+Grok).

## K. Future-Use
Stateless-wake files, skill-as-recipe, cron-isolation, keys-not-in-chat, container-not-root, split-tree, stale-memory-first-debug, GitHub-as-wake-disk as atoms. Do not install Hermes.

## Steal / Operate-never

### Machine: stateless wake + recipe skills + isolated crons + keys-out-of-chat
- **Epistemic:** SOURCE (stack/vendor = on-tape)
- **Workflow / loop:** durable fact → `user.md`/`memory.md` we own → how-to-repeat → skill with front matter → schedule → isolated session, no recursive cron → secret → config/env not chat → wrong twice → patch the file → checkable stop = named file + why
- **Questions / signals:** Sit-and-drive or on-the-go? Durable vs recipe vs vibe vs project-local? Secret in chat? Container or root? Mega-agent?
- **Qualify / frame / objections:** “Grows with you” is the hook; Open Claw broke is the switch reason
- **Procedure:** inventory project for hosts; GitHub private backup; intern-access keys; read memory when weird
- **Example that proves it:** HyperFrames miss→install; PAT fail→container `.env`; Herkelman from Telegram; compaction fail
- **Why it works:** model is stateless; consistency lives in files; isolation stops cron-fanout
- **Conditions / exceptions:** he still uses Claude Code for 90% (UNVERIFIED); Telegram ≠ IDE; he paused the demo cron
- **Operate-never payload:** install Hermes/Open Claw/Hostinger/Glydo; auto YouTube/School replies; always-allow send; quote skill/star/$ counts as FACT
- **Hive run:** `agent-job-card` · `wiki-ingest` · `coverage-loop` · `ask-principal`
- **Source:** `gb5TlGw6Uks` @ UNKNOWN

### Operate-never
- Install Hermes / Open Claw / Telegram assistant / Hostinger VPS / Glydo as hive. Auto-reply YouTube comments or School engagement cron.
- Quote 684 / 520 / 91 / 85 / 16 / 90% / 140k / 350k / 15-a-day / $100 / 10% / 170k as FACT.
- Always-allow send. Token-in-chat as policy. Mega-agent with all keys. Second-brain `user.md` outside Outer Heaven. Camera-board observe as a product. “Attack your own VPS” as a shipped skill.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Overwrite `takes/librarian.md` (18-tape SSOT).
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File the five pillars and the split-tree as labeled rows — do not flatten skill-count wobble or Claude-vs-Hermes costume. Job cards name the file (`user` / `memory` / `soul` / skill / cron). No Hermes wiki. No School classroom as hive.
