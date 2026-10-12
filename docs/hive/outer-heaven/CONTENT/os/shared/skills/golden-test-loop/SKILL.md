---
name: Golden test loop
description: >-
  Use when designing or auditing a recurring agent loop — trigger, task, success
  check, log; verify before declare done; no unattended harness installs.
merged_from: [binary-self-eval-skills, osmani-tdd, superpowers-tdd]
---
# Golden test loop

Sources: Simon Scrapes `yt:icM0ewXGvAw`; Caleb `yt:4biXYSNkn9Y`; DeepSeek harness `yt:f51ICIoHcjY`; Nate `/goal`+`/rewind` `yt:vfWTyEreOEc`; Chase concepts `yt:eF20iepBQCU`; Cole AI-native `yt:Tliio-33w4g` `yt:eecUhBpTz_g` (CAPTION_GAP — PIV from dossier).

## Tools
| Need | Path |
|---|---|
| Verify live | Playwright / box browser / tests — **PROVE** |
| GitHub issue spine | GitHub MCP — **PROVE** |
| DeepSeek Harness product | **BLOCKED** — workaround = this skill on Cursor |
| Claude Code Ultra / swarm | **BLOCKED** — Cursor cloud agent + Grok skills **WORKAROUND** |
| Unattended 24–48h `/goal` | **NO** — ops never |

## Prompts
**ASR thicken:** Austin Marchese `yt:IiZ5HRaeX4s` Whisper LIVE — 4 projects remap Claude→Cursor+Grok. Also Chase/Cole prior.

**Bounded goal**
```
Goal (≤ lunch / ≤ bedtime):
Definition of done (runnable):
Turn/time bound:
Verify (click URL / test / claim card path):
If wrong: rewind to [last good] — do not argue the bad branch.
```

**Loop card**
```
Trigger:
Task (one skill that already works by hand):
Success check:
Log path:
Effort: medium-default; compact ~30% before handoff.
```

**PIV gate (Cole remap)**
```
Plan (issue + acceptance):
Implement (Cursor cloud agent / Forge):
Validate (verify-then-done click/test):
Fresh session if context rot.
```

