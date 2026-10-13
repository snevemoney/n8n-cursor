"""gws_natural — plain-English read-only Google asks -> exact `gws` argv, and `gws` output -> one breath of speech.

Read-only by construction: only mail triage, calendar agenda and Drive file search are produced here, and the argv
goes through agent_tools.op_cli's positive allow-list as well. Mail and Drive text is untrusted data: it is flattened
to one short line, never executed, never returned as raw JSON.
"""
from __future__ import annotations

import json
import re
from datetime import datetime
from email.utils import parsedate_to_datetime

MAX_ASK_CHARS = 600
TERM_CAP = 50           # Drive search term, characters before escaping
LIST_MAX = 5
SPEECH_CAP = 500

NOT_CONNECTED = ("Google isn't connected to me yet. Evens has to sign in once with gws auth login; "
                 "until then I can't read mail, calendar or Drive.")

# Anything that changes data, or asks for something other than a plain look, is left to the hands that own it.
_NOT_A_LOOK = re.compile(
    r"\b(?:draft|compose|write|send|reply|forward|delete|remove|trash|archive|label|mark|move|share|rename|upload|create|"
    r"add|book|schedule\s+a|reschedule|cancel|invite|set\s+up|unsubscribe|conflict)\b", re.I)

_VERB = (r"(?:check|show|read|list|open|see|any|do\s+i\s+have(?:\s+any)?|how\s+many|what(?:['’]s|\s+is)?\s+in|"
         r"got\s+any)")
_MAIL = re.compile(
    rf"\b{_VERB}\b[^.?!]{{0,40}}?\b(?:my\s+(?:unread\s+|new\s+)?(?:e-?mails?|mail|inbox|gmail)"
    r"|unread\s+(?:e-?mails?|mail|messages)|(?:the\s+)?(?:inbox|gmail))\b"
    r"|^\W*(?:jarvis[,:]?\s*)?(?:any\s+)?(?:unread|new)\s+(?:e-?mails?|mail)\b", re.I)
_AGENDA = re.compile(
    r"\b(?:what(?:['’]s|\s+is)?|show|check|read|list|see|any)\b[^.?!]{0,30}?\bmy\s+(?:calendar|agenda|schedule)\b", re.I)
_DRIVE_CTX = r"(?:(?:my\s+)?google\s+drive|(?:in|on)\s+(?:my\s+)?drive|my\s+drive)"
_DRIVE = re.compile(rf"\b(?:find|search|look\s+for|list|show|get)\b[^?!]{{0,90}}?\b{_DRIVE_CTX}\b", re.I | re.S)
_TERM_NAMED = re.compile(r"\b(?:named|called|titled|matching|containing|about)\s+(?P<t>.+?)\s*$", re.I | re.S)
_TERM_FOR = re.compile(r"\b(?:search|look)\s+(?:my\s+)?(?:google\s+)?drive\s+for\s+(?P<t>.+?)\s*$", re.I | re.S)
_TERM_FIND_IN = re.compile(
    r"\bfind\s+(?:the\s+|my\s+)?(?P<t>.+?)\s+(?:files?|docs?|documents?|sheets?|folders?)?\s*(?:in|on)\s+(?:my\s+)?"
    r"(?:google\s+)?drive\b", re.I | re.S)
_GENERIC_TERMS = {"file", "files", "doc", "docs", "document", "documents", "anything", "everything", "stuff", "recent",
                  "latest", "my files", "all"}
_CONTROL = re.compile(r"[\x00-\x1f\x7f  ]+")


def flat(s, n: int = 80) -> str:
    """One short printable line: control characters and runs of whitespace collapse, length is capped."""
    s = _CONTROL.sub(" ", str(s if s is not None else ""))
    return re.sub(r"\s+", " ", s).strip()[:n]


def _term(u: str) -> str:
    for rx in (_TERM_NAMED, _TERM_FOR, _TERM_FIND_IN):
        m = rx.search(u)
        if m:
            t = flat(m.group("t"), 400).strip(" \"'“”‘’.,;:!?")
            t = re.sub(r"\s+(?:please|for me)$", "", t, flags=re.I).strip()[:TERM_CAP].strip()
            return "" if t.lower() in _GENERIC_TERMS else t
    return ""


def _escape_q(t: str) -> str:
    """Drive `q` string literal escaping: backslash first, then the single quote."""
    return t.replace("\\", "\\\\").replace("'", "\\'")


def drive_query(term: str) -> str:
    return (f"name contains '{_escape_q(term)}' and trashed = false") if term else "trashed = false"


