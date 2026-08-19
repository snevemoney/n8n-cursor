# click-live-site — evenslouis.ca — 2026-08-14

Path C ship. **Observe only.** No Stripe. No ICP tag/unpark. No send / pay / deploy / book / publish.

**URL named:** https://evenslouis.ca (www if it redirects)  
**Owners this pass:** Forge (act) · Watchdog (GRADE below — Forge does not self-score)  
**icp_id:** none (unchanged)

---

## Checkable-stop (written before headed browse)

```
DONE-CHECK:
  1. API/macro pass written (what the public site actually serves)
  2. click-live-site observe card(s) on disk (home + real CTA path, no pay/send)
  3. verify-after-browser cards for each click
  4. Path C findings vs website-offer-funnel Path C (facts only)
  5. us workflow or this ship log updated with OBSERVED (not invented upgrades)
  6. .hive/state.json one key + CHRONICLE/2026-08.md append
CAP: one site, one session, max ~8 meaningful page views / clicks. If blocked, stop.
COST: no billed spray; no Stripe; tokens unknown
STOP-KIND: cap + done-check
```

## Assume-it-will-touch

```
ALLOW: cursor-ide-browser (navigate, lock, snapshot, click, take_screenshot, unlock); public HTTP to evenslouis.ca; hive docs listed in the job; hive-state.py one key; CHRONICLE append
DENY: send / pay / deploy / book / publish · Stripe dashboard · DNS · email send · form submit · ICP tag/unpark · Normand
TERRITORY: docs/hive/outer-heaven/CONTENT/knowledge/workflows/CLICK-LIVE-EVENSLUIS-2026-08-14.md · us.md OBSERVED append · CHRONICLE/2026-08.md · .hive/state.json via CLI
MAX-TURNS: 1 site · ≤8 clicks
BYPASS: none
```

## Observe-pane

```
ID: click-live-evenslouis
STATUS: done
NOTE: headed pass in parent Cursor browser (viewId 32a6c2). Subagent tab HOLD cleared.
```

## Sanitize-in / check-out

```
IN: public HTML only (no inbox). No secrets in fetched copy.
OUT: this ship log + chronicle — no keys, no form PII (form not filled).
PASS-NEQ-SEND: true
```

## Ladder (before headed vision)

```
LADDER: api → then vision
WHY: public headers/HTML/sitemap/health answer what the host serves; CTA click still needs headed OBSERVED
WATCH: headed cursor-ide-browser after this card. No headed send/pay/publish.
```

---

## 1. API / macro pass (FACT)

Fetched 2026-08-14 via curl (`HiveClickLive/1.0`). No browser yet.

| probe | result |
|-------|--------|
| `https://evenslouis.ca/` | **200** `text/html` · Next.js prerender · Caddy `via` · 42031 bytes |
| `https://www.evenslouis.ca/` | **301** → `https://evenslouis.ca/` then **200** (same etag) |
| `http://evenslouis.ca/` | **308** → https apex then **200** |
| `/robots.txt` | **404** (Next HTML 404, not a robots file) |
| `/sitemap.xml` · `/sitemap_index.xml` | **404** |
| `/healthz` | **200** `application/json` body `{"status":"ok"}` |
| `/health` | **404** |
| `/work` | **200** HTML 33205 bytes |
| `/pro` | **200** HTML; **visible text equals home** (same 2784-char stripped copy) |
| `/n8n` | **301** → `/n8n/home/workflows` then **404** (did not open in browser) |
| `/about` `/contact` `/services` `/pricing` `/book` `/hire` `/projects` `/portfolio` `/blog` `/resume` `/cv` | **404** |
| `/privacy` `/terms` `/data-deletion` | **200** |
| `/work/autoflow` `/work/proof-qc-assist` `/work/clearfield` `/work/quickmarket` | **200** |

**What the HTML actually offers (home):**
- Title: `evenslouis.ca`
- Meta: `Software development & automation`
- H1: `I build software that runs your business.`
- Badge copy: `Available for new projects`
- Services H3s: Full-Stack Development · AI Integrations · Automation Systems · MVP & Rapid Prototyping · Dashboards & Internal Tools · DevOps & Deployment
- Selected projects: Autoflow · ProofCheck QC · Clearfield Evidence Flow
- Process: Discovery → Build → Ship
- About: first-person Evens, full-stack / automation / AI, startups and businesses, no outsourcing
- Contact: `Tell me about your project. I'll respond within 24 hours with a plan and timeline.`
- Form fields (not submitted): Name · Email * · Company (optional) · Website (optional) · “What's slowing your business down?” · submit “Get in touch”
- mailto: `contact@evenslouis.ca`
- Nav: `/` · `#services` · `/work` · `#contact`

