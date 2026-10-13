import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import methods_router as r  # noqa: E402

FAKE = "sk-" + "Zy9Xw8Vu7Ts6Rq5Po4Nm"


def test_router_intercepts_secret_and_never_echoes(tmp_path):
    assert r.wants(f"here is my key {FAKE}") and not r.wants("what time is it")
    out = r.run(f"here is my key {FAKE}", env_file=tmp_path / ".env.local")
    assert out["ok"] and FAKE not in out["spoken"] and "rotate" in out["spoken"] and out["sent"] is False
    assert FAKE in (tmp_path / ".env.local").read_text()
