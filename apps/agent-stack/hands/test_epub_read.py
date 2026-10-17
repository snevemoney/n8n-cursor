import importlib.util
import sys
import zipfile
from pathlib import Path

import pytest

MODULE = Path(__file__).with_name("epub_read.py")
spec = importlib.util.spec_from_file_location("agent_stack_epub_read", MODULE)
er = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = er
spec.loader.exec_module(er)


def make_epub(path, chapters=None, *, container=None, opf=None, extras=None):
    chapters = chapters or [("c1.xhtml", "<p>One</p>"), ("c2.xhtml", "<p>Deux café 😀</p>")]
    container = container or '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OPS/book.opf"/></rootfiles></container>'
    items = "".join(f'<item id="i{i}" href="{name}" media-type="application/xhtml+xml"/>' for i, (name, _) in enumerate(chapters))
    refs = "".join(f'<itemref idref="i{i}"/>' for i in range(len(chapters)))
    opf = opf or f'<package xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/"><metadata><dc:title>Test Book</dc:title><dc:creator>Ada</dc:creator></metadata><manifest>{items}</manifest><spine>{refs}</spine></package>'
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("META-INF/container.xml", container)
        z.writestr("OPS/book.opf", opf)
        for name, body in chapters:
            z.writestr("OPS/" + name, body)
        for name, body in (extras or {}).items():
            z.writestr(name, body)
    return path


def test_spine_order_unicode_metadata_and_script_suppression(tmp_path):
    p = make_epub(tmp_path / "book.epub", [("z.xhtml", '<h1>First</h1><script>malicious()</script><style>hidden</style>'), ("a.xhtml", '<p>Second café 😀</p>')])
    got = er.read_epub(p)
    assert got["status"] == "ok"
    assert got["title"] == "Test Book" and got["author"] == "Ada"
    assert got["text"] == "First\n\nSecond café 😀"
    assert "malicious" not in got["text"] and "hidden" not in got["text"]


def test_offset_continuation_and_utf8_boundary(tmp_path):
    p = make_epub(tmp_path / "book.epub", [("a.xhtml", "<p>ab😀cdef</p>")])
    first = er.read_epub(p, limit=4)
    assert first["status"] == "partial" and first["text"] == "ab"
    second = er.read_epub(p, offset=first["next_offset"], limit=4)
    assert second["text"] == "😀" and second["status"] == "partial"
    tail = er.read_epub(p, offset=second["next_offset"], limit=100)
    assert tail["text"] == "cdef" and tail["complete"]
    assert first["text"] + second["text"] + tail["text"] == "ab😀cdef"


def test_malformed_container_and_external_entity_fail_closed(tmp_path):
    p = make_epub(tmp_path / "bad.epub", container="<container>")
    assert er.read_epub(p)["status"] == "error"
    p = make_epub(tmp_path / "entity.epub", container='<!DOCTYPE x [<!ENTITY boom SYSTEM "file:///etc/passwd">]><container/>')
    assert er.read_epub(p)["status"] == "error"


def test_unsafe_member_path_rejected(tmp_path):
    p = make_epub(tmp_path / "unsafe.epub", extras={"OPS/../escape.txt": "x"})
    got = er.read_epub(p)
    assert got["status"] == "error" and "unsafe" in got["error"]


def test_expanded_size_budget_rejected(tmp_path, monkeypatch):
    p = make_epub(tmp_path / "large.epub")
    monkeypatch.setattr(er, "MAX_ENTRY_BYTES", 32)
    got = er.read_epub(p)
    assert got["status"] == "unsupported" and "size budget" in got["error"]


def test_missing_spine_is_unsupported(tmp_path):
    p = make_epub(tmp_path / "no-spine.epub", opf='<package><manifest/></package>')
    assert er.read_epub(p)["status"] == "unsupported"


def test_standard_xhtml_doctype_is_harmless(tmp_path):
    doctype = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">'
    p = make_epub(tmp_path / "doctype.epub", [("chapter.xhtml", doctype + '<html xmlns="http://www.w3.org/1999/xhtml"><body><p>Readable</p></body></html>')])
    got = er.read_epub(p)
    assert got["ok"] and got["text"] == "Readable"


def test_directory_entries_and_percent_encoded_href(tmp_path):
    p = tmp_path / "dirs.epub"
    container = '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OPS/book.opf"/></rootfiles></container>'
    opf = '<package xmlns="http://www.idpf.org/2007/opf"><manifest><item id="c" href="chapter%20one.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c"/></spine></package>'
    with zipfile.ZipFile(p, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("META-INF/", "")
        z.writestr("META-INF/container.xml", container)
        z.writestr("OPS/", "")
        z.writestr("OPS/book.opf", opf)
        z.writestr("OPS/chapter one.xhtml", "<p>Encoded path</p>")
    got = er.read_epub(p)
    assert got["ok"] and got["text"] == "Encoded path"


def test_duplicate_archive_paths_are_rejected(tmp_path):
    p = tmp_path / "duplicate.epub"
    with zipfile.ZipFile(p, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("META-INF/container.xml", "<container/>")
        z.writestr("META-INF/container.xml", "<container/>")
    got = er.read_epub(p)
    assert got["status"] == "error" and "duplicate" in got["error"]


def test_empty_book_and_offset_at_end_are_complete(tmp_path):
    p = make_epub(tmp_path / "empty.epub", [("empty.xhtml", "<html><body></body></html>")])
    empty = er.read_epub(p)
    assert empty["ok"] and empty["complete"] and empty["text"] == ""
    p = make_epub(tmp_path / "book.epub", [("chapter.xhtml", "<p>abc</p>")])
    end = er.read_epub(p, offset=3)
    assert end["ok"] and end["complete"] and end["text"] == ""
