# Approval: safari_verify
- by: Consultant (delegated by Evens)
- at: 2026-10-13T09:43:13-0400
- words: Evens 2:01 AM ET Oct 13 delegated check approval; 8:18 AM ET 'Fix Jarvis until all 30 are done.' Consultant approved the safari_verify drafts (scorecard cap 5).
- checks:
  1. Opening example.com counts as verified when Safari lands on https://example.com/ (trailing slash or www. differences are the same page), and the reply names the page title.
  2. Jarvis keeps reading the tab for a few seconds while the page loads, and still says "not verified" if Safari never reaches the page.
  3. A different host or path is never counted as the requested page.
  4. safari_open uses same_page for its verification, and the deterministic "open <url>" route still reaches safari_see.
  5. One URL-match rule: same_page is defined once.
  6. Everything that passed before still passes: the jev router, preflight, pipeline, online and see tests have no new failures (the 6 failures already on main in this sparse tree are the only ones allowed).
  7. The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
  8. Every other locked feature still passes its own checks, with no exclusions (shared suite, eval and cross-feature checks run once).
