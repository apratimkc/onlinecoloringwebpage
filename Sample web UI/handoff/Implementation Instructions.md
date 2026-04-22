# MagicPencil — Crayon Box Design Implementation Guide

> **For:** Claude Code / engineering implementation
> **Design direction:** "Crayon Box" — handmade, chunky, paper-textured, kid-friendly
> **Deliverables:** 2 HTML pages (`home.html`, `coloring.html`) + shared CSS + minimal JS

This document is everything you need to turn the two mock HTML files (`home.html` and `coloring.html`) into a production website for **magicpencil.fun**.

---

## 1. Design system (lock these first)

### 1.1 Colors (CSS variables — put in `:root`)

```css
:root {
  /* Surfaces */
  --paper:      #fdf6e6;   /* main page background (warm cream) */
  --paper-2:    #f7ecd0;   /* recessed surfaces, feature cards, canvas backdrop */
  --white:      #ffffff;   /* cards, panels */

  /* Ink / text */
  --ink:        #2d2416;   /* primary text + all outlines + shadows */
  --ink-soft:   #6a5a3a;   /* secondary text */

  /* Crayon palette (use for accents, category tiles, buttons) */
  --red:        #e8553c;
  --orange:     #f59441;
  --yellow:     #f3c54a;
  --green:      #6fb93f;
  --teal:       #3aa9a3;
  --blue:       #4a8bd8;
  --purple:     #a269d1;
  --pink:       #ef7bb5;
}
```

### 1.2 Typography

- **Load Google Fonts:**
  `https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Gaegu:wght@400;700&display=swap`
- **`Gaegu`** — display / playful headings (hero, section titles, card titles, labels in coloring panel)
- **`Fredoka`** — UI / body text, buttons, nav, form labels
- Body base: `font-family: 'Fredoka', system-ui, sans-serif; color: var(--ink);`

### 1.3 Signature "sticker" style

Every card/button has **black hard outline + offset solid-black drop shadow** (no blur). This is the core visual language — use consistently.

```css
.card, .btn, .cat {
  border: 3px solid var(--ink);
  border-radius: 18px;
  box-shadow: 5px 5px 0 var(--ink);
}
```

- Buttons: `2.5px` border, `3px 3px 0 var(--ink)` shadow
- Cards: `3px` border, `5px 5px 0 var(--ink)` shadow
- On hover: nudge `translate(-1px,-1px)` and grow shadow by `+1px`/`+1px`

### 1.4 Paper dot texture (fixed background)

Attach to `body::before` so it stays put during scroll:

```css
body::before {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: radial-gradient(circle, rgba(45,36,22,0.07) 1px, transparent 1.5px);
  background-size: 26px 26px;
}
```

All content must sit at `z-index: 2` to be above it.

### 1.5 Spacing / radii

- Base radius: `14–22px` (smaller for buttons, larger for panels)
- Container padding: `28–32px` on desktop, `16–20px` on mobile
- Use generous whitespace. Kids need breathing room.

### 1.6 Motion

- Subtle hover lifts on all interactive elements (translate + shadow grow)
- Mild rotations on playful elements (`-2deg` to `+2deg`)
- No bouncy animations on the coloring page itself — keep it focused
- Respect `prefers-reduced-motion: reduce` — disable rotations/hover lifts

---

## 2. Pages overview

### 2.1 `home.html` — Landing page

Sections (top to bottom):
1. **Header** — logo + nav (Home, Random, Start Coloring CTA)
2. **Hero** — big rotating headline ("Grab a crayon, make magic!") + CTA + crayon illustration
3. **Categories grid** — 12 category cards (Animals, Unicorns, Princess, Alphabets, etc.)
4. **Features strip** — 3 dashed-border feature cards (Tap to fill / Rainbow mixes / Save & share)
5. **Footer** — copyright + links

### 2.2 `coloring.html` — The main coloring experience

Three-panel layout:
- **Left (240px):** Color panel — current color display, 14–18 color swatches, "Start Fresh" button
- **Center (flex):** Canvas area with title, difficulty badge, SVG coloring page, tape corners, tip hint
- **Right (240px):** Magic tools — gradients (8), patterns (5), help tip

On mobile, stack vertically: canvas first, then collapsible "Colors" and "Magic" drawers.

---

## 3. Component recipes

### 3.1 Logo

