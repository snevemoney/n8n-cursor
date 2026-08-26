# Forge — 3TdD8Qv5Tk8
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3TdD8Qv5Tk8/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3TdD8Qv5Tk8/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **“Master 97% of Codex in 1 hour”** — 97% is a title, UNVERIFIED. Caption-only. Visual/click **UNKNOWN**. Codex = ChatGPT UI + local files + browser + skills; he still uses Claude Code (explore/plan) vs Codex (pragmatic execute / long-plan follow / troubleshoot). Same directory is the product; any harness (Codex / Claude / Cursor / Open Claw) can sit on it if the map exists. Demo: **YouTube comment intelligence** from zero — comments → Excel + viz → localhost dashboard → GitHub private repo → **Vercel** → weekly Sunday 5pm automation. Needs a ChatGPT plan ($20 start; Pro if limits) UNVERIFIED; ChatGPT sub also plugs into OpenClaw/Hermes. App vs VS Code/terminal (app “gets you far”). New **project** (not a homeless chat) → folder `YouTube analytics demo`. Vague “look on desktop for YouTube OS” works but wastes tokens; **point the path**. Extra-high overkill for read-10-transcripts; he sits medium, high for big builds, extra-high for stuck bugs. Chat memory dies; write **`agents.md`** (Claude.md analog). Plan mode + yap (Glydo STT). No YouTube plugin → ask the agent; it finds a key in another project — he forces a **fresh** Google Cloud key, Codex ≠ Claude. `.env.local`; restrict key to YouTube Data API v3; channel ID already in the other project. Settings: default vs **orange full/autonomous**; allow-network prompts; horror stories (DB delete / mass email) — he has never had one; blames context rot / vague / bad plan. PowerShell TLS fail; Node/Python OK — **persist the miss** into `agents.md` (do not let that file become huge). Context bar; Claude/Opus ~4× window UNVERIFIED; Codex auto-compacts. ~200 comments / 3 videos → Excel May 5 (question rate, tool mentions, recommended actions, 204 rows). Vague prompt = generic insights. Skill-from-output (pancake recipe); global `.codex` vs local project. Pets (Fireball) as a ding-when-done. New chat + `@` the Excel → localhost dashboard; GPT Image 2 concepts; extra-high default → he switches medium; rate limits 5h/weekly UNVERIFIED. Built-in verify: browser pass, visual pass finds 3 issues, rebuild. Comment links do not open. Localhost ≠ shareable. Git vs GitHub; do not commit `.env.local`. Vercel free tier; GitHub↔Vercel auto-deploy; localhost change does not touch prod until push. Automations = scheduled chats; bike-training-wheels trust. Local cron **dies if the app/PC is off**; cloud routines are the 24/7 path. Browser-use QA (Alice mouse); 6 findings. First weekly run: Excel file **open** so it cannot overwrite (~20 min waste); automation defaulted to **GPT 5.2** not 5.5; he stops, asks why, switches 5.5 high; 208 comments (deduped +8); Vercel new deploy. Dark code: know what/why; ask to streamline; weekly job does not need to be fast; it says still too agent-orchestrated. Close: folder is the product; plan in Claude, execute in Codex; next video = AI OS. Skool PDF. On-tape: Codex, Claude Code, Vercel, GitHub, Glydo, Skool, Open Claw, Hermes. Cursor + Grok only.

## B. Atomic Knowledge

### Point the folder; persist the miss; found key ≠ safe key
- **Claim:** A working system is a directory plus an onboarding file (`agents.md`). Vague “look around” burns tokens and guesses the wrong child folder (`raw` vs `processed`). When a failure happens (PowerShell TLS), that is golden — write it into project memory so the next chat does not repeat it. A key found in another project is a leak, not a shortcut; he makes a **fresh** YouTube Data API key for this harness.
- **Reasoning:** Chat/ChatGPT memory dies on a new thread. Files travel. Blast radius: Codex ≠ Claude keys.
- **Mechanism:** Copy the path. Plan mode. `.env.local` (dot-prefix = do not commit). Restrict the key to one API.
- **Evidence:** Nine transcripts after a search; agents.md created; TLS miss filed; key test then works on Node/Python.
- **Conditions:** You own the folder and the keys.
- **Exceptions:** Extra-high on a simple read over-builds. Do not dump every miss into a giant agents.md (token tax).
- **Action:** Steal point / persist-miss / separate keys. Do not install Codex. Do not reuse hive keys across harnesses we do not run.
- **Confidence:** high.
- **Source:** `3TdD8Qv5Tk8` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** vague folder search; TLS; found-key temptation
- **Speech ≠ behavior:** “I never had a mass-email problem” vs he still cites those horror stories as why default permissions exist

