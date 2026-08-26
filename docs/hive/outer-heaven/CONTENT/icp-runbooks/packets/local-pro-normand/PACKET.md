# PACKET — Plomberie Chauffage Normand

**Date:** 2026-08-13 · **ICP:** `local-pro` · **Path:** A  
**URL:** https://www.plomberienormand.ca/en  
**Machine:** `private-book-install` (site CTA) — not `missed-call-book` PSTN  
**SKU:** Intake→Book Install · Rung 1 · $1.5–3.5K CAD (center ≤$3K)  
**Verdict:** MUST **PASS** (LIKELY on #4/#16) · margin **PASS** · stage **qualified**  
**Send:** HOLD until HITL draft approve, then second HITL send. Do not send from this packet.  
**Parked:** Evens skipped clients 2026-08-14; do not send; do not ask again this week.

## Public FACTS (2026-08-13 live read)

- Hero: “CONTACT US FOR ALL YOUR PLUMBING…” · CTAs **Estimate** + **Contact Us** — no Book / calendar.
- Estimate form: Name, Email, Telephone, Address, Work required, Comments → Send. Async, not a slot.
- Hours: Mon–Fri 7:00 AM–5:00 PM. Sat/Sun **closed**.
- 24/7 emergency **for established customers only**.
- Phone 514-488-6577 · fax 514-488-1361 · info@plomberienormand.ca
- Named contact: Francois Pineau (privacy officer) · francoispineau@plomberienormand.ca
- Address: 8501-A Rue Cordner, Lasalle H8N 2X2 · Island of Montreal (NDG, Westmount, Lachine, Montreal West)
- 30+ years · RBQ 1367-9279-85 · Énergir partner · CMMTQ · Financeit on header
- Screenshot: `CONTENT/icp-runbooks/evidence/local-pro-normand-20260813.png`

## MUST score

| # | Criterion | 0/1 | Evidence |
|---|-----------|-----|----------|
| 1 | One-sentence constraint | 1 | After-hours / weekend jobs hit a closed office; new work is phone or estimate form, not a book slot. |
| 2 | ACQUIRE/CUT bucket | 1 | ACQUIRE: inquiries → booked estimate. CUT: missed after-hours callbacks. |
| 3 | Public leakage | 1 | No calendar. Form + phone. Weekend closed. Emergency gated to existing customers. |
| 4 | Owner-operator buyer | 1 | Local inc. + named Francois Pineau. Not enterprise committee. **LIKELY** — confirm who signs site/intake. |
| 8 | ≤40% delivery / fee | 1 | Config/SaaS: CTA + form/Cal + owner alert on existing site. No redesign. |
| 9 | DONE_WHEN ≤60d | 1 | Book CTA above fold · owner alert · reply SLA · N booked calls from new path. |
| 10 | Forge only if expand | 1 | Default workflow/config. |
| 11 | First-ask band | 1 | Rung 1 $1.5–3.5K. |
| 12 | Public contact path | 1 | Form + info@ + 514-488-6577. Not mailto:null. |
| 13 | Reversible first step | 1 | 20-min diagnosis / mock CTA. No rebuild. |
| 14 | Brand / public book | 1 | Trade, not “select few.” Public book CTA is on-brand. |
| 15 | No Tier-3 landmines v1 | 1 | No Stripe rebuild, no PHI, no prod infra. |
| 16 | Single owner | 1 | Named Pineau + info@. **LIKELY** — discovery question below. |
| 17 | Access | 1 | Screenshots + their site/tools. |
| 21 | Four blanks | 1 | Drafted below. Baseline TBD once. |
| 22 | Pain $ UNVERIFIED | 1 | No owner volume. Do not invent job $ . |
| 23 | Price vs pain | 1 | Fixed Rung 1 band (volume unconfirmed). |
| 24 | Cash path | 1 | Invoice/deposit on install. No free custom build. |

**SHOULD:** 5 in-market (Financeit) · 7 local calendar/trust · 18 Eastern TZ · 19 testimonials. Aim ≥5/8: **PASS**.

## POSITION (Consultant)

- **Stated ask (we would say):** add a book button.
- **Felt problem:** weekend and after-5 jobs go to voicemail/form; 24/7 is reserved for people they already know.
- **Constraint:** New Montreal jobs after 5pm or on weekends cannot book a callback slot — they wait until Monday.
- **Adoption risks:** they already have an estimate form and Financeit; may treat a calendar as “too consumer.” Keep it callback-window, not consumer Calendly theater. Confirm one approver (#4/#16).
- **Path:** Rung 1 Intake→Book. Discovery question that gates Rung 1: *Who approves a change to the homepage CTA — you, or a marketing vendor?*
- **Reversible next:** 20-min constraint call. No build until they answer.

## Four blanks (GTM)

**Offer sentence:** I help Greater Montreal plumbing owners get 1 intake→book callback path on the site they already have via the 2026-08-13 public read of plomberienormand.ca/en (Estimate/Contact only; weekends closed).

| Blank | Value |
|-------|--------|
| Bucket | ACQUIRE (leads → booked estimate/callback) |
| KPI | Hours-to-first-touch on a new after-hours/weekend web or phone job (1 number: clock hours from inquiry to first owner touch) |
| Baseline | TBD / HOLD — owner form/phone volume and measured first-touch times UNVERIFIED. Public hours only: Mon–Fri 7:00–17:00, Sat/Sun closed. Do not invent a live form/phone count. |
| 60-day target | 1 book/callback CTA live above fold · 1 owner alert on each intake · reply SLA tracked. Booked-call N = HOLD (no owner volume on file — UNVERIFIED). |

**usecase-to-sku:** Broken book rails → Intake→Book Install · Rung 1 · $1.5–3.5K · `private-book-install__local-pro__greater-montreal`

**Proof in drafts:** no `127.0.0.1:3007`. STL only after PR #39 public. Until then: Loom / screen-share or omit demo URL.

## Margin (Money Desk)

**PASS.** Delivery = light CTA on existing site + Typeform/Tally or native form + calendar callback windows + email/SMS owner alert + Loom. Shrink if they ask for a rebuild. Pain $ = UNVERIFIED. Do not quote job-value math.

## HITL

1. Approve **draft** in `WARM_DRAFT.md` (or deny).
2. Approve **send** only after (1). Channel: email to info@plomberienormand.ca (optional cc francoispineau@). CASL: warm, one note, no blast.
