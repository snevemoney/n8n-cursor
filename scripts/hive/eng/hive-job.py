#!/usr/bin/env python3
"""CapEx claim gate. One work unit. hive-gate is the only writer of state.

Platform, agent, and engineering function are separate. Grok Bot's 17 stay Grok Bot agents.

  python3 scripts/hive/eng/hive-job.py states
  python3 scripts/hive/eng/hive-job.py verify --claim JOB-JEV-001
  python3 scripts/hive/eng/hive-job.py verify --claim-dir <path>
  python3 scripts/hive/eng/hive-job.py registry

A job.json file is not a work unit. L4 stays check-forge-done.py --slice-id.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CAPEX = ROOT / "docs/hive/outer-heaven/CONTENT/os/capex"
L4 = ROOT / "docs/hive/outer-heaven/check-forge-done.py"

STATES = (
    "SCOPED",
    "DECISION_OWED",
    "ARCHITECTED",
    "READY",
    "IMPLEMENTING",
    "IMPLEMENTED_UNVERIFIED",
    "WIRED",
    "LIVE",
    "VERIFIED",
    "REVIEWED",
    "WIRE_FAILURE",
    "VERIFICATION_UNAVAILABLE",
    "PARKED",
    "REGRESSION",
)
REMOVED_STATES = frozenset({"DISCOVERED", "SHIPPED", "VERIFICATION_PREREQUISITE_REQUIRED"})
FORBIDDEN_STATES = frozenset(
    {"DONE", "FINISHED", "WORKING", "COMPLETE", "READY_TO_SHIP", *REMOVED_STATES}
)
LIVE_PLUS = frozenset({"WIRED", "LIVE", "VERIFIED", "REVIEWED"})
VERIFIED_PLUS = frozenset({"VERIFIED", "REVIEWED"})
CLOSE_TYPES = frozenset({"artifact", "blocked", "receipt"})
EVIDENCE_KEYS = (
    "surface",
    "entrypoint",
    "expected_listen",
    "environment",
    "address",
    "git_sha",
    "worktree",
    "process",
    "timestamp",
    "trace_id",
    "input",
    "observed",
)
NOT_RUNTIME = frozenset({"slack", "chat", "markdown", "unit_test", "status_message", "commit", "doc"})
# These words are not interchangeable, and none of them is an engineering state.
SEPARATE_TRUTH = (
    "discussed",
    "suggested",
    "accepted",
    "candidate",
    "implemented",
    "verified",
    "live",
    "superseded",
    "revoked",
    "historical",
)
NOT_LIVE_PROOF = frozenset(
    {
        "DISCUSSED",
        "SUGGESTED",
        "ACCEPTED",
        "CANDIDATE",
        "IMPLEMENTED",
        "HISTORICAL",
        "SUPERSEDED",
        "REVOKED",
        "PASS_DIFF",
        "PASS@DIFF",
        "CO_SIGNED",
        "CO-SIGNED",
        "VERIFIED_HOLD",
    }
)
NOT_SHIP_PROOF = frozenset({"PASS_DIFF", "PASS@DIFF", "VERIFIED_HOLD"})
IDENTITY_KEYS = ("repo", "branch", "machine", "runtime", "config")
HARD_STEPS = frozenset({"send", "pay", "publish", "deploy", "book"})
MARKDOWN_PICKS = frozenset({"markdown_order", "file_order", "first_line", "heading_order"})
DIAGNOSTIC_KINDS = frozenset({"runner_chip", "diagnostic_chip", "campaign_chip"})
SINGLE_WRITER = "hive-gate"
CLAIM_KEYS = (
    "id",
    "title",
    "state",
    "revision",
    "ask_verbs",
    "close_type",
    "builder",
    "verifier",
    "reviewer",
    "g2_checklist_path",
    "blocked",
    "unlock",
    "proof_status",
    "bite_id",
    "freeze",
    "acceptance",
    "runtime",
    "operator_ask",
    "release_status",
)


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def claim_dir_for(claim_id: str) -> Path:
    direct = CAPEX / claim_id
    if (direct / "claim.json").is_file():
        return direct
    raise SystemExit(f"FAIL: no claim.json under {direct}")


def load_claim(directory: Path) -> dict:
    if (directory / "job.json").is_file():
        raise SystemExit("FAIL: job.json is a parallel work unit; CapEx claim.json is the substrate")
    path = directory / "claim.json"
    if not path.is_file():
        raise SystemExit(f"FAIL: missing {path}")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"FAIL: claim.json is not JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise SystemExit("FAIL: claim.json must be an object")
    return data


def write_claim(directory: Path, claim: dict) -> None:
    path = directory / "claim.json"
    path.write_text(json.dumps(claim, indent=2) + "\n", encoding="utf-8")


def load_receipts(directory: Path) -> list[dict]:
    path = directory / "transitions.jsonl"
    if not path.is_file():
        return []
    rows: list[dict] = []
    for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"FAIL: transitions.jsonl line {lineno}: {exc}") from exc
        if isinstance(row, dict):
            rows.append(row)
    return rows


def append_receipt(directory: Path, row: dict) -> None:
    path = directory / "transitions.jsonl"
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, sort_keys=True) + "\n")


def receipt_sha(row: dict) -> str:
    body = {k: v for k, v in row.items() if k != "receipt_sha"}
    raw = json.dumps(body, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


def load_evidence(directory: Path) -> dict:
    path = directory / "evidence" / "runtime.json"
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def head_sha() -> str:
    proc = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    return proc.stdout.strip() if proc.returncode == 0 else ""


def ownership_reasons(claim: dict, receipts: list[dict]) -> list[str]:
    state = str(claim.get("state") or "")
    revision = claim.get("revision")
    if not receipts:
        if state == "SCOPED" and revision == 0:
            return []
        return ["state edited outside hive-gate"]
    last = receipts[-1]
    if state != last.get("to") or revision != last.get("revision"):
        return ["state edited outside hive-gate"]
    return []


def g2_reasons(claim: dict, directory: Path) -> list[str]:
    rel = str(claim.get("g2_checklist_path") or "").strip()
    if not rel:
        return ["READY requires g2_checklist_path"]
    path = Path(rel) if Path(rel).is_absolute() else directory / rel
    if not path.is_file():
        return [f"G2 checklist missing: {path}"]
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return ["G2 checklist is not JSON"]
    values = data.get("values") if isinstance(data, dict) else None
    if not isinstance(values, list) or not values:
        return ["G2 checklist needs values with sources"]
    reasons: list[str] = []
    for item in values:
        if not isinstance(item, dict) or not str(item.get("source") or "").strip():
            reasons.append("G2 value missing source")
    owed = claim.get("decisions_owed")
    if isinstance(owed, list) and owed:
        reasons.append("material decisions still owed")
    return reasons


def l4_reasons(claim: dict, log_path: Path | None) -> list[str]:
    if log_path is None or not log_path.is_file():
        return ["REVIEWED requires the existing L4 log (check-forge-done --slice-id)"]
    slice_id = str(claim.get("bite_id") or claim.get("id") or "").strip()
    proc = subprocess.run(
        [sys.executable, str(L4), "--slice-id", slice_id, "--log", str(log_path)],
        capture_output=True,
        text=True,
        cwd=str(ROOT),
    )
    if proc.returncode != 0:
        return ["L4 check-forge-done failed for this slice"]
    return []


def close_reasons(claim: dict) -> list[str]:
    kind = str(claim.get("close_type") or "")
    if kind not in CLOSE_TYPES:
        return ["close_type must be artifact, blocked, or receipt"]
    if kind == "blocked" and claim.get("blocked") is not True:
        return ["close_type blocked requires blocked true"]
    if kind == "blocked" and not str(claim.get("unlock") or "").strip():
        return ["close_type blocked requires unlock"]
    if kind == "artifact" and not str(claim.get("artifact") or "").strip():
        return ["close_type artifact requires artifact"]
    return []


def acceptance_reasons(claim: dict, *, verified: bool) -> list[str]:
    acceptance = claim.get("acceptance")
    if not isinstance(acceptance, list) or not acceptance:
        return ["acceptance must be a non-empty list of criteria"]
    reasons: list[str] = []
    for item in acceptance:
        if not isinstance(item, dict):
            reasons.append("acceptance criteria must be objects with result and evidence_refs")
            continue
        for key in ("id", "requirement", "mandatory", "result", "evidence_refs"):
            if key not in item:
                reasons.append(f"acceptance criterion missing {key}")
        if verified and item.get("mandatory") is True:
            if str(item.get("result") or "") != "PASS":
                reasons.append(f"mandatory criterion {item.get('id')} is not PASS")
            refs = item.get("evidence_refs")
            if not isinstance(refs, list) or not refs:
                reasons.append(f"mandatory criterion {item.get('id')} has no evidence_refs")
    return reasons


def evidence_reasons(claim: dict, directory: Path, ev: dict) -> list[str]:
    reasons: list[str] = []
    if not ev:
        reasons.append("WIRED+ requires evidence/runtime.json")
    kind = str(ev.get("kind") or "").lower()
    if kind in NOT_RUNTIME:
        reasons.append(f"evidence.kind={kind!r} cannot advance LIVE+")
    for key in EVIDENCE_KEYS:
        if ev.get(key) in (None, "", {}, []):
            reasons.append(f"missing evidence.{key}")
    runtime = claim.get("runtime") if isinstance(claim.get("runtime"), dict) else {}
    surface = str(ev.get("surface") or "")
    expected = str(runtime.get("surface") or runtime.get("expected_face") or runtime.get("address") or "")
    if expected and surface and surface != expected:
        reasons.append(f"wrong surface {surface!r} != {expected!r}")
    if ev.get("authority") in {"UNTRUSTED_DATA", "EXTERNAL_RESEARCH"} or ev.get("may_change_goal") is True:
        reasons.append("external research cannot mutate state")
    observed = ev.get("observed")
    if isinstance(observed, dict) and set(observed) <= {"face_health", "healthz"}:
        reasons.append("GET /healthz is not capability proof")
    if "healthz" in observed if isinstance(observed, str) else False:
        reasons.append("GET /healthz is not capability proof")
    claim_sha = str(runtime.get("git_sha") or "")
    evidence_sha = str(ev.get("git_sha") or "")
    claim_tree = str(runtime.get("worktree") or "")
    evidence_tree = str(ev.get("worktree") or "")
    if claim_tree and evidence_tree and claim_tree != evidence_tree:
        reasons.append("evidence worktree does not match the claim")
    if claim_sha and evidence_sha and claim_sha != evidence_sha:
        reasons.append("evidence git_sha does not match the claim")
    repo_root = str(ROOT)
    if evidence_tree in {"", repo_root} and evidence_sha:
        current = head_sha()
        if current and evidence_sha != current:
            reasons.append("stale git_sha: evidence is not this checkout")
    if claim_tree and claim_tree != repo_root and not claim_sha:
        reasons.append("a named worktree requires runtime.git_sha")
    return reasons


ROLE_FUNCTION = {
    "builder": "develop",
    "verifier": "verify",
    "reviewer": "review",
}
PARTY_SHAPE = "{platform, agent, engineering_function, run_id}"


def party(value: object) -> dict | None:
    if not isinstance(value, dict):
        return None
    platform = str(value.get("platform") or "").strip().lower()
    agent = str(value.get("agent") or "").strip().lower()
    function = str(value.get("engineering_function") or "").strip().lower()
    run_id = str(value.get("run_id") or "").strip()
    if not platform or not agent or not function:
        return None
    return {
        "platform": platform,
        "agent": agent,
        "engineering_function": function,
        "run_id": run_id,
    }


def load_permissions() -> dict:
    path = ROOT / "roles" / "permissions.json"
    return json.loads(path.read_text(encoding="utf-8"))


def grok_roster() -> set[str]:
    path = ROOT / "scripts/hive/agent-roster-registry.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    rows = data.get("coreAgents") if isinstance(data, dict) else None
    slugs: set[str] = set()
    if not isinstance(rows, list):
        return slugs
    for row in rows:
        if not isinstance(row, dict):
            continue
        agent_id = str(row.get("id") or "")
        if agent_id.startswith("grok-os-"):
            slugs.add(agent_id[len("grok-os-") :])
    return slugs


def authorization_reason(platform: str, agent: str, function: str) -> str:
    perms = load_permissions()
    platforms = perms.get("platforms") if isinstance(perms.get("platforms"), dict) else {}
    spec = platforms.get(platform)
    if not isinstance(spec, dict):
        return f"unknown platform {platform}"
    functions = spec.get("functions") if isinstance(spec.get("functions"), dict) else {}
    held = functions.get(agent)
    held_list = [str(item) for item in held] if isinstance(held, list) else []
    if platform == "grok_bot" and agent not in grok_roster():
        return f"{agent} is not a Grok Bot agent"
    if function in held_list:
        return ""
    if platform == "grok_bot" and held_list:
        performed = " and ".join(held_list)
        noun = {"verify": "verifier", "review": "reviewer", "develop": "builder"}.get(function, function)
        return f"{agent} performs {performed} on grok_bot and is not a {noun}"
    if platform == "grok_bot":
        return f"{agent} is not authorized for {function} on grok_bot and remains a Grok Bot agent"
    return f"{agent} is not authorized for {function} on {platform}"


def independence_reason(builder: dict, other: dict, function: str) -> str:
    same_party = builder["platform"] == other["platform"] and builder["agent"] == other["agent"]
    same_run = bool(builder["run_id"]) and builder["run_id"] == other["run_id"]
    if same_party and same_run:
        if function == "verify":
            return "builder may not stamp VERIFIED (builder == verifier)"
        return "reviewer must differ from the builder"
    if same_party:
        perms = load_permissions()
        platforms = perms.get("platforms") if isinstance(perms.get("platforms"), dict) else {}
        spec = platforms.get(builder["platform"]) if isinstance(platforms.get(builder["platform"]), dict) else {}
        needs = spec.get("same_agent_requires_distinct_run") if isinstance(spec, dict) else []
        distinct = isinstance(needs, list) and function in needs
        if distinct:
            if not builder["run_id"] or not other["run_id"]:
                return "cursor verify/review requires a different run_id from the develop run"
            return ""
        if function == "verify":
            return "builder may not stamp VERIFIED (builder == verifier)"
        return "reviewer must differ from the builder"
    if same_run:
        if function == "verify":
            return "verifier run_id matches the builder"
        return "reviewer run_id matches the builder"
    return ""


def role_reasons(claim: dict) -> list[str]:
    reasons: list[str] = []
    parties: dict[str, dict | None] = {}
    for name, function in ROLE_FUNCTION.items():
        who = party(claim.get(name))
        parties[name] = who
        if who is None:
            reasons.append(f"{name} must be {PARTY_SHAPE}")
            continue
        if who["engineering_function"] != function:
            reasons.append(f"{name} engineering_function must be {function}")
            continue
        why = authorization_reason(who["platform"], who["agent"], function)
        if why:
            reasons.append(why)
    builder = parties.get("builder")
    verifier = parties.get("verifier")
    reviewer = parties.get("reviewer")
    if builder and verifier:
        why = independence_reason(builder, verifier, "verify")
        if why:
            reasons.append(why)
    if builder and reviewer:
        why = independence_reason(builder, reviewer, "review")
        if why:
            reasons.append(why)
    return reasons


def _proof_token(value: object) -> str:
    return str(value or "").strip().upper().replace(" ", "_")


def _truth_flags(claim: dict, ev: dict) -> dict[str, bool]:
    """Bool labels from the claim, its statuses map, and the evidence beside it.

    A string such as evidence.kind live_face is not a live flag.
    """
    flags: dict[str, bool] = {}
    statuses = claim.get("statuses")
    if isinstance(statuses, dict):
        for word in SEPARATE_TRUTH:
            if word in statuses:
                flags[word] = statuses.get(word) is True
    for word in SEPARATE_TRUTH:
        if isinstance(claim.get(word), bool):
            flags[word] = claim.get(word) is True
        if isinstance(ev.get(word), bool):
            flags[word] = ev.get(word) is True or flags.get(word) is True
    return flags


def authority_proof_reasons(
    claim: dict,
    ev: dict,
    receipts: list[dict],
    *,
    state: str,
) -> list[str]:
    """Reject collapsed labels. hive-gate remains the only writer of claim state.

    A file, an acceptance flag, a passing test, PASS_DIFF, a co-sign, markdown
    order, a vault line, or a diagnostic chip does not promote the claim.
    """
    reasons: list[str] = []
    proof = _proof_token(claim.get("proof_status"))
    release = _proof_token(claim.get("release_status"))
    kind = str(ev.get("kind") or "").lower()
    runtime = claim.get("runtime") if isinstance(claim.get("runtime"), dict) else {}
    strong = state in LIVE_PLUS

    statuses = claim.get("statuses")
    if isinstance(statuses, str):
        reasons.append("discussed, accepted, and live must stay separate")
    flags = _truth_flags(claim, ev)
    earlier = [word for word in ("discussed", "suggested", "accepted", "candidate") if flags.get(word)]
    bundled = [word for word in ("discussed", "accepted", "live") if flags.get(word)]
    # A live flag next to discussed or accepted does not promote the claim.
    if earlier and (strong or flags.get("live") or len(bundled) >= 2):
        reasons.append("discussed, accepted, and live must stay separate")
    if strong and proof in NOT_LIVE_PROOF:
        reasons.append(f"{proof} is not {state}")
    if claim.get("code_exists") is True and (claim.get("accepted") is True or proof == "ACCEPTED"):
        reasons.append("code existing is not acceptance")
    if (
        claim.get("accepted") is True
        and claim.get("exists") is True
        and not str(claim.get("accepted_by") or "").strip()
    ):
        reasons.append("acceptance is not existence")
    if strong and (kind == "unit_test" or ev.get("test_passed") is True):
        reasons.append("a passing test is not live")

    ask = claim.get("operator_ask") if isinstance(claim.get("operator_ask"), dict) else {}
    original = str(ask.get("original") or "")
    if ask.get("current") is not None and str(ask.get("current")) != original:
        reasons.append("later paraphrase does not replace operator_ask.original")
    if ask.get("may_rewrite") is True:
        reasons.append("operator_ask.may_rewrite must stay false")

    if str(ev.get("picked_by") or "") in MARKDOWN_PICKS or str(claim.get("picked_by") or "") in MARKDOWN_PICKS:
        reasons.append("markdown order is not authority")
    if ev.get("authority") == "vault_line" or ev.get("authority_from") == "vault":
        reasons.append("a vault line is evidence, not authority")

    conflicts = claim.get("conflicts")
    if conflicts is None:
        conflicts = ev.get("conflicts")
    picked = claim.get("picked_source") or ev.get("picked_source")
    if isinstance(conflicts, list) and conflicts and picked:
        reasons.append("conflict hidden by picking a source")
    sources = ev.get("sources")
    if isinstance(sources, list) and len(sources) >= 2:
        values = [str(src.get("value")) for src in sources if isinstance(src, dict) and "value" in src]
        if len(set(values)) > 1 and not (isinstance(conflicts, list) and conflicts):
            reasons.append("conflicts stay explicit")

    builder = party(claim.get("builder"))
    if proof in {"CO_SIGNED", "CO-SIGNED"} or claim.get("co_signed") is True or ev.get("co_signed") is True:
        reasons.append("co-signed is not independent")
    graded_by = str(claim.get("graded_by") or ev.get("graded_by") or "").strip().lower()
    if graded_by and builder and graded_by == builder["agent"]:
        reasons.append("builder cannot promote its own result")

    if proof in NOT_SHIP_PROOF and (strong or release in {"SHIPPED", "LIVE", "DEPLOYED", "PRODUCTION"}):
        reasons.append("PASS_DIFF is not ship")

    if ev.get("archive_equals_rendered") is True or ev.get("archive_equals_bus") is True:
        reasons.append("archive, bus, and rendered face are different surfaces")
    if strong and (
        kind in DIAGNOSTIC_KINDS
        or ev.get("diagnostic") is True
        or str(ev.get("campaign") or "") in {"300", "runner-300"}
    ):
        reasons.append("runner chips are diagnostic, not final proof")

    verbs = {str(item).lower() for item in claim.get("ask_verbs") or []}
    hard = bool(verbs & HARD_STEPS) or str(claim.get("hard_step") or "").lower() in HARD_STEPS
    if hard and state in VERIFIED_PLUS:
        receipt = claim.get("consequential_receipt") if isinstance(claim.get("consequential_receipt"), dict) else {}
        if any(not str(receipt.get(key) or "").strip() for key in ("authorized_by", "executed_by", "target", "time", "result")):
            reasons.append("consequential action needs a receipt")

    writers = {str(row.get("ran_by") or "") for row in receipts if str(row.get("ran_by") or "")}
    if writers and writers != {SINGLE_WRITER}:
        reasons.append("several writers mutate control truth")

    if strong and ev:
        for key in IDENTITY_KEYS:
            if ev.get(key) in (None, "", {}, []):
                reasons.append(f"missing evidence.{key}")
        for key in IDENTITY_KEYS:
            ev_val = ev.get(key)
            rt_val = runtime.get(key)
            if ev_val not in (None, "", {}, []) and rt_val not in (None, "", {}, []) and str(ev_val) != str(rt_val):
                reasons.append("evidence expired: runtime changed")
                break
        certified = ev.get("certified_runtime")
        if isinstance(certified, dict):
            for key in IDENTITY_KEYS:
                if (
                    certified.get(key) not in (None, "", {}, [])
                    and runtime.get(key) not in (None, "", {}, [])
                    and str(certified.get(key)) != str(runtime.get(key))
                ):
                    reasons.append("evidence expired: runtime changed")
                    break
    return reasons


def probe_face(host: str, timeout: float = 3.0) -> dict:
    url = f"http://{host}/healthz"
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            body = json.loads(resp.read().decode())
            return {"ok": bool(body.get("ok")), "url": url, "status": resp.status}
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
        return {"ok": False, "url": url, "error": str(exc)}


def reasons_for(claim: dict, directory: Path, *, ping_runtime: bool, l4_log: Path | None = None) -> list[str]:
    reasons: list[str] = []
    state = str(claim.get("state") or "")
    if state in FORBIDDEN_STATES or state.lower() == "done":
        return [f"forbidden state {state!r}"]
    if state not in STATES:
        return [f"unknown state {state!r}"]
    reasons.extend(ownership_reasons(claim, load_receipts(directory)))
    reasons.extend(role_reasons(claim))
    for key in CLAIM_KEYS:
        if key not in claim:
            reasons.append(f"missing claim field {key}")
    runtime = claim.get("runtime") if isinstance(claim.get("runtime"), dict) else {}
    for key in ("surface", "entrypoint", "expected_listen", "environment", "address"):
        if key not in runtime:
            reasons.append(f"missing runtime.{key}")
    reasons.extend(acceptance_reasons(claim, verified=state in VERIFIED_PLUS))
    reasons.extend(authority_proof_reasons(claim, load_evidence(directory), load_receipts(directory), state=state))
    if state == "READY":
        reasons.extend(g2_reasons(claim, directory))
    if state in LIVE_PLUS:
        reasons.extend(evidence_reasons(claim, directory, load_evidence(directory)))
        if ping_runtime:
            face = str(runtime.get("surface") or runtime.get("address") or "")
            if face:
                health = probe_face(face)
                if not health.get("ok"):
                    reasons.append(f"Face {face} not reachable → VERIFICATION_UNAVAILABLE")
    if state in VERIFIED_PLUS:
        builder = party(claim.get("builder")) or {
            "platform": "",
            "agent": "",
            "engineering_function": "",
            "run_id": "",
        }
        receipts = load_receipts(directory)
        last = receipts[-1] if receipts else {}
        if last.get("ran_by") != "hive-gate" or last.get("to") not in VERIFIED_PLUS:
            reasons.append("VERIFIED requires a hive-gate execution receipt, not a handwritten stamp")
        else:
            receipt_party = {
                "platform": str(last.get("platform") or "").strip().lower(),
                "agent": str(last.get("agent") or "").strip().lower(),
                "engineering_function": "verify",
                "run_id": str(last.get("run_id") or "").strip(),
            }
            if builder["agent"] and receipt_party["agent"]:
                why = independence_reason(builder, receipt_party, "verify")
                if why:
                    reasons.append("builder cannot certify this transition")
        stamp_path = directory / "evidence" / "VERIFIER.json"
        if not stamp_path.is_file():
            reasons.append("VERIFIED requires the hive-gate evidence/VERIFIER.json")
        else:
            try:
                stamp = json.loads(stamp_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                stamp = {}
            if not last.get("receipt_sha") or stamp.get("receipt_sha") != last.get("receipt_sha"):
                reasons.append("VERIFIER.json was not produced by the hive-gate receipt")
            if not str(last.get("run_id") or "").strip() or not str(last.get("platform") or "").strip():
                reasons.append("verifier receipt missing platform or run_id")
    if state == "REVIEWED":
        reasons.extend(close_reasons(claim))
        reasons.extend(l4_reasons(claim, l4_log or _default_l4(claim, directory)))
    return reasons


def _default_l4(claim: dict, directory: Path) -> Path | None:
    named = str(claim.get("l4_log") or "")
    if not named:
        return None
    path = Path(named) if Path(named).is_absolute() else directory / named
    return path


def cmd_states() -> int:
    print(json.dumps({"states": list(STATES), "forbidden": sorted(FORBIDDEN_STATES)}, indent=2))
    return 0


def cmd_verify(directory: Path, *, offline: bool, l4_log: str) -> int:
    claim = load_claim(directory)
    log = Path(l4_log) if l4_log else None
    reasons = reasons_for(claim, directory, ping_runtime=not offline, l4_log=log)
    payload = {
        "id": claim.get("id"),
        "state": claim.get("state"),
        "revision": claim.get("revision"),
        "substrate": "capex-claim",
        "ok": not reasons,
        "reasons": reasons,
        "checked_at": utc_now(),
    }
    print(json.dumps(payload, indent=2))
    if reasons:
        print("FAIL", file=sys.stderr)
        return 1
    print("PASS")
    return 0


def cmd_registry() -> int:
    rows: list[dict] = []
    if CAPEX.is_dir():
        for path in sorted(CAPEX.glob("*/claim.json")):
            if path.parent.name == "fixtures":
                continue
            claim = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(claim, dict):
                continue
            reasons = ownership_reasons(claim, load_receipts(path.parent))
            rows.append(
                {
                    "id": claim.get("id"),
                    "state": claim.get("state") if not reasons else "STALE",
                    "proof_status": claim.get("proof_status"),
                    "release_status": claim.get("release_status"),
                    "stale": bool(reasons),
                }
            )
    handwritten = CAPEX / "REGISTRY.json"
    print(
        json.dumps(
            {
                "derived": True,
                "ignored_handwritten_registry": handwritten.is_file(),
                "capabilities": rows,
            },
            indent=2,
        )
    )
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="CapEx claim gate")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("states")
    sub.add_parser("registry")
    verify = sub.add_parser("verify")
    verify.add_argument("--claim")
    verify.add_argument("--claim-dir")
    verify.add_argument("--offline", action="store_true")
    verify.add_argument("--l4-log", default="")
    args = ap.parse_args()
    if args.cmd == "states":
        return cmd_states()
    if args.cmd == "registry":
        return cmd_registry()
    directory = Path(args.claim_dir) if args.claim_dir else claim_dir_for(str(args.claim or ""))
    return cmd_verify(directory, offline=args.offline, l4_log=args.l4_log)


if __name__ == "__main__":
    raise SystemExit(main())
