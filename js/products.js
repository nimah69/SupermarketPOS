// js/products.js
// SupermarketPOS
// Products Management Module
// Complete Replacement

'use strict';

import {
    addProduct,
    getAllProducts
} from './database.js';


const PRODUCTS_STATE = {
    initialized: false,
    databaseReady: false,
    editingId: null
};


/* ============================================================
   Helpers
============================================================ */

function $(selector, root = document) {
    return root.querySelector(selector);
}


function formatNumber(value) {
    return (Number(value) || 0).toLocaleString('fa-IR');
}


function escapeHTML(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}


/* ============================================================
   Initialize
============================================================ */

export async function initializeProductsScreen(
    screen,
    options = {}
) {
    if (!screen) {
        return;
    }

    PRODUCTS_STATE.databaseReady =
        options.databaseReady !== false;

    if (!PRODUCTS_STATE.initialized) {
        buildProductsScreen(screen);
        bindProductsEvents(screen);

        PRODUCTS_STATE.initialized = true;
    }

    await loadProducts(screen);
}


/* ============================================================
   Build Screen
============================================================ */

function buildProductsScreen(screen) {

    screen.innerHTML = `

        <div class="products-header">

            <div class="products-header-main">

                <div class="products-title-icon">
                    📦
                </div>

                <div>
                    <h2>مدیریت کالاها</h2>

                    <p>
                        مدیریت محصولات و موجودی فروشگاه
                    </p>
                </div>

            </div>

        </div>


        <div class="products-toolbar">

            <div class="products-search-box">

                <span>🔎</span>

                <input
                    type="search"
                    id="products-search-input"
                    placeholder="جستجوی نام یا بارکد کالا..."
                    autocomplete="off"
                >

            </div>


            <button
                type="button"
                id="add-product-button"
                class="add-product-button"
            >
                ＋ افزودن کالا
            </button>

        </div>


        <div
            id="products-summary"
            class="products-summary"
        ></div>


        <div
            id="product-form-container"
            class="product-form-container"
            hidden
        >

            <div class="product-form">

                <div class="product-form-header">

                    <div>
                        <h3>افزودن کالای جدید</h3>

                        <p>
                            اطلاعات کالا را وارد کنید.
                        </p>
                    </div>

                    <button
                        type="button"
                        id="close-product-form"
                        class="close-product-form"
                        aria-label="بستن"
                    >
                        ×
                    </button>

                </div>


                <div class="product-form-grid">

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
                            min="0"
                            step="1"
                            inputmode="numeric"
                            placeholder="تومان"
                        >

                    </div>


                    <div class="form-field">

                        <label for="product-stock">
                            موجودی
                        </label>

                        <input
                            type="number"
                            id="product-stock"
                            min="0"
                            step="1"
                            inputmode="numeric"
                            placeholder="تعداد"
                        >

                    </div>

                </div>


                <div
                    id="product-form-message"
                    class="product-form-message"
                    aria-live="polite"
                ></div>


                <div class="product-form-actions">

                    <button
                        type="button"
                        id="cancel-product-button"
                        class="cancel-product-button"
                    >
                        انصراف
                    </button>

                    <button
                        type="button"
                        id="save-product-button"
                        class="save-product-button"
                    >
                        ذخیره کالا
                    </button>

                </div>

            </div>

        </div>


        <div
            id="products-list"
            class="products-list"
        ></div>


        <button
            type="button"
            id="products-back-button"
            class="products-back-button"
        >
            ← بازگشت
        </button>

    `;
}


/* ============================================================
   Events
============================================================ */

function bindProductsEvents(screen) {

    const addButton =
        $('#add-product-button', screen);

    const closeButton =
        $('#close-product-form', screen);

    const cancelButton =
        $('#cancel-product-button', screen);

    const saveButton =
        $('#save-product-button', screen);

    const searchInput =
        $('#products-search-input', screen);

    const backButton =
        $('#products-back-button', screen);


    if (addButton) {
        addButton.addEventListener(
            'click',
            () => openProductForm(screen)
        );
    }


    if (closeButton) {
        closeButton.addEventListener(
            'click',
            () => closeProductForm(screen)
        );
    }


    if (cancelButton) {
        cancelButton.addEventListener(
            'click',
            () => closeProductForm(screen)
        );
    }


    if (saveButton) {
        saveButton.addEventListener(
            'click',
            () => saveProduct(screen)
        );
    }


    if (searchInput) {
        searchInput.addEventListener(
            'input',
            () => filterProducts(screen)
        );
    }


    if (backButton) {
        backButton.addEventListener(
            'click',
            () => {

                const products =
                    document.getElementById(
                        'products-screen'
                    );

                const home =
                    document.querySelector(
                        '.home-screen'
                    );

                if (products) {
                    products.style.display = 'none';
                }

                if (home) {
                    home.style.display = '';
                }

            }
        );
    }
}


/* ============================================================
   Product Form
============================================================ */

function openProductForm(screen) {

    const form =
        $('#product-form-container', screen);

    if (!form) {
        return;
    }

    PRODUCTS_STATE.editingId = null;

    clearProductForm(screen);

    form.hidden = false;

    const barcode =
        $('#product-barcode', screen);

    if (barcode) {
        barcode.focus();
    }
}


