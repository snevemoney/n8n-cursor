"""F6: retrieval on demand over shared files (reusing store/retrieve), caps, unspeakable files."""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from one_mind import memory as MEM  # noqa: E402
from one_mind.response_runtime import ResponseRuntime  # noqa: E402

SECRET_LINE = 'Rotate the Stripe webhook secret before Friday release window'
STATE_LINE = 'Evens is negotiating the Acme contract renewal this week quietly'


class Memory(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); b = self.base = Path(self.tmp.name)
        (b / 'OPERATOR_PROFILE.md').write_text('# Profile\n\nEvens prefers concise answers about the Acme contract.\n\n' + 'filler words acme ' * 400)
        (b / 'CURRENT_STATE.md').write_text('# State\n\n' + STATE_LINE + '.\n')
        (b / 'SECURITY_TODO.md').write_text('# Sec\n\n- ' + SECRET_LINE + '\n')
        (b / 'TOOLS_AND_REPOS.md').write_text('# Tools\n\nn8n-cursor holds the Jarvis agent stack.\n')

    def tearDown(self):
        self.tmp.cleanup()

    def test_reuses_store_and_retrieve(self):
        self.assertTrue(str(MEM.shared_dir()).endswith('CONTENT/os/shared'))
        self.assertIn('acme', MEM.retrieve().tokens('the Acme contract'))

    def test_on_demand_with_caps(self):
        rows = MEM.worker_context('Acme contract', self.base)
        files = {r['file']: r for r in rows}
        self.assertIn('OPERATOR_PROFILE.md', files); self.assertIn('CURRENT_STATE.md', files)
        self.assertLessEqual(files['OPERATOR_PROFILE.md']['chars'], MEM.CAPS['OPERATOR_PROFILE.md'])
        self.assertFalse(files['CURRENT_STATE.md']['speakable'])
        self.assertEqual(MEM.worker_context('zebra quantum', self.base), [])

    def test_unspeakable_excluded_from_speakable(self):
        for q in ('Acme contract renewal', 'Stripe webhook secret'):
            names = {r['file'] for r in MEM.speakable_context(q, self.base)}
            self.assertFalse(names & {'CURRENT_STATE.md', 'SECURITY_TODO.md'})

    def test_spoken_text_redacted(self):
        guard = lambda t: MEM.redact_unspeakable(t, self.base)
        rr = ResponseRuntime(chat=lambda p: 'I fixed it. ' + SECRET_LINE + '. Also ' + STATE_LINE + '.', memory_guard=guard)
        text = rr.final({'status': 'VERIFIED', 'verified': True, 'accepted': [], 'artifacts': {}}, 'x')
        self.assertEqual(text, 'I fixed it.')
        self.assertNotIn('Stripe', text); self.assertNotIn('negotiating', text)


if __name__ == '__main__':
    unittest.main()
