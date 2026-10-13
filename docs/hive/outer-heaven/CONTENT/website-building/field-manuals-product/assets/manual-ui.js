import {
  MANUALS,
  SECTIONS,
  allDone,
  canOpen,
  createState,
  getManual,
  isDone,
  open,
  pick,
  progress,
  putBack,
  setSection,
  stageLabel,
  stageState,
  stateFromQuery,
  toggleStep,
} from "./manual.js";

const $ = (id) => document.getElementById(id);

const desk = $("desk");
const deskState = $("desk-state");
const shelf = $("shelf");
const hand = $("hand");
const handCover = $("hand-cover");
const handOpen = $("hand-open");
const tabs = $("tabs");
const steps = $("steps");
const openBtn = $("open-btn");
const putbackBtn = $("putback-btn");
const toast = $("toast");
const toastText = $("toast-text");
const friction = $("friction");
const frictionLine = $("friction-line");

let state = stateFromQuery(window.location.search);
let toastTimer = null;

function render() {
  const stage = stageState(state);
  desk.dataset.state = stage;
  deskState.textContent = stageLabel(state);

  shelf.replaceChildren();
  for (const m of MANUALS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "manual";
    b.dataset.manual = m.id;
    b.dataset.held = state.held === m.id ? "true" : "false";
    b.setAttribute("aria-pressed", state.held === m.id ? "true" : "false");
    b.setAttribute("aria-label", `${m.code} ${m.title}${state.held === m.id ? " — in hand" : ""}`);
    const code = document.createElement("span");
    code.className = "code";
    code.textContent = m.code;
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = state.held === m.id ? "in hand" : m.title;
    b.append(code, title);
    shelf.appendChild(b);
  }

  const m = state.held ? getManual(state.held) : null;
  hand.dataset.state = stage;
  handCover.hidden = !m || state.open;
  handOpen.hidden = !m || !state.open;
  hand.querySelector(".hand-empty").hidden = !!m;

  if (m) {
    handCover.querySelector(".code").textContent = m.code;
    handCover.querySelector(".title").textContent = m.title;
  }

  tabs.replaceChildren();
  steps.replaceChildren();
  if (m && state.open) {
    for (const sec of SECTIONS) {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "tab";
      t.setAttribute("role", "tab");
      t.dataset.section = sec;
      const active = state.section === sec;
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.tabIndex = active ? 0 : -1;
      const p = progress(state, sec);
      t.textContent = `${sec} ${p.done}/${p.total}`;
      t.dataset.complete = p.done === p.total ? "true" : "false";
      tabs.appendChild(t);
    }
    const list = m.sections[state.section];
    list.forEach((text, i) => {
      const li = document.createElement("li");
      const label = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.dataset.step = String(i);
      cb.checked = isDone(state, state.section, i);
      const span = document.createElement("span");
      span.textContent = text;
      label.append(cb, span);
      li.appendChild(label);
      li.dataset.done = cb.checked ? "true" : "false";
      steps.appendChild(li);
    });
    steps.parentElement.querySelector(".hand-title").textContent = `${m.code} · ${m.title}`;
  }

  openBtn.disabled = !canOpen(state);
  putbackBtn.disabled = !state.held;

  const held = stage !== "empty";
  friction.dataset.muted = held ? "true" : "false";
  frictionLine.textContent = held
    ? "Quiet. This one is in your hand."
    : "The download nobody opens. Not what the desk does.";
}

function showToast(text) {
  toastText.textContent = text;
  toast.dataset.show = "true";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.dataset.show = "false";
  }, 4000);
}

shelf.addEventListener("click", (e) => {
  const b = e.target.closest("[data-manual]");
  if (!b) return;
  const r = pick(state, b.dataset.manual);
  if (!r.ok) return;
  render();
  if (!r.already) {
    showToast(`${r.manual.code} in hand`);
    openBtn.focus();
  }
});

openBtn.addEventListener("click", () => {
  const r = open(state);
  if (!r.ok) return;
  render();
  showToast(`${r.manual.code} open · setup`);
  const first = tabs.querySelector('[aria-selected="true"]');
  if (first) first.focus();
});

putbackBtn.addEventListener("click", () => {
  putBack(state);
  render();
});

handCover.addEventListener("click", () => {
  if (open(state).ok) render();
});

tabs.addEventListener("click", (e) => {
  const t = e.target.closest("[data-section]");
  if (!t) return;
  setSection(state, t.dataset.section);
  render();
  tabs.querySelector('[aria-selected="true"]')?.focus();
});

tabs.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  const i = SECTIONS.indexOf(state.section);
  const n = (i + (e.key === "ArrowRight" ? 1 : SECTIONS.length - 1)) % SECTIONS.length;
  setSection(state, SECTIONS[n]);
  render();
  tabs.querySelector('[aria-selected="true"]')?.focus();
  e.preventDefault();
});

steps.addEventListener("change", (e) => {
  const cb = e.target.closest("[data-step]");
  if (!cb) return;
  const r = toggleStep(state, state.section, Number(cb.dataset.step));
  if (!r.ok) return;
  render();
  if (allDone(state, state.section)) {
    showToast(`${state.section} · ${r.progress.done}/${r.progress.total} ticked`);
  }
  steps.querySelector(`[data-step="${cb.dataset.step}"]`)?.focus();
});

$("load-example").addEventListener("click", () => {
  state = stateFromQuery("?state=open&manual=m2&section=operate");
  render();
  showToast("FM-02 open in hand · operate");
});

$("reset-empty").addEventListener("click", () => {
  state = createState();
  render();
  toast.dataset.show = "false";
});

render();
