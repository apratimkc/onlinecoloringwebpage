#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SVG Automation Script for ColorTap Coloring Platform
Processes SVG files and auto-generates image catalog
"""

import os
import re
import shutil
import sys
from pathlib import Path
from xml.etree import ElementTree as ET
from datetime import datetime

# Fix Unicode encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Configuration
IMAGES_DIR = "images"
CATALOG_FILE = "js/data/image-catalog.js"
BACKUP_SUFFIX = ".backup"
SVG_NAMESPACE = {"svg": "http://www.w3.org/2000/svg"}

# Difficulty levels based on region count
DIFFICULTY_SIMPLE = (1, 15)
DIFFICULTY_MEDIUM = (16, 40)
DIFFICULTY_COMPLEX = (41, 999)

# Color codes
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def log_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.RESET}")

def log_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.RESET}")

def log_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.RESET}")

def log_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.RESET}")

def create_backup(file_path):
    """Create a backup of the file"""
    if os.path.exists(file_path):
        backup_path = file_path + BACKUP_SUFFIX
        shutil.copy2(file_path, backup_path)
        log_info(f"Backup created: {backup_path}")
        return backup_path
    return None

def scan_image_folders():
    """Scan all subdirectories in images/ for SVG files"""
    svg_files = []

    if not os.path.exists(IMAGES_DIR):
        log_error(f"Images directory not found: {IMAGES_DIR}")
        return svg_files

    for category_dir in os.listdir(IMAGES_DIR):
        category_path = os.path.join(IMAGES_DIR, category_dir)

        if not os.path.isdir(category_path):
            continue

        for filename in os.listdir(category_path):
            if filename.lower().endswith('.svg'):
                svg_path = os.path.join(category_path, filename)
                svg_files.append({
                    'path': svg_path,
                    'filename': filename,
                    'category': category_dir
                })

    log_info(f"Found {len(svg_files)} SVG files across categories")
    return svg_files

def parse_svg(file_path):
    """Parse SVG file and return ElementTree"""
    try:
        # Register namespace to preserve it
        ET.register_namespace('', 'http://www.w3.org/2000/svg')
        tree = ET.parse(file_path)
        return tree
    except Exception as e:
        log_error(f"Failed to parse SVG: {file_path} - {e}")
        return None

def validate_dual_layer_svg(tree):
    """Validate if SVG has proper dual-layer structure"""
    root = tree.getroot()

    # Look for groups (layers)
    groups = root.findall('.//{http://www.w3.org/2000/svg}g')

    if len(groups) < 2:
        return False, "Missing dual-layer structure (need at least 2 <g> groups)"

    # Check for paths with black fills (outline layer) OR strokes
    has_outline = False
    has_colorable = False
    has_strokes = False

    for group in groups:
        paths = group.findall('.//{http://www.w3.org/2000/svg}path')

        for path in paths:
            fill = path.get('fill', '')
            style = path.get('style', '')

            # Check for outline (black fill)
            if fill in ['#000000', '#000', 'black', 'rgb(0, 0, 0)']:
                has_outline = True

            # Check for colorable (transparent in style)
            if 'fill:transparent' in style or 'fill: transparent' in style:
                has_colorable = True

            # Check for fill:none (needs conversion to fill:transparent)
            if 'fill:none' in style or 'fill: none' in style or fill == 'none':
                has_colorable = True

            # Check for stroke-based outlines
            if 'stroke:' in style or path.get('stroke'):
                has_strokes = True

    # Validate: need outline (black fills OR strokes) AND colorable regions
    if not has_outline and not has_strokes:
        return False, "No outline layer found (missing black fills or strokes)"

    if not has_colorable:
        return False, "No colorable layer found (missing transparent/none fills)"

    return True, "Valid dual-layer SVG"

def has_fill_or_stroke(element):
    """Check if an element has visible fill or stroke"""
    fill = element.get('fill', '')
    stroke = element.get('stroke', '')
    style = element.get('style', '')

    # Check for fills (anything except 'none' or 'transparent')
    has_fill = (fill and fill not in ['none', 'transparent']) or \
               ('fill:' in style and 'fill:none' not in style and 'fill:transparent' not in style and 'fill: none' not in style and 'fill: transparent' not in style)

    # Check for strokes (must use regex to match "stroke:" not "stroke-width:", "stroke-opacity:", etc.)
    import re
    has_stroke = (stroke and stroke != 'none') or \
                 (re.search(r'(?:^|;)\s*stroke\s*:', style) and 'stroke:none' not in style and 'stroke: none' not in style)

    return has_fill or has_stroke

def is_colorable_layer(group_element):
    """
    Detect if a layer is colorable by analyzing all its children.
    A layer is colorable if ALL its paths have no fill and no stroke.
    """
    # Find all paths in this group (including nested groups)
    paths = []
    for elem in group_element.iter():
        if elem.tag.endswith('path') or elem.tag.endswith('circle') or \
           elem.tag.endswith('rect') or elem.tag.endswith('polygon') or \
           elem.tag.endswith('ellipse'):
            paths.append(elem)

    if len(paths) == 0:
        return False  # Empty layer

    # Check if ALL paths have no fill and no stroke
    for path in paths:
        if has_fill_or_stroke(path):
            return False  # Found a path with fill or stroke = NOT colorable

    # All paths have no fill and no stroke = colorable layer
    return True

def is_in_colorable_layer(element, parent_map):
    """
    Check if element is in a colorable layer by analyzing layer characteristics.
    Strategy: A colorable layer has ALL paths with no fill and no stroke.
    An outline layer has paths with fills or strokes.
    """
    current = element

    while current is not None:
        parent = parent_map.get(current)
        if parent is None:
            break

        # Check if parent is a group (layer)
        if parent.tag.endswith('g'):
            # Analyze this layer's characteristics
            if is_colorable_layer(parent):
                return True  # This is a colorable layer
            else:
                return False  # This is an outline layer (has fills/strokes)

        current = parent

    # If not in any group, check the element itself
    # Elements with no fill and no stroke are colorable
    return not has_fill_or_stroke(element)

def count_colorable_regions(tree):
    """Count colorable path regions in SVG"""
    root = tree.getroot()
    count = 0

    # Build parent map
    parent_map = {c: p for p in root.iter() for c in p}

    for path in root.findall('.//{http://www.w3.org/2000/svg}path'):
        if is_in_colorable_layer(path, parent_map):
            count += 1

    return count

def fix_svg_attributes(tree, file_path):
    """Fix SVG attributes according to requirements"""
    root = tree.getroot()
    modified = False

    # Build parent map for layer detection
    parent_map = {c: p for p in root.iter() for c in p}

    # 1. Remove width and height attributes, keep only viewBox
    if root.get('width'):
        root.attrib.pop('width')
        modified = True
        log_info(f"  Removed width attribute")

    if root.get('height'):
        root.attrib.pop('height')
        modified = True
        log_info(f"  Removed height attribute")

    # 2. Ensure colorable paths have style="fill:transparent;stroke:none"
    # IMPORTANT: Only modify paths in colorable layers, NEVER touch outline layer
    colorable_fixed = 0
    outline_preserved = 0

    for path in root.findall('.//{http://www.w3.org/2000/svg}path'):
        # Check if this path is in a colorable layer
        if not is_in_colorable_layer(path, parent_map):
            # This is an OUTLINE layer path - DO NOT MODIFY IT
            outline_preserved += 1
            continue

        # This is a COLORABLE layer path - ensure it has proper attributes
        style = path.get('style', '')
        fill = path.get('fill', '')

        # Convert fill:none to fill:transparent for colorable layer paths
        if 'fill:none' in style or 'fill: none' in style:
            # Replace fill:none with fill:transparent
            style = style.replace('fill:none', 'fill:transparent')
            style = style.replace('fill: none', 'fill:transparent')
            # Ensure stroke:none is present
            if 'stroke:none' not in style and 'stroke: none' not in style:
                if not style.endswith(';'):
                    style += ';'
                style += 'stroke:none'
            path.set('style', style)
            colorable_fixed += 1
            modified = True

        # If it has fill:transparent but missing stroke:none
        elif 'fill:transparent' in style or 'fill: transparent' in style:
            if 'stroke:none' not in style and 'stroke: none' not in style:
                # Add stroke:none to existing style
                if not style.endswith(';'):
                    style += ';'
                style += 'stroke:none'
                path.set('style', style)
                colorable_fixed += 1
                modified = True

        # If it has fill="transparent" or fill="none" attribute, convert to style format
        elif fill in ['transparent', 'none']:
            path.set('style', 'fill:transparent;stroke:none')
            if 'fill' in path.attrib:
                path.attrib.pop('fill')
            colorable_fixed += 1
            modified = True

    if colorable_fixed > 0:
        log_info(f"  Fixed {colorable_fixed} colorable paths")

    if outline_preserved > 0:
        log_info(f"  Preserved {outline_preserved} outline paths (unchanged)")

    return tree, modified

def generate_catalog_entry(svg_file, regions_count):
    """Generate catalog entry object"""
    filename = svg_file['filename']
    category = svg_file['category']

    # Generate ID: category-name-number (e.g., animal-dog-1)
    base_name = os.path.splitext(filename)[0]
    # Clean up name for ID (lowercase, replace spaces/underscores with hyphens)
    clean_name = re.sub(r'[_\s]+', '-', base_name.lower())
    clean_name = re.sub(r'[^a-z0-9-]', '', clean_name)

    # Find next available number for this category
    entry_id = f"{category}-{clean_name}"

    # Generate display name from filename
    # Remove common suffixes like -simple, -1, etc.
    display_name = base_name.replace('-', ' ').replace('_', ' ')
    # Capitalize first letter of each word
    display_name = ' '.join(word.capitalize() for word in display_name.split())

    # Determine difficulty - for now all set to 'medium' as per requirement
    difficulty = 'medium'

    # Alternative: auto-detect based on region count
    # if regions_count <= DIFFICULTY_SIMPLE[1]:
    #     difficulty = 'simple'
    # elif regions_count <= DIFFICULTY_MEDIUM[1]:
    #     difficulty = 'medium'
    # else:
    #     difficulty = 'complex'

    return {
        'id': entry_id,
        'category': category,
        'name': display_name,
        'filename': filename,
        'difficulty': difficulty,
        'regions': regions_count
    }

def process_svg_file(svg_file):
    """Process a single SVG file"""
    file_path = svg_file['path']
    log_info(f"\nProcessing: {file_path}")

    # Parse SVG
    tree = parse_svg(file_path)
    if tree is None:
        log_error(f"Skipping: Failed to parse {file_path}")
        return None

    # Validate dual-layer structure
    is_valid, message = validate_dual_layer_svg(tree)
    if not is_valid:
        log_warning(f"Skipping: {file_path} - {message}")
        return None

    log_success(f"Validation passed: {message}")

    # Count colorable regions
    regions = count_colorable_regions(tree)
    log_info(f"  Found {regions} colorable regions")

    if regions == 0:
        log_warning(f"Skipping: No colorable regions found in {file_path}")
        return None

    # Fix SVG attributes
    tree, modified = fix_svg_attributes(tree, file_path)

    # Save modified SVG
    if modified:
        # Create backup
        create_backup(file_path)

        # Write updated SVG
        tree.write(file_path, encoding='utf-8', xml_declaration=True)
        log_success(f"Updated: {file_path}")
    else:
        log_info(f"  No changes needed")

    # Generate catalog entry
    entry = generate_catalog_entry(svg_file, regions)
    log_success(f"Catalog entry: {entry['id']} ({entry['regions']} regions)")

    return entry

def write_catalog_file(entries):
    """Write image-catalog.js file"""
    if not entries:
        log_error("No entries to write to catalog")
        return False

    # Group entries by category
    by_category = {}
    for entry in entries:
        cat = entry['category']
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(entry)

    # Create backup of existing catalog
    if os.path.exists(CATALOG_FILE):
        create_backup(CATALOG_FILE)

    # Generate JavaScript content
    js_content = """/**
 * Image Catalog
 * Contains metadata for all coloring images
 * Auto-generated by svg-automation.py
 */

