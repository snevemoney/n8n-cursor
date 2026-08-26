---
name: click-live-site
description: >-
  Click the live surface (alias click-live-surface). After a ship, when
  fixing a previous build, or before calling a factory bite done on a UI.
  Maestro-style flow on any owned URL a human can click. Looks good
  without a click is a fail. Do not install Maestro. Forge and Watchdog.
  Cursor plus Grok Bot.
---

# Click the live surface

**Machine:** `click-live-site` · **Alias:** `click-live-surface` · **Path:** C · **Owners:** Forge + Watchdog  
**Cursor copy:** `.cursor/skills/click-live-site/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/click-live-site/SKILL.md`  
**Schema:** `CONTENT/knowledge/workflows/click-live/SCHEMA.md`  
**Steal:** Maestro’s MACHINE (`x:2074046218741678570` Adam KP / vibe-test) — not Maestro-the-product.

```
DONE-CHECK: owned-surface skill + Maestro-style schema + 2 example flows + hive-funnels/stack + factory card line + 3 skill copies
CAP: playbooks + schema + examples. No headed 20-step Twitch clone. No Maestro install.
COST: no billed generate
STOP-KIND: cap + done-check
```

## What “full maestro style” means here

**On-stack (this skill):** a conceptual split, not a hosted theater.

```
LEFT   living surface — web app / site / local preview a human can click
RIGHT  a flow file of steps the agent runs
STEP   launchApp|navigate · scroll · tapOn|click · swipe · assertVisible
AFTER  each step → verify-after-browser (ACT EXPECTED OBSERVED COMPARE NEXT)
STATUS running | pass | fail — written on disk
GRADE  Watchdog, other session (`separate-verifier`)
HOST   IF Cursor → cursor-ide-browser. IF Grok Bot → Grok browser. Never cross.
```

**Not Maestro-the-product:** do not install Maestro CLI, Android SDK, an emulator, or a device lab. Do not buy a vibe-test SaaS. Do not write a Playwright runner. Playwright stays Scorpion/app e2e only.

Native mobile → ASK / later. Do not stand up Maestro to “do it for real.”

## When

After a **ship** (prod / staging / preview / localhost-if-that-is-the-ship)  
**or** when **fixing a previous build**  
**or** before calling a **factory bite done** on a UI (`dark-factory` / `MATRIX-PROCESS-2026-08-15` SURFACE layer).

Looks-good in chat, a screenshot with no click, or docs-only = fail.

**Merged 2026-08-14:** `gt8k4bA01Mo` roast — one primary CTA visible **before any scrolling**, repeated after proof, color nothing else may wear. Claude/Jarvis second-brain on-tape; hive grader = Watchdog + this card.

**Widened 2026-08-15:** not only evenslouis.ca. Software we built, will build, and previous builds we fix — websites, repos, projects, apps — **if a human can click it in a browser**.

## Surface (what counts)

**Yes — owned URL:**

| Kind | Examples | Host URL |
|------|----------|----------|
| Prod / apex | evenslouis.ca, `/work`, `/pro/work` | the public URL |
| Staging / preview | Vercel preview, private demo | the preview URL (preview ≠ proof of prod domain) |
| Localhost-if-ship | ProofCheck `:8080`, QuickMarket, CE `/pro`, Path C wrap | `http://127.0.0.1:…` / `localhost` |

**No:**

- Repo with **no UI** → API / tests / Watchdog GRADE. Not this skill.
- Native mobile → ASK. Do not install Maestro.
- Someone else’s site as a hunt (Path A parked). Do not mint `icp_id`.

Localhost ≠ prod when a public domain is the ship. Localhost **is** the surface when that is what shipped (ProofCheck has no production frontend URL yet).

## Browser path (where the desk is running)

```
IF Cursor (this IDE, Task agents, click-live-site from Cursor)
→ Cursor IDE browser (`cursor-ide-browser`: navigate, snapshot, click, take_screenshot; lock/unlock).
  Not Chrome. Not Playwright. Not browser-use.

IF Grok Bot
→ Grok Bot’s own web browser (Grok Bot path). Do not call Cursor MCP. Do not rip this path out.
```

Same card either way.

## Flow file (right pane)

Load or write YAML under `CONTENT/knowledge/workflows/click-live/flows/{id}.yaml`.

