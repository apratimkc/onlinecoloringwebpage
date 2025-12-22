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

        // Initialize background click handler
        initializeBackground();

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
        // Skip outline paths (non-colorable paths with black fill)
        const fill = path.getAttribute('fill');
        const computedFill = fill || window.getComputedStyle(path).fill;

        // Check if this is an outline path (black fill: #000000, #000, rgb(0,0,0), or black)
        const isOutline = fill === '#000000' ||
                         fill === '#000' ||
                         fill === 'black' ||
                         fill === 'rgb(0, 0, 0)' ||
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

/**
 * Initialize background click handler
 */
function initializeBackground() {
    const wrapper = document.querySelector('.svg-ratio-wrapper');
    const svgContent = document.querySelector('.svg-content');

    if (!wrapper || !svgContent) {
        console.error('Wrapper or SVG content not found in initializeBackground');
        return;
    }

    // Add click event listener to the wrapper
    wrapper.addEventListener('click', (e) => {
        // Check if click target is NOT an SVG element (path, circle, etc.)
        const clickedElement = e.target;
        const isSVGPath = clickedElement.tagName === 'path' ||
                         clickedElement.tagName === 'circle' ||
                         clickedElement.tagName === 'rect' ||
                         clickedElement.tagName === 'polygon' ||
                         clickedElement.tagName === 'ellipse';

        // If not clicking on SVG path, it's a background click
        if (!isSVGPath) {
            fillBackground();
        }
    });

    // Add touch event listener for mobile
    wrapper.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const touchedElement = document.elementFromPoint(touch.clientX, touch.clientY);

        const isSVGPath = touchedElement && (
            touchedElement.tagName === 'path' ||
            touchedElement.tagName === 'circle' ||
            touchedElement.tagName === 'rect' ||
            touchedElement.tagName === 'polygon' ||
            touchedElement.tagName === 'ellipse'
        );

        if (!isSVGPath) {
            e.preventDefault();
            fillBackground();
        }
    });
}

/**
 * Fill the background with current color
 */
function fillBackground() {
    const background = document.getElementById('svg-background');
    if (!background) {
        console.error('Background element not found');
        return;
    }

    const startTime = performance.now();

    try {
        switch (coloringState.fillMode) {
            case 'solid':
                background.style.backgroundColor = coloringState.currentColor;
                coloringState.filledRegions['background'] = {
                    type: 'solid',
                    color: coloringState.currentColor
                };
                break;

            case 'gradient':
                const gradient = `linear-gradient(${coloringState.gradientDirection}, ${coloringState.gradientStart}, ${coloringState.gradientEnd})`;
                background.style.background = gradient;
                coloringState.filledRegions['background'] = {
                    type: 'gradient',
                    startColor: coloringState.gradientStart,
                    endColor: coloringState.gradientEnd,
                    direction: coloringState.gradientDirection
                };
                break;

            case 'pattern':
                // Create pattern background (simplified CSS version)
                const color = coloringState.currentColor;
                let patternCSS = '';

                switch (coloringState.selectedPattern) {
                    case 'stripes':
                        patternCSS = `repeating-linear-gradient(0deg, ${color}, ${color} 10px, white 10px, white 20px)`;
                        break;
                    case 'dots':
                        patternCSS = `radial-gradient(circle, ${color} 2px, transparent 2px)`;
                        background.style.backgroundSize = '20px 20px';
                        break;
                    case 'checkerboard':
                        patternCSS = `
                            linear-gradient(45deg, ${color} 25%, transparent 25%),
                            linear-gradient(-45deg, ${color} 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, ${color} 75%),
                            linear-gradient(-45deg, transparent 75%, ${color} 75%)`;
                        background.style.backgroundSize = '40px 40px';
                        background.style.backgroundPosition = '0 0, 0 20px, 20px -20px, -20px 0px';
                        break;
                    case 'hearts':
                    case 'stars':
                        // For hearts/stars, use stripes as fallback
                        patternCSS = `repeating-linear-gradient(0deg, ${color}, ${color} 10px, white 10px, white 20px)`;
                        break;
                }

                background.style.background = patternCSS;
                coloringState.filledRegions['background'] = {
                    type: 'pattern',
                    pattern: coloringState.selectedPattern,
                    color: coloringState.currentColor
                };
                break;
        }

        // Log performance
        const endTime = performance.now();
        const fillTime = endTime - startTime;
        if (fillTime > 100) {
            console.warn(`Background fill took ${fillTime}ms (target: <100ms)`);
        }

    } catch (error) {
        console.error('Error filling background:', error);
    }
}

/**
 * Clear all colors from the image
 */
function clearAllColors() {
    if (!coloringState.svgElement) return;

    const paths = coloringState.svgElement.querySelectorAll('path, circle, rect, polygon, ellipse');

    paths.forEach(path => {
        path.setAttribute('fill', 'transparent');
    });

    // Clear any gradients and patterns from defs
    const defs = coloringState.svgElement.querySelector('defs');
    if (defs) {
        defs.innerHTML = '';
    }

    // Reset background to white
    const background = document.getElementById('svg-background');
    if (background) {
        background.style.background = '#FFFFFF';
        background.style.backgroundColor = '#FFFFFF';
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
