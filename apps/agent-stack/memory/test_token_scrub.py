import importlib.util, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("dc_scrub_t", Path(__file__).with_name("document_context.py"))
D = importlib.util.module_from_spec(spec); spec.loader.exec_module(D)

class KeyFormatsAreMasked(unittest.TestCase):  # 10-17 security pass: six formats leaked through
    def test_every_key_format_is_masked(self):
        for v in ("sk-or-v1-" + "a" * 64, "xai-" + "e" * 80, "github_pat_" + "g" * 82, "sk_" + "k" * 48, "sk_live_" + "m" * 24,
                  "eyJ" + "n" * 30 + "." + "o" * 30 + "." + "p" * 30, "postgres://user:pa55word@db.example.com:5432/x",
                  "N8N_WEBHOOK_TOKEN=" + "q" * 30, "AIza" + "d" * 35, "ghp_" + "f" * 36):
            self.assertNotIn(v, D.scrub_text("value: " + v)[0], v[:12])

    def test_ordinary_text_is_untouched(self):
        for t in ("see https://github.com/browser-use/browser-use", "run python3 -m pytest -q", "the TOKEN_LIMIT is 4096",
                  "user@example.com wrote", "My_Billion_Dollar_Vault notes"):
            self.assertEqual(D.scrub_text(t)[0], t)

if __name__ == "__main__": unittest.main()
