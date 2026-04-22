// Redirect mobile users to the dedicated mobile coloring page
(function () {
    var isMobile = window.matchMedia('(max-width: 767px)').matches
                || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && window.location.pathname.indexOf('coloring-mobile') === -1) {
        window.location.replace('coloring-mobile.html' + window.location.search);
    }
})();
