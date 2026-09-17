import { CLEAR_LINES, FOG_FEATURES, modeCopy, modeFromQuery, toggleMode } from "./clarity.js";

const $ = (id) => document.getElementById(id);

const clarity = $("clarity");
const eyebrow = $("clarity-eyebrow");
const lines = $("clarity-lines");
const count = $("clarity-count");
const toggle = $("clarity-toggle");

let mode = modeFromQuery(window.location.search);

function render() {
  const copy = modeCopy(mode);
  clarity.dataset.mode = mode;
  eyebrow.textContent = copy.eyebrow;
  count.textContent = copy.count;
  toggle.textContent = copy.button;
  toggle.setAttribute("aria-pressed", String(mode === "fog"));
  lines.replaceChildren();
  const items = mode === "fog" ? FOG_FEATURES : CLEAR_LINES;
  for (const text of items) {
    const li = document.createElement("li");
    li.textContent = text;
    lines.appendChild(li);
  }
}

toggle.addEventListener("click", () => {
  mode = toggleMode(mode);
  render();
});

render();
