/**
 * Coloring Engine
 * Handles SVG loading, path detection, and tap-to-fill functionality
 */

// Undo / Redo stacks
const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 50;

// ── Analytics tracking state ──────────────────────────────────────────────────
let _sessionStartTime = 0;
let _firstFillFired   = false;
let _fillsCount       = 0;
let _milestonesFired  = new Set();
let _undoCountInSession = 0;

function updateHistoryButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
}

function recordFill(regionId, oldFill, newFill) {
    undoStack.push({ regionId, oldFill, newFill });
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
    updateHistoryButtons();
}

function applyFillById(regionId, fill) {
    if (!coloringState.svgElement) return;
    const path = coloringState.svgElement.getElementById(regionId)
              || coloringState.svgElement.querySelector(`[id="${regionId}"]`);
    if (!path) return;
    const styleAttr = path.getAttribute('style');
    if (styleAttr && styleAttr.includes('fill:')) {
        path.style.fill = fill || 'transparent';
    } else {
        path.setAttribute('fill', fill || 'transparent');
    }
}

function initUndoRedo() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            const action = undoStack.pop();
            if (!action) return;

            // Track undo usage
            if (typeof trackUndoUsed === 'function' && coloringState.currentImage) {
                _undoCountInSession++;
                trackUndoUsed(coloringState.currentImage.id, _undoCountInSession);
            }
            if (action.type === 'clear') {
                // Restore all previous fills
                Object.entries(action.prevFills).forEach(([id, data]) => {
                    applyFillById(id, data.color || data.startColor || 'transparent');
                });
                coloringState.filledRegions = { ...action.prevFills };
            } else {
                applyFillById(action.regionId, action.oldFill);
                if (action.oldFill === 'transparent' || action.oldFill === '' || action.oldFill === null) {
                    delete coloringState.filledRegions[action.regionId];
                } else {
                    coloringState.filledRegions[action.regionId] = { type: 'solid', color: action.oldFill };
                }
            }
            redoStack.push(action);
            updateHistoryButtons();
        });
    }

    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            const action = redoStack.pop();
            if (!action) return;
            if (action.type === 'clear') {
                clearAllColors();
            } else {
                applyFillById(action.regionId, action.newFill);
                coloringState.filledRegions[action.regionId] = { type: 'solid', color: action.newFill };
            }
            undoStack.push(action);
            updateHistoryButtons();
        });
    }

    document.addEventListener('keydown', (e) => {
        const mod = e.ctrlKey || e.metaKey;
        if (!mod) return;
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undoBtn && undoBtn.click(); }
        else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redoBtn && redoBtn.click(); }
    });
}

function updateProgress() {
    const dots = document.querySelectorAll('.pdot');
    const label = document.getElementById('progress-label');
    if (!dots.length) return;

    const total = coloringState.svgElement
        ? coloringState.svgElement.querySelectorAll('path, circle, rect, polygon, ellipse').length
        : 0;
    const filled = Object.keys(coloringState.filledRegions).length;
    const pct = total > 0 ? filled / total : 0;

    // Light up dots proportionally (6 dots)
    const lit = Math.round(pct * dots.length);
    dots.forEach((d, i) => d.classList.toggle('on', i < lit));

    // Message
    if (!label) return;
    if (filled === 0)       label.textContent = 'Just started';
    else if (pct < 0.25)   label.textContent = 'Getting colorful!';
    else if (pct < 0.5)    label.textContent = 'Looking great!';
    else if (pct < 0.75)   label.textContent = 'Halfway there!';
    else if (pct < 1)      label.textContent = 'Almost done!';
    else                   label.textContent = 'Masterpiece! 🎉';

    // Analytics: fire progress milestones (25 / 50 / 80 / 100 %)
    if (coloringState.currentImage && typeof trackColoringProgress === 'function') {
        const imageId  = coloringState.currentImage.id;
        const category = coloringState.currentImage.category;
        [[0.25, '25%'], [0.5, '50%'], [0.8, '80%'], [1.0, '100%']].forEach(([threshold, label]) => {
            if (pct >= threshold && !_milestonesFired.has(label)) {
                _milestonesFired.add(label);
                trackColoringProgress(label, imageId, category);
                if (threshold === 1.0) {
                    trackColoringComplete(
                        imageId, category,
                        Math.round((Date.now() - _sessionStartTime) / 1000),
                        _fillsCount
                    );
                }
            }
        });
    }
}

