import {
  DAYS,
  TIMES,
  WEEK_LABEL,
  calendarLabel,
  clearSelection,
  confirm,
  confirmedCount,
  describe,
  emptyState,
  exampleState,
  isEmpty,
  select,
  slotId,
  stateFromQuery,
} from "./booking.js";

const $ = (id) => document.getElementById(id);

const grid = $("grid");
const calendar = $("calendar");
const calState = $("cal-state");
const weekLabel = $("week-label");
const selection = $("selection");
const confirmBtn = $("confirm-btn");
const clearBtn = $("clear-btn");
const memberInput = $("member");
const form = $("book-form");
const toast = $("toast");
const toastText = $("toast-text");
const inbox = $("inbox");
const inboxLine = $("inbox-line");

let state = stateFromQuery(window.location.search);
let toastTimer = null;

weekLabel.textContent = WEEK_LABEL;

function render() {
  grid.replaceChildren();

  const corner = document.createElement("div");
  corner.className = "corner";
  corner.setAttribute("aria-hidden", "true");
  grid.appendChild(corner);

  // Time labels down the left. Placement via --r so desktop rows line up.
  TIMES.forEach((time, t) => {
    const el = document.createElement("div");
    el.className = "time";
    el.textContent = time;
    el.style.setProperty("--r", String(t + 2));
    grid.appendChild(el);
  });

  // One block per day: header + its slots. Desktop: display:contents and each
  // child is placed by --c/--r into the table. Mobile: the block stacks on its own.
  DAYS.forEach((day, d) => {
    const block = document.createElement("div");
    block.className = "day-block";
    block.setAttribute("role", "group");
    block.setAttribute("aria-label", day);

    const head = document.createElement("div");
    head.className = "day";
    head.textContent = day;
    head.style.setProperty("--c", String(d + 2));
    const has = TIMES.some((time) => state.slots.get(slotId(day, time)).status === "confirmed");
    head.classList.toggle("has-confirmed", has);
    block.appendChild(head);

    TIMES.forEach((time, t) => {
      const btn = renderSlot(state.slots.get(slotId(day, time)));
      btn.style.setProperty("--c", String(d + 2));
      btn.style.setProperty("--r", String(t + 2));
      block.appendChild(btn);
    });
    grid.appendChild(block);
  });

  const empty = isEmpty(state);
  calendar.dataset.state = empty ? "empty" : "confirmed";
  calState.textContent = empty
    ? calendarLabel(state)
    : `${calendarLabel(state)} · ${confirmedCount(state)} confirmed`;

  if (state.selected) {
    const slot = state.slots.get(state.selected);
    selection.textContent = describe(slot);
    selection.classList.remove("empty");
    confirmBtn.disabled = false;
  } else {
    selection.textContent = "Pick a slot on the calendar.";
    selection.classList.add("empty");
    confirmBtn.disabled = true;
  }

  inbox.dataset.muted = empty ? "false" : "true";
  inboxLine.textContent = empty
    ? "Interest in the DMs. Empty on the calendar."
    : "Quiet. Bookings land on the calendar — not in your DMs.";
}

function renderSlot(slot) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "slot";
  btn.dataset.slot = slotId(slot.day, slot.time);
  btn.dataset.status = slot.status;
  const when = document.createElement("span");
  when.className = "when";
  when.textContent = slot.time;
  btn.appendChild(when);
  const title = document.createElement("span");
  title.className = "title";
  title.textContent = slot.title;
  btn.appendChild(title);

  if (slot.status === "confirmed") {
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = `✓ ${slot.member}`;
    btn.appendChild(who);
    btn.setAttribute("aria-disabled", "true");
    btn.setAttribute("aria-label", `${describe(slot)} — confirmed for ${slot.member}`);
  } else {
    btn.setAttribute("aria-pressed", state.selected === btn.dataset.slot ? "true" : "false");
    btn.setAttribute("aria-label", `Book ${describe(slot)}`);
  }
  return btn;
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
  if (!btn || btn.dataset.status === "confirmed") return;
  state = select(state, btn.dataset.slot);
  render();
  memberInput.focus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = confirm(state, memberInput.value);
  if (!result.ok) return;
  memberInput.value = "";
  render();
  showToast(`Confirmed · on the calendar · ${describe(result.slot)}`);
  const el = grid.querySelector(`[data-slot="${slotId(result.slot.day, result.slot.time)}"]`);
  if (el) el.focus();
});

clearBtn.addEventListener("click", () => {
  state = clearSelection(state);
  render();
});

$("load-example").addEventListener("click", () => {
  state = exampleState();
  render();
  showToast("Example week loaded · on the calendar");
});

$("reset-empty").addEventListener("click", () => {
  state = emptyState();
  render();
  toast.dataset.show = "false";
});

render();
