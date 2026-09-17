import { EXAMPLES, checkDoor } from "./door-check.js";

const $ = (id) => document.getElementById(id);

const form = $("check-form");
const input = $("site-url");
const chips = $("chips");
const result = $("result");
const headline = $("result-headline");
const detail = $("result-detail");
const path = $("result-path");
const wall = $("wall");
const actions = $("result-actions");

const EYEBROW = {
  pass: "Path works",
  fail: "Hit a wall",
  invalid: "Not a site address",
  unknown: "Not checked",
};

for (const host of EXAMPLES) {
  const chip = document.createElement("button");
  chip.type = "button";
  chip.className = "chip";
  chip.textContent = host;
  chip.addEventListener("click", () => {
    input.value = host;
    run();
    input.focus();
  });
  chips.appendChild(chip);
}

function run() {
  const r = checkDoor(input.value);
  result.hidden = false;
  result.dataset.status = r.status;
  $("result-eyebrow").textContent = EYEBROW[r.status];
  headline.textContent = r.headline;
  detail.textContent = r.detail;
  path.textContent = r.host ? `${r.host}${r.path ?? ""}` : "";
  wall.hidden = r.status !== "fail";
  actions.hidden = r.status !== "pass";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  run();
});

form.addEventListener("reset", () => {
  result.hidden = true;
  result.dataset.status = "idle";
  wall.hidden = true;
  actions.hidden = true;
});

// ?url= lets a click-live flow land on a deterministic state.
const preset = new URLSearchParams(window.location.search).get("url");
if (preset) {
  input.value = preset;
  run();
}
