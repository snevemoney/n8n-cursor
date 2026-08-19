# Big Boss — 3GAxd90fEE4
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3GAxd90fEE4/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/3GAxd90fEE4/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 28:23, 8148 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: VS Code / Claude Code UI, Firecrawl dashboard, the three Excel sheets (209 jobs, 372 sales, 120 dentists), WAT folders, `claude.md`. Title: teach a 10-year-old. The worked examples escalate from job scrape → filtered scrape → **dentist lead list**.

Beats, in order:

1. Hook: agentic workflows “fix themselves,” “**10×** faster,” no code. Community still confused. Explain so a 10-year-old gets it, then build one live. Apply to any workflow by the end.
2. Traditional vs agentic: traditional = you drag nodes, map every step, own the API calls. Agentic = you say what you want; it figures how. **Recipe vs restaurant:** cook dinner from a recipe (skip a step, it falls apart) vs “I want a delicious steak”; waiter asks **medium-rare**, then handles the rest. Humans know the end, not the path. Agent asks clarifying questions.
3. Practical (the example he should not have used as ours): **50 Chicago dentists**, scrape contacts, personalized outreach. Agent may ask what you sell. Side-by-side: traditional = trigger → tools → AI → conditionals → Slack/ClickUp. Agentic = input → maybe one question → output.
4. IDE on-ramp: Google VS Code, free. Extensions → Claude Code. Paid Claude plan required; he says start **$17/mo**, includes Code + Opus 4.5. Login. Open a folder (`Agentic Workflows Demo`, empty). Claude logo → chat on the right, files on the left. Looks like ChatGPT.
5. **WAT** = Workflows, Agent, Tools. Agent = Claude Code (the brain you talk to). Workflows = markdown recipes (headers, bullets). Tools = Python `.py` — “the ugly stuff,” you do not look. Cake: chef = agent; recipe = workflow (or it writes one); eggs/flour/sugar = tools.
6. Onboard the agent: drop in a `claude.md` (Skool download). Every new project needs one; WAT projects can reuse this. Grocery-store first-day analog. Why WAT: if the AI handles every step directly, accuracy drops — **each step 90% → ~59% after five**. Operate: look for existing tools first; learn when things fail; keep workflows current; self-improvement loop; **file structure** so neither you nor Claude gets lost (workflows / tools / tmp).
7. Modes: ask-before-edits, edit automatically, **plan mode**, bypass permissions. Plan first. Bypass = settings → “allow dangerously skip permissions”; he only likes it if he is **sitting next to it** and can poke. He turns bypass on to “set up the project from this claude.md.”
8. Setup run: reads `claude.md`, lists empty project, todos, creates tmp / tools / workflows + READMEs. “What do you want to accomplish?”
9. Job-scrape brief: Daily Remote social-media search, **622** jobs, **21** pages, too hard to log by hand → Excel. **Firecrawl** as the scrape/map/crawl/search/extract tool. He wants Code to pick Firecrawl’s tools. **MCP** = supermarket: one server, many actions (Gmail send/draft/get analog) vs walking to the egg store / flour store separately. Firecrawl docs → “running on Claude Code” command.
10. **Hot key:** install MCP; it asks for the API key. He will **not** put the key in conversation history. Placeholder in `.env`; he pastes from Firecrawl dashboard himself (free start, **500** credits). Then Claude’s bash install **does** put the key in the command — stored in history. Fine because free / low access / he will **rotate after**. If the key is hot: Claude **walks you through your own terminal** so Claude never touches it. Always `.env` so a public repo does not leak.
11. `/clear`. **Plan mode.** Paste URL. 622 jobs / 21 pages → Excel, relevant fields, “make the PRD more robust, ask questions.”
12. Questions: listing vs each job’s full detail (he: listing only); output path (tmp); all 622 vs filter. He: grab all **but only 200 for now to prove the concept**.
13. Plan: tool `scrape daily remote` + workflow `scrape job listings` + execute. He would normally read the whole plan; demo = first-shot. Yes + auto-accept.
14. Result: **209** rows, filters already on the sheet (title, type, location, experience, category, salary, description, tags, URL). Tool + workflow now exist so the next scrape is better; mistakes update W+T.
15. Context **45% remaining** until auto-compact. **Context rot:** more history, worse. He compacts around **>60%**. Compact now; summary kept.
16. Second scrape, **bypass**, vague: 214k jobs URL, sales + Europe, **500** back, nice Excel. No plan mode “to show vague.” Agent reuses the old tool, finds **409** sales, Europe only **~52–55**, asks: keep 55, broaden types, or add US. He adds US. Tmp junk + temp Python filters appear (why tmp exists). **372** Europe+US; region column; filter down to **~49** Europe-only.
17. Third, bypass, **dentist lead list**: “reach out to tons of dentists… United States… contact information… Excel.” Agent checks existing W+T, Firecrawl, searches dentist directories, ADA JS-dynamic fail, Yellow Pages works, “3,000 dentists just in NYC,” builds `scrape dentist leads` tool + workflow. First pass **2** dentists — parsing/regex fail — **updates the tool**. Done: **120 unique** from four cities (phone, address, city/state/zip, website, specialties, listing URL) + reusable tool.
18. Moral: he did not know the stack. Plan mode + questions would have been better. Limited brief still produced a list that would have taken longer by hand or in n8n. “Why not let Opus 4.5 look at five approaches and pick.” You can stack agents, try four methods in parallel, **delete the losers, keep the winner**.
19. Re-read first workflow markdown: objective, inputs (search term, max pages, output path), tool, steps, outputs, edge cases, error handling he did not ask for — because of the framework / fail-safe.
20. **Mistakes:** (1) vague goal — “lead scraper for LinkedIn” with no industry/role; it will pull random; plan mode → PRD; treat the agent as the expert, you are the **manager**. (2) no **done** — it will over-complicate, loop, research forever. Instead: “exactly **75** LinkedIn CEOs at tech companies, spreadsheet with name / company email / profile link, **once you have 75 you’re done.**”
21. Why agentic is “better”: no more debugging loops (self-heal, update W+T); he can watch a show on the other monitor and poke; still nondeterministic. Natural language vs learning every n8n node / API docs. Gets smarter over time (used to change nodes by hand).
22. **Caveat:** human-triggered (desk, “write a proposal for client B”) = agent is there, self-heals live. **Scheduled** (6am) or **event** (form submit) = you deploy **workflows and tools, not the agent / not the VS Code model**. The agent is what makes W+T self-heal; you are not deploying that. “Whole other video.” Sibling deploy tape tagged.
23. Close: space is early; headed toward fully autonomous / agents managing agents / improve while you sleep. Builders → **architects**. n8n learners: job isn’t over; start there. Free community **200k+**; resource guide; Plus for support / group calls. Like + next.

