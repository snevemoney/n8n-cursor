// Autoflow idea canvas — pure state. No clock, no network, no storage.
// Nodes are ideas, edges are connections, every node carries the source it came from (cite-only).
// This is the idea editor. It is not autoflow-finance and holds no money vocabulary.
// Every value is SAMPLE / CapEx. invent_kpi=0.

export const COLS = 3;
export const CELL = { w: 200, h: 120, gapX: 40, gapY: 40 };

export const EXAMPLE = {
  nodes: [
    { text: "Drafts should open where you left off", cite: "user interview · sample 03" },
    { text: "Show the source on hover, not in a footer", cite: "support thread · sample 11" },
    { text: "One canvas per question", cite: "workshop notes · sample" },
    { text: "Export a screen as a single image", cite: "" },
  ],
  edges: [[0, 1], [1, 2], [0, 3]],
};

export function createState() {
  return { nodes: [], edges: [], selected: [], nextId: 1 };
}

export function addNode(state, text, cite = "") {
  const t = String(text ?? "").trim();
  if (!t) return { ok: false, reason: "empty idea" };
  const node = { id: `n${state.nextId}`, text: t, cite: String(cite ?? "").trim() };
  state.nextId += 1;
  state.nodes.push(node);
  state.selected = [node.id];
  return { ok: true, node };
}

export function getNode(state, id) {
  return state.nodes.find((n) => n.id === id) ?? null;
}

// Selection holds at most two nodes, in tap order. Tapping a selected node unselects it.
export function toggleSelect(state, id) {
  if (!getNode(state, id)) return state;
  if (state.selected.includes(id)) {
    state.selected = state.selected.filter((x) => x !== id);
  } else {
    state.selected = [...state.selected, id].slice(-2);
  }
  return state;
}

export function clearSelection(state) {
  state.selected = [];
  return state;
}

export function hasEdge(state, a, b) {
  return state.edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export function canConnect(state) {
  const [a, b] = state.selected;
  return !!a && !!b && a !== b && !hasEdge(state, a, b);
}

export function connect(state) {
  if (!canConnect(state)) return { ok: false, reason: "select two different unconnected ideas" };
  const [a, b] = state.selected;
  state.edges.push([a, b]);
  state.selected = [b];
  return { ok: true, edge: [a, b] };
}

export function canCite(state, ref) {
  return state.selected.length === 1 && String(ref ?? "").trim().length > 0;
}

// Cite the single selected node. Blank refs leave it uncited — the editor never fills one in.
export function cite(state, ref) {
  if (!canCite(state, ref)) return { ok: false, reason: "select one idea and give a source" };
  const node = getNode(state, state.selected[0]);
  node.cite = String(ref).trim();
  return { ok: true, node };
}

export function isCited(node) {
  return node.cite.length > 0;
}

export function citedCount(state) {
  return state.nodes.filter(isCited).length;
}

export function isComplete(state) {
  return state.nodes.length > 0 && citedCount(state) === state.nodes.length;
}

export function stageState(state) {
  if (state.nodes.length === 0) return "empty";
  return isComplete(state) ? "cited" : "drafting";
}

export function stageLabel(state) {
  const s = stageState(state);
  if (s === "empty") return "blank canvas";
  const n = citedCount(state);
  return s === "cited"
    ? `ready · ${n}/${state.nodes.length} cited`
    : `drafting · ${n}/${state.nodes.length} cited`;
}

// Deterministic grid layout by insertion order. The UI never stores positions.
export function layout(state) {
  const pos = new Map();
  state.nodes.forEach((n, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    pos.set(n.id, {
      x: col * (CELL.w + CELL.gapX),
      y: row * (CELL.h + CELL.gapY),
      cx: col * (CELL.w + CELL.gapX) + CELL.w / 2,
      cy: row * (CELL.h + CELL.gapY) + CELL.h / 2,
    });
  });
  return pos;
}

export function canvasSize(state) {
  const rows = Math.max(1, Math.ceil(state.nodes.length / COLS));
  const cols = Math.min(COLS, Math.max(1, state.nodes.length));
  return {
    width: cols * CELL.w + (cols - 1) * CELL.gapX,
    height: rows * CELL.h + (rows - 1) * CELL.gapY,
  };
}

export function exampleState(allCited = false) {
  const s = createState();
  const ids = EXAMPLE.nodes.map((n) => addNode(s, n.text, allCited && !n.cite ? "release notes · sample" : n.cite).node.id);
  for (const [a, b] of EXAMPLE.edges) {
    s.selected = [ids[a], ids[b]];
    connect(s);
  }
  s.selected = [];
  return s;
}

export function stateFromQuery(search) {
  const wanted = new URLSearchParams(search).get("state");
  if (wanted === "cited") return exampleState(true);
  if (wanted === "example") return exampleState(false);
  return createState();
}
