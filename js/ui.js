/**
 * UI Interactions
 * Handles user interface interactions and state management
 */

/**
 * Update cursor to show pencil with current color
 */
function updateCursorColor() {
    const svgContainer = document.querySelector('.svg-container svg');
    if (!svgContainer) return;

    // Convert color to URL-encoded format (e.g., #FF0000 -> %23FF0000)
    const color = coloringState.currentColor;
    const encodedColor = color.replace('#', '%23');

    // SVG pencil cursor with dynamic color
    const cursorSVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 64 64"><path fill="${encodedColor}" d="M62.828,12.482L51.514,1.168c-1.562-1.562-4.093-1.562-5.657,0.001l-45.255,45.255C-0.006,47.031,0,47.996,0,47.996l0.001,13.999c0,1.105,0.896,2,1.999,2.001h4.99l9.01,0s0.963,0.008,1.572-0.602l45.256-45.257C64.392,16.575,64.392,14.046,62.828,12.482z"/></svg>`;

    // Apply cursor to SVG and all fillable elements
    svgContainer.style.cursor = `url('${cursorSVG}') 0 32, auto`;

    const fillableElements = svgContainer.querySelectorAll('path, circle, rect, polygon, ellipse');
    fillableElements.forEach(element => {
        element.style.cursor = `url('${cursorSVG}') 0 32, pointer`;
    });
}

/**
 * Get contrasting border color (black or white) for a given color
 */