**Work page:** H1 Work · four case cards (adds QuickMarket) · CTA `Request a workflow audit` → `/#contact` · closer `Want this for your business?`

**Autoflow case (HTML):** “Request audit” · closer also says “Request a workflow audit or book a strategy call.” No `cal.com` / Calendly / Stripe URL in HTML.

**Money surfaces in HTML:** none. No Stripe, no checkout, no price, no `$` in visible copy, no book widget URL.

**Stack signal:** Next.js behind Caddy on the owned domain. Preview host was not the URL clicked.

---

## 2. Headed observe — PASS (parent Cursor tab)

Subagent session could not hold a tab. Parent locked existing live tab `32a6c2` already on `https://evenslouis.ca/`. Did **not** switch to Chrome / Playwright / browser-use. Did **not** submit the form. Did **not** charge Stripe.

Clicks used: 3 (cap 8). Snapshot `url` lagged Next client nav; `location.href` via CDP was the OBSERVED URL.

### Observe card — home (API/macro only, not a headed click)

```
SURFACE: https://evenslouis.ca/
RUNG: api
OFFER: "I build software that runs your business." Full-stack, automation, AI. "Available for new projects."
CTAS: View my work → /work · Start a project → #contact · Services → #services · Contact → #contact · mailto:contact@evenslouis.ca
HARD STEP: form submit "Get in touch" or email = send (HITL). No Stripe. No price. No book URL on home HTML.
WWW: https://www.evenslouis.ca/ → 301 → https://evenslouis.ca/
HEALTH: GET /healthz → 200 {"status":"ok"}
SEO FILES: /robots.txt and /sitemap.xml → 404 (HTML 404 page)
```

### Observe card — /work (API/macro only)

```
SURFACE: https://evenslouis.ca/work
RUNG: api
OFFER: case list Autoflow · ProofCheck QC · Clearfield Evidence Flow · QuickMarket
CTAS: Request a workflow audit → /#contact · case cards → /work/{slug}
HARD STEP: still the home contact form (send). No Stripe.
```

### Observe card — /pro vs /pro/work (API/macro, 2026-08-15 rule)

```
SURFACE: https://evenslouis.ca/work (canonical)
RUNG: api
OFFER: four cards on /work
/pro: CE login / operator desk — not the catalog. Do not redirect /pro to /work.
/pro/work: alias → /work (308 after CE deploy). Not a second catalog.
demoUrl: none
CASE BUILD vs CODE: lies — ProofCheck is nursing QC; QuickMarket has no favorites; Clearfield does not adjudicate; Autoflow has no app
HARD STEP: send (#contact). No Stripe. Do not deploy this sitting.
SCORE: CONTENT/job-cards/WORK-AS-BUSINESSES-2026-08-14.md
```

### Observe card — /work/autoflow (API/macro only)

```
SURFACE: https://evenslouis.ca/work/autoflow
RUNG: api
CTAS: Request audit · Request a workflow audit
COPY ALSO SAYS: "book a strategy call" — no cal.com / Calendly / Stripe href in HTML
HARD STEP: audit request = #contact form (send). Book copy has no destination. Did not click book. Did not submit.
```

---

## 3. Verify-after-browser cards

### Card 0 — lock existing home tab (parent)

```
ACT: browser_lock viewId 32a6c2 (already https://evenslouis.ca/)
EXPECTED: lock; snapshot shows H1 + View my work + Start a project
OBSERVED: locked; URL https://evenslouis.ca/; H1 "I build software that runs your business."; badge "Available for new projects"; CTAs View my work + Start a project; Get in touch disabled
COMPARE: match
NEXT: proceed
```

### Card 1 — click View my work

```
ACT: clicked "View my work" (ref e4) on https://evenslouis.ca/
EXPECTED: https://evenslouis.ca/work ; H1 Work; case cards
OBSERVED: location.href https://evenslouis.ca/work ; H1 Work; "Proof of execution"; cards Autoflow · ProofCheck QC · Clearfield · QuickMarket; CTA "Request a workflow audit"
COMPARE: match
NEXT: proceed
```

### Card 2 — click Autoflow card

