// js/reports.js
// SupermarketPOS
// Reports Module
// Phase 7 - Step 1

'use strict';

import {
    getAllSales,
    getSaleItems
} from './database.js';


/* ============================================================
   State
============================================================ */

const REPORTS_STATE = {

    initialized: false,

    databaseReady: false,

    sales: [],

    selectedSale: null

};


/* ============================================================
   Helpers
============================================================ */

function $(
    selector,
    root = document
) {

    return root.querySelector(
        selector
    );

}


function formatPrice(value) {

    return (
        Number(value) || 0
    ).toLocaleString(
        'fa-IR'
    );

}


function formatNumber(value) {

    return (
        Number(value) || 0
    ).toLocaleString(
        'fa-IR'
    );

}


function escapeHTML(value) {

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


function formatDate(timestamp) {

    if (!timestamp) {

        return '-';

    }


    const date =
        new Date(
            timestamp
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return '-';

    }


    return date.toLocaleDateString(
        'fa-IR',
        {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }
    );

}


function formatTime(timestamp) {

    if (!timestamp) {

        return '-';

    }


    const date =
        new Date(
            timestamp
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return '-';

    }


    return date.toLocaleTimeString(
        'fa-IR',
        {
            hour: '2-digit',
            minute: '2-digit'
        }
    );

}


function isToday(timestamp) {

    if (!timestamp) {

        return false;

    }


    const date =
        new Date(
            timestamp
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    const now =
        new Date();


    return (

        date.getFullYear() ===
        now.getFullYear()

        &&

        date.getMonth() ===
        now.getMonth()

        &&

        date.getDate() ===
        now.getDate()

    );

}


/* ============================================================
   Initialize
============================================================ */

export async function initializeReportsScreen(
    screen,
    options = {}
) {

    if (!screen) {

        return;

    }


    REPORTS_STATE.databaseReady =
        options.databaseReady !== false;


    if (
        !REPORTS_STATE.initialized
    ) {

        REPORTS_STATE.sales = [];

        REPORTS_STATE.selectedSale = null;


        buildReportsScreen(
            screen
        );


        bindReportsEvents(
            screen,
            options
        );


        REPORTS_STATE.initialized =
            true;

    }


    await refreshReportsScreen(
        screen
    );

}


/* ============================================================
   Build Screen
============================================================ */

function buildReportsScreen(screen) {

    screen.innerHTML = `

        <div class="reports-header">

            <div class="reports-header-main">

                <div class="reports-title-icon">
                    📊
                </div>

                <div>

                    <h2>
                        گزارش‌ها
                    </h2>

                    <p>
                        بررسی فروش و عملکرد فروشگاه
                    </p>

                </div>

            </div>


            <button
                type="button"
                class="reports-close-button"
                id="reports-close-button"
                aria-label="بازگشت"
            >
                ×
            </button>

        </div>


        <div class="reports-content">


            <!-- SUMMARY -->

            <section class="reports-summary-grid">


                <article class="report-stat-card">

                    <div class="report-stat-icon">
                        💰
                    </div>

                    <div class="report-stat-content">

                        <span>
                            فروش امروز
                        </span>

                        <strong
                            id="reports-today-total"
                        >
                            ۰ تومان
                        </strong>

                    </div>

                </article>


                <article class="report-stat-card">

                    <div class="report-stat-icon">
                        🧾
                    </div>

                    <div class="report-stat-content">

                        <span>
                            تعداد فروش امروز
                        </span>

                        <strong
                            id="reports-today-sales"
                        >
                            ۰
                        </strong>

                    </div>

                </article>


                <article class="report-stat-card">

                    <div class="report-stat-icon">
                        📦
                    </div>

                    <div class="report-stat-content">

                        <span>
                            کالاهای فروخته‌شده امروز
                        </span>

                        <strong
                            id="reports-today-items"
                        >
                            ۰
                        </strong>

                    </div>

                </article>


                <article class="report-stat-card">

                    <div class="report-stat-icon">
                        📈
                    </div>

                    <div class="report-stat-content">

                        <span>
                            مجموع فروش
                        </span>

                        <strong
                            id="reports-all-total"
                        >
                            ۰ تومان
                        </strong>

                    </div>

                </article>


            </section>


            <!-- TOP PRODUCTS -->

            <section class="reports-card">

                <div class="reports-card-header">

                    <div>

                        <h3>
                            کالاهای پرفروش
                        </h3>

                        <p>
                            بر اساس تعداد فروش
                        </p>

                    </div>

                    <span>
                        🏆
                    </span>

                </div>


                <div
                    id="reports-top-products"
                    class="reports-top-products"
                ></div>

            </section>


            <!-- DAILY SALES -->

            <section class="reports-card">

                <div class="reports-card-header">

                    <div>

                        <h3>
                            فروش روزانه
                        </h3>

                        <p>
                            خلاصه فروش ثبت‌شده
                        </p>

                    </div>

                    <span>
                        📅
                    </span>

                </div>


                <div
                    id="reports-daily-sales"
                    class="reports-daily-sales"
                ></div>

            </section>


            <!-- SALES LIST -->

            <section class="reports-card">

                <div class="reports-card-header">

                    <div>

                        <h3>
                            آخرین فروش‌ها
                        </h3>

                        <p>
                            مشاهده جزئیات فروش‌های ثبت‌شده
                        </p>

                    </div>

                    <span>
                        🧾
                    </span>

                </div>


                <div
                    id="reports-sales-list"
                    class="reports-sales-list"
                ></div>

            </section>


        </div>

    `;

}


/* ============================================================
   Events
============================================================ */

function bindReportsEvents(
    screen,
    options
) {

    const closeButton =
        $(
            '#reports-close-button',
            screen
        );


    if (closeButton) {

        closeButton.addEventListener(
            'click',
            () => {

                if (
                    typeof options.onBack ===
                    'function'
                ) {

                    options.onBack();

                }

            }
        );

    }

}


/* ============================================================
   Refresh
============================================================ */

async function refreshReportsScreen(
    screen
) {

    if (
        !REPORTS_STATE.databaseReady
    ) {

        showReportsError(
            screen,
            'پایگاه داده آماده نیست.'
        );

        return;

    }


    try {

        REPORTS_STATE.sales =
            await getAllSales();


        if (
            !Array.isArray(
                REPORTS_STATE.sales
            )
        ) {

            REPORTS_STATE.sales = [];

        }


        renderSummary(
            screen
        );


        await renderTopProducts(
            screen
        );


        renderDailySales(
            screen
        );


        renderSalesList(
            screen
        );


    } catch (error) {

        console.error(
            'SupermarketPOS: Reports error',
            error
        );


        showReportsError(
            screen,
            'خطا در خواندن اطلاعات گزارش‌ها.'
        );

    }

}


/* ============================================================
   Summary
============================================================ */

function renderSummary(screen) {

    const todaySales =
        REPORTS_STATE.sales.filter(
            sale =>
                isToday(
                    sale.timestamp
                )
        );


    const todayTotal =
        todaySales.reduce(
            (
                sum,
                sale
            ) =>
                sum +
                (
                    Number(
                        sale.totalPrice
                    ) || 0
                ),
            0
        );


    const todayItems =
        todaySales.reduce(
            (
                sum,
                sale
            ) =>
                sum +
                (
                    Number(
                        sale.totalQuantity
                    ) || 0
                ),
            0
        );


    const allTotal =
        REPORTS_STATE.sales.reduce(
            (
                sum,
                sale
            ) =>
                sum +
                (
                    Number(
                        sale.totalPrice
                    ) || 0
                ),
            0
        );


    const todayTotalElement =
        $(
            '#reports-today-total',
            screen
        );


    const todaySalesElement =
        $(
            '#reports-today-sales',
            screen
        );


    const todayItemsElement =
        $(
            '#reports-today-items',
            screen
        );


    const allTotalElement =
        $(
            '#reports-all-total',
            screen
        );


    if (todayTotalElement) {

        todayTotalElement.textContent =
            `${formatPrice(todayTotal)} تومان`;

    }


    if (todaySalesElement) {

        todaySalesElement.textContent =
            formatNumber(
                todaySales.length
            );

    }


    if (todayItemsElement) {

        todayItemsElement.textContent =
            formatNumber(
                todayItems
            );

    }


    if (allTotalElement) {

        allTotalElement.textContent =
            `${formatPrice(allTotal)} تومان`;

    }

}


/* ============================================================
   Top Products
============================================================ */

async function renderTopProducts(screen) {

    const container =
        $(
            '#reports-top-products',
            screen
        );


    if (!container) {

        return;

    }


    container.innerHTML = '';


    if (
        REPORTS_STATE.sales.length === 0
    ) {

        container.innerHTML = `

            <div class="reports-empty">

                <div>
                    📦
                </div>

                <p>
                    هنوز فروشی ثبت نشده است.
                </p>

            </div>

        `;

        return;

    }


    const quantities = new Map();


    for (
        const sale
        of REPORTS_STATE.sales
    ) {

        let items = [];


        try {

            items =
                await getSaleItems(
                    sale.id
                );

        } catch (error) {

            console.error(
                error
            );

            continue;

        }


        for (
            const item
            of items
        ) {

            const key =
                String(
                    item.productId
                );


            const current =
                quantities.get(
                    key
                ) || {

                    productId:
                        item.productId,

                    name:
                        item.name ||
                        'بدون نام',

                    quantity:
                        0,

                    total:
                        0

                };


            current.quantity +=
                Number(
                    item.quantity
                ) || 0;


            current.total +=
                Number(
                    item.lineTotal
                ) || 0;


            quantities.set(
                key,
                current
            );

        }

    }


    const topProducts =
        Array.from(
            quantities.values()
        )
        .sort(
            (
                a,
                b
            ) =>
                b.quantity -
                a.quantity
        )
        .slice(
            0,
            5
        );


    if (
        topProducts.length === 0
    ) {

        container.innerHTML = `

            <div class="reports-empty">

                <div>
                    📦
                </div>

                <p>
                    اطلاعات کالاهای فروخته‌شده موجود نیست.
                </p>

            </div>

        `;

        return;

    }


    const fragment =
        document.createDocumentFragment();


    topProducts.forEach(
        (
            product,
            index
        ) => {

            const item =
                document.createElement(
                    'div'
                );


            item.className =
                'report-top-product';


            item.innerHTML = `

                <div class="report-product-rank">
                    ${formatNumber(index + 1)}
                </div>

                <div class="report-product-info">

                    <strong>
                        ${escapeHTML(product.name)}
                    </strong>

                    <span>
                        ${formatNumber(product.quantity)}
                        عدد
                    </span>

                </div>

                <strong class="report-product-total">
                    ${formatPrice(product.total)}
                    تومان
                </strong>

            `;


            fragment.appendChild(
                item
            );

        }
    );


    container.appendChild(
        fragment
    );

}


/* ============================================================
   Daily Sales
============================================================ */

function renderDailySales(screen) {

    const container =
        $(
            '#reports-daily-sales',
            screen
        );


    if (!container) {

        return;

    }


    container.innerHTML = '';


    if (
        REPORTS_STATE.sales.length === 0
    ) {

        container.innerHTML = `

            <div class="reports-empty">

                <div>
                    📅
                </div>

                <p>
                    اطلاعات فروش موجود نیست.
                </p>

            </div>

        `;

        return;

    }


    const daily =
        new Map();


    REPORTS_STATE.sales.forEach(
        sale => {

            const date =
                formatDate(
                    sale.timestamp
                );


            const current =
                daily.get(
                    date
                ) || {

                    date,

                    count:
                        0,

                    quantity:
                        0,

                    total:
                        0

                };


            current.count += 1;


            current.quantity +=
                Number(
                    sale.totalQuantity
                ) || 0;


            current.total +=
                Number(
                    sale.totalPrice
                ) || 0;


            daily.set(
                date,
                current
            );

        }
    );


    const rows =
        Array.from(
            daily.values()
        )
        .sort(
            (
                a,
                b
            ) =>
                b.date.localeCompare(
                    a.date
                )
        );


    const fragment =
        document.createDocumentFragment();


    rows.slice(
        0,
        10
    ).forEach(
        row => {

            const item =
                document.createElement(
                    'div'
                );


            item.className =
                'report-daily-row';


            item.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(row.date)}
                    </strong>

                    <span>
                        ${formatNumber(row.count)}
                        فروش
                    </span>

                </div>


                <div>

                    <span>
                        ${formatNumber(row.quantity)}
                        کالا
                    </span>

                    <strong>
                        ${formatPrice(row.total)}
                        تومان
                    </strong>

                </div>

            `;


            fragment.appendChild(
                item
            );

        }
    );


    container.appendChild(
        fragment
    );

}


/* ============================================================
   Sales List
============================================================ */

function renderSalesList(screen) {

    const container =
        $(
            '#reports-sales-list',
            screen
        );


    if (!container) {

        return;

    }


    container.innerHTML = '';


    if (
        REPORTS_STATE.sales.length === 0
    ) {

        container.innerHTML = `

            <div class="reports-empty">

                <div>
                    🧾
                </div>

                <p>
                    هنوز هیچ فروشی ثبت نشده است.
                </p>

            </div>

        `;

        return;

    }


    const sales =
        [...REPORTS_STATE.sales]
        .sort(
            (
                a,
                b
            ) =>
                new Date(
                    b.timestamp
                ) -
                new Date(
                    a.timestamp
                )
        );


    const fragment =
        document.createDocumentFragment();


    sales.slice(
        0,
        20
    ).forEach(
        sale => {

            const card =
                document.createElement(
                    'article'
                );


            card.className =
                'report-sale-row';


            card.innerHTML = `

                <div class="report-sale-main">

                    <div class="report-sale-icon">
                        🧾
                    </div>

                    <div>

                        <strong>
                            فروش شماره
                            ${formatNumber(sale.id)}
                        </strong>

                        <span>
                            ${escapeHTML(
                                formatDate(
                                    sale.timestamp
                                )
                            )}
                            —
                            ${escapeHTML(
                                formatTime(
                                    sale.timestamp
                                )
                            )}
                        </span>

                    </div>

                </div>


                <div class="report-sale-details">

                    <span>
                        ${formatNumber(
                            sale.totalQuantity || 0
                        )}
                        کالا
                    </span>

                    <strong>
                        ${formatPrice(
                            sale.totalPrice || 0
                        )}
                        تومان
                    </strong>

                </div>


                <button
                    type="button"
                    class="report-sale-details-button"
                    data-sale-id="${sale.id}"
                >
                    جزئیات
                </button>

            `;


            fragment.appendChild(
                card
            );

        }
    );


    container.appendChild(
        fragment
    );


    container.onclick =
        async event => {

            const button =
                event.target.closest(
                    '[data-sale-id]'
                );


            if (!button) {

                return;

            }


            const saleId =
                Number(
                    button.dataset.saleId
                );


            await showSaleDetails(
                screen,
                saleId
            );

        };

}


/* ============================================================
   Sale Details
============================================================ */

async function showSaleDetails(
    screen,
    saleId
) {

    const sale =
        REPORTS_STATE.sales.find(
            item =>
                Number(item.id) ===
                saleId
        );


    if (!sale) {

        return;

    }


    let items = [];


    try {

        items =
            await getSaleItems(
                saleId
            );

    } catch (error) {

        console.error(
            'Sale details error:',
            error
        );

        return;

    }


    REPORTS_STATE.selectedSale = {

        sale,

        items

    };


    const oldModal =
        document.getElementById(
            'reports-sale-modal'
        );


    if (oldModal) {

        oldModal.remove();

    }


    const modal =
        document.createElement(
            'div'
        );


    modal.id =
        'reports-sale-modal';


    modal.className =
        'reports-modal-overlay';


    modal.innerHTML = `

        <div
            class="reports-modal"
            role="dialog"
            aria-modal="true"
        >

            <div class="reports-modal-header">

                <div>

                    <h3>
                        جزئیات فروش
                    </h3>

                    <p>
                        فروش شماره
                        ${formatNumber(sale.id)}
                    </p>

                </div>


                <button
                    type="button"
                    class="reports-modal-close"
                    id="reports-modal-close"
                >
                    ×
                </button>

            </div>


            <div class="reports-modal-info">

                <div>

                    <span>
                        تاریخ
                    </span>

                    <strong>
                        ${escapeHTML(
                            formatDate(
                                sale.timestamp
                            )
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        ساعت
                    </span>

                    <strong>
                        ${escapeHTML(
                            formatTime(
                                sale.timestamp
                            )
                        )}
                    </strong>

                </div>

            </div>


            <div class="reports-modal-items">

                ${
                    items.length
                    ? items.map(
                        item => `

                            <div class="reports-modal-item">

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            item.name ||
                                            'بدون نام'
                                        )}
                                    </strong>

                                    <span>
                                        ${formatNumber(
                                            item.quantity
                                        )}
                                        ×
                                        ${formatPrice(
                                            item.salePrice
                                        )}
                                    </span>

                                </div>

                                <strong>
                                    ${formatPrice(
                                        item.lineTotal
                                    )}
                                    تومان
                                </strong>

                            </div>

                        `
                    ).join('')
                    : `
                        <div class="reports-empty">
                            جزئیات این فروش موجود نیست.
                        </div>
                    `
                }

            </div>


            <div class="reports-modal-total">

                <span>
                    مبلغ نهایی
                </span>

                <strong>
                    ${formatPrice(
                        sale.totalPrice
                    )}
                    تومان
                </strong>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        modal.querySelector(
            '#reports-modal-close'
        );


    function closeModal() {

        modal.remove();

    }


    if (closeButton) {

        closeButton.addEventListener(
            'click',
            closeModal
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


    requestAnimationFrame(
        () => {

            modal.classList.add(
                'reports-modal-visible'
            );

        }
    );

}


/* ============================================================
   Error
============================================================ */

function showReportsError(
    screen,
    message
) {

    const containers = [

        '#reports-top-products',

        '#reports-daily-sales',

        '#reports-sales-list'

    ];


    containers.forEach(
        selector => {

            const element =
                $(selector, screen);


            if (element) {

                element.innerHTML = `

                    <div class="reports-empty reports
