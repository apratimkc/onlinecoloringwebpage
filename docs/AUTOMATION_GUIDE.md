# MagicPencil Automation Guide

This guide explains how to use the automated workflow for processing SVG images, generating static HTML pages, and updating the sitemap.

## Quick Start

**Single Command:** Double-click `run-svg-automation.bat` or run it from any directory — it automatically switches to the project root:
```bash
scripts/tools/run-svg-automation.bat
```

This will run 4 steps and prompt you before the optional Ollama step:
1. Process all SVG files in `/images/` → updates `js/data/image-catalog.js`
2. Generate `sitemap.xml` (clean URLs only — no legacy query params)
3. *(Optional)* Generate fun facts for new images via Ollama → `scripts/tools/fun-facts.json` + `js/data/fun-facts.js`
4. Generate all static HTML pages (`color/*/*.html` and `categories/*.html`)

---

## What Gets Automated

### Step 1: SVG Processing (`svg-automation.py`)
- Scans all SVG files in `/images/` directory
- Validates dual-layer SVG structure
- Fixes colorable paths (ensures proper fill attributes)
- Counts colorable regions
- Generates image catalog entries

**Output:** `js/data/image-catalog.js`

---

### Step 2: Sitemap Generation (`generate-sitemap.py`)
- Reads the image catalog
- Generates XML sitemap with clean URLs only:
  - Homepage
  - Legal pages (privacy-policy, contact, about)
  - All category pages (`/categories/<cat>.html`)
  - All coloring pages (`/color/<category>/<slug>.html`)
- Updates `lastmod` date automatically
- URL-encodes special characters in filenames (e.g. `&` → `%26`)
- Uses `__file__`-relative paths — safe to run from any directory

**Output:** `sitemap.xml`

---

### Step 3: Fun Fact Generation (`generate-fun-facts.py`) — Optional

Requires **Ollama** running locally (`http://localhost:11434`).
Recommended model: `gemma4:e2b` (or any model you have installed — run `ollama list` to see).

For each image in the catalog that doesn't yet have a cached fun fact, this script:
- Builds a prompt using the image name and category
- Calls the Ollama `/api/generate` API
- Saves the response to `fun-facts.json` (persistent — safe to interrupt and resume)
- After all images are processed, writes `js/data/fun-facts.js` (JS bundle for mobile)

**Outputs:**
- `scripts/tools/fun-facts.json` — cache, keyed by image ID (e.g. `"animals-elephant"`)
- `js/data/fun-facts.js` — mobile bundle loaded by `coloring-mobile.html`

**Manual usage:**
```bash
# Generate only missing facts (skips already-cached images)
python scripts/tools/generate-fun-facts.py

# Preview prompts without calling Ollama
python scripts/tools/generate-fun-facts.py --dry-run

# Use a different Ollama model
python scripts/tools/generate-fun-facts.py --model qwen3:4b

# Regenerate all facts (overwrites cache)
python scripts/tools/generate-fun-facts.py --regenerate
```

**Fun fact format:** 4–5 paragraphs, 300+ words, written for ages 5–10. The final paragraph always mentions the real color of the subject and invites the child to use any color they like.

---

### Step 4: Static Page Generation (`generate-pages.py`)

This is the core SEO step. Each SVG image gets its own unique, Google-indexable HTML page.

**What it generates:**
- **85 coloring pages** at `color/<category>/<slug>.html`
  - Unique `<title>`, meta description, `<h1>`, and content blurb per page
  - Static canonical URL baked in (`https://magicpencil.fun/color/…`)
  - Schema.org JSON-LD: `BreadcrumbList` + `ImageObject`
  - `data-image-id` on `<body>` so `coloring.js` loads the correct SVG
  - SEO content wrapped in `.seo-coloring-meta` (visually hidden, indexed by Google)
- **12 category pages** at `categories/<category>.html`
  - Generated for all categories, even ones with no images yet (shows "coming soon")
  - Rich category description baked in from `category-metadata.js`
  - `data-category-id` on `<body>` so `app.js` loads the correct image grid

**Inputs used:**
| File | Purpose |
|------|---------|
| `js/data/image-catalog.js` | Image IDs, filenames, categories |
| `js/data/category-metadata.js` | Category titles, descriptions, rich content |
| `scripts/tools/page-content.json` | Custom SEO content for 23 high-value images |
| `scripts/tools/templates/page-desktop.html` | Template for coloring pages |
| `scripts/tools/templates/page-category.html` | Template for category pages |

**Output directories:**
```
color/
  alphabets/   a-apple.html, b-balloons.html, …
  animals/     elephant.html, lion.html, …
  fantasy/     dragon-firing.html, …
  flowers/     sunflower.html, rose.html, …
  food/        birthday-cake.html, cupcake.html, …
  …

categories/
  animals.html
  unicorns.html
  princess.html
  …
```

**Custom content (`page-content.json`):**
23 high-search-volume images have hand-crafted titles, descriptions, and blurbs. All other pages get auto-generated content. To add custom content for a new image, add an entry keyed by `image-id`:
```json
"animals-elephant": {
  "title": "Elephant Coloring Page for Kids — Free Online | MagicPencil",
  "description": "Color a friendly elephant… (140–160 chars)",
  "h1": "Elephant Coloring Page",
  "blurb": "Educational paragraph, 40–80 words."
}
```

---

## Workflow for Adding New Images

1. **Export SVG from Adobe Illustrator** (follow `DESIGN_GUIDE.md`)

