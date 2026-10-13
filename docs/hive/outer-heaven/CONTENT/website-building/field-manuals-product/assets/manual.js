// Field Manuals held-docs — pure state. No clock, no network, no storage.
// Three manuals on the desk. Pick one (it lifts into the hand), open it (contents + thumb-tabs), tick steps,
// put it back. One manual in hand at a time. Every value is SAMPLE / CapEx. invent_kpi=0.

export const SECTIONS = ["setup", "operate", "troubleshoot"];

export const MANUALS = [
  {
    id: "m1",
    title: "Intake desk",
    code: "FM-01",
    sections: {
      setup: ["Clear the counter", "Lay out the intake card", "Set the pen where the right hand lands"],
      operate: ["Greet before the form", "Ask the one question", "Write it on the card, not the screen", "Hand the card over", "Log it after they leave"],
      troubleshoot: ["Card missing → use the back of any card", "Line forming → one question only"],
    },
  },
  {
    id: "m2",
    title: "Floor open",
    code: "FM-02",
    sections: {
      setup: ["Lights front to back", "Walk the floor once", "Check the board reads today"],
      operate: ["Open the door on the minute", "First hello within ten steps", "Board updated on the hour", "Close-out walk"],
      troubleshoot: ["Board wrong → fix before the next hello", "Door late → say the time out loud"],
    },
  },
  {
    id: "m3",
    title: "Hand-off",
    code: "FM-03",
    sections: {
      setup: ["Pull the shift card", "Read the last line first"],
      operate: ["Say what is open", "Say what is stuck", "Sign the card"],
      troubleshoot: ["No card → write one now, two lines"],
    },
  },
];

export function getManual(id) {
  return MANUALS.find((m) => m.id === id) ?? null;
}

export function createState() {
  return { held: null, open: false, section: "setup", done: {} };
}

// Pick lifts a manual into the hand. Picking a different one puts the current one back first.
export function pick(state, id) {
  const m = getManual(id);
  if (!m) return { ok: false, reason: "no such manual" };
  if (state.held === id) return { ok: true, manual: m, already: true };
  putBack(state);
  state.held = id;
  return { ok: true, manual: m };
}

export function canOpen(state) {
  return !!state.held && !state.open;
}

export function open(state) {
  if (!state.held) return { ok: false, reason: "nothing in hand" };
  state.open = true;
  state.section = "setup";
  return { ok: true, manual: getManual(state.held) };
}

export function close(state) {
  state.open = false;
  return state;
}

export function putBack(state) {
  state.held = null;
  state.open = false;
  state.section = "setup";
  return state;
}

export function setSection(state, section) {
  if (state.open && SECTIONS.includes(section)) state.section = section;
  return state;
}

export function stepKey(manualId, section, index) {
  return `${manualId}:${section}:${index}`;
}

export function isDone(state, section, index) {
  return !!state.done[stepKey(state.held, section, index)];
}

export function toggleStep(state, section, index) {
  if (!state.open) return { ok: false, reason: "manual closed" };
  const m = getManual(state.held);
  if (!m || !m.sections[section] || !m.sections[section][index]) return { ok: false, reason: "no such step" };
  const key = stepKey(state.held, section, index);
  state.done[key] = !state.done[key];
  return { ok: true, done: state.done[key], progress: progress(state, section) };
}

export function progress(state, section) {
  const m = getManual(state.held);
  if (!m) return { done: 0, total: 0 };
  const total = m.sections[section]?.length ?? 0;
  let done = 0;
  for (let i = 0; i < total; i += 1) if (isDone(state, section, i)) done += 1;
  return { done, total };
}

export function allDone(state, section) {
  const p = progress(state, section);
  return p.total > 0 && p.done === p.total;
}

export function stageState(state) {
  if (!state.held) return "empty";
  return state.open ? "open" : "held";
}

export function stageLabel(state) {
  const s = stageState(state);
  if (s === "empty") return "empty · nothing in hand";
  const m = getManual(state.held);
  if (s === "held") return `held · ${m.code}`;
  const p = progress(state, "operate");
  return `open · ${m.code} · ${state.section} · operate ${p.done}/${p.total}`;
}

export function stateFromQuery(search) {
  const params = new URLSearchParams(search);
  const s = createState();
  const wanted = params.get("state");
  const id = params.get("manual") ?? "m1";
  if (wanted !== "held" && wanted !== "open") return s;
  if (!pick(s, id).ok) return s;
  if (wanted === "open") {
    open(s);
    setSection(s, params.get("section") ?? "setup");
  }
  return s;
}
