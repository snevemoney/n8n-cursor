"""Single flag helper for One-Mind. Default off."""
import os

FLAG = 'JARVIS_ONE_MIND'


def enabled():
    return os.environ.get(FLAG, '') == '1'


def require_enabled():
    if not enabled():
        raise RuntimeError('one_mind_disabled')