// Global state for coloring
const coloringState = {
    currentImage: null,
    svgElement: null,
    fillMode: 'solid', // 'solid', 'gradient', or 'pattern'
    currentColor: '#FF0000',
    previousColor: '#FF0000',
    gradientStart: '#FF0000',
    gradientEnd: '#FF0000',
    gradientDirection: 'to bottom',
    selectedPattern: 'stripes',
    filledRegions: {},
    colorHistory: ['#FF0000'] // Track last two colors
};

/**
 * Load SVG image into canvas
 */
async function loadSVGImage(imageId) {
    const svgContent = document.querySelector('.svg-content');
    if (!svgContent) return;

    try {
        // Get image from catalog
        const image = getImageById(imageId);
        if (!image) {
            throw new Error('Image not found');
        }

        coloringState.currentImage = image;

        // Absolute path — works from any URL depth (/color/cat/slug.html is 2 levels deep)
        const svgPath = `/images/${image.category}/${image.filename}`;

        // Fetch SVG file
        const response = await fetch(svgPath);
        if (!response.ok) {
            throw new Error('Failed to load SVG');
        }

        const svgText = await response.text();

        // Clear container and insert SVG
        svgContent.innerHTML = svgText;

        // Get SVG element
        const svgElement = svgContent.querySelector('svg');
        if (!svgElement) {
            throw new Error('No SVG element found');
        }

        // Remove any inline sizing - CSS will handle it
        svgElement.removeAttribute('width');
        svgElement.removeAttribute('height');

        coloringState.svgElement = svgElement;

        // Add click handlers to all paths
        initializePaths(svgElement);

        // Background coloring removed - only dual-layer path coloring supported

        // Reset filled regions and history
        coloringState.filledRegions = {};
        undoStack.length = 0;
        redoStack.length = 0;
        updateHistoryButtons();

        // Reset analytics tracking state for this new image session
        _sessionStartTime   = Date.now();
        _firstFillFired     = false;
        _fillsCount         = 0;
        _milestonesFired    = new Set();
        _undoCountInSession = 0;

        // Update canvas title and difficulty badge
        const titleEl = document.getElementById('image-title-text');
        if (titleEl) titleEl.textContent = image.name;
        const badgeEl = document.getElementById('difficulty-badge');
        if (badgeEl) {
            badgeEl.textContent = image.difficulty
                ? image.difficulty.charAt(0).toUpperCase() + image.difficulty.slice(1)
                : 'Easy';
        }

        // Reset progress
        updateProgress();

        // Size wrapper to SVG's exact aspect ratio so it fills with no white gap
        fitWrapper(svgElement);

        // Update cursor to reflect current color
        if (typeof updateCursorColor === 'function') {
            updateCursorColor();
        }

        // Track session start
        if (typeof trackColoringSessionStart === 'function') {
            const deviceType = /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
            trackColoringSessionStart(image.id, image.category, deviceType);
        }

        console.log('SVG loaded successfully:', image.name);

    } catch (error) {
        console.error('Error loading SVG:', error);
        svgContent.innerHTML = `<p class="loading-message" style="color: red;">Error: ${error.message}<br>Could not load image. Please try another one.</p>`;
    }
}

/**
 * Resize svg-ratio-wrapper to exactly match the loaded SVG's aspect ratio.
 * This ensures the SVG fills the wrapper with zero leftover white space,
 * so the white paper and the drawing area are identical rectangles.
 */
let _wrapperObserver = null;

