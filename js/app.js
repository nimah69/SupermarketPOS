// js/app.js
// SupermarketPOS
// Main Application
// Stage 6
// Products + Sales + Backup / Restore

'use strict';

import {
    initializeDatabase,
    addProduct,
    getAllProducts,
    getProductsForBackup,
    restoreProductsMerge
} from './database.js';

import {
    createSalesScreen
} from './sales.js';


// ============================================================================
// Application State
// ============================================================================

const APP_STATE = {

    initialized:
        false,

    databaseReady:
        false
};


// ============================================================================
// DOM
// ============================================================================

const DOM = {

    app:
        null
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
            document.createElement(
                'div'
            );


        status.id =
            'database-test-status';


        const home =
            document.querySelector(
                '.home-screen'
            );


        if (home) {

            home.appendChild(
                status
            );
        }
    }


    status.style.cssText = `

        margin-top: 14px;

        padding: 12px 14px;

        border-radius: 12px;

        font-size: 11px;

        text-align: center;

        border: 1px solid;

        background:
            ${success ? '#ecfdf5' : '#fef2f2'};

        color:
            ${success ? '#047857' : '#b91c1c'};

        border-color:
            ${success ? '#a7f3d0' : '#fecaca'};

    `;


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

        const strong =
            ready.querySelector(
                'strong'
            );


        if (strong) {

            strong.textContent =
                'آماده به کار';
        }
    }


    if (online) {

        const strong =
            online.querySelector(
                'strong'
            );


        if (strong) {

            strong.textContent =
                'آنلاین';
        }
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

        sales.style.display =
            'none';

        sales.setAttribute(
            'aria-hidden',
            'true'
        );
    }


    if (products) {

        products.style.display =
            'none';

        products.setAttribute(
            'aria-hidden',
            'true'
        );
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

        home.style.display =
            '';
    }
}


// ============================================================================
// Sales
// ============================================================================

function openSalesScreen() {

    const main =
        document.querySelector(
            'main'
        );


    if (!main) {

        console.error(
            'SupermarketPOS: عنصر main پیدا نشد.'
        );

        return;
    }


    hideSecondaryScreens();


    const home =
        document.querySelector(
            '.home-screen'
        );


    if (home) {

        home.style.display =
            'none';
    }


    let sales =
        document.getElementById(
            'sales-screen'
        );


    if (!sales) {

        sales =
            createSalesScreen();


        main.appendChild(
            sales
        );
    }


    sales.style.display =
        'block';


    sales.setAttribute(
        'aria-hidden',
        'false'
    );


    const barcodeInput =
        document.getElementById(
            'sales-barcode-input'
        );


    if (barcodeInput) {

        setTimeout(
            () => {

                barcodeInput.focus();

            },
            100
        );
    }
}


// ============================================================================
// Products
// ============================================================================

async function openProductsScreen() {

    const main =
        document.querySelector(
            'main'
        );


    if (!main) {
        return;
    }


    hideSecondaryScreens();


    const home =
        document.querySelector(
            '.home-screen'
        );


    if (home) {

        home.style.display =
            'none';
    }


    let products =
        document.getElementById(
            'products-screen'
        );


    if (!products) {

        products =
            createProductsScreen();


        main.appendChild(
            products
        );
    }


    products.style.display =
        'block';


    products.setAttribute(
        'aria-hidden',
        'false'
    );


    await loadProducts(
        products
    );
}


// ============================================================================
// Products Screen
// ============================================================================

