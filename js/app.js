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
// Home Screen
// ============================================================================

function showHomeScreen() {

    const homeScreen =
        document.querySelector('.home-screen');

    const salesScreen =
        document.getElementById('sales-screen');

    const productsScreen =
        document.getElementById('products-screen');

    if (salesScreen) {
        salesScreen.style.display = 'none';
    }

    if (productsScreen) {
        productsScreen.style.display = 'none';
    }

    if (homeScreen) {
        homeScreen.style.display = '';
    }
}

// ============================================================================
// Sales Screen
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

    const productsScreen =
        document.getElementById('products-screen');

    if (productsScreen) {
        productsScreen.style.display = 'none';
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
            showHomeScreen
        );
    }

    return screen;
}

// ============================================================================
// Products Screen
// ============================================================================

function openProductsScreen() {

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

    const salesScreen =
        document.getElementById('sales-screen');

    if (salesScreen) {
        salesScreen.style.display = 'none';
    }

    let productsScreen =
        document.getElementById('products-screen');

    if (!productsScreen) {

        productsScreen =
            createProductsScreen();

        main.appendChild(productsScreen);
    }

    productsScreen.style.display = 'block';

    productsScreen.setAttribute(
        'aria-hidden',
        'false'
    );
}

function createProductsScreen() {

    const screen =
        document.createElement('section');

    screen.id =
        'products-screen';

    screen.className =
        'products-screen';

    screen.setAttribute(
        'aria-hidden',
        'false'
    );

    screen.innerHTML = `
        <div class="products-header">

            <h2>
                📦 مدیریت کالاها
            </h2>

            <p>
                مدیریت محصولات و موجودی فروشگاه
            </p>

        </div>

        <div class="products-placeholder">

            <div class="placeholder-icon">
                📦
            </div>

            <h3>
                مدیریت محصولات
            </h3>

            <p>
                در مرحله بعد، افزودن، ویرایش،
                حذف و جستجوی کالاها را اضافه می‌کنیم.
            </p>

        </div>

        <button
            type="button"
            class="products-back-button"
            id="products-back-button"
        >
            ← بازگشت به صفحه اصلی
        </button>
    `;

    const backButton =
        screen.querySelector(
            '#products-back-button'
        );

    if (backButton) {

        backButton.addEventListener(
            'click',
            showHomeScreen
        );
    }

    return screen;
}

// ============================================================================
// Navigation
// ============================================================================

function setupNavigation() {

    const menuCards =
        document.querySelectorAll('.menu-card');

    menuCards.forEach(card => {

        card.addEventListener(
            'click',
            () => {

                const action =
                    card.getAttribute(
                        'data-action'
                    );

                if (action === 'sales') {
                    openSalesScreen();
                    return;
                }

                if (action === 'products') {
                    openProductsScreen();
                    return;
                }

                if (
                    action === 'reports' ||
                    action === 'settings'
                ) {
                    console.log(
                        `SupermarketPOS: بخش ${action} هنوز ساخته نشده است.`
                    );
                }
            }
        );
    });
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

    setupNavigation();

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
