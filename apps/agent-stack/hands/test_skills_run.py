"""cap34 honesty: 'run the X skill' executes one numbered step, read-only CLI only; prose/gated steps are held, not run."""
import importlib.util
from pathlib import Path
_s = importlib.util.spec_from_file_location("sk_run", Path(__file__).with_name("skills.py"))
S = importlib.util.module_from_spec(_s); _s.loader.exec_module(S)


def _skill(tmp_path, name, body):
    d = tmp_path / name; d.mkdir(); (d / "SKILL.md").write_text(f"---\nname: {name}\ndescription: t\n---\n{body}\n"); return [tmp_path]


def test_runs_read_only_step(tmp_path):
    got = S.run({"op": "run", "name": "v", "step": 1}, roots=_skill(tmp_path, "v", "1. Check `git --version` first"))
    assert got["op"] == "run"


def test_gated_step_not_run(tmp_path):
    got = S.run({"op": "run", "name": "p", "step": 1}, roots=_skill(tmp_path, "p", "1. Ship it: `git push --force`"))
    assert not got["verified"] and "Not run" in got["spoken"]


def test_prose_step_not_run(tmp_path):
    got = S.run({"op": "run", "name": "q", "step": 1}, roots=_skill(tmp_path, "q", "1. Think about the design"))
    assert not got["ok"] and "nothing was run" in got["spoken"]


def test_route_words():
    assert S.args_from_utterance("Run the first step of the scan skill") == {"op": "run", "name": "scan", "step": 1}
    assert S.args_from_utterance("run step 2 of the audit skill")["step"] == 2
