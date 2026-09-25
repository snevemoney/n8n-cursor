#!/usr/bin/env python3
"""Delivery uses git and the existing GitHub check record. It does not merge."""
from __future__ import annotations

import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
_spec = importlib.util.spec_from_file_location("delivery", HERE / "delivery.py")
assert _spec and _spec.loader
delivery = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(delivery)

BUILDER = {
    "platform": "cursor",
    "agent": "cursor_background_agent",
    "engineering_function": "develop",
    "run_id": "build-1",
}
REVIEWER = {
    "platform": "cursor",
    "agent": "cursor_background_agent",
    "engineering_function": "review",
    "run_id": "review-2",
}
GREEN = [{"name": "Hive engineering gates", "state": "success", "required": True}]


def _git(repo: Path, *args: str) -> None:
    proc = subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True)
    if proc.returncode != 0:
        raise AssertionError(proc.stderr or proc.stdout)


def _init_pair(parent: Path) -> tuple[Path, Path]:
    repo = parent / "repo"
    repo.mkdir()
    _git(repo, "init", "-q", "-b", "feature")
    _git(repo, "config", "user.email", "delivery@example.com")
    _git(repo, "config", "user.name", "delivery")
    (repo / "keep.txt").write_text("keep\n", encoding="utf-8")
    (repo / "shared.txt").write_text("base\n", encoding="utf-8")
    _git(repo, "add", "keep.txt", "shared.txt")
    _git(repo, "commit", "-qm", "base")
    _git(repo, "branch", "theirs")
    (repo / "shared.txt").write_text("ours\n", encoding="utf-8")
    _git(repo, "commit", "-qam", "ours")
    _git(repo, "checkout", "-q", "theirs")
    return repo, parent