```html
<div class="logo">
  <div class="logo-pencil"><!-- pencil SVG --></div>
  <div class="logo-text">Magic<span>Pencil</span></div>
</div>
```

- `.logo-pencil`: 48×48 white rounded square, rotated `-6deg`, with the sticker outline/shadow treatment. Contains a pencil SVG icon.
- `.logo-text`: Gaegu 32px. "Pencil" colored `var(--red)`.

### 3.2 Buttons (`.nav-btn`, `.btn`)

Three variants:
- **Default:** white background, ink text
- **Primary:** `var(--red)` background, white text
- **Tertiary variants:** blue (`--blue`), green (`--green`) — use for secondary nav in coloring header

All share: `2.5px` border, `3px 3px 0 var(--ink)` shadow, Fredoka 600, 14–15px font, 10px 18px padding, 12–14px radius. Hover = lift + grow.

### 3.3 Category card (`.cat`)

```html
<a class="cat" style="--cat-color:#ffd1b5">
  <div class="cat-bubble">🐶</div>
  <h3>Animals</h3>
  <div class="count">10 pics</div>
</a>
```

- White card, 3px ink border, 5px offset shadow
- `.cat-bubble`: 72×72 circle in `var(--cat-color)`, 3px ink border, inset shadow `inset -6px -6px 0 rgba(0,0,0,0.1)` for the "gumdrop" look
- Hover: `translate(-2px,-2px) rotate(±1deg)`, shadow grows to `7px 7px 0`
- Optional "NEW!" pin in the top-right corner (red circle badge with white text)
- **Use placeholder emoji only while real category illustrations aren't ready** — swap for actual SVG/PNG category illustrations before launch.

### 3.4 Color swatch (`.color`)

- Circle, `aspect-ratio: 1`, 2.5px ink border
- Inset shadow `inset -4px -4px 0 rgba(0,0,0,0.15)` gives the shiny gumdrop look
- **Active state:** `inset -4px -4px 0 rgba(0,0,0,0.15), 0 0 0 3px #fff, 0 0 0 5.5px var(--ink)` + `scale(1.08)` (white ring + black ring)
- Hover: `scale(1.1)`

### 3.5 Canvas

- White panel with 3px ink border, 5px shadow
- `.canvas-area`: inner dashed-border region with `var(--paper-2)` background
- **Tape corners:** four yellow `rgba(243,197,74,0.7)` strips positioned at the corners, rotated ±10deg, to sell the "taped to the wall" feel
- Center: the SVG coloring page
- Floating pill at top: simple progress indicator (dots or `x / y` count)
- Floating hint at bottom: "💡 Tap an empty spot to fill it!"

### 3.6 Feature card (`.f-card`)

- Background: `var(--paper-2)`
- Border: `3px dashed var(--ink)` — the dashed border differentiates these from the main cards
- 20px radius, 22px padding
- Inside: small icon-square (56×56, white, 2.5px border, 3px shadow), heading (Gaegu 26px), paragraph (Fredoka 15px ink-soft)

---

## 4. Coloring page interaction spec

The mock is static. Here's what the real implementation needs to do:

### 4.1 State

```ts
type ColoringState = {
  currentColor: string;           // hex, e.g. "#e8553c"
  currentGradient?: [string,string];  // if a gradient is active
  currentPattern?: 'lines'|'dots'|'hearts'|'stars';
  activeTool: 'color' | 'gradient' | 'pattern';
  fills: Record<string, string>;  // svg region id -> fill (color/gradient-id/pattern-id)
  imageSlug: string;              // which picture is loaded
  history: Array<Snapshot>;       // for undo
}
```

### 4.2 Tap-to-fill

- Every SVG shape that should be fillable must have a stable `id` or `data-fill-id`
- Click handler: `element.setAttribute('fill', currentColor)` — OR if gradient/pattern active, reference an `<defs>` `<linearGradient>` or `<pattern>` by id
- Persist `fills` to `localStorage` keyed by `imageSlug` so refreshes don't lose work

### 4.3 Palette

- Base 18 colors (see `--red` through `--pink` + tints + neutrals/white). Use the set from the mock.
- "Currently picked" card at top of left panel updates live with swatch + color name
- Clicking a swatch: sets `currentColor`, clears gradient/pattern, sets `activeTool='color'`, adds `.active` class

### 4.4 Gradients

- 8 preset gradients (see mock). On select: create an `<svg:linearGradient>` in `<defs>` if not present, set `currentGradient`, switch `activeTool='gradient'`. Tap fills use `fill="url(#grad-id)"`.

