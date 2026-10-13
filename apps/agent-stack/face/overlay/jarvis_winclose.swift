// Z02: the close (X) button of the front-most normal window that is not Jarvis's own, from CGWindowList bounds
// (no Accessibility needed) and, when a local screenshot is given, snapped onto the red traffic-light dot.
// usage: jarvis_winclose <skip-owners,comma> [shot.png]
import AppKit
func out(_ d: [String: Any]) -> Never { let j = try! JSONSerialization.data(withJSONObject: d); print(String(data: j, encoding: .utf8)!); exit(0) }
let a = CommandLine.arguments
let want = a.count > 3 ? a[3].lowercased() : ""   // optional owner name ("Finder") the ask named
let skip = Set((a.count > 1 ? a[1] : "").lowercased().split(separator: ",").map(String.init))
let list = (CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]]) ?? []
var hit: (String, CGRect)? = nil
for w in list {
  guard (w[kCGWindowLayer as String] as? Int) == 0, let b = w[kCGWindowBounds as String] as? [String: CGFloat] else { continue }
  let owner = (w[kCGWindowOwnerName as String] as? String) ?? ""
  let r = CGRect(x: b["X"] ?? 0, y: b["Y"] ?? 0, width: b["Width"] ?? 0, height: b["Height"] ?? 0)
  if !want.isEmpty && !owner.lowercased().contains(want) { continue }
  if r.width < 240 || r.height < 160 || skip.contains(owner.lowercased()) || (w[kCGWindowAlpha as String] as? Double ?? 1) < 0.1 { continue }
  hit = (owner, r); break
}
guard let (owner, r) = hit else { out(["found": false, "why": "no window"]) }
var cx = r.minX + 20, cy = r.minY + 19, snapped = false
// snap onto the red traffic-light dot: silent capture of just the window's top-left corner (any display), deleted at once
let tmp = NSTemporaryDirectory() + "jarvis-wc-\(getpid()).png"
let p = Process(); p.executableURL = URL(fileURLWithPath: "/usr/sbin/screencapture")
p.arguments = ["-x", "-R", "\(Int(r.minX)),\(Int(r.minY)),60,50", tmp]
try? p.run(); p.waitUntilExit()
if let img = NSImage(contentsOfFile: tmp), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) {
  let s = CGFloat(cg.width) / 60.0
  let rep = NSBitmapImageRep(cgImage: cg)
  var sx: CGFloat = 0, sy: CGFloat = 0, n: CGFloat = 0
  for py in 0..<cg.height { for px in 0..<cg.width {
    guard let c = rep.colorAt(x: px, y: py)?.usingColorSpace(.sRGB) else { continue }
    if c.redComponent > 0.85 && c.greenComponent < 0.5 && c.blueComponent < 0.5 { sx += CGFloat(px); sy += CGFloat(py); n += 1 }
  } }
  if n > 12 { cx = r.minX + sx / n / s; cy = r.minY + sy / n / s; snapped = true }
}
try? FileManager.default.removeItem(atPath: tmp)
out(["found": true, "x": cx, "y": cy, "label": "Close", "owner": owner, "role": "AXButton", "source": snapped ? "window+red" : "window", "snapped": snapped])
