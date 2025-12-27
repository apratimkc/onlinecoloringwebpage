# Layout System Guide - ColorTap Coloring Page

This document explains how the layout system works for the coloring page and which files to edit to customize it.

---

## Overview

The coloring page uses **CSS Grid Layout** to arrange three main panels:
1. **Color Panel** (left) - Color palette and controls
2. **Canvas Panel** (top right) - SVG coloring canvas
3. **Advanced Panel** (bottom right) - Gradients and patterns

---

## File to Edit

**File:** `css/coloring-page.css`

This is the **ONLY** file you need to edit to change the layout. All layout rules are contained here.

---

## Current Layout Structure

### Grid Container: `.coloring-container`

Located at: **Lines 11-23** in `css/coloring-page.css`

```css
.coloring-container {
    display: grid;
    grid-template-columns: 180px 1fr;
    grid-template-rows: 1fr auto;
    gap: 1rem;
    padding: 1rem;
    height: calc(100vh - 100px);
    max-width: 2000px;
    margin: 0 auto;
    grid-template-areas:
        "color-panel canvas-panel"
        "color-panel advanced-panel";
}
```

#### Key Properties Explained:

**1. `grid-template-columns: 180px 1fr;`**
- Defines 2 columns:
  - **Column 1:** `180px` - Fixed width for color panel
  - **Column 2:** `1fr` - Remaining space for canvas/advanced panels
- To make color panel wider: Change `180px` to higher value (e.g., `200px`, `250px`)
- To make color panel narrower: Change to lower value (e.g., `150px`)

**2. `grid-template-rows: 1fr auto;`**
- Defines 2 rows:
  - **Row 1:** `1fr` - Takes all available space (for canvas panel)
  - **Row 2:** `auto` - Only takes space it needs (for advanced panel)
- To make canvas taller: Keep `1fr`
- To make advanced panel taller: Change `auto` to specific height (e.g., `200px`)

**3. `grid-template-areas:`**
- Defines which panel goes where using named areas:
```
"color-panel canvas-panel"     <- Row 1: Color on left, Canvas on right
"color-panel advanced-panel"   <- Row 2: Color on left, Advanced on right
```

- **Current layout:**
  ```
  ┌─────────────┬──────────────────┐
  │   color-    │   canvas-panel   │
  │   panel     │                  │
  │             ├──────────────────┤
  │             │ advanced-panel   │
  └─────────────┴──────────────────┘
  ```

- **To change layout**, modify the grid-template-areas string. Examples:

  **Example 1: Color panel only in top row**
  ```css
  grid-template-areas:
      "color-panel canvas-panel"
      ". advanced-panel";
  ```
  Result:
  ```
  ┌─────────────┬──────────────────┐
  │   color-    │   canvas-panel   │
  │   panel     │                  │
  └─────────────┼──────────────────┤
                │ advanced-panel   │
                └──────────────────┘
  ```

  **Example 2: Advanced panel spans full width at bottom**
  ```css
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
      "color-panel"
      "canvas-panel"
      "advanced-panel";
  ```
  Result:
  ```
  ┌────────────────────────────────┐
  │         color-panel            │
  ├────────────────────────────────┤
  │         canvas-panel           │
  ├────────────────────────────────┤
  │        advanced-panel          │
  └────────────────────────────────┘
  ```

  **Example 3: Three columns**
  ```css
  grid-template-columns: 200px 1fr 300px;
  grid-template-rows: 1fr auto;
  grid-template-areas:
      "color-panel canvas-panel advanced-panel"
      "color-panel canvas-panel advanced-panel";
  ```
  Result:
  ```
  ┌──────┬───────────────┬──────────┐
  │color │    canvas     │advanced  │
  │panel │    panel      │panel     │
  │      │               │          │
  └──────┴───────────────┴──────────┘
  ```

**4. `gap: 1rem;`**
- Space between grid items (panels)
- To increase spacing: `gap: 2rem;`
- To decrease spacing: `gap: 0.5rem;`

**5. `height: calc(100vh - 100px);`**
- Total height of the grid container
- `100vh` = full viewport height
- `- 100px` = subtract header height
- To make taller/shorter: Adjust the `100px` value

---

## Individual Panel Styles

### 1. Color Panel (`.color-panel`)

Located at: **Lines 26-37** in `css/coloring-page.css`

```css
.color-panel {
    grid-area: color-panel;
    background: linear-gradient(135deg, #FFFFFF 0%, #FFF8E7 100%);
    border-radius: 20px;
    padding: 1rem;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    border: 4px solid var(--accent-yellow);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
}
```

**Key Properties:**
- `grid-area: color-panel;` - Links to grid-template-areas
- `overflow-y: auto;` - Allows scrolling if content is too tall
- `padding: 1rem;` - Inner spacing
- **Don't change** `grid-area` unless you rename it in grid-template-areas

---

### 2. Canvas Panel (`.canvas-panel`)