**Austin niche command center MVP (FACT project #2)**
```
Interview me (technical guardrails) to plan MVP for [my real daily workflow — not hypothetical].
Plan BEFORE build. Ship minimum valuable today; add features as needed (e.g. “add credit-card txs”).
Zero audience pressure — ugly OK. Remap: Claude Code → Cursor cloud agent + Grok.
Success check: I used it once this week for a real task.
```

**Austin internal OS structure (FACT project #4 folders)**
```
Create folders: knowledge/ · skills/ · projects/
Root brain file (CLAUDE.md remap → AGENTS.md or Cursor rules + Grok skill index) teaches how to use folders.
Add /improve-system skill: after a good rewrite, capture feedback into knowledge/skills so next draft starts better.
Add ingest-resource skill: librarian for articles/transcripts/YT into the right folder.
Optional GitHub (treat OS as IP). No Eden app install — Outer Heaven + wiki-ingest WORKAROUND.
```
## Do
1. trigger → task → success check → log
2. Success check is runnable; pair verify-then-done
3. Automate only after it works by hand once
4. Wrong turn → rewind; keep bounds

## Don’t
- Loop-engineering as a product
- Quote harness $ / educator CTAs as FACT

## Steal thicken — Simon 19 mistakes (`yt:icM0ewXGvAw`) FACT
1. **Sub-agents / CloudAgent teammates ≈ expensive for DO:** Anthropic docs ~**7× tokens** in plan/team mode (FACT from tape). Use for **look** (broad search, parallel investigate, low context). Keep high-context **do** on main session.
2. **Sub-agent context is thin:** gets task prompt + (usually) skill/rules hierarchy — **not** chat history, output style, auto-memory, or files already read. Built-in explore/plan-style agents may skip root rules entirely → **restate critical constraints in the spawn prompt**. Need full context → fork/continue main thread, don’t spawn blind.
3. **Context size ≠ memory:** Opus long-context retrieval cited ~**93% @ 256k** vs ~**76% @ 1M** (FACT from tape / Anthropic bench claim) → compact early; don’t chase max window.
4. **Edit the plan file directly** (Claude Ctrl+G) → **WORKAROUND:** open plan/issue in editor, patch acceptance, tell agent “plan updated — execute.” Don’t burn tokens asking the model to rephrase tiny plan edits.
5. Pair verification ladder from [verify-then-done](sand-workflow:verify-then-done).

**Prompt — spawn with constraints**
```
CloudAgent / sub-task:
Critical rules (restate; do not assume CLAUDE.md/AGENTS.md inherited):
Look vs do: LOOK only | DO with bound
Done-when + verify:
If needs full chat context: stay on main / fork — do not spawn.
```

## Graph engineer verifier (`yt:_9OT25ZvrWs`)
A loop without a separate verifier node is hope. Keep verify off the builder. SOP lives in a skill (LLM-as-graph) plus a few deterministic scripts. Do not install LangGraph / Claude dynamic-workflow just to draw the graph.

## Implement 2026-08-26
Verifier MUST differ from builder. Second node = verify-then-done. SOP in a skill. hive-smarter-loop.

## Cursor 2026-08-19 map
Custom Modes / steering = this verifier node. /goal is the SOP in the skill. Do not spawn a second Bot as the verifier.

## Loop / Gauntlet (WL 26-100 title only)
Loop engineering + Claude Gauntlet = verifier is a different node. Already hive-smarter-loop. Do not install a new looper product.

## WL26-100 L2 2026-08-26 — loop / gauntlet / PIV (PROVE tape)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2.md`
Title-only “Loop / Gauntlet” stub superseded.

### Loop engineering (`yt:4biXYSNkn9Y`) FACT timedtext
- Stack: prompt → context (tools fill window) → harness (external manager when self-summarize leaks ~5–10 min) → **outer** loop so the agent can prompt itself (schedule / self-guide).
- Addi Osmani six on tape: automation, worktree, skills, plugins/connectors, sub-agents, state.
- Still scarce proof it “makes a huge difference.” Do not productize. Hive routines + this skill **are** the outer loop.

### Gauntlet (`yt:IA_zUI1Q6pY`) FACT timedtext
- Lead splits; **blind** critic per piece vs a **real** benchmark (screenshot / proven example). “Amazing” is not a bar — critics then agree with the builder.
- Models self-grade (speaker: 54 cycles claimed improve; >half worse/flat). Human is the finish line (Matt 3.6→5.1 still lost to real; he pulled the plug). Round cap required.
- Speaker 19h / 1.7B token runs = **do not copy as unattended hive**. Verifier ≠ builder already.

### Cole AI-native (`yt:Tliio-33w4g`) FACT timedtext (fetch truncated after Archon; core captured)
- Productivity mirage (feel +20% / actually −19% — cited). Vibe-paste tickets → slop → net slower.
- **PIV / R-PIV:** prime/research → plan as **handoff artifact** → **fresh session** to implement → validate. Job #1: reduce assumptions. Rules file lean (<300 lines, every-task only).
- AI layer lives in the repo (rules + skills + MCP). Every bug can PR the layer. Do not start at autonomous epic / dark factory.
- Archon / Claude Flow / spec-kit = **NO-SKILL**. Remap Jira demo → GitHub issue spine.

**Loop card add**
```
Bar (concrete artifact, not adjective):
Verifier (different node, blind to builder excuses):
Round cap / human stop:
Fresh session after plan? Y/N
```


## WL26-100 remaining L2 2026-08-27 — dark factory / loop / one-job (PROVE tape)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2-REMAINING.md`

### Cole dark factory (`yt:eecUhBpTz_g`) FACT timedtext
- Stay L3 (human plan + validate) unless the harness is proven. Dark factory / L4–5 = experimental (thickens Tliio-33w4g).
- Holdout scenarios written **before** work. Builder never sees them. Validator never sees the plan.
- `mission.md` goals + **out-of-scope** so the factory can REJECT a spec. Merge without deploy = PR generator, not a factory. Human fail-safe on infinite fix loops. Archon **NO-SKILL**.

### Chase loop (`yt:eF20iepBQCU`) FACT timedtext
- Loop = trigger + task + concrete success + log. Subjective "good report" needs a human grade or it cannot self-improve.

### Mobile course (`yt:p80OV6kjIO8`) FACT ASR
- Per feature: implement → operator manual test → **separate** AI review on a branch → merge. Plan.md checklist; do not implement the whole app in one go.

### Godot (`yt:mjg_JUMar04`) FACT timedtext
- One job, one fresh session, one test. Fail returns **one job**, not the game. Best model plans; others execute.

## Cole hooks stop-remap 2026-08-27 (`yt:msfMqW92Y8Q`) ASR PROVE
Stop-hook remap: the verifier must actually run. Agent saying done is not done. Claude `/hooks create` **BLOCKED** — use this skill + verify-then-done, not a Claude hooks product.

## X bookmarks 2026-08-27 15:19 — self-prompt outer loop
Source: x:2092998070157861368. Same steal as hive-smarter-loop. Our outer loop is trigger, task, success check, log, plus a verifier who is not the builder.
Claude Managed Agents / Agent SDK = BLOCKED. Do not productize loop-engineering.

## Jason + Awesome 2026-08-29
- Separate verifier node (Jason secondary + Awesome watch-page PROVE). Holdouts stay blind to the builder.
- Loop card must name: goal · verifier · stop/budget. No max-iteration = burn ($ anecdotes **UNVERIFIED**).
- Useful factory work: unit tests, docs, boilerplate — not magic requirements → finished product.
- Lights-off factory (humans stop reading code) **BLOCKED**. You inherit months of agent architecture you never followed.
- Human outer loop stays. Do not install Claude `/loop` or a dark-factory harness. Pair hive-smarter-loop + verify-then-done.


## Grok Bot harness (2026-09-01 — update, not a rebuild)

Org: Evens talks to Big Boss. Consultant audits/scope. Other desks only via mention or handoff. No 17 DMs.

After a meaningful run, append one JSON line (never overwrite, never log secrets):
`python3 /home/box/.grokbot/outer-heaven/append-action-log.py --agent "<desk>" --action "<slug>" --target "<what>" --result "<one line>"`
Log file: `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`

Failed or finished scheduled work doorbells the Big Boss / Day Planner / Consultant exec group only. Stay quiet if nothing failed. No logger desk. Mac out unless Evens asks local. HITL: money, client send, prod deploy, secrets.

## Karpathy skill-issue auto-research 2026-09-01 (`yt:kwSVtQ7dziU`) FACT timedtext

No Priors interview. Remap Claude Code / Codex / OpenClaw → Grok Bot + Cursor CloudAgent. Do not install a claw swarm or a second harness.

Steal:
- Typing is not the verb. Express will to **multiple bounded agents**; optimize the **instructions** (skills), not the chat. "Everything is a skill issue."
- Auto-research only when a candidate is **cheap to verify** (tape analog: validation-loss commit you can just check). If you cannot check without Evens, do not loop — run [four-blank-before-build](sand-workflow:four-blank-before-build) four blanks first.
- A research org is a set of markdown files (`program.md` roles + how they connect). Hive: this loop card + skills + `/home/box/.grokbot/outer-heaven/ACTION_LOG.jsonl`. Do not mint a program.md product.
- Untrusted internet workers ("blockchain of commits") **BLOCKED**. Hive workers = named desks + CloudAgent on owned repos. Verifiable = tests / click / packet path.
- Human job = the **few bits** agents cannot invent. Write markdown **for agents**, not HTML theater for humans.
- Lights-off / remove-humans-from-all-processes stays **BLOCKED**. Round cap + human stop remain.

**Loop card add**
```
Cheap verify (test / click / loss analog)? Y/N — if N, HOLD
Instructions being optimized (skill path), not this chat:
Number of agents (named; not a swarm):
Human bits only I must supply:
```

Tools add: disk transcripts **PROVE** (Composio YouTube remap). Claude desktop / OpenClaw **BLOCKED**.

## Deep repass 2026-09-03 — iFixAI pillar map (RESEARCH-OK)
When auditing a desk/bot: map checks to Fabrication / Manipulation / Deception / Unpredictability / Opacity (iFixAI FACT README).
Builder ≠ judge. Propose ifixai-ai/iFixAI via awesome-skill-import-gate; do not auto-install.
Mock PROVE path after yes: ifixai run --provider mock (seeded defects expected).
Until then: verify-then-done + Playwright + ACTION_LOG keep/revert.

## LIVE enrich 2026-09-03 video repass
Sources: Cursor `/goal` `2090136966121599117`; Karpathy How I use LLMs `yt:EWvNQjAaOHw` (verify ADA/code); Boris ablate+eval; loops/graphs panel `2094065331576688985`.

- **`/goal` card:** name done-when + keep-going until verify click/test. Still **NO** unattended 24–48h ops without operator.
- **Verify model code:** if the agent wrote analysis/plot code, read it before trusting the spoken number (Karpathy ADA “lie”).
- **Ablate → eval:** delete prompt/tool lines, run product, add back only on repeated fail. Evals outlive prompts briefly; saturate → replace.
- **Loop vs graph:** loop = single objective + verifier + stop; graph = branch/route when one loop is not enough. Verifier ≠ builder node.


## Enrich wave-H 2026-09-09 — Awesome factory `23dY7YDgXDI` (marker: wave-H-20260909-factory)
Packet: `/workspace/research/youtube-daily/repass-20260909/23dY7YDgXDI/`
- Green tests/linters ≠ architecture fit / maintainability (HumanLayer/Dex dark-factory critique).
- Factory ticket: CI+review Y · merge only after human read · telemetry feeds next loop · lights-off = NO.
- Do not treat unattended continuous agent factories as golden-loop success without measurement.

## Wave-M repass 2026-09-09 (`yt:msfMqW92Y8Q`)
File-based A–E PARTIAL packet: wave-M repass packet `/workspace/research/youtube-daily/repass-20260909/msfMqW92Y8Q/`. Steal unchanged — hooks=deterministic events; Claude `/hooks` still **BLOCKED**.

## Wave T addendum 2026-09-09 (`yt:nQwJVHCtDDY`)
Matt Pocock HITL vs AFK + checkpoint observability (scoped). AFK needs bounded DoD+verify; never remove all prod gates; do not hand browser agents live API consoles. Packet `…/nQwJVHCtDDY/recreation/AGENTIC_HARNESS_CHECKLIST.md`.

## Wave W enrich 2026-09-09 (`yt:eecUhBpTz_g`) dark factory VTT **PROVE**
Was CAPTION_GAP dossier cite → full chapters+stills.
- Five components: workflow repo · queue · blue-green · guidance 3-files · validation harness.
- Autonomy ladder; **lights-off REJECT** as ops default. Cole Claude skill **BLOCKED**.

## Wave Y 2026-09-09 Tim remap
- `_C57BxSXRbU` tool-stack category remap · `kt5a-TXmWew` Claude-Code-features→Cursor/Grok remap
- Packets under `repass-20260909/_C57BxSXRbU/` and `…/kt5a-TXmWew/` — Claude daily OS **BLOCKED**


## CapEx tracks (Documented / Demonstrated / Transferred) — DoD 2026-09-09

| Track | Bar | Counterexample |
|---|---|---|
| **Documented** | Loop card + builder≠verifier doctrine + BLOCKED installs | Inventory touch; stamp-only |
| **Demonstrated** | Executable fail→pass where verifier checks **golden expected string + SHA-256** on builder artifact (builder ≠ verifier); logged JSON/jsonl | Markdown checklist / AE_STATUS D PASS alone; sharing harness-loop field-presence demo without golden hash contract |
| **Transferred** | Another desk + **different** golden fixture/task → new fail→pass logs | Enrich-only; replaying CapEx `golden_task.json` |

### Hard rules
- **checklist-only ≠ Demonstrated.** Loop-card markdown / `LOOP_HOOK_SKILL_CHECKLIST.md` stay **Documented** until a runner writes FAIL then PASS golden-match artifacts.
- **enrich-only ≠ Transferred.** Touching this SKILL.md does **not** move Transferred.
- Distinct from [agent-harness-loops](sand-workflow:agent-harness-loops): harness = required fields + `success_check` equality; **golden-test-loop** = exact golden string **and** sha256 match.

### Certified Demonstrated — 2026-09-09 22:08 ET
CapEx demo: `/workspace/research/packets/skill-capability-transfer-20260909/demos/golden-test-loop/`
- Runner: `golden_test_loop.py`
- Fixture: `fixtures/golden_task.json` + `fixtures/golden_expected.txt` (sha256 `ee57842665a1…1ab6`)
- Proof: builder attempt 1 wrong bytes → verifier **FAIL** (`string_match=false`, `sha256_match=false`) → attempt 2 golden body → verifier **PASS**; `out/loop.jsonl` + `out/loop_run.json` + `out/loop_run.log`
- Packets reused: `eF20iepBQCU`, `2090136966121599117`, `_9OT25ZvrWs`, `23dY7YDgXDI` (+ OH `agentic/golden` g1–g3 pattern)
- STATUS: `…/STATUS_GOLDEN.md`

### Transferred — OPEN
Requires **another desk** on a **different** golden fixture (not CapEx `golden_task.json` / `golden_expected.txt`). Until that returns fail→pass logs, **Transferred = unchecked**.

### Done-when (E / Transferred)
```
Done when (Demonstrated): golden_test_loop.py shows verifier FAIL then PASS with string+sha256 match logs on disk.
Done when (Transferred): different desk + different golden fixture/task JSON → new out/ with same fail→pass golden-match contract.
Enrich-only / checklist-only / CapEx fixture replay ≠ Transferred.
```

## Enrich 2026-10-10: evidence-driven testing (yt:blI10_91xgA, Ras Mic "software factory is all skills")
Reproduce first and capture the BEFORE state while the bug is cheapest to observe, then fix, then capture AFTER with repo checks plus runtime evidence. A green test without a reproduced failure doesn't count as proof. This matches the existing loop; the citation adds the before-capture step.

---

## Merged from `binary-self-eval-skills` (2026-10-11)

- Original description: Use to improve a skill overnight — binary pass/fail evals on golden cases; rewrite skill.md from failures.
- Unique content carried: tests-first rule; failing-check-first; binary pass/fail overnight skill eval

# Binary self eval skills

Sources: Simon Scrapes binary self-eval loops.

## When
A skill is used repeatedly and quality drifts.

## Do
1. Define golden cases with pass/fail.
2. Run the skill; log fails.
3. Patch the skill.md the same day (improve-system-writeback).

## Don't
- Vague 1-10 vibes without binary gates
- Hoard new skills instead of fixing the failing one

## Enrich 2026-10-10: skill A/B is the eval (`yt:bEJuF9JltYE` Supabase eval)
Same model, same tasks, with vs without the skill → the delta is the skill's value (Supabase: Sonnet 78% → higher with the agent skill). Job ready at `/workspace/research/packets/youtube-2wk-fullwatch-20261010/_cursor_jobs/skill_ab_eval.py`. BLOCKED_CURSOR_USAGE (OpenRouter key in Cursor only).


---

## Merged from `osmani-tdd` (2026-10-11)

- Original description: Use when implementing logic or fixing bugs — tests first or with the change; remaps Osmani test-driven-development to hive golden-test-loop.
- Unique content carried: tests-first rule; failing-check-first; binary pass/fail overnight skill eval

# Osmani TDD

Source: addyosmani/agent-skills `test-driven-development` (MIT). Pair: golden-test-loop / verify-then-done.

## When
New logic, bugfix, behavior change.

## Do
1. Name the failing check (test, script exit, click path).
2. Implement until the check passes.
3. Keep deterministic work in a named script when possible.
4. Agent-said-done without executed list = FAIL.

## Don't
Ship without a runnable check. Unattended client send.


---

## Merged from `superpowers-tdd` (2026-10-11)

- Original description: Use when implementing features or bugfixes — write the failing check first; remaps obra/superpowers test-driven-development to hive (golden-test-loop / check-forge-done).
- Unique content carried: tests-first rule; failing-check-first; binary pass/fail overnight skill eval

# Superpowers TDD

Source: obra/superpowers `test-driven-development` (MIT). Packet: `/workspace/research/packets/obra-superpowers/skills/test-driven-development/`.

## When
New features, bug fixes, behavior changes — before implementation.

## Do
1. Name the failing check (test, script exit, click path).
2. Watch it fail for the right reason.
3. Minimal code until it passes.
4. Pair [Osmani TDD](sand-workflow:golden-test-loop) + golden-test-loop. Agent-said-done without executed check = FAIL.

## Don't
Skip the fail. Install hooks/scripts from Superpowers. Ship live `/` to "prove" green.
