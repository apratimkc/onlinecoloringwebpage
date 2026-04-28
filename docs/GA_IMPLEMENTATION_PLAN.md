# Google Analytics 4 — Full Implementation Plan
**Site:** magicpencil.fun | **GA4 Property ID:** `G-S4TFTTG0SD`

---

## Current State (As of 2026-04-28)

GA4 is **non-functional on all revenue-generating pages.**

| Page Type | GA4 Present? |
|---|---|
| Homepage (`index.html`) | ❌ Missing |
| Category pages (`/categories/*.html`) | ❌ Missing |
| Coloring pages (`/color/*/*.html`) | ❌ Missing |
| Mobile coloring (`coloring-mobile.html`) | ❌ Missing |
| Blog posts (`/blog/*.html`) | ❌ Missing |
| About / Contact / Privacy | ✅ Present but irrelevant |

The cookie consent system (`js/cookie-consent.js`) is correctly wired — it lazy-loads GA4 only after user opt-in via `loadGoogleAnalytics()`. The problem is `loadGoogleAnalytics()` is never called on main pages because the consent banner script is not included on them.

**Everything in this plan is blocked until Phase 1 is complete.**

---

## Phase 1 — Fix GA4 on All Pages (Prerequisite)

**Goal:** Get the GA4 tag firing on every page before adding any custom events.

### What to do

Add the following two tags to the `<head>` of every HTML template and generated page:

```html
<!-- Google Analytics (cookie-consent controlled) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-S4TFTTG0SD"></script>
<script src="/js/cookie-consent.js"></script>
```

The `cookie-consent.js` file already handles the conditional loading — it only activates GA4 if the user has accepted analytics cookies. No changes to that file are needed.

### Files to update

| File | How |
|---|---|
| `index.html` | Add tags to `<head>` |
| `coloring-mobile.html` | Add tags to `<head>` |
| `categories/animals.html` (and all 12 category pages) | Add tags to `<head>` |
| `/color/**/*.html` (all 85+ static coloring pages) | Add tags to `<head>` — best done via the SVG automation pipeline that generates these pages |
| `blog/index.html` and all 11 blog posts | Add tags to `<head>` |

### Helper function to add to all pages

Add a safe `gtag` wrapper at the top of `js/analytics.js` (new file, created in Phase 2). This wrapper swallows calls silently if GA4 hasn't loaded yet (e.g. user declined cookies):

```js
function trackEvent(eventName, params = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}
```

Use `trackEvent()` everywhere in this plan instead of calling `gtag()` directly.

### Verification

After deploying: open any coloring page, accept the cookie banner, then open Chrome DevTools → Network tab → filter by `collect` or `gtag`. You should see POST requests to `www.google-analytics.com/g/collect`.

---

## Phase 2 — Analytics Helper File

**Create `js/analytics.js`** — a single file that exports all tracking functions. This keeps event calls consistent and prevents typos in event names.