function getContrastingBorderColor(hexColor) {
    // Handle short hex codes
    if (!hexColor || hexColor.length < 7) {
        return '#000000';
    }

    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    // Calculate luminance (perceived brightness)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark colors, black for light colors
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Update pencil indicator color
 */
function updatePencilIndicator() {
    const pencilIcon = document.getElementById('pencil-icon');
    if (!pencilIcon) return;

    const color = coloringState.currentColor;

    switch (coloringState.fillMode) {
        case 'solid':
            // Background = static white, Border & pencil body = selected color
            pencilIcon.style.backgroundColor = '#FFFFFF';
            pencilIcon.style.background = '#FFFFFF';
            pencilIcon.style.color = color;  // SVG pencil body uses selected color
            pencilIcon.style.border = `3px solid ${color}`;
            break;

        case 'gradient':
            // Background = static white, Border & pencil body = gradient
            pencilIcon.style.backgroundColor = '#FFFFFF';
            pencilIcon.style.background = '#FFFFFF';
            const gradient = `linear-gradient(${coloringState.gradientDirection}, ${coloringState.gradientStart}, ${coloringState.gradientEnd})`;
            // For gradient, we'll use the start color for solid parts
            pencilIcon.style.color = coloringState.gradientStart;
            pencilIcon.style.border = `3px solid ${coloringState.gradientStart}`;
            break;

        case 'pattern':
            // Background = static white, Border & pencil body = selected color
            pencilIcon.style.backgroundColor = '#FFFFFF';
            pencilIcon.style.background = '#FFFFFF';
            pencilIcon.style.color = coloringState.currentColor;
            pencilIcon.style.border = `3px solid ${coloringState.currentColor}`;
            break;
    }

    // Update cursor color as well
    updateCursorColor();
}

/**
 * Get color name from hex value
 */
function getColorName(hex) {
    const colorNames = {
        '#FF0000': 'Red',
        '#FFA500': 'Orange',
        '#FFFF00': 'Yellow',
        '#00FF00': 'Green',
        '#0000FF': 'Blue',
        '#800080': 'Purple',
        '#FFC0CB': 'Pink',
        '#8B4513': 'Brown',
        '#000000': 'Black',
        '#FFFFFF': 'White',
        '#808080': 'Gray',
        '#87CEEB': 'Light Blue'
    };
    return colorNames[hex] || hex;
}

/**
 * Update pattern preview
 */
function updatePatternPreview() {
    const patternPreview = document.getElementById('pattern-preview');
    const patternColorLabel = document.getElementById('pattern-color-label');

    if (patternColorLabel) {
        patternColorLabel.textContent = getColorName(coloringState.currentColor);
    }

    if (patternPreview) {
        updatePatternPreviewDisplay();
    }
}

/**
 * Update pattern preview display
 */
function updatePatternPreviewDisplay() {
    const patternPreview = document.getElementById('pattern-preview');
    if (!patternPreview) return;

    const color = coloringState.currentColor;

    switch (coloringState.selectedPattern) {
        case 'stripes':
            patternPreview.style.background = `repeating-linear-gradient(0deg, ${color}, ${color} 5px, white 5px, white 10px)`;
            patternPreview.innerHTML = '';
            break;
        case 'dots':
            patternPreview.style.background = `radial-gradient(circle, ${color} 3px, white 3px)`;
            patternPreview.style.backgroundSize = '20px 20px';
            patternPreview.innerHTML = '';
            break;
        case 'checkerboard':
            patternPreview.style.background = `
                linear-gradient(45deg, ${color} 25%, transparent 25%),
                linear-gradient(-45deg, ${color} 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, ${color} 75%),
                linear-gradient(-45deg, transparent 75%, ${color} 75%)`;
            patternPreview.style.backgroundSize = '20px 20px';
            patternPreview.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
            patternPreview.innerHTML = '';
            break;
        case 'hearts':
            patternPreview.innerHTML = '<div style="padding: 20px; font-size: 24px; color: ' + color + ';">♥ ♥ ♥</div>';
            patternPreview.style.background = 'white';
            break;
        case 'stars':
            patternPreview.innerHTML = '<div style="padding: 20px; font-size: 24px; color: ' + color + ';">★ ★ ★</div>';
            patternPreview.style.background = 'white';
            break;
    }
}

/**
 * Update all gradient buttons with current color transition
 */
function updateGradientButtons() {
    const gradientButtons = document.querySelectorAll('.gradient-btn');
    const fromColor = coloringState.previousColor || '#FFFFFF';
    const toColor = coloringState.currentColor;

    gradientButtons.forEach((btn, index) => {
        const direction = btn.dataset.direction;
        // Update button's gradient to show transition
        btn.style.background = `linear-gradient(${direction}, ${fromColor}, ${toColor})`;
        // Update data attributes
        btn.dataset.from = fromColor;
        btn.dataset.to = toColor;
    });
}

/**
 * Initialize color palette buttons
 */
function initializeColorPalette() {
    const colorButtons = document.querySelectorAll('.color-btn');

    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            colorButtons.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Update color history
            const newColor = btn.dataset.color;

            // Update gradient colors based on history
            if (coloringState.colorHistory.length >= 2) {
                coloringState.gradientStart = coloringState.colorHistory[coloringState.colorHistory.length - 1];
                coloringState.gradientEnd = newColor;
            } else {
                coloringState.gradientStart = coloringState.currentColor;
                coloringState.gradientEnd = newColor;
            }

            // Update previous and current color
            coloringState.previousColor = coloringState.currentColor;
            coloringState.currentColor = newColor;

            // Add to color history
            coloringState.colorHistory.push(newColor);
            if (coloringState.colorHistory.length > 2) {
                coloringState.colorHistory.shift(); // Keep only last 2
            }

            // Set to solid mode
            coloringState.fillMode = 'solid';

            // Update gradient buttons to reflect new color transition
            updateGradientButtons();

            // Update pencil indicator
            updatePencilIndicator();

            // Update pattern preview
            updatePatternPreview();
        });
    });
}

/**
 * Initialize gradient controls
 */
function initializeGradientControls() {
    const gradientButtons = document.querySelectorAll('.gradient-btn');

    gradientButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all gradient buttons
            gradientButtons.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Get gradient colors and direction from data attributes
            coloringState.gradientStart = btn.dataset.from;
            coloringState.gradientEnd = btn.dataset.to;
            coloringState.gradientDirection = btn.dataset.direction;

            // Switch to gradient mode
            coloringState.fillMode = 'gradient';

            // Remove active from color buttons and pattern buttons
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));

            // Update pencil indicator
            updatePencilIndicator();
        });
    });
}

/**
 * Initialize pattern controls
 */
