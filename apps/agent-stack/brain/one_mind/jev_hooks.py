"""Jev mission hooks (SHADOW). Jev classifies/scores; it never owns authority,
execution truth, completion or the response. Output is logged with
authoritative=false and is never read back by the controller's decisions.

Default judge = brain/jev_preflight.advise (offline judgment boundary, no socket).
Tests inject a fake judge.
"""
import importlib.util
import sys
from pathlib import Path

QUESTIONS = ('profile_select', 'failure_classify', 'context_sufficiency', 'stuck', 'acceptance_score')
_NAME = 'agent_stack_one_mind_jev_preflight'


def _preflight():
    mod = sys.modules.get(_NAME)
    if mod is None:
        spec = importlib.util.spec_from_file_location(_NAME, Path(__file__).resolve().parents[1] / 'jev_preflight.py')
        mod = importlib.util.module_from_spec(spec); sys.modules[_NAME] = mod; spec.loader.exec_module(mod)
    return mod


def default_judge(question, evidence):
    return _preflight().advise(str(evidence)[:400], tool='one_mind.' + question, hard_step=False)


class JevAdvisor:
    def __init__(self, judge=None, mode='SHADOW'):
        if mode not in ('SHADOW', 'ADVISORY'):
            raise ValueError('jev_mode_not_allowed_in_missions')
        self.judge = judge or default_judge
        self.mode = mode

    def ask(self, tracer, question, evidence):
        if question not in QUESTIONS:
            raise ValueError('unknown_jev_question')
        try:
            answer = self.judge(question, evidence)
        except Exception as exc:  # advisory: a broken judge never breaks a mission
            answer = {'lane': 'error', 'action': 'NO_ACTION', 'reason': type(exc).__name__}
        if isinstance(answer, dict):
            answer = {k: v for k, v in answer.items() if k not in ('approve', 'authorized', 'complete', 'verified')}
        tracer.jev(question, answer, mode=self.mode)
        return None  # by construction nothing flows back into decisions
