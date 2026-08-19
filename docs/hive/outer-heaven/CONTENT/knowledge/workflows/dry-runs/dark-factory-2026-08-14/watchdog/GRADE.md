# Watchdog GRADE — dark-factory-2026-08-14

**Written after** the wrap existed. Not filled while the HTML was authored.  
**Builder:** Forge  
**Verifier:** Watchdog  
**Subject:** `docs/hive/outer-heaven/CONTENT/creative/seedance-site-2026-08-14/index.html`  
**Exam:** `HOLD-OUTS.md` (this desk only)

```
BUILDER: Forge
VERIFIER: Watchdog
HYPOTHESIS: the wrap meets the five hidden hold-outs; CTA path is not a silent no-op
LABELED: HOLD-OUTS.md + HTTP GET http://127.0.0.1:8765/ → 200
MISS: headed fold geometry unobserved (subagent browser tab would not hold). Not a page miss.
GRADE: pass
```

Forge did not fill this file.

## Per hold-out

| id | result | evidence |
|----|--------|----------|
| H-CTA-FOLD | **pass** | Source: first `Start a project` sits in `.hero` before `#plate`. Hero is `min-height: 72vh`, not footer-only. HTTP 200. Two CTAs (hero + after proof). Headed `scrollY=0` screenshot: none — tab would not persist. Do not invent a click. |
| H-REDUCED-MOTION | **pass** | Script returns when `prefers-reduced-motion: reduce`. CSS hides canvas, keeps `.poster` (`stills/01-reference-merged.png`). |
| H-ONE-PLATE | **pass** | Frames are the existing AE proof pack (02→03→04→05→01), one assemble. Page does not claim a billed Seedance generate. `SEEDANCE-NEXT.md` names later ≤30s 720p continuous plate. |
| H-CTA-COLOR | **pass** | `--cta: #ff2e00` is used only on `.cta`. Body, nav, refs, captions use ink/mute. |
| H-AWARD-REFS | **pass** | Visible header copy: `Refs: Awwwards · igloo.ink · Hubtown`. Not comments-only. |

## HTTP observe (not a headed click)

```
ACT: GET http://127.0.0.1:8765/
EXPECTED: 200 HTML; CTA; named refs; reduced-motion poster; no hold-out IDs in markup
OBSERVED: 200 · 8147 bytes · CTA×2 · #ff2e00 · Awwwards/igloo/Hubtown · prefers-reduced-motion · poster 01 · hold-out leak false
COMPARE: match
NEXT: Evens may open the local preview. Deploy stays him.
```

## Deploy

Named strategy: local folder preview now. Blue-green / domain flip = Evens. Merge ≠ ship.

## Fix-first

No open misses on the five hold-outs. Do not restamp. Do not billed-generate to “complete” the plate.
