import Foundation
import CoreGraphics
import AppKit

guard let simApp = NSRunningApplication.runningApplications(withBundleIdentifier: "com.apple.iphonesimulator").first else { exit(1) }
simApp.activate(options: .activateIgnoringOtherApps)
Thread.sleep(forTimeInterval: 0.2)

let simWindows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as! [[String: Any]]
var simBounds = CGRect.zero
for win in simWindows {
    if let owner = win[kCGWindowOwnerName as String] as? String, owner.contains("Simulator"),
       let bounds = win[kCGWindowBounds as String] as? [String: Any],
       let w = bounds["Width"] as? CGFloat, let h = bounds["Height"] as? CGFloat,
       let x = bounds["X"] as? CGFloat, let y = bounds["Y"] as? CGFloat,
       w > 300 && h > 600 {
        simBounds = CGRect(x: x, y: y, width: w, height: h)
        break
    }
}

func click(at p: CGPoint) {
    let down = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: p, mouseButton: .left)!
    down.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 0.08)
    let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: p, mouseButton: .left)!
    up.post(tap: .cghidEventTap)
}

// In iPhone 16e window (w: 452, h: 950):
// Window title bar is ~28pt.
// Content begins at y+28.
// Pill is at center x: 340 (0.75 of 452), content y: 88 => 28 + 88 = 116pt.
let p = CGPoint(x: simBounds.origin.x + simBounds.width * 0.75, y: simBounds.origin.y + 116)
print("Clicking at: \(p)")
click(at: p)
Thread.sleep(forTimeInterval: 1.0)
