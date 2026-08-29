// js/app.js
// SupermarketPOS
// Product Save - Stage 3

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
            font-size: 11px;
            text-align: center;
            border: 1px solid;
        `;

        const home =
            document.querySelector(
                '.home-screen'
            );

        if (home) {
            home.appendChild(status);
        }
    }

    status.style.background =
        success
            ? '#ecfdf5'
            : '#fef2f2';

    status.style.color =
        success
            ? '#047857'
            : '#b91c1c';

    status.style.borderColor =
        success
            ? '#a7f3d0'
            : '#fecaca';

    status.textContent = message;
}

// ============================================================================
// Header Status
// ============================================================================

function setupHeaderStatus() {

    const headerStatus =
        document.querySelector(
            '.header-status'
        );

    if (!headerStatus) {
        return;
    }

    const ready =
        headerStatus.querySelector(
            '.status-ready'
        );

    const online =
        headerStatus.querySelector(
            '.status-online'
        );

    if (ready) {

        ready.textContent =
            'آماده به کار';
    }

    if (online) {

        online.textContent =
            '● آنلاین';
    }
}

// ============================================================================
// Home
// ============================================================================

function showHomeScreen() {

    const home =
        document.querySelector(
            '.home-screen'
        );

    const sales =
        document.getElementById(
            'sales-screen'
        );

    const products =
        document.getElementById(
            'products-screen'
        );

    if (sales) {
        sales.style.display = 'none';
    }

    if (products) {
        products.style.display = 'none';
    }

    if (home) {
        home.style.display = '';
    }
}

// ============================================================================
// Sales
// ============================================================================

function openSalesScreen() {

    const main =
        document.querySelector('main');

    if (!main) {
        return;
    }

    const home =
        document.querySelector(
            '.home-screen'
        );

    if (home) {
        home.style.display = 'none';
    }

    const products =
        document.getElementById(
            'products-screen'
        );

    if (products) {
        products.style.display = 'none';
    }

    let sales =
        document.getElementById(
            'sales-screen'
        );

    if (!sales) {

        sales =
            createSalesScreen();

        main.appendChild(sales);
    }

    sales.style.display = 'block';
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

    const back =
        screen.querySelector(
            '#sales-back-button'
        );

    if (back) {

        back.addEventListener(
            'click',
            showHomeScreen
        );
    }

    return screen;
}

// ============================================================================
// Products
// ============================================================================

function openProductsScreen() {

    const main =
        document.querySelector('main');

    if (!main) {
        return;
    }

    const home =
        document.querySelector(
            '.home-screen'
        );

    if (home) {
        home.style.display = 'none';
    }

    const sales =
        document.getElementById(
            'sales-screen'
        );

    if (sales) {
        sales.style.display = 'none';
    }

    let products =
        document.getElementById(
            'products-screen'
        );

    if (!products) {

        products =
            createProductsScreen();

        main.appendChild(products);
    }

    products.style.display = 'block';
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

                <div
                    id="product-form-message"
                    class="product-form-message"
                    aria-live="polite"
                ></div>

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

    const back =
        screen.querySelector(
            '#products-back-button'
        );

    if (back) {

        back.addEventListener(
            'click',
            showHomeScreen
        );
    }

    return screen;
}

// ============================================================================
// Product Form Message
// ============================================================================

function showProductMessage(
    screen,
    message,
    success = true
) {

    const messageBox =
        screen.querySelector(
            '#product-form-message'
        );

    if (!messageBox) {
        return;
    }

    messageBox.style.marginTop =
        '12px';

    messageBox.style.padding =
        '11px 12px';

    messageBox.style.borderRadius =
        '11px';

    messageBox.style.fontSize =
        '12px';

    messageBox.style.textAlign =
        'center';

    messageBox.style.border =
        '1px solid';

    messageBox.style.background =
        success
            ? '#ecfdf5'
            : '#fef2f2';

    messageBox.style.color =
        success
            ? '#047857'
            : '#b91c1c';

    messageBox.style.borderColor =
        success
            ? '#a7f3d0'
            : '#fecaca';

    messageBox.textContent =
        message;
}

// ============================================================================
// Product Form
// ============================================================================

function setupProductForm(screen) {

    const addButton =
        screen.querySelector(
            '#add-product-button'
        );

    const form =
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

    if (!addButton || !form) {
        return;
    }

    // ------------------------------------------------------------------------
    // Open Form
    // ------------------------------------------------------------------------

    addButton.addEventListener(
        'click',
        () => {

            form.style.display =
                'block';

            const barcode =
                screen.querySelector(
                    '#product-barcode'
                );

            if (barcode) {
                barcode.focus();
            }
        }
    );

    // ------------------------------------------------------------------------
    // Close Form
    // ------------------------------------------------------------------------

    function closeForm() {

        form.style.display =
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

                if (
                    !APP_STATE.databaseReady
                ) {

                    showProductMessage(
                        screen,
                        '❌ پایگاه داده آماده نیست.',
                        false
                    );

                    return;
                }

                const barcodeInput =
                    screen.querySelector(
                        '#product-barcode'
                    );

                const nameInput =
                    screen.querySelector(
                        '#product-name'
                    );

                const categoryInput =
                    screen.querySelector(
                        '#product-category'
                    );

                const priceInput =
                    screen.querySelector(
                        '#product-price'
                    );

                const stockInput =
                    screen.querySelector(
                        '#product-stock'
                    );

                const barcode =
                    barcodeInput.value.trim();

                const name =
                    nameInput.value.trim();

                const category =
                    categoryInput.value.trim();

                const price =
                    Number(
                        priceInput.value
                    );

                const stock =
                    Number(
                        stockInput.value
                    );

                // ------------------------------------------------------------
                // Validation
                // ------------------------------------------------------------

                if (!barcode) {

                    showProductMessage(
                        screen,
                        '⚠️ بارکد را وارد کنید.',
                        false
                    );

                    barcodeInput.focus();

                    return;
                }

                if (!name) {

                    showProductMessage(
                        screen,
                        '⚠️ نام کالا را وارد کنید.',
                        false
                    );

                    nameInput.focus();

                    return;
                }

                if (
                    !Number.isFinite(price) ||
                    price < 0
                ) {

                    showProductMessage(
                        screen,
                        '⚠️ قیمت فروش را صحیح وارد کنید.',
                        false
                    );

                    priceInput.focus();

                    return;
                }

                if (
                    !Number.isFinite(stock) ||
                    stock < 0
                ) {

                    showProductMessage(
                        screen,
                        '⚠️ موجودی را صحیح وارد کنید.',
                        false
                    );

                    stockInput.focus();

                    return;
                }

                const now =
                    new Date().toISOString();

                const product = {

                    barcode: barcode,

                    name: name,

                    category: category,

                    salePrice: price,

                    stock: stock,

                    createdAt: now,

                    updatedAt: now
                };

                // ------------------------------------------------------------
                // Save
                // ------------------------------------------------------------

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    'در حال ذخیره...';

                showProductMessage(
                    screen,
                    'در حال ذخیره کالا...',
                    true
                );

                try {

                    const productId =
                        await addProduct(
                            product
                        );

                    console.log(
                        'Product saved:',
                        productId
                    );

                    showProductMessage(
                        screen,
                        '✅ کالا با موفقیت ذخیره شد.',
                        true
                    );

                    // --------------------------------------------------------
                    // Clear Form
                    // --------------------------------------------------------

                    barcodeInput.value =
                        '';

                    nameInput.value =
                        '';

                    categoryInput.value =
                        '';

                    priceInput.value =
                        '';

                    stockInput.value =
                        '0';

                    barcodeInput.focus();

                } catch (error) {

                    console.error(
                        'SupermarketPOS: خطا در ذخیره کالا.',
                        error
                    );

                    if (
                        error &&
                        error.name ===
                            'ConstraintError'
                    ) {

                        showProductMessage(
                            screen,
                            '⚠️ این بارکد قبلاً ثبت شده است.',
                            false
                        );

                    } else {

                        showProductMessage(
                            screen,
                            '❌ ذخیره کالا انجام نشد.',
                            false
                        );
                    }

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

    const cards =
        document.querySelectorAll(
            '.menu-card'
        );

    cards.forEach(card => {

        card.addEventListener(
            'click',
            () => {

                const action =
                    card.getAttribute(
                        'data-action'
                    );

                if (
                    action === 'sales'
                ) {

                    openSalesScreen();

                    return;
                }

                if (
                    action === 'products'
                ) {

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

        APP_STATE.databaseReady =
            true;

        showDatabaseStatus(
            '✅ پایگاه داده با موفقیت آماده شد',
            true
        );

    } catch (error) {

        APP_STATE.databaseReady =
            false;

        showDatabaseStatus(
            '❌ خطا در راه‌اندازی پایگاه داده',
            false
        );

        console.error(
            'SupermarketPOS: خطای دیتابیس',
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

    DOM.app =
        document.querySelector(
            '#app'
        );

    if (!DOM.app) {
        return;
    }

    setupHeaderStatus();

    setupNavigation();

    APP_STATE.initialized =
        true;

    await setupDatabase();
}

// ============================================================================
// Bootstrap
// ============================================================================

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
