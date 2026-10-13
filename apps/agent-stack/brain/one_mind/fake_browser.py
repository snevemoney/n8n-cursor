"""Offline fake browser: loads a local HTML file and reports what was actually on the page.

Used by the nightly eval and by F3 browser verification. A 'browser verified' claim is
only accepted with a page-load receipt produced here (evidence prefix 'page:').
"""
import hashlib
import html
import re
from pathlib import Path

TITLE_RE = re.compile(r'<title>(.*?)</title>', re.I | re.S)
TAG_RE = re.compile(r'<[^>]+>')


def load_page(path):
    p = Path(path)
    raw = p.read_text(encoding='utf-8')
    title = html.unescape((TITLE_RE.search(raw) or [None, ''])[1]).strip() if TITLE_RE.search(raw) else ''
    text = re.sub(r'\s+', ' ', html.unescape(TAG_RE.sub(' ', raw))).strip()
    return {'url': p.resolve().as_uri(), 'title': title, 'text': text,
            'sha256': hashlib.sha256(raw.encode()).hexdigest()[:16]}


def verify(page, expect_text, *, mission_id='', worker_id=''):
    from . import receipts
    ok = expect_text.lower() in page['text'].lower()
    rid = receipts.record('page', mission_id, worker_id, {'sha256': page['sha256'], 'url': page['url'], 'expect': expect_text}) if ok else None
    return {'verified': ok, 'evidence': (rid,) if ok else (),
            'observed': page['text'][:160]}
