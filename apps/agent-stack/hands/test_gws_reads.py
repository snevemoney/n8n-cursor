"""gws read helpers: sent-mail duplicate guard, Docs/Sheets reads, calendar span. The runner is stubbed: no network, no auth, no browser."""
import importlib.util, json, shutil, subprocess, unittest
from pathlib import Path

HERE = Path(__file__).parent


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, HERE / file)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


r = load("gws_reads_t", "gws_reads.py")
g = load("gws_natural_reads_t", "gws_natural.py")


class Runner:
    """Scripted gws: returns (rc, out, err) per call, records argv."""

    def __init__(self, *replies):
        self.replies, self.calls = list(replies), []

    def __call__(self, argv):
        self.calls.append(list(argv))
        return self.replies[min(len(self.calls), len(self.replies)) - 1]


def listing(*ids):
    return (0, json.dumps({"messages": [{"id": i, "threadId": i} for i in ids], "resultSizeEstimate": len(ids)}), "")


def meta(to, subject, date="Tue, 13 Oct 2026 15:10:00 -0400", cc=None):
    hs = [{"name": "To", "value": to}, {"name": "Subject", "value": subject}, {"name": "Date", "value": date}]
    if cc:
        hs.append({"name": "Cc", "value": cc})
    return (0, json.dumps({"id": "x", "payload": {"headers": hs}}), "")


class SentGuardArgv(unittest.TestCase):
    def test_list_argv_is_read_only_and_one_params_element(self):
        argv = r.sent_list_argv("Sam@Example.com", 'Q3 "plan" update', days=2)
        self.assertEqual(argv[:6], ["gws", "gmail", "users", "messages", "list", "--params"])
        self.assertEqual(len(argv), 7)
        self.assertTrue(g.argv_is_read_only(argv))
        p = json.loads(argv[6])
        self.assertEqual(p["userId"], "me")
        self.assertEqual(p["maxResults"], 5)
        self.assertEqual(p["q"], 'in:sent to:sam@example.com subject:"Q3 plan update" newer_than:2d')

    def test_hostile_subject_cannot_break_out_of_the_quoted_term(self):
        argv = r.sent_list_argv("a@b.co", 'x" OR in:inbox \\ {y}\n--json', days=3)
        q = json.loads(argv[6])["q"]
        self.assertEqual(q.count('"'), 2)
        self.assertNotIn("\n", q)
        self.assertNotIn("\\", q)
        self.assertTrue(g.argv_is_read_only(argv))

    def test_bad_address_is_refused(self):
        for bad in ("", "not-an-address", "a@b", "a b@c.com", "a@b.com, c@d.com", "a@b.com\nbcc:x@y.com", "-x@y.com --json"):
            with self.assertRaises(ValueError, msg=bad):
                r.sent_list_argv(bad, "s")

    def test_days_clamped(self):
        self.assertIn("newer_than:1d", json.loads(r.sent_list_argv("a@b.co", "s", days=0)[6])["q"])
        self.assertIn("newer_than:30d", json.loads(r.sent_list_argv("a@b.co", "s", days=999)[6])["q"])

    def test_get_argv_checks_the_id(self):
        argv = r.sent_get_argv("18c0ffee12345678")
        self.assertTrue(g.argv_is_read_only(argv))
        p = json.loads(argv[6])
        self.assertEqual((p["userId"], p["id"], p["format"]), ("me", "18c0ffee12345678", "metadata"))
        with self.assertRaises(ValueError):
            r.sent_get_argv("abc; rm -rf /")


