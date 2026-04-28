/**
 * Mobile Coloring UI
 * Full 360° spinning color wheel — only the bottom half (portrait) or
 * right half (landscape) is visible; dragging spins the wheel.
 */

'use strict';

// Suppress desktop gradient-button color-tracking on mobile
window.updateGradientButtons = function () {};

// ─── Color palette (24 colors) ───────────────────────────────────────────────
const WHEEL_COLORS = [
    { hex: '#FF0000', name: 'Red' },
    { hex: '#FF6347', name: 'Coral' },
    { hex: '#FFC0CB', name: 'Pink' },
    { hex: '#FFCBA4', name: 'Peach' },
    { hex: '#FFA500', name: 'Orange' },
    { hex: '#FFFF00', name: 'Yellow' },
    { hex: '#FFD700', name: 'Gold' },
    { hex: '#F5DEB3', name: 'Tan' },
    { hex: '#00FF00', name: 'Lime' },
    { hex: '#32CD32', name: 'Green' },
    { hex: '#228B22', name: 'Forest' },
    { hex: '#90EE90', name: 'Lt Green' },
    { hex: '#0000FF', name: 'Blue' },
    { hex: '#87CEEB', name: 'Sky Blue' },
    { hex: '#008B8B', name: 'Teal' },
    { hex: '#191970', name: 'Navy' },
    { hex: '#800080', name: 'Purple' },
    { hex: '#4B0082', name: 'Indigo' },
    { hex: '#FF69B4', name: 'Hot Pink' },
    { hex: '#DDA0DD', name: 'Plum' },
    { hex: '#8B4513', name: 'Brown' },
    { hex: '#D2691E', name: 'Choc' },
    { hex: '#808080', name: 'Gray' },
    { hex: '#FFFFFF', name: 'White' },
];

