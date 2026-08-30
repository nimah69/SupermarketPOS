// js/sales.js
// SupermarketPOS
// Sales / POS Module
// Complete Replacement
// Stage 5

'use strict';

import {
    getProductByBarcode,
    openDatabase
} from './database.js';


// ============================================================================
// State
// ============================================================================

const SALES_STATE = {
    screen: null,
    initialized: false,
    databaseReady: false,
    cart: [],
    onBack: null,
    busy: false
};


// ============================================================================
// Helpers
// ============================================================================

function $(selector, root = document) {
    return root.querySelector(selector);
}


function formatNumber(value) {

    return (
        Number(value) || 0
    ).toLocaleString('fa-IR');
}


function formatPrice(value) {

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


// ============================================================================
// Initialize
// ============================================================================

export function initializeSalesScreen(
    screen,
    options = {}
) {

    if (!screen) {
        return;
    }

    SALES_STATE.screen =
        screen;

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

        refreshSalesScreen();

        const input =
            $('#sales-barcode-input', screen);

        if (input) {
            input.focus();
        }

        return;
    }

    SALES_STATE.cart = [];
    SALES_STATE.busy = false;

    buildSalesScreen(screen);
    bindSalesEvents(screen);

    screen.dataset.salesReady =
        'true';

    SALES_STATE.initialized =
        true;

    refreshSalesScreen();

    const input =
        $('#sales-barcode-input', screen);

    if (input) {
        setTimeout(
            () => input.focus(),
            100
        );
    }
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
                aria-label="بازگشت"
            >
                ×
            </button>

        </div>


        <div class="sales-layout">


            <!-- ======================================================
                 Add Product
            ======================================================= -->

            <section class="sales-card">

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


            <!-- ======================================================
                 Cart
            ======================================================= -->

            <section class="sales-card">

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


            <!-- ======================================================
                 Checkout
            ======================================================= -->

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


        <!-- ======================================================
             Custom Modal
        ======================================================= -->

        <div
            id="sales-modal"
            class="sales-modal-overlay"
            hidden
        >

            <div
                class="sales-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="sales-modal-title"
            >

                <div
                    id="sales-modal-icon"
                    class="sales-modal-icon"
                >
                    🧾
                </div>

                <h3
                    id="sales-modal-title"
                    class="sales-modal-title"
                >
                    تأیید عملیات
                </h3>

                <div
                    id="sales-modal-message"
                    class="sales-modal-message"
                ></div>

                <div class="sales-modal-actions">

                    <button
                        type="button"
                        id="sales-modal-cancel"
                        class="sales-modal-button sales-modal-cancel"
                    >
                        انصراف
                    </button>

                    <button
                        type="button"
                        id="sales-modal-confirm"
                        class="sales-modal-button sales-modal-confirm"
                    >
                        تأیید
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

    if (barcodeInput) {

        barcodeInput.addEventListener(
            'keydown',
            event => {

                if (
                    event.key === 'Enter'
                ) {

                    event.preventDefault();

                    addProductByBarcode();
                }
            }
        );
    }

    if (addButton) {

        addButton.addEventListener(
            'click',
            addProductByBarcode
        );
    }

    if (submitButton) {

        submitButton.addEventListener(
            'click',
            requestSaleConfirmation
        );
    }

    if (clearButton) {

        clearButton.addEventListener(
            'click',
            requestClearCart
        );
    }

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            () => {

                if (
                    SALES_STATE.onBack
                ) {

                    SALES_STATE.onBack();

                } else {

                    screen.style.display =
                        'none';
                }
            }
        );
    }

    bindModalEvents(screen);

    bindCartEvents(screen);
}


// ============================================================================
// Modal Events
// ============================================================================

function bindModalEvents(screen) {

    const modal =
        $('#sales-modal', screen);

    const cancel =
        $('#sales-modal-cancel', screen);

    const confirm =
        $('#sales-modal-confirm', screen);

    if (!modal) {
        return;
    }

    if (cancel) {

        cancel.addEventListener(
            'click',
            () => closeModal()
        );
    }

    if (confirm) {

        confirm.addEventListener(
            'click',
            async () => {

                const callback =
                    modal._callback;

                closeModal();

                if (
                    typeof callback ===
                    'function'
                ) {

                    await callback();
                }
            }
        );
    }

    modal.addEventListener(
        'click',
        event => {

            if (
                event.target ===
                modal
            ) {

                closeModal();
            }
        }
    );
}


