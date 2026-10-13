// Z02 on-device target locator. usage: jarvis_locate <kw1,kw2,...>
// 1) Accessibility tree of the frontmost app (buttons/links/menu items: title, description, help, value).
// 2) Fallback: on-device Vision OCR of the main display (local temp screenshot, argv[2]).  Nothing leaves the Mac.
// Prints one JSON line: {"found":true,"x":..,"y":..,"w":..,"h":..,"label":"..","source":"ax|ocr"} in global top-left points.
import AppKit
import ApplicationServices
import Vision

let kws = (CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "").lowercased()
  .split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
func out(_ d: [String: Any]) -> Never { let j = try! JSONSerialization.data(withJSONObject: d); print(String(data: j, encoding: .utf8)!); exit(0) }
if kws.isEmpty { out(["found": false, "why": "no keywords"]) }

func score(_ text: String) -> Int {
  let t = text.lowercased(); if t.isEmpty { return 0 }
  var s = 0
  for k in kws where t.contains(k) { s += k.count >= 4 ? 3 : 1; if t == k { s += 4 } }
  return s
}
func attr(_ e: AXUIElement, _ a: String) -> AnyObject? { var v: AnyObject?; AXUIElementCopyAttributeValue(e, a as CFString, &v); return v }

var best: (Int, CGRect, String)? = nil
let clickable: Set<String> = ["AXButton", "AXLink", "AXMenuItem", "AXMenuButton", "AXPopUpButton", "AXTab", "AXRadioButton", "AXCheckBox", "AXCell", "AXStaticText", "AXImage", "AXGroup"]
var seen = 0
func walk(_ e: AXUIElement, _ depth: Int) {
  if depth > 40 || seen > 6000 { return }
  seen += 1
  let role = attr(e, kAXRoleAttribute) as? String ?? ""
  if clickable.contains(role) {
    let txt = [kAXTitleAttribute, kAXDescriptionAttribute, kAXHelpAttribute, kAXValueAttribute].compactMap { attr(e, $0) as? String }.joined(separator: " ")
    var sc = score(txt)
    if sc > 0, role == "AXButton" || role == "AXLink" || role == "AXMenuItem" { sc += 2 }
    if sc > 0, let pv = attr(e, kAXPositionAttribute), let sv = attr(e, kAXSizeAttribute) {
      var p = CGPoint.zero, z = CGSize.zero
      AXValueGetValue(pv as! AXValue, .cgPoint, &p); AXValueGetValue(sv as! AXValue, .cgSize, &z)
      if z.width > 2, z.height > 2, z.width < 1200, (best == nil || sc > best!.0) { best = (sc, CGRect(origin: p, size: z), String(txt.prefix(60))) }
    }
  }
  if let kids = attr(e, kAXChildrenAttribute) as? [AXUIElement] { for k in kids { walk(k, depth + 1) } }
}
if AXIsProcessTrusted(), let app = NSWorkspace.shared.frontmostApplication {
  let ax = AXUIElementCreateApplication(app.processIdentifier)
  AXUIElementSetAttributeValue(ax, "AXEnhancedUserInterface" as CFString, kCFBooleanTrue)  // Chrome/Electron expose web content
  if let wins = attr(ax, kAXWindowsAttribute) as? [AXUIElement], let w = wins.first { walk(w, 0) }
}
if let b = best, b.0 >= 3 { out(["found": true, "x": b.1.midX, "y": b.1.midY, "w": b.1.width, "h": b.1.height, "label": b.2, "source": "ax", "ax_trusted": AXIsProcessTrusted()]) }

// Vision OCR fallback, on-device.
// The caller grabs the MAIN display with `screencapture -x -m` to a local temp file (argv[2]) and deletes it after.
let shot = CommandLine.arguments.count > 2 ? CommandLine.arguments[2] : ""
guard !shot.isEmpty, let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: shot) as CFURL, nil),
      let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
  out(["found": false, "why": "no local screen image (Screen Recording)", "ax_trusted": AXIsProcessTrusted()]) }
let main = NSScreen.screens.first!.frame
let req = VNRecognizeTextRequest(); req.recognitionLevel = .accurate; req.usesLanguageCorrection = false
try? VNImageRequestHandler(cgImage: img, options: [:]).perform([req])
var ob: (Int, CGRect, String)? = nil
for r in req.results ?? [] {
  guard let c = r.topCandidates(1).first else { continue }
  let sc = score(c.string)
  if sc > 0, (ob == nil || sc > ob!.0 || (sc == ob!.0 && c.string.count < ob!.2.count)) {
    let bb = r.boundingBox  // normalized, bottom-left origin, over the whole captured desktop
    let rect = CGRect(x: bb.minX * main.width, y: (1 - bb.maxY) * main.height, width: bb.width * main.width, height: bb.height * main.height)
    ob = (sc, rect, c.string)
  }
}
if let b = ob { out(["found": true, "x": b.1.midX, "y": b.1.midY, "w": b.1.width, "h": b.1.height, "label": String(b.2.prefix(60)), "source": "ocr", "ax_trusted": AXIsProcessTrusted()]) }
out(["found": false, "why": "no on-screen match", "ax_trusted": AXIsProcessTrusted()])
