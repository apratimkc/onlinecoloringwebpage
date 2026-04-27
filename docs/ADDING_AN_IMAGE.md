# Adding an Image to MagicPencil — Complete Workflow

This guide walks through every step required to add a new coloring image to the website, from generating the artwork to deploying it live. Follow the steps in order.

**Estimated time:** 30–60 minutes per image (most of it is Inkscape work on complex images).

---

## Overview

```
[AI Tool] Generate artwork
      ↓
[Inkscape] Build dual-layer SVG (outline + colorable)
      ↓
[File System] Save SVG to /images/<category>/
      ↓
[Automation] Run pipeline (catalog → sitemap → fun fact → HTML page)
      ↓
[Browser] Test locally
      ↓
[Git] Commit and push → Netlify auto-deploys
```

---

## Phase 1 — Generate the Artwork

### Step 1 — Prompt the AI tool ("Nano Banan")

> ⚠️ **NOTE:** You referred to this as "nano banan" — confirm the exact tool name/URL here so this guide stays accurate.

Use your AI image generation tool to create the initial coloring page artwork. The prompt needs to follow a specific format to get clean, outline-style images suitable for coloring.

**General prompt format that works:**

```
A simple [SUBJECT] coloring page for kids, black and white line art,
clean thick outlines, no shading, no gradients, no background,
white fill inside shapes, cartoon style, child-friendly,
suitable for ages 2–10, printable coloring book style
```

**Example — Elephant:**
```
A simple elephant coloring page for kids, black and white line art,
clean thick outlines, no shading, no gradients, white background,
cartoon style, child-friendly, suitable for ages 2–10
```

**What to look for in the output:**
- Clear black outlines (2–3px equivalent thickness)
- White/empty interior regions — not filled with grey or texture
- Single subject, centered
- No complex background details (or a very simple one)
- Child-friendly, non-scary proportions

**If the output is a raster image (PNG/JPG):**
- That is fine — you will trace it in Inkscape in Phase 2
- Save it somewhere accessible (e.g. a `_source/` folder) but do NOT put raster files in `/images/`

---

## Phase 2 — Build the SVG in Inkscape

MagicPencil requires a specific **dual-layer SVG format**. Inkscape is the tool used to create this. See [`DESIGN_GUIDE.md`](DESIGN_GUIDE.md) for full detail on the layer system.

### Step 2 — Open Inkscape and set up the document

1. Open Inkscape (free download at inkscape.org)
2. Create a new document: **File → Document Properties**
   - Width: `800 px`
   - Height: `800 px`
   - Units: `px`

### Step 3 — Create the two required layers

Open the Layers panel (**Layer → Layers...**). You need exactly two layers in this order (top to bottom):

```
📁 layer1  ← outline layer  (top)
📁 layer2  ← colorable layer (bottom)
```

- Click **+** to add each layer
- Name them exactly `layer1` and `layer2`
- Lock `layer1` while working on `layer2`

### Step 4 — Draw or trace the outlines (layer1)

Work on **layer1**:

- If you have an AI-generated raster image: import it (**File → Import**), then use the **Pen/Bézier tool** or **Trace Bitmap** (**Path → Trace Bitmap**) to create vector outlines
- Draw all black outline shapes on this layer
- **Fill:** `#000000` (pure black), no stroke
- Convert any strokes to fills: **Path → Stroke to Path**

> These outlines are permanent — users can NEVER color them. They define the structure of the image.

### Step 5 — Draw the colorable regions (layer2)

Switch to **layer2** (click it in the Layers panel):

- Draw one shape for each area the user will be able to color
- Each colorable area = one separate path
- **Fill:** any bright color (easier to see while working — will be replaced)
- **Stroke:** none
- Shapes should fill the gaps between the outlines from layer1
- Each shape must be a **separate path** — do not merge them

**Tips:**
- Regions can touch but should not significantly overlap
- Give meaningful IDs in the XML editor: `head`, `body`, `wing-left`, etc.
- Simple images: 5–15 regions. Complex: 30–70 regions.

### Step 6 — Export the SVG

**File → Export → Export As...**

- Format: **SVG**
- SVG Options — use these **exact** settings:

