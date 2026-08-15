# Big Boss — e18sdZLwP7o
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/e18sdZLwP7o/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/e18sdZLwP7o/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 26:42, 6662 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: five persona sessions, status line (~48k tokens, 5%), `.claude/agents` files, `/agents` UI, roast-skill collision, ice-cream roast, awesome-subagents GitHub, recap slide.

Beats, in order:

1. Cold open: he told Claude Code to spin **five** sub-agents with personas (beginner Linda 58 retired teacher; software engineer; business owner; publisher; Fortune-500 COO David 52, 12,000-person shop). Parallel. Main is orchestrator. Task: read chapters, review the book — he scored about an **eight**.
2. Title promise: use sub-agents “better than 99%.” Sub-agents ranked #6 on his features tape (pointer).
3. What they are: main talks to Nate; subs only talk back to main; fresh chat each.
4. Why they exist: **keep context clean**. Status line demo. Research Fireflies.ai with Haiku/Sonnet while main stays on Opus.
5. Built-in vs custom. Five personas were **general-purpose** with different prompts, not custom files. Custom = markdown in `.claude/agents` (example: `clickup-searcher.md`). Same shape as a skill.md: YAML front matter + body.
6. Progressive disclosure: model reads name/description first; pulls the body only if it applies.
7. Front-matter levers: name, description (the trigger), tools / disallowed tools, MCP allow-list, skills, model, color, memory. Tune descriptions to cut misfires. “Use proactively” if you want generous fire. Iterate after each run.
8. Skill vs sub-agent: both are markdown SOPs. Difference: clean window, parallel sessions, different model. Skills can invoke subs and vice versa.
9. Project vs global: repo `.claude` vs home folder. Share-with-team = project. Personal across repos = global. Easy to move (it’s a file).
10. `/agents`: running, library (explore/plan/guide), project list, create personal vs project, generate-with-Claude vs manual, tools, model inherit, color, memory (he defaults project).
11. Live create: “plan roster” / roast devil’s advocate, read-only, Haiku, pink. Generated description too fat — he trims for disclosure.
12. Ice-cream-stand roast: **roast skill** fires first (spins five general subs) — “foul play.” Unclosed YAML quotes = mechanical miss. Collision: combine skill→agent, or name the agent explicitly. Plan roaster uses 22.8k tokens **off** the main window.
13. Specialists over mega-assistant. Borrow markdown from “awesome Claude Code subagents” GitHub — **check for prompt injection**; optional read-only verifier sub.
14. Invoke: automatic, proactive, explicit name, or `claude --agent`. Read-only via tool restrictions. “If it can touch data, assume it will” — permission layer ≠ prose.
15. Cheap worker: Haiku reads a 300-page report, returns three facts. Smart lead (Opus) stays small. Optional `max turns`.
16. When to use: about to dump a pile you’ll never reread; many files; wall of output; repeating job; **independent parallel** (15 chapters, no order lock); unbiased fresh review.
17. When **not**: quick edit; steps 1→2→3; agents must talk to each other (that’s “agent teams,” more expensive, shared task list); needs full conversation; needs to ask **you** (you don’t talk to subs). One-to-one, not a mesh. Five subs cannot talk to each other.
18. Dynamic workflows (Opus 4.8): can spawn many subs (he cites 41 on video, **210** off-video). Eats session limits. Trigger word later changed from “workflow” to “ultra code.”
19. Recap slide. Close: free Skool classroom deck. **$ UNVERIFIED.**

Off-topic / not skipped: book coming soon; terminal copy-paste is horrible; ClickUp weekly commitments demo.

## B. Atomic Knowledge

### Main orchestrates; subs report one-to-one
- **Claim:** The lead talks to the human. Subs only talk to the lead. They do not talk to each other.
- **Reasoning:** A mesh is a different (costlier) product — “agent teams.” Subs are fan-out + report.
- **Mechanism:** Main assigns; sub returns a report; main speaks to Nate.
- **Evidence:** Five personas; he only chats the main. “Not like a one-to-many.”
- **Conditions:** Jobs are independent. Sequential work stays in the lead.
- **Exceptions:** Dynamic workflows can spawn tens/hundreds — still one-to-one, just many.
- **Action:** 17 desks already are this. I do not add a mesh.
- **Confidence:** high
- **Source:** `e18sdZLwP7o` @ UNKNOWN — “one-to-one relationship between sub agent and main session”
- **Epistemic:** SOURCE

