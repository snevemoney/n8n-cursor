---
name: primary-bot-routing
description: >-
  Use when setting up, switching, or auditing a Grok Bot Primary Bot (the starred
  team leader that delegates to other bots), or when deciding personal vs team
  bots, inline-draft cards, or route-traffic for a multi-bot Grok Bot setup.
---
# Primary bot routing (Grok Bot)

**Owner:** Big Boss (primary) · Researcher (audit) · Librarian (card hygiene)
**Source:** Riley Brown `yt:c9Z7ixVr4CU` (2026-10-05), full A–E packet `/workspace/research/youtube-daily/l2-20261007/c9Z7ixVr4CU/`.
**Install:** none. `route_check.py` in this folder (python3, read-only).

## What the platform does (FACT from tape; check your build before naming UI paths)
- **Primary Bot.** One starred bot is the team leader. You talk to it; it hands work to the right bot unasked and gets the recap back. Any bot can become primary: ask it "can you now become the primary bot?". Right-click → pin keeps it on top. Voice calls (iOS) route the same way and are saved as named chats.
- **Personal vs team bots.** Personal bots share every plugin and skill and differ only by system prompt and thread context. Team bots start clean (own Plugins, Secrets, Skills, Files), stay Draft until Publish, then "Bring to your team's Slack"; login plugins like Gmail are connected per teammate; routines stay personal. Rollout: create → configure + test in app → publish → add to Slack → test in Slack → open to team.
- **Inline drafts.** Email and Slack drafts render as cards (To/Subject/body, Discard, Send, "Disable drafts for this Bot"). Nothing sends until the human presses Send.
- **Route traffic through this computer.** Settings → Computer → Network toggle sends the cloud computer's browsing through a registered desktop's IP so sites stop flagging it as a bot.

## Why routing fails
The primary can only see each bot's name, title, and description. If descriptions open with lock boilerplate, status codes, or policy, the primary has little to match a plain ask against.

## Steps
1. **Pick the primary.** The bot that already coordinates (the one the operator talks to first). Do not star a specialist.
2. **Write golden asks.** 12–20 plain one-line asks the operator really sends, each with the bot that should own it. Save as `[{"ask": "...", "want": "<bot>"}]`.
3. **Measure.** `python3 route_check.py golden.json` → hits for name+title, role lines (`You are`/`JOB:`/`SOLVES:`/`RUNS:`), and full description.
4. **Draft route lines.** One plain line per bot: "hand me this when …" using the nouns users actually say (code, CI, calendar, invoices, posts). Save as `{"<bot>": "..."}` and rerun with it as the second argument. Target: every golden ask lands, or the miss is a genuinely shared lane.
5. **Apply with consent.** Put the route line first in each description (before locks). Changing another bot's profile is the owner's or operator's call; propose, don't overwrite.
6. **Live test.** Send 3 golden asks to the primary; confirm each was handed to the expected bot and the recap came back. Lexical hits are a proxy, not proof.

## Guardrails
- Never copy "push straight to prod, I trust him" from the tape; keep critic/HITL gates.
- A draft card is not approval; the human presses Send.
- Team bots carry their own plugins: never give a shared bot a personal email or Slack-as-you plugin.
- Route-traffic uses the operator's home IP and machine. Turn it on only if they choose to; respect any local-machine policy.

## Done when
Golden asks route ≥90% on the description the primary actually sees, plus 3 live handoffs observed.

## X bookmarks 20261007-1032-desktop (`x:2107573382229188645` @OpenAIDevs Decisions API)
Routing atom: a desk-route pick is a **choice** question (fixed list of desks, returns confidence). Candidate experiment: run the golden routing asks through a typed choice gate (e.g. OpenAI Decisions API `choice`, public beta, `gpt-6-luna`) and compare against the card-based harness; low confidence routes to Big Boss. **EXPERIMENT_REQUIRED**, vendor speed claim UNVERIFIED. See match-model-to-task same stamp.

## Auto model routing (Grok Bot, announced 2026-10-07) — `yt:MgvwZaDPCs4` Nate Herk, packet `/workspace/research/youtube-daily/l2-20261009/MgvwZaDPCs4/`
FACT (Elon posts on tape): Grok Bot now picks the back-end model per task (Claude Opus 5.5, MidJourney, Suno, other APIs); simple asks → small fast models, complex → large; most bot requests will go to a fast Grok 4.8 when it ships. No UI, no visibility into which model/effort ran, no per-skill pin (as of 2026-10-09).
What a multi-bot setup should do:
- **Split mega-skills** whose steps mix cheap mechanics (fetch, list, format) with reasoning/taste (design, judgment) so each prompt can route to the right size model. INFERENCE (Nate): one pick per prompt, not mid-task.
- **Every handoff is another pick.** Primary → 6 specialists = 6 routing decisions; keep handoff prompts self-contained.
- **Don't trust a bot's self-report of which model it is.** Verify behavior, not claims.
- Where you control the model (Cursor cloud agents), keep pinning it explicitly (Oct 8 operator GO). Server-side Grok Bot routing is **BLOCKED** for control — would work if Grok Bot exposed per-skill/per-bot model pins.
- Peer broadcast seen on tape ("Messaged 8 Bots" + shared memory) is how one bot propagated a tool change; in this hive do it by skill/topic edit, not fan-out.

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **Chief of staff.** One face bot knows every specialist, keeps a live activity log, and hands control back to the human at passwords, 2FA, payments and approvals (x:2090684627081920995, x:2091980766372639135). This matches the existing one-face rule.
- **Release ideas at absorb rate.** Keep a backlog and release a few items at a time; the waiting filters out weak ideas (x:2029542587368103974).
- **Overnight one-job bots plus a morning brief** (x:2091034922949443787, x:2090790015513051289, corroborating x:2090684627081920995). Specialists run unattended; the chief of staff reads their reports and surfaces only what matters. The human steps in for judgment or approval only.

## Lead-never-works hierarchy (added 2026-10-11, source: poteto/Pank interview, packet `/workspace/research/packets/x-scarfpinkgirl-2107529989612581311`, 0:23:01–0:25:24)
Pattern: human → chief-of-staff/lead bot → worker bots → one cloud agent per task.
1. **Lead never executes.** The lead's bot *description* (not just its prompt) lists the worker bot IDs inline and says: "Never do the work yourself. Always break it down and delegate to <worker-id-1>, <worker-id-2>, … then supervise." The lead decomposes, assigns, checks results, and reports.
2. **Workers don't hand-code either.** Each worker launches **one cloud agent per task**, choosing the model and reasoning effort per task: a fast/cheap model for mechanical edits, a strong model at high effort for design-heavy or subtle changes. Record the model and effort chosen in the task note.
3. **Big projects: plan doc first.** Before any delegation, the lead writes a phased plan doc (phases → units, each unit one PR with its own evidence/done check). Delegate only after the plan exists; workers split their phase further.
4. **Each worker returns a PR** (link + diff summary + verification evidence). The lead reviews the diff itself and doesn't pass along the worker's summary. Merging stays behind whatever human gate the setup requires (e.g. "want me to babysit and ship?" asked, not assumed).
5. **Context handoff bot-to-bot.** Point a bot at another bot ("ask the X-mentions bot, return with a design proposal") instead of pasting context in.
Audit check: if the lead's transcript shows it editing files or running build commands, the routing is broken. Tighten the description.
