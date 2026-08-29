// js/app.js
// SupermarketPOS
// Application Entry Point
// Version: 0.1

'use strict';

// ============================================================================
// Application State
// ============================================================================

const APP_STATE = {
    initialized: false
};

// ============================================================================
// DOM
// ============================================================================

const DOM = {
    app: null
};

// ============================================================================
// Utilities
// ============================================================================

function getElement(selector) {
    return document.querySelector(selector);
}

// ============================================================================
// DOM Cache
// ============================================================================

function cacheDOM() {
    DOM.app = getElement('#app');
}

// ============================================================================
// Application Status
// ============================================================================

function setApplicationStatus() {
    const statusContainer =
        document.querySelector('.header-status');

    if (!statusContainer) {
        return;
    }

    /*
     * مهم:
     * وضعیت‌ها در index.html ساخته شده‌اند.
     *
     * این تابع نباید محتوای header-status را پاک کند.
     * بنابراین دیگر innerHTML استفاده نمی‌کنیم.
     */

    const readyStatus =
        statusContainer.querySelector('.status-ready');

    const onlineStatus =
        statusContainer.querySelector('.status-online');

    if (readyStatus) {
        readyStatus.setAttribute(
            'aria-label',
            'وضعیت: آماده به کار'
        );
    }

    if (onlineStatus) {
        onlineStatus.setAttribute(
            'aria-label',
            'اتصال: آنلاین'
        );
    }
}

// ============================================================================
// Start Application
// ============================================================================

function initializeApp() {

    if (APP_STATE.initialized) {
        return;
    }

    cacheDOM();

    if (!DOM.app) {

        console.error(
            'SupermarketPOS: عنصر #app پیدا نشد.'
        );

        return;
    }

    setApplicationStatus();

    APP_STATE.initialized = true;

    console.log(
        'SupermarketPOS: برنامه با موفقیت راه‌اندازی شد.'
    );
}

// ============================================================================
// Bootstrap
// ============================================================================

if (document.readyState === 'loading') {

    document.addEventListener(
        'DOMContentLoaded',
        initializeApp,
        { once: true }
    );

} else {

    initializeApp();

}
