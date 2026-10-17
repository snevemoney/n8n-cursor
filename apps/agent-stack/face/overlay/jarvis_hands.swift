// Jarvis Hands: general mouse and keyboard input for the operator loop.
// Separate from Jarvis Click.app so rebuilding this never drops the pointer's Accessibility grant.
// Usage: jarvis_hands --do '<json>' [--out result.json]
//   {"op":"check"} | {"op":"move","x":..,"y":..} | {"op":"click","x":..,"y":..,"button":"left|right","count":1|2}
//   {"op":"drag","x":..,"y":..,"x2":..,"y2":..} | {"op":"scroll","dy":-5,"dx":0} | {"op":"type","text":"..."}
//   {"op":"key","keys":"cmd+shift+4"}
//   Background (no mouse, no focus change; Evens 10-16 "do things in the background without interrupting me"):
//   {"op":"ax_tree","app":"Spotify","max":400} -> numbered elements with role, label, value, frame, actions, path
//   {"op":"ax_act","app":"Spotify","path":[0,3,1],"action":"AXPress"} | {"op":"ax_set","app":..,"path":[..],"value":"text"}
// Coordinates are global display points, origin top-left (the CGEvent space).
import AppKit
import ApplicationServices
import Foundation

var args = CommandLine.arguments
var outPath: String? = nil
if let i = args.firstIndex(of: "--out"), i + 1 < args.count { outPath = args[i + 1]; args.removeSubrange(i...(i + 1)) }

func out(_ obj: [String: Any], _ code: Int32 = 0) -> Never {
  let data = (try? JSONSerialization.data(withJSONObject: obj)) ?? Data("{}".utf8)
  if let p = outPath { try? data.write(to: URL(fileURLWithPath: p)) } else { FileHandle.standardOutput.write(data) }
  exit(code)
}

guard let i = args.firstIndex(of: "--do"), i + 1 < args.count,
      let req = try? JSONSerialization.jsonObject(with: Data(args[i + 1].utf8)) as? [String: Any],
      let op = req["op"] as? String else { out(["ok": false, "why": "usage"], 2) }

let trusted = AXIsProcessTrusted()
if op == "check" { out(["ok": true, "trusted": trusted]) }
if op == "request" {  // macOS shows its own prompt; only the owner can grant it
  let opts = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
  out(["ok": true, "trusted": AXIsProcessTrustedWithOptions(opts)])
}
if !trusted { out(["ok": false, "why": "Jarvis Hands needs Accessibility permission (System Settings > Privacy & Security > Accessibility)"], 3) }

let src = CGEventSource(stateID: .hidSystemState)