### Localhost ≠ live; weekly loop is a kid on a bike; dark code gets a streamline pass
- **Claim:** In-app / localhost is not a URL you can text. GitHub private repo + Vercel is his “on the phone” step. Push is what touches prod. Automations are scheduled chats that inject a prompt; they are not magic on shot one. Local schedule dies when the laptop sleeps. Browser-use QA finds what the first visual pass missed (YouTube links). First Sunday-style run failed because the Excel file was open and the automation was on the wrong model (5.2). Dedup worked (+8 → 208). Dark code: you need what/why, not every line; ask “streamline / guardrails”; weekly refresh can be slow; he is told it is still too agent-heavy.
- **Reasoning:** Trust is earned (training wheels). Watching the first runs saves session when the human fix is “close the file.”
- **Mechanism:** Skill-from-liked-output → schedule that skill → commit only the refresh → Vercel picks up. After a messy run: stop, ask what it needs, then “how do we make this thinner?”
- **Evidence:** `*.vercel.app` narrated; two GitHub commits; 200 → 208 on the live dashboard.
- **Conditions:** GitHub CLI already set up in the demo. App must stay open for local cron.
- **Exceptions:** Cloud routines (Claude) named as the 24/7 path — on-tape, not ours.
- **Action:** Steal localhost-vs-prod, watch-the-first-runs, persist-then-thin. Do not Vercel-from-chat. Publish HITL. Do not auto-reply YouTube.
- **Confidence:** high on the loop; deploy URL UNVERIFIED.
- **Source:** `3TdD8Qv5Tk8` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** file-locked Excel; wrong model on the automation; 40 min vs 20 min first build
- **Speech ≠ behavior:** “completely automatically” vs he had to stop it twice

## C. Mental Models
Harness ≠ model. Extra-high is not a default. Chat memory ≠ project memory. Found secret ≠ safe secret. Folder is the product. Per-task Claude/Codex (plan vs execute). Orange autonomous is a hose. Automations are children, not employees. Dark code is allowed if you can say what/why and whether it should be thinner. 97% is marketing. Pets are a ding, not an OS.

## D. Procedures
1. Do not install Codex / Claude Code / Vercel-from-chat / Glydo / Skool / Open Claw / Hermes. Cursor + Grok.
2. Do not Always-Allow network. Do not YouTube Data API in the hive. Do not auto-reply comments.
3. New slice: one folder. Point the path. Plan. Write `agents.md` analog (we already have repo docs).
4. Secrets in `.env`; never commit. Fresh key per harness/job. Found key → rotate/new, do not reuse.
5. When it fails: write the miss into the project file (not a novel).
6. Localhost is a preview. Prod deploy / custom domain / DNS = HITL.
7. First scheduled run: watch it. Close the files it must write. Check the model the schedule actually uses.
8. After it works: ask to thin. Weekly jobs optimize for correct, not fast.
9. Tool choice is per task, not a religion.
10. Tape $ / 97% / rate-limit % UNVERIFIED.

## E. Examples
**Situation:** “Look on my desktop for YouTube OS and read 10 transcripts.”  
**Action:** It searches, hits raw vs processed ambiguity.  
**Reasoning:** He wanted to show navigation.  
**Outcome:** Works, wastes tokens.  
**Lesson:** Point the path.

**Situation:** Agent finds a YouTube key in another project.  
**Action:** “Glad you found it — make a new one; Codex ≠ Claude.”  
**Reasoning:** Blast radius.  
**Outcome:** Fresh Google Cloud key, restricted to Data API v3.  
**Lesson:** Found secrets are a leak.

**Situation:** PowerShell TLS fails; Node/Python work.  
**Action:** “Save that so it never happens again” → agents.md.  
**Reasoning:** Failures are golden.  
**Outcome:** Next chat has the constraint.  
**Lesson:** Persist the miss.

**Situation:** Weekly refresh hangs ~20–40 min.  
**Action:** Excel was open; automation on 5.2; he stops, switches 5.5 high, asks what it needs; 7 min later +8 comments, Vercel redeploys.  
**Reasoning:** Human 20-second fix beats a token fire.  
**Outcome:** 208, deduped.  
**Lesson:** Watch the first bike ride. Check the model the cron actually has.

