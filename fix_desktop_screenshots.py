import os
from PIL import Image

desktop = os.path.expanduser('~/Desktop')
ready_dir = os.path.join(desktop, 'AppStore_Ready')
os.makedirs(ready_dir, exist_ok=True)

# Exact Apple Requirements:
IPHONE_W, IPHONE_H = 1284, 2778
IPAD_W, IPAD_H = 2048, 2732

for i in range(1, 5):
    img_path = os.path.join(desktop, f'{i}.png')
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        continue

    src = Image.open(img_path).convert('RGB')
    
    # 1. iPhone 6.5" (1284 x 2778) - Direct crisp resize
    iphone_img = src.resize((IPHONE_W, IPHONE_H), Image.Resampling.LANCZOS)
    out_iphone = os.path.join(ready_dir, f'iPhone_6.5_{i}.png')
    iphone_img.save(out_iphone, 'PNG', quality=100)
    print(f"Saved: {out_iphone} ({IPHONE_W}x{IPHONE_H})")

    # 2. iPad 13" (2048 x 2732) - Direct crisp resize with matching aspect ratio
    ipad_img = src.resize((IPAD_W, IPAD_H), Image.Resampling.LANCZOS)
    out_ipad = os.path.join(ready_dir, f'iPad_13_{i}.png')
    ipad_img.save(out_ipad, 'PNG', quality=100)
    print(f"Saved: {out_ipad} ({IPAD_W}x{IPAD_H})")

print("All screenshots perfectly resized to Apple App Store exact specifications!")
