// js/app.js
// SupermarketPOS
// Main Application
// Application / Navigation Layer
// Stage 9.1 - Reports Integration
// Complete Replacement

'use strict';


/* ============================================================
   Database
============================================================ */

import {
    initializeDatabase
} from './database.js';


/* ============================================================
   Sales Module
============================================================ */

import {
    initializeSalesScreen
} from './sales.js';


/* ============================================================
   Products Module
============================================================ */

import {
    initializeProductsScreen
} from './products.js';


/* ============================================================
   Reports Module
============================================================ */

import {
    initializeReportsScreen
} from './reports.js';


/* ============================================================
   Application State
============================================================ */

const APP_STATE = {

    initialized: false,

    databaseReady: false

};


/* ============================================================
   DOM
============================================================ */

const DOM = {

    app: null

};


/* ============================================================
   Utility
============================================================ */

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


/* ============================================================
   Database Status
============================================================ */

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


    if (!status) {
        return;
    }


    status.className =
        `database-status ${
            success
                ? 'database-status-success'
                : 'database-status-danger'
        }`;


    status.textContent =
        message;

}


/* ============================================================
   Header Status
============================================================ */

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

            <span class="status-icon">
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

            <span class="status-icon">
                ●
            </span>

            <div class="status-info">

                <span class="status-label">
                    اتصال
                </span>

                <strong>
                    محلی
                </strong>

            </div>

        `;

    }

}


/* ============================================================
   Screen Helpers
============================================================ */

function getHomeScreen() {

    return document.querySelector(
        '.home-screen'
    );

}


function getSalesScreen() {

    return document.getElementById(
        'sales-screen'
    );

}


function getProductsScreen() {

    return document.getElementById(
        'products-screen'
    );

}


function getReportsScreen() {

    return document.getElementById(
        'reports-screen'
    );

}


/* ============================================================
   Hide Secondary Screens
============================================================ */

function hideAllSecondaryScreens() {

    const sales =
        getSalesScreen();


    const products =
        getProductsScreen();


    const reports =
        getReportsScreen();


    if (sales) {

        sales.style.display =
            'none';

    }


    if (products) {

        products.style.display =
            'none';

    }


    if (reports) {

        reports.style.display =
            'none';

    }

}


/* ============================================================
   Home Screen
============================================================ */

function showHomeScreen() {

    hideAllSecondaryScreens();


    const home =
        getHomeScreen();


    if (home) {

        home.style.display =
            '';

    }

}


/* ============================================================
   Sales Screen
============================================================ */

function openSalesScreen() {

    const main =
        document.querySelector(
            'main'
        );


    if (!main) {
        return;
    }


    const home =
        getHomeScreen();


    if (home) {

        home.style.display =
            'none';

    }


    const products =
        getProductsScreen();


    if (products) {

        products.style.display =
            'none';

    }


    const reports =
        getReportsScreen();


    if (reports) {

        reports.style.display =
            'none';

    }


    let sales =
        getSalesScreen();


    if (!sales) {

        sales =
            document.createElement(
                'section'
            );


        sales.id =
            'sales-screen';


        sales.className =
            'sales-screen';


        main.appendChild(
            sales
        );

    }


    sales.style.display =
        'block';


    initializeSalesScreen(
        sales,
        {

            databaseReady:
                APP_STATE.databaseReady,

            onBack:
                showHomeScreen

        }
    );

}


/* ============================================================
   Products Screen
============================================================ */

async function openProductsScreen() {

    const main =
        document.querySelector(
            'main'
        );


    if (!main) {
        return;
    }


    const home =
        getHomeScreen();


    if (home) {

        home.style.display =
            'none';

    }


    const sales =
        getSalesScreen();


    if (sales) {

        sales.style.display =
            'none';

    }


    const reports =
        getReportsScreen();


    if (reports) {

        reports.style.display =
            'none';

    }


    let products =
        getProductsScreen();


    if (!products) {

        products =
            document.createElement(
                'section'
            );


        products.id =
            'products-screen';


        products.className =
            'products-screen';


        main.appendChild(
            products
        );

    }


    products.style.display =
        'block';


    try {

        await initializeProductsScreen(
            products,
            {

                databaseReady:
                    APP_STATE.databaseReady,

                onBack:
                    showHomeScreen

            }
        );

    } catch (error) {

        console.error(
            'SupermarketPOS: Products initialization error',
            error
        );


        showAppMessage(
            'خطا در باز کردن بخش کالاها.',
            'danger'
        );

    }

}


/* ============================================================
   Reports Screen
============================================================ */

async function openReportsScreen() {

    const main =
        document.querySelector(
            'main'
        );


    if (!main) {
        return;
    }


    const home =
        getHomeScreen();


    if (home) {

        home.style.display =
            'none';

    }


    const sales =
        getSalesScreen();


    if (sales) {

        sales.style.display =
            'none';

    }


    const products =
        getProductsScreen();


    if (products) {

        products.style.display =
            'none';

    }


    let reports =
        getReportsScreen();


    if (!reports) {

        reports =
            document.createElement(
                'section'
            );


        reports.id =
            'reports-screen';


        reports.className =
            'reports-screen';


        main.appendChild(
            reports
        );

    }


    reports.style.display =
        'block';


    try {

        await initializeReportsScreen(
            reports,
            {

                databaseReady:
                    APP_STATE.databaseReady,

                onBack:
                    showHomeScreen

            }
        );

    } catch (error) {

        console.error(
            'SupermarketPOS: Reports initialization error',
            error
        );


        showAppMessage(
            'خطا در باز کردن بخش گزارش‌ها.',
            'danger'
        );

    }

}


/* ============================================================
   Navigation
============================================================ */

function setupNavigation() {

    const cards =
        document.querySelectorAll(
            '.menu-card'
        );


    cards.forEach(
        card => {

            card.addEventListener(
                'click',
                async () => {

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

                        await openProductsScreen();

                        return;

                    }


                    if (
                        action ===
                        'reports'
                    ) {

                        await openReportsScreen();

                        return;

                    }


                    if (
                        action ===
                        'settings'
                    ) {

                        showAppMessage(
                            'بخش تنظیمات در مرحله بعد فعال می‌شود.',
                            'info'
                        );

                    }

                }
            );

        }
    );

}


/* ============================================================
   Database
============================================================ */

async function setupDatabase() {

    try {

        await initializeDatabase();


        APP_STATE.databaseReady =
            true;


        showDatabaseStatus(
            '✓ پایگاه داده آماده است',
            true
        );


    } catch (error) {

        APP_STATE.databaseReady =
            false;


        showDatabaseStatus(
            '✕ خطا در راه‌اندازی پایگاه داده',
            false
        );


        console.error(
            'SupermarketPOS: Database error',
            error
        );

    }

}


/* ============================================================
   Toast
============================================================ */

function showAppMessage(
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
   Initialize Application
============================================================ */

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

        console.error(
            'SupermarketPOS: #app not found.'
        );

        return;

    }


    setupHeaderStatus();


    setupNavigation();


    APP_STATE.initialized =
        true;


    await setupDatabase();

}


/* ============================================================
   Bootstrap
============================================================ */

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
