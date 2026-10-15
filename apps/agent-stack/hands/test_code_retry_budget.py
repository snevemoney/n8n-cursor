"""Mission 01e8079 (10-15 10:29 ET) died after 170 s: one guard refusal and one over-long reply used two of the four
working rounds. Rejected replies get up to REPLY_RETRIES free rounds; the total stays bounded."""
import json
import pytest
from hands.test_coding_resume import coding

GOOD = json.dumps({'files': {'a.py': 'def answer(): return 43\n',
                             'test_check.py': 'import unittest\nfrom a import answer\nclass Check(unittest.TestCase):\n'
                                              ' def test_value(self):self.assertEqual(answer(),43)\n'},
                   'test_cmd': 'python3 -m unittest discover -v', 'commit_message': 'fixture'})


@pytest.mark.parametrize('durable', [True, False])
def test_rejected_reply_does_not_spend_the_last_working_round(coding, monkeypatch, durable):
    hand, root, args, calls, saved, save, repo = coding
    monkeypatch.setattr(hand, 'MAX_ITERS', 1)
    replies = ['{"files":{"x.py":"truncated', GOOD]
    monkeypatch.setattr(hand, 'llm', lambda *a: (replies.pop(0), 'configured-model'))
    got = hand.run(args, checkpoint=save) if durable else hand.run(args)
    assert got['ok'], got
    assert calls['commits'] == 1
