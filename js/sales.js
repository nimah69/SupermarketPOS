// js/sales.js
// SupermarketPOS
// Sales Module - Stage 5
// Version: 0.5.1
// Full replacement version
// Compatible with current app.js

'use strict';

import {
    getProductByBarcode
} from './database.js';


// ============================================================================
// Sales State
// ============================================================================

let salesCart = [];


// ============================================================================
// Helpers
// ============================================================================

function formatPrice(value) {
    const number = Number(value) || 0;

    return number.toLocaleString('fa-IR');
}


function normalizeBarcode(value) {
    return String(value ?? '').trim();
}


function findCartItem(barcode) {
    return salesCart.find(
        item => item.barcode === barcode
    );
}


function calculateCartCount() {
    return salesCart.reduce(
        (total, item) => total + item.quantity,
        0
    );
}


function calculateCartTotal() {
    return salesCart.reduce(
        (total, item) =>
            total + (
                Number(item.salePrice) *
                Number(item.quantity)
            ),
        0
    );
}


// ============================================================================
// Message
// ============================================================================

function showSalesMessage(
    screen,
    message,
    type = 'info'
) {
    if (!screen) {
        return;
    }

    let messageBox =
        screen.querySelector(
            '#sales-barcode-message'
        );

    if (!messageBox) {
        messageBox =
            document.createElement('div');

        messageBox.id =
            'sales-barcode-message';

        messageBox.className =
            'sales-barcode-message';

        const barcodeCard =
            screen.querySelector(
                '.sales-barcode-card'
            );

        if (barcodeCard) {
            barcodeCard.appendChild(
                messageBox
            );
        }
    }

    messageBox.textContent =
        message;

    messageBox.className =
        `sales-barcode-message sales-message-${type}`;
}


// ============================================================================
// Focus Barcode
// ============================================================================

function focusBarcodeInput(screen) {
    if (!screen) {
        return;
    }

    const input =
        screen.querySelector(
            '#sales-barcode-input'
        );

    if (!input) {
        return;
    }

    setTimeout(() => {
        input.focus();
        input.select();
    }, 50);
}


// ============================================================================
// Add Product By Barcode
// ============================================================================

async function addProductByBarcode(
    screen,
    barcodeValue
) {
    const barcode =
        normalizeBarcode(
            barcodeValue
        );

    if (!barcode) {
        showSalesMessage(
            screen,
            '⚠️ لطفاً بارکد کالا را وارد کنید.',
            'error'
        );

        focusBarcodeInput(screen);

        return;
    }

    try {
        showSalesMessage(
            screen,
            '🔎 در حال جستجوی کالا...',
            'info'
        );

        const product =
            await getProductByBarcode(
                barcode
            );

        if (!product) {
            showSalesMessage(
                screen,
                `❌ کالایی با بارکد «${barcode}» پیدا نشد.`,
                'error'
            );

            focusBarcodeInput(screen);

            return;
        }

        const stock =
            Number(product.stock);

        if (
            !Number.isFinite(stock) ||
            stock <= 0
        ) {
            showSalesMessage(
                screen,
                `❌ موجودی «${product.name || 'بدون نام'}» تمام شده است.`,
                'error'
            );

            focusBarcodeInput(screen);

            return;
        }

        const salePrice =
            Number(product.salePrice);

        if (
            !Number.isFinite(salePrice) ||
            salePrice < 0
        ) {
            showSalesMessage(
                screen,
                `❌ قیمت فروش «${product.name || 'بدون نام'}» معتبر نیست.`,
                'error'
            );

            focusBarcodeInput(screen);

            return;
        }

        const existingItem =
            findCartItem(barcode);

        if (existingItem) {

            if (
                existingItem.quantity >= stock
            ) {
                showSalesMessage(
                    screen,
                    `⚠️ موجودی «${existingItem.name}» فقط ${formatPrice(stock)} عدد است.`,
                    'error'
                );

                focusBarcodeInput(screen);

                return;
            }

            existingItem.quantity += 1;

            existingItem.stock =
                stock;

        } else {

            salesCart.push({
                productId:
                    product.id,

                barcode:
                    barcode,

                name:
                    product.name ||
                    'بدون نام',

                category:
                    product.category ||
                    '',

                salePrice:
                    salePrice,

                stock:
                    stock,

                quantity:
                    1
            });
        }

        renderCart(screen);

        showSalesMessage(
            screen,
            `✅ «${product.name || 'بدون نام'}» به سبد اضافه شد.`,
            'success'
        );

        const input =
            screen.querySelector(
                '#sales-barcode-input'
            );

        if (input) {
            input.value = '';
        }

        focusBarcodeInput(screen);

    } catch (error) {

        console.error(
            'SupermarketPOS: خطا در جستجوی کالا',
            error
        );

        showSalesMessage(
            screen,
            '❌ خطا در دسترسی به اطلاعات کالا.',
            'error'
        );

        focusBarcodeInput(screen);
    }
}


