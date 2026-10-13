// Sketchbook desk book — pure state. No clock, no network, no storage.
// A cover, spreads (left + right page), a colophon. Closed on load. Every page is SAMPLE / CapEx. invent_kpi=0.

export const COVER = { title: "Sketchbook", sub: "a desk book · SAMPLE" };

export const SPREADS = [
  {
    left: { kind: "contents", title: "Contents", lines: ["I · Why a book", "II · Studies", "III · Process", "Colophon"] },
    right: { kind: "text", title: "I · Why a book", lines: ["A template is a grid you fill.", "A book is a thing you hold.", "The turn is the identity."] },
  },
  {
    left: { kind: "plate", title: "Study 01", lines: ["graphite · sample"] },
    right: { kind: "text", title: "II · Studies", lines: ["Three studies, one desk.", "Each spread is a stopping point.", "Nothing autoplays."] },
  },
  {
    left: { kind: "text", title: "III · Process", lines: ["Open. Turn. Stop.", "Buttons or arrow keys.", "Reduced motion cuts instead of flips."] },
    right: { kind: "plate", title: "Study 02", lines: ["ink · sample"] },
  },
  {
    left: { kind: "text", title: "Colophon", lines: ["Set in a monospace and a sans.", "Built as a CapEx preview.", "Read to the end."] },
    right: { kind: "end", title: "Back cover", lines: ["SAMPLE · not a live site"] },
  },
];

export const LAST = SPREADS.length - 1;

export function createState() {
  return { open: false, page: 0, direction: "none" };
}

export function open(state) {
  state.open = true;
  state.page = 0;
  state.direction = "forward";
  return state;
}

export function close(state) {
  state.open = false;
  state.page = 0;
  state.direction = "backward";
  return state;
}

export function clamp(n) {
  const i = Number.isFinite(n) ? Math.trunc(n) : 0;
  return Math.min(LAST, Math.max(0, i));
}

export function goTo(state, page) {
  const target = clamp(page);
  state.direction = target >= state.page ? "forward" : "backward";
  state.open = true;
  state.page = target;
  return state;
}

export function canNext(state) {
  return !state.open || state.page < LAST;
}

export function canPrev(state) {
  return state.open;
}

// Next on the cover opens the book. Next on the last spread stays put.
export function next(state) {
  if (!state.open) return { ok: true, ...open(state) };
  if (state.page >= LAST) return { ok: false, reason: "end of book" };
  state.page += 1;
  state.direction = "forward";
  return { ok: true, page: state.page };
}

// Prev on the first spread closes the book.
export function prev(state) {
  if (!state.open) return { ok: false, reason: "book is closed" };
  if (state.page === 0) {
    close(state);
    return { ok: true, closed: true };
  }
  state.page -= 1;
  state.direction = "backward";
  return { ok: true, page: state.page };
}

export function isEnd(state) {
  return state.open && state.page === LAST;
}

export function currentSpread(state) {
  return state.open ? SPREADS[state.page] : null;
}

export function stageState(state) {
  if (!state.open) return "closed";
  return isEnd(state) ? "end" : "open";
}

export function positionLabel(state) {
  if (!state.open) return "closed · cover";
  return `spread ${state.page + 1} / ${SPREADS.length}${isEnd(state) ? " · end" : ""}`;
}

export function stateFromQuery(search) {
  const params = new URLSearchParams(search);
  const wanted = params.get("state");
  const s = createState();
  if (wanted === "end") return goTo(s, LAST);
  if (wanted === "open") {
    const page = params.has("page") ? Number(params.get("page")) - 1 : 0;
    return goTo(s, page);
  }
  return s;
}
