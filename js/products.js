// js/products.js
// SupermarketPOS
// Products / Inventory Module
// Complete Replacement

'use strict';

import {
    addProduct,
    getAllProducts,
    updateProduct,
    deleteProduct
} from './database.js';


/* ============================================================
   State
============================================================ */

const PRODUCTS_STATE = {

    initialized: false,

    editingId: null,

    databaseReady: false,

    products: []

};


/* ============================================================
   Helpers
============================================================ */

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

                    <h2>
                        مدیریت کالاها
                    </h2>

                    <p>
                        مدیریت محصولات و موجودی فروشگاه
                    </p>

                </div>

            </div>


            <button
                type="button"
                class="products-back-button"
                id="products-back-button"
            >
                بازگشت
            </button>

        </div>


        <div class="products-toolbar">

            <div class="products-search-box">

                <span>
                    🔎
                </span>

                <input
                    type="search"
                    id="products-search-input"
                    placeholder="جستجوی نام یا بارکد..."
                    autocomplete="off"
                >

            </div>


            <button
                type="button"
                class="add-product-button"
                id="add-product-button"
            >
                ＋ افزودن کالا
            </button>

        </div>


        <div
            id="products-stats"
            class="products-stats"
        ></div>


        <div
            id="product-form-container"
            class="product-form-container"
            style="display:none;"
        >

            <div class="product-form">

                <div class="product-form-header">

                    <div>

                        <h3 id="product-form-title">
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
                            placeholder="تعداد موجودی"
                        >

                    </div>

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
                    aria-live="polite"
                ></div>

            </div>

        </div>


        <div
            id="products-list"
            class="products-list"
        ></div>

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
            () => {

                openProductForm(
                    screen
                );

            }
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            'click',
            () => {

                closeProductForm(
                    screen
                );

            }
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            () => {

                closeProductForm(
                    screen
                );

            }
        );

    }


    if (saveButton) {

        saveButton.addEventListener(
            'click',
            () => {

                saveProduct(
                    screen
                );

            }
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            'input',
            () => {

                renderProducts(
                    screen,
                    PRODUCTS_STATE.products
                );

            }
        );

    }


    if (backButton) {

        backButton.addEventListener(
            'click',
            () => {

                closeProductsScreen();

            }
        );

    }


    const list =
        $('#products-list', screen);


    if (list) {

        list.addEventListener(
            'click',
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


                const id =
                    Number(
                        button.dataset.id
                    );


                const product =
                    PRODUCTS_STATE.products.find(
                        item =>
                            Number(item.id) === id
                    );


                if (!product) {
                    return;
                }


                if (action === 'edit') {

                    openEditForm(
                        screen,
                        product
                    );

                }


                if (action === 'delete') {

                    removeProduct(
                        screen,
                        product
                    );

                }

            }
        );

    }

}


/* ============================================================
   Open Add Form
============================================================ */

function openProductForm(screen) {

    PRODUCTS_STATE.editingId = null;


    const form =
        $('#product-form-container', screen);


    if (!form) {
        return;
    }


    form.style.display = 'block';


    const title =
        $('#product-form-title', screen);


    if (title) {

        title.textContent =
            'افزودن کالای جدید';

    }


    clearProductForm(screen);


    const barcode =
        $('#product-barcode', screen);


    if (barcode) {

        barcode.focus();

    }

}


/* ============================================================
   Open Edit Form
============================================================ */

function openEditForm(
    screen,
    product
) {

    PRODUCTS_STATE.editingId =
        product.id;


    const form =
        $('#product-form-container', screen);


    if (!form) {
        return;
    }


    form.style.display =
        'block';


    const title =
        $('#product-form-title', screen);


    if (title) {

        title.textContent =
            'ویرایش کالا';

    }


    const barcode =
        $('#product-barcode', screen);


    const name =
        $('#product-name', screen);


    const category =
        $('#product-category', screen);


    const price =
        $('#product-price', screen);


    const stock =
        $('#product-stock', screen);


    if (barcode) {

        barcode.value =
            product.barcode || '';

    }


    if (name) {

        name.value =
            product.name || '';

    }


    if (category) {

        category.value =
            product.category || '';

    }


    if (price) {

        price.value =
            Number(product.salePrice) || 0;

    }


    if (stock) {

        stock.value =
            Number(product.stock) || 0;

    }


    clearProductMessage(
        screen
    );


    if (barcode) {

        barcode.focus();

    }

}


