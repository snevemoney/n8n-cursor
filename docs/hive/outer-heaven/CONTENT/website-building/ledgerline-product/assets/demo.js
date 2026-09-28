// Ledgerline demo booking — pure state. No clock, no network, no storage.
// Every value here is SAMPLE / CapEx. invent_kpi=0.

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const TIMES = ["09:00", "11:00", "14:00", "16:00"];
export const WEEK_LABEL = "Week of Mon 21 Sep · SAMPLE";
export const ROLES = ["Finance lead", "Founder / operator", "Bookkeeper", "Just looking"];
export const LENGTH = "30 min · sample";

export const EXAMPLE_BOOKED = { day: "Wed", time: "11:00", name: "Sample finance lead", role: "Finance lead" };

export function slotId(day, time) {
  return `${day}-${time.replace(":", "")}`;
}

export function createState() {
  const slots = new Map();
  for (const day of DAYS) {
    for (const time of TIMES) {
      slots.set(slotId(day, time), { day, time, status: "open" });
    }
  }
  return { slots, selected: null, role: "", status: "empty", booked: null };
}

export function emptyState() {
  return createState();
}

export function bookedState() {
  const s = createState();
  select(s, slotId(EXAMPLE_BOOKED.day, EXAMPLE_BOOKED.time));
  setRole(s, EXAMPLE_BOOKED.role);
  book(s, EXAMPLE_BOOKED.name);
  return s;
}

export function stateFromQuery(search) {
  const wanted = new URLSearchParams(search).get("state");
  if (wanted === "booked" || wanted === "example") return bookedState();
  return emptyState();
}

export function select(state, id) {
  if (state.status !== "empty") return state;
  if (!state.slots.has(id)) return state;
  state.selected = id;
  return state;
}

export function clearSelection(state) {
  if (state.status !== "empty") return state;
  state.selected = null;
  return state;
}

export function setRole(state, role) {
  if (state.status !== "empty") return state;
  state.role = ROLES.includes(role) ? role : "";
  return state;
}

export function canBook(state) {
  return state.status === "empty" && Boolean(state.selected) && Boolean(state.role);
}

// One demo per page load. Pure state change; the UI decides what to show.
export function book(state, name = "Sample lead") {
  if (!canBook(state)) return { ok: false, reason: "pick a slot and a role" };
  const slot = state.slots.get(state.selected);
  slot.status = "booked";
  state.status = "booked";
  state.booked = {
    ...slot,
    name: String(name || "").trim() || "Sample lead",
    role: state.role,
    length: LENGTH,
  };
  state.selected = null;
  return { ok: true, booked: state.booked };
}

export function describe(slot) {
  return `${slot.day} ${slot.time}`;
}

export function statusLabel(state) {
  return state.status === "booked" ? "demo booked · on the calendar" : "empty";
}

export function frictionLine(state) {
  return state.status === "booked"
    ? "Clear. Three lines read, one demo on the calendar."
    : "Feature fog: twenty-four tabs and still no idea what it does.";
}
