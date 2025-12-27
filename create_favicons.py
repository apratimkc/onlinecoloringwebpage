#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create favicon and optimized logo files from Logo_3.png
"""

from PIL import Image
import os
import sys

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("MagicPencil Favicon & Logo Generator")
print("=" * 60)
print("Selected Logo: Logo_3.png")
print("=" * 60)
print()

# Define paths
logo_dir = "assets/logos"
assets_dir = "assets"
source_logo = os.path.join(logo_dir, "Logo_3.png")

# Check if source exists
if not os.path.exists(source_logo):
    print(f"[ERROR] Source logo not found: {source_logo}")
    sys.exit(1)

# Open source image
try:
    img = Image.open(source_logo)
    print(f"[OK] Loaded source logo: {img.size[0]}x{img.size[1]}px")
    print()
except Exception as e:
    print(f"[ERROR] Failed to load logo: {str(e)}")
    sys.exit(1)

# Define sizes to create
sizes = [
    # Favicons
    (16, 16, "favicon-16x16.png", assets_dir),
    (32, 32, "favicon-32x32.png", assets_dir),
    (180, 180, "apple-touch-icon.png", assets_dir),

    # Website uses
    (64, 64, "logo-64.png", assets_dir),
    (128, 128, "logo-128.png", assets_dir),
    (256, 256, "logo-256.png", assets_dir),
    (512, 512, "logo-512.png", assets_dir),
]

print("Creating optimized logo files...")
print("-" * 60)

for width, height, filename, output_dir in sizes:
    try:
        # Resize image
        resized = img.resize((width, height), Image.Resampling.LANCZOS)

        # Output path
        output_path = os.path.join(output_dir, filename)

        # Save optimized PNG
        resized.save(output_path, 'PNG', optimize=True, quality=95)

        # Get file size
        file_size = os.path.getsize(output_path)
        size_kb = file_size / 1024

        print(f"[OK] Created: {filename}")
        print(f"     Size: {width}x{height}px | {size_kb:.1f} KB")

    except Exception as e:
        print(f"[ERROR] Failed to create {filename}: {str(e)}")

print()
print("-" * 60)

# Create favicon.ico (multi-size ICO file)
try:
    print("Creating favicon.ico (multi-resolution)...")

    # Create multiple sizes for ICO
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_images = []

    for size in ico_sizes:
        resized = img.resize(size, Image.Resampling.LANCZOS)
        ico_images.append(resized)

    # Save as ICO
    ico_path = os.path.join(assets_dir, "favicon.ico")
    ico_images[0].save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])

    file_size = os.path.getsize(ico_path)
    size_kb = file_size / 1024

    print(f"[OK] Created: favicon.ico")
    print(f"     Contains: 16x16, 32x32, 48x48 | {size_kb:.1f} KB")
    print()

except Exception as e:
    print(f"[ERROR] Failed to create favicon.ico: {str(e)}")
    print()

print("=" * 60)
print("[OK] All favicon and logo files created!")
print()
print("Files created in /assets/:")
print("  - favicon.ico (16x16, 32x32, 48x48)")
print("  - favicon-16x16.png")
print("  - favicon-32x32.png")
print("  - apple-touch-icon.png (180x180)")
print("  - logo-64.png")
print("  - logo-128.png")
print("  - logo-256.png")
print("  - logo-512.png")
print()
print("Next: Creating Open Graph image (1200x630)...")
