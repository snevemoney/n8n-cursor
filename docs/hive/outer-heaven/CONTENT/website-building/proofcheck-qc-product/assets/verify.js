// ProofCheck QC verify gate — pure state. No clock, no network, no storage, no model.
// "Verify Now" here is a deterministic cite check: does every claim point at an attached source?
// It never rewrites a word. Every value is SAMPLE / CapEx. invent_kpi=0.

export const SOURCES = [
  { id: "S1", title: "Intake notes", kind: "notes" },
  { id: "S2", title: "Owner interview", kind: "transcript" },
  { id: "S3", title: "Price sheet", kind: "sheet" },
  { id: "S4", title: "Archived site copy", kind: "page" },
];

export const EXAMPLE_SOURCES = ["S1", "S2", "S3"];

// Three claims, the third uncited — the amber flag picture.
export const EXAMPLE_DRAFT =
  "We open at seven because the first shift asked for it [S1]. " +
  "Most members come twice a week and stay for the coffee [S2]. " +
  "The intro session costs nothing on a first visit.";

// Same words, third claim cited — the gate-open picture.
export const EXAMPLE_DRAFT_CITED = EXAMPLE_DRAFT.replace(/visit\.$/, "visit [S3].");

const CITE_RE = /\[(S\d+)\]/g;

export function createState() {
  return {
    sources: new Set(),
    draft: "",
    baseline: null, // words at first Verify Now — the voice we keep
    report: null,
  };
}

export function attachSource(state, id) {
  if (SOURCES.some((s) => s.id === id)) state.sources.add(id);
  return state;
}

export function detachSource(state, id) {
  state.sources.delete(id);
  return state;
}

export function setDraft(state, text) {
  state.draft = String(text ?? "");
  return state;
}

export function canVerify(state) {
  return state.sources.size > 0 && state.draft.trim().length > 0;
}

export function splitClaims(text) {
  return String(text ?? "")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function citesOf(sentence) {
  return [...sentence.matchAll(CITE_RE)].map((m) => m[1]);
}

// Words only — citation markers and punctuation are not voice.
export function words(text) {
  return String(text ?? "")
    .replace(CITE_RE, " ")
    .toLowerCase()
    .match(/[a-z0-9']+/g) ?? [];
}

// How many words in `current` were not in `baseline` (multiset). 0 = voice kept.
export function wordsChanged(baseline, current) {
  const pool = new Map();
  for (const w of words(baseline)) pool.set(w, (pool.get(w) ?? 0) + 1);
  let changed = 0;
  for (const w of words(current)) {
    const n = pool.get(w) ?? 0;
    if (n > 0) pool.set(w, n - 1);
    else changed += 1;
  }
  return changed;
}

export function verify(state) {
  if (!canVerify(state)) return { ok: false, reason: "need a source and a draft" };
  if (state.baseline === null) state.baseline = state.draft;
  const claims = splitClaims(state.draft).map((text, index) => {
    const cites = citesOf(text);
    const missing = cites.filter((id) => !state.sources.has(id));
    const status = cites.length > 0 && missing.length === 0 ? "cited" : "uncited";
    return { index, text, cites, missing, status };
  });
  const uncited = claims.filter((c) => c.status === "uncited").length;
  state.report = {
    claims,
    uncited,
    wordsChanged: wordsChanged(state.baseline, state.draft),
    gate: uncited === 0 ? "open" : "closed",
  };
  return { ok: true, report: state.report };
}

// Append a citation marker to one claim. Words untouched, then verify again.
export function cite(state, claimIndex, sourceId) {
  if (!state.report) return { ok: false, reason: "verify first" };
  if (!state.sources.has(sourceId)) return { ok: false, reason: "source not attached" };
  const claims = splitClaims(state.draft);
  const target = claims[claimIndex];
  if (!target) return { ok: false, reason: "no such claim" };
  if (citesOf(target).includes(sourceId)) return { ok: false, reason: "already cited" };
  const m = target.match(/([.!?])$/);
  const body = m ? target.slice(0, -1) : target;
  const end = m ? m[1] : "";
  claims[claimIndex] = `${body} [${sourceId}]${end}`;
  state.draft = claims.join(" ");
  return verify(state);
}

export function stageState(state) {
  if (state.report) return state.report.gate === "open" ? "verified" : "closed";
  return canVerify(state) ? "ready" : "empty";
}

export function gateLabel(state) {
  const s = stageState(state);
  if (s === "empty") return "empty";
  if (s === "ready") return "ready · not verified";
  if (s === "closed") return `closed · ${state.report.uncited} uncited`;
  return "open · voice kept";
}

export function exampleState() {
  const s = createState();
  for (const id of EXAMPLE_SOURCES) attachSource(s, id);
  setDraft(s, EXAMPLE_DRAFT);
  return s;
}

export function flaggedState() {
  const s = exampleState();
  verify(s);
  return s;
}

export function verifiedState() {
  const s = createState();
  for (const id of EXAMPLE_SOURCES) attachSource(s, id);
  setDraft(s, EXAMPLE_DRAFT_CITED);
  verify(s);
  return s;
}

export function stateFromQuery(search) {
  const wanted = new URLSearchParams(search).get("state");
  if (wanted === "verified") return verifiedState();
  if (wanted === "flagged") return flaggedState();
  if (wanted === "example") return exampleState();
  return createState();
}