Off-topic / not skipped: $17 plan; 500 Firecrawl credits; 90%^5 = 59%; 6am schedule; dentist / Chicago 50; Skool `claude.md`; n8n as the old way.

## B. Atomic Knowledge

### Outcome + one clarifying question, then cook
- **Claim:** Traditional automation is a recipe you must not skip. Agentic is a restaurant: you name the steak; the waiter asks doneness; then they cook. Humans know the end, not the path.
- **Reasoning:** The clarifying question is the product. Without it you get a well-done you did not want — or 50 dentists you should not have asked for.
- **Mechanism:** Goal in plan mode → questions → PRD → build. Bypass + vague still asked when Europe could not hit 500.
- **Evidence:** Steak / medium-rare; job-scrape questions (detail vs listing, path, 200 not 622); Europe expand-or-not.
- **Conditions:** Plan mode is the default. Bypass is only if you are watching.
- **Exceptions:** Third demo (dentists) skipped plan on purpose; quality suffered (2 rows, then a fix).
- **Action:** `agent-as-hire`: ask doneness. Do not scrape 50 dentists because the metaphor was simple.
- **Confidence:** high
- **Source:** `3GAxd90fEE4` @ UNKNOWN — “how do you want your steak cooked”
- **Epistemic:** SOURCE

