/**
 * Download Functionality
 * Converts SVG to PNG and downloads to user's device
 */

/**
 * Download colored image as PNG
 */
function downloadImage() {
    if (!coloringState.svgElement || !coloringState.currentImage) {
        alert('No image loaded to download');
        return;
    }

    try {
        // Get SVG element
        const svg = coloringState.svgElement;
        const svgData = new XMLSerializer().serializeToString(svg);

        // Get original SVG dimensions from viewBox or bounding box
        const viewBox = svg.viewBox.baseVal;
        let svgWidth, svgHeight;

        if (viewBox && viewBox.width && viewBox.height) {
            // Use viewBox dimensions
            svgWidth = viewBox.width;
            svgHeight = viewBox.height;
        } else {
            // Fallback to getBBox or default
            const bbox = svg.getBBox();
            svgWidth = bbox.width || svg.width.baseVal.value || 800;
            svgHeight = bbox.height || svg.height.baseVal.value || 800;
        }

        // Calculate aspect ratio
        const aspectRatio = svgWidth / svgHeight;

        // Create a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size (high resolution for printing, preserving aspect ratio)
        const maxDimension = 2000; // High quality output
        let targetWidth, targetHeight;

        if (aspectRatio >= 1) {
            // Wider or square image
            targetWidth = maxDimension;
            targetHeight = Math.round(maxDimension / aspectRatio);
        } else {
            // Taller image
            targetHeight = maxDimension;
            targetWidth = Math.round(maxDimension * aspectRatio);
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Create an image from SVG
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function() {
            // Fill canvas with white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw SVG image onto canvas
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            // Convert canvas to PNG blob
            canvas.toBlob(function(blob) {
                // Create download link
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');

                // Generate filename with timestamp
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const category = coloringState.currentImage.category;
                link.download = `colored-${category}-${timestamp}.png`;

                link.href = downloadUrl;
                link.click();

                // Cleanup
                URL.revokeObjectURL(url);
                URL.revokeObjectURL(downloadUrl);
            }, 'image/png', 1.0); // Max quality
        };

        img.onerror = function() {
            console.error('Failed to load SVG into image');
            alert('Failed to download image. Please try again.');
            URL.revokeObjectURL(url);
        };

        img.src = url;

    } catch (error) {
        console.error('Error downloading image:', error);
        alert('Failed to download image. Please try again.');
    }
}

/**
 * Initialize download button
 */
function initializeDownloadButton() {
    const downloadBtn = document.getElementById('download-btn');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', downloadImage);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.classList.contains('coloring-page')) {
            initializeDownloadButton();
        }
    });
} else {
    if (document.body.classList.contains('coloring-page')) {
        initializeDownloadButton();
    }
}
