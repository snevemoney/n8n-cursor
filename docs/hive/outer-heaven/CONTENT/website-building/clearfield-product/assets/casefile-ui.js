import {
  EVIDENCE,
  RELATIONS,
  addClaim,
  attach,
  canAttach,
  claimStatus,
  counts,
  createState,
  detach,
  exampleState,
  getClaim,
  selectClaim,
  stageLabel,
  stageState,
  stateFromQuery,
  summary,
} from "./casefile.js";

const $ = (id) => document.getElementById(id);

const casefile = $("casefile");
const caseState = $("case-state");
const claimsEl = $("claims");
const evidenceEl = $("evidence");
const relation = $("relation");
const attachBtn = $("attach-btn");
const claimForm = $("claim-form");
const claimText = $("claim-text");
const summaryEl = $("summary");
const pick = $("pick");
const toast = $("toast");
const toastText = $("toast-text");
const friction = $("friction");
const frictionLine = $("friction-line");

let state = stateFromQuery(window.location.search);
let pickedEvidence = null;
let toastTimer = null;

for (const r of RELATIONS) {
  const o = document.createElement("option");
  o.value = r;
  o.textContent = r;
  relation.appendChild(o);
}

function render() {
  const stage = stageState(state);
  casefile.dataset.state = stage;
  caseState.textContent = stageLabel(state);

  claimsEl.replaceChildren();
  if (!state.claims.length) {
    const n = document.createElement("div");
    n.className = "empty-note";
    n.textContent = "No claims yet. Add one, then attach what you found to it.";
    claimsEl.appendChild(n);
  }
  for (const c of state.claims) claimsEl.appendChild(renderClaim(c));

  evidenceEl.replaceChildren();
  const sel = state.selected ? getClaim(state, state.selected) : null;
  for (const e of EVIDENCE) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "evidence";
    b.dataset.evidence = e.id;
    const used = sel?.attachments.find((a) => a.evidence === e.id);
    b.dataset.used = used ? used.relation : "";
    b.setAttribute("aria-pressed", pickedEvidence === e.id ? "true" : "false");
    b.setAttribute("aria-label", `${e.id} ${e.title}${used ? ` — attached as ${used.relation}` : ""}`);
    const id = document.createElement("span");
    id.className = "eid";
    id.textContent = e.id;
    const t = document.createElement("span");
    t.className = "etitle";
    t.textContent = e.title;
    const k = document.createElement("span");
    k.className = "ekind";
    k.textContent = used ? `attached · ${used.relation}` : e.kind;
    b.append(id, t, k);
    evidenceEl.appendChild(b);
  }

  attachBtn.disabled = !(pickedEvidence && canAttach(state, pickedEvidence, relation.value));
  if (!sel) pick.textContent = "Pick a claim on the left.";
  else if (!pickedEvidence) pick.textContent = `${sel.id} selected · pick evidence.`;
  else pick.textContent = `${pickedEvidence} → ${sel.id} as ${relation.value}`;
  pick.classList.toggle("empty", !sel || !pickedEvidence);

  const sum = summary(state);
  summaryEl.textContent = `${sum.claims} claims · ${sum.attachments} attachments · ${sum.contested} contested · ${sum.verdicts} verdicts`;

  const sorted = stage === "linked";
  friction.dataset.muted = sorted ? "true" : "false";
  frictionLine.textContent = sorted
    ? "Quiet. Everything found hangs on a claim — and nobody ruled."
    : "The feed with nothing to hang on. Not what the workbench shows.";
}

function renderClaim(c) {
  const row = document.createElement("div");
  row.className = "claim";
  row.dataset.claim = c.id;
  row.dataset.status = claimStatus(c);
  row.dataset.selected = state.selected === c.id ? "true" : "false";

  const head = document.createElement("button");
  head.type = "button";
  head.className = "claim-pick";
  head.dataset.select = c.id;
  head.setAttribute("aria-pressed", state.selected === c.id ? "true" : "false");
  const id = document.createElement("span");
  id.className = "cid";
  id.textContent = c.id;
  const text = document.createElement("span");
  text.className = "claim-text";
  text.textContent = c.text;
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = claimStatus(c);
  head.append(id, text, badge);
  row.appendChild(head);

  const n = counts(c);
  const tally = document.createElement("div");
  tally.className = "tally";
  for (const r of RELATIONS) {
    const s = document.createElement("span");
    s.dataset.rel = r;
    s.textContent = `${n[r]} ${r}`;
    tally.appendChild(s);
  }
  row.appendChild(tally);

  if (c.attachments.length) {
    const list = document.createElement("div");
    list.className = "chips";
    for (const a of c.attachments) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset.rel = a.relation;
      b.dataset.detach = a.evidence;
      b.dataset.claim = c.id;
      b.textContent = `${a.evidence} · ${a.relation} ×`;
      b.setAttribute("aria-label", `Detach ${a.evidence} (${a.relation}) from ${c.id}`);
      list.appendChild(b);
    }
    row.appendChild(list);
  }
  return row;
}

function showToast(text) {
  toastText.textContent = text;
  toast.dataset.show = "true";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.dataset.show = "false";
  }, 4000);
}

claimForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const r = addClaim(state, claimText.value);
  if (!r.ok) return;
  claimText.value = "";
  pickedEvidence = null;
  render();
  showToast(`${r.claim.id} added · pick evidence to attach`);
});

claimsEl.addEventListener("click", (e) => {
  const d = e.target.closest("[data-detach]");
  if (d) {
    detach(state, d.dataset.claim, d.dataset.detach);
    render();
    return;
  }
  const s = e.target.closest("[data-select]");
  if (!s) return;
  selectClaim(state, s.dataset.select);
  render();
});

evidenceEl.addEventListener("click", (e) => {
  const b = e.target.closest("[data-evidence]");
  if (!b) return;
  pickedEvidence = pickedEvidence === b.dataset.evidence ? null : b.dataset.evidence;
  render();
  if (!attachBtn.disabled) attachBtn.focus();
});

relation.addEventListener("change", render);

attachBtn.addEventListener("click", () => {
  const r = attach(state, pickedEvidence, relation.value);
  if (!r.ok) {
    showToast(r.reason === "already attached" ? "Already attached · once per claim" : "Pick a claim, evidence and relation");
    return;
  }
  pickedEvidence = null;
  render();
  const status = claimStatus(r.claim);
  showToast(
    status === "contested"
      ? `${r.attachment.evidence} attached · ${r.claim.id} now contested · 0 verdicts`
      : `${r.attachment.evidence} attached as ${r.attachment.relation} · ${r.claim.id}`,
  );
  const el = claimsEl.querySelector(`[data-select="${r.claim.id}"]`);
  if (el) el.focus();
});

$("load-example").addEventListener("click", () => {
  state = exampleState();
  pickedEvidence = null;
  render();
  showToast("Example casefile loaded · 3 claims · 1 contested · 0 verdicts");
});

$("reset-empty").addEventListener("click", () => {
  state = createState();
  pickedEvidence = null;
  render();
  toast.dataset.show = "false";
});

render();