2. **Save to appropriate category folder:**
   - `/images/animals/`
   - `/images/princess/`
   - `/images/vehicles/`
   - etc.

3. **Run automation:**
   ```bash
   scripts/tools/run-svg-automation.bat
   ```
   Runs all 4 steps in sequence. Type `Y` when prompted for the Ollama fun-facts step if Ollama is running.

4. **Review changes:**
   - `js/data/image-catalog.js` — new image entry added
   - `sitemap.xml` — new URL included
   - `color/<category>/<slug>.html` — new coloring page created
   - `scripts/tools/fun-facts.json` — new fun fact added (if Ollama step ran)
   - Open the page locally and test coloring functionality

5. **(Optional) Add custom SEO content:**
   - Edit `scripts/tools/page-content.json`
   - Re-run step 4 only: `python scripts/tools/generate-pages.py`

6. **Commit and deploy:**
   ```bash
   git add .
   git commit -m "Add new images and update sitemap"
   git push
   ```

7. **Update Google Search Console:**
   - Netlify auto-deploys from main branch
   - Google will re-fetch the sitemap within 24–48 hours
   - Or manually request indexing in Search Console

---

## Manual Script Execution

All scripts can be run from the project root (recommended) or from `scripts/tools/` — they auto-detect their location:

```bash
# Step 1 only — process SVGs
python scripts/tools/svg-automation.py

# Step 2 only — regenerate sitemap
python scripts/tools/generate-sitemap.py

# Step 3 only — generate fun facts (new images only)
python scripts/tools/generate-fun-facts.py

# Step 3 — dry run (preview prompts, no Ollama calls)
python scripts/tools/generate-fun-facts.py --dry-run

# Step 4 only — regenerate all HTML pages
python scripts/tools/generate-pages.py
```

Running step 4 alone is safe: it overwrites `color/` and `categories/` but does not touch any other files. It reads `fun-facts.json` if present and injects the facts into the pages.

---

## URL Structure

| Page type | URL pattern | Example |
|-----------|------------|---------|
| Homepage | `/` | `magicpencil.fun/` |
| Category | `/categories/<cat>.html` | `/categories/animals.html` |
| Coloring page | `/color/<cat>/<slug>.html` | `/color/animals/elephant.html` |

Legacy query-param URLs (`coloring.html?image=…`, `category.html?cat=…`) redirect instantly to the clean URLs via client-side scripts in those pages.

---

## How `coloring.js` Knows Which Image to Load

Generated coloring pages pass the image identity via a `data-image-id` attribute on `<body>` instead of a URL query parameter:

```html
<body class="coloring-page" data-image-id="animals-elephant" data-category="animals">
```

`coloring.js` reads this at startup:
```js
const imageId = document.body.dataset.imageId
             || new URLSearchParams(window.location.search).get('image');
```

Similarly, category pages use `data-category-id`:
```html
<body class="category-page" data-category-id="animals">
```

`app.js` reads `document.body.dataset.categoryId` to load the image grid.

---

## Troubleshooting

### Python not found
- Install Python 3.6+ from https://www.python.org/downloads/
- Check "Add Python to PATH" during installation

### SVG validation fails
- Check SVG structure (must be dual-layer: outline + colorable)
- Review `DESIGN_GUIDE.md` for export settings
- Adobe Illustrator settings: Styling = Presentation Attributes, Responsive = Checked

### Page generator fails to parse catalog
- Make sure `svg-automation.py` completed successfully first
- The generator uses regex to parse `image-catalog.js` — don't manually edit the catalog in a format that breaks the ID/category pattern

### Image not loading on a generated page
- Verify the SVG file exists at `/images/<category>/<filename>.svg`
- Check `data-image-id` on `<body>` matches the `id` in `image-catalog.js`
- All asset paths in generated pages are absolute (`/images/…`), so they work from any directory depth

### Changes not appearing on live site
- Commit and push changes to repository
- Netlify auto-deploys from main branch
- Check Netlify deploy logs for errors

### Ollama fun fact generation fails
- Make sure Ollama is running: `ollama serve`
- List available models: `ollama list`
- Pull a model if needed: `ollama pull gemma4:e2b`
- Check the API is reachable: open `http://localhost:11434` in your browser — should say "Ollama is running"
- The script saves progress after every image — if it crashes, re-run and it will skip already-generated images

---

## Files Modified by Automation

| Script | Creates / Updates |
|--------|------------------|
| `svg-automation.py` | `js/data/image-catalog.js`, `js/data/image-catalog.js.backup` |
| `generate-sitemap.py` | `sitemap.xml` |
| `generate-fun-facts.py` | `scripts/tools/fun-facts.json`, `js/data/fun-facts.js` |
| `generate-pages.py` | `color/**/*.html` (85 files), `categories/*.html` (12 files) |

No SVG source files, CSS, or shared JS files are ever modified.

---

## Best Practices

1. **Run the full automation after adding images** — keeps catalog, sitemap, and pages in sync
2. **Review generated pages before deploying** — spot-check one coloring page and one category page
3. **Add custom content for important images** — pages in `page-content.json` rank better
4. **Commit with descriptive messages** — example: `"Add 5 new animal SVGs, regenerate pages"`
5. **Resubmit sitemap after deploying** — speeds up Google indexing of new pages

---

**Created:** 2025-12-27  
**Last Updated:** 2026-04-26 (added fun-fact generation step, fixed path handling, 4-step pipeline)
