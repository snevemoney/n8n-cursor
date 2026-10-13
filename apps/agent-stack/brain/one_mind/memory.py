"""Current memory: retrieval on demand over the ONE-BRAIN shared context files.

Reuses memory/store.py (SHARED_DIR, SHARED_FILES) and memory/retrieve.py (tokens); those
modules are loaded read-only and never modified, and JARVIS_SHARED_CONTEXT is not touched.
Per-file char caps. CURRENT_STATE and SECURITY_TODO are worker context only and are
never speakable; redact_unspeakable() removes their lines from anything spoken.
"""
import importlib.util
import re
import sys
from pathlib import Path

STACK = Path(__file__).resolve().parents[2]
UNSPEAKABLE = ('CURRENT_STATE', 'SECURITY_TODO')
DEFAULT_CAP = 1200
CAPS = {'CURRENT_STATE.md': 600, 'SECURITY_TODO.md': 600, 'OPERATOR_PROFILE.md': 1500}
MIN_LINE = 20


def _load(name, rel):
    key = 'agent_stack_one_mind_' + name
    if key not in sys.modules:
        spec = importlib.util.spec_from_file_location(key, STACK / rel)
        mod = importlib.util.module_from_spec(spec); sys.modules[key] = mod; spec.loader.exec_module(mod)
    return sys.modules[key]


def store():
    return _load('store', 'memory/store.py')


def retrieve():
    return _load('retrieve', 'memory/retrieve.py')


def is_speakable(name):
    stem = Path(name).stem.upper()
    return not any(stem.startswith(x) for x in UNSPEAKABLE)


def shared_dir():
    return Path(store().SHARED_DIR)


def _files(base):
    base = Path(base)
    names = [n for n, _, _ in store().SHARED_FILES]
    found = [base / n for n in names if (base / n).is_file()]
    found += sorted(p for p in base.glob('*.md') if p not in found)
    return found


def _chunks(text):
    return [c.strip() for c in re.split(r'\n\s*\n', text) if c.strip() and not c.lstrip().startswith('<!--')]


def search(query, base=None, *, k=4, speakable_only=False):
    toks = set(retrieve().tokens(query))
    rows = []
    for path in _files(base or shared_dir()):
        if speakable_only and not is_speakable(path.name):
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except OSError:
            continue
        cap = CAPS.get(path.name, DEFAULT_CAP)
        scored = []
        for chunk in _chunks(text):
            hit = len(toks & set(retrieve().tokens(chunk)))
            if hit:
                scored.append((hit, chunk))
        if not scored:
            continue
        scored.sort(key=lambda r: -r[0])
        body, used = [], 0
        for _, chunk in scored:
            if used + len(chunk) > cap:
                chunk = chunk[: max(0, cap - used)]
            if chunk:
                body.append(chunk); used += len(chunk)
            if used >= cap:
                break
        rows.append({'file': path.name, 'score': scored[0][0], 'text': '\n\n'.join(body), 'chars': used,
                     'speakable': is_speakable(path.name)})
    rows.sort(key=lambda r: (-r['score'], r['file']))
    return rows[:k]


def worker_context(query, base=None, k=4):
    return search(query, base, k=k)


def speakable_context(query, base=None, k=4):
    return search(query, base, k=k, speakable_only=True)


def redact_unspeakable(text, base=None):
    """Drop any spoken sentence that quotes a line from CURRENT_STATE / SECURITY_TODO."""
    lines = []
    for path in _files(base or shared_dir()):
        if is_speakable(path.name):
            continue
        try:
            lines += [l.strip(' -*#|`').strip() for l in path.read_text(encoding='utf-8').splitlines()]
        except OSError:
            continue
    lines = [l.lower() for l in lines if len(l) >= MIN_LINE]
    if not lines:
        return text
    sentences = re.split(r'(?<=[.!?])\s+', text or '')
    kept = [s for s in sentences if not any(l in s.lower() or (len(s) >= MIN_LINE and s.lower().strip(' .') in l) for l in lines)]
    return ' '.join(kept).strip()
