// js/app.js
// SupermarketPOS
// Application Controller
// Stage 5
// Full Version
// Navigation + Products + Backup + Restore + Global Modal + Toast

'use strict';

import {
initializeDatabase,
addProduct,
getAllProducts,
getProductsForBackup,
restoreProductsMerge
} from './database.js';

// ============================================================================
// Application State
// ============================================================================

const APP_STATE = {

initialized: false,

databaseReady: false

};

// ============================================================================
// DOM
// ============================================================================

const DOM = {

app: null,

modal: null,

modalTitle: null,

modalMessage: null,

modalIcon: null,

modalConfirm: null,

modalCancel: null,

modalBackdrop: null,

toast: null,

toastIcon: null,

toastMessage: null

};

// ============================================================================
// Modal State
// ============================================================================

let activeModalResolve = null;

let activeModalReject = null;

let previousFocusedElement = null;

// ============================================================================
// Modal DOM Initialization
// ============================================================================

function initializeModalDOM() {

DOM.modal =
    document.getElementById(
        'app-modal'
    );


DOM.modalTitle =
    document.getElementById(
        'app-modal-title'
    );


DOM.modalMessage =
    document.getElementById(
        'app-modal-message'
    );


DOM.modalIcon =
    document.getElementById(
        'app-modal-icon'
    );


DOM.modalConfirm =
    document.getElementById(
        'app-modal-confirm'
    );


DOM.modalCancel =
    document.getElementById(
        'app-modal-cancel'
    );


DOM.modalBackdrop =
    document.querySelector(
        '[data-modal-close="backdrop"]'
    );


if (
    !DOM.modal ||
    !DOM.modalTitle ||
    !DOM.modalMessage ||
    !DOM.modalConfirm ||
    !DOM.modalCancel
) {

    console.error(
        'SupermarketPOS: Modal DOM پیدا نشد.'
    );

    return false;
}


DOM.modalConfirm.addEventListener(
    'click',
    () => {

        closeModal(
            true
        );

    }
);


DOM.modalCancel.addEventListener(
    'click',
    () => {

        closeModal(
            false
        );

    }
);


if (DOM.modalBackdrop) {

    DOM.modalBackdrop.addEventListener(
        'click',
        () => {

            closeModal(
                false
            );

        }
    );

}


document.addEventListener(
    'keydown',
    event => {

        if (
            event.key === 'Escape' &&
            isModalOpen()
        ) {

            closeModal(
                false
            );

            return;
        }


        if (
            event.key === 'Enter' &&
            isModalOpen()
        ) {

            const active =
                document.activeElement;


            if (
                active === DOM.modalCancel
            ) {

                return;
            }


            closeModal(
                true
            );

        }

    }
);


return true;

}

// ============================================================================
// Modal Open
// ============================================================================

function openModal(options = {}) {

if (!DOM.modal) {

    return Promise.resolve(
        false
    );

}


if (
    activeModalResolve
) {

    closeModal(
        false
    );

}


previousFocusedElement =
    document.activeElement;


const title =
    options.title ||
    'تأیید عملیات';


const message =
    options.message ||
    'آیا از انجام این عملیات مطمئن هستید؟';


const icon =
    options.icon ||
    '❔';


const confirmText =
    options.confirmText ||
    'تأیید';


const cancelText =
    options.cancelText ||
    'انصراف';


const type =
    options.type ||
    'confirm';


DOM.modalTitle.textContent =
    title;


DOM.modalMessage.textContent =
    message;


DOM.modalIcon.textContent =
    icon;


DOM.modalConfirm.textContent =
    confirmText;


DOM.modalCancel.textContent =
    cancelText;


DOM.modal.classList.remove(
    'modal-success',
    'modal-danger',
    'modal-warning',
    'modal-info',
    'modal-confirm'
);


DOM.modal.classList.add(
    `modal-${type}`
);


DOM.modal.style.display =
    'flex';


DOM.modal.setAttribute(
    'aria-hidden',
    'false'
);


document.body.classList.add(
    'modal-open'
);


requestAnimationFrame(
    () => {

        DOM.modal.classList.add(
            'is-visible'
        );

    }
);


setTimeout(
    () => {

        if (DOM.modalConfirm) {

            DOM.modalConfirm.focus();

        }

    },
    30
);


return new Promise(
    resolve => {

        activeModalResolve =
            resolve;

        activeModalReject =
            null;

    }
);

}

