// Jarvis Hands: general mouse and keyboard input for the operator loop.
// Separate from Jarvis Click.app so rebuilding this never drops the pointer's Accessibility grant.
// Usage: jarvis_hands --do '<json>' [--out result.json]
//   {"op":"check"} | {"op":"move","x":..,"y":..} | {"op":"click","x":..,"y":..,"button":"left|right","count":1|2}
//   {"op":"drag","x":..,"y":..,"x2":..,"y2":..} | {"op":"scroll","dy":-5,"dx":0} | {"op":"type","text":"..."}
//   {"op":"key","keys":"cmd+shift+4"}
// Coordinates are global display points, origin top-left (the CGEvent space).
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
if !trusted { out(["ok": false, "why": "Jarvis Hands needs Accessibility permission (System Settings > Privacy & Security > Accessibility)"], 3) }

let src = CGEventSource(stateID: .hidSystemState)
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
default:
  out(["ok": false, "why": "unknown op"], 2)
}
out(["ok": true, "op": op])
