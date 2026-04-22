# Mobile UI Implementation Guide
## MagicPencil Coloring Page – Mobile Layout

---

## Architecture Decision

### Approach: Hybrid B+C

| Transition | Method | Reason |
|---|---|---|
| Desktop → Mobile | JS redirect to `coloring-mobile.html` | Full layout freedom, clean separation |
| Portrait ↔ Landscape (within mobile) | CSS `@media (orientation: ...)` on same file | **No page reload = coloring progress preserved** |

### Files Involved
```
coloring.html              ← existing desktop page (unchanged)
coloring-mobile.html       ← new mobile page (portrait + landscape via CSS)
js/mobile-redirect.js      ← added to coloring.html, detects mobile & redirects once
js/coloring-mobile.js      ← mobile-specific UI logic (color wheel, drawers)
css/coloring-mobile.css    ← all mobile styles (both orientations)

Shared unchanged:
js/coloring.js             ← coloring engine (fill, undo/redo, state)
js/colors.js               ← gradient & pattern logic
js/download.js             ← PNG & PDF download
```

**No page reload on rotation** — orientation handled entirely by CSS media queries + JS canvas redraw. Coloring progress is always preserved across portrait ↔ landscape switches.

---

## Detection & Redirect Logic (`js/mobile-redirect.js`)

Added to the `<head>` of `coloring.html` (runs before body renders — no flash):

```js
(function() {
  const isMobile = window.matchMedia('(max-width: 767px)').matches
                || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile && !window.location.pathname.includes('coloring-mobile')) {
    window.location.replace('coloring-mobile.html' + window.location.search);
  }
})();
```

Reverse redirect in `coloring-mobile.html` (sends desktop users back):
```js
(function() {
  const isDesktop = window.matchMedia('(min-width: 768px)').matches
                 && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isDesktop) window.location.replace('coloring.html' + window.location.search);
})();
```

---

## Layout Overview

### Shared Elements (both orientations)

#### Top Bar (48px fixed)
Left to right:
- **☰ Hamburger button** — opens Home / Random / Next menu (see below)
- **Image title** — absolutely centered in the bar (Gaegu font, 18px)
- **↶ Undo** + **↷ Redo** — both always visible, circular 36×36px buttons
- **⬇ Download button** — circular icon, reveals a 2-option dropdown on tap (see below)

#### Cork Board Canvas
- Same warm tan cork board texture (layered radial gradients + linear base) as desktop
- White paper (`svg-ratio-wrapper`) centered, drop shadow, four tape corners
- `fitWrapper()` ResizeObserver runs on load + orientation change to keep image full-size

#### 🪄 Magic Button (vertical tab)
- Positioned on the **right edge** of the screen, vertically centered
- Gold/yellow pill tab, rotated 90°, text "Magic"
- Tapping it slides the **Magic Panel** in from the **left side** of the screen
- Tapping again (or tapping outside) closes it

---

## Top Bar Controls — Detailed Behaviour

### ☰ Hamburger Menu
Tapping the three-line icon reveals a small dropdown/sheet with three options:
```
  🏠 Home
  🎲 Random
  ➡ Next
```
- **Home** — navigates to `index.html`
- **Random** — picks a random image from the catalog (same logic as desktop random button)
- **Next** — loads the next image in the current category; shows confirmation if image has been colored ("Start a new image? Progress will be lost.")
- Tapping outside the menu closes it

### ⬇ Download Button
Tapping reveals a 2-option dropdown (same as desktop):
```
  🎨 Colored Art      ← calls downloadImage()
  📄 Clean Outline    ← calls downloadOriginalPDF()
```
Tapping outside the dropdown closes it.

### ↶ Undo / ↷ Redo
- Both buttons always visible in the top bar
- Wired to the same `undoStack` / `redoStack` from `coloring.js`
- Greyed out when stack is empty
- Same Ctrl+Z / Ctrl+Y keyboard shortcuts still work (irrelevant on mobile but harmless)

---

## 🪄 Magic Panel (slides from left)

Triggered by tapping the "Magic" tab on the right edge. Slides in as a vertical panel from the **left side** of the screen.

### Panel Structure
```
┌──────────────────┐
│   ✨ Magic Tools  │
│   ─────────────  │
│   🌈 Gradients   │  ← section header
│   [ grad 1 ]     │
│   [ grad 2 ]     │
│   [ grad 3 ]     │
│   [ grad 4 ]     │
│   [ grad 5 ]     │
│   [ grad 6 ]     │
│   [ grad 7 ]     │
│   [ grad 8 ]     │
│   ─────────────  │
│   🎨 Patterns    │  ← section header
│   [ stripe ]     │
│   [ dots   ]     │
│   [ checker]     │
│   [ hearts ]     │
│   [ stars  ]     │
│   [ waves  ]     │
│   ─────────────  │
│  🪄 Magic Fill!  │  ← calls colorItRandomly()
└──────────────────┘
```