// ─── Wheel state ─────────────────────────────────────────────────────────────
const wheelState = {
    rotationOffset: 0,   // global rotation of the full 360° wheel
    selectedIndex:  0,   // index of color currently at the pointer
    animFrameId:    null,
    isDragging:     false,
    startPos:       0,   // drag-start pixel (clientX portrait / clientY landscape)
    startRotation:  0,   // rotationOffset at drag start
    lastPos:        0,
    lastTime:       0,
    velocity:       0,   // rad/s (for momentum)
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isPortrait() {
    return window.matchMedia('(orientation: portrait)').matches;
}

/**
 * Geometry for the rotating wheel.
 *
 * Portrait  – center at top-centre of canvas, visible = bottom half,
 *             pointer at angle π/2 (straight down).
 * Landscape – center at left-centre of canvas, visible = right half,
 *             pointer at angle 0 (straight right).
 *
 * Canvas boundary naturally clips the non-visible half.
 */
function getWheelGeometry() {
    const canvas = document.getElementById('mob-color-wheel');
    if (!canvas) return null;
    const W = canvas.width, H = canvas.height;

    if (isPortrait()) {
        const outerR = H * 0.93;          // arc fits within canvas height
        return {
            cx: W / 2, cy: H,             // center at BOTTOM — upper half visible
            outerR,
            innerR: outerR * 0.46,
            pointerAngle: 3 * Math.PI / 2, // pointing UP (top of arch = pointer)
        };
    } else {
        // Cap to half-height so arc never overflows the top or bottom of the panel
        const outerR = Math.min(W, H / 2) * 0.88;
        return {
            cx: 0, cy: H / 2,
            outerR,
            innerR: outerR * 0.46,
            pointerAngle: 0,              // pointing right
        };
    }
}

function resizeColorWheelCanvas() {
    const canvas    = document.getElementById('mob-color-wheel');
    const wrap      = document.getElementById('mob-color-fan-wrap');
    const indicator = document.querySelector('.mob-color-indicator');
    if (!canvas || !wrap) return;
    const indH = indicator ? indicator.offsetHeight : 32;
    canvas.width  = wrap.clientWidth  || 320;
    canvas.height = Math.max((wrap.clientHeight || 180) - indH, 60);
}

// ─── Drawing ─────────────────────────────────────────────────────────────────

/**
 * Which segment is currently under the pointer?
 * Segment i spans [rotationOffset + i*seg, rotationOffset + (i+1)*seg].
 * We normalise pointerAngle into that space and floor-divide.
 */
function getColorAtPointer() {
    const geo = getWheelGeometry();
    if (!geo) return 0;
    const N        = WHEEL_COLORS.length;
    const segAngle = (2 * Math.PI) / N;

    let rel = geo.pointerAngle - wheelState.rotationOffset;
    rel = ((rel % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const idx = Math.floor(rel / segAngle) % N;
    return idx < 0 ? idx + N : idx;
}

function drawColorWheel() {
    const canvas = document.getElementById('mob-color-wheel');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const geo = getWheelGeometry();
    if (!geo) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const N        = WHEEL_COLORS.length;
    const segAngle = (2 * Math.PI) / N;
    const { cx, cy, outerR, innerR, pointerAngle } = geo;
    const selIdx   = getColorAtPointer();

    // Draw all 24 segments; the canvas boundary clips the invisible half
    for (let i = 0; i < N; i++) {
        const start  = wheelState.rotationOffset + i * segAngle;
        const end    = start + segAngle;
        const sel    = (i === selIdx);
        const curR   = sel ? outerR * 1.08 : outerR;

        ctx.beginPath();
        ctx.arc(cx, cy, curR,  start, end, false);
        ctx.arc(cx, cy, innerR, end, start, true);
        ctx.closePath();

        ctx.fillStyle = WHEEL_COLORS[i].hex;
        ctx.fill();

        ctx.strokeStyle = (WHEEL_COLORS[i].hex === '#FFFFFF')
            ? 'rgba(100,80,60,0.35)'
            : 'rgba(0,0,0,0.16)';
        ctx.lineWidth = sel ? 2 : 0.75;
        ctx.stroke();
    }

    // ── Pointer notch: small dark triangle at the outer rim pointing inward ──
    const px      = cx + outerR * Math.cos(pointerAngle);
    const py      = cy + outerR * Math.sin(pointerAngle);
    const perp    = pointerAngle + Math.PI / 2;
    const inward  = pointerAngle + Math.PI;

    ctx.beginPath();
    ctx.moveTo(px + 5 * Math.cos(perp),   py + 5 * Math.sin(perp));
    ctx.lineTo(px - 5 * Math.cos(perp),   py - 5 * Math.sin(perp));
    ctx.lineTo(px + 9 * Math.cos(inward), py + 9 * Math.sin(inward));
    ctx.closePath();
    ctx.fillStyle   = '#2d2416';
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth   = 1.5;
    ctx.fill();
    ctx.stroke();
}

// ─── Color indicator ─────────────────────────────────────────────────────────
function updateMobileColorIndicator(colorObj) {
    const dot  = document.getElementById('mob-color-dot');
    const name = document.getElementById('mob-color-name');
    if (dot)  dot.style.background = colorObj.hex;
    if (name) name.textContent     = colorObj.name;
}

// ─── Snap animation ──────────────────────────────────────────────────────────
function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function animateSnap(from, to, colorIndex) {
    const duration  = 360;
    const startTime = performance.now();

    function frame(now) {
        const t     = Math.min((now - startTime) / duration, 1);
        wheelState.rotationOffset = from + (to - from) * easeOutBack(t);
        drawColorWheel();

        if (t < 1) {
            wheelState.animFrameId = requestAnimationFrame(frame);
        } else {
            wheelState.rotationOffset = to;
            wheelState.selectedIndex  = colorIndex;
            wheelState.animFrameId    = null;
            drawColorWheel();

            const c = WHEEL_COLORS[colorIndex];
            coloringState.previousColor = coloringState.currentColor;
            coloringState.currentColor  = c.hex;
            coloringState.fillMode      = 'solid';
            updateMobileColorIndicator(c);
            if (typeof updatePatternPreview === 'function') updatePatternPreview();
        }
    }

    if (wheelState.animFrameId) cancelAnimationFrame(wheelState.animFrameId);
    wheelState.animFrameId = requestAnimationFrame(frame);
}

/**
 * Snap the wheel so the nearest color is centred at the pointer.
 */
function snapToColor() {
    const geo = getWheelGeometry();
    if (!geo) return;
    const N        = WHEEL_COLORS.length;
    const segAngle = (2 * Math.PI) / N;
    const ci       = getColorAtPointer();

    // Ideal rotationOffset that centres segment ci on the pointer
    let ideal = geo.pointerAngle - (ci + 0.5) * segAngle;
    // Pick the nearest copy (±k × 2π) to avoid spinning the long way around
    let diff  = ideal - wheelState.rotationOffset;
    diff -= Math.round(diff / (2 * Math.PI)) * (2 * Math.PI);

    animateSnap(wheelState.rotationOffset, wheelState.rotationOffset + diff, ci);
}

// ─── Momentum ────────────────────────────────────────────────────────────────
function applyMomentum() {
    let vel = wheelState.velocity;

    function frame() {
        vel *= 0.88;
        wheelState.rotationOffset += vel / 60;
        drawColorWheel();
        updateMobileColorIndicator(WHEEL_COLORS[getColorAtPointer()]);

        if (Math.abs(vel) > 0.06) {
            wheelState.animFrameId = requestAnimationFrame(frame);
        } else {
            wheelState.animFrameId = null;
            snapToColor();
        }
    }

    if (wheelState.animFrameId) cancelAnimationFrame(wheelState.animFrameId);
    wheelState.animFrameId = requestAnimationFrame(frame);
}

// ─── Touch interaction ───────────────────────────────────────────────────────
function initColorWheel() {
    resizeColorWheelCanvas();

    // Place Red (index 0) at the pointer on startup
    const geo = getWheelGeometry();
    if (geo) {
        const segAngle = (2 * Math.PI) / WHEEL_COLORS.length;
        // Segment 0 centre = rotationOffset + 0.5*seg → set equal to pointerAngle
        wheelState.rotationOffset = geo.pointerAngle - 0.5 * segAngle;
        wheelState.selectedIndex  = 0;
        coloringState.currentColor = WHEEL_COLORS[0].hex;
        coloringState.fillMode     = 'solid';
        updateMobileColorIndicator(WHEEL_COLORS[0]);
        drawColorWheel();
    }

    const canvas = document.getElementById('mob-color-wheel');
    if (!canvas) return;

    // Touch-start: cancel any running animation, record start state
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (wheelState.animFrameId) {
            cancelAnimationFrame(wheelState.animFrameId);
            wheelState.animFrameId = null;
        }
        const t = e.touches[0];
        wheelState.isDragging    = true;
        wheelState.startPos      = isPortrait() ? t.clientX : t.clientY;
        wheelState.startRotation = wheelState.rotationOffset;
        wheelState.lastPos       = wheelState.startPos;
        wheelState.lastTime      = Date.now();
        wheelState.velocity      = 0;
    }, { passive: false });

    // Touch-move: rotate wheel proportional to finger travel
    // Convention: positive drag (right / down) increases rotationOffset so the
    // arc follows the finger (physical "push" feel).
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!wheelState.isDragging) return;

        const touch = e.touches[0];
        const now   = Date.now();
        const dt    = Math.max(now - wheelState.lastTime, 1);
        const pos   = isPortrait() ? touch.clientX : touch.clientY;
        const dim   = isPortrait() ? canvas.width  : canvas.height;
        const factor = (2 * Math.PI) / dim;  // one full revolution per canvas width/height

        const total = (pos - wheelState.startPos)  * factor;
        const frame = (pos - wheelState.lastPos)   * factor;

        wheelState.rotationOffset = wheelState.startRotation + total;
        wheelState.velocity       = (frame / dt) * 1000;  // rad/s

        wheelState.lastPos  = pos;
        wheelState.lastTime = now;

        drawColorWheel();
        updateMobileColorIndicator(WHEEL_COLORS[getColorAtPointer()]);
    }, { passive: false });

    // Touch-end: flick → momentum, else snap directly
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        wheelState.isDragging = false;
        if (Math.abs(wheelState.velocity) > 1.8) {
            applyMomentum();
        } else {
            snapToColor();
        }
    }, { passive: false });

    canvas.addEventListener('touchcancel', () => {
        wheelState.isDragging = false;
        snapToColor();
    });
}

