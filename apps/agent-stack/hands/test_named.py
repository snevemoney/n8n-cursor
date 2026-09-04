#!/usr/bin/env python3
"""Named-hand tests. Real sources only. Never invent Watch Later or news."""
from __future__ import annotations

import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parent / "named.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_named", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class NamedHandsTest(unittest.TestCase):
    def test_unwrap_drops_ddg_and_keeps_http(self) -> None:
        wrapped = "https://duckduckgo.com/l/?uddg=https%3A%2F%2Fevenslouis.ca%2Foffer"
        self.assertEqual(MOD.unwrap_url(wrapped), "https://evenslouis.ca/offer")
        self.assertEqual(MOD.unwrap_url("https://html.duckduckgo.com/html/?q=x"), "")
        self.assertEqual(MOD.unwrap_url("file:///etc/passwd"), "")
        self.assertEqual(MOD.unwrap_url(""), "")

    def test_parse_link_lines_never_invents(self) -> None:
        raw = "Hive offer | https://evenslouis.ca/offer\nDuck | https://duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fa\n"
        cites = MOD.parse_link_lines(raw)
        urls = [c["url"] for c in cites]
        self.assertEqual(urls, ["https://evenslouis.ca/offer", "https://example.com/a"])
        self.assertEqual(MOD.parse_link_lines(""), [])
        self.assertEqual(MOD.parse_link_lines("no url here"), [])

    def test_web_search_opens_ddg_then_top_real_link(self) -> None:
        opened: list[str] = []

        def open_fn(url: str) -> dict:
            opened.append(url)
            return {"ok": True, "wire": "safari", "spoken": f"Opened {url}", "url": url}

        def links_fn() -> dict:
            return {
                "ok": True,
                "raw": "Example | https://example.com/source\nSecond | https://evenslouis.ca",
            }

        out = MOD.web_search(
            "search the web for rust ownership",
            open_fn=open_fn,
            links_fn=links_fn,
            front_fn=lambda: {"ok": True, "url": "https://html.duckduckgo.com/html/?q=rust"},
            sleep_fn=lambda _s: None,
        )
        self.assertTrue(out["ok"])
        self.assertEqual(out["wire"], "search")
        self.assertEqual(out["cites"][0]["url"], "https://example.com/source")
        self.assertIn("https://example.com/source", out["spoken"])
        self.assertTrue(opened[0].startswith("https://html.duckduckgo.com/html/"))
        self.assertIn("q=rust", opened[0])
        self.assertEqual(opened[1], "https://example.com/source")
        self.assertNotIn("cnn.com", out["spoken"])

    def test_web_search_dark_is_unknown(self) -> None:
        out = MOD.web_search(
            "search the web for anything",
            open_fn=lambda url: {"ok": True, "url": url},
            links_fn=lambda: {"ok": False, "unknown": True, "raw": "", "spoken": "UNKNOWN. JS dark."},
            front_fn=lambda: {"ok": True, "url": "https://html.duckduckgo.com/html/?q=anything"},
            sleep_fn=lambda _s: None,
        )
        self.assertTrue(out["unknown"])
        self.assertEqual(out["cites"], [])
        self.assertIn("UNKNOWN", out["spoken"])
        self.assertIn("I will not invent URLs", out["spoken"])

    def test_watch_later_lists_only_returned_titles(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-wl-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            out = MOD.watch_later(
                hive=hive,
                open_fn=lambda url: {"ok": True, "url": url},
                titles_fn=lambda: {"ok": True, "titles": ["Visible row from Safari JS"]},
                front_fn=lambda: {"ok": True, "title": "Watch later", "url": "https://www.youtube.com/playlist?list=WL"},
                grab_fn=lambda _h: {"ok": True, "path": "/tmp/see.jpg", "spoken": "grab"},
                sleep_fn=lambda _s: None,
            )
        self.assertTrue(out["ok"])
        self.assertEqual(out["titles"], ["Visible row from Safari JS"])
        self.assertIn("Visible row from Safari JS", out["spoken"])
        self.assertNotIn("invented", out["spoken"].lower())
        self.assertIn("watch.json", out["spoken"])

    def test_watch_later_empty_is_unknown_no_titles(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-wl-dark-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            out = MOD.watch_later(
                hive=hive,
                open_fn=lambda url: {"ok": True, "url": url},
                titles_fn=lambda: {"ok": False, "unknown": True, "titles": []},
                front_fn=lambda: {"ok": True, "title": "Watch later", "url": "https://www.youtube.com/playlist?list=WL"},
                grab_fn=lambda _h: {"ok": False, "spoken": "UNKNOWN. Screen grab is dark."},
                sleep_fn=lambda _s: None,
            )
        self.assertTrue(out["unknown"])
        self.assertEqual(out["titles"], [])
        self.assertIn("UNKNOWN", out["spoken"])
        self.assertIn("will not invent video titles", out["spoken"].lower())

    def test_watch_later_signed_out(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-wl-out-") as tmp:
            hive = Path(tmp)
            out = MOD.watch_later(
                hive=hive,
                open_fn=lambda url: {"ok": True, "url": url},
                titles_fn=lambda: {"ok": True, "titles": ["should not speak"]},
                front_fn=lambda: {"ok": True, "title": "Sign in", "url": "https://accounts.google.com/signin"},
                grab_fn=lambda _h: {"ok": True, "path": "/tmp/x.jpg"},
                sleep_fn=lambda _s: None,
            )
        self.assertTrue(out["unknown"])
        self.assertEqual(out["titles"], [])
        self.assertNotIn("should not speak", out["spoken"])

    def test_news_from_disk_unknown_never_invents(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-news-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text("north stars only\n", encoding="utf-8")
            out = MOD.news_from_disk("what's the news", [vault])
        self.assertIn("UNKNOWN", out["spoken"])
        self.assertIn("will not invent headlines", out["spoken"].lower())
        self.assertNotIn("breaking", out["spoken"].lower())

    def test_news_from_disk_cites_allow_list_only(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-news-hit-") as tmp:
            vault = Path(tmp)
            (vault / "CONTENT" / "knowledge").mkdir(parents=True)
            (vault / "CONTENT" / "knowledge" / "PRESCRIPTIVE-SIGNALS.md").write_text(
                "On-disk signals audit. Steal sheet ranked. No live wire.\n",
                encoding="utf-8",
            )
            out = MOD.news_from_disk("hive signals", [vault])
        self.assertFalse(out.get("unknown"))
        self.assertTrue(any("PRESCRIPTIVE-SIGNALS.md" in str(h.get("path")) for h in out.get("hits") or []))
        self.assertIn("disk", out["spoken"].lower())
        self.assertNotIn("CNN", out["spoken"])

    def test_make_route_uses_existing_slugs(self) -> None:
        image = MOD.make_route("make an image of the hive face")
        self.assertEqual(image["slug"], "image-agent-hitl")
        self.assertIn("use skill image-agent-hitl", image["spoken"])
        remotion = MOD.make_route("create a remotion")
        self.assertIn("No remotion skill", remotion["spoken"])
        self.assertIn("wealth-daily-show", remotion["spoken"])
        self.assertIn("Publish stays you", remotion["spoken"])
        video = MOD.make_route("generate a video")
        self.assertEqual(video["slug"], "motion-grade-pipeline")
        self.assertIn("use skill motion-grade-pipeline", video["spoken"])

    def test_dry_env_never_invents(self) -> None:
        with mock.patch.dict(os.environ, {"AGENT_STACK_HANDS_DRY": "1"}):
            search = MOD.web_search("search the web for anything")
            later = MOD.watch_later(hive=Path("/tmp"))
        self.assertTrue(search["unknown"])
        self.assertEqual(search["cites"], [])
        self.assertTrue(later["unknown"])
        self.assertEqual(later["titles"], [])


if __name__ == "__main__":
    unittest.main()
