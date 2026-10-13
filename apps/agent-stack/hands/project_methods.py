"""Local project artifacts and review queue; never sends, publishes or edits the human vault.

E–J methods: project contracts, immutable intake, source-backed topic drafts,
answer checkpoints and approve/edit/reject/redo. The owner supplies a private
output root. An approval is a review disposition, never authority to execute.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path

MAX_TEXT = 64_000
SECRET = re.compile(r"(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:sk|ghp|gho)-[A-Za-z0-9_-]{16,}|\b(?:api[_-]?key|password|access[_-]?token)\s*[:=]\s*[\"']?[A-Za-z0-9_./+-]{12,})", re.I)
NAME = re.compile(r"[a-z0-9][a-z0-9-]{0,63}\Z")


def stamp():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def clean_text(text):
    text = str(text).strip()
    if not text or len(text.encode()) > MAX_TEXT:
        raise ValueError("Text is empty or exceeds the project limit")
    if SECRET.search(text):
        raise ValueError("Secret-looking content cannot be saved")
    return text


def slug(text):
    value = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    if not NAME.fullmatch(value):
        raise ValueError("Use a short project or topic name")
    return value


def child(root: Path, *parts):
    """Reject traversal and symlinks, including an existing intermediate link."""
    root = Path(root).absolute()
    for p in (root, *root.parents):
        if p.is_symlink():
            raise ValueError("Project roots cannot use symlinks")
    path = root
    for part in parts:
        if not part or part in {".", ".."} or "/" in part or "\\" in part:
            raise ValueError("Invalid project path")
        path /= part
        if path.is_symlink():
            raise ValueError("Project paths cannot use symlinks")
    return path


def write_new(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    # O_EXCL avoids replacing user work or immutable sources.
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(text)
        f.flush()
        os.fsync(f.fileno())


def atomic_json(path: Path, row):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=".project-", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(row, f, ensure_ascii=False, indent=2)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def create(root: Path, name: str, goal: str, done: str, role="Jarvis"):
    name = clean_text(name)
    project = child(root, slug(name))
    contract = {"name": name, "goal": clean_text(goal), "done": clean_text(done),
                "role": clean_text(role), "created": stamp(), "human_vault": "read-only"}
    if project.exists():
        raise ValueError("Project already exists; its files were preserved")
    project.mkdir(parents=True)
    for folder in ("Inputs", "Process", "Outputs", "Feedback"):
        child(project, folder).mkdir()
    write_new(child(project, "PROJECT.md"), "# " + name + "\n\n" +
              "\n".join(f"- {k}: {v}" for k, v in contract.items()) + "\n")
    write_new(child(project, "contract.json"), json.dumps(contract, indent=2))
    return contract


def existing(root, project):
    p = child(root, slug(project))
    if not child(p, "contract.json").is_file():
        raise ValueError("Create the project contract first")
    return p


def intake(root, project, text, source, *, kind="note", topic="general", quality="unverified"):
    """Finite intake gate; duplicates reuse immutable raw, never invent provenance."""
    p = existing(root, project)
    text, source = clean_text(text), clean_text(source)
    if kind not in {"note", "transcript", "article", "decision", "result"}:
        raise ValueError("Unsupported source type")
    if quality not in {"unverified", "source-backed", "conflicting"}:
        raise ValueError("Unsupported evidence label")
    topic = slug(topic)
    digest = hashlib.sha256(text.encode()).hexdigest()
    raw = child(p, "Inputs", digest + ".json")
    if raw.exists():
        return {"id": digest, "duplicate": True, "path": str(raw)}
    row = {"id": digest, "type": kind, "topic": topic, "source": source,
           "quality": quality, "captured": stamp(), "text": text}
    write_new(raw, json.dumps(row, indent=2, ensure_ascii=False) + "\n")
    if json.loads(raw.read_text())["id"] != digest:
        raise OSError("Saved input did not read back correctly")
    return {"id": digest, "duplicate": False, "path": str(raw)}


def checkpoint(root, project, question, answer):
    """Write after each answer; no mutable conversation cache is needed to resume."""
    p = existing(root, project)
    row = {"question": clean_text(question), "answer": clean_text(answer), "at": stamp()}
    digest = hashlib.sha256(json.dumps(row, sort_keys=True).encode()).hexdigest()[:16]
    path = child(p, "Process", "answer-" + digest + ".json")
    if not path.exists():
        write_new(path, json.dumps(row, indent=2) + "\n")
    return row


def source_review(root, project, ident, quality, evidence):
    """Record an explicit source assessment separately from immutable raw input."""
    p = existing(root, project)
    if not re.fullmatch(r"[a-f0-9]{64}", ident):
        raise ValueError("Invalid source ID")
    if quality not in {"source-backed", "conflicting"}:
        raise ValueError("Review must identify support or conflict")
    raw = child(p, "Inputs", ident + ".json")
    row = json.loads(raw.read_text())
    if hashlib.sha256(row["text"].encode()).hexdigest() != ident:
        raise ValueError("Source contents no longer match their captured ID")
    assessment = {"id": ident, "quality": quality, "evidence": clean_text(evidence),
                  "at": stamp(), "raw_sha256": hashlib.sha256(raw.read_bytes()).hexdigest()}
    atomic_json(child(p, "Process", "source-review-" + ident + ".json"), assessment)
    return assessment


def compile_topic(root, project, topic, ids):
    """Compile only supplied source-backed inputs; evidence is quoted, never promoted."""
    p = existing(root, project)
    topic = slug(topic)
    if not ids:
        raise ValueError("A topic needs at least one source")
    sources = []
    for ident in dict.fromkeys(ids):
        if not re.fullmatch(r"[a-f0-9]{64}", ident):
            raise ValueError("Invalid source ID")
        f = child(p, "Inputs", ident + ".json")
        row = json.loads(f.read_text())
        if hashlib.sha256(row["text"].encode()).hexdigest() != ident:
            raise ValueError("Source contents no longer match their captured ID")
        quality = row["quality"]
        assessment_file = child(p, "Process", "source-review-" + ident + ".json")
        if assessment_file.exists():
            assessment = json.loads(assessment_file.read_text())
            if assessment["raw_sha256"] != hashlib.sha256(f.read_bytes()).hexdigest():
                raise ValueError("Source changed since its review")
            quality = assessment["quality"]
        if quality != "source-backed":
            raise ValueError("Unverified or conflicting sources cannot be compiled as facts")
        if row["topic"] != topic:
            raise ValueError("Source topic does not match")
        sources.append(row)
    content = "---\ntype: topic\nstatus: candidate\nupdated-by: Jarvis\ndate: " + stamp() + "\n---\n\n# " + topic + "\n\n"
    for row in sources:
        content += "## Source " + row["id"][:12] + "\nProvenance: " + row["source"] + "\n\n"
        content += "\n".join("> " + line for line in row["text"].splitlines()) + "\n\n"
    content += "This is a project draft, not a new standing rule or a verified claim.\n"
    path = child(p, "Outputs", topic + ".md")
    write_new(path, content)
    brief = child(p, "Process", "compile-" + hashlib.sha256(content.encode()).hexdigest()[:16] + ".json")
    write_new(brief, json.dumps({"topic": topic, "sources": [r["id"] for r in sources],
                               "output": path.name, "at": stamp(), "status": "candidate"}) + "\n")
    return {"path": str(path), "sources": [r["id"] for r in sources], "status": "candidate"}


def enqueue(root, project, title, body, sources=()):
    p = existing(root, project)
    title, body = clean_text(title), clean_text(body)
    ident = hashlib.sha256((title + "\0" + body).encode()).hexdigest()[:16]
    path = child(p, "Feedback", ident + ".json")
    row = {"id": ident, "title": title, "body": body, "sources": [clean_text(s) for s in sources],
           "state": "awaiting-review", "revision": 0, "created": stamp(), "history": []}
    if path.exists():
        return json.loads(path.read_text())
    write_new(path, json.dumps(row, indent=2) + "\n")
    return row


def review(root, project, ident, action, *, replacement=None, expected_revision=0):
    import fcntl
    p = existing(root, project)
    if not re.fullmatch(r"[a-f0-9]{16}", ident):
        raise ValueError("Invalid queue item")
    if action not in {"approve", "edit", "reject", "redo"}:
        raise ValueError("Choose approve, edit, reject or redo")
    path = child(p, "Feedback", ident + ".json")
    lock = child(p, "Feedback", ident + ".lock")
    lock.parent.mkdir(parents=True, exist_ok=True)
    with lock.open("a") as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        row = json.loads(path.read_text())
        if row["revision"] != expected_revision:
            raise ValueError("Item changed; read it again before reviewing")
        if action == "edit":
            row["body"] = clean_text(replacement or "")
        row["history"].append({"action": action, "prior_state": row["state"],
                               "prior_body": row["body"] if action != "edit" else json.loads(path.read_text())["body"], "at": stamp()})
        row["state"] = {"approve": "reviewed-approved", "edit": "awaiting-review",
                        "reject": "reviewed-rejected", "redo": "revision-requested"}[action]
        row["revision"] += 1
        row["execution_authorized"] = False
        atomic_json(path, row)
        return row


def queue(root, project):
    p = existing(root, project)
    return [json.loads(child(p, "Feedback", f.name).read_text())
            for f in sorted(child(p, "Feedback").glob("*.json"))]


def graph(root):
    """Read-only markdown link graph: no CLI install, no vault modification."""
    root = child(root)
    files = [f for f in sorted(root.rglob("*.md")) if not f.is_symlink()
             and not any(part.startswith(".") for part in f.relative_to(root).parts)
             and f.stat().st_size <= MAX_TEXT][:1000]
    names = {str(f.relative_to(root).with_suffix("")): f for f in files}
    by_stem = {}
    for name, f in names.items():
        by_stem.setdefault(f.stem, []).append(name)
    edges, unresolved, ambiguous = {}, [], []
    for name, f in names.items():
        content = f.read_text(encoding="utf-8", errors="replace")
        if SECRET.search(content):
            continue
        targets = []
        for link in re.findall(r"\[\[([^\]]+)\]\]", content):
            target = link.split("|", 1)[0].split("#", 1)[0].removesuffix(".md")
            matches = [target] if target in names else by_stem.get(target, [])
            if len(matches) == 1:
                targets.append(matches[0])
            elif len(matches) > 1:
                ambiguous.append({"from": name, "target": target})
            else:
                unresolved.append({"from": name, "target": target})
        edges[name] = sorted(set(targets))
    incoming = {name: [] for name in edges}
    for name, targets in edges.items():
        for target in targets:
            if target in incoming:
                incoming[target].append(name)
    return {"links": edges, "backlinks": incoming, "unresolved": unresolved,
            "ambiguous": ambiguous, "orphans": [n for n in edges if not edges[n] and not incoming[n]],
            "dead_ends": [n for n in edges if not edges[n]], "capped": len(files) == 1000}


STAGES = {"planned": "Planned", "generating": "In the kitchen", "review": "Ready for review",
          "scheduled": "Schedule proposed", "complete": "Complete"}


def stage(root, project, ident, state, *, evidence, revision, when=None):
    """Z102 local stage board. A proposed date is never a Calendar booking."""
    import fcntl
    p = existing(root, project)
    ident = slug(ident)
    if state not in STAGES:
        raise ValueError("Choose planned, generating, review, scheduled or complete")
    evidence = clean_text(evidence)
    if state == "scheduled":
        try:
            date = datetime.fromisoformat(when or "")
        except ValueError:
            raise ValueError("A proposed schedule needs an ISO date with a time zone") from None
        if date.tzinfo is None:
            raise ValueError("A proposed schedule needs a time zone")
        when = date.isoformat()
    elif when:
        raise ValueError("Dates belong to the scheduled stage")
    path = child(p, "Process", "stage-" + ident + ".json")
    with child(p, "Process", "stage-" + ident + ".lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        old = json.loads(path.read_text()) if path.exists() else {"id": ident, "revision": 0, "history": []}
        if old["revision"] != revision:
            raise ValueError("Stage changed; read the board before updating it")
        row = {"id": ident, "state": state, "label": STAGES[state], "at": stamp(),
               "evidence": evidence, "proposed_at": when, "booked": False,
               "revision": revision + 1, "history": old["history"] +
               [{k: v for k, v in old.items() if k != "history"}]}
        atomic_json(path, row)
    return row


def board(root, project):
    p = existing(root, project)
    return [json.loads(child(p, "Process", f.name).read_text())
            for f in sorted(child(p, "Process").glob("stage-*.json"))]


def quote(unit_price, count, *, model, source, ceiling):
    from decimal import Decimal, InvalidOperation
    if not isinstance(count, int) or isinstance(count, bool) or count < 1:
        raise ValueError("Count must be a positive integer")
    price, limit = Decimal(str(unit_price)), Decimal(str(ceiling))
    if not price.is_finite() or not limit.is_finite() or price < 0 or limit < 0:
        raise ValueError("Prices and ceiling must be finite and nonnegative")
    if not source or not model:
        raise ValueError("A model and observed price source are required")
    total = price * count
    return {"model": model, "unit_price": str(price), "count": count, "total": str(total),
            "source": source, "within_ceiling": total <= limit, "executed": False}


def anchored_audit(evidence):
    """X01: discrete anchors, requiring cited evidence at every non-zero level."""
    out = {}
    for name, row in evidence.items():
        score = row.get("score")
        if score not in {0, 1, 3, 5} or isinstance(score, bool):
            raise ValueError("Only the 0, 1, 3 and 5 rubric anchors are allowed")
        if score and not row.get("sources"):
            raise ValueError("A nonzero score needs evidence sources")
        out[name] = {"score": score, "sources": list(row.get("sources", [])),
                     "reason": clean_text(row.get("reason", "No evidence"))}
    next_one = min(out, key=lambda n: out[n]["score"]) if out else None
    return {"at": stamp(), "criteria": out, "next_one": next_one, "verified": False}


COMMAND = re.compile(r"^(?:hey\s+)?(?:jarvis[, .]+)?project\s+([a-z0-9-]+)\s+(create|context|draft|board|stage|quote|review queue|review|source review|capture|compile|checkpoint)\b(?:\s*:\s*|\s+)?(.*)$", re.I | re.S)


def wants(text):
    return bool(COMMAND.match(text.strip()))


def run(text, *, root):
    """Explicit project command surface. Parsing failures never fall through to a model.

    Examples: project launch context; project launch review queue;
    project launch create: goal: review brief; done: one reviewed draft.
    Files are local project artifacts, not secret configs or human-vault changes.
    """
    match = COMMAND.match(text.strip())
    if not match:
        return None
    name, action, body = match.groups()
    name, action = name.lower(), action.lower()
    out = {"ok": False, "tool": "project_methods", "sent": False, "task_verified": False, "cites": []}
    try:
        if action == "create":
            fields = {}
            for clause in body.split(";"):
                key, sep, value = clause.partition(":")
                if sep:
                    fields[key.strip().lower()] = value.strip()
            if not fields.get("goal") or not fields.get("done"):
                raise ValueError("Tell me the goal and what will count as done")
            create(root, name, fields["goal"], fields["done"], fields.get("role", "Jarvis"))
            out["spoken"] = f"Project {name} created with its goal and completion check. Inputs, process, outputs and feedback are separate; your vault is unchanged."
            out["cites"] = [str(child(root, name, "PROJECT.md"))]
        elif action == "context":
            p = existing(root, name)
            contract = json.loads(child(p, "contract.json").read_text())
            checkpoints = [json.loads(child(p, "Process", f.name).read_text())
                           for f in sorted(child(p, "Process").glob("answer-*.json"))]
            out["spoken"] = f"Project {name}. Goal: {contract['goal']}. Done when: {contract['done']}."
            if checkpoints:
                latest = max(checkpoints, key=lambda r: r["at"])
                out["spoken"] += f" Latest saved answer: {latest['answer']}."
            out["cites"] = [str(child(p, "PROJECT.md"))]
        elif action == "board":
            items = board(root, name)
            out["spoken"] = "No stage items." if not items else "; ".join(
                f"{r['id']}: {r['label']} (revision {r['revision']})" +
                (f", proposed for {r['proposed_at']}; not booked" if r["proposed_at"] else "") for r in items)
        elif action == "stage":
            m = re.fullmatch(r"([a-z0-9-]+)\s+(planned|generating|review|scheduled|complete)\s+revision\s+(\d+)(?:\s+at\s+(\S+))?\s*:\s*(.+)", body, re.I | re.S)
            if not m:
                raise ValueError("Name the item, stage, revision and evidence; scheduling also needs a date")
            ident, state, revision, when, evidence = m.groups()
            row = stage(root, name, ident, state.lower(), evidence=evidence, revision=int(revision), when=when)
            out["spoken"] = f"{row['id']}: {row['label']}. Revision {row['revision']}."
            if row["proposed_at"]:
                out["spoken"] += f" Proposed for {row['proposed_at']}; not booked."
            out["cites"] = [str(child(root, name, "Process", "stage-" + row["id"] + ".json"))]
        elif action == "quote":
            existing(root, name)
            parts = [s.strip() for s in body.split(";")]
            if len(parts) != 5:
                raise ValueError("Give model, unit price, count, price source and ceiling, separated by semicolons")
            model, price, count, source, ceiling = parts
            try:
                result = quote(price, int(count), model=model, source=source, ceiling=ceiling)
            except ArithmeticError:
                raise ValueError("The supplied price or ceiling is not a valid number") from None
            out["spoken"] = f"{model}: {count} × ${result['unit_price']} = ${result['total']}, using your supplied price from {source}. " + (
                "Within your stated ceiling." if result["within_ceiling"] else "Over your stated ceiling.") + " Nothing generated or spent."
            out["quote"] = result
        elif action == "draft":
            title, sep, content = body.partition(" => ")
            if not sep:
                raise ValueError("Give the draft title and content, separated by =>")
            row = enqueue(root, name, title, content)
            out["spoken"] = f"Draft {row['id']} is awaiting review at revision {row['revision']}. Nothing was sent or published."
            out["cites"] = [str(child(root, name, "Feedback", row['id'] + ".json"))]
        elif action == "review queue":
            items = queue(root, name)
            out["spoken"] = "No review items." if not items else "; ".join(f"{r['id']}: {r['title']} — {r['state']} (revision {r['revision']})" for r in items)
        elif action == "review":
            m = re.fullmatch(r"([a-f0-9]{16})\s+(approve|reject|redo|edit)\s+revision\s+(\d+)(?:\s*:\s*(.*))?", body, re.I | re.S)
            if not m:
                raise ValueError("Name the item, review action and current revision")
            ident, verb, revision, replacement = m.groups()
            row = review(root, name, ident, verb.lower(), replacement=replacement, expected_revision=int(revision))
            out["spoken"] = f"{row['title']}: {row['state']}. Revision {row['revision']}. Nothing was sent, published or authorized for execution."
            out["cites"] = [str(child(root, name, "Feedback", ident + ".json"))]
        elif action == "checkpoint":
            question, sep, answer = body.partition(" => ")
            if not sep:
                raise ValueError("Give the question and answer, separated by =>")
            checkpoint(root, name, question, answer)
            out["spoken"] = "The answer is checkpointed. You can resume from project context."
        elif action == "capture":
            topic, sep, rest = body.partition(";")
            source, sep2, content = rest.partition(";")
            if not sep or not sep2:
                raise ValueError("Give the topic, source and source text, separated by semicolons")
            row = intake(root, name, content, source, topic=topic)
            out["spoken"] = f"{'Already captured' if row['duplicate'] else 'Captured'} source {row['id']}. Evidence remains unverified until reviewed."
            out["cites"] = [row["path"]]
        elif action == "source review":
            m = re.fullmatch(r"([a-f0-9]{64})\s+(source-backed|conflicting)\s*:\s*(.+)", body, re.I | re.S)
            if not m:
                raise ValueError("Name the source ID, support or conflict label and cited evidence")
            ident, quality, evidence = m.groups()
            source_review(root, name, ident, quality.lower(), evidence)
            out["spoken"] = f"Source assessment saved as {quality.lower()}. The captured input is unchanged; this records your assessment, not independent verification."
        elif action == "compile":
            topic, sep, ids = body.partition(":")
            if not sep:
                raise ValueError("Name the topic and its reviewed source IDs")
            row = compile_topic(root, name, topic.strip(), ids.split())
            out["spoken"] = f"Topic {topic.strip()} compiled from the cited sources as a project draft. No standing rule or human-vault file changed."
            out["cites"] = [row["path"]]
        out["ok"] = True
    except (ValueError, OSError, KeyError, TypeError) as exc:
        # Never echo source text or model output in error messages.
        out["spoken"] = str(exc) if isinstance(exc, ValueError) else "The project artifact could not be read or saved. Nothing was executed."
    return out
