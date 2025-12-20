/**
 * Color Management System
 * Handles colors, gradients, and patterns
 */

// 12 Basic Colors
const COLORS = {
    red: '#FF0000',
    orange: '#FFA500',
    yellow: '#FFFF00',
    green: '#00FF00',
    blue: '#0000FF',
    purple: '#800080',
    pink: '#FFC0CB',
    brown: '#8B4513',
    black: '#000000',
    white: '#FFFFFF',
    gray: '#808080',
    lightblue: '#87CEEB'
};

const COLOR_NAMES = [
    { id: 'red', name: 'Red', hex: '#FF0000' },
    { id: 'orange', name: 'Orange', hex: '#FFA500' },
    { id: 'yellow', name: 'Yellow', hex: '#FFFF00' },
    { id: 'green', name: 'Green', hex: '#00FF00' },
    { id: 'blue', name: 'Blue', hex: '#0000FF' },
    { id: 'purple', name: 'Purple', hex: '#800080' },
    { id: 'pink', name: 'Pink', hex: '#FFC0CB' },
    { id: 'brown', name: 'Brown', hex: '#8B4513' },
    { id: 'black', name: 'Black', hex: '#000000' },
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'gray', name: 'Gray', hex: '#808080' },
    { id: 'lightblue', name: 'Light Blue', hex: '#87CEEB' }
];

/**
 * Apply solid color to SVG path
 */
function applySolidColor(path, color) {
    path.setAttribute('fill', color);
}

/**
 * Create and apply gradient to SVG path
 */
function applyGradient(path, startColor, endColor, svgElement, direction = 'to bottom') {
    const gradientId = `gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get or create defs element
    let defs = svgElement.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgElement.insertBefore(defs, svgElement.firstChild);
    }

    // Map CSS direction to SVG gradient coordinates
    const directionMap = {
        'to bottom': { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
        'to top': { x1: '0%', y1: '100%', x2: '0%', y2: '0%' },
        'to right': { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
        'to left': { x1: '100%', y1: '0%', x2: '0%', y2: '0%' },
        'to bottom right': { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
        'to bottom left': { x1: '100%', y1: '0%', x2: '0%', y2: '100%' },
        'to top right': { x1: '0%', y1: '100%', x2: '100%', y2: '0%' },
        'to top left': { x1: '100%', y1: '100%', x2: '0%', y2: '0%' }
    };

    const coords = directionMap[direction] || directionMap['to bottom'];

    // Create linear gradient
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', coords.x1);
    gradient.setAttribute('y1', coords.y1);
    gradient.setAttribute('x2', coords.x2);
    gradient.setAttribute('y2', coords.y2);

    // Create stops
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', startColor);

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', endColor);

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);

    // Apply gradient to path
    path.setAttribute('fill', `url(#${gradientId})`);
}

/**
 * Create and apply pattern to SVG path
 */
function applyPattern(path, patternType, color, svgElement) {
    const patternId = `pattern-${patternType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get or create defs element
    let defs = svgElement.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgElement.insertBefore(defs, svgElement.firstChild);
    }

    // Create pattern element
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', patternId);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '20');
    pattern.setAttribute('height', '20');

    // Create pattern content based on type
    switch (patternType) {
        case 'stripes':
            // Horizontal stripes
            const rect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect1.setAttribute('width', '20');
            rect1.setAttribute('height', '20');
            rect1.setAttribute('fill', 'white');

            const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line1.setAttribute('x1', '0');
            line1.setAttribute('y1', '5');
            line1.setAttribute('x2', '20');
            line1.setAttribute('y2', '5');
            line1.setAttribute('stroke', color);
            line1.setAttribute('stroke-width', '3');

            const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line2.setAttribute('x1', '0');
            line2.setAttribute('y1', '15');
            line2.setAttribute('x2', '20');
            line2.setAttribute('y2', '15');
            line2.setAttribute('stroke', color);
            line2.setAttribute('stroke-width', '3');

            pattern.appendChild(rect1);
            pattern.appendChild(line1);
            pattern.appendChild(line2);
            break;

        case 'dots':
            // Polka dots
            const rectDots = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectDots.setAttribute('width', '20');
            rectDots.setAttribute('height', '20');
            rectDots.setAttribute('fill', 'white');

            const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle1.setAttribute('cx', '5');
            circle1.setAttribute('cy', '5');
            circle1.setAttribute('r', '3');
            circle1.setAttribute('fill', color);

            const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle2.setAttribute('cx', '15');
            circle2.setAttribute('cy', '15');
            circle2.setAttribute('r', '3');
            circle2.setAttribute('fill', color);

            pattern.appendChild(rectDots);
            pattern.appendChild(circle1);
            pattern.appendChild(circle2);
            break;

        case 'checkerboard':
            // Checkerboard pattern
            const rectCheck1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectCheck1.setAttribute('x', '0');
            rectCheck1.setAttribute('y', '0');
            rectCheck1.setAttribute('width', '10');
            rectCheck1.setAttribute('height', '10');
            rectCheck1.setAttribute('fill', color);

            const rectCheck2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectCheck2.setAttribute('x', '10');
            rectCheck2.setAttribute('y', '10');
            rectCheck2.setAttribute('width', '10');
            rectCheck2.setAttribute('height', '10');
            rectCheck2.setAttribute('fill', color);

            const rectCheck3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectCheck3.setAttribute('x', '10');
            rectCheck3.setAttribute('y', '0');
            rectCheck3.setAttribute('width', '10');
            rectCheck3.setAttribute('height', '10');
            rectCheck3.setAttribute('fill', 'white');

            const rectCheck4 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectCheck4.setAttribute('x', '0');
            rectCheck4.setAttribute('y', '10');
            rectCheck4.setAttribute('width', '10');
            rectCheck4.setAttribute('height', '10');
            rectCheck4.setAttribute('fill', 'white');

            pattern.appendChild(rectCheck1);
            pattern.appendChild(rectCheck2);
            pattern.appendChild(rectCheck3);
            pattern.appendChild(rectCheck4);
            break;

        case 'hearts':
            // Heart pattern
            const rectHearts = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectHearts.setAttribute('width', '20');
            rectHearts.setAttribute('height', '20');
            rectHearts.setAttribute('fill', 'white');

            const textHeart = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textHeart.setAttribute('x', '5');
            textHeart.setAttribute('y', '15');
            textHeart.setAttribute('font-size', '12');
            textHeart.setAttribute('fill', color);
            textHeart.textContent = '♥';

            pattern.appendChild(rectHearts);
            pattern.appendChild(textHeart);
            break;

        case 'stars':
            // Star pattern
            const rectStars = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectStars.setAttribute('width', '20');
            rectStars.setAttribute('height', '20');
            rectStars.setAttribute('fill', 'white');

            const textStar = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textStar.setAttribute('x', '5');
            textStar.setAttribute('y', '15');
            textStar.setAttribute('font-size', '12');
            textStar.setAttribute('fill', color);
            textStar.textContent = '★';

            pattern.appendChild(rectStars);
            pattern.appendChild(textStar);
            break;
    }

    defs.appendChild(pattern);

    // Apply pattern to path
    path.setAttribute('fill', `url(#${patternId})`);
}

/**
 * Get color by hex value
 */
function getColorByHex(hex) {
    return COLOR_NAMES.find(c => c.hex === hex) || { id: 'custom', name: 'Custom', hex };
}
