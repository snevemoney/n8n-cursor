"""Open access: "permission granted" lifts false-positive limits; "lock it down" restores them."""
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from brain import pipeline as P

PERM = P._permissions_hand()
BR = P.browser_runtime()


def _wr():
    import importlib.util, sys
    name = "agent_stack_workspace_read"
    if name not in sys.modules:
        spec = importlib.util.spec_from_file_location(name, P.STACK / "hands" / "workspace_read.py")
        mod = importlib.util.module_from_spec(spec); sys.modules[name] = mod; spec.loader.exec_module(mod)
    return sys.modules[name]


class OpenAccessBase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.mode = self.root / "mode.json"
        env = mock.patch.dict(os.environ, {"JARVIS_MODE_FILE": str(self.mode), "JARVIS_ACTION_LOG": "off"})
        env.start(); self.addCleanup(env.stop)
        PERM.set_open_access(False)  # since 2026-10-15 10:25 access is open by default; these cases test the owner-revoked state


class Phrases(unittest.TestCase):
    def test_grants(self):
        for t in ["permission granted", "Permission granted.", "Jarvis, permission granted, go ahead",
                  "I allow you to do this", "I allow you", "ok I give you full access"]:
            self.assertTrue(PERM.is_grant(t), t)

    def test_not_grants(self):
        # 2026-10-15 security review: TV/ambient phrases no longer grant
        for t in ["what does permission granted mean", "send it", "yes", "I allowed it yesterday",
                  "access granted", "you're allowed to do that"]:
            self.assertFalse(PERM.is_grant(t), t)

    def test_grant_carries_the_command(self):
        self.assertEqual(PERM.grant_split("permission granted, you are allowed to find books"), (True, "find books"))
        self.assertEqual(PERM.grant_split("I said permission granted, find books about AI on my Mac"),
                         (True, "find books about AI on my Mac"))
        self.assertEqual(PERM.grant_split("permission granted, go ahead"), (True, ""))
        self.assertEqual(PERM.grant_split("I allow you to send the email to Bob"), (True, "send the email to Bob"))

    def test_revokes(self):
        for t in ["lock it down", "permission revoked", "revoke your access", "back to safe mode", "Jarvis, lock it back down."]:
            self.assertTrue(PERM.is_revoke(t), t)

    def test_tests_never_read_the_real_owner_file(self):
        with mock.patch.dict(os.environ, {"JARVIS_MODE_FILE": ""}):
            self.assertFalse(PERM.open_access())


class Switch(OpenAccessBase):
    def test_on_until_revoked_no_timer(self):
        self.assertFalse(PERM.open_access())
        PERM.set_open_access(True)
        data = json.loads(self.mode.read_text())
        self.assertTrue(data["open_access"]); self.assertNotIn("open_until", data)
        self.assertTrue(PERM.open_access())
        PERM.set_open_access(False)
        self.assertFalse(PERM.open_access())

    def test_edits_open_in_home_but_not_secrets_or_library(self):
        home = self.root / "home"; (home / "proj").mkdir(parents=True); (home / "Library").mkdir()
        with mock.patch.object(Path, "home", return_value=home):
            self.assertEqual(PERM.decide("edit", str(home / "proj" / "a.py")), "confirm")
            PERM.set_open_access(True)
            self.assertEqual(PERM.decide("edit", str(home / "proj" / "a.py")), "allow")
            self.assertEqual(PERM.decide("edit", str(home / "proj" / ".env")), "confirm")
            self.assertEqual(PERM.decide("edit", str(home / "Library" / "x.plist")), "confirm")
            self.assertEqual(PERM.decide("delete", str(home / "proj" / "a.py")), "confirm")
            self.assertEqual(PERM.decide("push", "origin"), "confirm")


