/**
 * Image Catalog
 * Contains metadata for all coloring images
 */

const imageCatalog = [
    // Animals Category
    {
        id: 'animal-dog-1',
        category: 'animals',
        name: 'Simple Dog',
        filename: 'dog-simple.svg',
        difficulty: 'simple',
        regions: 5
    },
    {
        id: 'animal-horse-1',
        category: 'animals',
        name: 'Simple Horse',
        filename: 'horse-simple.svg',
        difficulty: 'simple',
        regions: 18
    },
    {
        id: 'animal-horse-2',
        category: 'animals',
        name: 'Horse',
        filename: 'horse3.svg',
        difficulty: 'medium',
        regions: 25
    },
    {
        id: 'animal-turtle-1',
        category: 'animals',
        name: 'Simple Turtle',
        filename: 'turtle-simple.svg',
        difficulty: 'simple',
        regions: 8
    },

    // Princess Category
    {
        id: 'princess-crown-1',
        category: 'princess',
        name: 'Simple Crown',
        filename: 'crown-simple.svg',
        difficulty: 'simple',
        regions: 6
    },

    // Shapes Category
    {
        id: 'shapes-star-1',
        category: 'shapes',
        name: 'Simple Star',
        filename: 'star-simple.svg',
        difficulty: 'simple',
        regions: 3
    }
];

/**
 * Get all images
 */
function getAllImages() {
    return imageCatalog;
}

/**
 * Get images by category
 */
function getImagesByCategory(category) {
    return imageCatalog.filter(img => img.category === category);
}

/**
 * Get image by ID
 */
function getImageById(id) {
    return imageCatalog.find(img => img.id === id);
}

/**
 * Get random image
 */
function getRandomImage() {
    return imageCatalog[Math.floor(Math.random() * imageCatalog.length)];
}

/**
 * Get all categories
 */
function getAllCategories() {
    const categories = [...new Set(imageCatalog.map(img => img.category))];
    return categories.map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        count: imageCatalog.filter(img => img.category === cat).length
    }));
}

/**
 * Category Display Names and Icons
 */
const categoryInfo = {
    animals: { name: 'Animals', icon: '🐶' },
    princess: { name: 'Princess', icon: '👸' },
    unicorns: { name: 'Unicorns', icon: '🦄' },
    vehicles: { name: 'Vehicles', icon: '🚗' },
    food: { name: 'Food', icon: '🍕' },
    nature: { name: 'Nature', icon: '🌳' },
    holidays: { name: 'Holidays', icon: '🎄' },
    dinosaurs: { name: 'Dinosaurs', icon: '🦕' },
    ocean: { name: 'Ocean', icon: '🐠' },
    fantasy: { name: 'Fantasy', icon: '🧙' },
    shapes: { name: 'Shapes', icon: '⭐' },
    flowers: { name: 'Flowers', icon: '🌸' }
};

/**
 * Get category info
 */
function getCategoryInfo(categoryId) {
    return categoryInfo[categoryId] || { name: categoryId, icon: '🎨' };
}
