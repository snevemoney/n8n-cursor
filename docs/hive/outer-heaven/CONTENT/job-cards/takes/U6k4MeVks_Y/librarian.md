# Librarian — U6k4MeVks_Y
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/U6k4MeVks_Y/transcripts/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/U6k4MeVks_Y/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Give Me 50 Minutes, I'll Give You 1000+ Hours Of Claude Code Knowledge (2026 Guide)
**Channel:** Chase AI
**Kind:** video (~51:28 / ~11,335 words)
**Captions:** hive youtube + yt-dlp — timestamp UNKNOWN (caption-only; no invented clicks)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Roadmap: beginner (where to run it) → intermediate (context, skills, connectors) → advanced (loops, Ultra, routing, “agentic OS”). “1,000 hours” / “most powerful tool” stay on-tape. Close is Chase AI Plus + Claude Code masterclass.
2. Beginner surface: desktop app for non-technical (voice, browser, inline artifacts). Terminal still there *inside* desktop. Global instructions blank unless truly every-chat. Capabilities: load tools when needed; turn the rest on. Local 99.99%. Git: stay on `main`, skip worktree if you do not know git. Permissions: sit on **auto** (classifier); bypass can install/delete; plan is the other mode he uses.
3. Model/effort: $20 plan → Opus, not Fable (burns usage). Max 5x/20x ($100 / $200) → Fable most of the time; weekly Fable cap is half of usage. Effort not linear (extra-high → ultra ≈ 1% better, ~5× cost — his claim, UNVERIFIED). Beginners: medium or even low. He sits Fable medium unless complex or a reset is coming.
4. Prompting: **plan mode first** on a new project. Mic + stream of consciousness. End with “what am I not thinking about?” Magic goal/context/act formats are mostly gone. When it asks tech-stack: do **not** mash Recommended — ask it to explain (moat + you actually learn). Comment the plan in the desktop pane; **Accept + auto**, not Accept into manual.
5. Context window: 1M token budget; performance drops as it fills; he starts asking “new chat?” at ~30%, certainly by 50%. `/clear` = fresh; `/compact` = summary into a new chat; `+` = new chat in the same folder. **Files survive.** Web-app fear does not apply.
6. Intermediate: ugly first site = no inspiration. Skills = prompts that make a non-deterministic model *somewhat* deterministic. Official frontend-design plugin = that skill. Multiple similar skills need a nudge. **Skill creator** is the one to add (evals / benchmarks). GitHub URL → “add this skill.” End of a session can become a skill. One Pinterest screenshot + frontend-design → three divergent versions; he picks V1, calls V3 slop.
7. Outside tools: connectors (Gmail/Calendar/Drive) / plugins (GitHub, Supabase MCP) / **CLIs** (often more surface + bundled skills). Pick one. Ask Claude to find/add GitHub + Vercel and stand up the pipeline in English. Account + login still required. “Claude runs the show” as apps ship CLIs/MCPs.
8. Long horizon: trigger + task + **objective** success criteria. `/goal` loops new sessions until the criteria hit (Ralph-like, finite). Subjective “looks cool” fails. Forever jobs add **logging** + score past runs → skill → **routine** (daily 7 a.m. morning brief example). Graph engineering = nested micro-loops that talk; he says overkill for most.
9. Ultra / dynamic: custom harness, many sub-agents, expensive. `/deep research` = fan-out + adversarial + synthesize. One run: **103 agents, 6M tokens, all Fable** — UNVERIFIED as a receipt, labeled as his demo. Cap sub-agent count; route Sonnet/Opus for subs. Patterns: classify-and-act, fan-out+adversarial, generate-and-filter / tournament, loop-until-done. Use deep research *before* plan on a hard project.
10. Routing: models grade themselves as “great.” Official Codex plugin for adversarial review or a feature slice. His **grill-meex** skill: Fable plan ↔ Codex up to five rounds (Matt PCO groom + Codex). Cheaper/local models via skill creator. Custom “agentic OS” = visual wrapper over a **skill map** of daily work; value is the skills, not the dashboard. Obsidian / Karpathy-style: raw → wiki → output + `index.md` at each level (human + model can navigate; fewer tokens). Headless `claude -p`; rate-drama “no longer the case.” Plus CTA for his exact vault.
Gap: the live Lighthouse URL, the grill-meex file, the vault tree. Timestamp UNKNOWN. Claude Code / Fable / Codex / Vercel / Obsidian / Plus on-tape.

