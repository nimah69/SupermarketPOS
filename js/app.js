// js/app.js
// SupermarketPOS
// Application Entry Point
// Version: 0.1

'use strict';

// ============================================================================
// Application State
// ============================================================================

const APP_STATE = {
    initialized: false,
    salesInitialized: false
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
// Sales Navigation
// ============================================================================

function setupSalesNavigation() {

    const salesButton =
        document.querySelector(
            '.menu-card[data-action="sales"]'
        );

    if (!salesButton) {
        console.warn(
            'SupermarketPOS: دکمه فروش پیدا نشد.'
        );

        return;
    }

    salesButton.addEventListener(
        'click',
        openSalesScreen
    );
}

// ============================================================================
// Open Sales Screen
// ============================================================================

function openSalesScreen() {

    const main =
        document.querySelector('main');

    if (!main) {
        console.error(
            'SupermarketPOS: عنصر main پیدا نشد.'
        );

        return;
    }

    const homeScreen =
        document.querySelector('.home-screen');

    if (homeScreen) {
        homeScreen.style.display = 'none';
    }

    let salesScreen =
        document.getElementById('sales-screen');

    if (!salesScreen) {

        salesScreen =
            createSalesScreen();

        main.appendChild(salesScreen);
    }

    salesScreen.style.display = 'block';

    salesScreen.setAttribute(
        'aria-hidden',
        'false'
    );
}

// ============================================================================
// Create Sales Screen
// ============================================================================

function createSalesScreen() {

    const screen =
        document.createElement('section');

    screen.id =
        'sales-screen';

    screen.className =
        'sales-screen';

    screen.setAttribute(
        'aria-hidden',
        'false'
    );

    screen.innerHTML = `
        <div class="sales-header">

            <h2>
                🛒 فروش و صندوق
            </h2>

            <p>
                بخش فروش فروشگاه
            </p>

        </div>

        <div class="sales-placeholder">

            <div class="placeholder-icon">
                ▣
            </div>

            <h3>
                اسکن یا ورود بارکد
            </h3>

            <p>
                سیستم بارکد در مرحله بعد فعال خواهد شد.
            </p>

        </div>

        <div class="sales-placeholder">

            <div class="placeholder-icon">
                🛍️
            </div>

            <h3>
                سبد خرید
            </h3>

            <p>
                هنوز کالایی به سبد اضافه نشده است.
            </p>

        </div>

        <button
            type="button"
            class="sales-back-button"
            id="sales-back-button"
        >
            ← بازگشت به صفحه اصلی
        </button>
    `;

    const backButton =
        screen.querySelector(
            '#sales-back-button'
        );

    if (backButton) {

        backButton.addEventListener(
            'click',
            closeSalesScreen
        );
    }

    return screen;
}

// ============================================================================
// Close Sales Screen
// ============================================================================

function closeSalesScreen() {

    const salesScreen =
        document.getElementById('sales-screen');

    const homeScreen =
        document.querySelector('.home-screen');

    if (salesScreen) {

        salesScreen.style.display =
            'none';

        salesScreen.setAttribute(
            'aria-hidden',
            'true'
        );
    }

    if (homeScreen) {
        homeScreen.style.display = '';
    }
}

// ============================================================================
// Initialize Application
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

    setupSalesNavigation();

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
