---
name: Grok Bot signal training loop
description: >-
  Use when turning YouTube videos and X bookmarks into Grok Bot skills, routines,
  memory, and prompts — demonstration + ingest + extract, not chat-only summaries.
---
# Grok Bot signal training loop

**Owner:** Researcher (extract) · all desks (consume skills) · Librarian (memory)  
**Sources:** Simon Scrapes `yt:icM0ewXGvAw`; Operator paste 2026-08-22; Nate `yt:TMPUUyQC5aM`; Berman `yt:5CSXUsljJ_E`; Jotform YT→KB `yt:Mdo-z2Josdc`.

## Core idea
YouTube + X bookmarks + Instagram reels/posts are **training data**: demos, examples, preferences, workflows. Feed them into skills / routines / memory — not a chat graveyard. Same shape as Jotform “train agent from YouTube” (FACT pattern) without installing Jotform Agents.

## Four buckets (always)
| Bucket | Meaning |
|---|---|
| **Prompts** | Copy-paste text desks reuse |
| **Tools** | Connectors/CLIs — PROVE / WORKAROUND / BLOCKED |
| **Skills** | Markdown recipes under workflows/ |
| **Workflows/routines** | Skills + scheduled/event triggers |

Close with [research-signal-to-skills](sand-workflow:research-signal-to-skills) + [research-signal-to-skills](sand-workflow:research-signal-to-skills).

