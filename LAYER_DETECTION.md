# Layer Detection Strategy

## Overview

This project uses a **dual-layer SVG architecture** for coloring images:
- **Outline Layer**: Contains visual elements (strokes, fills for z-axis occlusion) - NOT clickable
- **Colorable Layer**: Contains empty paths (no fill, no stroke) - Clickable and fillable by user

## Detection Method

Since Inkscape does not preserve layer names reliably during export, we detect layers by **analyzing their visual characteristics**:

### Rule: Colorable Layer Detection

**A layer is considered "colorable" if and only if ALL paths in that layer have:**
- `fill="none"` or `fill="transparent"` (or no fill attribute)
- `stroke="none"` (or no stroke attribute)

**Any other layer is considered an "outline" layer (non-clickable).**

### Implementation

#### JavaScript (js/coloring.js)

```javascript
function isColorableLayer(groupElement) {
    // Check ALL paths in the group
    const paths = groupElement.querySelectorAll('path, circle, rect, polygon, ellipse');

    for (let path of paths) {
        // If ANY path has fill or stroke, NOT colorable
        if (hasFillOrStroke(path)) {
            return false;
        }
    }

    // All paths have no fill and no stroke = colorable
    return true;
}
```

#### Python (svg-automation.py)

```python
def is_colorable_layer(group_element):
    """A layer is colorable if ALL its paths have no fill and no stroke"""
    paths = [elem for elem in group_element.iter()
             if elem.tag.endswith(('path', 'circle', 'rect', 'polygon', 'ellipse'))]

    for path in paths:
        if has_fill_or_stroke(path):
            return False  # Found filled/stroked path = NOT colorable

    return True  # All paths empty = colorable
```

## Why This Works

### Inkscape Export Workflow

When exporting from Inkscape with two layers:

1. **Outline Layer** (layer-MC1, layer-MC2, etc.)
   - Contains paths with **black strokes** (for outlines)
   - May contain **white fills** (for z-axis occlusion - hiding elements behind)
   - May contain **colored fills** (for shading, backgrounds)
   - **Detection:** Has fills or strokes → NON-clickable

2. **Colorable Layer** (layer2, Color, etc.)
   - Contains paths with **no fill, no stroke**
   - Pure geometric shapes ready to receive user colors
   - **Detection:** No fills, no strokes → Clickable

### Z-Axis Occlusion Support

The outline layer can use **white fills** to create depth:
- Example: Dinosaur body with white fill hides tree branches behind it
- This is a legitimate artistic technique
- Our detection preserves these fills (doesn't make them transparent)
- Clear button skips outline layer entirely

## Benefits

✅ **Layer name independent** - Works regardless of Inkscape's export naming
✅ **Supports artistic freedom** - Outline layer can have any visual attributes
✅ **Simple mental model** - "Empty paths = colorable, filled paths = outline"
✅ **Prevents click issues** - Outline paths are `pointer-events: none`
✅ **Preserves z-axis** - Clear button doesn't affect outline layer

## SVG Requirements

For dual-layer coloring to work:

1. **Two layers** in Inkscape:
   - One layer with filled/stroked paths (outline)
   - One layer with empty paths (colorable regions)

2. **Export settings** (Adobe Illustrator or Inkscape):
   - Format: Plain SVG
   - Styling: Presentation Attributes (NOT Internal CSS)
   - Responsive: Checked
   - Remove width/height after export (keep viewBox only)

3. **Colorable layer paths must have:**
   - `fill="none"` or `fill="transparent"` in attribute OR style
   - `stroke="none"` or no stroke attribute
   - Should NOT have any visible rendering

4. **Outline layer can have:**
   - Any fill color (black, white, colors)
   - Any stroke color/width
   - Full artistic freedom for visual appearance

## Testing

To verify layer detection works:

1. **Load SVG** in coloring page
2. **Check console** for layer detection logs:
   - `🚫 Outline path (non-clickable): path123`
   - `✅ Colorable path (clickable): path456`
3. **Try clicking** outline paths - should NOT color
4. **Try clicking** colorable paths - should fill with color
5. **Use Clear button** - should NOT affect outline layer

## Common Issues

### Issue: Outline paths are clickable

**Cause:** Paths in outline layer have no fill and no stroke
**Fix:** Ensure outline layer paths have visible strokes or fills

### Issue: Colorable paths are not clickable

**Cause:** Colorable layer paths have fill or stroke attributes
**Fix:** Set `fill="none" stroke="none"` in Inkscape before export

### Issue: Clear button reveals hidden lines

**Cause:** Old detection logic made outline paths transparent
**Fix:** ✅ RESOLVED - Clear button now skips outline layer entirely

### Issue: Multiple regions color at once

**Cause:** Paths in outline layer receiving clicks
**Fix:** ✅ RESOLVED - Layer detection makes outline paths `pointer-events: none`
