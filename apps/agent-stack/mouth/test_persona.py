#!/usr/bin/env python3
"""Persona wrap: Sir, no blame, no waiting-for, no invented again."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent / "persona.py"


def _load():
    spec = importlib.util.spec_from_file_location("agent_stack_persona", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {SCRIPT}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load()


class PersonaWrapTest(unittest.TestCase):
    def test_wrap_addresses_sir_then_payload(self) -> None:
        out = MOD.wrap("Vault and hive are on the table.", verb="converse", utterance="what's going on")
        self.assertTrue(out.startswith("Sir."))
        self.assertIn("Vault and hive are on the table.", out)
        self.assertNotIn("waiting for", out.lower())
        self.assertNotIn("Then.", out)
        self.assertNotIn("Wires, not vibes", out)

    def test_converse_has_no_canned_wit(self) -> None:
        banned = (
            "Wires, not vibes",
            "The professional skills again",
            "Repetition is a kind of scholarship",
            "Then.",
        )
        for verb in ("converse", "status", "pipeline", "vault_read"):
            out = MOD.wrap("I'm listening.", verb=verb, utterance="how's it going")
            self.assertEqual(out, "Sir. I'm listening.", verb)
            for stamp in banned:
                self.assertNotIn(stamp, out, verb)

    def test_pack_prompt_is_a_leak(self) -> None:
        echo = (
            "Read the full context pack at this path. Do not guess the file. "
            "You are the coordinator. Cursor CLI is one worker, not the brain."
        )
        self.assertTrue(MOD.is_pack_leak(echo))

    def test_supportive_prose_is_not_a_pack_leak(self) -> None:
        self.assertTrue(MOD.is_pack_leak("I'm here."))
        self.assertTrue(MOD.is_pack_leak("I'm here. The store is on disk."))
        self.assertFalse(MOD.is_pack_leak("I'm here with you."))
        self.assertFalse(MOD.is_pack_leak("Keep a scratchpad nearby while you plan."))
        self.assertTrue(MOD.is_pack_leak("Here's a thinking process:\n1. Analyze User Input:"))
        kept = MOD.wrap("I'm here with you.", verb="converse", utterance="hey")
        self.assertIn("I'm here with you", kept)
        pad = MOD.wrap(
            "Keep a scratchpad nearby while you plan.",
            verb="converse",
            utterance="write a list",
        )
        self.assertIn("scratchpad", pad.lower())

    def test_both_dark_is_honest_status_not_error_gag(self) -> None:
        out = MOD.wrap("UNKNOWN. No live mouth this turn.", verb="converse")
        self.assertEqual(out, "Sir. UNKNOWN. No live mouth this turn.")
        self.assertNotIn("something went wrong", out.lower())

    def test_provider_miss_is_honest_status_not_error_gag(self) -> None:
        out = MOD.wrap("UNKNOWN. OpenRouter returned no text. http 429.", verb="converse")
        self.assertEqual(out, "Sir. UNKNOWN. OpenRouter returned no text. http 429.")
        self.assertNotIn("something went wrong", out.lower())

    def test_sitting_unknown_is_honest_status_not_error_gag(self) -> None:
        out = MOD.wrap("UNKNOWN. That sitting is not on this Mac.", verb="vault_read")
        self.assertEqual(out, "Sir. UNKNOWN. That sitting is not on this Mac.")
        self.assertNotIn("something went wrong", out.lower())

    def test_vision_dark_is_honest_status_not_error_gag(self) -> None:
        out = MOD.wrap("UNKNOWN. Vision model is dark.", verb="watch")
        self.assertEqual(out, "Sir. UNKNOWN. Vision model is dark.")
        self.assertNotIn("something went wrong", out.lower())

    def test_length_miss_is_honest_status_not_error_gag(self) -> None:
        out = MOD.wrap(
            "UNKNOWN. That answer ran out of room.",
            verb="converse",
        )
        self.assertEqual(out, "Sir. UNKNOWN. That answer ran out of room.")
        self.assertNotIn("something went wrong", out.lower())
        old = MOD.wrap(
            "UNKNOWN. OpenRouter returned no text. finish_reason=length.",
            verb="converse",
        )
        self.assertEqual(
            old, "Sir. UNKNOWN. OpenRouter returned no text. finish_reason=length."
        )

    def test_valid_technical_answers_survive_cleanup(self) -> None:
        """Codex repro: cleanup is for metadata and false SELF claims only."""
        rows = [
            "Nemotron is a family of language models developed by NVIDIA.",
            "AppleScript is a scripting language that automates applications on macOS.",
            'Use print({"greeting": "hello"}) to display the dictionary.',
            "Cited sources let readers verify where an assertion came from.",
        ]
        for reply in rows:
            out = MOD.wrap(reply, verb="converse")
            self.assertEqual(out, f"Sir. {reply}", out)

    def test_false_self_claim_still_scrubbed(self) -> None:
        out = MOD.wrap("I am Nemotron, a large language model.", verb="converse")
        self.assertEqual(out, "Sir. I am Jarvis on this Mac.")
        crumb = MOD.wrap("I scrolled via osascript.", verb="safari_see")
        self.assertNotIn("osascript", crumb)
        leak = MOD.wrap('{"tool": "vault_read", "args": {"q": 1}} The map lists rooms.', verb="converse")
        self.assertNotIn("vault_read", leak)
        self.assertIn("map lists rooms", leak)
        cited = MOD.wrap("Cited OPERATOR_MEMORY.md. The target is unmet.", verb="vault_read")
        self.assertNotIn("OPERATOR_MEMORY.md", cited)

    def test_failure_never_takes_blame(self) -> None:
        out = MOD.wrap("UNKNOWN. Cursor harness returned no reply.", verb="converse")
        self.assertIn("Naturally, it isn't my fault, sir", out)
        self.assertIn("UNKNOWN. Cursor harness returned no reply.", out)
        self.assertNotIn("I'm sorry", out)
        self.assertNotIn("I failed", out)
        self.assertNotIn("waiting for", out.lower())

    def test_strips_waiting_for_and_blame(self) -> None:
        raw = "I am sorry. Waiting for the harness. The repo has three apps."
        out = MOD.wrap(raw, verb="cursor", utterance="check my repo")
        self.assertTrue(out.startswith("Sir."))
        self.assertIn("The repo has three apps.", out)
        self.assertNotIn("waiting for", out.lower())
        self.assertNotIn("I am sorry", out)
        self.assertNotIn("I'm sorry", out)

    def test_safari_wrap_is_conversation_not_router(self) -> None:
        out = MOD.wrap(
            "You asked to open YouTube. Safari opened https://www.youtube.com.",
            verb="safari",
            utterance="Hi Jarvis open YouTube",
        )
        self.assertTrue(out.startswith("Sir."))
        self.assertIn("The tab, not the face.", out)
        self.assertIn("You asked to open YouTube", out)
        self.assertIn("https://www.youtube.com", out)
        self.assertNotIn("as requested", out.lower())
        self.assertNotIn("127.0.0.1:4018", out)

    def test_face_address_stays_when_the_ask_names_it(self) -> None:
        asked = MOD.wrap(
            "No. 127.0.0.1:4018 is not evenslouis.ca.",
            verb="converse",
            utterance="Is 127.0.0.1:4018 the same as evenslouis.ca?",
        )
        self.assertIn("127.0.0.1:4018", asked)
        self.assertIn("No", asked)
        leaked = MOD.wrap(
            "Open 127.0.0.1:4018 for me.",
            verb="converse",
            utterance="Open the local pane.",
        )
        self.assertNotIn("127.0.0.1:4018", leaked)
        proof = MOD.wrap(
            "127.0.0.1:4018 is not evenslouis.ca. I did not open either as proof.",
            verb="converse",
            utterance="A question about the public site. Which local face is not proof of it?",
        )
        self.assertIn("127.0.0.1:4018", proof)
        self.assertIn("evenslouis.ca", proof)
        self.assertFalse(MOD.local_face_subject("Open the local pane."))
        kept_pr = MOD.wrap(
            "PR 381 stays unmerged until a real merge. I will not pretend the merge.",
            verb="converse",
            utterance="What stays unmerged until a real merge?",
        )
        self.assertIn("PR 381", kept_pr)
        stripped = MOD.wrap(
            "PR 381 is mentioned in the log.",
            verb="converse",
            utterance="What is the weather?",
        )
        # PR numbers are never stripped now (live: "I don't see any reference to in ...").
        self.assertIn("PR 381", stripped)

    def test_cursor_selection_keeps_cursor_and_the_face_address(self) -> None:
        ask = "This is a code question for Cursor. Do not answer as if you drove Grok or Slack."
        self.assertTrue(MOD.cursor_selection_ask(ask))
        self.assertFalse(MOD.cursor_selection_ask("This is a code question for Cursor."))
        kept = MOD.wrap(
            "Select Cursor as the named platform. The Face is `127.0.0.1:4018`.",
            verb="converse",
            utterance=ask,
        )
        self.assertIn("Cursor", kept)
        self.assertIn("127.0.0.1:4018", kept)
        self.assertNotIn("` is", kept)

    def test_no_again_without_history(self) -> None:
        out = MOD.wrap("Clicked Login in Safari.", verb="safari", utterance="click Login")
        self.assertNotIn("again", out.lower())
        self.assertTrue(MOD.wrap("Found 1 local file.", verb="files", utterance="search my computer") )
        self.assertFalse(MOD.proven_repeat("click Login", turns=[], store_lines=[], scars=[]))

    def test_repeat_only_when_sitting_proves_it(self) -> None:
        turns = [{"user": "click Login", "jarvis": "Clicked Login in Safari."}]
        out = MOD.wrap(
            "Clicked Login in Safari.",
            verb="safari",
            utterance="click Login",
            turns=turns,
        )
        self.assertIn("again", out.lower())
        self.assertIn("Clicked Login in Safari.", out)
        fresh = MOD.wrap("Clicked Login in Safari.", verb="safari", utterance="click Login")
        self.assertNotIn("again", fresh.lower())

    def test_does_not_double_wrap(self) -> None:
        once = MOD.wrap("Standing by.", verb="greet")
        twice = MOD.wrap(once, verb="greet")
        self.assertEqual(once.count("Sir."), 1)
        self.assertEqual(twice, once)

    def test_dump_is_not_spoken_as_ask_log(self) -> None:
        dump = (
            "%%generated by scripts/hive/os/ask-log.py — do not hand-edit%% "
            "> [!abstract] Ask log > **709 asks** · 14 sessions"
        )
        out = MOD.wrap(dump, verb="converse", utterance="That's not what I said")
        self.assertNotIn("ask-log.py", out)
        self.assertNotIn("709 asks", out)
        self.assertNotIn("do not hand-edit", out.lower())
        self.assertIn("isn't my fault, sir", out)
        self.assertIn("file dump", out.lower())

    def test_stream_delta_wraps_once_then_payload(self) -> None:
        first = MOD.stream_delta("The mix is segment, then price.", first=True, verb="pro")
        second = MOD.stream_delta("Sir. Do not invent a KPI.", first=False, verb="pro")
        third = MOD.stream_delta(first, first=True, verb="pro")
        self.assertTrue(first.startswith("Sir."))
        self.assertEqual(first.count("Sir."), 1)
        self.assertNotIn("Sir.", second)
        self.assertIn("Do not invent a KPI.", second)
        self.assertEqual(third, first)
        self.assertNotIn("Sir. Sir.", first)

    def test_classify_distinction_is_kept(self) -> None:
        out = MOD.wrap(
            "Classify only, unless told otherwise. I will not delete.",
            verb="converse",
            utterance="Separate classify from act for delete the row.",
        )
        self.assertIn("Classify only", out)
        self.assertIn("will not delete", out)
        leaked = MOD.sanitize_payload("It was classified as a classify verb and then saved.")
        self.assertNotIn("classified as", leaked.lower())
        self.assertNotIn("classify verb", leaked.lower())

    def test_factory_leaks_are_stripped(self) -> None:
        raw = (
            "path=cgevent safari_act as requested. "
            "CGEvent page keys and Apple Events failed. "
            "Cited CONTENT/os/ASKS.md. Scar cursor-auth-dark already saved. "
            "Screen saved at /tmp/see.jpg. PR #200 PID 4018."
        )
        out = MOD.wrap(raw, verb="safari", utterance="scroll")
        low = out.lower()
        self.assertTrue(out.startswith("Sir."))
        self.assertNotIn("cgevent", low)
        self.assertNotIn("as requested", low)
        self.assertNotIn("safari_act", low)
        self.assertNotIn("apple events", low)
        self.assertNotIn("ask-log", low)
        self.assertNotIn("asks.md", low)
        self.assertNotIn("cursor-auth-dark", low)
        self.assertNotIn("/tmp/see.jpg", low)
        # Literal ids are answer content now, not crumbs.
        self.assertIn("PR #200", out)
        self.assertIn("PID 4018", out)

    def test_factory_close_and_grade_are_not_spoken(self) -> None:
        raw = (
            "2026-08-27T05:05:00Z · factory close — Watchdog GRADE **pass**. "
            "On disk: Website / AI Partner services. The store is still here."
        )
        out = MOD.wrap(raw, verb="status", utterance="Hey do you work now")
        low = out.lower()
        self.assertNotIn("watchdog", low)
        self.assertNotIn("factory close", low)
        self.assertNotIn("on disk:", low)
        self.assertNotIn("2026-08-27t05:05:00z", low)

    def test_wire_inspect_keeps_path_when_asked(self) -> None:
        out = MOD.wrap("Last hand: safari. path=cgevent. CGEvent page key dark", verb="wire")
        self.assertTrue(out.startswith("Sir."))
        self.assertIn("path=cgevent", out)
        self.assertIn("CGEvent", out)

    def test_nex_identity_is_stripped(self) -> None:
        hello = MOD.wrap(
            "Hello, I'm Nex — your AI coding assistant. How can I help you today?",
            verb="converse",
            utterance="Hello",
        )
        self.assertTrue(hello.startswith("Sir."))
        self.assertNotIn("Nex", hello)
        self.assertNotIn("coding assistant", hello.lower())
        self.assertIn("How can I help you today?", hello)
        deny = MOD.wrap(
            "Sorry, I'm Nex, from Nex-AGI. If you meant J.A.R.V.I.S. from Iron Man, I can imitate that style.",
            verb="converse",
            utterance="But you were supposed to be Jarvis",
        )
        self.assertNotIn("Nex", deny)
        self.assertIn("Jarvis", deny)
        self.assertNotIn("imitate", deny.lower())

    def test_looking_stamp_is_not_spoken(self) -> None:
        self.assertEqual(MOD.sanitize_payload("Looking."), "")
        self.assertEqual(MOD.sanitize_payload("Sir. Looking."), "")

    def test_pack_and_asks_are_not_spoken(self) -> None:
        raw = (
            "I heard you: He's Jarvis. Before that you said: stop. "
            "- 22:48 — If you don't know how to build your own agentic OS. "
            "Vault: adopted path missing The store is still on disk."
        )
        out = MOD.wrap(raw, verb="status", utterance="He's Jarvis")
        low = out.lower()
        self.assertNotIn("adopted path missing", low)
        self.assertNotIn("22:48", out)
        self.assertNotIn("agentic os", low)
        self.assertNotIn("i heard you", low)
        self.assertNotIn("before that you said", low)

    def test_wrap_never_emits_current_disk(self) -> None:
        out = MOD.wrap(
            "Current disk (authoritative over earlier turns this sitting): Acquire / Grow / Cut.",
            verb="vault_read",
            utterance="What constraint pattern is in my research lane note — Acquire, Grow, or Cut?",
        )
        self.assertNotIn("Current disk", out)
        self.assertIn("Acquire / Grow / Cut", out)

    def test_explicit_joke_topic_does_not_reuse_unrelated_history(self) -> None:
        prior = [{"user": "Explain why the sky is blue.", "jarvis": "Rayleigh scattering."}]
        self.assertEqual(MOD.operator_humour("Tell me one short joke about computers.", prior), "")
        self.assertEqual(MOD.operator_humour("Roast computers.", prior), "")
        self.assertEqual(MOD.operator_humour("Joke about my computer.", prior), "")
        self.assertIn("Sky-blue", MOD.operator_humour("Joke about me.", prior))

    def test_operator_humour_stays_off_ordinary_hands(self) -> None:
        self.assertEqual(MOD.operator_humour("Why is the sky blue?"), "")
        self.assertEqual(MOD.operator_humour("All right look at my last chat sessions of all the platforms now"), "")
        self.assertIn("0:00", MOD.operator_humour("Be honest. I hit focus 5 and stood down immediately."))
        self.assertIn("dispatch.md", MOD.operator_humour("Joke about me sending hello to cursor via dispatch.md."))
        self.assertIn("two hands", MOD.operator_humour("Joke about me asking the calendar then what you currently see."))
        self.assertIn("Honda", MOD.operator_humour("Roast the silver Honda Accord hoodie STT soup."))
        self.assertIn("fake exam", MOD.operator_humour("Be honest. The what is a mutex filler was a fake exam."))
        self.assertTrue(MOD.is_humour_ask("Joke about me saying Alexa to you."))
        self.assertFalse(MOD.is_humour_ask("about me"))

    def test_wrap_empty_payload_is_not_silence(self) -> None:
        out = MOD.wrap("", verb="converse", utterance="hey")
        self.assertTrue(out.startswith("Sir."))
        self.assertIn("one sentence", out.lower())

    def test_spoken_line_is_not_cloud_placeholder_or_live_claim(self) -> None:
        """Smoke S03/S04: do not speak the vault status or an unsolicited live stamp."""
        absent = "What color did I store under the namespace jarvis-e2e-absent-color-924?"
        live_ask = "Is Jarvis live?"
        cloud_lines = (
            "Live vault file is a cloud placeholder.",
            "Sir. Live vault file is a cloud placeholder.",
        )
        live_lines = (
            "Yes, Sir—I'm Jarvis and live.",
            "Yes, Sir—I’m Jarvis and live.",
            "Sir. Yes, Sir—I’m Jarvis and live.",
        )
        for raw in cloud_lines:
            spoken = MOD.wrap(raw, verb="vault_read", utterance=absent)
            delta = MOD.stream_delta(raw, first=True, verb="vault_read", utterance=absent)
            for out in (spoken, delta):
                low = out.lower()
                self.assertNotIn("cloud placeholder", low, out)
                self.assertNotIn("live vault file", low, out)
        for raw in live_lines:
            spoken = MOD.wrap(raw, verb="converse", utterance=live_ask)
            delta = MOD.stream_delta(raw, first=True, verb="converse", utterance=live_ask)
            for out in (spoken, delta):
                folded = out.lower().replace("\u2019", "'")
                self.assertNotIn("i'm jarvis and live", folded, out)
                self.assertNotRegex(folded, r"\bproven\b", out)
        kept = MOD.wrap("Begin with the calendar.", verb="converse", utterance="Good morning.")
        self.assertIn("Begin with the calendar.", kept)

    def test_cloud_status_names_the_tagged_thing(self) -> None:
        """A tool status must not collapse to the generic absence sentence."""
        raw = "Live vault file is a cloud placeholder."
        cases = (
            ("Retrieve the note tagged never-written-924.", "never-written-924", "note"),
            ("Retrieve the file tagged other-tag-1.", "other-tag-1", "file"),
        )
        for ask, token, noun in cases:
            spoken = MOD.wrap(raw, verb="vault_read", utterance=ask)
            delta = MOD.stream_delta(raw, first=True, verb="vault_read", utterance=ask)
            for out in (spoken, delta):
                low = out.lower()
                self.assertIn(token, out, out)
                self.assertIn(noun, low, out)
                self.assertIn("left uncreated", low, out)
                self.assertNotIn("i don't have that", low, out)
                self.assertNotIn("cloud placeholder", low, out)
        kept = MOD.wrap(
            "The note tagged never-written-924 is on the desk.",
            verb="vault_read",
            utterance="Retrieve the note tagged never-written-924.",
        )
        self.assertIn("on the desk", kept)
        self.assertNotIn("left uncreated", kept.lower())

    def test_sir_prefixed_cloud_status_does_not_collapse_to_sir(self) -> None:
        """A leading Sir. is the wrap. It must not hide the dropped cloud sentence."""
        ask = "Retrieve the note tagged never-written-924."
        echoes = (
            "Sir. Live vault file is a cloud placeholder.",
            "Sir. Unavailable (cloud placeholder): note.md.",
        )
        for raw in echoes:
            out = MOD.wrap(raw, verb="vault_read", utterance=ask)
            self.assertNotEqual(out.strip(), "Sir.", raw)
            self.assertIn("never-written-924", out, out)
            self.assertNotIn("cloud placeholder", out.lower(), out)
            self.assertNotIn("live vault file", out.lower(), out)
        bare = MOD.wrap("Sir.", verb="vault_read", utterance=ask)
        self.assertNotEqual(bare.strip(), "Sir.")
        self.assertIn("never-written-924", bare)

    def test_card_last4_is_not_spoken(self) -> None:
        raw = "Operator approved cancel (Squarespace $20, MC last-4 5964)."
        out = MOD.wrap(raw, verb="vault_read", utterance="Did any email leave, or any payment clear?")
        self.assertNotIn("5964", out)
        self.assertIn("redacted", out.lower())


if __name__ == "__main__":
    unittest.main()


class AuthoredResponsePreservationTest(unittest.TestCase):
    def test_explanations_are_not_internal_status(self):
        for answer in (
            "An agentic OS coordinates tools around a persistent goal. Independent verification checks the result.",
            "Waiting for the page to finish loading prevents a stale click. Then observe its current controls.",
            "We are waiting for approval before sending the message.",
        ):
            with self.subTest(answer=answer):
                self.assertFalse(MOD.is_pack_leak(answer))
                self.assertEqual(MOD.wrap(answer, verb="converse"), "Sir. " + answer)
                self.assertEqual(MOD.stream_delta(answer, first=False, verb="converse"), answer)

    def test_formatting_and_private_redaction_coexist(self):
        answer = "Two steps matter:\n\n1. Observe the current state.\n2. Verify the result.\n\nKeep those responsibilities separate."
        self.assertEqual(MOD.wrap(answer, verb="converse"), "Sir. " + answer)
        code = 'Example:\n\n```python\nif ready:\n    print("ready")\n```'
        self.assertEqual(MOD.sanitize_payload(code), code)
        private = answer + "\n\nCard last-4 1234."
        self.assertEqual(MOD.sanitize_payload(private), answer + "\n\ncard last-4 redacted.")
