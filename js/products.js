// js/products.js
// SupermarketPOS
// Products Management - Stage 6
// Complete Replacement

'use strict';

import {
    addProduct,
    getAllProducts,
    updateProduct,
    deleteProduct
} from './database.js';


const PRODUCTS_STATE = {

    initialized: false,

    products: [],

    editingId: null,

    searchText: ''

};


/* ============================================================
   Helpers
============================================================ */

function $(selector, root = document) {

    return root.querySelector(selector);

}


function escapeHTML(value) {

    return String(value ?? '')

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

export async function initializeProductsScreen(screen) {

    if (!screen) {
        return;
    }


    if (!PRODUCTS_STATE.initialized) {

        bindProductsEvents(screen);

        PRODUCTS_STATE.initialized = true;

    }


    await loadProducts(screen);

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


        renderProducts(screen);


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
   Events
============================================================ */

function bindProductsEvents(screen) {

    const search =
        $('#products-search', screen);


    if (search) {

        search.addEventListener(
            'input',
            () => {

                PRODUCTS_STATE.searchText =
                    search.value.trim();

                renderProducts(screen);

            }
        );

    }


    screen.addEventListener(
        'click',
        event => {

            const button =
                event.target.closest(
                    '[data-product-action]'
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.productAction;


            const id =
                Number(
                    button.dataset.productId
                );


            if (!Number.isFinite(id)) {
                return;
            }


            if (action === 'edit') {

                openEditProduct(
                    screen,
                    id
                );

            }


            if (action === 'delete') {

                handleDeleteProduct(
                    screen,
                    id
                );

            }

        }
    );

}


/* ============================================================
   Render
============================================================ */

function renderProducts(screen) {

    const list =
        $('#products-list', screen);


    if (!list) {
        return;
    }


    const search =
        PRODUCTS_STATE.searchText
            .toLocaleLowerCase('fa-IR');


    let products =
        PRODUCTS_STATE.products;


    if (search) {

        products =
            products.filter(
                product => {

                    const name =
                        String(
                            product.name || ''
                        ).toLocaleLowerCase('fa-IR');


                    const barcode =
                        String(
                            product.barcode || ''
                        ).toLocaleLowerCase('fa-IR');


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

    }


    list.innerHTML = '';


    const toolbar =
        document.createElement('div');


    toolbar.className =
        'products-list-toolbar';


    toolbar.innerHTML = `

        <div>

            <strong>
                کالاهای فروشگاه
            </strong>

            <span>
                ${formatNumber(products.length)} کالا
            </span>

        </div>

        ${
            search
                ? `
                    <span class="products-search-result">
                        نتیجه جست‌وجو
                    </span>
                `
                : ''
        }

    `;


    list.appendChild(toolbar);


    if (products.length === 0) {

        const empty =
            document.createElement('div');


        empty.className =
            'products-empty';


        empty.innerHTML = `

            <div class="placeholder-icon">
                🔎
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
                        ? 'عبارت جست‌وجو را تغییر دهید.'
                        : 'برای شروع اولین کالای فروشگاه را اضافه کنید.'
                }
            </p>

        `;


        list.appendChild(empty);

        return;

    }


    products.forEach(
        product => {

            list.appendChild(
                createProductCard(product)
            );

        }
    );

}


/* ============================================================
   Product Card
============================================================ */

function createProductCard(product) {

    const card =
        document.createElement('article');


    card.className =
        'product-card';


    const id =
        Number(product.id);


    const price =
        Number(product.salePrice) || 0;


    const stock =
        Number(product.stock) || 0;


    let stockClass =
        'product-stock-normal';


    let stockText =
        'موجود';


    if (stock <= 0) {

        stockClass =
            'product-stock-empty';

        stockText =
            'ناموجود';

    } else if (stock <= 5) {

        stockClass =
            'product-stock-low';

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
                </strong>

            </div>

        </div>


        <div class="product-card-actions">

            <button
                type="button"
                class="product-edit-button"
                data-product-action="edit"
                data-product-id="${id}"
            >
                ✏️ ویرایش
            </button>

            <button
                type="button"
                class="product-delete-button"
                data-product-action="delete"
                data-product-id="${id}"
            >
                🗑️ حذف
            </button>

        </div>

    `;


    return card;

}


/* ============================================================
   Edit
============================================================ */

function openEditProduct(screen, id) {

    const product =
        PRODUCTS_STATE.products.find(
            item =>
                Number(item.id) === id
        );


    if (!product) {
        return;
    }


    PRODUCTS_STATE.editingId =
        id;


    const form =
        $('#product-form-container', screen);


    if (!form) {
        return;
    }


    const title =
        form.querySelector('h3');


    const description =
        form.querySelector('p');


    const saveButton =
        $('#save-product-button', screen);


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


    if (title) {

        title.textContent =
            'ویرایش کالا';

    }


    if (description) {

        description.textContent =
            'اطلاعات کالا را ویرایش کنید.';

    }


    if (saveButton) {

        saveButton.textContent =
            'ذخیره تغییرات';

    }


    if (barcode) {

        barcode.value =
            product.barcode || '';

        barcode.readOnly =
            true;

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


    form.style.display =
        'block';


    if (name) {

        name.focus();

    }

}


/* ============================================================
   Save Product
============================================================ */

export async function saveProductFromForm(screen) {

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
        categoryInput
            ? categoryInput.value.trim()
            : '';


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
            PRODUCTS_STATE.editingId !== null
        ) {

            const existing =
                PRODUCTS_STATE.products.find(
                    product =>
                        Number(product.id) ===
                        PRODUCTS_STATE.editingId
                );


            if (!existing) {

                throw new Error(
                    'Product not found'
                );

            }


            const updatedProduct = {

                ...existing,

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
                '✅ تغییرات کالا با موفقیت ذخیره شد.',
                true
            );

        } else {

            await addProduct({

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

            });


            showProductMessage(
                screen,
                '✅ کالا با موفقیت ذخیره شد.',
                true
            );

        }


        PRODUCTS_STATE.editingId =
            null;


        resetProductForm(
            screen
        );


        await loadProducts(
            screen
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
                '❌ ذخیره کالا انجام نشد.',
                false
            );

        }

    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                PRODUCTS_STATE.editingId !== null
                    ? 'ذخیره تغییرات'
                    : 'ذخیره کالا';

        }

    }

}


/* ============================================================
   Delete
============================================================ */

async function handleDeleteProduct(
    screen,
    id
) {

    const product =
        PRODUCTS_STATE.products.find(
            item =>
                Number(item.id) === id
        );


    if (!product) {
        return;
    }


    const confirmed =
        await showProductConfirm(
            product
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteProduct(id);


        if (
            PRODUCTS_STATE.editingId === id
        ) {

            PRODUCTS_STATE.editingId =
                null;

            resetProductForm(
                screen
            );

        }


        await loadProducts(
            screen
        );


        showProductsToast(
            'کالا با موفقیت حذف شد.',
            'success'
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: delete product error',
            error
        );


        showProductsToast(
            'حذف کالا انجام نشد.',
            'danger'
        );

    }

}


/* ============================================================
   Confirm
============================================================ */

function showProductConfirm(product) {

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
                document.createElement('div');


            modal.id =
                'products-confirm-modal';


            modal.className =
                'app-confirm-overlay';


            modal.innerHTML = `

                <div
                    class="app-confirm-dialog"
                    role="dialog"
                    aria-modal="true"
                >

                    <div class="app-confirm-icon danger">
                        🗑️
                    </div>

                    <div class="app-confirm-content">

                        <h2>
                            حذف کالا
                        </h2>

                        <p>
                            آیا از حذف «${escapeHTML(
                                product.name
                            )}» مطمئن هستید؟
                        </p>

                    </div>

                    <div class="app-confirm-actions">

                        <button
                            type="button"
                            class="app-confirm-cancel"
                            data-confirm="cancel"
                        >
                            انصراف
                        </button>

                        <button
                            type="button"
                            class="app-confirm-submit danger"
                            data-confirm="delete"
                        >
                            حذف کالا
                        </button>

                    </div>

                </div>

            `;


            document.body.appendChild(
                modal
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

                        resolve(result);

                    },
                    160
                );

            }


            modal.querySelector(
                '[data-confirm="cancel"]'
            ).addEventListener(
                'click',
                () => close(false)
            );


            modal.querySelector(
                '[data-confirm="delete"]'
            ).addEventListener(
                'click',
                () => close(true)
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


            requestAnimationFrame(
                () => {

                    modal.classList.add(
                        'app-confirm-visible'
                    );

                }
            );

        }
    );

}


/* ============================================================
   Form Reset
============================================================ */

function resetProductForm(screen) {

    const form =
        $('#product-form-container', screen);


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


    const title =
        form
            ? form.querySelector('h3')
            : null;


    const description =
        form
            ? form.querySelector('p')
            : null;


    const saveButton =
        $('#save-product-button', screen);


    if (barcode) {

        barcode.value =
            '';

        barcode.readOnly =
            false;

    }


    if (name) {
        name.value = '';
    }


    if (category) {
        category.value = '';
    }


    if (price) {
        price.value = '';
    }


    if (stock) {
        stock.value = '';
    }


    if (title) {

        title.textContent =
            'افزودن کالای جدید';

    }


    if (description) {

        description.textContent =
            'اطلاعات کالا را وارد کنید.';

    }


    if (saveButton) {

        saveButton.textContent =
            'ذخیره کالا';

    }


    clearProductMessage(
        screen
    );


    PRODUCTS_STATE.editingId =
        null;

}


/* ============================================================
   Public Form Setup
============================================================ */

export function setupProductsForm(screen) {

    const addButton =
        $('#add-product-button', screen);


    const form =
        $('#product-form-container', screen);


    const closeButton =
        $('#close-product-form', screen);


    const cancelButton =
        $('#cancel-product-button', screen);


    const saveButton =
        $('#save-product-button', screen);


    if (addButton) {

        addButton.addEventListener(
            'click',
            () => {

                resetProductForm(
                    screen
                );


                form.style.display =
                    'block';


                const barcode =
                    $('#product-barcode', screen);


                if (barcode) {
                    barcode.focus();
                }

            }
        );

    }


    function closeForm() {

        resetProductForm(
            screen
        );


        if (form) {

            form.style.display =
                'none';

        }

    }


    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeForm
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            closeForm
        );

    }


    if (saveButton) {

        saveButton.addEventListener(
            'click',
            () => {

                saveProductFromForm(
                    screen
                );

            }
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
   Toast
============================================================ */

function showProductsToast(
    message,
    type = 'success'
) {

    let toast =
        document.getElementById(
            'app-toast'
        );


    if (!toast) {

        toast =
            document.createElement(
                'div'
            );

        toast.id =
            'app-toast';

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
        toast._hideTimer
    );


    toast._hideTimer =
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
   Search UI
============================================================ */

export function addProductsSearch(screen) {

    const header =
        screen.querySelector(
            '.products-header'
        );


    if (!header) {
        return;
    }


    if (
        screen.querySelector(
            '#products-search'
        )
    ) {
        return;
    }


    const search =
        document.createElement(
            'div'
        );


    search.className =
        'products-search-wrapper';


    search.innerHTML = `

        <span class="products-search-icon">
            🔎
        </span>

        <input
            type="search"
            id="products-search"
            class="products-search-input"
            placeholder="جست‌وجوی نام، بارکد یا دسته‌بندی..."
            autocomplete="off"
        >

    `;


    header.appendChild(
        search
    );

}


/* ============================================================
   Main Setup
============================================================ */

export async function setupProductsScreen(screen) {

    if (!screen) {
        return;
    }


    addProductsSearch(
        screen
    );


    setupProductsForm(
        screen
    );


    await initializeProductsScreen(
        screen
    );

}
