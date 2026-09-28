# Ironlane product preview — booking path behind the amber shell

SAMPLE. CapEx / preview only. Live `/` stays **HOLD**. Not a live gym. No send, no pay, no outbound. invent_kpi=0.

Why this exists: the Ironlane v4 launch video sells a **working book path** (DM interest vs empty calendar → Book tap → paste-URL check → confirmed on the calendar). The public `/work/ironlane-studio` case page only shows a landing screenshot, and nothing behind “See schedule” / “Book a session” resolves. This folder is the product that makes the video true, so Creative Studio can capture real plates. Brief: `forge-handoff-ironlane-product-match-20260917/FORGE_BRIEF.md` (packet, not in repo). Videos and Remotion comps were **not** touched.

```bash
cd docs/hive/outer-heaven/CONTENT/website-building/ironlane-product
bash serve.sh        # 127.0.0.1:4842
npm test             # node --test, no install
```

| URL | What it proves |
|-----|----------------|
| `/` | Amber Ironlane marketing shell (nav, hero “See the floor. Then claim an intro.”). Every schedule / book CTA points at `book.html`. |
| `/book.html` | Booking calendar. Deterministic **empty** state on load. Pick slot → Confirm → slot turns green, header flips to “on the calendar”, toast “Confirmed · on the calendar”. Inbox card mutes once anything is booked. |
| `/book.html?state=confirmed` | Example week already on the calendar (the `ui-cta-full-calendar` picture). |
| `/check.html` | Paste-URL door check. Local registry only (`assets/door-check.js`). `ironlane.example` → **Path works**. `dm-only-gym.example` → **Hit a wall** + 404 card. Real hosts → “Not checked” (never fetched). |
| `/check.html?url=…` | Lands on a deterministic result for click-live. |

## Files

- `index.html` shell · `book.html` calendar · `check.html` door check
- `assets/booking.js` pure calendar state (no clock, no storage) · `assets/booking-ui.js` DOM
- `assets/door-check.js` pure validator + example registry · `assets/door-check-ui.js` DOM
- `assets/ironlane.css` amber shell + dark product chrome, mobile ≤720px stacks days
- `tests/*.test.mjs` — state machine, validator, and page/link checks (“no local href points at a missing file”)

## Verification

Click-live flow: `docs/hive/outer-heaven/CONTENT/knowledge/workflows/click-live/flows/ironlane-4842.yaml` (RUN + cards + GRADE). Watchdog fills GRADE. Forge does not self-PASS.

## Not here

- The real `/work/ironlane-studio` case page lives in `client-engine-1` (operator Mac), not this repo. Wiring the case page CTA to this preview is a separate, HITL step.
- Payments, login, real members, real schedule data, deploy.
