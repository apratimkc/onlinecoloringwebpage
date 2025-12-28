/**
 * Category SEO Metadata
 * Contains SEO-optimized titles, descriptions, and keywords for each category
 */

const categoryMetadata = {
    alphabets: {
        name: 'Alphabets',
        title: 'A-Z Alphabet Coloring Pages - Learn Letters | MagicPencil',
        description: 'Free alphabet coloring pages A-Z. Help kids learn letters while coloring fun images. Perfect for preschool and kindergarten.',
        keywords: 'alphabet coloring pages, letter coloring, ABC coloring, learn alphabet, preschool coloring',
        ogImage: '/assets/og-image.png' // Can be customized later
    },
    animals: {
        name: 'Animals',
        title: 'Animal Coloring Pages - Dogs, Cats, Dinosaurs & More | MagicPencil',
        description: 'Free animal coloring pages for kids. Color cute dogs, cats, dinosaurs, birds, and wild animals. 50+ printable animal coloring sheets.',
        keywords: 'animal coloring pages, dog coloring, cat coloring, dinosaur coloring, wildlife coloring pages',
        ogImage: '/assets/og-image.png'
    },
    princess: {
        name: 'Princess',
        title: 'Princess Coloring Pages - Castles, Crowns & More | MagicPencil',
        description: 'Beautiful princess coloring pages for kids. Color royal castles, crowns, gowns, and fairy tale princesses. Free printable princess sheets.',
        keywords: 'princess coloring pages, castle coloring, crown coloring, fairy tale coloring, royal coloring pages',
        ogImage: '/assets/og-image.png'
    },
    unicorns: {
        name: 'Unicorns',
        title: 'Unicorn Coloring Pages - Magical & Rainbow Unicorns | MagicPencil',
        description: 'Magical unicorn coloring pages for kids. Color rainbow unicorns, flying unicorns, and cute baby unicorns. Free fantasy coloring sheets.',
        keywords: 'unicorn coloring pages, rainbow unicorn, magical unicorn, fantasy coloring, cute unicorn coloring',
        ogImage: '/assets/og-image.png'
    },
    vehicles: {
        name: 'Vehicles',
        title: 'Vehicle Coloring Pages - Cars, Trucks, Trains & More | MagicPencil',
        description: 'Free vehicle coloring pages. Color cars, trucks, trains, airplanes, boats, and construction vehicles. Perfect for boys and girls.',
        keywords: 'vehicle coloring pages, car coloring, truck coloring, train coloring, airplane coloring pages',
        ogImage: '/assets/og-image.png'
    },
    food: {
        name: 'Food',
        title: 'Food Coloring Pages - Fruits, Desserts & Snacks | MagicPencil',
        description: 'Yummy food coloring pages for kids. Color fruits, vegetables, ice cream, cupcakes, pizza, and more. Free printable food sheets.',
        keywords: 'food coloring pages, fruit coloring, dessert coloring, cupcake coloring, pizza coloring pages',
        ogImage: '/assets/og-image.png'
    },
    nature: {
        name: 'Nature',
        title: 'Nature Coloring Pages - Trees, Flowers, Landscapes | MagicPencil',
        description: 'Beautiful nature coloring pages. Color trees, forests, mountains, rivers, and outdoor scenes. Perfect for learning about nature.',
        keywords: 'nature coloring pages, tree coloring, forest coloring, landscape coloring, outdoor coloring pages',
        ogImage: '/assets/og-image.png'
    },
    holidays: {
        name: 'Holidays',
        title: 'Holiday Coloring Pages - Christmas, Easter, Halloween & More | MagicPencil',
        description: 'Festive holiday coloring pages. Color Christmas trees, Easter eggs, Halloween pumpkins, and more seasonal celebrations.',
        keywords: 'holiday coloring pages, Christmas coloring, Easter coloring, Halloween coloring, seasonal coloring pages',
        ogImage: '/assets/og-image.png'
    },
    ocean: {
        name: 'Ocean',
        title: 'Ocean Coloring Pages - Fish, Dolphins, Sea Creatures | MagicPencil',
        description: 'Underwater ocean coloring pages. Color fish, dolphins, whales, sharks, coral reefs, and sea life. Free marine animal sheets.',
        keywords: 'ocean coloring pages, fish coloring, dolphin coloring, sea creature coloring, underwater coloring pages',
        ogImage: '/assets/og-image.png'
    },
    fantasy: {
        name: 'Fantasy',
        title: 'Fantasy Coloring Pages - Dragons, Fairies, Magic | MagicPencil',
        description: 'Magical fantasy coloring pages. Color dragons, fairies, wizards, magic creatures, and enchanted worlds. Free fantasy sheets.',
        keywords: 'fantasy coloring pages, dragon coloring, fairy coloring, magic coloring, mythical creatures coloring',
        ogImage: '/assets/og-image.png'
    },
    shapes: {
        name: 'Shapes',
        title: 'Shape Coloring Pages - Learn Shapes for Kids | MagicPencil',
        description: 'Educational shape coloring pages. Help kids learn circles, squares, triangles, stars, and geometric patterns. Perfect for toddlers.',
        keywords: 'shape coloring pages, geometric coloring, circle coloring, educational coloring, preschool shapes',
        ogImage: '/assets/og-image.png'
    },
    flowers: {
        name: 'Flowers',
        title: 'Flower Coloring Pages - Roses, Sunflowers & Garden Flowers | MagicPencil',
        description: 'Beautiful flower coloring pages. Color roses, sunflowers, tulips, daisies, and garden flowers. Free floral coloring sheets.',
        keywords: 'flower coloring pages, rose coloring, sunflower coloring, garden coloring, floral coloring pages',
        ogImage: '/assets/og-image.png'
    }
};

/**
 * Get category metadata by ID
 * @param {string} categoryId - Category identifier
 * @returns {object} Category metadata or default values
 */
function getCategoryMetadata(categoryId) {
    return categoryMetadata[categoryId] || {
        name: 'Category',
        title: 'Coloring Pages - MagicPencil',
        description: 'Browse free coloring and painting pages',
        keywords: 'coloring pages, online coloring, kids activities',
        ogImage: '/assets/og-image.png'
    };
}
