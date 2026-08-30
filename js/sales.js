// js/sales.js
// SupermarketPOS
// Sales / POS Module
// Unified Modal Architecture

'use strict';

import {
    getProductByBarcode,
    updateProduct,
    addSale
} from './database.js';

import {
    showAppConfirm,
    showAppMessage
} from './app.js';


// ============================================================
// Sales State
// ============================================================

const SALES_STATE = {

    initialized: false,

    cart: [],

    databaseReady: false,

    onBack: null

};


// ============================================================
// Helpers
// ============================================================

function $(selector, root = document) {

    return root.querySelector(selector);

}


function createElement(tag, className = '') {

    const element =
        document.createElement(tag);

    if (className) {
        element.className =
            className;
    }

    return element;

}


function formatPrice(value) {

    return (
        Number(value) || 0
    ).toLocaleString('fa-IR');

}


function formatNumber(value) {

    return (
        Number(value) || 0
    ).toLocaleString('fa-IR');

}


function escapeHTML(value) {

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

}


// ============================================================
// Initialize
// ============================================================

export function initializeSalesScreen(
    screen,
    options = {}
) {

    if (!screen) {
        return;
    }


    SALES_STATE.databaseReady =
        options.databaseReady !== false;


    SALES_STATE.onBack =
        typeof options.onBack === 'function'
            ? options.onBack
            : null;


    if (
        SALES_STATE.initialized &&
        screen.dataset.salesReady === 'true'
    ) {

        refreshSalesScreen(screen);

        return;
    }


    SALES_STATE.cart =
        [];


    buildSalesScreen(screen);

    bindSalesEvents(screen);


    SALES_STATE.initialized =
        true;


    screen.dataset.salesReady =
        'true';


    refreshSalesScreen(screen);

}


// ============================================================
// Build Sales Screen
// ============================================================

function buildSalesScreen(screen) {

    screen.innerHTML = `

        <div class="sales-header">

            <div class="sales-header-main">

                <div class="sales-title-icon">
                    🛒
                </div>

                <div>

                    <h2>
                        فروش و صندوق
                    </h2>

                    <p>
                        ثبت فروش و مدیریت سبد خرید
                    </p>

                </div>

            </div>

        </div>


        <div class="sales-layout">


            <section class="sales-card sales-search-card">

                <div class="sales-card-header">

                    <div>

                        <h3>
                            افزودن کالا
                        </h3>

                        <p>
                            بارکد کالا را وارد یا اسکن کنید
                        </p>

                    </div>

                    <span class="sales-card-icon">
                        🔎
                    </span>

                </div>


                <div class="sales-barcode-row">

                    <input
                        type="text"
                        id="sales-barcode-input"
                        class="sales-barcode-input"
                        inputmode="numeric"
                        autocomplete="off"
                        placeholder="بارکد کالا را وارد کنید..."
                    >

                    <button
                        type="button"
                        id="sales-add-button"
                        class="sales-add-button"
                    >
                        افزودن
                    </button>

                </div>


                <div
                    id="sales-search-message"
                    class="sales-message"
                ></div>

            </section>


            <section class="sales-card sales-cart-card">

                <div class="sales-card-header">

                    <div>

                        <h3>
                            سبد خرید
                        </h3>

                        <p id="sales-cart-count">
                            ۰ کالا
                        </p>

                    </div>

                    <span class="sales-card-icon">
                        🛍️
                    </span>

                </div>


                <div
                    id="sales-cart-list"
                    class="sales-cart-list"
                ></div>

            </section>


            <section class="sales-card sales-checkout-card">

                <div class="sales-summary">

                    <div class="sales-summary-row">

                        <span>
                            تعداد کالا
                        </span>

                        <strong id="sales-total-quantity">
                            ۰
                        </strong>

                    </div>


                    <div class="sales-summary-row">

                        <span>
                            مبلغ کل
                        </span>

                        <strong
                            id="sales-total-price"
                            class="sales-total-price"
                        >
                            ۰ تومان
                        </strong>

                    </div>

                </div>


                <button
                    type="button"
                    id="sales-submit-button"
                    class="sales-submit-button"
                >
                    ✓ ثبت فروش
                </button>


                <button
                    type="button"
                    id="sales-clear-button"
                    class="sales-clear-button"
                >
                    🗑️ خالی کردن سبد
                </button>


                <div
                    id="sales-checkout-message"
                    class="sales-message"
                ></div>

            </section>

        </div>


        <button
            type="button"
            class="sales-back-button"
            id="sales-back-button"
        >
            ← بازگشت به صفحه اصلی
        </button>

    `;

}


