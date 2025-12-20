# Coloring Page Website - MVP

An online coloring platform targeting users aged 2-25, featuring tap-to-fill coloring with both simple and advanced options (gradients, patterns).

## Features

- 100 coloring images across 10-12 categories
- Tap-to-fill functionality with SVG images
- 12 basic colors + gradient fills + 5 pattern fills
- Download colored images as PNG
- Fully responsive (mobile, tablet, desktop)
- Google AdSense monetization

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (no frameworks)
- **Image Format:** SVG for tap-to-fill functionality
- **Development Server:** live-server

## Setup Instructions

### Prerequisites

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Run the installer and follow the prompts
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   - The site will automatically open at `http://localhost:3000`
   - If it doesn't open automatically, navigate to `http://localhost:3000` in your browser

## Project Structure

```
ColoringPageWebsite/
├── index.html              # Homepage with category grid
├── category.html           # Category page template
├── coloring.html           # Main coloring interface
├── privacy.html            # Privacy policy
├── contact.html            # Contact page
├── css/
│   ├── main.css           # Global styles
│   ├── responsive.css     # Responsive breakpoints
│   └── coloring-page.css  # Coloring page specific styles
├── js/
│   ├── app.js             # Main application logic
│   ├── ui.js              # UI interactions
│   ├── coloring.js        # SVG tap-to-fill engine
│   ├── colors.js          # Color/gradient/pattern management
│   ├── download.js        # PNG export functionality
│   └── data/
│       └── image-catalog.js  # Image metadata catalog
├── images/
│   ├── animals/           # Animal category SVGs
│   ├── princess/          # Princess category SVGs
│   ├── shapes/            # Shapes category SVGs
│   └── ...                # Other categories
└── assets/
    └── icons/             # UI icons and logos
```

## Development

### Running the Site Locally

```bash
npm start
```

This will start a local web server at `http://localhost:3000` with live reload enabled. Any changes you make to HTML, CSS, or JavaScript files will automatically refresh the browser.

### Adding New Images

1. Create SVG files with clearly defined `<path>` elements for fillable regions
2. Place them in the appropriate category folder under `/images`
3. Update `/js/data/image-catalog.js` with the new image metadata

### Browser Compatibility

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile: iOS Safari, Chrome Mobile, Samsung Internet

## Performance Requirements

- Initial page load: < 2 seconds
- Image loading: < 1 second per image
- Color fill response: < 100ms (instant)

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please use the contact form on the website or open an issue in the repository.