// ============================================================================
// Show Modal
// ============================================================================

function showModal({
    title,
    message,
    icon = '🧾',
    confirmText = 'تأیید',
    danger = false,
    callback
}) {

    const screen =
        SALES_STATE.screen;

    if (!screen) {
        return;
    }

    const modal =
        $('#sales-modal', screen);

    const iconBox =
        $('#sales-modal-icon', screen);

    const titleBox =
        $('#sales-modal-title', screen);

    const messageBox =
        $('#sales-modal-message', screen);

    const confirmButton =
        $('#sales-modal-confirm', screen);

    if (
        !modal ||
        !iconBox ||
        !titleBox ||
        !messageBox ||
        !confirmButton
    ) {

        return;
    }

    iconBox.textContent =
        icon;

    titleBox.textContent =
        title;

    messageBox.textContent =
        message;

    confirmButton.textContent =
        confirmText;

    confirmButton.className =
        danger
            ? 'sales-modal-button sales-modal-danger'
            : 'sales-modal-button sales-modal-confirm';

    modal._callback =
        callback;

    modal.hidden =
        false;

    document.body.classList.add(
        'modal-open'
    );

    setTimeout(
        () => confirmButton.focus(),
        50
    );
}


// ============================================================================
// Close Modal
// ============================================================================

function closeModal() {

    const screen =
        SALES_STATE.screen;

    if (!screen) {
        return;
    }

    const modal =
        $('#sales-modal', screen);

    if (modal) {

        modal.hidden =
            true;

        modal._callback =
            null;
    }

    document.body.classList.remove(
        'modal-open'
    );
}


// ============================================================================
// Add Product
// ============================================================================

async function addProductByBarcode() {

    const screen =
        SALES_STATE.screen;

    const input =
        $('#sales-barcode-input', screen);

    const button =
        $('#sales-add-button', screen);

    if (!input) {
        return;
    }

    const barcode =
        input.value.trim();

    clearMessages();

    if (!barcode) {

        showSearchMessage(
            '⚠️ ابتدا بارکد کالا را وارد کنید.',
            false
        );

        input.focus();

        return;
    }

    if (
        !SALES_STATE.databaseReady
    ) {

        showSearchMessage(
            '❌ پایگاه داده آماده نیست.',
            false
        );

        return;
    }

    if (SALES_STATE.busy) {
        return;
    }

    SALES_STATE.busy =
        true;

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

            showSearchMessage(
                '❌ کالایی با این بارکد پیدا نشد.',
                false
            );

            input.select();

            return;
        }

        const stock =
            Number(product.stock) || 0;

        if (stock <= 0) {

            showSearchMessage(
                `⚠️ موجودی «${product.name || 'این کالا'}» تمام شده است.`,
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
                existing.quantity >=
                stock
            ) {

                showSearchMessage(
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
                    String(product.barcode),

                name:
                    product.name || 'بدون نام',

                salePrice:
                    Number(product.salePrice) || 0,

                availableStock:
                    stock,

                quantity:
                    1
            });
        }

        input.value =
            '';

        refreshSalesScreen();

        showSearchMessage(
            `✅ «${product.name}» به سبد اضافه شد.`,
            true
        );

        input.focus();

    } catch (error) {

        console.error(
            'SupermarketPOS: add sale product error',
            error
        );

        showSearchMessage(
            '❌ هنگام جستجوی کالا خطایی رخ داد.',
            false
        );

    } finally {

        SALES_STATE.busy =
            false;

        if (button) {

            button.disabled =
                false;

            button.textContent =
                'افزودن';
        }
    }
}


// ============================================================================
// Cart Events
// ============================================================================

function bindCartEvents(screen) {

    const list =
        $('#sales-cart-list', screen);

    if (!list) {
        return;
    }

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
                    button.dataset.index
                );

            const action =
                button.dataset.cartAction;

            if (
                !Number.isInteger(index)
            ) {
                return;
            }

            if (
                action === 'increase'
            ) {

                changeQuantity(
                    index,
                    1
                );

            } else if (
                action === 'decrease'
            ) {

                changeQuantity(
                    index,
                    -1
                );

            } else if (
                action === 'remove'
            ) {

                requestRemoveItem(
                    index
                );
            }
        }
    );
}