// ============================================================================
// Modal Close
// ============================================================================

function closeModal(result = false) {

if (!DOM.modal) {

    return;

}


const resolve =
    activeModalResolve;


activeModalResolve =
    null;

activeModalReject =
    null;


DOM.modal.classList.remove(
    'is-visible'
);


DOM.modal.setAttribute(
    'aria-hidden',
    'true'
);


document.body.classList.remove(
    'modal-open'
);


setTimeout(
    () => {

        if (DOM.modal) {

            DOM.modal.style.display =
                'none';

        }

    },
    220
);


if (
    previousFocusedElement &&
    typeof previousFocusedElement.focus ===
        'function'
) {

    try {

        previousFocusedElement.focus();

    } catch (error) {

        console.warn(
            'SupermarketPOS: بازگردانی Focus انجام نشد.',
            error
        );

    }

}


previousFocusedElement =
    null;


if (resolve) {

    resolve(
        Boolean(result)
    );

}

}

// ============================================================================
// Is Modal Open
// ============================================================================

function isModalOpen() {

return Boolean(
    DOM.modal &&
    DOM.modal.classList.contains(
        'is-visible'
    )
);

}

// ============================================================================
// Confirm Modal
// ============================================================================

function confirmModal(
message,
options = {}
) {

return openModal({

    title:
        options.title ||
        'تأیید عملیات',

    message:
        message,

    icon:
        options.icon ||
        '❔',

    confirmText:
        options.confirmText ||
        'تأیید',

    cancelText:
        options.cancelText ||
        'انصراف',

    type:
        options.type ||
        'confirm'

});

}

// ============================================================================
// Success Modal
// ============================================================================

function successModal(
message,
options = {}
) {

return openModal({

    title:
        options.title ||
        'عملیات موفق',

    message:
        message,

    icon:
        options.icon ||
        '✓',

    confirmText:
        options.confirmText ||
        'باشه',

    cancelText:
        options.cancelText ||
        'بستن',

    type:
        'success'

});

}

// ============================================================================
// Warning Modal
// ============================================================================

function warningModal(
message,
options = {}
) {

return openModal({

    title:
        options.title ||
        'توجه',

    message:
        message,

    icon:
        options.icon ||
        '⚠️',

    confirmText:
        options.confirmText ||
        'متوجه شدم',

    cancelText:
        options.cancelText ||
        'بستن',

    type:
        'warning'

});

}

// ============================================================================
// Error Modal
// ============================================================================

function errorModal(
message,
options = {}
) {

return openModal({

    title:
        options.title ||
        'خطا',

    message:
        message,

    icon:
        options.icon ||
        '✕',

    confirmText:
        options.confirmText ||
        'باشه',

    cancelText:
        options.cancelText ||
        'بستن',

    type:
        'danger'

});

}

// ============================================================================
// Toast
// ============================================================================

let toastTimer = null;

function initializeToastDOM() {

DOM.toast =
    document.getElementById(
        'app-toast'
    );


DOM.toastIcon =
    document.getElementById(
        'app-toast-icon'
    );


DOM.toastMessage =
    document.getElementById(
        'app-toast-message'
    );


return Boolean(
    DOM.toast &&
    DOM.toastIcon &&
    DOM.toastMessage
);

}

// ============================================================================
// Show Toast
// ============================================================================

