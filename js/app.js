// ============================================================
// SupermarketPOS
// Application Core
// Stage 6
// ============================================================

'use strict';

// ============================================================
// Application State
// ============================================================

const AppState = {
    initialized: false,
    online: navigator.onLine
};

// ============================================================
// DOM
// ============================================================

const DOM = {
    app: null,
    statusDot: null,
    statusText: null
};

// ============================================================
// Utilities
// ============================================================

function getElement(selector) {
    return document.querySelector(selector);
}

// ============================================================
// Notifications
// ============================================================

function showMessage(message, type = 'success') {
    const oldMessage =
        document.querySelector('.app-message');

    if (oldMessage) {
        oldMessage.remove();
    }

    const messageElement =
        document.createElement('div');

    messageElement.className =
        'app-message';

    messageElement.textContent =
        String(message);

    const background =
        type === 'error'
            ? '#fee2e2'
            : '#ecfdf5';

    const color =
        type === 'error'
            ? '#b91c1c'
            : '#047857';

    messageElement.style.cssText = `
        position: fixed;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99999;

        max-width: calc(100% - 32px);

        padding: 12px 16px;

        border-radius: 12px;

        background: ${background};
        color: ${color};

        border: 1px solid rgba(0,0,0,0.06);

        font-size: 12px;
        line-height: 1.7;

        text-align: center;

        box-shadow:
            0 10px 30px
            rgba(15, 23, 42, 0.12);
    `;

    document.body.appendChild(
        messageElement
    );

    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 3000);
}

// ============================================================
// Connection Status
// ============================================================

function updateConnectionStatus() {
    AppState.online =
        navigator.onLine;

    if (!DOM.statusDot || !DOM.statusText) {
        return;
    }

    if (AppState.online) {

        DOM.statusDot.style.background =
            '#86efac';

        DOM.statusText.textContent =
            'آنلاین';

    } else {

        DOM.statusDot.style.background =
            '#fca5a5';

        DOM.statusText.textContent =
            'آفلاین';
    }
}

function setupConnectionMonitoring() {
    window.addEventListener(
        'online',
        updateConnectionStatus
    );

    window.addEventListener(
        'offline',
        updateConnectionStatus
    );
}

// ============================================================
// DOM Cache
// ============================================================

function cacheDOM() {

    DOM.app =
        getElement('#app');

    DOM.statusDot =
        getElement('.status-dot');

    DOM.statusText =
        getElement('.header-status span:last-child');
}

// ============================================================
// Application Check
// ============================================================

function validateApplication() {

    if (!DOM.app) {
        throw new Error(
            'عنصر اصلی برنامه (#app) پیدا نشد.'
        );
    }

    const main =
        document.querySelector('main');

    if (!main) {
        throw new Error(
            'عنصر اصلی main پیدا نشد.'
        );
    }

    return true;
}

// ============================================================
// Application Ready
// ============================================================

function showApplicationReady() {

    const existing =
        document.querySelector(
            '.welcome-message'
        );

    if (existing) {
        existing.textContent =
            'سیستم با موفقیت آماده استفاده است.';
        return;
    }

    const homeScreen =
        document.querySelector(
            '.home-screen'
        );

    if (!homeScreen) {
        return;
    }

    const message =
        document.createElement('div');

    message.className =
        'welcome-message';

    message.textContent =
        'سیستم با موفقیت آماده استفاده است.';

    homeScreen.appendChild(message);
}

// ============================================================
// Initialization
// ============================================================

function initializeApp() {

    if (AppState.initialized) {
        return;
    }

    try {

        cacheDOM();

        validateApplication();

        setupConnectionMonitoring();

        updateConnectionStatus();

        showApplicationReady();

        AppState.initialized =
            true;

        console.log(
            'SupermarketPOS initialized successfully.'
        );

    } catch (error) {

        console.error(
            'SupermarketPOS initialization error:',
            error
        );

        showMessage(
            error?.message ||
            'خطا در راه‌اندازی برنامه',
            'error'
        );
    }
}

// ============================================================
// Start
// ============================================================

if (
    document.readyState ===
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        initializeApp,
        {
            once: true
        }
    );

} else {

    initializeApp();
}
