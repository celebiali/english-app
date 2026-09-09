import Foundation
import CoreGraphics
import AppKit

guard let simApp = NSRunningApplication.runningApplications(withBundleIdentifier: "com.apple.iphonesimulator").first else {
    print("Simulator not found")
    exit(1)
}
simApp.activate(options: .activateIgnoringOtherApps)
Thread.sleep(forTimeInterval: 0.5)

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

print("Sim bounds: \(simBounds)")

func click(at p: CGPoint) {
    let down = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: p, mouseButton: .left)!
    down.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 0.05)
    let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: p, mouseButton: .left)!
    up.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 0.5)
}

// Tap Kelime tab (approx 60% width, near bottom)
let kelimeTab = CGPoint(x: simBounds.origin.x + simBounds.width * 0.61, y: simBounds.origin.y + simBounds.height - 40)
click(at: kelimeTab)
Thread.sleep(forTimeInterval: 1.0)

// In Kelime screen, find and click "+ Klasör Oluştur" (top right or in list)
// Let's tap around x: 80%, y: 15% where "+ Klasör" button usually is
let addFolderBtn = CGPoint(x: simBounds.origin.x + simBounds.width * 0.78, y: simBounds.origin.y + 115)
click(at: addFolderBtn)
Thread.sleep(forTimeInterval: 1.0)
