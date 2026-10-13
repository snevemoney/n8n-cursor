import {
  COHORTS,
  SEATS_PER_COHORT,
  canRequest,
  cohort,
  emptyState,
  frictionLine,
  heldState,
  isFull,
  outcomeCopy,
  requestSeat,
  seatStatus,
  selectCohort,
  selectSeat,
  stateFromQuery,
  statusLabel,
  waitlistedState,
} from "./seat.js";

const $ = (id) => document.getElementById(id);

const frame = $("seat-frame");
const pill = $("seat-state");
const cohortChips = $("cohorts");
const cohortWhen = $("cohort-when");
const seats = $("seats");
const selection = $("selection");
const nameInput = $("maker");
const form = $("seat-form");
const requestBtn = $("request-btn");
const outcome = $("outcome");
const outcomeHead = $("outcome-headline");
const outcomeDetail = $("outcome-detail");
const friction = $("friction");
const frictionLineEl = $("friction-line");
const toast = $("toast");
const toastText = $("toast-text");

let state = stateFromQuery(window.location.search);
let toastTimer = null;

function renderCohorts() {
  cohortChips.replaceChildren();
  for (const c of COHORTS) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.cohort = c.id;
    chip.textContent = isFull(c) ? `${c.name} · full` : c.name;
    chip.setAttribute("aria-pressed", String(state.cohortId === c.id));
    chip.disabled = state.status !== "empty";
    cohortChips.appendChild(chip);
  }
  cohortWhen.textContent = cohort(state.cohortId).when;
}

function renderSeats() {
  seats.replaceChildren();
  for (let n = 1; n <= SEATS_PER_COHORT; n += 1) {
    const status = seatStatus(state, n);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot";
    btn.dataset.seat = String(n);
    btn.dataset.status = status === "selected" ? "open" : status;
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = `Seat ${n}`;
    btn.appendChild(title);
    if (status === "held") {
      const who = document.createElement("span");
      who.className = "who";
      who.textContent = `✓ ${state.result.name}`;
      btn.appendChild(who);
      btn.setAttribute("aria-disabled", "true");
      btn.setAttribute("aria-label", `Seat ${n} — held for ${state.result.name}`);
    } else if (status === "taken") {
      btn.setAttribute("aria-disabled", "true");
      btn.setAttribute("aria-label", `Seat ${n} — taken`);
    } else {
      btn.setAttribute("aria-pressed", String(status === "selected"));
      btn.setAttribute("aria-label", `Request seat ${n}`);
      if (state.status !== "empty") btn.setAttribute("aria-disabled", "true");
    }
    seats.appendChild(btn);
  }
}

function render() {
  frame.dataset.state = state.status;
  pill.textContent = statusLabel(state);
  renderCohorts();
  renderSeats();

  const c = cohort(state.cohortId);
  if (state.status === "empty") {
    if (isFull(c)) {
      selection.textContent = `${c.name} is full. Request a waitlist place.`;
      selection.classList.remove("empty");
    } else if (state.selectedSeat) {
      selection.textContent = `${c.name} · Seat ${state.selectedSeat}`;
      selection.classList.remove("empty");
    } else {
      selection.textContent = "Pick an open seat.";
      selection.classList.add("empty");
    }
  } else {
    selection.textContent = `${c.name} · ${statusLabel(state)}`;
    selection.classList.remove("empty");
  }

  nameInput.disabled = state.status !== "empty";
  if (state.status !== "empty") nameInput.value = state.name;
  requestBtn.disabled = !canRequest(state);
  requestBtn.hidden = state.status !== "empty";
  requestBtn.textContent = isFull(c) ? "Join the waitlist" : "Request this seat";

  const copy = outcomeCopy(state);
  outcome.hidden = !copy;
  if (copy) {
    outcome.dataset.tone = state.status === "waitlisted" ? "hold" : "go";
    outcomeHead.textContent = copy.headline;
    outcomeDetail.textContent = copy.detail;
  }

  friction.dataset.muted = String(state.status !== "empty");
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

cohortChips.addEventListener("click", (event) => {
  const chip = event.target.closest("button.chip");
  if (!chip) return;
  state = selectCohort(state, chip.dataset.cohort);
  render();
});

seats.addEventListener("click", (event) => {
  const btn = event.target.closest("button.slot");
  if (!btn || state.status !== "empty") return;
  state = selectSeat(state, Number(btn.dataset.seat));
  render();
  nameInput.focus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const r = requestSeat(state, nameInput.value);
  if (!r.ok) return;
  render();
  showToast(
    r.result.kind === "held"
      ? `Seat ${r.result.seat} held · ${cohort(r.result.cohortId).name}`
      : `Waitlist · place ${r.result.position} · ${cohort(r.result.cohortId).name}`,
  );
  outcome.focus();
});

$("load-held").addEventListener("click", () => {
  state = heldState();
  render();
  showToast("Example seat loaded · held");
});

$("load-waitlisted").addEventListener("click", () => {
  state = waitlistedState();
  render();
  showToast("Example waitlist place loaded");
});

$("reset-empty").addEventListener("click", () => {
  state = emptyState();
  nameInput.value = "";
  render();
  toast.dataset.show = "false";
});

render();