Required fields: `app.url` · `steps[]` with `action` + `expected` + `verify_card`. Optional: `app.package` (native — ASK). Full field list: `SCHEMA.md`.

Examples (playbooks, not a headed run this sitting):

- `flows/evenslouis-ca.yaml` — home → work → one case → contact. No form submit.
- `flows/proofcheck-local.yaml` — `localhost:8080` sources → draft → verify path. No pay. Do not fire Verify Now.

## Runner (comment only — agent, not a binary)

The desk **executes** YAML steps with the **host browser tools** (Cursor → `cursor-ide-browser`; Grok → Grok browser). After each step it writes OBSERVED onto that step’s `verify_card` and appends `flows/{id}/RUN.md` (`STATUS: running|pass|fail`).

Do **not** write a Playwright runner. Do **not** shell out to `maestro`. Do **not** stand up an emulator.

## Steps

1. **Ladder** (`api-macro-vision`): write `LADDER: api | macro | vision` before headed browse. Vision last.
2. Name the **owned URL** and the flow `{id}`. If no YAML exists, write the smallest path that proves the bite (≤8 steps). Cap a headed run — this skill is not a 20-step Twitch clone.
3. Set `STATUS: running` on `flows/{id}/RUN.md`.
4. For **each** step, in order:
   - Act once on the host path (`launchApp`/`navigate` · `scroll` · `tapOn`/`click` · `swipe` · `assertVisible`).
   - Write the **verify-after-browser** card at `verify_card` (required):

```
ACT: <verb + target + url>
EXPECTED: <step.expected>
OBSERVED: <url + visible state>
COMPARE: match | miss
NEXT: proceed | retry (cap 2) | escalate
```

   A step without OBSERVED is a fail. Skill: `verify-after-browser`.
5. If `hard: true` or the next act is send / pay / deploy / book / publish → halt. `ask-principal`. Do not click it.
6. Check mobile width or responsive breakpoint if the slice touched layout.
7. Check `prefers-reduced-motion` if the slice is cinematic.
8. Write `STATUS: pass` or `fail` on `RUN.md` with what broke. Screenshot optional.
9. **Separate-verifier:** Watchdog fills GRADE in another session. Forge must not self-score.
10. **Side-effect-not-essay:** CLAIM + SIDE-EFFECT (`RUN.md` + card paths) + DIFF if a prompt/config changed.
11. Fail-the-build pass (sites): if a motion designer could still tell this from a template, list the biggest gap — do not say "looks good."

## Pass criteria

- Every step has a `verify_card` with `COMPARE` (`match` or `miss`). Missing OBSERVED = fail.
- `RUN.md` exists with `STATUS: pass` or `fail` (not a chat “looks good”).
- Watchdog `GRADE` is written. Forge self-score = fail.
- Hard step was not executed.
- No console blocker on the happy path.
- Hero loads (poster/video) on cinematic pages.
- Preview host is not treated as proof of the production domain when both exist.

## Stop

Custom domain / Stripe / prod deploy still needs HITL + `paid-slice-funnel` smoke.  
Send / pay / deploy / book / publish = Evens.  
Do not install Maestro. Do not mint `icp_id`. Path A parked.

## Anti-patterns

- "Looks good" without opening the URL
- One CTA click with no flow file when Evens asked maestro-style
- Playwright / Chrome / puppeteer / browser-use for this job (Scorpion e2e only)
- Telling a Grok Bot desk to call Cursor MCP, or ripping out the Grok Bot browser path
- Click without writing OBSERVED (`verify-after-browser`)
- Installing Maestro CLI / Android SDK / emulator / device lab
- Buying a vibe-test SaaS
- Docs-only verification
- Preview host as proof of production domain
- Localhost as proof of apex when apex is the ship
- Firing ProofCheck **Verify Now** on a click-live pass (billed generate)
- Headed form submit / pay
- Treating a no-UI repo as a surface
- Standing up Maestro for native mobile without ASK

**Playbook (cinematic sites):** `CONTENT/website-building/cinematic/PLAYBOOK.md` step G.  
**Prior headed log (apex, 2026-08-14):** `CONTENT/knowledge/workflows/CLICK-LIVE-EVENSLUIS-2026-08-14.md` — observe cards, not this schema’s first RUN.
