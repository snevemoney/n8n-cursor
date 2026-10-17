// Z02: Jarvis's own floating cursor, drawn from the Face exactly like pointer_arrow (which Evens sees): accessory app,
// .screenSaver level, click-through, canJoinAllSpaces, one window per display.
//
// usage: pointer_cursor <fromX> <fromY> <toX> <toY> [--hold seconds] [--label text]     (global top-left points)
//
// What Evens sees (design, matched to the Z02 method plus his "cursor floating on my screen" ask):
//   trigger   Jarvis arms a click ("click Routines") or he says "show me your cursor"
//   appears   at HIS pointer position (no pop-in), a blue arrow cursor with a "Jarvis" pill, on whichever display holds the target
//   moves     0.75 s eased glide (slight arc) to the target
//   stays     bobbing 3 pt with a soft pulse ring until --hold seconds pass (default 10, the demo's tag time); an armed click
//             holds for the whole confirm window so it is still there when he says "confirm"
//   click     SIGUSR1 -> a ring expands and the cursor presses in for a moment
//   ends      SIGTERM (click done / click dropped) or the hold running out -> 0.45 s fade, process exits
// Never takes focus, never receives mouse events, never moves the real pointer.
import AppKit

var args = Array(CommandLine.arguments.dropFirst())
var hold = 10.0, label = "Jarvis"
func opt(_ name: String) -> String? {
  guard let i = args.firstIndex(of: name), i + 1 < args.count else { return nil }
  let v = args[i + 1]; args.removeSubrange(i...(i + 1)); return v }
if let h = opt("--hold"), let hv = Double(h) { hold = max(1, hv) }
if let l = opt("--label") { label = l }
guard args.count >= 4, let fx = Double(args[0]), let fy = Double(args[1]), let tx = Double(args[2]), let ty = Double(args[3]) else { exit(2) }

let app = NSApplication.shared; app.setActivationPolicy(.accessory)
let mainH = NSScreen.screens.first!.frame.maxY          // AppKit is bottom-left; CoreGraphics (our inputs) is top-left of the main display
let start = NSPoint(x: fx, y: mainH - fy), end = NSPoint(x: tx, y: mainH - ty)
let glide = 0.75, fadeDur = 0.45, rippleDur = 0.4
let blue = NSColor(calibratedRed: 0.05, green: 0.65, blue: 0.95, alpha: 1)
let t0 = Date()
var rippleAt: Date? = nil, fadeStart: Date? = nil

final class V: NSView {
  var screenOrigin = NSPoint.zero
  var pos = NSPoint.zero, pulse: CGFloat = -1, ripple: CGFloat = -1, press: CGFloat = 1, alpha: CGFloat = 1
  override var isFlipped: Bool { false }
  override func draw(_ r: NSRect) {
    let p = NSPoint(x: pos.x - screenOrigin.x, y: pos.y - screenOrigin.y)      // window-local, no bounds tricks
    if !bounds.insetBy(dx: -80, dy: -80).contains(p) { return }                 // cursor is on another display
    func ring(_ k: CGFloat, _ maxR: CGFloat, _ w: CGFloat, _ c: NSColor) {
      let rr = 8 + maxR * k
      let o = NSBezierPath(ovalIn: NSRect(x: p.x - rr, y: p.y - rr, width: 2 * rr, height: 2 * rr))
      o.lineWidth = w; c.withAlphaComponent((1 - k) * alpha).setStroke(); o.stroke() }
    if pulse >= 0 { ring(pulse, 26, 3, blue) }
    if ripple >= 0 { ring(ripple, 46, 5, NSColor.white); ring(ripple, 34, 4, blue) }
    let shape: [(CGFloat, CGFloat)] = [(0, 0), (0, -26), (7, -19), (12, -30), (17, -28), (12, -17), (21, -17)]
    let c = NSBezierPath()
    c.move(to: p)
    for (dx, dy) in shape.dropFirst() { c.line(to: NSPoint(x: p.x + dx * press, y: p.y + dy * press)) }
    c.close(); c.lineWidth = 2.5; c.lineJoinStyle = .round
    NSColor.white.withAlphaComponent(alpha).setStroke(); c.stroke()
    blue.withAlphaComponent(alpha).setFill(); c.fill()
    let f = NSFont.boldSystemFont(ofSize: 12), name = label as NSString
    let s = name.size(withAttributes: [.font: f])
    let w = s.width + 14, h = s.height + 6
    var px = p.x + 18, py = p.y - 44
    if px + w > bounds.maxX - 4 { px = p.x - 18 - w }                           // no room on the right: pill goes left
    if py < bounds.minY + 4 { py = p.y + 8 }                                    // no room below: pill goes above
    let pill = NSRect(x: px, y: py, width: w, height: h)
    let b = NSBezierPath(roundedRect: pill, xRadius: h / 2, yRadius: h / 2)
    blue.withAlphaComponent(0.95 * alpha).setFill(); b.fill()
    name.draw(at: NSPoint(x: pill.minX + 7, y: pill.minY + 3), withAttributes: [.font: f, .foregroundColor: NSColor.white.withAlphaComponent(alpha)])
  }
}

