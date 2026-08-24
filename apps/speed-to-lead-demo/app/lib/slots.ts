import { Slot } from './types';

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function formatSlotLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getFixtureSlots(): Slot[] {
  const now = new Date();
  const intervals = [0, 1.5, 3, 5, 7, 24, 25.5, 27];

  // Compute at call time so serverless module reuse cannot freeze yesterday's window.
  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  start.setHours(9, 0, 0, 0);

  while (addHours(start, intervals[0]).getTime() <= now.getTime()) {
    start.setDate(start.getDate() + 1);
  }

  const slots: Slot[] = [];
  for (let i = 0; i < intervals.length; i++) {
    const dt = addHours(start, intervals[i]);
    if (dt.getTime() <= now.getTime()) {
      continue;
    }
    slots.push({
      id: `slot-${i + 1}`,
      datetime: dt.toISOString(),
      label: formatSlotLabel(dt),
      available: i !== 2 && i !== 5,
    });
  }

  return slots;
}
