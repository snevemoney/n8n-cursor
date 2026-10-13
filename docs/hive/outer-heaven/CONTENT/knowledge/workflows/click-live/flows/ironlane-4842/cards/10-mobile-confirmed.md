# 10-mobile-confirmed

ACT: DevTools device toolbar 390px → /book.html?state=confirmed, then / (hard reload)
EXPECTED: Single column · stacked days · chips with time · 5 green · header wraps, nothing clipped · shell CTAs unclipped.
OBSERVED: First pass: calendar correct but header "Check book path" button clipped at 390px. Fixed: .nav wraps ≤720px, links drop to own line. Re-verified: brand left, button fully visible, About/Floor/Proof/Times beneath; 5 green chips; pill "on the calendar · 5 confirmed"; no horizontal overflow. Shell at 390px: hero H1 + both CTAs visible, header "See schedule →" unclipped.
COMPARE: match after fix
NEXT: proceed
