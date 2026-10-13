// Z02 click hand: ONE left click at a global point (top-left points), then Evens's real cursor is put back where it was.
// Only runs after Evens said "confirm". No keystrokes, ever. Never prompts except on --request.
//   jarvis_click <x> <y> [label [homeX homeY]]   one click (home = where his mouse is right now; restored afterwards)
//   jarvis_click --check                          reports the post-event + Accessibility grants
//   jarvis_click --request                        asks macOS once for the Accessibility switch
//   jarvis_click --locate kw1,kw2 [--skip a,b]    Accessibility locator for icon-only controls (runs here because this app holds the grant)
// Run as "Jarvis Click.app" through LaunchServices (open -g -n -a ... --args ... --out f) so macOS attributes the
// Accessibility grant to this Jarvis-owned app, not to whatever python launched it.
// Exit codes: 0 ok, 2 usage, 3 post_event_denied, 4 target not on any display.
import AppKit
import ApplicationServices

var a = CommandLine.arguments
var outPath: String? = nil
if let i = a.firstIndex(of: "--out"), i + 1 < a.count { outPath = a[i + 1]; a.removeSubrange(i...(i + 1)) }
func out(_ d: [String: Any], _ code: Int32) -> Never {
  let j = try! JSONSerialization.data(withJSONObject: d); print(String(data: j, encoding: .utf8)!); fflush(stdout)
  if let p = outPath { try? j.write(to: URL(fileURLWithPath: p)) }
  exit(code) }
let me = ProcessInfo.processInfo.arguments[0]

// ---------------------------------------------------------------- --locate (Accessibility)
if a.count >= 3 && a[1] == "--locate" {
  let kws = a[2].lowercased().split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
  var skip = Set<String>()
  if let i = a.firstIndex(of: "--skip"), i + 1 < a.count { skip = Set(a[i + 1].lowercased().split(separator: ",").map(String.init)) }
  if !AXIsProcessTrusted() { out(["found": false, "why": "ax_untrusted", "ax_trusted": false], 0) }
  func score(_ text: String) -> Int {
    let t = text.lowercased(); if t.isEmpty { return 0 }
    var s = 0
    for k in kws where t.contains(k) { s += k.count >= 4 ? 3 : 1; if t == k { s += 4 } }
    return s }
  func attr(_ e: AXUIElement, _ n: String) -> AnyObject? { var v: AnyObject?; AXUIElementCopyAttributeValue(e, n as CFString, &v); return v }
  // front-most normal window that is not Jarvis's own (the Face/Orb is often "frontmost" while Evens talks to it)
  let wins = (CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]]) ?? []
  var pid: pid_t? = nil, owner = ""
  for w in wins {
    guard (w[kCGWindowLayer as String] as? Int) == 0, let o = w[kCGWindowOwnerName as String] as? String, let p = w[kCGWindowOwnerPID as String] as? Int else { continue }
    let b = w[kCGWindowBounds as String] as? [String: CGFloat] ?? [:]
    if skip.contains(o.lowercased()) || (b["Width"] ?? 0) < 200 || (b["Height"] ?? 0) < 120 { continue }
    pid = pid_t(p); owner = o; break }
  guard let pid = pid else { out(["found": false, "why": "no window", "ax_trusted": true], 0) }
  let clickable: Set<String> = ["AXButton", "AXLink", "AXMenuItem", "AXMenuButton", "AXPopUpButton", "AXTab", "AXRadioButton", "AXCheckBox", "AXCell", "AXStaticText", "AXImage", "AXGroup"]
  var best: (Int, CGRect, String, String)? = nil
  var seen = 0
  func walk(_ e: AXUIElement, _ depth: Int) {
    if depth > 40 || seen > 6000 { return }
    seen += 1
    let role = attr(e, kAXRoleAttribute) as? String ?? ""
    if clickable.contains(role) {
      let txt = [kAXTitleAttribute, kAXDescriptionAttribute, kAXHelpAttribute, kAXValueAttribute, "AXIdentifier"].compactMap { attr(e, $0) as? String }.joined(separator: " ")
      var sc = score(txt)
      if sc > 0, role == "AXButton" || role == "AXLink" || role == "AXMenuItem" || role == "AXMenuButton" { sc += 2 }
      if sc > 0, let pv = attr(e, kAXPositionAttribute), let sv = attr(e, kAXSizeAttribute) {
        var p = CGPoint.zero, z = CGSize.zero
        AXValueGetValue(pv as! AXValue, .cgPoint, &p); AXValueGetValue(sv as! AXValue, .cgSize, &z)
        if z.width > 2, z.height > 2, z.width < 1200, (best == nil || sc > best!.0) { best = (sc, CGRect(origin: p, size: z), String(txt.prefix(60)), role) }
      }
    }
    if let kids = attr(e, kAXChildrenAttribute) as? [AXUIElement] { for k in kids { walk(k, depth + 1) } }
  }
  let ax = AXUIElementCreateApplication(pid)
  AXUIElementSetAttributeValue(ax, "AXEnhancedUserInterface" as CFString, kCFBooleanTrue)  // Chrome/Electron expose web content
  if let ws = attr(ax, kAXWindowsAttribute) as? [AXUIElement], let w = ws.first { walk(w, 0) }
  if let b = best { out(["found": true, "x": b.1.midX, "y": b.1.midY, "w": b.1.width, "h": b.1.height, "label": b.2, "role": b.3,
                         "score": b.0, "source": "ax", "owner": owner, "ax_trusted": true], 0) }
  out(["found": false, "why": "no accessibility match", "owner": owner, "ax_trusted": true], 0)
}

