"""Real owned Git mutations with synthetic model output; no live provider claims."""
import json,subprocess,sys
from pathlib import Path
import pytest
from test_coding_resume import coding


def test_guard_blocks_generated_write_before_file_exists(coding):
    hand,root,args,calls,saved,save,repo=coding
    events=[]
    def guard(event,writes):
        events.append((event,writes))
        allowed='a.py' not in writes
        return {'ok':allowed,'configuration_preserved':allowed}
    got=hand.run(args,checkpoint=save,mutation_guard=guard)
    assert got['blocked'] and not got['verified']
    assert not (root/'a.py').exists()
    assert not calls['tests'] and not calls['commits']
    assert any(event=='before_write' and 'a.py' in writes for event,writes in events)


def test_guard_surrounds_real_tests_and_commits(coding):
    hand,root,args,calls,saved,save,repo=coding
    events=[]
    def guard(event,writes):
        events.append(event)
        return {'ok':True,'configuration_preserved':True}
    got=hand.run(args,checkpoint=save,mutation_guard=guard)
    assert got['verified'] and calls['tests']==1 and calls['commits']==1
    for event in ('before_write','after_write','before_test','after_test','before_commit','after_commit'):
        assert event in events
    assert subprocess.run([sys.executable,'-m','unittest','discover','-v'],cwd=root,capture_output=True).returncode==0


def test_guarded_code_cannot_fall_back_to_nondurable_executor(coding):
    hand,root,args,calls,saved,save,repo=coding
    got=hand.run(args,mutation_guard=lambda *a:{'ok':True,'configuration_preserved':True})
    assert got['blocked'] and not calls['models'] and not root.exists()


def test_empty_or_all_skipped_receipts_do_not_prove_tests(coding):
    hand,*_=coding
    for text in ('Ran 0 tests in 0.0s\nOK','Ran 2 tests in 0.0s\nOK (skipped=2)','nothing to run'):
        assert not hand._test_counts(text)['tests_passed']
    assert hand._test_counts('Ran 2 tests in 0.1s\nOK')['tests_passed']==2
    assert hand._test_counts('59 passed, 12 subtests passed in 0.3s')['tests_passed']==59


def test_inline_output_and_failure_summary_cannot_be_test_evidence(coding):
    hand,root,*_=coding
    for cmd in (["python3","-c","print('1 passed')"],["node","-e","console.log('1 passed')"],["python3","-m","http.server"]):
        assert hand._test_runner_command(cmd,root) is None
    assert hand._test_runner_command(["python3","-m","unittest","discover","-v"],root)
    assert hand._test_counts("Ran 3 tests in 0.1s\nFAILED (failures=1)")['tests_passed']==0
    assert hand._test_counts("2 failed, 1 passed")['tests_passed']==0


def test_actual_final_discovery_summary_wins_over_module_stdout(coding):
    hand,*_=coding
    assert hand._test_counts("Ran 1 tests in 0.1s\nOK\nRan 0 tests in 0.0s\nOK")['tests_passed']==0