### WAT: recipes and ingredients, not one god-agent
- **Claim:** Workflows (markdown processes) + tools (Python actions) + agent (decider). If the AI does every step itself, 90% × 5 steps ≈ 59%. Look for existing tools first; write failures back into W+T.
- **Reasoning:** Compound error is why a folder law exists. Cake: chef should not be the egg.
- **Mechanism:** `claude.md` states the three layers, why, operate rules, self-improve, file structure.
- **Evidence:** After job scrape, next sales scrape reused the tool. Dentist run created a new pair when the old tool did not fit, then patched regex.
- **Conditions:** Empty project + a WAT `claude.md` first. Without structure it “gets messy quick.”
- **Exceptions:** Temp Python in tmp during the Europe filter — allowed because tmp exists.
- **Action:** One job per tool; persist the winner as a workflow. `slice-build` folder law. Do not auto-write a new SKILL.md.
- **Confidence:** high
- **Source:** `3GAxd90fEE4` @ UNKNOWN — “if each step is 90% accurate, then you’re down to 59% success after just five steps”
- **Epistemic:** SOURCE

### Folder law: tmp / tools / workflows or it rots
- **Claim:** Unspecified file drop means neither human nor agent can find things. WAT wants workflows, tools, temporary.
- **Reasoning:** The left pane is the memory. A locker is not a memory.
- **Mechanism:** First command: read `claude.md`, build the three folders + READMEs, then ask what to accomplish.
- **Evidence:** Europe run dumped raw / filter files in tmp on purpose. Excel outputs landed in tmp.
- **Conditions:** Every new project. He says you can reuse the WAT `claude.md`.
- **Exceptions:** Other Worlds / desktop paths on the OS tape are a different grain. Same law: findable.
- **Action:** Refuse a build in a junk drawer. Create the three (or hive equivalent) first.
- **Confidence:** high
- **Source:** `3GAxd90fEE4` @ UNKNOWN — “if we don’t tell Claude how to organize its files, it’s going to get messy quick”
- **Epistemic:** SOURCE

### Plan first; bypass only if you are in the chair
- **Claim:** Plan mode is “really important” before an agentic build. Bypass / dangerously-skip is for when you are watching and can poke. Vague + bypass was a **demo of risk**, and it still had to ask when the number was impossible.
- **Reasoning:** Manager, not passenger — except he also brags about watching a show on the other monitor. Hold both: poke-ready ≠ unsupervised ship.
- **Mechanism:** Plan → questions → accept → (optional) auto-accept edits. Compact when context > ~60%.
- **Evidence:** First scrape planned and capped at 200. Second/third bypass. He says normally plan + questions.
- **Conditions:** New workflow type → plan. Repeat of a known workflow → still a done-number.
- **Exceptions:** Setup-from-claude.md used bypass because the job was “make folders.”
- **Action:** Plan mode analog = `session-bootstrap` questions. No unattended dentist scrape.
- **Confidence:** high
- **Source:** `3GAxd90fEE4` @ UNKNOWN — “I only really like to do this if I’m sitting next to Claude watching it work”
- **Epistemic:** SOURCE

### Hot key never enters the chat
- **Claim:** He refuses to give Firecrawl the key in Claude history. `.env` placeholder; he pastes. When bash still echoed the key, he calls it acceptable only because the key is free / he will rotate. Hot key: **walk the human’s terminal**; Claude never touches it.
- **Reasoning:** History is a leak. Public repo + plaintext key is a leak. Same warning as managed-agents CLI (`27Y44JYXZJ8`).
- **Mechanism:** `.env` + human paste + rotate demo keys + terminal-walk for hot keys.
- **Evidence:** Full install beat, including the bash oops.
- **Conditions:** Any MCP / API. “500 free credits” is not a security model.
- **Exceptions:** He still let bash echo once on tape.
- **Action:** Keys are `ask-principal`. Demo key ≠ SOP.
- **Confidence:** high
- **Source:** `3GAxd90fEE4` @ UNKNOWN — “I don’t want my API key to be stored in the conversation history”
- **Epistemic:** SOURCE

