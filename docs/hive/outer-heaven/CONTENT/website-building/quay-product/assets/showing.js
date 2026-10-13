// Quay Team showing request → agent approve → calendar — pure state.
// No clock, no network, no storage. Every value is SAMPLE / CapEx. invent_kpi=0.

export const LISTINGS = [
  { id: "quay-12", title: "12 Quay Street", meta: "2 bed · waterfront · sample price" },
  { id: "harbourview-4", title: "4 Harbourview Lane", meta: "3 bed · terrace · sample price" },
  { id: "mill-lofts-7", title: "Mill Lofts · Unit 7", meta: "1 bed · loft · sample price" },
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const TIMES = ["10:00", "12:30", "15:00", "17:30"];
export const WEEK_LABEL = "Week of Mon 21 Sep · SAMPLE";
export const MAX_WINDOWS = 2;

export const EXAMPLE_REQUEST = {
  listingId: "quay-12",
  windows: ["Tue-1230", "Thu-1500"],
  name: "Sample buyer",
};

export function slotId(day, time) {
  return `${day}-${time.replace(":", "")}`;
}

export function parseSlot(id) {
  const [day, hhmm] = String(id).split("-");
  if (!DAYS.includes(day) || !/^\d{4}$/.test(hhmm ?? "")) return null;
  const time = `${hhmm.slice(0, 2)}:${hhmm.slice(2)}`;
  if (!TIMES.includes(time)) return null;
  return { day, time };
}

export function createState() {
  return {
    listingId: null,
    windows: [],
    name: "",
    status: "empty", // empty | requested | approved
    approved: null,
  };
}

export function emptyState() {
  return createState();
}

export function requestedState() {
  const s = createState();
  selectListing(s, EXAMPLE_REQUEST.listingId);
  for (const w of EXAMPLE_REQUEST.windows) toggleWindow(s, w);
  request(s, EXAMPLE_REQUEST.name);
  return s;
}

export function approvedState() {
  const s = requestedState();
  approve(s);
  return s;
}

export function stateFromQuery(search) {
  const params = new URLSearchParams(search);
  const wanted = params.get("state");
  let s;
  if (wanted === "approved" || wanted === "example") s = approvedState();
  else if (wanted === "requested") s = requestedState();
  else s = emptyState();
  const listing = params.get("listing");
  if (s.status === "empty" && listing) selectListing(s, listing);
  return s;
}

export function listing(state) {
  return LISTINGS.find((l) => l.id === state.listingId) ?? null;
}

export function selectListing(state, id) {
  if (state.status !== "empty") return state;
  if (!LISTINGS.some((l) => l.id === id)) return state;
  state.listingId = id;
  return state;
}

// Buyers offer up to two windows; the agent approves one. Toggle on/off.
export function toggleWindow(state, id) {
  if (state.status !== "empty") return state;
  if (!parseSlot(id)) return state;
  const i = state.windows.indexOf(id);
  if (i >= 0) {
    state.windows.splice(i, 1);
    return state;
  }
  if (state.windows.length >= MAX_WINDOWS) return state;
  state.windows.push(id);
  return state;
}

export function canRequest(state) {
  return state.status === "empty" && Boolean(state.listingId) && state.windows.length >= 1;
}

export function request(state, name = "Sample buyer") {
  if (!canRequest(state)) return { ok: false, reason: "pick a listing and at least one window" };
  state.name = String(name || "").trim() || "Sample buyer";
  state.status = "requested";
  return { ok: true, windows: [...state.windows] };
}

// Agent side. Approves the given window, or the first offered one.
export function approve(state, id = state.windows[0]) {
  if (state.status !== "requested") return { ok: false, reason: "nothing to approve" };
  if (!state.windows.includes(id)) return { ok: false, reason: "window not offered" };
  const slot = parseSlot(id);
  state.status = "approved";
  state.approved = { id, ...slot, listing: listing(state), name: state.name };
  return { ok: true, approved: state.approved };
}

export function slotStatus(state, id) {
  if (state.approved?.id === id) return "approved";
  if (state.windows.includes(id)) return state.status === "empty" ? "selected" : "requested";
  return "open";
}

export function statusLabel(state) {
  if (state.status === "approved") return "approved · on the calendar";
  if (state.status === "requested") return "requested · awaiting agent approval";
  return "no showing requested";
}

export function describe(slot) {
  return `${slot.day} ${slot.time}`;
}

export function frictionLine(state) {
  if (state.status === "approved") return "Quiet. Showing is on the calendar — no call-backs.";
  if (state.status === "requested") return "One request, two windows. The agent taps approve; nobody dials.";
  return "Phone tag: three missed calls to book one showing.";
}