class DeliveryPolicyTest(unittest.TestCase):
    def test_feature_git_after_local_gates(self) -> None:
        for verb in ("commit", "push", "draft_pr"):
            with self.subTest(verb=verb):
                row = delivery.decide({"verb": verb, "actor": "worker", "ref": "cursor/slice", "local_gates": "pass"})
                self.assertTrue(row["allowed"], row)
                self.assertFalse(row["ask_evens"])
                self.assertFalse(row["performed"])
                self.assertNotIn(row["action"], {"merge_ready", "tier3_held"})
        draft = delivery.decide({"verb": "draft_pr", "actor": "worker", "ref": "cursor/slice", "local_gates": "pass"})
        self.assertTrue(draft["draft"])

    def test_failed_gate_repairs_without_evens(self) -> None:
        row = delivery.decide({"verb": "commit", "actor": "worker", "ref": "cursor/slice", "local_gates": "fail"})
        self.assertFalse(row["allowed"])
        self.assertEqual(row["action"], "continue_repair")
        self.assertFalse(row["ask_evens"])
        repair = delivery.decide({"verb": "repair", "actor": "worker", "ci": "red"})
        self.assertTrue(repair["allowed"])
        self.assertEqual(repair["action"], "continue_repair")
        self.assertFalse(repair["ask_evens"])

    def test_worker_cannot_push_main(self) -> None:
        for ref in ("main", "master", "refs/heads/main", "origin/master", "", "*"):
            with self.subTest(ref=ref):
                row = delivery.decide({"verb": "push", "actor": "worker", "ref": ref, "local_gates": "pass"})
                self.assertFalse(row["allowed"], row)
                self.assertFalse(row["performed"])
        unrestricted = delivery.decide(
            {"verb": "push", "actor": "worker", "ref": "cursor/slice", "local_gates": "pass", "unrestricted": True}
        )
        self.assertFalse(unrestricted["allowed"])
        self.assertIn("unrestricted", unrestricted["reasons"][0])

    def test_ready_pull_request_is_not_the_routine_step(self) -> None:
        row = delivery.decide(
            {"verb": "draft_pr", "actor": "worker", "ref": "cursor/slice", "local_gates": "pass", "draft": False}
        )
        self.assertFalse(row["allowed"])
        self.assertFalse(row["performed"])

    def test_jev_is_not_merge_authority(self) -> None:
        for verb in ("commit", "push", "draft_pr", "merge", "update"):
            with self.subTest(verb=verb):
                row = delivery.decide({"verb": verb, "actor": "jev", "ref": "cursor/slice", "local_gates": "pass"})
                self.assertFalse(row["allowed"])
                self.assertIn("Jev is not merge authority", row["reasons"])
        reviewed = delivery.decide(
            {
                "verb": "merge",
                "actor": "worker",
                "base": "develop",
                "policy_tier": 2,
                "builder": BUILDER,
                "reviewer": {**REVIEWER, "agent": "jev-1.13"},
                "checks": GREEN,
            }
        )
        self.assertFalse(reviewed["ready"])
        self.assertIn("Jev is not merge authority", reviewed["reasons"])

    def test_no_conflict_update_is_automatic(self) -> None:
        row = delivery.decide(
            {"verb": "update", "actor": "worker", "ref": "cursor/slice", "update_class": "no_conflict"}
        )
        self.assertTrue(row["allowed"])
        self.assertEqual(row["action"], "apply_update")
        self.assertFalse(row["ask_evens"])

    def test_semantic_conflict_is_not_guessed(self) -> None:
        row = delivery.decide(
            {"verb": "update", "actor": "worker", "ref": "cursor/slice", "update_class": "semantic_conflict"}
        )
        self.assertFalse(row["allowed"])
        self.assertEqual(row["action"], "hold")
        self.assertIsNone(row["resolution"])
        self.assertFalse(row["ask_evens"])
        self.assertIn("not guessed", row["reasons"][0])

    def test_merge_waits_for_review_checks_and_tier(self) -> None:
        missing_review = delivery.decide(
            {"verb": "merge", "actor": "worker", "base": "develop", "policy_tier": 2, "checks": GREEN}
        )
        self.assertEqual(missing_review["action"], "wait_merge")
        self.assertFalse(missing_review["ask_evens"])
        pending = delivery.decide(
            {
                "verb": "merge",
                "actor": "worker",
                "base": "develop",
                "policy_tier": 2,
                "builder": BUILDER,
                "reviewer": REVIEWER,
                "checks": [{"name": "Hive engineering gates", "state": "pending", "required": True}],
            }
        )
        self.assertEqual(pending["action"], "wait_merge")
        self.assertFalse(pending["ask_evens"])
        tier = delivery.decide(
            {
                "verb": "merge",
                "actor": "worker",
                "base": "develop",
                "policy_tier": 1,
                "builder": BUILDER,
                "reviewer": REVIEWER,
                "checks": GREEN,
            }
        )
        self.assertEqual(tier["action"], "wait_merge")
        self.assertIn("policy tier", tier["reasons"][0])
        same_run = delivery.decide(
            {
                "verb": "merge",
                "actor": "worker",
                "base": "develop",
                "policy_tier": 2,
                "builder": BUILDER,
                "reviewer": {**REVIEWER, "run_id": "build-1"},
                "checks": GREEN,
            }
        )
        self.assertEqual(same_run["action"], "wait_merge")
        self.assertFalse(same_run["ready"])
        ready = delivery.decide(
            {
                "verb": "merge",
                "actor": "worker",
                "base": "develop",
                "policy_tier": 2,
                "builder": BUILDER,
                "reviewer": REVIEWER,
                "checks": GREEN,
            }
        )
        self.assertTrue(ready["ready"], ready)
        self.assertFalse(ready["performed"])
        self.assertFalse(ready["allowed"])
        self.assertFalse(ready["ask_evens"])

    def test_red_ci_repairs_without_asking_evens(self) -> None:
        row = delivery.decide(
            {
                "verb": "merge",
                "actor": "worker",
                "base": "main",
                "policy_tier": 3,
                "builder": BUILDER,
                "reviewer": REVIEWER,
                "ci": "red",
            }
        )
        self.assertEqual(row["action"], "continue_repair")
        self.assertFalse(row["ask_evens"])
        self.assertFalse(row["performed"])

    def test_tier3_and_main_stay_with_evens(self) -> None:
        for base, tier in (("main", 2), ("develop", 3), ("master", 2)):
            with self.subTest(base=base, tier=tier):
                row = delivery.decide(
                    {
                        "verb": "merge",
                        "actor": "worker",
                        "base": base,
                        "policy_tier": tier,
                        "builder": BUILDER,
                        "reviewer": REVIEWER,
                        "checks": GREEN,
                    }
                )
                self.assertEqual(row["action"], "tier3_held", row)
                self.assertTrue(row["ask_evens"])
                self.assertFalse(row["performed"])
        deploy = delivery.decide({"verb": "deploy", "actor": "worker"})
        self.assertEqual(deploy["action"], "tier3_held")
        self.assertTrue(deploy["ask_evens"])
        self.assertFalse(deploy["performed"])

    def test_open_prs_394_and_398_are_not_merged(self) -> None:
        for number in (394, 398):
            with self.subTest(pr=number):
                row = delivery.decide(
                    {
                        "verb": "merge",
                        "actor": "worker",
                        "pr": number,
                        "base": "develop",
                        "policy_tier": 2,
                        "builder": BUILDER,
                        "reviewer": REVIEWER,
                        "checks": GREEN,
                    }
                )
                self.assertFalse(row["allowed"])
                self.assertFalse(row["ready"])
                self.assertFalse(row["performed"])
                self.assertIn(str(number), row["reasons"][0])

    def test_permissions_record_the_refusals(self) -> None:
        denied = delivery.builder_may_not()
        self.assertIn("deploy_tier3", denied)
        self.assertIn("push_main", denied)
        self.assertIn("merge_main", denied)
        self.assertIn("guess_semantic_conflict", denied)

    def test_git_merge_tree_applies_only_a_clean_update(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            parent = Path(tmp)
            repo, _ = _init_pair(parent)
            _git(repo, "checkout", "-q", "feature")
            (repo / "other.txt").write_text("from-theirs\n", encoding="utf-8")
            # The commit above landed on feature. Put the extra file on theirs.
            _git(repo, "checkout", "-q", "theirs")
            (repo / "other.txt").write_text("from-theirs\n", encoding="utf-8")
            _git(repo, "add", "other.txt")
            _git(repo, "commit", "-qm", "theirs-file")
            _git(repo, "checkout", "-q", "feature")
            clean = delivery.classify_update(repo, "HEAD", "theirs")
            self.assertEqual(clean["class"], "no_conflict")
            applied = delivery.apply_update(repo, "theirs")
            self.assertTrue(applied["applied"], applied)
            self.assertEqual((repo / "other.txt").read_text(encoding="utf-8"), "from-theirs\n")
            self.assertEqual((repo / "shared.txt").read_text(encoding="utf-8"), "ours\n")
            _git(repo, "checkout", "-q", "theirs")
            (repo / "shared.txt").write_text("theirs\n", encoding="utf-8")
            _git(repo, "commit", "-qam", "theirs-edit")
            _git(repo, "checkout", "-q", "feature")
            conflict = delivery.classify_update(repo, "HEAD", "theirs")
            self.assertEqual(conflict["class"], "semantic_conflict")
            self.assertIsNone(conflict["resolution"])
            self.assertFalse(conflict["ask_evens"])
            held = delivery.apply_update(repo, "theirs")
            self.assertFalse(held["applied"])
            self.assertIsNone(held["resolution"])
            self.assertEqual((repo / "shared.txt").read_text(encoding="utf-8"), "ours\n")

    def test_update_refuses_main(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp) / "repo"
            repo.mkdir()
            _git(repo, "init", "-q", "-b", "main")
            _git(repo, "config", "user.email", "delivery@example.com")
            _git(repo, "config", "user.name", "delivery")
            (repo / "f.txt").write_text("a\n", encoding="utf-8")
            _git(repo, "add", "f.txt")
            _git(repo, "commit", "-qm", "base")
            _git(repo, "branch", "side")
            _git(repo, "checkout", "-q", "side")
            (repo / "g.txt").write_text("b\n", encoding="utf-8")
            _git(repo, "add", "g.txt")
            _git(repo, "commit", "-qm", "side")
            _git(repo, "checkout", "-q", "main")
            held = delivery.apply_update(repo, "side")
            self.assertFalse(held["applied"])
            self.assertFalse((repo / "g.txt").exists())

    def test_existing_github_check_text_parses(self) -> None:
        rows = delivery.parse_gh_checks("Hive engineering gates\tfail\t10s\thttps://example.test\n")
        self.assertEqual(rows[0]["name"], "Hive engineering gates")
        self.assertEqual(rows[0]["state"], "fail")
        row = delivery.decide({"verb": "merge", "actor": "worker", "base": "develop", "policy_tier": 2, "checks": rows})
        self.assertEqual(row["action"], "continue_repair")
        self.assertFalse(row["ask_evens"])

    def test_no_second_ci_and_no_daemon(self) -> None:
        source = (HERE / "delivery.py").read_text(encoding="utf-8")
        for banned in ("while True", "threading", "circleci", "jenkins", "buildkite", "gh pr merge", "git push", "-X"):
            self.assertNotIn(banned, source)
        workflow = (ROOT / ".github/workflows/hive-eng.yml").read_text(encoding="utf-8")
        self.assertEqual(workflow.count("jobs:"), 1)
        self.assertIn("name: Hive engineering gates", workflow)
        self.assertIn("scripts.hive.eng.test_delivery", workflow)
        names = sorted(path.name for path in (ROOT / ".github/workflows").glob("*.yml"))
        self.assertIn("hive-eng.yml", names)
        self.assertNotIn("delivery-ci.yml", names)

    def test_cli_decide_does_not_perform_merge(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "request.json"
            path.write_text(
                json.dumps(
                    {
                        "verb": "merge",
                        "actor": "worker",
                        "pr": 394,
                        "base": "develop",
                        "policy_tier": 2,
                        "checks": GREEN,
                        "builder": BUILDER,
                        "reviewer": REVIEWER,
                    }
                ),
                encoding="utf-8",
            )
            proc = subprocess.run(
                ["python3", str(HERE / "delivery.py"), "decide", "--request", str(path)],
                capture_output=True,
                text=True,
                cwd=str(ROOT),
            )
            self.assertEqual(proc.returncode, 0, proc.stderr)
            row = json.loads(proc.stdout)
            self.assertFalse(row["performed"])
            self.assertFalse(row["ready"])


if __name__ == "__main__":
    unittest.main()