### Cap the proof — 200 not 622, 75 and you’re done
- **Claim:** He cut 622 → 200 “to prove the concept.” Mistake #2: without a finish line the agent loops. Good brief: **exactly 75**, named columns, “once you have 75 you’re done.”
- **Reasoning:** Open-ended “search CEOs” is how you get random and spend. A number is a stop (sibling Opus/Fable tape).
- **Mechanism:** Plan-mode answers include max pages / max rows. Workflow markdown stores those inputs.
- **Evidence:** 209-row sheet; 75-CEO counterexample; dentist 120 after a 2-row fail.
- **Conditions:** Proof caps are for demos and first corners. Production caps are policy.
- **Exceptions:** “500 Europe sales” was impossible; the agent asked — the cap forced a conversation.
- **Action:** Every scrape / list job gets a number and a column list before run. `list-anneal` later, parked.
- **Confidence:** high
- **Source:** `3GAxd90fEE4` @ UNKNOWN — “once you have 75, you’re done”
- **Epistemic:** SOURCE

### Self-heal updates W+T, not a vibe
- **Claim:** On error, the agent thinks, tries another path, **rewrites the tool / workflow** so the next run does not hit the same rock. That is the “no more debugging loops” pitch vs n8n log-reading.
- **Reasoning:** Learning is persistence. A one-off regex fix that is not written back is a ghost.
- **Mechanism:** Dentist: ADA fail → Yellow Pages; 2 rows → fix regex → 120 + reusable tool. Job workflow already has edge cases he did not dictate.
- **Evidence:** Spoken self-heal + the 2→120 pass.
- **Conditions:** Human-triggered, agent in the chair. Scheduled runs do **not** get this brain (next atom).
- **Exceptions:** Nondeterministic — it may veer; you poke.
- **Action:** Failures become don’ts in the workflow file. Forge: verify the file changed, not the chat apology.
- **Confidence:** high for the demo shape; “no more debugging” is marketing
- **Source:** `3GAxd90fEE4` @ UNKNOWN — “I fix it. And then I update my workflows and my tools so that it doesn’t happen again”
- **Epistemic:** SOURCE

### Deploy W+T, not the unsupervised A
- **Claim:** Desk-side “write a proposal for client B” can self-heal because you are there. 6am / form-submit is **deployed code** — workflows and tools, **not** the VS Code agent. The healer does not go to prod.
- **Reasoning:** This is the honest caveat after a video that sold “watch a show while it builds.” Schedule without the poke is a different machine.
- **Mechanism:** Agent writes W+T; human (later tape) deploys W+T. “Whole other video.”
- **Evidence:** Explicit caveat beat. 6am named.
- **Conditions:** Any cadence / event trigger. Sibling OS 150k send.
- **Exceptions:** He still teases fully autonomous / while you sleep in the close. Hold the caveat above the tease.
- **Action:** 6am schedule stays HITL. Do not deploy an unsupervised dentist cron.
- **Confidence:** high
- **Source:** `3GAxd90fEE4` @ UNKNOWN — “the agent would deploy its workflows and tools, but not itself”
- **Epistemic:** SOURCE

### Parallel agents, keep the winner
- **Claim:** You can stack agents, give each a method, run four workflows, delete the losers, keep the main.
- **Reasoning:** He did not know Firecrawl vs a lead API. Five approaches, one survivor — cheaper than picking the stack himself.
- **Mechanism:** Multiple Code tabs / agents; compare Excel / quality; delete.
- **Evidence:** Spoken after the dentist sheet. Not shown as four live runs.
- **Conditions:** Same done-number so the comparison is fair. Tokens are not free (sibling Fable tape).
- **Exceptions:** Parallel without a done-number is four loops.
- **Action:** `golden-test-loop`: keep only what a cheap check passes. Do not keep four dentist scrapers.
- **Confidence:** medium (method spoken, not headed as 4×)
- **Source:** `3GAxd90fEE4` @ UNKNOWN — “whichever one gives me the best result, I would just delete all the other agents”
- **Epistemic:** SOURCE

