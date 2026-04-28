/**
 * Blog page analytics
 * Fires blog_scroll_depth events at 25 / 50 / 75 / 100 % scroll depth.
 */
(function () {
    const milestones  = [25, 50, 75, 100];
    const fired       = new Set();
    const slug        = window.location.pathname
                            .replace('/blog/', '')
                            .replace('.html', '')
                            .replace(/\/$/, '') || 'index';

    function getScrollPct() {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollable <= 0) return 100;
        return Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    }

    function onScroll() {
        const pct = getScrollPct();
        milestones.forEach(function (m) {
            if (pct >= m && !fired.has(m)) {
                fired.add(m);
                if (typeof trackBlogScrollDepth === 'function') {
                    trackBlogScrollDepth(slug, m);
                }
            }
        });
        if (fired.size === milestones.length) {
            window.removeEventListener('scroll', onScroll, { passive: true });
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Check immediately in case the page is short enough to be fully visible
    onScroll();
})();
