import {
  DAYS,
  SLA,
  TIMES,
  VISIT_TYPES,
  WEEK_LABEL,
  advance,
  canSubmit,
  confirmedState,
  describe,
  emptyState,
  frictionLine,
  parseSlot,
  receivedState,
  select,
  setForm,
  setVisitType,
  slotId,
  slotStatus,
  stateFromQuery,
  statusLabel,
  submit,
} from "./private-book.js";

const $ = (id) => document.getElementById(id);

const frame = $("book-frame");
const pill = $("book-state");
const grid = $("grid");
const weekLabel = $("week-label");
const visitSelect = $("visit-type");
const nameInput = $("patient");
const reasonInput = $("reason");
const consentInput = $("consent");
const selection = $("selection");
const form = $("book-form");
const submitBtn = $("submit-btn");
const advanceBtn = $("advance-btn");
const slaTrack = $("sla-track");
const slaLabel = $("sla-label");
const slaLine = $("sla-line");
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
slaLabel.textContent = SLA.label;
grid.style.setProperty("--days", String(DAYS.length));

visitSelect.replaceChildren();
const first = document.createElement("option");
first.value = "";
first.textContent = "Choose one";
visitSelect.appendChild(first);
for (const t of VISIT_TYPES) {
  const opt = document.createElement("option");
  opt.value = t;
  opt.textContent = t;
  visitSelect.appendChild(opt);
}

function renderTrack() {
  slaTrack.replaceChildren();
  SLA.stages.forEach((st, i) => {
    const li = document.createElement("li");
    li.dataset.stage = st.id;
    li.dataset.active = String(i === state.stage);
    li.dataset.done = String(i < state.stage || (state.status === "confirmed" && i === state.stage));
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = String(i + 1);
    li.appendChild(n);
    li.appendChild(document.createTextNode(st.label));
    slaTrack.appendChild(li);
  });
  slaLine.textContent = state.stage >= 0 ? SLA.stages[state.stage].line : "Submit the form and the clock starts. Sample SLA, no real clock.";
}

function renderGrid() {
  grid.replaceChildren();
  const corner = document.createElement("div");
  corner.className = "corner";
  corner.setAttribute("aria-hidden", "true");
  grid.appendChild(corner);

  TIMES.forEach((time, t) => {
    const el = document.createElement("div");
    el.className = "time";
    el.textContent = time;
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
    head.classList.toggle("has-confirmed", state.status === "confirmed" && state.booking?.day === day);
    block.appendChild(head);

    TIMES.forEach((time, t) => {
      const id = slotId(day, time);
      const status = slotStatus(state, id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.dataset.slot = id;
      btn.dataset.status = status;
      btn.style.setProperty("--c", String(d + 2));
      btn.style.setProperty("--r", String(t + 2));
      const when = document.createElement("span");
      when.className = "when";
      when.textContent = time;
      const title = document.createElement("span");
      title.className = "title";
      title.textContent = status === "confirmed" ? "Private slot" : status === "requested" ? "Requested" : "Open";
      btn.append(when, title);
      if (status !== "open") {
        const who = document.createElement("span");
        who.className = "who";
        who.textContent = status === "confirmed" ? "✓ held privately" : "· in review";
        btn.appendChild(who);
        btn.setAttribute("aria-disabled", "true");
        btn.setAttribute("aria-label", `${describe(parseSlot(id))} — ${status} for ${state.booking.visitType}`);
      } else {
        btn.setAttribute("aria-pressed", String(state.selected === id));
        btn.setAttribute("aria-label", `Request ${describe(parseSlot(id))}`);
        if (state.status !== "empty") btn.setAttribute("aria-disabled", "true");
      }
      block.appendChild(btn);
    });
    grid.appendChild(block);
  });
}

function render() {
  const empty = state.status === "empty";
  frame.dataset.state = state.status;
  pill.textContent = statusLabel(state);
  renderGrid();
  renderTrack();

  visitSelect.value = state.visitType;
  nameInput.value = state.form.name;
  reasonInput.value = state.form.reason;
  consentInput.checked = state.form.consent;
  for (const el of [visitSelect, nameInput, reasonInput, consentInput]) el.disabled = !empty;

  if (state.booking) {
    selection.textContent = `${describe(state.booking)} · ${state.booking.visitType}`;
    selection.classList.remove("empty");
  } else if (state.selected) {
    selection.textContent = `${describe(parseSlot(state.selected))}${state.visitType ? ` · ${state.visitType}` : ""}`;
    selection.classList.remove("empty");
  } else {
    selection.textContent = "Pick a private slot on the calendar.";
    selection.classList.add("empty");
  }

  submitBtn.hidden = !empty;
  submitBtn.disabled = !canSubmit(state);
  advanceBtn.hidden = empty || state.status === "confirmed";
  if (!advanceBtn.hidden) {
    advanceBtn.textContent = state.status === "received" ? "Start clinical review (clinic side)" : "Confirm slot (clinic side)";
  }

  outcome.hidden = state.status !== "confirmed";
  if (state.status === "confirmed") {
    outcomeHead.textContent = `Slot confirmed · ${describe(state.booking)} · private`;
    outcomeDetail.textContent = `${state.booking.visitType} · ${state.booking.name}. Form reviewed inside the sample SLA. Nothing was sent, nothing was stored. Sample clinic.`;
  }

  friction.dataset.muted = String(!empty);
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

grid.addEventListener("click", (event) => {
  const btn = event.target.closest("button.slot");
  if (!btn || state.status !== "empty") return;
  state = select(state, btn.dataset.slot);
  render();
  visitSelect.focus();
});

visitSelect.addEventListener("change", () => {
  state = setVisitType(state, visitSelect.value);
  render();
});

form.addEventListener("input", (event) => {
  const el = event.target;
  const key = el.dataset.form;
  if (!key) return;
  state = setForm(state, key, el.type === "checkbox" ? el.checked : el.value);
  submitBtn.disabled = !canSubmit(state);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const r = submit(state);
  if (!r.ok) return;
  render();
  showToast(`Form received · SLA ${SLA.label}`);
  advanceBtn.focus();
});

advanceBtn.addEventListener("click", () => {
  const r = advance(state);
  if (!r.ok) return;
  render();
  showToast(
    r.stage.id === "confirmed"
      ? `Slot confirmed · private · ${describe(state.booking)}`
      : `${r.stage.label} · SLA ${SLA.label}`,
  );
  if (r.stage.id === "confirmed") {
    const el = grid.querySelector(`[data-slot="${state.booking.id}"]`);
    if (el) el.focus();
  }
});

$("load-received").addEventListener("click", () => {
  state = receivedState();
  render();
  showToast("Example form loaded · received");
});

$("load-confirmed").addEventListener("click", () => {
  state = confirmedState();
  render();
  showToast("Example slot loaded · confirmed · private");
});

$("reset-empty").addEventListener("click", () => {
  state = emptyState();
  render();
  toast.dataset.show = "false";
});

render();
