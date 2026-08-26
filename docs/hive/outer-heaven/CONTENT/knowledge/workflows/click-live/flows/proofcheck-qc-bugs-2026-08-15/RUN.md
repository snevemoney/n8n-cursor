# proofcheck-qc-bugs-2026-08-15 — click-live RUN

STATUS: fail (headed tab did not stay open in this subagent)
HOST: cursor-ide-browser
STARTED: 2026-08-15T21:17Z
HARD_STEP: pay — not executed. Vérifier maintenant not clicked. Connexion not clicked.

LADDER: api (8080 HTML) → vision (blocked)
WHY: title/OG is in the served document; Close + language need a living tab
WATCH: first Close pointer · FR|EN vs chrome language

## API (title / OG)

```
ACT: GET http://127.0.0.1:8080/
EXPECTED: lang=fr · title/og ProofCheck QC · no Lovable / lovable.dev image
OBSERVED: html lang="fr" · <title>ProofCheck QC</title> · og:title ProofCheck QC · description nursing/Québec FR · twitter:card summary · no og:image · no lovable.dev · no @Lovable
COMPARE: match
NEXT: headed Close + language (blocked this sitting)
```

## Headed (Close / language)

Cursor IDE browser created a tab then dropped it (`viewId` not found / no tab available). No Close click. No language click. No invented OBSERVED.

Watchdog GRADE: other session — Forge does not fill.