// ============================================================================
// Change Quantity
// ============================================================================

function changeQuantity(
    index,
    delta
) {

    const item =
        SALES_STATE.cart[index];

    if (!item) {
        return;
    }

    const next =
        item.quantity +
        delta;

    if (next <= 0) {

        requestRemoveItem(
            index
        );

        return;
    }

    if (
        next >
        item.availableStock
    ) {

        showCheckoutMessage(
            `⚠️ موجودی «${item.name}» فقط ${formatNumber(item.availableStock)} عدد است.`,
            false
        );

        return;
    }

    item.quantity =
        next;

    refreshSalesScreen();
}


// ============================================================================
// Remove Item
// ============================================================================

function requestRemoveItem(index) {

    const item =
        SALES_STATE.cart[index];

    if (!item) {
        return;
    }

    showModal({

        title:
            'حذف کالا',

        message:
            `آیا می‌خواهید «${item.name}» از سبد خرید حذف شود؟`,

        icon:
            '🗑️',

        confirmText:
            'حذف کالا',

        danger:
            true,

        callback:
            () => {

                SALES_STATE.cart.splice(
                    index,
                    1
                );

                refreshSalesScreen();

                showCheckoutMessage(
                    'کالا از سبد حذف شد.',
                    true
                );
            }
    });
}


// ============================================================================
// Clear Cart
// ============================================================================

function requestClearCart() {

    if (
        SALES_STATE.cart.length ===
        0
    ) {

        showCheckoutMessage(
            'سبد خرید خالی است.',
            false
        );

        return;
    }

    showModal({

        title:
            'خالی کردن سبد خرید',

        message:
            'تمام کالاهای موجود در سبد حذف خواهند شد. آیا ادامه می‌دهید؟',

        icon:
            '🗑️',

        confirmText:
            'خالی کردن سبد',

        danger:
            true,

        callback:
            () => {

                SALES_STATE.cart =
                    [];

                refreshSalesScreen();

                showCheckoutMessage(
                    'سبد خرید خالی شد.',
                    true
                );
            }
    });
}


// ============================================================================
// Sale Confirmation
// ============================================================================

function requestSaleConfirmation() {

    if (
        SALES_STATE.cart.length ===
        0
    ) {

        showCheckoutMessage(
            '⚠️ سبد خرید خالی است.',
            false
        );

        return;
    }

    const totalQuantity =
        getTotalQuantity();

    const totalPrice =
        getTotalPrice();

    showModal({

        title:
            'تأیید ثبت فروش',

        message:
            `تعداد کالا: ${formatNumber(totalQuantity)}\nمبلغ کل: ${formatPrice(totalPrice)} تومان\n\nآیا از ثبت این فروش مطمئن هستید؟`,

        icon:
            '🧾',

        confirmText:
            'تأیید و ثبت فروش',

        callback:
            completeSale
    });
}


// ============================================================================
// Complete Sale
// ============================================================================

async function completeSale() {

    const screen =
        SALES_STATE.screen;

    const submitButton =
        $('#sales-submit-button', screen);

    if (
        SALES_STATE.cart.length ===
        0
    ) {
        return;
    }

    if (
        !SALES_STATE.databaseReady
    ) {

        showCheckoutMessage(
            '❌ پایگاه داده آماده نیست.',
            false
        );

        return;
    }

    if (SALES_STATE.busy) {
        return;
    }

    SALES_STATE.busy =
        true;

    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.textContent =
            'در حال ثبت فروش...';
    }

    try {

        const result =
            await saveSaleTransaction(
                SALES_STATE.cart
            );

        SALES_STATE.cart =
            [];

        refreshSalesScreen();

        showCheckoutMessage(
            `✅ فروش با موفقیت ثبت شد.\nمبلغ ${formatPrice(result.totalPrice)} تومان`,
            true
        );

    } catch (error) {

        console.error(
            'SupermarketPOS: complete sale error',
            error
        );

        let message =
            '❌ ثبت فروش انجام نشد.';

        if (
            error &&
            error.message
        ) {

            message =
                `❌ ${error.message}`;
        }

        showCheckoutMessage(
            message,
            false
        );

    } finally {

        SALES_STATE.busy =
            false;

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                '✓ ثبت فروش';
        }
    }
}


// ============================================================================
// Save Sale Transaction
// ============================================================================