function showToast(
message,
type = 'success',
duration = 2800
) {

if (
    !DOM.toast ||
    !DOM.toastMessage ||
    !DOM.toastIcon
) {

    return;

}


clearTimeout(
    toastTimer
);


const icons = {

    success: '✓',

    error: '✕',

    warning: '⚠️',

    info: 'ℹ'

};


DOM.toastIcon.textContent =
    icons[type] ||
    icons.info;


DOM.toastMessage.textContent =
    message;


DOM.toast.classList.remove(
    'toast-success',
    'toast-error',
    'toast-warning',
    'toast-info',
    'is-visible'
);


DOM.toast.classList.add(
    `toast-${type}`
);


requestAnimationFrame(
    () => {

        DOM.toast.classList.add(
            'is-visible'
        );

    }
);


toastTimer =
    setTimeout(
        () => {

            DOM.toast.classList.remove(
                'is-visible'
            );

        },
        duration
    );

}

// ============================================================================
// Public UI API
// ============================================================================
//
// بخش‌های دیگر برنامه مانند sales.js می‌توانند از این API استفاده کنند.
//
// مثال:
//
// const confirmed = await window.POSModal.confirm(...);
//
// ============================================================================

window.POSModal = {

confirm: confirmModal,

success: successModal,

warning: warningModal,

error: errorModal,

open: openModal,

close: closeModal,

isOpen: isModalOpen,

toast: showToast

};

// ============================================================================
// Database Status
// ============================================================================

function showDatabaseStatus(
message,
success = true
) {

let status =
    document.getElementById(
        'database-test-status'
    );


if (!status) {

    status =
        document.createElement(
            'div'
        );


    status.id =
        'database-test-status';


    status.style.cssText = `
        margin-top: 14px;
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 11px;
        text-align: center;
        border: 1px solid;
    `;


    const home =
        document.querySelector(
            '.home-screen'
        );


    if (home) {

        home.appendChild(
            status
        );

    }

}


status.style.background =
    success
        ? '#ecfdf5'
        : '#fef2f2';


status.style.color =
    success
        ? '#047857'
        : '#b91c1c';


status.style.borderColor =
    success
        ? '#a7f3d0'
        : '#fecaca';


status.textContent =
    message;

}

// ============================================================================
// Header
// ============================================================================

function setupHeaderStatus() {

const headerStatus =
    document.querySelector(
        '.header-status'
    );


if (!headerStatus) {

    return;

}


const ready =
    headerStatus.querySelector(
        '.status-ready'
    );


const online =
    headerStatus.querySelector(
        '.status-online'
    );


if (ready) {

    ready.innerHTML = `

        <span
            class="status-icon"
            aria-hidden="true"
        >
            ✓
        </span>

        <div class="status-info">

            <span class="status-label">
                وضعیت
            </span>

            <strong>
                آماده به کار
            </strong>

        </div>

    `;

}


if (online) {

    online.innerHTML = `

        <span
            class="status-icon"
            aria-hidden="true"
        >
            ◉
        </span>

        <div class="status-info">

            <span class="status-label">
                اتصال
            </span>

            <strong>
                آنلاین
            </strong>

        </div>

    `;

}

}

// ============================================================================
// Hide Secondary Screens
// ============================================================================

function hideSecondaryScreens() {

const sales =
    document.getElementById(
        'sales-screen'
    );


const products =
    document.getElementById(
        'products-screen'
    );


if (sales) {

    sales.style.display =
        'none';

}


if (products) {

    products.style.display =
        'none';

}

}

// ============================================================================
// Home
// ============================================================================

function showHomeScreen() {

hideSecondaryScreens();


const home =
    document.querySelector(
        '.home-screen'
    );


if (home) {

    home.style.display =
        '';

}

}

// ============================================================================
// Sales
// ============================================================================

