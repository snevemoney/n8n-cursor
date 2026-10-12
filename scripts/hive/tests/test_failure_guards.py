#!/usr/bin/env python3
"""Adversarial checks for terminal proof, session receipts, and versioned continuity."""
from __future__ import annotations

import hashlib
import importlib.util
import json
import subprocess
import sys
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
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertEqual(disk["jobs"][0]["status"], "done")
            self.assertNotIn("proofPermit", disk["jobs"][0])
            promoted = json.loads(json.dumps(loaded))
            promoted["jobs"][0]["status"] = "DONE"
            with self.assertRaises(SystemExit):
                HS.save(promoted, state)
            after = json.loads(state.read_text(encoding="utf-8"))
            self.assertEqual(after["jobs"][0]["status"], "done")
            self.assertNotIn("proofPermit", after["jobs"][0])
            noted = json.loads(json.dumps(after))
            noted["jobs"][0]["evidence"] = [{"class": "DIFF", "note": "attached"}]
            HS.save(noted, state)
            dropped = json.loads(state.read_text(encoding="utf-8"))
            self.assertNotEqual(dropped["jobs"][0]["status"], "done")
            self.assertNotEqual(dropped["jobs"][0]["status"], "DONE")
            self.assertNotIn(dropped["jobs"][0]["status"], HS.TERMINAL_WORDS)

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

    def test_diff_binding_does_not_keep_historical_done(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "hist-diff",
                    "name": "hist-diff",
                    "status": "done",
                    "desk": "forge",
                    "updated": "2026-08-01",
                    "evidence": [
                        {
                            "class": "DIFF",
                            "runtime": "rt-new",
                            "config": "c",
                            "version": "v",
                        }
                    ],
                }
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            noted = HS.note_environment(
                "hist-diff",
                {
                    "runtime": "rt-new",
                    "config": "c",
                    "version": "v",
                    "changed_at": "2026-09-25T04:00:00+00:00",
                },
                state_path=state,
            )
            self.assertEqual(noted["job"]["status"], "VERIFYING")
            self.assertNotIn(noted["job"]["status"], HS.TERMINAL_WORDS)
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertNotEqual(disk["jobs"][0]["status"].strip().lower(), "done")
            self.assertNotIn("proofPermit", disk["jobs"][0])
            evidence, verifier, env = _proof()
            closed = HS.transition_job(
                "kept-done",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertTrue(closed["permitted"])
            planted = HS.load(state)
            target = next(job for job in planted["jobs"] if job["id"] == "kept-done")
            target["evidence"] = list(target.get("evidence") or []) + [{"class": "DIFF", "note": "attached"}]
            HS.save(planted, state)
            saved = json.loads(state.read_text(encoding="utf-8"))
            kept = next(job for job in saved["jobs"] if job["id"] == "kept-done")
            self.assertNotEqual(kept["status"], "DONE")
            self.assertNotIn(kept["status"], HS.TERMINAL_WORDS)

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
            self.assertEqual(row.get("evidence"), closed["job"].get("evidence"))
            self.assertEqual(row.get("required_evidence"), ["RUNTIME", "SURFACE"])
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
            before = json.loads(state.read_text(encoding="utf-8"))
            before_row = next(job for job in before["jobs"] if job["id"] == "declared-first")
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
            after = json.loads(state.read_text(encoding="utf-8"))
            after_row = next(job for job in after["jobs"] if job["id"] == "declared-first")
            self.assertEqual(after_row, before_row)
            follow_lines = [
                entry
                for entry in after.get("log") or []
                if entry.get("job") == "declared-first" and entry.get("stop_kind") == "terminal_rejected"
            ]
            self.assertTrue(follow_lines)
            self.assertEqual(follow_lines[-1].get("done_check"), follow["reason"])
            met = HS.transition_job(
                "declared-first",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                required=["RUNTIME", "SURFACE"],
                state_path=state,
            )
            self.assertTrue(met["permitted"])
            self.assertEqual(met["state"], "DONE")
            self.assertEqual(met["job"]["status"], "DONE")
            self.assertNotEqual(met["job"]["status"], "PARTIAL")

    def test_refused_transition_does_not_rewrite_working(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "open-job",
                    "name": "open-job",
                    "status": "working",
                    "desk": "forge",
                    "updated": "2026-09-25",
                    "required_evidence": ["RUNTIME", "SURFACE"],
                },
                {
                    "id": "coverage-loop",
                    "name": "coverage-loop",
                    "status": "done",
                    "desk": "parent",
                    "updated": "2026-08-14",
                    "required_evidence": ["RUNTIME", "SURFACE"],
                },
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            before = json.loads(state.read_text(encoding="utf-8"))
            refused = HS.transition_job(
                "open-job",
                "DONE",
                builder="Forge",
                verifier={"actor": "Watchdog", "role": "verifier"},
                evidence=[{"class": "DIFF"}],
                required=["DIFF"],
                environment={},
                state_path=state,
            )
            self.assertFalse(refused["permitted"])
            disk = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in disk["jobs"] if job["id"] == "open-job")
            prior = next(job for job in before["jobs"] if job["id"] == "open-job")
            self.assertEqual(row["status"], "working")
            self.assertEqual(row["required_evidence"], ["RUNTIME", "SURFACE"])
            self.assertEqual(row["status"], prior["status"])
            self.assertEqual(row["required_evidence"], prior["required_evidence"])
            self.assertNotEqual(row["status"], "VERIFYING")
            self.assertEqual(row, prior)
            self.assertNotIn("terminal_rejected", row)
            open_lines = [
                entry
                for entry in disk.get("log") or []
                if entry.get("job") == "open-job" and entry.get("stop_kind") == "terminal_rejected"
            ]
            self.assertEqual(len(open_lines), 1)
            self.assertEqual(open_lines[0].get("done_check"), refused["reason"])
            hist = HS.transition_job(
                "coverage-loop",
                "DONE",
                builder="Forge",
                verifier={"actor": "Watchdog", "role": "verifier"},
                evidence=[{"class": "DIFF"}],
                required=["DIFF"],
                environment={},
                state_path=state,
            )
            self.assertFalse(hist["permitted"])
            disk = json.loads(state.read_text(encoding="utf-8"))
            kept = next(job for job in disk["jobs"] if job["id"] == "coverage-loop")
            prior_hist = next(job for job in before["jobs"] if job["id"] == "coverage-loop")
            self.assertEqual(kept, prior_hist)
            self.assertEqual(kept["status"], "done")
            self.assertEqual(kept["required_evidence"], ["RUNTIME", "SURFACE"])
            self.assertNotIn("proofPermit", kept)
            hist_lines = [
                entry
                for entry in disk.get("log") or []
                if entry.get("job") == "coverage-loop" and entry.get("stop_kind") == "terminal_rejected"
            ]
            self.assertEqual(len(hist_lines), 1)
            self.assertEqual(hist_lines[0].get("done_check"), hist["reason"])
            reloaded = HS.load(state)
            HS.save(reloaded, state)
            again = json.loads(state.read_text(encoding="utf-8"))
            resaved = next(job for job in again["jobs"] if job["id"] == "coverage-loop")
            self.assertEqual(resaved["status"], "done")
            self.assertNotIn("proofPermit", resaved)

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

    def test_done_label_without_permit_is_absent_from_the_done_total(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "historical",
                    "name": "historical",
                    "status": "done",
                    "desk": "parent",
                    "updated": "2026-08-14",
                }
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            reloaded = HS.load(state)
            HS.save(reloaded, state)
            disk = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in disk["jobs"] if job["id"] == "historical")
            self.assertEqual(row["status"], "done")
            self.assertNotIn("proofPermit", row)
            self.assertFalse(HS.counts_as_done(row))
            self.assertEqual(HS.done_total(disk["jobs"]), 0)
            self.assertEqual(HS.done_jobs(disk["jobs"]), [])

    def test_permitted_close_is_present_in_the_done_total(self) -> None:
        evidence, verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            closed = HS.transition_job(
                "proven",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertTrue(closed["permitted"])
            disk = json.loads(state.read_text(encoding="utf-8"))
            self.assertEqual(HS.done_total(disk["jobs"]), 1)
            self.assertEqual([job["id"] for job in HS.done_jobs(disk["jobs"])], ["proven"])
            self.assertEqual(disk["jobs"][0]["status"], "DONE")

    def test_refused_transition_does_not_mutate_the_job(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "open-job",
                    "name": "open-job",
                    "status": "working",
                    "desk": "forge",
                    "updated": "2026-09-25",
                    "required_evidence": ["RUNTIME", "SURFACE"],
                }
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            before = json.loads(state.read_text(encoding="utf-8"))
            prior = next(job for job in before["jobs"] if job["id"] == "open-job")
            refused = HS.transition_job(
                "open-job",
                "DONE",
                builder="Forge",
                verifier={"actor": "Watchdog", "role": "verifier"},
                evidence=[{"class": "DIFF"}],
                state_path=state,
            )
            self.assertFalse(refused["permitted"])
            disk = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in disk["jobs"] if job["id"] == "open-job")
            self.assertEqual(row, prior)
            self.assertEqual(set(row), set(prior))
            self.assertNotIn("terminal_rejected", row)
            self.assertEqual(row["status"], "working")
            self.assertNotEqual(row["status"], "DONE")
            self.assertEqual(HS.done_total(disk["jobs"]), 0)
            lines = [
                entry
                for entry in disk.get("log") or []
                if entry.get("job") == "open-job" and entry.get("stop_kind") == "terminal_rejected"
            ]
            self.assertEqual(len(lines), 1)
            self.assertEqual(lines[0].get("done_check"), refused["reason"])
            self.assertTrue(lines[0].get("done_check"))

    def test_refused_exact_done_without_permit_keeps_the_label(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "canonical-unproven",
                    "name": "canonical-unproven",
                    "status": "DONE",
                    "desk": "forge",
                    "updated": "2026-09-25",
                },
                {
                    "id": "sibling",
                    "name": "sibling",
                    "status": "working",
                    "desk": "forge",
                    "updated": "2026-09-25",
                },
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            before = json.loads(state.read_text(encoding="utf-8"))
            prior = next(job for job in before["jobs"] if job["id"] == "canonical-unproven")
            refused = HS.transition_job(
                "canonical-unproven",
                "DONE",
                builder="Forge",
                verifier={"actor": "Watchdog", "role": "verifier"},
                evidence=[{"class": "DIFF"}],
                environment={},
                state_path=state,
            )
            self.assertFalse(refused["permitted"])
            disk = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in disk["jobs"] if job["id"] == "canonical-unproven")
            self.assertEqual(row, prior)
            self.assertEqual(row["status"], "DONE")
            self.assertNotIn("terminal_rejected", row)
            self.assertNotIn("proofPermit", row)
            self.assertFalse(HS.counts_as_done(row))
            self.assertEqual(HS.done_total(disk["jobs"]), 0)
            lines = [
                entry
                for entry in disk.get("log") or []
                if entry.get("job") == "canonical-unproven" and entry.get("stop_kind") == "terminal_rejected"
            ]
            self.assertEqual(len(lines), 1)
            self.assertEqual(lines[0].get("done_check"), refused["reason"])
            owed = HS.record_owed(
                "other-owed",
                owner="Forge",
                expected_artifact="apps/scorpion/app/api/hive/register/route.ts",
                wake_condition="next change that ships scorpion_register_outcome",
                stall_timeout="2 register attempts while the route file is absent",
                note="route file is absent",
                state_path=state,
            )
            self.assertEqual(owed["status"], "BLOCKED")
            disk = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in disk["jobs"] if job["id"] == "canonical-unproven")
            self.assertEqual(row, prior)
            self.assertEqual(row["status"], "DONE")
            self.assertNotIn("terminal_rejected", row)
            self.assertEqual(HS.done_total(disk["jobs"]), 0)
            kept_lines = [
                entry
                for entry in disk.get("log") or []
                if entry.get("job") == "canonical-unproven" and entry.get("stop_kind") == "terminal_rejected"
            ]
            self.assertEqual(kept_lines, lines)
            other = HS.transition_job(
                "sibling",
                "DONE",
                builder="Forge",
                verifier={"actor": "Watchdog", "role": "verifier"},
                evidence=[{"class": "DIFF"}],
                environment={},
                state_path=state,
            )
            self.assertFalse(other["permitted"])
            disk = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in disk["jobs"] if job["id"] == "canonical-unproven")
            self.assertEqual(row, prior)
            self.assertNotIn("terminal_rejected", row)
            self.assertEqual(HS.done_total(disk["jobs"]), 0)
            sibling_lines = [
                entry
                for entry in disk.get("log") or []
                if entry.get("job") == "sibling" and entry.get("stop_kind") == "terminal_rejected"
            ]
            self.assertEqual(len(sibling_lines), 1)

    def test_refused_reclose_of_proven_job_appends_the_log(self) -> None:
        evidence, verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            closed = HS.transition_job(
                "proven",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=evidence,
                environment=env,
                state_path=state,
            )
            self.assertTrue(closed["permitted"])
            before = json.loads(state.read_text(encoding="utf-8"))
            prior = next(job for job in before["jobs"] if job["id"] == "proven")
            log_before = list(before.get("log") or [])
            refused = HS.transition_job(
                "proven",
                "DONE",
                builder="Forge",
                verifier=verifier,
                evidence=[{"class": "DIFF"}],
                environment={},
                state_path=state,
            )
            self.assertFalse(refused["permitted"])
            disk = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in disk["jobs"] if job["id"] == "proven")
            self.assertEqual(row, prior)
            self.assertEqual(row["status"], "DONE")
            self.assertEqual(row.get("proofPermit"), closed["permit"])
            self.assertNotIn("terminal_rejected", row)
            self.assertEqual(HS.done_total(disk["jobs"]), 1)
            lines = [
                entry
                for entry in disk.get("log") or []
                if entry.get("job") == "proven" and entry.get("stop_kind") == "terminal_rejected"
            ]
            self.assertEqual(len(lines), 1)
            self.assertEqual(len(disk.get("log") or []), len(log_before) + 1)
            self.assertEqual(lines[-1].get("done_check"), refused["reason"])

    def test_stalled_owed_artifact_has_owner_and_wake_not_founder_wait(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            state = _blank_state(Path(tmp))
            owed = HS.record_owed(
                "hive-register-route",
                owner="Forge",
                expected_artifact="apps/scorpion/app/api/hive/register/route.ts",
                wake_condition="next change that ships scorpion_register_outcome",
                stall_timeout="2 register attempts while the route file is absent",
                note="route file is absent",
                state_path=state,
            )
            held = HS.stall_disposition(owed)
            self.assertEqual(owed["status"], "BLOCKED")
            self.assertEqual(held["owner"], "Forge")
            self.assertEqual(held["wake_condition"], owed["wake_condition"])
            self.assertNotEqual(held["wait"], "WAIT_EVENS")
            self.assertFalse(held["founder_wait"])
            missing_owner = {
                "status": "BLOCKED",
                "expected_artifact": "route.ts",
                "wake_condition": "file appears",
                "stall_timeout": "2 attempts",
                "authority_class": "send",
            }
            self.assertFalse(HS.stall_disposition(missing_owner)["founder_wait"])
            self.assertNotEqual(HS.stall_disposition(missing_owner)["wait"], "WAIT_EVENS")
            stale = {
                "status": "done",
                "owner": "Forge",
                "expected_artifact": "route.ts",
                "wake_condition": "file appears",
                "stall_timeout": "2 attempts",
                "authority_class": "send",
            }
            self.assertFalse(HS.stall_disposition(stale)["founder_wait"])
            self.assertNotEqual(HS.stall_disposition(stale)["wait"], "WAIT_EVENS")
            consequential = {
                "status": "BLOCKED",
                "owner": "HITL Operator",
                "expected_artifact": "sent receipt",
                "wake_condition": "Evens approves the send",
                "stall_timeout": "1 unanswered send",
                "authority_class": "send",
            }
            sent = HS.stall_disposition(consequential)
            self.assertTrue(sent["founder_wait"])
            self.assertEqual(sent["wait"], "WAIT_EVENS")


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

    def test_full_claim_with_unknown_pointer_is_not_full(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            receipt = self._close(Path(tmp), completeness="FULL")
            self.assertEqual(receipt["transcript_pointer"], "UNKNOWN")
            self.assertIn(receipt["completeness"], ("PARTIAL", "UNAVAILABLE"))
            self.assertNotEqual(receipt["completeness"], "FULL")
            self.assertNotIn("transcript", json.dumps({k: v for k, v in receipt.items() if k != "transcript_pointer"}))

    def test_empty_id_and_no_pointer_stays_unavailable(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            receipt = SESS.close_session(
                {"platform": "cursor", "id": "", "completeness": "FULL"},
                store=Path(tmp),
            )
            self.assertEqual(receipt["completeness"], "UNAVAILABLE")
            self.assertEqual(receipt["native_session_id"], "UNKNOWN")
            self.assertEqual(receipt["transcript_pointer"], "UNKNOWN")

    def test_session_index_pointer_is_not_a_transcript(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp)
            index = store / "session_index.jsonl"
            index.write_text('{"id":"codex-thread-7"}\n', encoding="utf-8")
            receipt = SESS.close_session(
                {
                    "platform": "codex",
                    "native_session_id": "codex-thread-7",
                    "path": str(index),
                    "completeness": "FULL",
                },
                store=store,
            )
            self.assertNotEqual(receipt["completeness"], "FULL")
            self.assertEqual(receipt["platform"], "codex")
            self.assertEqual(receipt["native_session_id"], "codex-thread-7")
            self.assertEqual(receipt["transcript_pointer"], str(index))
            errors = receipt.get("validation_errors") or []
            self.assertTrue(any("does not resolve" in item for item in errors))

    def test_missing_evidence_with_real_transcript_fails_validation(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp)
            transcript = store / "native.jsonl"
            transcript.write_text("{}\n", encoding="utf-8")
            missing = store / "not-written.txt"
            receipt = self._close(
                store,
                transcript_pointer=str(transcript),
                evidence_refs=[str(missing)],
            )
            errors = receipt.get("validation_errors") or []
            self.assertTrue(any(item.startswith("missing evidence:") for item in errors))
            self.assertEqual(receipt["completeness"], "PARTIAL")
            self.assertFalse(missing.exists())

    def test_close_then_handoff_is_one_receipt_with_receiver(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            store = Path(tmp)
            closed = SESS.close_session(
                {
                    "platform": "cursor",
                    "native_session_id": "cursor-session-9",
                    "transcript_unavailable": True,
                },
                store=store,
            )
            self.assertEqual(closed["logical_id"], "cursor|cursor-session-9|UNKNOWN|UNKNOWN")
            self.assertEqual(closed["handoff_target"], "UNKNOWN")
            linked = SESS.link_handoff(
                store,
                platform="cursor",
                native_session_id="cursor-session-9",
                mission_id="cid-grade-1",
                job_id="research.web_intel",
                handoff_target="Product GTM",
            )
            again = SESS.link_handoff(
                store,
                platform="cursor",
                native_session_id="cursor-session-9",
                mission_id="cid-grade-1",
                job_id="research.web_intel",
                handoff_target="Product GTM",
            )
            lines = (store / "receipts.jsonl").read_text(encoding="utf-8").splitlines()
            self.assertEqual(len(lines), 1)
            body = json.loads(lines[0])
            self.assertEqual(linked["handoff_target"], "Product GTM")
            self.assertEqual(again["handoff_target"], "Product GTM")
            self.assertEqual(body["handoff_target"], "Product GTM")
            self.assertEqual(body["logical_id"], "cursor|cursor-session-9|cid-grade-1|research.web_intel")
            self.assertEqual(body["receipt_id"], body["logical_id"])
            self.assertEqual(body["completeness"], "PARTIAL")
            self.assertEqual(body["transcript_pointer"], "UNKNOWN")


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
            mutation = _mutation(1, {"hash": "abc123", "markdown": "desk card"}, entity="grok-desk:Forge")
            mutation["entity_type"] = "grok_desk_projection"
            mutation["source_platform"] = "grok"
            published = BUS.publish_state(mutation, path=log)
            self.assertEqual(published["result"], "PUBLISHED")
            body = BUS.write_projection(BUS.GROK_DESK_CONSUMER, "grok-desk:Forge", projection, path=log)
            self.assertFalse(body["synced"])
            self.assertFalse(BUS.projection_synced(BUS.GROK_DESK_CONSUMER, "grok-desk:Forge", path=log))
            self.assertNotIn("ACKNOWLEDGED", [row.get("phase") for row in BUS._read_all(log)])

    def test_publish_grok_desk_receives_applies_and_acks(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            log = folder / "events.jsonl"
            projection = folder / "grok-desk.json"
            result = BUS.publish_grok_desk(
                "Forge",
                {"hash": "abc123", "markdown": "desk card"},
                state_version=1,
                source_session="grok-session-1",
                writer="outer-heaven-brief.py",
                changed_at="2026-09-25T03:00:00+00:00",
                path=log,
                projection_path=projection,
            )
            phases = [row.get("phase") for row in BUS._read_all(log)]
            self.assertEqual(phases, ["PUBLISHED", "RECEIVED", "APPLIED", "ACKNOWLEDGED"])
            self.assertEqual(result["published"]["result"], "PUBLISHED")
            self.assertTrue(result["synced"])
            self.assertTrue(result["projection"]["synced"])
            consumers = {row.get("phase"): row.get("consumer") for row in BUS._read_all(log)}
            self.assertEqual(consumers["RECEIVED"], BUS.GROK_DESK_CONSUMER)
            self.assertEqual(consumers["APPLIED"], BUS.GROK_DESK_CONSUMER)
            self.assertEqual(consumers["ACKNOWLEDGED"], BUS.GROK_DESK_CONSUMER)
            self.assertTrue(BUS.projection_synced(BUS.GROK_DESK_CONSUMER, "grok-desk:Forge", path=log))

    def test_publish_jarvis_receives_applies_and_acks(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            result = BUS.publish_jarvis(
                {"step": 1},
                state_version=1,
                source_session="jarvis-primary-session",
                writer="event-bus.py",
                changed_at="2026-09-25T04:00:00+00:00",
                path=log,
            )
            phases = [row.get("phase") for row in BUS._read_all(log)]
            self.assertEqual(phases, ["PUBLISHED", "RECEIVED", "APPLIED", "ACKNOWLEDGED"])
            self.assertEqual(result["published"]["result"], "PUBLISHED")
            self.assertEqual(result["applied"]["result"], "APPLIED")
            consumers = {row.get("phase"): row.get("consumer") for row in BUS._read_all(log)}
            self.assertEqual(consumers["RECEIVED"], BUS.JARVIS_PRIMARY)
            self.assertEqual(consumers["APPLIED"], BUS.JARVIS_PRIMARY)
            self.assertEqual(consumers["ACKNOWLEDGED"], BUS.JARVIS_PRIMARY)

    def test_acknowledged_projection_is_current_for_a_later_process(self) -> None:
        script = HIVE / "os" / "event-bus.py"
        fixture_mission = "mission-local-harmless"
        fixture_session = "session-local-harmless"
        operator_log = Path.home() / ".grokbot" / "os-events.jsonl"
        operator_existed = operator_log.exists()
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            projection = BUS.jarvis_projection_path(log)
            self.assertEqual(projection.parent, log.parent)
            self.assertFalse(str(projection).startswith(str(Path.home() / ".grokbot")))

            def run(*extra: str) -> subprocess.CompletedProcess[str]:
                return subprocess.run(
                    [sys.executable, str(script), "--path", str(log), *extra],
                    check=False,
                    capture_output=True,
                    text=True,
                )

            started = run(
                "--start",
                "--mission-id",
                fixture_mission,
                "--session-id",
                fixture_session,
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(started.returncode, 0, started.stderr)
            self.assertEqual(
                [row.get("phase") for row in BUS._read_all(log) if row.get("phase")],
                ["PUBLISHED", "RECEIVED", "APPLIED", "ACKNOWLEDGED"],
            )

            reader = subprocess.run(
                [
                    sys.executable,
                    "-c",
                    "import json,sys; print(json.dumps(json.load(open(sys.argv[1], encoding='utf-8'))))",
                    str(projection),
                ],
                check=False,
                capture_output=True,
                text=True,
            )
            self.assertEqual(reader.returncode, 0, reader.stderr)
            held = json.loads(reader.stdout)
            self.assertEqual(held["consumer"], BUS.JARVIS_PRIMARY)
            self.assertEqual(held["entity_id"], BUS.JARVIS_ENTITY)
            self.assertTrue(held["synced"])
            payload = held["authoritative"]["payload"]
            self.assertEqual(payload["mission_id"], fixture_mission)
            self.assertEqual(payload["session_id"], fixture_session)
            self.assertTrue(payload["local"])
            self.assertTrue(payload["harmless"])

            log_snapshot = log.read_bytes()
            projection_snapshot = projection.read_bytes()
            later = run("--status", "--mission-id", fixture_mission)
            self.assertEqual(later.returncode, 0, later.stderr)
            self.assertEqual(log.read_bytes(), log_snapshot)
            self.assertEqual(projection.read_bytes(), projection_snapshot)
            seen = json.loads(later.stdout)
            self.assertNotIn("payload", seen)
            self.assertNotIn("payload", seen["mission"])
            self.assertNotIn("payload", seen["bus_head"])
            self.assertTrue(seen["found"])
            self.assertEqual(seen["mission"]["mission_id"], fixture_mission)
            self.assertEqual(seen["mission"]["session_id"], fixture_session)
            self.assertEqual(seen["mission"]["phase"], "ACKNOWLEDGED")
            self.assertEqual(seen["mission"]["state_version"], 1)

            hidden = projection.with_name(projection.name + ".hidden")
            projection.rename(hidden)
            without_hold = run("--status", "--mission-id", fixture_mission)
            self.assertEqual(without_hold.returncode, 0, without_hold.stderr)
            self.assertEqual(log.read_bytes(), log_snapshot)
            still = json.loads(without_hold.stdout)
            self.assertEqual(still["mission"]["mission_id"], fixture_mission)
            self.assertEqual(still["mission"]["session_id"], fixture_session)
            self.assertEqual(still["mission"]["phase"], "ACKNOWLEDGED")
            self.assertNotIn("payload", still)
            self.assertNotIn("payload", still["mission"])
            self.assertNotIn("payload", still["bus_head"])
            hidden.rename(projection)
            self.assertEqual(projection.read_bytes(), projection_snapshot)

            again = run(
                "--start",
                "--mission-id",
                fixture_mission,
                "--session-id",
                "session-not-stored",
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(again.returncode, 0, again.stderr)
            self.assertEqual(log.read_bytes(), log_snapshot)
            self.assertEqual(projection.read_bytes(), projection_snapshot)
            repeated = json.loads(again.stdout)
            self.assertEqual(repeated["mission_id"], fixture_mission)
            self.assertEqual(repeated["session_id"], fixture_session)

            published = [
                row
                for row in BUS._continuity_rows(log)
                if row.get("phase") == "PUBLISHED"
            ]
            self.assertEqual(len(published), 1)
            replay = BUS.publish_jarvis(
                {
                    "mission_id": fixture_mission,
                    "session_id": fixture_session,
                    "local": True,
                    "harmless": True,
                },
                state_version=1,
                source_session=fixture_session,
                writer="event-bus.py",
                path=log,
                changed_at=str(published[0]["changed_at"]),
            )
            self.assertTrue(replay["published"].get("duplicate"))
            self.assertTrue(replay["applied"].get("duplicate"))
            self.assertIsNotNone(replay["projection"])
            self.assertTrue(replay["projection"]["synced"])
            self.assertEqual(replay["projection"]["authoritative"]["payload"], payload)
            self.assertEqual(
                [row.get("phase") for row in BUS._read_all(log) if row.get("phase")],
                ["PUBLISHED", "RECEIVED", "APPLIED", "ACKNOWLEDGED"],
            )
            receipts = [
                row
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt" and row.get("operation") == "start"
            ]
            self.assertEqual(len(receipts), 1)
            reread = json.loads(projection.read_text(encoding="utf-8"))
            self.assertEqual(reread["authoritative"]["payload"], payload)
            self.assertEqual(reread["consumer"], BUS.JARVIS_PRIMARY)
            self.assertTrue(reread["synced"])
            if not operator_existed:
                self.assertFalse(operator_log.exists())

    def test_jarvis_primary_status_reads_recorded_phase(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            empty = BUS.status(path=log)
            self.assertFalse(log.exists())
            self.assertEqual(empty["consumer"], BUS.JARVIS_PRIMARY)
            self.assertEqual(empty["entity_id"], BUS.JARVIS_ENTITY)
            self.assertIsNone(empty["phase"])
            self.assertIsNone(empty["result"])
            self.assertIsNone(empty["state_version"])
            BUS.publish_jarvis(
                {"step": 1},
                state_version=1,
                source_session="jarvis-primary-session",
                writer="event-bus.py",
                changed_at="2026-09-25T04:00:00+00:00",
                path=log,
            )
            snapshot = log.read_text(encoding="utf-8")
            found = BUS.status(path=log)
            self.assertEqual(log.read_text(encoding="utf-8"), snapshot)
            self.assertEqual(found["consumer"], BUS.JARVIS_PRIMARY)
            self.assertEqual(found["entity_id"], BUS.JARVIS_ENTITY)
            self.assertEqual(found["phase"], "ACKNOWLEDGED")
            self.assertEqual(found["result"], "ACKNOWLEDGED")
            self.assertEqual(found["state_version"], 1)
            self.assertIsNone(found["mission_id"])
            self.assertIsNone(found["session_id"])

    def test_start_persists_one_local_mission_and_status_does_not_mutate(self) -> None:
        script = HIVE / "os" / "event-bus.py"
        fixture_mission = "mission-local-harmless"
        fixture_session = "session-local-harmless"
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"

            def run(*extra: str) -> subprocess.CompletedProcess[str]:
                return subprocess.run(
                    [sys.executable, str(script), "--path", str(log), *extra],
                    check=False,
                    capture_output=True,
                    text=True,
                )

            started = run(
                "--start",
                "--mission-id",
                fixture_mission,
                "--session-id",
                fixture_session,
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(started.returncode, 0, started.stderr)
            body = json.loads(started.stdout)
            self.assertEqual(body["mission_id"], fixture_mission)
            self.assertEqual(body["session_id"], fixture_session)
            receipt = body["receipt"]
            for key in (
                "mission_id",
                "session_id",
                "operation",
                "source",
                "caller",
                "state_version",
                "timestamp",
                "result",
                "previous_state",
                "new_state",
            ):
                self.assertIn(key, receipt)
            self.assertEqual(receipt["operation"], "start")
            self.assertEqual(receipt["source"], "local-test")
            self.assertEqual(receipt["caller"], "event-bus.py")
            self.assertEqual(receipt["mission_id"], body["mission_id"])
            self.assertEqual(receipt["session_id"], body["session_id"])
            self.assertEqual(receipt["result"], "ACKNOWLEDGED")
            self.assertIsNone(receipt["previous_state"]["state_version"])
            self.assertIsNone(receipt["new_state"]["mission_id"])
            self.assertEqual(receipt["state_version"], 1)

            phases = {row.get("phase") for row in BUS._read_all(log) if row.get("phase")}
            self.assertTrue(
                phases <= {"PUBLISHED", "RECEIVED", "APPLIED", "ACKNOWLEDGED", "CONFLICT", "STALE", "REJECTED"}
            )
            self.assertNotIn("START", phases)
            stored = [
                row
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt" and row.get("operation") == "start"
            ]
            self.assertEqual(len(stored), 1)
            self.assertEqual(stored[0]["mission_id"], body["mission_id"])
            self.assertEqual(stored[0]["session_id"], body["session_id"])

            snapshot = log.read_bytes()
            later = run("--status")
            self.assertEqual(later.returncode, 0, later.stderr)
            self.assertEqual(log.read_bytes(), snapshot)
            bare = json.loads(later.stdout)
            self.assertIsNone(bare["mission_id"])
            self.assertIsNone(bare["session_id"])
            self.assertEqual(bare["state_version"], receipt["state_version"])
            self.assertEqual(bare["phase"], "ACKNOWLEDGED")
            self.assertEqual(bare, receipt["new_state"])

            addressed = run("--status", "--mission-id", fixture_mission)
            self.assertEqual(addressed.returncode, 0, addressed.stderr)
            self.assertEqual(log.read_bytes(), snapshot)
            seen = json.loads(addressed.stdout)
            self.assertTrue(seen["found"])
            self.assertEqual(seen["mission"]["mission_id"], fixture_mission)
            self.assertEqual(seen["mission"]["session_id"], fixture_session)
            self.assertEqual(seen["mission"]["phase"], "ACKNOWLEDGED")
            self.assertEqual(seen["mission"]["state_version"], receipt["state_version"])
            self.assertEqual(seen["bus_head"]["phase"], "ACKNOWLEDGED")
            self.assertEqual(seen["bus_head"]["state_version"], receipt["state_version"])

            again = run(
                "--start",
                "--mission-id",
                fixture_mission,
                "--session-id",
                fixture_session,
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(again.returncode, 0, again.stderr)
            self.assertEqual(log.read_bytes(), snapshot)
            repeated = json.loads(again.stdout)
            self.assertEqual(repeated["mission_id"], fixture_mission)
            self.assertEqual(repeated["session_id"], fixture_session)

    def test_start_accepts_or_generates_identity(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            first = BUS.start(source="local-test", caller="event-bus.py", path=log)
            second = BUS.start(source="local-test", caller="event-bus.py", path=log)
            self.assertNotEqual(first["mission_id"], "mission-local-harmless")
            self.assertNotEqual(first["session_id"], "session-local-harmless")
            self.assertNotEqual(second["mission_id"], "mission-local-harmless")
            self.assertNotEqual(second["mission_id"], first["mission_id"])
            self.assertNotEqual(second["session_id"], first["session_id"])
            self.assertEqual(
                BUS.status(path=log, mission_id=first["mission_id"])["mission"]["session_id"],
                first["session_id"],
            )
            self.assertEqual(
                BUS.status(path=log, mission_id=second["mission_id"])["mission"]["session_id"],
                second["session_id"],
            )
            named = BUS.start(
                mission_id="mission-other",
                session_id="session-other",
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(named["mission_id"], "mission-other")
            self.assertEqual(named["session_id"], "session-other")
            receipts = [
                row
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt" and row.get("operation") == "start"
            ]
            self.assertEqual(len(receipts), 3)
            self.assertEqual(
                {row["mission_id"] for row in receipts},
                {first["mission_id"], second["mission_id"], "mission-other"},
            )

    def test_start_replay_after_unrelated_publish_keeps_one_mission(self) -> None:
        fixture_mission = "mission-local-harmless"
        fixture_session = "session-local-harmless"
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            started = BUS.start(
                mission_id=fixture_mission,
                session_id=fixture_session,
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(started["mission_id"], fixture_mission)
            self.assertEqual(started["session_id"], fixture_session)
            BUS.publish_jarvis(
                {"fact": "unrelated"},
                state_version=2,
                source_session="other-session",
                writer="event-bus.py",
                path=log,
            )
            head = BUS.authoritative(BUS.JARVIS_ENTITY, log)
            assert head is not None
            self.assertNotIn("mission_id", head.get("payload") or {})
            self.assertEqual(head["state_version"], 2)

            snapshot = log.read_bytes()
            seen = BUS.status(path=log, mission_id=fixture_mission)
            self.assertEqual(log.read_bytes(), snapshot)
            self.assertTrue(seen["found"])
            self.assertEqual(seen["mission"]["mission_id"], fixture_mission)
            self.assertEqual(seen["mission"]["session_id"], fixture_session)
            self.assertEqual(seen["mission"]["state_version"], started["receipt"]["state_version"])
            self.assertEqual(seen["mission"]["phase"], started["receipt"]["new_state"]["phase"])
            self.assertEqual(seen["mission"]["result"], started["receipt"]["result"])
            self.assertEqual(seen["bus_head"]["state_version"], 2)
            self.assertNotEqual(seen["mission"]["state_version"], seen["bus_head"]["state_version"])
            bare = BUS.status(path=log)
            self.assertIsNone(bare["mission_id"])
            self.assertEqual(log.read_bytes(), snapshot)

            again = BUS.start(
                mission_id=fixture_mission,
                session_id="session-not-the-stored-one",
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(log.read_bytes(), snapshot)
            self.assertEqual(again["mission_id"], fixture_mission)
            self.assertEqual(again["session_id"], fixture_session)
            receipts = [
                row
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt"
                and row.get("operation") == "start"
                and row.get("mission_id") == fixture_mission
            ]
            self.assertEqual(len(receipts), 1)
            published = [
                row
                for row in BUS._continuity_rows(log)
                if row.get("phase") == "PUBLISHED"
                and isinstance(row.get("payload"), dict)
                and row["payload"].get("mission_id") == fixture_mission
            ]
            self.assertEqual(len(published), 1)

    def test_continue_resumes_same_mission_and_replays_once(self) -> None:
        script = HIVE / "os" / "event-bus.py"
        fixture_mission = "mission-local-harmless"
        fixture_session = "session-local-harmless"
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            started = BUS.start(
                mission_id=fixture_mission,
                session_id=fixture_session,
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(started["mission_id"], fixture_mission)
            self.assertEqual(started["session_id"], fixture_session)
            BUS.publish_jarvis(
                {"fact": "unrelated"},
                state_version=2,
                source_session="other-session",
                writer="event-bus.py",
                path=log,
            )
            head = BUS.authoritative(BUS.JARVIS_ENTITY, log)
            assert head is not None
            self.assertNotIn("mission_id", head.get("payload") or {})

            def run(*extra: str) -> subprocess.CompletedProcess[str]:
                return subprocess.run(
                    [sys.executable, str(script), "--path", str(log), *extra],
                    check=False,
                    capture_output=True,
                    text=True,
                )

            continued = run(
                "--continue",
                "--mission-id",
                fixture_mission,
                "--session-id",
                "session-not-the-stored-one",
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(continued.returncode, 0, continued.stderr)
            body = json.loads(continued.stdout)
            self.assertEqual(body["mission_id"], fixture_mission)
            self.assertEqual(body["session_id"], fixture_session)
            receipt = body["receipt"]
            for key in (
                "mission_id",
                "session_id",
                "operation",
                "source",
                "caller",
                "state_version",
                "timestamp",
                "result",
                "previous_state",
                "new_state",
            ):
                self.assertIn(key, receipt)
            self.assertEqual(receipt["operation"], "continue")
            self.assertEqual(receipt["source"], "local-test")
            self.assertEqual(receipt["caller"], "event-bus.py")
            self.assertEqual(receipt["mission_id"], fixture_mission)
            self.assertEqual(receipt["session_id"], fixture_session)
            self.assertEqual(receipt["result"], "ACKNOWLEDGED")
            self.assertEqual(receipt["previous_state"]["mission_id"], fixture_mission)
            self.assertEqual(receipt["previous_state"]["session_id"], fixture_session)
            self.assertEqual(receipt["previous_state"]["state_version"], 2)
            self.assertEqual(receipt["new_state"]["mission_id"], fixture_mission)
            self.assertEqual(receipt["new_state"]["session_id"], fixture_session)
            self.assertEqual(receipt["new_state"]["phase"], "ACKNOWLEDGED")
            self.assertEqual(receipt["state_version"], receipt["new_state"]["state_version"])
            self.assertGreater(receipt["state_version"], 2)

            phases = {row.get("phase") for row in BUS._read_all(log) if row.get("phase")}
            self.assertTrue(
                phases <= {"PUBLISHED", "RECEIVED", "APPLIED", "ACKNOWLEDGED", "CONFLICT", "STALE", "REJECTED"}
            )
            self.assertNotIn("CONTINUE", phases)
            operations = {
                row.get("operation")
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt"
            }
            self.assertEqual(operations, {"start", "continue"})
            resumes = [
                row
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt" and row.get("operation") == "continue"
            ]
            self.assertEqual(len(resumes), 1)
            starts = [
                row
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt" and row.get("operation") == "start"
            ]
            self.assertEqual(len(starts), 1)
            self.assertEqual(starts[0]["mission_id"], fixture_mission)

            seen = BUS.status(path=log, mission_id=fixture_mission)
            self.assertTrue(seen["found"])
            self.assertEqual(seen["mission"]["mission_id"], fixture_mission)
            self.assertEqual(seen["mission"]["session_id"], fixture_session)
            self.assertEqual(seen["mission"]["phase"], "ACKNOWLEDGED")
            self.assertEqual(seen["mission"]["state_version"], starts[0]["state_version"])
            self.assertEqual(seen["bus_head"]["state_version"], receipt["state_version"])
            self.assertEqual(seen["bus_head"]["phase"], "ACKNOWLEDGED")
            self.assertNotEqual(seen["mission"]["state_version"], seen["bus_head"]["state_version"])

            snapshot = log.read_bytes()
            replay = BUS.continue_mission(
                mission_id=fixture_mission,
                session_id="session-not-the-stored-one",
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(log.read_bytes(), snapshot)
            self.assertEqual(replay["mission_id"], fixture_mission)
            self.assertEqual(replay["session_id"], fixture_session)
            self.assertEqual(
                [
                    row
                    for row in BUS._read_all(log)
                    if row.get("type") == "continuity.receipt" and row.get("operation") == "continue"
                ],
                resumes,
            )

            BUS.publish_jarvis(
                {"fact": "still-unrelated"},
                state_version=receipt["state_version"] + 1,
                source_session="other-session",
                writer="event-bus.py",
                path=log,
            )
            after = BUS.status(path=log, mission_id=fixture_mission)
            self.assertEqual(after["mission"]["mission_id"], fixture_mission)
            self.assertEqual(after["mission"]["session_id"], fixture_session)
            self.assertEqual(after["mission"]["state_version"], seen["mission"]["state_version"])
            self.assertNotEqual(after["mission"]["state_version"], after["bus_head"]["state_version"])
            self.assertNotIn("mission_id", (BUS.authoritative(BUS.JARVIS_ENTITY, log) or {}).get("payload") or {})
            held = log.read_bytes()
            BUS.continue_mission(
                mission_id=fixture_mission,
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(log.read_bytes(), held)
            self.assertEqual(
                len(
                    [
                        row
                        for row in BUS._read_all(log)
                        if row.get("operation") == "continue"
                    ]
                ),
                1,
            )

    def test_continue_does_not_create_a_replacement_mission(self) -> None:
        fixture_mission = "mission-local-harmless"
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            missing = BUS.continue_mission(
                mission_id=fixture_mission,
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(missing["result"], "REJECTED")
            self.assertFalse(log.exists())
            blank = BUS.continue_mission(source="local-test", caller="event-bus.py", path=log)
            self.assertEqual(blank["result"], "REJECTED")
            self.assertNotIn("mission_id", blank)
            self.assertFalse(log.exists())

            first = BUS.start(source="local-test", caller="event-bus.py", path=log)
            second = BUS.start(source="local-test", caller="event-bus.py", path=log)
            resumed = BUS.continue_mission(
                mission_id=first["mission_id"],
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(resumed["mission_id"], first["mission_id"])
            self.assertEqual(resumed["session_id"], first["session_id"])
            self.assertNotEqual(resumed["mission_id"], fixture_mission)
            other = BUS.status(path=log, mission_id=second["mission_id"])
            self.assertEqual(other["mission"]["mission_id"], second["mission_id"])
            self.assertEqual(other["mission"]["session_id"], second["session_id"])
            self.assertEqual(other["mission"]["state_version"], second["receipt"]["state_version"])
            self.assertNotEqual(other["mission"]["state_version"], other["bus_head"]["state_version"])
            missions = {
                row.get("mission_id")
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt"
            }
            self.assertEqual(missions, {first["mission_id"], second["mission_id"]})

    def test_cancel_stops_one_mission_and_replay_inserts_nothing(self) -> None:
        script = HIVE / "os" / "event-bus.py"
        stopped_mission = "mission-to-stop"
        stopped_session = "session-to-stop"
        other_mission = "mission-still-open"
        other_session = "session-still-open"
        known_phases = {"PUBLISHED", "RECEIVED", "APPLIED", "ACKNOWLEDGED", "CONFLICT", "STALE", "REJECTED"}
        self.assertEqual(BUS._KNOWN_PHASES, known_phases)
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"

            def run(*extra: str) -> subprocess.CompletedProcess[str]:
                return subprocess.run(
                    [sys.executable, str(script), "--path", str(log), *extra],
                    check=False,
                    capture_output=True,
                    text=True,
                )

            missing = BUS.cancel_mission(
                mission_id=stopped_mission,
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(missing["result"], "REJECTED")
            self.assertEqual(missing["inserted"], False)
            self.assertFalse(log.exists())
            blank = BUS.cancel_mission(source="local-test", caller="event-bus.py", path=log)
            self.assertEqual(blank["result"], "REJECTED")
            self.assertNotIn("mission_id", blank)
            self.assertFalse(log.exists())

            first = BUS.start(
                mission_id=stopped_mission,
                session_id=stopped_session,
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            second = BUS.start(
                mission_id=other_mission,
                session_id=other_session,
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(first["mission_id"], stopped_mission)
            self.assertEqual(second["mission_id"], other_mission)
            before_cancel = log.read_bytes()
            stranger = BUS.cancel_mission(
                mission_id="mission-not-on-the-log",
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(stranger["result"], "REJECTED")
            self.assertEqual(stranger["inserted"], False)
            self.assertEqual(log.read_bytes(), before_cancel)

            cancelled = run(
                "--cancel",
                "--mission-id",
                stopped_mission,
                "--session-id",
                "session-not-the-stored-one",
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(cancelled.returncode, 0, cancelled.stderr)
            body = json.loads(cancelled.stdout)
            self.assertEqual(body["mission_id"], stopped_mission)
            self.assertEqual(body["session_id"], stopped_session)
            receipt = body["receipt"]
            for key in (
                "mission_id",
                "session_id",
                "operation",
                "source",
                "caller",
                "state_version",
                "timestamp",
                "result",
                "previous_state",
                "new_state",
            ):
                self.assertIn(key, receipt)
            self.assertEqual(receipt["operation"], "cancel")
            self.assertEqual(receipt["source"], "local-test")
            self.assertEqual(receipt["caller"], "event-bus.py")
            self.assertEqual(receipt["mission_id"], stopped_mission)
            self.assertEqual(receipt["session_id"], stopped_session)
            self.assertEqual(receipt["result"], "cancelled")
            self.assertEqual(receipt["previous_state"]["mission_id"], stopped_mission)
            self.assertNotEqual(receipt["previous_state"]["result"], "cancelled")
            self.assertEqual(receipt["new_state"]["mission_id"], stopped_mission)
            self.assertEqual(receipt["new_state"]["session_id"], stopped_session)
            self.assertEqual(receipt["new_state"]["result"], "cancelled")
            self.assertIn(receipt["new_state"]["phase"], known_phases)
            self.assertEqual(receipt["state_version"], receipt["new_state"]["state_version"])
            self.assertEqual(receipt["previous_state"]["state_version"], receipt["state_version"])

            phases = {row.get("phase") for row in BUS._read_all(log) if row.get("phase")}
            self.assertTrue(phases <= known_phases)
            self.assertNotIn("CANCEL", phases)
            self.assertNotIn("CANCELLED", phases)
            self.assertNotIn("cancelled", phases)
            cancels = [
                row
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt" and row.get("operation") == "cancel"
            ]
            self.assertEqual(len(cancels), 1)
            self.assertEqual(cancels[0]["mission_id"], stopped_mission)
            missions = {
                row.get("mission_id")
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt"
            }
            self.assertEqual(missions, {stopped_mission, other_mission})

            seen = BUS.status(path=log, mission_id=stopped_mission)
            self.assertTrue(seen["found"])
            self.assertEqual(seen["mission"]["mission_id"], stopped_mission)
            self.assertEqual(seen["mission"]["session_id"], stopped_session)
            self.assertEqual(seen["mission"]["result"], "cancelled")
            self.assertIn(seen["mission"]["phase"], known_phases)
            self.assertNotEqual(seen["mission"]["phase"], "NOT_FOUND")
            self.assertEqual(seen["mission"]["state_version"], first["receipt"]["state_version"])
            self.assertNotEqual(seen["mission"]["state_version"], seen["bus_head"]["state_version"])
            other = BUS.status(path=log, mission_id=other_mission)
            self.assertEqual(other["mission"]["mission_id"], other_mission)
            self.assertEqual(other["mission"]["session_id"], other_session)
            self.assertNotEqual(other["mission"]["result"], "cancelled")
            self.assertIn(other["mission"]["phase"], known_phases)
            self.assertEqual(other["mission"]["state_version"], second["receipt"]["state_version"])

            snapshot = log.read_bytes()
            replay = run(
                "--cancel",
                "--mission-id",
                stopped_mission,
                "--session-id",
                "session-not-the-stored-one",
                "--source",
                "other-source",
                "--actor",
                "other-caller",
            )
            self.assertEqual(replay.returncode, 0, replay.stderr)
            self.assertEqual(log.read_bytes(), snapshot)
            repeated = json.loads(replay.stdout)
            self.assertEqual(repeated["mission_id"], stopped_mission)
            self.assertEqual(repeated["session_id"], stopped_session)
            self.assertEqual(repeated["receipt"], receipt)
            self.assertEqual(
                [
                    row
                    for row in BUS._read_all(log)
                    if row.get("type") == "continuity.receipt" and row.get("operation") == "cancel"
                ],
                cancels,
            )

            held = log.read_bytes()
            rejected = run(
                "--continue",
                "--mission-id",
                stopped_mission,
                "--session-id",
                "session-replacement",
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(rejected.returncode, 1, rejected.stdout)
            self.assertEqual(log.read_bytes(), held)
            refused = json.loads(rejected.stdout)
            self.assertEqual(refused["result"], "REJECTED")
            self.assertEqual(refused["inserted"], False)
            self.assertEqual(refused["mission_id"], stopped_mission)
            self.assertNotIn("session-replacement", log.read_text(encoding="utf-8"))
            self.assertEqual(
                {
                    row.get("mission_id")
                    for row in BUS._read_all(log)
                    if row.get("type") == "continuity.receipt"
                },
                {stopped_mission, other_mission},
            )
            self.assertEqual(
                len(
                    [
                        row
                        for row in BUS._read_all(log)
                        if row.get("operation") == "continue" and row.get("mission_id") == stopped_mission
                    ]
                ),
                0,
            )

            resumed = BUS.continue_mission(
                mission_id=other_mission,
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(resumed["mission_id"], other_mission)
            self.assertEqual(resumed["session_id"], other_session)
            still = BUS.status(path=log, mission_id=stopped_mission)
            self.assertEqual(still["mission"]["result"], "cancelled")
            self.assertEqual(still["mission"]["mission_id"], stopped_mission)
            self.assertEqual(still["mission"]["session_id"], stopped_session)
            spared = BUS.status(path=log, mission_id=other_mission)
            self.assertEqual(spared["mission"]["mission_id"], other_mission)
            self.assertEqual(spared["mission"]["session_id"], other_session)
            self.assertNotEqual(spared["mission"]["result"], "cancelled")

            restart_cancelled = run("--status", "--mission-id", stopped_mission)
            self.assertEqual(restart_cancelled.returncode, 0, restart_cancelled.stderr)
            restarted = json.loads(restart_cancelled.stdout)
            self.assertEqual(restarted["mission"]["mission_id"], stopped_mission)
            self.assertEqual(restarted["mission"]["session_id"], stopped_session)
            self.assertEqual(restarted["mission"]["result"], "cancelled")
            self.assertIn(restarted["mission"]["phase"], known_phases)
            self.assertNotEqual(restarted["mission"]["phase"], "NOT_FOUND")
            restart_other = run("--status", "--mission-id", other_mission)
            self.assertEqual(restart_other.returncode, 0, restart_other.stderr)
            restarted_other = json.loads(restart_other.stdout)
            self.assertEqual(restarted_other["mission"]["mission_id"], other_mission)
            self.assertEqual(restarted_other["mission"]["session_id"], other_session)
            self.assertNotEqual(restarted_other["mission"]["result"], "cancelled")
            after_restart = log.read_bytes()
            replay_after_restart = run(
                "--cancel",
                "--mission-id",
                stopped_mission,
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(replay_after_restart.returncode, 0, replay_after_restart.stderr)
            self.assertEqual(log.read_bytes(), after_restart)
            self.assertEqual(len([
                row
                for row in BUS._read_all(log)
                if row.get("operation") == "cancel"
            ]), 1)

    def test_continue_after_cancel_inserts_nothing_even_with_a_prior_continue(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            started = BUS.start(
                mission_id="mission-resumed-then-stopped",
                session_id="session-resumed-then-stopped",
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            other = BUS.start(source="local-test", caller="event-bus.py", path=log)
            resumed = BUS.continue_mission(
                mission_id=started["mission_id"],
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(resumed["mission_id"], started["mission_id"])
            BUS.cancel_mission(
                mission_id=started["mission_id"],
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            held = log.read_bytes()
            refused = BUS.continue_mission(
                mission_id=started["mission_id"],
                session_id="session-replacement",
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(refused["result"], "REJECTED")
            self.assertEqual(refused["inserted"], False)
            self.assertEqual(log.read_bytes(), held)
            self.assertEqual(BUS.status(path=log, mission_id=started["mission_id"])["mission"]["result"], "cancelled")
            spared = BUS.status(path=log, mission_id=other["mission_id"])
            self.assertEqual(spared["mission"]["mission_id"], other["mission_id"])
            self.assertEqual(spared["mission"]["session_id"], other["session_id"])
            self.assertNotEqual(spared["mission"]["result"], "cancelled")

    def test_result_reports_recorded_state_and_replay_inserts_nothing(self) -> None:
        script = HIVE / "os" / "event-bus.py"
        known_phases = {"PUBLISHED", "RECEIVED", "APPLIED", "ACKNOWLEDGED", "CONFLICT", "STALE", "REJECTED"}
        self.assertEqual(BUS._KNOWN_PHASES, known_phases)
        home = BUS.DEFAULT_PATH
        home_before = home.read_bytes() if home.is_file() else None
        correlation = (
            "mission_id",
            "session_id",
            "operation",
            "source",
            "caller",
            "state_version",
            "timestamp",
            "result",
            "previous_state",
            "new_state",
        )

        def result_rows(log: Path, mission_id: str | None = None) -> list[dict]:
            rows = [
                row
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt" and row.get("operation") == "result"
            ]
            if mission_id is None:
                return rows
            return [row for row in rows if row.get("mission_id") == mission_id]

        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"

            def run(*extra: str) -> subprocess.CompletedProcess[str]:
                return subprocess.run(
                    [sys.executable, str(script), "--path", str(log), *extra],
                    check=False,
                    capture_output=True,
                    text=True,
                )

            missing = BUS.result(
                mission_id="mission-not-on-the-log",
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(missing["result"], "REJECTED")
            self.assertEqual(missing["inserted"], False)
            self.assertFalse(log.exists())
            blank = BUS.result(source="local-test", caller="event-bus.py", path=log)
            self.assertEqual(blank["result"], "REJECTED")
            self.assertEqual(blank["inserted"], False)
            self.assertNotIn("mission_id", blank)
            self.assertFalse(log.exists())

            started = BUS.start(source="local-test", caller="event-bus.py", path=log)
            mission_a = started["mission_id"]
            session_a = started["session_id"]
            self.assertNotEqual(mission_a, "mission-local-harmless")
            self.assertNotEqual(session_a, "session-local-harmless")
            self.assertTrue(mission_a)
            self.assertTrue(session_a)

            before_stranger = log.read_bytes()
            stranger = run(
                "--result",
                "--mission-id",
                "mission-not-on-the-log",
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(stranger.returncode, 1, stranger.stdout)
            self.assertEqual(log.read_bytes(), before_stranger)
            self.assertEqual(json.loads(stranger.stdout)["result"], "REJECTED")
            self.assertEqual(json.loads(stranger.stdout)["inserted"], False)
            omitted = run("--result", "--source", "local-test", "--actor", "event-bus.py")
            self.assertEqual(omitted.returncode, 1)
            self.assertEqual(log.read_bytes(), before_stranger)

            recorded = BUS.status(path=log, mission_id=mission_a)
            phase_rows_before = [row for row in BUS._read_all(log) if row.get("phase")]
            reported = run(
                "--result",
                "--mission-id",
                mission_a,
                "--session-id",
                "session-not-the-stored-one",
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(reported.returncode, 0, reported.stderr)
            body = json.loads(reported.stdout)
            self.assertEqual(body["mission_id"], mission_a)
            self.assertEqual(body["session_id"], session_a)
            receipt = body["receipt"]
            for key in correlation:
                self.assertIn(key, receipt)
            self.assertEqual(receipt["operation"], "result")
            self.assertEqual(receipt["source"], "local-test")
            self.assertEqual(receipt["caller"], "event-bus.py")
            self.assertEqual(receipt["mission_id"], mission_a)
            self.assertEqual(receipt["session_id"], session_a)
            self.assertEqual(receipt["result"], recorded["bus_head"]["result"])
            self.assertEqual(receipt["result"], "ACKNOWLEDGED")
            self.assertNotIn(receipt["result"], {"completed", "success", "SUCCESS", "cancelled"})
            self.assertEqual(receipt["previous_state"]["mission_id"], mission_a)
            self.assertEqual(receipt["previous_state"]["session_id"], session_a)
            self.assertEqual(receipt["new_state"]["mission_id"], mission_a)
            self.assertEqual(receipt["new_state"]["session_id"], session_a)
            self.assertEqual(receipt["new_state"]["phase"], receipt["previous_state"]["phase"])
            self.assertIn(receipt["new_state"]["phase"], known_phases)
            self.assertEqual(receipt["state_version"], recorded["bus_head"]["state_version"])
            self.assertEqual(receipt["new_state"]["state_version"], recorded["bus_head"]["state_version"])
            self.assertEqual(recorded["mission"]["state_version"], receipt["state_version"])
            self.assertEqual(
                [row for row in BUS._read_all(log) if row.get("phase")],
                phase_rows_before,
            )
            self.assertEqual(result_rows(log, mission_a), [receipt])
            phases = {row.get("phase") for row in BUS._read_all(log) if row.get("phase")}
            self.assertTrue(phases <= known_phases)
            self.assertNotIn("RESULT", phases)

            snapshot = log.read_bytes()
            later = run("--status", "--mission-id", mission_a)
            self.assertEqual(later.returncode, 0, later.stderr)
            self.assertEqual(log.read_bytes(), snapshot)
            seen = json.loads(later.stdout)
            self.assertEqual(seen["mission"]["mission_id"], mission_a)
            self.assertEqual(seen["mission"]["session_id"], session_a)
            self.assertEqual(seen["mission"]["phase"], recorded["mission"]["phase"])
            self.assertEqual(seen["mission"]["result"], recorded["mission"]["result"])
            self.assertNotEqual(seen["mission"]["phase"], "NOT_FOUND")

            replay = run(
                "--result",
                "--mission-id",
                mission_a,
                "--session-id",
                "session-not-the-stored-one",
                "--source",
                "other-source",
                "--actor",
                "other-caller",
            )
            self.assertEqual(replay.returncode, 0, replay.stderr)
            self.assertEqual(log.read_bytes(), snapshot)
            repeated = json.loads(replay.stdout)
            self.assertEqual(repeated["mission_id"], mission_a)
            self.assertEqual(repeated["session_id"], session_a)
            self.assertEqual(repeated["receipt"], receipt)
            self.assertEqual(result_rows(log, mission_a), [receipt])

            BUS.publish_jarvis(
                {"fact": "unrelated"},
                state_version=int(recorded["bus_head"]["state_version"]) + 1,
                source_session="other-session",
                writer="event-bus.py",
                path=log,
            )
            head = BUS.authoritative(BUS.JARVIS_ENTITY, log)
            assert head is not None
            self.assertNotEqual((head.get("payload") or {}).get("mission_id"), mission_a)
            held = log.read_bytes()
            after_publish = run(
                "--result",
                "--mission-id",
                mission_a,
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(after_publish.returncode, 0, after_publish.stderr)
            self.assertEqual(log.read_bytes(), held)
            addressed = json.loads(after_publish.stdout)
            self.assertEqual(addressed["mission_id"], mission_a)
            self.assertEqual(addressed["session_id"], session_a)
            self.assertEqual(addressed["receipt"], receipt)
            self.assertEqual(len(result_rows(log)), 1)

            cancelled = run(
                "--cancel",
                "--mission-id",
                mission_a,
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(cancelled.returncode, 0, cancelled.stderr)
            self.assertEqual(json.loads(cancelled.stdout)["mission_id"], mission_a)
            after_cancel = log.read_bytes()
            terminal = run(
                "--result",
                "--mission-id",
                mission_a,
                "--session-id",
                "session-replacement",
                "--source",
                "local-test",
                "--actor",
                "event-bus.py",
            )
            self.assertEqual(terminal.returncode, 0, terminal.stderr)
            self.assertEqual(log.read_bytes(), after_cancel)
            terminal_body = json.loads(terminal.stdout)
            self.assertEqual(terminal_body["mission_id"], mission_a)
            self.assertEqual(terminal_body["session_id"], session_a)
            self.assertNotEqual(terminal_body["mission_id"], "session-replacement")
            terminal_receipt = terminal_body["receipt"]
            self.assertEqual(terminal_receipt["operation"], "result")
            self.assertEqual(terminal_receipt["result"], "cancelled")
            self.assertEqual(terminal_receipt["mission_id"], mission_a)
            self.assertEqual(terminal_receipt["session_id"], session_a)
            self.assertEqual(terminal_receipt["new_state"]["result"], "cancelled")
            self.assertEqual(terminal_receipt["previous_state"]["result"], "cancelled")
            self.assertEqual(terminal_receipt["new_state"]["phase"], terminal_receipt["previous_state"]["phase"])
            self.assertIn(terminal_receipt["new_state"]["phase"], known_phases)
            self.assertEqual(result_rows(log, mission_a), [receipt])
            self.assertNotEqual(receipt["result"], "cancelled")
            cancels = [
                row
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt" and row.get("operation") == "cancel"
            ]
            self.assertEqual(len(cancels), 1)
            self.assertEqual(cancels[0]["mission_id"], mission_a)
            missions = {
                row.get("mission_id")
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt"
            }
            self.assertEqual(missions, {mission_a})
            self.assertNotIn("session-replacement", log.read_text(encoding="utf-8"))

            replay_terminal = BUS.result(
                mission_id=mission_a,
                session_id="session-not-the-stored-one",
                source="other-source",
                caller="other-caller",
                path=log,
            )
            self.assertEqual(log.read_bytes(), after_cancel)
            self.assertEqual(replay_terminal["mission_id"], mission_a)
            self.assertEqual(replay_terminal["receipt"]["result"], "cancelled")
            self.assertEqual(len(cancels), 1)

            started_b = BUS.start(source="local-test", caller="event-bus.py", path=log)
            mission_b = started_b["mission_id"]
            session_b = started_b["session_id"]
            self.assertNotEqual(mission_b, mission_a)
            self.assertNotEqual(mission_b, "mission-local-harmless")
            still_a = BUS.result(
                mission_id=mission_a,
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(still_a["mission_id"], mission_a)
            self.assertEqual(still_a["session_id"], session_a)
            self.assertEqual(still_a["receipt"]["result"], "cancelled")
            self.assertEqual(result_rows(log, mission_a), [receipt])
            self.assertEqual(
                len(
                    [
                        row
                        for row in BUS._read_all(log)
                        if row.get("operation") == "cancel" and row.get("mission_id") == mission_a
                    ]
                ),
                1,
            )
            open_b = BUS.status(path=log, mission_id=mission_b)
            reported_b = BUS.result(
                mission_id=mission_b,
                session_id="session-not-the-stored-one",
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(reported_b["mission_id"], mission_b)
            self.assertEqual(reported_b["session_id"], session_b)
            self.assertEqual(reported_b["receipt"]["result"], open_b["mission"]["result"])
            self.assertEqual(open_b["mission"]["mission_id"], mission_b)
            self.assertEqual(open_b["mission"]["state_version"], started_b["receipt"]["state_version"])
            self.assertNotEqual(reported_b["receipt"]["result"], "cancelled")
            self.assertEqual(reported_b["receipt"]["operation"], "result")
            for key in correlation:
                self.assertIn(key, reported_b["receipt"])
            self.assertEqual(len(result_rows(log, mission_b)), 1)
            self.assertEqual({row["mission_id"] for row in result_rows(log)}, {mission_a, mission_b})
            held_b = log.read_bytes()
            BUS.result(mission_id=mission_b, source="local-test", caller="event-bus.py", path=log)
            self.assertEqual(log.read_bytes(), held_b)
            self.assertEqual(
                BUS.result(mission_id=mission_a, source="local-test", caller="event-bus.py", path=log)["receipt"]["result"],
                "cancelled",
            )
            self.assertEqual(log.read_bytes(), held_b)

        home_after = home.read_bytes() if home.is_file() else None
        self.assertEqual(home_after, home_before)

    def test_result_after_continue_reports_recorded_state(self) -> None:
        known_phases = {"PUBLISHED", "RECEIVED", "APPLIED", "ACKNOWLEDGED", "CONFLICT", "STALE", "REJECTED"}
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            started = BUS.start(source="local-test", caller="event-bus.py", path=log)
            resumed = BUS.continue_mission(
                mission_id=started["mission_id"],
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(resumed["mission_id"], started["mission_id"])
            recorded = BUS.status(path=log, mission_id=started["mission_id"])
            phase_rows = [row for row in BUS._read_all(log) if row.get("phase")]
            reported = BUS.result(
                mission_id=started["mission_id"],
                session_id="session-not-the-stored-one",
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(reported["mission_id"], started["mission_id"])
            self.assertEqual(reported["session_id"], started["session_id"])
            self.assertEqual(reported["receipt"]["result"], recorded["bus_head"]["result"])
            self.assertEqual(reported["receipt"]["result"], "ACKNOWLEDGED")
            self.assertNotIn(reported["receipt"]["result"], {"completed", "success", "SUCCESS"})
            self.assertEqual(reported["receipt"]["state_version"], recorded["bus_head"]["state_version"])
            self.assertEqual(reported["receipt"]["new_state"]["phase"], recorded["bus_head"]["phase"])
            self.assertEqual(recorded["mission"]["state_version"], started["receipt"]["state_version"])
            self.assertNotEqual(recorded["mission"]["state_version"], recorded["bus_head"]["state_version"])
            self.assertIn(reported["receipt"]["new_state"]["phase"], known_phases)
            self.assertEqual([row for row in BUS._read_all(log) if row.get("phase")], phase_rows)
            self.assertEqual(
                len(
                    [
                        row
                        for row in BUS._read_all(log)
                        if row.get("operation") == "result"
                    ]
                ),
                1,
            )

    def test_result_after_cancel_records_cancelled_once(self) -> None:
        known_phases = {"PUBLISHED", "RECEIVED", "APPLIED", "ACKNOWLEDGED", "CONFLICT", "STALE", "REJECTED"}
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            started = BUS.start(
                mission_id="mission-to-stop",
                session_id="session-to-stop",
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            BUS.cancel_mission(
                mission_id=started["mission_id"],
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            cancels_before = [
                row
                for row in BUS._read_all(log)
                if row.get("operation") == "cancel"
            ]
            self.assertEqual(len(cancels_before), 1)
            reported = BUS.result(
                mission_id=started["mission_id"],
                session_id="session-replacement",
                source="local-test",
                caller="event-bus.py",
                path=log,
            )
            self.assertEqual(reported["mission_id"], "mission-to-stop")
            self.assertEqual(reported["session_id"], "session-to-stop")
            self.assertEqual(reported["receipt"]["operation"], "result")
            self.assertEqual(reported["receipt"]["result"], "cancelled")
            self.assertEqual(reported["receipt"]["new_state"]["result"], "cancelled")
            self.assertIn(reported["receipt"]["new_state"]["phase"], known_phases)
            self.assertNotIn("session-replacement", log.read_text(encoding="utf-8"))
            result_receipts = [
                row
                for row in BUS._read_all(log)
                if row.get("operation") == "result"
            ]
            self.assertEqual(len(result_receipts), 1)
            self.assertEqual(result_receipts[0]["result"], "cancelled")
            self.assertEqual(result_receipts[0], reported["receipt"])
            cancels_after = [
                row
                for row in BUS._read_all(log)
                if row.get("operation") == "cancel"
            ]
            self.assertEqual(cancels_after, cancels_before)
            missions = {
                row.get("mission_id")
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt"
            }
            self.assertEqual(missions, {"mission-to-stop"})
            snapshot = log.read_bytes()
            replay = BUS.result(
                mission_id=started["mission_id"],
                source="other-source",
                caller="other-caller",
                path=log,
            )
            self.assertEqual(log.read_bytes(), snapshot)
            self.assertEqual(replay["receipt"], reported["receipt"])
            self.assertEqual(replay["mission_id"], "mission-to-stop")

    def test_jarvis_cli_process_reads_ack_and_keeps_stale_replay_off(self) -> None:
        script = HIVE / "os" / "event-bus.py"
        cid = "w3-1-cli"
        payload = json.dumps({"fact": "canary", "correlation_id": cid})
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"

            def run(*extra: str) -> subprocess.CompletedProcess[str]:
                return subprocess.run(
                    [sys.executable, str(script), "--path", str(log), *extra],
                    check=False,
                    capture_output=True,
                    text=True,
                )

            empty = run("--status")
            self.assertEqual(empty.returncode, 0, empty.stderr)
            self.assertFalse(log.exists())
            self.assertIsNone(json.loads(empty.stdout)["phase"])

            published = run(
                "--jarvis",
                "--state-version",
                "1",
                "--source",
                cid,
                "--actor",
                "event-bus.py",
                "--payload",
                payload,
            )
            self.assertEqual(published.returncode, 0, published.stderr)
            body = json.loads(published.stdout)
            self.assertEqual(body["published"]["result"], "PUBLISHED")
            self.assertEqual(body["applied"]["result"], "APPLIED")
            self.assertEqual(
                [row.get("phase") for row in BUS._read_all(log)],
                ["PUBLISHED", "RECEIVED", "APPLIED", "ACKNOWLEDGED"],
            )
            sessions = {row.get("source_session") for row in BUS._read_all(log)}
            self.assertEqual(sessions, {cid})

            snap = json.loads(run("--status").stdout)
            self.assertEqual(snap["phase"], "ACKNOWLEDGED")
            self.assertEqual(snap["result"], "ACKNOWLEDGED")
            self.assertEqual(snap["state_version"], 1)

            stale = run(
                "--jarvis",
                "--state-version",
                "0",
                "--source",
                cid,
                "--actor",
                "event-bus.py",
                "--payload",
                json.dumps({"fact": "older", "correlation_id": cid}),
            )
            self.assertEqual(stale.returncode, 0, stale.stderr)
            self.assertEqual(json.loads(stale.stdout)["published"]["result"], "STALE")
            self.assertIsNone(json.loads(stale.stdout)["applied"])
            auth = BUS.authoritative(BUS.JARVIS_ENTITY, log)
            assert auth is not None
            self.assertEqual(auth["state_version"], 1)
            self.assertEqual(json.loads(run("--status").stdout)["state_version"], 1)

            replay = run(
                "--jarvis",
                "--state-version",
                "1",
                "--source",
                cid,
                "--actor",
                "event-bus.py",
                "--payload",
                payload,
            )
            self.assertEqual(replay.returncode, 0, replay.stderr)
            replay_body = json.loads(replay.stdout)
            self.assertTrue(replay_body["published"].get("duplicate"))
            self.assertTrue(replay_body["applied"].get("duplicate"))
            self.assertFalse(replay_body["applied"].get("inserted"))
            applied = [
                row
                for row in BUS._read_all(log)
                if row.get("phase") == "APPLIED" and row.get("consumer") == BUS.JARVIS_PRIMARY
            ]
            self.assertEqual(len(applied), 1)
            fresh = json.loads(run("--status").stdout)
            self.assertEqual(fresh["phase"], "ACKNOWLEDGED")
            self.assertEqual(fresh["state_version"], 1)

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

    def test_status_separates_mission_receipt_from_bus_head(self) -> None:
        home = BUS.DEFAULT_PATH
        home_before = home.read_bytes() if home.is_file() else None
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            first = BUS.start(source="local-test", caller="event-bus.py", path=log)
            second = BUS.start(source="local-test", caller="event-bus.py", path=log)
            digest = hashlib.sha256(log.read_bytes()).hexdigest()
            seen_a = BUS.status(path=log, mission_id=first["mission_id"])
            seen_b = BUS.status(path=log, mission_id=second["mission_id"])
            missing = BUS.status(path=log, mission_id="mission-not-on-the-log")
            self.assertEqual(hashlib.sha256(log.read_bytes()).hexdigest(), digest)

            self.assertTrue(seen_a["found"])
            self.assertTrue(seen_a["mission"]["found"])
            self.assertEqual(seen_a["mission"]["mission_id"], first["mission_id"])
            self.assertEqual(seen_a["mission"]["session_id"], first["session_id"])
            self.assertEqual(seen_a["mission"]["state_version"], first["receipt"]["state_version"])
            self.assertEqual(seen_a["mission"]["phase"], first["receipt"]["new_state"]["phase"])
            self.assertEqual(seen_a["mission"]["result"], first["receipt"]["result"])
            self.assertEqual(seen_a["bus_head"]["state_version"], second["receipt"]["state_version"])
            self.assertEqual(seen_a["bus_head"]["phase"], "ACKNOWLEDGED")
            self.assertNotEqual(seen_a["mission"]["state_version"], seen_a["bus_head"]["state_version"])
            self.assertNotEqual(seen_a["mission"]["phase"], "NOT_FOUND")

            self.assertTrue(seen_b["found"])
            self.assertEqual(seen_b["mission"]["mission_id"], second["mission_id"])
            self.assertEqual(seen_b["mission"]["session_id"], second["session_id"])
            self.assertEqual(seen_b["mission"]["state_version"], second["receipt"]["state_version"])
            self.assertEqual(seen_b["mission"]["phase"], second["receipt"]["new_state"]["phase"])
            self.assertEqual(seen_b["mission"]["result"], second["receipt"]["result"])

            self.assertFalse(missing["found"])
            self.assertFalse(missing["mission"]["found"])
            self.assertEqual(missing["mission"]["mission_id"], "mission-not-on-the-log")
            self.assertIsNone(missing["mission"]["phase"])
            self.assertIsNone(missing["mission"]["result"])
            self.assertIsNone(missing["mission"]["state_version"])
            self.assertNotEqual(missing["mission"].get("result"), "ACKNOWLEDGED")
            self.assertNotEqual(missing["mission"].get("phase"), "NOT_FOUND")
            self.assertNotIn("NOT_FOUND", json.dumps(missing))
            self.assertEqual(missing["bus_head"]["phase"], "ACKNOWLEDGED")
            self.assertNotIn("NOT_FOUND", BUS._KNOWN_PHASES)

            bare = BUS.status(path=log)
            self.assertEqual(bare["phase"], "ACKNOWLEDGED")
            self.assertEqual(bare["state_version"], second["receipt"]["state_version"])
            self.assertIsNone(bare["mission_id"])
            self.assertNotIn("mission", bare)
            self.assertNotIn("bus_head", bare)
            self.assertNotIn("found", bare)
            self.assertEqual(hashlib.sha256(log.read_bytes()).hexdigest(), digest)

            stale = BUS.apply_state(
                BUS.JARVIS_PRIMARY,
                {
                    "entity_id": BUS.JARVIS_ENTITY,
                    "entity_type": "jarvis_bus",
                    "state_version": 1,
                    "changed_at": "2026-09-28T00:00:00+00:00",
                    "source_platform": "jarvis",
                    "source_session": "stale-session",
                    "writer": "event-bus.py",
                    "provenance": "event-bus.py",
                    "supersedes_version": 0,
                    "payload": {"stale": True},
                },
                path=log,
            )
            self.assertEqual(stale["result"], "STALE")
            after_stale = hashlib.sha256(log.read_bytes()).hexdigest()
            held = BUS.status(path=log, mission_id=first["mission_id"])
            self.assertEqual(hashlib.sha256(log.read_bytes()).hexdigest(), after_stale)
            self.assertEqual(held["mission"]["phase"], "ACKNOWLEDGED")
            self.assertEqual(held["mission"]["state_version"], first["receipt"]["state_version"])
            self.assertEqual(held["mission"]["result"], first["receipt"]["result"])
            self.assertEqual(held["bus_head"]["phase"], "STALE")
            self.assertNotEqual(held["mission"]["phase"], held["bus_head"]["phase"])
            bare_after = BUS.status(path=log)
            self.assertEqual(bare_after["phase"], "STALE")
            self.assertEqual(bare_after["state_version"], held["bus_head"]["state_version"])
            self.assertIsNone(bare_after["mission_id"])
        home_after = home.read_bytes() if home.is_file() else None
        self.assertEqual(home_after, home_before)

    def test_crashed_start_replay_repairs_receipt_once(self) -> None:
        home = BUS.DEFAULT_PATH
        home_before = home.read_bytes() if home.is_file() else None
        receipt_keys = (
            "mission_id",
            "session_id",
            "operation",
            "source",
            "caller",
            "state_version",
            "timestamp",
            "result",
            "previous_state",
            "new_state",
        )
        with tempfile.TemporaryDirectory() as tmp:
            log = Path(tmp) / "events.jsonl"
            mission = "mission-crashed-start"
            session = "session-crashed-start"
            stamp = "2026-09-28T00:00:00+00:00"
            published = BUS.publish_jarvis(
                {
                    "mission_id": mission,
                    "session_id": session,
                    "local": True,
                    "harmless": True,
                },
                state_version=1,
                source_session=session,
                writer="event-bus.py",
                path=log,
                changed_at=stamp,
            )
            self.assertEqual(published["published"]["result"], "PUBLISHED")
            self.assertIsNone(BUS._start_receipt(log, mission))
            before = log.read_bytes()
            replay = BUS.start(
                mission_id=mission,
                session_id="session-ignored-on-replay",
                source="other-source",
                caller="other-caller",
                path=log,
            )
            self.assertNotEqual(replay.get("result"), "INCOMPLETE_START")
            receipt = replay.get("receipt")
            self.assertIsInstance(receipt, dict)
            assert isinstance(receipt, dict)
            self.assertEqual(replay["mission_id"], mission)
            self.assertEqual(replay["session_id"], session)
            self.assertEqual(receipt["operation"], "start")
            self.assertEqual(receipt["mission_id"], mission)
            self.assertEqual(receipt["session_id"], session)
            self.assertEqual(receipt["caller"], "event-bus.py")
            self.assertEqual(receipt["source"], "jarvis")
            self.assertNotEqual(receipt["source"], "other-source")
            self.assertNotEqual(receipt["caller"], "other-caller")
            self.assertEqual(receipt["timestamp"], stamp)
            self.assertEqual(receipt["state_version"], 1)
            self.assertEqual(receipt["result"], "ACKNOWLEDGED")
            self.assertIsNone(receipt["previous_state"]["state_version"])
            self.assertIsNone(receipt["new_state"]["mission_id"])
            self.assertEqual(receipt["new_state"]["phase"], "ACKNOWLEDGED")
            self.assertEqual(receipt["new_state"]["state_version"], 1)
            for key in receipt_keys:
                self.assertIn(key, receipt)
            self.assertNotEqual(log.read_bytes(), before)
            rows = [
                row
                for row in BUS._read_all(log)
                if row.get("type") == "continuity.receipt" and row.get("operation") == "start"
            ]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0], receipt)
            snapshot = log.read_bytes()
            again = BUS.start(
                mission_id=mission,
                session_id="session-still-ignored",
                source="third-source",
                caller="third-caller",
                path=log,
            )
            self.assertEqual(log.read_bytes(), snapshot)
            self.assertEqual(again["receipt"], receipt)
            self.assertEqual(again["session_id"], session)
            self.assertIsNotNone(again["receipt"])
            self.assertEqual(
                len(
                    [
                        row
                        for row in BUS._read_all(log)
                        if row.get("type") == "continuity.receipt" and row.get("operation") == "start"
                    ]
                ),
                1,
            )
            seen = BUS.status(path=log, mission_id=mission)
            self.assertTrue(seen["found"])
            self.assertEqual(seen["mission"]["state_version"], 1)
            self.assertEqual(seen["mission"]["session_id"], session)
            self.assertEqual(seen["mission"]["result"], "ACKNOWLEDGED")
            self.assertEqual(log.read_bytes(), snapshot)
        home_after = home.read_bytes() if home.is_file() else None
        self.assertEqual(home_after, home_before)


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

    def test_project_state_is_not_one_job(self) -> None:
        evidence, verifier, env = _proof()
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            projects = folder / "projects"
            projects.mkdir()
            (projects / "demo.json").write_text(
                json.dumps({"project_id": "demo", "lifecycle": "development", "agent_state": "BLOCKED"}) + "\n",
                encoding="utf-8",
            )
            state = _blank_state(folder)
            seeded = json.loads(state.read_text(encoding="utf-8"))
            seeded["jobs"] = [
                {
                    "id": "owed",
                    "name": "owed",
                    "status": "BLOCKED",
                    "desk": "forge",
                    "updated": "2026-09-25",
                }
            ]
            state.write_text(json.dumps(seeded), encoding="utf-8")
            previous = PRODUCT.STATE_DIR
            previous_emit = PRODUCT._load_event_bus
            PRODUCT.STATE_DIR = projects
            PRODUCT._load_event_bus = lambda: (lambda *args, **kwargs: "skipped")
            try:
                updated = PRODUCT.transition(
                    "demo",
                    None,
                    "DONE",
                    "Forge",
                    builder="Forge",
                    verifier=verifier,
                    evidence=evidence,
                    environment=env,
                    state_path=state,
                )
            finally:
                PRODUCT.STATE_DIR = previous
                PRODUCT._load_event_bus = previous_emit
            self.assertTrue(updated["terminal_guard"]["permitted"])
            self.assertEqual(updated["terminal_guard"]["state"], "DONE")
            self.assertEqual(updated["agent_state"], "BLOCKED")
            self.assertNotEqual(updated["agent_state"], "DONE")
            disk = json.loads(state.read_text(encoding="utf-8"))
            row = next(job for job in disk["jobs"] if job["id"] == "demo")
            owed = next(job for job in disk["jobs"] if job["id"] == "owed")
            self.assertEqual(row["status"], "DONE")
            self.assertNotEqual(updated["agent_state"], row["status"])
            self.assertEqual(owed["status"], "BLOCKED")

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
