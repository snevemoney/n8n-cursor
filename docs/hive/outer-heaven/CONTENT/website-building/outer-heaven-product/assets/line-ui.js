import {
  STATIONS,
  advance,
  back,
  canAdvance,
  canBack,
  createState,
  current,
  holdoutsRevealed,
  isComplete,
  loadSpec,
  stageLabel,
  stageState,
  stateFromQuery,
  stationStatus,
} from "./line.js";

const $ = (id) => document.getElementById(id);

const line = $("line");
const lineState = $("line-state");
const stations = $("stations");
const artifact = $("artifact");
const advanceBtn = $("advance-btn");
const backBtn = $("back-btn");
const toast = $("toast");
const toastText = $("toast-text");
const friction = $("friction");
const frictionLine = $("friction-line");

let state = stateFromQuery(window.location.search);
let toastTimer = null;

function render() {
  const stage = stageState(state);
  line.dataset.state = stage;
  lineState.textContent = stageLabel(state);

  stations.replaceChildren();
  STATIONS.forEach((s, i) => {
    const li = document.createElement("li");
    li.className = "station";
    li.dataset.station = s.id;
    li.dataset.status = stationStatus(state, i);
    li.setAttribute("aria-current", li.dataset.status === "active" ? "step" : "false");
    const n = document.createElement("span");
    n.className = "num";
    n.textContent = s.locked ? "🔒" : String(i + 1);
    const name = document.createElement("span");
    name.className = "sname";
    name.textContent = s.name;
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = s.who;
    li.append(n, name, who);
    stations.appendChild(li);
  });

  artifact.replaceChildren();
  const cur = current(state);
  if (!cur) {
    const n = document.createElement("div");
    n.className = "empty-note";
    n.textContent = "No run on the line. Load a spec to light the first bench.";
    artifact.appendChild(n);
  } else {
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = `Station ${state.station + 1} · ${cur.name} · ${cur.who}`;
    const file = document.createElement("h3");
    file.className = "artifact-name";
    file.textContent = cur.artifact;
    const ul = document.createElement("ul");
    ul.className = "artifact-lines";
    const sealed = cur.id === "holdouts" && !holdoutsRevealed(state);
    for (const [i, text] of cur.lines.entries()) {
      const li = document.createElement("li");
      li.textContent = sealed && i === 0 ? "3 hidden checks · sealed until Grade" : text;
      if (sealed && i > 0) li.className = "sealed";
      ul.appendChild(li);
    }
    artifact.append(eyebrow, file, ul);
    if (cur.id === "grade") {
      const stamp = document.createElement("div");
      stamp.className = "stamp";
      stamp.textContent = "SAMPLE STAMP · not this slice's GRADE";
      artifact.appendChild(stamp);
    }
    if (isComplete(state)) {
      const hold = document.createElement("div");
      hold.className = "hold";
      hold.textContent = "HELD · merge ≠ ship · Ship stays locked";
      artifact.appendChild(hold);
    }
  }

  advanceBtn.disabled = !canAdvance(state);
  backBtn.disabled = !canBack(state);
  advanceBtn.textContent = isComplete(state) ? "Line complete" : "Advance →";

  const complete = stage === "complete";
  friction.dataset.muted = complete ? "true" : "false";
  frictionLine.textContent = complete
    ? "Quiet. Every bench left an artifact — and the hold stayed human."
    : "The pitch with no artifact. Not what the line shows.";
}

function showToast(text) {
  toastText.textContent = text;
  toast.dataset.show = "true";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.dataset.show = "false";
  }, 4000);
}

advanceBtn.addEventListener("click", () => {
  const r = advance(state);
  if (!r.ok) return;
  render();
  if (isComplete(state)) showToast("Line complete · held at HITL · merge ≠ ship");
  else if (r.station.id === "grade") showToast("Grade · hold-outs revealed · sample stamp");
  else showToast(`${r.station.name} · ${r.station.who}`);
});

backBtn.addEventListener("click", () => {
  if (back(state).ok) render();
});

$("load-example").addEventListener("click", () => {
  state = loadSpec(createState());
  render();
  showToast("Example spec loaded · station 1 lit");
  advanceBtn.focus();
});

$("reset-empty").addEventListener("click", () => {
  state = createState();
  render();
  toast.dataset.show = "false";
});

render();
