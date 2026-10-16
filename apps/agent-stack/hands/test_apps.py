"""apps hand: open / switch to / quit any installed app by loose name."""
import importlib.util
import unittest
import unittest.mock
from pathlib import Path
from types import SimpleNamespace

_spec = importlib.util.spec_from_file_location("agent_stack_apps_test", Path(__file__).with_name("apps.py"))
A = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(A)
APPS = {n: Path(f"/Applications/{n}.app") for n in ("Spotify", "Final Cut Pro", "Notes", "Safari", "WordCraft", "Visual Studio Code")}


class Resolve(unittest.TestCase):
    def test_loose_names(self):
        self.assertEqual(A.resolve("spotify", APPS)[0], "Spotify")
        self.assertEqual(A.resolve("final cut", APPS)[0], "Final Cut Pro")
        self.assertEqual(A.resolve("vs code", APPS), None)  # no silent wrong app
        self.assertEqual(A.resolve("visual studio", APPS)[0], "Visual Studio Code")
        self.assertEqual(A.resolve("wordcraf", APPS)[0], "WordCraft")

    def test_open_and_quit_commands(self):
        ran = []
        got = A.run("open the Notes app", bundles=APPS, runner=lambda c: ran.append(c) or SimpleNamespace(returncode=0, stdout="", stderr=""))
        self.assertTrue(got["ok"]); self.assertEqual(ran[-1], ["open", "-a", "/Applications/Notes.app"])
        A.run("quit Spotify", bundles=APPS, runner=lambda c: ran.append(c) or SimpleNamespace(returncode=0, stdout="", stderr=""))
        self.assertEqual(ran[-1][:2], ["osascript", "-e"]); self.assertNotIn("force", ran[-1][-1])

    def test_disabled_execution_never_certifies(self):
        got = A.run("open the Notes app", bundles=APPS)  # tests are never live: nothing runs
        self.assertFalse(got["ok"]); self.assertFalse(got["task_verified"]); self.assertEqual(got["outcome"], "NOT_EXECUTED")
        self.assertIn("Nothing was opened", got["spoken"])

    def test_injected_runner_is_not_live_evidence(self):
        ok = lambda c: SimpleNamespace(returncode=0, stdout="", stderr="")
        got = A.run("open Spotify", bundles=APPS, runner=ok)
        self.assertTrue(got["command_ok"]); self.assertFalse(got["task_verified"]); self.assertIn("couldn't confirm", got["spoken"])

    def test_observed_state_decides_verified(self):
        ok = lambda c: SimpleNamespace(returncode=0, stdout="", stderr="")
        with unittest.mock.patch.object(A.time, "sleep"):
            up = A.run("open Spotify", bundles=APPS, runner=ok, observe=lambda app: True)
            down = A.run("open Spotify", bundles=APPS, runner=ok, observe=lambda app: False)
            stuck = A.run("quit Notes", bundles=APPS, runner=ok, observe=lambda app: True)
        self.assertTrue(up["task_verified"]); self.assertEqual(up["spoken"], "Spotify is open.")
        self.assertFalse(down["task_verified"]); self.assertIn("isn't running yet", down["spoken"])
        self.assertFalse(stuck["task_verified"]); self.assertIn("still running", stuck["spoken"])

    def test_failed_launch_is_not_ok(self):
        got = A.run("open Spotify", bundles=APPS, runner=lambda c: SimpleNamespace(returncode=1, stdout="", stderr="LSOpen failed"),
                    observe=lambda app: self.fail("must not observe after a failed launch"))
        self.assertFalse(got["ok"]); self.assertIn("LSOpen failed", got["spoken"])

    def test_unknown_app_is_honest(self):
        got = A.run("open Spotfy Premium Ultra", bundles=APPS, runner=lambda c: self.fail("must not run"))
        self.assertFalse(got["ok"]); self.assertIn("couldn't find", got["spoken"])

    def test_files_sites_and_folders_are_not_apps(self):
        for u in ("open my Downloads folder", "open youtube.com", "open ~/notes.md", "close the window", "open it"):
            m = A.OPEN_RE.match(u)
            self.assertTrue(m is None or A.NOT_APP_RE.search(m.group(2)), u)


if __name__ == "__main__":
    unittest.main()
