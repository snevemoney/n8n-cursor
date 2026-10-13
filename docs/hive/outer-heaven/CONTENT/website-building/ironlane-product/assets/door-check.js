// Paste-URL door check — local, deterministic. No fetch, no crawl, no outbound.
// "Door" = can a member book without texting the owner?
// The registry below is the whole world this check knows. Everything is SAMPLE.

export const DOORS = [
  {
    host: "ironlane.example",
    path: "/book",
    door: "open",
    note: "Book lands on the calendar.",
  },
  {
    host: "quietfloor.example",
    path: "/schedule",
    door: "open",
    note: "Schedule page books the slot itself.",
  },
  {
    host: "dm-only-gym.example",
    path: "/book",
    door: "wall",
    note: "/book → 404. Members text the owner instead.",
  },
  {
    host: "textus.example",
    path: "/contact",
    door: "wall",
    note: "Only a DM button. Nothing lands on a calendar.",
  },
];

// The local preview itself has a real /book.html, so it passes.
const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost"]);

export const EXAMPLES = DOORS.map((d) => d.host);

export function normalizeUrl(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return null;
  // Anything that already names a scheme (https://, mailto:, ftp://) is parsed as-is.
  // "localhost:4842" is host:port, not a scheme.
  const hostPort = /^[a-z0-9.-]+:\d{1,5}(?:\/|$)/i.test(raw);
  const hasScheme = !hostPort && /^[a-z][a-z0-9+.-]*:/i.test(raw);
  const withScheme = hasScheme ? raw : `https://${raw}`;
  let url;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  if (!host) return null;
  if (!host.includes(".") && !LOCAL_HOSTS.has(host)) return null;
  return url;
}

// Result shape is stable for the UI and tests:
// { status: "invalid" | "pass" | "fail" | "unknown", host, path, headline, detail }
export function checkDoor(input) {
  const url = normalizeUrl(input);
  if (!url) {
    return {
      status: "invalid",
      host: null,
      path: null,
      headline: "That is not a site address.",
      detail: "Paste something like yoursite.com — we add https:// for you.",
    };
  }

  const host = url.hostname.toLowerCase();

  if (LOCAL_HOSTS.has(host)) {
    return {
      status: "pass",
      host,
      path: "/book.html",
      headline: "Path works.",
      detail: "This preview has a real booking page. Book lands on the calendar.",
    };
  }

  const entry = DOORS.find((d) => d.host === host);
  if (entry) {
    if (entry.door === "open") {
      return {
        status: "pass",
        host,
        path: entry.path,
        headline: "Path works.",
        detail: entry.note,
      };
    }
    return {
      status: "fail",
      host,
      path: entry.path,
      headline: "Hit a wall.",
      detail: entry.note,
    };
  }

  // Real hosts are never fetched from this page. Say so instead of guessing.
  return {
    status: "unknown",
    host,
    path: null,
    headline: "Not checked.",
    detail:
      "CapEx demo checks example doors only. No live site is fetched from here.",
  };
}
