// Ashford & Vale private apply → qualify — pure state. No clock, no network, no storage.
// Every value here is SAMPLE / CapEx. invent_kpi=0. Nothing is sent anywhere.

export const STEPS = [
  { id: "about", label: "About you" },
  { id: "fit", label: "Fit" },
  { id: "review", label: "Review" },
];

export const LOOKING_FOR = [
  "Private membership",
  "Family desk",
  "Advisory retainer",
  "Not sure yet",
];

export const REFERRAL = [
  "Referred by a member",
  "Met at a private dinner",
  "Found Ashford directly",
];

export const TIMELINE = ["This quarter", "Within the year", "Exploring"];

// Deterministic reference so every load and every test reads the same code.
export const REFERENCE = "AV-SAMPLE-0001";

export const EXAMPLE_ANSWERS = {
  name: "Sample applicant",
  lookingFor: "Private membership",
  referral: "Referred by a member",
  timeline: "This quarter",
  note: "Sample note. Nothing here is sent.",
};

export function createState() {
  return {
    step: 0,
    answers: { name: "", lookingFor: "", referral: "", timeline: "", note: "" },
    status: "empty", // empty | received
    outcome: null,
    reference: null,
  };
}

export function emptyState() {
  return createState();
}

// The ?state=received picture: one private application already under review.
export function receivedState() {
  const s = createState();
  s.answers = { ...EXAMPLE_ANSWERS };
  s.step = 2;
  submit(s);
  return s;
}

export function stateFromQuery(search) {
  const wanted = new URLSearchParams(search).get("state");
  if (wanted === "received" || wanted === "example") return receivedState();
  return emptyState();
}

export function setAnswer(state, key, value) {
  if (!(key in state.answers)) return state;
  state.answers[key] = String(value ?? "");
  return state;
}

export function stepComplete(state, step = state.step) {
  const a = state.answers;
  if (step === 0) return a.name.trim().length > 0 && LOOKING_FOR.includes(a.lookingFor);
  if (step === 1) return REFERRAL.includes(a.referral) && TIMELINE.includes(a.timeline);
  if (step === 2) return stepComplete(state, 0) && stepComplete(state, 1);
  return false;
}

export function next(state) {
  if (state.status === "received") return state;
  if (state.step >= STEPS.length - 1) return state;
  if (!stepComplete(state)) return state;
  state.step += 1;
  return state;
}

export function back(state) {
  if (state.status === "received") return state;
  if (state.step > 0) state.step -= 1;
  return state;
}

// Qualify is a read of the answers, not a score. Three lanes, deterministic.
export function qualify(answers) {
  const exploring = answers.timeline === "Exploring" || answers.lookingFor === "Not sure yet";
  if (exploring) {
    return {
      tier: "not-now",
      headline: "Not now — and that is fine.",
      line: "Notes kept privately. No follow-up sequence, no public calendar, nothing sent.",
    };
  }
  if (answers.referral === "Referred by a member") {
    return {
      tier: "invite",
      headline: "Referred. A private conversation is offered.",
      line: "A partner picks the time with you directly. No public Book button, no widget.",
    };
  }
  return {
    tier: "review",
    headline: "Under private review.",
    line: "A person reads this application, not a bot. You hear back once, privately.",
  };
}

export function submit(state) {
  if (state.status === "received") return { ok: false, reason: "already received" };
  if (state.step !== STEPS.length - 1) return { ok: false, reason: "not on review step" };
  if (!stepComplete(state, 2)) return { ok: false, reason: "incomplete" };
  const outcome = qualify(state.answers);
  state.status = "received";
  state.outcome = outcome;
  state.reference = REFERENCE;
  return { ok: true, outcome, reference: REFERENCE };
}

export function statusLabel(state) {
  return state.status === "received" ? "received · private review" : "empty";
}

export function frictionLine(state) {
  return state.status === "received"
    ? "Quiet. One private application, read by a person."
    : "Loud Book widget: public slots, wrong-fit intros, no-shows.";
}

export function reset(state) {
  const fresh = createState();
  Object.assign(state, fresh);
  return state;
}
