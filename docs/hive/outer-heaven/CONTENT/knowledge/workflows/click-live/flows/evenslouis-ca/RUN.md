# evenslouis-ca — click-live RUN

STATUS: pass
HOST: cursor-ide-browser
TAB: same tab (navigated, no new tab)
STARTED: 2026-08-15T20:58Z
STOPPED: 2026-08-15T21:02Z
HARD_STEP: send — not executed. Get in touch not pressed.

LADDER: vision on https://evenslouis.ca/

## Steps
| n | id | action | COMPARE | NEXT | card |
|---|----|--------|---------|------|------|
| 1 | launch-home | launchApp | match | proceed | cards/01-launch-home.md |
| 2 | assert-home-cta | assertVisible | match | proceed | cards/02-assert-home-cta.md |
| 3 | tap-work | tapOn | match | proceed | cards/03-tap-work.md |
| 4 | scroll-cases | scroll | match | proceed | cards/04-scroll-cases.md |
| 5 | tap-case | click | match | proceed | cards/05-tap-case.md |
| 6 | swipe-case | swipe | match | proceed | cards/06-swipe-case.md |
| 7 | tap-contact | tapOn | match | proceed | cards/07-tap-contact.md |
| 8 | assert-form-not-sent | assertVisible | match | stop | cards/08-assert-form-not-sent.md |

## OBSERVED (per step)

### launch-home
```
ACT: navigate same tab to https://evenslouis.ca/
EXPECTED: H1 I build software that runs your business. + View my work
OBSERVED: url / · H1 match · Available for new projects · View my work + Start a project
COMPARE: match
NEXT: assert-home-cta
```

### assert-home-cta
```
ACT: assertVisible View my work
EXPECTED: primary CTA visible
OBSERVED: View my work → visible before any scroll
COMPARE: match
NEXT: tap-work
```

### tap-work
```
ACT: click View my work, then Enter
EXPECTED: https://evenslouis.ca/work · H1 Work · case cards
OBSERVED: click focused only. Enter → /work · H1 Work · Autoflow + ProofCheck QC cards (screenshots loaded on this route)
COMPARE: match (retry Enter)
NEXT: scroll-cases
```

### scroll-cases
```
ACT: scroll down
EXPECTED: ProofCheck QC card visible
OBSERVED: ProofCheck QC card + tags. Autoflow not tapped.
COMPARE: match
NEXT: tap-case
```

### tap-case
```
ACT: click ProofCheck QC, then Enter
EXPECTED: /work/proof-qc-assist · case · audit CTA
OBSERVED: click focused. Enter → https://evenslouis.ca/work/proof-qc-assist · H1 ProofCheck QC · Request audit
COMPARE: match (retry Enter)
NEXT: swipe-case
```

### swipe-case
```
ACT: scroll down
EXPECTED: case mounted. Audit reachable. No Stripe.
OBSERVED: Screenshots section. Request a workflow audit still in tree. No Stripe.
COMPARE: match
NEXT: tap-contact
```

### tap-contact
```
ACT: click Request a workflow audit, then Enter
EXPECTED: /#contact · form visible · Get in touch not clicked
OBSERVED: click focused. Enter → https://evenslouis.ca/#contact · Ready to build something? · Name/Email/Company/Website/message · Get in touch disabled
COMPARE: match (retry Enter)
NEXT: assert-form-not-sent
```

### assert-form-not-sent
```
ACT: assertVisible Get in touch — do not press
EXPECTED: fields visible. Button not pressed. No send.
OBSERVED: Get in touch visible, disabled, not pressed. No send.
COMPARE: match
NEXT: stop
```

## Watchdog GRADE
(other session — Forge does not fill)
