#!/usr/bin/env python3
"""
Sitemap Generator for MagicPencil
Automatically generates sitemap.xml from image catalog
"""

import os
import json
import re
from datetime import datetime
from xml.dom import minidom

# Configuration
BASE_URL = "https://magicpencil.fun"
IMAGES_DIR = "images"
OUTPUT_FILE = "sitemap.xml"

# Static pages configuration
STATIC_PAGES = [
    {
        "loc": f"{BASE_URL}/",
        "changefreq": "weekly",
        "priority": "1.0"
    },
    # Legal pages
    {
        "loc": f"{BASE_URL}/privacy-policy.html",
        "changefreq": "monthly",
        "priority": "0.5"
    },
    {
        "loc": f"{BASE_URL}/contact.html",
        "changefreq": "monthly",
        "priority": "0.5"
    },
    {
        "loc": f"{BASE_URL}/about.html",
        "changefreq": "monthly",
        "priority": "0.5"
    }
]

# Category configuration
CATEGORIES = [
    "alphabets", "animals", "princess", "unicorns", "vehicles",
    "food", "nature", "holidays", "ocean", "fantasy", "shapes", "flowers"
]

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def log_info(message):
    """Print info message"""
    print(f"{Colors.BLUE}[INFO]{Colors.RESET} {message}")

def log_success(message):
    """Print success message"""
    print(f"{Colors.GREEN}[OK]{Colors.RESET} {message}")

def log_error(message):
    """Print error message"""
    print(f"{Colors.RED}[ERROR]{Colors.RESET} {message}")

def log_warning(message):
    """Print warning message"""
    print(f"{Colors.YELLOW}[WARN]{Colors.RESET} {message}")

def scan_images():
    """
    Scan the images directory and return list of all SVG files
    Returns: dict with category as key and list of image files as value
    """
    images_by_category = {}

    if not os.path.exists(IMAGES_DIR):
        log_error(f"Images directory not found: {IMAGES_DIR}")
        return images_by_category

    for category in CATEGORIES:
        category_path = os.path.join(IMAGES_DIR, category)

        if not os.path.exists(category_path):
            log_warning(f"Category directory not found: {category}")
            continue

        svg_files = []
        for filename in os.listdir(category_path):
            if filename.endswith('.svg'):
                svg_files.append(filename)

        if svg_files:
            images_by_category[category] = sorted(svg_files)
            log_info(f"Found {len(svg_files)} images in {category}")

    return images_by_category

def generate_image_id(category, filename):
    """
    Generate image ID from category and filename
    Example: alphabets/A-Apple.svg -> alphabets-a-apple
    """
    # Remove .svg extension
    name = filename.replace('.svg', '')

    # Convert to lowercase and replace spaces with hyphens
    name = name.lower().replace(' ', '-')

    # Remove special characters except hyphens
    name = re.sub(r'[^a-z0-9\-]', '', name)

    # Create ID
    image_id = f"{category}-{name}"

    return image_id

def generate_image_title(filename):
    """
    Generate human-readable title from filename
    Example: A-Apple.svg -> A Apple
    """
    title = filename.replace('.svg', '')
    return title

