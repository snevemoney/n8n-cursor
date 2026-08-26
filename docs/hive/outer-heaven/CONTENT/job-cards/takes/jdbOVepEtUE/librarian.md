# Librarian — jdbOVepEtUE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/jdbOVepEtUE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/jdbOVepEtUE/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Claude Code for Non-Coders (6 Hour Course)
**Channel:** Nate Herk | AI Automation
**Kind:** video (~5:58:59 / ~85931 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Entire `full.txt` (~10121 lines) in beat order. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Promise: beginner → AI-native; skip-around TOC; he has no CS background. Businesses (content, education, certs, events, consulting) run on a small AI-fluent team. One person does former-team work. **Claude Chat** (search/drafts) vs **Cowork** (managers; whole product shipped in ~a week by a few engineers using Code) vs **Code** (local files + web; he never uses Cowork). Same models (Opus / Sonnet / Haiku / **Fable**). Harness = Code; three-layer circle: model → harness → you. Car: engine / car / driver; **you** are the scarce part. Interchangeable model/harness later. Book **Becoming AI Native** (12 mindset shifts) referenced throughout.
2. **Six skills** (embedded career tape): (1) **Be the AI person** — relative, not world’s-best; show weekend work; IBM **2026 CEO** “**85%** of CEOs: every functional leader must be a tech expert in their domain” (UNVERIFIED; keep IBM 85 vs 86 dissent). Excel-or-you’re-done. Pick **one** tool (his: Claude, **May 2026**) + one weekly workflow; document before/after; don’t leak company data; if Claude is banned, the policy itself is the project. (2) **Taste** — don’t trust first output; bullet→email→bullet joke; em-dash tell; your **name** is on it; study best work; save a library; feed every correction back. (3) **Context engineer** — Karpathy “delicate art” (he says Karpathy **joined Anthropic**); prompts fade, context stays; AIOS sees meetings/YT/DMs/Slack/email; joke: if you can’t reach Nate, message the AIOS. Don’t open a blank chat — Claude project / custom GPT with real docs. Summer intern. Garbage in. (4) **Iteration speed** — bike + 15th kid; shortcuts + **Glydo**; ugly PC first; **define done** (tickets/day, appointments/week, refund %); then maintenance. (5) **Jarvis** — acts without you as trigger; audit predictable triggers; vending vs slot; default simplest; “we don’t need AI here” is the elite AI-person move. (6) **Unemployment insurance** — job-stack same north star, not five domains; build in public / exist where **AI search** can find you; check contracts/non-competes. Then mindsets: AI-native = **what your hand reaches for**; **don’t quit the dip** (short-term −20% for later +60% UNVERIFIED); you are a **manager** (onboard, define good/bad, review, persist).
3. Install: Google docs / terminal **or** Desktop app (he uses Desktop today). Need a paid plan — **Pro** first, then **$100 / $200** Max. $200/mo vs **$100k** PM/engineer (UNVERIFIED). Desktop = chats/projects; VS Code / terminal / extension = same files. Find AIS Live black logo in Downloads (search + **vision** + PowerShell). `/goal` Q2 YT assessment → Excel in Herk 2 (~**10 min**, ~**75** videos UNVERIFIED). Prompt levers: **role, context, negative, prove-its-work** (first pass ~60% if you verify; ~80% if it self-checks — UNVERIFIED). Tokens (July 2026 claimed): Haiku **$1/$5**, Sonnet **$3/$15**, Opus 4.8 **$5/$25** per M in/out; Fable **~2× Opus**. Excel ~**25k** output ≈ **$0.63**; session **428k / 1M**. Subscription: 5-hour rolling + weekly all-models + **Fable** cap; he claims **~$8k** inference on $200 Max (UNVERIFIED). API = much more.
4. `CLAUDE.md` = system prompt / **router** (EA role + where things live). Hello already knows AIS Live dates because the file loaded. Persist misses into it (sources, em-dashes). `.md` = markdown. Demo folder **knowledge work** → trust workspace. **Global** vs **project**: global kill-list / likes-dislikes (`~/.claude/CLAUDE.md`); project empty until init. Always init `CLAUDE.md` + `.claude/` (settings.json, agents/, skills/). Grill-me skill is markdown. Hits 5-hour → **usage credits** (per-token). API = software talking; YouTube key ≠ MrBeast’s private stats. **Tavily** 1,000 free credits; native web search exists; persist endpoint in `CLAUDE.md` after `/clear` **forgets** the working call (token tax if you re-research). MCP ≈ API ≈ CLI — pick one, don’t drown. Permissions: auto / manual / accept-edits / plan / **bypass** (“dangerously skip”). Horror: **150k** list discount (same incident as `RzLV8sfFdMM`). Scope keys (**11 Labs** sound-effects-only + credit cap). Intern ≠ credit card. Herk 2 settings: allow bash/web/MCP; **deny delete/rm**. He bypasses **because** deny-list exists. Auto mode “new and solid.” Fast: never. Effort: he leaves **high**; GPT 5.5 effort ↑ cost not score; Fable high/max **overthinks**; Opus extra-high “feels better,” slower/dearer.
5. Privacy: closed weights leave the machine; OSS stays home, weaker. Don’t send PII/cards/legal if the org forbids it; some clients required **on-prem**. Oct **8** policy: training **opt-in but forced choice** (Help improve Claude). Toggle off ≠ they don’t **have** the data. Four **C’s**: context, connections, capabilities, cadence. Tier-1 connects: revenue, customers, calendar, coms, tasks, meetings, knowledge (Stripe/Skool/ClickUp/Slack/Fireflies/Drive/YT). Habit: **% of the day from this window**. GWS CLI insert (older VS Code clip): one CLI → Drive/Gmail/Cal/Docs/Sheets/Slides; **100+** recipes; JSON-first; **not** official Google (breaking toward v1); API Docs look like raw markdown, CLI looks like a real guide. OAuth: option A GCloud vs manual project + consent + desktop client JSON in `~/.config/gws`; enable APIs one-by-one. Context bar / `/clear` / rot before memory section.
6. Memory: chat vs preferences/decisions vs second brain. Auto-memory: **72** one-fact `.md` files + `memory.md` index (user/feedback/project/reference). `CLAUDE.md` = rules; memory = learned facts; Herkbrain **wiki not autoloaded**. `/memory` in **terminal**, not Desktop (`/consolidate` only) — Desktop ≠ 100% of slash. Mentor, not just engineer. **AI slop**: trust die if they can tell you didn’t proof; “outsource thinking, never understanding”; kill-list; writer → reviewer. Method (book): constraint is the only place work compounds; don’t automate a broken process; AI-native ≠ AI-everything; can’t automate what you can’t map; **one number before you build**. Pipe: **5× customers tomorrow, what breaks first?** Next clog appears. Skills: progressive disclosure / YAML; slash or NL; **skill-creator**; two paths (write first vs do-then-skill). Inbox-triage: GWS reachable, **201** unread; last 25–30; **brief only, no labels** until battle-tested. Packaging skill routes playbooks/sub-agents (stale sub count). Superpowers plugin; Matt Pocock grill = ~6 sentences.
7. Sub-agents insert (“better than **99%**”): main = orchestrator; subs **cannot peer-talk**; fresh window; Haiku/Sonnet research under Opus main; built-in vs custom `.md`; book review **~8/10**. YAML: name, description (misfire tuning), model, color, tools / disallowed / MCP / skills. Skill vs sub: same SOP; sub = clean window + parallel + cheaper model. Project vs global (session-handoff is **global**). Websites + GitHub: localhost **is not shareable** (beginner-tweet meme). Five hacks (older clip): **#0** `CLAUDE.md` from School classroom; always invoke **frontend-design** skill; `brand_assets`; Puppeteer screenshot loop; clone via **F12 full-page + copied styles** (Dribbble / Godly / Awwwards); **21st.dev** components; GitHub → Vercel; **Claude Design** (separate course). Bypass: “never really an issue” because he watches — UNVERIFIED. Screenshot folder unnamed. Hormozi/Sam Ovens photos named as assets.
8. Trust: vending vs slot; **climb-only pyramid** (chatbot/skill you trigger → no-AI workflow → AI workflow fixed order → agent unknown tool path). CS email walked at each layer. Prompt “never send” is a **suggestion**; **no send tool**. Same 150k blast. Old inbox **agent** (huge prompt + many tools) unreliable → rebuilt as **AI workflow** (contact? extract? three route rules). Second-brain five levels (also `DTCyvo6cC54`): L1 router+folders; L2 wiki/Karpathy LLM-wiki + automemory (he **sits here**); L3 semantic (Pinecone/Supabase); L4 graph (LightRAG — he does **not** daily; content/project work); L5 always-on **Gbrain**/GStack + Hermes crons (too much context scare). Reverse-engineer the question (square ball / hoop). Tool-agnostic: copy `CLAUDE.md` → `AGENTS.md` for Codex. Evergreen **context** (OKRs) vs live **connections** (Slack/email) — don’t ingest noise; give a path to go **get** it. Team second brains: mentioned, not fully solved. Grill-me to empty the human head; edit-insert: Anthropic **sees** it — OSS if you can’t send client data.
9. Agent teams ≠ subs: shared task list, **peer talk**, token-heavy. Dynamic workflows = phased **subs**. His use: **war room / roast / debate to consensus**. Experimental: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in project settings; new session. IBM 2026 PDF: convert PDF→text (agents hate PDF metadata). Speech≠behavior: first spin was **six parallel subs** — he **stopped** and corrected (“use team create”). Routines: keep full WAT (self-correct, memory trail even if run is stateless); **no local files** (repo/APIs only); not teammate-shareable (team plan untested); cost = subscription; test with Run now; **limited runs/day** (keep `xJ5oz63mIec` / `gb5TlGw6Uks` 15/day). Linear briefing → **don’t** use a routine: Modal / Trigger.dev Python. Modal ~$5 free + $25 with card (UNVERIFIED). Open Router one key vs many dashboards; ClickUp **DM to Nate only**. Remote control (works in terminal, flaky in Desktop).
10. Token course-in-course: every turn **rereads** the chat; 100-msg track **98.5%** reread (UNVERIFIED); 30 msgs → ~quarter-million cumulative. Invisible: `CLAUDE.md` + MCP + skills every turn. Lost-in-the-middle. **18 hacks** T1–T3: `/clear` between tasks; disconnect MCP (**~18k**/server/msg); CLI > MCP; batch (edit original, don’t follow-up); plan + “95% confidence” in `CLAUDE.md`; `/context` `/cost` (fresh session already **51k**); status line (terminal); keep usage dashboard; paste only the function; **watch** (80% tokens can be zero-value). T2: `CLAUDE.md` **<200 lines** as index; `@` files; compact **~60%** (auto at 95% is late); 3–4 compacts then handoff+clear; **5-min** prompt-cache timeout on step-away; deny noisy bash. Hitting the limit = **power user**, not shame. T3: Sonnet default, Haiku subs, Opus <20%; Codex plugin to review; subs **7–10×** tokens; teams sparingly; peak **8am–2pm ET weekdays**; spend leftover before reset / walk if almost empty. Constitution: decisions not chats; applied-learning bullets **<15 words**. Homework list. Quality vs cost. **Not a limits problem — context hygiene.** Cache: **10%** of input; he saved **91M** one day / **300M** a week (UNVERIFIED). Sub TTL **1 hour**; API / sub-agents **5 min**; rumor they silently cut to 5 min — he says they **didn’t**. Thoric: alert on low hit rate. Three habits: don’t pause >1h; fresh on task switch; session-handoff skill > `/compact` (205k example, ~1 min). `opus-plan` **breaks cache** (each plan toggle = model switch). Mid-session `CLAUDE.md` edit applies on **restart** (cache safe). Token dashboard = School GitHub → localhost, **local-device only**.
11. Close: four C’s — context/connections already built; capabilities/cadence = skills/agents/routines/deploys. Sends viewers to **free 2-hour AIOS** in School classroom (never finished; weekly add). Plus community CTA. Claude / Fable / Codex / Hermes / Modal / Trigger / Open Router / GWS / Tavily / Glydo / School / Plus stay on tape.
Gap: TOC slide, Excalidraw/car, pipe drawing, IBM PDF, cloned French site, LightRAG graph (blurred). Timestamp UNKNOWN. Speech≠behavior: “Desktop is enough” vs `/memory` and remote-control only in terminal; “I sit at L2” vs Gbrain/Hermes play; “never had bypass issues” vs 150k send; first agent-team demo was subs; 99% sub-agent title vs 98% Cole tape.

## B. Atomic Knowledge

### You are the manager; the hand reaches first
- **Claim:** AI-native is default-to-the-window, not model trivia. Onboard like an intern; review like a manager; persist the miss. Don’t quit the dip.
- **Evidence:** “what your hand reaches for” / “you are just a manager”
- **Action:** File manager-loop; hive sit-and-drive is Cursor
- **Confidence:** high as course spine
- **Source:** `jdbOVepEtUE` @ UNKNOWN
- **Epistemic:** SOURCE

### Six skills — taste, context, iterate, Jarvis, stack
- **Claim:** Relative AI-person; taste = what deserves your name; context > prompt; iterate then **define done**; Jarvis only after airtight; stack one passion, exist where AI can find you.
- **Evidence:** six-skill block / bike / vending vs slot / unemployment insurance
- **Action:** File the six; IBM 85% UNVERIFIED
- **Confidence:** high as his list
- **Source:** `jdbOVepEtUE` @ UNKNOWN
- **Epistemic:** SOURCE

### CLAUDE.md is a router, not a novel
- **Claim:** Role + where-things-live. Global kill-list vs project. Keep **<200 lines**; point, don’t dump. Persist Tavily-class endpoints so `/clear` doesn’t re-research. Auto-memory = one-fact files; wiki not autoloaded.
- **Evidence:** EA routing map / “treat this cloudmd as a router” / <200 lines hack
- **Action:** File router-md; do not ingest 72 memory files
- **Confidence:** high
- **Source:** `jdbOVepEtUE` @ UNKNOWN
- **Epistemic:** SOURCE

### Climb-only + no send tool
- **Claim:** Chatbot/skill you trigger → no-AI workflow → AI workflow → agent. Prompt is a suggestion; if it can send, assume it will (150k). Inbox rebuilt as routed workflow. Bypass only behind a deny-list, and he still watches.
- **Evidence:** pyramid walk / “prompting is almost just more like a suggestion” / 150k blast
- **Action:** File climb + tool-layer; keep `4OOS96i2gfI`
- **Confidence:** high
- **Source:** `jdbOVepEtUE` @ UNKNOWN
- **Epistemic:** SOURCE

### He sits at second-brain L2
- **Claim:** L1 folders+router; L2 wiki; L3 semantic; L4 graph (not daily); L5 Gbrain/Hermes always-on (context scare). Evergreen in; live data fetched. Square-ball: store for the question you’ll ask. Team brains unsolved.
- **Evidence:** “I pretty much sit… in level two” / four C’s evergreen vs noise
- **Action:** File L2 + evergreen; keep `DTCyvo6cC54`
- **Confidence:** high
- **Source:** `jdbOVepEtUE` @ UNKNOWN
- **Epistemic:** SOURCE

### Context hygiene, not a bigger plan
- **Claim:** Every turn rereads; MCP/CLI tax; `/clear`; plan; watch; compact ~60%; cache 1h vs 5m; `opus-plan` breaks cache; session-handoff > compact. Hitting the cap can mean you’re using the tool.
- **Evidence:** 98.5% reread / 51k before hello / Thoric cache alerts
- **Action:** File hygiene; all %/$ UNVERIFIED
- **Confidence:** high as procedure
- **Source:** `jdbOVepEtUE` @ UNKNOWN
- **Epistemic:** SOURCE

### CLI > MCP; localhost ≠ shipped
- **Claim:** GWS CLI one tool, 100 recipes, unofficial. Skill after a liked run or write-first. Subs = clean window; teams = peer talk (experimental; first demo failed). Routines keep WAT but no local disk + daily cap; linear jobs → Modal script.
- **Evidence:** GWS vs markdown-API docs / “use the team create function” / laptop-off vs cloud routine
- **Action:** File CLI-over-MCP + test-then-push; deploy HITL
- **Confidence:** high
- **Source:** `jdbOVepEtUE` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Car/harness/you. Relative AI-person. Taste = name. Intern. Bike. Jarvis vs trigger. Vending vs slot. Unemployment insurance. Don’t quit the dip. Manager. Router-md. Four C’s. Pipe/constraint. Climb-only. L1–L5 (sit L2). War room ≠ cubicles. WAT vs script. Reread compounding. Cache TTL. Hygiene not limits.

## D. Procedures
Paid Claude → Desktop (know terminal gaps) → knowledge-work folder + trust → `CLAUDE.md` + `.claude/` → global kill-list → named `.env` keys (Tavily/GWS/Open Router) → persist the working call → scoped tools (no send) → skill after liked or skill-creator → inbox brief-only until tested → localhost + screenshot loop → HITL push → routine only if you need the loop; else Modal → `/clear` / handoff / compact-60 / watch. Avoid: blank chats; 20 MCPs; localhost-as-URL; PDF-as-source; opus-plan if you care about cache; Gbrain ingest-everything. Signals: Tavily forget after clear; six-subs-not-a-team; 201 unread; French clone; 51k before hello.

## E. Examples
**Tavily after /clear:** Situation — key worked, then clear. Action — native search, then bad key, then persist endpoint in `CLAUDE.md`. Lesson — session memory ≠ project memory.

**150k send:** Situation — proactive agent, tool present. Action — apology (same as Cole tape). Lesson — no send tool.

**Agent-team miss:** Situation — “create a team.” Action — six parallel subs; he stopped. Lesson — say `team create`; watch.

**Q2 Excel /goal:** Situation — natural language. Action — screenshots + workbook in ~10 min. Lesson — prove-work; numbers UNVERIFIED.

## F. Decision Rules
- If you trigger it every time → skill/chatbot, not an agent.
- If order is fixed → workflow (AI in one slot).
- If it can send/delete → remove the tool.
- If linear + scheduled → script on Modal, not a routine.
- If near 250k-feel / 60% bar → handoff, don’t hero-session.
- If Desktop lacks the slash → terminal.
- If L2 wiki answers → don’t buy a graph.
- Refuse: Claude/School/Plus/Hermes/Modal as hive; 85%/8k/$200/98.5%/91M as FACT; auto-send.

## G. Contrarian
Against Cowork-as-enough. Against agent-first. Against MCP-default. Against Gbrain-always-on. Against localhost-as-shipped. Against “make no mistakes.” Against shame for hitting the limit. Against opus-plan-as-free-lunch (cache break). Against ingesting Slack into the wiki.

## H. Assumptions
All $ / token prices / 8k-from-200 / 85% IBM / 98.5% / 91M / 300M / 201 unread / 75 videos / 10 min / 99% title — UNVERIFIED. Oct 8 privacy, unofficial GWS, experimental teams — on-tape and dated. He sits L2 **and** plays Hermes/Gbrain — do not flatten. Desktop-enough **and** terminal-only slashes — do not flatten. Cursor+Grok hive; Claude is **his** crown (`35WuZxbAY68`). School/Plus/Glydo are the cart.

## I. Questions
Is automemory still 72 files? Did agent-teams stay experimental? Is the 15/day routine cap still the number? Receipts for 8k inference on Max?

## J. Connections
SYSTEM SYNTHESIS → `4OOS96i2gfI` (pyramid) · `DTCyvo6cC54` (L2; Grill; Gbrain unused) · `RzLV8sfFdMM` (dumb zone; assume-it-will; Cole no-Hermes) · `3TdD8Qv5Tk8` (plan; localhost; laptop cron) · `gb5TlGw6Uks` (pillars; VPS cron) · `iTY8Q449YNQ` (roast/verify/handoff/`/goal`) · `8QQ_INxAhRs` (four C’s) · `xJ5oz63mIec` (15 runs) · `8ktcSaSTvxk` (pipe/clog) · `HN0oWxbF2bM` (auto-reply never).

## K. Future-Use
Manager-loop, six-skills, router-md, climb+no-send-tool, sit-L2, hygiene-not-limits, CLI-over-MCP as atoms. Do not install Claude Code as hive.

## Steal / Operate-never

### Machine: manager-loop + router-md + climb-only + hygiene
- **Epistemic:** SOURCE (6h compilation; many inserted older clips)
- **Workflow / loop:** one window + one weekly job → `CLAUDE.md` router → scoped tools → prove-work → persist miss → skill after liked → simplest layer that works → watch first runs → handoff before rot → checkable stop = named metric + deny-list
- **Questions / signals:** Can it send? Is this a localhost? Did `/clear` wipe the how-to? Are we in a team or six cubicles? Is the wiki evergreen or Slack-noise?
- **Qualify / frame / objections:** “6 hours / non-coders” is the hook; tape is also School/Plus cart
- **Procedure:** brief-only inbox; GWS CLI; Modal for linear; session-handoff
- **Example that proves it:** Tavily persist; 150k send; fake agent-team; L2 sit
- **Why it works:** models forget; prompts leak; reread compounds; logic already lives in files
- **Conditions / exceptions:** Desktop ≠ terminal; L5/Gbrain he won’t live in; $ and IBM UNVERIFIED
- **Operate-never payload:** Claude/School/Plus/Hermes as hive; auto-send; quote 85%/8k/98.5% as FACT
- **Hive run:** `agent-job-card` · `ask-principal` · `coverage-loop` · `wiki-ingest`
- **Source:** `jdbOVepEtUE` @ UNKNOWN

### Operate-never
- Claude Code / Cowork / Hermes / Gbrain / Modal / School / Plus as hive. Auto-send mail or “Jarvis” outbound.
- Quote 85% IBM, $8k-from-$200, 98.5% reread, 91M cache, 99% sub-agents as FACT.
- Localhost as shipped. Bypass-without-deny-list. Ingest client Slack into a wiki.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Overwrite `takes/librarian.md`.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File manager-loop, sit-L2, and hygiene-not-limits as labeled rows — do not flatten Desktop-vs-terminal or L2-vs-Hermes-play. Job cards name the layer, the deny-list, and the hard step (push). No 6-hour School wiki.
