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
js/coloring-mobile.js      ← mobile-specific UI logic (color wheel, magic tab)
css/coloring-mobile.css    ← all mobile styles (both orientations)
```

The coloring engine (`js/coloring.js`, `js/colors.js`, `js/download.js`) is shared between both pages unchanged.

---

## Detection & Redirect Logic (`js/mobile-redirect.js`)

Added to the `<head>` of `coloring.html` (before body renders to avoid flash):

```js
// Redirect mobile devices to the mobile coloring page
(function() {
  const isMobile = window.matchMedia('(max-width: 767px)').matches
                || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile && !window.location.pathname.includes('coloring-mobile')) {
    // Preserve the image query param (e.g. ?id=dog-1)
    window.location.replace('coloring-mobile.html' + window.location.search);
  }
})();
```

Reverse redirect in `coloring-mobile.html` (redirect desktop users back):
```js
(function() {
  const isDesktop = window.matchMedia('(min-width: 768px)').matches
                 && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isDesktop) window.location.replace('coloring.html' + window.location.search);
})();
```

---

## Layout Specification

### Shared Elements (both orientations)

#### Top Bar
- Fixed height: `48px`
- Background: white, bottom border `2px solid var(--ink)`
- Children (left to right):
  - **☰ Menu button** — opens a slide-in drawer with: Next Image, Home, About links
  - **Image title** — centered absolutely in the bar (e.g. "🦋 Butterfly"), Gaegu font, 18px
  - **Undo button** `↶` — circular, 36×36px (landscape only; hidden in portrait)
  - **Redo button** `↷` — circular, 36×36px (landscape only; hidden in portrait)
  - **Download button** `⬇` — circular icon button, always visible

#### Cork Board Canvas Area
- Same cork board texture as desktop (warm tan radial + linear gradients)
- White paper (`svg-ratio-wrapper`) centered, shadow, tape corners
- JS `fitWrapper()` runs on load and on `ResizeObserver` tick

#### "Magic" Vertical Tab
- Positioned on the **right edge** of the screen, vertically centered
- A yellow/gold pill-shaped tab rotated 90°, text reads "Magic"
- Tapping it opens/closes the Magic Tools drawer (slides in from right)
- Always visible in both orientations

#### Magic Tools Drawer
- Slides in from the right edge (CSS `transform: translateX(100%)` → `0`)
- Contains: gradient buttons grid + pattern buttons grid + Magic Fill button
- Overlay dims the canvas behind it
- Tap outside or tap the tab again to close

---

### Portrait Layout (width ≤ 767px, orientation: portrait)

```
┌─────────────────────────────────┐
│  ☰    🦋 Butterfly         ⬇   │  ← top bar (48px, fixed)
├─────────────────────────────────┤
│                                 │
│    ┌─────────────────┐  [Magic] │
│    │   Cork Board    │  tab     │
│    │  ┌───────────┐  │          │
│    │  │  Image    │  │          │
│    │  │ (paper+   │  │          │
│    │  │  tapes)   │  │          │
│    │  └───────────┘  │          │
│    └─────────────────┘          │
│                                 │
├─────────────────────────────────┤
│        Color Fan (bottom)       │  ← fixed bottom panel
│   ╱ ╱ ╱ ╱ ● ╲ ╲ ╲ ╲           │
│         Tomato Red              │
│           Spin to               │
└─────────────────────────────────┘
```

**Canvas area:** `height: calc(100vh - 48px - COLOR_PANEL_HEIGHT)`  
**Color panel:** fixed at bottom, `height: 180px`

**Color panel layout:**
- Semi-circular radial fan of color swatches, fanning upward from the bottom center
- 18 colors arranged in an arc (3 rows of 6, each row at increasing radius)
- Selected color shown as a larger dot in the center-bottom of the fan
- Color name label below the selected dot
- "Spin to" label/hint (decorative, matches mockup)

---

### Landscape Layout (width ≤ 767px, orientation: landscape)

```
┌──┬──────────────────────┬─────┬──┐
│  │ ☰  🦋 Butterfly  ↶↷ ⬇ │     │
├──┼──────────────────────┤     ├──┤
│  │                      │[Mgc]│  │
│  │    Cork Board        │tab  │  │
│🎨│  ┌────────────┐      │     │  │
│  │  │   Image    │      │     │  │
│fan│  │  (paper)  │      │     │  │
│  │  └────────────┘      │     │  │
│  │                      │     │  │
└──┴──────────────────────┴─────┴──┘
  ↑ left color fan (quarter circle)