### Dentist / Chicago outreach is a teaching prop — operate-never
- **Claim:** 50 Chicago dentists + personalized email, and the later US dentist lead list, are how he makes “simple.” The third run produced phones, sites, specialties for 120 offices.
- **Reasoning:** Ugly tape stays in the room. The machine (goal → questions → cap → W+T → self-heal) is stealable. The payload (cold dentist list, auto-reach-out) is not a hive SKU. Live hunt is local-pro / parked; this is not a new `icp_id` and not a send.
- **Mechanism:** Firecrawl directories → Excel. He names “reach out” as the use. He does not send on tape.
- **Evidence:** Open metaphor + full third demo + “tons of dentists.”
- **Conditions:** Teaching only. Yellow Pages / ADA are on-tape sources, not ours to run.
- **Exceptions:** Job-listing scrape to a **local tmp Excel** is a milder analog (still not a hunt).
- **Action:** Steal the qualify loop. Operate-never: dentist outreach, Firecrawl-in-chat, auto-send.
- **Confidence:** high
- **Source:** `3GAxd90fEE4` @ UNKNOWN — “I’m looking to reach out to tons of dentists”
- **Epistemic:** SOURCE

## C. Mental Models

- **Steak, then doneness.** Outcome + one question. **SOURCE**
- **Chef / recipe / ingredients.** Do not let the brain be the egg. **SOURCE**
- **90%^5.** Compound error. **SOURCE**
- **You are the manager.** Agent is the expert. **SOURCE**
- **Done is a number.** 75 and stop. **SOURCE**
- **Hot key walks the human terminal.** **SOURCE**
- **Self-heal writes the file.** **SOURCE**
- **Prod gets W+T, not A.** **SOURCE**
- **Keep the winning method; delete the rest.** **SOURCE**
- **“10-year-old / 10× / no code” is the magnet.** **INFERENCE**

## D. Procedures

1. **Empty folder + job card** (`claude.md` analog / `agent-job-card`) that names W / A / T and the folder law.
2. **Plan-mode qualify.** Goal, columns, **cap**, output path, “ask until sure.”
3. **Human accepts the PRD.** Then build.
4. **Keys:** `.env` + human paste. Hot key = terminal walk. Rotate demo keys.
5. **Cap the first run** (200 not 622). Prove the concept.
6. **Read the sheet.** Checkable stop = row count + required columns.
7. **On error:** require the tool/workflow file to change. Compact ~60%.
8. **If the number is impossible:** agent must ask (Europe 55 vs 500), not silently broaden into a hunt.
9. **Parallel optional:** same cap, keep one, delete the rest.
10. **Ship set:** tmp Excel for `us` learning. No send. No 6am. Deploy W+T only on a later HITL tape — not this take.
11. **Refuse the outreach payload** even while walking the scrape machine.

**Qualify / frame / objections:** Kid-metaphor course + a lead-gen demo. Frame: manager + done-number. Objection: “it’s just 50 dentists” — operate-never payload. Objection: “watch a show while it builds” — caveat says schedule ≠ that agent. Objection: n8n is dead — he says start there; job isn’t over.
**Avoid:** Claude Code / Firecrawl install; auto-send; quote 10× / $17 / 200k / 90% / 500 credits as FACT; new dentist ICP; unpark Normand.
**When to change:** if there is no cap, stop. If the key would enter chat, stop. If the next step is send, HITL or refuse.

## E. Examples

**Situation:** 622 social-media jobs, 21 pages.  
**Action:** Plan mode, listing-only, tmp, **200 to prove**.  
**Reasoning:** Cap the proof.  
**Outcome:** 209-row filtered Excel + a reusable tool/workflow.  
**Lesson:** First shot is a concept proof, not the whole site. Implicit rule: 622 is a vanity cap.

