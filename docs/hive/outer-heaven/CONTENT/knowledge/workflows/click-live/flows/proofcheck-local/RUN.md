# proofcheck-local — click-live RUN

STATUS: pass
HOST: cursor-ide-browser
TAB: glass-browser-58718507-334b-42a1-990e-c5282c335561 (already open `http://localhost:8080/`)
STARTED: 2026-08-15T20:50Z
STOPPED: 2026-08-15T20:55Z
HARD_STEP: pay — not executed. Vérifier maintenant not clicked. Connexion not clicked.

LADDER: api (8080 200) → vision (this tab)

## Steps
| n | id | action | COMPARE | NEXT | card |
|---|----|--------|---------|------|------|
| 1 | launch-app | navigate | match | proceed | cards/01-launch-app.md |
| 2 | dismiss-onboarding | tapOn | match | proceed | cards/02-dismiss-onboarding.md |
| 3 | assert-sources | assertVisible | match | proceed | cards/03-assert-sources.md |
| 4 | scroll-sources | scroll | match | proceed | cards/04-scroll-sources.md |
| 5 | tap-draft | tapOn | match | proceed | cards/05-tap-draft.md |
| 6 | assert-verify-control | assertVisible | match | proceed | cards/06-assert-verify-control.md |
| 7 | swipe-draft | swipe | match | proceed | cards/07-swipe-draft.md |
| 8 | assert-signin-idle | assertVisible | match | proceed | cards/08-assert-signin-idle.md |

## OBSERVED (per step)

### launch-app
```
ACT: lock existing localhost:8080 tab (no new tab)
EXPECTED: ProofCheck QC chrome + workspace
OBSERVED: url http://localhost:8080/ · header ProofCheck QC · tabs Sources (selected) Exigences Brouillon Rapport Version finale · FR UI · Bienvenue modal 1/4
COMPARE: match
NEXT: dismiss-onboarding
```

### dismiss-onboarding
```
ACT: click Close (e15) then Escape
EXPECTED: Welcome gone; workspace tabs visible
OBSERVED: first Close focused X but modal stayed; Escape dismissed Bienvenue. Sources upload + Aucune source visible.
COMPARE: match (retry 2)
NEXT: assert-sources
```

### assert-sources
```
ACT: assertVisible Sources
EXPECTED: Sources tab selected; upload / empty copy
OBSERVED: Sources selected. Glissez-déposez / Aucune source / PDF DOCX DOC TXT. No pay wall.
COMPARE: match
NEXT: scroll-sources
```

### scroll-sources
```
ACT: scroll down
EXPECTED: Sources still mounted
OBSERVED: at edge, no further scroll. Pane still Sources. No pay.
COMPARE: match
NEXT: tap-draft
```

### tap-draft
```
ACT: click tab Brouillon
EXPECTED: Draft active; textarea + Vérifier maintenant visible
OBSERVED: Brouillon selected. Textarea placeholder Collez le texte… · Mode strict off · Vérifier maintenant disabled · Ajoutez d'abord des sources
COMPARE: match
NEXT: assert-verify-control
```

### assert-verify-control
```
ACT: assertVisible Vérifier maintenant (do not click)
EXPECTED: control visible, not clicked, no generate
OBSERVED: button visible, disabled, not clicked.
COMPARE: match
NEXT: swipe-draft
```

### swipe-draft
```
ACT: scroll/swipe down
EXPECTED: Draft still mounted. No Stripe.
OBSERVED: at edge. Draft + verify control still there. No pay wall.
COMPARE: match
NEXT: assert-signin-idle
```

### assert-signin-idle
```
ACT: assertVisible Connexion (do not click)
EXPECTED: Sign In visible, not submitted
OBSERVED: Connexion in header. Not clicked. No auth form submit.
COMPARE: match
NEXT: stop this flow
```

## Watchdog GRADE
(other session — Forge does not fill)