## YouTube path (hive)
1. **Ingest:** logged-in box YouTube / history JSON / WL — not Composio-first.
2. **Index:** title, duration, chapters, timedtext timestamps, existing `transcripts/<id>/full.txt`. Do not download yet.
3. **Watch:** [goal-directed-watch](sand-workflow:goal-directed-watch) — windows + modality from the steal goal. Transcript first. If a video has no transcript, run `oh-transcribe <url>` ([owned-tools](sand-workflow:owned-tools); output goes to /workspace/transcripts/<id>.txt). If that fails → [summarize-audio-video](sand-workflow:summarize-audio-video) on a **slice**, not the whole file. Frames/clip only if the steal is visual. Never ingest at a fixed fps. If CAPTION_GAP already noted (e.g. `5CSXUsljJ_E`), do not re-Whisper unless another worker lands audio.
4. **Extract:** chapters, steals, don’ts, prompts, tools named in the tape.
5. **Implement:** enrich/create skill; update SIGNAL_INDEX.
6. **Demonstrate (optional):** Teach a Task / learn-from-demonstration while following a tutorial → skill (Nate tip #7).
7. **Routine:** attach only if recurring (daily YT digest already exists). Routine instruction names **skill + delegate**.

## Grill-me + chief (from Nate week)
- Import/adapt grill-me skill → interview until shared understanding ([agent-job-card](sand-workflow:agent-job-card)).
- One pinned chief; specialists one-job; shared wiki vs private desk notes.
- Log work as owner / status / link (GitHub issue or Drive) — not ClickUp-required.

## Instagram path (hive)
1. **Ingest:** box Chrome signed-in as Evens. Operator-pasted reel/post URL = same trigger as a YouTube video. Read-only. Never like, comment, follow, DM, share, or save.
2. **Signed-out is not empty.** request_box_help once ("Sign in to Instagram as Evens"). Do not invent 0 items.
3. **Extract:** creator handle, caption (verbatim), on-screen text cards, spoken lines if captions exist. If a file is saved, watchVideo. Do not invent a transcript.
4. **Implement:** same 4 buckets + research-signal-to-skills. Chat-only = failure.
5. **Quarantine:** OFM/IG lead farms, hacking, NSFW gens, agentic bug-bounty hunter reels (ig:DceJfw-q6em) — NO-SKILL + don'ts. No client send. No probe/PoC loops.
6. **Index:** SIGNAL_INDEX theme row `ig:<shortcode>`. Not a second daily cron unless operator asks.

## X bookmarks path (hive)
1. **Ingest (primary):** live **user-X MCP** `get_users_me` → `get_users_bookmarks`. Write Shared Memory Plane dumps. Compare IDs to last ingest (0 new = quiet). Disk/`x-bookmarks*.json` = cache only. Mac `xurl` never primary. Stale dump ≠ live. Never invent IDs.
2. **Cluster:** themes / accounts / unacted ideas.
3. **Taste profile:** what they save (and ignore) → scout similar; no spam-farms.
4. **Extract → skills** same 4 buckets; quarantine OFM/IG farms / pentest / NSFW gens.

## Combined loop
1. Session dump + open SIGNAL_INDEX.
2. Ingest YT, Instagram reel/post, and/or bookmarks.
3. Extract → skills with Prompts + Tools sections.
4. Prove on Grok+Cursor or label WORKAROUND/BLOCKED.
5. Optional Teach a Task for visual flows.
6. Memory via wiki-ingest / decision-ledger.
7. Multi-agent: Researcher extracts → Librarian promotes → desks run (no new agents without yes).

## Prompts
**ASR sources:** Nate `yt:TMPUUyQC5aM` · Jotform `yt:Mdo-z2Josdc` Whisper LIVE.

**Video → skill**
```
Process this YouTube [url/id]:
1) Prefer transcripts/<id>/full.txt if caption_store=whisper_box_asr (FACT ASR) — else timedtext / summarize-audio-video
2) Steals vs never (label FACT vs INFERENCE)
3) Prompts to copy 4) Tools PROVE/WORKAROUND/BLOCKED
5) Create/enrich skill id 6) Update SIGNAL_INDEX row
Chat-only summary = failure.
```

**Train from YT (Jotform pattern → hive) — FACT UI shape, NO-SKILL install**
```
Video urls/ids: …
Hive path (NOT Jotform Agents install):
1) Select / open target skill or new skill id
2) Ingest transcript (Whisper or timedtext) into knowledge bullets
3) Write Prompts + Tools sections; close via research-signal-to-skills
4) Optional: Teach a Task demonstration while watching tutorial → skill (Nate tip #7)
Do NOT install Jotform AI Agents / Eden / second knowledge product.
```

**Grill-me + team propose (FACT Nate tip #1 + #3)**
```
Install/adapt grill-me skill. Relentlessly interview about [business/goals/quarter] until shared understanding.
Save interview to shared knowledge.
Then: propose specialists chief can delegate to (no second chief). Write owns / never / wake / done-when.
```

**Bookmarks → KB + skills**
```
Read my bookmark set [path/filter]:
Themes, top accounts, unacted ideas, extract reusable prompts/tools,
create/enrich clustered skills (not 1:1 spam), update SIGNAL_INDEX.
```

**Agent logging (FACT tip #6 — ClickUp remap)**
```
When kicking work: log owner · status · link · started · notes.
Hive path: GitHub issue or Drive tracker (ClickUp NOT required).
```

## Tools
| Need | Path |
|---|---|
| History / WL JSON | youtube-daily scrapes — **PROVE** |
| Transcript | timedtext / existing transcript / summarize-audio-video / Whisper LIVE full.txt — **PROVE** |
| Skills disk | /home/box/agent-data/workflows — **PROVE** |
| Composio YouTube | optional playlist proxy — **WORKAROUND** (not required for digest) |
| Jotform Agents | **NO-SKILL** / do not install — hive YT→skill path instead |
| Teach a Task | Grok computer learn-from-demonstration — **PROVE** when desktop available |

## Never
- Chat-only summary as done
- 1:1 skill per bookmark
- Require Composio/Claude desktop when native path works
- Mint agents/icp from a signal
- Educator $ as FACT without claim-verifier
- School auto-like / paste secrets / saved-login abuse

## Steal thicken — Simon 19 mistakes (`yt:icM0ewXGvAw`) FACT
Closed 2026-08-23: WebFetch watch page + timedtext (no CAPTION_GAP). Remap 19 Claude mistakes → Cursor cloud agent + Grok skills. Prefer enrich existing gate skills; NO Claude desktop / Fast / Cowork install.

**Extract shape for agent-tooling videos**
```
For each numbered tip: FACT steal | Claude-only NO-SKILL | hive remap (skill id)
Tools: PROVE | WORKAROUND | BLOCKED (would work if we had X)
Write prompt-pack + SKILL_DELTA; chat summary ≠ done.
```

## Web intel 2026-08-24 — harness four parts (FACT)
Earendil (`https://earendil.com/posts/what-is-a-harness/`): a harness is (1) system prompt (2) tools (3) agentic loop (4) translation layer across models. You can own/adapt the harness; you cannot own the frontier model. Hive skills + routines + SIGNAL_INDEX **are** the harness we own. Chat-only ingest = unused harness.

## LIVE enrich 2026-08-24 — Brock Mesarich Grok Bot desk (`yt:BFZ7lyKYcg8`) FACT
Closed: WebFetch watch page (no CAPTION_GAP). Remap demos → hive plugins; do **not** require ClickUp/Granola/Parallel/Zapier as owned.

**Training shape from this tape (product = train bots like signals train hive):**
1. Multi **role agents** + chat history per role (not one dump thread).
2. Agents **message each other** (inbox ↔ invoice; main ↔ email) without operator mid-prompt.
3. **Routines:** schedule (e.g. 8am triage) **and** event triggers (invoice-related mail → invoice agent).
4. **Plugins via chat** (“connect Gmail”) + auth card — multi-account Gmail when supported.
5. Feed style samples (invoice PDF) into a bot = preference training; same as YT→skill extract.
6. Price / “70% cheaper” / free-trial claims = **UNVERIFIED** — never FACT without claim-verifier.

**Extract prompt (Brock-style agent tooling)**
```
Signal: yt:BFZ7lyKYcg8 (or similar Grok desk demo)
For each use case: role bot · trigger (schedule|event|chat) · plugins · HITL gate · hive remap skill id
Label $/% UNVERIFIED. ClickUp→GitHub/Drive; Granola→BLOCKED or notes WORKAROUND; Parallel→WebSearch WORKAROUND; Zapier→native-first.
Write prompt-pack + SKILL_DELTA. No Claude/Comfy/Eden/Vapi install.
```

## Official Grok Bot docs 2026-08-26 (post Aug-24)
**FACT — share:** A public share link copies Bot *configuration* only. It does not share the computer or logins. Do not put secrets, customer data, or internal URLs in a Bot you share. A second Bot is **not** a security boundary (all Bots share one computer).
Source: https://docs.x.ai/grok-bot/approvals-security-and-privacy

**FACT — egress:** Settings → Beta may show security-key or egress-routing when available. Sites that block datacenter IPs: allowlist official egress ranges **or** try the beta setting that routes box traffic through the member computer. Hardware keys: WebAuthn in the box browser forwards to the desktop app.
Sources: https://docs.x.ai/grok-bot/settings-and-notifications · https://docs.x.ai/grok-bot/teams-and-enterprises

**UNVERIFIED shipped:** Templates tab, multi-account switch, Chrome profile import (TestingCatalog 2026-08-24). Do not write skills that require them. **BLOCKED** until they appear in Settings.

**When YouTube/seller/bank walls fail on box IP:** try Beta egress before asking the operator to paste data.
Packet: `/workspace/research/packets/signals-20260826/FINDINGS.md`

## Grok Bot access 2026-08-26 (FACT official @bot)
Second expansion: **all SuperGrok and Cursor Pro** (not just Plus/Pro+/Teams). Weekly usage limits reset that afternoon. SuperGrok via X Premium+ unblocked later the same day.
https://x.com/bot/status/2092664183334846840 · https://x.ai/news/grok-bot-more-plans
Do **not** buy a new seat for this. Dual SuperGrok+Cursor does not automatically double Bot quota (UNVERIFIED vs Billing — check the meter).

## Share-a-Bot redact (2026-08-26)
Draft: topics/share-a-bot-redact.md. Config only. Strip vault paths, emails, named-trial URL. Safe line: Evidence desk. Skills + weekday signals. Login walls = box handoff. No send.

## Brock 5 Grok Bot cases (WL #74 `lRUpu2-KtGQ`)
Title only this fire. Do not invent the 5 cases. Existing Berman 11 + grok-role-bots-triggers cover the pattern. L2 later if captions land.

## WL26-100 L2 2026-08-26 — Brock 5 + Riley 4.6 (PROVE tape)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2.md`
Brock title-only stub superseded.

### Brock 5 cases (`yt:lRUpu2-KtGQ`) FACT timedtext
1. Inbox triage (schedule) → briefing; talks to chief-of-staff → task board.
2. Video agent + skill zip + Higgsfield plugin (phone photo → product ad). Skill = repeatable style.
3. Firecrawl when native scrape blocked (YouTube page blocked; RSS + watch fallback).
4. Invoice agent + inbox group chat; style PDF; **event** trigger on invoice mail; draft + attach; operator sends.
5. Meeting agent 17:00 → Granola notes → action items on the right board.
- Apps missing from marketplace → Zapier MCP (Beehiiv/School named). Remap: ClickUp → GitHub/Drive; Granola → notes WORKAROUND; Higgsfield re-auth; Zapier native-first.
- $ / plan prices = **UNVERIFIED**.

### Riley Grok 4.6 (`yt:VWDnptnvFrA`) FACT timedtext
- 4.6 slide he showed: economically valuable work / long professional / legal — not coding-bench lead. Easy path he names: Grok 4.6 Fast in Cursor.
- UX steal: left rail = **named bots** (personified sessions + mini system prompt). Routines live **inside** the bot, not only a global Scheduled pile. Cmd-K lists agent+routine. Each bot has a cloud computer (teach-a-task, browser sign-in).
- Chat vs work: Work turns a simple Q into a tool expedition. Use a named bot for jobs; do not default every query to Work.
- Cursor-built (internal sand / planned dot) = HIS claim. $/1M vs Opus/Fable, $55 rewrite, $7M dot.com, Elon 4.7, DeepSeek/Gemini takes = **UNVERIFIED**.
- No Claude Cowork / GPT Work install. Personify + in-bot routines already hive.

**Extract add**
```
Role bot name:
Trigger: schedule | event | chat
Routines live on this bot? Y
HITL send? Y
Remap board/scrape/video plugin:
$ claims: UNVERIFIED
```


## WL26-100 remaining L2 2026-08-27 — escalations + 4Cs (PROVE tape)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2-REMAINING.md`

### Allie (`yt:EzQAgnjTq2k`) FACT timedtext
- Enable infra; wait for escalations. HITL send **width** stays even when scope widens.
- "Do smart things" only after goals docs + wiki dump. End-of-day dictate into the personal wiki (context that never hit mail/calendar).
- Watchdog over Slack/calendar gaps. Don't 2015-title the bots (CMO/CPO). Toby-style friction watcher OK as a role.
- Claude Tag / Cowork **NO-SKILL**.

### Sandeep (`yt:TL8V41Ea6oM`) FACT timedtext
- Morning coordination bot: unread → urgent / info / ignore; draft only. Earn send.

## Tech With Tim Grok Bot skeptic 2026-08-28 (`yt:ezANo2RNryU`) FACT watch-page transcript
Packet: `/workspace/research/packets/signals-20260828/TWT-GROKBOT-ezANo2RNryU.md`
Timedtext CAPTION_GAP (0 bytes). Watch-page WebFetch = spoken transcript **PROVE**.

1. Name **which computer**: my computer (the box / cloud) vs your computer (operator machine, approval). Vague "open Chrome" uses remote.
2. X connector flaky in his demo (would not connect). Hive X = disk bookmarks **WORKAROUND**. Do not treat "connect X" as live.
3. Hanging / incomplete tasks fail [verify-then-done](sand-workflow:verify-then-done). A computer view is not done.
4. $200 / Super Grok Heavy / Cursor Ultra only = **STALE** vs official 2026-08-26 SuperGrok + Cursor Pro. 7-day trial / plan prices = **UNVERIFIED**. Do not buy a seat from this tape.
5. here.now deploy sponsor = **NO-SKILL**. Origin/Vercel remain.
6. Hermes / Buzz "better value" = **OPINION**. Do not switch Grok+Cursor.
7. Inter-bot messaging, routines (schedule or event), Teach a Task already owned.

**Prompt — computer specify**
```
Task:
Computer: my computer (box/cloud) | your computer (operator, approval)
Browser: do not paste a password. Login wall = box handoff.
Done when:
```


## Platform fit lock (2026-09-01 operator)

Signals exist to (1) name a **repo or plugin to install** and (2) **improve platforms already in use**: Claude (CLI/Web, not desktop), ChatGPT/Codex, Cursor, n8n, Grok Bot.

A steal implements only if the skill states:
- **Platform:** which of those five it changes
- **Install:** github owner/name or plugin id, or explicit `none (process-only)`
- **Remap:** Claude desktop → Cursor Cloud; ClickUp → ACTION_LOG; Composio YouTube → disk transcripts

Leisure GTA/anime stays NO-SKILL. Personal FIRE/Ramsey is park, not a Consultant SKU.
Feed named skill-zips through [awesome-skill-import-gate](sand-workflow:awesome-skill-import-gate). Do not 1:1 mint a skill per tape.

## X bookmarks ingest lock 2026-09-03
Primary live pull = box `user-X` MCP (`get_users_me` → `get_users_bookmarks`), write Shared Memory Plane paths, then delta → research-signal-to-skills. Mac `x-bookmarks-sync.sh` is NOT primary. 0 new IDs after successful live pull = quiet. Stale dump ≠ live.

## YT daily stamp 2026-09-09
Title ids:
- Instantly — How to Start a 1-Person Business with Grok Bot (`yt:QhY_U71ITrc`) — **L2 A–E CLOSED**
- Instantly — I Spent $8K on AI Tokens Last Month (`yt:NKj7hcXyeoM`) — metadata only
**Steal:** Grok Bot 1-person ops patterns + token-burn caution. **Building mode:** train hive ops; do **NOT** productize/sell. Token burn → reinforce meter / max-3 (pair attention lock). $ claims **UNVERIFIED**. **Platform:** Grok Bot + Cursor. **Install:** `none (process-only)`.

## L2 A–E PROVED 2026-09-09 — Instantly Grok Bot ops (`yt:QhY_U71ITrc`)
Packet: `/workspace/research/youtube-daily/l2-20260909/QhY_U71ITrc/`
File-based watch (mp4 + transcript + storyboard); no desktop YT player primary.

**Ops steals (FACT):**
1. Pin **one** Chief of AI Staff first; everything trickles down.
2. Routines = cron — start lean; sprawl burns tokens; pause non-core.
3. **AgentOps** = private GitHub markdown backup of agent context (daily commit).
4. Weekday **8:20** rollup / brief (not top/bottom of hour).
5. Plugins = MCP; missing tool → CLI (bun+symlink if npm fails).
6. Hard guardrails: **send** and **spend** — draft OK, launch/pay HITL only.
7. Operator = orchestrator: end-goal loops; return only done / blocker / HITL.
8. Inter-bot boring ops (inbox ↔ CFO ↔ spend-governor) for subscription leakage.
9. Usage self-meter pattern (`grokbot-usage` class) before binge — verify before install OSS.

**Don'ts / labels:** Instantly CTA + cold-email = marketing; building mode **no send**. Personal $ UNVERIFIED. Do not paste session cookies.

**Extract add**
```
Chief pinned? Y
Active routines ≤3? Y
AgentOps private backup? Y
Send HITL? Y
Spend HITL? Y
Usage glance before binge? Y
Instantly/outbound send? FORBIDDEN (building mode)
$ claims: UNVERIFIED
```

**Recreation:** `recreation/HITL_ROUTINE_RUNBOOK.md` + `demo-checklist.json` — PROVE ops pattern; Instantly send BLOCKED.
**Topic:** `CONTENT/topics/grokbot-ops-hitl-routines-20260909.md`

## LIVE enrich 2026-09-09 — $8K tokens Instantly/Pete (`yt:NKj7hcXyeoM`)
Packet: `/workspace/research/youtube-daily/repass-20260909/NKj7hcXyeoM/` (A–E PARTIAL)
Steal: token burn map (eng + personal agents), wrong-model-for-job, runaway-loop stop gates, enterprise unsupervised agents still need HITL.
**PROVE:** TOKEN_BURN_HITL_CHECKLIST. **BLOCKED:** Instantly send/cold-email (marketing host). $8K/mo claim **UNVERIFIED**. Building mode no sell/send.


## Repass delta — video-training 20260909 Wave I
- yt:BFZ7lyKYcg8: product tour still closes to skills (fleet/routines) with PROVE/WORKAROUND/BLOCKED labels; never quote educator pricing as FACT.

## Live enrich (wave-N-20260909-65-69)
- `yt:06E-D2RCx6g` Lukas — Grok Bot ugly-site→leads: list → **triple audit** → MagicPath variants → Mobbin/BYQ → Daily Leads Builder draft email (**HITL before send**). CAPTION_GAP whisper. MagicPath/Mobbin paid **BLOCKED** until connected.

## Signals close 2026-09-11 10:26 ET — X live MCP + Cursor Projects + SpaceXAI livestream

Packet: `/workspace/research/packets/signals-close-20260911-1023/` · X dump `packets/x-bookmarks/20260911-1023/` · blog https://cursor.com/blog/projects · OpenAI FS https://openai.com/index/introducing-chatgpt-financial-services/

### X bookmarks ingest (REPLACE Mac-primary wording)
1. **ALWAYS** live-pull on the operator computer via **user-X MCP**: `get_users_me` → `get_users_bookmarks` (pass `id` from me).
2. Write Shared Memory Plane: `~/.grokbot/x-bookmarks.json` + `CONTENT/x-bookmarks/latest.{json,md}` + dated packet.
3. Compare bookmark **IDs** to last ingest. **0 new = quiet.** Stale dump ≠ live.
4. Never Mac `xurl` as primary. Never invent IDs.
**PROVE** 2026-09-11: user-X connected; @snevemoney `514498939`; live count 97; delta vs `2026-09-10T20:20:10Z` = **+6 / −7 / overlap 91**.

### Cluster `20260911-1023` (builder closes)
| Cluster | Source | Path |
|---|---|---|
| **A. Cursor Projects** | x:2098162488013455784 · cursor.com/blog/projects (Sep 10) | Coordinator agent plans/delegates (does not write code); cloud-by-default; subscriptions (Slack / PR / schedule). **Hive map:** named desks + Task/CloudAgent + routines already match. Keep **max-3** (token-meter). Do **not** fan out “thousands.” Cursor Projects = **RESEARCH-OK** IDE feature — not a second hive face / not desk 18. Cross-ref [agent-harness-loops](sand-workflow:agent-harness-loops) + [hive-smarter-loop](sand-workflow:hive-smarter-loop). |
| **B. SpaceXAI Grok livestream** | x:2098233797745725882 @tetsuoai · Sep 15–17 company-from-scratch | **WATCH** only. Topic `spacexai-grok-livestream-20260915.md`. Steal **after** stream via this skill. No auto desk army. **RESEARCH-OK**. |
| **C. ChatGPT Financial Services** | OpenAI product Sep 10 · partners Morgan Stanley / Evercore · GPT‑6 Astra + hosted data | Building mode: **no sell**. ChatGPT Work second face = **NO-SKILL**. Bench/$ = **UNVERIFIED**. Hive stays Grok+Cursor research path + [claim-verifier](sand-workflow:claim-verifier). |
| **D. GPT-Live-1 voice API** | x:2098099269551149398 @OpenAIDevs | **RESEARCH-OK** / **BLOCKED** without OpenAI Live API. **WORKAROUND:** [phone-hitl-routine](sand-workflow:phone-hitl-routine). No Vapi / second voice farm. |
| **E. Phone LE screenshot meme** | x:2098252621039497696 | **NO-SKILL** leisure/sensational. Do not invent forensics tooling. |
| **F. VibeMarketer media** | x:2092243372929151135 | t.co **404** — skip **UNVERIFIED**. |

### Repo extract
No concrete `github.com/owner/name` or gitlab owner/name in this fire’s live bookmark texts → **no QUEUE rows**.

### Extract add (Projects / livestream)
```
Coordinator vs coder separated? Y
Max parallel streams ≤3? Y
Subscriptions = routines (not new desk)? Y
Cursor Projects tried as second OS? N
SpaceXAI livestream: watch then steal? Y
ChatGPT Work / GPT-Live as hive face? N
$ / partner-bank claims: UNVERIFIED
```

## X bookmarks stamp 2026-09-16 17:21 ET — overnight demo loop
Packet: `/workspace/research/packets/x-bookmarks/20260916-1721/`.

**FACT pattern (@mattyp `2099482348010328185`):** Daily Grok Bot reads X bookmarks → Cursor Agent builds a demo → validates with screenshots/video → branch + preview deploy → morning link so the operator *sees* the tech.

**FACT (@bot `2099890276315848743`):** SpaceXAI employees livestream building a company in 3 days with Grok Bot (Day 1 research/plan/product).

### Hive remap (do this)
1. Live ingest bookmarks via user-X (this routine) — already PROVE.
2. When new AI/builder IDs appear, pick **one** high-signal item (not 1:1 spam).
3. Launch Cursor CloudAgent (or box demo) with a tight outcome: recreate the named library/pattern.
4. Validate with screenshot/video Review tools.
5. Preview: prefer owned Origin/box static preview. Cloudflare Pages preview = RESEARCH-OK — **BLOCKED** until Cloudflare is connected/approved.
6. Morning note to operator with the preview link (routine/WakeParent) — building mode; no client sell.

### Never
- Require Cloudflare as the only preview path
- Mint a skill per bookmark
- Quote livestream “company in 3 days” as a retainer offer
- Tier-3 spend without HITL


## X bookmarks stamp 2026-09-17 10:07 ET — signals-close (+3/−3)
Packet: `/workspace/research/packets/x-bookmarks/20260917-1007/`.

**FACT live pull:** user-X `get_users_me` (@snevemoney / `514498939`) → `get_users_bookmarks` count=95 · delta vs `2026-09-16T21:21:29Z`: **+3/−3/overlap 92**. Credits ~98.41. No next_token. No `github.com/owner/name` in added texts → no QUEUE.

### Added (true-read)
| ID | Account | Label |
|---|---|---|
| `2100318564842721348` | @kirillk_web3 | Karpathy free lecture + pitch for graph-eng guide. Lecture = **RESEARCH-OK** watch queue. "$15k bootcamps" = **UNVERIFIED**. Do **not** install pitch guide as hive face / mall. |
| `2100295136261349802` | @QuiverAI | Arrow 2 vector-graphics model (App+API). **RESEARCH-OK** study. Do **not** install Quiver as second creative face. **WORKAROUND:** owned SVG/Remotion/shadcn paths. Bench/"faster" = **UNVERIFIED**. |
| `2100252254028669046` | @cycles_0 | 3D+2D clip (points at another status). Motion/ref only this fire — **no L2**. Remotion/Higgsfield **WORKAROUND**. |

### Hive remap (do this)
1. Keep live user-X primary (this fire PROVE).
2. One high-signal builder item → enrich existing skill (this section) — not 1:1 skill mint.
3. Karpathy-class lectures: queue for goal-directed-watch / prove-one slot; never quote educator $ as FACT.
4. Vector/AI art tools: import-gate + RESEARCH-OK only; no creative-face swap.
5. Leisure/motion clips without a clear steal → index + skip.

### Never
- Install Quiver / graph-eng guide / third motion SaaS as hive face
- Quote $15k / "most advanced" as FACT
- Mint a skill per bookmark
- Treat Chrome History SQLite 0 as empty YouTube queue (Account History page is SoT)

### Extract add
```
Karpathy lecture queued not installed? Y
Educator $ UNVERIFIED? Y
Quiver Arrow2 RESEARCH-OK only? Y
cycles 3D+2D L2 this fire? N
New github QUEUE rows? N
```


## X bookmarks stamp 2026-09-17 10:48 ET — ingest (+3/−3)
Packet: `/workspace/research/packets/x-bookmarks/20260917-1048/`.

**FACT live pull:** user-X `get_users_me` (@snevemoney / `514498939`) → `get_users_bookmarks` count=95 · delta vs `2026-09-17T14:07:01Z`: **+3/−3/overlap 92**. Credits ~97.93. No next_token.

### Added (true-read)
| ID | Account | Label |
|---|---|---|
| `2100222045535731755` | @brenzhills | GitHub free substitutes list (TradingAgents, LibreChat, HyperFrames, GenOffice, MoneyPrinterTurbo, opencodex, VoxCPM, OpenHands, agent-skills, OpenBot). **RESEARCH-OK** catalog + import-gate. “½M users” / paid parity = **UNVERIFIED**. |
| `2100262886916358361` | @ElevenLabs | Reception AI receptionist. Catalog machine only. **NO** install as hive face / voice-SDR. Setup/$ claims = **UNVERIFIED**. |
| `2100500411446685817` | @titouangillet_ | Launch video “1.1M+ views” — breakdown URL = same ElevenLabs Reception video. Views = **UNVERIFIED**. Craft pattern → reference-driven + launch-video-e2e topic. |

### Hive remap (do this)
1. Live user-X primary (this fire **PROVE**).
2. Builder-no-rent list → enrich [host-automations-outside-subscription](sand-workflow:host-automations-outside-subscription); propose repos via [awesome-skill-import-gate](sand-workflow:awesome-skill-import-gate) only — no auto-install.
3. OpenBot already RESEARCH-OK (not hive face). TradingAgents = advise-only; **NO** auto-trade routine.
4. HyperFrames / MoneyPrinterTurbo → Remotion + Higgsfield **WORKAROUND** (already in reference-driven).
5. Reception → steal catalog (phone/speed-to-lead map); building mode; no client sell.
6. Launch-video bookmark → craft study; do not quote view counts as FACT.

### Never
- Install ElevenLabs Reception / TradingAgents / HyperFrames / MoneyPrinterTurbo / LibreChat as hive face
- Auto-trade from TradingAgents bookmark
- Mint one skill per GitHub URL in the list
- Quote 1.1M views or “½M users” as FACT
- Second desktop / second voice platform face

### Extract add
```
GitHub substitutes RESEARCH-OK import-gate only? Y
OpenBot still not hive face? Y
TradingAgents auto-trade? N
Reception install? N
Launch views UNVERIFIED? Y
New skill mint this fire? N
```

## Enrich BACKFILL 2026-09-17 — webhook email wake (`yt:ff7om2bBLKM`)
Packet: `/workspace/research/youtube-daily/l2-20260915/ff7om2bBLKM/` · A PASS · B PASS · C PASS · D PARTIAL · E PASS

### Four buckets
| Bucket | Extract |
|---|---|
| Prompts | Nat label taxonomy prompt; Stephanie webhook-wake brief |
| Tools | Gmail MCP **PROVE** read/label; AgentMail **BLOCKED** face; ClickUp **WORKAROUND** |
| Skills | enrich inbox-clean · phone-hitl · session-bootstrap · host-automations |
| Workflows | label-only cleanup routine; webhook credential+filter gate (file PROVE) |

Chat-only summary of this tape = failure — L2 packet required.


## WL800 title-only enrich 2026-09-17 (partial scrape 800/1999)

Packet: `/workspace/research/packets/signal-miss-backfill-20260917/watch-later/` · `WL800_NEW.md` · `WL800_CLOSE.md`

Title-only (no L2 / no caption). Building · builder-no-rent · token-meter. Jev/$ = **UNVERIFIED**.

| yt | Title | Steal (title-level) | Label |
|---|---|---|---|
| `w16-JRiCaZ8` | Can Grok Bot scale my company of one? (Brian Casel) | Company-of-one scale via **owned** Grok bots + routines — not a new bot SKU / second face | FACT title · scale claims **UNVERIFIED** |
| `dEBMnnJMmCI` | Every Grok Bot Hack I Know (Moritz | AI Systems) | Hack shelf → prompts/tools/skills/workflows buckets; prefer enrich over mint | FACT title · each “hack” **UNVERIFIED** until L2 |
| `4hKJ9X6rGFo` | Build & Sell Grok Bots (2 Hour Course) (Nate Herk | AI Automation) | Sell/build course shape → pair [client-delivery-checklist-grok-first](sand-workflow:client-delivery-checklist-grok-first); $ / close-rate **UNVERIFIED** | FACT title · no invent $ |

### Do
1. Map any Grok Bot tip into existing desks/Tasks/routines (max-3).
2. Close with research-signal-to-skills four buckets.
3. Keep Grok Bot as hive face — no ChatGPT/Claude/Jarvis clone face.

### Don't
- Install Jarvis / Jev / Eden / Claude desktop as the “Grok Bot” implementation
- Quote course revenue or hack ROI as FACT
- Mint one skill per tip video

### Tools
| Need | Path |
|---|---|
| Grok Bot + routines | **PROVE** |
| Title-only close | **PROVE** (this stamp) |
| L2 / ASR this fire | **SKIP** (honest — no prove-one) |

## X bookmarks live 20260917-1334

Packet: `/workspace/research/packets/x-bookmarks/20260917-1334/`

**FACT:** Live user-X @snevemoney count=95 · +3/−3 vs 1048 · dumps refreshed.

### Cluster
Launch-video craft: YC taxonomy + breakdowns quoting Bolt Forge / X Android rebuild. Enrich `reference-driven-video-production` · `motion-pipeline`. Topic SSOT launch-video-e2e (no new skill mint).

### Removed → NO-SKILL reverse
Silo interactive viz (@Nal_uh) leisure; GitHub/OpenWhispr listicles already covered by host-outside / no-rent patterns — no reverse enrich.

### Four buckets
| Bucket | Extract |
|---|---|
| Prompts | launch brief beat sheet from taxonomy refs |
| Tools | user-X pull **PROVE**; Remotion **PROVE**; Higgsfield prove-this-session; Bolt face **BLOCKED** |
| Skills | enrich reference-driven · motion-pipeline · this skill |
| Workflows | launch-video-e2e topic (organic HITL); no paid-ads routine |

Don'ts: invent views/$; mint-per-URL; unasked vendor L2; leisure productize.

## X bookmarks live 20260917-1629

Packet: `/workspace/research/packets/x-bookmarks/20260917-1629/`

**FACT:** Live user-X @snevemoney count=95 · +3/−3 vs 1334 · dumps refreshed.

### Cluster close
| Add | Action |
|---|---|
| Pop Site V2 (x:2097832985274020043) | **NO-SKILL** install (free personal-site landgrab) |
| Higgsfield ChatGPT AE Motion Designer (x:2098409362041753708) | enrich `motion-pipeline` + `ae-akira` · AE plugin **BLOCKED** · MCP+Remotion **WORKAROUND** |
| Fakhar ElevenLabs launch breakdown (x:2100478599400714730) | enrich `reference-driven-video-production` · launch-video-e2e continuity |

### Removed (no reverse)
Framer Agent demo · Appwrite listicle · Claude Artifacts MCP dashboards.

### Four buckets
| Bucket | Extract |
|---|---|
| Prompts | launch brief / motion plate brief |
| Tools | user-X **PROVE**; Higgsfield MCP **PROVE**; ChatGPT AE plugin **BLOCKED**; Pop Site **BLOCKED** |
| Skills | enrich motion-pipeline · reference-driven · ae-akira · this skill |
| Workflows | launch-video-e2e topic; no Pop Site / AE-plugin routine |

Don'ts: invent views; AE plugin face; Pop Site face; unasked vendor L2; mint-per-URL.

## X bookmarks live 20260918-1338

Packet: `/workspace/research/packets/x-bookmarks/20260918-1338/`

**FACT:** Live user-X @snevemoney count=96 · +10/−9 vs 1629 · dumps refreshed (parent pull; this close skill-only).

### Cluster close
| Add | Action |
|---|---|
| Jev ultrafast + gilgNYC (x:2100411068426469552 · x:2100786001765371926) | enrich `match-model-to-task` · RESEARCH-OK via import-gate · **no install** |
| svpino bypass (x:2100591905868509643) | **NO-SKILL** / QUARANTINE (no CAPTCHA/paywall recipes) |
| hlibtrazanov block library (x:2100564186614898813) | enrich `reference-driven-video-production` |
| 3D gradients + don't-ask-AI + voice glow | enrich `cinematic-site-recipe` · `ui-compose` · `own-motion-kit` · `redesign-existing-projects` |
| Mac notch Grok/Rive (x:2100662110107664574) | enrich **this skill only** · notch face **NO** · WORKAROUND = Grok Bot chat UI we already have |
| Hiring Motion Designer · Cyril article | **NO-SKILL** |

### Removed (no reverse)
mikenevermiss link · Kartik designs · face SDK · DeRonin link · iOS checklist · Fable $50k tutorial · Roundtable Fable/Karpathy/OpenDesign.

### Four buckets
| Bucket | Extract |
|---|---|
| Prompts | cheap-read vs escalate; refs-first design; video block labels |
| Tools | user-X **PROVE**; Playwright/Browser-use MCP **PROVE**; jev-ultrafast install **BLOCKED**; Mac notch **BLOCKED** |
| Skills | enrich cheap-read · import-gate · reference-driven · cinematic-site · ui-primitives · own-motion · taste-redesign · this skill |
| Workflows | launch-video-e2e topic; no bypass routine; no notch face routine |

Don'ts: install second browser face; CAPTCHA bypass how-tos; Mac notch hive face; invent system-one skill; unread article productize; paid ads; mint-per-URL; desk fan-out.

## Operator lock 2026-09-18 — three overnight demo loops
SSOT: `CONTENT/topics/signal-overnight-demo-loops-20260918.md` · skill [signal-overnight-demo-loops](sand-workflow:signal-overnight-demo-loops)
- **A BUILD** → Forge CloudAgent + preview → morning Forge link → HITL `/work`
- **B MOTION** → Creative Remotion mp4 → morning Creative link → motion library
- **C STACK** → Researcher proof (not Consultant) → morning Researcher proof → stack merge/park
Token-meter: ≤1 per lane/night. Cloudflare preview RESEARCH-OK; Origin/box WORKAROUND. live `/` HOLD until approve.

## Overnight C_STACK pointer
`yt:rW3eyvrSqio` closed 2026-09-21 — enrich mcp-connector-live-proof + find-costs-to-cut; recreation under `l2-20260921/rW3eyvrSqio/`. No mint-per-URL.

## Signals close 2026-09-22 10:17 ET

Packet: `/workspace/research/packets/signals-close-20260922-1017/`

**FACT:** Weekday signals close. Live `user-X` `get_users_me` **PROVE** (@snevemoney / 514498939). `get_users_bookmarks` **BLOCKED** spend-cap-reached (again; same as 20260921-1937). MCP wallet credits >0 does **not** unblock bookmarks. Disk dump left unstamped at `2026-09-18T17:38:51Z` count **96** — stale dump ≠ live; do **not** invent IDs or compute +/−.

**FACT:** YT morning SoT already closed (`youtube-daily/2026-09-22.md`): Today 16 / Yesterday 63; prove-one `yt:Fr2nqjVTxhI` A–E PASS; enriched `agent-harness-loops` + `session-bootstrap`. No NEW_SINCE_MORNING re-scrape this fire (prefer connectors; morning SoT fresh).

### Cluster close (this fire)
| Signal | Action |
|---|---|
| Dual-desk Grok Bot ops ↔ Cursor Projects (`yt:Fr2nqjVTxhI`) | **Already skill-closed morning** — absorb as standing route: Grok Bot = ops/signals; Cursor Project / CloudAgent = codebase. Handoff dump before switch. Product shared-memory Grok↔Cursor = **UNVERIFIED** → Outer Heaven / packets |
| X CapEx fullwatch GRAY 28/28 + BUILDER 30/30 | **CLOSED** under `packets/x-bookmark-videos-fullwatch-20260922/` — CapEx closed ≠ live bookmark ingest |
| Live X bookmarks | **fail-closed** until spend-cap reset; quiet / no delta; no Mac xurl primary |
| Jev / JS Mastery shelf titles | title-only / L2 shelf — **no** mint-per-URL; Cap ≤1 prove-one already used |
| `github.com/CopilotKit/OpenBot` | already on install queue **PROPOSE_YELLOW** — research-ok; not hive face; **no** new QUEUE row |

### Four buckets
| Bucket | Extract |
|---|---|
| Prompts | dual-desk classify at session start; spend-cap = fail-closed note not invent |
| Tools | user-X me **PROVE**; bookmarks **BLOCKED** spend-cap; YT box Chrome morning SoT **PROVE**; Claude desktop face **BLOCKED** → Cursor |
| Skills | enrich **this skill**; morning already enriched agent-harness-loops · session-bootstrap · research-signal-to-skills |
| Workflows | signals daily close stays quiet on 0 live X delta; CapEx fullwatch lane separate from ingest |

Don'ts: invent bookmark IDs from Sep 18 dump; claim live ingest while spend-capped; mint-per-Jev-URL; second desktop / OpenBot as hive face; Claude desktop face; desk fan-out; paid ads; $ as FACT.
