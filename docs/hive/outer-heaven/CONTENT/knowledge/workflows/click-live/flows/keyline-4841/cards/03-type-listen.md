# 03-type-listen

ACT: input#typebox present
EXPECTED: Input present. Typing does not submit.
OBSERVED: input#typebox maxlength=48. Enter preventDefault. No form action. Type UNKNOWN.
COMPARE: api-match · type UNKNOWN
NEXT: proceed
