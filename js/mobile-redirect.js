// Redirect mobile users to the dedicated mobile coloring page.
// Placement rules:
//   - coloring.html (legacy): this script is in <head> — reads ?image= from URL (no DOM needed)
//   - Generated pages (/color/cat/slug.html): this script is at end of <body> — reads data-image-id from <body>
(function () {
    // Never redirect crawlers — they must stay on the desktop page to see the baked-in canonical.
    // AdsBot-Google and Mediapartners-Google do NOT contain "Googlebot" — list them explicitly.
    if (/Googlebot|AdsBot-Google|Mediapartners-Google|bingbot|Slurp|DuckDuckBot|YandexBot|Baiduspider/i.test(navigator.userAgent)) return;

    var isMobile = window.matchMedia('(max-width: 767px)').matches
                || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;
    if (window.location.pathname.indexOf('coloring-mobile') !== -1) return;

    // Legacy path: ?image= query param (coloring.html in <head>)
    var legacyParam = new URLSearchParams(window.location.search).get('image');
    if (legacyParam) {
        window.location.replace('/coloring-mobile.html?image=' + legacyParam);
        return;
    }

    // Generated page path: data-image-id on <body> (script at end of body, DOM available)
    var imageId = document.body && document.body.dataset && document.body.dataset.imageId;
    if (imageId) {
        window.location.replace('/coloring-mobile.html?image=' + imageId);
    }
})();