Located at: **Lines 113-124** in `css/coloring-page.css`

```css
.canvas-panel {
    grid-area: canvas-panel;
    background-color: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    border: 4px solid var(--accent-purple);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}
```

**Key Properties:**
- `grid-area: canvas-panel;` - Links to grid-template-areas
- `padding: 2rem;` - Space around the SVG container
- `overflow: hidden;` - Prevents SVG from overflowing

---

### 3. SVG Container (`.svg-container`)

Located at: **Lines 126-136** in `css/coloring-page.css`

```css
.svg-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #CCCCCC;
    border-radius: 10px;
    padding: 20px;
    position: relative;
}
```

**Key Properties:**
- `width: 100%;` - Takes full width of canvas-panel
- `height: 100%;` - Takes full height of canvas-panel
- `background-color: #CCCCCC;` - Gray background behind SVG

---

### 4. SVG Ratio Wrapper (`.svg-ratio-wrapper`)

Located at: **Lines 141-149** in `css/coloring-page.css`

```css
.svg-ratio-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 1125px;  /* Controls maximum SVG width */
    max-height: 1125px; /* Controls maximum SVG height */
    display: flex;
    align-items: center;
    justify-content: center;
}
```

**Key Properties:**
- `max-width: 1125px;` - **Maximum width of the SVG image**
- `max-height: 1125px;` - **Maximum height of the SVG image**

**To make SVG bigger:**
- Increase `max-width` and `max-height` (e.g., `1500px`)

**To make SVG smaller:**
- Decrease values (e.g., `800px`)

---

### 5. Advanced Panel (`.advanced-panel`)

Located at: **Lines 197-207** in `css/coloring-page.css`

```css
.advanced-panel {
    grid-area: advanced-panel;
    background: linear-gradient(135deg, #FFFFFF 0%, #FFF8E7 100%);
    border-radius: 20px;
    padding: 1rem;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    border: 4px solid var(--accent-green);
    overflow-x: auto;      /* Horizontal scrolling */
    overflow-y: hidden;    /* No vertical scrolling */
    white-space: nowrap;   /* Prevents wrapping */
}
```

**Key Properties:**
- `grid-area: advanced-panel;` - Links to grid-template-areas
- `overflow-x: auto;` - Enables horizontal scrolling for gradient/pattern buttons
- `overflow-y: hidden;` - Prevents vertical scrolling
- `white-space: nowrap;` - Forces content to stay in one line

---

## Advanced Panel Content Layout

### Advanced Content Container (`.advanced-content`)

Located at: **Lines 224-229** in `css/coloring-page.css`

```css
.advanced-content {
    display: inline-flex;
    flex-direction: row;
    gap: 1rem;
    align-items: center;
}
```

**Key Properties:**
- `display: inline-flex;` - Makes it a horizontal inline container
- `flex-direction: row;` - Items flow left to right
- `gap: 1rem;` - Space between gradient and pattern sections

---

### Gradient Grid (`.gradient-grid`)

Located at: **Lines 247-250** in `css/coloring-page.css`

```css
.gradient-grid {
    display: inline-flex;
    gap: 0.75rem;
}
```

**Currently:** Gradients are displayed in a **single horizontal row**

**To change to grid layout:**
```css
.gradient-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 4 columns */
    gap: 0.75rem;
}
```

**To change number of columns:**
- `repeat(4, 1fr)` = 4 columns
- `repeat(3, 1fr)` = 3 columns
- `repeat(2, 1fr)` = 2 columns

---

### Gradient Button (`.gradient-btn`)

Located at: **Lines 252-261** in `css/coloring-page.css`

```css
.gradient-btn {
    width: 60px;
    height: 60px;
    border: 3px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    flex-shrink: 0;
}
```

**Key Properties:**
- `width: 60px;` - Button width
- `height: 60px;` - Button height
- `flex-shrink: 0;` - Prevents shrinking when in flex container

**To make buttons bigger:**
```css
width: 80px;
height: 80px;
```

**To make buttons smaller:**
```css
width: 50px;
height: 50px;
```

---

### Pattern Grid (`.pattern-grid`)

Located at: **Lines 287-290** in `css/coloring-page.css`

```css
.pattern-grid {
    display: inline-flex;
    gap: 0.75rem;
}
```

**Currently:** Patterns are displayed in a **single horizontal row**

**To change to grid layout:**
```css
.pattern-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr); /* 5 columns */
    gap: 0.75rem;
}
```

---

### Pattern Button (`.pattern-btn`)

Located at: **Lines 292-306** in `css/coloring-page.css`

```css
.pattern-btn {
    background-color: #f9f9f9;
    border: 3px solid transparent;
    border-radius: 8px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    width: 80px;
    height: 80px;
    flex-shrink: 0;
}
```

**Key Properties:**
- `width: 80px;` - Button width
- `height: 80px;` - Button height
- `display: inline-flex;` - Flexible inline container
- `flex-direction: column;` - Icon above label

