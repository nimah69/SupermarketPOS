// js/products.js
// SupermarketPOS
// Products Management Module
// Complete Replacement

'use strict';

import {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct
} from './database.js';


const PRODUCTS_STATE = {

    initialized: false,

    editingId: null,

    products: [],

    searchText: ''

};


/* ============================================================
   Helpers
============================================================ */

function $(selector, root = document) {

    return root.querySelector(selector);

}


function escapeHTML(value) {

    return String(value)

        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

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


    if (!PRODUCTS_STATE.initialized) {

        PRODUCTS_STATE.initialized = true;

        buildProductsScreen(screen);

        bindProductsEvents(screen);

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
                class="products-close-button"
                id="products-close-button"
                aria-label="بازگشت"
            >
                ×
            </button>

        </div>


        <div class="products-toolbar">

            <div class="products-search-box">

                <span class="products-search-icon">
                    🔎
                </span>

                <input
                    type="search"
                    id="products-search-input"
                    placeholder="جستجوی نام کالا یا بارکد..."
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
                            placeholder="تعداد موجود"
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


    const closeScreenButton =
        $('#products-close-button', screen);


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

                PRODUCTS_STATE.searchText =
                    searchInput.value.trim();

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
            goHome
        );

    }


    if (closeScreenButton) {

        closeScreenButton.addEventListener(
            'click',
            goHome
        );

    }


    const form =
        $('#product-form-container', screen);


    if (form) {

        form.addEventListener(
            'keydown',
            event => {

                if (
                    event.key === 'Escape'
                ) {

                    closeProductForm(
                        screen
                    );

                }

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


                if (
                    action === 'edit'
                ) {

                    editProduct(
                        screen,
                        id
                    );

                }


                if (
                    action === 'delete'
                ) {

                    confirmDeleteProduct(
                        screen,
                        id
                    );

                }

            }
        );

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
   Render Summary
============================================================ */

function renderSummary(
    screen,
    products
) {

    const summary =
        $('#products-summary', screen);


    if (!summary) {
        return;
    }


    const total =
        products.length;


    const stock =
        products.reduce(
            (
                sum,
                product
            ) =>
                sum +
                (
                    Number(product.stock) || 0
                ),
            0
        );


    const lowStock =
        products.filter(
            product =>
                Number(product.stock) > 0 &&
                Number(product.stock) <= 5
        ).length;


    const outOfStock =
        products.filter(
            product =>
                Number(product.stock) <= 0
        ).length;


    summary.innerHTML = `

        <div class="products-summary-item">

            <span>
                📦
            </span>

            <div>

                <small>
                    تعداد کالا
                </small>

                <strong>
                    ${formatNumber(total)}
                </strong>

            </div>

        </div>


        <div class="products-summary-item">

            <span>
                📊
            </span>

            <div>

                <small>
                    مجموع موجودی
                </small>

                <strong>
                    ${formatNumber(stock)}
                </strong>

            </div>

        </div>


        <div class="products-summary-item">

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


        <div class="products-summary-item">

            <span>
                🔴
            </span>

            <div>

                <small>
                    ناموجود
                </small>

                <strong>
                    ${formatNumber(outOfStock)}
                </strong>

            </div>

        </div>

    `;

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


    renderSummary(
        screen,
        products
    );


    const search =
        PRODUCTS_STATE.searchText
            .toLocaleLowerCase('fa-IR');


    const filtered =
        products.filter(
            product => {

                if (!search) {
                    return true;
                }


                const name =
                    String(
                        product.name || ''
                    ).toLocaleLowerCase('fa-IR');


                const barcode =
                    String(
                        product.barcode || ''
                    );


                const category =
                    String(
                        product.category || ''
                    ).toLocaleLowerCase('fa-IR');


                return (
                    name.includes(search) ||
                    barcode.includes(search) ||
                    category.includes(search)
                );

            }
        );


    list.innerHTML =
        '';


    if (
        filtered.length === 0
    ) {

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
                            : 'برای شروع اولین کالای فروشگاه را اضافه کنید.'
                    }
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
            ${formatNumber(filtered.length)} کالا
        </span>

    `;


    list.appendChild(
        title
    );


    const grid =
        document.createElement(
            'div'
        );


    grid.className =
        'products-grid';


    filtered.forEach(
        product => {

            grid.appendChild(
                createProductCard(
                    screen,
                    product
                )
            );

        }
    );


    list.appendChild(
        grid
    );

}


/* ============================================================
   Product Card
============================================================ */

function createProductCard(
    screen,
    product
) {

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
        'موجود';


    if (stock <= 0) {

        stockClass =
            'stock-out';

        stockText =
            'ناموجود';

    } else if (
        stock <= 5
    ) {

        stockClass =
            'stock-low';

        stockText =
            'موجودی کم';

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


            <div class="product-stock-badge ${stockClass}">
                ${stockText}
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

                <strong>
                    ${formatNumber(stock)}
                    عدد
                </strong>

            </div>

        </div>


        <div class="product-card-actions">

            <button
                type="button"
                class="product-edit-button"
                data-action="edit"
                data-id="${product.id}"
            >
                ✏️ ویرایش
            </button>


            <button
                type="button"
                class="product-delete-button"
                data-action="delete"
                data-id="${product.id}"
            >
                🗑️ حذف
            </button>

        </div>

    `;


    return card;

}


/* ============================================================
   Open Form
============================================================ */

function openProductForm(
    screen,
    product = null
) {

    const form =
        $('#product-form-container', screen);


    if (!form) {
        return;
    }


    const title =
        $('#product-form-title', screen);


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


    clearProductMessage(
        screen
    );


    if (product) {

        PRODUCTS_STATE.editingId =
            product.id;


        if (title) {

            title.textContent =
                'ویرایش کالا';

        }


        barcode.value =
            product.barcode || '';


        name.value =
            product.name || '';


        category.value =
            product.category || '';


        price.value =
            product.salePrice ?? '';


        stock.value =
            product.stock ?? '';


        barcode.readOnly =
            true;

    } else {

        PRODUCTS_STATE.editingId =
            null;


        if (title) {

            title.textContent =
                'افزودن کالای جدید';

        }


        barcode.value =
            '';

        name.value =
            '';

        category.value =
            '';

        price.value =
            '';

        stock.value =
            '';


        barcode.readOnly =
            false;

    }


    form.hidden =
        false;


    requestAnimationFrame(
        () => {

            form.classList.add(
                'product-form-visible'
            );

        }
    );


    setTimeout(
        () => {

            if (barcode) {

                barcode.focus();

            }

        },
        80
    );

}


/* ============================================================
   Close Form
============================================================ */

function closeProductForm(screen) {

    const form =
        $('#product-form-container', screen);


    if (!form) {
        return;
    }


    PRODUCTS_STATE.editingId =
        null;


    clearProductMessage(
        screen
    );


    form.classList.remove(
        'product-form-visible'
    );


    setTimeout(
        () => {

            form.hidden =
                true;

        },
        150
    );

}


/* ============================================================
   Save Product
============================================================ */

async function saveProduct(screen) {

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


    if (
        !barcodeInput ||
        !nameInput ||
        !priceInput ||
        !stockInput
    ) {

        return;

    }


    clearProductMessage(
        screen
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
                ? 'در حال ذخیره تغییرات...'
                : 'در حال ذخیره...';

    }


    try {

        const now =
            new Date().toISOString();


        if (
            PRODUCTS_STATE.editingId !== null
        ) {

            const oldProduct =
                PRODUCTS_STATE.products.find(
                    product =>
                        Number(product.id) ===
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
            450
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: save product error',
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
                '❌ ذخیره اطلاعات کالا انجام نشد.',
                false
            );

        }

    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                PRODUCTS_STATE.editingId
                    ? 'ذخیره تغییرات'
                    : 'ذخیره کالا';

        }

    }

}


