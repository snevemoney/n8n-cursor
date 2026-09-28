# 02-tap-see-schedule

ACT: click hero "See schedule →"
EXPECTED: URL /book.html · not 404 · H2 "Get them on the calendar." · pill "empty" · Confirm disabled.
OBSERVED: URL http://127.0.0.1:4842/book.html (200). H2 present. Calendar card "CALENDAR · WEEK OF MON 21 SEP · SAMPLE", pill "empty". 7×6 grid all dark/open. "Your slot" = "Pick a slot on the calendar.", Confirm booking disabled. Inbox card "can I book Tue?" + "Interest in the DMs. Empty on the calendar." The ui-path-404 dead end does not occur.
COMPARE: match
NEXT: proceed
