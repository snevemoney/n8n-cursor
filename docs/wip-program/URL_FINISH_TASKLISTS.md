# URL → WIP finish task lists

Playwright crawl: `2026-08-07T15:33Z`  
Artifacts: `/opt/cursor/artifacts/wip-url-crawl/` (`crawl-results.json`, screenshots)  
Excluded hosts (per request): `n8ncloud.tech`, `evenslouis.pro`, `llm.n8ncloud.tech`, `lightningflow.online`

**Live vs WIP registry drift:** Product map / Phase 0 still say public portfolio on `/` + `/work`. Live apex is **Client Engine marketing** (`:3200`). Decide deliberately before more path work.

---

## Crawl snapshot

| URL | Status | What Playwright saw | WIP surface |
|-----|--------|---------------------|-------------|
| `/` | 200 | CE marketing hero (“I build software…”) | CE public / Phase 0 conflict |
| `/work` | 200 | CE case-study Work page (not portfolio lane catalog) | CE / portfolio sync debt |
| `/login` | 200 | CE Sign in | CE Ph2/7 |
| `/dashboard` | 200 → login | CE app gate | CE Ph2/7/8 |
| `/ce` | 200 → login | Shortcut → `/dashboard` | CE |
| `/pro/` | 200 | Same CE marketing under `basePath=/pro` | CE Ph2 |
| `/pro/dashboard` | 200 → login | CE app under `/pro` | CE Ph2/7 |
| `/pro/api/health` | 200 | `ok: true` JSON | CE |
| `/api/health` | 200 | `ok: true` JSON | CE |
| `/healthz` | 200 | n8n health body | n8n Ph5 |
| `/scorpion/` | 200 | Scorpion Operations Console | Scorpion Ph3/8 |
| `/scorpion/healthz` | 200 | JSON ok | Scorpion Ph3 |
| `/scorpion/chat/` | 200 | Console chat UI | Scorpion Ph3/8 |
| `/scorpion/council/` | 200 | Council UI | Scorpion |
| `/scorpion/ops/` | 200 | Ops UI | Scorpion |
| `/n8n/` | 200 → workflows | n8n sign-in / SPA | n8n Ph5 |
| `/lightningflow` | 200 → login | LF web login (“Unnamed Workspace”) | LF parked |
| `/lightningflow/ops` | 200 | LightningFlow Ops | LF parked |
| `/lightningflow/healthz` | 200 | Landing health JSON | LF |
| `/builder/` | 200 | **Stub** “Builder is not deployed” | CE Ph2 |
| `/claw/` | 200 → chat | OpenClaw Control | OpenClaw Ph4 / OH Ph1 |
| `/insights` | 503 | Reserved page | InsightsLM Ph15 |
| `www.evenslouis.ca/` | 200 | Same as apex | apex |

---

## 1. Client Engine (hive_core, maturity: **wip**)

**Paths:** `/`, `/work`, `/login`, `/dashboard`, `/ce`, `/pro/*`, `/api/health`, `/builder/`  
**WIP:** Phase 0 inventory · [02-ce-apis](./phases/02-ce-apis.md) · [06-hitl-topics](./phases/06-hitl-topics.md) · [07-ce-money-path](./phases/07-ce-money-path.md) · [08-daily-missions](./phases/08-daily-missions.md) · patches `docs/patches/client-engine/`

### Finish tasks