// ─── Hamburger nav ───────────────────────────────────────────────────────────
function initHamburgerMenu() {
    const hamburger = document.getElementById('mob-hamburger');
    const menu      = document.getElementById('mob-nav-menu');
    const overlay   = document.getElementById('mob-nav-overlay');
    const randomBtn = document.getElementById('mob-random-btn');
    const nextBtn   = document.getElementById('mob-next-btn');

    if (!hamburger || !menu) return;

    function openMenu()  {
        menu.classList.add('open');
        if (overlay) overlay.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
        menu.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', () =>
        menu.classList.contains('open') ? closeMenu() : openMenu());

    if (overlay) overlay.addEventListener('click', closeMenu);
    menu.querySelectorAll('.mob-nav-item').forEach(el =>
        el.addEventListener('click', closeMenu));

    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            const img = typeof getRandomImage === 'function' ? getRandomImage() : null;
            if (img) window.location.href = 'coloring-mobile.html?image=' + img.id;
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const hasProgress = Object.keys(coloringState.filledRegions || {}).length > 0;
            if (hasProgress) {
                showDialog(
                    'Start New Image',
                    'Start a new image? Current coloring will be lost.',
                    () => {
                        const img = typeof getRandomImage === 'function' ? getRandomImage() : null;
                        if (img) window.location.href = 'coloring-mobile.html?image=' + img.id;
                        hideDialog();
                    },
                    hideDialog
                );
            } else {
                const img = typeof getRandomImage === 'function' ? getRandomImage() : null;
                if (img) window.location.href = 'coloring-mobile.html?image=' + img.id;
            }
        });
    }
}

