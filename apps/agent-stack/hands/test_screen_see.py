"""screen_see: vision text is not independent task proof."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parent / "screen_see.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_screen_see", SCRIPT)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class ScreenSeeTaskProof(unittest.TestCase):
    def test_successful_description_is_not_task_verified(self) -> None:
        mod = _load()
        with tempfile.TemporaryDirectory(prefix="screen-see-") as tmp:
            hive = Path(tmp)
            shot = hive / "still.png"
            shot.write_bytes(b"\x89PNG\r\n\x1a\n" + b"\x00" * 32)

            def fake_grab(*_a, **_k):
                return {"ok": True, "path": str(shot), "source": "fixture"}

            with mock.patch.object(mod, "_data_url", return_value="data:image/png;base64,AAAA"):
                got = mod.run(
                    {},
                    hive=hive,
                    grab_fn=fake_grab,
                    vision_fn=lambda *_a, **_k: "A notes window is open.",
                )
            self.assertTrue(got["ok"])
            self.assertIn("notes", got["spoken"].lower())
            self.assertFalse(got["task_verified"], "API/vision OK must not claim task done")


if __name__ == "__main__":
    unittest.main()