def argv_for(u: str) -> list[str] | None:
    """Exact argv for a plain read-only Google ask, or None when the ask is not one (or is not a pure look)."""
    u = u or ""
    if not u.strip() or len(u) > MAX_ASK_CHARS:
        return None
    # A named search term is data, not a command (e.g. a file called "upload").
    # Keep the actual request prefix/suffix gated; the term remains one JSON argv.
    command_text = u
    if _DRIVE.search(u):
        for rx in (_TERM_NAMED, _TERM_FOR, _TERM_FIND_IN):
            match = rx.search(u)
            if match:
                command_text = u[:match.start("t")] + u[match.end("t"):]
                break
    if _NOT_A_LOOK.search(command_text):
        return None
    if _MAIL.search(u):
        return ["gws", "gmail", "+triage"]
    if _AGENDA.search(u):
        return ["gws", "calendar", "+agenda"]
    if _DRIVE.search(u):
        params = {"q": drive_query(_term(u)), "pageSize": 10, "orderBy": "modifiedTime desc",
                  "fields": "files(name,mimeType,modifiedTime)"}
        return ["gws", "drive", "files", "list", "--params", json.dumps(params, separators=(",", ":"))]
    return None


# ---------------------------------------------------------------- structural read-only check (second layer)
_SERVICES = {"gmail", "calendar", "drive", "docs", "sheets", "slides", "tasks", "people", "keep", "meet", "forms", "classroom", "chat"}
_HELPERS = {"+triage", "+read", "+agenda"}
_METHODS = {"list", "get", "query"}
_BOOL_FLAGS = {"--page-all", "--dry-run"}
_DENIED_FLAGS = {"--json", "--upload", "--upload-content-type", "--output", "--sanitize"}
_PATH_PART = re.compile(r"[\w.\-]+")
_FLAG_VALUE = re.compile(r"[\w@.:+\-/=,]{1,200}")


def argv_is_read_only(argv: list[str]) -> bool:
    """True only for `gws <service> +triage|+read|+agenda` or `gws <service> <resource…> list|get|query`, followed by
    nothing but `--flag [value]` pairs (--params must be a JSON object). A stray word, a request body, an upload, a file
    output or a sign-in command fails closed."""
    t = [str(x) for x in argv[1:]]
    if len(t) < 2 or t[0] not in _SERVICES:
        return False
    if t[1] in _HELPERS:
        rest = t[2:]
    else:
        path, i = [], 1
        while i < len(t) and not t[i].startswith("-") and len(path) < 4:
            path.append(t[i])
            i += 1
        if len(path) < 2 or path[-1] not in _METHODS or not all(_PATH_PART.fullmatch(p) for p in path):
            return False
        rest = t[i:]
    i = 0
    while i < len(rest):
        flag = rest[i]
        if not flag.startswith("--") or flag in _DENIED_FLAGS:
            return False
        i += 1
        if flag in _BOOL_FLAGS or i >= len(rest) or rest[i].startswith("--"):
            continue
        value = rest[i]
        i += 1
        if flag == "--params":
            try:
                if not isinstance(json.loads(value), dict):
                    return False
            except ValueError:
                return False
        elif not _FLAG_VALUE.fullmatch(value):
            return False
    return True


# ---------------------------------------------------------------- output -> speech
_AUTH = re.compile(r"(?i)(no credentials|credentials?\s+(?:not found|missing)|not\s+(?:authenticated|logged in|signed in)|"
                   r"unauthenticated|unauthorized|auth(?:entication)?\s+(?:required|failed|error)|login required|"
                   r"invalid_grant|token\s+(?:has been\s+)?expired|\b401\b|auth login)")
_PUNCT = re.compile(r"[{}\[\]\"]")


def kind_of(args: list[str]) -> str:
    svc = (args[0] if args else "").lower()
    return {"gmail": "mail", "calendar": "agenda", "drive": "drive"}.get(svc, "generic")


def _parse(text: str):
    t = (text or "").strip()
    if not t:
        return None
    try:
        return json.loads(t)
    except ValueError:
        pass
    rows = []
    for line in t.splitlines():                      # --page-all prints one JSON document per line
        try:
            rows.append(json.loads(line))
        except ValueError:
            return None
    return rows or None


def _items(data, keys: tuple[str, ...]):
    if isinstance(data, list):
        out = []
        for d in data:
            if isinstance(d, dict) and any(isinstance(d.get(k), list) for k in keys):
                out.extend(_items(d, keys) or [])
            elif isinstance(d, dict):
                out.append(d)
        return out
    if isinstance(data, dict):
        for k in keys:
            if isinstance(data.get(k), list):
                return [x for x in data[k] if isinstance(x, dict)]
    return None


