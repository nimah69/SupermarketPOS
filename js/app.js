// js/app.js
// SupermarketPOS
// Product Save - Stage 1

'use strict';

import {
    initializeDatabase,
    addProduct
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
// Product Form Message
// ============================================================================

function showProductMessage(
    screen,
    message,
    success = true
) {

    let messageBox =
        screen.querySelector(
            '#product-form-message'
        );

    if (!messageBox) {

        messageBox =
            document.createElement('div');

        messageBox.id =
            'product-form-message';

        messageBox.style.cssText = `
            margin-top: 12px;
            padding: 11px 12px;
            border-radius: 11px;
            font-size: 11px;
            text-align: center;
            border: 1px solid;
        `;

        const actions =
            screen.querySelector(
                '.product-form-actions'
            );

        if (actions) {
            actions.after(messageBox);
        }
    }

    messageBox.style.background =
        success ? '#ecfdf5' : '#fef2f2';

    messageBox.style.color =
        success ? '#047857' : '#b91c1c';

    messageBox.style.borderColor =
        success ? '#a7f3d0' : '#fecaca';

    messageBox.textContent =
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

    const saveButton =
        screen.querySelector(
            '#save-product-button'
        );

    if (!addButton || !formContainer) {
        return;
    }

    // ------------------------------------------------------------------------
    // Open Form
    // ------------------------------------------------------------------------

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

    // ------------------------------------------------------------------------
    // Close Form
    // ------------------------------------------------------------------------

    function closeForm() {

        formContainer.style.display =
            'none';
    }

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeForm
        );
    }

    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            closeForm
        );
    }

    // ------------------------------------------------------------------------
    // Save Product
    // ------------------------------------------------------------------------

    if (saveButton) {

        saveButton.addEventListener(
            'click',
            async () => {

                if (!APP_STATE.databaseReady) {

                    showProductMessage(
                        screen,
                        '❌ پایگاه داده آماده نیست.',
                        false
                    );

                    return;
                }

                const barcode =
                    screen.querySelector(
                        '#product-barcode'
                    ).value.trim();

                const name =
                    screen.querySelector(
                        '#product-name'
                    ).value.trim();

                const category =
                    screen.querySelector(
                        '#product-category'
                    ).value.trim();

                const price =
                    Number(
                        screen.querySelector(
                            '#product-price'
                        ).value
                    );

                const stock =
                    Number(
                        screen.querySelector(
                            '#product-stock'
                        ).value
                    );

                // ------------------------------------------------------------
                // Validation
                // ------------------------------------------------------------

                if (!barcode) {

                    showProductMessage(
                        screen,
                        '⚠️ بارکد کالا را وارد کنید.',
                        false
                    );

                    return;
                }

                if (!name) {

                    showProductMessage(
                        screen,
                        '⚠️ نام کالا را وارد کنید.',
                        false
                    );

                    return;
                }

                if (!Number.isFinite(price) || price < 0) {

                    showProductMessage(
                        screen,
                        '⚠️ قیمت فروش را صحیح وارد کنید.',
                        false
                    );

                    return;
                }

                if (!Number.isFinite(stock) || stock < 0) {

                    showProductMessage(
                        screen,
                        '⚠️ موجودی را صحیح وارد کنید.',
                        false
                    );

                    return;
                }

                // ------------------------------------------------------------
                // Product Object
                // ------------------------------------------------------------

                const product = {

                    barcode: barcode,

                    name: name,

                    category: category,

                    salePrice: price,

                    stock: stock,

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString()
                };

                // ------------------------------------------------------------
                // Save
                // ------------------------------------------------------------

                saveButton.disabled = true;

                saveButton.textContent =
                    'در حال ذخیره...';

                try {

                    await addProduct(product);

                    showProductMessage(
                        screen,
                        '✅ کالا با موفقیت ذخیره شد.',
                        true
                    );

                    // --------------------------------------------------------
                    // Clear Form
                    // --------------------------------------------------------

                    screen.querySelector(
                        '#product-barcode'
                    ).value = '';

                    screen.querySelector(
                        '#product-name'
                    ).value = '';

                    screen.querySelector(
                        '#product-category'
                    ).value = '';

                    screen.querySelector(
                        '#product-price'
                    ).value = '';

                    screen.querySelector(
                        '#product-stock'
                    ).value = '0';

                    screen.querySelector(
                        '#product-barcode'
                    ).focus();

                } catch (error) {

                    console.error(
                        'Product save error:',
                        error
                    );

                    showProductMessage(
                        screen,
                        '❌ ذخیره کالا انجام نشد.',
                        false
                    );

                } finally {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        'ذخیره کالا';
                }
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
