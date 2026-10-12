"""Load brain/profiles.py by path (same pattern the stack uses) without touching it."""
import importlib.util
import sys
from pathlib import Path

_NAME = 'agent_stack_one_mind_profiles'


def profiles():
    mod = sys.modules.get(_NAME)
    if mod is None:
        path = Path(__file__).resolve().parents[1] / 'profiles.py'
        spec = importlib.util.spec_from_file_location(_NAME, path)
        mod = importlib.util.module_from_spec(spec)
        sys.modules[_NAME] = mod
        spec.loader.exec_module(mod)
    return mod
