// Betawise Earth owned-motion stage — pure geometry + state. No clock, no network, no storage,
// no built-in randomness: points come from a Fibonacci lattice plus a seeded LCG jitter, time comes in
// from the caller (requestAnimationFrame timestamp). Zero stock assets. SAMPLE / CapEx. invent_kpi=0.

export const DENSITY = { sparse: 220, dense: 640 };
export const STYLES = ["dots", "wire"];
export const SEED = 20260917;
export const DEG_PER_SEC = 18;

// Deterministic pseudo-random in [0, 1). Same seed, same sequence, every load.
export function seeded(seed = SEED) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Even points on a unit sphere (Fibonacci lattice), lightly jittered so it reads as texture, not a grid.
export function spherePoints(n, seed = SEED) {
  const rnd = seeded(seed);
  const pts = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i += 1) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i + (rnd() - 0.5) * 0.08;
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return pts;
}

export function rotateY(p, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

// Orthographic projection onto a square of `size` px with a small tilt so the pole shows.
export function project(p, size, tilt = 0.35) {
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const y = p.y * ct - p.z * st;
  const z = p.y * st + p.z * ct;
  const half = size / 2;
  const radius = half * 0.82;
  return { x: half + p.x * radius, y: half - y * radius, depth: z };
}

export function createState(opts = {}) {
  return {
    running: false,
    density: DENSITY[opts.density] ? opts.density : "sparse",
    style: STYLES.includes(opts.style) ? opts.style : "dots",
    angle: 0, // radians
    frames: 0,
    lastTs: null,
  };
}

export function start(state) {
  state.running = true;
  state.lastTs = null;
  return state;
}

export function pause(state) {
  state.running = false;
  state.lastTs = null;
  return state;
}

export function setDensity(state, density) {
  if (DENSITY[density]) state.density = density;
  return state;
}

export function setStyle(state, style) {
  if (STYLES.includes(style)) state.style = style;
  return state;
}

export function pointCount(state) {
  return DENSITY[state.density];
}

// Advance rotation from a monotonic timestamp (ms). First call after start only records the time.
export function tick(state, ts) {
  if (!state.running) return { advanced: false };
  if (state.lastTs === null) {
    state.lastTs = ts;
    return { advanced: false };
  }
  const dt = Math.max(0, Math.min(100, ts - state.lastTs));
  state.lastTs = ts;
  state.angle = (state.angle + (dt / 1000) * DEG_PER_SEC * (Math.PI / 180)) % (Math.PI * 2);
  state.frames += 1;
  return { advanced: dt > 0, dt };
}

export function degrees(state) {
  return Math.round(((state.angle * 180) / Math.PI) * 10) / 10;
}

export function stageState(state) {
  return state.running ? "live" : state.frames > 0 ? "paused" : "dark";
}

export function stageLabel(state) {
  const s = stageState(state);
  if (s === "dark") return "dark · 0 stock assets";
  if (s === "paused") return `paused · ${degrees(state)}° · 0 stock assets`;
  return "live · 0 stock assets";
}

export function stateFromQuery(search) {
  const params = new URLSearchParams(search);
  const s = createState({ density: params.get("density"), style: params.get("style") });
  if (params.get("state") === "live") start(s);
  return s;
}
