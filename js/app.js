// js/app.js
// SupermarketPOS
// Main Application
// Complete Replacement

'use strict';

import {
    initializeDatabase,
    addProduct,
    getAllProducts,
    getProductsForBackup,
    restoreProductsMerge
} from './database.js';

import {
    initializeSalesScreen
} from './sales.js';


/* ============================================================
   State
   ============================================================ */

const APP_STATE = {

    initialized: false,

    databaseReady: false

};


const DOM = {

    app: null

};


/* ============================================================
   Escape HTML
   ============================================================ */

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


/* ============================================================
   Toast
   ============================================================ */

let toastTimer = null;


export function showAppMessage(
    message,
    type = 'success'
) {

    const toast =
        document.getElementById(
            'app-toast'
        );

    const messageElement =
        document.getElementById(
            'app-toast-message'
        );

    const iconElement =
        document.getElementById(
            'app-toast-icon'
        );


    if (!toast || !messageElement) {
        return;
    }


    if (toastTimer) {

        clearTimeout(
            toastTimer
        );

    }


    toast.className =
        `app-toast app-toast-${type}`;


    messageElement.textContent =
        message;


    if (iconElement) {

        iconElement.textContent =
            type === 'danger'
                ? '!'
                : type === 'info'
                    ? 'i'
                    : '✓';

    }


    toast.classList.remove(
        'app-toast-hide'
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.add(
                    'app-toast-hide'
                );

            },
            2800
        );

}


/* ============================================================
   Global Modal
   ============================================================ */

export function showAppConfirm(
    options = {}
) {

    return new Promise(
        resolve => {

            const modal =
                document.getElementById(
                    'app-modal'
                );


            if (!modal) {

                resolve(false);

                return;
            }


            const dialog =
                modal.querySelector(
                    '.app-modal-dialog'
                );


            const icon =
                document.getElementById(
                    'app-modal-icon'
                );


            const title =
                document.getElementById(
                    'app-modal-title'
                );


            const message =
                document.getElementById(
                    'app-modal-message'
                );


            const cancel =
                document.getElementById(
                    'app-modal-cancel'
                );


            const confirm =
                document.getElementById(
                    'app-modal-confirm'
                );


            if (
                !dialog ||
                !icon ||
                !title ||
                !message ||
                !cancel ||
                !confirm
            ) {

                resolve(false);

                return;
            }


            const type =
                options.type ||
                'info';


            dialog.className =
                `app-modal-dialog ${type}`;


            icon.textContent =
                options.icon ||
                '❔';


            title.textContent =
                options.title ||
                'تأیید عملیات';


            message.textContent =
                options.message ||
                'آیا از انجام این عملیات مطمئن هستید؟';


            cancel.textContent =
                options.cancelText ||
                'انصراف';


            confirm.textContent =
                options.confirmText ||
                'تأیید';


            modal.classList.add(
                'is-open'
            );


            modal.setAttribute(
                'aria-hidden',
                'false'
            );


            let finished = false;


            function finish(result) {

                if (finished) {
                    return;
                }


                finished = true;


                modal.classList.remove(
                    'is-open'
                );


                modal.setAttribute(
                    'aria-hidden',
                    'true'
                );


                cancel.onclick =
                    null;

                confirm.onclick =
                    null;


                resolve(result);

            }


            cancel.onclick =
                () => {

                    finish(false);

                };


            confirm.onclick =
                () => {

                    finish(true);

                };


            const backdrop =
                modal.querySelector(
                    '.app-modal-backdrop'
                );


            if (backdrop) {

                backdrop.onclick =
                    () => {

                        finish(false);

                    };

            }


            modal.onkeydown =
                event => {

                    if (
                        event.key ===
                        'Escape'
                    ) {

                        finish(false);

                    }

                };


            setTimeout(
                () => {

                    confirm.focus();

                },
                30
            );

        }
    );

}


/* ============================================================
   Header
   ============================================================ */

function setupHeaderStatus() {

    const online =
        document.querySelector(
            '.status-online'
        );


    if (online) {

        online.innerHTML = `

            <span class="status-icon">
                ●
            </span>

            <div class="status-info">

                <span class="status-label">
                    پایگاه داده
                </span>

                <strong>
                    محلی
                </strong>

            </div>

        `;

    }

}


/* ============================================================
   Database Status
   ============================================================ */

function showDatabaseStatus(
    message,
    success = true
) {

    const existing =
        document.getElementById(
            'database-test-status'
        );


    if (existing) {

        existing.remove();

    }


    const status =
        document.createElement(
            'div'
        );


    status.id =
        'database-test-status';


    status.style.cssText = `

        margin-top:14px;

        padding:12px 14px;

        border-radius:12px;

        font-size:11px;

        text-align:center;

        border:1px solid;

        background:
            ${success ? '#ecfdf5' : '#fef2f2'};

        color:
            ${success ? '#047857' : '#b91c1c'};

        border-color:
            ${success ? '#a7f3d0' : '#fecaca'};

    `;


    status.textContent =
        message;


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


/* ============================================================
   Hide Screens
   ============================================================ */

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

    }


    if (products) {

        products.style.display =
            'none';

    }

}


/* ============================================================
   Home
   ============================================================ */

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


/* ============================================================
   Sales
   ============================================================ */