class Files(OpenAccessBase):
    def setUp(self):
        super().setUp()
        self.home = self.root / "home"; self.base = self.home / "code"; self.other = self.home / "Projects"
        for d in (self.base, self.other):
            d.mkdir(parents=True)
        (self.other / "tokenomics.md").write_text("supply: 21M\n")
        (self.other / "plan.md").write_text("ship it\n")
        (self.other / ".env").write_text("KEY=1\n")
        (self.other / "big.txt").write_text("x" * 50000)
        p = mock.patch.dict(os.environ, {"JARVIS_READ_ROOTS": str(self.base)}); p.start(); self.addCleanup(p.stop)
        h = mock.patch.object(Path, "home", return_value=self.home); h.start(); self.addCleanup(h.stop)
        r = mock.patch.object(_wr(), "RUNNING_TREE", self.base); r.start(); self.addCleanup(r.stop)  # hermetic: no real repo

    def test_closed_refuses_outside_and_hints(self):
        got = _wr().run({"op": "read", "path": str(self.other / "plan.md")})
        self.assertFalse(got["ok"]); self.assertEqual(got["error"], "outside the allowed folders")
        self.assertIn("permission granted", got["spoken"])

    def test_closed_treats_token_names_as_secret(self):
        got = _wr().run({"op": "read", "path": str(self.other / "tokenomics.md")})
        self.assertTrue(got["ok"]); self.assertTrue(got.get("secret"))  # Evens 10-16: flag, never stop

    def test_open_reads_home_and_narrow_secrets(self):
        PERM.set_open_access(True)
        got = _wr().run({"op": "read", "path": str(self.other / "tokenomics.md")})
        self.assertTrue(got["ok"], got); self.assertIn("21M", got["text"])
        self.assertFalse(got.get("secret"))
        env = _wr().run({"op": "read", "path": str(self.other / ".env")})
        self.assertTrue(env["ok"]); self.assertTrue(env["secret"]); self.assertIn("Heads up", env["spoken"])
        big = _wr().run({"op": "read", "path": str(self.other / "big.txt")})
        self.assertEqual(len(big["text"]), 50000); self.assertFalse(big["truncated"])

    def test_open_finds_any_file_by_name(self):
        PERM.set_open_access(True)
        args = _wr().args_from_utterance("find my files about tokenomics")
        self.assertEqual(args["op"], "find"); self.assertEqual(args["name"], "tokenomics")
        got = _wr().run(args)
        self.assertTrue(got["ok"], got); self.assertEqual(got["files"], [str(self.other / "tokenomics.md")])


class Browser(unittest.TestCase):
    def test_closed_is_strict(self):
        with mock.patch.dict(os.environ, {"JARVIS_OPEN_ACCESS": "0"}):
            self.assertTrue(BR.unsafe_mission_intent("find a blog post about rust"))
            self.assertFalse(BR.allowed_url("https://other.com/", ("example.com",)))
            self.assertTrue(BR.allowed_url("https://www.example.com/", ("example.com",)))
            self.assertTrue(BR.hard().search("Sign in"))

    def test_open_any_public_site_but_not_private_or_purchases(self):
        with mock.patch.dict(os.environ, {"JARVIS_OPEN_ACCESS": "1"}):
            self.assertTrue(BR.allowed_url("https://other.com/x", ("example.com",)))
            self.assertFalse(BR.allowed_url("http://127.0.0.1:4018/", ("example.com",)))
            self.assertFalse(BR.allowed_url("http://192.168.1.2/", ()))
            self.assertIsNone(BR.hard().search("Sign in"))
            for word in ("Buy now", "Checkout", "Send", "Pay", "Delete account", "Publish"):
                self.assertTrue(BR.hard().search(word), word)

    def test_open_flow_budgets_and_login(self):
        row = {"flow_id": "f1", "mission_id": "m", "objective": "find docs", "starting_route": "https://docs.example.com/",
               "allowed_domains": ["example.com"], "stop_conditions": ["found"],
               "verification_recipe": {"kind": "dom", "url": "https://docs.example.com/", "predicates": [{"text": "x"}]}}
        with mock.patch.dict(os.environ, {"JARVIS_OPEN_ACCESS": "1"}), mock.patch.object(BR, "validate_recipe"):
            flow = BR.BrowserFlow.from_dict(row)
        self.assertEqual((flow.action_budget, flow.time_budget), (100, 600))
        self.assertNotIn("authenticate", flow.forbidden_actions)
        self.assertIn("pay", flow.forbidden_actions)


