# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an online coloring platform MVP targeting users aged 2-25. The platform features tap-to-fill coloring with both simple and advanced options (gradients, patterns). The goal is to reach $2,000+/month in revenue through Google AdSense.

**Key Characteristics:**
- 100 coloring images across 10-12 categories (Animals, Princess, Unicorns, Vehicles, Food, Nature, Holidays, Dinosaurs, Ocean, Fantasy, Shapes, Flowers)
- Each category contains 8-10 images with mixed difficulty (simple, medium, complex)
- Monetized via Google AdSense (ads on homepage and category pages only, NOT on coloring page)
- Fully responsive design (mobile-first approach)

## Architecture Overview

### Three-Page Structure

1. **Homepage**: Category grid + random image button + AdSense ads
2. **Category Page**: Thumbnail grid of 8-10 images per category + AdSense ads
3. **Coloring Page**: Main application interface (NO ads for clean UX)

### Coloring Page Layout

**Desktop (3-column):**
- Left Panel: Pencil color indicator + 12 basic colors + CLEAR button
- Center Canvas: Responsive SVG/Canvas coloring image with tap-to-fill
- Right Panel: Advanced options (gradients, patterns)

**Mobile (stacked):**
- Top: Canvas (full-width)
- Middle: Advanced options (collapsible drawer/accordion)
- Bottom: Color palette (fixed)

### Core Technology Decisions

**Image Format:** Use SVG for coloring images (preferred over Canvas)
- SVGs provide easier region/path detection for tap-to-fill
- Each fillable section should be a separate SVG path/group
- Source images: Black outlines (2-3px stroke), white/transparent fill

**Tap-to-Fill Implementation:**
- Click/tap any SVG path to fill with selected color/gradient/pattern
- No undo/redo functionality (users can re-tap to change color)
- Only reset option is CLEAR button (with confirmation dialog)
- Fill response must be instant (<100ms)

**State Management:**
- Track current selected color/gradient/pattern
- Update pencil icon indicator in real-time
- Maintain filled state of all image regions

## Key Features & Requirements

### Color Selection (Left Panel)

**Pencil Icon Indicator:**
- Positioned at top of left panel
- Dynamically shows currently selected color/gradient/pattern
- Must update in real-time when selection changes

**18 Colors (3x6 Grid):**
Organized by color families for better UX:
```
Row 1: Reds/Pinks       Row 4: Blues/Cyans
  Red (#FF0000)           Blue (#0000FF)
  Tomato (#FF6347)        Light Blue (#87CEEB)
  Pink (#FFC0CB)          Turquoise (#00CED1)

Row 2: Oranges/Yellows  Row 5: Purples/Pinks
  Orange (#FFA500)        Purple (#800080)
  Yellow (#FFFF00)        Indigo (#4B0082)
  Gold (#FFD700)          Hot Pink (#FF69B4)

Row 3: Greens           Row 6: Neutrals
  Green (#00FF00)         Black (#000000)
  Lime Green (#32CD32)    Gray (#808080)
  Brown (#8B4513)         White (#FFFFFF)
```
- 3-column grid layout
- Minimum tap target: 40px × 40px on mobile
- Active color indicated with 3-4px solid border

**CLEAR Button:**
- Shows confirmation dialog: "Are you sure you want to clear all colors? This cannot be undone."
- Options: "Yes, Clear" | "Cancel"
- Resets entire image to uncolored state

### Advanced Options (Right Panel)

**Gradient Fill:**
- User selects two colors (start + end) from same 12 basic colors
- Creates linear gradient (top to bottom by default)
- Preview box shows gradient result
- Apply on tap to any section

**Pattern Fill (5 patterns):**
1. Stripes (horizontal lines)
2. Dots (polka dots)
3. Checkerboard (alternating squares)
4. Hearts (repeating heart shapes)
5. Stars (repeating star shapes)
- Uses currently selected basic color
- Preview box shows pattern with color
- Scales appropriately to section size

### Navigation & Actions

**Header (fixed/sticky):**
- Logo/Site Name (links to homepage)
- "Home" link
- "Random" button (picks random image from all 100)
- "Next Image" button (only on coloring page)

**Next Image Button:**
- Shows dialog: "Start a new image? (Current work will be lost)"
- If confirmed: Loads random new image from any category

