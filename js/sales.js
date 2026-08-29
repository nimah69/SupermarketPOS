// js/sales.js
// SupermarketPOS
// Sales Screen - Stage 5
// Real Cart + Barcode + Stock Control
// Version: 0.5

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


function calculateCartTotal() {

    return salesCart.reduce(
        (total, item) => {

            return total +
                (
                    Number(item.salePrice) *
                    Number(item.quantity)
                );

        },
        0
    );
}


function calculateCartCount() {

    return salesCart.reduce(
        (total, item) => {

            return total +
                Number(item.quantity);

        },
        0
    );
}


// ============================================================================
// Sales Message
// ============================================================================

function showSalesMessage(message, type = 'info') {

    const element =
        document.getElementById(
            'sales-barcode-message'
        );

    if (!element) {
        return;
    }

    element.textContent = message;

    element.className =
        'sales-barcode-message ' +
        `sales-message-${type}`;
}


// ============================================================================
// Focus Barcode
// ============================================================================

function focusBarcodeInput() {

    const input =
        document.getElementById(
            'sales-barcode-input'
        );

    if (!input) {
        return;
    }

    setTimeout(
        () => {

            input.focus();

            input.select();

        },
        50
    );
}


// ============================================================================
// Add Product By Barcode
// ============================================================================

