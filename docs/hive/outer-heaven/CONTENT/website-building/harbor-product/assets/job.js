// Harbor & Co. job request → calendar visit — pure state. No clock, no network, no storage.
// Every value here is SAMPLE / CapEx. invent_kpi=0. Nothing is dialled or sent.

export const SERVICES = [
  "Gutter & roofline",
  "Deck & fence repair",
  "Small plumbing",
  "Door & window fit",
  "Something else",
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const WINDOWS = [
  { id: "am", label: "AM", hours: "8–12" },
  { id: "pm", label: "PM", hours: "12–4" },
];
export const WEEK_LABEL = "Week of Mon 21 Sep · SAMPLE";

export const STEPS = [
  { id: "job", label: "The job" },
  { id: "visit", label: "Pick a visit" },
];

export const EXAMPLE_JOB = {
  service: "Gutter & roofline",
  address: "12 Sample Street",
  note: "Back gutter overflowing at the corner. Sample.",
  window: "Tue-am",
  name: "Sample homeowner",
};

export function windowId(day, w) {
  return `${day}-${w}`;
}

export function parseWindow(id) {
  const [day, w] = String(id).split("-");
  if (!DAYS.includes(day)) return null;
  const win = WINDOWS.find((x) => x.id === w);
  if (!win) return null;
  return { day, window: win };
}

export function createState() {
  return {
    step: 0,
    job: { service: "", address: "", note: "" },
    selected: null,
    status: "empty", // empty | booked
    visit: null,
  };
}

export function emptyState() {
  return createState();
}

export function bookedState() {
  const s = createState();
  setJob(s, "service", EXAMPLE_JOB.service);
  setJob(s, "address", EXAMPLE_JOB.address);
  setJob(s, "note", EXAMPLE_JOB.note);
  next(s);
  selectWindow(s, EXAMPLE_JOB.window);
  book(s, EXAMPLE_JOB.name);
  return s;
}

export function stateFromQuery(search) {
  const params = new URLSearchParams(search);
  const wanted = params.get("state");
  if (wanted === "booked" || wanted === "example") return bookedState();
  const s = emptyState();
  const service = params.get("service");
  if (service) setJob(s, "service", service);
  return s;
}

export function setJob(state, key, value) {
  if (state.status !== "empty") return state;
  if (!(key in state.job)) return state;
  const v = String(value ?? "");
  state.job[key] = key === "service" ? (SERVICES.includes(v) ? v : "") : v;
  return state;
}

export function jobComplete(state) {
  return SERVICES.includes(state.job.service) && state.job.address.trim().length > 0;
}

export function next(state) {
  if (state.status !== "empty") return state;
  if (state.step === 0 && jobComplete(state)) state.step = 1;
  return state;
}

export function back(state) {
  if (state.status !== "empty") return state;
  if (state.step > 0) state.step -= 1;
  return state;
}

export function selectWindow(state, id) {
  if (state.status !== "empty" || state.step !== 1) return state;
  if (!parseWindow(id)) return state;
  state.selected = id;
  return state;
}

export function canBook(state) {
  return state.status === "empty" && state.step === 1 && jobComplete(state) && Boolean(state.selected);
}

// The visit lands on the calendar with the job attached. Pure state change.
export function book(state, name = "Sample homeowner") {
  if (!canBook(state)) return { ok: false, reason: "finish the job and pick a window" };
  const w = parseWindow(state.selected);
  state.status = "booked";
  state.visit = {
    id: state.selected,
    day: w.day,
    window: w.window,
    job: { ...state.job },
    name: String(name || "").trim() || "Sample homeowner",
  };
  state.selected = null;
  return { ok: true, visit: state.visit };
}

export function describe(visit) {
  return `${visit.day} ${visit.window.label} · ${visit.window.hours}`;
}

export function statusLabel(state) {
  if (state.status === "booked") return "visit booked · on the calendar";
  return state.step === 0 ? "empty · describe the job" : "empty · pick a visit";
}

export function frictionLine(state) {
  return state.status === "booked"
    ? "Quiet. Visit is on the calendar with the job attached — nobody dials."
    : "Phone tag: three calls to describe one gutter.";
}
