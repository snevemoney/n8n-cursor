import {
  FILTERS,
  closeDoor,
  countBy,
  createState,
  openDoor,
  select,
  selected,
  setFilter,
  stageLabel,
  stageState,
  stateFromQuery,
  visible,
} from "./proofs.js";

const $ = (id) => document.getElementById(id);

const door = $("door");
const doorState = $("door-state");
const doorLeaf = $("door-leaf");
const filters = $("filters");
const cards = $("cards");
const detail = $("detail");
const openBtn = $("open-btn");
const closeBtn = $("close-btn");
const toast = $("toast");
const toastText = $("toast-text");
const friction = $("friction");
const frictionLine = $("friction-line");

let state = stateFromQuery(window.location.search);
let toastTimer = null;

function render() {
  const stage = stageState(state);
  door.dataset.state = stage;
  doorState.textContent = stageLabel(state);
  doorLeaf.hidden = state.open;
  openBtn.disabled = state.open;
  closeBtn.disabled = !state.open;

  filters.replaceChildren();
  for (const f of FILTERS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.filter = f;
    b.disabled = !state.open;
    b.setAttribute("aria-pressed", state.open && state.filter === f ? "true" : "false");
    b.textContent = `${f} · ${countBy(f)}`;
    filters.appendChild(b);
  }

  cards.replaceChildren();
  const list = visible(state);
  if (state.open && !list.length) {
    const n = document.createElement("div");
    n.className = "empty-note";
    n.textContent = "No proofs under this filter.";
    cards.appendChild(n);
  }
  for (const p of list) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "proof";
    b.dataset.proof = p.id;
    b.dataset.status = p.status;
    b.setAttribute("aria-pressed", state.selected === p.id ? "true" : "false");
    b.setAttribute("aria-label", `${p.name} — ${p.status} — grade ${p.grade}`);
    const st = document.createElement("span");
    st.className = "status";
    st.dataset.status = p.status;
    st.textContent = p.status;
    const name = document.createElement("span");
    name.className = "proof-name";
    name.textContent = p.name;
    const g = document.createElement("span");
    g.className = "grade";
    g.dataset.grade = p.grade === "UNFILLED" ? "unfilled" : "sample";
    g.textContent = `GRADE: ${p.grade}`;
    b.append(st, name, g);
    cards.appendChild(b);
  }

  detail.replaceChildren();
  const p = selected(state);
  if (!p) {
    detail.hidden = !state.open;
    if (state.open) {
      const n = document.createElement("p");
      n.className = "selection empty";
      n.textContent = "Tap a proof to read what is proven and what is not.";
      detail.appendChild(n);
    }
  } else {
    detail.hidden = false;
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = `${p.status} · GRADE: ${p.grade}`;
    const h = document.createElement("h3");
    h.className = "detail-title";
    h.textContent = p.name;
    const shipped = document.createElement("p");
    shipped.className = "shipped";
    shipped.textContent = p.shipped;
    detail.append(eyebrow, h, shipped);
    detail.appendChild(list_("Proven", p.proven, "proven"));
    detail.appendChild(list_("Not proven", p.notProven, "not-proven"));
    const note = document.createElement("p");
    note.className = "detail-note";
    note.textContent = p.grade === "UNFILLED"
      ? "Watchdog fills the grade. The builder does not."
      : "Sample stamp for the story. Not a live grade.";
    detail.appendChild(note);
  }

  friction.dataset.muted = state.open ? "true" : "false";
  frictionLine.textContent = state.open
    ? "Quiet. The door opened onto artifacts."
    : "The services page with no artifact. Not what the door opens onto.";
}

function list_(title, items, cls) {
  const wrap = document.createElement("div");
  wrap.className = `detail-list ${cls}`;
  const h = document.createElement("p");
  h.className = "field-label";
  h.textContent = title;
  wrap.appendChild(h);
  const ul = document.createElement("ul");
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "none";
    li.textContent = "nothing yet";
    ul.appendChild(li);
  }
  for (const it of items) {
    const li = document.createElement("li");
    li.textContent = it;
    ul.appendChild(li);
  }
  wrap.appendChild(ul);
  return wrap;
}

function showToast(text) {
  toastText.textContent = text;
  toast.dataset.show = "true";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.dataset.show = "false";
  }, 4000);
}

openBtn.addEventListener("click", () => {
  openDoor(state);
  render();
  showToast(`Door open · ${visible(state).length} proofs · building mode`);
  filters.querySelector('[aria-pressed="true"]')?.focus();
});
doorLeaf.addEventListener("click", () => {
  openDoor(state);
  render();
  showToast(`Door open · ${visible(state).length} proofs · building mode`);
});
closeBtn.addEventListener("click", () => {
  closeDoor(state);
  render();
  openBtn.focus();
});

filters.addEventListener("click", (e) => {
  const b = e.target.closest("[data-filter]");
  if (!b || b.disabled) return;
  if (setFilter(state, b.dataset.filter).ok) render();
  filters.querySelector(`[data-filter="${b.dataset.filter}"]`)?.focus();
});

cards.addEventListener("click", (e) => {
  const b = e.target.closest("[data-proof]");
  if (!b) return;
  if (select(state, b.dataset.proof).ok) render();
  cards.querySelector(`[data-proof="${b.dataset.proof}"]`)?.focus();
});

$("load-example").addEventListener("click", () => {
  state = stateFromQuery("?state=open&filter=graded&proof=p1");
  render();
  showToast("Door open · graded · p1 selected");
});

$("reset-empty").addEventListener("click", () => {
  state = createState();
  render();
  toast.dataset.show = "false";
});

render();
