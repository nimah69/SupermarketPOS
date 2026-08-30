// js/sales.js
// SupermarketPOS
// Sales / POS Module
// Complete Replacement

'use strict';

import {
    getProductByBarcode,
    createSale
} from './database.js';


const SALES_STATE = {

    initialized: false,

    cart: [],

    databaseReady: false

};


/* ============================================================
   Helpers
   ============================================================ */

function $(
    selector,
    root = document
) {

    return root.querySelector(
        selector
    );
}


function formatPrice(value) {

    return (
        Number(value) || 0
    ).toLocaleString(
        'fa-IR'
    );

}


function formatNumber(value) {

    return (
        Number(value) || 0
    ).toLocaleString(
        'fa-IR'
    );

}


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
   Initialize
   ============================================================ */

export function initializeSalesScreen(
    screen,
    options = {}
) {

    if (!screen) {
        return;
    }


    SALES_STATE.databaseReady =
        options.databaseReady !== false;


    if (
        !SALES_STATE.initialized
    ) {

        SALES_STATE.cart = [];

        buildSalesScreen(
            screen
        );

        bindSalesEvents(
            screen
        );

        SALES_STATE.initialized =
            true;

    }


    refreshSalesScreen(
        screen
    );

}


/* ============================================================
   Build
   ============================================================ */

function buildSalesScreen(screen) {

    screen.innerHTML = `

        <div class="sales-header">

            <div class="sales-header-main">

                <div class="sales-title-icon">
                    💳
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
                aria-label="بازگشت"
            >
                ×
            </button>

        </div>


        <div class="sales-layout">


            <!-- SEARCH -->

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
                        placeholder="بارکد کالا..."
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


            <!-- CART -->

            <section class="sales-card sales-cart-card">

                <div class="sales-search-card">

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

                </div>


                <div
                    id="sales-cart-list"
                    class="sales-cart-list"
                ></div>

            </section>


            <!-- CHECKOUT -->

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
                    class="sales-message sales-checkout-message"
                ></div>

            </section>

        </div>

    `;
}


/* ============================================================
   Events
   ============================================================ */

function bindSalesEvents(screen) {

    const input =
        $('#sales-barcode-input', screen);

    const addButton =
        $('#sales-add-button', screen);

    const submitButton =
        $('#sales-submit-button', screen);

    const clearButton =
        $('#sales-clear-button', screen);

    const closeButton =
        $('#sales-close-button', screen);


    if (input) {

        input.addEventListener(
            'keydown',
            event => {

                if (
                    event.key === 'Enter'
                ) {

                    event.preventDefault();

                    addProductByBarcode(
                        screen
                    );

                }

            }
        );

    }


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


    if (submitButton) {

        submitButton.addEventListener(
            'click',
            () => {

                submitSale(
                    screen
                );

            }
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            'click',
            () => {

                clearCart(
                    screen
                );

            }
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            'click',
            () => {

                closeSalesScreen();

            }
        );

    }

}


/* ============================================================
   Add Product
   ============================================================ */

async function addProductByBarcode(
    screen
) {

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


    if (
        !SALES_STATE.databaseReady
    ) {

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
            'بررسی...';

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
                `⚠️ موجودی «${product.name}» تمام شده است.`,
                false
            );

            input.select();

            return;
        }


        const existing =
            SALES_STATE.cart.find(
                item =>
                    String(item.productId) ===
                    String(product.id)
            );


        if (existing) {

            if (
                existing.quantity >= stock
            ) {

                showSalesMessage(
                    screen,
                    `⚠️ موجودی «${product.name}» فقط ${formatNumber(stock)} عدد است.`,
                    false
                );

                return;
            }


            existing.quantity += 1;

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
            `✓ «${product.name}» به سبد اضافه شد.`,
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
            '❌ خطایی هنگام جستجوی کالا رخ داد.',
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


/* ============================================================
   Quantity
   ============================================================ */

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


    refreshSalesScreen(
        screen
    );

}


/* ============================================================
   Remove
   ============================================================ */

function removeCartItem(
    screen,
    index
) {

    const item =
        SALES_STATE.cart[index];


    if (!item) {
        return;
    }


    SALES_STATE.cart.splice(
        index,
        1
    );


    refreshSalesScreen(
        screen
    );


    showSalesMessage(
        screen,
        `✓ «${item.name}» از سبد حذف شد.`,
        true
    );

}


/* ============================================================
   Clear Cart
   ============================================================ */

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


    SALES_STATE.cart = [];


    refreshSalesScreen(
        screen
    );


    showSalesMessage(
        screen,
        '✓ سبد خرید خالی شد.',
        true
    );

}


