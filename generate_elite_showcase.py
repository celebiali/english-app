import os
import subprocess

output_dir = os.path.expanduser('~/Desktop/AppStore_Screenshots')
html_dir = os.path.join(output_dir, 'elite_templates')
os.makedirs(html_dir, exist_ok=True)
os.makedirs(output_dir, exist_ok=True)

uploaded_dir = '/Users/alirizacelebi/.gemini/antigravity-ide/brain/d82b0147-ea26-4e2d-a23e-a845b134d839/.user_uploaded'

slides = [
    {
        'id': '1',
        'badge': 'BİLİMSEL LEİTNER SİSTEMİ',
        'title': 'Kelimeleri Ezberleme,',
        'title_colored': 'Zihnine Kazı.',
        'desc': '7.000+ akademik kelimeyi 5 kutulu akıllı hafıza algoritmasıyla kalıcı öğren.',
        'chip1': '🧠 5 Leitner Kutusu',
        'chip2': '⚡ %100 Çevrimdışı',
        'chip3': '📚 Özel Klasörler',
        'img': os.path.join(uploaded_dir, 'media_1788256744973.jpg'),
        'bg_start': '#0B1120',
        'bg_mid': '#1E3A8A',
        'bg_end': '#0F172A',
        'accent': '#38BDF8',
        'orb_color': 'rgba(56, 189, 248, 0.4)'
    },
    {
        'id': '2',
        'badge': 'GERÇEK ÖSYM DENEYİMİ',
        'title': '80 Soruluk Denemeler,',
        'title_colored': 'Maksimum Sınav Hızı.',
        'desc': 'Geri sayım sayacı, paragraf ve cloze testlerle gerçek sınav provası yap.',
        'chip1': '⏱️ 180 Dakika Sayaç',
        'chip2': '🎯 80 Özgün Soru',
        'chip3': '📊 Detaylı Puanlama',
        'img': os.path.join(uploaded_dir, 'media_1788256744965.jpg'),
        'bg_start': '#091512',
        'bg_mid': '#065F46',
        'bg_end': '#064E3B',
        'accent': '#34D399',
        'orb_color': 'rgba(52, 211, 153, 0.4)'
    },
    {
        'id': '3',
        'badge': 'KİŞİSEL GELİŞİM VE TELAFİ',
        'title': 'Hatalarından Öğren,',
        'title_colored': 'Netlerini Zirveye Taşı.',
        'desc': 'Yanlış yaptığın soruları biriktir, ÖSYM çeldirici analizleriyle zayıf noktalarını kapat.',
        'chip1': '📕 Akıllı Hata Defteri',
        'chip2': '🔍 Çeldirici Analizi',
        'chip3': '📈 Hedef Takibi',
        'img': os.path.join(uploaded_dir, 'media_1788256744950.jpg'),
        'bg_start': '#190A28',
        'bg_mid': '#581C87',
        'bg_end': '#3B0764',
        'accent': '#C084FC',
        'orb_color': 'rgba(192, 132, 252, 0.4)'
    }
]

chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

for item in slides:
    html = f"""<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');

    * {{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }}

    body {{
      width: 1284px;
      height: 2778px;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: linear-gradient(180deg, {item['bg_start']} 0%, {item['bg_mid']} 50%, {item['bg_end']} 100%);
      color: #FFFFFF;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    }}

    /* Radiant Ambient Light */
    .ambient-glow {{
      position: absolute;
      top: 450px;
      width: 1000px;
      height: 1000px;
      background: radial-gradient(circle, {item['orb_color']} 0%, rgba(0,0,0,0) 65%);
      filter: blur(100px);
      z-index: 1;
      pointer-events: none;
    }}

    /* Header Presentation Area */
    .top-section {{
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 130px 60px 0 60px;
    }}

    .badge-pill {{
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.22);
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
      padding: 16px 36px;
      border-radius: 999px;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 2px;
      color: {item['accent']};
      margin-bottom: 34px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }}

    .hero-title {{
      font-size: 82px;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -2px;
      color: #FFFFFF;
    }}

    .hero-colored {{
      font-size: 82px;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -2px;
      color: {item['accent']};
      margin-bottom: 24px;
      text-shadow: 0 0 40px {item['orb_color']};
    }}

    .hero-desc {{
      font-size: 34px;
      font-weight: 500;
      line-height: 1.45;
      color: #CBD5E1;
      max-width: 980px;
      margin-bottom: 40px;
    }}

    /* Floating Feature Chips */
    .chips-row {{
      display: flex;
      gap: 16px;
      margin-bottom: 30px;
      z-index: 15;
    }}

    .chip {{
      background: rgba(15, 23, 42, 0.7);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      padding: 14px 28px;
      border-radius: 20px;
      font-size: 24px;
      font-weight: 700;
      color: #F8FAFC;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    }}

    /* Ultra-Realistic iPhone 16 Pro Device Frame */
    .mockup-wrapper {{
      position: absolute;
      bottom: -60px;
      z-index: 10;
      width: 980px;
      background: #18181B;
      border-radius: 72px;
      padding: 16px 16px 0 16px;
      border: 5px solid #52525B;
      box-shadow: 
        0 50px 120px -20px rgba(0, 0, 0, 0.9),
        0 20px 50px -10px rgba(0, 0, 0, 0.6),
        inset 0 0 0 2px rgba(255, 255, 255, 0.2);
    }}

    .island {{
      position: absolute;
      top: 30px;
      left: 50%;
      transform: translateX(-50%);
      width: 250px;
      height: 40px;
      background: #000000;
      border-radius: 20px;
      z-index: 25;
      box-shadow: 0 0 1px rgba(255, 255, 255, 0.3);
    }}

    .screen-shot {{
      width: 100%;
      height: auto;
      display: block;
      border-radius: 54px 54px 0 0;
    }}
  </style>
</head>
<body>
  <div class="ambient-glow"></div>

  <div class="top-section">
    <div class="badge-pill">✦ {item['badge']}</div>
    <div class="hero-title">{item['title']}</div>
    <div class="hero-colored">{item['title_colored']}</div>
    <div class="hero-desc">{item['desc']}</div>

    <div class="chips-row">
      <div class="chip">{item['chip1']}</div>
      <div class="chip">{item['chip2']}</div>
      <div class="chip">{item['chip3']}</div>
    </div>
  </div>

  <div class="mockup-wrapper">
    <div class="island"></div>
    <img src="file://{item['img']}" class="screen-shot" />
  </div>
</body>
</html>
"""
    file_path = os.path.join(html_dir, f"elite_{item['id']}.html")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)

    # 1. Render iPhone 6.5"
    out_iphone = os.path.join(output_dir, f"iphone_6.5_screenshot_{item['id']}.png")
    cmd_iphone = [
        chrome_bin,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--window-size=1284,2778",
        f"--screenshot={out_iphone}",
        f"file://{file_path}"
    ]
    subprocess.run(cmd_iphone, check=True)
    print(f"Generated iPhone {item['id']}: {out_iphone}")

    # 2. Render iPad 13" (Exact 2048 x 2732)
    out_ipad = os.path.join(output_dir, f"ipad_13_screenshot_{item['id']}.png")
    cmd_ipad = f'sips -z 2732 2048 --padToHeightWidth 2732 2048 "{out_iphone}" --out "{out_ipad}"'
    subprocess.run(cmd_ipad, shell=True, check=True)
    print(f"Generated iPad {item['id']}: {out_ipad}")

print("All Elite App Store Showcases ready!")