function openSalesScreen() {

    const main =
        document.querySelector(
            'main'
        );


    if (!main) {
        return;
    }


    const home =
        document.querySelector(
            '.home-screen'
        );


    if (home) {

        home.style.display =
            'none';

    }


    const products =
        document.getElementById(
            'products-screen'
        );


    if (products) {

        products.style.display =
            'none';

    }


    let sales =
        document.getElementById(
            'sales-screen'
        );


    if (!sales) {

        sales =
            document.createElement(
                'section'
            );


        sales.id =
            'sales-screen';


        sales.className =
            'sales-screen';


        main.appendChild(
            sales
        );

    }


    sales.style.display =
        'block';


    initializeSalesScreen(
        sales,
        {
            databaseReady:
                APP_STATE.databaseReady
        }
    );

}


/* ============================================================
   Products
   ============================================================ */

async function openProductsScreen() {

    const main =
        document.querySelector(
            'main'
        );


    if (!main) {
        return;
    }


    const home =
        document.querySelector(
            '.home-screen'
        );


    if (home) {

        home.style.display =
            'none';

    }


    const sales =
        document.getElementById(
            'sales-screen'
        );


    if (sales) {

        sales.style.display =
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


    await loadProducts(
        products
    );

}


/* ============================================================
   Create Products Screen
   ============================================================ */

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

            <div class="products-header-main">

                <div class="products-title-icon">
                    📦
                </div>

                <div>

                    <h2>
                        مدیریت کالاها
                    </h2>

                    <p>
                        مدیریت محصولات و موجودی فروشگاه
                    </p>

                </div>

            </div>

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
            style="display:none;"
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

                    <label>
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

                    <label>
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

                    <label>
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

                    <label>
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

                    <label>
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
            showHomeScreen
        );

    }


    return screen;

}


/* ============================================================
   Product Form
   ============================================================ */

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


    addButton.addEventListener(
        'click',
        () => {

            clearProductMessage(
                screen
            );


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


    if (!saveButton) {
        return;
    }


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
                Number(
                    priceText
                );


            const stock =
                stockText === ''
                    ? 0
                    : Number(
                        stockText
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

                barcode,

                name,

                category,

                salePrice:
                    price,

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
                    '✓ کالا با موفقیت ذخیره شد.',
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
                    'Product save error:',
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


/* ============================================================
   Load Products
   ============================================================ */

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
            'Products load error:',
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


/* ============================================================
   Render Products
   ============================================================ */

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
            ${products.length.toLocaleString('fa-IR')}
            کالا
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


/* ============================================================
   Backup
   ============================================================ */

function setupBackup(screen) {

    const button =
        screen.querySelector(
            '#backup-button'
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        'click',
        async () => {

            try {

                button.disabled =
                    true;


                button.textContent =
                    'در حال آماده‌سازی...';


                const backup =
                    await getProductsForBackup();


                const blob =
                    new Blob(
                        [
                            JSON.stringify(
                                backup,
                                null,
                                2
                            )
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


                showAppMessage(
                    'پشتیبان با موفقیت ایجاد شد.',
                    'success'
                );


            } catch (error) {

                console.error(
                    'Backup error:',
                    error
                );


                showAppMessage(
                    'پشتیبان‌گیری انجام نشد.',
                    'danger'
                );


            } finally {

                button.disabled =
                    false;


                button.textContent =
                    '💾 پشتیبان‌گیری';

            }

        }
    );

}


/* ============================================================
   Restore
   ============================================================ */

function setupRestore(screen) {

    const button =
        screen.querySelector(
            '#restore-button'
        );


    const input =
        screen.querySelector(
            '#restore-file-input'
        );


    if (!button || !input) {
        return;
    }


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
                event.target.files &&
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
                    !backup ||
                    backup.type !==
                        'SupermarketPOS' ||
                    !Array.isArray(
                        backup.products
                    )
                ) {

                    throw new Error(
                        'Invalid backup'
                    );

                }


                const confirmed =
                    await showAppConfirm({

                        title:
                            'بازیابی اطلاعات',

                        message:
                            `فایل شامل ${backup.products.length.toLocaleString('fa-IR')} کالا است.\n\nکالاهای موجود با اطلاعات فایل ادغام می‌شوند.`,

                        icon:
                            '📂',

                        type:
                            'info',

                        confirmText:
                            'بازیابی'

                    });


                if (!confirmed) {
                    return;
                }


                await restoreProductsMerge(
                    backup.products
                );


                await loadProducts(
                    screen
                );


                showAppMessage(
                    'بازیابی با موفقیت انجام شد.',
                    'success'
                );


            } catch (error) {

                console.error(
                    'Restore error:',
                    error
                );


                showAppMessage(
                    'فایل پشتیبان معتبر نیست یا بازیابی انجام نشد.',
                    'danger'
                );

            } finally {

                input.value =
                    '';

            }

        }
    );

}


/* ============================================================
   Product Messages
   ============================================================ */

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


    box.className =
        `product-form-message ${
            success
                ? 'message-success'
                : 'message-danger'
        }`;

}


function clearProductMessage(
    screen
) {

    const box =
        screen.querySelector(
            '#product-form-message'
        );


    if (!box) {
        return;
    }


    box.textContent =
        '';


    box.className =
        'product-form-message';

}


/* ============================================================
   Navigation
   ============================================================ */

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
                        'reports' ||
                        action ===
                        'settings'
                    ) {

                        showAppMessage(
                            'این بخش در مرحله بعد فعال می‌شود.',
                            'info'
                        );

                    }

                }
            );

        }
    );

}


/* ============================================================
   Database
   ============================================================ */

async function setupDatabase() {

    try {

        await initializeDatabase();


        APP_STATE.databaseReady =
            true;


        showDatabaseStatus(
            '✓ پایگاه داده با موفقیت آماده شد',
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
            'Database error:',
            error
        );

    }

}


/* ============================================================
   Initialize
   ============================================================ */

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


/* ============================================================
   Bootstrap
   ============================================================ */

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
