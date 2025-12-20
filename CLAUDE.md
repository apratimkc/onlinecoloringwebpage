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

**12 Basic Colors:**
```
1. Red (#FF0000)        7. Pink (#FFC0CB)
2. Orange (#FFA500)     8. Brown (#8B4513)
3. Yellow (#FFFF00)     9. Black (#000000)
4. Green (#00FF00)      10. White (#FFFFFF)
5. Blue (#0000FF)       11. Gray (#808080)
6. Purple (#800080)     12. Light Blue (#87CEEB)
```
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
- Viewbox: 800×800 or similar square ratio
- Stroke width: 2-3px for outlines
- No gradients or complex effects in source
- Organized layers/groups for each fillable section

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
- **12 Colors Only:** No custom color picker in MVP
- **5 Patterns Only:** No additional pattern options in MVP