```
Styling:    Presentation Attributes  ← CRITICAL (not Internal CSS)
Font:       SVG
Images:     Embed
Object IDs: Layer Names
Decimal:    2
Responsive: ✓ Checked
```

### Step 7 — Post-export cleanup (mandatory)

Open the exported SVG in a text editor (VS Code, Notepad++, etc.) and make these edits:

**A. Remove `width` and `height` attributes** — keep only `viewBox`:
```xml
<!-- DELETE these two attributes: -->
width="800"
height="800"

<!-- KEEP this: -->
viewBox="0 0 800 800"
```

**B. Make all colorable paths transparent** — find all paths in `layer2` and set:
```xml
<!-- Change FROM any fill color: -->
<path fill="#FF0000" d="..."/>

<!-- Change TO: -->
<path style="fill:transparent;stroke:none" d="..."/>
```
Easiest way: Find & Replace in VS Code — replace `fill="#` with `style="fill:transparent;stroke:none" data-was="` or just do a targeted replace on all layer2 paths.

**C. Confirm outline paths are black:**
```xml
<path fill="#000000" d="..."/>
```

**Final SVG structure should look like:**
```xml
<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <g id="layer2">
    <path style="fill:transparent;stroke:none" d="..."/> <!-- colorable -->
  </g>
  <g id="layer1">
    <path fill="#000000" d="..."/> <!-- outline -->
  </g>
</svg>
```

> The SVG automation script (Step 9) will also automatically fix many of these attributes, but it is good practice to get them right manually first.

---

## Phase 3 — Add the File to the Project

### Step 8 — Save the SVG in the correct folder

Choose the right category folder and save the SVG there:

```
images/
  animals/      → lions, dogs, elephants, birds, insects, etc.
  alphabets/    → A-Apple.svg, B-Balloons.svg format
  fantasy/      → dragons, robots, magic wands, wizards
  flowers/      → roses, sunflowers, cacti, mushrooms
  food/         → cakes, fruit, snacks, drinks
  holidays/     → Christmas, Easter, Halloween items
  nature/       → landscapes, weather, trees, stars
  ocean/        → sea creatures, boats, shells
  shapes/       → geometric shapes, stars, crowns
  vehicles/     → cars, planes, trains, bikes
```

**Naming rules:**
- Use **Title Case** with spaces: `Honey Bee.svg`, `Fire Truck.svg`
- No underscores, no version numbers in the final filename
- The filename becomes the image name (e.g. `Honey Bee.svg` → name: `Honey Bee`, slug: `honey-bee`)

---

## Phase 4 — Run the Automation Pipeline

The pipeline updates the catalog, sitemap, fun facts, and generates the static HTML page for the new image.

### Step 9 — Run the full automation

From the project root, either:

**Option A — One command (recommended):**
```
scripts\tools\run-svg-automation.bat
```
This runs all 4 steps in sequence. When prompted for fun facts (Step 3), type `Y` if Ollama is running.

**Option B — Step by step (if you need more control):**

**9a. Process SVGs and update the image catalog:**
```bash
python scripts/tools/svg-automation.py
```
This scans all SVGs, validates structure, fixes common issues, and updates `js/data/image-catalog.js`.

Check the output — it should report your new image found and cataloged:
```
[OK] animals/Honey Bee.svg — 12 colorable regions (Simple)
```

**9b. Regenerate the sitemap:**
```bash
python scripts/tools/generate-sitemap.py
```
Adds the new image's clean URL to `sitemap.xml`.

**9c. Generate fun fact for the new image (requires Ollama running):**
```bash
python scripts/tools/generate-fun-facts.py
```
Only generates facts for images not yet in the cache — so your new image gets one, existing images are skipped. Saves to `scripts/tools/fun-facts.json`.

If Ollama is not running, skip this step and add a custom fun fact manually to `fun-facts.json` later.

**9d. Generate the static HTML page:**
```bash
python scripts/tools/generate-pages.py
```
Creates `color/<category>/<slug>.html` for your new image, plus refreshes all category pages.

---

## Phase 5 — Optional: Add Custom SEO Content

The auto-generated title, description, and blurb are fine for most images, but for high-traffic images (elephants, lions, cats, etc.) you should add hand-crafted content.

