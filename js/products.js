// js/products.js
// SupermarketPOS
// Products Management - Stage 6
// Compatible with current app.js

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

const STATE = {
    products: [],
    searchText: '',
    editingId: null
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


function number(value) {

    return (Number(value) || 0)
        .toLocaleString('fa-IR');

}


function price(value) {

    return (Number(value) || 0)
        .toLocaleString('fa-IR');

}


/* ============================================================
   MAIN ENTRY
============================================================ */

export async function initializeProductsScreen(
    screen,
    options = {}
) {

    if (!screen) {
        console.error(
            'SupermarketPOS: products screen not found.'
        );
        return;
    }


    console.log(
        'SupermarketPOS: initializing products screen...'
    );


    /*
       IMPORTANT:
       app.js creates an empty section.
       We build the entire UI here.
    */

    buildProductsUI(screen);


    bindEvents(screen);


    await loadProducts(screen);

}


/* ============================================================
   BUILD UI
============================================================ */

function buildProductsUI(screen) {

    screen.innerHTML = `

        <div class="products-page">


            <!-- HEADER -->

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


                <div class="products-header-search">

                    <div class="products-search-wrapper">

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

                    </div>

                </div>

            </div>


            <!-- ACTIONS -->

            <div class="products-actions">

                <button
                    type="button"
                    class="add-product-button"
                    id="add-product-button"
                >
                    ＋ افزودن کالا
                </button>

            </div>


            <!-- BACKUP -->

            <div class="backup-card">

                <div class="backup-card-icon">
                    💾
                </div>

                <div class="backup-card-content">

                    <h3>
                        پشتیبان اطلاعات
                    </h3>

                    <p>
                        ذخیره یا بازیابی کالاهای این دستگاه
                    </p>

                </div>

                <div class="backup-actions">

                    <button
                        type="button"
                        class="backup-button"
                        id="backup-button"
                    >
                        💾 پشتیبان‌گیری
                    </button>

                    <button
                        type="button"
                        class="restore-button"
                        id="restore-button"
                    >
                        📂 بازیابی
                    </button>

                    <input
                        type="file"
                        id="restore-file-input"
                        accept=".json,application/json"
                        hidden
                    >

                </div>

            </div>


            <!-- FORM -->

            <div
                id="product-form-container"
                class="product-form-container"
                style="display:none;"
            >

                <div class="product-form">

                    <div class="product-form-header">

                        <div>

                            <h3>
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
                        >
                            ×
                        </button>

                    </div>


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
                            placeholder="موجودی"
                        >

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


            <!-- PRODUCTS -->

            <div
                id="products-list"
                class="products-list"
            >

                <div class="products-loading">

                    <div class="placeholder-icon">
                        ⏳
                    </div>

                    <p>
                        در حال خواندن کالاها...
                    </p>

                </div>

            </div>


            <!-- BACK -->

            <button
                type="button"
                class="products-back-button"
                id="products-back-button"
            >
                ← بازگشت به صفحه اصلی
            </button>


        </div>

    `;

}


/* ============================================================
   EVENTS
============================================================ */

function bindEvents(screen) {

    const addButton =
        $('#add-product-button', screen);


    const closeButton =
        $('#close-product-form', screen);


    const cancelButton =
        $('#cancel-product-button', screen);


    const saveButton =
        $('#save-product-button', screen);


    const search =
        $('#products-search', screen);


    const backButton =
        $('#products-back-button', screen);


    /* ADD */

    if (addButton) {

        addButton.addEventListener(
            'click',
            () => {

                resetForm(screen);

                const form =
                    $('#product-form-container', screen);

                if (form) {
                    form.style.display = 'block';
                }


                const barcode =
                    $('#product-barcode', screen);

                if (barcode) {
                    barcode.focus();
                }

            }
        );

    }


    /* CLOSE */

    if (closeButton) {

        closeButton.addEventListener(
            'click',
            () => {

                closeForm(screen);

            }
        );

    }


    /* CANCEL */

    if (cancelButton) {

        cancelButton.addEventListener(
            'click',
            () => {

                closeForm(screen);

            }
        );

    }


    /* SAVE */

    if (saveButton) {

        saveButton.addEventListener(
            'click',
            () => {

                saveProductFromForm(screen);

            }
        );

    }


    /* SEARCH */

    if (search) {

        search.addEventListener(
            'input',
            () => {

                STATE.searchText =
                    search.value.trim();

                renderProducts(screen);

            }
        );

    }


    /* BACK */

    if (backButton) {

        backButton.addEventListener(
            'click',
            () => {

                screen.style.display =
                    'none';


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


    /* CARD ACTIONS */

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

                editProduct(
                    screen,
                    id
                );

            }


            if (action === 'delete') {

                removeProduct(
                    screen,
                    id
                );

            }

        }
    );


    setupBackup(screen);

    setupRestore(screen);

}


/* ============================================================
   LOAD PRODUCTS
============================================================ */

async function loadProducts(screen) {

    const list =
        $('#products-list', screen);


    if (!list) {

        console.error(
            'SupermarketPOS: #products-list not found.'
        );

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

        const result =
            await getAllProducts();


        STATE.products =
            Array.isArray(result)
                ? result
                : [];


        console.log(
            'SupermarketPOS: products loaded:',
            STATE.products.length
        );


        renderProducts(screen);


    } catch (error) {

        console.error(
            'SupermarketPOS: getAllProducts failed:',
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
   RENDER
============================================================ */

function renderProducts(screen) {

    const list =
        $('#products-list', screen);


    if (!list) {
        return;
    }


    const query =
        STATE.searchText
            .toLocaleLowerCase('fa-IR');


    let products =
        STATE.products;


    if (query) {

        products =
            products.filter(
                product => {

                    const name =
                        String(
                            product.name || ''
                        )
                        .toLocaleLowerCase('fa-IR');


                    const barcode =
                        String(
                            product.barcode || ''
                        )
                        .toLocaleLowerCase('fa-IR');


                    const category =
                        String(
                            product.category || ''
                        )
                        .toLocaleLowerCase('fa-IR');


                    return (
                        name.includes(query) ||
                        barcode.includes(query) ||
                        category.includes(query)
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
                ${number(products.length)}
                کالا
            </span>

        </div>

        ${
            query
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
                ${
                    query
                        ? '🔎'
                        : '📦'
                }
            </div>

            <h3>
                ${
                    query
                        ? 'کالایی پیدا نشد'
                        : 'هنوز کالایی ثبت نشده است'
                }
            </h3>

            <p>
                ${
                    query
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
   PRODUCT CARD
============================================================ */

function createProductCard(product) {

    const card =
        document.createElement('article');


    card.className =
        'product-card';


    const id =
        Number(product.id);


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
                    ${price(
                        product.salePrice
                    )}
                    تومان
                </strong>

            </div>


            <div class="product-detail">

                <span>
                    موجودی
                </span>

                <strong>
                    ${number(stock)}
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
   SAVE
============================================================ */

async function saveProductFromForm(screen) {

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

        showToast(
            'فرم کالا کامل نیست.',
            'danger'
        );

        return;

    }


    clearMessage(screen);


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


    const salePrice =
        Number(priceText);


    const stock =
        stockText === ''
            ? 0
            : Number(stockText);


    if (!barcode) {

        showMessage(
            screen,
            '⚠️ بارکد را وارد کنید.',
            false
        );

        barcodeInput.focus();

        return;

    }


    if (!name) {

        showMessage(
            screen,
            '⚠️ نام کالا را وارد کنید.',
            false
        );

        nameInput.focus();

        return;

    }


    if (
        priceText === '' ||
        !Number.isFinite(salePrice) ||
        salePrice < 0
    ) {

        showMessage(
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

        showMessage(
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
            STATE.editingId !== null
                ? 'در حال ذخیره...'
                : 'در حال افزودن...';

    }


    try {

        const now =
            new Date().toISOString();


        if (
            STATE.editingId !== null
        ) {

            const existing =
                STATE.products.find(
                    product =>
                        Number(product.id) ===
                        STATE.editingId
                );


            if (!existing) {
                throw new Error(
                    'Product not found'
                );
            }


            await updateProduct({

                ...existing,

                barcode,

                name,

                category,

                salePrice,

                stock,

                updatedAt:
                    now

            });


            showMessage(
                screen,
                '✅ تغییرات کالا ذخیره شد.',
                true
            );

        } else {

            await addProduct({

                barcode,

                name,

                category,

                salePrice,

                stock,

                createdAt:
                    now,

                updatedAt:
                    now

            });


            showMessage(
                screen,
                '✅ کالا با موفقیت اضافه شد.',
                true
            );

        }


        STATE.editingId =
            null;


        closeForm(screen);


        await loadProducts(screen);


        showToast(
            'اطلاعات کالا ذخیره شد.',
            'success'
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: save product error:',
            error
        );


        if (
            error &&
            error.name ===
                'ConstraintError'
        ) {

            showMessage(
                screen,
                '⚠️ این بارکد قبلاً ثبت شده است.',
                false
            );

        } else {

            showMessage(
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
                'ذخیره کالا';

        }

    }

}


/* ============================================================
   EDIT
============================================================ */

function editProduct(screen, id) {

    const product =
        STATE.products.find(
            item =>
                Number(item.id) === id
        );


    if (!product) {

        showToast(
            'کالا پیدا نشد.',
            'danger'
        );

        return;

    }


    STATE.editingId =
        id;


    const form =
        $('#product-form-container', screen);


    if (!form) {
        return;
    }


    const barcode =
        $('#product-barcode', screen);


    const name =
        $('#product-name', screen);


    const category =
        $('#product-category', screen);


    const priceInput =
        $('#product-price', screen);


    const stock =
        $('#product-stock', screen);


    const title =
        form.querySelector('h3');


    const description =
        form.querySelector('p');


    const saveButton =
        $('#save-product-button', screen);


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


    if (priceInput) {
        priceInput.value =
            Number(product.salePrice) || 0;
    }


    if (stock) {
        stock.value =
            Number(product.stock) || 0;
    }


    clearMessage(screen);


    form.style.display =
        'block';


    if (name) {
        name.focus();
    }

}


/* ============================================================
   DELETE
============================================================ */

async function removeProduct(screen, id) {

    const product =
        STATE.products.find(
            item =>
                Number(item.id) === id
        );


    if (!product) {
        return;
    }


    const confirmed =
        window.confirm(
            `آیا از حذف «${product.name || 'این کالا'}» مطمئن هستید؟`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteProduct(id);


        await loadProducts(screen);


        showToast(
            'کالا با موفقیت حذف شد.',
            'success'
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: delete error:',
            error
        );


        showToast(
            'حذف کالا انجام نشد.',
            'danger'
        );

    }

}


/* ============================================================
   RESET
============================================================ */

function resetForm(screen) {

    STATE.editingId =
        null;


    const form =
        $('#product-form-container', screen);


    const barcode =
        $('#product-barcode', screen);


    const name =
        $('#product-name', screen);


    const category =
        $('#product-category', screen);


    const priceInput =
        $('#product-price', screen);


    const stock =
        $('#product-stock', screen);


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


    if (priceInput) {
        priceInput.value = '';
    }


    if (stock) {
        stock.value = '';
    }


    if (form) {

        const title =
            form.querySelector('h3');

        const description =
            form.querySelector('p');


        if (title) {
            title.textContent =
                'افزودن کالای جدید';
        }


        if (description) {
            description.textContent =
                'اطلاعات کالا را وارد کنید.';
        }

    }


    if (saveButton) {
        saveButton.textContent =
            'ذخیره کالا';
    }


    clearMessage(screen);

}


/* ============================================================
   CLOSE FORM
============================================================ */

function closeForm(screen) {

    resetForm(screen);


    const form =
        $('#product-form-container', screen);


    if (form) {
        form.style.display =
            'none';
    }

}


/* ============================================================
   MESSAGE
============================================================ */

function showMessage(
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


function clearMessage(screen) {

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
   BACKUP
============================================================ */

function setupBackup(screen) {

    const button =
        $('#backup-button', screen);


    if (!button) {
        return;
    }


    button.addEventListener(
        'click',
        async () => {

            try {

                button.disabled =
                    true;


                button.textContent =
                    'در حال آماده‌سازی...';


                const products =
                    await getAllProducts();


                const backup = {

                    type:
                        'SupermarketPOS',

                    version:
                        1,

                    createdAt:
                        new Date().toISOString(),

                    products:
                        Array.isArray(products)
                            ? products
                            : []

                };


                const blob =
                    new Blob(
                        [
                            JSON.stringify(
                                backup,
                                null,
                                2
                            )
                        ],
                        {
                            type:
                                'application/json;charset=utf-8'
                        }
                    );


                const url =
                    URL.createObjectURL(blob);


                const link =
                    document.createElement('a');


                link.href =
                    url;


                link.download =
                    `SupermarketPOS-Backup-${Date.now()}.json`;


                document.body.appendChild(link);

                link.click();

                link.remove();


                URL.revokeObjectURL(url);


                showToast(
                    'پشتیبان با موفقیت آماده شد.',
                    'success'
                );


            } catch (error) {

                console.error(
                    'Backup error:',
                    error
                );


                showToast(
                    'پشتیبان‌گیری انجام نشد.',
                    'danger'
                );

            } finally {

                button.disabled =
                    false;

                button.textContent =
                    '💾 پشتیبان‌گیری';

            }

        }
    );

}


/* ============================================================
   RESTORE
============================================================ */

function setupRestore(screen) {

    const button =
        $('#restore-button', screen);


    const input =
        $('#restore-file-input', screen);


    if (!button || !input) {
        return;
    }


    button.addEventListener(
        'click',
        () => {

            input.value =
                '';

            input.click();

        }
    );


    input.addEventListener(
        'change',
        async event => {

            const file =
                event.target.files &&
                event.target.files[0];


            if (!file) {
                return;
            }


            try {

                const text =
                    await file.text();


                const backup =
                    JSON.parse(text);


                if (
                    !backup ||
                    backup.type !==
                        'SupermarketPOS' ||
                    !Array.isArray(
                        backup.products
                    )
                ) {

                    throw new Error(
                        'Invalid backup'
                    );

                }


                const confirmed =
                    window.confirm(
                        `این فایل شامل ${number(
                            backup.products.length
                        )} کالا است.\n\nاطلاعات موجود با فایل پشتیبان ادغام می‌شود.\n\nآیا ادامه می‌دهید؟`
                    );


                if (!confirmed) {
                    return;
                }


                for (
                    const product
                    of backup.products
                ) {

                    try {

                        await addProduct({

                            barcode:
                                product.barcode,

                            name:
                                product.name,

                            category:
                                product.category || '',

                            salePrice:
                                Number(
                                    product.salePrice
                                ) || 0,

                            stock:
                                Number(
                                    product.stock
                                ) || 0,

                            createdAt:
                                product.createdAt ||
                                new Date().toISOString(),

                            updatedAt:
                                new Date().toISOString()

                        });

                    } catch (error) {

                        /*
                           Duplicate barcode:
                           update existing product.
                        */

                        if (
                            error &&
                            error.name ===
                                'ConstraintError'
                        ) {

                            const existing =
                                STATE.products.find(
                                    item =>
                                        String(
                                            item.barcode
                                        ) ===
                                        String(
                                            product.barcode
                                        )
                                );


                            if (existing) {

                                await updateProduct({

                                    ...existing,

                                    name:
                                        product.name,

                                    category:
                                        product.category || '',

                                    salePrice:
                                        Number(
                                            product.salePrice
                                        ) || 0,

                                    stock:
                                        Number(
                                            product.stock
                                        ) || 0,

                                    updatedAt:
                                        new Date().toISOString()

                                });

                            }

                        } else {

                            throw error;

                        }

                    }

                }


                await loadProducts(screen);


                showToast(
                    'بازیابی اطلاعات با موفقیت انجام شد.',
                    'success'
                );


            } catch (error) {

                console.error(
                    'Restore error:',
                    error
                );


                showToast(
                    'فایل پشتیبان معتبر نیست یا بازیابی انجام نشد.',
                    'danger'
                );

            }

        }
    );

}


/* ============================================================
   TOAST
============================================================ */

function showToast(
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
   Compatibility
============================================================ */

export function setupProductsForm(screen) {

    /*
       Form is initialized by
       initializeProductsScreen().
    */

}


export function addProductsSearch(screen) {

    /*
       Search is created by
       buildProductsUI().
    */

}