class Pipeline(OpenAccessBase):
    def test_blocked_request_is_redone_only_after_a_block(self):
        turns = [{"user": "read ~/Projects/plan.md", "jarvis": "I can't read that: outside the allowed folders."}]
        self.assertEqual(P._blocked_request(turns), "read ~/Projects/plan.md")
        self.assertEqual(P._blocked_request([{"user": "hi", "jarvis": "Hello, sir."}]), "")
        self.assertEqual(P._blocked_request([]), "")

    def test_code_run_confirm_only_for_dangerous_code_when_open(self):
        PERM.set_open_access(True)
        self.assertIsNone(P._needs_confirm("code_run", {"code": "print(sum(range(10)))"}, "run it"))
        self.assertIsNotNone(P._needs_confirm("code_run", {"code": "import shutil; shutil.rmtree('/tmp/x')"}, "run it"))
        self.assertIsNotNone(P._needs_confirm("code_run", {"code": "import requests; requests.post('https://x')"}, "run it"))
        for code in ("import httpx; httpx.post('https://x', json={})",
                     "urllib.request.urlopen(urllib.request.Request(u, data=b, method='POST'))",
                     "subprocess.run(['npm', 'publish'])", "os.system('npm publish')", "os.system('gh pr merge 1')"):
            self.assertIsNotNone(P._needs_confirm("code_run", {"code": code}, "run it"), code)
        self.assertIsNone(P._needs_confirm("code_run", {"code": "import httpx; print(httpx.get('https://x').status_code)"}, "run it"))

    def test_code_run_still_confirms_when_closed(self):
        self.assertIsNotNone(P._needs_confirm("code_run", {"code": "print(1)"}, "run it"))

    def test_grant_turn_switches_on_and_revoke_off(self):
        hive = self.root / "hive"; (hive / "bus").mkdir(parents=True)
        # Blueprint 2.4 (10-15): a spoken grant covers this request only; standing access needs its own explicit words.
        out = list(P.apply_pipeline_iter("permission granted", hive=hive))
        self.assertTrue(PERM.open_access()); self.assertTrue(PERM.task_grant_active())
        self.assertTrue(PERM.mode().get("revoked_by_owner"))  # standing choice untouched
        self.assertIn("this request", out[-1]["spoken"])
        out = list(P.apply_pipeline_iter("lock it down", hive=hive))
        self.assertFalse(PERM.open_access()); self.assertFalse(PERM.task_grant_active())
        self.assertIn("Open access is off", out[-1]["spoken"])
        out = list(P.apply_pipeline_iter("turn open access back on", hive=hive))
        self.assertTrue(PERM.open_access()); self.assertFalse(PERM.mode().get("revoked_by_owner"))
        self.assertIn("Open access is on", out[-1]["spoken"])


if __name__ == "__main__":
    unittest.main()


class SecretNames(unittest.TestCase):
    def test_real_secrets_stay_secret(self):
        for p in [".env", "repo/.env.local", "~/.ssh/id_rsa", "a/server.pem", "x/.grok-private/m.json",
                  "vault/secrets/jarvis-bite2-secret.md", "github_token", "config/tokens.json", "notes/secret-notes.md",
                  "a/credentials.json", "a/.git-credentials", "client_secret.json", "proj/tokens/x.py"]:
            self.assertTrue(PERM.is_secret_path(p), p)

    def test_code_named_for_tokens_is_code(self):
        for p in ["apps/agent-stack/hands/test_tokens.py", "src/tokenizer.py", "lib/tokenizers/bpe.py",
                  "tools/secret_scanner.ts", "brain/test_literal_tokens_and_budget.py"]:
            self.assertFalse(PERM.is_secret_path(p), p)
