/**
 * Coloring Engine
 * Handles SVG loading, path detection, and tap-to-fill functionality
 */

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

        // Construct path to SVG file
        const svgPath = `images/${image.category}/${image.filename}`;

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

        // Reset filled regions
        coloringState.filledRegions = {};

        // Update cursor to reflect current color
        if (typeof updateCursorColor === 'function') {
            updateCursorColor();
        }

        console.log('SVG loaded successfully:', image.name);

    } catch (error) {
        console.error('Error loading SVG:', error);
        svgContent.innerHTML = `<p class="loading-message" style="color: red;">Error: ${error.message}<br>Could not load image. Please try another one.</p>`;
    }
}

/**
 * Initialize click handlers for all SVG paths
 */
function initializePaths(svgElement) {
    const paths = svgElement.querySelectorAll('path, circle, rect, polygon, ellipse');

    paths.forEach((path, index) => {
        // Get fill value from both attribute and computed style
        const fillAttr = path.getAttribute('fill');
        const styleAttr = path.getAttribute('style') || '';
        const computedStyle = window.getComputedStyle(path);
        const computedFill = computedStyle.fill;

        // Check if this is an outline path (black fill)
        const isOutline = fillAttr === '#000000' ||
                         fillAttr === '#000' ||
                         fillAttr === 'black' ||
                         fillAttr === 'rgb(0, 0, 0)' ||
                         styleAttr.includes('fill:#000000') ||
                         styleAttr.includes('fill:black') ||
                         styleAttr.includes('fill:#000') ||
                         computedFill === 'rgb(0, 0, 0)';

        if (isOutline) {
            // This is an outline path - make it non-interactive
            path.style.cursor = 'default';
            path.style.pointerEvents = 'none'; // Prevent any clicks on outline
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
        switch (coloringState.fillMode) {
            case 'solid':
                applySolidColor(path, coloringState.currentColor);
                coloringState.filledRegions[path.id] = {
                    type: 'solid',
                    color: coloringState.currentColor
                };
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
                break;
        }

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
 * Clear all colors from the image
 */
function clearAllColors() {
    if (!coloringState.svgElement) return;

    const paths = coloringState.svgElement.querySelectorAll('path, circle, rect, polygon, ellipse');

    paths.forEach(path => {
        // Reset colorable paths - use style.fill for paths with style attribute
        const styleAttr = path.getAttribute('style');
        if (styleAttr && styleAttr.includes('fill:')) {
            path.style.fill = 'transparent';
        } else {
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
 * Initialize coloring page on load
 */
function initializeColoringPage() {
    console.log('Initializing coloring page...');

    // Get image ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const imageId = urlParams.get('image');

    console.log('Image ID from URL:', imageId);

    if (imageId) {
        loadSVGImage(imageId);
    } else {
        // Load random image if no ID specified
        const randomImage = getRandomImage();
        console.log('Random image selected:', randomImage);
        if (randomImage) {
            loadSVGImage(randomImage.id);
            // Update URL without reloading
            window.history.replaceState({}, '', `coloring.html?image=${randomImage.id}`);
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
