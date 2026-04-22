#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create Open Graph image (1200x630) with Logo_3.png
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("MagicPencil Open Graph Image Generator")
print("=" * 60)

# Define paths
logo_dir = "assets/logos"
assets_dir = "assets"
source_logo = os.path.join(logo_dir, "Logo_3.png")
output_path = os.path.join(assets_dir, "og-image.png")

# Open Graph standard size
OG_WIDTH = 1200
OG_HEIGHT = 630

# Create background with gradient
print("Creating Open Graph image (1200x630)...")
print()

# Create new image with colorful background
og_image = Image.new('RGB', (OG_WIDTH, OG_HEIGHT))
draw = ImageDraw.Draw(og_image)

# Create gradient background (purple to blue)
for y in range(OG_HEIGHT):
    # Gradient from purple (#764ba2) to blue (#667eea)
    r = int(118 + (102 - 118) * (y / OG_HEIGHT))
    g = int(75 + (126 - 75) * (y / OG_HEIGHT))
    b = int(162 + (234 - 162) * (y / OG_HEIGHT))
    draw.rectangle([(0, y), (OG_WIDTH, y + 1)], fill=(r, g, b))

print("[OK] Created gradient background")

# Load and resize logo
try:
    logo = Image.open(source_logo)

    # Resize logo to fit nicely (about 400px)
    logo_size = 400
    logo_resized = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

    # Position logo (center-left)
    logo_x = 100
    logo_y = (OG_HEIGHT - logo_size) // 2

    # Paste logo onto background
    og_image.paste(logo_resized, (logo_x, logo_y), logo_resized if logo_resized.mode == 'RGBA' else None)

    print(f"[OK] Added logo at {logo_x},{logo_y}")

except Exception as e:
    print(f"[ERROR] Failed to add logo: {str(e)}")

# Add text
try:
    # Try to use a nice font, fall back to default if not available
    try:
        # Try common Windows fonts
        font_large = ImageFont.truetype("arial.ttf", 80)
        font_small = ImageFont.truetype("arial.ttf", 40)
    except:
        try:
            font_large = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 80)
            font_small = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 40)
        except:
            # Fall back to default font
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()

    # Text position (right side)
    text_x = 550
    text_y = 200

    # Brand name
    draw.text((text_x, text_y), "MagicPencil", fill='white', font=font_large)

    # Tagline
    draw.text((text_x, text_y + 100), "Free online coloring", fill='white', font=font_small)
    draw.text((text_x, text_y + 150), "for kids", fill='white', font=font_small)

    print("[OK] Added text overlay")

except Exception as e:
    print(f"[WARNING] Text rendering issue: {str(e)}")
    print("         (Image created without text)")

# Save Open Graph image
try:
    og_image.save(output_path, 'PNG', optimize=True, quality=90)

    file_size = os.path.getsize(output_path)
    size_kb = file_size / 1024

    print()
    print("=" * 60)
    print(f"[OK] Open Graph image created!")
    print(f"     File: {output_path}")
    print(f"     Size: {OG_WIDTH}x{OG_HEIGHT}px | {size_kb:.1f} KB")
    print()
    print("This image will be used when sharing on:")
    print("  - Facebook")
    print("  - Twitter")
    print("  - Pinterest")
    print("  - WhatsApp")
    print("  - LinkedIn")
    print()

except Exception as e:
    print(f"[ERROR] Failed to save Open Graph image: {str(e)}")

print("=" * 60)
print("[OK] All logo assets complete!")
print()
print("Summary of created files:")
print("  /assets/favicon.ico")
print("  /assets/favicon-16x16.png")
print("  /assets/favicon-32x32.png")
print("  /assets/apple-touch-icon.png")
print("  /assets/logo-64.png")
print("  /assets/logo-128.png")
print("  /assets/logo-256.png")
print("  /assets/logo-512.png")
print("  /assets/og-image.png (1200x630 for social)")
print()
print("Next step: Update HTML files with new logo references!")