class SentGuardVerdict(unittest.TestCase):
    def test_exact_match_is_duplicate_and_never_sends(self):
        run = Runner(listing("18c0ffee00000001"), meta("Sam <sam@example.com>", "Re: Q3 plan"))
        got = r.check_sent_duplicate("sam@example.com", "Q3 plan", runner=run)
        self.assertEqual(got["status"], "duplicate")
        self.assertEqual(got["count"], 1)
        self.assertIn("Already sent", got["spoken"])
        self.assertTrue(all(c[:2] == ["gws", "gmail"] and c[3:5] == ["messages", c[4]] and c[4] in {"list", "get"} for c in run.calls))
        self.assertTrue(all(g.argv_is_read_only(c) for c in run.calls))

    def test_cc_counts_as_sent_to(self):
        run = Runner(listing("18c0ffee00000001"), meta("x@y.com", "Hello", cc="sam@example.com"))
        self.assertEqual(r.check_sent_duplicate("sam@example.com", "hello", runner=run)["status"], "duplicate")

    def test_close_but_different_subject_is_possible(self):
        run = Runner(listing("18c0ffee00000001"), meta("sam@example.com", "Q3 plan v2"))
        got = r.check_sent_duplicate("sam@example.com", "Q3 plan", runner=run)
        self.assertEqual(got["status"], "possible")

    def test_nothing_found_is_clear(self):
        run = Runner((0, json.dumps({"resultSizeEstimate": 0}), ""))
        got = r.check_sent_duplicate("sam@example.com", "Q3 plan", runner=run)
        self.assertEqual((got["status"], got["count"]), ("clear", 0))
        self.assertEqual(len(run.calls), 1)

    def test_missing_auth_is_unknown_and_spoken_plainly(self):
        run = Runner((1, "", "Error: no credentials found. Run gws auth login"))
        got = r.check_sent_duplicate("sam@example.com", "Q3 plan", runner=run)
        self.assertEqual(got["status"], "unknown")
        self.assertTrue(got["auth_missing"])
        self.assertIn("isn't connected", got["spoken"])
        self.assertNotIn("{", got["spoken"])

    def test_other_failure_is_unknown_not_clear(self):
        got = r.check_sent_duplicate("sam@example.com", "Q3 plan", runner=Runner((2, "", "boom")))
        self.assertEqual(got["status"], "unknown")
        self.assertFalse(got["auth_missing"])

    def test_unparseable_is_unknown(self):
        self.assertEqual(r.check_sent_duplicate("sam@example.com", "s", runner=Runner((0, "<html>", "")))["status"], "unknown")

    def test_header_fetch_failure_downgrades_to_possible(self):
        run = Runner(listing("18c0ffee00000001"), (1, "", "rate limited"))
        self.assertEqual(r.check_sent_duplicate("sam@example.com", "s", runner=run)["status"], "possible")

    def test_bad_address_runs_nothing(self):
        run = Runner(listing("18c0ffee00000001"))
        got = r.check_sent_duplicate("nope", "s", runner=run)
        self.assertEqual(got["status"], "unknown")
        self.assertEqual(run.calls, [])

    def test_only_five_headers_fetched(self):
        ids = [f"18c0ffee0000000{i}" for i in range(9)]
        run = Runner(listing(*ids), *[meta("z@z.com", "other")] * 9)
        r.check_sent_duplicate("sam@example.com", "s", runner=run)
        self.assertLessEqual(len(run.calls), 6)

    def test_only_clear_allows_a_send(self):
        self.assertTrue(r.safe_to_send({"status": "clear"}))
        for s in ("duplicate", "possible", "unknown"):
            self.assertFalse(r.safe_to_send({"status": s}))
        self.assertFalse(r.safe_to_send({}))


class RunnerGate(unittest.TestCase):
    def test_default_runner_refuses_a_write_before_spawning(self):
        for argv in (["gws", "gmail", "users", "messages", "send", "--params", "{}"], ["gws", "drive", "files", "create"],
                     ["gws", "gmail", "+triage", "--json"], ["rm", "-rf", "/"]):
            with self.assertRaises(ValueError, msg=argv):
                r.run_gws(argv)


@unittest.skipUnless(shutil.which("gws") or Path("/opt/homebrew/bin/gws").exists(), "gws not installed")
class DryRunProvesRequestShape(unittest.TestCase):
    """`gws --dry-run` builds the request locally and sends nothing: proves method GET and the URL, offline."""

    def dry(self, argv):
        exe = shutil.which("gws") or "/opt/homebrew/bin/gws"
        p = subprocess.run([exe, *argv[1:], "--dry-run"], capture_output=True, text=True, timeout=20, stdin=subprocess.DEVNULL)
        self.assertEqual(p.returncode, 0, p.stderr[:200])
        return json.loads(p.stdout)

    def test_sent_list_is_a_get_on_messages(self):
        d = self.dry(r.sent_list_argv("sam@example.com", "Q3 plan"))
        self.assertEqual(d["method"], "GET")
        self.assertIn("/gmail/v1/users/me/messages", d["url"])
        self.assertTrue(d["dry_run"])

    def test_sent_get_is_a_get_on_one_message(self):
        d = self.dry(r.sent_get_argv("18c0ffee12345678"))
        self.assertEqual(d["method"], "GET")
        self.assertTrue(d["url"].endswith("/messages/18c0ffee12345678"))


if __name__ == "__main__":
    unittest.main()
