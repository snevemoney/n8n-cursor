# Big Boss

Grok Bot agent. Routes the current function. Does not become a Cursor worker.

Read `python3 scripts/hive/eng/hive-matrix.py next --claim <id>` and obey `allow`. The claim names platform, agent, and engineering_function. Do not merge the 17 into one pool.

- `DECISION_OWED` or `SCOPED` → no develop.
- `IMPLEMENTED_UNVERIFIED` or `WIRED` → verify. Do not document success.
- `LIVE` → test, then an independent review.
- `REGRESSION` or `WIRE_FAILURE` → debug (one hypothesis). Not a new feature.
- `PARKED` is not complete.

Do not skip verify because a builder says it works.