/* ============================================================
   Close Form
============================================================ */

function closeProductForm(screen) {

    const form =
        $('#product-form-container', screen);


    if (form) {

        form.style.display =
            'none';

    }


    PRODUCTS_STATE.editingId =
        null;


    clearProductForm(
        screen
    );

}


/* ============================================================
   Clear Form
============================================================ */

function clearProductForm(screen) {

    const fields = [

        '#product-barcode',
        '#product-name',
        '#product-category',
        '#product-price',
        '#product-stock'

    ];


    fields.forEach(
        selector => {

            const field =
                $(selector, screen);


            if (field) {

                field.value =
                    '';

            }

        }
    );


    clearProductMessage(
        screen
    );

}


/* ============================================================
   Save Product
============================================================ */

async function saveProduct(screen) {

    if (
        !PRODUCTS_STATE.databaseReady
    ) {

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


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            PRODUCTS_STATE.editingId
                ? 'در حال ذخیره...'
                : 'در حال افزودن...';

    }


    try {

        const now =
            new Date().toISOString();


        if (
            PRODUCTS_STATE.editingId
        ) {

            const oldProduct =
                PRODUCTS_STATE.products.find(
                    item =>
                        Number(item.id) ===
                        Number(
                            PRODUCTS_STATE.editingId
                        )
                );


            if (!oldProduct) {

                throw new Error(
                    'Product not found'
                );

            }


            const updatedProduct = {

                ...oldProduct,

                barcode,

                name,

                category,

                salePrice:
                    price,

                stock,

                updatedAt:
                    now

            };


            await updateProduct(
                updatedProduct
            );


            showProductMessage(
                screen,
                '✅ اطلاعات کالا با موفقیت ویرایش شد.',
                true
            );

        } else {

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


            await addProduct(
                product
            );


            showProductMessage(
                screen,
                '✅ کالا با موفقیت اضافه شد.',
                true
            );

        }


        await loadProducts(
            screen
        );


        setTimeout(
            () => {

                closeProductForm(
                    screen
                );

            },
            500
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: save product error',
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
                '❌ ذخیره اطلاعات کالا انجام نشد.',
                false
            );

        }

    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                'ذخیره کالا';

        }

    }

}