```

**Color fan:** Fixed on left side, `width: 160px`, quarter-circle fanning to the right  
**Canvas area:** fills remaining width between fan and right edge  
**Top bar:** same 48px, but undo/redo buttons are now visible

**Color fan layout (landscape):**
- Quarter-circle arc from bottom-left corner, colors fanning right and up
- Same 18 colors at increasing radii
- Selected color highlighted with a larger dot + ring
- Color name shown in a small tooltip/label near selected swatch

---

## Radial Color Fan — Technical Implementation

The color fan is the key visual difference from desktop. It replaces the flat color grid.

### HTML Structure
```html
<div class="color-fan-wrap">
  <canvas id="color-fan-canvas"></canvas>     <!-- drawn via JS -->
  <div class="selected-color-info">
    <div class="selected-dot" id="fan-selected-dot"></div>
    <span class="selected-label" id="fan-color-label">Tomato Red</span>
  </div>
</div>
```

### Fan Drawing (Canvas 2D API)
- Draw 18 arc segments using `ctx.arc()` paths
- Portrait: semicircle (180° arc, opening upward), bottom-center of screen
- Landscape: quarter-circle (90° arc, opening right), bottom-left of screen
- Each segment: `startAngle` to `endAngle` with `innerRadius=40px`, `outerRadius=90px`
- Fill each segment with the color from the 18-color palette
- Black stroke `1.5px` between segments
- Active segment: slightly larger radius (110px) + bright outline ring
- Tap detection: use `ctx.isPointInPath()` or polar-coordinate math

### Color Order Around the Arc
Arrange by hue for visual harmony (warm → cool):
```
Red → Tomato → Orange → Gold → Yellow → Lime →
Green → Teal → Turquoise → Sky → Blue → Indigo →
Purple → Pink → Hot Pink → Brown → Gray → White → Black
```
(Black at center, White near Black — neutrals cluster at one end)

---

## State Sharing Between Desktop & Mobile Pages

Since they're separate HTML files, coloring state can't be shared via JS variables. However, if a user switches orientation mid-session (which doesn't reload — it's CSS-only), state is preserved in memory. No special handling needed.

If future enhancement requires cross-page state (e.g. user returns to desktop page), use `sessionStorage`:
```js
// Save on every fill (coloring.js already has filledRegions)
sessionStorage.setItem('filledRegions', JSON.stringify(coloringState.filledRegions));
// Restore on load
const saved = sessionStorage.getItem('filledRegions');
if (saved) coloringState.filledRegions = JSON.parse(saved);
```
This is optional and not part of the MVP.

---

## Implementation Checklist

### Phase 1 – Redirect & Shell
- [ ] Create `js/mobile-redirect.js` and add to `coloring.html`
- [ ] Create `coloring-mobile.html` with shared header/footer scripts
- [ ] Create `css/coloring-mobile.css` with CSS variables matching desktop

### Phase 2 – Layout
- [ ] Build top bar (portrait: title + download; landscape: + undo/redo)
- [ ] Build cork board canvas area (reuse `svg-container` / `svg-ratio-wrapper` structure)
- [ ] Build "Magic" vertical tab + slide-in drawer
- [ ] Wire `fitWrapper()` ResizeObserver (same JS as desktop)

### Phase 3 – Color Fan
- [ ] Draw fan on `<canvas>` element using 2D API
- [ ] Portrait mode: semicircle opening upward, bottom-center
- [ ] Landscape mode: quarter-circle, bottom-left
- [ ] Tap-to-select with polar math, update coloring engine's `currentColor`
- [ ] Redraw fan on orientation change (CSS media query fires, fan redraws)

### Phase 4 – Polish
- [ ] Undo/redo wired to same stack as coloring engine
- [ ] Download button triggers `downloadImage()` 
- [ ] Magic Fill button triggers `colorItRandomly()`
- [ ] Magic Tools drawer: gradient + pattern buttons functional
- [ ] Test on iOS Safari and Chrome Mobile

---

## CSS Orientation Switch (no reload)

```css
/* Portrait */
@media (orientation: portrait) {
  .color-fan-wrap { position: fixed; bottom: 0; left: 0; right: 0; height: 180px; }
  .canvas-area    { height: calc(100vh - 48px - 180px); }
  .top-bar .undo-redo { display: none; }
}

/* Landscape */
@media (orientation: landscape) {
  .color-fan-wrap { position: fixed; left: 0; top: 48px; bottom: 0; width: 160px; }
  .canvas-area    { margin-left: 160px; height: calc(100vh - 48px); }
  .top-bar .undo-redo { display: flex; }
}
```

JS listens for the media query change event to redraw the canvas fan:
```js
window.matchMedia('(orientation: portrait)').addEventListener('change', () => {
  drawColorFan(); // redraws for new orientation
});
```

---

## Key Constraints

- **No page reload on rotation** — orientation handled entirely by CSS media queries + JS redraw
- **Same coloring engine** — `coloring.js`, `colors.js`, `download.js` imported unchanged
- **Touch targets** — all tappable elements minimum 44×44px
- **No ads** — same rule as desktop coloring page
- **Undo/redo** — same stack, same keyboard shortcuts (irrelevant on mobile but same code)