## B. Atomic Knowledge

### Plan first; do not mash Recommended
- **Claim:** Plan mode forces unknown-unknowns into questions. Hitting Recommended every time makes you replaceable and teaches you nothing.
- **Evidence:** “unknown unknowns are a real problem” / “where is any moat whatsoever”
- **Action:** File plan-then-explain; do not skip into execute
- **Confidence:** high as his beginner doctrine
- **Source:** `U6k4MeVks_Y` @ UNKNOWN
- **Epistemic:** SOURCE

### Context dies; files do not
- **Claim:** Watch the window; at ~30% start a new chat. `/clear` vs `/compact` vs `+`. The folder is the memory.
- **Evidence:** “starting a new chat isn’t really starting from zero”
- **Action:** File 30% reset; do not treat `/compact` as the wiki
- **Confidence:** high
- **Source:** `U6k4MeVks_Y` @ UNKNOWN
- **Epistemic:** SOURCE

### Skills make a loop somewhat deterministic
- **Claim:** Ten runs, ten ways — unless a skill names the way. Skill creator turns a session into the next skill.
- **Evidence:** “skills allow us to be somewhat deterministic”
- **Action:** File skill-as-SOP; do not install Claude Code to get a card
- **Confidence:** high as his intermediate thesis
- **Source:** `U6k4MeVks_Y` @ UNKNOWN
- **Epistemic:** SOURCE

### /goal needs an objective stop
- **Claim:** Finite long jobs loop until a checkable end state. “Looks cool” cannot grade itself.
- **Evidence:** “you need to be able to define success” / “the more subjective your criteria is”
- **Action:** File objective-stop; aligns with golden-test-loop
- **Confidence:** high
- **Source:** `U6k4MeVks_Y` @ UNKNOWN
- **Epistemic:** SOURCE

### Models do not grade themselves
- **Claim:** Ask Opus to score Opus and it says great. Bring a second frontier (Codex on tape) or you are scoring blind.
- **Evidence:** “it’s going to pretty much always say, I did a great job”
- **Action:** File second-eyes; Codex/Plus stay on-tape — hive stays Cursor+Grok
- **Confidence:** high as the problem statement
- **Source:** `U6k4MeVks_Y` @ UNKNOWN
- **Epistemic:** SOURCE

### Wrapper ≠ OS; index.md is the keep
- **Claim:** The dashboard is buttons on skills. The keep is raw/wiki/output plus an index at every level so a human and a model can navigate.
- **Evidence:** “the true value isn’t in these cool visual layers” / “index markdown file telling me what is going on”
- **Action:** File index-at-each-level; do not clone his Obsidian vault
- **Confidence:** high
- **Source:** `U6k4MeVks_Y` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Desktop for non-technical; terminal is optional. Global bar is high. Auto ≠ bypass. Effort is not linear. Plan → explain → accept+auto. Context is a budget. Skills = SOPs. CLI/MCP/connector — pick one. Finite `/goal` vs forever routine+log. Graph is nested loops (usually overkill). Ultra is a harness you pay for. Second model grades the first. OS = skill map + indexes, not a skin.

## D. Procedures
Blank globals. Local + auto + plan. Mic ramble + “what am I missing?” Ask it to explain the stack. Comment the plan; accept+auto. Watch 30%. Skill + screenshot before you redesign. Ask it to add the deploy CLI. Write a pass/fail for `/goal`. Manual-run a skill until it is good, then routine it. Cap Ultra sub-agents. Do not deploy / pay / publish from the chat.
Avoid: Claude Code / Plus / Codex / Obsidian as hive; 103 agents / 6M tokens as FACT; always-allow send.
Signals: Lighthouse three versions; Vercel URL without opening the dashboards; 103-agent research burn.