async function addProductByBarcode(barcodeValue) {

    const barcode =
        normalizeBarcode(
            barcodeValue
        );


    if (!barcode) {

        showSalesMessage(
            'لطفاً بارکد کالا را وارد کنید.',
            'error'
        );

        focusBarcodeInput();

        return;
    }


    try {

        showSalesMessage(
            'در حال جستجوی کالا...',
            'info'
        );


        const product =
            await getProductByBarcode(
                barcode
            );


        // ---------------------------------------------------------------
        // Product Not Found
        // ---------------------------------------------------------------

        if (!product) {

            showSalesMessage(
                'کالایی با این بارکد پیدا نشد.',
                'error'
            );

            focusBarcodeInput();

            return;
        }


        // ---------------------------------------------------------------
        // Stock
        // ---------------------------------------------------------------

        const stock =
            Number(product.stock) || 0;


        if (stock <= 0) {

            showSalesMessage(
                `موجودی «${product.name || 'بدون نام'}» تمام شده است.`,
                'error'
            );

            focusBarcodeInput();

            return;
        }


        // ---------------------------------------------------------------
        // Price
        // ---------------------------------------------------------------

        const salePrice =
            Number(product.salePrice) || 0;


        if (salePrice < 0) {

            showSalesMessage(
                'قیمت فروش کالا معتبر نیست.',
                'error'
            );

            focusBarcodeInput();

            return;
        }


        // ---------------------------------------------------------------
        // Existing Item
        // ---------------------------------------------------------------

        const existingItem =
            findCartItem(
                barcode
            );


        if (existingItem) {

            if (
                existingItem.quantity >= stock
            ) {

                showSalesMessage(
                    `موجودی «${product.name || 'بدون نام'}» فقط ${formatPrice(stock)} عدد است.`,
                    'error'
                );

                focusBarcodeInput();

                return;
            }


            existingItem.quantity += 1;


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


        renderCart();


        showSalesMessage(
            `«${product.name || 'بدون نام'}» به سبد اضافه شد.`,
            'success'
        );


        const input =
            document.getElementById(
                'sales-barcode-input'
            );


        if (input) {

            input.value = '';

            input.focus();
        }


    } catch (error) {

        console.error(
            'SupermarketPOS: خطا در جستجوی کالا:',
            error
        );


        showSalesMessage(
            'خطا در دسترسی به اطلاعات کالا.',
            'error'
        );

        focusBarcodeInput();
    }
}


// ============================================================================
// Increase Quantity
// ============================================================================

function increaseQuantity(barcode) {

    const item =
        findCartItem(
            barcode
        );


    if (!item) {
        return;
    }


    if (
        item.quantity >=
        item.stock
    ) {

        showSalesMessage(
            `موجودی «${item.name}» فقط ${formatPrice(item.stock)} عدد است.`,
            'error'
        );

        return;
    }


    item.quantity += 1;


    renderCart();


    showSalesMessage(
        `تعداد «${item.name}» افزایش یافت.`,
        'success'
    );
}


// ============================================================================
// Decrease Quantity
// ============================================================================

function decreaseQuantity(barcode) {

    const item =
        findCartItem(
            barcode
        );


    if (!item) {
        return;
    }


    if (
        item.quantity <= 1
    ) {

        removeFromCart(
            barcode
        );

        return;
    }


    item.quantity -= 1;


    renderCart();


    showSalesMessage(
        `تعداد «${item.name}» کاهش یافت.`,
        'info'
    );
}


// ============================================================================
// Remove Item
// ============================================================================

function removeFromCart(barcode) {

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


    renderCart();


    showSalesMessage(
        `«${item.name}» از سبد حذف شد.`,
        'info'
    );
}


// ============================================================================
// Clear Cart
// ============================================================================

function clearCart() {

    if (
        salesCart.length === 0
    ) {

        showSalesMessage(
            'سبد خرید خالی است.',
            'info'
        );

        return;
    }


    salesCart = [];


    renderCart();


    showSalesMessage(
        'سبد خرید پاک شد.',
        'success'
    );


    focusBarcodeInput();
}


// ============================================================================
// Render Cart
// ============================================================================

function renderCart() {

    const cartItems =
        document.getElementById(
            'sales-cart-items'
        );


    const cartCount =
        document.getElementById(
            'sales-cart-count'
        );


    const totalValue =
        document.getElementById(
            'sales-total-value'
        );


    const checkoutButton =
        document.getElementById(
            'sales-checkout-button'
        );


    const clearButton =
        document.getElementById(
            'sales-clear-button'
        );


    if (
        !cartItems ||
        !cartCount ||
        !totalValue
    ) {

        return;
    }


    cartItems.innerHTML = '';


    const totalCount =
        calculateCartCount();


    const total =
        calculateCartTotal();


    cartCount.textContent =
        `${formatPrice(totalCount)} کالا`;


    totalValue.textContent =
        `${formatPrice(total)} تومان`;


    if (checkoutButton) {

        checkoutButton.disabled =
            salesCart.length === 0;
    }


    if (clearButton) {

        clearButton.disabled =
            salesCart.length === 0;
    }


    // ------------------------------------------------------------------------
    // Empty Cart
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
            'sales-empty-icon';

        icon.textContent =
            '🛍️';


        const title =
            document.createElement('h3');

        title.textContent =
            'سبد خرید خالی است';


        const text =
            document.createElement('p');

        text.textContent =
            'بارکد کالا را وارد کنید تا محصول به سبد اضافه شود.';


        empty.appendChild(
            icon
        );

        empty.appendChild(
            title
        );

        empty.appendChild(
            text
        );


        cartItems.appendChild(
            empty
        );


        return;
    }


    // ------------------------------------------------------------------------
    // Cart Items
    // ------------------------------------------------------------------------

    salesCart.forEach(
        item => {

            const card =
                document.createElement('article');

            card.className =
                'sales-cart-item';


            // ---------------------------------------------------------------
            // Item Top
            // ---------------------------------------------------------------

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


            info.appendChild(
                name
            );

            info.appendChild(
                barcode
            );


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
                        item.barcode
                    );

                }
            );


            top.appendChild(
                info
            );

            top.appendChild(
                removeButton
            );


            // ---------------------------------------------------------------
            // Price Row
            // ---------------------------------------------------------------

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


            // ---------------------------------------------------------------
            // Quantity Controls
            // ---------------------------------------------------------------

            const controls =
                document.createElement('div');

            controls.className =
                'sales-quantity-controls';


            const decreaseButton =
                document.createElement('button');

            decreaseButton.type =
                'button';

            decreaseButton.className =
                'sales-quantity-button';

            decreaseButton.textContent =
                '−';

            decreaseButton.setAttribute(
                'aria-label',
                'کاهش تعداد'
            );


            decreaseButton.addEventListener(
                'click',
                () => {

                    decreaseQuantity(
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


            const increaseButton =
                document.createElement('button');

            increaseButton.type =
                'button';

            increaseButton.className =
                'sales-quantity-button';

            increaseButton.textContent =
                '+';

            increaseButton.setAttribute(
                'aria-label',
                'افزایش تعداد'
            );


            increaseButton.addEventListener(
                'click',
                () => {

                    increaseQuantity(
                        item.barcode
                    );

                }
            );


            if (
                item.quantity >=
                item.stock
            ) {

                increaseButton.disabled =
                    true;

                increaseButton.title =
                    'موجودی کالا به حداکثر رسیده است';
            }


            controls.appendChild(
                decreaseButton
            );

            controls.appendChild(
                quantity
            );

            controls.appendChild(
                increaseButton
            );


            // ---------------------------------------------------------------
            // Stock
            // ---------------------------------------------------------------

            const stockInfo =
                document.createElement('span');

            stockInfo.className =
                'sales-stock-info';


            const remaining =
                Math.max(
                    0,
                    item.stock -
                    item.quantity
                );


            stockInfo.textContent =
                `موجودی پس از فروش: ${formatPrice(remaining)}`;


            // ---------------------------------------------------------------
            // Assemble
            // ---------------------------------------------------------------

            card.appendChild(
                top
            );

            card.appendChild(
                priceRow
            );

            card.appendChild(
                controls
            );

            card.appendChild(
                stockInfo
            );


            cartItems.appendChild(
                card
            );
        }
    );
}