// ============================================================
// Events
// ============================================================

function bindSalesEvents(screen) {

    const barcodeInput =
        $('#sales-barcode-input', screen);

    const addButton =
        $('#sales-add-button', screen);

    const submitButton =
        $('#sales-submit-button', screen);

    const clearButton =
        $('#sales-clear-button', screen);

    const backButton =
        $('#sales-back-button', screen);


    if (barcodeInput) {

        barcodeInput.addEventListener(
            'keydown',
            event => {

                if (event.key === 'Enter') {

                    event.preventDefault();

                    addProductByBarcode(screen);

                }

            }
        );

    }


    if (addButton) {

        addButton.addEventListener(
            'click',
            () => {

                addProductByBarcode(screen);

            }
        );

    }


    if (submitButton) {

        submitButton.addEventListener(
            'click',
            () => {

                requestSaleConfirmation(screen);

            }
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            'click',
            () => {

                clearCart(screen);

            }
        );

    }


    if (backButton) {

        backButton.addEventListener(
            'click',
            () => {

                if (
                    SALES_STATE.cart.length > 0
                ) {

                    showAppConfirm({

                        title:
                            'خروج از فروش',

                        message:
                            'سبد خرید شما هنوز دارای کالا است. آیا می‌خواهید بدون ثبت فروش خارج شوید؟',

                        icon:
                            '⚠️',

                        type:
                            'warning',

                        confirmText:
                            'خروج',

                        cancelText:
                            'ادامه فروش'

                    }).then(
                        confirmed => {

                            if (confirmed) {

                                SALES_STATE.cart =
                                    [];

                                if (
                                    SALES_STATE.onBack
                                ) {

                                    SALES_STATE.onBack();

                                }

                            }

                        }
                    );

                } else {

                    if (
                        SALES_STATE.onBack
                    ) {

                        SALES_STATE.onBack();

                    }

                }

            }
        );

    }


    const list =
        $('#sales-cart-list', screen);


    if (list) {

        list.addEventListener(
            'click',
            event => {

                const button =
                    event.target.closest(
                        '[data-cart-action]'
                    );


                if (!button) {
                    return;
                }


                const index =
                    Number(
                        button.dataset.cartIndex
                    );


                if (
                    !Number.isInteger(index)
                ) {
                    return;
                }


                const action =
                    button.dataset.cartAction;


                if (action === 'increase') {

                    changeCartQuantity(
                        screen,
                        index,
                        1
                    );

                }


                if (action === 'decrease') {

                    changeCartQuantity(
                        screen,
                        index,
                        -1
                    );

                }


                if (action === 'remove') {

                    removeCartItem(
                        screen,
                        index
                    );

                }

            }
        );

    }

}


// ============================================================
// Add Product
// ============================================================

