// Z02: the close (X) button of the front-most normal window that is not Jarvis's own, from CGWindowList bounds
// (no Accessibility needed) and, when a local screenshot is given, snapped onto the red traffic-light dot.
// usage: jarvis_winclose <skip-owners,comma> [shot.png]
import AppKit
func out(_ d: [String: Any]) -> Never { let j = try! JSONSerialization.data(withJSONObject: d); print(String(data: j, encoding: .utf8)!); exit(0) }
let a = CommandLine.arguments
let skip = Set((a.count > 1 ? a[1] : "").lowercased().split(separator: ",").map(String.init))
let list = (CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]]) ?? []
var hit: (String, CGRect)? = nil
for w in list {
  guard (w[kCGWindowLayer as String] as? Int) == 0, let b = w[kCGWindowBounds as String] as? [String: CGFloat] else { continue }
  let owner = (w[kCGWindowOwnerName as String] as? String) ?? ""
  let r = CGRect(x: b["X"] ?? 0, y: b["Y"] ?? 0, width: b["Width"] ?? 0, height: b["Height"] ?? 0)
  if r.width < 200 || r.height < 120 || skip.contains(owner.lowercased()) || (w[kCGWindowAlpha as String] as? Double ?? 1) < 0.1 { continue }
  hit = (owner, r); break
}
guard let (owner, r) = hit else { out(["found": false, "why": "no window"]) }
var cx = r.minX + 20, cy = r.minY + 19, snapped = false
if a.count > 2, let img = NSImage(contentsOfFile: a[2]), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil),
   let scr = NSScreen.screens.first {
  // the -m shot is the main display only; its pixel scale vs points
  let s = CGFloat(cg.width) / scr.frame.width
  let rep = NSBitmapImageRep(cgImage: cg)
  var sx: CGFloat = 0, sy: CGFloat = 0, n: CGFloat = 0
  let x0 = Int((r.minX) * s), y0 = Int((r.minY) * s), x1 = Int((r.minX + 46) * s), y1 = Int((r.minY + 44) * s)
  if x0 >= 0, y0 >= 0, x1 < cg.width, y1 < cg.height {
    for py in y0..<y1 { for px in x0..<x1 {
      guard let c = rep.colorAt(x: px, y: py)?.usingColorSpace(.sRGB) else { continue }
      if c.redComponent > 0.85 && c.greenComponent < 0.5 && c.blueComponent < 0.5 { sx += CGFloat(px); sy += CGFloat(py); n += 1 }
    } }
  }
  if n > 12 { cx = sx / n / s; cy = sy / n / s; snapped = true }
}
out(["found": true, "x": cx, "y": cy, "label": "Close", "owner": owner, "role": "AXButton", "source": snapped ? "window+red" : "window", "snapped": snapped])
