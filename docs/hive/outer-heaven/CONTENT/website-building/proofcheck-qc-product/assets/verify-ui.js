import {
  SOURCES,
  attachSource,
  canVerify,
  cite,
  createState,
  detachSource,
  exampleState,
  gateLabel,
  setDraft,
  stageState,
  stateFromQuery,
  verify,
} from "./verify.js";

const $ = (id) => document.getElementById(id);

const gate = $("gate");
const gateState = $("gate-state");
const pool = $("source-pool");
const attached = $("attached");
const draft = $("draft");
const verifyBtn = $("verify-btn");
const claims = $("claims");
const voiceMeter = $("voice-meter");
const toast = $("toast");
const toastText = $("toast-text");
const friction = $("friction");
const frictionLine = $("friction-line");

let state = stateFromQuery(window.location.search);
let toastTimer = null;
let lastGate = state.report?.gate ?? null;

function render() {
  draft.value = state.draft;

  pool.replaceChildren();
  for (const s of SOURCES.filter((s) => !state.sources.has(s.id))) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.source = s.id;
    b.textContent = `+ ${s.id} · ${s.title}`;
    b.setAttribute("aria-label", `Attach source ${s.id} ${s.title}`);
    pool.appendChild(b);
  }
  if (!pool.children.length) {
    const n = document.createElement("span");
    n.className = "selection empty";
    n.textContent = "All sample sources attached.";
    pool.appendChild(n);
  }

  attached.replaceChildren();
  for (const id of state.sources) {
    const s = SOURCES.find((x) => x.id === id);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip attached";
    b.dataset.detach = id;
    b.setAttribute("aria-pressed", "true");
    b.setAttribute("aria-label", `Detach source ${id} ${s.title}`);
    b.textContent = `${id} · ${s.title} ×`;
    attached.appendChild(b);
  }
  if (!attached.children.length) {
    const n = document.createElement("span");
    n.className = "selection empty";
    n.textContent = "No sources attached.";
    attached.appendChild(n);
  }

  verifyBtn.disabled = !canVerify(state);

  const stage = stageState(state);
  gate.dataset.state = stage;
  gateState.textContent = gateLabel(state);

  claims.replaceChildren();
  if (!state.report) {
    const n = document.createElement("div");
    n.className = "empty-note";
    n.textContent = stage === "empty"
      ? "Attach a source and paste a draft. Verify Now checks every claim against what you attached."
      : "Ready. Tap Verify Now.";
    claims.appendChild(n);
  } else {
    for (const c of state.report.claims) claims.appendChild(renderClaim(c));
  }

  if (state.report) {
    voiceMeter.dataset.kept = state.report.wordsChanged === 0 ? "true" : "false";
    voiceMeter.textContent = `Words changed: ${state.report.wordsChanged} · ${
      state.report.wordsChanged === 0 ? "voice kept" : "voice drifted"
    }`;
  } else {
    voiceMeter.dataset.kept = "true";
    voiceMeter.textContent = "Words changed: 0 · nothing verified yet";
  }

  const open = stage === "verified";
  friction.dataset.muted = open ? "true" : "false";
  frictionLine.textContent = open
    ? "Quiet. The gate opened on your words — not a rewrite."
    : "The rewrite that sounds like everyone. Not what Verify Now does.";
}

function renderClaim(c) {
  const row = document.createElement("div");
  row.className = "claim";
  row.dataset.status = c.status;
  row.dataset.index = String(c.index);

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = c.status === "cited" ? `cited ${c.cites.join(" ")}` : "uncited";
  row.appendChild(badge);

  const text = document.createElement("p");
  text.className = "claim-text";
  text.textContent = c.text;
  row.appendChild(text);

  if (c.status === "uncited") {
    const acts = document.createElement("div");
    acts.className = "actions";
    if (c.missing.length) {
      const m = document.createElement("span");
      m.className = "selection empty";
      m.textContent = `cites ${c.missing.join(", ")} — not attached`;
      acts.appendChild(m);
    }
    for (const id of state.sources) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn-ghost btn-small";
      b.dataset.cite = id;
      b.dataset.claim = String(c.index);
      b.textContent = `Cite ${id}`;
      acts.appendChild(b);
    }
    row.appendChild(acts);
  }
  return row;
}

function showToast(text) {
  toastText.textContent = text;
  toast.dataset.show = "true";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.dataset.show = "false";
  }, 4000);
}

function afterVerify(result) {
  if (!result.ok) return;
  render();
  const g = result.report.gate;
  if (g === "open" && lastGate !== "open") {
    showToast(`Gate open · voice kept · ${result.report.wordsChanged} words changed`);
  } else if (g === "closed") {
    showToast(`Gate closed · ${result.report.uncited} uncited`);
  }
  lastGate = g;
}

pool.addEventListener("click", (e) => {
  const b = e.target.closest("[data-source]");
  if (!b) return;
  attachSource(state, b.dataset.source);
  render();
});

attached.addEventListener("click", (e) => {
  const b = e.target.closest("[data-detach]");
  if (!b) return;
  detachSource(state, b.dataset.detach);
  if (state.report) afterVerify(canVerify(state) ? verify(state) : { ok: false });
  if (!canVerify(state)) state.report = null;
  render();
});

draft.addEventListener("input", () => {
  setDraft(state, draft.value);
  verifyBtn.disabled = !canVerify(state);
});

$("verify-form").addEventListener("submit", (e) => {
  e.preventDefault();
  afterVerify(verify(state));
  const first = claims.querySelector('.claim[data-status="uncited"] [data-cite]');
  if (first) first.focus();
});

claims.addEventListener("click", (e) => {
  const b = e.target.closest("[data-cite]");
  if (!b) return;
  afterVerify(cite(state, Number(b.dataset.claim), b.dataset.cite));
});

$("load-example").addEventListener("click", () => {
  state = exampleState();
  lastGate = null;
  render();
  showToast("Example sources + draft loaded · not verified");
  verifyBtn.focus();
});

$("reset-empty").addEventListener("click", () => {
  state = createState();
  lastGate = null;
  render();
  toast.dataset.show = "false";
});

render();
