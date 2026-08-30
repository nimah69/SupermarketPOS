// js/sales.js
// SupermarketPOS
// Sales / POS Module
// Complete Replacement
// Stage 6
//
// قوانین:
// 1. هنگام ورود به صفحه فروش هیچ Modal نمایش داده نمی‌شود.
// 2. از window.confirm و alert استفاده نمی‌شود.
// 3. تمام تأییدها با Modal اختصاصی برنامه انجام می‌شوند.
// 4. ثبت فروش فقط بعد از فشردن دکمه «ثبت فروش» تأیید می‌شود.
// 5. ظاهر Modal از سیستم عمومی app-modal استفاده می‌کند.

'use strict';

import {
    openDatabase,
    getProductByBarcode,
    updateProduct
} from './database.js';


// ============================================================================
// SALES STATE
// ============================================================================

const SALES_STATE = {

    initialized: false,

    cart: [],

    databaseReady: false,

    modalCallback: null,

    modalPreviousFocus: null
};


// ============================================================================
// DOM HELPERS
// ============================================================================

function $(selector, root = document) {

    return root.querySelector(selector);
}


function createElement(tag, className = '') {

    const element =
        document.createElement(tag);

    if (className) {
        element.className = className;
    }

    return element;
}


// ============================================================================
// FORMATTING
// ============================================================================

function formatPrice(value) {

    const number =
        Number(value) || 0;

    return number.toLocaleString('fa-IR');
}


function formatNumber(value) {

    const number =
        Number(value) || 0;

    return number.toLocaleString('fa-IR');
}


function escapeHTML(value) {

    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}


// ============================================================================
// INITIALIZE
// ============================================================================

export function initializeSalesScreen(
    screen,
    options = {}
) {

    if (!screen) {
        return;
    }


    SALES_STATE.databaseReady =
        options.databaseReady !== false;


    if (SALES_STATE.initialized) {

        refreshSalesScreen(screen);

        const input =
            $('#sales-barcode-input', screen);

        if (input) {
            setTimeout(() => input.focus(), 50);
        }

        return;
    }


    SALES_STATE.cart = [];

    SALES_STATE.modalCallback = null;


    buildSalesScreen(screen);

    bindSalesEvents(screen);


    SALES_STATE.initialized = true;


    refreshSalesScreen(screen);


    // ------------------------------------------------------------------------
    // مهم:
    // اینجا عمداً هیچ Modal باز نمی‌شود.
    // ------------------------------------------------------------------------

    const input =
        $('#sales-barcode-input', screen);

    if (input) {

        setTimeout(() => {

            input.focus();

        }, 100);
    }
}