### Fresh context is the reason they exist
- **Claim:** A sub is a new chat so the lead’s window stays clean.
- **Reasoning:** Long mains get “polluted.” Research you will never reread should not live in the CEO seat.
- **Mechanism:** Kick research to a sub; lead keeps the summary.
- **Evidence:** ~48k / 5% status line; Fireflies research on a cheaper model.
- **Conditions:** The dump is disposable. If the lead needs the whole conversation, skip the sub.
- **Exceptions:** He still reads the sub’s prompt by opening that session.
- **Action:** If it’s a pile you’ll never reread, delegate. If it’s a 1-2-3, don’t.
- **Confidence:** high
- **Source:** `e18sdZLwP7o` @ UNKNOWN — “completely fresh chat”
- **Epistemic:** SOURCE

### Cheap worker, smart lead
- **Claim:** Haiku (or inherit) reads; Opus stays the boss you talk to.
- **Reasoning:** A 300-page report for three facts does not need the expensive brain.
- **Mechanism:** Front matter `model:` or inherit-from-parent. He sets roast to Haiku.
- **Evidence:** Fireflies sub on Haiku/Sonnet while main is Opus; 22.8k roast tokens stay off-main.
- **Conditions:** Task is read/summarize/critique, not a hard call.
- **Exceptions:** Technical report may need the smart model — he says so.
- **Action:** Doctrine 11. Do not dump a 48k chat into the next tape.
- **Confidence:** high
- **Source:** `e18sdZLwP7o` @ UNKNOWN — “smart boss… bunch of little Haiku agents”
- **Epistemic:** SOURCE

### Description is the trigger; misfires are tuned
- **Claim:** YAML `description` decides auto-invoke. Too vague = miss or false fire. Iterate.
- **Reasoning:** Progressive disclosure only reads the front. Fat descriptions waste tokens and collide.
- **Mechanism:** Precise when-to-use; trigger phrases; trim generated blobs; close your quotes.
- **Evidence:** Generated plan-roster description too long; unclosed quotes = “mechanical”; roast skill beat the new agent.
- **Conditions:** You watch fires and rewrite.
- **Exceptions:** Explicit “use plan roaster not the roast skill” always works.
- **Action:** Job-card when-to-use is the description. Collision = combine or name.
- **Confidence:** high
- **Source:** `e18sdZLwP7o` @ UNKNOWN — “the description is really important. This is basically the trigger”
- **Epistemic:** SOURCE

### Skill ≠ sub-agent (window, parallel, model)
- **Claim:** Same markdown soul. Sub = clean window + parallel + other model. Skill = in-main SOP.
- **Reasoning:** A skill can still launch five subs (roast). They compose; they are not rivals.
- **Mechanism:** Skills folder vs agents folder. Both YAML + body.
- **Evidence:** Roast skill invoked instead of plan-roster and spun five generals.
- **Conditions:** Repeating in-main work = skill. Dump / parallel / other model = sub.
- **Exceptions:** He uses both on the same roast job.
- **Action:** Do not spawn an 18th desk because a slash command was easy. Triangle first.
- **Confidence:** high
- **Source:** `e18sdZLwP7o` @ UNKNOWN — “one has a clean context window and one doesn’t”
- **Epistemic:** SOURCE

### Project vs global is a lane, not a vibe
- **Claim:** Repo agents travel with the GitHub. Home-folder agents are personal.
- **Reasoning:** Team share vs “belongs to me.” Accidental global is a file move, not a crisis.
- **Mechanism:** `.claude/agents` in project vs user-level directory. `/agents` create asks personal vs project.
- **Evidence:** Session-handoff skill is global; ClickUp searcher is project.
- **Conditions:** If the desk is for this repo, it lives in the repo.
- **Exceptions:** You can keep both copies.
- **Action:** `interview-to-desk` before any new file. Project unless Evens says personal.
- **Confidence:** high
- **Source:** `e18sdZLwP7o` @ UNKNOWN — “project level stuff or you have global level stuff”
- **Epistemic:** SOURCE

### Permission is a tool list, not a don’t
- **Claim:** If a sub can read or send, assume it will. Allow-list tools/MCP. Read-only is a setting.
- **Reasoning:** Prose “don’t do that” is not a layer.
- **Mechanism:** `tools` / disallowed tools in YAML. Roast created as read-only.
- **Evidence:** Open-source markdown: check injection; optional read-only verifier that “can never send data.”
- **Conditions:** Any borrowed file.
- **Exceptions:** He still says be careful — not a scanner demo.
- **Action:** Doctrine 7. Send capability stays off. Cursor + Grok only.
- **Confidence:** high
- **Source:** `e18sdZLwP7o` @ UNKNOWN — “If my AI could touch data… I have to assume that it will”
- **Epistemic:** SOURCE