### Behaviour
- Panel width: `220px`, full viewport height
- Content is **scrollable** (overflow-y: auto) — all 8 gradients + 6 patterns + Magic Fill button
- Slides in/out with `transform: translateX(-100%)` → `translateX(0)` transition (`0.3s ease`)
- A semi-transparent dark overlay covers the canvas while open; tapping it closes the panel
- Selecting a gradient or pattern closes the panel automatically and applies to next fill
- Gradient buttons: same rectangular swatches as desktop
- Pattern buttons: same icon buttons as desktop (label below icon)
- Magic Fill button: `🪄 ✨ Magic Fill!` — full width, rainbow gradient background

---

## Color Wheel — Critical Feature

The color wheel replaces the flat color grid from desktop. It is the primary color selection UI.

### Visual Design
- A **radial fan / arc** of 18 color segments arranged in a semicircle (portrait) or quarter-circle (landscape)
- Each segment is a pie-slice wedge: `innerRadius = 38px`, `outerRadius = 90px`
- The selected color's segment extends to `outerRadius = 110px` (pops out)
- Thin black stroke (`1.5px`) between segments
- Drawn on an HTML `<canvas>` element using the Canvas 2D API

### Color Order (arranged by hue around the arc)
```
Red → Tomato → Orange → Gold → Yellow → Lime Green →
Green → Teal → Turquoise → Sky Blue → Blue → Indigo →
Purple → Hot Pink → Pink → Brown → Gray → White
```
Black is placed at the trailing end (or as a center hub if desired).

### Rotation Interaction — Smooth + Magnetic Snap

This is the defining interaction of the mobile UI. The wheel **rotates** as the user drags, then **snaps** to the nearest color with a magnetic feel.

#### Gesture Handling
- `touchstart` — record start angle relative to wheel center
- `touchmove` — compute delta angle, rotate the canvas drawing in real time
- `touchend` — calculate which color segment is nearest to the "pointer position" (fixed at the 12 o'clock or 3 o'clock position depending on orientation), snap to it

#### Snap Animation
On `touchend`:
1. Calculate target snap angle (nearest segment center)
2. Animate `currentAngle` → `snapAngle` using `requestAnimationFrame`
3. Easing function: `easeOutBack` (slight overshoot then settle back) — this creates the "magnet" feeling
4. Once settled, update `coloringState.currentColor` and redraw the selected segment as "popped out"

```js
// easeOutBack — gives the magnetic snap/overshoot feel
function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
```

#### Momentum / Inertia (optional polish)
- Track velocity of last few `touchmove` events
- On `touchend`, apply a deceleration animation before snapping
- Gives a "spin and settle" feel, like a real wheel

### Color Wheel Canvas — Orientation Differences

**Portrait (semicircle, opening upward):**
- Canvas anchored to bottom of screen, full width
- Arc spans 180° (from 0° to 180°, i.e. left to right across the bottom)
- Center point at bottom-center of canvas
- "Pointer" / selection indicator: a small triangle or notch at the top-center of the arc
- Selected color shown larger (popped out toward top)

**Landscape (quarter-circle, opening right):**
- Canvas anchored to left side of screen
- Arc spans 90° (from 270° to 0°, fanning from bottom to right)
- Center point at bottom-left of canvas
- "Pointer" / selection indicator: a small notch at the rightmost tip of the arc
- Selected color popped out toward the right

When orientation changes (`matchMedia change` event fires):
- Redraw the wheel at the new geometry
- Current selected color is preserved
- Animate the redraw with a short fade

### Selected Color Indicator
Below the wheel (portrait) or to the right of center (landscape):
- A circle filled with the current color, `32px` diameter, black border
- Color name label in Gaegu font (e.g. "Tomato Red")
- Updates instantly when snap animation completes

---

## Portrait Layout

```
┌─────────────────────────────────┐
│  ☰    🦋 Butterfly    ↶ ↷  ⬇  │  48px top bar
├─────────────────────────────────┤
│                       ┌──────┐  │
│    Cork Board         │Magic │  │
│  ┌─────────────────┐  │ tab  │  │
│  │  SVG Image      │  │      │  │
│  │  (paper+tapes)  │  │      │  │
│  └─────────────────┘  └──────┘  │
│                                 │
├─────────────────────────────────┤
│     ╱ ╱ ╱ ● ╲ ╲ ╲             │
│       (color fan arc)           │  ~180px bottom panel
│     ⬤  Tomato Red              │
└─────────────────────────────────┘
```

