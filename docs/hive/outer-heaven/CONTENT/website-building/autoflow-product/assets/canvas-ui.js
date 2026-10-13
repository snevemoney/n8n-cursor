import {
  CELL,
  addNode,
  canCite,
  canConnect,
  canvasSize,
  cite,
  citedCount,
  clearSelection,
  connect,
  createState,
  exampleState,
  isCited,
  layout,
  stageLabel,
  stageState,
  stateFromQuery,
  toggleSelect,
} from "./canvas.js";

const $ = (id) => document.getElementById(id);
const SVG = "http://www.w3.org/2000/svg";

const canvas = $("canvas");
const canvasState = $("canvas-state");
const board = $("board");
const nodesEl = $("nodes");
const edgesEl = $("edges");
const ideaForm = $("idea-form");
const ideaText = $("idea-text");
const connectBtn = $("connect-btn");
const citeBtn = $("cite-btn");
const citeRef = $("cite-ref");
const citeCount = $("cite-count");
const pick = $("pick");
const toast = $("toast");
const toastText = $("toast-text");
const friction = $("friction");
const frictionLine = $("friction-line");

let state = stateFromQuery(window.location.search);
let toastTimer = null;
let wasComplete = false;

function render() {
  const stage = stageState(state);
  canvas.dataset.state = stage;
  canvasState.textContent = stageLabel(state);

  const pos = layout(state);
  const size = canvasSize(state);
  board.style.setProperty("--w", `${size.width}px`);
  board.style.setProperty("--h", `${size.height}px`);
  edgesEl.setAttribute("viewBox", `0 0 ${size.width} ${size.height}`);
  edgesEl.setAttribute("width", String(size.width));
  edgesEl.setAttribute("height", String(size.height));

  edgesEl.replaceChildren();
  for (const [a, b] of state.edges) {
    const pa = pos.get(a);
    const pb = pos.get(b);
    const line = document.createElementNS(SVG, "line");
    line.setAttribute("x1", String(pa.cx));
    line.setAttribute("y1", String(pa.cy));
    line.setAttribute("x2", String(pb.cx));
    line.setAttribute("y2", String(pb.cy));
    line.dataset.edge = `${a}-${b}`;
    edgesEl.appendChild(line);
  }

  nodesEl.replaceChildren();
  if (!state.nodes.length) {
    const n = document.createElement("div");
    n.className = "empty-note";
    n.textContent = "Blank canvas. Type an idea and add it.";
    nodesEl.appendChild(n);
  }
  for (const node of state.nodes) {
    const p = pos.get(node.id);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "node";
    b.dataset.node = node.id;
    b.dataset.cited = isCited(node) ? "true" : "false";
    b.style.setProperty("--x", `${p.x}px`);
    b.style.setProperty("--y", `${p.y}px`);
    b.style.width = `${CELL.w}px`;
    b.style.height = `${CELL.h}px`;
    const order = state.selected.indexOf(node.id);
    b.setAttribute("aria-pressed", order >= 0 ? "true" : "false");
    b.dataset.order = order >= 0 ? String(order + 1) : "";
    b.setAttribute("aria-label", `${node.text} — ${isCited(node) ? `cited: ${node.cite}` : "uncited"}`);
    const t = document.createElement("span");
    t.className = "node-text";
    t.textContent = node.text;
    const c = document.createElement("span");
    c.className = "node-cite";
    c.textContent = isCited(node) ? node.cite : "uncited";
    b.append(t, c);
    nodesEl.appendChild(b);
  }

  connectBtn.disabled = !canConnect(state);
  citeBtn.disabled = !canCite(state, citeRef.value);
  citeCount.textContent = `cited ${citedCount(state)}/${state.nodes.length}`;

  const [a, b] = state.selected;
  if (!a) pick.textContent = "Select an idea to cite it, two to connect them.";
  else if (!b) pick.textContent = `${a} selected · add a source, or select a second idea to connect.`;
  else pick.textContent = `${a} → ${b} · Connect.`;
  pick.classList.toggle("empty", !a);

  const complete = stage === "cited";
  friction.dataset.muted = complete ? "true" : "false";
  frictionLine.textContent = complete
    ? "Quiet. Every idea on this screen carries its source."
    : "A different project with a similar name. Not this canvas.";
}

function showToast(text) {
  toastText.textContent = text;
  toast.dataset.show = "true";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.dataset.show = "false";
  }, 4000);
}

function afterChange(msg) {
  render();
  const complete = stageState(state) === "cited";
  if (complete && !wasComplete) showToast(`Screen ready · ${citedCount(state)}/${state.nodes.length} cited`);
  else if (msg) showToast(msg);
  wasComplete = complete;
}

ideaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const r = addNode(state, ideaText.value);
  if (!r.ok) return;
  ideaText.value = "";
  afterChange(`${r.node.id} added · uncited`);
  citeRef.focus();
});

nodesEl.addEventListener("click", (e) => {
  const b = e.target.closest("[data-node]");
  if (!b) return;
  toggleSelect(state, b.dataset.node);
  render();
});

connectBtn.addEventListener("click", () => {
  const r = connect(state);
  if (!r.ok) return;
  afterChange(`Connected ${r.edge[0]} → ${r.edge[1]}`);
});

citeRef.addEventListener("input", () => {
  citeBtn.disabled = !canCite(state, citeRef.value);
});

$("cite-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const r = cite(state, citeRef.value);
  if (!r.ok) return;
  citeRef.value = "";
  afterChange(`${r.node.id} cited · ${r.node.cite}`);
  const el = nodesEl.querySelector(`[data-node="${r.node.id}"]`);
  if (el) el.focus();
});

$("clear-btn").addEventListener("click", () => {
  clearSelection(state);
  render();
});

$("load-example").addEventListener("click", () => {
  state = exampleState(false);
  wasComplete = false;
  render();
  showToast("Example screen loaded · 3/4 cited");
});

$("reset-empty").addEventListener("click", () => {
  state = createState();
  wasComplete = false;
  render();
  toast.dataset.show = "false";
});

wasComplete = stageState(state) === "cited";
render();