- [ ] **Decide apex role:** CE marketing on `/` (current) vs portfolio brand door (product map). Update `INVENTORY_FREEZE.md` + `EVENSLOUIS_PRODUCT_MAP.md` to match reality.
- [ ] **Login smoke:** Sign in at `/login` and `/pro/login`; confirm `/dashboard` and `/pro/dashboard` show ops UI (leads, command, jobs) — not stuck on Loading.
- [ ] **Auth.js path:** Stabilize session cookies for both root CE (`:3200`) and `/pro` (`:3204`) per Phase 2.
- [ ] **Hive machine APIs (Ph2):** Implement/verify CE `GET /api/hive/actions`, `GET /api/hive/leads`, `POST /api/hive/notes`, `POST /api/hive/actions/queue` with machine auth.
- [ ] **Money path (Ph7):** Walk one lead → build → proof → closeout in UI without SQL; worker DLQ visible.
- [ ] **Builder (Ph2):** Replace stub on `:3001` with real CE builder image/tree **or** keep stub but mark Phase 2 builder exit done intentionally.
- [ ] **`/work` catalog debt:** Either restore portfolio lane catalog at `/work` (Phase 0) or document CE Work as the public catalog and stop promising portfolio `/work` sync.
- [ ] **Backups:** CE postgres backup + restore drill (Ph7/18).
- [ ] **Mission wiring:** CE last-actions readable via Scorpion hive for Telegram playbook §1 (Ph8).

---

## 2. Portfolio / public catalog (public lane)

**Paths expected by WIP:** `/`, `/work` on portfolio `:4010`  
**Live:** Portfolio container still healthy on `:4010` but **not** on apex catch-all.

**WIP:** Phase 0 · product map · `apps/portfolio` · `lib/work-catalog.ts`

### Finish tasks