// ============================================================================
// Increase Quantity
// ============================================================================

function increaseQuantity(
    screen,
    barcode
) {
    const item =
        findCartItem(barcode);

    if (!item) {
        return;
    }

    if (
        item.quantity >=
        item.stock
    ) {
        showSalesMessage(
            screen,
            `⚠️ موجودی «${item.name}» فقط ${formatPrice(item.stock)} عدد است.`,
            'error'
        );

        return;
    }

    item.quantity += 1;

    renderCart(screen);

    showSalesMessage(
        screen,
        `✅ تعداد «${item.name}» افزایش یافت.`,
        'success'
    );
}


// ============================================================================
// Decrease Quantity
// ============================================================================

function decreaseQuantity(
    screen,
    barcode
) {
    const item =
        findCartItem(barcode);

    if (!item) {
        return;
    }

    if (
        item.quantity <= 1
    ) {
        removeFromCart(
            screen,
            barcode
        );

        return;
    }

    item.quantity -= 1;

    renderCart(screen);

    showSalesMessage(
        screen,
        `تعداد «${item.name}» کاهش یافت.`,
        'info'
    );
}


// ============================================================================
// Remove Item
// ============================================================================

function removeFromCart(
    screen,
    barcode
) {
    const index =
        salesCart.findIndex(
            item =>
                item.barcode === barcode
        );

    if (index === -1) {
        return;
    }

    const item =
        salesCart[index];

    salesCart.splice(
        index,
        1
    );

    renderCart(screen);

    showSalesMessage(
        screen,
        `🗑️ «${item.name}» از سبد حذف شد.`,
        'info'
    );
}


// ============================================================================
// Clear Cart
// ============================================================================

function clearCart(screen) {

    if (
        salesCart.length === 0
    ) {
        showSalesMessage(
            screen,
            'سبد خرید خالی است.',
            'info'
        );

        return;
    }

    const confirmed =
        window.confirm(
            'آیا مطمئن هستید که می‌خواهید تمام کالاهای سبد خرید پاک شوند؟'
        );

    if (!confirmed) {
        return;
    }

    salesCart = [];

    renderCart(screen);

    showSalesMessage(
        screen,
        '✅ سبد خرید پاک شد.',
        'success'
    );

    focusBarcodeInput(screen);
}


// ============================================================================
// Render Cart
// ============================================================================