function saveSaleTransaction(
    cart
) {

    return openDatabase()
        .then(
            db =>
                new Promise(
                    (
                        resolve,
                        reject
                    ) => {

                        const transaction =
                            db.transaction(
                                [
                                    'products',
                                    'sales',
                                    'saleItems'
                                ],
                                'readwrite'
                            );

                        const productsStore =
                            transaction.objectStore(
                                'products'
                            );

                        const salesStore =
                            transaction.objectStore(
                                'sales'
                            );

                        const saleItemsStore =
                            transaction.objectStore(
                                'saleItems'
                            );

                        const timestamp =
                            new Date().toISOString();

                        const totalQuantity =
                            cart.reduce(
                                (
                                    sum,
                                    item
                                ) =>
                                    sum +
                                    Number(
                                        item.quantity
                                    ),
                                0
                            );

                        const totalPrice =
                            cart.reduce(
                                (
                                    sum,
                                    item
                                ) =>
                                    sum +
                                    (
                                        Number(
                                            item.quantity
                                        ) *
                                        Number(
                                            item.salePrice
                                        )
                                    ),
                                0
                            );

                        let saleId =
                            null;

                        let failed =
                            false;

                        const sale =
                            {

                                timestamp,

                                totalQuantity,

                                totalPrice,

                                itemCount:
                                    cart.length,

                                status:
                                    'completed'
                            };

                        const saleRequest =
                            salesStore.add(
                                sale
                            );

                        saleRequest.onerror =
                            () => {

                                failed =
                                    true;

                                reject(
                                    saleRequest.error
                                );
                            };

                        saleRequest.onsuccess =
                            () => {

                                saleId =
                                    saleRequest.result;

                                processCartItems(
                                    0
                                );
                            };


                        function processCartItems(
                            index
                        ) {

                            if (failed) {
                                return;
                            }

                            if (
                                index >=
                                cart.length
                            ) {

                                return;
                            }

                            const cartItem =
                                cart[index];

                            const productRequest =
                                productsStore.get(
                                    cartItem.productId
                                );

                            productRequest.onerror =
                                () => {

                                    failed =
                                        true;

                                    reject(
                                        new Error(
                                            `دریافت اطلاعات «${cartItem.name}» ناموفق بود.`
                                        )
                                    );
                                };

                            productRequest.onsuccess =
                                () => {

                                    const product =
                                        productRequest.result;

                                    if (!product) {

                                        failed =
                                            true;

                                        reject(
                                            new Error(
                                                `کالای «${cartItem.name}» دیگر وجود ندارد.`
                                            )
                                        );

                                        return;
                                    }

                                    const currentStock =
                                        Number(
                                            product.stock
                                        ) || 0;

                                    const quantity =
                                        Number(
                                            cartItem.quantity
                                        ) || 0;

                                    if (
                                        currentStock <
                                        quantity
                                    ) {

                                        failed =
                                            true;

                                        reject(
                                            new Error(
                                                `موجودی «${product.name}» کافی نیست. موجودی فعلی: ${formatNumber(currentStock)}`
                                            )
                                        );

                                        return;
                                    }

                                    product.stock =
                                        currentStock -
                                        quantity;

                                    product.updatedAt =
                                        new Date().toISOString();

                                    const updateRequest =
                                        productsStore.put(
                                            product
                                        );

                                    updateRequest.onerror =
                                        () => {

                                            failed =
                                                true;

                                            reject(
                                                new Error(
                                                    `به‌روزرسانی موجودی «${product.name}» انجام نشد.`
                                                )
                                            );
                                        };

                                    updateRequest.onsuccess =
                                        () => {

                                            const item =
                                                {

                                                    saleId,

                                                    productId:
                                                        product.id,

                                                    barcode:
                                                        product.barcode,

                                                    name:
                                                        product.name,

                                                    quantity,

                                                    unitPrice:
                                                        Number(
                                                            cartItem.salePrice
                                                        ) || 0,

                                                    totalPrice:
                                                        quantity *
                                                        (
                                                            Number(
                                                                cartItem.salePrice
                                                            ) || 0
                                                        )
                                                };

                                            const itemRequest =
                                                saleItemsStore.add(
                                                    item
                                                );

                                            itemRequest.onerror =
                                                () => {

                                                    failed =
                                                        true;

                                                    reject(
                                                        new Error(
                                                            `ثبت آیتم «${product.name}» انجام نشد.`
                                                        )
                                                    );
                                                };

                                            itemRequest.onsuccess =
                                                () => {

                                                    processCartItems(
                                                        index + 1
                                                    );
                                                };
                                        };
                                };
                        }


                        transaction.oncomplete =
                            () => {

                                db.close();

                                if (!failed) {

                                    resolve({

                                        saleId,

                                        totalQuantity,

                                        totalPrice
                                    });
                                }
                            };


                        transaction.onerror =
                            () => {

                                db.close();

                                if (!failed) {

                                    reject(
                                        transaction.error ||
                                        new Error(
                                            'خطا در ثبت تراکنش فروش.'
                                        )
                                    );
                                }
                            };


                        transaction.onabort =
                            () => {

                                db.close();

                                if (!failed) {

                                    reject(
                                        transaction.error ||
                                        new Error(
                                            'تراکنش فروش لغو شد.'
                                        )
                                    );
                                }
                            };
                    }
                )
        );
}


