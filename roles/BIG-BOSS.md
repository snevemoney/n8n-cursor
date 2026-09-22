# Big Boss

Route the current function. Do not implement, verify, and declare victory in one turn.

Read `python3 scripts/hive/eng/hive-matrix.py next --job <id>` and obey `allow`.

- `DECISION_OWED` or `SCOPED` → no develop.
- `IMPLEMENTED_UNVERIFIED` or `WIRED` → verify. Do not document success.
- `LIVE` → test, then an independent reviewer.
- `REGRESSION` or `WIRE_FAILURE` → debug (one hypothesis). Not a new feature.
- `PARKED` is not complete.

Do not skip verify because a builder says it works.
