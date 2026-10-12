import Cocoa
import WebKit

/// Floating orb on the existing face. 127.0.0.1 only. Not a second wiki.
final class Panel: NSPanel {
    var onFiles: (([String]) -> Void)?

    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { true }

    override func constrainFrameRect(_ frameRect: NSRect, to screen: NSScreen?) -> NSRect {
        frameRect
    }

    func draggingEntered(_ sender: NSDraggingInfo) -> NSDragOperation { .copy }

    func draggingUpdated(_ sender: NSDraggingInfo) -> NSDragOperation { .copy }

    func prepareForDragOperation(_ sender: NSDraggingInfo) -> Bool { true }

    func performDragOperation(_ sender: NSDraggingInfo) -> Bool {
        let opts: [NSPasteboard.ReadingOptionKey: Any] = [.urlReadingFileURLsOnly: true]
        let urls = sender.draggingPasteboard.readObjects(forClasses: [NSURL.self], options: opts) as? [URL] ?? []
        let paths = urls.map(\.path).filter { !$0.isEmpty }
        guard !paths.isEmpty else { return false }
        onFiles?(paths)
        return true
    }
}

/// Catches orb/background drags in global screen space so the panel can cross displays.
/// Only the dock / typed / chip band is a hole so Eyes / Desktop / Mic reach the web view.
/// AppKit y = 0 is the bottom. A tall hole eats the geodesic and the first grab dies.
final class DragCatcher: NSView {
    var holeHeight: CGFloat = 168
    var onFiles: (([String]) -> Void)?
    private var grab: NSPoint?
    private let resizeEdge: CGFloat = 8

    override var isOpaque: Bool { false }
    override var mouseDownCanMoveWindow: Bool { true }

    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    /// Dock (~54) + typed (~52) + chip (64) sit in the bottom band. Never grow with the pane.
    static func passThroughHeight(boundsHeight: CGFloat, holeHeight: CGFloat = 168) -> CGFloat {
        min(holeHeight, max(72, boundsHeight * 0.38))
    }

    override func viewDidMoveToWindow() {
        super.viewDidMoveToWindow()
        registerForDraggedTypes([.fileURL])
    }

    override func hitTest(_ point: NSPoint) -> NSView? {
        let inset = bounds.insetBy(dx: resizeEdge, dy: resizeEdge)
        if !inset.contains(point) { return nil }
        let hole = Self.passThroughHeight(boundsHeight: bounds.height, holeHeight: holeHeight)
        let ev = NSApp.currentEvent
        if point.y <= holeHeight, ev?.type == .scrollWheel { return nil }
        let clickish: Set<NSEvent.EventType> = [
            .leftMouseDown, .leftMouseUp, .rightMouseDown, .rightMouseUp,
            .otherMouseDown, .otherMouseUp,
        ]
        if point.y <= hole, let ev, clickish.contains(ev.type) { return nil }
        if point.y <= hole, ev?.type == .leftMouseDragged, grab == nil { return nil }
        return self
    }

    override func mouseDown(with event: NSEvent) {
        guard let window = window else { return }
        let mouse = NSEvent.mouseLocation
        let frame = window.frame
        grab = NSPoint(x: mouse.x - frame.origin.x, y: mouse.y - frame.origin.y)
        if !window.isKeyWindow {
            window.makeKey()
        }
    }

    override func mouseDragged(with event: NSEvent) {
        guard let window = window, let grab = grab else { return }
        let mouse = NSEvent.mouseLocation
        window.setFrameOrigin(NSPoint(x: mouse.x - grab.x, y: mouse.y - grab.y))
    }

    override func mouseUp(with event: NSEvent) {
        grab = nil
    }

    override func draggingEntered(_ sender: NSDraggingInfo) -> NSDragOperation { .copy }

    override func draggingUpdated(_ sender: NSDraggingInfo) -> NSDragOperation { .copy }

    override func prepareForDragOperation(_ sender: NSDraggingInfo) -> Bool { true }

    override func performDragOperation(_ sender: NSDraggingInfo) -> Bool {
        let opts: [NSPasteboard.ReadingOptionKey: Any] = [.urlReadingFileURLsOnly: true]
        let urls = sender.draggingPasteboard.readObjects(forClasses: [NSURL.self], options: opts) as? [URL] ?? []
        let paths = urls.map(\.path).filter { !$0.isEmpty }
        guard !paths.isEmpty else { return false }
        onFiles?(paths)
        return true
    }
}

