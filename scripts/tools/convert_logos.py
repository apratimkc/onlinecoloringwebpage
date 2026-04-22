#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convert JFIF logos to PNG format for web use
"""

from PIL import Image
import os
import sys

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Define paths
logo_dir = "assets/logos"
jfif_files = ["Logo_1.jfif", "Logo_2.jfif", "Logo_3.jfif", "Logo_4.jfif"]

print("MagicPencil Logo Converter")
print("=" * 50)

for jfif_file in jfif_files:
    input_path = os.path.join(logo_dir, jfif_file)
    output_path = os.path.join(logo_dir, jfif_file.replace(".jfif", ".png"))

    if os.path.exists(input_path):
        try:
            # Open JFIF image
            img = Image.open(input_path)

            # Convert to RGB (in case it's RGBA)
            if img.mode == 'RGBA':
                # Create white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Save as PNG
            img.save(output_path, 'PNG', optimize=True)

            # Get image dimensions
            width, height = img.size

            print(f"[OK] Converted: {jfif_file}")
            print(f"   → {os.path.basename(output_path)}")
            print(f"   Dimensions: {width}x{height}px")
            print()

        except Exception as e:
            print(f"[ERROR] Error converting {jfif_file}: {str(e)}")
            print()
    else:
        print(f"[WARNING] File not found: {jfif_file}")
        print()

print("=" * 50)
print("[OK] Conversion complete!")
print(f"PNG files saved in: {logo_dir}/")
print()
print("Next step: Open logo-comparison.html to choose your favorite!")
