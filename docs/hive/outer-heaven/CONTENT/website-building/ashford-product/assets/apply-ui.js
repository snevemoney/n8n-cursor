import {
  LOOKING_FOR,
  REFERRAL,
  STEPS,
  TIMELINE,
  back,
  emptyState,
  frictionLine,
  next,
  receivedState,
  setAnswer,
  stateFromQuery,
  statusLabel,
  stepComplete,
  submit,
} from "./apply.js";

const $ = (id) => document.getElementById(id);

const frame = $("apply-frame");
const pill = $("apply-state");
const stepper = $("stepper");
const form = $("apply-form");
const steps = [...document.querySelectorAll(".step")];
const nextBtn = $("next-btn");
const backBtn = $("back-btn");
const submitBtn = $("submit-btn");
const review = $("review-list");
const outcome = $("outcome");
const outcomeHead = $("outcome-headline");
const outcomeDetail = $("outcome-detail");
const outcomeRef = $("outcome-ref");
const friction = $("friction");
const frictionLineEl = $("friction-line");
const toast = $("toast");
const toastText = $("toast-text");

let state = stateFromQuery(window.location.search);
let toastTimer = null;

function fillOptions(select, options, placeholder) {
  select.replaceChildren();
  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  select.appendChild(first);
  for (const opt of options) {
    const el = document.createElement("option");
    el.value = opt;
    el.textContent = opt;
    select.appendChild(el);
  }
}

fillOptions($("looking-for"), LOOKING_FOR, "Choose one");
fillOptions($("referral"), REFERRAL, "Choose one");
fillOptions($("timeline"), TIMELINE, "Choose one");

function renderStepper() {
  stepper.replaceChildren();
  STEPS.forEach((s, i) => {
    const li = document.createElement("li");
    li.dataset.active = String(i === state.step && state.status !== "received");
    li.dataset.done = String(i < state.step || state.status === "received");
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = String(i + 1);
    li.appendChild(n);
    li.appendChild(document.createTextNode(s.label));
    stepper.appendChild(li);
  });
}

function renderReview() {
  review.replaceChildren();
  const a = state.answers;
  const rows = [
    ["Name", a.name],
    ["Looking for", a.lookingFor],
    ["How you found us", a.referral],
    ["Timeline", a.timeline],
    ["Note", a.note || "—"],
  ];
  for (const [k, v] of rows) {
    const dt = document.createElement("dt");
    dt.textContent = k;
    const dd = document.createElement("dd");
    dd.textContent = v;
    review.append(dt, dd);
  }
}

function render() {
  const received = state.status === "received";
  frame.dataset.state = received ? "received" : "empty";
  pill.textContent = statusLabel(state);

  $("name").value = state.answers.name;
  $("looking-for").value = state.answers.lookingFor;
  $("referral").value = state.answers.referral;
  $("timeline").value = state.answers.timeline;
  $("note").value = state.answers.note;

  steps.forEach((el, i) => {
    el.hidden = received || i !== state.step;
  });
  renderStepper();
  renderReview();

  backBtn.hidden = received || state.step === 0;
  nextBtn.hidden = received || state.step === STEPS.length - 1;
  nextBtn.disabled = !stepComplete(state);
  submitBtn.hidden = received || state.step !== STEPS.length - 1;
  submitBtn.disabled = !stepComplete(state, 2);

  outcome.hidden = !received;
  if (received) {
    outcome.dataset.tone = state.outcome.tier === "not-now" ? "hold" : "go";
    outcome.dataset.tier = state.outcome.tier;
    outcomeHead.textContent = state.outcome.headline;
    outcomeDetail.textContent = state.outcome.line;
    outcomeRef.textContent = `Reference ${state.reference} · SAMPLE · nothing sent`;
  }

  friction.dataset.muted = String(received);
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
  const key = el.dataset.answer;
  if (!key) return;
  state = setAnswer(state, key, el.value);
  nextBtn.disabled = !stepComplete(state);
  submitBtn.disabled = !stepComplete(state, 2);
  renderReview();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const r = submit(state);
  if (!r.ok) return;
  render();
  showToast(`Received · private review · ${r.reference}`);
  outcome.focus();
});

nextBtn.addEventListener("click", () => {
  state = next(state);
  render();
  const first = steps[state.step]?.querySelector("input, select, textarea");
  if (first) first.focus();
});

backBtn.addEventListener("click", () => {
  state = back(state);
  render();
});

$("load-example").addEventListener("click", () => {
  state = receivedState();
  render();
  showToast("Example application loaded · under review");
});

$("reset-empty").addEventListener("click", () => {
  state = emptyState();
  render();
  toast.dataset.show = "false";
});

render();