```
ACT: clicked Autoflow case card (ref e67) on /work
EXPECTED: https://evenslouis.ca/work/autoflow ; case page; audit CTA
OBSERVED: location.href https://evenslouis.ca/work/autoflow ; H1 Autoflow; At a glance PROBLEM & RESULT are dashes (—); BUILD copy present; NEXT STEP "Request audit"; copy "Request a workflow audit or book a strategy call"; all audit CTAs href /#contact; no cal.com / Calendly / Stripe href
COMPARE: match
NEXT: proceed
```

### Card 3 — click Request a workflow audit (observe #contact, no submit)

```
ACT: clicked "Request a workflow audit" (ref e96) on /work/autoflow
EXPECTED: https://evenslouis.ca/#contact ; contact form visible; no send
OBSERVED: location.href https://evenslouis.ca/#contact ; H1 home; form Name / Email* / Company / Website / "What's slowing your business down?"; button "Get in touch" disabled; mailto contact@evenslouis.ca; bookLinks=[]
COMPARE: match
NEXT: stop (HITL send). Did not fill. Did not click Get in touch.
```

---

## 4. Path C findings (facts vs website-offer-funnel Path C)

Ladder = **api → vision**. Headed vision landed in the parent tab.

| Path C want | OBSERVED on evenslouis.ca |
|-------------|---------------------------|
| Our surface on owned domain | **Yes.** Apex 200 Next.js + Caddy. www 301 → apex. Not a preview host. |
| Dual smoke preview **and** domain | Domain live. Preview URL not part of this job. |
| Offer sentence | **Yes.** Software that runs the business; shipped on infra you own. |
| MUST + margin + four-blank on-page | **Missing.** No price, no constraint KPI, no 60-day scope. |
| Book spine | **Missing as a URL.** Home = contact form. Autoflow copy says “book a strategy call” with no book href. `/book` = 404. |
| Pay / Stripe spine | **Missing.** No Stripe, checkout, or `$` in visible copy. `/pricing` = 404. |
| Hard step | **Send** (form “Get in touch” / mailto). Not pay. Not a public book widget. |
| Proof / work | `/work` 200 + four case slugs 200. `/pro/work` aliases `/work` (308 after CE deploy). Case BUILD copy **lies vs repos** — see `CONTENT/job-cards/WORK-AS-BUSINESSES-2026-08-14.md`. No live `demoUrl`. |
| `/pro` | **CE login / operator desk** (client-engine-1). Home-stripped HTML is not the catalog. |
| `/pro/work` | **Alias of `/work`** — 308 after CE deploy. Not a second catalog. No `demoUrl` on any case. |
| `/n8n` | 301 → `/n8n/home/workflows` → **404**. Not opened in browser. |
| robots / sitemap | **404** |

Fail-the-build (headed): standard dark Next marketing page. No cinematic hero/video. Autoflow glance PROBLEM/RESULT are empty dashes. “Book a strategy call” is copy with no href. Do not say “looks good.”

### Watchdog GRADE (not Forge)

```
GRADE: pass-with-gaps
CLICK-PATH: pass — three CTAs each have OBSERVED + COMPARE=match
MONEY-SPINE: fail — no price, no Stripe, no book URL; hard step is send
FORGE-SELF-SCORE: false
```

---

## 5. Side-effect-not-essay

```
CLAIM: click-live-site on https://evenslouis.ca (Path C, no Stripe) — headed CTA path observed
SIDE-EFFECT: this file headed cards · us.md OBSERVED · hive-state job done · CHRONICLE append
DIFF: none (no prompt/config change)
GRADE: pass-with-gaps (Watchdog). Click-path pass. Money-spine fail.
```

---

## HITL if Evens wants a Path C money spine

Headed click path is done. Do **not** do these here:

- Add a public **book** URL if “strategy call” is real
- Add **Stripe / price** (the *other* Path C XOR — not this session)
- Copy/publish/deploy (robots, sitemap, Autoflow PROBLEM/RESULT dashes, CTA)
- Send the contact form or email `contact@evenslouis.ca`

---

## Click budget

Used: 3 headed clicks (View my work · Autoflow · Request a workflow audit) + 1 lock. Cap 8. Stop. Form not submitted.

## Token-receipt

```
TOKENS: unknown
DURATION: this session
CORRECTNESS: pass
```

Sanitize-out on this file: `verdict=pass` · `pass_neq_send=true` · `next=HITL money-spine`. Not sent.

state.json: job `click-live-evenslouis` = done. Headed COMPARE=match ×3.
