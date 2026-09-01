import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

output_dir = os.path.expanduser('~/Desktop/AppStore_Screenshots')
os.makedirs(output_dir, exist_ok=True)

uploaded_dir = '/Users/alirizacelebi/.gemini/antigravity-ide/brain/d82b0147-ea26-4e2d-a23e-a845b134d839/.user_uploaded'

slides = [
    {
        'file': 'media_1788248147406.png',
        'badge': '🏆 BİLİMSEL 5 KADEMELİ LEİTNER METODU',
        'title1': '7.000+ Akademik Kelimeyi',
        'title2': 'Kalıcı Hafızaya Kazıyın',
        'subtitle': 'Zorlandığınız kelimeler sık, bildikleriniz aralıklı tekrarla zihne yerleşir.'
    },
    {
        'file': 'media_1788247832538.png',
        'badge': '🎯 GÜNLÜK HEDEF & PRATİK',
        'title1': 'Paragraf & Cloze Testte',
        'title2': 'Hızınızı İkiye Katlayın',
        'subtitle': 'Sınavda en çok çıkan soru kalıplarıyla her gün düzenli antrenman yapın.'
    },
    {
        'file': 'media_1788249211870.png',
        'badge': '⚡ YAPAY ZEKA DESTEKLİ SÖZLÜK',
        'title1': 'Özel Kelime Defterinizi',
        'title2': 'Tek Tıkla Oluşturun',
        'subtitle': 'Doğru akademik çeviriler, örnek cümleler ve offline çalışma desteği.'
    },
]

# Helper to create gradient canvas with ambient radial glows
def create_premium_background(width, height):
    # Vertical gradient
    base = Image.new('RGBA', (width, height), (10, 15, 29, 255))
    draw = ImageDraw.Draw(base)
    
    # Gradient interpolation
    c_top = (11, 15, 26)
    c_mid = (17, 24, 48)
    c_bot = (30, 27, 75)
    
    for y in range(height):
        t = y / float(height)
        if t < 0.5:
            factor = t * 2.0
            r = int(c_top[0] + (c_mid[0] - c_top[0]) * factor)
            g = int(c_top[1] + (c_mid[1] - c_top[1]) * factor)
            b = int(c_top[2] + (c_mid[2] - c_top[2]) * factor)
        else:
            factor = (t - 0.5) * 2.0
            r = int(c_mid[0] + (c_bot[0] - c_mid[0]) * factor)
            g = int(c_mid[1] + (c_bot[1] - c_mid[1]) * factor)
            b = int(c_mid[2] + (c_bot[2] - c_mid[2]) * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

    # Add ambient glow orbs
    glow_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    # Top-right cyan glow
    cx1, cy1 = int(width * 0.75), int(height * 0.25)
    r1 = int(width * 0.45)
    glow_draw.ellipse([cx1 - r1, cy1 - r1, cx1 + r1, cy1 + r1], fill=(59, 130, 246, 65))
    
    # Bottom-left purple glow
    cx2, cy2 = int(width * 0.25), int(height * 0.70)
    r2 = int(width * 0.5)
    glow_draw.ellipse([cx2 - r2, cy2 - r2, cx2 + r2, cy2 + r2], fill=(139, 92, 246, 60))
    
    # Blur the glows
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=int(width * 0.2)))
    return Image.alpha_composite(base, glow_layer)

def add_device_mockup(screen_img, target_w):
    # Scale screenshot to target_w
    ratio = target_w / float(screen_img.width)
    target_h = int(screen_img.height * ratio)
    scaled_screen = screen_img.resize((target_w, target_h), Image.Resampling.LANCZOS).convert('RGBA')
    
    # Create device bezel (Titanium border with 50px radius)
    border_thickness = 16
    device_w = target_w + (border_thickness * 2)
    device_h = target_h + (border_thickness * 2)
    corner_radius = 54
    
    device = Image.new('RGBA', (device_w, device_h), (0, 0, 0, 0))
    device_draw = ImageDraw.Draw(device)
    
    # Outer dark titanium bezel
    device_draw.rounded_rectangle(
        [0, 0, device_w, device_h],
        radius=corner_radius,
        fill=(24, 24, 27, 255),
        outline=(63, 63, 70, 255),
        width=3
    )
    
    # Mask screen to have rounded corners
    screen_mask = Image.new('L', (target_w, target_h), 0)
    mask_draw = ImageDraw.Draw(screen_mask)
    mask_draw.rounded_rectangle([0, 0, target_w, target_h], radius=corner_radius - border_thickness, fill=255)
    
    device.paste(scaled_screen, (border_thickness, border_thickness), screen_mask)
    
    # Draw subtle Dynamic Island pill on top
    pill_w = int(target_w * 0.26)
    pill_h = 32
    pill_x = (device_w - pill_w) // 2
    pill_y = border_thickness + 14
    device_draw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=16, fill=(0, 0, 0, 255))
    
    # Deep drop shadow
    shadow_pad = 70
    full_w = device_w + shadow_pad * 2
    full_h = device_h + shadow_pad * 2
    shadow_img = Image.new('RGBA', (full_w, full_h), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_img)
    shadow_draw.rounded_rectangle(
        [shadow_pad, shadow_pad + 20, shadow_pad + device_w, shadow_pad + device_h + 20],
        radius=corner_radius + 4,
        fill=(0, 0, 0, 160)
    )
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(radius=36))
    
    shadow_img.paste(device, (shadow_pad, shadow_pad), device)
    return shadow_img