**Situation:** Vague “500 sales jobs in Europe.”  
**Action:** Bypass; agent finds ~55, asks to broaden; he adds US; 372 with a region column.  
**Reasoning:** Impossible number must become a question.  
**Outcome:** Filterable sheet; tmp clutter contained.  
**Lesson:** A cap that cannot be hit is a qualify moment. Implicit rule: silent broaden is how a demo becomes a hunt.

**Situation:** “Tons of dentists, contacts, Excel.”  
**Action:** New tool, ADA fail, Yellow Pages, 2-row regex fail, file update, 120 rows.  
**Reasoning:** Self-heal writes W+T.  
**Outcome:** A reusable dentist scraper he praises.  
**Lesson:** The machine worked. The payload is still operate-never. Implicit rule: walk the ugly tape; do not run it.

**Situation:** Someone says “LinkedIn lead scraper.”  
**Action:** He calls it a mistake — no industry, no role, no 75, no columns, no stop.  
**Reasoning:** Vague + no done = random + loop.  
**Outcome:** The 75-CEO counter-brief.  
**Lesson:** Manager writes the finish line. Implicit rule: “scrape LinkedIn” is not a PRD.

## F. Decision Rules

- If there is no done-number → do not run.
- If the key is hot → human terminal, not chat.
- If you are not in the chair → no bypass.
- If the next verb is send / reach out → refuse (this desk).
- If four methods are in flight → same cap, keep one.
- If the job is 6am / form-submit → W+T only, HITL deploy, not this take.
- If folders are a locker → stop and structure.
- Optimize: time-to-a-capped-proof-sheet.
- Refuse: dentist / Chicago outreach, Firecrawl-in-chat, 10× as a KPI.

## G. Contrarian

- Against “map every node”: restaurant, not recipe — **on his tape**. Hive still does not install Code.
- Against “deploy the agent”: deploy W+T.
- Against “vague is fine, it will ask”: he still lists vague as mistake #1; dentists were a flex.
- Against “n8n is over”: start there; become an architect.
- Field assumes the kid metaphor licenses the lead list. It does not — for us.

## H. Assumptions

**His:** WAT `claude.md` generalizes; Firecrawl + MCP is the supermarket; 90% per step is a real model; watching a show is safe enough; 120 dentists is “incredible”; 200k Skool is the help; $17 is the on-ramp.

**Ours:** Captions complete enough (8148 words). 10× / $17 / 200k / 500 credits / 90% / 3,000 NYC dentists / 120 / 209 **UNVERIFIED**. Domain-specific: scrape-demo, not Path A book. Chicago / US dentists are props. Yellow Pages scrape may violate source TOS — we do not run it. **INFERENCE** on TOS; do not test.

**Falsifiers:** Self-heal writes a worse regex and the next run is garbage. Cap 200 hides that page 21 is broken. Parallel agents 4× the bill with no winner. 6am W+T without A silently sends.

**Disagreement (keep labeled):** Hive will not operate dentist outreach or Firecrawl-in-chat. The **outcome → question → cap → W+T → self-heal-in-file → deploy W+T not A** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Sibling deploy-at-6am tape id — do not invent if PACKET does not bind it.
- Did he rotate the Firecrawl key? Not on tape.
- What four cities were in the 120? Named as “four,” not listed clearly.
- Is 90%^5 his math or a cited source? Spoken as fact; treat as teaching.

## J. Connections

- **SYSTEM SYNTHESIS** → `-cdexJWN8YA` (plan-mode questions; dashboard/keys human; same “manager” line).
- **SYSTEM SYNTHESIS** → `0WDkwMxj13s` (bike; send/key ring; 6am = cadence last).
- **SYSTEM SYNTHESIS** → `2J3uX8iRNng` (stop condition; cap; slot machine).
- **SYSTEM SYNTHESIS** → `7UNsK9LoORo` (workflow-as-tool; one job per tool).
- **SYSTEM SYNTHESIS** → `agent-as-hire` · `slice-build` · `ask-principal` · `golden-test-loop` · `list-anneal-funnel` (volume later, parked) · `playbook-before-send` (if anyone ever tries outreach — certify first, still HITL) · `interview-to-desk`.