// ============================================================================
// BUILD SALES SCREEN
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


            <!-- =========================================================
                 PRODUCT SEARCH
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
                 CART
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
                 CHECKOUT
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

    `;
}


// ============================================================================
// EVENTS
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


    // ------------------------------------------------------------------------
    // BARCODE ENTER
    // ------------------------------------------------------------------------

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


    // ------------------------------------------------------------------------
    // ADD PRODUCT
    // ------------------------------------------------------------------------

    if (addButton) {

        addButton.addEventListener(
            'click',
            () => {

                addProductByBarcode(screen);
            }
        );
    }


    // ------------------------------------------------------------------------
    // SUBMIT SALE
    // ------------------------------------------------------------------------

    if (submitButton) {

        submitButton.addEventListener(
            'click',
            () => {

                requestSaleConfirmation(screen);
            }
        );
    }


    // ------------------------------------------------------------------------
    // CLEAR CART
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


                showAppConfirmModal({

                    title: 'خالی کردن سبد خرید',

                    message:
                        'تمام کالاهای موجود در سبد خرید حذف می‌شوند. آیا ادامه می‌دهید؟',

                    icon: '🛍️',

                    type: 'warning',

                    confirmText:
                        'خالی کردن سبد',

                    cancelText:
                        'انصراف',

                    confirmClass:
                        'app-modal-button-danger',

                    onConfirm: () => {

                        SALES_STATE.cart = [];

                        refreshSalesScreen(screen);

                        showSalesMessage(
                            screen,
                            'سبد خرید خالی شد.',
                            true
                        );

                    }

                });
            }
        );
    }


    // ------------------------------------------------------------------------
    // CLOSE
    // ------------------------------------------------------------------------

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            () => {

                closeSalesScreen(screen);
            }
        );
    }
}


// ============================================================================
// ADD PRODUCT BY BARCODE
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


    clearSalesMessage(screen);


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
            await getProductByBarcode(barcode);


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
                SALES_STATE.cart[existingIndex];


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

                category:
                    product.category || '',

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
            'SupermarketPOS: خطا در افزودن کالا.',
            error
        );


        showSalesMessage(
            screen,
            '❌ هنگام جستجوی کالا خطایی رخ داد.',
            false
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                'افزودن';
        }
    }
}


// ============================================================================
// CHANGE CART QUANTITY
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

        removeCartItem(
            screen,
            index
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


    refreshSalesScreen(screen);
}


// ============================================================================
// REMOVE CART ITEM
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


    showAppConfirmModal({

        title: 'حذف کالا',

        message:
            `آیا می‌خواهید «${item.name}» از سبد خرید حذف شود؟`,

        icon: '🗑️',

        type: 'danger',

        confirmText:
            'حذف کالا',

        cancelText:
            'انصراف',

        confirmClass:
            'app-modal-button-danger',

        onConfirm: () => {

            SALES_STATE.cart.splice(
                index,
                1
            );


            refreshSalesScreen(screen);


            showSalesMessage(
                screen,
                'کالا از سبد حذف شد.',
                true
            );
        }

    });
}


// ============================================================================
// RENDER CART
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


            fragment.appendChild(card);
        }
    );


    list.appendChild(fragment);


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
// CREATE CART ITEM
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
                    data-cart-action="increase"
                    aria-label="افزایش تعداد"
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
                    aria-label="کاهش تعداد"
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
                aria-label="حذف کالا"
            >
                🗑️
            </button>

        </div>

    `;


    const increaseButton =
        $('[data-cart-action="increase"]', card);

    const decreaseButton =
        $('[data-cart-action="decrease"]', card);

    const removeButton =
        $('[data-cart-action="remove"]', card);


    if (increaseButton) {

        increaseButton.addEventListener(
            'click',
            () => {

                changeCartQuantity(
                    screen,
                    index,
                    1
                );
            }
        );
    }


    if (decreaseButton) {

        decreaseButton.addEventListener(
            'click',
            () => {

                changeCartQuantity(
                    screen,
                    index,
                    -1
                );
            }
        );
    }


    if (removeButton) {

        removeButton.addEventListener(
            'click',
            () => {

                removeCartItem(
                    screen,
                    index
                );
            }
        );
    }


    return card;
}


// ============================================================================
// REFRESH SALES SCREEN
// ============================================================================

function refreshSalesScreen(screen) {

    renderCart(screen);

    updateSalesSummary(screen);
}


// ============================================================================
// UPDATE SUMMARY
// ============================================================================

function updateSalesSummary(screen) {

    const quantityElement =
        $('#sales-total-quantity', screen);

    const priceElement =
        $('#sales-total-price', screen);

    const submitButton =
        $('#sales-submit-button', screen);


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


    if (submitButton) {

        submitButton.disabled =
            SALES_STATE.cart.length === 0;
    }
}


// ============================================================================
// SALE CONFIRMATION
// ============================================================================

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


    showAppConfirmModal({

        title: 'تأیید ثبت فروش',

        message:
            `آیا فروش زیر ثبت شود؟\n\n` +
            `تعداد کالا: ${formatNumber(totalQuantity)} عدد\n` +
            `مبلغ نهایی: ${formatPrice(totalPrice)} تومان`,

        icon: '🧾',

        type: 'success',

        confirmText:
            'تأیید و ثبت فروش',

        cancelText:
            'انصراف',

        confirmClass:
            'app-modal-button-success',

        onConfirm: async () => {

            await completeSale(screen);
        }

    });
}


// ============================================================================
// COMPLETE SALE
// ============================================================================

async function completeSale(screen) {

    const submitButton =
        $('#sales-submit-button', screen);


    if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
            'در حال ثبت...';
    }


    try {

        const result =
            await saveSaleToDatabase();


        SALES_STATE.cart = [];


        refreshSalesScreen(screen);


        showSalesMessage(
            screen,
            `✅ فروش با موفقیت ثبت شد.\n` +
            `شماره فروش: ${formatNumber(result.saleId)}`,
            true
        );


        const input =
            $('#sales-barcode-input', screen);


        if (input) {

            setTimeout(
                () => input.focus(),
                100
            );
        }


    } catch (error) {

        console.error(
            'SupermarketPOS: خطا در ثبت فروش.',
            error
        );


        showSalesMessage(
            screen,
            `❌ ثبت فروش انجام نشد.\n${error.message || ''}`,
            false
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                SALES_STATE.cart.length === 0;

            submitButton.textContent =
                '✓ ثبت فروش';
        }
    }
}


// ============================================================================
// SAVE SALE TO DATABASE
// ============================================================================

