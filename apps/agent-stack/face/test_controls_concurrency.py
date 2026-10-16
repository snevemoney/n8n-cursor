"""Concurrency audit 2026-10-16: Stop works on every turn, and Watch writes never roll back a newer turn generation."""
import importlib.util
import json
import tempfile
import threading
import unittest
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]


def _load(name, rel):
    spec = importlib.util.spec_from_file_location(name, STACK / rel)
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod


class ControlsConcurrency(unittest.TestCase):
    def setUp(self):
        self.C = _load("agent_stack_controls_conc_test", "face/controls.py")
        self.B = self.C._bus_io()
        self.C.reset_book()
        self.hive = Path(tempfile.mkdtemp()); (self.hive / "bus").mkdir()

    def _gen(self, n):
        self.B.mutate_bus(self.hive, lambda b: dict(b, turn_gen=n, speak="speaking"))

    def test_stop_speaking_works_on_every_turn(self):
        for n in (1, 2, 3):
            self._gen(n)
            got = self.C.cancel_once("speak", hive=self.hive)
            self.assertFalse(got["already"], n)
            self.assertEqual(self.B.load_json(self.hive / "bus" / "state.json")["speak"], "stopped")
        self.assertTrue(self.C.cancel_once("speak", hive=self.hive)["already"])  # same turn twice is still one stop

    def test_watch_write_never_rolls_back_turn_gen(self):
        self._gen(5)
        snapshot = self.C._read_bus(self.hive)
        self._gen(9)  # a new turn lands while the watch code holds an old snapshot
        snapshot["watch_seq"] = 1
        self.C._write_bus(self.hive, snapshot)
        bus = self.B.load_json(self.hive / "bus" / "state.json")
        self.assertEqual(bus["turn_gen"], 9); self.assertEqual(bus["watch_seq"], 1)

    def test_parallel_turns_and_watch_patches_lose_no_generation(self):
        def turns():
            for _ in range(150):
                self.B.mutate_bus(self.hive, lambda b: dict(b, turn_gen=int(b.get("turn_gen") or 0) + 1))

        def patches():
            for i in range(150):
                self.C._patch(self.hive, lambda b: b.__setitem__("speak", f"s{i}"))
        ts = [threading.Thread(target=turns), threading.Thread(target=patches)]
        [t.start() for t in ts]; [t.join() for t in ts]
        self.assertEqual(self.B.load_json(self.hive / "bus" / "state.json")["turn_gen"], 150)

    def test_each_request_thread_finds_its_own_gen(self):
        arrival = self.B.bus_gen(self.B.load_json(self.hive / "bus" / "state.json"))
        got, ready = {}, threading.Barrier(2)

        def request(name):
            ready.wait()
            gen = self.B.begin_turn(self.hive)
            got[name] = (gen, self.B.gen_for_thread(self.hive, threading.get_ident(), arrival))
        ts = [threading.Thread(target=request, args=(n,)) for n in ("a", "b")]
        [t.start() for t in ts]; [t.join() for t in ts]
        for name, (opened, found) in got.items():
            self.assertEqual(opened, found, name)  # arrival+1 would be wrong for one of the two
        self.assertEqual({g for g, _ in got.values()}, {arrival + 1, arrival + 2})

    def test_corrupt_bus_is_quarantined_not_wiped(self):
        path = self.hive / "bus" / "state.json"
        path.write_bytes(b"\xff\xfe not json")
        self.B.mutate_bus(self.hive, lambda b: dict(b, turn_gen=1))
        self.assertTrue(list((self.hive / "bus").glob("state.json.corrupt-*")))
        self.assertEqual(json.loads(path.read_text())["turn_gen"], 1)


if __name__ == "__main__":
    unittest.main()