var views: [(NSWindow, V)] = []
for scr in NSScreen.screens {
  let w = NSWindow(contentRect: scr.frame, styleMask: .borderless, backing: .buffered, defer: false)
  w.isOpaque = false; w.backgroundColor = .clear; w.level = .screenSaver; w.ignoresMouseEvents = true; w.hasShadow = false
  w.collectionBehavior = [.canJoinAllSpaces, .stationary, .fullScreenAuxiliary, .ignoresCycle]
  w.setFrame(scr.frame, display: false)
  let v = V(frame: NSRect(origin: .zero, size: scr.frame.size)); v.screenOrigin = scr.frame.origin; v.pos = start
  w.contentView = v; w.orderFrontRegardless(); views.append((w, v))
}
func setAll(_ f: (V) -> Void) { for (_, v) in views { f(v); v.needsDisplay = true } }

// SIGUSR1 = the click lands (ripple); SIGTERM/SIGINT = finish nicely (let a ripple play out first, then fade).
var sigSources: [DispatchSourceSignal] = []
signal(SIGUSR1, SIG_IGN); signal(SIGTERM, SIG_IGN); signal(SIGINT, SIG_IGN)
let sUsr = DispatchSource.makeSignalSource(signal: SIGUSR1, queue: .main)
sUsr.setEventHandler { rippleAt = Date() }; sUsr.resume()
for sig in [SIGTERM, SIGINT] {
  let s = DispatchSource.makeSignalSource(signal: sig, queue: .main)
  s.setEventHandler { if fadeStart == nil { fadeStart = max(Date(), (rippleAt ?? .distantPast).addingTimeInterval(0.3)) } }
  s.resume(); sigSources.append(s) }

Timer.scheduledTimer(withTimeInterval: 1.0 / 60, repeats: true) { _ in
  let now = Date(), t = now.timeIntervalSince(t0)
  var p = end, bob: CGFloat = 0, pulse: CGFloat = -1
  if t < glide {
    let k = CGFloat(t / glide), e = k < 0.5 ? 4 * k * k * k : 1 - pow(-2 * k + 2, 3) / 2
    p = NSPoint(x: start.x + (end.x - start.x) * e, y: start.y + (end.y - start.y) * e + sin(.pi * k) * 40)
  } else {
    bob = 3 * sin(CGFloat(t - glide) * 3.2)
    let ph = (t - glide).truncatingRemainder(dividingBy: 1.4); if ph < 0.6 { pulse = CGFloat(ph / 0.6) }
  }
  var rip: CGFloat = -1, press: CGFloat = 1
  if let r = rippleAt {
    let rt = now.timeIntervalSince(r); if rt < rippleDur { rip = CGFloat(rt / rippleDur) }
    if rt < 0.14 { press = 0.86 }
  }
  if fadeStart == nil && t > glide + hold { fadeStart = now }
  var al: CGFloat = 1
  if let fs = fadeStart, now >= fs {
    al = CGFloat(1 - now.timeIntervalSince(fs) / fadeDur)
    if al <= 0 { app.terminate(nil); return }
  }
  setAll { $0.pos = NSPoint(x: p.x, y: p.y + bob); $0.pulse = pulse; $0.ripple = rip; $0.press = press; $0.alpha = al }
}
app.run()