async function saveSaleToDatabase() {

    if (
        SALES_STATE.cart.length === 0
    ) {

        throw new Error(
            'سبد خرید خالی است.'
        );
    }


    const db =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

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


            const timestamp =
                new Date().toISOString();


            const sale = {

                timestamp,

                totalQuantity,

                totalPrice,

                itemCount:
                    SALES_STATE.cart.length
            };


            let saleId = null;


            // ----------------------------------------------------------------
            // ثبت فاکتور
            // ----------------------------------------------------------------

            const saleRequest =
                salesStore.add(sale);


            saleRequest.onsuccess =
                () => {

                    saleId =
                        saleRequest.result;


                    SALES_STATE.cart.forEach(
                        item => {

                            // ------------------------------------------------
                            // Sale Item
                            // ------------------------------------------------

                            saleItemsStore.add({

                                saleId,

                                productId:
                                    item.productId,

                                barcode:
                                    item.barcode,

                                name:
                                    item.name,

                                salePrice:
                                    item.salePrice,

                                quantity:
                                    item.quantity,

                                total:
                                    item.salePrice *
                                    item.quantity,

                                timestamp
                            });


                            // ------------------------------------------------
                            // Update Stock
                            // ------------------------------------------------

                            const productRequest =
                                productsStore.get(
                                    item.productId
                                );


                            productRequest.onsuccess =
                                () => {

                                    const product =
                                        productRequest.result;


                                    if (!product) {
                                        return;
                                    }


                                    const currentStock =
                                        Number(
                                            product.stock
                                        ) || 0;


                                    const newStock =
                                        currentStock -
                                        item.quantity;


                                    if (newStock < 0) {

                                        transaction.abort();

                                        return;
                                    }


                                    product.stock =
                                        newStock;


                                    product.updatedAt =
                                        timestamp;


                                    productsStore.put(
                                        product
                                    );
                                };
                        }
                    );
                };


            saleRequest.onerror =
                () => {

                    reject(
                        saleRequest.error ||
                        new Error(
                            'خطا در ایجاد فروش.'
                        )
                    );
                };


            transaction.oncomplete =
                () => {

                    db.close();


                    resolve({

                        saleId,

                        totalQuantity,

                        totalPrice
                    });
                };


            transaction.onerror =
                () => {

                    db.close();


                    reject(
                        transaction.error ||
                        new Error(
                            'خطا در ذخیره فروش.'
                        )
                    );
                };


            transaction.onabort =
                () => {

                    db.close();


                    reject(
                        transaction.error ||
                        new Error(
                            'ثبت فروش لغو شد.'
                        )
                    );
                };
        }
    );
}


// ============================================================================
// SALES MESSAGE
// ============================================================================

function showSalesMessage(
    screen,
    message,
    success = false
) {

    const searchMessage =
        $('#sales-search-message', screen);

    const checkoutMessage =
        $('#sales-checkout-message', screen);


    const target =
        searchMessage ||
        checkoutMessage;


    if (!target) {
        return;
    }


    target.textContent =
        message;


    target.classList.remove(
        'success',
        'error'
    );


    target.classList.add(
        success
            ? 'success'
            : 'error'
    );


    clearTimeout(
        target._salesMessageTimer
    );


    target._salesMessageTimer =
        setTimeout(
            () => {

                target.textContent = '';

                target.classList.remove(
                    'success',
                    'error'
                );

            },
            4500
        );
}


function clearSalesMessage(screen) {

    const messages =
        [
            $('#sales-search-message', screen),
            $('#sales-checkout-message', screen)
        ];


    messages.forEach(
        message => {

            if (!message) {
                return;
            }


            message.textContent = '';

            message.classList.remove(
                'success',
                'error'
            );
        }
    );
}


// ============================================================================
// GENERIC APP MODAL
// ============================================================================
//
// این Modal فقط زمانی ساخته می‌شود که واقعاً نیاز به تأیید باشد.
// هنگام ورود به فروش هیچ Modal ساخته نمی‌شود.
//

