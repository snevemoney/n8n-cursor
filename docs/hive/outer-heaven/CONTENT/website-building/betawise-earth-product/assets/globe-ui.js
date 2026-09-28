import {
  createState,
  degrees,
  pause,
  pointCount,
  project,
  rotateY,
  setDensity,
  setStyle,
  spherePoints,
  stageLabel,
  stageState,
  start,
  stateFromQuery,
  tick,
} from "./globe.js";

const $ = (id) => document.getElementById(id);

const stage = $("stage");
const stageState_ = $("stage-state");
const canvas = $("globe");
const ctx = canvas.getContext("2d");
const startBtn = $("start-btn");
const pauseBtn = $("pause-btn");
const density = $("density");
const style = $("style");
const readout = $("readout");
const toast = $("toast");
const toastText = $("toast-text");
const friction = $("friction");
const frictionLine = $("friction-line");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let state = stateFromQuery(window.location.search);
let points = spherePoints(pointCount(state));
let raf = null;
let toastTimer = null;
let size = 0;

const brand = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() || "#3fd0a0";
const glow = getComputedStyle(document.documentElement).getPropertyValue("--brand-glow").trim() || "#a4ffe0";

function fit() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  size = Math.max(200, Math.floor(rect.width));
  canvas.width = Math.floor(size * dpr);
  canvas.height = Math.floor(size * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw() {
  ctx.clearRect(0, 0, size, size);
  const dark = stageState(state) === "dark";
  if (dark) {
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.41, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const projected = points
    .map((p) => project(rotateY(p, state.angle), size))
    .sort((a, b) => a.depth - b.depth);

  // atmosphere
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.46);
  g.addColorStop(0, "rgba(63,208,160,0.0)");
  g.addColorStop(1, "rgba(63,208,160,0.18)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2);
  ctx.fill();

  if (state.style === "wire") {
    ctx.lineWidth = 0.8;
    for (let i = 1; i < projected.length; i += 1) {
      const a = projected[i - 1];
      const b = projected[i];
      const front = (a.depth + b.depth) / 2;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > size * 0.12) continue;
      ctx.strokeStyle = front > 0 ? brand : "rgba(63,208,160,0.18)";
      ctx.globalAlpha = front > 0 ? 0.55 : 0.25;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  for (const q of projected) {
    const front = q.depth > 0;
    const r = front ? 1.6 + q.depth * 1.4 : 0.9;
    ctx.fillStyle = front ? (q.depth > 0.75 ? glow : brand) : "rgba(63,208,160,0.22)";
    ctx.beginPath();
    ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderChrome() {
  const s = stageState(state);
  stage.dataset.state = s;
  stageState_.textContent = stageLabel(state);
  startBtn.disabled = state.running;
  pauseBtn.disabled = !state.running;
  startBtn.textContent = state.frames > 0 && !state.running ? "Resume" : "Start the stage";
  density.value = state.density;
  style.value = state.style;
  readout.textContent = `${degrees(state)}° · ${pointCount(state)} points · ${state.frames} frames · ${
    reduceMotion.matches ? "reduced motion: still" : "drawn live"
  }`;
  const live = s !== "dark";
  friction.dataset.muted = live ? "true" : "false";
  frictionLine.textContent = live
    ? "Quiet. Every frame on this stage was drawn here."
    : "The loop everyone has. Not what the stage plays.";
}

function frame(ts) {
  raf = null;
  if (reduceMotion.matches) {
    // One still frame; rotation does not advance.
    state.frames = Math.max(1, state.frames);
    draw();
    renderChrome();
    return;
  }
  const r = tick(state, ts);
  if (r.advanced || state.frames === 0) draw();
  renderChrome();
  if (state.running) raf = requestAnimationFrame(frame);
}

function run() {
  if (raf === null) raf = requestAnimationFrame(frame);
}

function showToast(text) {
  toastText.textContent = text;
  toast.dataset.show = "true";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.dataset.show = "false";
  }, 4000);
}

startBtn.addEventListener("click", () => {
  start(state);
  renderChrome();
  showToast("Stage live · owned · 0 stock assets");
  run();
});

pauseBtn.addEventListener("click", () => {
  pause(state);
  if (raf !== null) cancelAnimationFrame(raf);
  raf = null;
  draw();
  renderChrome();
});

density.addEventListener("change", () => {
  setDensity(state, density.value);
  points = spherePoints(pointCount(state));
  draw();
  renderChrome();
});

style.addEventListener("change", () => {
  setStyle(state, style.value);
  draw();
  renderChrome();
});

$("load-example").addEventListener("click", () => {
  setDensity(state, "dense");
  setStyle(state, "wire");
  points = spherePoints(pointCount(state));
  start(state);
  renderChrome();
  showToast("Dense wire · live");
  run();
});

$("reset-empty").addEventListener("click", () => {
  if (raf !== null) cancelAnimationFrame(raf);
  raf = null;
  state = createState();
  points = spherePoints(pointCount(state));
  draw();
  renderChrome();
  toast.dataset.show = "false";
});

window.addEventListener("resize", () => {
  fit();
  draw();
});
reduceMotion.addEventListener("change", () => {
  renderChrome();
  if (state.running) run();
});

fit();
draw();
renderChrome();
if (state.running) run();
