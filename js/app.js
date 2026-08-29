// js/app.js
// SupermarketPOS
// Product List + Backup
// Stage 2

'use strict';

import {
    initializeDatabase,
    addProduct,
    getAllProducts,
    getProductsForBackup
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

function showDatabaseStatus(
    message,
    success = true
) {

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

    status.textContent =
        message;
}


// ============================================================================
// Header
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
// Hide Secondary Screens
// ============================================================================

function hideSecondaryScreens() {

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
}


// ============================================================================
// Home
// ============================================================================

function showHomeScreen() {

    hideSecondaryScreens();

    const home =
        document.querySelector(
            '.home-screen'
        );

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

    sales.style.display =
        'block';
}


// ============================================================================
// Sales Screen
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

async function openProductsScreen() {

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

    products.style.display =
        'block';

    await loadProducts(
        products
    );
}


// ============================================================================
// Products Screen
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


        <!-- Product Actions -->

        <div class="products-actions">

            <button
                type="button"
                class="add-product-button"
                id="add-product-button"
            >
                ＋ افزودن کالا
            </button>

        </div>


        <!-- Backup -->

        <div class="backup-card">

            <div class="backup-card-icon">
                💾
            </div>

            <div class="backup-card-content">

                <h3>
                    پشتیبان اطلاعات
                </h3>

                <p>
                    ذخیره کالاهای این دستگاه در یک فایل
                </p>

            </div>

            <button
                type="button"
                class="backup-button"
                id="backup-button"
            >
                پشتیبان‌گیری
            </button>

        </div>


        <!-- Product Form -->

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
                        autocomplete="off"
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
                        autocomplete="off"
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
                        autocomplete="off"
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
                        step="1"
                        autocomplete="off"
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
                        step="1"
                        autocomplete="off"
                        value=""
                        placeholder="موجودی"
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


        <!-- Products List -->

        <div
            id="products-list"
            class="products-list"
        ></div>


        <!-- Back -->

        <button
            type="button"
            class="products-back-button"
            id="products-back-button"
        >
            ← بازگشت به صفحه اصلی
        </button>

    `;

    setupProductForm(
        screen
    );

    setupBackup(
        screen
    );


    const back =
        screen.querySelector(
            '#products-back-button'
        );

    if (back) {

        back.addEventListener(
            'click',
            () => {

                clearProductMessage(
                    screen
                );

                showHomeScreen();
            }
        );
    }

    return screen;
}


// ============================================================================
// Backup
// ============================================================================

function setupBackup(screen) {

    const backupButton =
        screen.querySelector(
            '#backup-button'
        );

    if (!backupButton) {
        return;
    }


    backupButton.addEventListener(
        'click',
        async () => {

            if (
                !APP_STATE.databaseReady
            ) {

                showBackupMessage(
                    screen,
                    '❌ پایگاه داده آماده نیست.',
                    false
                );

                return;
            }


            backupButton.disabled =
                true;

            backupButton.textContent =
                'در حال آماده‌سازی...';


            try {

                const backup =
                    await getProductsForBackup();


                const json =
                    JSON.stringify(
                        backup,
                        null,
                        2
                    );


                const blob =
                    new Blob(
                        [
                            json
                        ],
                        {
                            type:
                                'application/json;charset=utf-8'
                        }
                    );


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        'a'
                    );


                const date =
                    new Date();


                const dateText =
                    date
                        .toISOString()
                        .replace(
                            /[:.]/g,
                            '-'
                        );


                link.href =
                    url;

                link.download =
                    `SupermarketPOS-Backup-${dateText}.json`;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();


                URL.revokeObjectURL(
                    url
                );


                const count =
                    Array.isArray(
                        backup.products
                    )
                        ? backup.products.length
                        : 0;


                showBackupMessage(
                    screen,
                    `✅ پشتیبان ${count.toLocaleString('fa-IR')} کالا با موفقیت ساخته شد.`,
                    true
                );


            } catch (error) {

                console.error(
                    'SupermarketPOS: خطا در پشتیبان‌گیری.',
                    error
                );


                showBackupMessage(
                    screen,
                    '❌ ساخت فایل پشتیبان انجام نشد.',
                    false
                );


            } finally {

                backupButton.disabled =
                    false;

                backupButton.textContent =
                    'پشتیبان‌گیری';
            }
        }
    );
}


// ============================================================================
// Backup Message
// ============================================================================

function showBackupMessage(
    screen,
    message,
    success = true
) {

    let messageBox =
        screen.querySelector(
            '#backup-message'
        );


    if (!messageBox) {

        messageBox =
            document.createElement(
                'div'
            );

        messageBox.id =
            'backup-message';

        messageBox.className =
            'backup-message';

        const backupCard =
            screen.querySelector(
                '.backup-card'
            );

        if (backupCard) {

            backupCard.insertAdjacentElement(
                'afterend',
                messageBox
            );
        }
    }


    messageBox.style.display =
        'block';

    messageBox.style.background =
        success
            ? '#ecfdf5'
            : '#fef2f2';

    messageBox.style.color =
        success
            ? '#047857'
            : '#b91c1c';

    messageBox.style.border =
        success
            ? '1px solid #a7f3d0'
            : '1px solid #fecaca';

    messageBox.textContent =
        message;
}


// ============================================================================
// Load Products
// ============================================================================

async function loadProducts(screen) {

    const list =
        screen.querySelector(
            '#products-list'
        );

    if (!list) {
        return;
    }


    list.innerHTML = `

        <div class="products-loading">

            <div class="placeholder-icon">
                ⏳
            </div>

            <p>
                در حال خواندن کالاها...
            </p>

        </div>
    `;


    try {

        const products =
            await getAllProducts();


        renderProducts(
            screen,
            products
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: خطا در خواندن کالاها.',
            error
        );


        list.innerHTML = `

            <div class="products-empty products-error">

                <div class="placeholder-icon">
                    ⚠️
                </div>

                <h3>
                    خطا در خواندن کالاها
                </h3>

                <p>
                    اطلاعات کالاها قابل دریافت نیست.
                </p>

            </div>
        `;
    }
}


// ============================================================================
// Render Products
// ============================================================================

function renderProducts(
    screen,
    products
) {

    const list =
        screen.querySelector(
            '#products-list'
        );

    if (!list) {
        return;
    }


    list.innerHTML = '';


    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        list.innerHTML = `

            <div class="products-empty">

                <div class="placeholder-icon">
                    📦
                </div>

                <h3>
                    هنوز کالایی ثبت نشده است
                </h3>

                <p>
                    برای شروع، اولین کالای فروشگاه را اضافه کنید.
                </p>

            </div>
        `;

        return;
    }


    const title =
        document.createElement(
            'div'
        );


    title.className =
        'products-list-title';


    title.innerHTML = `
        <strong>
            کالاهای ثبت‌شده
        </strong>

        <span>
            ${products.length.toLocaleString('fa-IR')} کالا
        </span>
    `;


    list.appendChild(
        title
    );


    products.forEach(
        product => {

            list.appendChild(
                createProductCard(
                    product
                )
            );
        }
    );
}


// ============================================================================
// Product Card
// ============================================================================

function createProductCard(
    product
) {

    const card =
        document.createElement(
            'article'
        );


    card.className =
        'product-card';


    const barcode =
        product.barcode || '-';


    const name =
        product.name || 'بدون نام';


    const category =
        product.category ||
        'بدون دسته‌بندی';


    const price =
        Number(
            product.salePrice
        );


    const stock =
        Number(
            product.stock
        );


    const safePrice =
        Number.isFinite(price)
            ? price.toLocaleString('fa-IR')
            : '۰';


    const safeStock =
        Number.isFinite(stock)
            ? stock.toLocaleString('fa-IR')
            : '۰';


    card.innerHTML = `

        <div class="product-card-top">

            <div class="product-card-icon">
                📦
            </div>

            <div class="product-card-info">

                <h3>
                    ${escapeHTML(name)}
                </h3>

                <span>
                    ${escapeHTML(category)}
                </span>

            </div>

        </div>


        <div class="product-card-details">

            <div class="product-detail">

                <span>
                    بارکد
                </span>

                <strong>
                    ${escapeHTML(barcode)}
                </strong>

            </div>


            <div class="product-detail">

                <span>
                    قیمت فروش
                </span>

                <strong>
                    ${safePrice}
                    تومان
                </strong>

            </div>


            <div class="product-detail">

                <span>
                    موجودی
                </span>

                <strong>
                    ${safeStock}
                </strong>

            </div>

        </div>
    `;


    return card;
}


// ============================================================================
// Escape HTML
// ============================================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll(
            '&',
            '&amp;'
        )
        .replaceAll(
            '<',
            '&lt;'
        )
        .replaceAll(
            '>',
            '&gt;'
        )
        .replaceAll(
            '"',
            '&quot;'
        )
        .replaceAll(
            "'",
            '&#039;'
        );
}


// ============================================================================
// Clear Product Message
// ============================================================================

function clearProductMessage(
    screen
) {

    if (!screen) {
        return;
    }


    const message =
        screen.querySelector(
            '#product-form-message'
        );


    if (!message) {
        return;
    }


    message.textContent =
        '';


    message.removeAttribute(
        'style'
    );
}


// ============================================================================
// Product Message
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

function setupProductForm(
    screen
) {

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


    if (
        !addButton ||
        !form
    ) {
        return;
    }


    // ------------------------------------------------------------------------
    // Open
    // ------------------------------------------------------------------------

    addButton.addEventListener(
        'click',
        () => {

            clearProductMessage(
                screen
            );


            form.style.display =
                'block';


            const stockInput =
                screen.querySelector(
                    '#product-stock'
                );


            if (stockInput) {
                stockInput.value =
                    '';
            }


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
    // Close
    // ------------------------------------------------------------------------

    function closeForm() {

        clearProductMessage(
            screen
        );


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
    // Save
    // ------------------------------------------------------------------------

    if (saveButton) {

        saveButton.addEventListener(
            'click',
            async () => {

                clearProductMessage(
                    screen
                );


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


                const priceText =
                    priceInput.value.trim();


                const stockText =
                    stockInput.value.trim();


                const price =
                    Number(priceText);


                const stock =
                    stockText === ''
                        ? 0
                        : Number(stockText);


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
                    priceText === '' ||
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


                saveButton.disabled =
                    true;


                saveButton.textContent =
                    'در حال ذخیره...';


                try {

                    const productId =
                        await addProduct(
                            product
                        );


                    console.log(
                        'SupermarketPOS: Product saved:',
                        productId
                    );


                    showProductMessage(
                        screen,
                        '✅ کالا با موفقیت ذخیره شد.',
                        true
                    );


                    barcodeInput.value =
                        '';

                    nameInput.value =
                        '';

                    categoryInput.value =
                        '';

                    priceInput.value =
                        '';

                    stockInput.value =
                        '';


                    barcodeInput.focus();


                    await loadProducts(
                        screen
                    );


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


    cards.forEach(
        card => {

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
        }
    );
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
// Initialize
// ============================================================================

async function initializeApp() {

    if (
        APP_STATE.initialized
    ) {
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