function createProductsScreen() {

    const screen =
        document.createElement(
            'section'
        );


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


        <div class="backup-card">

            <div class="backup-card-icon">
                💾
            </div>

            <div class="backup-card-content">

                <h3>
                    پشتیبان اطلاعات
                </h3>

                <p>
                    ذخیره یا بازیابی کالاهای این دستگاه
                </p>

            </div>

            <div class="backup-actions">

                <button
                    type="button"
                    class="backup-button"
                    id="backup-button"
                >
                    💾 پشتیبان‌گیری
                </button>

                <button
                    type="button"
                    class="restore-button"
                    id="restore-button"
                >
                    📂 بازیابی
                </button>

                <input
                    type="file"
                    id="restore-file-input"
                    accept=".json,application/json"
                    hidden
                >

            </div>

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
                ></div>

            </div>

        </div>


        <div
            id="products-list"
            class="products-list"
        ></div>


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


    setupRestore(
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

                showHomeScreen();

            }
        );
    }


    return screen;
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


    addButton.addEventListener(
        'click',
        () => {

            form.style.display =
                'block';


            clearProductMessage(
                screen
            );


            const barcode =
                screen.querySelector(
                    '#product-barcode'
                );


            if (barcode) {

                barcode.focus();
            }
        }
    );


    const closeForm =
        () => {

            form.style.display =
                'none';

            clearProductMessage(
                screen
            );
        };


    closeButton.addEventListener(
        'click',
        closeForm
    );


    cancelButton.addEventListener(
        'click',
        closeForm
    );


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


            const price =
                Number(
                    priceInput.value
                );


            const stock =
                stockInput.value.trim() === ''
                    ? 0
                    : Number(
                        stockInput.value
                    );


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
                    '⚠️ قیمت فروش صحیح نیست.',
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
                    '⚠️ موجودی صحیح نیست.',
                    false
                );

                stockInput.focus();

                return;
            }


            const now =
                new Date()
                    .toISOString();


            const product = {

                barcode:
                    barcode,

                name:
                    name,

                category:
                    category,

                salePrice:
                    price,

                stock:
                    stock,

                createdAt:
                    now,

                updatedAt:
                    now
            };


            saveButton.disabled =
                true;


            saveButton.textContent =
                'در حال ذخیره...';


            try {

                await addProduct(
                    product
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


                await loadProducts(
                    screen
                );


                barcodeInput.focus();

            } catch (error) {

                console.error(
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


// ============================================================================
// Load Products
// ============================================================================

async function loadProducts(
    screen
) {

    const list =
        screen.querySelector(
            '#products-list'
        );


    if (!list) {
        return;
    }


    list.innerHTML =
        '<div class="products-loading">⏳ در حال خواندن کالاها...</div>';


    try {

        const products =
            await getAllProducts();


        renderProducts(
            screen,
            products
        );

    } catch (error) {

        console.error(
            error
        );


        list.innerHTML =
            '<div class="products-empty">❌ خطا در خواندن کالاها.</div>';
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


    list.innerHTML =
        '';


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

            const card =
                document.createElement(
                    'article'
                );


            card.className =
                'product-card';


            const price =
                Number(
                    product.salePrice
                ) || 0;


            const stock =
                Number(
                    product.stock
                ) || 0;


            card.innerHTML = `

                <div class="product-card-top">

                    <div class="product-card-icon">
                        📦
                    </div>

                    <div class="product-card-info">

                        <h3>
                            ${escapeHTML(
                                product.name ||
                                'بدون نام'
                            )}
                        </h3>

                        <span>
                            ${escapeHTML(
                                product.category ||
                                'بدون دسته‌بندی'
                            )}
                        </span>

                    </div>

                </div>


                <div class="product-card-details">

                    <div class="product-detail">

                        <span>
                            بارکد
                        </span>

                        <strong>
                            ${escapeHTML(
                                product.barcode ||
                                '-'
                            )}
                        </strong>

                    </div>


                    <div class="product-detail">

                        <span>
                            قیمت فروش
                        </span>

                        <strong>
                            ${price.toLocaleString('fa-IR')}
                            تومان
                        </strong>

                    </div>


                    <div class="product-detail">

                        <span>
                            موجودی
                        </span>

                        <strong>
                            ${stock.toLocaleString('fa-IR')}
                        </strong>

                    </div>

                </div>
            `;


            list.appendChild(
                card
            );
        }
    );
}


// ============================================================================
// Backup
// ============================================================================

function setupBackup(
    screen
) {

    const button =
        screen.querySelector(
            '#backup-button'
        );


    button.addEventListener(
        'click',
        async () => {

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
                        [json],
                        {
                            type:
                                'application/json'
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


                link.href =
                    url;


                link.download =
                    `SupermarketPOS-Backup-${Date.now()}.json`;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                URL.revokeObjectURL(
                    url
                );


            } catch (error) {

                console.error(
                    error
                );


                alert(
                    'ساخت فایل پشتیبان انجام نشد.'
                );
            }
        }
    );
}


// ============================================================================
// Restore
// ============================================================================

function setupRestore(
    screen
) {

    const button =
        screen.querySelector(
            '#restore-button'
        );


    const input =
        screen.querySelector(
            '#restore-file-input'
        );


    button.addEventListener(
        'click',
        () => {

            input.value =
                '';

            input.click();
        }
    );


    input.addEventListener(
        'change',
        async event => {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            try {

                const text =
                    await file.text();


                const backup =
                    JSON.parse(
                        text
                    );


                if (
                    backup.type !==
                    'SupermarketPOS'
                ) {

                    throw new Error(
                        'فایل متعلق به SupermarketPOS نیست.'
                    );
                }


                if (
                    !Array.isArray(
                        backup.products
                    )
                ) {

                    throw new Error(
                        'اطلاعات کالاها در فایل وجود ندارد.'
                    );
                }


                const confirmed =
                    window.confirm(
                        `فایل شامل ${backup.products.length.toLocaleString('fa-IR')} کالا است.\n\nآیا بازیابی و ادغام انجام شود؟`
                    );


                if (!confirmed) {
                    return;
                }


                const result =
                    await restoreProductsMerge(
                        backup.products
                    );


                alert(
                    `بازیابی انجام شد.\n\n` +
                    `اضافه‌شده: ${result.added.toLocaleString('fa-IR')}\n` +
                    `به‌روزرسانی‌شده: ${result.updated.toLocaleString('fa-IR')}\n` +
                    `ردشده: ${result.skipped.toLocaleString('fa-IR')}`
                );


                await loadProducts(
                    screen
                );

            } catch (error) {

                console.error(
                    error
                );


                alert(
                    '❌ فایل پشتیبان قابل بازیابی نیست.'
                );
            }
        }
    );
}


// ============================================================================
// Messages
// ============================================================================

function showProductMessage(
    screen,
    message,
    success
) {

    const box =
        screen.querySelector(
            '#product-form-message'
        );


    if (!box) {
        return;
    }


    box.textContent =
        message;


    box.style.cssText = `

        margin-top: 12px;

        padding: 11px;

        border-radius: 10px;

        text-align: center;

        font-size: 12px;

        background:
            ${success ? '#ecfdf5' : '#fef2f2'};

        color:
            ${success ? '#047857' : '#b91c1c'};

        border:
            1px solid
            ${success ? '#a7f3d0' : '#fecaca'};

    `;
}


function clearProductMessage(
    screen
) {

    const box =
        screen.querySelector(
            '#product-form-message'
        );


    if (box) {

        box.textContent =
            '';

        box.removeAttribute(
            'style'
        );
    }
}


// ============================================================================
// Escape HTML
// ============================================================================

function escapeHTML(
    value
) {

    return String(
        value
    )
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
                        action ===
                        'sales'
                    ) {

                        openSalesScreen();

                        return;
                    }


                    if (
                        action ===
                        'products'
                    ) {

                        openProductsScreen();

                        return;
                    }


                    if (
                        action ===
                        'reports'
                    ) {

                        alert(
                            'بخش گزارش‌ها در مرحله بعد اضافه خواهد شد.'
                        );

                        return;
                    }


                    if (
                        action ===
                        'settings'
                    ) {

                        alert(
                            'بخش تنظیمات در مرحله بعد اضافه خواهد شد.'
                        );
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

        console.error(
            'SupermarketPOS: عنصر app پیدا نشد.'
        );

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
