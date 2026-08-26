# Research Packet — Spencer Boyd Fitness (one-client trial)
**Agent:** Researcher · **Date:** 2026-08-12 · **Source rule:** public web only · **No CE · No outreach**

**Prospect:** Spencer Boyd Fitness · https://spencerboydfitness.com/  
**Geo:** Halifax, NS · in-person at Move East Studios, 6130 Quinpool Rd  
**Offer surface:** 1:1 / semi-private PT · online programming · kinesiology services  

Label legend: **FACT** · **INFERENCE** · **OPINION** · **UNVERIFIED** (marketing claims)

---

## 1) Snapshot (FACT)

| Item | Evidence |
|------|----------|
| Site | Squarespace (`spencerboydfitness.com`) |
| Home | In-person coaching pitch + “Personalized Programming” email **Sign Up** (not a calendar) |
| Coaching | Offer ladders (Done For You / Done With You / 1-1 / Semi-Private / Kinesiology); CTA **“Apply for coaching”** |
| Contact | Email only: `spencerboydfitness@gmail.com` · Location Halifax |
| Social | Instagram + Facebook linked from site |
| Positioning (LinkedIn public) | Busy professionals ~30–55; kinesiology background (StFX); PT since ~2015; phone listed on LinkedIn |

---

## 2) Booking / inquiry friction (pain)

### Observed on public site (FACT)

1. **No visible self-serve calendar** on home / coaching / contact — inquiry path is email or “Apply for coaching,” not “book a time.”  
2. **Contact CTA appears broken in markup:** contact page exposes `mailto:null` alongside the real Gmail address (WebFetch of `/contact`). Prospect may click a dead mail link.  
3. **Homepage capture = email list signup** (“Sign Up” → “Thank you!”) — optimizes for newsletter, not qualified consult booking.  
4. **Capacity messaging:** “I only accept a select few clients at a time” — good scarcity; without intake automation it also means slow/manual triage while coaching.  
5. **Cart exists** (`/cart`) — commerce-capable Squarespace, but primary coaching path still application/email, not instant book.

### Likely ops sighs (INFERENCE)

| Pain | Why it fits this footprint |
|------|----------------------------|
| **Missed / delayed inquiries** | Solo PT + email inbox while on floor at Move East; no auto SMS/book link |
| **Unqualified “apply” churn** | Soft apply + FAQ without budget/schedule gates → consult time waste |
| **Broken/weak digital CTAs** | `mailto:null` + email-only contact increases drop-off |
| **Split funnel** | Newsletter signup ≠ coaching intake; tracking ROI of traffic is harder |

**Not claimed as FACT:** actual missed-call volume, close rates, or revenue — unknown publicly.

---

## 3) ROI comps — booking / intake fixes (industry; treat carefully)

These are **agency/blog benchmarks**, not Spencer’s numbers. Use for framing only.

| Claim | Source type | Label |
|-------|-------------|-------|
| Multi-step **booking funnels** convert ~**2–4×** contact forms; example bands ~15–22% vs ~4–7% visit→book | Optimized Growth gym funnel article (2026) | **UNVERIFIED** marketing / vendor |
| Show-up ~**70–85%** with reminder sequences vs ~**30–50%** on colder form leads | Same + PushPress-style gym funnel writing | **UNVERIFIED** |
| Speed-to-lead: respond in minutes strongly lifts convert odds (classic “5-minute” lore repeated in gym CRM blogs) | PushPress / PT ops blogs | **UNVERIFIED** |
| Smart intake (goals, budget, schedule) can cut consult volume while raising close rate; PT blogs cite consult→pay ~8–15% on generic forms vs much higher when prequalified | MeritsOnly PT lead-gen blog | **UNVERIFIED** marketing |
| Vendor anecdotes of “+$20k–$75k / year” from funnel fixes for solo trainers | Same class of blogs | **UNVERIFIED — do not quote as proof** |

**Sober ROI model for Money Desk (OPINION):**

Define blanks before any $ story:

1. **Baseline:** inquiries / week (email + apply + IG DMs) · reply time · % that book a consult · show-up · close  
2. **Intervention:** one path — e.g. Cal.com/Acuity link + 3-question intake + SMS confirm, or fixed “apply → qualify → book” Typeform  
3. **60-day target:** e.g. +X booked consults/month **or** −Y hours/week on chase, at same ad spend  
4. **Economics:** (extra paying clients × avg package gross margin) − tool/operator time  

Without baseline, any % from blogs is theater.

---

## 4) AI Partner wedge that fits (OPINION — ACQUIRE + CUT)

Aligned with hive demos (not features):

| Wedge | Outcome bucket | Proof to show |
|-------|----------------|---------------|
| **Intake → book** | ACQUIRE | Live booking + reminder path; cinematic landing as premium feel optional |
| **Missed-inquiry catch** | CUT | Auto SMS/email on new apply; operator approves anything client-facing |
| **Qualify before calendar** | ACQUIRE + CUT | Short form gates before Spencer’s time |

**Do not pitch:** CE, n8n estate, 17-agent complexity in first conversation. One constraint: “people interested in coaching who never get a time on the calendar.”

---

## 5) Suggested discovery questions (for operator / Lead Hunter — not sent)

1. When someone DMs or emails “interested in coaching,” what happens in the next 24h?  
2. Roughly how many inquiries / week, and how many become paying?  
3. Do you want more clients, or fewer tire-kickers for the same hours?  
4. Would a public “book a 15-min fit call” help or hurt the “select few” brand?

---

## 6) Sources

- https://spencerboydfitness.com/  
- https://spencerboydfitness.com/coaching  
- https://spencerboydfitness.com/contact  
- https://spencerboydfitness.com/about  
- LinkedIn public profile (search result summary): spencer-boyd-2419ba195  
- Industry comps (UNVERIFIED): optimizedgrowth.com gym booking funnel article; meritsonly.com PT lead-gen; pushpress.com leaky funnel; salescaptain PT missed-calls blog  

---

## 7) Handoff

→ **Money Desk:** ROI blanks + margin framing  
→ **Consultant / Product GTM:** four-blank scope if trial advances  
→ **Lead Hunter:** warm approach draft only after operator greenlight — Researcher does **not** outreach  

**Packet path:** `~/.grokbot/research-packets/spencer-boyd-fitness/PACKET.md`
