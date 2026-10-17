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
// demo 2:09 (storyboards/Z02): the pill sits ABOVE-right of the target and the arrow points down-left onto it;
// flip below only when there is no room above, left only when there is no room right.
var frame = NSRect(x: target.x - 4, y: target.y - 4, width: W, height: H)
let scr = NSScreen.screens.first(where: { $0.frame.contains(target) })?.frame ?? NSScreen.screens.first!.frame
var flip = false
if frame.maxX > scr.maxX { frame.origin.x = target.x - W + 4; flip = true }
if frame.maxY > scr.maxY - 24 { frame.origin.y = target.y - H + 4 }
let up = frame.origin.y >= target.y - 5
// Style matched to ud7wzdiM0gk 2:09-2:19 (storyboards/Z02): dark pill, white bold text, thin red outline;
// thick red-orange arrow with a white border, tip on the control; gentle bob; no cursor movement.
class V: NSView {
  var flip = false, up = false, label = "", font = NSFont.boldSystemFont(ofSize: 15), bob: CGFloat = 0
  override func draw(_ r: NSRect) {
    let tip = NSPoint(x: (flip ? bounds.maxX - 6 : 6) + (flip ? -bob : bob), y: (up ? 6 : bounds.maxY - 6) + (up ? bob : -bob))
    let tail = NSPoint(x: flip ? bounds.maxX - 58 : 58, y: up ? 50 : bounds.maxY - 50)
    let ang = atan2(tip.y - tail.y, tip.x - tail.x), nx = -sin(ang), ny = cos(ang)
    let shaft: CGFloat = 5, headW: CGFloat = 13, headL: CGFloat = 20
    let base = NSPoint(x: tip.x - headL * cos(ang), y: tip.y - headL * sin(ang))
    let a = NSBezierPath()
    a.move(to: NSPoint(x: tail.x + nx * shaft, y: tail.y + ny * shaft))
    a.line(to: NSPoint(x: base.x + nx * shaft, y: base.y + ny * shaft))
    a.line(to: NSPoint(x: base.x + nx * headW, y: base.y + ny * headW))
    a.line(to: tip)
    a.line(to: NSPoint(x: base.x - nx * headW, y: base.y - ny * headW))
    a.line(to: NSPoint(x: base.x - nx * shaft, y: base.y - ny * shaft))
    a.line(to: NSPoint(x: tail.x - nx * shaft, y: tail.y - ny * shaft)); a.close()
    a.lineJoinStyle = .round; a.lineWidth = 4; NSColor.white.setStroke(); a.stroke()
    NSColor(calibratedRed: 0.95, green: 0.30, blue: 0.16, alpha: 1).setFill(); a.fill()
    let ls = (label as NSString).size(withAttributes: [.font: font])
    let pw = ls.width + 24, ph = ls.height + 10
    let px = flip ? tail.x - pw + 14 : tail.x - 14, py = up ? tail.y - 2 : tail.y - ph + 2
    let pill = NSBezierPath(roundedRect: NSRect(x: px, y: py, width: pw, height: ph), xRadius: ph / 2, yRadius: ph / 2)
    NSColor(calibratedWhite: 0.14, alpha: 0.96).setFill(); pill.fill()
    pill.lineWidth = 1.5; NSColor(calibratedRed: 0.93, green: 0.2, blue: 0.2, alpha: 1).setStroke(); pill.stroke()
    (label as NSString).draw(at: NSPoint(x: px + 12, y: py + 5), withAttributes: [.font: font, .foregroundColor: NSColor.white])
  }
}
let win = NSWindow(contentRect: frame, styleMask: .borderless, backing: .buffered, defer: false)
win.isOpaque = false; win.backgroundColor = .clear; win.level = .screenSaver; win.ignoresMouseEvents = true; win.hasShadow = false
win.collectionBehavior = [.canJoinAllSpaces, .stationary, .fullScreenAuxiliary]
let v = V(frame: NSRect(origin: .zero, size: frame.size)); v.flip = flip; v.up = up; v.label = label; v.font = font
win.contentView = v; win.orderFrontRegardless()
var tick: CGFloat = 0
Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { _ in tick += 0.18; v.bob = 3 * sin(tick); v.needsDisplay = true }
DispatchQueue.main.asyncAfter(deadline: .now() + secs) { app.terminate(nil) }
app.run()