async function addProductByBarcode(screen) {

    const input =
        $('#sales-barcode-input', screen);

    const button =
        $('#sales-add-button', screen);


    if (!input) {
        return;
    }


    const barcode =
        input.value.trim();


    clearSalesMessages(screen);


    if (!barcode) {

        showSalesMessage(
            screen,
            '⚠️ ابتدا بارکد کالا را وارد کنید.',
            false
        );

        input.focus();

        return;
    }


    if (!SALES_STATE.databaseReady) {

        showSalesMessage(
            screen,
            '❌ پایگاه داده آماده نیست.',
            false
        );

        return;
    }


    if (button) {

        button.disabled =
            true;

        button.textContent =
            'در حال بررسی...';

    }


    try {

        const product =
            await getProductByBarcode(
                barcode
            );


        if (!product) {

            showSalesMessage(
                screen,
                '❌ کالایی با این بارکد پیدا نشد.',
                false
            );

            input.select();

            return;
        }


        const stock =
            Number(product.stock) || 0;


        if (stock <= 0) {

            showSalesMessage(
                screen,
                `⚠️ موجودی «${product.name || 'این کالا'}» تمام شده است.`,
                false
            );

            input.select();

            return;
        }


        const existingIndex =
            SALES_STATE.cart.findIndex(
                item =>
                    String(item.productId) ===
                    String(product.id)
            );


        if (existingIndex !== -1) {

            const item =
                SALES_STATE.cart[
                    existingIndex
                ];


            if (
                item.quantity >= stock
            ) {

                showSalesMessage(
                    screen,
                    `⚠️ موجودی «${product.name}» فقط ${formatNumber(stock)} عدد است.`,
                    false
                );

                input.select();

                return;
            }


            item.quantity += 1;

        } else {

            SALES_STATE.cart.push({

                productId:
                    product.id,

                barcode:
                    product.barcode,

                name:
                    product.name,

                salePrice:
                    Number(product.salePrice) || 0,

                availableStock:
                    stock,

                quantity:
                    1

            });

        }


        input.value = '';


        refreshSalesScreen(screen);


        showSalesMessage(
            screen,
            `✅ «${product.name}» به سبد اضافه شد.`,
            true
        );


        input.focus();


    } catch (error) {

        console.error(
            'Sales add product error:',
            error
        );


        showSalesMessage(
            screen,
            '❌ هنگام جستجوی کالا خطایی رخ داد.',
            false
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                'افزودن';

        }

    }

}


// ============================================================
// Quantity
// ============================================================

function changeCartQuantity(
    screen,
    index,
    delta
) {

    const item =
        SALES_STATE.cart[index];


    if (!item) {
        return;
    }


    const next =
        item.quantity + delta;


    if (next <= 0) {

        removeCartItem(
            screen,
            index
        );

        return;
    }


    if (
        next >
        item.availableStock
    ) {

        showSalesMessage(
            screen,
            `⚠️ موجودی «${item.name}» فقط ${formatNumber(item.availableStock)} عدد است.`,
            false
        );

        return;
    }


    item.quantity =
        next;


    refreshSalesScreen(screen);

}


// ============================================================
// Remove
// ============================================================

function removeCartItem(
    screen,
    index
) {

    const item =
        SALES_STATE.cart[index];


    if (!item) {
        return;
    }


    showAppConfirm({

        title:
            'حذف کالا',

        message:
            `آیا می‌خواهید «${item.name}» از سبد خرید حذف شود؟`,

        icon:
            '🗑️',

        type:
            'danger',

        confirmText:
            'حذف کالا',

        cancelText:
            'انصراف'

    }).then(
        confirmed => {

            if (!confirmed) {
                return;
            }


            SALES_STATE.cart.splice(
                index,
                1
            );


            refreshSalesScreen(
                screen
            );


            showAppMessage(
                'کالا از سبد حذف شد.',
                'success'
            );

        }
    );

}


// ============================================================
// Clear Cart
// ============================================================

