# click-live flow schema (Maestro-style)

**Skill:** `click-live-site` (alias `click-live-surface`)  
**Playbook:** `scripts/hive/grok-skills/click-live-site.md`  
**Steal:** Maestro’s MACHINE — left = living surface, right = a flow of steps — not Maestro CLI, not an Android lab, not a vibe-test SaaS (`x:2074046218741678570`).

This is a **file format**. The agent on the host browser executes it. There is no Playwright runner and no `maestro` binary.

---

## Split (conceptual)

```
LEFT   living surface (web app / site / local preview a human can click)
RIGHT  this YAML — ordered steps
AFTER  each step → verify-after-browser card on disk
STATUS running | pass | fail  (written on disk)
GRADE  Watchdog, other session (`separate-verifier`)
```

Not a hosted Twitch-on-Android theater. Native mobile = ASK / later. Do not stand up Maestro.

---

## File

```
docs/hive/outer-heaven/CONTENT/knowledge/workflows/click-live/flows/{id}.yaml
docs/hive/outer-heaven/CONTENT/knowledge/workflows/click-live/flows/{id}/RUN.md
docs/hive/outer-heaven/CONTENT/knowledge/workflows/click-live/flows/{id}/cards/{nn}-{step}.md
```

`{id}` = flow `id` (slug). Examples: `evenslouis-ca` · `proofcheck-local`.

---

## Document fields

| Field | Required | Meaning |
|-------|----------|---------|
| `id` | yes | Slug. Same as filename stem. |
| `app.url` | yes | Owned URL the human would open. Prod / staging / preview / localhost-if-that-is-the-ship. |
| `app.package` | no | Native package id. Omit on web. If present → ASK; do not install Maestro. |
| `name` | yes | One-line what this flow proves. |
| `hard_step` | yes | `send` · `pay` · `deploy` · `book` · `publish` · `none`. Named verb stays Evens. Flow must stop before it. |
| `host` | yes | `cursor-ide-browser` or `grok-browser`. Where the desk is running. Never cross. |
| `status` | yes | `running` · `pass` · `fail`. Start `running` when the agent begins; write the end state on `RUN.md`. |
| `run` | yes | Path to `flows/{id}/RUN.md`. |
| `steps` | yes | Ordered list. Each step **must** set `verify_card`. |

---

## Step fields

| Field | Required | Meaning |
|-------|----------|---------|
| `id` | yes | Stable step slug. |
| `action` | yes | See verbs below. |
| `verify_card` | yes | Path for that step’s ACT / EXPECTED / OBSERVED / COMPARE / NEXT. |
| `expected` | yes | Observable state after the act. If you cannot name it, do not act. |
| `target` | when tap/click/assert | Visible text, role+name, or CSS the host snapshot can see. |
| `url` | when launch/navigate | Absolute URL for that step (defaults to `app.url` on first launch). |
| `direction` | when swipe/scroll | `up` · `down` · `left` · `right`. |
| `hard` | no | If `true`, do not execute — halt and `ask-principal`. |

A step without `verify_card` is invalid. A card without OBSERVED is a fail.

---

## Verbs (Maestro names + hive aliases)

| Verb | Alias | Host act (Cursor) | Host act (Grok) |
|------|-------|-------------------|-----------------|
| `launchApp` | `navigate` | `browser_navigate` to `url` | Grok browser open URL |
| `scroll` | — | `browser_scroll` | Grok scroll |
| `tapOn` | `click` | `browser_click` on snapshot target | Grok click |
| `swipe` | — | `browser_drag` / scroll in `direction` | Grok swipe |
| `assertVisible` | — | snapshot / screenshot; no click | same |

Do not add `inputText` that submits a hard-step form. Type-into-search is OK if `hard_step` is not send/pay.

Playwright / Chrome / puppeteer / browser-use are **not** verbs on this job. Playwright = Scorpion/app e2e only.

---

## Per-step card (required)

Write `verify_card` after the act. Skill: `verify-after-browser`.

```
ACT: <verb + target + url>
EXPECTED: <from step.expected>
OBSERVED: <url + visible state from the host snapshot/screenshot>
COMPARE: match | miss
NEXT: proceed | retry | escalate
```

Retry cap = 2, then escalate. COMPARE=match is not a hard-step close.

---

## RUN.md (agent writes this; do not invent a runner binary)

```
# {id} — click-live RUN

STATUS: running | pass | fail
HOST: cursor-ide-browser | grok-browser
STARTED: <iso>
STOPPED: <iso>
HARD_STEP: <named> — not executed

## Steps
| n | id | action | COMPARE | NEXT | card |
|---|----|--------|---------|------|------|
| 1 | … | launchApp | match | proceed | cards/01-….md |

## OBSERVED (per step)
### {step.id}
<url + visible state>

## Watchdog GRADE
(other session — Forge does not fill)
```

Status on disk is the scoreboard. “Looks good” in chat is not a run.

---

## In / out of this schema

**In:** any owned UI a human can click in a browser — sites we built, will build, or fix; localhost when that is the ship (ProofCheck `:8080`, QuickMarket, CE `/pro`, Path C wrap).

**Out:** repo with no UI (use API / tests / Watchdog GRADE). Native mobile (ASK). Headed send / pay / deploy / book / publish. Installing Maestro, Android SDK, or a device lab. A 20-step Twitch-clone theater.

---

## Examples

- [`flows/evenslouis-ca.yaml`](flows/evenslouis-ca.yaml) — home → work → one case → contact. No form submit.
- [`flows/proofcheck-local.yaml`](flows/proofcheck-local.yaml) — `localhost:8080` sources → draft → verify **path**. No pay. Do not fire Verify Now (billed generate).
- [`flows/ce-pro-work.yaml`](flows/ce-pro-work.yaml) — **alias** of `evenslouis-ca`. `/pro/work` 308 → `/work`. Not a second catalog. `/pro` (no `/work`) stays CE login. Full walk: `evenslouis-ca.yaml`.
