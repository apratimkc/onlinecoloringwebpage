/**
 * Main Application Logic
 * Handles navigation, random image selection, and page initialization
 */

function getImageUrl(image) {
    const slug = image.id.replace(image.category + '-', '');
    return `/color/${image.category}/${slug}.html`;
}

function getCategoryUrl(categoryId) {
    return `/categories/${categoryId}.html`;
}

/**
 * Initialize Random Button (Global)
 */
function initializeRandomButton() {
    const randomBtn = document.getElementById('random-btn');
    if (!randomBtn) return;

    randomBtn.addEventListener('click', () => {
        const randomImage = getRandomImage();
        if (randomImage) {
            window.location.href = getImageUrl(randomImage);
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
            window.location.href = getImageUrl(randomImage);
        }
    });
}

/**
 * Initialize Category Page
 */
function initializeCategoryPage() {
    // Generated pages (/categories/animals.html): read from data-category-id on <body>
    // Legacy category.html: fall back to ?cat= URL param
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('cat') || document.body.dataset.categoryId;

    if (!categoryId) {
        window.location.href = '/';
        return;
    }

    // Get category info and SEO metadata
    const categoryInfo = getCategoryInfo(categoryId);
    const categoryMeta = getCategoryMetadata(categoryId);

    const categoryTitle = document.getElementById('category-title');
    const categoryName = document.getElementById('category-name');

    if (categoryTitle) {
        categoryTitle.textContent = categoryInfo.name;
    }

    if (categoryName) {
        categoryName.textContent = categoryInfo.name;
    }

    // Update page title with SEO-optimized title
    document.title = categoryMeta.title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', categoryMeta.description);
    }

    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        metaKeywords.setAttribute('content', categoryMeta.keywords);
    }

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content', categoryMeta.title);
    }

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
        ogDesc.setAttribute('content', categoryMeta.description);
    }

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
        ogUrl.setAttribute('content', `https://magicpencil.fun${getCategoryUrl(categoryId)}`);
    }

    // Update canonical URL (no-op on generated pages where it's already baked in)
    const canonicalTag = document.getElementById('canonical-tag');
    if (canonicalTag) {
        canonicalTag.href = `https://magicpencil.fun${getCategoryUrl(categoryId)}`;
    }

    // Update Breadcrumb Schema
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
                    "name": categoryMeta.name,
                    "item": `https://magicpencil.fun${getCategoryUrl(categoryId)}`
                }
            ]
        };
        breadcrumbSchema.textContent = JSON.stringify(schema, null, 2);
    }

    // Display category content description
    const categoryContentSection = document.getElementById('category-content');
    if (categoryContentSection && categoryMeta.contentDescription) {
        categoryContentSection.innerHTML = categoryMeta.contentDescription;
    }

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
        card.href = getImageUrl(image);
        card.className = 'image-card';

        card.innerHTML = `
            <div class="image-thumbnail">
                <img src="/images/${image.category}/${image.filename}" alt="${image.name}" onerror="this.style.display='none'">
            </div>
            <h4>${image.name}</h4>
        `;

        imageGrid.appendChild(card);
    });

    // Add "work in progress" info tile at the end
    const infoCard = document.createElement('div');
    infoCard.className = 'image-card info-card';
    infoCard.innerHTML = `
        <div class="image-thumbnail info-thumbnail">
            <div class="info-content">
                <span class="info-icon">🎨</span>
                <h4>More Coming Soon!</h4>
                <p>We add new coloring pages every day</p>
            </div>
        </div>
    `;
    imageGrid.appendChild(infoCard);
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
