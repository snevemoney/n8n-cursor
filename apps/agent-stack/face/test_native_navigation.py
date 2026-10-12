"""Execute the actual native navigation callbacks with a counted WebKit test double."""
import pathlib
import shutil
import subprocess
import sys
import tempfile
import unittest

HERE = pathlib.Path(__file__).resolve().parent

@unittest.skipUnless(sys.platform == "darwin" and shutil.which("swiftc"), "requires macOS Cocoa/WebKit and Swift")
class NativeNavigationTest(unittest.TestCase):
    def test_pending_and_stale_navigation_ownership(self):
        source = (HERE / "widget.swift").read_text().split("let app = NSApplication.shared")[0]
        harness = r"""
final class CountedWebView: WKWebView {
    var requests = 0
    var token = WKNavigation()
    override var url: URL? { URL(string: "http://127.0.0.1:4018/widget") }
    override func load(_ request: URLRequest) -> WKNavigation? {
        requests += 1
        return token
    }
}
let owner = App()
let view = CountedWebView(frame: .zero, configuration: WKWebViewConfiguration())
owner.web = view
owner.loadWidget()
let old = view.token
owner.loadWidget()
precondition(view.requests == 1, "overlapping health probe must not replace pending navigation")
owner.webView(view, didFailProvisionalNavigation: old, withError: NSError(domain: "test", code: 1))
precondition(owner.widgetNavigation == nil, "matching failure must permit recovery")
view.token = WKNavigation()
owner.loadWidget()
let current = view.token
precondition(view.requests == 2)
owner.webView(view, didFail: old, withError: NSError(domain: "test", code: 2))
precondition(owner.widgetNavigation === current, "stale failure must not unlock current navigation")
owner.webView(view, didFinish: old)
precondition(!owner.widgetLoaded && owner.widgetNavigation === current, "stale completion must not finalize current navigation")
owner.loadWidget()
precondition(view.requests == 2)
owner.webView(view, didFinish: current)
precondition(owner.widgetLoaded && owner.widgetNavigation == nil)
owner.loadWidget()
precondition(view.requests == 2, "completed widget must not reload from health polling")
print("native navigation ownership regression passed")
"""
        with tempfile.TemporaryDirectory(prefix="jarvis-native-navigation-") as scratch:
            combined = pathlib.Path(scratch) / "main.swift"
            executable = pathlib.Path(scratch) / "test"
            combined.write_text(source + harness)
            compiled = subprocess.run(["swiftc", "-module-cache-path", "/private/tmp/jarvis-delivery-module-cache", "-framework", "Cocoa", "-framework", "WebKit", str(combined), "-o", str(executable)], capture_output=True, text=True, timeout=120)
            self.assertEqual(compiled.returncode, 0, compiled.stderr)
            result = subprocess.run([str(executable)], capture_output=True, text=True, timeout=30)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("regression passed", result.stdout)

if __name__ == "__main__":
    unittest.main()
