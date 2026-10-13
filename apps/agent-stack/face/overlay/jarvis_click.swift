// Z02 click hand: ONE left click at a global point (top-left points) and Evens's real cursor is put back where it was. Only runs after Evens said "confirm".
// Never prompts: CGPreflightPostEventAccess() only reads the Accessibility (post-event) grant; without it we draw
// nothing, post nothing, print why and exit 3. No keystrokes, ever.
// usage: jarvis_click <x> <y> [label]   | jarvis_click --check
import AppKit
// Run as "Jarvis Click.app" through LaunchServices (open -g -n -a ... --args ... --out f) so macOS attributes the
// Accessibility grant to this Jarvis-owned app, not to whatever python launched it. --request asks macOS once.
var a = CommandLine.arguments
var outPath: String? = nil
if let i = a.firstIndex(of: "--out"), i + 1 < a.count { outPath = a[i + 1]; a.removeSubrange(i...(i + 1)) }
func out(_ d: [String: Any], _ code: Int32) -> Never {
  let j = try! JSONSerialization.data(withJSONObject: d); print(String(data: j, encoding: .utf8)!); fflush(stdout)
  if let p = outPath { try? j.write(to: URL(fileURLWithPath: p)) }
  exit(code) }
if a.count >= 2 && a[1] == "--request" {
  let ok = AXIsProcessTrustedWithOptions([kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary)
  out(["post_event_allowed": CGPreflightPostEventAccess(), "ax_trusted": ok, "binary": ProcessInfo.processInfo.arguments[0]], 0) }
let allowed = CGPreflightPostEventAccess()
let me = ProcessInfo.processInfo.arguments[0]
if a.count >= 2 && a[1] == "--check" { out(["post_event_allowed": allowed, "binary": me, "ppid": getppid()], 0) }
guard a.count >= 3, let x = Double(a[1]), let y = Double(a[2]) else { out(["ok": false, "why": "usage"], 2) }
if !allowed { out(["ok": false, "why": "post_event_denied", "binary": me, "ppid": getppid()], 3) }
let label = a.count > 3 ? a[3] : "target"
let target = CGPoint(x: x, y: y)
let home = a.count > 5 ? CGPoint(x: Double(a[4]) ?? x, y: Double(a[5]) ?? y) : (CGEvent(source: nil)?.location ?? target)
// Click only. The visible Jarvis cursor is drawn by face/overlay/pointer_cursor.swift from the Face (same path as the arrow).
let src = CGEventSource(stateID: .hidSystemState)
for ty in [CGEventType.mouseMoved, .leftMouseDown, .leftMouseUp] {
  if let e = CGEvent(mouseEventSource: src, mouseType: ty, mouseCursorPosition: target, mouseButton: .left) { e.post(tap: .cghidEventTap) }
  usleep(ty == .mouseMoved ? 40_000 : 50_000)
}
usleep(60_000)
CGWarpMouseCursorPosition(home); CGAssociateMouseAndMouseCursorPosition(1)   // give Evens his cursor back
out(["ok": true, "x": x, "y": y, "label": label, "restored_to": [home.x, home.y], "binary": me], 0)
