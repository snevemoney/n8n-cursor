"""Throwaway per-mission copies. The source tree is never written; everything happens in a temp copy."""
import difflib
import shutil
import tempfile
from pathlib import Path

IGNORE = shutil.ignore_patterns('.git', '__pycache__', '*.pyc', 'node_modules', '.venv')
MAX_FILES = 2000


class Sandbox:
    def __init__(self, source, *, prefix='one-mind-'):
        self.source = Path(source).resolve()
        if not self.source.is_dir():
            raise ValueError('sandbox_source_missing')
        count = sum(1 for _ in self.source.rglob('*'))
        if count > MAX_FILES:
            raise ValueError('sandbox_source_too_large')
        self._tmp = tempfile.TemporaryDirectory(prefix=prefix)
        self.root = Path(self._tmp.name) / 'work'
        shutil.copytree(self.source, self.root, ignore=IGNORE)

    def path(self, rel):
        target = (self.root / rel).resolve()
        if self.root.resolve() not in target.parents and target != self.root.resolve():
            raise ValueError('path_escapes_sandbox')
        return target

    def write(self, rel, content):
        target = self.path(rel)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)

    def diff(self, files):
        out = []
        for rel in files:
            old = (self.source / rel).read_text().splitlines(True) if (self.source / rel).exists() else []
            new = self.path(rel).read_text().splitlines(True) if self.path(rel).exists() else []
            out.extend(difflib.unified_diff(old, new, 'a/' + rel, 'b/' + rel))
        return ''.join(out)

    def cleanup(self):
        self._tmp.cleanup()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.cleanup()
