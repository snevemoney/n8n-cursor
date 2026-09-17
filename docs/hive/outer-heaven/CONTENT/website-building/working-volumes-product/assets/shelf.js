// Working Volumes shelf — pure state. No clock, no network, no storage.
// Eight spines. Pull one and it opens on the desk; pull another and the desk stacks; reshelve slides it back.
// Tapping a pulled spine reshelves it (toggle). Every value is SAMPLE / CapEx. invent_kpi=0.

export const VOLUMES = [
  { id: "v1", numeral: "I", title: "Intake", status: "working", chapters: ["The first question", "The card, not the screen", "What to leave out"] },
  { id: "v2", numeral: "II", title: "Floor", status: "working", chapters: ["Opening on the minute", "The ten-step hello", "Board on the hour"] },
  { id: "v3", numeral: "III", title: "Hand-off", status: "done", chapters: ["Read the last line first", "Open / stuck", "Sign it"] },
  { id: "v4", numeral: "IV", title: "Quiet hours", status: "working", chapters: ["What quiet is for", "Two lists", "The no list"] },
  { id: "v5", numeral: "V", title: "Repairs", status: "done", chapters: ["Name the break", "Small first", "Log it"] },
  { id: "v6", numeral: "VI", title: "Proof", status: "working", chapters: ["What counts", "What does not", "Show, do not say"] },
  { id: "v7", numeral: "VII", title: "Holds", status: "working", chapters: ["Merge is not ship", "Who holds what", "Saying no"] },
  { id: "v8", numeral: "VIII", title: "Colophon", status: "done", chapters: ["Set and built", "Sample only"] },
];

export function getVolume(id) {
  return VOLUMES.find((v) => v.id === id) ?? null;
}

export function createState() {
  return { pulled: [] }; // desk order, oldest first
}

export function isPulled(state, id) {
  return state.pulled.includes(id);
}

export function pull(state, id) {
  const v = getVolume(id);
  if (!v) return { ok: false, reason: "no such volume" };
  if (isPulled(state, id)) return { ok: false, reason: "already on the desk" };
  state.pulled.push(id);
  return { ok: true, volume: v };
}

export function reshelve(state, id) {
  if (!isPulled(state, id)) return { ok: false, reason: "not on the desk" };
  state.pulled = state.pulled.filter((x) => x !== id);
  return { ok: true, volume: getVolume(id) };
}

// Tap a spine: pulled → reshelve, shelved → pull.
export function toggle(state, id) {
  return isPulled(state, id) ? { ...reshelve(state, id), action: "reshelved" } : { ...pull(state, id), action: "pulled" };
}

export function reshelveAll(state) {
  const n = state.pulled.length;
  state.pulled = [];
  return { ok: n > 0, count: n };
}

export function pulledCount(state) {
  return state.pulled.length;
}

export function desk(state) {
  return state.pulled.map(getVolume);
}

export function stageState(state) {
  return state.pulled.length ? "pulled" : "empty";
}

export function stageLabel(state) {
  const n = pulledCount(state);
  if (n === 0) return "shelved · nothing pulled";
  return `${n} pulled · on the desk`;
}

export function stateFromQuery(search) {
  const params = new URLSearchParams(search);
  const s = createState();
  if (params.get("state") !== "pulled") return s;
  const ids = (params.get("vol") ?? "v1").split(",").map((x) => x.trim()).filter(Boolean);
  for (const id of ids) pull(s, id);
  return s;
}