def _first(d: dict, *names: str) -> str:
    low = {str(k).lower(): v for k, v in d.items()}
    for n in names:
        v = low.get(n.lower())
        if isinstance(v, str) and v.strip():
            return v
    return ""


def _when(v) -> str:
    if isinstance(v, dict):
        v = v.get("dateTime") or v.get("date")
    if not isinstance(v, str) or not v:
        return ""
    try:
        d = datetime.fromisoformat(v.replace("Z", "+00:00"))
        return d.strftime("%a %b %-d") if len(v) == 10 else d.strftime("%a %-I:%M %p")
    except ValueError:
        pass
    try:
        return parsedate_to_datetime(v).strftime("%a %-I:%M %p")
    except (TypeError, ValueError):
        return ""


def _sender(s: str) -> str:
    name = re.sub(r"\s*<[^>]*>", "", s).strip(" \"'")
    return flat(name or s.split("@")[0], 40)


_MIME = {"spreadsheet": "sheet", "document": "doc", "presentation": "slides", "folder": "folder", "pdf": "PDF"}


def _mime(m: str) -> str:
    tail = re.split(r"[./]", m or "")[-1].lower()
    return _MIME.get(tail, "")


def _join(head: str, parts: list[str], total: int) -> str:
    more = f"; and {total - len(parts)} more" if total > len(parts) else ""
    return (head + "; ".join(parts) + more)[:SPEECH_CAP]


def _say_mail(items: list[dict]) -> str:
    if not items:
        return "No unread mail."
    parts = []
    for m in items[:LIST_MAX]:
        who, sub, when = _sender(_first(m, "from", "sender")), flat(_first(m, "subject", "snippet"), 70), _when(_first(m, "date"))
        line = " — ".join(x for x in (who, sub) if x)
        if line:
            parts.append(line + (f" ({when})" if when else ""))
    if not parts:
        return f"{len(items)} messages found, but the list has no senders or subjects; I'd need to open them to say more."
    return _join(f"{len(items)} unread: ", parts, len(items))


def _say_agenda(items: list[dict]) -> str:
    if not items:
        return "Nothing on your calendar."
    parts = []
    for e in items[:LIST_MAX]:
        title = flat(_first(e, "summary", "title", "name") or "(no title)", 70)
        when = _when(e.get("start"))
        parts.append(f"{when} {title}".strip())
    n = len(items)
    return _join(f"{n} event{'s' if n != 1 else ''}: ", parts, n)


def _say_drive(items: list[dict]) -> str:
    if not items:
        return "No Drive files matched."
    parts = []
    for f in items[:LIST_MAX]:
        name, kind, when = flat(_first(f, "name", "title"), 60), _mime(_first(f, "mimeType")), _when(_first(f, "modifiedTime"))
        extra = ", ".join(x for x in (kind, f"edited {when}" if when else "") if x)
        parts.append(name + (f" ({extra})" if extra else ""))
    n = len(items)
    return _join(f"{n} file{'s' if n != 1 else ''}: ", parts, n)


def speak(kind: str, out: str, err: str, rc: int) -> dict:
    """{'ok', 'spoken', 'auth_missing'} — never raw JSON, never a long error dump."""
    blob = f"{out}\n{err}"
    data = _parse(out) if rc == 0 else None
    failed = rc != 0 or (isinstance(data, dict) and isinstance(data.get("error"), (dict, str)))
    if failed:
        if _AUTH.search(blob):
            return {"ok": False, "auth_missing": True, "spoken": NOT_CONNECTED}
        why = flat(_PUNCT.sub("", err or out), 140)
        return {"ok": False, "auth_missing": False, "spoken": f"Google didn't answer (gws exit {rc}){': ' + why if why else ''}."}
    if data is None:
        return {"ok": False, "auth_missing": False,
                "spoken": "Google answered, but I couldn't read the format, so I didn't read it out."}
    keys = {"mail": ("messages", "emails", "threads"), "agenda": ("events", "items"), "drive": ("files",)}.get(kind)
    items = _items(data, keys) if keys else None
    if items is None:
        return {"ok": True, "auth_missing": False,        # the call worked; only the summary is missing
                "spoken": f"Google answered, but I can't summarize that kind of result yet ({len(out)} characters)."}
    say = {"mail": _say_mail, "agenda": _say_agenda, "drive": _say_drive}[kind]
    return {"ok": True, "auth_missing": False, "spoken": say(items)}
