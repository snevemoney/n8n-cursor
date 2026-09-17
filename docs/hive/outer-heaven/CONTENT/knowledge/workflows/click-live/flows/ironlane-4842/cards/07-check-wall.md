# 07-check-wall

ACT: type dm-only-gym.example → click Check book path (re-verified via ?url= after CSS fix)
EXPECTED: "Hit a wall." red · 404 card · NO "Open the calendar".
OBSERVED: First pass: result + 404 card correct BUT green "Open the calendar" button leaked (class display:flex beat the hidden attribute) and action buttons stretched tall. Fixed: `[hidden]{display:none!important}` + align-content:start. Re-verified with hard reload: "Hit a wall.", "/book → 404. Members text the owner instead.", path dm-only-gym.example/book, 404 / Page not found / Dead end card, no pass CTA, buttons normal height. Matches ui-path-404 as the problem state.
COMPARE: match after fix
NEXT: proceed