**Download Button:**
- Positioned top-right or as floating button
- Generates PNG file (1200px-2000px width, 300 DPI preferred)
- Filename format: `colored-[category]-[timestamp].png`
- Auto-downloads to user's device

### Responsive Design Breakpoints

- **Mobile:** 320px - 767px (stacked layout, touch-optimized)
- **Tablet:** 768px - 1024px (compact layout, may use drawers)
- **Desktop:** 1025px+ (three-column layout)

All tap targets: minimum 44px × 44px on mobile

## Performance Requirements

- Initial page load: < 2 seconds (on 3G)
- Image loading: < 1 second per image
- Color fill response: Instant (< 100ms)
- Use lazy loading for image thumbnails
- Compress images (WebP where possible)
- Optimize SVG files (remove unnecessary metadata)

## Browser Compatibility

**Support:** Last 2 versions of Chrome, Firefox, Safari, Edge
**Mobile:** iOS Safari, Chrome Mobile, Samsung Internet
**Graceful degradation** for older browsers

## Content Structure

**Categories (10-12 total):**
- Each category: 8-10 images
- Difficulty mix per category:
  - 3-4 Simple (single subject, large sections)
  - 3-4 Medium (subject + environment, moderate detail)
  - 2-3 Complex (detailed scene, multiple elements)

**SVG Specifications:**
- Viewbox: 800×800 or similar square ratio (NO width/height attributes for responsive scaling)
- Stroke width: 2-3px for outlines
- No gradients or complex effects in source
- Organized layers/groups for each fillable section

**Two Supported SVG Formats:**

1. **Single-Layer Format (Simple SVGs):**
   - All paths have `fill="transparent"` or `fill="none"` as direct attributes
   - Black strokes define the outlines
   - Example: `<path fill="transparent" stroke="black" stroke-width="2" d="..."/>`
   - Used for simple coloring images

2. **Dual-Layer Format (Professional/Adobe Illustrator Exports):**
   - **Layer 1 (Outline):** Black filled paths (`fill="#000000"`) - NOT colorable, always visible
   - **Layer 2 (Colorable):** Transparent fills in style attribute (`style="fill:transparent;..."`)
   - Outline layer provides structure, colorable layer receives user colors
   - Example structure:
     ```xml
     <g id="outline-layer">
       <path fill="#000000" d="..."/> <!-- Not clickable -->
     </g>
     <g id="colorable-layer">
       <path style="fill:transparent;stroke:none" d="..."/> <!-- Clickable -->
     </g>
     ```

**Critical SVG Export Settings (Adobe Illustrator):**
- Styling: **Presentation Attributes** (NOT Internal CSS)
- Object IDs: Layer Names
- Responsive: Checked
- Remove width/height attributes after export (keep only viewBox)

## Monetization - Google AdSense

**Ad Placement Rules:**
- Homepage: 1 banner ad (728×90 desktop, 320×50 mobile)
- Category Pages: 1 ad unit above image grid
- Coloring Page: **NO ADS** (clean user experience is critical)

Ads must be responsive and not obstruct any functionality.

## Legal & Compliance

**COPPA Compliance:**
- Target audience includes children under 13
- No data collection without parental consent
- Privacy Policy must address COPPA requirements
- Cookie policy required (for AdSense cookies)

**Required Pages:**
- Privacy Policy
- Contact (form or email)
- About (optional but recommended)
- Copyright notice in footer

## Development Workflow

When implementing features:
1. Start with mobile layout first (mobile-first approach)
2. Test tap-to-fill accuracy thoroughly
3. Ensure color/gradient/pattern previews update instantly
4. Validate confirmation dialogs (CLEAR, Next Image)
5. Test download functionality generates proper high-res PNGs
6. Verify AdSense placement (never on coloring page)

## Image Assets

**Expected Directory Structure:**
```
/images/
  /animals/
    simple-1.svg
    simple-2.svg
    medium-1.svg
    complex-1.svg
    ...
  /princess/
  /unicorns/
  /vehicles/
  ...
```

Each SVG must have clearly defined fillable paths/regions.

## Future Enhancements (NOT in MVP)

Do not implement these unless explicitly requested:
- User accounts & login
- Cloud save gallery
- Social sharing
- Premium subscriptions
- Custom color picker (beyond 12 colors)
- Undo/Redo functionality
- Gamification (badges, achievements)
- Brush tool / free drawing
- Animation effects on fill
- Collaboration mode