function fitWrapper(svgElement) {
    const wrapper = document.querySelector('.svg-ratio-wrapper');
    const container = document.querySelector('.svg-container');
    if (!wrapper || !container) return;

    const vb = svgElement && svgElement.viewBox && svgElement.viewBox.baseVal;
    const ratio = (vb && vb.width && vb.height) ? vb.width / vb.height : 1;

    function resize() {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        let w = cw, h = cw / ratio;
        if (h > ch) { h = ch; w = ch * ratio; }
        wrapper.style.width  = Math.round(w) + 'px';
        wrapper.style.height = Math.round(h) + 'px';
    }

    resize();

    // Re-fit on every container size change
    if (_wrapperObserver) _wrapperObserver.disconnect();
    _wrapperObserver = new ResizeObserver(resize);
    _wrapperObserver.observe(container);
}

/**
 * Detect if a layer is a colorable layer by analyzing all its children
 * A layer is colorable if ALL its paths have no fill and no stroke in the ORIGINAL SVG
 * (We only check attributes from the SVG file, not dynamically applied colors)
 */
function isColorableLayer(groupElement) {
    const paths = groupElement.querySelectorAll('path, circle, rect, polygon, ellipse');

    if (paths.length === 0) {
        return false; // Empty layer
    }

    // Check if ALL paths in this layer have no fill and no stroke IN THE ORIGINAL SVG
    for (let path of paths) {
        const fillAttr = path.getAttribute('fill') || '';
        const strokeAttr = path.getAttribute('stroke') || '';
        const styleAttr = path.getAttribute('style') || '';

        // Check for fills in attributes/original style only
        const hasFillInAttr = fillAttr && fillAttr !== 'none' && fillAttr !== 'transparent';

        // Extract the fill value from style attribute if it exists
        const fillStyleMatch = styleAttr.match(/(?:^|;)\s*fill\s*:\s*([^;]+)/);
        let originalStyleHasFill = false;

        if (fillStyleMatch) {
            const fillValue = fillStyleMatch[1].trim();
            // Only consider it a real fill if it's NOT transparent, none, or a user-applied color
            // User-applied colors are rgb(), rgba(), #hex, or url() patterns/gradients
            const isUserAppliedColor = fillValue.startsWith('rgb') ||
                                       fillValue.startsWith('#') ||
                                       fillValue.startsWith('url(');
            const isEmptyFill = fillValue === 'none' || fillValue === 'transparent';

            // Only mark as having fill if it's in the original SVG (not user-applied or empty)
            originalStyleHasFill = !isUserAppliedColor && !isEmptyFill;
        }

        const hasFill = hasFillInAttr || originalStyleHasFill;

        // Check for strokes (use regex to match "stroke:" not "stroke-width:", "stroke-opacity:", etc.)
        const hasStroke = strokeAttr && strokeAttr !== 'none' ||
                         (styleAttr.match(/(?:^|;)\s*stroke\s*:/) && !styleAttr.includes('stroke:none') && !styleAttr.includes('stroke: none'));

        // If ANY path has fill or stroke, this is NOT a colorable layer
        if (hasFill || hasStroke) {
            return false;
        }
    }

    // All paths have no fill and no stroke = colorable layer
    return true;
}

/**
 * Check if a path is in an outline layer (non-colorable layer)
 * Only checks ORIGINAL SVG attributes, not dynamically applied colors
 */
function isInOutlineLayer(path) {
    let current = path.parentElement;

    while (current && current.tagName !== 'svg') {
        if (current.tagName === 'g') {
            // Check if this group is a colorable layer
            if (isColorableLayer(current)) {
                return false; // This is a colorable layer
            } else {
                return true; // This is an outline layer (has fills/strokes)
            }
        }
        current = current.parentElement;
    }

    // If not in any group, check the path itself using ORIGINAL attributes only
    const fillAttr = path.getAttribute('fill') || '';
    const strokeAttr = path.getAttribute('stroke') || '';
    const styleAttr = path.getAttribute('style') || '';

    // Only check original attributes, not computed styles
    const hasFillInAttr = fillAttr && fillAttr !== 'none' && fillAttr !== 'transparent';

    // Extract the fill value from style attribute if it exists
    const fillStyleMatch = styleAttr.match(/(?:^|;)\s*fill\s*:\s*([^;]+)/);
    let originalStyleHasFill = false;

    if (fillStyleMatch) {
        const fillValue = fillStyleMatch[1].trim();
        // Only consider it a real fill if it's NOT transparent, none, or a user-applied color
        // User-applied colors are rgb(), rgba(), #hex, or url() patterns/gradients
        const isUserAppliedColor = fillValue.startsWith('rgb') ||
                                   fillValue.startsWith('#') ||
                                   fillValue.startsWith('url(');
        const isEmptyFill = fillValue === 'none' || fillValue === 'transparent';

        // Only mark as having fill if it's in the original SVG (not user-applied or empty)
        originalStyleHasFill = !isUserAppliedColor && !isEmptyFill;
    }

    const hasFill = hasFillInAttr || originalStyleHasFill;
    const hasStroke = strokeAttr && strokeAttr !== 'none' ||
                     (styleAttr.match(/(?:^|;)\s*stroke\s*:/) && !styleAttr.includes('stroke:none') && !styleAttr.includes('stroke: none'));

    return hasFill || hasStroke; // Has fill or stroke in ORIGINAL SVG = outline
}