**To make buttons bigger:**
```css
width: 100px;
height: 100px;
```

---

## Common Layout Scenarios

### Scenario 1: Make Color Panel Wider

**Edit:** `.coloring-container` (Line 13)

```css
grid-template-columns: 250px 1fr; /* Change from 180px to 250px */
```

---

### Scenario 2: Make Canvas Bigger

**Edit:** `.svg-ratio-wrapper` (Lines 145-146)

```css
max-width: 1500px;  /* Increase from 1125px */
max-height: 1500px; /* Increase from 1125px */
```

---

### Scenario 3: Make Advanced Panel Taller

**Edit:** `.coloring-container` (Line 14)

```css
grid-template-rows: 1fr 200px; /* Change from 'auto' to fixed height */
```

---

### Scenario 4: Stack Everything Vertically

**Edit:** `.coloring-container` (Lines 13-22)

```css
grid-template-columns: 1fr;
grid-template-rows: auto 1fr auto;
grid-template-areas:
    "color-panel"
    "canvas-panel"
    "advanced-panel";
```

---

### Scenario 5: Three-Column Layout (Color | Canvas | Advanced)

**Edit:** `.coloring-container` (Lines 13-22)

```css
grid-template-columns: 200px 1fr 300px;
grid-template-rows: 1fr;
grid-template-areas:
    "color-panel canvas-panel advanced-panel";
```

Also need to change `.advanced-panel` to remove horizontal scrolling:

**Edit:** `.advanced-panel` (Lines 204-206)

```css
overflow-x: visible;
overflow-y: auto;
white-space: normal;
```

And change `.advanced-content` to vertical layout:

**Edit:** `.advanced-content` (Line 226)

```css
flex-direction: column; /* Change from 'row' to 'column' */
```

---

### Scenario 6: Gradient/Pattern Buttons in Grid Instead of Row

**Edit:** `.gradient-grid` (Lines 247-250)

```css
.gradient-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 4 columns */
    gap: 0.75rem;
}
```

**Edit:** `.pattern-grid` (Lines 287-290)

```css
.pattern-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr); /* 5 columns */
    gap: 0.75rem;
}
```

**Edit:** `.advanced-content` (Line 226)

```css
flex-direction: column; /* Stack gradients above patterns */
```

---

## Responsive Breakpoints (Future)

Currently, the layout is fixed for desktop. For mobile responsiveness, you would add media queries at the end of `css/coloring-page.css`:

```css
/* Tablet */
@media (max-width: 1024px) {
    .coloring-container {
        grid-template-columns: 150px 1fr;
    }
}

/* Mobile */
@media (max-width: 768px) {
    .coloring-container {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr auto;
        grid-template-areas:
            "canvas-panel"
            "advanced-panel"
            "color-panel";
    }
}
```

---

## Testing Your Changes

After editing `css/coloring-page.css`:

1. **Save the file**
2. **Refresh the browser** (Ctrl+F5 or Cmd+Shift+R to clear cache)
3. **Inspect with DevTools** (F12) to debug:
   - Right-click on a panel → Inspect
   - Check the "Grid" overlay in DevTools to visualize the grid

---

## Important Notes

1. **Only edit `css/coloring-page.css`** - No JavaScript changes needed for layout
2. **Don't change `grid-area` values** in individual panels unless you also change `grid-template-areas`
3. **Keep `gap: 1rem;`** for consistent spacing between panels
4. **Use browser DevTools** to test changes in real-time before saving
5. **Back up the file** before making major changes

---

## Quick Reference: Key CSS Properties

| Property | What it does | Example Values |
|----------|-------------|----------------|
| `grid-template-columns` | Defines column widths | `200px 1fr`, `1fr 1fr 1fr` |
| `grid-template-rows` | Defines row heights | `1fr auto`, `200px 1fr` |
| `grid-template-areas` | Assigns panels to grid cells | See examples above |
| `gap` | Space between panels | `1rem`, `2rem`, `0.5rem` |
| `max-width` / `max-height` | Maximum size of SVG | `1125px`, `1500px` |
| `overflow-x` | Horizontal scrolling | `auto`, `hidden`, `visible` |
| `overflow-y` | Vertical scrolling | `auto`, `hidden`, `visible` |
| `display: grid` | Enables grid layout | - |
| `display: flex` | Enables flex layout | - |
| `flex-direction` | Flex item direction | `row`, `column` |

---

## Summary

- **Main file to edit:** `css/coloring-page.css`
- **Grid container:** `.coloring-container` (Lines 11-23)
- **Column widths:** `grid-template-columns` (Line 13)
- **Row heights:** `grid-template-rows` (Line 14)
- **Panel positions:** `grid-template-areas` (Lines 20-22)
- **SVG size:** `.svg-ratio-wrapper` max-width/max-height (Lines 145-146)
- **Button layout:** `.gradient-grid` and `.pattern-grid` (Lines 247-250, 287-290)

Use this guide to customize the layout exactly how you want it!
