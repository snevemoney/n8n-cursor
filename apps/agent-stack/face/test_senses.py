#!/usr/bin/env python3
"""Eyes/Watch stay local. Dry paths do not grab or publish."""
from __future__ import annotations

import base64
import importlib.util
import json
import os
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "senses.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_senses", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class SensesTest(unittest.TestCase):
    def test_save_eyes_writes_still(self) -> None:
        os.environ.pop("AGENT_STACK_DRY_EYES", None)
        blob = base64.b64encode(b"jpeg-bytes").decode("ascii")
        with tempfile.TemporaryDirectory(prefix="face-eyes-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            gen = MOD.peek_gen(hive) if hasattr(MOD, "peek_gen") else 0
            if hasattr(MOD, "BUS_IO") and MOD.BUS_IO is not None:
                gen = MOD.BUS_IO.begin_turn(hive)
            out = MOD.save_eyes(f"data:image/jpeg;base64,{blob}", hive=hive, gen=gen)
            dest = Path(out["path"])
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
            self.assertTrue(out["ok"])
            self.assertTrue(dest.is_file())
            self.assertEqual(dest.read_bytes(), b"jpeg-bytes")
            self.assertEqual(bus["eyes"]["path"], str(dest))
            self.assertTrue(bus["eyes"]["active"])
            self.assertTrue(out.get("active"))
            self.assertNotIn("telegram", json.dumps(out).lower())

    def test_dry_watch_does_not_screencapture(self) -> None:
        os.environ["AGENT_STACK_DRY_WATCH"] = "1"
        with tempfile.TemporaryDirectory(prefix="face-watch-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            gen = MOD.BUS_IO.begin_turn(hive) if MOD.BUS_IO is not None else 1
            out = MOD.run_watch(hive=hive, gen=gen)
            see = hive / "bus" / "see.jpg"
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        os.environ.pop("AGENT_STACK_DRY_WATCH", None)
        self.assertTrue(out["ok"])
        self.assertTrue(out.get("dry"))
        self.assertFalse(out.get("armed"))
        self.assertFalse(bus["watch"]["armed"])
        self.assertFalse(see.exists())

    def test_pack_senses_names_paths(self) -> None:
        text = MOD.pack_senses(
            {
                "eyes": {"path": "/tmp/eyes.jpg", "captured_at": "2026-09-12T00:00:00Z"},
                "watch": {
                    "safari": {"title": "Hive", "url": "https://evenslouis.ca"},
                    "screen": {"path": "/tmp/see.jpg"},
                },
            }
        )
        self.assertIn("Camera still: /tmp/eyes.jpg", text)
        self.assertIn("Evens's screen image: /tmp/see.jpg", text)
        self.assertIn("Hive", text)
        self.assertNotIn("telegram", text.lower())

    def test_save_drop_never_executes(self) -> None:
        with tempfile.TemporaryDirectory(prefix="face-drop-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            src = Path(tmp) / "note.txt"
            src.write_text("hello from drop", encoding="utf-8")
            gen = MOD.BUS_IO.begin_turn(hive) if MOD.BUS_IO is not None else 1
            out = MOD.save_drop([str(src)], hive=hive, gen=gen)
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        self.assertTrue(out["ok"])
        self.assertIn("note.txt", out["spoken"])
        self.assertEqual(bus["drop"]["name"], "note.txt")
        self.assertEqual(bus["drop"]["text"], "hello from drop")
        self.assertEqual(out.get("text"), "hello from drop")
        self.assertEqual(bus["turns"][-1]["user"], "[dropped note.txt]")
        self.assertIn("save_drop", Path(__file__).resolve().parent.joinpath("senses.py").read_text(encoding="utf-8"))
        self.assertNotIn("os.system", Path(__file__).resolve().parent.joinpath("senses.py").read_text(encoding="utf-8"))

    def test_watch_arm_roundtrip(self) -> None:
        with tempfile.TemporaryDirectory(prefix="face-watch-arm-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            gen = MOD.BUS_IO.begin_turn(hive) if MOD.BUS_IO is not None else 1
            on = MOD.set_watch_arm(True, hive=hive, gen=gen, evens=True)
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
            off = MOD.set_watch_arm(False, hive=hive, gen=gen)
        self.assertTrue(on["armed"])
        self.assertTrue(bus["watch"]["armed"])
        self.assertTrue(bus["watch"].get("held"))
        self.assertFalse(off["armed"])
        self.assertIn("Watch off", off["spoken"])

    def test_dry_watch_preserves_arm_without_rearm_flag(self) -> None:
        os.environ["AGENT_STACK_DRY_WATCH"] = "1"
        try:
            with tempfile.TemporaryDirectory(prefix="face-watch-preserve-") as tmp:
                hive = Path(tmp)
                (hive / "bus").mkdir()
                gen = MOD.BUS_IO.begin_turn(hive) if MOD.BUS_IO is not None else 1
                MOD.set_watch_arm(True, hive=hive, gen=gen, evens=True)
                out = MOD.run_watch(hive=hive, grab=True, gen=gen)
                bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
        finally:
            os.environ.pop("AGENT_STACK_DRY_WATCH", None)
        self.assertTrue(out.get("dry"))
        self.assertTrue(out.get("armed"))
        self.assertTrue(bus["watch"]["armed"])
        self.assertTrue(bus["watch"].get("held"))

    def test_vision_stills_skip_inactive_eyes(self) -> None:
        with tempfile.TemporaryDirectory(prefix="face-eyes-off-") as tmp:
            hive = Path(tmp)
            still = Path(tmp) / "eyes.jpg"
            still.write_bytes(b"jpeg-bytes")
            live = {
                "eyes": {"path": str(still), "active": True},
                "watch": {"screen": {}},
                "drop": {},
            }
            dead = {
                "eyes": {"path": str(still), "active": False},
                "watch": {"screen": {}},
                "drop": {},
            }
            self.assertEqual(MOD.vision_stills(live), [still])
            self.assertEqual(MOD.vision_stills(dead), [])
            gen = MOD.BUS_IO.begin_turn(hive) if MOD.BUS_IO is not None else 1
            off = MOD.set_eyes_active(False, hive=hive, gen=gen)
            bus = json.loads((hive / "bus" / "state.json").read_text(encoding="utf-8"))
            bus["eyes"]["path"] = str(still)
            self.assertFalse(off["active"])
            self.assertFalse(bus["eyes"]["active"])
            self.assertEqual(MOD.vision_stills(bus), [])
            packed = MOD.pack_senses(
                {"eyes": {"path": str(still), "active": False, "captured_at": "2026-09-12T00:00:00Z"}}
            )
            self.assertNotIn("Camera still:", packed)

    def test_vision_stills_skip_disarmed_watch(self) -> None:
        with tempfile.TemporaryDirectory(prefix="face-watch-off-") as tmp:
            still = Path(tmp) / "see.jpg"
            still.write_bytes(b"jpeg-bytes")
            armed = {
                "eyes": {},
                "watch": {"armed": True, "screen": {"path": str(still)}},
                "drop": {},
            }
            leftover = {
                "eyes": {},
                "watch": {"armed": False, "screen": {"path": str(still)}},
                "drop": {},
            }
            self.assertEqual(MOD.vision_stills(armed), [still])
            self.assertEqual(MOD.vision_stills(leftover), [])


if __name__ == "__main__":
    unittest.main()

class WatchLedgerContinuityTest(unittest.TestCase):
    def frame(self):
        return {"ok":True,"frame_id":"fixture-frame","state":{"app":"Calculator","window":"","title":"","url":"","text_binding":{"value_sha256":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","selection":{"location":0,"length":0}}},"screen":{"path":"","bytes":12},"safari":{},"spoken":"Observed Calculator"}
    def test_reobservation_preserves_receipts_in_dry_and_observer_paths(self):
        from unittest.mock import patch
        for dry in ('0','1'):
            with self.subTest(dry=dry),tempfile.TemporaryDirectory() as tmp:
                hive=Path(tmp);gen=MOD.BUS_IO.begin_turn(hive)
                ledger={'reserved':{'phase':'reserved','gen':gen,'app':'Calculator'},'uncertain':{'execution_uncertain':True},'recorded':{'transition':False,'verification':{'task_verified':False}}}
                MOD.BUS_IO.mutate_bus(hive,lambda b:b|{'watch':{'armed':True,'allow':['Calculator'],'ledger':ledger}})
                with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':dry}),patch.object(MOD.SEE,'snapshot',return_value=self.frame()):
                    MOD.run_watch(hive=hive,gen=gen);MOD.run_watch(hive=hive,gen=gen)
                bus=json.loads((hive/'bus'/'state.json').read_text())
                self.assertEqual(bus['watch'].get('ledger'),ledger)
                self.assertEqual(bus['watch']['allow'],['Calculator'])

    def test_receipt_added_during_capture_uses_latest_locked_state(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);gen=MOD.BUS_IO.begin_turn(hive)
            def capture(**kwargs):
                MOD.BUS_IO.mutate_bus(hive,lambda b:b|{'watch':b.get('watch',{})|{'ledger':{'arrived-during-capture':{'execution_uncertain':True}}}})
                return self.frame()
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'0'}),patch.object(MOD.SEE,'snapshot',side_effect=capture):
                MOD.run_watch(hive=hive,gen=gen)
            bus=json.loads((hive/'bus'/'state.json').read_text())
            self.assertIn('arrived-during-capture',bus['watch'].get('ledger',{}))

    def test_actual_stroke_reobservation_does_not_replay_input(self):
        from unittest.mock import patch
        path=SCRIPT.parent.parent/'hands'/'watch_frame.py'
        spec=importlib.util.spec_from_file_location('ledger_stroke',path);frame=importlib.util.module_from_spec(spec);spec.loader.exec_module(frame)
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);gen=MOD.BUS_IO.begin_turn(hive)
            MOD.set_watch_arm(True,hive=hive,gen=gen,evens=True);MOD.set_watch_allow('Calculator',always=True,hive=hive,gen=gen)
            calls=[]
            def hid(*args,**kwargs):calls.append(True);return {'ok':True,'op':'type'}
            def observe(**kwargs):return MOD.run_watch(hive=hive,gen=gen)
            from types import SimpleNamespace
            text_states=iter([{'value':'','selection':{'location':0,'length':0}},
                              {'value':'unique fixture','selection':{'location':14,'length':0}}])
            hand=SimpleNamespace(read_focused_text=lambda focus:next(text_states))
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'0'}),patch.object(MOD.SEE,'snapshot',return_value=self.frame()),patch.object(frame,'_see',return_value=hand):
                first=frame.commit_watch_stroke(hive,gen,self.frame(),{'op':'type','text':'unique fixture'},perceive=observe,hid_fn=hid)
                observe()
                second=frame.commit_watch_stroke(hive,gen,self.frame(),{'op':'type','text':'unique fixture'},perceive=observe,hid_fn=hid)
            self.assertTrue(first['hid'],first)
            self.assertEqual(calls,[True])
            self.assertTrue(second['ledger'],second)

class WatchObserverReloadTest(unittest.TestCase):
    def test_driver_source_change_reloads_observer_before_next_capture(self):
        from unittest.mock import patch,Mock
        from types import SimpleNamespace
        old={"ok":True,"frame_id":"old","state":{"app":"Calculator"},"screen":{},"safari":{}}
        new={"ok":True,"frame_id":"new","state":{"app":"Calculator"},"screen":{},"safari":{}}
        reader=Mock(return_value=new)
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);gen=MOD.BUS_IO.begin_turn(hive)
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'0'}),patch.object(MOD,'SEE',MOD.SEE),patch.object(MOD.SEE,'snapshot',return_value=old) as previous,patch.object(MOD,'_see_stamp',side_effect=[('old',),('new',)],create=True),patch.object(MOD,'_SEE_STAMP',('old',),create=True),patch.object(MOD,'_load_see',return_value=SimpleNamespace(snapshot=reader)) as load:
                try:
                    first=MOD.run_watch(hive=hive,gen=gen);second=MOD.run_watch(hive=hive,gen=gen)
                    self.assertEqual(first['frame_id'],'old')
                    self.assertEqual(second['frame_id'],'new')
                    self.assertEqual(previous.call_count,1)
                    reader.assert_called_once()
                    load.assert_called_once()
                finally:
                    # Restore imported observer for subsequent tests.
                    if hasattr(MOD,'_SEE_STAMP'):MOD._SEE_STAMP=('old',)

    def test_failed_reload_never_uses_old_observer_or_action_frame(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            hive=Path(tmp);gen=MOD.BUS_IO.begin_turn(hive)
            MOD.BUS_IO.mutate_bus(hive,lambda b:b|{'watch':{'armed':True,'ledger':{'uncertain':{'execution_uncertain':True}}}})
            with patch.dict(os.environ,{'AGENT_STACK_DRY_WATCH':'0'}),patch.object(MOD.SEE,'snapshot') as previous,patch.object(MOD,'_see_stamp',return_value=('new',),create=True),patch.object(MOD,'_SEE_STAMP',('old',),create=True),patch.object(MOD,'_load_see',side_effect=SyntaxError('PRIVATE_SOURCE_BODY')):
                out=MOD.run_watch(hive=hive,gen=gen)
                self.assertFalse(out['ok'],out)
                self.assertFalse(out['frame_id'],out)
                previous.assert_not_called()
                self.assertNotIn('PRIVATE_SOURCE_BODY',out['spoken'])
            bus=json.loads((hive/'bus'/'state.json').read_text())
            self.assertIn('uncertain',bus['watch']['ledger'])

    def test_observer_loader_uses_current_source_over_same_second_bytecode(self):
        import py_compile
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            stack=Path(tmp);hands=stack/'hands';hands.mkdir();source=hands/'see.py'
            before='def snapshot(**kwargs): return {"frame_id":"old"}\n'
            source.write_text(before)
            py_compile.compile(str(source),doraise=True,invalidation_mode=py_compile.PycInvalidationMode.TIMESTAMP)
            initial=source.stat()
            source.write_text(before.replace('old','new'))
            # Python timestamp bytecode matches whole seconds and size, while
            # the actual source can change within that same second.
            os.utime(source,ns=(initial.st_atime_ns,initial.st_mtime_ns))
            with patch.object(MOD,'STACK',stack):
                loaded=MOD._load_see()
            self.assertEqual(loaded.snapshot()['frame_id'],'new')

    def test_source_identity_detects_edit_with_preserved_timestamp_and_size(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as tmp:
            stack=Path(tmp);hands=stack/'hands';hands.mkdir()
            source=hands/'see.py';source.write_text('old')
            (hands/'watch_frame.py').write_text('frame')
            initial=source.stat()
            with patch.object(MOD,'STACK',stack):
                before=MOD._see_stamp()
                source.write_text('new');os.utime(source,ns=(initial.st_atime_ns,initial.st_mtime_ns))
                after=MOD._see_stamp()
            self.assertNotEqual(before,after)