function closeProductForm(screen) {

    const form =
        $('#product-form-container', screen);

    if (!form) {
        return;
    }

    form.hidden = true;

    PRODUCTS_STATE.editingId = null;

    clearProductMessage(screen);
}


function clearProductForm(screen) {

    [
        '#product-barcode',
        '#product-name',
        '#product-category',
        '#product-price',
        '#product-stock'
    ].forEach(
        selector => {

            const input =
                $(selector, screen);

            if (input) {
                input.value = '';
            }

        }
    );

    clearProductMessage(screen);
}


/* ============================================================
   Save Product
============================================================ */

async function saveProduct(screen) {

    clearProductMessage(screen);

    if (!PRODUCTS_STATE.databaseReady) {

        showProductMessage(
            screen,
            '❌ پایگاه داده آماده نیست.',
            false
        );

        return;
    }


    const barcodeInput =
        $('#product-barcode', screen);

    const nameInput =
        $('#product-name', screen);

    const categoryInput =
        $('#product-category', screen);

    const priceInput =
        $('#product-price', screen);

    const stockInput =
        $('#product-stock', screen);

    const saveButton =
        $('#save-product-button', screen);


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


    if (saveButton) {

        saveButton.disabled = true;

        saveButton.textContent =
            'در حال ذخیره...';

    }


    try {

        await addProduct(product);


        showProductMessage(
            screen,
            '✅ کالا با موفقیت ذخیره شد.',
            true
        );


        clearProductForm(screen);


        const form =
            $('#product-form-container', screen);

        if (form) {
            form.hidden = false;
        }


        await loadProducts(screen);


        const barcode =
            $('#product-barcode', screen);

        if (barcode) {
            barcode.focus();
        }


    } catch (error) {

        console.error(
            'SupermarketPOS: add product error',
            error
        );


        if (
            error &&
            error.name === 'ConstraintError'
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

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                'ذخیره کالا';

        }

    }
}


/* ============================================================
   Load
============================================================ */

async function loadProducts(screen) {

    const list =
        $('#products-list', screen);

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


        screen._products =
            Array.isArray(products)
                ? products
                : [];


        renderProducts(
            screen,
            screen._products
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: products load error',
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
   Filter
============================================================ */

function filterProducts(screen) {

    const input =
        $('#products-search-input', screen);

    const products =
        screen._products || [];


    if (!input) {
        return;
    }


    const query =
        input.value.trim().toLowerCase();


    const filtered =
        products.filter(
            product => {

                const name =
                    String(
                        product.name || ''
                    ).toLowerCase();

                const barcode =
                    String(
                        product.barcode || ''
                    ).toLowerCase();

                return (
                    name.includes(query) ||
                    barcode.includes(query)
                );

            }
        );


    renderProducts(
        screen,
        filtered
    );
}


/* ============================================================
   Render
============================================================ */

function renderProducts(
    screen,
    products
) {

    const list =
        $('#products-list', screen);

    const summary =
        $('#products-summary', screen);


    if (!list) {
        return;
    }


    if (summary) {

        const allProducts =
            screen._products || [];

        const totalStock =
            allProducts.reduce(
                (sum, product) =>
                    sum +
                    (Number(product.stock) || 0),
                0
            );

        summary.innerHTML = `

            <div class="products-summary-item">

                <span>کالاها</span>

                <strong>
                    ${formatNumber(allProducts.length)}
                </strong>

            </div>


            <div class="products-summary-item">

                <span>مجموع موجودی</span>

                <strong>
                    ${formatNumber(totalStock)}
                </strong>

            </div>

        `;
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
                    کالایی پیدا نشد
                </h3>

                <p>
                    برای شروع یک کالا اضافه کنید.
                </p>

            </div>

        `;

        return;
    }


    const fragment =
        document.createDocumentFragment();


    products.forEach(
        product => {

            const card =
                document.createElement(
                    'article'
                );


            card.className =
                'product-card';


            const stock =
                Number(product.stock) || 0;


            const price =
                Number(product.salePrice) || 0;


            let stockClass =
                'stock-normal';


            if (stock === 0) {
                stockClass = 'stock-empty';
            } else if (stock <= 5) {
                stockClass = 'stock-low';
            }


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
                                product.barcode || '-'
                            )}
                        </strong>

                    </div>


                    <div class="product-detail">

                        <span>
                            قیمت فروش
                        </span>

                        <strong>
                            ${formatNumber(price)}
                            تومان
                        </strong>

                    </div>


                    <div class="product-detail">

                        <span>
                            موجودی
                        </span>

                        <strong class="${stockClass}">
                            ${formatNumber(stock)}
                        </strong>

                    </div>

                </div>

            `;


            fragment.appendChild(card);

        }
    );


    list.appendChild(fragment);
}


/* ============================================================
   Messages
============================================================ */

function showProductMessage(
    screen,
    message,
    success
) {

    const box =
        $('#product-form-message', screen);

    if (!box) {
        return;
    }


    box.className =
        `product-form-message ${
            success
                ? 'message-success'
                : 'message-danger'
        }`;


    box.textContent =
        message;
}


function clearProductMessage(screen) {

    const box =
        $('#product-form-message', screen);

    if (!box) {
        return;
    }


    box.textContent = '';

    box.className =
        'product-form-message';
}
