# 04-tap-confirm

ACT: type "Sample member" → click Confirm booking
EXPECTED: Toast "Confirmed · on the calendar · Tue 18:30 · Intro" · slot green ✓ Sample member · pill "on the calendar · 1 confirmed" · Tue header green · Inbox muted.
OBSERVED: Toast top-right exactly "Confirmed · on the calendar · Tue 18:30 · Intro". Tue 18:30 slot green with "✓ Sample member". Pill flipped to "on the calendar · 1 confirmed". Tue header green. Inbox message struck-through, line "Quiet. Bookings land on the calendar — not in your DMs." Matches ui-confirmed-toast.
COMPARE: match
NEXT: proceed