const imageCatalog = [
"""

    # Add entries grouped by category
    for category in sorted(by_category.keys()):
        js_content += f"    // {category.capitalize()} Category\n"

        for entry in by_category[category]:
            js_content += f"""    {{
        id: '{entry['id']}',
        category: '{entry['category']}',
        name: '{entry['name']}',
        filename: '{entry['filename']}',
        difficulty: '{entry['difficulty']}',
        regions: {entry['regions']}
    }},
"""
        js_content += "\n"

    # Remove last comma and newline, close array
    js_content = js_content.rstrip(',\n') + "\n"
    js_content += """];

/**
 * Get all images
 */
function getAllImages() {
    return imageCatalog;
}

/**
 * Get images by category
 */
function getImagesByCategory(category) {
    return imageCatalog.filter(img => img.category === category);
}

/**
 * Get image by ID
 */
function getImageById(id) {
    return imageCatalog.find(img => img.id === id);
}

/**
 * Get random image
 */
function getRandomImage() {
    return imageCatalog[Math.floor(Math.random() * imageCatalog.length)];
}

/**
 * Get all categories
 */
function getAllCategories() {
    const categories = [...new Set(imageCatalog.map(img => img.category))];
    return categories.map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        count: imageCatalog.filter(img => img.category === cat).length
    }));
}

