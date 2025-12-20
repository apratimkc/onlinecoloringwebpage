/**
 * Main Application Logic
 * Handles navigation, random image selection, and page initialization
 */

/**
 * Initialize Random Button (Global)
 */
function initializeRandomButton() {
    const randomBtn = document.getElementById('random-btn');
    if (!randomBtn) return;

    randomBtn.addEventListener('click', () => {
        const randomImage = getRandomImage();
        if (randomImage) {
            window.location.href = `coloring.html?image=${randomImage.id}`;
        }
    });
}

/**
 * Initialize Start Coloring Button (Homepage)
 */
function initializeStartColoringButton() {
    const startBtn = document.getElementById('start-coloring-btn');
    if (!startBtn) return;

    startBtn.addEventListener('click', () => {
        const randomImage = getRandomImage();
        if (randomImage) {
            window.location.href = `coloring.html?image=${randomImage.id}`;
        }
    });
}

/**
 * Initialize Category Page
 */
function initializeCategoryPage() {
    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('cat');

    if (!categoryId) {
        // Redirect to homepage if no category specified
        window.location.href = 'index.html';
        return;
    }

    // Update page title and breadcrumb
    const categoryInfo = getCategoryInfo(categoryId);
    const categoryTitle = document.getElementById('category-title');
    const categoryName = document.getElementById('category-name');

    if (categoryTitle) {
        categoryTitle.textContent = categoryInfo.name;
    }

    if (categoryName) {
        categoryName.textContent = categoryInfo.name;
    }

    // Update page title
    document.title = `${categoryInfo.name} - ColorTap`;

    // Load images for this category
    const images = getImagesByCategory(categoryId);
    const imageGrid = document.getElementById('image-grid');

    if (!imageGrid) return;

    if (images.length === 0) {
        imageGrid.innerHTML = '<p class="loading-message">No images available in this category yet.</p>';
        return;
    }

    // Create image cards
    imageGrid.innerHTML = '';
    images.forEach(image => {
        const card = document.createElement('a');
        card.href = `coloring.html?image=${image.id}`;
        card.className = 'image-card';

        card.innerHTML = `
            <div class="image-thumbnail">
                <img src="images/${image.category}/${image.filename}" alt="${image.name}" onerror="this.style.display='none'">
            </div>
            <h4>${image.name}</h4>
        `;

        imageGrid.appendChild(card);
    });
}

/**
 * Initialize Homepage
 */
function initializeHomepage() {
    // No special initialization needed for homepage currently
    // Category cards are already in HTML
}

/**
 * Main initialization
 */
function initializeApp() {
    // Initialize random button on all pages
    initializeRandomButton();

    // Page-specific initialization
    if (document.body.classList.contains('homepage')) {
        initializeHomepage();
        initializeStartColoringButton();
    } else if (document.body.classList.contains('category-page')) {
        initializeCategoryPage();
    }
    // Coloring page is initialized in coloring.js and ui.js
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
