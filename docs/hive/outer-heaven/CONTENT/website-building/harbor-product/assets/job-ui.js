import {
  DAYS,
  SERVICES,
  STEPS,
  WEEK_LABEL,
  WINDOWS,
  back,
  book,
  bookedState,
  canBook,
  describe,
  emptyState,
  frictionLine,
  jobComplete,
  next,
  parseWindow,
  selectWindow,
  setJob,
  stateFromQuery,
  statusLabel,
  windowId,
} from "./job.js";

const $ = (id) => document.getElementById(id);

const frame = $("job-frame");
const pill = $("job-state");
const stepper = $("stepper");
const stepJob = $("step-job");
const stepVisit = $("step-visit");
const grid = $("grid");
const weekLabel = $("week-label");
const serviceSelect = $("service");
const addressInput = $("address");
const noteInput = $("note");
const nameInput = $("homeowner");
const selection = $("selection");
const form = $("job-form");
const nextBtn = $("next-btn");
const backBtn = $("back-btn");
const bookBtn = $("book-btn");
const outcome = $("outcome");
const outcomeHead = $("outcome-headline");
const outcomeDetail = $("outcome-detail");
const friction = $("friction");
const frictionLineEl = $("friction-line");
const toast = $("toast");
const toastText = $("toast-text");

let state = stateFromQuery(window.location.search);
let toastTimer = null;

weekLabel.textContent = WEEK_LABEL;
grid.style.setProperty("--days", String(DAYS.length));

serviceSelect.replaceChildren();
const first = document.createElement("option");
first.value = "";
first.textContent = "Choose one";
serviceSelect.appendChild(first);
for (const s of SERVICES) {
  const opt = document.createElement("option");
  opt.value = s;
  opt.textContent = s;
  serviceSelect.appendChild(opt);
}

function renderStepper() {
  stepper.replaceChildren();
  STEPS.forEach((s, i) => {
    const li = document.createElement("li");
    li.dataset.active = String(i === state.step && state.status === "empty");
    li.dataset.done = String(i < state.step || state.status === "booked");
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = String(i + 1);
    li.appendChild(n);
    li.appendChild(document.createTextNode(s.label));
    stepper.appendChild(li);
  });
}

function renderGrid() {
  grid.replaceChildren();
  const corner = document.createElement("div");
  corner.className = "corner";
  corner.setAttribute("aria-hidden", "true");
  grid.appendChild(corner);

  WINDOWS.forEach((w, t) => {
    const el = document.createElement("div");
    el.className = "time";
    el.textContent = `${w.label} ${w.hours}`;
    el.style.setProperty("--r", String(t + 2));
    grid.appendChild(el);
  });

  DAYS.forEach((day, d) => {
    const block = document.createElement("div");
    block.className = "day-block";
    block.setAttribute("role", "group");
    block.setAttribute("aria-label", day);
    const head = document.createElement("div");
    head.className = "day";
    head.textContent = day;
    head.style.setProperty("--c", String(d + 2));
    head.classList.toggle("has-confirmed", state.visit?.day === day);
    block.appendChild(head);

    WINDOWS.forEach((w, t) => {
      const id = windowId(day, w.id);
      const booked = state.visit?.id === id;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.dataset.slot = id;
      btn.dataset.status = booked ? "booked" : "open";
      btn.style.setProperty("--c", String(d + 2));
      btn.style.setProperty("--r", String(t + 2));
      const when = document.createElement("span");
      when.className = "when";
      when.textContent = `${w.label} ${w.hours}`;
      const title = document.createElement("span");
      title.className = "title";
      title.textContent = booked ? "Visit" : "Open";
      btn.append(when, title);
      const label = `${day} ${w.label} · ${w.hours}`;
      if (booked) {
        const who = document.createElement("span");
        who.className = "who";
        who.textContent = `✓ ${state.visit.job.service}`;
        btn.appendChild(who);
        btn.setAttribute("aria-disabled", "true");
        btn.setAttribute("aria-label", `${label} — visit booked for ${state.visit.name}`);
      } else {
        btn.setAttribute("aria-pressed", String(state.selected === id));
        btn.setAttribute("aria-label", `Book visit ${label}`);
        if (state.status !== "empty") btn.setAttribute("aria-disabled", "true");
      }
      block.appendChild(btn);
    });
    grid.appendChild(block);
  });
}

function render() {
  const booked = state.status === "booked";
  frame.dataset.state = booked ? "booked" : "empty";
  pill.textContent = statusLabel(state);
  renderStepper();
  renderGrid();

  serviceSelect.value = state.job.service;
  addressInput.value = state.job.address;
  noteInput.value = state.job.note;
  for (const el of [serviceSelect, addressInput, noteInput, nameInput]) el.disabled = booked;
  if (booked) nameInput.value = state.visit.name;

  stepJob.hidden = booked || state.step !== 0;
  stepVisit.hidden = booked || state.step !== 1;
  nextBtn.hidden = booked || state.step !== 0;
  nextBtn.disabled = !jobComplete(state);
  backBtn.hidden = booked || state.step !== 1;
  bookBtn.hidden = booked || state.step !== 1;
  bookBtn.disabled = !canBook(state);

  if (booked) {
    selection.textContent = `${describe(state.visit)} · ${state.visit.job.service}`;
    selection.classList.remove("empty");
  } else if (state.selected) {
    const w = parseWindow(state.selected);
    selection.textContent = `${w.day} ${w.window.label} · ${w.window.hours} · ${state.job.service}`;
    selection.classList.remove("empty");
  } else if (state.step === 1) {
    selection.textContent = `${state.job.service} at ${state.job.address}. Pick a visit window.`;
    selection.classList.remove("empty");
  } else {
    selection.textContent = "Describe the job first.";
    selection.classList.add("empty");
  }

  outcome.hidden = !booked;
  if (booked) {
    outcomeHead.textContent = `Visit booked · ${describe(state.visit)} · on the calendar`;
    outcomeDetail.textContent = `${state.visit.job.service} at ${state.visit.job.address} · ${state.visit.name}. The job rides with the visit. No call was made, nothing was sent. Sample visit.`;
  }

  friction.dataset.muted = String(booked);
  frictionLineEl.textContent = frictionLine(state);
}

function showToast(text) {
  toastText.textContent = text;
  toast.dataset.show = "true";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.dataset.show = "false";
  }, 4000);
}

form.addEventListener("input", (event) => {
  const el = event.target;
  const key = el.dataset.job;
  if (!key) return;
  state = setJob(state, key, el.value);
  nextBtn.disabled = !jobComplete(state);
});

nextBtn.addEventListener("click", () => {
  state = next(state);
  render();
  const firstSlot = grid.querySelector("button.slot");
  if (firstSlot) firstSlot.focus();
});

backBtn.addEventListener("click", () => {
  state = back(state);
  render();
  serviceSelect.focus();
});

grid.addEventListener("click", (event) => {
  const btn = event.target.closest("button.slot");
  if (!btn || state.status !== "empty") return;
  state = selectWindow(state, btn.dataset.slot);
  render();
  nameInput.focus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const r = book(state, nameInput.value);
  if (!r.ok) return;
  render();
  showToast(`Visit booked · on the calendar · ${describe(r.visit)}`);
  const el = grid.querySelector(`[data-slot="${r.visit.id}"]`);
  if (el) el.focus();
});

$("load-example").addEventListener("click", () => {
  state = bookedState();
  render();
  showToast("Example visit loaded · on the calendar");
});

$("reset-empty").addEventListener("click", () => {
  state = emptyState();
  nameInput.value = "";
  render();
  toast.dataset.show = "false";
});

render();
