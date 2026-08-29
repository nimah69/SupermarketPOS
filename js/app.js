// js/app.js
// SupermarketPOS
// Products Form - Stage 1

'use strict';

import {
    initializeDatabase
} from './database.js';

// ============================================================================
// Application State
// ============================================================================

const APP_STATE = {
    initialized: false,
    databaseReady: false
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
// Database Status
// ============================================================================

function showDatabaseStatus(message, success = true) {

    let status =
        document.getElementById(
            'database-test-status'
        );

    if (!status) {

        status =
            document.createElement('div');

        status.id =
            'database-test-status';

        status.style.cssText = `
            margin-top: 14px;
            padding: 12px 14px;
            border-radius: 12px;
            font-size: 13px;
            text-align: center;
            border: 1px solid;
        `;

        const homeScreen =
            document.querySelector('.home-screen');

        if (homeScreen) {
            homeScreen.appendChild(status);
        }
    }

    status.style.background =
        success ? '#ecfdf5' : '#fef2f2';

    status.style.color =
        success ? '#047857' : '#b91c1c';

    status.style.borderColor =
        success ? '#a7f3d0' : '#fecaca';

    status.textContent =
        message;
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
}

// ============================================================================
// Create Products Screen
// ============================================================================

function createProductsScreen() {

    const screen =
        document.createElement('section');

    screen.id =
        'products-screen';

    screen.className =
        'products-screen';

    screen.innerHTML = `
        <div class="products-header">

            <h2>
                📦 مدیریت کالاها
            </h2>

            <p>
                مدیریت محصولات و موجودی فروشگاه
            </p>

        </div>

        <div class="products-actions">

            <button
                type="button"
                class="add-product-button"
                id="add-product-button"
            >
                ＋ افزودن کالا
            </button>

        </div>

        <div
            id="product-form-container"
            class="product-form-container"
            style="display: none;"
        >

            <div class="product-form">

                <div class="product-form-header">

                    <div>
                        <h3>
                            افزودن کالای جدید
                        </h3>

                        <p>
                            اطلاعات کالا را وارد کنید.
                        </p>
                    </div>

                    <button
                        type="button"
                        class="close-product-form"
                        id="close-product-form"
                        aria-label="بستن فرم"
                    >
                        ×
                    </button>

                </div>

                <div class="form-field">

                    <label for="product-barcode">
                        بارکد
                    </label>

                    <input
                        type="text"
                        id="product-barcode"
                        inputmode="numeric"
                        placeholder="بارکد کالا"
                    >

                </div>

                <div class="form-field">

                    <label for="product-name">
                        نام کالا
                    </label>

                    <input
                        type="text"
                        id="product-name"
                        placeholder="مثلاً نوشابه"
                    >

                </div>

                <div class="form-field">

                    <label for="product-category">
                        دسته‌بندی
                    </label>

                    <input
                        type="text"
                        id="product-category"
                        placeholder="مثلاً نوشیدنی"
                    >

                </div>

                <div class="form-field">

                    <label for="product-price">
                        قیمت فروش
                    </label>

                    <input
                        type="number"
                        id="product-price"
                        inputmode="numeric"
                        min="0"
                        placeholder="قیمت به تومان"
                    >

                </div>

                <div class="form-field">

                    <label for="product-stock">
                        موجودی
                    </label>

                    <input
                        type="number"
                        id="product-stock"
                        inputmode="numeric"
                        min="0"
                        value="0"
                        placeholder="تعداد موجود"
                    >

                </div>

                <div class="product-form-actions">

                    <button
                        type="button"
                        class="cancel-product-button"
                        id="cancel-product-button"
                    >
                        انصراف
                    </button>

                    <button
                        type="button"
                        class="save-product-button"
                        id="save-product-button"
                    >
                        ذخیره کالا
                    </button>

                </div>

            </div>

        </div>

        <div class="products-placeholder">

            <div class="placeholder-icon">
                📦
            </div>

            <h3>
                هنوز کالایی نمایش داده نشده است
            </h3>

            <p>
                در مرحله بعد کالاها را در این قسمت نمایش می‌دهیم.
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

    setupProductForm(screen);

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
// Product Form
// ============================================================================

function setupProductForm(screen) {

    const addButton =
        screen.querySelector(
            '#add-product-button'
        );

    const formContainer =
        screen.querySelector(
            '#product-form-container'
        );

    const closeButton =
        screen.querySelector(
            '#close-product-form'
        );

    const cancelButton =
        screen.querySelector(
            '#cancel-product-button'
        );

    if (!addButton || !formContainer) {
        return;
    }

    addButton.addEventListener(
        'click',
        () => {

            formContainer.style.display =
                'block';

            const barcodeInput =
                screen.querySelector(
                    '#product-barcode'
                );

            if (barcodeInput) {
                barcodeInput.focus();
            }
        }
    );

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            () => {
                formContainer.style.display =
                    'none';
            }
        );
    }

    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            () => {
                formContainer.style.display =
                    'none';
            }
        );
    }
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
                    return;
                }
            }
        );
    });
}

// ============================================================================
// Database
// ============================================================================

async function setupDatabase() {

    try {

        await initializeDatabase();

        APP_STATE.databaseReady = true;

        showDatabaseStatus(
            '✅ پایگاه داده با موفقیت آماده شد',
            true
        );

    } catch (error) {

        APP_STATE.databaseReady = false;

        showDatabaseStatus(
            '❌ خطا در راه‌اندازی پایگاه داده',
            false
        );

        console.error(
            'Database error:',
            error
        );
    }
}

// ============================================================================
// Initialize Application
// ============================================================================

async function initializeApp() {

    if (APP_STATE.initialized) {
        return;
    }

    cacheDOM();

    if (!DOM.app) {
        return;
    }

    setApplicationStatus();

    setupNavigation();

    APP_STATE.initialized = true;

    await setupDatabase();
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
