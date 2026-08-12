# SMOKE.md — Speed-to-Lead Demo Forge Checklist

## Pre-flight

- [ ] `pnpm install` completes without errors
- [ ] `pnpm build` exits 0
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm dev` starts on port 3007

## M1: Intake

- [ ] Intake form renders with all fields (name, email, phone, goal, urgency, source)
- [ ] Honeypot field is hidden from view
- [ ] Submit with name+email only → lead created as `warm` or `cold`
- [ ] Submit with name+email+phone+goal → lead created as `hot`
- [ ] Lead appears on Operator Board within 2 seconds
- [ ] Speed timer starts counting on `new` leads
- [ ] Auto-touch fires within ~1.5s → status `touched`, timer stops
- [ ] "SIMULATED SMS ✓" label visible after touch
- [ ] Manual touch button works when auto-touch is disabled

## M2: Book

- [ ] Click "Book" on a `touched` lead → booking modal opens
- [ ] Fixture slots display (some available, some unavailable)
- [ ] Unavailable slots are disabled / grayed out
- [ ] Selecting a slot highlights it
- [ ] "Confirm Booking" sets status to `booked`
- [ ] Confirmation screen shows with slot datetime
- [ ] AI-suggested tag shown when applicable (optional, non-blocking)
- [ ] Booking works with auto-touch OFF (AI-off path)

## M3: Remind

- [ ] "Simulate Reminder" button appears for `booked` leads
- [ ] Clicking it sets status to `reminded`
- [ ] Board reflects `reminded` status

## Data

- [ ] `.data/leads.json` created on first submission
- [ ] Data survives page refresh
- [ ] Deleting `.data/leads.json` resets state cleanly

## Docs & Config

- [ ] README.md documents http://localhost:3007
- [ ] README.md includes 60-second click path
- [ ] README.md includes GTM blurb (ACQUIRE bucket)
- [ ] .env.example present (no real secrets)
- [ ] .gitignore excludes `.data/`

## Security

- [ ] No hardcoded secrets
- [ ] No real API keys
- [ ] Honeypot rejects bot submissions silently