/**
 * Initialize click handlers for all SVG paths
 */
function initializePaths(svgElement) {
    const paths = svgElement.querySelectorAll('path, circle, rect, polygon, ellipse');

    paths.forEach((path, index) => {
        // Check if this path is in an outline layer
        if (isInOutlineLayer(path)) {
            // This is an outline path - make it non-interactive
            path.style.cursor = 'default';
            path.style.pointerEvents = 'none'; // Prevent any clicks on outline
            // console.log('🚫 Outline path (non-clickable):', path.id || `path-${index}`);
            return; // Skip adding click handlers
        }

        // Ensure each colorable path has an ID
        if (!path.id) {
            path.id = `region-${index}`;
        }

        // Add click event listener
        path.addEventListener('click', (e) => {
            e.stopPropagation();
            fillPath(path);
        });

        // Add touch event listener for mobile
        path.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            fillPath(path);
        });

        // Make sure paths have a cursor pointer
        path.style.cursor = 'pointer';
    });
}

/**
 * Fill a path based on current fill mode
 */
function fillPath(path) {
    const startTime = performance.now();

    try {
        // Capture old fill for undo
        const oldFill = path.style.fill || path.getAttribute('fill') || 'transparent';

        switch (coloringState.fillMode) {
            case 'solid':
                applySolidColor(path, coloringState.currentColor);
                coloringState.filledRegions[path.id] = {
                    type: 'solid',
                    color: coloringState.currentColor
                };
                recordFill(path.id, oldFill, coloringState.currentColor);
                break;

            case 'gradient':
                applyGradient(
                    path,
                    coloringState.gradientStart,
                    coloringState.gradientEnd,
                    coloringState.svgElement,
                    coloringState.gradientDirection
                );
                coloringState.filledRegions[path.id] = {
                    type: 'gradient',
                    startColor: coloringState.gradientStart,
                    endColor: coloringState.gradientEnd,
                    direction: coloringState.gradientDirection
                };
                recordFill(path.id, oldFill, coloringState.gradientStart);
                break;

            case 'pattern':
                applyPattern(
                    path,
                    coloringState.selectedPattern,
                    coloringState.currentColor,
                    coloringState.svgElement
                );
                coloringState.filledRegions[path.id] = {
                    type: 'pattern',
                    pattern: coloringState.selectedPattern,
                    color: coloringState.currentColor
                };
                recordFill(path.id, oldFill, coloringState.currentColor);
                break;
        }

        // Analytics: first fill and fill count
        _fillsCount++;
        if (!_firstFillFired && typeof trackFirstFill === 'function') {
            _firstFillFired = true;
            trackFirstFill(
                coloringState.currentImage ? coloringState.currentImage.id : '',
                coloringState.currentImage ? coloringState.currentImage.category : '',
                Date.now() - _sessionStartTime
            );
        }

        // Update progress pill
        updateProgress();

        // Log performance (should be < 100ms)
        const endTime = performance.now();
        const fillTime = endTime - startTime;
        if (fillTime > 100) {
            console.warn(`Fill took ${fillTime}ms (target: <100ms)`);
        }

    } catch (error) {
        console.error('Error filling path:', error);
    }
}

// Background coloring removed - only dual-layer SVG path coloring is supported