- [ ] Choose: put portfolio back on apex **or** retire portfolio-on-apex from registries.
- [ ] If portfolio returns to apex: Caddy catch-all → `:4010`; CE stays at `/pro` + `/dashboard` (or document CE-at-root as permanent).
- [ ] Sync `/work` lane badges with `repo-registry.ts` / `work-catalog.ts` after maturity changes.
- [ ] Ensure hero does **not** deep-link operator tools (HARD_RULES #10).
- [ ] Keep `/portfolio-healthz` if apex is portfolio again.

---

## 3. Scorpion (hive ops cockpit, maturity: **active**)

**Paths:** `/scorpion/`, `/scorpion/healthz`, `/scorpion/chat/`, `/council/`, `/ops/`  
**WIP:** [03-scorpion-image](./phases/03-scorpion-image.md) · hive APIs in README · Ph8 missions

### Finish tasks

- [ ] Confirm full image stays deployed (not stub): `/scorpion/healthz` has no `"mode":"stub"`.
- [ ] Hive smoke: `GET /scorpion/api/hive/health` with/without `HIVE_MACHINE_TOKEN`.
- [ ] Hive smoke: `POST /scorpion/api/hive/register`, `GET .../ce/actions`, `GET .../n8n/executions?id=`.
- [ ] Wire philanthropic tools `scorpion_register_outcome` / health tools (Ph1/3).
- [ ] Chat/council operator smoke (LLM/Ollama optional — degrade cleanly if llm host 503).
- [ ] Disk plan: keep ≥12G headroom before next Scorpion rebuild (Ph0/18).
- [ ] No public portfolio hero CTA to Scorpion.

---

## 4. n8n (hive bus, maturity: **active**)

**Paths:** `/n8n/`, `/healthz` (apex n8n health)  
**WIP:** [05-n8n-mcp-broker](./phases/05-n8n-mcp-broker.md) · MCP_BROKER_DECISION · Ph8 playbooks §2/§4

### Finish tasks

- [ ] Operator login to `/n8n/home/workflows` and confirm workflow list loads (Playwright saw SPA shell + sign-in).
- [ ] Publish hive workflow catalog (name, id, webhook, HITL vs autonomous).
- [ ] Dual-host webhook regression (`evenslouis.ca` + legacy host) — no basic_auth on webhooks.
- [ ] Broker: secrets only in n8n MCP; philanthropic tools call broker (Ph5).
- [ ] Allowlisted `n8n_trigger_webhook` + execution diagnose via Scorpion hive (Ph8).
- [ ] Error workflow → Telegram `#alerts`.
- [ ] Never `compose down -v` on `n8n_data` (hard rule).

---

## 5. OpenClaw / Outer Heaven (hive, maturity: **active**)

**Paths:** `/claw/` (UI), `/claw/hooks*` (machines)  
**WIP:** [01-loop-read](./phases/01-loop-read.md) · [04-openclaw-resilience](./phases/04-openclaw-resilience.md) · OPENCLAW_* guides

### Finish tasks

- [ ] Confirm `/claw/` Control UI usable (crawl landed on `/claw/chat?session=main`).
- [ ] Verify `/claw/hooks*` still **no** basic_auth; reject unauth correctly.
- [ ] Loopback bind monitor remains green (`gateway.bind=loopback`).
- [ ] Workspace backup cron + staging restore drill (Ph4).
- [ ] Topic IDs unchanged vs capability map.
- [ ] Creative-loop tools in Outer Heaven: `ce_list_actions`, n8n diagnose, scorpion health (Ph1 → Ph8).

---

## 6. Builder (CE adjunct)

**Paths:** `/builder/`, `/builder`  
**WIP:** Phase 2 builder exit  
**Live:** Stub page (real out-of-repo builder missing).

### Finish tasks

- [ ] Locate/restore real builder tree or image for `:3001`.
- [ ] Replace `evenslouis_paths-builder` stub in compose.
- [ ] Happy-path: open builder → publish one site under HITL (Ph7).
- [ ] Healthz + Caddy `/builder` exact slash behavior stays green.

---

## 7. LightningFlow (parked)

**Paths:** `/lightningflow`, `/lightningflow/ops`, `/lightningflow/healthz`  
**WIP:** Phase 0 parked · HARD_RULES (do not feature) · health only

### Finish tasks

- [ ] Keep **parked**: healthz green; no portfolio hero links.
- [ ] Fix “Unnamed Workspace” title / branding if ops still use login (cosmetic).
- [ ] Confirm ops panel `/lightningflow/ops` remains operator-useful or document as freeze.
- [ ] Resource caps stay in compose; no feature work until graduation decision (Ph16 style).
- [ ] Landing container healthcheck stays on `/healthz` (already fixed).

---

## 8. InsightsLM (hive_capability, **near_ship** — not staged)

**Paths:** `/insights` → 503 reserved  
**WIP:** [15-insights-staging](./phases/15-insights-staging.md) — **blocked on Phase 8 green**

### Finish tasks

- [ ] Do **not** stage until Ph8 exit report green.
- [ ] Deploy `insights-lm-private` on loopback with caps.
- [ ] Replace Caddy 503 with reverse_proxy; keep operator gate if reintroduced.
- [ ] Wire `#research` / `#autoresearch` topics; coexistence rules with Scorpion RAG.
- [ ] Backup + smoke ingest → answer; update INSIGHTS_STAGING.md.

---

## 9. Cross-cutting (platform)

**WIP:** [DISK_PLAN](./DISK_PLAN.md) · [18-platform-slos](./phases/18-platform-slos.md) · [19-freeze-scale](./phases/19-freeze-scale.md) · HARD_RULES

### Finish tasks

- [ ] Disk SLO: free space alerts; no volume prune on hive data.
- [ ] Caddyfile in repo matches live ungated restore (avoid re-applying broken gates blindly).
- [ ] Document operator entry: `/dashboard` (CE), `/scorpion`, `/n8n`, `/claw`.
- [ ] Phase 8: three no-SSH missions; then product candidates Ph9+ (SENTINEL, ProofCheck, etc. — no apex paths).

---

## Suggested finish order (hive gate)

1. **CE login + dashboard** proof (you)  
2. **CE hive APIs** (Ph2) + **Scorpion hive smoke** (Ph3)  
3. **n8n catalog + broker** (Ph5)  
4. **OpenClaw backup drill** (Ph4)  
5. **Real builder** or accept stub (Ph2 exit)  
6. **Phase 8 missions** → unlock Insights (Ph15) and product launches  
7. Resolve **apex portfolio vs CE marketing** registry drift  

Product candidates (SENTINEL, ProofCheck, ClipEngine, Trendspotter, Clearfield) have **no** apex URLs in this crawl — track under `docs/wip-program/phases/09–14` and `/work` catalog when portfolio is authoritative again.
