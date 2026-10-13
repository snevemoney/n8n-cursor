// Ledgerline 10-second clarity UI — pure content + a fog/clear toggle.
// "Clarity" is measured on the actual copy (line count, word count), not claimed. invent_kpi=0.

// The whole product in three lines. Read them, then book.
export const CLEAR_LINES = [
  "Ledgerline closes your month-end books from bank feeds and invoices.",
  "For finance leads at small companies who close by hand today. Sample.",
  "Not a bank. Not payroll. Not tax filing.",
];

export const CLEAR_MAX_WORDS = 40;

// The fog: what the old page listed instead. Twenty-four tabs, no sentence.
export const FOG_FEATURES = [
  "Reconciliation engine",
  "Multi-entity roll-up",
  "Smart categorisation",
  "Custom dashboards",
  "Approval workflows",
  "Audit trail",
  "Vendor portal",
  "Expense capture",
  "Budget vs actual",
  "Forecast scenarios",
  "Role-based access",
  "API access",
  "Webhooks",
  "Custom fields",
  "Recurring journals",
  "Intercompany",
  "Fixed assets",
  "Accruals",
  "Deferred revenue",
  "Bank rules",
  "Close checklist",
  "Comments & mentions",
  "Export centre",
  "Integrations marketplace",
];

export const MODES = ["clear", "fog"];

export function wordCount(lines) {
  return lines.join(" ").trim().split(/\s+/).filter(Boolean).length;
}

export function clarityFacts() {
  return {
    lines: CLEAR_LINES.length,
    words: wordCount(CLEAR_LINES),
    underMax: wordCount(CLEAR_LINES) <= CLEAR_MAX_WORDS,
    fogItems: FOG_FEATURES.length,
  };
}

export function modeFromQuery(search) {
  const wanted = new URLSearchParams(search).get("mode");
  return MODES.includes(wanted) ? wanted : "clear";
}

export function toggleMode(mode) {
  return mode === "clear" ? "fog" : "clear";
}

export function modeCopy(mode) {
  const f = clarityFacts();
  if (mode === "fog") {
    return {
      eyebrow: "Feature fog (the old page)",
      count: `${f.fogItems} feature tabs · no sentence says what it does`,
      button: "Show the three lines",
    };
  }
  return {
    eyebrow: "What Ledgerline is · three lines",
    count: `${f.lines} lines · ${f.words} words · under ${CLEAR_MAX_WORDS}`,
    button: "Show the fog it replaced",
  };
}