/**
 * Array of 24 palette colors for random coloring
 */
const PALETTE_COLORS = [
    '#FF0000', '#FF6347', '#FFC0CB', '#FFCBA4',  // Reds/Pinks/Peach
    '#FFA500', '#FFFF00', '#FFD700', '#F5DEB3',  // Oranges/Yellows/Tan
    '#00FF00', '#32CD32', '#228B22', '#90EE90',  // Greens
    '#0000FF', '#87CEEB', '#008B8B', '#191970',  // Blues/Teals/Navy
    '#800080', '#4B0082', '#FF69B4', '#DDA0DD',  // Purples/Pinks
    '#8B4513', '#D2691E', '#808080', '#FFFFFF'   // Earth/Neutrals
];

/**
 * Randomly color all colorable regions
 */
function colorItRandomly() {
    if (!coloringState.svgElement) {
        console.warn('No SVG loaded');
        return;
    }

    // Track magic fill use
    if (typeof trackMagicFillUsed === 'function' && coloringState.currentImage) {
        trackMagicFillUsed(coloringState.currentImage.id, coloringState.currentImage.category);
    }

    const paths = coloringState.svgElement.querySelectorAll('path, circle, rect, polygon, ellipse');
    let coloredCount = 0;

    paths.forEach((path) => {
        // Skip outline paths (non-colorable)
        if (isInOutlineLayer(path)) {
            return;
        }

        // Pick a random color from the palette
        const randomColor = PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)];

        // Apply the color
        applySolidColor(path, randomColor);

        // Track the filled region
        if (!path.id) {
            path.id = `region-${coloredCount}`;
        }
        coloringState.filledRegions[path.id] = {
            type: 'solid',
            color: randomColor
        };

        coloredCount++;
    });

    console.log(`Randomly colored ${coloredCount} regions`);
}

/**
 * Clear all colors from the image
 */
function clearAllColors() {
    if (!coloringState.svgElement) return;

    // Record the clear action for undo
    const prevFills = { ...coloringState.filledRegions };
    undoStack.push({ type: 'clear', prevFills });
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
    updateHistoryButtons();

    const paths = coloringState.svgElement.querySelectorAll('path, circle, rect, polygon, ellipse');

    paths.forEach(path => {
        // Check if this is an outline path - don't clear it
        if (isInOutlineLayer(path)) {
            return; // Don't clear outline paths
        }

        // Reset colorable paths only
        const styleAttr = path.getAttribute('style') || '';
        const fillAttr = path.getAttribute('fill');

        // Remove fill from style attribute and set to transparent
        if (styleAttr && styleAttr.includes('fill')) {
            path.style.fill = 'transparent';
        }

        // Also clear the fill attribute
        if (fillAttr) {
            path.setAttribute('fill', 'transparent');
        }

        // If no style or fill attribute exists, set fill to transparent
        if (!styleAttr && !fillAttr) {
            path.setAttribute('fill', 'transparent');
        }
    });

    // Clear any gradients and patterns from defs
    const defs = coloringState.svgElement.querySelector('defs');
    if (defs) {
        defs.innerHTML = '';
    }

    // Reset filled regions
    coloringState.filledRegions = {};
    updateProgress();
}

/**
 * Get current SVG as data URL for download
 */