```js
// js/analytics.js

function trackEvent(eventName, params = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}

// Funnel
function trackCategorySelected(categoryName, source) {
  trackEvent('category_selected', { category_name: categoryName, source });
}

function trackImageSelected(imageId, category, positionInGrid) {
  trackEvent('image_selected', { image_id: imageId, category, position_in_grid: positionInGrid });
}

function trackColoringSessionStart(imageId, category, deviceType) {
  trackEvent('coloring_session_start', { image_id: imageId, category, device_type: deviceType });
}

// Core engagement
function trackFirstFill(imageId, category, timeToFillMs) {
  trackEvent('first_fill', { image_id: imageId, category, time_to_fill_ms: timeToFillMs });
}

function trackFillModeUsed(mode, imageId) {
  trackEvent('fill_mode_used', { mode, image_id: imageId });
}

function trackMagicFillUsed(imageId, category) {
  trackEvent('magic_fill_used', { image_id: imageId, category });
}

function trackUndoUsed(imageId, countInSession) {
  trackEvent('undo_used', { image_id: imageId, count_in_session: countInSession });
}

function trackColorSelected(colorName, hex, fillMode) {
  trackEvent('color_selected', { color_name: colorName, hex, fill_mode: fillMode });
}

// Completion & conversion
function trackColoringProgress(milestone, imageId, category) {
  trackEvent('coloring_progress', { milestone, image_id: imageId, category });
}

function trackColoringComplete(imageId, category, sessionDurationS, fillsCount) {
  trackEvent('coloring_complete', {
    image_id: imageId,
    category,
    session_duration_s: sessionDurationS,
    fills_count: fillsCount
  });
}

function trackDownloadClicked(type, imageId, category, completionPct) {
  trackEvent('download_clicked', {
    type,          // 'colored_art' or 'clean_outline'
    image_id: imageId,
    category,
    completion_pct: completionPct
  });
}

function trackClearAllConfirmed(imageId, category, completionPctAtClear) {
  trackEvent('clear_all_confirmed', {
    image_id: imageId,
    category,
    completion_pct_at_clear: completionPctAtClear
  });
}

// Affiliate revenue
function trackAffiliateClick(asin, productName, category, pageType) {
  trackEvent('affiliate_click', {
    asin,
    product_name: productName,
    category,
    page_type: pageType   // 'category_page', 'homepage', 'blog'
  });
}

function trackAffiliateWidgetImpression(category, pageType, productsShown) {
  trackEvent('affiliate_widget_impression', {
    category,
    page_type: pageType,
    products_shown: productsShown.join(',')   // comma-separated ASINs
  });
}

// Content & navigation
function trackRandomUsed(source, resultImageId) {
  trackEvent('random_used', { source, result_image_id: resultImageId });
}

function trackNextImageConfirmed(fromImageId, toImageId) {
  trackEvent('next_image_confirmed', { from_image_id: fromImageId, to_image_id: toImageId });
}

function trackBlogScrollDepth(postSlug, depthPct) {
  trackEvent('blog_scroll_depth', { post_slug: postSlug, depth_pct: depthPct });
}

// Mobile-specific
function trackOrientationChange(from, imageId) {
  trackEvent('orientation_change', { from, image_id: imageId });
}
```

Load `analytics.js` on every page, after `cookie-consent.js`:

```html
<script src="/js/cookie-consent.js"></script>
<script src="/js/analytics.js"></script>
```

---

## Phase 3 — Funnel Events

**Goal:** Understand where users drop off before they start coloring.

**Files:** `index.html`, `js/app.js`, category pages

### 3A — Category Selected (Homepage → Category)

**In `index.html`**, add `data-category` and `data-source` attributes to every category card link, then attach a click listener in `app.js`:

```html
<!-- Example category card -->
<a href="/categories/animals.html" class="category-card" data-category="animals" data-source="category_grid">
  Animals
</a>

<!-- Hero CTA -->
<a href="/categories/animals.html" data-category="animals" data-source="hero_cta">Start Coloring</a>
```

```js
// In app.js — homepage init
document.querySelectorAll('[data-category]').forEach(link => {
  link.addEventListener('click', () => {
    trackCategorySelected(link.dataset.category, link.dataset.source || 'unknown');
  });
});
```

**What this tells you:** Which categories are most popular. Whether the hero CTA vs. browsing the grid drives more sessions.

### 3B — Image Selected (Category Page → Coloring Page)

**In `app.js`**, in `initializeCategoryPage()`, attach a click listener to each image tile as it's rendered:

```js
// When building image grid tiles:
tile.addEventListener('click', () => {
  trackImageSelected(image.id, categoryId, index);  // index = position in grid (0-based)
});
```

