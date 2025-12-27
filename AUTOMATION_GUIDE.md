# MagicPencil Automation Guide

This guide explains how to use the automated workflow for processing SVG images and updating the sitemap.

## Quick Start

**Single Command:** Double-click `run-svg-automation.bat` or run:
```bash
./run-svg-automation.bat
```

This will automatically:
1. Process all SVG files in `/images/` folder
2. Generate/update `js/data/image-catalog.js`
3. Generate/update `sitemap.xml`

---

## What Gets Automated

### Step 1: SVG Processing (`svg-automation.py`)
- Scans all SVG files in `/images/` directory
- Validates dual-layer SVG structure
- Fixes colorable paths (ensures proper fill attributes)
- Counts colorable regions
- Generates image catalog entries

**Output:** `js/data/image-catalog.js`

### Step 2: Sitemap Generation (`generate-sitemap.py`)
- Scans processed images
- Generates XML sitemap with:
  - Homepage
  - Legal pages (privacy-policy, contact, about)
  - All 12 category pages
  - All coloring pages with image metadata
- Updates `lastmod` date automatically

**Output:** `sitemap.xml`

---

## Workflow for Adding New Images

1. **Export SVG from Adobe Illustrator** (follow DESIGN_GUIDE.md)
2. **Save to appropriate category folder:**
   - `/images/alphabets/`
   - `/images/animals/`
   - `/images/princess/`
   - etc.

3. **Run automation:**
   ```bash
   ./run-svg-automation.bat
   ```

4. **Review changes:**
   - Check `js/data/image-catalog.js` - new images should be added
   - Check `sitemap.xml` - new URLs should be present

5. **Test locally:**
   - Open website and verify new images load
   - Test coloring functionality

6. **Commit and deploy:**
   ```bash
   git add .
   git commit -m "Add new images and update sitemap"
   git push
   ```

7. **Update Google Search Console:**
   - Google will auto-fetch sitemap within 24-48 hours
   - Or manually request indexing

---

## Manual Script Execution

If you prefer to run scripts separately:

### Process SVGs only:
```bash
python svg-automation.py
```

### Generate sitemap only:
```bash
python generate-sitemap.py
```

---

## Troubleshooting

### Python not found
- Install Python 3.6+ from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

### SVG validation fails
- Check SVG structure (must be dual-layer: outline + colorable)
- Review DESIGN_GUIDE.md for export settings
- Use Adobe Illustrator export settings:
  - Styling: Presentation Attributes
  - Object IDs: Layer Names
  - Responsive: Checked

### Sitemap missing images
- Ensure SVG files are in correct category folders
- Run `svg-automation.py` first to update catalog
- Then run `generate-sitemap.py`

### Changes not appearing on live site
- Commit and push changes to repository
- Netlify auto-deploys from main branch
- Check Netlify deploy logs for errors

---

## Files Modified by Automation

**Created/Updated:**
- `js/data/image-catalog.js` - Image metadata
- `sitemap.xml` - SEO sitemap

**Backup Created:**
- `js/data/image-catalog.js.backup` - Previous version backup

**Not Modified:**
- SVG source files (read-only)
- HTML files
- Other JavaScript files

---

## Best Practices

1. **Always run automation after adding images** - Ensures catalog and sitemap are in sync
2. **Review changes before committing** - Check that new images appear correctly
3. **Test locally first** - Open website and verify functionality
4. **Commit with descriptive messages** - Example: "Add 5 new animal images"
5. **Update sitemap in Google Search Console** - After deploying changes

---

## Automation Schedule

**When to run:**
- After adding new SVG images
- After removing images
- After renaming image files
- Before deploying to production

**No need to run when:**
- Only changing HTML/CSS
- Only updating JavaScript (non-catalog)
- Only modifying documentation

---

## Future Enhancements

Potential improvements (not yet implemented):
- Auto-commit option (currently manual)
- Git integration in batch file
- Automatic deployment trigger
- Image validation before processing
- Difficulty level auto-detection
- SEO metadata generation

---

**Created:** 2025-12-27
**Last Updated:** 2025-12-27