function clearCart(screen) {

    if (
        SALES_STATE.cart.length === 0
    ) {

        showSalesMessage(
            screen,
            'سبد خرید خالی است.',
            false
        );

        return;
    }


    showAppConfirm({

        title:
            'خالی کردن سبد',

        message:
            'تمام کالاهای موجود در سبد خرید حذف می‌شوند. آیا ادامه می‌دهید؟',

        icon:
            '🗑️',

        type:
            'warning',

        confirmText:
            'خالی کردن سبد',

        cancelText:
            'انصراف'

    }).then(
        confirmed => {

            if (!confirmed) {
                return;
            }


            SALES_STATE.cart =
                [];


            refreshSalesScreen(
                screen
            );


            showAppMessage(
                'سبد خرید خالی شد.',
                'success'
            );

        }
    );

}


// ============================================================
// Sale Confirmation
// ============================================================

function requestSaleConfirmation(screen) {

    if (
        SALES_STATE.cart.length === 0
    ) {

        showSalesMessage(
            screen,
            '⚠️ سبد خرید خالی است.',
            false
        );

        return;
    }


    const quantity =
        SALES_STATE.cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    const total =
        SALES_STATE.cart.reduce(
            (sum, item) =>
                sum +
                (
                    item.quantity *
                    item.salePrice
                ),
            0
        );


    showAppConfirm({

        title:
            'ثبت فروش',

        message:
            `تعداد کالا: ${formatNumber(quantity)}\nمبلغ کل: ${formatPrice(total)} تومان\n\nآیا از ثبت این فروش مطمئن هستید؟`,

        icon:
            '🧾',

        type:
            'success',

        confirmText:
            'ثبت فروش',

        cancelText:
            'انصراف'

    }).then(
        confirmed => {

            if (!confirmed) {
                return;
            }


            completeSale(
                screen
            );

        }
    );

}


// ============================================================
// Complete Sale
// ============================================================

async function completeSale(screen) {

    const submit =
        $('#sales-submit-button', screen);


    if (submit) {

        submit.disabled =
            true;

        submit.textContent =
            'در حال ثبت...';

    }


    try {

        const now =
            new Date().toISOString();


        const totalQuantity =
            SALES_STATE.cart.reduce(
                (sum, item) =>
                    sum + item.quantity,
                0
            );


        const totalPrice =
            SALES_STATE.cart.reduce(
                (sum, item) =>
                    sum +
                    (
                        item.quantity *
                        item.salePrice
                    ),
                0
            );


        /*
         * ثبت فروش در database.js
         *
         * در صورتی که addSale در database.js
         * وجود داشته باشد، فروش ذخیره می‌شود.
         */

        if (typeof addSale === 'function') {

            await addSale({

                timestamp:
                    now,

                totalQuantity,

                totalPrice

            });

        }


        /*
         * کاهش موجودی
         */

        for (
            const item of SALES_STATE.cart
        ) {

            const product =
                await getProductByBarcode(
                    item.barcode
                );


            if (!product) {
                continue;
            }


            const currentStock =
                Number(product.stock) || 0;


            const newStock =
                Math.max(
                    0,
                    currentStock -
                    item.quantity
                );


            await updateProduct({

                ...product,

                stock:
                    newStock,

                updatedAt:
                    now

            });

        }


        SALES_STATE.cart =
            [];


        refreshSalesScreen(
            screen
        );


        showAppMessage(
            'فروش با موفقیت ثبت شد.',
            'success'
        );


        const input =
            $('#sales-barcode-input', screen);

        if (input) {
            input.focus();
        }


    } catch (error) {

        console.error(
            'SupermarketPOS: Sale error',
            error
        );


        showAppMessage(
            '❌ ثبت فروش انجام نشد.',
            'danger'
        );


    } finally {

        if (submit) {

            submit.disabled =
                false;

            submit.textContent =
                '✓ ثبت فروش';

        }

    }

}


// ============================================================
// Render
// ============================================================

function refreshSalesScreen(screen) {

    renderCart(screen);

    updateSalesSummary(screen);

}


