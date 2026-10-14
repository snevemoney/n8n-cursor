"""Run the build script only under a synthetic HOME with stubbed compiler/signing tools."""
import os
import subprocess
from pathlib import Path
import pytest

SCRIPT = Path(__file__).parents[1] / 'face/overlay/build_click_app.sh'


def build_fixture(tmp_path):
    home = tmp_path / 'fake-home'
    installed = home / 'Applications/Jarvis Click.app/Contents/MacOS/jarvis_click'
    installed.parent.mkdir(parents=True)
    installed.write_text('installed sentinel')
    tools = tmp_path / 'tools'
    tools.mkdir()
    for name, body in {'swiftc': 'while [ "$1" != "-o" ]; do shift; done; shift; printf rebuilt > "$1"',
                       'security': 'exit 0', 'codesign': 'exit 0'}.items():
        p = tools / name
        p.write_text('#!/bin/sh\n' + body + '\n')
        p.chmod(0o700)
    env = {k: v for k, v in os.environ.items() if not k.startswith('JARVIS_CLICK_')}
    env.update(HOME=str(home), PATH=str(tools) + ':/usr/bin:/bin', PYTEST_CURRENT_TEST='review')
    return installed, env


@pytest.mark.xfail(strict=True, reason='Build script has no test guard and defaults to installed app')
def test_default_test_build_never_replaces_installed_bundle(tmp_path):
    installed, env = build_fixture(tmp_path)
    subprocess.run(['bash', str(SCRIPT)], env=env, capture_output=True, text=True, check=True)
    assert installed.read_text() == 'installed sentinel'


def test_explicit_scratch_build_preserves_installed_bundle(tmp_path):
    installed, env = build_fixture(tmp_path)
    app = tmp_path / 'scratch/Test Click.app'
    env['JARVIS_CLICK_APP'] = str(app)
    subprocess.run(['bash', str(SCRIPT)], env=env, capture_output=True, text=True, check=True)
    assert installed.read_text() == 'installed sentinel'
    assert (app / 'Contents/MacOS/jarvis_click').read_text() == 'rebuilt'
