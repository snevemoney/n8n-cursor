"""Mac review 2026-10-16 acceptance: a long hand chain outlives the 25 s wall, and an Orb disconnect mid-hand does not
cancel the work. Real SSE handler, injected producer; no network."""
import importlib.util
import io
import json
import tempfile
import threading
import time
import unittest
from pathlib import Path
from types import SimpleNamespace


def _hand_open(gen, tool="web_search"):
    return {"ok": True, "verb": tool, "tool": tool, "spoken": "", "partial": True, "done": False, "host": "pipeline",
            "wires": [tool], "gen": gen}


class DetachTest(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location("detach_face", Path(__file__).with_name("serve.py"))
        self.face = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.face)
        self.tmp = tempfile.TemporaryDirectory(prefix="detach-")
        self.addCleanup(self.tmp.cleanup)
        self.face.HIVE = Path(self.tmp.name)
        self.face.TURN_WALL_SEC = 0.05
        self.face.PROVIDER_TEXT_GRACE_SEC = 0.05
        self.pipe = self.face.MOUTH.PIPELINE

    def stream(self, producer, *, client_gone=lambda: False):
        handler = self.face.Handler.__new__(self.face.Handler)
        handler.wfile = io.BytesIO()
        handler.send_response = lambda *a: None
        handler.send_header = lambda *a: None
        handler.end_headers = lambda: None
        handler._client_gone = client_gone
        handler._abort_inflight = lambda: None
        mouth = SimpleNamespace(PIPELINE=self.pipe, apply_turn_iter=lambda *a, **k: producer())
        handler._sse_turn(mouth, "research three sources and compare them", False)
        return [json.loads(b[6:]) for b in handler.wfile.getvalue().decode().split("\n\n") if b.startswith("data: ")]

    def bus(self):
        return self.pipe.load_json(self.face.HIVE / "bus" / "state.json")

    def test_wall_holds_while_a_general_hand_runs(self):
        def producer():
            gen = self.pipe.begin_turn(self.face.HIVE)
            yield _hand_open(gen)
            time.sleep(0.4)  # far past wall + grace (0.1 s)
            yield _hand_open(gen, "workspace_read")
            time.sleep(0.2)
            yield {"ok": True, "verb": "workspace_read", "spoken": "All three sources agree on 42.", "done": True, "gen": gen,
                   "host": "pipeline"}
        events = self.stream(producer)
        finals = [e for e in events if e.get("done")]
        self.assertEqual([e["spoken"] for e in finals], ["All three sources agree on 42."], events)

    def test_heartbeat_keeps_the_hand_open(self):
        beat = self.face.hand_inflight({"verb": "code_run", "partial": True, "host": "pipeline", "spoken": "Still checking.",
                                        "wires": ["code_run", "heartbeat"]})
        self.assertTrue(beat)
        self.assertFalse(self.face.hand_inflight({"verb": "converse", "partial": True, "host": "pipeline", "spoken": ""}))

    def test_disconnect_mid_hand_lets_the_work_finish_on_the_bus(self):
        opened = threading.Event()
        finished = threading.Event()

        def producer():
            gen = self.pipe.begin_turn(self.face.HIVE)
            yield _hand_open(gen)
            opened.set()
            time.sleep(0.3)  # the Orb is gone by now
            self.pipe.BUS_IO.commit_response(self.face.HIVE, gen, lambda bus: {**bus, "spoken": "Compared: they agree.",
                                                                              "job_status": "done"}, terminal=True)
            yield {"ok": True, "verb": "web_search", "spoken": "Compared: they agree.", "done": True, "gen": gen, "host": "pipeline"}
            finished.set()

        self.stream(producer, client_gone=lambda: opened.is_set())
        self.assertTrue(finished.wait(20), "the detached turn did not finish")  # returns at once when done; 5 s flaked in a 20-min full run
        bus = self.bus()
        self.assertEqual(bus["spoken"], "Compared: they agree.")
        self.assertEqual(bus.get("detached_gen"), bus.get("turn_gen"))

    def test_disconnect_while_only_talking_still_cancels(self):
        def producer():
            gen = self.pipe.begin_turn(self.face.HIVE)
            yield {"spoken": "", "done": False, "gen": gen, "partial": True, "host": "pipeline", "verb": "converse"}
            time.sleep(0.2)
            yield {"spoken": "late", "done": True, "gen": gen}
        self.stream(producer, client_gone=lambda: self.pipe.peek_gen(self.face.HIVE) > 0)
        self.assertEqual(self.bus()["spoken"], "Client disconnected. Turn cancelled.")


if __name__ == "__main__":
    unittest.main()