### 4.5 Patterns

- 5 patterns: lines, dots, hearts, stars. Each is an `<svg:pattern>` in `<defs>`, rendered with the current color as the pattern element color. On tap, region's `fill="url(#pat-id)"`.

### 4.6 Buttons in header

- **Home** → route to `home.html`
- **Random** → load a random picture
- **Prev / Next** → within the current category's picture list
- **Save** → `SVG → canvas → toBlob` → download `magicpencil-{slug}.png`
- **Start Fresh** (left panel) → confirm dialog → clear `fills` for current image

### 4.7 Progress indicator

- Count `fills` vs total fillable regions → show dots (how many filled) + a short message ("Just started", "Halfway there!", "Almost done", "Masterpiece!")

### 4.8 Undo / Redo

**Placement:** Two round sticker buttons, floating **top-left corner of `.canvas-area`** (mirrors the progress pill top-center). Live on the canvas, not in the top nav — they are canvas actions, not page actions.

**Markup:**

```html
<div class="history">
  <button class="hist-btn" id="undoBtn" aria-label="Undo" title="Undo (Ctrl+Z)">↶</button>
  <button class="hist-btn" id="redoBtn" aria-label="Redo" title="Redo (Ctrl+Y)" disabled>↷</button>
</div>
```

**Styles (already in `coloring.html`):**

```css
.history { position: absolute; top: 12px; left: 12px; z-index: 3; display: flex; gap: 6px; }
.hist-btn {
  width: 42px; height: 42px; border-radius: 50%;
  background: #fff; border: 2.5px solid var(--ink);
  box-shadow: 3px 3px 0 var(--ink);
  font-family: 'Fredoka', sans-serif; font-size: 22px; font-weight: 700;
  color: var(--ink); cursor: pointer;
  display: grid; place-items: center;
  transition: transform .1s, box-shadow .1s, opacity .1s;
}
.hist-btn:hover:not(:disabled)  { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--ink); }
.hist-btn:active:not(:disabled) { transform: translate(1px,1px);   box-shadow: 1px 1px 0 var(--ink); }
.hist-btn:disabled {
  opacity: 0.35; cursor: not-allowed;
  box-shadow: 2px 2px 0 var(--ink); color: var(--ink-soft);
}
```

**States:**

- **Active (enabled):** full color, 3px offset shadow, hover lifts to 4px, click presses to 1px. This is the default when there's history to act on.
- **Deactivated (disabled):** `opacity: 0.35`, shadow flattens to 2px, no hover, `cursor: not-allowed`. Use the native `disabled` attribute so screen readers and keyboard nav also skip it.

**Behavior (state machine):**

| Event                | undoBtn    | redoBtn    | Stack effect                       |
|---------------------|------------|------------|------------------------------------|
| Initial load        | disabled   | disabled   | both empty                         |
| User fills a region | enabled    | disabled   | push to undoStack; clear redoStack |
| User clicks Undo    | depends    | enabled    | pop undoStack → push to redoStack  |
| User clicks Redo    | enabled    | depends    | pop redoStack → push to undoStack  |
| User fills again    | enabled    | **disabled** (cleared) | push to undoStack; **clear redoStack** |
| Start Fresh         | enabled (can undo the clear) | disabled | push {type:'clear', prevFills} |

**Action record:**

```js
// Each entry on the stack
{ regionId: 'left-wing', oldFill: '#e8553c', newFill: '#3aa9a3' }
// Or for Start Fresh:
{ type: 'clear', prevFills: { ... } }
```

**Implementation sketch:**

```js
const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 50;

function updateHistoryButtons() {
  undoBtn.disabled = undoStack.length === 0;
  redoBtn.disabled = redoStack.length === 0;
}

function recordFill(regionId, oldFill, newFill) {
  undoStack.push({ regionId, oldFill, newFill });
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0;               // new action invalidates redo
  updateHistoryButtons();
}

undoBtn.addEventListener('click', () => {
  const action = undoStack.pop(); if (!action) return;
  applyFill(action.regionId, action.oldFill);
  redoStack.push(action);
  updateHistoryButtons();
});

redoBtn.addEventListener('click', () => {
  const action = redoStack.pop(); if (!action) return;
  applyFill(action.regionId, action.newFill);
  undoStack.push(action);
  updateHistoryButtons();
});

document.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey; if (!mod) return;
  if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undoBtn.click(); }
  else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redoBtn.click(); }
});
```