function showAppConfirmModal({

    title = 'تأیید عملیات',

    message = 'آیا از انجام این عملیات مطمئن هستید؟',

    icon = '❔',

    type = 'info',

    confirmText = 'تأیید',

    cancelText = 'انصراف',

    confirmClass =
        'app-modal-button-confirm',

    onConfirm = null

} = {}) {


    // اگر Modal قبلی وجود داشت، حذف شود.
    closeAppModal();


    SALES_STATE.modalPreviousFocus =
        document.activeElement;


    const overlay =
        document.createElement('div');


    overlay.className =
        'app-modal-overlay';


    overlay.id =
        'supermarket-app-modal';


    overlay.innerHTML = `

        <div
            class="app-modal ${escapeHTML(type)}"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-modal-title"
            aria-describedby="app-modal-message"
        >

            <div class="app-modal-icon">
                ${escapeHTML(icon)}
            </div>


            <h3
                class="app-modal-title"
                id="app-modal-title"
            >
                ${escapeHTML(title)}
            </h3>


            <div
                class="app-modal-message"
                id="app-modal-message"
            >
                ${escapeHTML(message)}
            </div>


            <div class="app-modal-actions">

                <button
                    type="button"
                    class="app-modal-button app-modal-button-cancel"
                    data-modal-action="cancel"
                >
                    ${escapeHTML(cancelText)}
                </button>


                <button
                    type="button"
                    class="app-modal-button ${escapeHTML(confirmClass)}"
                    data-modal-action="confirm"
                >
                    ${escapeHTML(confirmText)}
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    SALES_STATE.modalCallback =
        typeof onConfirm === 'function'
            ? onConfirm
            : null;


    const modal =
        $('.app-modal', overlay);


    const cancelButton =
        $('[data-modal-action="cancel"]', overlay);


    const confirmButton =
        $('[data-modal-action="confirm"]', overlay);


    // ------------------------------------------------------------------------
    // Cancel
    // ------------------------------------------------------------------------

    cancelButton.addEventListener(
        'click',
        () => {

            closeAppModal();
        }
    );


    // ------------------------------------------------------------------------
    // Confirm
    // ------------------------------------------------------------------------

    confirmButton.addEventListener(
        'click',
        async () => {

            const callback =
                SALES_STATE.modalCallback;


            closeAppModal();


            if (
                typeof callback === 'function'
            ) {

                await callback();
            }
        }
    );


    // ------------------------------------------------------------------------
    // Click outside
    // ------------------------------------------------------------------------

    overlay.addEventListener(
        'click',
        event => {

            if (event.target === overlay) {

                closeAppModal();
            }
        }
    );


    // ------------------------------------------------------------------------
    // Escape
    // ------------------------------------------------------------------------

    overlay._escapeHandler =
        event => {

            if (event.key === 'Escape') {

                event.preventDefault();

                closeAppModal();
            }
        };


    document.addEventListener(
        'keydown',
        overlay._escapeHandler
    );


    // ------------------------------------------------------------------------
    // Focus
    // ------------------------------------------------------------------------

    setTimeout(
        () => {

            if (cancelButton) {

                cancelButton.focus();
            }

        },
        50
    );
}


// ============================================================================
// CLOSE APP MODAL
// ============================================================================

function closeAppModal() {

    const modal =
        $('#supermarket-app-modal');


    if (!modal) {

        SALES_STATE.modalCallback =
            null;

        return;
    }


    if (
        modal._escapeHandler
    ) {

        document.removeEventListener(
            'keydown',
            modal._escapeHandler
        );
    }


    modal.remove();


    const previousFocus =
        SALES_STATE.modalPreviousFocus;


    SALES_STATE.modalCallback =
        null;


    SALES_STATE.modalPreviousFocus =
        null;


    if (
        previousFocus &&
        typeof previousFocus.focus ===
        'function' &&
        document.contains(previousFocus)
    ) {

        setTimeout(
            () => {

                previousFocus.focus();

            },
            30
        );
    }
}


// ============================================================================
// CLOSE SALES SCREEN
// ============================================================================

function closeSalesScreen(screen) {

    // ------------------------------------------------------------------------
    // اگر مودالی باز باشد، فقط مودال بسته شود.
    // ------------------------------------------------------------------------

    if (
        $('#supermarket-app-modal')
    ) {

        closeAppModal();

        return;
    }


    // ------------------------------------------------------------------------
    // اگر سبد خالی نیست، سؤال نپرس.
    // ورود/خروج از صفحه نباید Modal غیرضروری ایجاد کند.
    // ------------------------------------------------------------------------

    const event =
        new CustomEvent(
            'supermarket:navigate-home'
        );


    window.dispatchEvent(event);


    // ------------------------------------------------------------------------
    // سازگاری با سیستم‌های مختلف navigation
    // ------------------------------------------------------------------------

    const homeButton =
        document.querySelector(
            '[data-screen="home"]'
        );


    if (homeButton) {

        homeButton.click();

        return;
    }


    const backButton =
        document.querySelector(
            '.sales-back-button'
        );


    if (backButton) {

        backButton.click();

        return;
    }


    // ------------------------------------------------------------------------
    // اگر هیچ navigation handler پیدا نشد،
    // فقط صفحه فروش مخفی می‌شود.
    // ------------------------------------------------------------------------

    if (screen) {

        screen.style.display =
            'none';
    }
}


// ============================================================================
// CLEANUP
// ============================================================================

export function resetSalesState() {

    closeAppModal();


    SALES_STATE.cart = [];

    SALES_STATE.modalCallback = null;

    SALES_STATE.modalPreviousFocus = null;
}


// ============================================================================
// END
// ============================================================================
