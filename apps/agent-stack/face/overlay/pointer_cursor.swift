// Z02: Jarvis's own floating cursor, drawn from the Face exactly like pointer_arrow (which Evens sees): accessory app,
// .screenSaver level, click-through, canJoinAllSpaces. Glides from Evens's cursor to the target, pulses, fades.
// usage: pointer_cursor <fromX> <fromY> <toX> <toY>   (global top-left points)
import AppKit
let a = CommandLine.arguments
guard a.count >= 5, let fx = Double(a[1]), let fy = Double(a[2]), let tx = Double(a[3]), let ty = Double(a[4]) else { exit(2) }
let app = NSApplication.shared; app.setActivationPolicy(.accessory)
let top = NSScreen.screens.first!.frame.maxY
let start = NSPoint(x: fx, y: top - fy), end = NSPoint(x: tx, y: top - ty)
class V: NSView {
  var pos = NSPoint.zero, pulse: CGFloat = -1, alpha: CGFloat = 1
  override func draw(_ r: NSRect) {
    let p = NSPoint(x: pos.x - frame.origin.x, y: pos.y - frame.origin.y)
    if pulse >= 0 {
      let rr = 8 + 26 * pulse
      let ring = NSBezierPath(ovalIn: NSRect(x: p.x - rr, y: p.y - rr, width: 2 * rr, height: 2 * rr))
      ring.lineWidth = 4; NSColor(calibratedRed: 0.2, green: 0.8, blue: 1, alpha: (1 - pulse) * alpha).setStroke(); ring.stroke()
    }
    let c = NSBezierPath(); let pts: [(CGFloat, CGFloat)] = [(0,0),(0,-26),(7,-19),(12,-30),(17,-28),(12,-17),(21,-17)]
    c.move(to: p); for (dx, dy) in pts.dropFirst() { c.line(to: NSPoint(x: p.x + dx, y: p.y + dy)) }; c.close()
    c.lineWidth = 2.5; c.lineJoinStyle = .round
    NSColor.white.withAlphaComponent(alpha).setStroke(); c.stroke()
    NSColor(calibratedRed: 0.05, green: 0.65, blue: 0.95, alpha: alpha).setFill(); c.fill()
    let f = NSFont.boldSystemFont(ofSize: 12), name = "Jarvis" as NSString
    let s = name.size(withAttributes: [.font: f])
    let pill = NSRect(x: p.x + 18, y: p.y - 44, width: s.width + 14, height: s.height + 6)
    let b = NSBezierPath(roundedRect: pill, xRadius: pill.height / 2, yRadius: pill.height / 2)
    NSColor(calibratedRed: 0.05, green: 0.65, blue: 0.95, alpha: 0.95 * alpha).setFill(); b.fill()
    name.draw(at: NSPoint(x: pill.minX + 7, y: pill.minY + 3), withAttributes: [.font: f, .foregroundColor: NSColor.white.withAlphaComponent(alpha)])
  }
}
// one window per display, same flags as pointer_arrow's window
var views: [(NSWindow, V)] = []
for scr in NSScreen.screens {
  let w = NSWindow(contentRect: scr.frame, styleMask: .borderless, backing: .buffered, defer: false)
  w.isOpaque = false; w.backgroundColor = .clear; w.level = .screenSaver; w.ignoresMouseEvents = true; w.hasShadow = false
  w.collectionBehavior = [.canJoinAllSpaces, .stationary, .fullScreenAuxiliary]
  w.setFrame(scr.frame, display: false)
  let v = V(frame: NSRect(origin: .zero, size: scr.frame.size)); v.frame.origin = .zero
  w.contentView = v; w.orderFrontRegardless(); views.append((w, v))
}
func setAll(_ f: (V) -> Void) { for (w, v) in views { f(v); v.frame.origin = .zero; v.needsDisplay = true; _ = w } }
// draw coordinates are relative to each window: shift by the window's origin
for (w, v) in views { v.pos = start; v.setBoundsOrigin(w.frame.origin) }
let t0 = Date(); let glide = 0.75, hold = 0.3, fade = 0.6
Timer.scheduledTimer(withTimeInterval: 1.0 / 60, repeats: true) { tm in
  let t = Date().timeIntervalSince(t0)
  if t < glide {
    let k = CGFloat(t / glide), e = k < 0.5 ? 4 * k * k * k : 1 - pow(-2 * k + 2, 3) / 2
    let p = NSPoint(x: start.x + (end.x - start.x) * e, y: start.y + (end.y - start.y) * e + sin(.pi * k) * 40)
    setAll { $0.pos = p }
  } else if t < glide + hold { setAll { $0.pos = end; $0.pulse = CGFloat((t - glide) / hold) } }
  else if t < glide + hold + 0.25 { setAll { $0.pulse = -1 } }   // the real click lands here
  else if t < glide + hold + 0.25 + fade { let al = CGFloat(1 - (t - glide - hold - 0.25) / fade); setAll { $0.alpha = al } }
  else { tm.invalidate(); app.terminate(nil) }
}
app.run()
