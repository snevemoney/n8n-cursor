// Northline Clinic private book + form SLA — pure state. No clock, no network, no storage.
// Every value here is SAMPLE / CapEx. invent_kpi=0. No patient data leaves this page.

export const VISIT_TYPES = ["New patient consult", "Follow-up", "Results review"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const TIMES = ["08:30", "10:00", "13:30", "15:00"];
export const WEEK_LABEL = "Week of Mon 21 Sep · SAMPLE";

// The SLA is a promise the clinic makes on the form, not a measured KPI. It is labelled sample.
export const SLA = {
  label: "1 business day · sample",
  stages: [
    { id: "received", label: "Form received", line: "Your form is in. Nobody else can see it." },
    { id: "review", label: "In clinical review", line: "A clinician reads the form inside the SLA window." },
    { id: "confirmed", label: "Slot confirmed", line: "Private slot held on the calendar. One quiet confirmation." },
  ],
};

export const EXAMPLE = {
  visitType: "New patient consult",
  slot: "Wed-1000",
  name: "Sample patient",
  reason: "Sample reason. Nothing here is sent.",
  consent: true,
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
    visitType: "",
    selected: null,
    form: { name: "", reason: "", consent: false },
    status: "empty", // empty | received | review | confirmed
    stage: -1,
    booking: null,
  };
}

export function emptyState() {
  return createState();
}

export function receivedState() {
  const s = createState();
  setVisitType(s, EXAMPLE.visitType);
  select(s, EXAMPLE.slot);
  setForm(s, "name", EXAMPLE.name);
  setForm(s, "reason", EXAMPLE.reason);
  setForm(s, "consent", EXAMPLE.consent);
  submit(s);
  return s;
}

export function confirmedState() {
  const s = receivedState();
  advance(s);
  advance(s);
  return s;
}

export function stateFromQuery(search) {
  const wanted = new URLSearchParams(search).get("state");
  if (wanted === "confirmed" || wanted === "example") return confirmedState();
  if (wanted === "received") return receivedState();
  if (wanted === "review") {
    const s = receivedState();
    advance(s);
    return s;
  }
  return emptyState();
}

export function setVisitType(state, type) {
  if (state.status !== "empty") return state;
  state.visitType = VISIT_TYPES.includes(type) ? type : "";
  return state;
}

export function select(state, id) {
  if (state.status !== "empty") return state;
  if (!parseSlot(id)) return state;
  state.selected = id;
  return state;
}

export function setForm(state, key, value) {
  if (state.status !== "empty") return state;
  if (!(key in state.form)) return state;
  state.form[key] = key === "consent" ? Boolean(value) : String(value ?? "");
  return state;
}

export function canSubmit(state) {
  return (
    state.status === "empty" &&
    Boolean(state.visitType) &&
    Boolean(state.selected) &&
    state.form.name.trim().length > 0 &&
    state.form.consent === true
  );
}

// Private book: the form and the slot request land together. Stage 0 = received.
export function submit(state) {
  if (!canSubmit(state)) return { ok: false, reason: "visit type, slot, name, and consent are required" };
  const slot = parseSlot(state.selected);
  state.status = "received";
  state.stage = 0;
  state.booking = { id: state.selected, ...slot, visitType: state.visitType, name: state.form.name.trim() };
  return { ok: true, booking: state.booking, stage: SLA.stages[0] };
}

// Clinic side. Moves the SLA track one stage. received → review → confirmed.
export function advance(state) {
  if (state.status === "empty" || state.status === "confirmed") return { ok: false, reason: "nothing to advance" };
  state.stage += 1;
  state.status = SLA.stages[state.stage].id;
  return { ok: true, stage: SLA.stages[state.stage] };
}

export function slotStatus(state, id) {
  if (state.booking?.id !== id) return "open";
  return state.status === "confirmed" ? "confirmed" : "requested";
}

export function describe(slot) {
  return `${slot.day} ${slot.time}`;
}

export function statusLabel(state) {
  if (state.status === "empty") return "empty · private";
  if (state.status === "confirmed") return "slot confirmed · private";
  return `${SLA.stages[state.stage].label.toLowerCase()} · SLA ${SLA.label}`;
}

export function frictionLine(state) {
  return state.status === "empty"
    ? "Waitlist chaos: “you are number 47, call back at 8am”."
    : "Private. One form, one SLA clock (sample), one slot. No queue number.";
}