- Canvas area: `height: calc(100dvh - 48px - 180px)`
- Color fan panel: `position: fixed; bottom: 0; height: 180px`
- Magic tab: `position: fixed; right: 0; top: 50%; transform: translateY(-50%)`

---

## Landscape Layout

```
┌────┬────────────────────────┬────┐
│    │ ☰  🦋 Butterfly  ↶↷ ⬇ │    │  48px top bar
│    ├────────────────────────┤Mgc │
│ 🎨 │                        │tab │
│    │      Cork Board        │    │
│fan │   ┌──────────────┐     │    │
│arc │   │  SVG Image   │     │    │
│    │   └──────────────┘     │    │
│    │                        │    │
└────┴────────────────────────┴────┘
  ~160px                        ~40px
```

- Canvas area: `margin-left: 160px; height: calc(100dvh - 48px)`
- Color fan panel: `position: fixed; left: 0; top: 48px; bottom: 0; width: 160px`
- Magic tab: `position: fixed; right: 0; top: 50%; transform: translateY(-50%) rotate(90deg)`

---

## CSS Orientation Switch

```css
/* Portrait */
@media (orientation: portrait) {
  .color-fan-wrap   { position: fixed; bottom: 0; left: 0; right: 0; height: 180px; }
  .mobile-canvas    { height: calc(100dvh - 48px - 180px); margin-left: 0; }
  .top-bar          { /* no change */ }
}

/* Landscape */
@media (orientation: landscape) {
  .color-fan-wrap   { position: fixed; left: 0; top: 48px; bottom: 0; width: 160px; }
  .mobile-canvas    { margin-left: 160px; height: calc(100dvh - 48px); }
}
```

JS listens for orientation change and redraws the fan:
```js
window.matchMedia('(orientation: portrait)').addEventListener('change', () => {
  drawColorFan(); // redraws geometry for new orientation, preserves selected color
});
```

---

## Touch Target Sizes

All interactive elements meet the 44×44px minimum:

| Element | Size |
|---|---|
| Hamburger button | 44×44px |
| Undo / Redo buttons | 36×36px with 8px padding area |
| Download button | 44×44px |
| Magic tab | 44px wide × 80px tall |
| Color fan segments | arc area ≥ 44px per segment |
| Magic panel items | 48px min-height each |

---

## Implementation Checklist

### Phase 1 – Redirect & Shell
- [ ] Create `js/mobile-redirect.js`, add to `<head>` of `coloring.html`
- [ ] Create `coloring-mobile.html` skeleton with all shared JS imports
- [ ] Create `css/coloring-mobile.css` with CSS custom properties matching desktop
- [ ] Reverse redirect (desktop users back to `coloring.html`)

### Phase 2 – Top Bar & Controls
- [ ] Top bar with hamburger, centered title, undo, redo, download
- [ ] Hamburger dropdown: Home / Random / Next (with confirmation on Next if colored)
- [ ] Download dropdown: 🎨 Colored Art / 📄 Clean Outline
- [ ] Undo/Redo wired to `undoStack`/`redoStack` from `coloring.js`

### Phase 3 – Cork Board Canvas
- [ ] Cork board area with padding, texture, inner shadow
- [ ] `svg-ratio-wrapper` centered, white background, shadow, rounded corners
- [ ] Tape corners (4) inside wrapper
- [ ] `fitWrapper()` + `ResizeObserver` running (same as desktop)
- [ ] `loadSVGImage()` called with image ID from URL param

### Phase 4 – Magic Panel
- [ ] Magic tab (right edge, vertical, rotated)
- [ ] Slide-in panel from left: scrollable list of 8 gradients + 6 patterns + Magic Fill
- [ ] Overlay behind panel; tap-outside closes
- [ ] Selecting gradient/pattern closes panel and applies to next fill

### Phase 5 – Color Wheel
- [ ] `<canvas>` element for color fan
- [ ] Draw 18 arc segments with correct colors and angles
- [ ] Portrait: semicircle (180°) at bottom
- [ ] Landscape: quarter-circle (90°) on left
- [ ] Touch drag to rotate (touchstart / touchmove / touchend)
- [ ] Snap animation with `easeOutBack` easing
- [ ] Optional: momentum/inertia on release
- [ ] Selected color indicator (dot + name label)
- [ ] Orientation change redraws wheel, preserves selected color
- [ ] Color selection updates `coloringState.currentColor` and pencil indicator

### Phase 6 – Polish & Testing
- [ ] Test iOS Safari (portrait + landscape)
- [ ] Test Chrome Mobile (portrait + landscape)
- [ ] Test Samsung Internet
- [ ] Verify `fitWrapper()` correct on all screen sizes
- [ ] Verify no white gaps on cork board
- [ ] Verify download works on mobile (blob download)
- [ ] Verify Magic Fill works
- [ ] Verify undo/redo stack survives orientation change