## E. Examples
**Lighthouse site:** Situation — fake analytics landing, book-a-call CTA, he did not know the stack. Action — plan questions, then frontend-design + one screenshot → three versions. Reasoning — context + a skill beat “clean SaaS.” Outcome — V1 kept, V3 called slop; later GitHub+Vercel from one English prompt. Lesson — inspiration in, then a named skill; deploy still needs an account (HITL).

## F. Decision Rules
- If non-technical → he says desktop, not terminal-first.
- If the instruction is not every-chat → leave globals blank.
- If you cannot name success → do not `/goal`.
- If you are about to Ultra-research → cap agents and/or cheaper subs.
- If the plan is “clone Chase’s vault” → refuse.
- Refuse: Claude Code / Plus / n8n-cloud as hive; Fable/Codex crowns as ours; tape $ / 6M tokens as FACT.

## G. Contrarian
Against terminal-or-you’re-serious. Against magic prompt templates. Against Recommended-as-a-lifestyle. Against treating `/compact` as durable memory. Against graph-first. Against the wrapper-as-the-product.

## H. Assumptions
$20 / $100 / $200, Fable half-cap, 1% vs 5×, 103 agents / 6M tokens UNVERIFIED. Cole-no-plan-mode (`RzLV8sfFdMM`) vs this tape’s plan-first — keep both labeled. Nate Hermes / plan-first already on other cards. Aligns with `4OOS96i2gfI` (start low) and `0YXjEzFfft8` (SOP=prompt; files survive `/clear`). Headless `-p` billing “fixed” is his claim.

## I. Questions
What is in grill-meex exactly? Which vault folders are required vs taste? Did Anthropic actually drop the `-p` surcharge?

## J. Connections
SYSTEM SYNTHESIS → `4OOS96i2gfI` (climb only); `RzLV8sfFdMM` (Cole dissent on plan/Hermes); `jdbOVepEtUE` (second-brain L2). Hive: `agent-job-card` · `golden-test-loop` · `session-bootstrap`. Clients parked.

## K. Future-Use
Plan-then-explain + 30% reset + objective `/goal` + second-eyes + index-at-each-level as atoms.

## Steal / Operate-never

### Machine: plan, named skill, objective stop, index — not a Claude OS
- **Epistemic:** SOURCE
- **Workflow / loop:** plan + questions → explain unknowns → accept → watch context → skill/screenshot for quality → objective success for long jobs → index the folder → checkable stop = named pass/fail or new chat
- **Questions / signals:** Is this instruction global? Am I at 30%? Can a stranger grade the output? Is there an index in this folder?
- **Qualify / frame / objections:** “just hit recommended / just Ultra it” = no moat
- **Procedure:** stream-of-consciousness + “what am I missing?”; skill-from-session; routine only after manual runs
- **Example that proves it:** Lighthouse V1 vs slop V3; 103-agent burn as the cost warning
- **Why it works:** files + skills + indexes outlive a chat
- **Conditions / exceptions:** graph/Ultra only when the job forces it; second model is the grade, not the hive
- **Operate-never payload:** Claude Code / Plus / Codex / Obsidian as hive; always-allow; 6M tokens as FACT
- **Hive run:** `agent-job-card` · `golden-test-loop` · `session-bootstrap`
- **Source:** `U6k4MeVks_Y` @ UNKNOWN

### Operate-never
- Install Claude Code / Codex / Obsidian / Chase Plus as hive. Cursor + Grok only.
- Quote 1,000 hours / $200 / 6M tokens / 103 agents as FACT.
- New `icp_id`. Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/librarian.md`.
- Send / pay / deploy / book / publish. Bypass-permissions as default.

## L. Role-Specific Applications
File plan-then-explain, 30% reset, and index-at-each-level as labeled rows. Do not stand up a Claude OS or clone the vault. Vendor names stay on tape.