function initializePatternControls() {
    const patternButtons = document.querySelectorAll('.pattern-btn');

    patternButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all pattern buttons
            patternButtons.forEach(b => b.classList.remove('active'));

            // Add active class
            btn.classList.add('active');

            // Update selected pattern
            coloringState.selectedPattern = btn.dataset.pattern;

            // Switch to pattern mode
            coloringState.fillMode = 'pattern';

            // Remove active from color buttons
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));

            // Remove active from gradient buttons
            document.querySelectorAll('.gradient-btn').forEach(b => b.classList.remove('active'));

            // Update pencil indicator
            updatePencilIndicator();

            // Update pattern preview
            updatePatternPreview();
        });
    });

    // Set first pattern button as active by default
    if (patternButtons.length > 0) {
        patternButtons[0].classList.add('active');
    }

    // Initial preview
    updatePatternPreview();
}

/**
 * Initialize Clear button
 */
function initializeClearButton() {
    const clearBtn = document.getElementById('clear-btn');
    if (!clearBtn) return;

    clearBtn.addEventListener('click', () => {
        showDialog(
            'Clear All Colors',
            'Are you sure you want to clear all colors? This cannot be undone.',
            () => {
                clearAllColors();
                hideDialog();
            },
            () => {
                hideDialog();
            }
        );
    });
}

/**
 * Initialize Next Image button
 */
function initializeNextImageButton() {
    const nextImageBtn = document.getElementById('next-image-btn');
    if (!nextImageBtn) return;

    nextImageBtn.addEventListener('click', () => {
        showDialog(
            'Start New Image',
            'Start a new image? (Current work will be lost)',
            () => {
                const randomImage = getRandomImage();
                if (randomImage) {
                    window.location.href = `coloring.html?image=${randomImage.id}`;
                }
                hideDialog();
            },
            () => {
                hideDialog();
            }
        );
    });
}

/**
 * Initialize Advanced Options Toggle (Mobile)
 */
function initializeAdvancedToggle() {
    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedContent = document.getElementById('advanced-content');

    if (!advancedToggle || !advancedContent) return;

    advancedToggle.addEventListener('click', () => {
        advancedContent.classList.toggle('open');

        if (advancedContent.classList.contains('open')) {
            advancedToggle.textContent = 'Advanced Options ▲';
        } else {
            advancedToggle.textContent = 'Advanced Options ▼';
        }
    });
}

/**
 * Show dialog/modal
 */
function showDialog(title, message, onConfirm, onCancel) {
    const dialogOverlay = document.getElementById('dialog-overlay');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogMessage = document.getElementById('dialog-message');
    const dialogConfirm = document.getElementById('dialog-confirm');
    const dialogCancelBtn = document.getElementById('dialog-cancel');

    if (!dialogOverlay) return;

    dialogTitle.textContent = title;
    dialogMessage.textContent = message;

    // Remove previous event listeners by cloning
    const newConfirm = dialogConfirm.cloneNode(true);
    dialogConfirm.parentNode.replaceChild(newConfirm, dialogConfirm);

    const newCancel = dialogCancelBtn.cloneNode(true);
    dialogCancelBtn.parentNode.replaceChild(newCancel, dialogCancelBtn);

    // Add new event listeners
    newConfirm.addEventListener('click', onConfirm);
    newCancel.addEventListener('click', onCancel);

    dialogOverlay.classList.add('active');
}

/**
 * Hide dialog/modal
 */
function hideDialog() {
    const dialogOverlay = document.getElementById('dialog-overlay');
    if (dialogOverlay) {
        dialogOverlay.classList.remove('active');
    }
}

/**
 * Initialize all UI components for coloring page
 */
function initializeColoringUI() {
    initializeColorPalette();
    initializeGradientControls();
    initializePatternControls();
    initializeClearButton();
    initializeNextImageButton();
    initializeAdvancedToggle();

    // Initialize gradient buttons with White → Red (default)
    updateGradientButtons();

    updatePencilIndicator();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.classList.contains('coloring-page')) {
            initializeColoringUI();
        }
    });
} else {
    if (document.body.classList.contains('coloring-page')) {
        initializeColoringUI();
    }
}
