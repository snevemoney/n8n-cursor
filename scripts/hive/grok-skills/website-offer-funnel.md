---
name: website-offer-funnel
description: Router for website funnel or website workflow. Picks client money spine vs list/build spine. Never skip MUST, margin, or private-book when the job is a named client. Cursor plus Grok Bot only.
---

# Website-offer funnel (router)

**Stack:** Cursor + Grok Bot. Workflow = funnel.

Do not run every stage. **Pick a path first.** If unclear, ask Evens one question: *client install, or our list/page?*

**Tagged `icp_id`?** Load `CONTENT/icp-runbooks/{icp_id}.md` and run the **Today** block first (skill `icp-runbook`).

## Pick

| Job | Path | Do not |
|-----|------|--------|
| Named prospect, leaky site, book button, retainer | **A — Client (money spine)** | Skip MUST / margin / private-book. Do not start with 50 names. |
| “Make a list” / ICP volume | **B — Lists** | MUST-score 50 URLs. Use `lead-web-find` only after anneal. |
| Build *our* page / proof / Stripe | **C — Our surface** | Treat Cal.com-on-*their*-site as Stripe. |
| New lane / “what do we sell” | Offer + desk first | Build before the sentence. |
| Unsure | Ask once | Default to Path A if a URL is already named. |

---

## Path A — Client (money spine)

Named URL → paid install. This is the AI Partner machine.

**Steal examples** (`one-person-usecases`): dental/local `review-to-book` · named creator `clip-factory` · `speed-positioning`. Not generic landing pages.

1. `lead-web-find` — URL + leak + contact + constraint hypothesis.
2. `prospect-must-score` — any MUST=0 → HOLD. Stop.
3. `constraint-position` — their ops sigh, not a feature list.
4. `four-blank-sku` + `usecase-to-sku` — Bucket / KPI / Baseline / 60d.
5. `pricing-margin-roi-guardrails` — HOLD or go. Pain $ = UNVERIFIED until they say it.
6. `warm-draft-hitl` — approve draft ≠ approve send.
7. After they reply: `discovery-spiced-constraint` then `demo-walk-script`.
8. Delivery: `private-book-install` (their Cal/CTA). **Not** `paid-slice-funnel` unless we are selling *our* checkout.
9. `proof-30-60-90` → retainer or stop. Change order if scope creeps.

Hard step: HITL + `ask-principal`. You send / you approve money.

---

## Path B — Lists (then maybe A)

Volume ICP, not a dial factory.

1. `outcome-offer-funnel` — one ICP sentence (who we hunt).
2. `list-anneal-funnel` — 50 → 60–70% great → exclusions → people.
3. Pick **3–5** with a visible leak + contact.
4. Each of those → Path A from `lead-web-find` (or skip find if URL+leak already captured).
5. Outreach only after Path A is green through margin: `outbound-playbook-funnel` → `warm-draft-hitl`.

Do not MUST-score the raw 50. Do not anneal when you already have one named URL (Path A).

---

## Path C — Our surface (build)

Proof page, cinematic slice, or *our* paid product.

1. `session-bootstrap` then `slice-build` (bible → one system).
2. Watchdog: preview **and** custom domain.
3. *Their* book button → `private-book-install`.
4. *Our* Stripe / new domain → `paid-slice-funnel`.
5. Website craft still applies (brief, tokens, SEO, ship) — see `CONTENT/website-building/`. Do not one-shot the kit.

---

## Offer vs constraint vs four-blank

| Skill | Job |
|-------|-----|
| `outcome-offer-funnel` | Marketing sentence (who + number + proof) |
| `constraint-position` | Their clog/leak (Path A, after MUST) |
| `four-blank-sku` | Engagement scope (Path A, after POSITION) |

Write all three when Path A is live. Do not let one replace the others.

## New lane
`interview-to-desk` (triangle) before Path B or C burns build time.

## Never
Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus.  
IG OTP farms, auto-dial, betting SKU, unverified income quotes.
