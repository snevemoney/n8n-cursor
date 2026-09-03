# 01-launch-home

ACT: curl + headed GET http://127.0.0.1:4011/
EXPECTED: H1 exactly "Hive OS — walkthrough" · lead "record, not an offer"
OBSERVED: HTTP 200 · 4834 bytes · title + H1 "Hive OS — walkthrough" · lead "This page is a record, not an offer. Building mode." · noindex present. Favicon 404 only.
COMPARE: match
NEXT: proceed
