import {
  VOLUMES,
  createState,
  desk,
  isPulled,
  pulledCount,
  reshelve,
  reshelveAll,
  stageLabel,
  stageState,
  stateFromQuery,
  toggle,
} from "./shelf.js";

const $ = (id) => document.getElementById(id);

const stage = $("shelf-stage");
const shelfState = $("shelf-state");
const shelf = $("shelf");
const deskEl = $("desk");
const reshelveAllBtn = $("reshelve-all");
const toast = $("toast");
const toastText = $("toast-text");
const friction = $("friction");
const frictionLine = $("friction-line");

let state = stateFromQuery(window.location.search);
let toastTimer = null;

function render() {
  const s = stageState(state);
  stage.dataset.state = s;
  shelfState.textContent = stageLabel(state);

  shelf.replaceChildren();
  for (const v of VOLUMES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "spine";
    b.dataset.volume = v.id;
    b.dataset.status = v.status;
    const pulled = isPulled(state, v.id);
    b.dataset.pulled = pulled ? "true" : "false";
    b.setAttribute("aria-pressed", pulled ? "true" : "false");
    b.setAttribute("aria-label", `Volume ${v.numeral} ${v.title}${pulled ? " — on the desk, tap to reshelve" : " — tap to pull"}`);
    const num = document.createElement("span");
    num.className = "numeral";
    num.textContent = v.numeral;
    const title = document.createElement("span");
    title.className = "spine-title";
    title.textContent = v.title;
    b.append(num, title);
    shelf.appendChild(b);
  }

  deskEl.replaceChildren();
  const open = desk(state);
  if (!open.length) {
    const n = document.createElement("div");
    n.className = "empty-note";
    n.textContent = "Nothing pulled. Tap a spine.";
    deskEl.appendChild(n);
  }
  open.forEach((v, i) => {
    const card = document.createElement("article");
    card.className = "volume";
    card.dataset.volume = v.id;
    card.style.setProperty("--i", String(i));
    card.setAttribute("aria-label", `Volume ${v.numeral} ${v.title} open on the desk`);
    const head = document.createElement("div");
    head.className = "volume-head";
    const t = document.createElement("h3");
    t.className = "volume-title";
    t.textContent = `Vol. ${v.numeral} — ${v.title}`;
    const st = document.createElement("span");
    st.className = "status";
    st.dataset.status = v.status;
    st.textContent = v.status;
    head.append(t, st);
    const ol = document.createElement("ol");
    ol.className = "chapters";
    for (const c of v.chapters) {
      const li = document.createElement("li");
      li.textContent = c;
      ol.appendChild(li);
    }
    const back = document.createElement("button");
    back.type = "button";
    back.className = "btn btn-ghost btn-small";
    back.dataset.reshelve = v.id;
    back.textContent = "Reshelve";
    card.append(head, ol, back);
    deskEl.appendChild(card);
  });

  reshelveAllBtn.disabled = pulledCount(state) === 0;

  const live = s === "pulled";
  friction.dataset.muted = live ? "true" : "false";
  frictionLine.textContent = live
    ? "Quiet. This shelf opens."
    : "The shelf that is only a picture. Not what this one does.";
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
  const b = e.target.closest("[data-volume]");
  if (!b) return;
  const r = toggle(state, b.dataset.volume);
  if (!r.ok) return;
  render();
  showToast(r.action === "pulled"
    ? `Vol. ${r.volume.numeral} pulled · ${pulledCount(state)} on the desk`
    : `Vol. ${r.volume.numeral} reshelved`);
  shelf.querySelector(`[data-volume="${b.dataset.volume}"]`)?.focus();
});

deskEl.addEventListener("click", (e) => {
  const b = e.target.closest("[data-reshelve]");
  if (!b) return;
  const r = reshelve(state, b.dataset.reshelve);
  if (!r.ok) return;
  render();
  showToast(`Vol. ${r.volume.numeral} reshelved`);
  shelf.querySelector(`[data-volume="${r.volume.id}"]`)?.focus();
});

reshelveAllBtn.addEventListener("click", () => {
  const r = reshelveAll(state);
  render();
  if (r.ok) showToast(`${r.count} reshelved · desk clear`);
});

$("load-example").addEventListener("click", () => {
  state = stateFromQuery("?state=pulled&vol=v3,v6");
  render();
  showToast("Vol. III + VI on the desk");
});

$("reset-empty").addEventListener("click", () => {
  state = createState();
  render();
  toast.dataset.show = "false";
});

render();
