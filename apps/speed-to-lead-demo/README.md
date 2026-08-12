# Speed-to-Lead Demo — ACQUIRE Proof

> **Lead to booked — while you're on the floor.**

Solo-operator demo: inquire → qualify → book → remind in under a minute wall-clock. Sells **speed-to-booked**, not "chatbot."

## Quick Start

```bash
cd apps/speed-to-lead-demo
pnpm install   # from workspace root: pnpm install
pnpm dev       # → http://localhost:3007
```

## 60-Second Click Path

1. Open http://localhost:3007
2. Fill the **Intake Form** (name, email, phone, goal=Scale leads, urgency=High)
3. Watch the lead appear on the **Operator Board** in <2s with status `new` and a running timer
4. Auto-touch fires after ~1.5s → status flips to `touched`, timer stops. Label: **SIMULATED SMS ✓**
5. Click **Book** → select a fixture slot → **Confirm Booking** → confirmation screen, status `booked`
6. Click **Simulate Reminder** → status `reminded` (simulates T-24h/T-1h confirmation send)

**Total wall-clock: <60 seconds from submit to reminded.**

## Architecture

```
app/
├── api/
│   ├── leads/          POST (create) / GET (list)
│   │   └── [id]/
│   │       ├── touch/  POST → status 'touched'
│   │       ├── book/   POST → status 'booked'
│   │       └── remind/ POST → status 'reminded'
│   └── slots/          GET  → fixture time slots
├── components/
│   ├── IntakeForm.tsx      Public intake with honeypot
│   ├── OperatorBoard.tsx   Lead list + speed timer + actions
│   └── BookingModal.tsx    Slot picker + confirmation
├── lib/
│   ├── types.ts            Lead, Slot types
│   ├── qualify.ts          Deterministic qualify (hot/warm/cold)
│   ├── store.ts            JSON file persistence (.data/leads.json)
│   └── slots.ts            Fixture slot generator
├── page.tsx                Main client page
├── layout.tsx              Root layout
└── globals.css             Tailwind base
```

## Data Persistence

Leads persist in `.data/leads.json` (gitignored). Survives page refresh and server restart during demo. Delete the file to reset.

## Qualification Logic (Deterministic)

| Phone | Goal | Result |
|-------|------|--------|
| ✓     | ✓    | 🔥 HOT — immediate priority |
| ✓     | ✗    | Warm |
| ✗     | ✓    | Warm |
| ✗     | ✗    | Cold |

AI-suggested tag (Growth, Automation, Sales, Marketing) shown when goal matches keywords. **Booking works without AI** — tag is optional display-only.

## AI-Off Path

Disable "Auto-touch" checkbox. Manually click Touch → Book → pick slot → Confirm. All features work without any AI dependency.

## GTM Blurb (ACQUIRE Bucket)

**Bucket:** ACQUIRE
**KPI:** Time-to-first-touch (target: <5s simulated), Booked rate (target: >60% of hot leads)
**Baseline (fiction, labeled):** Legacy manual flow averages 47min to first response; 12% book rate.
**60-Day Language:** "Within 60 days of activation, operators using Speed-to-Lead reduce median time-to-first-touch from 47 minutes to under 60 seconds and increase demo booked rate by 3×."

## Environment

- **Port:** 3007
- **Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **Persistence:** File-based JSON (`.data/leads.json`)
- **External deps:** None (no Twilio, Cal.com, HubSpot)

## Out of Scope

HubSpot, real SMS/Twilio, voice, n8n workflows, production deploy, real client outreach.
