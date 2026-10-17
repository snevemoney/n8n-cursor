"""Live 2026-10-13: "pull up my social bios" lost to the vault map. Title/folder + phrase boosts. Synthetic notes only."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrieve as R  # noqa: E402

ASK = "Jarvis, can you pull up my profile blurbs?"


def _score(path: Path, ask: str) -> int:
    return R._file_score(path, path.read_text(), R.tokens(ask), ask)


def test_filler_words_are_not_search_terms():
    assert R.tokens(ASK) == ["profile", "blurbs"]


def test_title_match_beats_a_named_map_note(tmp_path):
    note = tmp_path / "watch-later" / "PROFILE-BLURBS-2026-08-14.md"
    note.parent.mkdir()
    note.write_text("# Blurb drafts\nShort profile text for each handle.\n")
    vmap = tmp_path / "VAULT_MAP.md"
    vmap.write_text("# Vault map\nprofile rooms, notes, blurbs, everything\n" * 3)
    assert _score(note, ASK) > _score(vmap, ASK)


def test_one_shared_word_is_not_a_match_for_a_multiword_ask(tmp_path):
    other = tmp_path / "VAULT_MAP.md"
    other.write_text("# Vault map\nprofile everywhere\n")
    assert _score(other, "pull up my profile blurbs automations") <= 5
