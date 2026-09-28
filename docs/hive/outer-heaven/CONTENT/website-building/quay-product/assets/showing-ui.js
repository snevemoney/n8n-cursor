import {
  DAYS,
  LISTINGS,
  MAX_WINDOWS,
  TIMES,
  WEEK_LABEL,
  approve,
  approvedState,
  canRequest,
  describe,
  emptyState,
  frictionLine,
  listing,
  parseSlot,
  request,
  requestedState,
  selectListing,
  slotId,
  slotStatus,
  stateFromQuery,
  statusLabel,
  toggleWindow,
} from "./showing.js";

const $ = (id) => document.getElementById(id);

const frame = $("showing-frame");
const pill = $("showing-state");
const grid = $("grid");
const weekLabel = $("week-label");
const listingsEl = $("listings");
const selection = $("selection");
const nameInput = $("buyer");
const form = $("request-form");
const requestBtn = $("request-btn");
const approveBtn = $("approve-btn");
const approvePicker = $("approve-picker");
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

function renderListings() {
  listingsEl.replaceChildren();
  for (const l of LISTINGS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "card listing";
    btn.dataset.listing = l.id;
    btn.setAttribute("aria-pressed", String(state.listingId === l.id));
    btn.disabled = state.status !== "empty";
    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.setAttribute("aria-hidden", "true");
    const h = document.createElement("h3");
    h.textContent = l.title;
    const m = document.createElement("p");
    m.className = "meta";
    m.textContent = l.meta;
    btn.append(thumb, h, m);
    listingsEl.appendChild(btn);
  }
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
    head.classList.toggle("has-confirmed", state.approved?.day === day);
    block.appendChild(head);

    TIMES.forEach((time, t) => {
      const id = slotId(day, time);
      const status = slotStatus(state, id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.dataset.slot = id;
      btn.dataset.status = status === "selected" ? "open" : status;
      btn.style.setProperty("--c", String(d + 2));
      btn.style.setProperty("--r", String(t + 2));
      const when = document.createElement("span");
      when.className = "when";
      when.textContent = time;
      const title = document.createElement("span");
      title.className = "title";
      title.textContent = status === "approved" ? "Showing" : status === "requested" ? "Offered" : "Open";
      btn.append(when, title);
      if (status === "approved") {
        const who = document.createElement("span");
        who.className = "who";
        who.textContent = `✓ ${state.approved.name}`;
        btn.appendChild(who);
        btn.setAttribute("aria-disabled", "true");
        btn.setAttribute("aria-label", `${describe(parseSlot(id))} — showing approved for ${state.approved.name}`);
      } else {
        btn.setAttribute("aria-pressed", String(status === "selected"));
        btn.setAttribute("aria-label", `Offer ${describe(parseSlot(id))}`);
        if (state.status !== "empty") btn.setAttribute("aria-disabled", "true");
      }
      block.appendChild(btn);
    });
    grid.appendChild(block);
  });
}

function renderApprovePicker() {
  approvePicker.replaceChildren();
  if (state.status !== "requested") return;
  for (const id of state.windows) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.approve = id;
    chip.textContent = `Approve ${describe(parseSlot(id))}`;
    approvePicker.appendChild(chip);
  }
}

function render() {
  frame.dataset.state = state.status;
  pill.textContent = statusLabel(state);
  renderListings();
  renderGrid();
  renderApprovePicker();

  const l = listing(state);
  if (state.status === "empty") {
    const parts = [];
    parts.push(l ? l.title : "Pick a listing.");
    if (state.windows.length) {
      parts.push(state.windows.map((id) => describe(parseSlot(id))).join(" · "));
    } else {
      parts.push(`Offer up to ${MAX_WINDOWS} windows on the calendar.`);
    }
    selection.textContent = parts.join(" — ");
    selection.classList.toggle("empty", !l || !state.windows.length);
  } else {
    selection.textContent = `${l.title} — ${state.windows.map((id) => describe(parseSlot(id))).join(" · ")}`;
    selection.classList.remove("empty");
  }

  nameInput.disabled = state.status !== "empty";
  nameInput.value = state.status === "empty" ? nameInput.value : state.name;
  requestBtn.disabled = !canRequest(state);
  requestBtn.hidden = state.status !== "empty";
  approveBtn.hidden = state.status !== "requested";
  approvePicker.hidden = state.status !== "requested";

  outcome.hidden = state.status !== "approved";
  if (state.status === "approved") {
    outcomeHead.textContent = `Approved · ${describe(state.approved)} · on the calendar`;
    outcomeDetail.textContent = `${state.approved.listing.title} · ${state.approved.name}. Nothing was dialled, texted, or emailed. Sample showing.`;
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

listingsEl.addEventListener("click", (event) => {
  const btn = event.target.closest("button.listing");
  if (!btn) return;
  state = selectListing(state, btn.dataset.listing);
  render();
});

grid.addEventListener("click", (event) => {
  const btn = event.target.closest("button.slot");
  if (!btn || state.status !== "empty") return;
  state = toggleWindow(state, btn.dataset.slot);
  render();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const r = request(state, nameInput.value);
  if (!r.ok) return;
  render();
  showToast("Requested · awaiting agent approval");
  approveBtn.focus();
});

approveBtn.addEventListener("click", () => {
  const r = approve(state);
  if (!r.ok) return;
  render();
  showToast(`Approved · on the calendar · ${describe(r.approved)}`);
  const el = grid.querySelector(`[data-slot="${r.approved.id}"]`);
  if (el) el.focus();
});

approvePicker.addEventListener("click", (event) => {
  const chip = event.target.closest("button.chip");
  if (!chip) return;
  const r = approve(state, chip.dataset.approve);
  if (!r.ok) return;
  render();
  showToast(`Approved · on the calendar · ${describe(r.approved)}`);
});

$("load-requested").addEventListener("click", () => {
  state = requestedState();
  render();
  showToast("Example request loaded · awaiting approval");
});

$("load-approved").addEventListener("click", () => {
  state = approvedState();
  render();
  showToast("Example showing loaded · on the calendar");
});

$("reset-empty").addEventListener("click", () => {
  state = emptyState();
  nameInput.value = "";
  render();
  toast.dataset.show = "false";
});

render();