function renderCart(screen) {

    const list =
        $('#sales-cart-list', screen);

    const count =
        $('#sales-cart-count', screen);


    if (!list) {
        return;
    }


    list.innerHTML =
        '';


    if (
        SALES_STATE.cart.length === 0
    ) {

        list.innerHTML = `

            <div class="sales-empty-cart">

                <div class="sales-empty-icon">
                    🛍️
                </div>

                <h3>
                    سبد خرید خالی است
                </h3>

                <p>
                    بارکد یک کالا را وارد کنید تا به سبد اضافه شود.
                </p>

            </div>

        `;


        if (count) {
            count.textContent =
                '۰ کالا';
        }


        return;
    }


    const fragment =
        document.createDocumentFragment();


    SALES_STATE.cart.forEach(
        (item, index) => {

            const card =
                createCartItem(
                    item,
                    index
                );

            fragment.appendChild(card);

        }
    );


    list.appendChild(
        fragment
    );


    const totalQuantity =
        SALES_STATE.cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    if (count) {

        count.textContent =
            `${formatNumber(totalQuantity)} عدد کالا`;

    }

}


// ============================================================
// Cart Item
// ============================================================

function createCartItem(
    item,
    index
) {

    const card =
        createElement(
            'article',
            'sales-cart-item'
        );


    const lineTotal =
        item.quantity *
        item.salePrice;


    card.innerHTML = `

        <div class="sales-cart-item-main">

            <div class="sales-cart-product-icon">
                📦
            </div>

            <div class="sales-cart-product-info">

                <h4>
                    ${escapeHTML(item.name || 'بدون نام')}
                </h4>

                <span>
                    بارکد:
                    ${escapeHTML(item.barcode || '-')}
                </span>

                <strong>
                    ${formatPrice(item.salePrice)} تومان
                </strong>

            </div>

        </div>


        <div class="sales-cart-item-bottom">

            <div class="sales-quantity-control">

                <button
                    type="button"
                    class="sales-quantity-button"
                    data-cart-action="increase"
                    data-cart-index="${index}"
                >
                    +
                </button>

                <strong>
                    ${formatNumber(item.quantity)}
                </strong>

                <button
                    type="button"
                    class="sales-quantity-button"
                    data-cart-action="decrease"
                    data-cart-index="${index}"
                >
                    −
                </button>

            </div>


            <div class="sales-cart-line-total">

                ${formatPrice(lineTotal)}
                تومان

            </div>


            <button
                type="button"
                class="sales-remove-button"
                data-cart-action="remove"
                data-cart-index="${index}"
                aria-label="حذف کالا"
            >
                ×
            </button>

        </div>

    `;


    return card;

}


// ============================================================
// Summary
// ============================================================

function updateSalesSummary(screen) {

    const quantityElement =
        $('#sales-total-quantity', screen);

    const priceElement =
        $('#sales-total-price', screen);


    const totalQuantity =
        SALES_STATE.cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    const totalPrice =
        SALES_STATE.cart.reduce(
            (sum, item) =>
                sum +
                (
                    item.quantity *
                    item.salePrice
                ),
            0
        );


    if (quantityElement) {

        quantityElement.textContent =
            formatNumber(totalQuantity);

    }


    if (priceElement) {

        priceElement.textContent =
            `${formatPrice(totalPrice)} تومان`;

    }

}


// ============================================================
// Messages
// ============================================================

function showSalesMessage(
    screen,
    message,
    success = true
) {

    const boxes = [

        $('#sales-search-message', screen),

        $('#sales-checkout-message', screen)

    ];


    const box =
        boxes.find(
            item => item
        );


    if (!box) {
        return;
    }


    box.className =
        success
            ? 'sales-message message-success'
            : 'sales-message message-danger';


    box.textContent =
        message;

}


function clearSalesMessages(screen) {

    const boxes = [

        $('#sales-search-message', screen),

        $('#sales-checkout-message', screen)

    ];


    boxes.forEach(
        box => {

            if (!box) {
                return;
            }

            box.textContent =
                '';

            box.className =
                'sales-message';

        }
    );

}