/**
 * Category Display Names and Icons
 */
const categoryInfo = {
    animals: { name: 'Animals', icon: '🐶' },
    princess: { name: 'Princess', icon: '👸' },
    unicorns: { name: 'Unicorns', icon: '🦄' },
    vehicles: { name: 'Vehicles', icon: '🚗' },
    food: { name: 'Food', icon: '🍕' },
    nature: { name: 'Nature', icon: '🌳' },
    holidays: { name: 'Holidays', icon: '🎄' },
    dinosaurs: { name: 'Dinosaurs', icon: '🦕' },
    ocean: { name: 'Ocean', icon: '🐠' },
    fantasy: { name: 'Fantasy', icon: '🧙' },
    shapes: { name: 'Shapes', icon: '⭐' },
    flowers: { name: 'Flowers', icon: '🌸' }
};

/**
 * Get category info
 */
function getCategoryInfo(categoryId) {
    return categoryInfo[categoryId] || { name: categoryId, icon: '🎨' };
}
"""

    # Write to file
    os.makedirs(os.path.dirname(CATALOG_FILE), exist_ok=True)
    with open(CATALOG_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)

    log_success(f"Generated catalog: {CATALOG_FILE}")
    log_info(f"  Total entries: {len(entries)}")
    log_info(f"  Categories: {', '.join(sorted(by_category.keys()))}")

    return True

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("  SVG Automation Script for ColorTap")
    print("="*60 + "\n")

    # Scan for SVG files
    svg_files = scan_image_folders()

    if not svg_files:
        log_error("No SVG files found. Exiting.")
        return

    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}Starting SVG Processing{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")

    # Process each SVG file
    catalog_entries = []
    skipped = []

    for svg_file in svg_files:
        entry = process_svg_file(svg_file)
        if entry:
            catalog_entries.append(entry)
        else:
            skipped.append(svg_file['path'])

    # Summary
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}Processing Summary{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")

    log_info(f"Total SVG files found: {len(svg_files)}")
    log_success(f"Successfully processed: {len(catalog_entries)}")

    if skipped:
        log_warning(f"Skipped files: {len(skipped)}")
        for skip in skipped:
            print(f"  - {skip}")

    # Write catalog file
    if catalog_entries:
        print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
        print(f"{Colors.BLUE}Generating Catalog{Colors.RESET}")
        print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")

        success = write_catalog_file(catalog_entries)

        if success:
            print(f"\n{Colors.GREEN}{'='*60}{Colors.RESET}")
            print(f"{Colors.GREEN}✓ Automation completed successfully!{Colors.RESET}")
            print(f"{Colors.GREEN}{'='*60}{Colors.RESET}\n")
        else:
            log_error("Failed to write catalog file")
    else:
        log_error("No valid entries to write to catalog")

if __name__ == "__main__":
    main()