### Step 10 — Edit page-content.json

Open [`scripts/tools/page-content.json`](../scripts/tools/page-content.json) and add an entry:

```json
"animals-honey-bee": {
  "title": "Honey Bee Coloring Page for Kids — Free Online | MagicPencil",
  "description": "Color a buzzing honey bee for free online! Tap to fill with colors, gradients, and fun patterns. Great for kids ages 2–12. Print or download your bee art.",
  "h1": "Honey Bee Coloring Page",
  "blurb": "Honey bees are amazing — a single bee visits up to 1,500 flowers just to make one teaspoon of honey! Color this busy bee yellow and black, or make it any colors you like. Tap to fill instantly, then print or download your artwork."
}
```

**Key format:**
- `"animals-honey-bee"` = image ID (category + `-` + slug)
- `title`: 55–70 characters, ends with `| MagicPencil`
- `description`: 140–160 characters
- `h1`: Short version of the title (no site name)
- `blurb`: 40–80 words, educational and fun

After editing, re-run step 9d only:
```bash
python scripts/tools/generate-pages.py
```

---

## Phase 6 — Test Locally

### Step 11 — Open the page in your browser

Start a local server (e.g. with VS Code Live Server or `npx serve .`) and open:
```
http://localhost:3000/color/<category>/<slug>.html
```

**Checklist:**
- [ ] Image loads correctly (no "SVG load error")
- [ ] All colorable regions are clickable (cursor turns to pointer on hover)
- [ ] Outline paths are NOT clickable (cursor stays arrow)
- [ ] Colors fill correctly when you tap a region
- [ ] Fun fact paragraph appears below the canvas
- [ ] Breadcrumb shows correct category link
- [ ] Page title in browser tab is correct
- [ ] No console errors

**If the image doesn't load:** Check that `data-image-id` in the generated HTML matches the ID in `image-catalog.js`.

---

## Phase 7 — Deploy

### Step 12 — Commit and push

```bash
git add .
git commit -m "Add [Image Name] to [category]"
git push
```

Netlify auto-deploys from the `main` branch — typically live within 1–2 minutes.

### Step 13 — Request Google indexing (optional but recommended)

1. Open [Google Search Console](https://search.google.com/search-console)
2. Paste the new page URL: `https://magicpencil.fun/color/<category>/<slug>.html`
3. Click **Request Indexing**

Google usually processes it within 24–48 hours. The sitemap submission also helps Google discover it automatically.

---

## Quick Reference — File Naming to URL

| SVG filename | Image ID | URL |
|---|---|---|
| `images/animals/Honey Bee.svg` | `animals-honey-bee` | `/color/animals/honey-bee.html` |
| `images/vehicles/Fire Truck.svg` | `vehicles-fire-truck` | `/color/vehicles/fire-truck.html` |
| `images/alphabets/A-Apple.svg` | `alphabets-a-apple` | `/color/alphabets/a-apple.html` |

---

## Quick Reference — What Each Script Does

| Script | What it changes |
|---|---|
| `svg-automation.py` | Updates `js/data/image-catalog.js` |
| `generate-sitemap.py` | Updates `sitemap.xml` |
| `generate-fun-facts.py` | Updates `scripts/tools/fun-facts.json` + `js/data/fun-facts.js` |
| `generate-pages.py` | Creates/updates `color/**/*.html` + `categories/*.html` |

---

## Common Problems

**"SVG validation failed — no colorable layer found"**
→ The automation script couldn't find transparent fills on layer2. Open the SVG in a text editor and check that layer2 paths have `style="fill:transparent;stroke:none"`.

**"Image loads but nothing is clickable"**
→ Layer order is wrong. Colorable layer must come BEFORE (below) the outline layer in the SVG file. Swap the `<g>` blocks.

**"Fun fact is missing on the page"**
→ The image ID wasn't in `fun-facts.json` when `generate-pages.py` ran. Add the entry manually to `fun-facts.json` and re-run `generate-pages.py`.

**"404 on the new page"**
→ Check that `generate-pages.py` ran successfully after the SVG was cataloged. The HTML file should be at `color/<category>/<slug>.html`.

---

*Last updated: 2026-04-27*