// ============================================================================
// Create Sales Screen
// ============================================================================

function createSalesScreen() {

    const existingScreen =
        document.getElementById(
            'sales-screen'
        );


    if (existingScreen) {

        return existingScreen;
    }


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


    // ========================================================================
    // Header
    // ========================================================================

    const header =
        document.createElement('div');

    header.className =
        'sales-header';


    const title =
        document.createElement('h2');

    title.textContent =
        '🛒 فروش و صندوق';


    const description =
        document.createElement('p');

    description.textContent =
        'بارکد کالا را وارد کنید یا با بارکدخوان اسکن کنید.';


    header.appendChild(
        title
    );

    header.appendChild(
        description
    );


    // ========================================================================
    // Barcode Card
    // ========================================================================

    const barcodeCard =
        document.createElement('div');

    barcodeCard.className =
        'sales-barcode-card';


    const barcodeHeader =
        document.createElement('div');

    barcodeHeader.className =
        'sales-section-header';


    const barcodeIcon =
        document.createElement('div');

    barcodeIcon.className =
        'sales-section-icon';

    barcodeIcon.textContent =
        '▣';


    const barcodeHeaderText =
        document.createElement('div');


    const barcodeTitle =
        document.createElement('h3');

    barcodeTitle.textContent =
        'افزودن کالا';


    const barcodeDescription =
        document.createElement('p');

    barcodeDescription.textContent =
        'بارکد را وارد کنید و روی «افزودن کالا» بزنید.';


    barcodeHeaderText.appendChild(
        barcodeTitle
    );

    barcodeHeaderText.appendChild(
        barcodeDescription
    );


    barcodeHeader.appendChild(
        barcodeIcon
    );

    barcodeHeader.appendChild(
        barcodeHeaderText
    );


    const barcodeRow =
        document.createElement('div');

    barcodeRow.className =
        'sales-barcode-row';


    const barcodeInput =
        document.createElement('input');


    barcodeInput.type =
        'text';

    barcodeInput.inputMode =
        'numeric';

    barcodeInput.autocomplete =
        'off';

    barcodeInput.id =
        'sales-barcode-input';

    barcodeInput.className =
        'sales-barcode-input';

    barcodeInput.placeholder =
        'بارکد کالا را وارد کنید';

    barcodeInput.setAttribute(
        'aria-label',
        'بارکد کالا'
    );


    const addButton =
        document.createElement('button');


    addButton.type =
        'button';

    addButton.className =
        'sales-add-button';

    addButton.textContent =
        'افزودن کالا';


    barcodeRow.appendChild(
        barcodeInput
    );

    barcodeRow.appendChild(
        addButton
    );


    const barcodeMessage =
        document.createElement('div');


    barcodeMessage.id =
        'sales-barcode-message';

    barcodeMessage.className =
        'sales-barcode-message';

    barcodeMessage.setAttribute(
        'role',
        'status'
    );

    barcodeMessage.setAttribute(
        'aria-live',
        'polite'
    );


    barcodeCard.appendChild(
        barcodeHeader
    );

    barcodeCard.appendChild(
        barcodeRow
    );

    barcodeCard.appendChild(
        barcodeMessage
    );


    // ========================================================================
    // Cart Card
    // ========================================================================

    const cartCard =
        document.createElement('div');

    cartCard.className =
        'sales-cart-card';


    const cartHeader =
        document.createElement('div');

    cartHeader.className =
        'sales-cart-header';


    const cartHeaderLeft =
        document.createElement('div');

    cartHeaderLeft.className =
        'sales-cart-header-left';


    const cartIcon =
        document.createElement('div');

    cartIcon.className =
        'sales-section-icon sales-cart-icon';

    cartIcon.textContent =
        '🛍️';


    const cartTitle =
        document.createElement('h3');

    cartTitle.textContent =
        'سبد خرید';


    cartHeaderLeft.appendChild(
        cartIcon
    );

    cartHeaderLeft.appendChild(
        cartTitle
    );


    const cartCount =
        document.createElement('span');


    cartCount.id =
        'sales-cart-count';

    cartCount.className =
        'sales-cart-count';

    cartCount.textContent =
        '۰ کالا';


    cartHeader.appendChild(
        cartHeaderLeft
    );

    cartHeader.appendChild(
        cartCount
    );


    const cartItems =
        document.createElement('div');


    cartItems.id =
        'sales-cart-items';

    cartItems.className =
        'sales-cart-items';


    cartCard.appendChild(
        cartHeader
    );

    cartCard.appendChild(
        cartItems
    );


    // ========================================================================
    // Total Card
    // ========================================================================

    const totalCard =
        document.createElement('div');

    totalCard.className =
        'sales-total-card';


    const totalInfo =
        document.createElement('div');

    totalInfo.className =
        'sales-total-info';


    const totalLabel =
        document.createElement('span');

    totalLabel.textContent =
        'مبلغ قابل پرداخت';


    const totalHint =
        document.createElement('small');

    totalHint.textContent =
        'جمع کل سبد خرید';


    totalInfo.appendChild(
        totalLabel
    );

    totalInfo.appendChild(
        totalHint
    );


    const totalValue =
        document.createElement('strong');

    totalValue.id =
        'sales-total-value';

    totalValue.textContent =
        '۰ تومان';


    totalCard.appendChild(
        totalInfo
    );

    totalCard.appendChild(
        totalValue
    );


    // ========================================================================
    // Actions
    // ========================================================================

    const actions =
        document.createElement('div');

    actions.className =
        'sales-actions';


    const clearButton =
        document.createElement('button');


    clearButton.type =
        'button';

    clearButton.id =
        'sales-clear-button';

    clearButton.className =
        'sales-clear-button';

    clearButton.textContent =
        'پاک کردن سبد';

    clearButton.disabled =
        true;


    clearButton.addEventListener(
        'click',
        clearCart
    );


    const checkoutButton =
        document.createElement('button');


    checkoutButton.type =
        'button';

    checkoutButton.id =
        'sales-checkout-button';

    checkoutButton.className =
        'sales-checkout-button';

    checkoutButton.textContent =
        'ثبت فروش';

    checkoutButton.disabled =
        true;


    checkoutButton.addEventListener(
        'click',
        () => {

            showSalesMessage(
                'ثبت نهایی فروش در مرحله بعد فعال خواهد شد.',
                'info'
            );

        }
    );


    actions.appendChild(
        clearButton
    );

    actions.appendChild(
        checkoutButton
    );


    // ========================================================================
    // Back Button
    // ========================================================================

    const backButton =
        document.createElement('button');


    backButton.type =
        'button';

    backButton.className =
        'sales-back-button';

    backButton.textContent =
        '← بازگشت به صفحه اصلی';


    backButton.addEventListener(
        'click',
        () => {

            screen.style.display =
                'none';


            screen.setAttribute(
                'aria-hidden',
                'true'
            );


            const homeScreen =
                document.querySelector(
                    '.home-screen'
                );


            if (homeScreen) {

                homeScreen.style.display =
                    '';
            }

        }
    );


    // ========================================================================
    // Assemble
    // ========================================================================

    screen.appendChild(
        header
    );

    screen.appendChild(
        barcodeCard
    );

    screen.appendChild(
        cartCard
    );

    screen.appendChild(
        totalCard
    );

    screen.appendChild(
        actions
    );

    screen.appendChild(
        backButton
    );


    // ========================================================================
    // Events
    // ========================================================================

    addButton.addEventListener(
        'click',
        () => {

            addProductByBarcode(
                barcodeInput.value
            );

        }
    );


    barcodeInput.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Enter'
            ) {

                event.preventDefault();

                addProductByBarcode(
                    barcodeInput.value
                );
            }

        }
    );


    // ========================================================================
    // Initial Render
    // ========================================================================

    renderCart();


    return screen;
}