// ---- Accessibility: read and operate an app's UI by element, in the background ----
func axApp(_ name: String) -> AXUIElement? {
  let n = name.lowercased()
  let apps = NSWorkspace.shared.runningApplications.filter { ($0.localizedName ?? "").lowercased() == n || ($0.bundleIdentifier ?? "").lowercased() == n }
  guard let app = apps.first ?? NSWorkspace.shared.runningApplications.first(where: { ($0.localizedName ?? "").lowercased().contains(n) }) else { return nil }
  return AXUIElementCreateApplication(app.processIdentifier)
}
func axAttr(_ e: AXUIElement, _ k: String) -> AnyObject? {
  var v: AnyObject?
  return AXUIElementCopyAttributeValue(e, k as CFString, &v) == .success ? v : nil
}
func axKids(_ e: AXUIElement) -> [AXUIElement] {
  if let w = axAttr(e, kAXWindowsAttribute) as? [AXUIElement], axAttr(e, kAXRoleAttribute) as? String == "AXApplication" {
    return w  // windows first; the menu bar is read only when asked (it floods the element budget)
  }
  return (axAttr(e, kAXChildrenAttribute) as? [AXUIElement]) ?? []
}
func axText(_ v: AnyObject?) -> String {
  if let s = v as? String { return s }
  if let n = v as? NSNumber { return n.stringValue }
  return ""
}
func axFrame(_ e: AXUIElement) -> [Int] {
  var p = CGPoint.zero, z = CGSize.zero
  if let pv = axAttr(e, kAXPositionAttribute) { AXValueGetValue(pv as! AXValue, .cgPoint, &p) }
  if let sv = axAttr(e, kAXSizeAttribute) { AXValueGetValue(sv as! AXValue, .cgSize, &z) }
  return [Int(p.x), Int(p.y), Int(z.width), Int(z.height)]
}
func innerText(_ e: AXUIElement, _ depth: Int = 0) -> String {
  // a row's own name lives in its cells (Finder file rows, Mail lists, Music tracks)
  if depth > 3 { return "" }
  var parts: [String] = []
  for k in axKids(e) {
    let t = axText(axAttr(k, kAXValueAttribute)), d = axText(axAttr(k, kAXTitleAttribute))
    if !t.isEmpty { parts.append(t) } else if !d.isEmpty { parts.append(d) } else { let i = innerText(k, depth + 1); if !i.isEmpty { parts.append(i) } }
    if parts.joined(separator: " · ").count > 80 { break }
  }
  return String(parts.joined(separator: " · ").prefix(80))
}
func axFind(_ root: AXUIElement, _ path: [Int]) -> AXUIElement? {
  var e = root
  var path = path
  if path.first == -1, let mb = axAttr(root, kAXMenuBarAttribute) { e = mb as! AXUIElement; path.removeFirst() }
  for i in path { let k = axKids(e); guard i >= 0, i < k.count else { return nil }; e = k[i] }
  return e
}
func axOp(_ op: String) -> Never {
  guard let name = req["app"] as? String, let app = axApp(name) else { out(["ok": false, "why": "app not running"], 2) }
  if op == "ax_tree" {
    let cap = Int(num("max") ?? 400)
    var rows: [[String: Any]] = []
    var queue: [(AXUIElement, [Int], Int)] = [(app, [], 0)]
    if (req["menus"] as? Bool) == true, let mb = axAttr(app, kAXMenuBarAttribute) { queue = [(mb as! AXUIElement, [-1], 0)] }
    let skip: Set<String> = ["AXGroup", "AXSplitGroup", "AXScrollArea", "AXLayoutArea", "AXUnknown"]
    while !queue.isEmpty && rows.count < cap {
      let (e, path, depth) = queue.removeFirst()
      let role = axText(axAttr(e, kAXRoleAttribute))
      let label = [axText(axAttr(e, kAXTitleAttribute)), axText(axAttr(e, kAXDescriptionAttribute)),
                   axText(axAttr(e, "AXHelp"))].first { !$0.isEmpty } ?? ""
      var value = String(axText(axAttr(e, kAXValueAttribute)).prefix(80))
      if label.isEmpty && value.isEmpty && ["AXRow", "AXCell", "AXOutlineRow"].contains(role) { value = innerText(e) }
      var acts: CFArray?
      AXUIElementCopyActionNames(e, &acts)
      let actions = (acts as? [String]) ?? []
      if !path.isEmpty && (!skip.contains(role) || !label.isEmpty) && (!label.isEmpty || !value.isEmpty || !actions.isEmpty) {
        rows.append(["path": path, "role": role, "label": String(label.prefix(80)), "value": value, "frame": axFrame(e),
                     "actions": actions.filter { $0.hasPrefix("AX") && $0 != "AXScrollToVisible" && $0 != "AXShowDefaultUI" && $0 != "AXShowAlternateUI" },
                     "enabled": (axAttr(e, kAXEnabledAttribute) as? Bool) ?? true])
      }
      if depth < 14 { for (i, k) in axKids(e).enumerated() { queue.append((k, path + [i], depth + 1)) } }
    }
    out(["ok": true, "app": name, "elements": rows])
  }
  guard let path = req["path"] as? [Int], let el = axFind(app, path) else { out(["ok": false, "why": "element not found; read the tree again"], 2) }
  if op == "ax_set", let attr = req["attr"] as? String {  // e.g. AXSelected=true selects a row without a click
    let val: CFTypeRef = (req["bool"] as? Bool).map { $0 ? kCFBooleanTrue : kCFBooleanFalse } ?? (((req["value"] as? String) ?? "") as CFTypeRef)
    let r = AXUIElementSetAttributeValue(el, attr as CFString, val)
    out(["ok": r == .success, "why": r == .success ? "" : "the element refused \(attr) (\(r.rawValue))", "frame": axFrame(el)])
  }
  if op == "ax_set" {
    let v = (req["value"] as? String) ?? ""
    AXUIElementSetAttributeValue(el, kAXFocusedAttribute as CFString, kCFBooleanTrue)
    let r = AXUIElementSetAttributeValue(el, kAXValueAttribute as CFString, v as CFTypeRef)
    out(["ok": r == .success, "why": r == .success ? "" : "the field refused the value (\(r.rawValue))", "value": axText(axAttr(el, kAXValueAttribute))])
  }
  let action = (req["action"] as? String) ?? "AXPress"
  let r = AXUIElementPerformAction(el, action as CFString)
  out(["ok": r == .success, "why": r == .success ? "" : "the element refused \(action) (\(r.rawValue))", "frame": axFrame(el)])
}
func num(_ k: String) -> Double? { (req[k] as? NSNumber)?.doubleValue }
func point(_ kx: String, _ ky: String) -> CGPoint? {
  guard let x = num(kx), let y = num(ky) else { return nil }
  return CGPoint(x: x, y: y)
}
func mouse(_ type: CGEventType, _ at: CGPoint, _ button: CGMouseButton = .left, clicks: Int64 = 1) {
  guard let e = CGEvent(mouseEventSource: src, mouseType: type, mouseCursorPosition: at, mouseButton: button) else { return }
  e.setIntegerValueField(.mouseEventClickState, value: clicks)
  e.post(tap: .cghidEventTap)
}
let pause = { _ = usleep(30_000) }

