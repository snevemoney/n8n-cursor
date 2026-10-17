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
        # 2026-10-16: spoken aliases name the right app; an alias for an app that isn't installed still finds nothing
        self.assertEqual(A.resolve("vs code", APPS)[0], "Visual Studio Code")
        self.assertEqual(A.resolve("code", {"Xcode": APPS.get("Xcode", Path("/Applications/Xcode.app"))}), None)  # never Xcode
        self.assertEqual(A.resolve("visual studio", APPS)[0], "Visual Studio Code")
        self.assertEqual(A.resolve("wordcraf", APPS)[0], "WordCraft")

    def test_open_and_quit_commands(self):
        ran = []
        got = A.run("open the Notes app", bundles=APPS, check=lambda a: True, runner=lambda c: ran.append(c) or SimpleNamespace(returncode=0, stdout="", stderr=""))
        self.assertTrue(got["ok"]); self.assertEqual(ran[-1], ["open", "-a", "/Applications/Notes.app"])
        A.run("quit Spotify", bundles=APPS, check=lambda a: False, runner=lambda c: ran.append(c) or SimpleNamespace(returncode=0, stdout="", stderr=""))
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

    def test_desktop_state_reads(self):
        self.assertEqual(A.list_kind("what apps are running?"), "apps")
        self.assertEqual(A.list_kind("hey jarvis, which windows are open"), "windows")
        self.assertEqual(A.list_kind("how many displays do I have"), "displays")
        self.assertEqual(A.list_kind("what apps are good for budgeting"), "")
        ran = A.run("what apps are running", runner=lambda c: SimpleNamespace(returncode=0, stdout="Finder, Safari, Notes", stderr=""))
        self.assertTrue(ran["task_verified"]); self.assertEqual(ran["items"], ["Finder", "Safari", "Notes"])
        disp = A.run("how many displays do I have", runner=lambda c: SimpleNamespace(
            returncode=0, stderr="", stdout='{"SPDisplaysDataType":[{"spdisplays_ndrvs":[{"_name":"Built-in"},{"_name":"LG"}]}]}'))
        self.assertIn("2 displays", disp["spoken"])
        denied = A.run("which windows are open", runner=lambda c: SimpleNamespace(returncode=1, stdout="", stderr="not allowed"))
        self.assertFalse(denied["ok"]); self.assertIn("not allowed", denied["spoken"])

    def test_desktop_state_off_mac_is_not_executed(self):
        got = A.run("what apps are running")
        self.assertEqual(got["outcome"], "NOT_EXECUTED"); self.assertFalse(got["task_verified"])


class HonestEvidence(unittest.TestCase):
    """Blueprint 2.1 (10-15): a skipped executor is NOT_EXECUTED; verified needs the app's real running state."""
    OK = staticmethod(lambda c: SimpleNamespace(returncode=0, stdout="", stderr=""))

    def test_disabled_execution_is_never_verified(self):
        got = A.run("open Notes", bundles=APPS)  # under unittest: no runner, not live
        self.assertEqual(got["execution_status"], "NOT_EXECUTED"); self.assertFalse(got["task_verified"])

    def test_open_verified_only_when_running(self):
        self.assertTrue(A.run("open Notes", bundles=APPS, runner=self.OK, check=lambda a: True)["task_verified"])
        got = A.run("open Notes", bundles=APPS, runner=self.OK, check=lambda a: False)
        self.assertFalse(got["task_verified"]); self.assertIn("isn't running", got["spoken"])

    def test_quit_with_save_dialog_waits_on_owner(self):
        got = A.run("quit Notes", bundles=APPS, runner=self.OK, check=lambda a: True)
        self.assertFalse(got["task_verified"]); self.assertTrue(got["waiting_owner"])

    def test_stderr_kept_when_stdout_nonempty(self):
        got = A.run("open Notes", bundles=APPS, runner=lambda c: SimpleNamespace(returncode=1, stdout="out", stderr="LSOpen failed"))
        self.assertEqual(got["stderr"], "LSOpen failed"); self.assertEqual(got["stdout"], "out")




class Sites(unittest.TestCase):
    def test_named_site_opens_in_safari(self):
        ran = []
        ok = lambda c: ran.append(c) or SimpleNamespace(returncode=0, stdout="", stderr="")
        got = A.run("open LinkedIn", bundles=APPS, runner=ok)
        self.assertEqual(ran, [["open", "-a", "Safari", "https://www.linkedin.com"]]); self.assertIn("LinkedIn", got["spoken"])
        self.assertFalse(got["task_verified"])
        A.run("open Notion in Safari", bundles=APPS, runner=ok)
        self.assertEqual(ran[-1][-1], "https://www.notion.so")

    def test_naming_the_browser_opens_the_site_not_the_app(self):
        ran = []
        A.run("open Spotify on my browser", bundles={**APPS, "Spotify": Path("/Applications/Spotify.app")},
              runner=lambda c: ran.append(c) or SimpleNamespace(returncode=0, stdout="", stderr=""))
        self.assertEqual(ran, [["open", "-a", "Safari", "https://open.spotify.com"]])

    def test_unknown_name_still_says_not_found(self):
        got = A.run("open Zzqx", bundles=APPS, runner=lambda c: self.fail("must not run"))
        self.assertIn("couldn't find", got["spoken"])


if __name__ == "__main__":
    unittest.main()
