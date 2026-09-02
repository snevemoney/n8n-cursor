# 06-tap-reserve

ACT: href=#reserve hash only
EXPECTED: #reserve. No charge. publish not executed.
OBSERVED: id=reserve + Reserve one hash. No Stripe. hard publish not executed.
COMPARE: api-match · hard-step held
NEXT: stop — publish HITL
