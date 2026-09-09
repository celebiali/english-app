import Foundation
import CoreGraphics
import AppKit

guard let simApp = NSRunningApplication.runningApplications(withBundleIdentifier: "com.apple.iphonesimulator").first else {
    exit(1)
}
simApp.activate(options: .activateIgnoringOtherApps)
Thread.sleep(forTimeInterval: 0.3)

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
    Thread.sleep(forTimeInterval: 0.05)
    let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: p, mouseButton: .left)!
    up.post(tap: .cghidEventTap)
}

// Kelime tab button is at x: 62.5%, y: bottom - 45px
let kelimeTab = CGPoint(x: simBounds.origin.x + simBounds.width * 0.625, y: simBounds.origin.y + simBounds.height - 45)
click(at: kelimeTab)
Thread.sleep(forTimeInterval: 0.8)
