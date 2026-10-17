import importlib.util, tempfile, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("undo_t", Path(__file__).with_name("undo_journal.py"))
U = importlib.util.module_from_spec(spec); spec.loader.exec_module(U)

class Undo(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); b = Path(self.tmp.name)
        self.job, self.trash, self.home = b / "job", b / "Trash", b / "home"; self.home.mkdir()

    def tearDown(self): self.tmp.cleanup()

    def test_edits_come_back_newest_first_and_created_files_go_to_the_trash(self):
        notes, new = self.home / "notes.md", self.home / "new.md"
        notes.write_text("his words\n")
        U.write(self.job, notes, "jarvis changed it\n"); U.write(self.job, new, "created\n")
        self.assertIn("Trash", U.undo(self.job, 1, self.trash)[0])
        self.assertFalse(new.exists()); self.assertEqual(len(list(self.trash.iterdir())), 1)
        self.assertIn("back", U.undo(self.job, 1, self.trash)[0]); self.assertEqual(notes.read_text(), "his words\n")
        self.assertIn("nothing", U.undo(self.job, 1, self.trash)[0])

    def test_a_file_he_changed_afterwards_is_left_alone(self):
        f = self.home / "plan.md"; f.write_text("v1\n")
        U.write(self.job, f, "jarvis v2\n"); f.write_text("Evens edited after\n")
        self.assertIn("left plan.md alone", U.undo(self.job, 1, self.trash)[0]); self.assertEqual(f.read_text(), "Evens edited after\n")

if __name__ == "__main__": unittest.main()