/* ============================================================
   Render
   ============================================================ */

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
        (item,index) => {

            const card =
                document.createElement(
                    'article'
                );


            card.className =
                'sales-cart-item';


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
                            بارکد:
                            ${escapeHTML(item.barcode)}
                        </span>

                        <strong>
                            ${formatPrice(item.salePrice)}
                            تومان
                        </strong>

                    </div>

                </div>


                <div class="sales-cart-item-bottom">

                    <div class="sales-quantity-control">

                        <button
                            type="button"
                            class="sales-quantity-button"
                            data-action="decrease"
                            data-index="${index}"
                        >
                            −
                        </button>

                        <strong
                            class="sales-quantity-number"
                        >
                            ${formatNumber(item.quantity)}
                        </strong>

                        <button
                            type="button"
                            class="sales-quantity-button"
                            data-action="increase"
                            data-index="${index}"
                        >
                            +
                        </button>

                    </div>


                    <strong class="sales-line-total">
                        ${formatPrice(lineTotal)}
                        تومان
                    </strong>


                    <button
                        type="button"
                        class="sales-remove-button"
                        data-action="remove"
                        data-index="${index}"
                        aria-label="حذف کالا"
                    >
                        ×
                    </button>

                </div>

            `;


            fragment.appendChild(
                card
            );

        }
    );


    list.appendChild(
        fragment
    );


    if (count) {

        const total =
            SALES_STATE.cart.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    item.quantity,
                0
            );


        count.textContent =
            `${formatNumber(total)} عدد کالا`;

    }

}


/* ============================================================
   Cart Events
   ============================================================ */

function bindCartEvents(screen) {

    const list =
        $('#sales-cart-list', screen);


    if (!list) {
        return;
    }


    list.onclick =
        event => {

            const button =
                event.target.closest(
                    'button[data-action]'
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            const index =
                Number(
                    button.dataset.index
                );


            if (
                action === 'increase'
            ) {

                changeCartQuantity(
                    screen,
                    index,
                    1
                );

            }


            if (
                action === 'decrease'
            ) {

                changeCartQuantity(
                    screen,
                    index,
                    -1
                );

            }


            if (
                action === 'remove'
            ) {

                removeCartItem(
                    screen,
                    index
                );

            }

        };

}


/* ============================================================
   Checkout
   ============================================================ */

async function submitSale(screen) {

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


    if (
        !SALES_STATE.databaseReady
    ) {

        showSalesMessage(
            screen,
            '❌ پایگاه داده آماده نیست.',
            false
        );

        return;
    }


    const button =
        $('#sales-submit-button', screen);


    if (button) {

        button.disabled = true;

        button.textContent =
            'در حال ثبت فروش...';

    }


    try {

        const totalQuantity =
            SALES_STATE.cart.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    item.quantity,
                0
            );


        const totalPrice =
            SALES_STATE.cart.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    (
                        item.quantity *
                        item.salePrice
                    ),
                0
            );


        const sale = {

            timestamp:
                new Date().toISOString(),

            totalQuantity,

            totalPrice

        };


        const items =
            SALES_STATE.cart.map(
                item => ({

                    productId:
                        item.productId,

                    barcode:
                        item.barcode,

                    name:
                        item.name,

                    salePrice:
                        item.salePrice,

                    quantity:
                        item.quantity

                })
            );


        await createSale(
            sale,
            items
        );


        SALES_STATE.cart = [];


        refreshSalesScreen(
            screen
        );


        showSalesMessage(
            screen,
            '✓ فروش با موفقیت ثبت شد.',
            true
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: sale error',
            error
        );


        showSalesMessage(
            screen,
            '❌ ثبت فروش انجام نشد. موجودی یا اطلاعات کالا را بررسی کنید.',
            false
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                '✓ ثبت فروش';

        }

    }

}


/* ============================================================
   Refresh
   ============================================================ */

function refreshSalesScreen(screen) {

    renderCart(
        screen
    );


    renderSummary(
        screen
    );


    bindCartEvents(
        screen
    );

}


/* ============================================================
   Summary
   ============================================================ */

function renderSummary(screen) {

    const quantityElement =
        $('#sales-total-quantity', screen);

    const priceElement =
        $('#sales-total-price', screen);


    const totalQuantity =
        SALES_STATE.cart.reduce(
            (
                sum,
                item
            ) =>
                sum +
                item.quantity,
            0
        );


    const totalPrice =
        SALES_STATE.cart.reduce(
            (
                sum,
                item
            ) =>
                sum +
                (
                    item.quantity *
                    item.salePrice
                ),
            0
        );


    if (quantityElement) {

        quantityElement.textContent =
            formatNumber(
                totalQuantity
            );

    }


    if (priceElement) {

        priceElement.textContent =
            `${formatPrice(totalPrice)} تومان`;

    }

}


/* ============================================================
   Messages
   ============================================================ */

function showSalesMessage(
    screen,
    message,
    success
) {

    const box =
        $('#sales-search-message', screen);


    if (!box) {
        return;
    }


    box.textContent =
        message;


    box.className =
        `sales-message ${
            success
                ? 'sales-message-success'
                : 'sales-message-danger'
        }`;

}


function clearSalesMessage(screen) {

    const box =
        $('#sales-search-message', screen);


    if (!box) {
        return;
    }


    box.textContent =
        '';


    box.className =
        'sales-message';

}


/* ============================================================
   Close
   ============================================================ */

function closeSalesScreen() {

    const sales =
        document.getElementById(
            'sales-screen'
        );


    const home =
        document.querySelector(
            '.home-screen'
        );


    if (sales) {

        sales.style.display =
            'none';

    }


    if (home) {

        home.style.display =
            '';

    }

}
