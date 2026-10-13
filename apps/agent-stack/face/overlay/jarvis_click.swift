// Z02 click hand: Jarvis's own floating cursor glides to a global point (top-left points), pulses, then ONE left
// click lands there and Evens's real cursor is put back where it was. Only runs after Evens said "confirm".
// Never prompts: CGPreflightPostEventAccess() only reads the Accessibility (post-event) grant; without it we draw
// nothing, post nothing, print why and exit 3. No keystrokes, ever.
// usage: jarvis_click <x> <y> [label]   | jarvis_click --check
import AppKit
// Run as "Jarvis Click.app" through LaunchServices (open -g -n -a ... --args ... --out f) so macOS attributes the
// Accessibility grant to this Jarvis-owned app, not to whatever python launched it. --request asks macOS once.
var a = CommandLine.arguments
var outPath: String? = nil
if let i = a.firstIndex(of: "--out"), i + 1 < a.count { outPath = a[i + 1]; a.removeSubrange(i...(i + 1)) }
func out(_ d: [String: Any], _ code: Int32) -> Never {
  let j = try! JSONSerialization.data(withJSONObject: d); print(String(data: j, encoding: .utf8)!); fflush(stdout)
  if let p = outPath { try? j.write(to: URL(fileURLWithPath: p)) }
  exit(code) }
if a.count >= 2 && a[1] == "--request" {
  let ok = AXIsProcessTrustedWithOptions([kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary)
  out(["post_event_allowed": CGPreflightPostEventAccess(), "ax_trusted": ok, "binary": ProcessInfo.processInfo.arguments[0]], 0) }
let allowed = CGPreflightPostEventAccess()
let me = ProcessInfo.processInfo.arguments[0]
if a.count >= 2 && a[1] == "--check" { out(["post_event_allowed": allowed, "binary": me, "ppid": getppid()], 0) }
guard a.count >= 3, let x = Double(a[1]), let y = Double(a[2]) else { out(["ok": false, "why": "usage"], 2) }
if !allowed { out(["ok": false, "why": "post_event_denied", "binary": me, "ppid": getppid()], 3) }
let label = a.count > 3 ? a[3] : "Jarvis"
let target = CGPoint(x: x, y: y)
let home = CGEvent(source: nil)?.location ?? target          // Evens's cursor, global top-left points
let app = NSApplication.shared; app.setActivationPolicy(.accessory)
let top = NSScreen.screens.first!.frame.maxY                    // AppKit is bottom-left from the primary display
func ak(_ p: CGPoint) -> NSPoint { NSPoint(x: p.x, y: top - p.y) }
let all = NSScreen.screens.reduce(NSRect.null) { $0.union($1.frame) }
class V: NSView {
  var pos = NSPoint.zero, pulse: CGFloat = -1, alpha: CGFloat = 1, name = ""
  override func draw(_ r: NSRect) {
    let p = NSPoint(x: pos.x - frame.origin.x, y: pos.y - frame.origin.y)
    if pulse >= 0 {
      let rr = 8 + 26 * pulse
      let ring = NSBezierPath(ovalIn: NSRect(x: p.x - rr, y: p.y - rr, width: 2 * rr, height: 2 * rr))
      ring.lineWidth = 4; NSColor(calibratedRed: 0.2, green: 0.8, blue: 1, alpha: (1 - pulse) * alpha).setStroke(); ring.stroke()
    }
    // a distinct cyan arrow cursor with white rim (Evens's own cursor stays black/white)
    let c = NSBezierPath(); let pts: [(CGFloat, CGFloat)] = [(0,0),(0,-26),(7,-19),(12,-30),(17,-28),(12,-17),(21,-17)]
    c.move(to: NSPoint(x: p.x, y: p.y)); for (dx, dy) in pts.dropFirst() { c.line(to: NSPoint(x: p.x + dx, y: p.y + dy)) }; c.close()
    c.lineWidth = 2.5; c.lineJoinStyle = .round
    NSColor.white.withAlphaComponent(alpha).setStroke(); c.stroke()
    NSColor(calibratedRed: 0.05, green: 0.65, blue: 0.95, alpha: alpha).setFill(); c.fill()
    let f = NSFont.boldSystemFont(ofSize: 12)
    let s = (name as NSString).size(withAttributes: [.font: f])
    let pill = NSRect(x: p.x + 18, y: p.y - 44, width: s.width + 14, height: s.height + 6)
    let b = NSBezierPath(roundedRect: pill, xRadius: pill.height / 2, yRadius: pill.height / 2)
    NSColor(calibratedRed: 0.05, green: 0.65, blue: 0.95, alpha: 0.95 * alpha).setFill(); b.fill()
    (name as NSString).draw(at: NSPoint(x: pill.minX + 7, y: pill.minY + 3), withAttributes: [.font: f, .foregroundColor: NSColor.white.withAlphaComponent(alpha)])
  }
}
let win = NSWindow(contentRect: all, styleMask: .borderless, backing: .buffered, defer: false)
win.isOpaque = false; win.backgroundColor = .clear; win.level = .screenSaver; win.ignoresMouseEvents = true; win.hasShadow = false
win.collectionBehavior = [.canJoinAllSpaces, .stationary, .fullScreenAuxiliary]
let v = V(frame: NSRect(origin: .zero, size: all.size)); v.frame.origin = .zero
v.name = "Jarvis"; win.contentView = v; win.setFrame(all, display: true)
class Off: NSView {}; _ = Off.self
// view coords are relative to the window frame origin (all.origin)
let start = ak(home), end = ak(target)
func rel(_ p: NSPoint) -> NSPoint { NSPoint(x: p.x, y: p.y) }
v.pos = start; v.frame = NSRect(origin: .zero, size: all.size); v.setBoundsOrigin(all.origin)
win.orderFrontRegardless()
let t0 = Date(); let glide = 0.75, hold = 0.3
var clicked = false, result: [String: Any] = [:]
Timer.scheduledTimer(withTimeInterval: 1.0 / 60, repeats: true) { tm in
  let t = Date().timeIntervalSince(t0)
  if t < glide {
    let k = CGFloat(t / glide), e = k < 0.5 ? 4 * k * k * k : 1 - pow(-2 * k + 2, 3) / 2   // ease in-out
    let arc = sin(.pi * k) * 40
    v.pos = NSPoint(x: start.x + (end.x - start.x) * e, y: start.y + (end.y - start.y) * e + arc)
  } else if t < glide + hold {
    v.pos = end; v.pulse = CGFloat((t - glide) / hold)
  } else if !clicked {
    clicked = true
    let src = CGEventSource(stateID: .hidSystemState)
    for ty in [CGEventType.mouseMoved, .leftMouseDown, .leftMouseUp] {
      if let e = CGEvent(mouseEventSource: src, mouseType: ty, mouseCursorPosition: target, mouseButton: .left) { e.post(tap: .cghidEventTap) }
      usleep(ty == .mouseMoved ? 40_000 : 50_000)
    }
    usleep(60_000)
    CGWarpMouseCursorPosition(home); CGAssociateMouseAndMouseCursorPosition(1)   // give Evens his cursor back
    result = ["ok": true, "x": x, "y": y, "label": label, "restored_to": [home.x, home.y], "binary": me]
  } else if t < glide + hold + 0.6 {
    v.pulse = -1; v.alpha = CGFloat(1 - (t - glide - hold) / 0.6)
  } else { tm.invalidate(); out(result, 0) }
  v.needsDisplay = true
}
app.run()