### Independent parallel only; sequential stays sequential
- **Claim:** 15 chapters with no order lock = parallel subs. 1→2→3 or “must talk to each other” = do not.
- **Reasoning:** Subs cannot ask you and cannot see each other. Fresh can be a feature (unbiased review) or a bug (needs the thread).
- **Mechanism:** Signal: “pile I’ll never reread?” yes → sub. Repeating job → custom sub.
- **Evidence:** Book-review cold open; “don’t force it… worse results.”
- **Conditions:** Independence is real.
- **Exceptions:** Dynamic/ultra-code can spawn 41–210 and burn the session. He warns.
- **Action:** `hive-spawn-desks` for independent review. No 210-agent stunt.
- **Confidence:** high
- **Source:** `e18sdZLwP7o` @ UNKNOWN — “If the steps depend on each other… skip them”
- **Epistemic:** SOURCE

### Personas are prompts; custom is a file
- **Claim:** Linda/David were general-purpose agents with role text, not five custom markdowns.
- **Reasoning:** A persona is cheap. A desk is a file with tools, model, when-to-use.
- **Mechanism:** Built-in general vs `.claude/agents/*.md`.
- **Evidence:** UI said “general purpose” on the five; ClickUp said “clickup searcher.”
- **Conditions:** One-off lenses can stay prompts. Repeating jobs get files.
- **Exceptions:** He still scored the book ~8 from five lenses.
- **Action:** I do not stand up five personalities to review Evens’s unpublished book.
- **Confidence:** high
- **Source:** `e18sdZLwP7o` @ UNKNOWN — “those were still built in native, generic agents that just had a prompt”
- **Epistemic:** SOURCE

## C. Mental Models

- **Specialists beat a mega-assistant.** Jack-of-all-trades + skills; subs are one-thing experts. **SOURCE**
- **Lead stays clean.** Dump goes elsewhere. **SOURCE**
- **Cheap read, expensive decide.** **SOURCE**
- **Front matter is progressive disclosure.** **SOURCE**
- **Misfires are mechanical until proven judgment.** Unclosed quotes; skill collision. **SOURCE**
- **Assume touch.** Permission layer. **SOURCE**
- **Don’t force the feature.** **SOURCE**
- **“Better than 99%” is the title.** **INFERENCE**

## D. Procedures

1. Ask: will this dump a pile I’ll never reread? If no, stay in-lead.
2. If yes or parallel-independent: name the job, the model, the tool allow-list.
3. Write a **thin** description (when-to-use + trigger phrases). Close YAML.
4. Choose project vs global on purpose.
5. Run once. Watch fire / no-fire. Rewrite the description. Give body feedback.
6. If two files collide, combine or invoke by name.
7. Lead merges short reports. Human never chats the swarm.
8. Giant parallel / “ultra code”: treat as a spend. Session-limit risk.
9. Borrowed markdown: read-only pass for injection before install.

**Qualify / frame:** Claude Code shopping-cart + “99%” title. Hive already has named desks.
**Objections:** “We need sub-agents” — we have 17. “Just generate 40” — he burned a session on 210.
**Avoid:** install Claude Code; mesh; borrowed files unswept; roast as an 18th desk.
**When to change:** sequential dependency, or the worker must ask Evens.

## E. Examples

**Situation:** Five personas review his book in parallel.  
**Action:** Main spins general-purpose subs with different role text; merges a score (~8).  
**Reasoning:** Chapters/lenses are independent; each needs a clean window.  
**Outcome:** One report to Nate.  
**Lesson:** Personas ≠ custom desks. Implicit rule: parallel only if order doesn’t lock.

**Situation:** Main is on Opus; he wants Fireflies research.  
**Action:** Research sub on Haiku/Sonnet; main keeps the summary.  
**Reasoning:** Fresh + cheap.  
**Outcome:** Lead context preserved.  
**Lesson:** Cheap worker, smart lead. Implicit rule: don’t research in the CEO seat.

**Situation:** “Roast my ice-cream stand.”  
**Action:** Roast **skill** fires, not plan-roster; unclosed quotes also broke YAML. He names the agent; 22.8k tokens stay off-main.  
**Reasoning:** Collision + mechanical miss.  
**Outcome:** Critique returns; lead stays small.  
**Lesson:** Tune the trigger. Implicit rule: explicit name beats hope.

## F. Decision Rules

