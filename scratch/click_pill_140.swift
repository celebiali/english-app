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

let p1 = CGPoint(x: simBounds.origin.x + simBounds.width * 0.74, y: simBounds.origin.y + 142)
let p2 = CGPoint(x: p1.x + 2, y: p1.y)

let down = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: p1, mouseButton: .left)!
down.post(tap: .cghidEventTap)
Thread.sleep(forTimeInterval: 0.05)

let drag = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDragged, mouseCursorPosition: p2, mouseButton: .left)!
drag.post(tap: .cghidEventTap)
Thread.sleep(forTimeInterval: 0.05)

let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: p2, mouseButton: .left)!
up.post(tap: .cghidEventTap)
Thread.sleep(forTimeInterval: 1.0)
