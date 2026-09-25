#!/usr/bin/env python3
"""Delivery plane for routine git. Not a daemon and not a second CI.

Uses git merge-tree for a clean update, and the check records GitHub already
reports (gh pr checks / GitHub Actions on .github/workflows/hive-eng.yml).
This process does not merge, deploy, or push.

  python3 scripts/hive/eng/delivery.py decide --request request.json
  python3 scripts/hive/eng/delivery.py classify --repo . --theirs origin/main
  python3 scripts/hive/eng/delivery.py update --repo . --theirs origin/main
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
_spec = importlib.util.spec_from_file_location("hive_job", HERE / "hive-job.py")
assert _spec and _spec.loader
hive_job = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(hive_job)

PROTECTED = frozenset({"main", "master"})
# Open pulls this plane does not merge. 394 and 398 stay open.
OPEN_PR_HOLD = frozenset({394, 398})
JEV_AGENTS = frozenset({"jev", "jev-1.13"})
GREEN = frozenset({"success", "green", "pass", "passed"})
RED = frozenset({"failure", "failed", "fail", "red", "cancelled", "canceled", "timed_out"})
ROUTINE = frozenset({"commit", "push", "draft_pr"})


def emit(payload: dict) -> int:
    print(json.dumps(payload, indent=2))
    return 0


def is_protected(ref: object) -> bool:
    name = str(ref or "").strip()
    if not name or name in {"*", "HEAD"} or name.endswith("*"):
        return True
    return name.split("/")[-1] in PROTECTED


def is_jev(name: object) -> bool:
    leaf = str(name or "").strip().lower().split("/")[-1]
    return leaf in JEV_AGENTS or leaf.startswith("jev-")


def builder_may_not() -> set[str]:
    perms = hive_job.load_permissions()
    builder = perms.get("builder") if isinstance(perms.get("builder"), dict) else {}
    listed = builder.get("may_not") if isinstance(builder, dict) else []
    return {str(item) for item in listed} if isinstance(listed, list) else set()


def tier_of(request: dict) -> int | None:
    raw = request.get("policy_tier")
    if raw is None or raw is False:
        return None
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None


def hold_of(request: dict) -> set[int]:
    """394 and 398 stay refused. A caller list can add holds, not clear these."""
    found = set(OPEN_PR_HOLD)
    raw = request.get("hold")
    if not isinstance(raw, (list, tuple, set, frozenset)):
        return found
    for item in raw:
        try:
            found.add(int(item))
        except (TypeError, ValueError):
            continue
    return found


def checks_status(request: dict) -> str:
    if "checks" in request and isinstance(request.get("checks"), list):
        required = []
        for row in request["checks"]:
            if not isinstance(row, dict):
                continue
            if row.get("required", True) is False:
                continue
            required.append(str(row.get("state") or "").strip().lower())
        if not required:
            return "missing"
        if any(state in RED for state in required):
            return "red"
        if any(state not in GREEN for state in required):
            return "pending"
        return "green"
    ci = str(request.get("ci") or "").strip().lower()
    if ci in GREEN or ci == "green":
        return "green"
    if ci in RED or ci == "red":
        return "red"
    if ci in {"pending", "queued", "in_progress"}:
        return "pending"
    return "missing"


def parse_gh_checks(text: str) -> list[dict]:
    """Read the table `gh pr checks` already prints. Does not call GitHub."""
    rows: list[dict] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.lower().startswith("name\t") or stripped.lower().startswith("name "):
            continue
        parts = stripped.split("\t") if "\t" in stripped else stripped.split()
        if len(parts) < 2:
            continue
        rows.append({"name": parts[0], "state": parts[1], "required": True})
    return rows


def classify_update(repo: Path, ours: str, theirs: str) -> dict:
    """git merge-tree. A clean tree is automatic. A conflict is not guessed."""
    proc = subprocess.run(
        ["git", "-C", str(repo), "merge-tree", "--write-tree", "--name-only", ours, theirs],
        capture_output=True,
        text=True,
    )
    text = f"{proc.stdout}\n{proc.stderr}"
    if proc.returncode == 0 and "CONFLICT" not in text:
        return {
            "class": "no_conflict",
            "automatic": True,
            "resolution": None,
            "guessed": False,
            "ask_evens": False,
        }
    if "CONFLICT" in text:
        return {
            "class": "semantic_conflict",
            "automatic": False,
            "resolution": None,
            "guessed": False,
            "ask_evens": False,
        }
    return {
        "class": "unknown",
        "automatic": False,
        "resolution": None,
        "guessed": False,
        "ask_evens": False,
    }


def current_branch(repo: Path) -> str:
    proc = subprocess.run(
        ["git", "-C", str(repo), "symbolic-ref", "--short", "HEAD"],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        return ""
    return proc.stdout.strip()


def apply_update(repo: Path, theirs: str) -> dict:
    """Apply a clean git merge onto the current feature branch. Never guesses."""
    ref = current_branch(repo)
    if is_protected(ref):
        return {
            "applied": False,
            "performed": False,
            "action": "refuse",
            "ask_evens": False,
            "class": "refused",
            "resolution": None,
            "reasons": ["a no-conflict update does not land on main"],
        }
    classified = classify_update(repo, "HEAD", theirs)
    if classified["class"] != "no_conflict":
        return {
            "applied": False,
            "performed": False,
            "action": "hold",
            "ask_evens": False,
            "resolution": None,
            "reasons": ["a semantic conflict is not guessed"],
            **classified,
        }
    proc = subprocess.run(
        ["git", "-C", str(repo), "merge", "--no-edit", theirs],
        capture_output=True,
        text=True,
    )
    return {
        "applied": proc.returncode == 0,
        "performed": proc.returncode == 0,
        "action": "apply_update",
        "ask_evens": False,
        "class": "no_conflict",
        "automatic": True,
        "resolution": None,
        "guessed": False,
        "reasons": ["no-conflict update is automatic"],
    }


def _base(verb: str) -> dict:
    return {
        "verb": verb,
        "allowed": False,
        "ready": False,
        "performed": False,
        "ask_evens": False,
        "action": "refuse",
        "draft": None,
        "resolution": None,
        "reasons": [],
    }


def _jev_block(request: dict, payload: dict) -> bool:
    actor = str(request.get("actor") or "")
    reviewer = request.get("reviewer") if isinstance(request.get("reviewer"), dict) else {}
    reviewer_agent = reviewer.get("agent") if isinstance(reviewer, dict) else ""
    if is_jev(actor) or is_jev(reviewer_agent):
        payload["reasons"].append("Jev is not merge authority")
        return True
    return False


def _routine(request: dict, payload: dict) -> dict:
    verb = payload["verb"]
    gates = str(request.get("local_gates") or "").strip().lower()
    if gates == "fail" or checks_status(request) == "red":
        payload["action"] = "continue_repair"
        payload["reasons"].append("a failed gate continues a repair")
        return payload
    if gates != "pass":
        payload["reasons"].append("feature-branch git waits for local gates")
        return payload
    ref = request.get("ref")
    if verb == "push" and (request.get("unrestricted") is True or is_protected(ref)):
        payload["reasons"].append("a worker has no unrestricted push to main")
        return payload
    if is_protected(ref):
        payload["reasons"].append("that ref is protected")
        return payload
    if verb == "draft_pr" and request.get("draft") is False:
        payload["reasons"].append("the pull request stays a draft")
        return payload
    payload["allowed"] = True
    payload["action"] = "push_feature" if verb == "push" else verb
    if verb == "draft_pr":
        payload["draft"] = True
        payload["action"] = "draft_pr"
    return payload


def _update(request: dict, payload: dict) -> dict:
    if is_protected(request.get("ref")):
        payload["reasons"].append("a no-conflict update does not land on main")
        return payload
    klass = str(request.get("update_class") or "").strip().lower()
    if request.get("semantic") is True:
        klass = "semantic_conflict"
    if klass == "no_conflict":
        payload["allowed"] = True
        payload["action"] = "apply_update"
        payload["automatic"] = True
        payload["reasons"].append("no-conflict update is automatic")
        return payload
    if klass in {"semantic_conflict", "conflict"}:
        payload["action"] = "hold"
        payload["resolution"] = None
        payload["reasons"].append("a semantic conflict is not guessed")
        return payload
    payload["action"] = "hold"
    payload["reasons"].append("an unknown update is not guessed")
    return payload


def _review_reason(request: dict) -> str:
    builder = hive_job.party(request.get("builder"))
    reviewer = hive_job.party(request.get("reviewer"))
    if reviewer is None or builder is None:
        return "merge waits for an independent review"
    return hive_job.independence_reason(builder, reviewer, "review")


def _merge(request: dict, payload: dict) -> dict:
    pr = request.get("pr")
    try:
        pr_number = int(pr) if pr is not None and pr is not False else None
    except (TypeError, ValueError):
        pr_number = None
    if pr_number is not None and pr_number in hold_of(request):
        payload["reasons"].append(f"open pull request {pr_number} is not merged")
        return payload
    status = checks_status(request)
    if status == "red":
        payload["action"] = "continue_repair"
        payload["reasons"].append("CI failure continues a repair")
        return payload
    base = request.get("base")
    tier = tier_of(request)
    consequential = request.get("consequential") is True or is_protected(base) or tier == 3
    if consequential:
        payload["ask_evens"] = True
        payload["action"] = "tier3_held"
        payload["reasons"].append("Tier 3 consequential decisions stay with Evens")
        return payload
    why = _review_reason(request)
    if why:
        payload["action"] = "wait_merge"
        payload["reasons"].append(why if why else "merge waits for an independent review")
        return payload
    if status != "green":
        payload["action"] = "wait_merge"
        payload["reasons"].append("merge waits for green required checks")
        return payload
    if tier != 2:
        payload["action"] = "wait_merge"
        payload["reasons"].append("merge waits for a policy tier")
        return payload
    payload["ready"] = True
    payload["action"] = "merge_ready"
    payload["performed"] = False
    payload["reasons"].append("review, green required checks, and the policy tier are present")
    payload["reasons"].append("this plane does not perform the merge")
    return payload


def decide(request: dict) -> dict:
    verb = str(request.get("verb") or "").strip().lower()
    payload = _base(verb)
    if verb not in ROUTINE | {"update", "repair", "merge", "deploy"}:
        payload["reasons"].append("unknown delivery verb")
        return payload
    if _jev_block(request, payload):
        return payload
    denied = builder_may_not()
    if verb == "deploy":
        payload["ask_evens"] = True
        payload["action"] = "tier3_held"
        payload["reasons"].append("deploy stays with Evens")
        return payload
    if verb == "repair":
        payload["allowed"] = True
        payload["action"] = "continue_repair"
        payload["reasons"].append("CI failure continues a repair")
        return payload
    if verb in ROUTINE:
        return _routine(request, payload)
    if verb == "update":
        if "guess_semantic_conflict" in denied and (
            request.get("semantic") is True or request.get("update_class") == "semantic_conflict"
        ):
            payload["action"] = "hold"
            payload["resolution"] = None
            payload["reasons"].append("a semantic conflict is not guessed")
            return payload
        return _update(request, payload)
    return _merge(request, payload)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Decide a routine git step. Does not merge or deploy.")
    sub = ap.add_subparsers(dest="cmd", required=True)
    decide_cmd = sub.add_parser("decide")
    decide_cmd.add_argument("--request", required=True)
    classify_cmd = sub.add_parser("classify")
    classify_cmd.add_argument("--repo", required=True)
    classify_cmd.add_argument("--ours", default="HEAD")
    classify_cmd.add_argument("--theirs", required=True)
    update_cmd = sub.add_parser("update")
    update_cmd.add_argument("--repo", required=True)
    update_cmd.add_argument("--theirs", required=True)
    args = ap.parse_args(argv)
    if args.cmd == "decide":
        request = json.loads(Path(args.request).read_text(encoding="utf-8"))
        return emit(decide(request))
    if args.cmd == "classify":
        return emit(classify_update(Path(args.repo), args.ours, args.theirs))
    return emit(apply_update(Path(args.repo), args.theirs))


if __name__ == "__main__":
    sys.exit(main())
