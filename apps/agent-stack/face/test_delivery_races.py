"""Deterministic generation and terminal delivery checks against the real SSE handler."""
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import threading
from types import SimpleNamespace
import unittest
from unittest.mock import patch
from contextlib import ExitStack

class DeliveryRaceTest(unittest.TestCase):
    def run_stream(self, producer=None, replace_after_partial=False, watch_receipt=None, client_gone=False):
        spec = importlib.util.spec_from_file_location("delivery_race_face", Path(__file__).with_name("serve.py"))
        face = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(face)
        with tempfile.TemporaryDirectory(prefix="delivery-race-") as tmp:
            face.HIVE = Path(tmp)
            pipe = face.MOUTH.PIPELINE
            handler = face.Handler.__new__(face.Handler)
            class Sink(io.BytesIO):
                flushes = 0
                def flush(self):
                    self.flushes += 1
                    if replace_after_partial and self.flushes == 2:
                        pipe.begin_turn(face.HIVE)
            handler.wfile = Sink()
            face.TURN_WALL_SEC = 0.05
            face.PROVIDER_TEXT_GRACE_SEC = 0.05
            handler.send_response = lambda *a: None
            handler.send_header = lambda *a: None
            handler.end_headers = lambda: None
            handler._client_gone = lambda: client_gone and pipe.peek_gen(face.HIVE) > 0
            handler._abort_inflight = lambda: None
            with ExitStack() as stack:
                mouth = SimpleNamespace(PIPELINE=pipe, apply_turn_iter=lambda *a, **k: producer(pipe, face.HIVE))
                if watch_receipt is not None:
                    pipe.mutate_bus(face.HIVE, lambda bus: {**bus, "watch": {"armed": True}})
                    stack.enter_context(patch.object(pipe, "watch_owns_turn", return_value=True))
                    stack.enter_context(patch.object(pipe, "run_watch_loop", return_value=watch_receipt))
                    mouth = face.MOUTH
                handler._sse_turn(mouth, "click next" if watch_receipt is not None else "race request", False)
            self.last_bus = pipe.load_json(face.HIVE / "bus" / "state.json")
            return [json.loads(block[6:]) for block in handler.wfile.getvalue().decode().split("\n\n") if block.startswith("data: ")]

    def test_actual_watch_mouth_failure_reaches_face_stream(self):
        receipt = {"ok": False, "spoken": "Postcondition failed.", "stroke": {"ok": False, "why": "verification_failed"}}
        events = self.run_stream(watch_receipt=receipt)
        finals = [event for event in events if event.get("done")]
        self.assertEqual(len(finals), 1, events)
        self.assertFalse(finals[0]["ok"])
        self.assertEqual(finals[0]["execution"], receipt)
        self.assertIn("Postcondition failed.", finals[0]["spoken"])

    def test_producer_exception_delivers_named_terminal_failure(self):
        def producer(pipe, hive):
            pipe.begin_turn(hive)
            raise RuntimeError("controlled fixture failure")
            yield  # generator boundary
        events = self.run_stream(producer)
        finals = [event for event in events if event.get("done")]
        self.assertEqual(len(finals), 1, events)
        self.assertFalse(finals[0]["ok"])
        self.assertEqual(finals[0]["outcome"], "WIRE_FAILURE")

    def test_published_result_survives_later_producer_exception(self):
        def producer(pipe, hive):
            gen = pipe.begin_turn(hive)
            pipe.BUS_IO.commit_response(hive, gen, lambda bus: {**bus, "utterance": "race request", "spoken": "Published answer.", "job_status": "done"}, terminal=True)
            raise RuntimeError("after publication")
            yield
        events = self.run_stream(producer)
        finals = [event for event in events if event.get("done")]
        self.assertEqual(len(finals), 1, events)
        self.assertEqual(finals[0]["spoken"], "Published answer.")
        self.assertTrue(finals[0]["ok"])

    def test_superseded_exception_cannot_deliver_wall(self):
        def producer(pipe, hive):
            pipe.begin_turn(hive)
            pipe.begin_turn(hive)
            raise RuntimeError("old fixture failure")
            yield
        events = self.run_stream(producer)
        self.assertFalse(any(event.get("done") for event in events), events)

    def test_old_generation_completes_after_new_turn(self):
        def producer(pipe, hive):
            old = pipe.begin_turn(hive)
            pipe.begin_turn(hive)
            yield {"spoken": "Old stale answer.", "gen": old, "done": True, "verb": "converse"}
        events = self.run_stream(producer)
        self.assertFalse(any(e.get("spoken") == "Old stale answer." for e in events))

    def test_superseded_pending_worker_cannot_emit_watchdog_wall(self):
        def producer(pipe, hive):
            gen = pipe.begin_turn(hive)
            yield {"spoken": "", "gen": gen, "done": False, "partial": True, "verb": "converse"}
            threading.Event().wait(0.3)
            yield {"spoken": "Late old candidate.", "gen": gen, "done": True, "verb": "converse"}
        events = self.run_stream(producer, replace_after_partial=True)
        self.assertFalse(any(e.get("done") for e in events), events)
        self.assertFalse(any("dark" in e.get("spoken", "") for e in events), events)

    def test_late_completion_after_abort(self):
        def producer(pipe, hive):
            old = pipe.begin_turn(hive)
            pipe.cancel_turn_scoped(hive, old)
            yield {"spoken": "Late cancelled answer.", "gen": old, "done": True, "verb": "converse"}
        events = self.run_stream(producer)
        self.assertFalse(any(e.get("spoken") == "Late cancelled answer." for e in events))

    def test_duplicate_final_and_retry_candidate_deliver_once(self):
        def producer(pipe, hive):
            gen = pipe.begin_turn(hive)
            for text in ("First final.", "First final.", "Retry candidate."):
                yield {"spoken": text, "gen": gen, "done": True, "verb": "converse"}
        events = self.run_stream(producer)
        self.assertEqual([e["spoken"] for e in events if e.get("done")], ["First final."])

    def test_partial_then_final_delivers_one_terminal(self):
        def producer(pipe, hive):
            gen = pipe.begin_turn(hive)
            yield {"spoken": "First sentence.", "gen": gen, "done": False, "partial": True, "verb": "converse"}
            yield {"spoken": "First sentence. Full answer.", "gen": gen, "done": True, "verb": "converse"}
        events = self.run_stream(producer)
        self.assertEqual(sum(bool(e.get("done")) for e in events), 1)
        self.assertEqual(events[-1]["spoken"], "First sentence. Full answer.")


    def test_client_disconnect_is_not_provider_failure(self):
        def producer(pipe, hive):
            gen = pipe.begin_turn(hive)
            yield {"spoken": "", "done": False, "gen": gen}
        self.run_stream(producer, client_gone=True)
        self.assertEqual(self.last_bus["spoken"], "Client disconnected. Turn cancelled.")
        self.assertFalse(self.last_bus["response_ok"])
        self.assertEqual(self.last_bus["response_ok_gen"], self.last_bus["turn_gen"])

if __name__ == "__main__": unittest.main()
