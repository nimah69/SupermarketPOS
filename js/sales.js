// js/sales.js
// SupermarketPOS
// Sales / POS Module
// Complete Replacement
// Stage 5

'use strict';

import {
    getProductByBarcode,
    updateProduct
} from './database.js';

// ============================================================================
// Sales State
// ============================================================================

const SALES_STATE = {
    initialized: false,
    cart: [],
    databaseReady: false
};

// ============================================================================
// DOM Helpers
// ============================================================================

function $(selector, root = document) {
    return root.querySelector(selector);
}

function createElement(tag, className = '') {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    return element;
}

// ============================================================================
// Formatting
// ============================================================================

function formatPrice(value) {
    const number = Number(value) || 0;

    return number.toLocaleString('fa-IR');
}

function formatNumber(value) {
    const number = Number(value) || 0;

    return number.toLocaleString('fa-IR');
}

function escapeHTML(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

// ============================================================================
// Initialize
// ============================================================================

export function initializeSalesScreen(screen, options = {}) {

    if (!screen) {
        return;
    }

    if (SALES_STATE.initialized) {
        refreshSalesScreen(screen);
        return;
    }

    SALES_STATE.databaseReady =
        options.databaseReady !== false;

    SALES_STATE.cart = [];

    buildSalesScreen(screen);

    bindSalesEvents(screen);

    SALES_STATE.initialized = true;

    refreshSalesScreen(screen);
}

// ============================================================================
// Build Screen
// ============================================================================

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

            <button
                type="button"
                class="sales-close-button"
                id="sales-close-button"
            >
                ×
            </button>

        </div>


        <div class="sales-layout">


            <!-- =========================================================
                 Product Search
            ========================================================== -->

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
                        aria-label="بارکد کالا"
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
                    aria-live="polite"
                ></div>

            </section>


            <!-- =========================================================
                 Cart
            ========================================================== -->

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


            <!-- =========================================================
                 Checkout
            ========================================================== -->

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
                    aria-live="polite"
                ></div>

            </section>

        </div>


        <!-- =============================================================
             Custom Confirm Modal
        ============================================================== -->

        <div
            id="sales-confirm-modal"
            class="sales-modal"
            aria-hidden="true"
        >

            <div
                class="sales-modal-overlay"
                data-modal-close="true"
            ></div>

            <div
                class="sales-modal-box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="sales-confirm-title"
            >

                <div class="sales-modal-icon">
                    🧾
                </div>

                <div class="sales-modal-content">

                    <h3 id="sales-confirm-title">
                        تأیید ثبت فروش
                    </h3>

                    <p id="sales-confirm-message">
                        آیا از ثبت این فروش مطمئن هستید؟
                    </p>

                </div>

                <div class="sales-modal-actions">

                    <button
                        type="button"
                        id="sales-confirm-cancel"
                        class="sales-modal-button sales-modal-cancel"
                    >
                        انصراف
                    </button>

                    <button
                        type="button"
                        id="sales-confirm-ok"
                        class="sales-modal-button sales-modal-confirm"
                    >
                        تأیید و ثبت فروش
                    </button>

                </div>

            </div>

        </div>

    `;
}

// ============================================================================
// Events
// ============================================================================

function bindSalesEvents(screen) {

    const barcodeInput =
        $('#sales-barcode-input', screen);

    const addButton =
        $('#sales-add-button', screen);

    const submitButton =
        $('#sales-submit-button', screen);

    const clearButton =
        $('#sales-clear-button', screen);

    const closeButton =
        $('#sales-close-button', screen);

    const confirmCancel =
        $('#sales-confirm-cancel', screen);

    const confirmOK =
        $('#sales-confirm-ok', screen);

    const modal =
        $('#sales-confirm-modal', screen);


    // ------------------------------------------------------------------------
    // Barcode Enter
    // ------------------------------------------------------------------------

    if (barcodeInput) {

        barcodeInput.addEventListener(
            'keydown',
            event => {

                if (event.key === 'Enter') {

                    event.preventDefault();

                    addProductByBarcode(
                        screen
                    );
                }
            }
        );
    }


    // ------------------------------------------------------------------------
    // Add Button
    // ------------------------------------------------------------------------

    if (addButton) {

        addButton.addEventListener(
            'click',
            () => {

                addProductByBarcode(
                    screen
                );
            }
        );
    }


    // ------------------------------------------------------------------------
    // Submit Sale
    // ------------------------------------------------------------------------

    if (submitButton) {

        submitButton.addEventListener(
            'click',
            () => {

                requestSaleConfirmation(
                    screen
                );
            }
        );
    }


    // ------------------------------------------------------------------------
    // Clear Cart
    // ------------------------------------------------------------------------

    if (clearButton) {

        clearButton.addEventListener(
            'click',
            () => {

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

                showSalesConfirmModal(
                    screen,
                    'خالی کردن سبد خرید',
                    'تمام کالاهای موجود در سبد خرید حذف می‌شوند. آیا ادامه می‌دهید؟',
                    () => {

                        SALES_STATE.cart = [];

                        refreshSalesScreen(
                            screen
                        );

                        showSalesMessage(
                            screen,
                            'سبد خرید خالی شد.',
                            true
                        );
                    },
                    'خالی کردن سبد'
                );
            }
        );
    }


    // ------------------------------------------------------------------------
    // Close Sales Screen
    // ------------------------------------------------------------------------

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            () => {

                closeSalesScreen();
            }
        );
    }


    // ------------------------------------------------------------------------
    // Modal Cancel
    // ------------------------------------------------------------------------

    if (confirmCancel) {

        confirmCancel.addEventListener(
            'click',
            () => {

                closeSalesModal(
                    screen
                );
            }
        );
    }


    // ------------------------------------------------------------------------
    // Modal Confirm
    // ------------------------------------------------------------------------

    if (confirmOK) {

        confirmOK.addEventListener(
            'click',
            async () => {

                const callback =
                    modal &&
                    modal._confirmCallback;

                closeSalesModal(
                    screen
                );

                if (
                    typeof callback ===
                    'function'
                ) {

                    await callback();
                }
            }
        );
    }


    // ------------------------------------------------------------------------
    // Modal Overlay
    // ------------------------------------------------------------------------

    if (modal) {

        const overlay =
            $('.sales-modal-overlay', modal);

        if (overlay) {

            overlay.addEventListener(
                'click',
                () => {

                    closeSalesModal(
                        screen
                    );
                }
            );
        }
    }
}

// ============================================================================
// Add Product By Barcode
// ============================================================================

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

    clearSalesMessage(
        screen
    );

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

        button.disabled = true;

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
                    Number(
                        product.salePrice
                    ) || 0,

                availableStock:
                    stock,

                quantity:
                    1
            });
        }


        input.value = '';

        refreshSalesScreen(
            screen
        );

        showSalesMessage(
            screen,
            `✅ «${product.name}» به سبد اضافه شد.`,
            true
        );

        input.focus();

    } catch (error) {

        console.error(
            'SupermarketPOS: خطا در افزودن کالا به فروش.',
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

// ============================================================================
// Cart Quantity
// ============================================================================

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

    const nextQuantity =
        item.quantity + delta;


    if (nextQuantity <= 0) {

        SALES_STATE.cart.splice(
            index,
            1
        );

        refreshSalesScreen(
            screen
        );

        return;
    }


    if (
        nextQuantity >
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
        nextQuantity;

    refreshSalesScreen(
        screen
    );
}

// ============================================================================
// Remove Cart Item
// ============================================================================

function removeCartItem(
    screen,
    index
) {

    const item =
        SALES_STATE.cart[index];

    if (!item) {
        return;
    }

    showSalesConfirmModal(
        screen,
        'حذف کالا',
        `آیا می‌خواهید «${item.name}» از سبد خرید حذف شود؟`,
        () => {

            SALES_STATE.cart.splice(
                index,
                1
            );

            refreshSalesScreen(
                screen
            );

            showSalesMessage(
                screen,
                'کالا از سبد حذف شد.',
                true
            );
        },
        'حذف کالا'
    );
}

// ============================================================================
// Render Cart
// ============================================================================

function renderCart(screen) {

    const list =
        $('#sales-cart-list', screen);

    const count =
        $('#sales-cart-count', screen);

    if (!list) {
        return;
    }

    list.innerHTML = '';


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
                    screen,
                    item,
                    index
                );

            fragment.appendChild(
                card
            );
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

// ============================================================================
// Cart Item
// ============================================================================

function createCartItem(
    screen,
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
                    ${escapeHTML(item.name)}
                </h4>

                <span>
                    بارکد: ${escapeHTML(item.barcode)}
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
                >
                    +
                </button>

                <strong>
                    ${