**What this tells you:** Which images are clicked most from thumbnails. Whether position in the grid matters (first 3 images get all clicks = users don't scroll).

### 3C — Coloring Session Start (Page Load on Coloring Page)

**In `js/coloring.js`**, at the end of `loadSVGImage()` after the SVG renders successfully:

```js
const deviceType = /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
trackColoringSessionStart(imageId, category, deviceType);
```

**What this tells you:** How many users who land on a coloring page actually get a loaded image (vs. error/bounce). Lets you calculate true funnel conversion: homepage → category → coloring session started.

---

## Phase 4 — Core Engagement Events

**Goal:** Understand what users do while coloring.

**Files:** `js/coloring.js`, `js/ui.js`, `js/coloring-mobile.js`

### 4A — First Fill

**In `js/coloring.js`**, record when the page loaded (`sessionStartTime = Date.now()`) then fire on the first `fillPath()` call:

```js
// At top of coloring.js init:
let sessionStartTime = Date.now();
let firstFillFired = false;
let fillsCount = 0;

// Inside fillPath():
fillsCount++;
if (!firstFillFired) {
  firstFillFired = true;
  trackFirstFill(currentImageId, currentCategory, Date.now() - sessionStartTime);
}
```

**What this tells you:** How long it takes users to engage. If median time-to-first-fill is >15 seconds, the UI is not obvious enough. Under 5 seconds = great discoverability.

### 4B — Fill Mode Used

**In `js/ui.js`**, fire when user switches modes — not on every fill, only when mode changes:

```js
// When gradient button clicked:
trackFillModeUsed('gradient', currentImageId);

// When pattern button clicked:
trackFillModeUsed('pattern', currentImageId);

// When a solid color is picked after being in gradient/pattern mode:
if (previousMode !== 'solid') {
  trackFillModeUsed('solid', currentImageId);
}
```

**What this tells you:** Feature adoption. If <5% of sessions ever use gradients or patterns, those panels are invisible to users on mobile and could be redesigned. If 40%+ use magic fill, it's a power feature worth making more prominent.

### 4C — Magic Fill Used

**In `js/coloring.js` and `js/coloring-mobile.js`**, in the `colorItRandomly()` function:

```js
trackMagicFillUsed(currentImageId, currentCategory);
```

**What this tells you:** Whether users want a quick auto-result. If this is heavily used, consider a "Kids Mode" that auto-fills and just lets them download.

### 4D — Undo Used

**In `js/coloring.js`**, in the undo handler — track count per session, not every undo individually:

```js
let undoCountInSession = 0;

// In undo handler:
undoCountInSession++;
trackUndoUsed(currentImageId, undoCountInSession);
```

**What this tells you:** Frustration proxy. High undo counts on specific images may mean those SVG regions are too small and users tap the wrong region repeatedly.

### 4E — Color Selected

**In `js/ui.js`**, in the color selection handler — fire on color pick, not on every fill (fills are too frequent):

```js
// When user clicks a color swatch:
trackColorSelected(colorName, hexValue, currentFillMode);
```

Track only the 24 named palette colors. Do not track gradient/pattern color changes (too noisy).

**What this tells you:** Which colors are most popular. Informs palette ordering and which colors to put on mobile's color wheel. If "red" is selected 3x more than "indigo", that's a layout decision.

---

## Phase 5 — Completion & Conversion Events

**Goal:** Track whether users finish coloring and whether that converts to downloads.

**Files:** `js/coloring.js`, `js/download.js`

### 5A — Coloring Progress Milestones

**In `js/coloring.js`**, in `updateProgress()` after every fill — calculate `filledRegions / totalRegions`:

```js
// Existing progress tracking logic already has this ratio
const ratio = filledRegions / totalRegions;
const milestones = [0.25, 0.5, 0.8, 1.0];
const milestonesFired = new Set();  // Initialize at session start

milestones.forEach(m => {
  if (ratio >= m && !milestonesFired.has(m)) {
    milestonesFired.add(m);
    const label = m === 1.0 ? '100%' : `${m * 100}%`;
    trackColoringProgress(label, currentImageId, currentCategory);
    if (m === 1.0) {
      trackColoringComplete(
        currentImageId,
        currentCategory,
        Math.round((Date.now() - sessionStartTime) / 1000),
        fillsCount
      );
    }
  }
});
```

**Why 25% too:** The gap between 25% → 50% is where most users quit. Without 25%, you can't see this drop-off.

**What this tells you:**
- If 80% of users reach 25% but only 20% reach 50%, the images are too complex or too time-consuming
- If users reach 100% but don't download, the download button is not visible enough
- `coloring_complete` with `session_duration_s` tells you how long users invest — this is your strongest engagement signal for AdSense reviewers

### 5B — Download Clicked

**In `js/download.js`** or wherever the download button handler lives:

```js
const completionPct = Math.round((filledRegions / totalRegions) * 100);
trackDownloadClicked('colored_art', currentImageId, currentCategory, completionPct);
// or 'clean_outline' for the PDF download
```

**What this tells you:** Are users downloading half-finished work (suggests they want to print and color by hand)? Are they finishing but not downloading (CTA button placement problem)?

### 5C — Clear All Confirmed

**In `js/ui.js`**, in the clear confirmation dialog handler:

```js
// User clicked "Yes, Clear"
const completionPct = Math.round((filledRegions / totalRegions) * 100);
trackClearAllConfirmed(currentImageId, currentCategory, completionPct);
```

**What this tells you:** A clear at 0–10% = accidental tap. A clear at 60–80% = frustration or starting over. High clear rates on specific images may mean those images are confusing or have bad path detection.

---

## Phase 6 — Affiliate Revenue Events

**Goal:** Know exactly which products earn clicks and from where.

**Files:** `js/affiliate-widget.js`

### 6A — Widget Impression

Fire when the widget renders (products are displayed to the user):

```js
// At end of renderAffiliateWidget(), after inserting HTML:
const shownAsins = selectedProducts.map(p => p.asin);
const pageType = detectPageType();   // see helper below
trackAffiliateWidgetImpression(currentCategory || 'all', pageType, shownAsins);
```

Helper to detect page context:

```js
function detectPageType() {
  const path = window.location.pathname;
  if (path === '/' || path === '/index.html') return 'homepage';
  if (path.startsWith('/categories/')) return 'category_page';
  if (path.startsWith('/blog/')) return 'blog';
  return 'other';
}
```

### 6B — Affiliate Click

Add to each product link's click handler in `affiliate-widget.js`:

```js
link.addEventListener('click', () => {
  trackAffiliateClick(
    product.asin,
    product.name,
    currentCategory || 'all',
    detectPageType()
  );
});
```

**Why both impression + click:** Click count alone is meaningless. A product with 2 clicks shown 1000 times (0.2% CTR) is performing worse than one with 2 clicks shown 5 times (40% CTR). You need both numbers to know what to swap out.

**What this tells you after 30 days:**
- Which products have the highest CTR → move them to position 1
- Which page type (homepage / category / blog) drives the most affiliate revenue → invest in that content type
- Whether category-specific products outperform generic "all" products → implement category filtering in `affiliate-products.js`

---

## Phase 7 — Content & Navigation Events

**Goal:** Understand session extension and blog performance.

**Files:** `js/app.js`, `js/coloring.js`, `js/coloring-mobile.js`, blog pages

### 7A — Random Button Used

**In `js/app.js`**, in the random navigation handler:

```js
// Pass which button triggered it
trackRandomUsed('header_button', resultImageId);

// On homepage hero "Surprise Me":
trackRandomUsed('homepage_hero', resultImageId);
```

**What this tells you:** If >20% of sessions use Random, it's a discovery mechanism worth prominently featuring. If <5%, it's invisible and could be relabeled.

### 7B — Next Image Confirmed

**In `js/ui.js` and `js/coloring-mobile.js`**, in the "Next" confirmation dialog:

```js
// After user clicks "Yes, Next"
trackNextImageConfirmed(currentImageId, nextImageId);
```

**What this tells you:** Session extension rate. Users who click Next are your most engaged cohort — they're choosing to stay and color more. Track how many sessions contain a "next image" event to understand repeat engagement.

### 7C — Blog Scroll Depth

**Add to each blog post page** (or a shared `blog.js` script):

```js
// Fire at 25%, 50%, 75%, 100% scroll depth
const scrollMilestones = [25, 50, 75, 100];
const scrollFired = new Set();
const postSlug = window.location.pathname.replace('/blog/', '').replace('.html', '');

window.addEventListener('scroll', () => {
  const pct = Math.round(
    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
  );
  scrollMilestones.forEach(m => {
    if (pct >= m && !scrollFired.has(m)) {
      scrollFired.add(m);
      trackBlogScrollDepth(postSlug, m);
    }
  });
}, { passive: true });
```

**What this tells you:** Which blog posts hold attention. If "benefits-of-coloring" gets 70% scroll depth but "best-crayons-for-kids" gets 20%, the product review post isn't written engagingly — yet the crayons post is where affiliate links live. This directly affects revenue.

---

## Phase 8 — Mobile-Specific Events

**Goal:** Ensure the custom color wheel and mobile layout are not frustrating users.

**Files:** `js/coloring-mobile.js`

### 8A — Orientation Change

**In `js/coloring-mobile.js`**, in the `orientationchange` or resize handler:

```js
const previousOrientation = currentOrientation;
currentOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

if (previousOrientation && previousOrientation !== currentOrientation) {
  trackOrientationChange(previousOrientation, currentImageId);
}
```

**What this tells you:** If users frequently rotate, the layout may be broken in one orientation. This is useful if you get complaints that mobile "doesn't work" — orientation data narrows it down.

---

## GA4 Dashboard Setup (After Implementation)

Once events are flowing, create these custom reports in GA4:

| Report | Dimensions | Metrics | Purpose |
|---|---|---|---|
| Funnel Overview | page_path | sessions, bounce_rate | Where users drop off |
| Most Popular Images | image_id, category | coloring_session_start count | What content to make more of |
| Feature Adoption | mode (from fill_mode_used) | event_count | Whether gradients/patterns are used |
| Completion Funnel | milestone | event_count | 25% → 50% → 80% → 100% drop-off |
| Download Conversion | type, completion_pct | event_count | Do completers download? |
| Affiliate CTR | asin, product_name, page_type | impressions vs clicks | Which products earn |
| Blog Engagement | post_slug, depth_pct | event_count | Which posts hold attention |

---

## Implementation Order

| Phase | What | Files Changed | Effort |
|---|---|---|---|
| 1 | Add GA4 tag to all pages | All HTML templates | Low — 1 hour |
| 2 | Create `js/analytics.js` | New file | Low — 30 min |
| 3 | Funnel events | `index.html`, `app.js` | Low — 1 hour |
| 4 | Core engagement events | `coloring.js`, `ui.js`, `coloring-mobile.js` | Medium — 2 hours |
| 5 | Completion & conversion events | `coloring.js`, `download.js` | Medium — 2 hours |
| 6 | Affiliate events | `affiliate-widget.js` | Low — 1 hour |
| 7 | Content & navigation events | `app.js`, blog pages | Low — 1 hour |
| 8 | Mobile-specific events | `coloring-mobile.js` | Low — 30 min |

**Total estimated effort: 9 hours across all phases.**

After 30 days of data, you will know:
- Which images and categories drive the most engagement (→ make more of those)
- Whether users finish coloring (→ image complexity calibration)
- Which affiliate products earn (→ swap out low performers)
- Whether blog posts convert to site visits and affiliate clicks (→ write more of what works)
- Whether mobile users have a worse experience (→ prioritize mobile fixes)