function getSVGDataURL() {
    if (!coloringState.svgElement) return null;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(coloringState.svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    return URL.createObjectURL(svgBlob);
}

/**
 * Build the canonical clean URL for a coloring image.
 * "animals-elephant" -> "https://magicpencil.fun/color/animals/elephant.html"
 */
function getCleanUrl(imageData) {
    const slug = imageData.id.replace(imageData.category + '-', '');
    return `https://magicpencil.fun/color/${imageData.category}/${slug}.html`;
}

/**
 * Update Schema.org structured data for coloring page
 */
function updateColoringPageSchemas(imageData) {
    const categoryMeta = getCategoryMetadata(imageData.category);
    const categoryInfo = getCategoryInfo(imageData.category);

    // Update ImageObject Schema
    const imageSchema = document.getElementById('image-schema');
    if (imageSchema) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "ImageObject",
            "name": imageData.name,
            "contentUrl": `https://magicpencil.fun/images/${imageData.category}/${imageData.filename}`,
            "description": `Free ${imageData.name} coloring page. Color this ${imageData.difficulty} difficulty image online. ${categoryMeta.description}`,
            "uploadDate": new Date().toISOString().split('T')[0],
            "license": "https://magicpencil.fun/privacy-policy.html"
        };
        imageSchema.textContent = JSON.stringify(schema, null, 2);
    }

    // Update BreadcrumbList Schema
    const breadcrumbSchema = document.getElementById('breadcrumb-schema');
    if (breadcrumbSchema) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://magicpencil.fun/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": categoryInfo.name,
                    "item": `https://magicpencil.fun/categories/${imageData.category}.html`
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": imageData.name,
                    "item": getCleanUrl(imageData)
                }
            ]
        };
        breadcrumbSchema.textContent = JSON.stringify(schema, null, 2);
    }

    // Update page title
    document.title = `${imageData.name} Coloring Page - ${categoryInfo.name} | MagicPencil`;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content',
            `Free ${imageData.name} coloring page. Color this ${imageData.difficulty} difficulty image online with tap-to-fill, gradients, and patterns. Perfect for kids!`);
    }

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        metaKeywords.setAttribute('content',
            `${imageData.name.toLowerCase()} coloring page, ${imageData.category} coloring, free coloring pages, online coloring for kids, ${categoryMeta.keywords}`);
    }

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content',
            `Free ${imageData.name} Coloring Page - ${categoryInfo.name} | MagicPencil`);
    }

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
        ogDesc.setAttribute('content',
            `Color this ${imageData.difficulty} difficulty ${imageData.name} coloring page online. Tap-to-fill with colors, gradients, and patterns. Free for kids!`);
    }

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
        ogUrl.setAttribute('content', getCleanUrl(imageData));
    }

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
        ogImage.setAttribute('content',
            `https://magicpencil.fun/images/${imageData.category}/${imageData.filename}`);
    }

    // Update canonical URL to clean URL
    const canonicalTag = document.getElementById('canonical-tag');
    if (canonicalTag) {
        canonicalTag.href = getCleanUrl(imageData);
    }
}

/**
 * Initialize coloring page on load
 */
function initializeColoringPage() {
    console.log('Initializing coloring page...');

    // Generated pages expose image ID via data attribute on <body>.
    // Legacy coloring.html falls back to the ?image= URL param.
    const imageId = document.body.dataset.imageId
        || new URLSearchParams(window.location.search).get('image');

    console.log('Image ID:', imageId);

    // Wire up undo/redo buttons
    initUndoRedo();

    if (imageId) {
        const imageData = getImageById(imageId);

        // Update canonical to clean URL (no-op on generated pages where it's already baked in)
        if (imageData) {
            const canonicalTag = document.getElementById('canonical-tag');
            if (canonicalTag) {
                canonicalTag.href = getCleanUrl(imageData);
            }
            updateColoringPageSchemas(imageData);
        }

        loadSVGImage(imageId);
    } else {
        // No image ID — load a random image (only happens on bare coloring.html)
        const randomImage = getRandomImage();
        console.log('Random image selected:', randomImage);
        if (randomImage) {
            loadSVGImage(randomImage.id);
            // Use root-relative path (not full URL) so replaceState works on localhost too
            const slug = randomImage.id.replace(randomImage.category + '-', '');
            const cleanPath = `/color/${randomImage.category}/${slug}.html`;
            window.history.replaceState({}, '', cleanPath);

            const canonicalTag = document.getElementById('canonical-tag');
            if (canonicalTag) {
                canonicalTag.href = cleanUrl;
            }

            updateColoringPageSchemas(randomImage);
        } else {
            const container = document.getElementById('svg-container');
            if (container) {
                container.innerHTML = '<p class="loading-message" style="color: red;">No images available. Please add SVG files to the images directory.</p>';
            }
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.classList.contains('coloring-page')) {
            initializeColoringPage();
        }
    });
} else {
    if (document.body.classList.contains('coloring-page')) {
        initializeColoringPage();
    }
}
