import { Slot } from './types';

const BASE_DATE = new Date();
BASE_DATE.setDate(BASE_DATE.getDate() + 1);
BASE_DATE.setHours(9, 0, 0, 0);

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
  const slots: Slot[] = [];
  const intervals = [0, 1.5, 3, 5, 7, 24, 25.5, 27];

  for (let i = 0; i < intervals.length; i++) {
    const dt = addHours(BASE_DATE, intervals[i]);
    slots.push({
      id: `slot-${i + 1}`,
      datetime: dt.toISOString(),
      label: formatSlotLabel(dt),
      available: i !== 2 && i !== 5,
    });
  }

  return slots;
}
