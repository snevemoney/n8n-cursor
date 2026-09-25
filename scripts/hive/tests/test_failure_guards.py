#!/usr/bin/env python3
"""Adversarial checks for terminal proof, session receipts, and versioned continuity."""
from __future__ import annotations

import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
HIVE = HERE.parent


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


HS = _load("hive_state_guards", HIVE / "hive-state.py")
BUS = _load("event_bus_guards", HIVE / "os" / "event-bus.py")
SESS = _load("session_matrix_guards", HIVE / "os" / "session-matrix.py")
PRODUCT = _load("product_state_guards", HIVE / "product-state.py")
BRIEF = _load("outer_heaven_brief_guards", HIVE / "os" / "outer-heaven-brief.py")


def _blank_state(folder: Path) -> Path:
    path = folder / "state.json"
    path.write_text(
        json.dumps(
            {
                "schema_version": 1,
                "ids": {"monotonic": True, "next_run_id": 1},
                "jobs": [],
                "last_run": {"id": None, "job": None, "desk": None, "at": None},
                "log": [],
            }
        ),
        encoding="utf-8",
    )
    return path


def _proof() -> tuple[list[dict], dict, dict]:
    env = {
        "runtime": "runtime-1",
        "config": "config-1",
        "version": "v1",
        "changed_at": "2026-09-25T00:00:00+00:00",
    }
    evidence = [
        {
            "class": "RUNTIME",
            "kind": "live",
            "runtime": "runtime-1",
            "config": "config-1",
            "version": "v1",
            "checked_at": "2026-09-25T01:00:00+00:00",
        },
        {
            "class": "SURFACE",
            "kind": "live",
            "runtime": "runtime-1",
            "config": "config-1",
            "version": "v1",
            "checked_at": "2026-09-25T01:00:00+00:00",
        },
    ]
    verifier = {"actor": "Watchdog", "role": "verifier"}
    return evidence, verifier, env


def _mutation(version: int, payload: dict, *, entity: str = "job-1") -> dict:
    return {
        "entity_id": entity,
        "entity_type": "job",
        "state_version": version,
        "changed_at": f"2026-09-25T00:00:0{version}+00:00",
        "source_platform": "cursor",
        "source_session": "sess-cursor-1",
        "writer": "hive-state.py",
        "provenance": "hive-state.py",
        "supersedes_version": version - 1 if version else None,
        "payload": payload,
    }


