// Atelier Cohort — request a seat / cohort waitlist. Pure state.
// No clock, no network, no storage. Every value is SAMPLE / CapEx. invent_kpi=0.
// This is a seat request, not a funnel opt-in: no email drip, no lead magnet.

export const SEATS_PER_COHORT = 12;

export const COHORTS = [
  {
    id: "autumn",
    name: "Autumn cohort",
    when: "Starts Oct · 6 weeks · SAMPLE",
    taken: [1, 2, 3, 5, 6, 8, 9, 10, 11],
    waitlist: [],
  },
  {
    id: "winter",
    name: "Winter cohort",
    when: "Starts Jan · 6 weeks · SAMPLE",
    taken: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    waitlist: ["Sample maker A", "Sample maker B"],
  },
];

export const EXAMPLE_HELD = { cohortId: "autumn", seat: 4, name: "Sample maker" };
export const EXAMPLE_WAITLISTED = { cohortId: "winter", name: "Sample maker" };

export function cohort(id) {
  return COHORTS.find((c) => c.id === id) ?? null;
}

export function createState() {
  return {
    cohortId: COHORTS[0].id,
    selectedSeat: null,
    name: "",
    status: "empty", // empty | held | waitlisted
    result: null,
  };
}

export function emptyState() {
  return createState();
}

export function heldState() {
  const s = createState();
  selectCohort(s, EXAMPLE_HELD.cohortId);
  selectSeat(s, EXAMPLE_HELD.seat);
  requestSeat(s, EXAMPLE_HELD.name);
  return s;
}

export function waitlistedState() {
  const s = createState();
  selectCohort(s, EXAMPLE_WAITLISTED.cohortId);
  requestSeat(s, EXAMPLE_WAITLISTED.name);
  return s;
}

export function stateFromQuery(search) {
  const params = new URLSearchParams(search);
  const wanted = params.get("state");
  if (wanted === "held" || wanted === "example") return heldState();
  if (wanted === "waitlisted") return waitlistedState();
  const s = emptyState();
  const c = params.get("cohort");
  if (c) selectCohort(s, c);
  return s;
}

export function selectCohort(state, id) {
  if (state.status !== "empty") return state;
  if (!cohort(id)) return state;
  state.cohortId = id;
  state.selectedSeat = null;
  return state;
}

export function isFull(c) {
  return c.taken.length >= SEATS_PER_COHORT;
}

export function openSeats(c) {
  const open = [];
  for (let n = 1; n <= SEATS_PER_COHORT; n += 1) if (!c.taken.includes(n)) open.push(n);
  return open;
}

export function seatStatus(state, n) {
  const c = cohort(state.cohortId);
  if (state.result?.kind === "held" && state.result.seat === n) return "held";
  if (c.taken.includes(n)) return "taken";
  if (state.selectedSeat === n) return "selected";
  return "open";
}

export function selectSeat(state, n) {
  if (state.status !== "empty") return state;
  const c = cohort(state.cohortId);
  if (!Number.isInteger(n) || n < 1 || n > SEATS_PER_COHORT) return state;
  if (c.taken.includes(n)) return state;
  state.selectedSeat = n;
  return state;
}

export function canRequest(state) {
  if (state.status !== "empty") return false;
  const c = cohort(state.cohortId);
  if (isFull(c)) return true; // full cohort → waitlist request needs no seat
  return state.selectedSeat !== null;
}

// One request. Open cohort → the seat is held. Full cohort → a numbered waitlist place.
export function requestSeat(state, name = "Sample maker") {
  if (!canRequest(state)) return { ok: false, reason: "pick an open seat first" };
  const c = cohort(state.cohortId);
  const who = String(name || "").trim() || "Sample maker";
  state.name = who;
  if (isFull(c)) {
    const position = c.waitlist.length + 1;
    state.status = "waitlisted";
    state.result = { kind: "waitlisted", cohortId: c.id, position, name: who };
  } else {
    state.status = "held";
    state.result = { kind: "held", cohortId: c.id, seat: state.selectedSeat, name: who };
    state.selectedSeat = null;
  }
  return { ok: true, result: state.result };
}

export function statusLabel(state) {
  if (state.status === "held") return `seat ${state.result.seat} held`;
  if (state.status === "waitlisted") return `waitlist · place ${state.result.position}`;
  const c = cohort(state.cohortId);
  return isFull(c) ? "cohort full · waitlist open" : `${openSeats(c).length} seats open`;
}

export function outcomeCopy(state) {
  if (state.status === "held") {
    const c = cohort(state.cohortId);
    return {
      headline: `Seat ${state.result.seat} held · ${c.name}`,
      detail: `Held for ${state.result.name}. One reply from the atelier confirms it. No drip, no countdown, nothing sent from this page.`,
    };
  }
  if (state.status === "waitlisted") {
    const c = cohort(state.cohortId);
    return {
      headline: `Waitlist · place ${state.result.position} · ${c.name}`,
      detail: `${state.result.name} is on the list behind ${c.waitlist.length} sample maker(s). If a seat opens you hear once, privately.`,
    };
  }
  return null;
}

export function frictionLine(state) {
  return state.status === "empty"
    ? "Funnel spam: seven-email drip, fake countdown, “last chance” — for a class with twelve chairs."
    : "No drip. One seat request, one reply.";
}
