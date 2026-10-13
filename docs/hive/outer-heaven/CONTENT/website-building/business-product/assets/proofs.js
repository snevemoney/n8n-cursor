// Evens Louis proofs door — pure state. No clock, no network, no storage.
// A soft door onto sample proof records: what shipped, what is proven, what is not, grade status.
// Building mode. Artifacts, not a pitch. Records are SAMPLE and do not link to the live /work pages. invent_kpi=0.

export const FILTERS = ["all", "building", "graded", "held"];

export const PROOFS = [
  {
    id: "p1",
    name: "Booking path behind a landing",
    status: "graded",
    shipped: "Calendar door, empty vs confirmed states, door check",
    proven: ["Shell CTA lands on a calendar, not a 404", "Slot → confirm → green, deterministic", "No outbound request"],
    notProven: ["Keyboard-only traversal end to end", "Screen-reader pass"],
    grade: "sample pass",
  },
  {
    id: "p2",
    name: "Verify gate for a draft",
    status: "building",
    shipped: "Sources → Verify Now → cite check → gate",
    proven: ["Uncited claims flag amber", "Gate opens at 0 uncited with 0 words changed"],
    notProven: ["Against a real model", "Long drafts"],
    grade: "UNFILLED",
  },
  {
    id: "p3",
    name: "Claims / evidence workbench",
    status: "building",
    shipped: "Attach evidence to claims with a relation",
    proven: ["Contested surfaces from shape alone", "0 verdicts in every state"],
    notProven: ["Graph view", "Import"],
    grade: "UNFILLED",
  },
  {
    id: "p4",
    name: "Owned motion stage",
    status: "graded",
    shipped: "Procedural canvas globe, seeded, no stock",
    proven: ["Zero media files on disk", "Reduced motion gets a still"],
    notProven: ["Battery cost on mobile"],
    grade: "sample pass",
  },
  {
    id: "p5",
    name: "Live /work case-page wiring",
    status: "held",
    shipped: "Nothing yet — previews exist, wiring is a human step",
    proven: [],
    notProven: ["Any CTA on the live site points at a preview"],
    grade: "UNFILLED",
  },
  {
    id: "p6",
    name: "Publishing the previews",
    status: "held",
    shipped: "Nothing — live / stays HOLD",
    proven: [],
    notProven: ["Deploy", "Domain", "Public URL"],
    grade: "UNFILLED",
  },
];

export function createState() {
  return { open: false, filter: "all", selected: null };
}

export function openDoor(state) {
  state.open = true;
  return state;
}

// Closing forgets the filter and the selection — the next open starts soft, on All.
export function closeDoor(state) {
  state.open = false;
  state.filter = "all";
  state.selected = null;
  return state;
}

export function setFilter(state, filter) {
  if (!state.open) return { ok: false, reason: "door closed" };
  if (!FILTERS.includes(filter)) return { ok: false, reason: "unknown filter" };
  state.filter = filter;
  if (state.selected && !visible(state).some((p) => p.id === state.selected)) state.selected = null;
  return { ok: true, filter };
}

export function visible(state) {
  if (!state.open) return [];
  return state.filter === "all" ? PROOFS : PROOFS.filter((p) => p.status === state.filter);
}

export function select(state, id) {
  if (!state.open) return { ok: false, reason: "door closed" };
  const p = visible(state).find((x) => x.id === id);
  if (!p) return { ok: false, reason: "not visible" };
  state.selected = state.selected === id ? null : id;
  return { ok: true, proof: state.selected ? p : null };
}

export function selected(state) {
  return state.selected ? PROOFS.find((p) => p.id === state.selected) ?? null : null;
}

export function countBy(status) {
  return PROOFS.filter((p) => status === "all" || p.status === status).length;
}

export function stageState(state) {
  return state.open ? "open" : "closed";
}

export function stageLabel(state) {
  if (!state.open) return "closed · building mode";
  const n = visible(state).length;
  return `${n} proof${n === 1 ? "" : "s"} · ${state.filter} · building mode`;
}

export function stateFromQuery(search) {
  const params = new URLSearchParams(search);
  const s = createState();
  if (params.get("state") !== "open") return s;
  openDoor(s);
  const f = params.get("filter");
  if (f) setFilter(s, f);
  const sel = params.get("proof");
  if (sel) select(s, sel);
  return s;
}