function openSalesScreen() {

const main =
    document.querySelector(
        'main'
    );


if (!main) {

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


let sales =
    document.getElementById(
        'sales-screen'
    );


if (!sales) {

    sales =
        createSalesScreen();


    main.appendChild(
        sales
    );

}


sales.style.display =
    'block';


const barcodeInput =
    sales.querySelector(
        '#sales-barcode'
    );


if (barcodeInput) {

    setTimeout(
        () => {

            barcodeInput.focus();

        },
        50
    );

}

}

// ============================================================================
// Sales Screen
// ============================================================================

function createSalesScreen() {

const screen =
    document.createElement(
        'section'
    );


screen.id =
    'sales-screen';


screen.className =
    'sales-screen';


screen.innerHTML = `

    <div class="sales-header">

        <h2>
            🛒 فروش و صندوق
        </h2>

        <p>
            بخش فروش فروشگاه
        </p>

    </div>


    <div class="sales-placeholder">

        <div class="placeholder-icon">
            ▣
        </div>

        <h3>
            اسکن یا ورود بارکد
        </h3>

        <p>
            سیستم بارکد در مرحله بعد فعال خواهد شد.
        </p>

    </div>


    <div class="sales-placeholder">

        <div class="placeholder-icon">
            🛍️
        </div>

        <h3>
            سبد خرید
        </h3>

        <p>
            هنوز کالایی به سبد اضافه نشده است.
        </p>

    </div>


    <button
        type="button"
        class="sales-back-button"
        id="sales-back-button"
    >
        ← بازگشت به صفحه اصلی
    </button>

`;


const back =
    screen.querySelector(
        '#sales-back-button'
    );


if (back) {

    back.addEventListener(
        'click',
        showHomeScreen
    );

}


return screen;

}

// ============================================================================
// Products
// ============================================================================

async function openProductsScreen() {

const main =
    document.querySelector(
        'main'
    );


if (!main) {

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


const sales =
    document.getElementById(
        'sales-screen'
    );


if (sales) {

    sales.style.display =
        'none';

}


let products =
    document.getElementById(
        'products-screen'
    );


if (!products) {

    products =
        createProductsScreen();


    main.appendChild(
        products
    );

}


products.style.display =
    'block';


await loadProducts(
    products
);

}

// ============================================================================
// Products Screen
// ============================================================================

function createProductsScreen() {

const screen =
    document.createElement(
        'section'
    );


screen.id =
    'products-screen';


screen.className =
    'products-screen';


screen.innerHTML = `

    <div class="products-header">

        <h2>
            📦 مدیریت کالاها
        </h2>

        <p>
            مدیریت محصولات و موجودی فروشگاه
        </p>

    </div>


    <div class="products-actions">

        <button
            type="button"
            class="add-product-button"
            id="add-product-button"
        >
            ＋ افزودن کالا
        </button>

    </div>


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


    <div
        id="product-form-container"
        class="product-form-container"
        style="display: none;"
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
                    aria-label="بستن فرم"
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
                    autocomplete="off"
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
                    autocomplete="off"
                    value=""
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


setupProductForm(
    screen
);


setupBackup(
    screen
);


setupRestore(
    screen
);


const back =
    screen.querySelector(
        '#products-back-button'
    );


if (back) {

    back.addEventListener(
        'click',
        () => {

            clearProductMessage(
                screen
            );


            clearBackupMessage(
                screen
            );


            showHomeScreen();

        }
    );

}


return screen;

}

// ============================================================================
// Backup
// ============================================================================

function setupBackup(
screen
) {

const backupButton =
    screen.querySelector(
        '#backup-button'
    );


if (!backupButton) {

    return;

}


backupButton.addEventListener(
    'click',
    async () => {

        if (
            !APP_STATE.databaseReady
        ) {

            showBackupMessage(
                screen,
                '❌ پایگاه داده آماده نیست.',
                false
            );

            return;

        }


        clearBackupMessage(
            screen
        );


        backupButton.disabled =
            true;


        backupButton.textContent =
            'در حال آماده‌سازی...';


        try {

            const backup =
                await getProductsForBackup();


            const json =
                JSON.stringify(
                    backup,
                    null,
                    2
                );


            const blob =
                new Blob(
                    [json],
                    {
                        type:
                            'application/json;charset=utf-8'
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    'a'
                );


            const date =
                new Date();


            const dateText =
                date
                    .toISOString()
                    .replace(
                        /[:.]/g,
                        '-'
                    );


            link.href =
                url;


            link.download =
                `SupermarketPOS-Backup-${dateText}.json`;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );


            const count =
                Array.isArray(
                    backup.products
                )
                    ? backup.products.length
                    : 0;


            showBackupMessage(
                screen,
                `✅ پشتیبان ${count.toLocaleString('fa-IR')} کالا با موفقیت ساخته شد.`,
                true
            );


        } catch (error) {

            console.error(
                'SupermarketPOS: خطا در پشتیبان‌گیری.',
                error
            );


            showBackupMessage(
                screen,
                '❌ ساخت فایل پشتیبان انجام نشد.',
                false
            );

        } finally {

            backupButton.disabled =
                false;


            backupButton.textContent =
                '💾 پشتیبان‌گیری';

        }

    }
);

}

// ============================================================================
// Restore
// ============================================================================

function setupRestore(
screen
) {

const restoreButton =
    screen.querySelector(
        '#restore-button'
    );


const fileInput =
    screen.querySelector(
        '#restore-file-input'
    );


if (
    !restoreButton ||
    !fileInput
) {

    return;

}


restoreButton.addEventListener(
    'click',
    () => {

        if (
            !APP_STATE.databaseReady
        ) {

            showBackupMessage(
                screen,
                '❌ پایگاه داده آماده نیست.',
                false
            );

            return;

        }


        fileInput.value =
            '';


        fileInput.click();

    }
);


fileInput.addEventListener(
    'change',
    async event => {

        const file =
            event.target.files &&
            event.target.files[0];


        if (!file) {

            return;

        }


        await processRestoreFile(
            screen,
            file
        );

    }
);

}

// ============================================================================
// Process Restore File
// ============================================================================

async function processRestoreFile(
screen,
file
) {

clearBackupMessage(
    screen
);


try {

    const text =
        await file.text();


    let backup;


    try {

        backup =
            JSON.parse(
                text
            );

    } catch (error) {

        showBackupMessage(
            screen,
            '❌ فایل انتخاب‌شده JSON معتبر نیست.',
            false
        );

        return;

    }


    if (
        !backup ||
        typeof backup !== 'object'
    ) {

        showBackupMessage(
            screen,
            '❌ ساختار فایل پشتیبان معتبر نیست.',
            false
        );

        return;

    }


    if (
        backup.type !==
        'SupermarketPOS'
    ) {

        showBackupMessage(
            screen,
            '❌ این فایل متعلق به SupermarketPOS نیست.',
            false
        );

        return;

    }


    if (
        !Array.isArray(
            backup.products
        )
    ) {

        showBackupMessage(
            screen,
            '❌ بخش کالاها در فایل پشتیبان پیدا نشد.',
            false
        );

        return;

    }


    const products =
        backup.products;


    if (
        products.length === 0
    ) {

        showBackupMessage(
            screen,
            '⚠️ فایل پشتیبان هیچ کالایی ندارد.',
            false
        );

        return;

    }


    const countText =
        products.length
            .toLocaleString('fa-IR');


    const confirmed =
        await confirmModal(
            `فایل پشتیبان شامل ${countText} کالا است.\n\nحالت بازیابی: ادغام (Merge)\n\nکالاهای فعلی که در فایل نیستند حذف نخواهند شد.\nکالاهایی که بارکد مشابه دارند به‌روزرسانی می‌شوند.\n\nآیا می‌خواهید ادامه دهید؟`,
            {
                title:
                    'بازیابی اطلاعات',

                icon:
                    '📂',

                confirmText:
                    'بله، بازیابی کن',

                cancelText:
                    'انصراف',

                type:
                    'warning'
            }
        );


    if (!confirmed) {

        showBackupMessage(
            screen,
            '↩️ عملیات بازیابی لغو شد.',
            true
        );

        return;

    }


    const restoreButton =
        screen.querySelector(
            '#restore-button'
        );


    if (restoreButton) {

        restoreButton.disabled =
            true;


        restoreButton.textContent =
            'در حال بازیابی...';

    }


    const result =
        await restoreProductsMerge(
            products
        );


    const added =
        Number(
            result.added
        ) || 0;


    const updated =
        Number(
            result.updated
        ) || 0;


    const skipped =
        Number(
            result.skipped
        ) || 0;


    let message =
        `✅ بازیابی با موفقیت انجام شد.\n` +
        `➕ اضافه‌شده: ${added.toLocaleString('fa-IR')}\n` +
        `🔄 به‌روزرسانی‌شده: ${updated.toLocaleString('fa-IR')}`;


    if (skipped > 0) {

        message +=
            `\n⚠️ ردشده: ${skipped.toLocaleString('fa-IR')}`;

    }


    showBackupMessage(
        screen,
        message,
        true
    );


    showToast(
        'اطلاعات با موفقیت بازیابی شد.',
        'success'
    );


    await loadProducts(
        screen
    );


} catch (error) {

    console.error(
        'SupermarketPOS: خطا در Restore.',
        error
    );


    showBackupMessage(
        screen,
        '❌ بازیابی انجام نشد. فایل یا اطلاعات آن قابل استفاده نیست.',
        false
    );


    showToast(
        'بازیابی اطلاعات انجام نشد.',
        'error'
    );


} finally {

    const restoreButton =
        screen.querySelector(
            '#restore-button'
        );


    if (restoreButton) {

        restoreButton.disabled =
            false;


        restoreButton.textContent =
            '📂 بازیابی';

    }

}

}

// ============================================================================
// Backup Message
// ============================================================================

function showBackupMessage(
screen,
message,
success = true
) {

let messageBox =
    screen.querySelector(
        '#backup-message'
    );


if (!messageBox) {

    messageBox =
        document.createElement(
            'div'
        );


    messageBox.id =
        'backup-message';


    messageBox.className =
        'backup-message';


    const backupCard =
        screen.querySelector(
            '.backup-card'
        );


    if (backupCard) {

        backupCard.insertAdjacentElement(
            'afterend',
            messageBox
        );

    }

}


messageBox.style.display =
    'block';


messageBox.style.whiteSpace =
    'pre-line';


messageBox.style.marginTop =
    '10px';


messageBox.style.padding =
    '11px 12px';


messageBox.style.borderRadius =
    '11px';


messageBox.style.fontSize =
    '12px';


messageBox.style.lineHeight =
    '1.9';


messageBox.style.textAlign =
    'center';


messageBox.style.border =
    '1px solid';


messageBox.style.background =
    success
        ? '#ecfdf5'
        : '#fef2f2';


messageBox.style.color =
    success
        ? '#047857'
        : '#b91c1c';


messageBox.style.borderColor =
    success
        ? '#a7f3d0'
        : '#fecaca';


messageBox.textContent =
    message;

}

// ============================================================================
// Clear Backup Message
// ============================================================================

function clearBackupMessage(
screen
) {

if (!screen) {

    return;

}


const message =
    screen.querySelector(
        '#backup-message'
    );


if (!message) {

    return;

}


message.remove();

}

// ============================================================================
// Load Products
// ============================================================================

async function loadProducts(
screen
) {

const list =
    screen.querySelector(
        '#products-list'
    );


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


    renderProducts(
        screen,
        products
    );


} catch (error) {

    console.error(
        'SupermarketPOS: خطا در خواندن کالاها.',
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

// ============================================================================
// Render Products
// ============================================================================

function renderProducts(
screen,
products
) {

const list =
    screen.querySelector(
        '#products-list'
    );


if (!list) {

    return;

}


list.innerHTML =
    '';


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
                هنوز کالایی ثبت نشده است
            </h3>

            <p>
                برای شروع، اولین کالای فروشگاه را اضافه کنید.
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
        ${products.length.toLocaleString('fa-IR')} کالا
    </span>

`;


list.appendChild(
    title
);


products.forEach(
    product => {

        list.appendChild(
            createProductCard(
                product
            )
        );

    }
);

}

// ============================================================================
// Product Card
// ============================================================================

function createProductCard(
product
) {

const card =
    document.createElement(
        'article'
    );


card.className =
    'product-card';


const barcode =
    product.barcode ||
    '-';


const name =
    product.name ||
    'بدون نام';


const category =
    product.category ||
    'بدون دسته‌بندی';


const price =
    Number(
        product.salePrice
    );


const stock =
    Number(
        product.stock
    );


const safePrice =
    Number.isFinite(price)
        ? price.toLocaleString('fa-IR')
        : '۰';


const safeStock =
    Number.isFinite(stock)
        ? stock.toLocaleString('fa-IR')
        : '۰';


card.innerHTML = `

    <div class="product-card-top">

        <div class="product-card-icon">
            📦
        </div>

        <div class="product-card-info">

            <h3>
                ${escapeHTML(name)}
            </h3>

            <span>
                ${escapeHTML(category)}
            </span>

        </div>

    </div>


    <div class="product-card-details">

        <div class="product-detail">

            <span>
                بارکد
            </span>

            <strong>
                ${escapeHTML(barcode)}
            </strong>

        </div>


        <div class="product-detail">

            <span>
                قیمت فروش
            </span>

            <strong>
                ${safePrice}
                تومان
            </strong>

        </div>


        <div class="product-detail">

            <span>
                موجودی
            </span>

            <strong>
                ${safeStock}
            </strong>

        </div>

    </div>

`;


return card;

}

// ============================================================================
// Escape HTML
// ============================================================================

function escapeHTML(
value
) {

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

// ============================================================================
// Clear Product Message
// ============================================================================

function clearProductMessage(
screen
) {

if (!screen) {

    return;

}


const message =
    screen.querySelector(
        '#product-form-message'
    );


if (!message) {

    return;

}


message.textContent =
    '';


message.removeAttribute(
    'style'
);

}

// ============================================================================
// Product Message
// ============================================================================

function showProductMessage(
screen,
message,
success = true
) {

const messageBox =
    screen.querySelector(
        '#product-form-message'
    );


if (!messageBox) {

    return;

}


messageBox.style.marginTop =
    '12px';


messageBox.style.padding =
    '11px 12px';


messageBox.style.borderRadius =
    '11px';


messageBox.style.fontSize =
    '12px';


messageBox.style.textAlign =
    'center';


messageBox.style.border =
    '1px solid';


messageBox.style.background =
    success
        ? '#ecfdf5'
        : '#fef2f2';


messageBox.style.color =
    success
        ? '#047857'
        : '#b91c1c';


messageBox.style.borderColor =
    success
        ? '#a7f3d0'
        : '#fecaca';


messageBox.textContent =
    message;

}

// ============================================================================
// Product Form
// ============================================================================

function setupProductForm(
screen
) {

const addButton =
    screen.querySelector(
        '#add-product-button'
    );


const form =
    screen.querySelector(
        '#product-form-container'
    );


const closeButton =
    screen.querySelector(
        '#close-product-form'
    );


const cancelButton =
    screen.querySelector(
        '#cancel-product-button'
    );


const saveButton =
    screen.querySelector(
        '#save-product-button'
    );


if (
    !addButton ||
    !form
) {

    return;

}


addButton.addEventListener(
    'click',
    () => {

        clearProductMessage(
            screen
        );


        form.style.display =
            'block';


        const stockInput =
            screen.querySelector(
                '#product-stock'
            );


        if (stockInput) {

            stockInput.value =
                '';

        }


        const barcode =
            screen.querySelector(
                '#product-barcode'
            );


        if (barcode) {

            barcode.focus();

        }

    }
);


function closeForm() {

    clearProductMessage(
        screen
    );


    form.style.display =
        'none';

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
        async () => {

            clearProductMessage(
                screen
            );


            if (
                !APP_STATE.databaseReady
            ) {

                showProductMessage(
                    screen,
                    '❌ پایگاه داده آماده نیست.',
                    false
                );

                return;

            }


            const barcodeInput =
                screen.querySelector(
                    '#product-barcode'
                );


            const nameInput =
                screen.querySelector(
                    '#product-name'
                );


            const categoryInput =
                screen.querySelector(
                    '#product-category'
                );


            const priceInput =
                screen.querySelector(
                    '#product-price'
                );


            const stockInput =
                screen.querySelector(
                    '#product-stock'
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
                Number(
                    priceText
                );


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

                barcode:
                    barcode,

                name:
                    name,

                category:
                    category,

                salePrice:
                    price,

                stock:
                    stock,

                createdAt:
                    now,

                updatedAt:
                    now

            };


            saveButton.disabled =
                true;


            saveButton.textContent =
                'در حال ذخیره...';


            try {

                const productId =
                    await addProduct(
                        product
                    );


                console.log(
                    'SupermarketPOS: Product saved:',
                    productId
                );


                showProductMessage(
                    screen,
                    '✅ کالا با موفقیت ذخیره شد.',
                    true
                );


                showToast(
                    'کالا با موفقیت ذخیره شد.',
                    'success'
                );


                barcodeInput.value =
                    '';


                nameInput.value =
                    '';


                categoryInput.value =
                    '';


                priceInput.value =
                    '';


                stockInput.value =
                    '';


                barcodeInput.focus();


                await loadProducts(
                    screen
                );


            } catch (error) {

                console.error(
                    'SupermarketPOS: خطا در ذخیره کالا.',
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
                        '❌ ذخیره کالا انجام نشد.',
                        false
                    );

                }

            } finally {

                saveButton.disabled =
                    false;


                saveButton.textContent =
                    'ذخیره کالا';

            }

        }
    );

}

}

// ============================================================================
// Navigation
// ============================================================================

function setupNavigation() {

const cards =
    document.querySelectorAll(
        '.menu-card'
    );


cards.forEach(
    card => {

        card.addEventListener(
            'click',
            () => {

                const action =
                    card.getAttribute(
                        'data-action'
                    );


                if (
                    action ===
                    'sales'
                ) {

                    openSalesScreen();

                    return;

                }


                if (
                    action ===
                    'products'
                ) {

                    openProductsScreen();

                    return;

                }


                if (
                    action ===
                    'reports'
                ) {

                    showToast(
                        'بخش گزارش‌ها در مرحله بعد فعال می‌شود.',
                        'info'
                    );

                    return;

                }


                if (
                    action ===
                    'settings'
                ) {

                    showToast(
                        'بخش تنظیمات در مرحله بعد فعال می‌شود.',
                        'info'
                    );

                }

            }
        );

    }
);

}

// ============================================================================
// Database
// ============================================================================

async function setupDatabase() {

try {

    await initializeDatabase();


    APP_STATE.databaseReady =
        true;


    showDatabaseStatus(
        '✅ پایگاه داده با موفقیت آماده شد',
        true
    );


} catch (error) {

    APP_STATE.databaseReady =
        false;


    showDatabaseStatus(
        '❌ خطا در راه‌اندازی پایگاه داده',
        false
    );


    console.error(
        'SupermarketPOS: خطای دیتابیس',
        error
    );

}

}

// ============================================================================
// Initialize
// ============================================================================

async function initializeApp() {

if (
    APP_STATE.initialized
) {

    return;

}


DOM.app =
    document.querySelector(
        '#app'
    );


if (!DOM.app) {

    return;

}


initializeModalDOM();


initializeToastDOM();


setupHeaderStatus();


setupNavigation();


APP_STATE.initialized =
    true;


await setupDatabase();

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
    initializeApp,
    {
        once: true
    }
);

} else {

initializeApp();

}