if a.count >= 2 && a[1] == "--request" {
  let ok = AXIsProcessTrustedWithOptions([kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary)
  out(["post_event_allowed": CGPreflightPostEventAccess(), "ax_trusted": ok, "binary": me], 0) }
let allowed = CGPreflightPostEventAccess()
if a.count >= 2 && a[1] == "--check" { out(["post_event_allowed": allowed, "ax_trusted": AXIsProcessTrusted(), "binary": me, "ppid": getppid()], 0) }

// ---------------------------------------------------------------- the click
guard a.count >= 3, let x = Double(a[1]), let y = Double(a[2]) else { out(["ok": false, "why": "usage"], 2) }
if !allowed { out(["ok": false, "why": "post_event_denied", "binary": me, "ppid": getppid()], 3) }
let label = a.count > 3 ? a[3] : "target"
let target = CGPoint(x: x, y: y)
var onDisplay: UInt32 = 0, found: UInt32 = 0
if CGGetDisplaysWithPoint(target, 1, &onDisplay, &found) != .success || found == 0 { out(["ok": false, "why": "target_off_screen", "x": x, "y": y], 4) }
let home = a.count > 5 ? CGPoint(x: Double(a[4]) ?? x, y: Double(a[5]) ?? y) : (CGEvent(source: nil)?.location ?? target)
let src = CGEventSource(stateID: .hidSystemState)
func post(_ ty: CGEventType, _ at: CGPoint, click: Bool) {
  guard let e = CGEvent(mouseEventSource: src, mouseType: ty, mouseCursorPosition: at, mouseButton: .left) else { return }
  if click { e.setIntegerValueField(.mouseEventClickState, value: 1) }   // without a click count some apps (Chrome, Electron) drop the click
  e.post(tap: .cghidEventTap) }
post(.mouseMoved, target, click: false); usleep(120_000)                   // let the target app see the hover before the press
post(.leftMouseDown, target, click: true); usleep(60_000)
post(.leftMouseUp, target, click: true); usleep(80_000)
CGWarpMouseCursorPosition(home); CGAssociateMouseAndMouseCursorPosition(1)   // give Evens his cursor back
post(.mouseMoved, home, click: false)                                        // and tell the apps under it, so hover states follow
out(["ok": true, "x": x, "y": y, "label": label, "restored_to": [home.x, home.y], "binary": me], 0)
