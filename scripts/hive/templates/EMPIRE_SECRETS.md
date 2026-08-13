# Empire secrets 4–9 (agent execution)

Load after `OPERATIONAL_MANDATE.md`. YAML: `EMPIRE_SECRETS.yaml` (Big Boss workspace).

**Hive safety:** Legal plumbing only. Money/treasury = **Tier 3** (`/pro` + operator). No ToS breaks. No shadow banking from Telegram.

---

## Secret 4 — Legacy latency arbitrage (exploit moat)

Do **not** break rules — **outrun** slow incumbents.

- Audit external APIs: rate limits, latency, pagination, batch windows.
- Build: cache · queue · webhook · n8n wait — before new microservices.
- Register every win with `correlationId`.
- **Forbidden:** unauthorized access, credential abuse, prohibited scraping.

**Hive examples:** Pipedrive webhook pipeline, n8n vs sync poll, golden-path caching.

---

## Secret 5 — Liquidity & yield (embedded finance)

Billion-dollar solo scale often = **fintech engine**, not pure SaaS.

- Route money flows through **Client Engine** + approved rails (Stripe, etc.).
- Subscriptions alone when take-rate/float is possible on the same flow.
- Treasury sweeps / interest / float → **Tier 3 only** — `hitl_propose_action` + `/pro`.
- Agents **never** move funds or wire Treasury from chat.

---

## Secret 6 — Data trap feedback loop

Code copies; **compounding telemetry** does not.

Every meaningful interaction:

1. `correlationId` → `scorpion_register_outcome`
2. Aggregate metadata (no raw PII/secrets)
3. Feed `#knowledge` / mission history → smarter next run
4. Model changes → council + operator HITL

---

## Deployment validation (abort if any FALSE)

Before prod deploy or architecture merge:

| Check | Question |
|-------|----------|
| **Data moat** | Does this create a compounding data loop from behavior? |
| **Liquidity** | Transaction volume, take-rate, or float captured (or N/A/hitl_propose)? |
| **Legacy arbitrage** | Accelerates a legal legacy bottleneck (or documented N/A)? |

**Any FALSE** → abort deploy · refactor · or `hitl_propose_action` (Tier 3 for money).

CLI: `bash scripts/hive/empire-validation-gate.sh "your feature one-liner"`

Execute and verify. Dominance without telemetry is theater.

---

## Secrets 7–9 — Autonomous Software Factory

Load `AUTONOMOUS_FACTORY.md` for full wiring.

| Secret | One line |
|--------|----------|
| **7 Self-heal** | Error webhook → n8n → register `ops.self_heal.proposed` → Forge PR → **you merge** |
| **8 Context DNA** | `.cursorrules` + hive YAML in every repo — business constraints, not vibes |
| **9 Feature factory** | Market signals → n8n rank → Dexter gate → staging → **you merge** |

Import self-heal workflow: `bash scripts/hive/n8n-import-error-heal.sh`

---

## Secrets 10–13 — Novice Architect (your edge)

Load `NOVICE_ARCHITECT.md` — operator is strategist, AI is implementer.

| Secret | One line |
|--------|----------|
| **10 Pseudocode** | Given-When-Then recipes → agents write code |
| **11 RDD** | Explain plan first — code only after **Approved** |
| **12 n8n sandbox** | Visual nodes before custom services |
| **13 Error budget** | Full log → fix + test + one-sentence why |

**RDD prompt** (paste before any build):

> Explain like I am a non-technical manager… Do not write code until I say "Approved".

---

## Secrets 14–16 — Self-evolution (lights-dimmed)

Load `SELF_EVOLUTION.md` + `SELF_EVOLUTION_PROTOCOL.md`.

| Secret | One line |
|--------|----------|
| **14 CI sandbox** | `agent/*` PR → staging auto-merge when CI green — **never main** |
| **15 Revenue sensor** | Hourly read-only metrics → hypothesis register |
| **16 Telemetry heartbeat** | Error webhook → self-heal → staging; prod = operator promote |

Prod deploy and money remain **Tier 3 HITL** per HARD_RULES.

---

## Secrets 17–19 — Mogul mode

Load `MOGUL_MODE.md` + `MOGUL_PROTOCOL.md`.

| Secret | One line |
|--------|----------|
| **17 Musk** | Delete 50% before code — `mogul-gate.sh` |
| **18 Thiel** | One niche choke point — no generic clones |
| **19 Viral scale** | Zero marginal cost + public data loops → CE funnel |

Financial matrix: Core API · cheap scale · CE capture engine.

---

## Secrets 20–22 — Multi-repo grid

Load `MULTI_REPO_GRID.md`.

| Secret | One line |
|--------|----------|
| **20 Gateway** | API/webhook first — unfinished UI OK |
| **21 n8n router** | `hive-ecosystem-route` — no inter-repo glue code |
| **22 Shared core** | `packages/*` registry — extract, don't duplicate |

```bash
bash scripts/hive/ecosystem-gate.sh "connect A to B"
bash scripts/hive/sync-ecosystem-cursorrules.sh
```
