# 06-tap-check-path

ACT: click header "Check book path"
EXPECTED: URL /check.html · H2 "Or your site books them." · input + chips · no result.
OBSERVED: URL http://127.0.0.1:4842/check.html. H2 present. "SITE ADDRESS" input placeholder yoursite.com, amber "Check book path", chips ironlane.example / quietfloor.example / dm-only-gym.example / textus.example. No result card. Matches ui-path-paste-check.
COMPARE: match
NEXT: proceed