function renderCart(screen) {

    if (!screen) {
        return;
    }

    const cartItems =
        screen.querySelector(
            '#sales-cart-items'
        );

    const cartCount =
        screen.querySelector(
            '#sales-cart-count'
        );

    const totalValue =
        screen.querySelector(
            '#sales-total-value'
        );

    const checkoutButton =
        screen.querySelector(
            '#sales-checkout-button'
        );

    if (
        !cartItems ||
        !cartCount ||
        !totalValue
    ) {
        return;
    }

    cartItems.innerHTML = '';

    const count =
        calculateCartCount();

    const total =
        calculateCartTotal();

    cartCount.textContent =
        `${formatPrice(count)} کالا`;

    totalValue.textContent =
        `${formatPrice(total)} تومان`;

    if (checkoutButton) {
        checkoutButton.disabled =
            salesCart.length === 0;
    }


    // ------------------------------------------------------------------------
    // Empty
    // ------------------------------------------------------------------------

    if (
        salesCart.length === 0
    ) {

        const empty =
            document.createElement('div');

        empty.className =
            'sales-cart-empty';

        const icon =
            document.createElement('div');

        icon.className =
            'placeholder-icon';

        icon.textContent =
            '🛍️';

        const title =
            document.createElement('h3');

        title.textContent =
            'سبد خرید خالی است';

        const text =
            document.createElement('p');

        text.textContent =
            'بارکد یک کالا را وارد کنید تا به سبد اضافه شود.';

        empty.appendChild(icon);
        empty.appendChild(title);
        empty.appendChild(text);

        cartItems.appendChild(empty);

        return;
    }


    // ------------------------------------------------------------------------
    // Items
    // ------------------------------------------------------------------------

    salesCart.forEach(item => {

        const card =
            document.createElement('article');

        card.className =
            'sales-cart-item';


        // ------------------------------------------------------------
        // Top
        // ------------------------------------------------------------

        const top =
            document.createElement('div');

        top.className =
            'sales-cart-item-top';

        const info =
            document.createElement('div');

        info.className =
            'sales-cart-item-info';

        const name =
            document.createElement('h4');

        name.textContent =
            item.name;

        const barcode =
            document.createElement('span');

        barcode.textContent =
            `بارکد: ${item.barcode}`;

        info.appendChild(name);
        info.appendChild(barcode);


        const removeButton =
            document.createElement('button');

        removeButton.type =
            'button';

        removeButton.className =
            'sales-remove-item';

        removeButton.textContent =
            '×';

        removeButton.setAttribute(
            'aria-label',
            `حذف ${item.name}`
        );

        removeButton.addEventListener(
            'click',
            () => {
                removeFromCart(
                    screen,
                    item.barcode
                );
            }
        );

        top.appendChild(info);
        top.appendChild(removeButton);


        // ------------------------------------------------------------
        // Price
        // ------------------------------------------------------------

        const priceRow =
            document.createElement('div');

        priceRow.className =
            'sales-cart-price-row';

        const unitPrice =
            document.createElement('span');

        unitPrice.textContent =
            `قیمت واحد: ${formatPrice(item.salePrice)} تومان`;

        const rowTotal =
            document.createElement('strong');

        rowTotal.textContent =
            `${formatPrice(
                item.salePrice *
                item.quantity
            )} تومان`;

        priceRow.appendChild(
            unitPrice
        );

        priceRow.appendChild(
            rowTotal
        );


        // ------------------------------------------------------------
        // Quantity
        // ------------------------------------------------------------

        const controls =
            document.createElement('div');

        controls.className =
            'sales-quantity-controls';

        const decrease =
            document.createElement('button');

        decrease.type =
            'button';

        decrease.className =
            'sales-quantity-button';

        decrease.textContent =
            '−';

        decrease.setAttribute(
            'aria-label',
            `کاهش تعداد ${item.name}`
        );

        decrease.addEventListener(
            'click',
            () => {
                decreaseQuantity(
                    screen,
                    item.barcode
                );
            }
        );


        const quantity =
            document.createElement('span');

        quantity.className =
            'sales-quantity';

        quantity.textContent =
            formatPrice(
                item.quantity
            );


        const increase =
            document.createElement('button');

        increase.type =
            'button';

        increase.className =
            'sales-quantity-button';

        increase.textContent =
            '+';

        increase.setAttribute(
            'aria-label',
            `افزایش تعداد ${item.name}`
        );

        increase.addEventListener(
            'click',
            () => {
                increaseQuantity(
                    screen,
                    item.barcode
                );
            }
        );

        if (
            item.quantity >=
            item.stock
        ) {
            increase.disabled =
                true;

            increase.title =
                'موجودی کالا به حداکثر رسیده است';
        }

        controls.appendChild(decrease);
        controls.appendChild(quantity);
        controls.appendChild(increase);


        // ------------------------------------------------------------
        // Stock
        // ------------------------------------------------------------

        const stock =
            document.createElement('span');

        stock.className =
            'sales-stock-info';

        stock.textContent =
            `موجودی: ${formatPrice(item.stock)}`;


        // ------------------------------------------------------------
        // Assemble
        // ------------------------------------------------------------

        card.appendChild(top);
        card.appendChild(priceRow);
        card.appendChild(controls);
        card.appendChild(stock);

        cartItems.appendChild(card);
    });
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

    screen.setAttribute(
        'aria-hidden',
        'false'
    );


    screen.innerHTML = `

        <div class="sales-header">

            <h2>
                🛒 فروش و صندوق
            </h2>

            <p>
                ثبت فروش و مدیریت سبد خرید
            </p>

        </div>


        <div class="sales-barcode-card">

            <h3>
                ▣ افزودن کالا
            </h3>

            <p>
                بارکد کالا را وارد کنید یا با بارکدخوان اسکن کنید.
            </p>

            <div class="sales-barcode-row">

                <input
                    type="text"
                    id="sales-barcode-input"
                    class="sales-barcode-input"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="بارکد کالا"
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
                id="sales-barcode-message"
                class="sales-barcode-message"
                role="status"
                aria-live="polite"
            ></div>

        </div>


        <div class="sales-cart-card">

            <div class="sales-cart-header">

                <h3>
                    🛍️ سبد خرید
                </h3>

                <span
                    id="sales-cart-count"
                    class="sales-cart-count"
                >
                    ۰ کالا
                </span>

            </div>

            <div
                id="sales-cart-items"
                class="sales-cart-items"
            ></div>

        </div>


        <div class="sales-total-card">

            <span>
                مبلغ قابل پرداخت
            </span>

            <strong id="sales-total-value">
                ۰ تومان
            </strong>

        </div>


        <button
            type="button"
            id="sales-checkout-button"
            class="sales-checkout-button"
            disabled
        >
            💳 ثبت فروش
        </button>


        <button
            type="button"
            id="sales-clear-button"
            class="sales-clear-button"
        >
            🗑️ پاک کردن سبد
        </button>


        <button
            type="button"
            id="sales-back-button"
            class="sales-back-button"
        >
            ← بازگشت به صفحه اصلی
        </button>

    `;


    // ========================================================================
    // Events
    // ========================================================================

    const barcodeInput =
        screen.querySelector(
            '#sales-barcode-input'
        );

    const addButton =
        screen.querySelector(
            '#sales-add-button'
        );

    const clearButton =
        screen.querySelector(
            '#sales-clear-button'
        );

    const backButton =
        screen.querySelector(
            '#sales-back-button'
        );

    const checkoutButton =
        screen.querySelector(
            '#sales-checkout-button'
        );


    if (addButton) {

        addButton.addEventListener(
            'click',
            () => {

                addProductByBarcode(
                    screen,
                    barcodeInput
                        ? barcodeInput.value
                        : ''
                );
            }
        );
    }


    if (barcodeInput) {

        barcodeInput.addEventListener(
            'keydown',
            event => {

                if (
                    event.key === 'Enter'
                ) {

                    event.preventDefault();

                    addProductByBarcode(
                        screen,
                        barcodeInput.value
                    );
                }
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


    if (checkoutButton) {

        checkoutButton.addEventListener(
            'click',
            () => {

                showSalesMessage(
                    screen,
                    'ℹ️ ثبت نهایی فروش در مرحله ۶ فعال خواهد شد.',
                    'info'
                );
            }
        );
    }


    if (backButton) {

        backButton.addEventListener(
            'click',
            () => {

                screen.style.display =
                    'none';

                screen.setAttribute(
                    'aria-hidden',
                    'true'
                );

                const home =
                    document.querySelector(
                        '.home-screen'
                    );

                if (home) {
                    home.style.display =
                        '';
                }
            }
        );
    }


    renderCart(screen);

    return screen;
}


// ============================================================================
// Get / Create Sales Screen
// ============================================================================

function getOrCreateSalesScreen() {

    const main =
        document.querySelector('main');

    if (!main) {
        console.error(
            'SupermarketPOS: عنصر main پیدا نشد.'
        );

        return null;
    }


    let screen =
        document.getElementById(
            'sales-screen'
        );


    if (!screen) {

        screen =
            createSalesScreen();

        main.appendChild(
            screen
        );
    }


    return screen;
}


// ============================================================================
// Open Sales
// ============================================================================

function openSalesScreen() {

    const screen =
        getOrCreateSalesScreen();

    if (!screen) {
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


    screen.style.display =
        'block';

    screen.setAttribute(
        'aria-hidden',
        'false'
    );


    renderCart(screen);

    focusBarcodeInput(screen);
}


// ============================================================================
// Attach To Sales Button
// ============================================================================

function setupSalesButton() {

    const salesButton =
        document.querySelector(
            '.menu-card[data-action="sales"]'
        );

    if (!salesButton) {

        console.warn(
            'SupermarketPOS: دکمه فروش در صفحه اصلی پیدا نشد.'
        );

        return;
    }


    salesButton.addEventListener(
        'click',
        event => {

            event.preventDefault();

            openSalesScreen();
        }
    );
}


// ============================================================================
// Initialize
// ============================================================================

function initializeSalesModule() {

    setupSalesButton();

    console.log(
        'SupermarketPOS: Sales Module Stage 5 loaded successfully.'
    );
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
        initializeSalesModule,
        {
            once: true
        }
    );

} else {

    initializeSalesModule();

}