font_path = '/System/Library/Fonts/SFNSRounded.ttf'
if not os.path.exists(font_path):
    font_path = '/System/Library/Fonts/SFNS.ttf'

for idx, item in enumerate(slides, 1):
    src_path = os.path.join(uploaded_dir, item['file'])
    if not os.path.exists(src_path):
        continue
    src = Image.open(src_path).convert('RGBA')

    # ==================== 1. IPHONE 6.5" (1284 x 2778) ====================
    w, h = 1284, 2778
    canvas = create_premium_background(w, h)
    draw = ImageDraw.Draw(canvas)
    
    # Fonts
    font_badge = ImageFont.truetype(font_path, 34)
    font_t1 = ImageFont.truetype(font_path, 68)
    font_t2 = ImageFont.truetype(font_path, 68)
    font_sub = ImageFont.truetype(font_path, 36)
    
    # Badge Pill (Glassmorphism effect)
    badge_text = item['badge']
    bbox = font_badge.getbbox(badge_text)
    bw = (bbox[2] - bbox[0]) + 60
    bh = 64
    bx = (w - bw) // 2
    by = 170
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=32, fill=(30, 58, 138, 180), outline=(96, 165, 250, 160), width=2)
    draw.text((w // 2, by + bh // 2), badge_text, fill=(147, 197, 253, 255), font=font_badge, anchor='mm')
    
    # Headline (Line 1: White, Line 2: Electric Cyan #38BDF8)
    draw.text((w // 2, 310), item['title1'], fill=(255, 255, 255, 255), font=font_t1, anchor='mm')
    draw.text((w // 2, 400), item['title2'], fill=(56, 189, 248, 255), font=font_t2, anchor='mm')
    
    # Subtitle
    draw.text((w // 2, 485), item['subtitle'], fill=(148, 163, 184, 255), font=font_sub, anchor='mm')
    
    # Device Mockup
    device_w = 980
    framed = add_device_mockup(src, device_w)
    device_x = (w - framed.width) // 2
    canvas.paste(framed, (device_x, 560), framed)
    
    out_iphone = os.path.join(output_dir, f'iphone_6.5_screenshot_{idx}.png')
    canvas.convert('RGB').save(out_iphone, 'PNG', quality=95)
    print(f"Generated: {out_iphone}")

    # ==================== 2. IPAD 13" (2048 x 2732) ====================
    iw, ih = 2048, 2732
    ipad_canvas = create_premium_background(iw, ih)
    ipad_draw = ImageDraw.Draw(ipad_canvas)
    
    font_ipad_badge = ImageFont.truetype(font_path, 42)
    font_ipad_t1 = ImageFont.truetype(font_path, 88)
    font_ipad_t2 = ImageFont.truetype(font_path, 88)
    font_ipad_sub = ImageFont.truetype(font_path, 46)
    
    # Badge Pill
    bbox_ipad = font_ipad_badge.getbbox(badge_text)
    ibw = (bbox_ipad[2] - bbox_ipad[0]) + 70
    ibh = 76
    ibx = (iw - ibw) // 2
    iby = 180
    ipad_draw.rounded_rectangle([ibx, iby, ibx + ibw, iby + ibh], radius=38, fill=(30, 58, 138, 180), outline=(96, 165, 250, 160), width=2)
    ipad_draw.text((iw // 2, iby + ibh // 2), badge_text, fill=(147, 197, 253, 255), font=font_ipad_badge, anchor='mm')
    
    ipad_draw.text((iw // 2, 340), item['title1'], fill=(255, 255, 255, 255), font=font_ipad_t1, anchor='mm')
    ipad_draw.text((iw // 2, 450), item['title2'], fill=(56, 189, 248, 255), font=font_ipad_t2, anchor='mm')
    ipad_draw.text((iw // 2, 555), item['subtitle'], fill=(148, 163, 184, 255), font=font_ipad_sub, anchor='mm')
    
    ipad_device_w = 1200
    framed_ipad = add_device_mockup(src, ipad_device_w)
    ipad_device_x = (iw - framed_ipad.width) // 2
    ipad_canvas.paste(framed_ipad, (ipad_device_x, 640), framed_ipad)
    
    out_ipad = os.path.join(output_dir, f'ipad_13_screenshot_{idx}.png')
    ipad_canvas.convert('RGB').save(out_ipad, 'PNG', quality=95)
    print(f"Generated: {out_ipad}")

print("All premium showcase mockups completed!")
