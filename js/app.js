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
// Application Initialization
// ============================================================================

function cacheDOM() {
    DOM.app = getElement('#app');
}

// ============================================================================
// Status
// ============================================================================

function setApplicationStatus() {
    const statusContainer =
        document.querySelector('.header-status');

    if (!statusContainer) {
        return;
    }

    statusContainer.innerHTML = '';

    const statusDot =
        document.createElement('span');

    statusDot.className = 'status-dot';

    const statusText =
        document.createElement('span');

    statusText.textContent = 'آماده به کار';

    statusContainer.appendChild(statusDot);
    statusContainer.appendChild(statusText);
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
