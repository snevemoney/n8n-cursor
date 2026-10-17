import importlib.util, tempfile, unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("tool_catalog_t", Path(__file__).with_name("tool_catalog.py"))
C = importlib.util.module_from_spec(spec); spec.loader.exec_module(C)

def lister(n):
    if n == "n8n":
        return {"ok": False, "spoken": "n8n (http) failed: 401"}
    if n == "boom":
        raise RuntimeError("crash")
    return {"ok": True, "tools": {"deckcraft": ["new_presentation", "save_presentation"], "pdfcraft": ["doc_open", "doc_save"]}[n]}

class ToolCatalog(unittest.TestCase):
    def test_search_across_servers_and_name_the_ones_down(self):
        cache = Path(tempfile.mkdtemp()) / "cat.json"
        C.refresh(["deckcraft", "pdfcraft", "n8n", "boom"], lister, cache)
        out = C.search("save", cache)
        self.assertIn("2 of 4 servers answered", out); self.assertIn("not answering: boom, n8n", out)
        self.assertIn("- deckcraft: save_presentation", out); self.assertIn("- pdfcraft: doc_save", out)
        self.assertIn("No tool matches", C.search("calendar", cache))

    def test_missing_required_arguments_come_from_the_servers_schema(self):
        cache = Path(tempfile.mkdtemp()) / "cat.json"
        C.refresh(["deckcraft"], lambda n: {"ok": True, "tools": ["save_presentation"], "required": {"save_presentation": ["path"]}}, cache)
        self.assertEqual(C.missing_args("deckcraft", "save_presentation", {}, cache), ["path"])
        self.assertEqual(C.missing_args("deckcraft", "save_presentation", {"path": "/x.pptx"}, cache), [])
        self.assertEqual(C.missing_args("unknown", "t", {}, cache), [])

    def test_no_catalog_yet_says_so(self):
        self.assertIn("refresh it first", C.search("x", Path(tempfile.mkdtemp()) / "none.json"))

if __name__ == "__main__": unittest.main()
