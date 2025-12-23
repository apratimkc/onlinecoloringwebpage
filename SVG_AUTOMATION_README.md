# SVG Automation Script

## Overview

This Python script automates the processing of SVG files for the ColorTap coloring platform. It validates dual-layer SVG structure, fixes common issues, and auto-generates the image catalog.

## Features

✅ **Scans** all SVG files in `images/` subdirectories
✅ **Validates** dual-layer SVG structure (outline + colorable layers)
✅ **Fixes** common SVG issues automatically
✅ **Counts** colorable regions
✅ **Generates** `js/data/image-catalog.js` automatically
✅ **Creates backups** before making any changes

## Requirements

- Python 3.6 or higher
- No external dependencies (uses standard library only)

## Usage

### Basic Usage

```bash
python svg-automation.py
```

The script will:
1. Scan all folders in `images/`
2. Process each SVG file found
3. Create backups (.backup extension)
4. Fix SVG attributes
5. Generate/update the image catalog

### What Gets Fixed

The script automatically fixes:

1. **Removes width/height attributes**
   - Keeps only `viewBox` for responsive scaling

2. **Fixes colorable layer paths**
   - Ensures `style="fill:transparent;stroke:none"`
   - Converts old `fill="transparent"` to style format

3. **Validates outline layer**
   - Checks for black fills (`fill="#000000"`)

### What Gets Validated

The script validates:

- ✅ Dual-layer structure (at least 2 `<g>` groups)
- ✅ Outline layer exists (black fills)
- ✅ Colorable layer exists (transparent fills in style)
- ✅ At least 1 colorable region

### Skipped Files

Files are skipped if:
- ❌ Not valid XML/SVG format
- ❌ Missing dual-layer structure
- ❌ No outline layer found
- ❌ No colorable regions found

Skipped files are reported at the end with warnings.

## Output

### Console Output

The script provides color-coded output:
- 🔵 **Blue (ℹ)**: Informational messages
- 🟢 **Green (✓)**: Success messages
- 🟡 **Yellow (⚠)**: Warnings (skipped files)
- 🔴 **Red (✗)**: Errors

### Backup Files

Before modifying any file, backups are created:
- Original: `horse-simple.svg`
- Backup: `horse-simple.svg.backup`

### Generated Catalog

The script completely regenerates `js/data/image-catalog.js` with:
- All valid SVG files found
- Grouped by category
- Auto-generated IDs
- Display names from filenames
- Region counts
- Difficulty set to `medium` (can be changed in script)

## Example Output

```
============================================================
  SVG Automation Script for ColorTap
============================================================

ℹ Found 7 SVG files across categories

============================================================
Starting SVG Processing
============================================================

ℹ Processing: images/animals/dog-simple.svg
✓ Validation passed: Valid dual-layer SVG
ℹ   Found 5 colorable regions
ℹ   Removed width attribute
ℹ   Removed height attribute
ℹ   Fixed 5 colorable paths
ℹ Backup created: images/animals/dog-simple.svg.backup
✓ Updated: images/animals/dog-simple.svg
✓ Catalog entry: animals-dog-simple (5 regions)

...

============================================================
Processing Summary
============================================================

ℹ Total SVG files found: 7
✓ Successfully processed: 7

============================================================
Generating Catalog
============================================================

ℹ Backup created: js/data/image-catalog.js.backup
✓ Generated catalog: js/data/image-catalog.js
ℹ   Total entries: 7
ℹ   Categories: animals, princess, shapes

============================================================
✓ Automation completed successfully!
============================================================
```

## Catalog Entry Format

Each entry in the generated catalog looks like:

```javascript
{
    id: 'animals-peacock',
    category: 'animals',
    name: 'Peacock',
    filename: 'vecteezy_peacock.svg',
    difficulty: 'medium',
    regions: 71
}
```

## Configuration

You can modify these settings at the top of the script:

```python
# Difficulty thresholds (currently not used - all set to 'medium')
DIFFICULTY_SIMPLE = (1, 15)
DIFFICULTY_MEDIUM = (16, 40)
DIFFICULTY_COMPLEX = (41, 999)
```

To enable auto-detection of difficulty, uncomment lines 217-223 in the script:

```python
# Auto-detect based on region count
if regions_count <= DIFFICULTY_SIMPLE[1]:
    difficulty = 'simple'
elif regions_count <= DIFFICULTY_MEDIUM[1]:
    difficulty = 'medium'
else:
    difficulty = 'complex'
```

## Troubleshooting

### Script doesn't find SVG files
- Ensure you're running from the project root directory
- Check that `images/` folder exists with subdirectories

### "Skipping: Missing dual-layer structure"
- SVG doesn't have at least 2 `<g>` groups
- Check DESIGN_GUIDE.md for proper layer structure

### "Skipping: No colorable regions found"
- SVG has no paths with transparent fills
- Ensure colorable layer paths have `style="fill:transparent;..."`

### "Failed to parse SVG"
- SVG file is corrupted or not valid XML
- Open in text editor to check for syntax errors

## Safety Features

1. **Backups**: All modified files get `.backup` copies
2. **Validation**: Files are validated before modification
3. **Skip on error**: Invalid files are skipped, not corrupted
4. **Detailed logging**: All actions are logged to console

## After Running

1. Check the console output for any warnings
2. Review `js/data/image-catalog.js` to verify entries
3. Test in browser to ensure images load correctly
4. If needed, restore from `.backup` files

## Manual Cleanup

After successful run, you can:
- Delete `.backup` files if everything looks good
- Manually edit catalog entries for custom names
- Adjust difficulty levels as needed

## Support

For issues with the script or SVG processing, check:
1. DESIGN_GUIDE.md for proper SVG structure
2. Console warnings for specific file issues
3. Backup files to restore if needed
