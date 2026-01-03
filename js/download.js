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
 * Download original uncolored image as PDF for printing
 */
async function downloadOriginalPDF() {
    if (!coloringState.currentImage) {
        alert('No image loaded to download');
        return;
    }

    try {
        // Construct path to original SVG file
        const svgPath = `images/${coloringState.currentImage.category}/${coloringState.currentImage.filename}`;

        // Fetch the original SVG file (uncolored)
        const response = await fetch(svgPath);
        if (!response.ok) {
            throw new Error('Failed to load original SVG');
        }

        const svgText = await response.text();

        // Parse the SVG to get dimensions
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');

        if (!svgElement) {
            throw new Error('Invalid SVG file');
        }

        // Get SVG dimensions from viewBox
        const viewBox = svgElement.viewBox.baseVal;
        let svgWidth = viewBox.width || 800;
        let svgHeight = viewBox.height || 800;

        // Calculate aspect ratio
        const aspectRatio = svgWidth / svgHeight;

        // PDF dimensions (A4-ish, with margins for printing)
        // Using 72 DPI standard, A4 is ~595 x 842 points
        const pdfWidth = 550;  // Leave margins
        const pdfHeight = aspectRatio >= 1 ? pdfWidth / aspectRatio : pdfWidth;
        const finalWidth = aspectRatio < 1 ? pdfHeight * aspectRatio : pdfWidth;
        const finalHeight = aspectRatio < 1 ? pdfHeight : pdfWidth / aspectRatio;

        // Create canvas to render SVG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // High resolution for good print quality
        const scale = 3;
        canvas.width = finalWidth * scale;
        canvas.height = finalHeight * scale;

        // Create image from SVG
        const img = new Image();
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function() {
            // Fill with white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw SVG
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert to PNG data URL
            const imgData = canvas.toDataURL('image/png', 1.0);

            // Create PDF using jsPDF
            // We need to load jsPDF dynamically if not already loaded
            if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
                // Load jsPDF from CDN
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = function() {
                    generatePDF(imgData, finalWidth, finalHeight);
                };
                script.onerror = function() {
                    // Fallback: download as PNG instead
                    console.warn('jsPDF failed to load, downloading as PNG');
                    downloadAsPNGFallback(canvas);
                };
                document.head.appendChild(script);
            } else {
                generatePDF(imgData, finalWidth, finalHeight);
            }

            URL.revokeObjectURL(url);
        };

        img.onerror = function() {
            console.error('Failed to load SVG into image');
            alert('Failed to generate PDF. Please try again.');
            URL.revokeObjectURL(url);
        };

        img.src = url;

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    }
}

/**
 * Generate PDF from image data
 */
function generatePDF(imgData, width, height) {
    const { jsPDF } = window.jspdf || window;

    // Determine orientation based on aspect ratio
    const orientation = width > height ? 'landscape' : 'portrait';

    // Create PDF (A4 size)
    const pdf = new jsPDF({
        orientation: orientation,
        unit: 'pt',
        format: 'a4'
    });

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate scaling to fit on page with margins
    const margin = 40;
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = pageHeight - (margin * 2);

    let finalWidth = width;
    let finalHeight = height;

    // Scale to fit
    if (finalWidth > maxWidth) {
        const scale = maxWidth / finalWidth;
        finalWidth = maxWidth;
        finalHeight = height * scale;
    }
    if (finalHeight > maxHeight) {
        const scale = maxHeight / finalHeight;
        finalHeight = maxHeight;
        finalWidth = finalWidth * scale;
    }

    // Center on page
    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const category = coloringState.currentImage.category;
    const filename = `coloring-page-${category}-${timestamp}.pdf`;

    // Download PDF
    pdf.save(filename);
}

/**
 * Fallback: Download as PNG if jsPDF fails
 */
function downloadAsPNGFallback(canvas) {
    canvas.toBlob(function(blob) {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const category = coloringState.currentImage.category;
        link.download = `coloring-page-${category}-${timestamp}.png`;

        link.href = downloadUrl;
        link.click();

        URL.revokeObjectURL(downloadUrl);
    }, 'image/png', 1.0);
}

/**
 * Initialize download button
 */
function initializeDownloadButton() {
    const downloadBtn = document.getElementById('download-btn');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', downloadImage);
}

/**
 * Initialize PDF download button
 */
function initializePDFDownloadButton() {
    const pdfBtn = document.getElementById('download-pdf-btn');
    if (!pdfBtn) return;

    pdfBtn.addEventListener('click', downloadOriginalPDF);
}

/**
 * Initialize Color It button
 */
function initializeColorItButton() {
    const colorItBtn = document.getElementById('color-it-btn');
    if (!colorItBtn) return;

    colorItBtn.addEventListener('click', colorItRandomly);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.classList.contains('coloring-page')) {
            initializeDownloadButton();
            initializePDFDownloadButton();
            initializeColorItButton();
        }
    });
} else {
    if (document.body.classList.contains('coloring-page')) {
        initializeDownloadButton();
        initializePDFDownloadButton();
        initializeColorItButton();
    }
}
