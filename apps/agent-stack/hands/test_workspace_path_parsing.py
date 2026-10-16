"""Regression: embedded paths retain root/home/relative prefixes; scope stays enforced."""
import tempfile
import unittest
from pathlib import Path
from hands import workspace_read as W

class EmbeddedPaths(unittest.TestCase):
    def test_absolute_embedded_path_reads_actual_file(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d).resolve(); file=root/'plan.py'; file.write_text('OBSERVED_CONTENT = 7341\n')
            utterance=f'For this diagnostic, compare {file} with another file.'
            args=W.args_from_utterance(utterance)
            self.assertEqual(args['path'],str(file))
            result=W.run_requested(args,utterance,roots=[root])
            self.assertTrue(result['ok']);self.assertIn('7341',result['text'])
    def test_compound_reads_respect_selected_targets_and_existing_roots(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d).resolve(); one=root/'one.py';two=root/'two.py'
            one.write_text('ONE = 17');two.write_text('TWO = 29')
            utterance=f'Read {one} and {two} and compare their actual contents.'
            self.assertIsNone(W.requested_path(utterance))
            self.assertEqual(W.args_from_utterance(utterance)['path'],str(one))
            for file,content in [(one,'ONE = 17'),(two,'TWO = 29')]:
                got=W.run_requested({'op':'read','path':str(file)},utterance,roots=[root])
                self.assertEqual(got['text'],content)
            outside=root/'outside';outside.mkdir()
            denied=W.run_requested({'op':'read','path':str(one)},utterance,roots=[outside])
            self.assertFalse(denied['ok'])
    def test_single_existing_spaced_path_retains_exact_target(self):
        with tempfile.TemporaryDirectory() as d:
            file=Path(d).resolve()/'notes.py and context.txt';file.write_text('literal spaced filename')
            utterance=f'Read {file}'
            self.assertEqual(W.requested_path(utterance),file)
            self.assertEqual(W.run_requested({},utterance,roots=[])['text'],'literal spaced filename')
    def test_preserves_home_absolute_and_parent_prefixes(self):
        for path in ['/opt/example/project/main.py','~/project/main.py','../project/main.py','apps/main.py','./main.py']:
            with self.subTest(path=path):
                self.assertEqual(W.args_from_utterance(f'Compare {path} with other.py')['path'],path)
    def test_embedding_path_does_not_grant_outside_root(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d).resolve(); allowed=root/'allowed';allowed.mkdir(); file=root/'outside.py';file.write_text('outside')
            utterance=f'Compare {file} with other.py'
            result=W.run_requested(W.args_from_utterance(utterance),utterance,roots=[allowed])
            self.assertFalse(result['ok']);self.assertEqual(result['error'],'outside the allowed folders')
    def test_traversal_and_symlink_still_denied(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d).resolve(); allowed=root/'allowed';allowed.mkdir(); outside=root/'outside.py';outside.write_text('outside')
            (allowed/'link.py').symlink_to(outside)
            for name in ['../outside.py','link.py']:
                utterance=f'Compare {name} with other.py'
                self.assertFalse(W.run_requested(W.args_from_utterance(utterance),utterance,roots=[allowed])['ok'])
    def test_secret_path_still_denied(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d).resolve(); file=root/'credentials.json';file.write_text('{}')
            utterance=f'Compare {file} with other.py'
            result=W.run_requested(W.args_from_utterance(utterance),utterance,roots=[root])
            self.assertTrue(result['ok']);self.assertTrue(result.get('secret'))  # Evens 10-16: flag, never stop
if __name__=='__main__':unittest.main()
