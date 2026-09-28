// Ironlane booking calendar — pure state. No clock, no network, no storage.
// Every value here is SAMPLE / CapEx. invent_kpi=0.

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Fixed sample week so the calendar renders the same on every load.
export const WEEK_LABEL = "Week of Mon 21 Sep · SAMPLE";

export const TIMES = ["06:00", "07:30", "12:00", "17:30", "18:30", "19:30"];

export const CLASSES = {
  "06:00": "Open floor",
  "07:30": "Strength",
  "12:00": "Intro",
  "17:30": "Conditioning",
  "18:30": "Intro",
  "19:30": "Open floor",
};

// The picture in ui-cta-full-calendar: a handful of confirmed days, not a sold-out board.
export const EXAMPLE_CONFIRMED = [
  { day: "Mon", time: "06:00", member: "Sample member" },
  { day: "Tue", time: "18:30", member: "Sample member" },
  { day: "Thu", time: "07:30", member: "Sample member" },
  { day: "Fri", time: "12:00", member: "Sample member" },
  { day: "Sat", time: "19:30", member: "Sample member" },
];

export function slotId(day, time) {
  return `${day}-${time.replace(":", "")}`;
}

export function createState(confirmed = []) {
  const slots = new Map();
  for (const day of DAYS) {
    for (const time of TIMES) {
      slots.set(slotId(day, time), {
        day,
        time,
        title: CLASSES[time],
        status: "open",
        member: null,
      });
    }
  }
  const state = { slots, selected: null, lastConfirmed: null };
  for (const c of confirmed) {
    const slot = slots.get(slotId(c.day, c.time));
    if (slot) {
      slot.status = "confirmed";
      slot.member = c.member ?? "Sample member";
    }
  }
  return state;
}

export function emptyState() {
  return createState([]);
}

export function exampleState() {
  return createState(EXAMPLE_CONFIRMED);
}

export function stateFromQuery(search) {
  const params = new URLSearchParams(search);
  const wanted = params.get("state");
  if (wanted === "confirmed" || wanted === "example") return exampleState();
  return emptyState();
}

export function confirmedCount(state) {
  let n = 0;
  for (const slot of state.slots.values()) if (slot.status === "confirmed") n += 1;
  return n;
}

export function isEmpty(state) {
  return confirmedCount(state) === 0;
}

export function calendarLabel(state) {
  return isEmpty(state) ? "empty" : "on the calendar";
}

export function select(state, id) {
  const slot = state.slots.get(id);
  if (!slot) return state;
  if (slot.status === "confirmed") return state;
  state.selected = id;
  return state;
}

export function clearSelection(state) {
  state.selected = null;
  return state;
}

// Confirm the selected slot. Pure state change; the UI decides what to show.
export function confirm(state, member = "Sample member") {
  if (!state.selected) return { ok: false, reason: "nothing selected" };
  const slot = state.slots.get(state.selected);
  if (!slot || slot.status === "confirmed") {
    return { ok: false, reason: "slot not open" };
  }
  const name = String(member || "").trim() || "Sample member";
  slot.status = "confirmed";
  slot.member = name;
  state.lastConfirmed = slot;
  state.selected = null;
  return { ok: true, slot };
}

export function describe(slot) {
  return `${slot.day} ${slot.time} · ${slot.title}`;
}
