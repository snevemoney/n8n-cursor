// Outer Heaven factory line — pure state. No clock, no network, no storage.
// Six stations. The line completes at HITL hold. Ship is a locked station: merge ≠ ship.
// Every artifact is SAMPLE / CapEx. The sample GRADE stamp is labelled sample and is not this slice's grade.
// invent_kpi=0.

export const STATIONS = [
  {
    id: "spec",
    name: "Spec",
    who: "Evens",
    artifact: "spec.md",
    lines: ["Slice: booking path behind the shell", "Locks: CapEx · no send · no pay", "Done when: door works, states visible"],
  },
  {
    id: "holdouts",
    name: "Hold-outs",
    who: "Watchdog",
    artifact: "holdouts.json (sealed)",
    lines: ["3 hidden checks written before build", "Builder does not see them", "Revealed at Grade"],
  },
  {
    id: "build",
    name: "Build",
    who: "Forge",
    artifact: "diff + tests",
    lines: ["3 pages · 5 assets · 3 test files", "node --test: 25 pass / 0 fail (sample run)", "No deploy from this bench"],
  },
  {
    id: "grade",
    name: "Grade",
    who: "Watchdog",
    artifact: "GRADE.md",
    lines: ["Hold-outs opened: keyboard path · reduced motion · offline check", "MISS: none (sample run)", "GRADE: pass — sample stamp, not this slice"],
  },
  {
    id: "hold",
    name: "HITL hold",
    who: "Evens",
    artifact: "HOLD",
    lines: ["Merge ≠ ship", "Publish / deploy / send stay human", "Line complete here"],
  },
  {
    id: "ship",
    name: "Ship",
    who: "Evens only",
    artifact: "locked",
    lines: ["Not a station the line can reach", "Live / stays HOLD", "Opened by a human, off this page"],
    locked: true,
  },
];

export const LAST_REACHABLE = STATIONS.findIndex((s) => s.locked) - 1;

export function createState() {
  return { loaded: false, station: -1 };
}

export function loadSpec(state) {
  state.loaded = true;
  state.station = 0;
  return state;
}

export function canAdvance(state) {
  return state.loaded && state.station < LAST_REACHABLE;
}

export function canBack(state) {
  return state.loaded && state.station > 0;
}

export function advance(state) {
  if (!canAdvance(state)) return { ok: false, reason: state.loaded ? "line ends at HITL hold" : "load a spec" };
  state.station += 1;
  return { ok: true, station: STATIONS[state.station] };
}

export function back(state) {
  if (!canBack(state)) return { ok: false, reason: "at the first station" };
  state.station -= 1;
  return { ok: true, station: STATIONS[state.station] };
}

export function current(state) {
  return state.loaded ? STATIONS[state.station] : null;
}

export function isComplete(state) {
  return state.loaded && state.station === LAST_REACHABLE;
}

// Hold-outs are sealed until the Grade station has been reached.
export function holdoutsRevealed(state) {
  return state.loaded && state.station >= STATIONS.findIndex((s) => s.id === "grade");
}

export function stationStatus(state, index) {
  const s = STATIONS[index];
  if (s.locked) return "locked";
  if (!state.loaded) return "dark";
  if (index < state.station) return "done";
  if (index === state.station) return "active";
  return "dark";
}

export function stageState(state) {
  if (!state.loaded) return "empty";
  return isComplete(state) ? "complete" : "running";
}

export function stageLabel(state) {
  const s = stageState(state);
  if (s === "empty") return "empty · no run";
  if (s === "complete") return "complete · held at HITL";
  return `running · ${state.station + 1}/${LAST_REACHABLE + 1} · ${current(state).name}`;
}

export function stateFromQuery(search) {
  const wanted = new URLSearchParams(search).get("state");
  const s = createState();
  if (!wanted) return s;
  loadSpec(s);
  if (wanted === "complete") {
    s.station = LAST_REACHABLE;
    return s;
  }
  const idx = STATIONS.findIndex((st) => st.id === wanted && !st.locked);
  if (idx >= 0) s.station = idx;
  return s;
}
