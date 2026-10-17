"""Google Workspace CLI (`gws`) for Jarvis: reads run, everything that writes or signs in needs Evens.

subprocess is stubbed, so no Google call is made and no credential is touched.
"""
import importlib.util, os, tempfile, types, unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("agent_tools_gws_t", Path(__file__).with_name("agent_tools.py"))
a = importlib.util.module_from_spec(spec)
spec.loader.exec_module(a)

READS = [
    "gmail +triage",
    "gmail +read --id 18f3a",
    "gmail users messages list --params {\"userId\":\"me\",\"maxResults\":5}",
    "gmail users messages get --params {\"userId\":\"me\",\"id\":\"18f3a\"}",
    "gmail users labels list --params {\"userId\":\"me\"}",
    "calendar +agenda",
    "calendar events list --params {\"calendarId\":\"primary\"}",
    "calendar freebusy query",
    "drive files list --params {\"pageSize\":10}",
    "drive files get --params {\"fileId\":\"abc\"}",
    "docs documents get --params {\"documentId\":\"d1\"}",
    "sheets spreadsheets get --params {\"spreadsheetId\":\"s1\"}",
    "tasks tasklists list",
]
WRITES = [
    "gmail +send --to a@b.c --subject hi --body x",
    "gmail +reply --id 1 --body x",
    "gmail +reply-all --id 1 --body x",
    "gmail +forward --id 1 --to a@b.c",
    "gmail +watch",
    "gmail users messages send --json {}",
    "gmail users messages trash --params {\"userId\":\"me\",\"id\":\"1\"}",
    "gmail users messages modify --params {\"userId\":\"me\",\"id\":\"1\"}",
    "gmail users messages batchDelete --json {}",
    "gmail users drafts create --json {}",
    "calendar +insert --summary x",
    "calendar events insert --json {}",
    "calendar events delete --params {\"calendarId\":\"primary\",\"eventId\":\"e\"}",
    "calendar events quickAdd --params {}",
    "drive files create --json {}",
    "drive files update --json {}",
    "drive files list --upload /etc/hosts",
    "drive files get --output /tmp/x --params {\"fileId\":\"abc\",\"alt\":\"media\"}",
    "drive permissions create --json {}",
    "docs documents batchUpdate --json {}",
    "sheets spreadsheets values update --json {}",
    "chat spaces messages create --json {}",
    "auth login",
    "auth status",
    "auth export",
    "schema drive.files.list",       # not a read of user data; stays out of the allow-list to keep it tight
    "--help",
    "",
]


class FakeRun:
    def __init__(self):
        self.calls = []

    def __call__(self, cmd, **kw):
        self.calls.append(cmd)
        return types.SimpleNamespace(returncode=0, stdout="{\"ok\": true}", stderr="")


class GwsGate(unittest.TestCase):
    def setUp(self):
        os.environ["JARVIS_MODE_FILE"] = os.path.join(tempfile.mkdtemp(), "m.json")
        self.fake = FakeRun()
        a.subprocess = types.SimpleNamespace(run=self.fake, TimeoutExpired=TimeoutError, DEVNULL=-3, CompletedProcess=object)

    def test_reads_run_without_evens(self):
        for cmd in READS:
            got = a.op_cli(["gws", *cmd.split(" ")])
            self.assertFalse(got.get("gated"), cmd)
            self.assertTrue(got["ok"], cmd)
        self.assertEqual(len(self.fake.calls), len(READS))

    def test_writes_and_sign_in_are_gated_and_never_executed(self):
        for cmd in WRITES:
            got = a.op_cli(["gws", *cmd.split(" ")] if cmd else ["gws"])
            self.assertTrue(got.get("gated"), cmd)
            self.assertFalse(got["ok"], cmd)
        self.assertEqual(self.fake.calls, [])

    def test_utterance_routes_to_the_cli_hand(self):
        self.assertTrue(a.wants("gws gmail +triage"))
        self.assertEqual(a.args_from_utterance("gws calendar +agenda")["argv"], ["gws", "calendar", "+agenda"])


if __name__ == "__main__":
    unittest.main()