class TerminalProofTest(unittest.TestCase):
    def test_builder_done_without_proof_rejects(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            decision = HS.transition_job("job-a", "DONE", builder="Forge", actor="Forge", state_path=state)
            self.assertFalse(decision["permitted"])
            self.assertEqual(decision["state"], "IMPLEMENTED")
            self.assertNotIn(decision["job"]["status"], HS.TERMINAL_WORDS)
            self.assertIn(decision["job"]["status"], HS.NON_TERMINAL_STATES)

    def test_diff_only_rejects_when_runtime_and_surface_required(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            decision = HS.transition_job(
                "job-b",
                "LIVE",
                builder="Forge",
                evidence=[{"class": "PASS_DIFF"}, {"class": "SURFACE", "kind": "archive"}],
                required=["RUNTIME", "SURFACE"],
                verifier={"actor": "Watchdog", "role": "verifier"},
                state_path=state,
            )
            self.assertFalse(decision["permitted"])
            self.assertNotEqual(decision["state"], "LIVE")
            self.assertIn(decision["state"], HS.NON_TERMINAL_STATES)

    def test_builder_self_verification_rejects(self) -> None:
        evidence, _verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            decision = HS.transition_job(
                "job-c",
                "VERIFIED",
                builder="Forge",
                verifier={"actor": "Forge", "role": "builder"},
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertFalse(decision["permitted"])
            self.assertEqual(decision["state"], "VERIFYING")
            self.assertEqual(decision["reason"], "builder cannot verify its own job")

    def test_sufficient_evidence_and_independent_verifier_permits(self) -> None:
        evidence, verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            decision = HS.transition_job(
                "job-d",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertTrue(decision["permitted"])
            self.assertEqual(decision["state"], "DONE")
            self.assertEqual(decision["job"]["status"], "DONE")
            self.assertTrue(decision["job"].get("proofPermit"))

    def test_environment_mutation_marks_evidence_stale(self) -> None:
        evidence, verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            first = HS.transition_job(
                "job-e",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertTrue(first["permitted"])
            mutated = {
                "runtime": "runtime-2",
                "config": "config-1",
                "version": "v1",
                "changed_at": "2026-09-25T02:00:00+00:00",
            }
            noted = HS.note_environment("job-e", mutated, state_path=state)
            self.assertTrue(noted["stale"])
            self.assertEqual(noted["job"]["status"], "VERIFYING")
            self.assertTrue(any(item.get("stale") for item in noted["job"]["evidence"]))

    def test_legacy_desk_label_cannot_bypass_writer(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            state = _blank_state(folder)
            decision = HS.apply_desk_label("legacy-desk", "DONE", builder="Forge", desk="forge", state_path=state)
            self.assertFalse(decision["permitted"])
            saved = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in saved["jobs"] if job["id"] == "legacy-desk")
            self.assertNotEqual(row["status"], "DONE")
            self.assertNotEqual(row["status"].lower(), "done")
            saved["jobs"].append({"id": "smuggled", "name": "smuggled", "status": "SHIPPED", "desk": "forge", "updated": "2026-09-25"})
            with self.assertRaises(SystemExit):
                HS.save(saved, state)

    def test_active_session_without_receipt_stays_unproven(self) -> None:
        evidence, verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            decision = HS.transition_job(
                "job-f",
                "CLOSED",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                session={"tools": ["shell"], "artifacts": ["diff"]},
                state_path=state,
            )
            self.assertFalse(decision["permitted"])
            self.assertEqual(decision["state"], "RECEIPT_UNPROVEN")

    def test_historical_floors_are_not_summed(self) -> None:
        floors = HS._floors()
        self.assertEqual(floors["unsupported_completion_sessions"], 39)
        self.assertEqual(floors["artifact_only_rows"], 34)
        self.assertEqual(floors["divergence_instances"], 18)
        self.assertNotIn("total", floors)
        self.assertNotIn("sum", floors)
        with self.assertRaises(SystemExit):
            HS._floors({"unsupported_completion_sessions": 39, "total": 91})

    def test_nonclosing_pass_does_not_store_the_terminal_word(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            decision = HS.transition_job(
                "j-pass-open",
                "PASS",
                builder="Forge",
                closes_work=False,
                state_path=state,
            )
            self.assertFalse(decision["permitted"])
            self.assertNotIn(decision["job"]["status"], HS.TERMINAL_WORDS)
            self.assertNotEqual(decision["job"]["status"], "PASS")
            self.assertIn(decision["job"]["status"], HS.NON_TERMINAL_STATES)
            saved = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in saved["jobs"] if job["id"] == "j-pass-open")
            self.assertNotEqual(row["status"], "PASS")
            self.assertNotIn(row["status"], HS.TERMINAL_WORDS)
            forwarded = HS.guard_outcome_payload(
                {"status": "PASS", "closes_work": False, "job_id": "payload-pass"},
                state_path=state,
            )
            self.assertNotEqual(forwarded["status"], "PASS")
            self.assertNotIn(forwarded["status"], HS.TERMINAL_WORDS)

    def test_save_does_not_promote_historical_done(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = {
                "schema_version": 1,
                "ids": {"monotonic": True, "next_run_id": 1},
                "jobs": [
                    {
                        "id": "historical",
                        "name": "historical",
                        "status": "done",
                        "desk": "forge",
                        "updated": "2026-08-01",
                    }
                ],
                "last_run": {"id": None, "job": None, "desk": None, "at": None},
                "log": [],
            }
            state.write_text(json.dumps(seeded), encoding="utf-8")
            loaded = HS.load(state)
            self.assertEqual(loaded["jobs"][0]["status"], "done")
            untouched = json.loads(json.dumps(loaded))
            HS.save(untouched, state)
            self.assertEqual(json.loads(state.read_text(encoding="utf-8"))["jobs"][0]["status"], "done")
            promoted = json.loads(json.dumps(loaded))
            promoted["jobs"][0]["status"] = "DONE"
            with self.assertRaises(SystemExit):
                HS.save(promoted, state)
            self.assertEqual(json.loads(state.read_text(encoding="utf-8"))["jobs"][0]["status"], "done")

    def test_register_forward_ignores_nonempty_permit(self) -> None:
        source = (HIVE / "philanthropy-hive-tools" / "hive.ts").read_text(encoding="utf-8")
        start = source.index("const TERMINAL_STATUS")
        handler_start = source.index("const scorpion_register_outcome")
        handler_end = source.index("const n8n_get_execution")
        claim = source[start:handler_start].replace("(status: string): boolean", "(status)")
        handler = source[handler_start:handler_end]
        self.assertNotIn("proofPermit", handler)
        self.assertNotIn("closesWork", handler)
        self.assertLess(handler.index("isTerminalClaim(requested)"), handler.index("hiveFetch('scorpion_register_outcome'"))
        script = (
            claim
            + "\nconst statuses = ['DONE','PASS','pass','done','VERIFIED','LIVE','SHIPPED','CLOSED'];\n"
            + "for (const status of statuses) { if (!isTerminalClaim(status)) process.exit(2); }\n"
            + "if (isTerminalClaim('IMPLEMENTED') || isTerminalClaim('BLOCKED')) process.exit(3);\n"
        )
        ran = subprocess.run(["node", "-e", script], check=False, capture_output=True, text=True)
        self.assertEqual(ran.returncode, 0, ran.stderr or ran.stdout)

    def test_verifier_identity_is_case_insensitive(self) -> None:
        evidence, _verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            decision = HS.transition_job(
                "job-case",
                "VERIFIED",
                builder="Forge",
                verifier={"actor": "forge", "role": "verifier"},
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertFalse(decision["permitted"])
            self.assertNotEqual(decision["state"], "VERIFIED")
            self.assertEqual(decision["state"], "VERIFYING")
            self.assertEqual(decision["reason"], "builder cannot verify its own job")
            self.assertNotEqual(decision["job"]["status"], "VERIFIED")

    def test_unbound_evidence_cannot_hold_terminal_after_runtime_change(self) -> None:
        verifier = {"actor": "Watchdog", "role": "verifier"}
        unbound = [
            {"class": "RUNTIME", "kind": "live", "checked_at": "2026-09-25T03:00:00+00:00"},
            {"class": "SURFACE", "kind": "live", "checked_at": "2026-09-25T03:00:00+00:00"},
        ]
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            named = HS.transition_job(
                "job-unbound-named",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=unbound,
                environment={"runtime": "runtime-1", "changed_at": "2026-09-25T00:00:00+00:00"},
                state_path=state,
            )
            self.assertFalse(named["permitted"])
            self.assertNotIn(named["job"]["status"], HS.TERMINAL_WORDS)
            opened = HS.transition_job(
                "job-unbound-open",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=unbound,
                state_path=state,
            )
            self.assertTrue(opened["permitted"])
            self.assertEqual(opened["job"]["status"], "DONE")
            noted = HS.note_environment(
                "job-unbound-open",
                {"runtime": "runtime-2", "changed_at": "2026-09-25T04:00:00+00:00"},
                state_path=state,
            )
            self.assertTrue(noted["stale"])
            self.assertEqual(noted["job"]["status"], "VERIFYING")
            self.assertNotIn(noted["job"]["status"], HS.TERMINAL_WORDS)
            late = [
                {
                    "class": "RUNTIME",
                    "kind": "live",
                    "runtime": "runtime-1",
                    "checked_at": "2026-09-25T05:00:00+00:00",
                },
                {
                    "class": "SURFACE",
                    "kind": "live",
                    "runtime": "runtime-1",
                    "checked_at": "2026-09-25T05:00:00+00:00",
                },
            ]
            mismatched = HS.transition_job(
                "job-late-check",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=late,
                environment={"runtime": "runtime-2", "changed_at": "2026-09-25T02:00:00+00:00"},
                state_path=state,
            )
            self.assertFalse(mismatched["permitted"])
            self.assertNotEqual(mismatched["job"]["status"], "DONE")
            self.assertNotIn(mismatched["job"]["status"], HS.TERMINAL_WORDS)

    def test_save_does_not_write_a_new_nonclosing_pass(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            data = json.loads(state.read_text(encoding="utf-8"))
            data["jobs"].append(
                {
                    "id": "direct-pass",
                    "name": "direct-pass",
                    "status": "PASS",
                    "closes_work": False,
                    "desk": "forge",
                    "updated": "2026-09-25",
                }
            )
            with self.assertRaises(SystemExit):
                HS.save(data, state)
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertFalse(any(job.get("status") == "PASS" for job in disk["jobs"]))
            self.assertFalse(any(job.get("id") == "direct-pass" for job in disk["jobs"]))

    def test_stale_evidence_drops_nonclosing_pass(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "probe-pass",
                    "name": "probe-pass",
                    "status": "PASS",
                    "closes_work": False,
                    "desk": "forge",
                    "updated": "2026-09-25",
                    "evidence": [
                        {"class": "RUNTIME", "kind": "live", "checked_at": "2026-09-25T03:00:00+00:00"},
                        {"class": "SURFACE", "kind": "live", "checked_at": "2026-09-25T03:00:00+00:00"},
                    ],
                }
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            noted = HS.note_environment(
                "probe-pass",
                {"runtime": "rt-new", "changed_at": "2026-09-25T04:00:00+00:00"},
                state_path=state,
            )
            self.assertTrue(noted["stale"])
            self.assertEqual(noted["job"]["status"], "VERIFYING")
            self.assertNotEqual(noted["job"]["status"], "PASS")
            self.assertNotIn(noted["job"]["status"], HS.TERMINAL_WORDS)
            self.assertTrue(any(item.get("stale") for item in noted["job"]["evidence"]))
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertEqual(disk["jobs"][0]["status"], "VERIFYING")

    def test_catalog_and_report_do_not_send_terminal_status(self) -> None:
        source = (HIVE / "philanthropy-hive-tools" / "hive.ts").read_text(encoding="utf-8")
        slices = {
            "n8n_trigger_catalog_webhook": source[
                source.index("const n8n_trigger_catalog_webhook") : source.index("const HIVE_REPORT_DEDUPE_MS")
            ],
            "hive_send_report": source[source.index("const hive_send_report") : source.index("const hitl_gate_status")],
        }
        banned = ("done", "DONE", "PASS", "VERIFIED", "LIVE", "SHIPPED", "CLOSED")
        for name, body in slices.items():
            self.assertIn("/api/hive/register", body, name)
            for word in banned:
                self.assertNotIn(f"status: '{word}'", body, name)
                self.assertNotIn(f'status: "{word}"', body, name)
            self.assertIn("status: 'IMPLEMENTED'", body, name)

    def test_runtime_on_historical_done_without_evidence_drops_label(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "hist-done",
                    "name": "hist-done",
                    "status": "done",
                    "desk": "forge",
                    "updated": "2026-08-01",
                }
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            noted = HS.note_environment(
                "hist-done",
                {"runtime": "rt-new", "changed_at": "2026-09-25T04:00:00+00:00"},
                state_path=state,
            )
            self.assertTrue(noted["stale"])
            self.assertNotEqual(noted["job"]["status"], "done")
            self.assertNotEqual(noted["job"]["status"].lower(), "done")
            self.assertNotIn(noted["job"]["status"], HS.TERMINAL_WORDS)
            self.assertIn(noted["job"]["status"], HS.NON_TERMINAL_STATES)
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertEqual(disk["jobs"][0]["status"], "VERIFYING")

    def test_noncatalog_stale_evidence_drops_done(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "note-done",
                    "name": "note-done",
                    "status": "DONE",
                    "closes_work": True,
                    "desk": "forge",
                    "updated": "2026-09-25",
                    "proofPermit": "stale-permit",
                    "evidence": [{"class": "NOTE", "runtime": "old"}],
                }
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            noted = HS.note_environment("note-done", {"runtime": "new"}, state_path=state)
            self.assertTrue(noted["stale"])
            self.assertTrue(noted["job"]["evidence"][0]["stale"])
            self.assertEqual(noted["job"]["status"], "VERIFYING")
            self.assertNotIn(noted["job"]["status"], HS.TERMINAL_WORDS)
            self.assertNotIn("proofPermit", noted["job"])
            plain = json.loads(state.read_text(encoding="utf-8"))
            plain["jobs"].append(
                {
                    "id": "plain-done",
                    "name": "plain-done",
                    "status": "done",
                    "desk": "forge",
                    "updated": "2026-08-01",
                    "evidence": [{"runtime": "old"}],
                }
            )
            state.write_text(json.dumps(plain), encoding="utf-8")
            plain_noted = HS.note_environment("plain-done", {"runtime": "new"}, state_path=state)
            self.assertTrue(plain_noted["job"]["evidence"][0]["stale"])
            self.assertNotEqual(plain_noted["job"]["status"].lower(), "done")
            self.assertNotIn(plain_noted["job"]["status"], HS.TERMINAL_WORDS)

    def test_save_drops_historical_done_when_runtime_is_attached(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "hist-done",
                    "name": "hist-done",
                    "status": "done",
                    "desk": "forge",
                    "updated": "2026-08-01",
                }
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            loaded = HS.load(state)
            loaded["jobs"][0]["environment"] = {"runtime": "rt-new"}
            HS.save(loaded, state)
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertEqual(disk["jobs"][0]["environment"]["runtime"], "rt-new")
            self.assertNotEqual(disk["jobs"][0]["status"], "done")
            self.assertNotEqual(disk["jobs"][0]["status"].lower(), "done")
            self.assertNotIn(disk["jobs"][0]["status"], HS.TERMINAL_WORDS)
            self.assertEqual(disk["jobs"][0]["status"], "VERIFYING")

    def test_flipping_closes_work_off_drops_stored_pass(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "kept-pass",
                    "name": "kept-pass",
                    "status": "PASS",
                    "closes_work": True,
                    "desk": "forge",
                    "updated": "2026-09-25",
                    "proofPermit": "old-permit",
                }
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            loaded = HS.load(state)
            loaded["jobs"][0]["closes_work"] = False
            HS.save(loaded, state)
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertFalse(disk["jobs"][0]["closes_work"])
            self.assertNotEqual(disk["jobs"][0]["status"], "PASS")
            self.assertNotIn(disk["jobs"][0]["status"], HS.TERMINAL_WORDS)
            self.assertEqual(disk["jobs"][0]["status"], "BLOCKED")
            self.assertNotIn("proofPermit", disk["jobs"][0])

    def test_unchanged_status_is_not_proof(self) -> None:
        evidence, verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            first = HS.transition_job(
                "job-proof",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertTrue(first["permitted"])
            self.assertEqual(first["job"]["status"], "DONE")
            kept = HS.load(state)
            HS.save(kept, state)
            self.assertEqual(json.loads(state.read_text(encoding="utf-8"))["jobs"][0]["status"], "DONE")
            gutted = HS.load(state)
            gutted["jobs"][0]["evidence"] = [{"class": "NOTE", "runtime": "nope"}]
            gutted["jobs"][0].pop("proofPermit", None)
            HS.save(gutted, state)
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertNotEqual(disk["jobs"][0]["status"], "DONE")
            self.assertNotIn(disk["jobs"][0]["status"], HS.TERMINAL_WORDS)

    def test_declared_requirements_are_not_skipped(self) -> None:
        verifier = {"actor": "Watchdog", "role": "verifier"}
        diff = [{"class": "DIFF"}]
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            default_close = HS.transition_job(
                "need-runtime",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=diff,
                state_path=state,
            )
            self.assertFalse(default_close["permitted"])
            self.assertNotEqual(default_close["job"]["status"], "DONE")
            declared = HS.transition_job(
                "diff-only",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=diff,
                required=["DIFF"],
                state_path=state,
            )
            self.assertTrue(declared["permitted"])
            self.assertEqual(declared["job"]["status"], "DONE")
            self.assertEqual(declared["job"]["required_evidence"], ["DIFF"])
            seeded = HS.load(state)
            seeded["jobs"].append(
                {
                    "id": "declared-runtime",
                    "name": "declared-runtime",
                    "status": "IMPLEMENTED",
                    "required_evidence": ["RUNTIME", "SURFACE"],
                    "desk": "forge",
                    "updated": "2026-09-25",
                }
            )
            HS.save(seeded, state)
            weakened = HS.transition_job(
                "declared-runtime",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=diff,
                required=["DIFF"],
                state_path=state,
            )
            self.assertFalse(weakened["permitted"])
            self.assertNotEqual(weakened["job"]["status"], "DONE")
            evidence, full_verifier, env = _proof()
            full = HS.transition_job(
                "full-proof",
                "DONE",
                builder="Forge",
                verifier=full_verifier,
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertTrue(full["permitted"])
            self.assertEqual(full["job"]["status"], "DONE")

    def test_guard_treats_string_false_as_not_closing(self) -> None:
        evidence, verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            forwarded = HS.guard_outcome_payload(
                {
                    "status": "PASS",
                    "closes_work": "false",
                    "job_id": "string-false",
                    "builder": "Forge",
                    "verifier": verifier,
                    "evidence": evidence,
                    "environment": env,
                    "proofPermit": "not-a-real-permit",
                },
                state_path=state,
            )
            self.assertEqual(forwarded["status"], "BLOCKED")
            self.assertNotIn(forwarded["status"], HS.TERMINAL_WORDS)
            self.assertNotIn("proofPermit", forwarded)
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertFalse(any(job.get("status") == "PASS" for job in disk["jobs"]))

    def test_note_mentioning_runtime_is_not_a_binding(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "hist-note",
                    "name": "hist-note",
                    "status": "done",
                    "desk": "forge",
                    "updated": "2026-08-01",
                    "evidence": [{"class": "NOTE", "runtime": "rt-new"}],
                }
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            loaded = HS.load(state)
            loaded["jobs"][0]["environment"] = {"runtime": "rt-new"}
            HS.save(loaded, state)
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertEqual(disk["jobs"][0]["environment"]["runtime"], "rt-new")
            self.assertNotEqual(disk["jobs"][0]["status"].lower(), "done")
            self.assertNotIn(disk["jobs"][0]["status"], HS.TERMINAL_WORDS)
            self.assertEqual(disk["jobs"][0]["status"], "VERIFYING")

    def test_smoke_and_watchdog_do_not_post_done(self) -> None:
        smoke = (HIVE / "hive-api-smoke.sh").read_text(encoding="utf-8")
        watchdog = (HIVE / "hive-watchdog.sh").read_text(encoding="utf-8")
        for name, body in (("hive-api-smoke.sh", smoke), ("hive-watchdog.sh", watchdog)):
            self.assertNotIn('status":"done"', body, name)
            self.assertNotIn('"status": "done"', body, name)
            self.assertNotIn("status: 'done'", body, name)
            self.assertIn("IMPLEMENTED", body, name)
        self.assertNotIn("${2:-done}", watchdog)
        self.assertNotIn('register_outcome "$summary" "done"', watchdog)

    def test_noncanonical_spelling_drops_when_proof_is_gone(self) -> None:
        evidence, verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            first = HS.transition_job(
                "job-spell",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertTrue(first["permitted"])
            renamed = HS.load(state)
            renamed["jobs"][0]["status"] = "Done"
            HS.save(renamed, state)
            self.assertEqual(json.loads(state.read_text(encoding="utf-8"))["jobs"][0]["status"], "Done")
            gutted = HS.load(state)
            gutted["jobs"][0]["status"] = "done"
            gutted["jobs"][0]["evidence"] = []
            gutted["jobs"][0].pop("proofPermit", None)
            HS.save(gutted, state)
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertNotEqual(disk["jobs"][0]["status"].strip().lower(), "done")
            self.assertNotIn(disk["jobs"][0]["status"].strip().upper(), HS.TERMINAL_WORDS)
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"].append(
                {
                    "id": "spaced-pass",
                    "name": "spaced-pass",
                    "status": "PASS ",
                    "closes_work": True,
                    "desk": "forge",
                    "updated": "2026-09-25",
                    "builder": "Forge",
                    "proofPermit": "old-permit",
                    "evidence": evidence,
                    "verifier": verifier,
                    "environment": env,
                }
            )
            state.write_text(json.dumps(seeded), encoding="utf-8")
            loaded = HS.load(state)
            row = next(job for job in loaded["jobs"] if job["id"] == "spaced-pass")
            row["evidence"] = []
            row.pop("proofPermit", None)
            HS.save(loaded, state)
            saved = json.loads(state.read_text(encoding="utf-8"))
            spaced = next(job for job in saved["jobs"] if job["id"] == "spaced-pass")
            self.assertNotEqual(spaced["status"].strip().upper(), "PASS")
            self.assertNotIn(spaced["status"].strip().upper(), HS.TERMINAL_WORDS)

    def test_stricter_close_survives_a_narrower_required_list(self) -> None:
        evidence, verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            empty = HS.transition_job(
                "empty-env",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment={},
                state_path=state,
            )
            self.assertFalse(empty["permitted"])
            self.assertNotEqual(empty["job"]["status"], "DONE")
            closed = HS.transition_job(
                "job-strict",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertTrue(closed["permitted"])
            self.assertEqual(closed["job"]["status"], "DONE")
            self.assertEqual(closed["job"]["required_evidence"], ["RUNTIME", "SURFACE"])
            narrowed = HS.transition_job(
                "job-strict",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=[{"class": "DIFF"}],
                required=["DIFF"],
                environment={},
                state_path=state,
            )
            self.assertFalse(narrowed["permitted"])
            self.assertEqual(narrowed["job"]["status"], "DONE")
            self.assertEqual(narrowed["state"], narrowed["job"]["status"])
            self.assertEqual(narrowed["permit"], closed["permit"])
            self.assertEqual(narrowed["job"]["required_evidence"], ["RUNTIME", "SURFACE"])
            disk = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in disk["jobs"] if job["id"] == "job-strict")
            self.assertEqual(row["status"], "DONE")
            self.assertEqual(row["proofPermit"], closed["permit"])
            forwarded = HS.guard_outcome_payload(
                {
                    "status": "DONE",
                    "job_id": "job-strict",
                    "builder": "Forge",
                    "verifier": verifier,
                    "evidence": [{"class": "DIFF"}],
                    "required_evidence": ["DIFF"],
                    "environment": {},
                },
                state_path=state,
            )
            disk = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in disk["jobs"] if job["id"] == "job-strict")
            self.assertEqual(forwarded["status"], row["status"])
            self.assertEqual(forwarded.get("proofPermit"), row.get("proofPermit"))
            self.assertEqual(row["status"], "DONE")
            self.assertEqual(row["required_evidence"], ["RUNTIME", "SURFACE"])
            again = HS.transition_job(
                "job-strict",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertTrue(again["permitted"])
            self.assertEqual(again["job"]["status"], "DONE")
            self.assertEqual(again["state"], "DONE")
            refused = HS.transition_job(
                "declared-first",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=[{"class": "DIFF"}],
                required=["RUNTIME", "SURFACE"],
                state_path=state,
            )
            self.assertFalse(refused["permitted"])
            self.assertEqual(refused["job"]["required_evidence"], ["RUNTIME", "SURFACE"])
            follow = HS.transition_job(
                "declared-first",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=[{"class": "DIFF"}],
                required=["DIFF"],
                environment={},
                state_path=state,
            )
            self.assertFalse(follow["permitted"])
            self.assertNotEqual(follow["job"]["status"], "DONE")
            self.assertNotIn(follow["job"]["status"], HS.TERMINAL_WORDS)
            self.assertNotIn("proofPermit", follow["job"])
            self.assertIn("RUNTIME", follow["job"]["required_evidence"])
            self.assertIn("SURFACE", follow["job"]["required_evidence"])

    def test_payload_matches_demoted_disk_row(self) -> None:
        evidence, verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            closed = HS.transition_job(
                "job-demote",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertTrue(closed["permitted"])
            planted = HS.load(state)
            planted["jobs"][0]["environment"] = {
                "runtime": "runtime-2",
                "config": "config-1",
                "version": "v1",
                "changed_at": "2026-09-25T04:00:00+00:00",
            }
            state.write_text(json.dumps(planted), encoding="utf-8")
            forwarded = HS.guard_outcome_payload(
                {
                    "status": "DONE",
                    "job_id": "job-demote",
                    "builder": "Forge",
                    "verifier": verifier,
                    "evidence": evidence,
                },
                state_path=state,
            )
            disk = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in disk["jobs"] if job["id"] == "job-demote")
            self.assertEqual(forwarded["status"], row["status"])
            self.assertNotEqual(forwarded["status"], "DONE")
            self.assertNotIn(forwarded["status"], HS.TERMINAL_WORDS)
            self.assertNotIn("proofPermit", forwarded)
            self.assertNotIn("proofPermit", row)


class SessionReceiptTest(unittest.TestCase):
    def _close(self, store: Path, **extra):
        record = {
            "platform": "cursor",
            "native_session_id": "cursor-session-9",
            "mission_id": "mission-1",
            "job_id": "job-1",
            "seat": "Forge",
            "started_at": "2026-09-25T00:00:00Z",
            "ended_at": "2026-09-25T01:00:00Z",
            "input_ref": "requirement:failure-guards",
            "tools": ["shell"],
            "artifacts": ["hive-state.py"],
            "final_state": "IMPLEMENTED",
            "blockers": [],
        }
        record.update(extra)
        return SESS.close_session(record, store=store)

    def test_normal_close_emits_one_receipt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp)
            transcript = store / "native.jsonl"
            transcript.write_text("{}\n", encoding="utf-8")
            receipt = self._close(store, transcript_pointer=str(transcript))
            self.assertEqual(receipt["completeness"], "FULL")
            lines = (store / "receipts.jsonl").read_text(encoding="utf-8").splitlines()
            self.assertEqual(len(lines), 1)
            self.assertEqual(receipt["platform"], "cursor")
            self.assertEqual(receipt["native_session_id"], "cursor-session-9")

    def test_handoff_links_the_receiver(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp)
            self._close(store, transcript_unavailable=True)
            linked = SESS.link_handoff(
                store,
                platform="cursor",
                native_session_id="cursor-session-9",
                mission_id="mission-1",
                job_id="job-1",
                handoff_target="Watchdog",
            )
            self.assertEqual(linked["handoff_target"], "Watchdog")
            lines = (store / "receipts.jsonl").read_text(encoding="utf-8").splitlines()
            self.assertEqual(len(lines), 1)

    def test_unavailable_transcript_is_partial(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            receipt = self._close(Path(tmp), transcript_unavailable=True)
            self.assertEqual(receipt["completeness"], "PARTIAL")
            self.assertNotIn("invented transcript", json.dumps(receipt))

    def test_duplicate_close_is_one_logical_receipt(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp)
            first = self._close(store, transcript_unavailable=True)
            second = self._close(store, transcript_unavailable=True, final_state="DONE")
            self.assertEqual(first["receipt_id"], second["receipt_id"])
            lines = (store / "receipts.jsonl").read_text(encoding="utf-8").splitlines()
            self.assertEqual(len(lines), 1)

    def test_pointer_at_missing_evidence_fails_validation(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            missing = str(Path(tmp) / "not-written.txt")
            receipt = self._close(Path(tmp), evidence_refs=[missing], transcript_pointer=missing)
            errors = SESS.validate_receipt(receipt)
            self.assertTrue(errors)
            self.assertNotEqual(receipt["completeness"], "FULL")

    def test_native_platform_and_session_id_are_preserved(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp)
            cursor = SESS.close_session(
                {"platform": "cursor", "native_session_id": "abc-123", "mission_id": "m", "job_id": "j", "transcript_unavailable": True},
                store=store,
            )
            codex = SESS.close_session(
                {"platform": "codex", "native_session_id": "codex-thread-7", "mission_id": "m2", "job_id": "j2", "transcript_unavailable": True},
                store=store,
            )
            self.assertEqual(cursor["platform"], "cursor")
            self.assertEqual(cursor["native_session_id"], "abc-123")
            self.assertEqual(codex["platform"], "codex")
            self.assertEqual(codex["native_session_id"], "codex-thread-7")


class VersionedContinuityTest(unittest.TestCase):
    def test_v2_after_v3_is_stale(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            v3 = _mutation(3, {"value": "new"})
            self.assertEqual(BUS.publish_state(v3, path=log)["result"], "PUBLISHED")
            self.assertEqual(BUS.apply_state("desk", v3, path=log)["result"], "APPLIED")
            stale = BUS.apply_state("desk", _mutation(2, {"value": "old"}), path=log)
            self.assertEqual(stale["result"], "STALE")

    def test_duplicate_v3_applies_once(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            v3 = _mutation(3, {"value": "once"})
            BUS.publish_state(v3, path=log)
            first = BUS.apply_state("desk", v3, path=log)
            second = BUS.apply_state("desk", v3, path=log)
            self.assertEqual(first["result"], "APPLIED")
            self.assertFalse(first.get("duplicate"))
            self.assertEqual(second["result"], "APPLIED")
            self.assertTrue(second.get("duplicate"))
            applied = [
                row
                for row in BUS._read_all(log)
                if row.get("phase") == "APPLIED" and row.get("consumer") == "desk"
            ]
            self.assertEqual(len(applied), 1)

    def test_incompatible_successors_conflict(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            original = _mutation(3, {"value": "a"})
            BUS.publish_state(original, path=log)
            conflict = BUS.apply_state("desk", _mutation(3, {"value": "b"}), path=log)
            self.assertEqual(conflict["result"], "CONFLICT")
            auth = BUS.authoritative("job-1", log)
            self.assertIsNotNone(auth)
            assert auth is not None
            self.assertEqual(auth["payload"]["value"], "a")

    def test_offline_catch_up_is_ordered_and_idempotent(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            for version in (1, 2, 3):
                published = BUS.publish_jarvis(
                    {"step": version},
                    state_version=version,
                    source_session="jarvis-primary-session",
                    writer="event-bus.py",
                    path=log,
                )
                self.assertEqual(published["published"]["result"], "PUBLISHED")
            first = BUS.catch_up(BUS.JARVIS_ISOLATED, path=log, entity_id=BUS.JARVIS_ENTITY)
            self.assertEqual([row["result"] for row in first], ["APPLIED", "APPLIED", "APPLIED"])
            self.assertEqual([row["state_version"] for row in first], [1, 2, 3])
            second = BUS.catch_up(BUS.JARVIS_ISOLATED, path=log, entity_id=BUS.JARVIS_ENTITY)
            self.assertTrue(all(row.get("duplicate") for row in second))
            applied = [
                row
                for row in BUS._read_all(log)
                if row.get("phase") == "APPLIED" and row.get("consumer") == BUS.JARVIS_ISOLATED
            ]
            self.assertEqual(len(applied), 3)

    def test_projection_without_ack_is_not_synced(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            log = folder / "events.jsonl"
            projection = folder / "grok-desk.json"
            brief = {
                "generatedAt": "2026-09-25T03:00:00+00:00",
                "hash": "abc123",
                "agent": "Forge",
                "sourceRoot": "test",
                "captureFreshness": "test",
                "markdown": "desk card",
                "source_session": "grok-session-1",
            }
            wrote = BRIEF.publish_shared_context(brief, bus_path=log, shared_path=projection)
            body = json.loads(wrote.read_text(encoding="utf-8"))
            self.assertFalse(body["continuity"]["synced"])
            self.assertFalse(BUS.projection_synced(BUS.GROK_DESK_CONSUMER, "grok-desk:Forge", path=log))

    def test_applied_persists_acknowledgement(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            log = folder / "events.jsonl"
            cohort = _blank_state(folder)
            mutation = _mutation(1, {"ok": True}, entity="grok-desk:Forge")
            mutation["entity_type"] = "grok_desk_projection"
            mutation["source_platform"] = "grok"
            BUS.publish_state(mutation, path=log)
            applied = BUS.apply_state(BUS.GROK_DESK_CONSUMER, mutation, path=log, cohort_path=cohort)
            self.assertEqual(applied["result"], "APPLIED")
            ack = BUS.acknowledge(BUS.GROK_DESK_CONSUMER, "grok-desk:Forge", path=log, cohort_path=cohort)
            self.assertEqual(ack["result"], "ACKNOWLEDGED")
            phases = [row.get("phase") for row in BUS._read_all(log)]
            self.assertIn("APPLIED", phases)
            self.assertIn("ACKNOWLEDGED", phases)
            again = BUS.write_projection(BUS.GROK_DESK_CONSUMER, "grok-desk:Forge", folder / "proj.json", path=log)
            self.assertTrue(again["synced"])
            counters = json.loads(cohort.read_text(encoding="utf-8"))["post_fix_cohort"]["counters"]
            self.assertGreaterEqual(counters["propagation_latency"]["samples"], 1)

    def test_stale_consumer_cannot_drive_consequential_write(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            BUS.publish_jarvis(
                {"step": 3},
                state_version=3,
                source_session="jarvis-primary-session",
                writer="event-bus.py",
                path=log,
            )
            stale = BUS.consequential_write(
                BUS.JARVIS_ISOLATED,
                {
                    "entity_id": BUS.JARVIS_ENTITY,
                    "entity_type": "jarvis_bus",
                    "state_version": 4,
                    "changed_at": "2026-09-25T04:00:00+00:00",
                    "source_platform": "jarvis",
                    "source_session": "jarvis-isolated-session",
                    "writer": "jarvis-isolated",
                    "provenance": "jarvis-isolated",
                    "supersedes_version": 3,
                    "payload": {"step": 4},
                },
                path=log,
            )
            self.assertEqual(stale["result"], "STALE")
            auth = BUS.authoritative(BUS.JARVIS_ENTITY, log)
            assert auth is not None
            self.assertEqual(auth["state_version"], 3)

    def test_paste_is_not_the_bus(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            rejected = BUS.publish_state(
                {**_mutation(1, {"markdown": "paste pack"}), "source_platform": "paste", "via": "paste"},
                path=log,
            )
            self.assertEqual(rejected["result"], "REJECTED")
            self.assertIsNone(BUS.authoritative("job-1", log))


class ProductAndCohortTest(unittest.TestCase):
    def test_product_completed_without_proof_does_not_close(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            projects = folder / "projects"
            projects.mkdir()
            (projects / "demo.json").write_text(
                json.dumps({"project_id": "demo", "lifecycle": "development", "agent_state": "WORKING"}) + "\n",
                encoding="utf-8",
            )
            state = _blank_state(folder)
            previous = PRODUCT.STATE_DIR
            previous_emit = PRODUCT._load_event_bus
            PRODUCT.STATE_DIR = projects
            PRODUCT._load_event_bus = lambda: (lambda *args, **kwargs: "skipped")
            try:
                updated = PRODUCT.transition("demo", None, "COMPLETED", "Forge", state_path=state)
            finally:
                PRODUCT.STATE_DIR = previous
                PRODUCT._load_event_bus = previous_emit
            self.assertNotEqual(updated["agent_state"], "COMPLETED")
            self.assertEqual(updated["agent_state"], "IMPLEMENTED")
            self.assertFalse(updated["terminal_guard"]["permitted"])

    def test_post_fix_cohort_is_armed_and_unadopted(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            data = HS.load(state)
            armed = HS.arm_cohort(data)
            self.assertTrue(armed["armed"])
            self.assertFalse(armed["adopted"])
            self.assertFalse(armed["compare_to_historical_floors"])
            floors = armed["historical_floors"]
            self.assertEqual(
                [floors["unsupported_completion_sessions"], floors["artifact_only_rows"], floors["divergence_instances"]],
                [39, 34, 18],
            )
            self.assertNotIn("total", floors)
            HS.bump_cohort(data, "unsupported_terminal_escape_rate", attempts=1, escapes=1)
            blob = json.dumps(data["post_fix_cohort"])
            self.assertNotIn("91", blob)


if __name__ == "__main__":
    unittest.main()
