---
name: Hardening 20-point audit
description: >-
  Use when a shipped repo needs a hardening pass. Run the fixed 20-point
  checklist in order and list every finding with file and line, or none found.
---
Run the 20 checks in order. For each check search the repo, list every finding with file and line, and either apply an allowed fix or propose it. Write none found if clean. Never skip a check. Ask repository, branch, and PR vs diff first. Dry run means report only. Ask before sweeping multi-file changes.

Checks: 1 duplicate utilities 2 secrets in config 3 functions over 400 lines 4 components over 200 lines 5 dead code 6 silent/empty catch 7 UI API calls missing loading/error 8 DB queries in route handlers 9 sync I/O in request handlers 10 list endpoints without pagination 11 inconsistent API shapes 12 floats for money 13 dates as plain strings not ISO 8601 14 external calls without retry/backoff 15 stale comments 16 unvalidated input 17 API routes missing auth 18 missing indexes 19 N+1 queries 20 SDKs initialized in more than one place.

Skip node_modules lockfiles build output. Secrets: file line kind only. End with a table of all 20.
