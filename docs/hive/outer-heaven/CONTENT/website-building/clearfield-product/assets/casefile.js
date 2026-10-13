// Clearfield casefile — pure state. No clock, no network, no storage.
// Claims on the left, evidence pool on the right, attachments carry a relation the analyst picks.
// There is no verdict here. `contested` is structural: a claim with both a supports and a contradicts.
// Every value is SAMPLE / CapEx. invent_kpi=0.

export const RELATIONS = ["supports", "contradicts", "context"];

export const EVIDENCE = [
  { id: "E1", title: "Council minutes · sample", kind: "document" },
  { id: "E2", title: "Site photo · sample", kind: "image" },
  { id: "E3", title: "Vendor statement · sample", kind: "statement" },
  { id: "E4", title: "Permit register row · sample", kind: "record" },
  { id: "E5", title: "Local report · sample", kind: "article" },
  { id: "E6", title: "Timestamped post · sample", kind: "post" },
];

export const EXAMPLE_CLAIMS = [
  { text: "The site was fenced before the permit date.", attachments: [["E2", "supports"], ["E4", "contradicts"]] },
  { text: "The vendor was named in the minutes.", attachments: [["E1", "supports"], ["E3", "context"]] },
  { text: "Work continued after the stop notice.", attachments: [["E6", "supports"]] },
];

export function createState() {
  return { claims: [], selected: null, nextId: 1 };
}

export function addClaim(state, text) {
  const t = String(text ?? "").trim();
  if (!t) return { ok: false, reason: "empty claim" };
  const claim = { id: `C${state.nextId}`, text: t, attachments: [] };
  state.nextId += 1;
  state.claims.push(claim);
  state.selected = claim.id;
  return { ok: true, claim };
}

export function selectClaim(state, id) {
  state.selected = state.claims.some((c) => c.id === id) ? id : null;
  return state;
}

export function getClaim(state, id) {
  return state.claims.find((c) => c.id === id) ?? null;
}

export function canAttach(state, evidenceId, relation) {
  return (
    !!state.selected &&
    EVIDENCE.some((e) => e.id === evidenceId) &&
    RELATIONS.includes(relation)
  );
}

// Attach one evidence item to the selected claim with a relation. Same evidence twice → refused.
export function attach(state, evidenceId, relation) {
  if (!canAttach(state, evidenceId, relation)) return { ok: false, reason: "pick a claim, evidence and relation" };
  const claim = getClaim(state, state.selected);
  if (claim.attachments.some((a) => a.evidence === evidenceId)) {
    return { ok: false, reason: "already attached" };
  }
  const a = { evidence: evidenceId, relation };
  claim.attachments.push(a);
  return { ok: true, claim, attachment: a };
}

export function detach(state, claimId, evidenceId) {
  const claim = getClaim(state, claimId);
  if (!claim) return { ok: false, reason: "no such claim" };
  const before = claim.attachments.length;
  claim.attachments = claim.attachments.filter((a) => a.evidence !== evidenceId);
  return { ok: claim.attachments.length < before, claim };
}

export function isContested(claim) {
  const rels = new Set(claim.attachments.map((a) => a.relation));
  return rels.has("supports") && rels.has("contradicts");
}

export function claimStatus(claim) {
  if (claim.attachments.length === 0) return "unlinked";
  return isContested(claim) ? "contested" : "linked";
}

export function counts(claim) {
  const c = { supports: 0, contradicts: 0, context: 0 };
  for (const a of claim.attachments) c[a.relation] += 1;
  return c;
}

// Verdicts are always zero. The field exists so the UI can say so out loud.
export function summary(state) {
  const linked = state.claims.filter((c) => c.attachments.length > 0).length;
  const contested = state.claims.filter(isContested).length;
  return {
    claims: state.claims.length,
    linked,
    contested,
    attachments: state.claims.reduce((n, c) => n + c.attachments.length, 0),
    verdicts: 0,
  };
}

export function stageState(state) {
  if (state.claims.length === 0) return "empty";
  return summary(state).linked > 0 ? "linked" : "drafting";
}

export function stageLabel(state) {
  const s = stageState(state);
  if (s === "empty") return "empty";
  const sum = summary(state);
  if (s === "drafting") return `${sum.claims} claims · nothing attached`;
  return `${sum.linked}/${sum.claims} linked · ${sum.contested} contested · 0 verdicts`;
}

export function exampleState() {
  const s = createState();
  for (const ex of EXAMPLE_CLAIMS) {
    addClaim(s, ex.text);
    for (const [e, r] of ex.attachments) attach(s, e, r);
  }
  s.selected = s.claims[0].id;
  return s;
}

export function stateFromQuery(search) {
  const wanted = new URLSearchParams(search).get("state");
  if (wanted === "linked" || wanted === "example") return exampleState();
  return createState();
}