final class WaitPane: NSView {
    private var grab: NSPoint?
    let label = NSTextField(wrappingLabelWithString: "")

    override var isOpaque: Bool { true }
    override var mouseDownCanMoveWindow: Bool { true }

    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        wantsLayer = true
        layer?.backgroundColor = NSColor(calibratedRed: 0.01, green: 0.03, blue: 0.02, alpha: 1).cgColor
        label.frame = NSRect(x: 18, y: 70, width: max(frameRect.width - 36, 40), height: 260)
        label.autoresizingMask = [.width, .height]
        label.alignment = .center
        label.isSelectable = false
        label.textColor = NSColor(calibratedRed: 0.72, green: 1, blue: 0.79, alpha: 1)
        label.font = NSFont.monospacedSystemFont(ofSize: 12, weight: .regular)
        label.backgroundColor = .clear
        label.drawsBackground = false
        addSubview(label)
    }

    required init?(coder: NSCoder) { nil }

    override func mouseDown(with event: NSEvent) {
        guard let window = window else { return }
        let mouse = NSEvent.mouseLocation
        let frame = window.frame
        grab = NSPoint(x: mouse.x - frame.origin.x, y: mouse.y - frame.origin.y)
    }

    override func mouseDragged(with event: NSEvent) {
        guard let window = window, let grab = grab else { return }
        let mouse = NSEvent.mouseLocation
        window.setFrameOrigin(NSPoint(x: mouse.x - grab.x, y: mouse.y - grab.y))
    }

    override func mouseUp(with event: NSEvent) {
        grab = nil
    }
}

final class App: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate {
    var window: NSPanel?
    var web: WKWebView?
    var waitPane: WaitPane?
    var timer: Timer?
    var widgetLoaded = false
    var widgetNavigation: WKNavigation?

    var port: String {
        ProcessInfo.processInfo.environment["AGENT_STACK_FACE_PORT"] ?? "4018"
    }

    var widgetURL: URL {
        URL(string: "http://127.0.0.1:\(port)/widget")!
    }

    var healthURL: URL {
        URL(string: "http://127.0.0.1:\(port)/healthz")!
    }

    func installMainMenu() {
        let main = NSMenu()
        let appMenu = NSMenu()
        let reload = NSMenuItem(title: "Reload Face", action: #selector(reloadFace), keyEquivalent: "r")
        reload.target = self
        appMenu.addItem(reload)
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Quit Jarvis Orb", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        let appItem = NSMenuItem()
        appItem.submenu = appMenu
        main.addItem(appItem)
        NSApp.mainMenu = main
    }

    @objc func reloadFace() {
        widgetLoaded = false
        widgetNavigation = nil
        web?.stopLoading()
        web?.isHidden = true
        waitPane?.isHidden = false
        waitPane?.label.stringValue = "Reloading face on 127.0.0.1:\(port)…"
        if timer == nil {
            timer = Timer.scheduledTimer(withTimeInterval: 1.5, repeats: true) { [weak self] _ in
                self?.probe()
            }
        }
        probe()
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        installMainMenu()
        let rect = NSRect(x: 0, y: 0, width: 300, height: 420)
        let panel = Panel(
            contentRect: rect,
            styleMask: [.titled, .fullSizeContentView, .closable, .resizable],
            backing: .buffered,
            defer: false
        )
        panel.title = "Jarvis Orb"
        panel.titleVisibility = .hidden
        panel.titlebarAppearsTransparent = true
        panel.isFloatingPanel = true
        panel.level = .floating
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = true
        panel.isMovable = true
        panel.isMovableByWindowBackground = true
        panel.hidesOnDeactivate = false
        panel.becomesKeyOnlyIfNeeded = false
        panel.isReleasedWhenClosed = false
        panel.minSize = NSSize(width: 220, height: 300)
        panel.maxSize = NSSize(width: 640, height: 880)
        panel.standardWindowButton(.closeButton)?.isHidden = true
        panel.standardWindowButton(.miniaturizeButton)?.isHidden = true
        panel.standardWindowButton(.zoomButton)?.isHidden = true
        panel.registerForDraggedTypes([.fileURL])

        let root = NSView(frame: rect)
        root.wantsLayer = true
        root.layer?.backgroundColor = NSColor.clear.cgColor
        root.autoresizingMask = [.width, .height]

        let cfg = WKWebViewConfiguration()
        cfg.suppressesIncrementalRendering = true
        cfg.mediaTypesRequiringUserActionForPlayback = []
        let web = WKWebView(frame: rect, configuration: cfg)
        web.setValue(false, forKey: "drawsBackground")
        if #available(macOS 12.0, *) {
            web.underPageBackgroundColor = .clear
        }
        web.autoresizingMask = [.width, .height]
        web.allowsMagnification = false
        web.allowsBackForwardNavigationGestures = false
        web.navigationDelegate = self
        web.uiDelegate = self
        web.isHidden = true

        let catcher = DragCatcher(frame: rect)
        catcher.autoresizingMask = [.width, .height]

        let wait = WaitPane(frame: rect)
        wait.autoresizingMask = [.width, .height]
        wait.label.stringValue = "Checking face on 127.0.0.1:\(port)…"

        let drop: ([String]) -> Void = { [weak self] paths in
            self?.postDrop(paths)
        }
        panel.onFiles = drop
        catcher.onFiles = drop

        root.addSubview(web)
        root.addSubview(catcher)
        root.addSubview(wait)
        panel.contentView = root

        if let screen = NSScreen.main {
            let frame = screen.visibleFrame
            panel.setFrameOrigin(NSPoint(x: frame.maxX - 328, y: frame.midY - 210))
        }
        panel.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)

