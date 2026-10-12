#!/usr/bin/env python3
"""Store pack is the brain. No dump. No Cursor-as-skull."""
from __future__ import annotations

import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

SCRIPT = Path(__file__).resolve().parent / "store.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_store", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class StorePackTest(unittest.TestCase):
    def test_hive_block_names_the_four(self) -> None:
        with tempfile.TemporaryDirectory(prefix="agent-stack-store-") as tmp:
            hive = Path(tmp)
            (hive / "bus").mkdir()
            (hive / "agent-stack.json").write_text(
                '{"name":"hive","operator":"Evens","repo":"/repo","vault":{"path":"/vault"}}\n',
                encoding="utf-8",
            )
            text = MOD.hive_block(hive)
        self.assertIn("Store (this is the brain)", text)
        self.assertIn("/vault", text)
        self.assertIn("/repo", text)
        self.assertIn("Hive: hive", text)

    def test_sessions_block_off_when_not_live(self) -> None:
        self.assertEqual(MOD.sessions_block(live=False), "")


class LifeCardTest(unittest.TestCase):
    def test_life_card_uses_lanes_and_never_invents_age(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_life", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        with tempfile.TemporaryDirectory(prefix="agent-stack-life-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Four north stars start with maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            out = ret.life_card([vault])
        self.assertIn("Evens", out["spoken"])
        self.assertIn("UNKNOWN", out["spoken"])
        self.assertIn("Age", out["spoken"])
        self.assertNotRegex(out["spoken"], r"\b(2[0-9]|[3-8][0-9])\s+years old\b")

    def test_news_signals_unknown_never_invents_headline(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_news", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        with tempfile.TemporaryDirectory(prefix="agent-stack-news-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text("north stars only\n", encoding="utf-8")
            out = ret.news_signals("what's the news", [vault])
        self.assertTrue(out["unknown"])
        self.assertIn("UNKNOWN", out["spoken"])
        self.assertIn("will not invent headlines", out["spoken"].lower())
        self.assertNotIn("breaking", out["spoken"].lower())


class VaultSummaryTest(unittest.TestCase):
    def test_vault_summary_is_the_map_not_the_pile(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_map", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        self.assertTrue(ret.wants_vault_summary("Can you give me a summary of the whole vault"))
        self.assertTrue(ret.wants_vault_summary("every single thing in obsidian"))
        self.assertTrue(ret.wants_vault_summary("obsidian every node every memory"))
        self.assertFalse(ret.wants_vault_summary("Can you see my obsidian vault"))
        self.assertFalse(ret.wants_vault_summary("the whole shelf"))
        with tempfile.TemporaryDirectory(prefix="agent-stack-vault-map-") as tmp:
            vault = Path(tmp)
            (vault / "CONTENT").mkdir(parents=True)
            (vault / "CONTENT" / "VAULT_MAP.md").write_text(
                "## Rooms (do not crawl)\n"
                "\n"
                "| Room | What | Open first |\n"
                "|------|------|------------|\n"
                "| Root notes | OM | OPERATOR_MEMORY.md |\n"
                "| `CONTENT/` | packs | Knowledge Library |\n"
                "| `PROJECTS/` | surfaces | proof-qc-assist.md |\n"
                "| `wiki/` | generated | Do not crawl |\n",
                encoding="utf-8",
            )
            spoken = ret.speak_vault_summary([vault])
        self.assertIn("Outer Heaven", spoken)
        self.assertIn("knowledge", spoken)
        self.assertIn("projects", spoken)
        self.assertIn("Name a room", spoken)
        self.assertNotIn("wiki", spoken.lower())
        self.assertNotIn("633", spoken)
        self.assertNotIn("UNKNOWN", spoken)
        self.assertNotIn("/", spoken)


class SpeakStoreTest(unittest.TestCase):
    def test_asks_and_timestamps_are_not_spoken(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_speak", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        with tempfile.TemporaryDirectory(prefix="agent-stack-speak-") as tmp:
            vault = Path(tmp)
            (vault / "CONTENT/os").mkdir(parents=True)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "North star: maximum leverage, minimum noise.\n",
                encoding="utf-8",
            )
            (vault / "CONTENT/os/ASKS.md").write_text(
                "- 22:48 — If you don't know how to build your own agentic OS, "
                "then you are falling behind. Jarvis setup is not the value.\n",
                encoding="utf-8",
            )
            (vault / "CONTENT/os/hot.md").write_text(
                "- 2026-08-27T05:05:00Z · factory close — Watchdog GRADE **pass** "
                "(V2 + host-gate). Forge typecheck pass.\n"
                "- A human line about leverage is fine.\n",
                encoding="utf-8",
            )
            greet = ret.speak_store("He's Jarvis", [vault], greet=True)
            work = ret.speak_store("Hey do you work now", [vault], greet=False)
            can = ret.speak_store("What can you do?", [vault], can_do=True)
            hot = ret.speak_hot([vault])
            found = ret.search("Hey do you work now", [vault])
        self.assertNotIn("adopted path missing", greet.lower())
        self.assertNotIn("22:48", greet)
        self.assertNotIn("agentic OS", greet)
        self.assertEqual(greet, "")
        self.assertEqual(work, "")
        self.assertEqual(can, "")
        self.assertNotIn("I'm here.", greet)
        self.assertNotIn("On disk:", greet)
        self.assertNotIn(ret.LANES_DEFAULT, greet)
        self.assertNotIn(ret.LANES_DEFAULT, work)
        self.assertNotIn(ret.LANES_DEFAULT, can)
        self.assertNotIn("structured long-term memory", work.lower())
        self.assertNotIn("22:48", work)
        self.assertNotIn("agentic OS", work)
        self.assertNotIn("Watchdog", work)
        self.assertNotIn("factory close", work.lower())
        self.assertNotIn("Watchdog", hot)
        self.assertNotIn("factory close", hot.lower())
        self.assertIn("leverage", hot.lower())
        self.assertTrue(found.get("brief"))
        self.assertTrue(ret.is_speak_leak(str(found.get("brief") or "")) or "22:48" in str(found.get("brief") or "") or "structured" in str(found.get("brief") or ""))
        self.assertNotIn("22:48", found.get("spoken") or "")
        self.assertNotIn("agentic OS", found.get("spoken") or "")

    def test_cheat_sheet_wiki_is_brief_not_spoken(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_cheats", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        wiki = (
            "Per-agent business cheat sheets live under CONTENT/business-kits/ "
            "(cache SSOT → git → vault). Skills: Grok shared workflows + [[x]]; "
            "METHODS/ only after proven."
        )
        with tempfile.TemporaryDirectory(prefix="agent-stack-cheats-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text(wiki + "\n", encoding="utf-8")
            found = ret.search("Where do the cheat sheets live?", [vault])
        spoken = found.get("spoken") or ""
        brief = found.get("brief") or ""
        self.assertTrue(ret.is_speak_leak(wiki))
        self.assertTrue(brief)
        self.assertNotIn("Per-agent business cheat sheets", spoken)
        self.assertNotIn("cache SSOT", spoken)
        self.assertNotIn("METHODS/", spoken)
        self.assertNotIn("Grok shared workflows", spoken)

    def test_operator_memory_preamble_is_skipped_for_about_me(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_preamble", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        with tempfile.TemporaryDirectory(prefix="agent-stack-preamble-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "This document is the structured long-term memory for the hive.\n\n"
                "Evens Louis is the operator of hive-os.\n",
                encoding="utf-8",
            )
            found = ret.search("Evens Louis operator hive-os lane", [vault])
        self.assertFalse(found.get("unknown"), found)
        self.assertIn("hive-os", (found.get("spoken") or "").lower())
        self.assertNotIn("structured long-term memory", (found.get("spoken") or "").lower())
        self.assertTrue(found.get("hits"))

    def test_about_me_prefers_name_over_domain(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_name", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        with tempfile.TemporaryDirectory(prefix="agent-stack-name-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Tier 3 HITL stays evenslouis.ca/pro.\n\n"
                "Evens Louis is the operator of hive-os.\n",
                encoding="utf-8",
            )
            found = ret.search("Evens Louis operator hive-os lane", [vault])
        spoken = found.get("spoken") or ""
        self.assertIn("Evens Louis", spoken)
        self.assertIn("hive-os", spoken.lower())
        self.assertNotIn("evenslouis.ca", spoken.lower())

    def test_empty_vault_path_is_not_cwd(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_cwd", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        self.assertIsNone(ret.configured_dir(""))
        self.assertIsNone(ret.configured_dir("."))
        roots = ret.vault_oh_roots()
        cwd = Path.cwd().resolve()
        self.assertTrue(roots)
        self.assertNotIn(cwd, [path.resolve() for path in roots])
        self.assertTrue(any(path.name == "00_Outer_Heaven" for path in roots))

    def test_empty_search_is_honest_disk_line(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_empty", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        with tempfile.TemporaryDirectory(prefix="agent-stack-empty-") as tmp:
            vault = Path(tmp)
            vault.mkdir(parents=True, exist_ok=True)
            found = ret.search("xyzzy-no-such-token", [vault])
        self.assertTrue(found.get("unknown"))
        self.assertEqual(found.get("spoken"), "I don't have that on disk.")
        self.assertTrue(hasattr(ret, "vault_oh_roots"))


class VaultGateTest(unittest.TestCase):
    def _ret(self):
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_gate", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        return ret

    def test_live_twin_beats_stale_repo_keyword_score(self) -> None:
        ret = self._ret()
        with tempfile.TemporaryDirectory(prefix="vault-gate-twin-") as tmp:
            live = Path(tmp) / "live"
            stale = Path(tmp) / "repo"
            note = "CONTENT/os/jarvis-bite2-fixtures/same-topic.md"
            for root, body in (
                (live, "# Same topic\n\nlive lamp code ALPHA-LIVE\n"),
                (
                    stale,
                    "# Same topic\n\n"
                    + ("stale stale stale " * 40)
                    + "lamp code STALE-REPO\n",
                ),
            ):
                dest = root / note
                dest.parent.mkdir(parents=True)
                dest.write_text(body, encoding="utf-8")
            with mock.patch.object(ret, "REPO_OH", stale):
                found = ret.search("what is the lamp code for the same topic note", [live, stale])
        self.assertFalse(found.get("unknown"), found)
        self.assertEqual(found.get("source"), "live_vault")
        spoken = found.get("spoken") or ""
        self.assertIn("ALPHA-LIVE", spoken)
        self.assertNotIn("STALE-REPO", spoken)
        self.assertEqual((found.get("hits") or [{}])[0].get("source"), "live_vault")

    def test_blocked_namespace_is_not_searchable(self) -> None:
        ret = self._ret()
        with tempfile.TemporaryDirectory(prefix="vault-gate-block-") as tmp:
            vault = Path(tmp)
            secret = vault / "secrets" / "blocked.md"
            secret.parent.mkdir(parents=True)
            secret.write_text("# Blocked\nSECRET_TOKEN_9Z\n", encoding="utf-8")
            obs = vault / ".obsidian" / "hidden.md"
            obs.parent.mkdir(parents=True)
            obs.write_text("# Hidden\nOBSIDIAN_TOKEN_9Z\n", encoding="utf-8")
            desk = vault / "CONTENT" / "hive" / "desk" / "leak.md"
            desk.parent.mkdir(parents=True)
            desk.write_text("# Desk\nDESK_TOKEN_9Z\n", encoding="utf-8")
            ok = vault / "CONTENT" / "os" / "ok.md"
            ok.parent.mkdir(parents=True)
            ok.write_text("# Ok\nAPPROVED_TOKEN_9Z\n", encoding="utf-8")
            found = ret.search("SECRET_TOKEN_9Z OBSIDIAN_TOKEN_9Z DESK_TOKEN_9Z APPROVED_TOKEN_9Z", [vault])
        spoken = found.get("spoken") or ""
        brief = found.get("brief") or ""
        blob = spoken + brief
        self.assertIn("APPROVED_TOKEN_9Z", blob)
        self.assertNotIn("SECRET_TOKEN_9Z", blob)
        self.assertNotIn("OBSIDIAN_TOKEN_9Z", blob)
        self.assertNotIn("DESK_TOKEN_9Z", blob)

    def test_score_uses_path_heading_and_recency(self) -> None:
        ret = self._ret()
        with tempfile.TemporaryDirectory(prefix="vault-gate-score-") as tmp:
            vault = Path(tmp)
            old = vault / "CONTENT" / "os" / "old-note.md"
            new = vault / "CONTENT" / "os" / "latest-decision.md"
            old.parent.mkdir(parents=True)
            old.write_text(
                "decision decision decision decision decision\nbody only\n",
                encoding="utf-8",
            )
            new.write_text(
                "---\ntitle: Project decision\n---\n\n# Project decision\n\nShip the live vault.\n",
                encoding="utf-8",
            )
            import os
            import time

            past = time.time() - 40 * 86400
            os.utime(old, (past, past))
            found = ret.search("latest project decision", [vault])
        self.assertFalse(found.get("unknown"), found)
        self.assertIn("latest-decision.md", str((found.get("hits") or [{}])[0].get("path") or ""))

    def test_denied_dirs_are_not_entered(self) -> None:
        ret = self._ret()
        with tempfile.TemporaryDirectory(prefix="vault-gate-prune-") as tmp:
            vault = Path(tmp)
            ok = vault / "CONTENT" / "os" / "ok.md"
            ok.parent.mkdir(parents=True)
            ok.write_text("# Ok\nAPPROVED_WALK_9Z\n", encoding="utf-8")
            trap = vault / "CONTENT" / "os" / "sessions" / "trap.md"
            trap.parent.mkdir(parents=True)
            trap.write_text("# Trap\nTRAP_WALK_9Z\n", encoding="utf-8")
            walked: list[str] = []
            real_walk = os.walk

            def wrapped(top, **kwargs):
                for dirpath, dirnames, filenames in real_walk(top, **kwargs):
                    walked.append(dirpath)
                    yield dirpath, dirnames, filenames

            with mock.patch.object(os, "walk", side_effect=wrapped):
                found = ret.search("APPROVED_WALK_9Z TRAP_WALK_9Z", [vault])
        blob = (found.get("spoken") or "") + (found.get("brief") or "")
        self.assertIn("APPROVED_WALK_9Z", blob)
        self.assertNotIn("TRAP_WALK_9Z", blob)
        self.assertFalse(any("sessions" in Path(p).parts for p in walked))

    def test_now_does_not_let_hive_train_beat_lamp_note(self) -> None:
        ret = self._ret()
        with tempfile.TemporaryDirectory(prefix="vault-gate-now-") as tmp:
            vault = Path(tmp)
            train = vault / "CONTENT" / "knowledge" / "hive-daily-train.md"
            train.parent.mkdir(parents=True)
            train.write_text(
                "# Hive daily TRAIN\n" + ("now hive code now hive code " * 20) + "\n",
                encoding="utf-8",
            )
            note = vault / "CONTENT" / "os" / "jarvis-bite2-fixtures" / "nested-fact.md"
            note.parent.mkdir(parents=True)
            note.write_text("# Nested lamp fact\nThe nested hive lamp code is BITE2-LAMP-NOW.\n", encoding="utf-8")
            found = ret.search("what is the nested hive lamp code now", [vault])
        self.assertFalse(found.get("unknown"), found)
        self.assertIn("BITE2-LAMP-NOW", found.get("spoken") or "")
        self.assertIn("nested-fact.md", str((found.get("hits") or [{}])[0].get("path") or ""))

    def test_distinctive_token_miss_does_not_ride_common_words(self) -> None:
        ret = self._ret()
        with tempfile.TemporaryDirectory(prefix="vault-gate-distinct-") as tmp:
            vault = Path(tmp)
            note = vault / "CONTENT" / "os" / "operator.md"
            note.parent.mkdir(parents=True)
            note.write_text("# Operator\nA note about a token and status.\n", encoding="utf-8")
            found = ret.search("what is the BITE2-BLOCKED-TOKEN-ZZ9 note", [vault])
        blob = (found.get("spoken") or "") + (found.get("brief") or "")
        self.assertTrue(found.get("unknown"), found)
        self.assertNotIn("Operator", blob)

    def test_nested_content_note_is_found(self) -> None:
        ret = self._ret()
        with tempfile.TemporaryDirectory(prefix="vault-gate-nested-") as tmp:
            vault = Path(tmp)
            note = vault / "CONTENT" / "os" / "jarvis-bite2-fixtures" / "nested-fact.md"
            note.parent.mkdir(parents=True)
            note.write_text("# Nested lamp\nThe nested lamp code is NEST-77.\n", encoding="utf-8")
            found = ret.search("what is the nested lamp code", [vault])
        self.assertFalse(found.get("unknown"), found)
        self.assertIn("NEST-77", found.get("spoken") or "")
        self.assertEqual(found.get("source"), "live_vault")

    def test_session_archive_is_not_vault_searchable(self) -> None:
        ret = self._ret()
        with tempfile.TemporaryDirectory(prefix="vault-gate-sess-") as tmp:
            vault = Path(tmp)
            archive = vault / "CONTENT" / "os" / "sessions" / "jarvis" / "today.md"
            archive.parent.mkdir(parents=True)
            archive.write_text("# Face log\nThe nested hive lamp code is BITE2-LAMP-STALE.\n", encoding="utf-8")
            note = vault / "CONTENT" / "os" / "jarvis-bite2-fixtures" / "nested-fact.md"
            note.parent.mkdir(parents=True)
            note.write_text("# Nested lamp\nThe nested hive lamp code is BITE2-LAMP-LIVE.\n", encoding="utf-8")
            found = ret.search("what is the nested hive lamp code", [vault])
        spoken = found.get("spoken") or ""
        brief = found.get("brief") or ""
        self.assertIn("BITE2-LAMP-LIVE", spoken + brief)
        self.assertNotIn("BITE2-LAMP-STALE", spoken)
        self.assertNotIn("BITE2-LAMP-STALE", brief)


class GoldLocatorRetrieveTest(unittest.TestCase):
    def test_named_notes_speak_the_body_line(self) -> None:
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_gold", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        with tempfile.TemporaryDirectory(prefix="agent-stack-gold-loc-") as tmp:
            vault = Path(tmp)
            (vault / "CONTENT" / "topics").mkdir(parents=True)
            (vault / "CONTENT" / "os" / "reports").mkdir(parents=True)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "# Operator Memory\n\nOptimize while **protecting attention**.\n"
                "Which one constraint pattern (Acquire / Grow / Cut) shows up?\n",
                encoding="utf-8",
            )
            (vault / "NORTH_STAR.md").write_text(
                "Thesis a one-person business that behaves like a company.\n",
                encoding="utf-8",
            )
            (vault / "OUTER_HEAVEN_GLOSSARY.md").write_text(
                "# Glossary\n\n| Philanthropy | philanthropic-ai-agent |\n",
                encoding="utf-8",
            )
            (vault / "WEEKLY_SCOREBOARD.md").write_text(
                "# Weekly\n\n| 20hr target met? | no |\n",
                encoding="utf-8",
            )
            (vault / "CONTENT" / "LANE.md").write_text(
                "Which one constraint pattern (Acquire / Grow / Cut) shows up?\n",
                encoding="utf-8",
            )
            (vault / "CONTENT" / "topics" / "live-facts-hive-os.md").write_text(
                "# facts\n\n**Building mode** — no selling.\n",
                encoding="utf-8",
            )
            (vault / "CONTENT" / "os" / "reports" / "mentor.md").write_text(
                "- SITTING: orb talk animation is janky when it speaks\n",
                encoding="utf-8",
            )
            rows = (
                ("What do my operator memory four north stars say about leverage and attention?", "protecting attention"),
                ("What is my north star thesis about a one-person business?", "one-person business that behaves like a company"),
                ("In my Outer Heaven glossary, what is Philanthropy?", "philanthropic-ai-agent"),
                ("What does my weekly scoreboard say about the 20hr target?", "20hr target met"),
                ("What constraint pattern is in my research lane note — Acquire, Grow, or Cut?", "Acquire / Grow / Cut"),
                ("What do the hive-os live facts say about building mode?", "Building mode"),
                ("What sitting is written in tonight's mentor pass report?", "orb talk animation is janky"),
            )
            for prompt, needle in rows:
                found = ret.search(prompt, [vault])
                blob = str(found.get("spoken") or "")
                self.assertIn(needle, blob, msg=f"{prompt} -> {blob}")
            miss = ret.search("What does my note on quantum-turtle-invoices say?", [vault])
            self.assertTrue(miss.get("unknown"))


class DatalessRetrieveTest(unittest.TestCase):
    def _ret(self):
        retrieve = Path(__file__).resolve().parent / "retrieve.py"
        spec = importlib.util.spec_from_file_location("agent_stack_retrieve_dataless", retrieve)
        if spec is None or spec.loader is None:
            self.fail("retrieve missing")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        return ret

    def test_dataless_live_uses_mirror_not_empty_vault(self) -> None:
        ret = self._ret()
        with tempfile.TemporaryDirectory(prefix="vault-dataless-mirror-") as tmp:
            live = Path(tmp) / "live"
            mirror = Path(tmp) / "repo"
            live.mkdir()
            mirror.mkdir()
            (live / "OPERATOR_MEMORY.md").write_text(
                "LIVE_TOKEN_DATALESS_SHOULD_NOT_BE_READ hive-os\n",
                encoding="utf-8",
            )
            (mirror / "OPERATOR_MEMORY.md").write_text(
                "Evens Louis is the operator of hive-os. TOKEN_MIRROR_OK\n",
                encoding="utf-8",
            )

            def unavail(path: Path) -> bool:
                return "live" in str(path) and path.name == "OPERATOR_MEMORY.md"

            with mock.patch.object(ret, "REPO_OH", mirror):
                with mock.patch.object(ret, "is_unavailable_placeholder", side_effect=unavail):
                    found = ret.search("What is my token hive-os", [live, mirror])
        spoken = found.get("spoken") or ""
        self.assertFalse(found.get("unknown"), found)
        self.assertIn("TOKEN_MIRROR_OK", spoken)
        self.assertNotIn("LIVE_TOKEN_DATALESS", spoken)
        self.assertNotEqual(spoken, "I don't have that on disk.")
        skipped = found.get("unavailable") or []
        self.assertTrue(any(row.get("used_mirror") for row in skipped), skipped)
        self.assertEqual(found.get("source"), "repo_mirror")

    def test_dataless_without_mirror_is_placeholder_not_empty(self) -> None:
        ret = self._ret()
        with tempfile.TemporaryDirectory(prefix="vault-dataless-only-") as tmp:
            live = Path(tmp)
            (live / "OPERATOR_MEMORY.md").write_text(
                "LIVE_ONLY_SHOULD_NOT_BE_READ hive-os token\n",
                encoding="utf-8",
            )
            with mock.patch.object(ret, "is_unavailable_placeholder", return_value=True):
                found = ret.search("What is my token hive-os", [live])
        self.assertTrue(found.get("unknown"), found)
        self.assertEqual(found.get("spoken"), ret.CLOUD_PLACEHOLDER)
        self.assertTrue(found.get("unavailable"))
        self.assertNotEqual(found.get("spoken"), "I don't have that on disk.")

    def test_identical_search_reads_once(self) -> None:
        ret = self._ret()
        reads: list[str] = []
        orig = ret.read_local_text

        def wrap(path, cap):
            reads.append(str(path))
            return orig(path, cap)

        with tempfile.TemporaryDirectory(prefix="vault-search-once-") as tmp:
            vault = Path(tmp)
            (vault / "OPERATOR_MEMORY.md").write_text(
                "Evens Louis hive-os lane token ALPHA-ONCE\n",
                encoding="utf-8",
            )
            with mock.patch.object(ret, "read_local_text", side_effect=wrap):
                first = ret.search("What is my token hive-os", [vault])
                n = len(reads)
                second = ret.search("What is my token hive-os", [vault])
                third = ret.search("What is my token hive-os", [vault])
        self.assertFalse(first.get("unknown"), first)
        self.assertEqual(first.get("spoken"), second.get("spoken"))
        self.assertEqual(second.get("spoken"), third.get("spoken"))
        self.assertGreater(n, 0)
        self.assertEqual(len(reads), n)

    def test_bounded_read_skips_hang(self) -> None:
        ret = self._ret()
        ret.READ_JOIN_S = 0.12

        def hang(path):
            import time

            time.sleep(3)
            return path.open("r", encoding="utf-8", errors="ignore")

        with tempfile.TemporaryDirectory(prefix="vault-read-hang-") as tmp:
            path = Path(tmp) / "OPERATOR_MEMORY.md"
            path.write_text("hang\n", encoding="utf-8")
            with mock.patch.object(ret, "_open_text", side_effect=hang):
                text, reason = ret.read_local_text(path, 80)
        self.assertIsNone(text)
        self.assertEqual(reason, "timeout")


if __name__ == "__main__":
    unittest.main()


class OptionalVaultSummaryReadTest(unittest.TestCase):
    def test_unavailable_map_is_skipped_and_a_later_local_map_can_answer(self):
        spec = importlib.util.spec_from_file_location("vault_summary_unavailable", SCRIPT.parent / "retrieve.py")
        ret = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ret)
        for reason in ("dataless", "timeout", "empty", "OSError"):
            with self.subTest(reason=reason), tempfile.TemporaryDirectory() as tmp:
                first, second = Path(tmp)/"first", Path(tmp)/"second"
                first.mkdir()
                second.mkdir()
                (first/"VAULT_MAP.md").touch()
                (second/"VAULT_MAP.md").touch()
                with mock.patch.object(ret,"read_local_text",return_value=(None,reason)):
                    self.assertEqual(ret.speak_vault_summary([first]), "")
                with mock.patch.object(ret,"read_local_text",side_effect=[(None,reason),("The map is local.",None)]):
                    self.assertIn("Outer Heaven",ret.speak_vault_summary([first,second]))


class RemovedLiveFactPrecedenceTest(unittest.TestCase):
    def retrieve(self):
        path=Path(__file__).resolve().parent/'retrieve.py'
        spec=importlib.util.spec_from_file_location('removed_live_fact_retrieve',path)
        mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod

    def test_removed_or_empty_current_fact_cannot_resurrect_from_mirror(self):
        for body in ('# Current note\nThe old project has been removed.\n',''):
            for hide_twin in (False,True):
                with self.subTest(empty=not body,hide_twin=hide_twin), tempfile.TemporaryDirectory() as tmp:
                    ret=self.retrieve();live=Path(tmp)/'live';repo=Path(tmp)/'repo';rel='CONTENT/os/jarvis-bite2-fixtures/current-note.md'
                    mirror=repo/rel;current=live/rel
                    for p,text in ((mirror,'# Current note\nThe project label is OBSOLETE-ZZ924.\n'),(current,body)):
                        p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
                    with mock.patch.object(ret,'REPO_OH',repo),mock.patch.object(ret,'BODY_SCAN_CAP',1):
                        if hide_twin:
                            with mock.patch.object(ret,'candidate_files',return_value=[mirror]):out=ret.search('What is OBSOLETE-ZZ924?',[repo,live])
                        else:out=ret.search('What is OBSOLETE-ZZ924?',[repo,live])
                    self.assertTrue(out['unknown'],out);self.assertEqual(out['hits'],[])
                    self.assertNotIn('OBSOLETE-ZZ924',out['spoken'])

    def test_direct_twin_lookup_does_not_follow_a_link_outside_live_root(self):
        with tempfile.TemporaryDirectory() as tmp:
            ret=self.retrieve();live=Path(tmp)/'live';repo=Path(tmp)/'repo';rel='CONTENT/os/jarvis-bite2-fixtures/current-note.md'
            mirror=repo/rel;mirror.parent.mkdir(parents=True);mirror.write_text('# Current note\nProject label VALID-ZZ924.\n')
            outside=Path(tmp)/'outside.md';outside.write_text('# Outside\nSECRET-ZZ924.\n')
            twin=live/rel;twin.parent.mkdir(parents=True);twin.symlink_to(outside)
            with mock.patch.object(ret,'REPO_OH',repo),mock.patch.object(ret,'candidate_files',return_value=[mirror]):
                out=ret.search('What is VALID-ZZ924?',[repo,live])
            self.assertEqual(out['hits'][0]['source'],'repo_mirror')
            self.assertNotIn('SECRET-ZZ924',str(out))

class MemoryAnswerCacheFreshnessTest(unittest.TestCase):
    def retrieve(self):
        path = Path(__file__).resolve().parent / 'retrieve.py'
        spec = importlib.util.spec_from_file_location('answer_cache_freshness', path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def test_same_query_rereads_changed_bytes_even_with_restored_mtime(self):
        with tempfile.TemporaryDirectory() as tmp:
            ret = self.retrieve()
            root = Path(tmp)
            path = root / 'OPERATOR_MEMORY.md'
            path.write_text('Favorite marker CACHE-ALPHA.\n')
            with mock.patch.object(ret.time, 'time', return_value=1000):
                before = ret.search('Favorite marker', [root])
                prior = path.stat()
                path.write_text('Favorite marker CACHE-BRAVO.\n')
                os.utime(path, ns=(prior.st_atime_ns, prior.st_mtime_ns))
                after = ret.search('Favorite marker', [root])
            self.assertIn('CACHE-ALPHA', before['spoken'])
            self.assertIn('CACHE-BRAVO', after['spoken'])
            self.assertNotIn('CACHE-ALPHA', after['spoken'])

    def test_removed_note_does_not_reuse_cached_answer(self):
        with tempfile.TemporaryDirectory() as tmp:
            ret = self.retrieve()
            root = Path(tmp)
            path = root / 'OPERATOR_MEMORY.md'
            path.write_text('Favorite marker CACHE-ALPHA.\n')
            with mock.patch.object(ret.time, 'time', return_value=1000):
                self.assertFalse(ret.search('Favorite marker', [root])['unknown'])
                path.unlink()
                self.assertTrue(ret.search('Favorite marker', [root])['unknown'])

    def test_materialized_live_counterpart_invalidates_cached_mirror(self):
        with tempfile.TemporaryDirectory() as tmp:
            ret = self.retrieve()
            live, repo = Path(tmp)/'live', Path(tmp)/'repo'
            live.mkdir(); repo.mkdir()
            (repo/'OPERATOR_MEMORY.md').write_text('Favorite marker CACHE-ALPHA.\n')
            with mock.patch.object(ret, 'REPO_OH', repo), mock.patch.object(ret.time, 'time', return_value=1000):
                before = ret.search('Favorite marker', [repo, live])
                (live/'OPERATOR_MEMORY.md').write_text('Favorite marker CACHE-BRAVO.\n')
                after = ret.search('Favorite marker', [repo, live])
            self.assertEqual(before['source'], 'repo_mirror')
            self.assertEqual(after['source'], 'live_vault')
            self.assertIn('CACHE-BRAVO', after['spoken'])

    def test_timeout_can_recover_without_source_metadata_change(self):
        with tempfile.TemporaryDirectory() as tmp:
            ret = self.retrieve(); root = Path(tmp)
            (root/'OPERATOR_MEMORY.md').write_text('Favorite marker CACHE-BRAVO.\n')
            original = ret.read_local_text
            with mock.patch.object(ret.time, 'time', return_value=1000):
                with mock.patch.object(ret, 'read_local_text', return_value=(None, 'timeout')):
                    self.assertTrue(ret.search('Favorite marker', [root])['unknown'])
                after = ret.search('Favorite marker', [root])
            self.assertFalse(after['unknown'])
            self.assertIn('CACHE-BRAVO', after['spoken'])
