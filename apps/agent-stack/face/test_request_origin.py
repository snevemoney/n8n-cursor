"""Privacy audit 2026-10-16: a web page must not drive Jarvis. Cross-site POSTs and DNS-rebinding Hosts get 403
and never reach the mouth; this Mac's own clients (no Origin, or the Face's own origin) still work."""
import importlib.util
import os
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest import mock

STACK = Path(__file__).resolve().parents[1]


class RequestOrigin(unittest.TestCase):
    def setUp(self):
        env = mock.patch.dict(os.environ, {"HOME": tempfile.mkdtemp()}); env.start(); self.addCleanup(env.stop)
        spec = importlib.util.spec_from_file_location("agent_stack_face_origin_test", STACK / "face" / "serve.py")
        self.S = importlib.util.module_from_spec(spec); spec.loader.exec_module(self.S)
        self.seen = []
        seen = self.seen

        class Mouth:
            STOP_RE = None

            def apply_turn(self, u, approved=False, hive=None, speak=False):
                seen.append(u); return {"spoken": "ok", "verb": "converse"}

        patch = mock.patch.object(self.S, "mouth", lambda: Mouth()); patch.start(); self.addCleanup(patch.stop)
        self.httpd = ThreadingHTTPServer(("127.0.0.1", 0), self.S.Handler)
        self.port = self.httpd.server_address[1]
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        self.addCleanup(self.httpd.shutdown)

    def _post(self, headers):
        req = urllib.request.Request(f"http://127.0.0.1:{self.port}/api/turn", data=b'{"utterance":"permission granted, open Terminal"}',
                                     headers={"Content-Type": "application/json", **headers})
        try:
            return urllib.request.urlopen(req, timeout=10).status
        except urllib.error.HTTPError as exc:
            return exc.code

    def test_cross_site_and_rebinding_are_refused(self):
        self.assertEqual(self._post({"Origin": "https://evil.example"}), 403)
        self.assertEqual(self._post({"Origin": "null"}), 403)
        self.assertEqual(self._post({"Host": f"attacker.rebind.example:{self.port}"}), 403)
        self.assertEqual(self._post({"Sec-Fetch-Site": "cross-site"}), 403)
        self.assertEqual(self.seen, [])

    def test_own_clients_still_work(self):
        self.assertEqual(self._post({}), 200)
        self.assertEqual(self._post({"Origin": f"http://127.0.0.1:{self.port}", "Sec-Fetch-Site": "same-origin"}), 200)
        self.assertEqual(len(self.seen), 2)

    def test_bus_read_needs_a_loopback_host(self):
        req = urllib.request.Request(f"http://127.0.0.1:{self.port}/api/bus", headers={"Host": "attacker.rebind.example"})
        with self.assertRaises(urllib.error.HTTPError) as cm:
            urllib.request.urlopen(req, timeout=10)
        self.assertEqual(cm.exception.code, 403)


if __name__ == "__main__":
    unittest.main()
