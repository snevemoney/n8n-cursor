// Z02 pointer pill: a labelled red pill next to a screen point. Click-through, never takes focus, closes itself.
// usage: pointer_pill <x 0-1> <y 0-1> <label> [seconds]
import AppKit
let a = CommandLine.arguments
guard a.count >= 4, let fx = Double(a[1]), let fy = Double(a[2]) else { exit(2) }
let label = "◀ " + a[3]
let secs = a.count > 4 ? (Double(a[4]) ?? 6) : 6
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let scr = NSScreen.main!.frame
let font = NSFont.boldSystemFont(ofSize: 15)
let size = (label as NSString).size(withAttributes: [.font: font])
let w = size.width + 24, h = size.height + 12
let px = scr.minX + CGFloat(fx) * scr.width + 8
let py = scr.maxY - CGFloat(fy) * scr.height - h / 2
let win = NSWindow(contentRect: NSRect(x: min(px, scr.maxX - w), y: max(scr.minY, py), width: w, height: h),
                   styleMask: .borderless, backing: .buffered, defer: false)
win.isOpaque = false; win.backgroundColor = .clear; win.level = .screenSaver; win.ignoresMouseEvents = true
win.collectionBehavior = [.canJoinAllSpaces, .stationary]
let v = NSTextField(labelWithString: label)
v.font = font; v.textColor = .white; v.alignment = .center
v.frame = NSRect(x: 0, y: 6, width: w, height: size.height)
let pill = NSView(frame: NSRect(x: 0, y: 0, width: w, height: h))
pill.wantsLayer = true; pill.layer?.backgroundColor = NSColor.systemRed.cgColor; pill.layer?.cornerRadius = h / 2
pill.addSubview(v); win.contentView = pill
win.orderFrontRegardless()
DispatchQueue.main.asyncAfter(deadline: .now() + secs) { app.terminate(nil) }
app.run()
