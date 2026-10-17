"""Regression (mission 01e8079 child c9458, 10:09 ET): a guard refusal before a write blocked the coding
worker and every resume replayed the same refused write. Now the builder is told why and re-plans (max 3)."""
import unittest
from pathlib import Path
SRC=(Path(__file__).resolve().parent/'agent_tools.py').read_text()
class GuardReplan(unittest.TestCase):
    def test_refusal_replans_before_pending(self):
        i=SRC.index('guard("before_write", {name:content})');j=SRC.index('state["phase"] = "pending_write";save()')
        self.assertLess(i,j,'guard must run before the write is recorded as pending')
        block=SRC[i:j]
        for needle in ('host_configuration_guard_rejected_before_write','guard_refusals','>= 3','CODE_GUARD_REFUSAL','phase="model"','raise'):
            self.assertIn(needle,block)
    def test_message_names_safe_alternative(self):
        self.assertIn('static imports',SRC);self.assertIn('{name}',SRC[SRC.index('CODE_GUARD_REFUSAL=('):][:600])
if __name__=='__main__':unittest.main()
