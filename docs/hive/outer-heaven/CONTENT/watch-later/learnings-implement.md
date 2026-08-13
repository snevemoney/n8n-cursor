# Watch Later learnings → hive

**Date:** 2026-08-13  
**Source:** Cursor browser preview `ytd-item-section-renderer` (Snevemoney WL, 1802 claimed)  
**This pass:** 4 newest videos only

## Implemented

1. Corrected the signed-out miss: **your preview is logged in**; agent Chrome/Playwright are not that tab.
2. First-screen ledger (4 rows) with oembed-verified IDs.
3. Hive mapping: Outer Heaven **is** the Karpathy LLM-wiki; do not clone Obsidian from Nate Herk.
4. Quarantine “automate 99% of your life” and Dream Labs community CTAs.

## Still blocked

Full 1802-row dump. The selected section is 13004px tall and already has more rows than the truncated `visible_text`. Next scrape must run **inside this preview** (scroll + collect `a[href*="watch?v="]`), not in Playwright `about:blank`.

## Don'ts

- Don't tell the operator they are signed out when this preview shows À regarder plus tard / Snevemoney / 1802.
- Don't report 4/4 coverage when the UI says 1802.