/* ============================================================
   Edit
============================================================ */

function editProduct(
    screen,
    id
) {

    const product =
        PRODUCTS_STATE.products.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!product) {

        showProductMessage(
            screen,
            '❌ کالا پیدا نشد.',
            false
        );

        return;

    }


    openProductForm(
        screen,
        product
    );

}


/* ============================================================
   Delete
============================================================ */

async function confirmDeleteProduct(
    screen,
    id
) {

    const product =
        PRODUCTS_STATE.products.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!product) {
        return;
    }


    const confirmed =
        await showConfirmModal({

            title:
                'حذف کالا',

            message:
                `آیا از حذف «${product.name || 'این کالا'}» مطمئن هستید؟\nاین عملیات قابل بازگشت نیست.`,

            icon:
                '🗑️',

            type:
                'danger',

            confirmText:
                'حذف کالا',

            cancelText:
                'انصراف'

        });


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


        showToast(
            'کالا با موفقیت حذف شد.',
            'success'
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: delete product error',
            error
        );


        showToast(
            'حذف کالا انجام نشد.',
            'danger'
        );

    }

}


/* ============================================================
   Confirm Modal
============================================================ */

function showConfirmModal(
    options = {}
) {

    return new Promise(
        resolve => {

            const old =
                document.getElementById(
                    'products-confirm-modal'
                );


            if (old) {
                old.remove();
            }


            const modal =
                document.createElement(
                    'div'
                );


            modal.id =
                'products-confirm-modal';


            modal.className =
                'app-confirm-overlay';


            const type =
                options.type === 'danger'
                    ? 'danger'
                    : 'info';


            modal.innerHTML = `

                <div
                    class="app-confirm-dialog"
                    role="dialog"
                    aria-modal="true"
                >

                    <div class="app-confirm-icon ${type}">
                        ${escapeHTML(
                            options.icon || '❔'
                        )}
                    </div>


                    <div class="app-confirm-content">

                        <h2>
                            ${escapeHTML(
                                options.title ||
                                'تأیید عملیات'
                            )}
                        </h2>


                        <p>
                            ${escapeHTML(
                                options.message || ''
                            ).replaceAll(
                                '\n',
                                '<br>'
                            )}
                        </p>

                    </div>


                    <div class="app-confirm-actions">

                        <button
                            type="button"
                            class="app-confirm-cancel"
                        >
                            ${escapeHTML(
                                options.cancelText ||
                                'انصراف'
                            )}
                        </button>


                        <button
                            type="button"
                            class="app-confirm-submit ${type}"
                        >
                            ${escapeHTML(
                                options.confirmText ||
                                'تأیید'
                            )}
                        </button>

                    </div>

                </div>

            `;


            document.body.appendChild(
                modal
            );


            const cancel =
                modal.querySelector(
                    '.app-confirm-cancel'
                );


            const confirm =
                modal.querySelector(
                    '.app-confirm-submit'
                );


            let closed =
                false;


            function close(result) {

                if (closed) {
                    return;
                }


                closed =
                    true;


                modal.classList.add(
                    'app-confirm-closing'
                );


                setTimeout(
                    () => {

                        modal.remove();

                        resolve(
                            result
                        );

                    },
                    160
                );

            }


            cancel.addEventListener(
                'click',
                () => {

                    close(false);

                }
            );


            confirm.addEventListener(
                'click',
                () => {

                    close(true);

                }
            );


            modal.addEventListener(
                'click',
                event => {

                    if (
                        event.target === modal
                    ) {

                        close(false);

                    }

                }
            );


            const escapeHandler =
                event => {

                    if (
                        event.key === 'Escape'
                    ) {

                        document.removeEventListener(
                            'keydown',
                            escapeHandler
                        );

                        close(false);

                    }

                };


            document.addEventListener(
                'keydown',
                escapeHandler
            );


            requestAnimationFrame(
                () => {

                    modal.classList.add(
                        'app-confirm-visible'
                    );


                    if (cancel) {
                        cancel.focus();
                    }

                }
            );

        }
    );

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


    box.textContent =
        '';


    box.className =
        'product-form-message';

}


/* ============================================================
   Toast
============================================================ */

function showToast(
    message,
    type = 'success'
) {

    let toast =
        document.getElementById(
            'products-toast'
        );


    if (!toast) {

        toast =
            document.createElement(
                'div'
            );


        toast.id =
            'products-toast';


        document.body.appendChild(
            toast
        );

    }


    toast.className =
        `app-toast app-toast-${type}`;


    toast.textContent =
        message;


    requestAnimationFrame(
        () => {

            toast.classList.add(
                'app-toast-visible'
            );

        }
    );


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    'app-toast-visible'
                );

            },
            2800
        );

}


/* ============================================================
   Navigation
============================================================ */

function goHome() {

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
