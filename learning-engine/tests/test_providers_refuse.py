from __future__ import annotations

import os
import socket
import unittest
from unittest import mock

from tests.helpers import ROOT  # noqa: F401

from learning_engine.errors import ProviderRefused
from learning_engine.packet import base_packet, evidence_item
from learning_engine.stage_c.providers.jev import JevOpenRouterProvider
from learning_engine.stage_c.providers.openai_decisions import OpenAIDecisionsProvider


def _packet():
    return base_packet(
        signal_id="syn-refuse",
        source_type="bookmark",
        content_access="transcript",
        analysis_scope="transcript",
        source_text="Agent loop with a verifier",
        evidence=[evidence_item(kind="field", source_ref="REVIEW.csv:gist")],
        verification_state="unknown",
        processing_status="ok",
        lifecycle_state="analyzed",
    )


class LiveProviderRefuseTest(unittest.TestCase):
    def test_jev_refuses_without_flag(self) -> None:
        with mock.patch.dict(os.environ, {"OPENROUTER_API_KEY": "should-not-be-used"}, clear=False):
            with self.assertRaises(ProviderRefused) as ctx:
                JevOpenRouterProvider(opt_in_live=False).evaluate(_packet())
        self.assertIn("opt-in", str(ctx.exception))

    def test_jev_refuses_without_key(self) -> None:
        env = {k: v for k, v in os.environ.items() if k != "OPENROUTER_API_KEY"}
        env["LEARNING_ENGINE_OPT_IN_LIVE"] = "1"
        with mock.patch.dict(os.environ, env, clear=True):
            os.environ.pop("OPENROUTER_API_KEY", None)
            with self.assertRaises(ProviderRefused) as ctx:
                JevOpenRouterProvider(opt_in_live=True).evaluate(_packet())
        self.assertIn("OPENROUTER_API_KEY", str(ctx.exception))

    def test_openai_refuses_without_flag(self) -> None:
        with mock.patch.dict(os.environ, {"OPENAI_API_KEY": "should-not-be-used"}, clear=False):
            with self.assertRaises(ProviderRefused):
                OpenAIDecisionsProvider(opt_in_live=False).evaluate(_packet())

    def test_openai_refuses_without_key(self) -> None:
        env = {k: v for k, v in os.environ.items() if k != "OPENAI_API_KEY"}
        with mock.patch.dict(os.environ, env, clear=True):
            os.environ.pop("OPENAI_API_KEY", None)
            with self.assertRaises(ProviderRefused) as ctx:
                OpenAIDecisionsProvider(opt_in_live=True).evaluate(_packet())
        self.assertIn("OPENAI_API_KEY", str(ctx.exception))

    def test_refusal_does_not_open_a_socket(self) -> None:
        def boom(*_a, **_k):
            raise AssertionError("socket opened during refusal")

        with mock.patch.object(socket, "socket", side_effect=boom):
            with mock.patch.object(socket, "create_connection", side_effect=boom):
                with self.assertRaises(ProviderRefused):
                    JevOpenRouterProvider(opt_in_live=False).evaluate(_packet())
                with self.assertRaises(ProviderRefused):
                    OpenAIDecisionsProvider(opt_in_live=False).evaluate(_packet())