## Key Constraints

- **No Undo/Redo:** Users must re-tap sections to change colors
- **No User Accounts:** Fully anonymous MVP
- **No Ads on Coloring Page:** Critical for clean UX
- **SVG Preferred:** Over Canvas for easier tap-to-fill implementation
- **18 Colors Only:** No custom color picker in MVP (expanded from 12 to 18)
- **5 Patterns Only:** No additional pattern options in MVP

---

## Current Implementation Status (Last Updated: 2025-12-23)

### ✅ Completed Features

**Core Coloring Engine:**
- ✅ SVG loading and rendering (responsive, no fixed width/height)
- ✅ Tap-to-fill functionality with instant response (<100ms)
- ✅ Support for both single-layer and dual-layer SVG formats
- ✅ Intelligent path detection (outline vs. colorable paths)
- ✅ User-applied color detection (ignores rgb(), #hex, url() when determining layers)
- ✅ Style attribute and fill attribute handling
- ✅ Solid color application
- ✅ Gradient fills (8 directions)
- ✅ Pattern fills (5 patterns: stripes, dots, checkerboard, hearts, stars)
- ✅ Clear all functionality (fully working, preserves outline layer)
- ✅ Download as PNG

**UI Components:**
- ✅ Professional pencil icon indicator (Adobe Illustrator design)
- ✅ 18-color palette (3x6 grid, organized by color families)
- ✅ Dynamic pencil color preview (updates with selection)
- ✅ Dynamic pattern icon colors (update with current color selection)
- ✅ Gradient panel with 8 preset gradients (4-column grid)
- ✅ Pattern panel with 5 patterns (5-column grid, icons only)
- ✅ Three-column responsive layout (color | canvas | advanced)
- ✅ Full-width layout utilizing entire viewport

**Image Catalog:**
- ✅ 7 images total across 3 categories
  - Animals: 5 images (dog, 2 horses, turtle, peacock)
  - Princess: 1 image (crown)
  - Shapes: 1 image (star)
- ✅ Difficulty levels: Simple, Medium, Complex
- ✅ Image metadata tracking (regions, difficulty)

**Technical Implementation:**
- ✅ Dual-layer SVG support (outline + colorable layers)
- ✅ Outline paths are non-clickable (pointer-events: none)
- ✅ Fill detection works for both `fill="..."` and `style="fill:..."`
- ✅ Background coloring (temporarily disabled for debugging)
- ✅ Mobile touch support (touchend events)
- ✅ Performance logging (<100ms fill target)

**Documentation:**
- ✅ DESIGN_GUIDE.md for Adobe Illustrator workflow
- ✅ Comprehensive export instructions
- ✅ Overlapping regions solutions
- ✅ Common mistakes guide

### 🚧 In Progress / Pending

**High Priority:**
- ⏳ Homepage with category grid
- ⏳ Category pages with image thumbnails
- ⏳ Remaining 93 images (7/100 complete)

**Medium Priority:**
- ⏳ Google AdSense integration (homepage, category pages)
- ⏳ Download button improvements (high-res PNG export)
- ⏳ Privacy Policy page
- ⏳ Contact page
- ⏳ Mobile optimization testing

**Low Priority:**
- ⏳ SEO optimization
- ⏳ Performance optimization for large SVGs
- ⏳ Cross-browser testing
- ⏳ Accessibility improvements

### 📊 Progress Metrics

- **MVP Completion:** ~45%
- **Images:** 7/100 (7%)
- **Categories:** 3/12 active
- **Core Features:** 90% complete
- **UI/UX Polish:** 80% complete
- **Pages:** 1/3 (only coloring page implemented)

### 🔧 Technical Debt

1. **Code Optimization:**
   - Consider caching computed styles for large SVGs
   - Optimize gradient/pattern ID generation
   - Review performance for 100+ region images

2. **Browser Testing:**
   - Test on iOS Safari (mobile)
   - Test on Chrome Mobile
   - Test on Samsung Internet
   - Verify touch events work correctly

### 🎯 Next Steps (Recommended Priority)

1. **Create homepage** with category grid
2. **Add 3-5 more images** per category (prioritize Animals, Princess)
3. **Implement category pages** with thumbnails
4. **Integrate Google AdSense** (homepage + category pages only)
5. **Create Privacy Policy** (COPPA compliance)
6. **Continue adding images** until 100 total reached
