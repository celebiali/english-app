import os
from PIL import Image, ImageDraw, ImageFont

output_dir = os.path.expanduser('~/Desktop/AppStore_Screenshots')
os.makedirs(output_dir, exist_ok=True)

# Apple exact specifications:
# 6.5-inch iPhone: 1284 x 2778
# 13-inch iPad: 2048 x 2732

uploaded_dir = '/Users/alirizacelebi/.gemini/antigravity-ide/brain/d82b0147-ea26-4e2d-a23e-a845b134d839/.user_uploaded'

# Select real screenshots of app
candidates = [
    ('media_1788248147406.png', '7.000+ Akademik Kelime', '5 Kademeli Leitner Aralıklı Tekrar Sistemi'),
    ('media_1788247832538.png', 'Günlük Soru Pratikleri', 'Paragraf, Cloze Test, Cümle Tamamlama'),
    ('media_1788249211870.png', 'Akıllı Kelime Sözlüğü', 'Kendi Kelimelerini Ekle, Tek Tıkla Çevir'),
]

for idx, (filename, title, subtitle) in enumerate(candidates, 1):
    img_path = os.path.join(uploaded_dir, filename)
    if not os.path.exists(img_path):
        continue
    
    src = Image.open(img_path).convert('RGBA')
    
    # 1. GENERATE IPHONE 6.5" SCREENSHOT (1284 x 2778)
    iphone_canvas = Image.new('RGBA', (1284, 2778), (241, 245, 249, 255))
    draw = ImageDraw.Draw(iphone_canvas)
    
    # Gradient or solid header card
    header_color = (37, 99, 235, 255) # brand blue
    draw.rectangle([0, 0, 1284, 480], fill=header_color)
    
    # Try system font
    try:
        font_title = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', 72)
        font_sub = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', 44)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    draw.text((642, 180), title, fill=(255, 255, 255, 255), font=font_title, anchor='mm')
    draw.text((642, 280), subtitle, fill=(219, 234, 254, 255), font=font_sub, anchor='mm')
    
    # Fit source screenshot in the lower portion
    target_width = 1120
    ratio = target_width / float(src.width)
    target_height = int(src.height * ratio)
    resized_src = src.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    # Center horizontally, place at top: 520
    x_pos = (1284 - target_width) // 2
    iphone_canvas.paste(resized_src, (x_pos, 520), resized_src)
    
    iphone_out = os.path.join(output_dir, f'iphone_6.5_screenshot_{idx}.png')
    iphone_canvas.convert('RGB').save(iphone_out, 'PNG')
    print(f"Saved: {iphone_out}")

    # 2. GENERATE IPAD 13" SCREENSHOT (2048 x 2732)
    ipad_canvas = Image.new('RGBA', (2048, 2732), (241, 245, 249, 255))
    draw_ipad = ImageDraw.Draw(ipad_canvas)
    draw_ipad.rectangle([0, 0, 2048, 550], fill=header_color)
    
    try:
        font_title_ipad = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', 96)
        font_sub_ipad = ImageFont.truetype('/System/Library/Fonts/SFNS.ttf', 56)
    except:
        font_title_ipad = ImageFont.load_default()
        font_sub_ipad = ImageFont.load_default()
        
    draw_ipad.text((1024, 200), title, fill=(255, 255, 255, 255), font=font_title_ipad, anchor='mm')
    draw_ipad.text((1024, 330), subtitle, fill=(219, 234, 254, 255), font=font_sub_ipad, anchor='mm')
    
    ipad_target_width = 1400
    ipad_ratio = ipad_target_width / float(src.width)
    ipad_target_height = int(src.height * ipad_ratio)
    resized_ipad_src = src.resize((ipad_target_width, ipad_target_height), Image.Resampling.LANCZOS)
    
    ipad_x = (2048 - ipad_target_width) // 2
    ipad_canvas.paste(resized_ipad_src, (ipad_x, 620), resized_ipad_src)
    
    ipad_out = os.path.join(output_dir, f'ipad_13_screenshot_{idx}.png')
    ipad_canvas.convert('RGB').save(ipad_out, 'PNG')
    print(f"Saved: {ipad_out}")

print("All screenshots successfully created!")