        window = panel
        self.web = web
        waitPane = wait
        probe()
        timer = Timer.scheduledTimer(withTimeInterval: 1.5, repeats: true) { [weak self] _ in
            self?.probe()
        }
    }

    func postDrop(_ paths: [String]) {
        guard let url = URL(string: "http://127.0.0.1:\(port)/api/drop") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["paths": paths])
        URLSession.shared.dataTask(with: req) { [weak self] data, _, _ in
            var line = "File on the bus."
            if let data,
               let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let spoken = obj["spoken"] as? String,
               !spoken.isEmpty
            {
                line = spoken
            }
            let escaped = line
                .replacingOccurrences(of: "\\", with: "\\\\")
                .replacingOccurrences(of: "\"", with: "\\\"")
                .replacingOccurrences(of: "\n", with: " ")
            DispatchQueue.main.async {
                self?.web?.evaluateJavaScript(
                    "window.jarvisDropped && window.jarvisDropped(\"\(escaped)\")",
                    completionHandler: nil
                )
            }
        }.resume()
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        window?.makeKeyAndOrderFront(nil)
        return true
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }

    func probe() {
        if widgetLoaded { return }
        var health = URLRequest(url: healthURL)
        health.timeoutInterval = 2.5
        health.cachePolicy = .reloadIgnoringLocalCacheData
        URLSession.shared.dataTask(with: health) { [weak self] _, res, _ in
            let ok = (res as? HTTPURLResponse)?.statusCode == 200
            DispatchQueue.main.async {
                if ok { self?.loadWidget() } else { self?.showDark() }
            }
        }.resume()
    }

    func showDark() {
        if widgetLoaded { return }
        web?.isHidden = true
        waitPane?.isHidden = false
        waitPane?.label.stringValue =
            "Face is dark.\nStart apps/agent-stack/face/start.sh\n127.0.0.1:\(port) — waiting.\nDrag this pane to any display."
    }

    func loadWidget() {
        if widgetLoaded || widgetNavigation != nil { return }
        // WaitPane covers the loading view; keep WebKit renderable underneath it.
        web?.isHidden = false
        widgetNavigation = web?.load(URLRequest(url: widgetURL))
    }

    func showWidget() {
        widgetNavigation = nil
        widgetLoaded = true
        waitPane?.isHidden = true
        web?.isHidden = false
        timer?.invalidate()
        timer = nil
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        let host = navigationAction.request.url?.host ?? ""
        if host == "127.0.0.1" {
            decisionHandler(.allow)
        } else {
            decisionHandler(.cancel)
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard let navigation, widgetNavigation === navigation else { return }
        if webView.url?.host == "127.0.0.1" {
            showWidget()
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        guard let navigation, widgetNavigation === navigation else { return }
        widgetNavigation = nil
        showDark()
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        guard let navigation, widgetNavigation === navigation else { return }
        widgetNavigation = nil
        showDark()
    }

    @available(macOS 12.0, *)
    func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        if origin.host == "127.0.0.1" {
            decisionHandler(.grant)
        } else {
            decisionHandler(.deny)
        }
    }
}

let app = NSApplication.shared
let delegate = App()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
