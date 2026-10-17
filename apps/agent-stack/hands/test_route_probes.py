import importlib.util, tempfile, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("route_probes_t", Path(__file__).with_name("route_probes.py"))
P = importlib.util.module_from_spec(spec); spec.loader.exec_module(P)

class RouteProbes(unittest.TestCase):
    def test_a_constant_pointing_nowhere_is_named(self):
        tmp = tempfile.TemporaryDirectory(dir=Path.home() / "Library/Caches"); self.addCleanup(tmp.cleanup)
        d = Path(tmp.name); here = P.HERE; self.addCleanup(setattr, P, "HERE", here)
        (d / "mod_a.py").write_text("from pathlib import Path\nREAL = Path(%r)\nGONE = Path(%r)\nDAILY = Path(%r)\n"
                                    % (str(d), str(d / "moved-away"), str(d / "later")))
        P.HERE = d
        broken, all_ = P.probe(("mod_a.py",))
        self.assertEqual(broken, ["mod_a.GONE"]); self.assertEqual(all_, ["mod_a.GONE", "mod_a.REAL"])  # DAILY is made on first use

if __name__ == "__main__": unittest.main()