- If the output is a pile you’ll never reread → sub.
- If steps are 1→2→3 or must converse → no sub.
- If the worker must ask the human → no sub.
- If two triggers overlap → combine or name.
- If the file is borrowed → read-only verify first.
- If someone wants 40+ parallel → check session spend; probably no.
- Optimize: clean lead + cheap reads.
- Refuse: Claude Code install; 18th roast desk; mesh.

## G. Contrarian

- Against “one mega assistant”: specialists.
- Against “always sub-agent”: forcing makes results worse.
- Against “teams/mesh by default”: one-to-one is the cheap shape.
- Against “prose permissions”: allow-list.
- Field assumes the title is a hire plan. He is selling a folder of markdown.

## H. Assumptions

**His:** Claude Code is the OS; YAML desks travel; Haiku is enough for critique/research; Plus/Skool deck converts.

**Ours:** Captions complete (6662 words). “99%” is marketing. 41 / 210 spawn counts **UNVERIFIED**. Domain: his book + ClickUp, not a client. Cursor + Grok only.

**Falsifiers:** Sub report is too lossy. Haiku misses the hole. Description never stabilizes. Dynamic workflow blows the budget.

**Disagreement (keep labeled):** We will not install Claude Code or his agent folder. Named desks, fresh context, cheap-read, permission-layer are stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What did the five personas disagree on (not on tape)?
- Max-turns: he rarely uses it — when did it save him?
- Who maintains collision lists as skills grow?
- Book: is the “8” a real edit signal or a bit?

## J. Connections

- **SYSTEM SYNTHESIS** → hive 17 + `hive-spawn-desks`: already the orchestrator pattern.
- **SYSTEM SYNTHESIS** → `interview-to-desk` / `agent-job-card`: file = desk, not a vibe.
- **SYSTEM SYNTHESIS** → `iTY8Q449YNQ`: roast council + session handoff.
- **SYSTEM SYNTHESIS** → `jBanaNBY-sM`: manager must not do the work.
- **SYSTEM SYNTHESIS** → doctrine 5/7/11: manage, send-off, cheap brain.

## K. Future-Use

- Description-collision log (Librarian, unassigned).
- Read-only verifier for borrowed markdown (Watchdog, unassigned).
- Max-turns as a Forge cap (unassigned).

## Steal / Operate-never

### Machine: One lead, named specialists, fresh context, cheap read
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** human talks to lead → lead asks “pile / parallel / independent?” → if yes, named specialist with thin trigger + tool allow-list + cheap model → specialist reports short → lead merges → human never chats the swarm.
- **Questions / signals:** “Will I reread this dump?” “Must these steps lock?” “Must it ask Evens?” “Project or personal?”
- **Qualify / frame / objections:** Claude-Code cart + 99% title. Objection: we need his folder — we have 17 desks.
- **Procedure:** D steps 1–8. Checkable stops: (1) job named, (2) trigger thin, (3) allow-list set, (4) short report in the lead, (5) no mesh.
- **Example that proves it:** Fireflies research on Haiku; 22.8k roast off-main. Lesson: the lead stays the CEO seat.
- **Why it works:** Pollution is the tax. Parallel only when independent. Permissions beat prose. Conditions: one orchestrator. Exceptions: sequential work; worker must ask the human; ultra-code spend.
- **Conditions / exceptions:** Cursor + Grok only. Claude / Codex / ChatGPT stay on tape. No 18th desk without triangle.
- **Operate-never payload:** Install Claude Code; mesh; 210-spawn; borrowed agents unswept; quote 99% as FACT.
- **Hive run (existing skills only):** `hive-spawn-desks` · `interview-to-desk` · `agent-job-card` · `ask-principal` · `info-gain-cite` (short report).
- **Source:** `e18sdZLwP7o` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Install Claude Code / Codex / ChatGPT / Gemini / switch stack
- Quote “99%” / 41 / 210 / 22.8k as FACT or a hire plan
- 18th roast personality / nameless swarm
- New hunt / unpark Normand
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md`

## L. Role-Specific Applications

I manage; I do not install his sub-agent folder because a title said 99%.

- **Done:** one independent review job delegated to named desks; short merged report; lead window still small.
- **Delegate without being asked:** Researcher/Librarian take the dump; I keep the call. Watchdog owns allow-lists.
- **Skeptical review:** Five personas scoring a book is a demo, not a workforce plan. Dynamic 210 is a bill.
- **One system this take:** main session delegates **one** independent job and merges a short report. Not five personas on Evens’s unpublished book.
- Live hunt stays parked.