// ============================================================================
// Open Sales Screen
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


    const homeScreen =
        document.querySelector(
            '.home-screen'
        );


    if (homeScreen) {

        homeScreen.style.display =
            'none';
    }


    let salesScreen =
        document.getElementById(
            'sales-screen'
        );


    if (!salesScreen) {

        salesScreen =
            createSalesScreen();

        main.appendChild(
            salesScreen
        );
    }


    salesScreen.style.display =
        'block';


    salesScreen.setAttribute(
        'aria-hidden',
        'false'
    );


    renderCart();


    focusBarcodeInput();
}


// ============================================================================
// Connect Sales Button
// ============================================================================

function setupSalesButton() {

    const salesButton =
        document.querySelector(
            '.menu-card[data-action="sales"]'
        );


    if (!salesButton) {

        console.warn(
            'SupermarketPOS: دکمه فروش پیدا نشد.'
        );

        return;
    }


    // Prevent duplicate listeners

    if (
        salesButton.dataset.salesReady ===
        'true'
    ) {

        return;
    }


    salesButton.dataset.salesReady =
        'true';


    salesButton.addEventListener(
        'click',
        openSalesScreen
    );
}


// ============================================================================
// Initialize
// ============================================================================

function initializeSalesModule() {

    setupSalesButton();


    console.log(
        'SupermarketPOS: ماژول فروش مرحله ۵ آماده است.'
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
