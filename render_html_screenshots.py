import os
import subprocess

html_dir = os.path.expanduser('~/Desktop/AppStore_Screenshots/html_templates')
output_dir = os.path.expanduser('~/Desktop/AppStore_Screenshots')
os.makedirs(html_dir, exist_ok=True)
os.makedirs(output_dir, exist_ok=True)

uploaded_dir = '/Users/alirizacelebi/.gemini/antigravity-ide/brain/d82b0147-ea26-4e2d-a23e-a845b134d839/.user_uploaded'

cards = [
    {
        'id': '1',
        'badge': 'AKADEMİK İNGİLİZCE & YDS',
        'title': '7.000+ Seçkin Kelime',
        'highlight': 'Kalıcı Olarak Öğrenin',
        'subtitle': '5 Kademeli Leitner sistemiyle kelimeler hafızanıza kazınsın.',
        'img': os.path.join(uploaded_dir, 'media_1788256744973.jpg'),
        'gradient': 'linear-gradient(180deg, #090D1A 0%, #0F172A 50%, #1E1B4B 100%)',
        'glow': 'rgba(37, 99, 235, 0.35)'
    },
    {
        'id': '2',
        'badge': 'ÖSYM FORMATINDA DENEME',
        'title': '80 Soruluk Gerçek Sınav',
        'highlight': 'Sürenizi & Hızınızı Yönetin',
        'subtitle': 'Paragraf, cloze test ve gramer sorularıyla tam sınav provası yapın.',
        'img': os.path.join(uploaded_dir, 'media_1788256744965.jpg'),
        'gradient': 'linear-gradient(180deg, #090D1A 0%, #0F172A 50%, #1E293B 100%)',
        'glow': 'rgba(14, 165, 233, 0.35)'
    },
    {
        'id': '3',
        'badge': 'KİŞİSEL GELİŞİM ANALİZİ',
        'title': 'Akıllı Hata Defteri',
        'highlight': 'Zayıf Noktalarını Güçlendir',
        'subtitle': 'Yanlış çözdüğün soruları biriktir, çeldiricileri analiz edip telafi et.',
        'img': os.path.join(uploaded_dir, 'media_1788256744950.jpg'),
        'gradient': 'linear-gradient(180deg, #090D1A 0%, #0F172A 50%, #311042 100%)',
        'glow': 'rgba(168, 85, 247, 0.35)'
    }
]

chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

for card in cards:
    html_content = f"""<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');
    
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}
    
    body {{
      width: 1284px;
      height: 2778px;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: {card['gradient']};
      color: #FFFFFF;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}

    /* Ambient Glow Background Orb */
    .glow-orb {{
      position: absolute;
      top: 350px;
      width: 900px;
      height: 900px;
      background: radial-gradient(circle, {card['glow']} 0%, rgba(0,0,0,0) 70%);
      filter: blur(80px);
      z-index: 1;
      pointer-events: none;
    }}

    /* Top Content Area */
    .header {{
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding-top: 140px;
      padding-left: 60px;
      padding-right: 60px;
    }}

    .badge {{
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(20px);
      padding: 14px 34px;
      border-radius: 999px;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #60A5FA;
      margin-bottom: 36px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    }}

    .title {{
      font-size: 78px;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -2px;
      color: #FFFFFF;
      margin-bottom: 12px;
    }}

    .highlight {{
      font-size: 78px;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -2px;
      background: linear-gradient(135deg, #38BDF8 0%, #818CF8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 26px;
    }}

    .subtitle {{
      font-size: 34px;
      font-weight: 500;
      line-height: 1.45;
      color: #94A3B8;
      max-width: 980px;
    }}

    /* Phone Mockup Frame */
    .phone-container {{
      position: absolute;
      bottom: -80px;
      z-index: 10;
      width: 980px;
      background: #18181B;
      border-radius: 68px;
      padding: 18px 18px 0 18px;
      border: 4px solid #3F3F46;
      box-shadow: 
        0 40px 100px -20px rgba(0, 0, 0, 0.8),
        0 20px 40px -10px rgba(0, 0, 0, 0.5),
        inset 0 0 0 2px rgba(255, 255, 255, 0.15);
    }}

    /* Dynamic Island */
    .dynamic-island {{
      position: absolute;
      top: 32px;
      left: 50%;
      transform: translateX(-50%);
      width: 250px;
      height: 38px;
      background: #000000;
      border-radius: 20px;
      z-index: 20;
    }}

    .screen-img {{
      width: 100%;
      height: auto;
      display: block;
      border-radius: 50px 50px 0 0;
    }}
  </style>
</head>
<body>
  <div class="glow-orb"></div>

  <div class="header">
    <div class="badge">✦ {card['badge']}</div>
    <div class="title">{card['title']}</div>
    <div class="highlight">{card['highlight']}</div>
    <div class="subtitle">{card['subtitle']}</div>
  </div>

  <div class="phone-container">
    <div class="dynamic-island"></div>
    <img src="file://{card['img']}" class="screen-img" />
  </div>
</body>
</html>
"""
    html_file = os.path.join(html_dir, f"template_{card['id']}.html")
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)

    # 1. RENDER IPHONE 6.5" (1284x2778)
    out_iphone = os.path.join(output_dir, f"iphone_6.5_screenshot_{card['id']}.png")
    cmd_iphone = [
        chrome_bin,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--window-size=1284,2778",
        f"--screenshot={out_iphone}",
        f"file://{html_file}"
    ]
    subprocess.run(cmd_iphone, check=True)
    print(f"Rendered iPhone: {out_iphone}")

    # 2. RENDER IPAD 13" (2048x2732)
    # Using sips to create proportional iPad version
    out_ipad = os.path.join(output_dir, f"ipad_13_screenshot_{card['id']}.png")
    # Resize and letterbox/pad to 2048x2732
    cmd_ipad = f'sips -z 2732 2048 --padToHeightWidth 2732 2048 "{out_iphone}" --out "{out_ipad}"'
    subprocess.run(cmd_ipad, shell=True, check=True)
    print(f"Rendered iPad: {out_ipad}")

print("All Chrome-rendered screenshots complete!")