def generate_sitemap(images_by_category):
    """
    Generate sitemap.xml content
    """
    today = datetime.now().strftime('%Y-%m-%d')

    # Start XML content
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        ''
    ]

    # Add homepage
    xml_lines.extend([
        '    <!-- Homepage -->',
        '    <url>',
        f'        <loc>{BASE_URL}/</loc>',
        f'        <lastmod>{today}</lastmod>',
        '        <changefreq>weekly</changefreq>',
        '        <priority>1.0</priority>',
        '    </url>',
        ''
    ])

    # Add legal pages
    xml_lines.append('    <!-- Legal Pages -->')
    for page in STATIC_PAGES[1:]:  # Skip homepage (already added)
        xml_lines.extend([
            '    <url>',
            f'        <loc>{page["loc"]}</loc>',
            f'        <lastmod>{today}</lastmod>',
            f'        <changefreq>{page["changefreq"]}</changefreq>',
            f'        <priority>{page["priority"]}</priority>',
            '    </url>',
            ''
        ])

    # Add category pages
    xml_lines.append('    <!-- Category Pages -->')
    for category in CATEGORIES:
        xml_lines.extend([
            '    <url>',
            f'        <loc>{BASE_URL}/category.html?cat={category}</loc>',
            f'        <lastmod>{today}</lastmod>',
            '        <changefreq>weekly</changefreq>',
            '        <priority>0.8</priority>',
            '    </url>',
            ''
        ])

    # Add coloring pages with images
    total_images = 0
    for category in sorted(images_by_category.keys()):
        images = images_by_category[category]

        xml_lines.append(f'    <!-- Coloring Pages - {category.capitalize()} -->')

        for filename in images:
            image_id = generate_image_id(category, filename)
            image_title = generate_image_title(filename)

            # URL encode the filename for image location
            encoded_filename = filename.replace(' ', '%20')

            xml_lines.extend([
                '    <url>',
                f'        <loc>{BASE_URL}/coloring.html?id={image_id}</loc>',
                f'        <lastmod>{today}</lastmod>',
                '        <changefreq>monthly</changefreq>',
                '        <priority>0.7</priority>',
                '        <image:image>',
                f'            <image:loc>{BASE_URL}/images/{category}/{encoded_filename}</image:loc>',
                f'            <image:caption>{image_title} Coloring Page - Free Online Coloring for Kids</image:caption>',
                f'            <image:title>{image_title}</image:title>',
                '        </image:image>',
                '    </url>',
                ''
            ])

            total_images += 1

    # Close XML
    xml_lines.append('</urlset>')

    return '\n'.join(xml_lines), total_images

def write_sitemap(content):
    """
    Write sitemap content to file
    """
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(content)
        log_success(f"Sitemap written to {OUTPUT_FILE}")
        return True
    except Exception as e:
        log_error(f"Failed to write sitemap: {e}")
        return False

def validate_sitemap():
    """
    Validate the generated sitemap.xml
    """
    try:
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        # Try to parse as XML
        dom = minidom.parseString(content)

        # Count URLs
        url_count = len(dom.getElementsByTagName('url'))
        image_count = len(dom.getElementsByTagName('image:image'))

        log_success(f"Sitemap validation passed")
        log_info(f"Total URLs: {url_count}")
        log_info(f"Total images: {image_count}")

        return True
    except Exception as e:
        log_error(f"Sitemap validation failed: {e}")
        return False

def main():
    """Main function"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}  MagicPencil - Sitemap Generator{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

    # Step 1: Scan images
    log_info("Scanning images directory...")
    images_by_category = scan_images()

    if not images_by_category:
        log_error("No images found. Aborting.")
        return

    total_categories = len(images_by_category)
    total_images = sum(len(images) for images in images_by_category.values())
    log_success(f"Found {total_images} images across {total_categories} categories")

    # Step 2: Generate sitemap
    log_info("Generating sitemap.xml...")
    sitemap_content, image_count = generate_sitemap(images_by_category)

    # Step 3: Write sitemap
    log_info(f"Writing sitemap to {OUTPUT_FILE}...")
    if not write_sitemap(sitemap_content):
        log_error("Failed to write sitemap")
        return

    # Step 4: Validate sitemap
    log_info("Validating sitemap...")
    if not validate_sitemap():
        log_error("Sitemap validation failed")
        return

    # Summary
    print(f"\n{Colors.GREEN}{'='*60}{Colors.RESET}")
    print(f"{Colors.GREEN}{Colors.BOLD}Sitemap generation completed successfully!{Colors.RESET}")
    print(f"{Colors.GREEN}{'='*60}{Colors.RESET}\n")

    print(f"{Colors.BOLD}Summary:{Colors.RESET}")
    print(f"  • Categories: {total_categories}")
    print(f"  • Images: {total_images}")
    print(f"  • Static pages: {len(STATIC_PAGES)}")
    print(f"  • Category pages: {len(CATEGORIES)}")
    print(f"  • Total URLs: {len(STATIC_PAGES) + len(CATEGORIES) + total_images}")
    print(f"  • Output file: {OUTPUT_FILE}")
    print(f"\n{Colors.YELLOW}Note: Changes not committed. Review and commit manually.{Colors.RESET}\n")

if __name__ == "__main__":
    main()