let keyCodes: [String: CGKeyCode] = [
  "a": 0, "s": 1, "d": 2, "f": 3, "h": 4, "g": 5, "z": 6, "x": 7, "c": 8, "v": 9, "b": 11, "q": 12, "w": 13, "e": 14,
  "r": 15, "y": 16, "t": 17, "1": 18, "2": 19, "3": 20, "4": 21, "6": 22, "5": 23, "=": 24, "9": 25, "7": 26, "-": 27,
  "8": 28, "0": 29, "]": 30, "o": 31, "u": 32, "[": 33, "i": 34, "p": 35, "return": 36, "enter": 36, "l": 37, "j": 38,
  "'": 39, "k": 40, ";": 41, "\\": 42, ",": 43, "/": 44, "n": 45, "m": 46, ".": 47, "tab": 48, "space": 49, "`": 50,
  "delete": 51, "backspace": 51, "escape": 53, "esc": 53, "forwarddelete": 117, "home": 115, "end": 119,
  "pageup": 116, "pagedown": 121, "left": 123, "right": 124, "down": 125, "up": 126,
  "f1": 122, "f2": 120, "f3": 99, "f4": 118, "f5": 96, "f6": 97, "f7": 98, "f8": 100, "f9": 101, "f10": 109, "f11": 103, "f12": 111,
]
let modFlags: [String: CGEventFlags] = ["cmd": .maskCommand, "command": .maskCommand, "shift": .maskShift,
                                        "alt": .maskAlternate, "option": .maskAlternate, "ctrl": .maskControl, "control": .maskControl,
                                        "fn": .maskSecondaryFn]

switch op {
case "move":
  guard let p = point("x", "y") else { out(["ok": false, "why": "x and y required"], 2) }
  mouse(.mouseMoved, p)
case "click":
  guard let p = point("x", "y") else { out(["ok": false, "why": "x and y required"], 2) }
  let right = (req["button"] as? String) == "right"
  let count = Int64(max(1, min(3, Int(num("count") ?? 1))))
  mouse(.mouseMoved, p); pause()
  for n in 1...count {
    mouse(right ? .rightMouseDown : .leftMouseDown, p, right ? .right : .left, clicks: n)
    mouse(right ? .rightMouseUp : .leftMouseUp, p, right ? .right : .left, clicks: n)
  }
case "drag":
  guard let a = point("x", "y"), let b = point("x2", "y2") else { out(["ok": false, "why": "x, y, x2, y2 required"], 2) }
  mouse(.mouseMoved, a); pause(); mouse(.leftMouseDown, a); pause()
  for s in 1...20 {
    let t = Double(s) / 20
    mouse(.leftMouseDragged, CGPoint(x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t)); usleep(10_000)
  }
  mouse(.leftMouseUp, b)
case "scroll":
  let dy = Int32(num("dy") ?? -5), dx = Int32(num("dx") ?? 0)
  CGEvent(scrollWheelEvent2Source: src, units: .line, wheelCount: 2, wheel1: dy, wheel2: dx, wheel3: 0)?.post(tap: .cghidEventTap)
case "type":
  let text = Array(((req["text"] as? String) ?? "").utf16)
  if text.isEmpty { out(["ok": false, "why": "text required"], 2) }
  var start = 0
  while start < text.count {  // keyboard events carry at most ~20 UTF-16 units each
    let chunk = Array(text[start..<min(start + 20, text.count)])
    for down in [true, false] {
      let e = CGEvent(keyboardEventSource: src, virtualKey: 0, keyDown: down)
      e?.keyboardSetUnicodeString(stringLength: chunk.count, unicodeString: chunk)
      e?.post(tap: .cghidEventTap)
    }
    start += 20; usleep(15_000)
  }
case "key":
  let parts = ((req["keys"] as? String) ?? "").lowercased().split(separator: "+").map { $0.trimmingCharacters(in: .whitespaces) }
  guard let last = parts.last, let code = keyCodes[last] else { out(["ok": false, "why": "unknown key"], 2) }
  var flags = CGEventFlags()
  for m in parts.dropLast() {
    guard let f = modFlags[m] else { out(["ok": false, "why": "unknown modifier \(m)"], 2) }
    flags.insert(f)
  }
  for down in [true, false] {
    let e = CGEvent(keyboardEventSource: src, virtualKey: code, keyDown: down)
    e?.flags = flags
    e?.post(tap: .cghidEventTap)
  }
case "ax_tree", "ax_act", "ax_set":
  axOp(op)
default:
  out(["ok": false, "why": "unknown op"], 2)
}
out(["ok": true, "op": op])
