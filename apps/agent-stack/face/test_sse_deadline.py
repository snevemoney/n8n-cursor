"""Face SSE must finish a stalled talk after its existing grace; isolated hive only."""
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import threading
import unittest
from types import SimpleNamespace

SOURCE = Path(os.environ.get('JARVIS_FACE_SOURCE') or Path(__file__).with_name('serve.py'))

class StreamDeadlineTest(unittest.TestCase):
    def test_stalled_talk_closes_after_grace_and_next_turn_recovers(self):
        self.check_stalled_turn()

    def test_partial_sentence_does_not_keep_stream_open_forever(self):
        self.check_stalled_turn(partial_sentence=True)

    def check_stalled_turn(self, partial_sentence=False):
        spec = importlib.util.spec_from_file_location('sse_deadline_face', SOURCE)
        face = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(face)
        pipe = face.MOUTH.PIPELINE
        with tempfile.TemporaryDirectory(prefix='sse-deadline-') as tmp:
            face.HIVE = Path(tmp)
            face.TURN_WALL_SEC = 0.05
            face.PROVIDER_TEXT_GRACE_SEC = 0.05
            release = threading.Event()
            entered = threading.Event()
            def stalled(*args, **kwargs):
                gen = pipe.begin_turn(face.HIVE)
                yield {'verb':'converse','host':'pipeline','spoken':'First sentence.' if partial_sentence else '', 'partial':True,'done':False,'gen':gen}
                entered.set()
                release.wait(3)
                yield {'verb':'converse','spoken':'Late stale answer.','done':True,'gen':gen}
            def handler():
                h = face.Handler.__new__(face.Handler)
                h.wfile = io.BytesIO()
                h.send_response = lambda *a:None
                h.send_header = lambda *a:None
                h.end_headers = lambda:None
                h._client_gone = lambda:False
                h._abort_inflight = lambda:None
                return h
            old = handler()
            mouth = SimpleNamespace(PIPELINE=pipe,apply_turn_iter=stalled)
            thread = threading.Thread(target=lambda:old._sse_turn(mouth,'blocked talk',False),daemon=True)
            thread.start()
            try:
                self.assertTrue(entered.wait(1))
                thread.join(0.8)
                self.assertFalse(thread.is_alive(),'live producer bypassed the wall and grace')
                body=old.wfile.getvalue()
                self.assertIn(face.TALK_DARK.encode(),body)
                self.assertNotIn(b'Late stale answer',body)
                self.assertTrue(old.close_connection)
                gen=pipe.peek_gen(face.HIVE)
                self.assertTrue(pipe.turn_cancelled(face.HIVE,gen))
                def ready(*args,**kwargs):
                    gen=pipe.begin_turn(face.HIVE)
                    yield {'verb':'converse','spoken':'Fresh next answer.','done':True,'gen':gen}
                fresh=handler()
                fresh._sse_turn(SimpleNamespace(PIPELINE=pipe,apply_turn_iter=ready),'next question',False)
                self.assertIn(b'Fresh next answer',fresh.wfile.getvalue())
                self.assertNotIn(face.TALK_DARK.encode(),fresh.wfile.getvalue())
                release.set()
                thread.join(1)
                self.assertNotIn(b'Late stale answer',old.wfile.getvalue())
            finally:
                release.set()
                thread.join(1)

if __name__=='__main__': unittest.main()