/* ============================================================
   Load Products
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


        PRODUCTS_STATE.products =
            Array.isArray(products)
                ? products
                : [];


        renderProducts(
            screen,
            PRODUCTS_STATE.products
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: load products error',
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
        $('#products-list', screen);


    if (!list) {
        return;
    }


    const searchInput =
        $('#products-search-input', screen);


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : '';


    let filtered =
        Array.isArray(products)
            ? products
            : [];


    if (search) {

        filtered =
            filtered.filter(
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
                        name.includes(search) ||
                        barcode.includes(search)
                    );

                }
            );

    }


    renderStats(
        screen,
        products,
        filtered
    );


    if (filtered.length === 0) {

        list.innerHTML = `

            <div class="products-empty">

                <div class="placeholder-icon">
                    ${
                        search
                            ? '🔎'
                            : '📦'
                    }
                </div>

                <h3>
                    ${
                        search
                            ? 'کالایی پیدا نشد'
                            : 'هنوز کالایی ثبت نشده است'
                    }
                </h3>

                <p>
                    ${
                        search
                            ? 'عبارت جستجو را تغییر دهید.'
                            : 'برای شروع، اولین کالای فروشگاه را اضافه کنید.'
                    }
                </p>

            </div>

        `;

        return;

    }


    list.innerHTML = '';


    const header =
        document.createElement(
            'div'
        );


    header.className =
        'products-list-title';


    header.innerHTML = `

        <strong>
            فهرست کالاها
        </strong>

        <span>
            ${formatNumber(filtered.length)}
            کالا
        </span>

    `;


    list.appendChild(
        header
    );


    filtered.forEach(
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


            let stockClass =
                '';


            let stockText =
                formatNumber(stock);


            if (stock === 0) {

                stockClass =
                    'stock-empty';

                stockText =
                    'ناموجود';

            } else if (stock <= 5) {

                stockClass =
                    'stock-low';

            } else {

                stockClass =
                    'stock-normal';

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


                    <div class="product-card-actions">

                        <button
                            type="button"
                            class="product-edit-button"
                            data-action="edit"
                            data-id="${product.id}"
                        >
                            ✏️
                        </button>


                        <button
                            type="button"
                            class="product-delete-button"
                            data-action="delete"
                            data-id="${product.id}"
                        >
                            🗑️
                        </button>

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
                            ${formatPrice(price)}
                            تومان
                        </strong>

                    </div>


                    <div class="product-detail">

                        <span>
                            موجودی
                        </span>

                        <strong class="${stockClass}">
                            ${stockText}
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
   Statistics
============================================================ */

function renderStats(
    screen,
    products,
    filtered
) {

    const stats =
        $('#products-stats', screen);


    if (!stats) {
        return;
    }


    const all =
        Array.isArray(products)
            ? products
            : [];


    const totalStock =
        all.reduce(
            (
                sum,
                product
            ) =>
                sum +
                (
                    Number(
                        product.stock
                    ) || 0
                ),
            0
        );


    const emptyStock =
        all.filter(
            product =>
                (
                    Number(
                        product.stock
                    ) || 0
                ) <= 0
        ).length;


    const lowStock =
        all.filter(
            product => {

                const stock =
                    Number(
                        product.stock
                    ) || 0;

                return (
                    stock > 0 &&
                    stock <= 5
                );

            }
        ).length;


    stats.innerHTML = `

        <div class="products-stat">

            <span>
                📦
            </span>

            <div>

                <small>
                    کل کالاها
                </small>

                <strong>
                    ${formatNumber(all.length)}
                </strong>

            </div>

        </div>


        <div class="products-stat">

            <span>
                🔢
            </span>

            <div>

                <small>
                    مجموع موجودی
                </small>

                <strong>
                    ${formatNumber(totalStock)}
                </strong>

            </div>

        </div>


        <div class="products-stat">

            <span>
                ⚠️
            </span>

            <div>

                <small>
                    موجودی کم
                </small>

                <strong>
                    ${formatNumber(lowStock)}
                </strong>

            </div>

        </div>


        <div class="products-stat">

            <span>
                ⛔
            </span>

            <div>

                <small>
                    ناموجود
                </small>

                <strong>
                    ${formatNumber(emptyStock)}
                </strong>

            </div>

        </div>

    `;

}


/* ============================================================
   Delete Product
============================================================ */

async function removeProduct(
    screen,
    product
) {

    const confirmed =
        window.confirm(
            `آیا از حذف کالای «${product.name}» مطمئن هستید؟`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteProduct(
            product.id
        );


        await loadProducts(
            screen
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: delete product error',
            error
        );


        showProductMessage(
            screen,
            '❌ حذف کالا انجام نشد.',
            false
        );

    }

}


/* ============================================================
   Messages
============================================================ */

function showProductMessage(
    screen,
    message,
    success = true
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


    box.textContent =
        '';


    box.className =
        'product-form-message';

}


/* ============================================================
   Close Screen
============================================================ */

function closeProductsScreen() {

    const products =
        document.getElementById(
            'products-screen'
        );


    const home =
        document.querySelector(
            '.home-screen'
        );


    if (products) {

        products.style.display =
            'none';

    }


    if (home) {

        home.style.display =
            '';

    }

}
