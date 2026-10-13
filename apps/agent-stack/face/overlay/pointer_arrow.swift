// Z02 pointer overlay: a red arrow + label pointing at a global screen point (top-left points).
// Transparent, always on top, click-through, never takes focus, closes itself.
// usage: pointer_arrow <x> <y> <label> [seconds]
import AppKit
let a = CommandLine.arguments
guard a.count >= 4, let gx = Double(a[1]), let gy = Double(a[2]) else { exit(2) }
let label = a[3]; let secs = a.count > 4 ? (Double(a[4]) ?? 8) : 8
let app = NSApplication.shared; app.setActivationPolicy(.accessory)
let top = NSScreen.screens.first!.frame.maxY
let target = NSPoint(x: gx, y: top - gy)   // AppKit is bottom-left
let font = NSFont.boldSystemFont(ofSize: 16)
let ls = (label as NSString).size(withAttributes: [.font: font])
let W = max(ls.width + 30, 120) + 70, H: CGFloat = 90
// window sits up-right of the target; the arrow tip lands exactly on the target
var frame = NSRect(x: target.x - 4, y: target.y - H + 4, width: W, height: H)
let scr = NSScreen.screens.first(where: { $0.frame.contains(target) })?.frame ?? NSScreen.screens.first!.frame
var flip = false
if frame.maxX > scr.maxX { frame.origin.x = target.x - W + 4; flip = true }
if frame.minY < scr.minY { frame.origin.y = target.y - 4 }
let up = frame.origin.y >= target.y - 5
class V: NSView {
  var flip = false, up = false, label = "", font = NSFont.boldSystemFont(ofSize: 16)
  override func draw(_ r: NSRect) {
    let tip = NSPoint(x: flip ? bounds.maxX - 4 : 4, y: up ? 4 : bounds.maxY - 4)
    let tail = NSPoint(x: flip ? bounds.maxX - 60 : 60, y: up ? 52 : bounds.maxY - 52)
    let red = NSColor(calibratedRed: 0.93, green: 0.16, blue: 0.2, alpha: 1)
    red.setStroke(); red.setFill()
    let line = NSBezierPath(); line.move(to: tail); line.line(to: tip); line.lineWidth = 6; line.lineCapStyle = .round; line.stroke()
    let ang = atan2(tip.y - tail.y, tip.x - tail.x), L: CGFloat = 20
    let head = NSBezierPath(); head.move(to: tip)
    head.line(to: NSPoint(x: tip.x - L * cos(ang - 0.45), y: tip.y - L * sin(ang - 0.45)))
    head.line(to: NSPoint(x: tip.x - L * cos(ang + 0.45), y: tip.y - L * sin(ang + 0.45))); head.close(); head.fill()
    let ls = (label as NSString).size(withAttributes: [.font: font])
    let pw = ls.width + 24, ph = ls.height + 10
    let px = flip ? tail.x - pw + 10 : tail.x - 10, py = up ? tail.y : tail.y - ph
    let pill = NSBezierPath(roundedRect: NSRect(x: px, y: py, width: pw, height: ph), xRadius: ph / 2, yRadius: ph / 2); pill.fill()
    (label as NSString).draw(at: NSPoint(x: px + 12, y: py + 5), withAttributes: [.font: font, .foregroundColor: NSColor.white])
  }
}
let win = NSWindow(contentRect: frame, styleMask: .borderless, backing: .buffered, defer: false)
win.isOpaque = false; win.backgroundColor = .clear; win.level = .screenSaver; win.ignoresMouseEvents = true; win.hasShadow = false
win.collectionBehavior = [.canJoinAllSpaces, .stationary, .fullScreenAuxiliary]
let v = V(frame: NSRect(origin: .zero, size: frame.size)); v.flip = flip; v.up = up; v.label = label; v.font = font
win.contentView = v; win.orderFrontRegardless()
DispatchQueue.main.asyncAfter(deadline: .now() + secs) { app.terminate(nil) }
app.run()
