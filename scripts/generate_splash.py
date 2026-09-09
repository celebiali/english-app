import os
import subprocess
from PIL import Image

def generate_splash():
    html_content = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 1284px;
      height: 2778px;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    
    .splash-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      /* Optical balance slightly above center */
      transform: translateY(-50px);
    }
    
    .icon-wrapper {
      position: relative;
      width: 280px;
      height: 280px;
      margin-bottom: 44px;
      filter: drop-shadow(0 32px 64px rgba(37, 99, 235, 0.32)) drop-shadow(0 12px 24px rgba(15, 23, 42, 0.12));
    }
    
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 24px;
      background: #EFF6FF;
      border: 1.5px solid #DBEAFE;
      border-radius: 999px;
      color: #2563EB;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 2px;
      margin-bottom: 24px;
    }
    
    .title-row {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 64px;
      font-weight: 900;
      letter-spacing: -1px;
      margin-bottom: 16px;
    }
    .title-main {
      color: #0F172A;
    }
    .title-accent {
      color: #2563EB;
    }
    
    .subtitle {
      font-size: 24px;
      font-weight: 600;
      color: #64748B;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="splash-content">
    <div class="icon-wrapper">
      <svg width="280" height="280" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Background Gradient -->
          <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1E40AF"/>
            <stop offset="45%" stop-color="#2563EB"/>
            <stop offset="100%" stop-color="#3B82F6"/>
          </linearGradient>

          <!-- Book Left Page Gradient -->
          <linearGradient id="pageLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#EFF6FF"/>
          </linearGradient>

          <!-- Book Right Page Gradient -->
          <linearGradient id="pageRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#DBEAFE"/>
          </linearGradient>

          <!-- Badge Gradient -->
          <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#34D399"/>
            <stop offset="100%" stop-color="#059669"/>
          </linearGradient>

          <!-- Drop Shadow for Book -->
          <filter id="bookShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#1E3A8A" flood-opacity="0.35"/>
          </filter>

          <!-- Drop Shadow for Badge -->
          <filter id="badgeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#064E3B" flood-opacity="0.4"/>
          </filter>
        </defs>

        <!-- Squircle Base -->
        <rect width="1024" height="1024" rx="224" fill="url(#logoBg)"/>
        
        <!-- Subtle Inner Highlight -->
        <rect x="6" y="6" width="1012" height="1012" rx="218" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="8"/>

        <!-- Book Icon -->
        <g filter="url(#bookShadow)">
          <!-- Left Page -->
          <path d="M512 372 C 452 336, 350 320, 268 336 C 256 338, 248 348, 248 360 L 248 636 C 248 648, 258 658, 270 656 C 348 644, 448 660, 512 696 Z" fill="url(#pageLeft)"/>
          
          <!-- Right Page -->
          <path d="M512 372 C 572 336, 674 320, 756 336 C 768 338, 776 348, 776 360 L 776 636 C 776 648, 766 658, 754 656 C 676 644, 576 660, 512 696 Z" fill="url(#pageRight)"/>
          
          <!-- Spine -->
          <rect x="504" y="368" width="16" height="330" rx="8" fill="#BFDBFE"/>

          <!-- Left Page Lines -->
          <path d="M300 400 C 356 392, 420 402, 468 424" stroke="#93C5FD" stroke-width="12" stroke-linecap="round"/>
          <path d="M300 448 C 356 440, 420 450, 468 472" stroke="#93C5FD" stroke-width="12" stroke-linecap="round"/>
          <path d="M300 496 C 356 488, 420 498, 468 520" stroke="#93C5FD" stroke-width="12" stroke-linecap="round"/>

          <!-- Right Page Lines -->
          <path d="M724 400 C 668 392, 604 402, 556 424" stroke="#93C5FD" stroke-width="12" stroke-linecap="round"/>
          <path d="M724 448 C 668 440, 604 450, 556 472" stroke="#93C5FD" stroke-width="12" stroke-linecap="round"/>
          <path d="M724 496 C 668 488, 604 498, 556 520" stroke="#93C5FD" stroke-width="12" stroke-linecap="round"/>
        </g>

        <!-- Floating Green Checkmark Badge -->
        <g filter="url(#badgeShadow)">
          <circle cx="704" cy="326" r="92" fill="url(#badgeGrad)" stroke="#FFFFFF" stroke-width="14"/>
          <path d="M660 328 L692 360 L752 296" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>
    </div>

    <div class="title-row">
      <span class="title-main">Dil Sınavı Hazırlık</span>
    </div>

    <div class="subtitle">
      Akademik Kelime &amp; Sınav Hazırlığı
    </div>
  </div>
</body>
</html>
"""
    tmp_html = '/tmp/splash_preview.html'
    tmp_png = '/tmp/splash_full.png'
    with open(tmp_html, 'w', encoding='utf-8') as f:
        f.write(html_content)

    chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    cmd = [
        chrome_bin,
        "--headless",
        "--disable-gpu",
        "--default-background-color=00000000",
        "--window-size=1284,2778",
        f"--screenshot={tmp_png}",
        tmp_html
    ]
    subprocess.run(cmd, check=True)
    print(f"Rendered full screen splash: {tmp_png}")

    # Now let's create a cropped, transparent 1284x1284 or 1024x1024 splash image that Expo can center
    # In Expo: with resizeMode="contain", Expo takes the splash image and centers it!
    # If the image is a square (e.g. 1024x1024) with transparent background and the logo at the center,
    # Expo centers it perfectly!
    im = Image.open(tmp_png).convert('RGBA')
    # Let's crop to 1284x1284 around the center
    # center is x=642, y=1389 (optical center is around 1339)
    crop_center_y = 1339
    box = (0, crop_center_y - 642, 1284, crop_center_y + 642)
    cropped = im.crop(box).resize((1024, 1024), Image.Resampling.LANCZOS)
    
    # Save to assets/splash.png
    assets_splash = '/Users/alirizacelebi/Desktop/Projects/YDS/english/assets/splash.png'
    cropped.save(assets_splash, 'PNG')
    print(f"Saved: {assets_splash}")

    # Also update ios/YDSMaster/Images.xcassets/SplashScreen.imageset/image.png
    ios_splash = '/Users/alirizacelebi/Desktop/Projects/YDS/english/ios/YDSMaster/Images.xcassets/SplashScreen.imageset/image.png'
    if os.path.exists(os.path.dirname(ios_splash)):
        cropped.save(ios_splash, 'PNG')
        print(f"Saved: {ios_splash}")

    # Also update ios SplashScreenBackground with #F8FAFC (1x1 pixel)
    ios_bg = '/Users/alirizacelebi/Desktop/Projects/YDS/english/ios/YDSMaster/Images.xcassets/SplashScreenBackground.imageset/image.png'
    if os.path.exists(os.path.dirname(ios_bg)):
        bg_pixel = Image.new('RGB', (1, 1), (248, 250, 252)) # #F8FAFC
        bg_pixel.save(ios_bg, 'PNG')
        print(f"Saved: {ios_bg}")

if __name__ == '__main__':
    generate_splash()
