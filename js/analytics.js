/**
 * Analytics — GA4 event tracking
 * All calls are safe: silently dropped if user declined cookies or gtag hasn't loaded.
 */

function trackEvent(eventName, params) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params || {});
    }
}

function detectPageType() {
    const path = window.location.pathname;
    const cls  = document.body.classList;
    if (cls.contains('mobile-coloring-page')) return 'mobile_coloring';
    if (cls.contains('coloring-page'))        return 'coloring_page';
    if (cls.contains('category-page'))        return 'category_page';
    if (cls.contains('homepage'))             return 'homepage';
    if (path.startsWith('/blog/'))            return 'blog';
    return 'other';
}

// ── Funnel ────────────────────────────────────────────────────────────────────

function trackCategorySelected(categoryName, source) {
    trackEvent('category_selected', { category_name: categoryName, source: source });
}

function trackImageSelected(imageId, category, positionInGrid) {
    trackEvent('image_selected', {
        image_id: imageId,
        category: category,
        position_in_grid: positionInGrid
    });
}

function trackColoringSessionStart(imageId, category, deviceType) {
    trackEvent('coloring_session_start', {
        image_id: imageId,
        category: category,
        device_type: deviceType
    });
}

// ── Core engagement ───────────────────────────────────────────────────────────

function trackFirstFill(imageId, category, timeToFillMs) {
    trackEvent('first_fill', {
        image_id: imageId,
        category: category,
        time_to_fill_ms: Math.round(timeToFillMs)
    });
}

function trackFillModeUsed(mode, imageId) {
    trackEvent('fill_mode_used', { mode: mode, image_id: imageId });
}

function trackMagicFillUsed(imageId, category) {
    trackEvent('magic_fill_used', { image_id: imageId, category: category });
}

function trackUndoUsed(imageId, countInSession) {
    trackEvent('undo_used', { image_id: imageId, count_in_session: countInSession });
}

function trackColorSelected(colorName, hex, fillMode) {
    trackEvent('color_selected', {
        color_name: colorName,
        hex: hex,
        fill_mode: fillMode
    });
}

// ── Completion & conversion ───────────────────────────────────────────────────

function trackColoringProgress(milestone, imageId, category) {
    trackEvent('coloring_progress', {
        milestone: milestone,
        image_id: imageId,
        category: category
    });
}

function trackColoringComplete(imageId, category, sessionDurationS, fillsCount) {
    trackEvent('coloring_complete', {
        image_id: imageId,
        category: category,
        session_duration_s: sessionDurationS,
        fills_count: fillsCount
    });
}

function trackDownloadClicked(type, imageId, category, completionPct) {
    trackEvent('download_clicked', {
        type: type,
        image_id: imageId,
        category: category,
        completion_pct: completionPct
    });
}

function trackClearAllConfirmed(imageId, category, completionPctAtClear) {
    trackEvent('clear_all_confirmed', {
        image_id: imageId,
        category: category,
        completion_pct_at_clear: completionPctAtClear
    });
}

// ── Affiliate revenue ─────────────────────────────────────────────────────────

function trackAffiliateClick(asin, productName, category, pageType) {
    trackEvent('affiliate_click', {
        asin: asin,
        product_name: productName,
        category: category,
        page_type: pageType
    });
}

function trackAffiliateWidgetImpression(category, pageType, productsShownAsins) {
    trackEvent('affiliate_widget_impression', {
        category: category,
        page_type: pageType,
        products_shown: productsShownAsins.join(',')
    });
}

// ── Content & navigation ──────────────────────────────────────────────────────

function trackRandomUsed(source, resultImageId) {
    trackEvent('random_used', { source: source, result_image_id: resultImageId });
}

function trackNextImageConfirmed(fromImageId, toImageId) {
    trackEvent('next_image_confirmed', {
        from_image_id: fromImageId,
        to_image_id: toImageId
    });
}

function trackBlogScrollDepth(postSlug, depthPct) {
    trackEvent('blog_scroll_depth', { post_slug: postSlug, depth_pct: depthPct });
}

// ── Mobile ────────────────────────────────────────────────────────────────────

function trackOrientationChange(from, imageId) {
    trackEvent('orientation_change', { from: from, image_id: imageId });
}