// ─── Download dropdown ───────────────────────────────────────────────────────
function initMobileDownload() {
    const btn        = document.getElementById('mob-download-btn');
    const menu       = document.getElementById('mob-download-menu');
    const coloredBtn = document.getElementById('mob-download-colored');
    const sketchBtn  = document.getElementById('mob-download-sketch');

    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
    });
    document.addEventListener('click', () => menu.classList.remove('open'));

    if (coloredBtn) coloredBtn.addEventListener('click', () => {
        if (typeof downloadImage === 'function') downloadImage();
    });
    if (sketchBtn) sketchBtn.addEventListener('click', () => {
        if (typeof downloadOriginalPDF === 'function') downloadOriginalPDF();
    });
}

// ─── Magic panel ─────────────────────────────────────────────────────────────
function initMagicPanel() {
    const tab     = document.getElementById('mob-magic-tab');
    const panel   = document.getElementById('mob-magic-panel');
    const overlay = document.getElementById('mob-panel-overlay');

    if (!tab || !panel) return;

    function openPanel() {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        tab.setAttribute('aria-expanded', 'true');
        if (overlay) overlay.classList.add('active');
    }
    function closePanel() {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        tab.setAttribute('aria-expanded', 'false');
        if (overlay) overlay.classList.remove('active');
    }

    tab.addEventListener('click', () =>
        panel.classList.contains('open') ? closePanel() : openPanel());

    if (overlay) overlay.addEventListener('click', closePanel);

    panel.querySelectorAll('.gradient-btn, .pattern-btn').forEach(el =>
        el.addEventListener('click', () => setTimeout(closePanel, 180)));

    const magicFill = document.getElementById('color-it-btn');
    if (magicFill) magicFill.addEventListener('click', () => setTimeout(closePanel, 180));
}

// ─── Orientation change ──────────────────────────────────────────────────────
let _prevOrientation = null;

function handleOrientationChange() {
    const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    if (_prevOrientation && _prevOrientation !== newOrientation) {
        if (typeof trackOrientationChange === 'function') {
            const imgId = (typeof coloringState !== 'undefined' && coloringState.currentImage)
                ? coloringState.currentImage.id : '';
            trackOrientationChange(_prevOrientation, imgId);
        }
    }
    _prevOrientation = newOrientation;

    resizeColorWheelCanvas();

    // Keep the currently selected colour at the pointer for the new geometry
    const geo = getWheelGeometry();
    if (geo) {
        const segAngle = (2 * Math.PI) / WHEEL_COLORS.length;
        wheelState.rotationOffset =
            geo.pointerAngle - (wheelState.selectedIndex + 0.5) * segAngle;
        drawColorWheel();
    }

    if (typeof coloringState !== 'undefined' && coloringState.svgElement
        && typeof fitWrapper === 'function') {
        fitWrapper(coloringState.svgElement);
    }
}

// ─── Canonical: point to desktop clean URL for the current image ─────────────
function updateMobileCanonical() {
    var imgId = new URLSearchParams(window.location.search).get('image');
    if (!imgId) return;
    var dashIdx = imgId.indexOf('-');
    if (dashIdx === -1) return;
    var cat  = imgId.slice(0, dashIdx);
    var slug = imgId.slice(dashIdx + 1);
    var cleanUrl = 'https://magicpencil.fun/color/' + cat + '/' + slug + '.html';
    var tag = document.getElementById('canonical-tag');
    if (tag) tag.href = cleanUrl;
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
function initMobileColoringPage() {
    _prevOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    updateMobileCanonical();
    initColorWheel();
    initHamburgerMenu();
    initMobileDownload();
    initMagicPanel();

    window.matchMedia('(orientation: portrait)').addEventListener('change', () => {
        setTimeout(handleOrientationChange, 120);
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resizeColorWheelCanvas();
            drawColorWheel();
            if (typeof coloringState !== 'undefined' && coloringState.svgElement
                && typeof fitWrapper === 'function') {
                fitWrapper(coloringState.svgElement);
            }
        }, 80);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileColoringPage);
} else {
    initMobileColoringPage();
}