## F. Decision Rules
- IF new work → project folder + agents.md, not a homeless chat.
- IF you can copy a path → do not make it search the desktop.
- IF the job is simple → medium, not extra-high.
- IF it found a key elsewhere → new key.
- IF a fail happened → write it down once.
- IF agents.md is becoming a novel → split memory.
- IF URL is localhost → it is not shipped.
- IF you like the localhost change → explicit push is what touches prod.
- IF schedule is local → laptop must stay awake (or it is a lie).
- IF first automation run → watch; check model; do not leave the output file open.
- IF it works but is heavy → ask to streamline; weekly can be slow.
- IF you need a plan vs an execute → he uses Claude then Codex. Hive: Cursor + Grok for both.

## G. Contrarian
Field treats Codex as a Claude replacement. He will not ditch Claude. Field smash-Recommended / extra-high everything. He treats extra-high as a bug hammer. Field reuses the key the agent found. He refuses. Field deploys and walks away. He watches the first rides and then asks to thin.

## H. Assumptions
$20/Pro, 97% remaining, 4× window, Vercel free, May 5 sheet, 200/208 comments, 20 vs 40 min = **UNVERIFIED**. Skool/Glydo magnets. “I never had a mass email” is survivorship. Clients parked. YouTube comment auto-reply referenced as something he has done — hive never.

## I. Questions
What is our persist-the-miss file for the current slice?  
Which scheduled job would lie if the laptop slept?  
Where would a found-key reuse bite us if we ever touched a second harness?

## J. Connections
SYSTEM SYNTHESIS: `RLjaUES9P8A` Claude vs Codex bake-off (do not flatten). `U6k4MeVks_Y` plan / folder / talk-to-deploy. `gb5TlGw6Uks` intern keys + nightly git. `iTY8Q449YNQ` verify. `8QQ_INxAhRs` keys not prompts. Hive: `slice-build`, `golden-test-loop`, `click-live-site`. No Codex / Vercel-from-chat / YouTube API.

## K. Future-Use
Point-the-path. Persist-the-miss. Separate keys. Localhost ≠ prod. Watch first cron. Check the model the schedule has. Thin after it works. Folder is the product. Unassigned.

## Steal / Operate-never

### Machine: zero-to-folder → persist misses → preview ≠ prod → watch the first schedule
- **Epistemic:** SOURCE
- **Workflow / loop:** new folder → point paths → plan → agents.md → fresh secrets in .env → one deliverable → skill-from-liked-output → localhost preview → (HITL) repo → (HITL) host → watch first timed run → write misses → ask to thin
- **Questions / signals:** Did I point? Whose key is this? Is this localhost or live? Is the output file open? Which model does the cron actually use?
- **Qualify / frame / objections:** Extra-high is a bug hammer. Orange autonomous is a hose. “Completely automatically” was two stops.
- **Procedure:** D 3–8.
- **Example that proves it:** Found key refused; TLS filed; Excel-open hang; 5.2→5.5; 200→208.
- **Why it works:** Files outlive chats; failures are the only new data; prod is a push, not a pane.
- **Conditions / exceptions:** Caption-only. Tape $ UNVERIFIED. Hive does not run YouTube API or Vercel-from-chat.
- **Operate-never payload:** Codex install; Always-Allow; auto-reply; quote 97%; Skool.
- **Hive run:** `slice-build` + `golden-test-loop` + `ask-principal` before any publish.
- **Source:** `3TdD8Qv5Tk8` @ UNKNOWN

### Operate-never
- Do not install Codex / Claude Code / Open Claw / Hermes / Glydo / Skool.
- Do not talk-to-deploy Vercel. Publish HITL.
- Do not Always-Allow network. Do not YouTube Data API. Do not auto-reply comments.
- Do not reuse a found key. Do not commit `.env`.
- Do not quote $20 / 97% / 4× window as FACT.
- Clients parked. Cursor + Grok only.

## L. Role-Specific Applications
Forge steals **point-the-path**, **persist-the-miss**, **found-key-is-a-leak**, **localhost≠prod**, **watch-the-first-cron**, **thin-after-it-works**, **folder-is-the-product**. Does not steal Codex, Vercel-from-chat, or comment intelligence as a hive SKU. Cursor + Grok.
