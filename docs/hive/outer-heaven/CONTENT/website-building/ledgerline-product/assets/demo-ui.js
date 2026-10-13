import {
  CLEAR_LINES,
} from "./clarity.js";
import {
  DAYS,
  ROLES,
  TIMES,
  WEEK_LABEL,
  book,
  bookedState,
  canBook,
  clearSelection,
  describe,
  emptyState,
  frictionLine,
  select,
  setRole,
  slotId,
  stateFromQuery,
  statusLabel,
} from "./demo.js";

const $ = (id) => document.getElementById(id);

const frame = $("demo-frame");
const pill = $("demo-state");
const grid = $("grid");
const weekLabel = $("week-label");
const selection = $("selection");
const nameInput = $("lead");
const roleSelect = $("role");
const form = $("demo-form");
const bookBtn = $("book-btn");
const clearBtn = $("clear-btn");
const outcome = $("outcome");
const outcomeHead = $("outcome-headline");
const outcomeDetail = $("outcome-detail");
const friction = $("friction");
const frictionLineEl = $("friction-line");
const recap = $("clarity-recap");
const toast = $("toast");
const toastText = $("toast-text");

let state = stateFromQuery(window.location.search);
let toastTimer = null;

weekLabel.textContent = WEEK_LABEL;
grid.style.setProperty("--days", String(DAYS.length));

roleSelect.replaceChildren();
const first = document.createElement("option");
first.value = "";
first.textContent = "Choose one";
roleSelect.appendChild(first);
for (const r of ROLES) {
  const opt = document.createElement("option");
  opt.value = r;
  opt.textContent = r;
  roleSelect.appendChild(opt);
}

recap.replaceChildren();
for (const line of CLEAR_LINES) {
  const li = document.createElement("li");
  li.textContent = line;
  recap.appendChild(li);
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
    head.classList.toggle("has-confirmed", state.booked?.day === day);
    block.appendChild(head);

    TIMES.forEach((time, t) => {
      const id = slotId(day, time);
      const slot = state.slots.get(id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.dataset.slot = id;
      btn.dataset.status = slot.status;
      btn.style.setProperty("--c", String(d + 2));
      btn.style.setProperty("--r", String(t + 2));
      const when = document.createElement("span");
      when.className = "when";
      when.textContent = time;
      const title = document.createElement("span");
      title.className = "title";
      title.textContent = slot.status === "booked" ? "Demo" : "Open";
      btn.append(when, title);
      if (slot.status === "booked") {
        const who = document.createElement("span");
        who.className = "who";
        who.textContent = `✓ ${state.booked.name}`;
        btn.appendChild(who);
        btn.setAttribute("aria-disabled", "true");
        btn.setAttribute("aria-label", `${describe(slot)} — demo booked for ${state.booked.name}`);
      } else {
        btn.setAttribute("aria-pressed", String(state.selected === id));
        btn.setAttribute("aria-label", `Book demo ${describe(slot)}`);
        if (state.status !== "empty") btn.setAttribute("aria-disabled", "true");
      }
      block.appendChild(btn);
    });
    grid.appendChild(block);
  });
}

function render() {
  frame.dataset.state = state.status;
  pill.textContent = statusLabel(state);
  renderGrid();

  if (state.selected) {
    selection.textContent = `${describe(state.slots.get(state.selected))} · 30 min · sample`;
    selection.classList.remove("empty");
  } else if (state.status === "booked") {
    selection.textContent = `${describe(state.booked)} · ${state.booked.role}`;
    selection.classList.remove("empty");
  } else {
    selection.textContent = "Pick a slot on the calendar.";
    selection.classList.add("empty");
  }

  roleSelect.value = state.role;
  roleSelect.disabled = state.status !== "empty";
  nameInput.disabled = state.status !== "empty";
  if (state.status === "booked") nameInput.value = state.booked.name;
  bookBtn.disabled = !canBook(state);
  bookBtn.hidden = state.status !== "empty";
  clearBtn.hidden = state.status !== "empty";

  outcome.hidden = state.status !== "booked";
  if (state.status === "booked") {
    outcomeHead.textContent = `Demo booked · ${describe(state.booked)} · on the calendar`;
    outcomeDetail.textContent = `${state.booked.name} · ${state.booked.role} · ${state.booked.length}. No invite was sent, no CRM was written. Sample demo.`;
  }

  friction.dataset.muted = String(state.status === "booked");
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
  if (!btn || state.status !== "empty" || btn.dataset.status === "booked") return;
  state = select(state, btn.dataset.slot);
  render();
  roleSelect.focus();
});

roleSelect.addEventListener("change", () => {
  state = setRole(state, roleSelect.value);
  render();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const r = book(state, nameInput.value);
  if (!r.ok) return;
  render();
  showToast(`Demo booked · on the calendar · ${describe(r.booked)}`);
  const el = grid.querySelector(`[data-slot="${slotId(r.booked.day, r.booked.time)}"]`);
  if (el) el.focus();
});

clearBtn.addEventListener("click", () => {
  state = clearSelection(state);
  render();
});

$("load-example").addEventListener("click", () => {
  state = bookedState();
  render();
  showToast("Example demo loaded · on the calendar");
});

$("reset-empty").addEventListener("click", () => {
  state = emptyState();
  nameInput.value = "";
  render();
  toast.dataset.show = "false";
});

render();
