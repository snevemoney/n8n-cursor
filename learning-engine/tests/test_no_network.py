from __future__ import annotations

import socket
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from tests.helpers import ROOT

from learning_engine.adapters import bookmark_review, corpus_reingest, youtube_l2
from learning_engine.network import NetworkDisabled, guarded_urlopen
from learning_engine.stage_c.harness import resolve_provider, run_eval
from learning_engine.stage_c.labelled import load_labelled
from learning_engine.validator import validate_packets


class NoNetworkGuardTest(unittest.TestCase):
    def test_guarded_urlopen_refuses_by_default(self) -> None:
        from urllib.request import Request

        with self.assertRaises(NetworkDisabled):
            guarded_urlopen(Request("https://example.com/"))

    def test_adapters_and_keyword_harness_never_open_a_socket(self) -> None:
        def boom(*_a, **_k):
            raise AssertionError("default path opened a socket")

        with mock.patch.object(socket, "socket", side_effect=boom):
            with mock.patch.object(socket, "create_connection", side_effect=boom):
                bookmarks = bookmark_review.convert(ROOT / "fixtures" / "bookmark_review")
                validate_packets(bookmarks)
                corpus = corpus_reingest.convert(ROOT / "fixtures" / "corpus")
                validate_packets(corpus)
                yt = youtube_l2.convert(ROOT / "fixtures" / "youtube_l2")
                validate_packets(yt)
                rows = load_labelled(
                    ROOT / "fixtures" / "keyword_replay" / "REVIEW.csv",
                    ROOT / "fixtures" / "keyword_replay" / "STATE.jsonl",
                )
                run_eval(resolve_provider("keyword", mode="replay"), rows)
                run_eval(resolve_provider("lexicon"), rows)

    def test_cli_eval_without_opt_in_does_not_touch_the_network(self) -> None:
        from learning_engine.stage_c.harness import main as harness_main

        def boom(*_a, **_k):
            raise AssertionError("cli opened a socket")

        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "report.json"
            with mock.patch.object(socket, "socket", side_effect=boom):
                rc = harness_main(
                    [
                        "--provider",
                        "jev",
                        "--review",
                        str(ROOT / "fixtures" / "keyword_replay" / "REVIEW.csv"),
                        "--output",
                        str(out),
                    ]
                )
            self.assertEqual(rc, 2)
            self.assertFalse(out.exists())
