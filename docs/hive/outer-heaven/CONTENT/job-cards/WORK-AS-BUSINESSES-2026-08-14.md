# /work cases as businesses — scored from code

**Scored:** 2026-08-14  
**Fixed locally 2026-08-15; live until Evens deploys.** PROBLEM/RESULT + ProofCheck BUILD + SiteLink + `/pro/work` 308 alias.  
**Skill:** `website-offer-funnel` Path C (`icp_id: us`) · not a new client ICP  
**Source:** local repos + [client-engine-1 seed](file:///Users/evenslouis/client-engine-1/prisma/seed-projects.mjs) · not vault labels · not case BUILD copy  
**Live catalog:** https://evenslouis.ca/work — the only public work catalog.  
**CE:** `/pro` = operator login (client-engine-1 → VPS `/root/client-engine`). `/pro/work` = alias → `/work` (308 after CE deploy). Not a second catalog.  
**Do not:** send · pay · deploy · book · publish · mint `icp_id` · Autoflow product row · Path A unpark

```
DONE-CHECK: four cases scored from code + start = ProofCheck + copy-vs-code table
CAP: score + cards. No product builds. No live Stripe.
COST: no billed generate
STOP-KIND: cap + done-check
```

**Start:** ProofCheck QC. **Later:** QuickMarket. **Capability:** Clearfield. **Proof-only:** Autoflow.

PROBLEM/RESULT were hardcoded `—` (fixed locally 2026-08-15 in case-copy + seed). No `demoUrl` on any case. Do not invent `https://app.proofcheckqc.com`. Live until Evens deploys.

---

## Copy vs code (do not repeat the BUILD line)

| Case | Case BUILD says | Code is |
|------|-----------------|--------|
| ProofCheck | Proof documents, teams, annotations, approval pipelines | Nursing-student claim verify → report → final draft |
| QuickMarket | Favorites + real-time search | No favorites; client-side filter; demo $5 pay |
| Clearfield | Truth via open challenge | Structures evidence; does not adjudicate; viz demo-heavy |
| Autoflow | Visual editor / run history product | Screenshots, no app |

---

## ProofCheck QC — Path C first

**Treat as:** Path C business (`building`)  
**Repo:** `/Users/evenslouis/proof-qc-assist` · GitHub `snevemoney/proof-qc-assist`  
**Case:** https://evenslouis.ca/work/proof-qc-assist · slug `proof-qc-assist`  
**Stack:** Vite / React / Supabase / Lovable AI gateway · `npm run dev` → `:8080`  
**Confuse-with:** not Clearfield · not Client Engine proofs · not “team QC / approval pipelines”

**Who pays:** Quebec nursing / university students (`sciences infirmières`, care plans, INESSS/OIIQ). No price in code.

**SKU sentence:** Sources in → Verify Now → claim + intervention report → (login) final draft that keeps their voice.

**Working (demo-ready):**
- FR/EN (FR default) · anon or login · multi-project sidebar
- Upload PDF/DOCX/TXT · assignment + nursing rubrics · draft + strict mode
- Verify Now (claims + nursing interventions) · readiness bar · history
- Research chat (PICO/MeSH) · login-gated final draft + style + diff

**Gaps:** landing/export/citation UI built but unmounted · Export PDF / Copy MD have no `onClick` · requirements tab not passed into verify · no Stripe · no production frontend URL

**Hard step:** you deploy a public URL + set `demoUrl` · Stripe when you name pay.

---

## QuickMarket — Path C later

**Treat as:** Path C catalog (not the start)  
**Repo:** `/Users/evenslouis/quick-list-hub-42` · GitHub `snevemoney/quick-list-hub-42`  
**Case:** https://evenslouis.ca/work/quickmarket · slug `quickmarket`  
**Confuse-with:** not LightningFlow · not a two-sided paid marketplace yet

**Who pays:** sellers, $5 to go live (demo). Buyers pay sellers offline.

**SKU sentence:** Local classifieds — create listing → demo pay-to-publish → public grid → message seller.

**Working:** auth · listing CRUD · image upload · client search/filter · seller dashboard · buyer message · inbox · `paid_demo` + RLS hides unpaid.

**Gaps:** no Stripe · no favorites (case page claims them) · no mark-sold · no threads · no live URL · thin two-sided liquidity

**Hard step:** real Stripe on the $5 gate when you unpark.

---

## Clearfield Evidence Flow — capability

**Treat as:** hive capability · park as a sold business this cycle  
**Repo:** `/Users/evenslouis/clearfield-evidence-flow` · GitHub `snevemoney/clearfield-evidence-flow`  
**Case:** https://evenslouis.ca/work/clearfield · slug `clearfield`  
**Confuse-with:** not ProofCheck · not SENTINEL / shield-buddies · not a truth engine

**Who pays:** none this cycle. Civic/OSINT workbench, not a SKU.

**Working:** dashboard + realtime intel · claims/evidence CRUD · contradiction scan · unknowns/notes · bridge import · document search + seed archive · rabbit-hole AI · viz (graph/globe/nexus) mostly demo-seeded + live overlay.

**Gaps:** Auth page is UI-only (no `supabase.auth`) · client CRUD may hit RLS · no Stripe · no frontend URL · graph tables unused

**Hard step:** none. Do not productize.

---

## Autoflow — agency proof only

**Treat as:** proof on `/work` · **no Path C product row**  
**Repo:** none. Seed `repoUrl: null`, `techStack: []`. Screenshots only (`/screenshots/autoflow/1-dashboard.png` … `5-settings.png`).  
**Case:** https://evenslouis.ca/work/autoflow · slug `autoflow`  
**Confuse-with:** **not** `autoflow-finance` (auto-loan desk, not on live `/work`)

**Who pays:** nobody for Autoflow-the-product. The card sells the install agency.

**Working:** case page + screenshots. No app.

**Hard step:** none until you name a repo.

---

## Observe (API / catalog)

```
SURFACE: https://evenslouis.ca/work
RUNG: api
OFFER: four cards (Autoflow · ProofCheck QC · Clearfield · QuickMarket)
/pro: CE login / operator desk — not the catalog. Do not redirect /pro to /work.
/pro/work: alias of /work (308 after CE deploy). Not a second catalog.
demoUrl: none on any case
HARD STEP: still send (#contact). No Stripe on the case pages.
```

Did not send / pay / deploy / book / publish.