// ============================================================================
// Refresh
// ============================================================================

function refreshSalesScreen() {

    const screen =
        SALES_STATE.screen;

    if (!screen) {
        return;
    }

    renderCart();

    updateSummary();
}


// ============================================================================
// Render Cart
// ============================================================================

function renderCart() {

    const screen =
        SALES_STATE.screen;

    const list =
        $('#sales-cart-list', screen);

    const count =
        $('#sales-cart-count', screen);

    if (!list) {
        return;
    }

    if (
        SALES_STATE.cart.length ===
        0
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

    list.innerHTML = '';

    SALES_STATE.cart.forEach(
        (
            item,
            index
        ) => {

            const lineTotal =
                (
                    Number(item.quantity) ||
                    0
                ) *
                (
                    Number(item.salePrice) ||
                    0
                );

            const card =
                document.createElement(
                    'article'
                );

            card.className =
                'sales-cart-item';

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
                            data-index="${index}"
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
                            data-index="${index}"
                        >
                            −
                        </button>

                    </div>


                    <strong class="sales-line-total">
                        ${formatPrice(lineTotal)}
                        تومان
                    </strong>


                    <button
                        type="button"
                        class="sales-remove-button"
                        data-cart-action="remove"
                        data-index="${index}"
                        aria-label="حذف"
                    >
                        ×
                    </button>

                </div>
            `;

            list.appendChild(
                card
            );
        }
    );

    const totalQuantity =
        getTotalQuantity();

    if (count) {

        count.textContent =
            `${formatNumber(totalQuantity)} عدد کالا`;
    }
}


// ============================================================================
// Summary
// ============================================================================

function updateSummary() {

    const screen =
        SALES_STATE.screen;

    const quantity =
        $('#sales-total-quantity', screen);

    const price =
        $('#sales-total-price', screen);

    if (quantity) {

        quantity.textContent =
            formatNumber(
                getTotalQuantity()
            );
    }

    if (price) {

        price.textContent =
            `${formatPrice(getTotalPrice())} تومان`;
    }
}


// ============================================================================
// Totals
// ============================================================================

function getTotalQuantity() {

    return SALES_STATE.cart.reduce(
        (
            total,
            item
        ) =>
            total +
            (
                Number(item.quantity) ||
                0
            ),
        0
    );
}


function getTotalPrice() {

    return SALES_STATE.cart.reduce(
        (
            total,
            item
        ) =>
            total +
            (
                (
                    Number(item.quantity) ||
                    0
                ) *
                (
                    Number(item.salePrice) ||
                    0
                )
            ),
        0
    );
}


// ============================================================================
// Messages
// ============================================================================

function clearMessages() {

    clearSearchMessage();
    clearCheckoutMessage();
}


function clearSearchMessage() {

    const box =
        $('#sales-search-message', SALES_STATE.screen);

    if (box) {

        box.textContent =
            '';

        box.className =
            'sales-message';
    }
}


function clearCheckoutMessage() {

    const box =
        $('#sales-checkout-message', SALES_STATE.screen);

    if (box) {

        box.textContent =
            '';

        box.className =
            'sales-message';
    }
}


function showSearchMessage(
    message,
    success
) {

    const box =
        $('#sales-search-message', SALES_STATE.screen);

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


function showCheckoutMessage(
    message,
    success
) {

    const box =
        $('#sales-checkout-message', SALES_STATE.screen);

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
