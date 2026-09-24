#!/usr/bin/env python3
"""Jarvis notes: append, title search, as-of. Never invent a sitting."""
from __future__ import annotations

import importlib.util
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parent / "chats.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_chats_test", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class JarvisChatsTest(unittest.TestCase):
    def test_append_is_the_face_log_not_a_stub(self) -> None:
        with tempfile.TemporaryDirectory(prefix="jarvis-chats-append-") as tmp:
            vault = Path(tmp)
            wrote = MOD.append_jarvis_turn(
                utterance="Hello Jarvis",
                spoken="Sir. Hello. Standing by.",
                verb="converse",
                tool="converse",
                wires=["converse", "store"],
                roots=[vault],
            )
            self.assertEqual(len(wrote), 1)
            body = wrote[0].read_text(encoding="utf-8")
        self.assertIn("surface: jarvis", body)
        self.assertIn("archive_type: conversation_text", body)
        self.assertIn("## Evens", body)
        self.assertIn("Hello Jarvis", body)
        self.assertIn("Sir. Hello. Standing by.", body)
        self.assertIn("verb: converse", body)
        self.assertIn("wires: converse, store", body)
        self.assertNotIn("/Users/", body)

    def test_closed_turn_records_identity_including_wire_failure(self) -> None:
        with tempfile.TemporaryDirectory(prefix="jarvis-chats-identity-") as tmp:
            vault = Path(tmp)
            wrote = MOD.append_jarvis_turn(
                utterance="What is on the wire",
                spoken="The talk wire is dark this turn.",
                verb="converse",
                tool="converse",
                wires=["converse"],
                roots=[vault],
                turn_gen=3319,
                jarvis_chat_id="chat-wire-1",
                outcome="WIRE_FAILURE",
            )
            self.assertEqual(len(wrote), 1)
            body = wrote[0].read_text(encoding="utf-8")
        self.assertIn("The talk wire is dark this turn.", body)
        self.assertIn("turn_gen: 3319", body)
        self.assertIn("jarvis_chat_id: chat-wire-1", body)
        self.assertIn("outcome: WIRE_FAILURE", body)

    def test_idle_and_paths_stay_off_disk(self) -> None:
        with tempfile.TemporaryDirectory(prefix="jarvis-chats-idle-") as tmp:
            vault = Path(tmp)
            empty = MOD.append_jarvis_turn(
                utterance="",
                spoken="Holding.",
                verb="idle",
                roots=[vault],
            )
            wrote = MOD.append_jarvis_turn(
                utterance="Open /Users/evenslouis/secret.env",
                spoken="I will not open that path.",
                verb="converse",
                roots=[vault],
            )
            self.assertEqual(empty, [])
            body = wrote[0].read_text(encoding="utf-8")
        self.assertNotIn("/Users/", body)
        self.assertNotIn("secret.env", body)
        self.assertIn("Open", body)

    def test_search_unknown_titles_then_named_body(self) -> None:
        with tempfile.TemporaryDirectory(prefix="jarvis-chats-search-") as tmp:
            vault = Path(tmp)
            sess = vault / "CONTENT/os/sessions/claude"
            sess.mkdir(parents=True)
            (sess / "2026-09-12-orb-senses.md").write_text(
                "---\nsurface: claude\ntitle: Orb senses grill\n---\n\n"
                "# Orb senses grill\n\n"
                "Watch click arms computer use. Eyes snaps stills.\n",
                encoding="utf-8",
            )
            miss = MOD.search_sessions(
                "what did we say in the chatgpt sitting about purple zebra",
                [vault],
            )
            titles = MOD.search_sessions("what did we say in the claude sitting", [vault])
            named = MOD.search_sessions(
                "what did we say in the claude sitting about orb senses",
                [vault],
            )
            titled = MOD.search_sessions("Portfolio intelligence", [vault])
            grok = vault / "CONTENT/os/sessions/grok/wealth-manager"
            grok.mkdir(parents=True)
            (grok / "2026-09-11-portfolio.md").write_text(
                "---\nsurface: grok\ntitle: Portfolio intelligence\n---\n\n"
                "# Portfolio intelligence\n\n"
                "Grok, Claude, ChatGPT, and Cursor each read Grok, Claude, ChatGPT, and Cursor.\n"
                "send: Downloaded. It’s MG essay style (~8.5 min) — studying grammar now.\n"
                "user: Let me watch the video (cant see from my phone)\n"
                "Wealth Manager desk. Positions only from disk.\n",
                encoding="utf-8",
            )
            cursor = vault / "CONTENT/os/sessions/cursor"
            cursor.mkdir(parents=True)
            (cursor / "bc-portfolio.md").write_text(
                "---\nsurface: cursor\ntitle: Add secure portfolio proof cards to /work\n---\n\n"
                "# Add secure portfolio proof cards to /work\n\n"
                "Body: [[CURSOR_CHATS/add-secure-portfolio-proof-cards]]\n",
                encoding="utf-8",
            )
            (cursor / "morning60.md").write_text(
                "---\nsurface: cursor\n"
                'title: "Evens has `` open (74s Morning60 commute). He said **\\\\u201crestore"\n'
                "---\n\n"
                "# mash\n\n"
                "portfolio commute note\n",
                encoding="utf-8",
            )
            named_title = MOD.search_sessions(
                "what did we say in Portfolio intelligence",
                [vault],
            )
        self.assertTrue(miss["unknown"])
        self.assertIn("UNKNOWN", miss["spoken"])
        self.assertIn("I have", titles["spoken"])
        self.assertIn("Name the sitting", titles["spoken"])
        self.assertNotIn("UNKNOWN", titles["spoken"])
        self.assertIn("Orb senses", named["spoken"])
        self.assertIn("Watch click", named["spoken"])
        self.assertFalse(named["unknown"])
        self.assertTrue(titled["unknown"])
        self.assertFalse(named_title["unknown"])
        self.assertIn("Portfolio intelligence", named_title["spoken"])
        self.assertIn("grok", named_title["spoken"])
        self.assertIn("watch the video", named_title["spoken"].lower())
        self.assertNotIn("Add secure portfolio", named_title["spoken"])
        self.assertNotIn("Morning60", named_title["spoken"])
        self.assertNotIn("\\u201c", named_title["spoken"])
        self.assertNotIn("Name the sitting", named_title["spoken"])

    def test_search_sessions_none_uses_defaults_empty_list_isolates(self) -> None:
        with tempfile.TemporaryDirectory(prefix="jarvis-chats-roots-") as tmp:
            vault = Path(tmp)
            sess = vault / "CONTENT/os/sessions/claude"
            sess.mkdir(parents=True)
            (sess / "2026-09-12-orb-senses.md").write_text(
                "---\nsurface: claude\ntitle: Orb senses grill\n---\n\n"
                "# Orb senses grill\n\n"
                "Watch click arms computer use.\n",
                encoding="utf-8",
            )
            seen: list = []

            def fake_dest(extra=None):
                seen.append(extra)
                if extra is None:
                    return [vault]
                return [Path(p) for p in extra if Path(p).is_dir()]

            with mock.patch.object(MOD, "dest_oh_roots", side_effect=fake_dest):
                found = MOD.search_sessions("what did we say in the claude sitting about orb senses")
                isolated = MOD.search_sessions(
                    "what did we say in the claude sitting about orb senses",
                    [],
                )
                named = MOD.search_sessions(
                    "what did we say in the claude sitting about orb senses",
                    [vault],
                )
        self.assertIn(None, seen)
        self.assertIn([], seen)
        self.assertTrue(any(extra == [vault] for extra in seen))
        self.assertFalse(found["unknown"])
        self.assertIn("Orb senses", found["spoken"])
        self.assertTrue(isolated["unknown"])
        self.assertIn("UNKNOWN", isolated["spoken"])
        self.assertFalse(named["unknown"])

    def test_stale_line_uses_dates_on_disk(self) -> None:
        with tempfile.TemporaryDirectory(prefix="jarvis-chats-stale-") as tmp:
            vault = Path(tmp)
            (vault / "CONTENT/os").mkdir(parents=True)
            (vault / "CONTENT/os/hot.md").write_text(
                "- 2026-08-27T05:05:00Z · factory close\n",
                encoding="utf-8",
            )
            (vault / "CONTENT/VAULT_MAP.md").write_text(
                "**Maintained by:** Librarian · **as-of:** 2026-08-21 19:15 ET\n",
                encoding="utf-8",
            )
            line = MOD.speak_stale_line([vault])
        self.assertIn("Hot is Aug 27", line)
        self.assertIn("Map is Aug 21", line)
        self.assertIn("Today is", line)
        self.assertTrue(MOD.wants_stale_line("what's in the stack"))
        self.assertTrue(MOD.wants_stale_line("what do we know"))
        self.assertFalse(MOD.wants_stale_line("What do we know about black holes?"))
        self.assertFalse(MOD.wants_follow_up("What was that movie about?"))
        self.assertTrue(MOD.wants_follow_up("what was that"))
        self.assertTrue(
            MOD.wants_stale_line(
                "I don't want you to have a brief you should read exactly what's inside obsidian"
            )
        )
        self.assertFalse(MOD.wants_stale_line("Hello Jarvis"))
        self.assertFalse(
            MOD.wants_stale_line("Read my Obsidian note titled purple-zeppelin-payroll-ritual.")
        )
        self.assertFalse(MOD.wants_session_recall("Hello Jarvis"))
        self.assertTrue(
            MOD.wants_all_sessions(
                "Can you see the chats in my cursor ChatGPT Claude Groq but"
            )
        )
        self.assertTrue(
            MOD.wants_all_sessions(
                "it should see all of our chats sessions between all the platforms"
            )
        )
        evening = "All right look at my last chat sessions of all the platforms now"
        self.assertTrue(MOD.wants_all_sessions(evening))
        self.assertFalse(MOD.wants_last_surface(evening) and not MOD.wants_all_sessions(evening))
        self.assertTrue(MOD.wants_all_sessions("this chat"))
        self.assertTrue(
            MOD.wants_last_surface("Can you see my last cursor chat session")
        )
        self.assertFalse(
            MOD.wants_all_sessions("Can you see my last cursor chat session")
        )
        self.assertTrue(MOD.wants_last_surface("Can't you see what cursor did"))
        self.assertFalse(
            MOD.wants_session_recall("Can you see my last cursor chat session")
        )
        self.assertFalse(
            MOD.wants_session_recall(
                "Can you see the chats in my cursor ChatGPT Claude Groq but"
            )
        )
        self.assertFalse(
            MOD.wants_session_recall(
                "Well I meant to program you to be just like ChatGPT voice and Kodex"
            )
        )
        self.assertTrue(MOD.wants_session_recall("what did we say in Portfolio intelligence"))
        self.assertTrue(MOD.wants_follow_up("what did you just say"))
        prior = MOD.speak_last_turn(
            [
                {"user": "Hello", "jarvis": "Sir. UNKNOWN. No live mouth this turn."},
                {"user": "stack", "jarvis": "Sir. The vault is Outer Heaven."},
            ]
        )
        self.assertIn("Outer Heaven", prior["spoken"])
        self.assertFalse(prior["unknown"])

    def test_what_happened_reads_timeline_not_mtime(self) -> None:
        self.assertTrue(MOD.wants_what_happened("What happened yesterday"))
        self.assertTrue(MOD.wants_what_happened("What happened yesterday?"))
        self.assertTrue(MOD.wants_what_happened("What happened yesterday Jarvis"))
        self.assertTrue(MOD.wants_what_happened("Hello Jarvis what happened yesterday"))
        self.assertTrue(
            MOD.wants_what_happened(
                "What happened yesterday that we could try to work on today"
            )
        )
        self.assertTrue(MOD.wants_what_happened("What happened"))
        self.assertFalse(MOD.wants_what_happened("Hello what happened"))
        self.assertFalse(MOD.wants_what_happened("What happened to the Face"))
        self.assertFalse(MOD.wants_what_happened("Hello Jarvis"))
        self.assertFalse(MOD.wants_session_recall("What happened yesterday"))
        today = date.today()
        yest = today - timedelta(days=1)
        with tempfile.TemporaryDirectory(prefix="jarvis-chats-day-") as tmp:
            vault = Path(tmp)
            sess = vault / "CONTENT/os/sessions"
            sess.mkdir(parents=True)
            (sess / "Conversation Timeline.md").write_text(
                "| date | surface | desk | title |\n"
                "|------|---------|------|-------|\n"
                f"| {yest.isoformat()}T18:41:00 | grok | Wealth Manager | "
                "[[path|Portfolio intelligence]] |\n"
                f"| {yest.isoformat()}T13:10:13 | claude-code |  | "
                "[[path|<scheduled-task name=\"daily-code-review\"]] |\n"
                f"| {today.isoformat()}T22:32:17 | cursor | n8n-cursor | "
                "[[path|Obsidian MCP Docker connection]] |\n",
                encoding="utf-8",
            )
            jarvis = sess / "jarvis"
            jarvis.mkdir()
            (jarvis / f"{today.isoformat()}.md").write_text(
                f"# Jarvis · {today.isoformat()}\n\n"
                "## Evens · t\n\nHello Jarvis\n\n## jarvis\n\nHi.\n\n"
                "## Evens · t2\n\nWhat happened\n\n## jarvis\n\nLater.\n",
                encoding="utf-8",
            )
            yesterday = MOD.speak_what_happened(
                "What happened yesterday",
                [vault],
            )
            today = MOD.speak_what_happened("What happened", [vault])
            miss = MOD.speak_what_happened("What happened", [vault / "empty"])
        self.assertFalse(yesterday["unknown"])
        self.assertIn("Portfolio intelligence", yesterday["spoken"])
        self.assertIn("grok", yesterday["spoken"])
        self.assertNotIn("scheduled-task", yesterday["spoken"])
        self.assertNotIn("Obsidian MCP", yesterday["spoken"])
        self.assertIn("Hello Jarvis", today["spoken"])
        self.assertTrue(miss["unknown"])
        self.assertIn("UNKNOWN", miss["spoken"])

    def test_all_sessions_reads_index_not_keyword_mash(self) -> None:
        with tempfile.TemporaryDirectory(prefix="jarvis-chats-index-") as tmp:
            vault = Path(tmp)
            sess = vault / "CONTENT/os/sessions"
            sess.mkdir(parents=True)
            (sess / "Recent Conversations.md").write_text(
                "| surface | id | title | date | path |\n"
                "|---|---|---|---|---|\n"
                "| cursor | `aaa` | Finish the leftover Mac sitting | 2026-09-12 | sessions/cursor/aaa.md |\n"
                "| grok | `bbb` | Portfolio intelligence | 2026-09-11 | sessions/grok/bbb.md |\n"
                "| claude | `ccc` | Claude chats to Obsidian export | 2026-09-11 | sessions/claude/ccc.md |\n"
                "| chatgpt | `ddd` | ChatGPT conversation ddd | 2026-09-05 | sessions/chatgpt/ddd.md |\n",
                encoding="utf-8",
            )
            (sess / "jarvis").mkdir()
            (sess / "jarvis" / f"{date.today().isoformat()}.md").write_text(
                "## Evens · t\n\nlook at the logs again\n\n## jarvis\n\nOk.\n",
                encoding="utf-8",
            )
            got = MOD.speak_all_sessions("Can you see the chats", [vault])
            cli = MOD.speak_named_surfaces(("grok", "claude"), [vault])
        self.assertFalse(got["unknown"])
        spoken = got["spoken"]
        self.assertIn("Yes: cursor, grok, claude, chatgpt.", spoken)
        self.assertIn("cursor: Finish the leftover Mac sitting", spoken)
        self.assertIn("grok: Portfolio intelligence", spoken)
        self.assertIn("This Orb sitting: look at the logs again", spoken)
        self.assertNotIn("only this conversation", spoken.lower())
        self.assertNotIn("shared brain", spoken.lower())
        self.assertFalse(cli["unknown"])
        self.assertIn("grok: Portfolio intelligence", cli["spoken"])
        self.assertIn("I do not install those CLIs", cli["spoken"])

    def test_evening_all_platforms_is_census_not_one_index_title(self) -> None:
        ask = "All right look at my last chat sessions of all the platforms now"
        with tempfile.TemporaryDirectory(prefix="jarvis-chats-census-") as tmp:
            vault = Path(tmp)
            sess = vault / "CONTENT/os/sessions"
            sess.mkdir(parents=True)
            (sess / "Recent Conversations.md").write_text(
                "| surface | id | title | date | path |\n"
                "|---|---|---|---|---|\n"
                "| claude | `ccc` | Daily code review | 2026-09-13 | sessions/claude/ccc.md |\n"
                "| cursor | `aaa` | Finish the leftover Mac sitting | 2026-09-12 | sessions/cursor/aaa.md |\n"
                "| grok | `bbb` | Portfolio intelligence | 2026-09-11 | sessions/grok/bbb.md |\n"
                "| chatgpt | `ddd` | ChatGPT conversation ddd | 2026-09-05 | sessions/chatgpt/ddd.md |\n"
                "| jarvis | `eee` | Orb evening log | 2026-09-13 | sessions/jarvis/eee.md |\n",
                encoding="utf-8",
            )
            got = MOD.search_sessions(ask, [vault])
            census = MOD.speak_all_sessions(ask, [vault])
        spoken = got["spoken"]
        self.assertFalse(got.get("unknown"))
        self.assertEqual(got.get("spoken"), census.get("spoken"))
        self.assertNotEqual(spoken.strip(), "I have Daily code review (claude).")
        self.assertIn("Daily code review", spoken)
        self.assertIn("cursor", spoken.lower())
        self.assertIn("grok", spoken.lower())
        self.assertIn("chatgpt", spoken.lower())
        self.assertIn("Name the sitting", spoken)

    def test_temp_hive_does_not_choose_live_dests(self) -> None:
        hive = Path("/tmp/jarvis-chats-not-live-hive")
        self.assertIsNone(MOD.archive_roots(hive, None))
        isolated = MOD.archive_roots(hive, [Path("/tmp")])
        self.assertEqual(isolated, [Path("/tmp")])

    def test_dest_oh_roots_none_vs_empty_list(self) -> None:
        empty = MOD.dest_oh_roots([])
        self.assertEqual(empty, [])
        live = MOD.dest_oh_roots(None)
        self.assertTrue(live)
        self.assertNotEqual(live, [])

    def test_index_names_sitting_and_content_miss_stays_unknown(self) -> None:
        with tempfile.TemporaryDirectory(prefix="jarvis-chats-index-") as tmp:
            vault = Path(tmp)
            sess = vault / "CONTENT/os/sessions"
            (sess / "cursor").mkdir(parents=True)
            (sess / "chatgpt").mkdir(parents=True)
            (sess / "Recent Conversations.md").write_text(
                "| surface | id | title | date | path |\n"
                "|---|---|---|---|---|\n"
                "| cursor | `aaa` | can you see obsidian using the mcp_docker connector? | 2026-09-11 | sessions/cursor/aaa.md |\n"
                "| chatgpt | `bbb` | ChatGPT conversation leftover | 2026-09-11 | sessions/chatgpt/bbb.md |\n",
                encoding="utf-8",
            )
            for i in range(30):
                (sess / "chatgpt" / f"chat-{i}.md").write_text(
                    f"---\nsurface: chatgpt\ntitle: ChatGPT conversation {i}\n---\n\n# leftover\n",
                    encoding="utf-8",
                )
            named = MOD.search_sessions(
                "what did we say in the cursor sitting about mcp_docker",
                [vault],
            )
            miss = MOD.search_sessions(
                "what did we say in the chatgpt sitting about purple zebra",
                [vault],
            )
        self.assertFalse(named["unknown"])
        self.assertIn("mcp_docker", named["spoken"])
        self.assertTrue(miss["unknown"])
        self.assertIn("UNKNOWN", miss["spoken"])

    def test_one_shared_word_is_not_a_sitting_title(self) -> None:
        with tempfile.TemporaryDirectory(prefix="jarvis-chats-weak-") as tmp:
            vault = Path(tmp)
            sess = vault / "CONTENT/os/sessions"
            sess.mkdir(parents=True)
            (sess / "Recent Conversations.md").write_text(
                "| surface | id | title | date | path |\n"
                "|---|---|---|---|---|\n"
                "| grok | `bbb` | Evidence & OSINT | 2026-08-27 | sessions/grok/bbb.md |\n"
                "| cursor | `aaa` | Finish the leftover Mac sitting | 2026-09-12 | sessions/cursor/aaa.md |\n",
                encoding="utf-8",
            )
            pasted = MOD.search_sessions("Forge PASS. Did Jev ship it?", [vault])
            still = MOD.search_sessions(
                "what did we say in Finish the leftover Mac sitting",
                [vault],
            )
        self.assertTrue(pasted["unknown"])
        self.assertNotIn("Evidence", pasted["spoken"])
        self.assertNotIn("Mac sitting", pasted["spoken"])
        self.assertFalse(still["unknown"])
        self.assertIn("Mac sitting", still["spoken"])


if __name__ == "__main__":
    unittest.main()
