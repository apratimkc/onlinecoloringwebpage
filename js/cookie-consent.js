/**
 * Cookie Consent Manager
 * COPPA-compliant cookie consent for MagicPencil
 */

const CookieConsent = {
    // Cookie names
    CONSENT_COOKIE: 'magicpencil_cookie_consent',
    ANALYTICS_COOKIE: 'magicpencil_analytics_consent',
    ADS_COOKIE: 'magicpencil_ads_consent',

    // Cookie expiration (1 year)
    COOKIE_EXPIRY_DAYS: 365,

    /**
     * Initialize cookie consent
     */
    init() {
        // Check if user has already made a choice
        if (!this.hasConsent()) {
            this.showBanner();
        } else {
            // Load consented services
            this.loadConsentedServices();
        }

        // Set up event listeners
        this.setupEventListeners();
    },

    /**
     * Check if user has given consent
     */
    hasConsent() {
        return this.getCookie(this.CONSENT_COOKIE) !== null;
    },

    /**
     * Show cookie consent banner
     */
    showBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            setTimeout(() => {
                banner.classList.add('show');
            }, 1000); // Show after 1 second
        }
    },

    /**
     * Hide cookie consent banner
     */
    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
        }
    },

    /**
     * Accept all cookies
     */
    acceptAll() {
        this.setCookie(this.CONSENT_COOKIE, 'accepted', this.COOKIE_EXPIRY_DAYS);
        this.setCookie(this.ANALYTICS_COOKIE, 'true', this.COOKIE_EXPIRY_DAYS);
        this.setCookie(this.ADS_COOKIE, 'true', this.COOKIE_EXPIRY_DAYS);

        this.hideBanner();
        this.loadConsentedServices();
    },

    /**
     * Decline all non-essential cookies
     */
    declineAll() {
        this.setCookie(this.CONSENT_COOKIE, 'declined', this.COOKIE_EXPIRY_DAYS);
        this.setCookie(this.ANALYTICS_COOKIE, 'false', this.COOKIE_EXPIRY_DAYS);
        this.setCookie(this.ADS_COOKIE, 'false', this.COOKIE_EXPIRY_DAYS);

        this.hideBanner();
        // Don't load Google Analytics or Ads
    },

    /**
     * Save custom preferences
     */
    savePreferences(analytics, ads) {
        this.setCookie(this.CONSENT_COOKIE, 'custom', this.COOKIE_EXPIRY_DAYS);
        this.setCookie(this.ANALYTICS_COOKIE, analytics.toString(), this.COOKIE_EXPIRY_DAYS);
        this.setCookie(this.ADS_COOKIE, ads.toString(), this.COOKIE_EXPIRY_DAYS);

        this.hideModal();
        this.hideBanner();
        this.loadConsentedServices();
    },

    /**
     * Load services based on consent
     */
    loadConsentedServices() {
        const analyticsConsent = this.getCookie(this.ANALYTICS_COOKIE);
        const adsConsent = this.getCookie(this.ADS_COOKIE);

        // Load Google Analytics if consented
        if (analyticsConsent === 'true') {
            this.loadGoogleAnalytics();
        }

        // Note: Google AdSense is loaded by default as it's configured as child-directed
        // which means it doesn't require explicit consent under COPPA
    },

    /**
     * Load Google Analytics
     */
    loadGoogleAnalytics() {
        // Check if already loaded
        if (window.gtag) {
            return;
        }

        // Load gtag.js
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-S4TFTTG0SD';
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-S4TFTTG0SD', {
            'anonymize_ip': true,  // IP anonymization for privacy
            'cookie_flags': 'SameSite=None;Secure'
        });

        window.gtag = gtag;
    },

    /**
     * Show settings modal
     */
    showModal() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.classList.add('show');

            // Set current preferences in toggles
            const analyticsToggle = document.getElementById('analytics-toggle');
            const adsToggle = document.getElementById('ads-toggle');

            if (analyticsToggle) {
                analyticsToggle.checked = this.getCookie(this.ANALYTICS_COOKIE) === 'true';
            }
            if (adsToggle) {
                adsToggle.checked = this.getCookie(this.ADS_COOKIE) === 'true';
            }
        }
    },

    /**
     * Hide settings modal
     */
    hideModal() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Accept button
        const acceptBtn = document.getElementById('cookie-accept-btn');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptAll());
        }

        // Decline button
        const declineBtn = document.getElementById('cookie-decline-btn');
        if (declineBtn) {
            declineBtn.addEventListener('click', () => this.declineAll());
        }

        // Settings button
        const settingsBtn = document.getElementById('cookie-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showModal());
        }

        // Save preferences button
        const saveBtn = document.getElementById('cookie-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const analyticsToggle = document.getElementById('analytics-toggle');
                const adsToggle = document.getElementById('ads-toggle');

                this.savePreferences(
                    analyticsToggle?.checked || false,
                    adsToggle?.checked || false
                );
            });
        }

        // Close modal button
        const closeBtn = document.getElementById('cookie-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }

        // Close modal on background click
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    },

    /**
     * Set a cookie
     */
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    },

    /**
     * Get a cookie
     */
    getCookie(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length);
            }
        }
        return null;
    },

    /**
     * Delete a cookie
     */
    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
} else {
    CookieConsent.init();
}