**Rules of thumb:**

- Only record **canvas mutations** (fill, pattern-fill, clear). Do **not** record color-picker changes or UI selections.
- Cap history at ~50 entries.
- Persist `undoStack` + current `fills` to `localStorage` (redo stack can be dropped on reload).
- Clearing redo on a new fill is the standard expected behavior — don't "branch" history.

### 4.9 Keyboard / touch

- Large hit targets (≥44px) — swatches are ~44px, good
- Support touch + mouse. Consider a "fat-finger" fill radius on touch

---

## 5. Home page behavior

### 5.1 Hero CTA

- "Start Coloring →" button → route to `coloring.html?category=random` (or to the last-opened picture if resuming).

### 5.2 Category grid

- Pull category list from data (not hardcoded). For each category: slug, title, emoji/illustration, count, optional `isNew` flag.
- Click a card → `coloring.html?category={slug}&picture=0`

### 5.3 Random button

- Picks a random category + random picture → routes to coloring page

---

## 6. Content data model (suggested)

```json
{
  "categories": [
    {
      "slug": "animals",
      "title": "Animals",
      "emoji": "🐶",
      "color": "#ffd1b5",
      "isNew": true,
      "pictures": [
        { "slug": "butterfly",  "title": "Happy Butterfly", "difficulty": "easy", "svg": "/art/animals/butterfly.svg" },
        { "slug": "cat",        "title": "Cute Cat",        "difficulty": "easy", "svg": "/art/animals/cat.svg" }
      ]
    }
  ]
}
```

- Store `pictures[].svg` as inline-ready SVG files (line art only, all fillable regions have `id`s, stroke is `#2d2416`, `stroke-width="3"`, no fills — canvas background shows through).

---

## 7. Accessibility

- Color swatches need `aria-label="Tomato Red"` (or similar human name)
- `role="button"` on all `<a class="cat">` OR just use `<button>`
- Fillable SVG regions: focusable via keyboard, `aria-label="Left wing"` etc., Enter/Space triggers fill
- Maintain contrast: `var(--ink)` on `var(--paper)` is ~11:1, well above AAA
- `prefers-reduced-motion: reduce` disables rotations and hover lifts

---

## 8. Responsive breakpoints

- **≥1200px:** 6-column category grid, 3-panel coloring layout
- **768–1199px:** 4-column category grid, keep 3-panel coloring (shrink side panels to 200px)
- **<768px:** 2-column category grid, coloring stacks: [canvas] [colors] [tools] with a sticky mini-palette at the bottom

---

## 9. File structure (recommended)

```
magicpencil/
├── index.html              ← rename from home.html
├── color.html              ← rename from coloring.html
├── css/
│   └── styles.css          ← extract all <style> from mocks into shared stylesheet
├── js/
│   ├── app.js              ← shared: nav, analytics
│   ├── home.js             ← category grid rendering, random button
│   └── color.js            ← full coloring app
├── data/
│   └── catalog.json        ← categories + pictures
└── art/
    └── {category}/*.svg    ← line-art SVGs
```

Consolidate all `<style>` from the two mock files into a single `styles.css` — almost all rules are shared. The only page-specific rules are the `.coloring-container` grid (coloring only) and `.hero`/`.cat-grid` (home only).

---

## 10. Must-ship polish checklist

- [ ] Real SVG line-art pictures for all categories (mocks use a butterfly placeholder)
- [ ] Real category illustrations replacing emoji (optional but recommended)
- [ ] Save-as-PNG works and downloads correctly on iOS Safari
- [ ] localStorage: remembers last color + last picture + in-progress fills
- [ ] Undo (Cmd/Ctrl+Z) — undo last fill
- [ ] Sound effects toggle (off by default) — subtle "pop" on fill
- [ ] OG image / favicon using the MagicPencil logo bubble
- [ ] Analytics on: category click, picture open, fill action, save action
- [ ] Print stylesheet for coloring page → prints the line-art only (B&W, no UI)

---

## Reference files in this handoff

- `home.html` — complete landing page mock, copy the markup + styles directly
- `coloring.html` — complete coloring page mock, copy the markup + styles directly
- `Implementation Instructions.md` — this file

All CSS in the mocks is production-ready. The main work is wiring up the JS interactions and supplying real content (SVG pictures, category data).