## K. Future-Use

- 75-and-done as a list-job card (unassigned).
- Terminal-walk for hot keys as Watchdog (unassigned).
- Parallel-keep-winner as a Forge bake-off (unassigned; cap tokens).
- WAT folder law vs Other Worlds — Librarian map (unassigned).

## Steal / Operate-never

### Machine: Outcome → doneness question → cap → W+T → file-written self-heal
- **Epistemic:** SOURCE (demos) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (named end: “Excel of X”) → folder law + job card → plan-mode questions (columns, path, **number**) → human accepts PRD → human-held keys → capped first run → open the sheet (row count + columns) → on fail, require W+T file change → compact when fat → optional parallel methods, delete losers → **stop before send**. Schedule / 6am = later HITL deploy of W+T only. Checkable stop: capped sheet exists; outreach is not in the ship set.
- **Questions / signals:** “What does done look like as a number?” “Listing or detail?” “Are you in the chair?” “Would this key be hot in chat?” “Is the next verb send?”
- **Qualify / frame / objections:** Kid course + lead-gen prop. Frame: manager + cap. Objection: 50 dentists is the example — payload operate-never. Objection: watch a show — not a 6am agent.
- **Procedure:** D steps 1–11. Checkable stops: (1) PRD with cap, (2) keys not in chat, (3) sheet matches cap+columns, (4) W+T updated on fail, (5) no send / no dentist hunt.
- **Example that proves it:** 622→200 proof sheet vs dentist 2→120 self-heal. Lesson: cap + file-written fix. Implicit rule: walk the dentist tape; do not run it.
- **Why it works:** Humans know the end. Compound error needs layers. A number stops the loop. Keys in history are a leak. Prod cannot have the healer if the healer is a chat. Conditions: operator in the chair for A; W+T may persist. Exceptions: his 10× / no-code / 200k close are magnets.
- **Conditions / exceptions:** Cursor + Grok only. Claude Code / Firecrawl / n8n-cloud / Skool stay on tape. Clients parked. No new `icp_id`. Tape $ / 10× UNVERIFIED. Voice/Vapi/auto-dial n/a; **auto-reach-out is the same refuse**.
- **Operate-never payload:** Dentist / Chicago outreach; Firecrawl-in-chat; auto-send; 6am unsupervised A; install his stack; 10× as done.
- **Hive run (existing skills only):** `agent-as-hire` (ask doneness) · `slice-build` (folder law, one system) · `session-bootstrap` (PRD questions) · `golden-test-loop` (keep the winner) · `ask-principal` (keys / schedule / send) · `list-anneal-funnel` (volume later — parked) · `playbook-before-send` (if outreach ever thaws — still HITL) · `agent-job-card` (owns/never includes no volunteer scrape-to-send).
- **Source:** `3GAxd90fEE4` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Claude Code / Firecrawl-in-chat / dentist outreach. Cursor + Grok only
- Auto-send personalized email to 50 (or N) dentists. Auto-dial / Vapi
- Quote 10× / 50 dentists / 6am / 200k / $17 / 90% as FACT
- Nate Skool / Plus / WAT zip as a hive SKU
- New hunt ICP. Clients parked. No Normand. No Chicago dentist list
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not order the steak for 50 dentists.

- **Done** on this slice: a PRD with a number + a capped local sheet + W+T updated on fail. A lead list and a 6am cron are not done.
- **Delegate without being asked:** Consultant kills “scrape dentists” as a brief. Lead Hunter does not get Firecrawl. HITL holds keys and any future send. Forge checks the workflow file changed. Watchdog checks the row cap.
- **Skeptical review:** 10-year-old + 10× is the magnet. I will not approve a Yellow Pages farm because the regex healed.
- **One system this take:** one capped job-listing **draft** scrape with a brand file and no send — or none, if even that smells like a hunt. Not Chicago outreach.
- Live hunt stays parked. I do not rotate to dentists because the Excel had phone numbers.
