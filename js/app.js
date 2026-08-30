// js/app.js
// SupermarketPOS
// Main Application
// Application / Navigation Layer
// Stage 9 - Stable Static Imports
// Complete Replacement

'use strict';


/* ============================================================
   Static Imports
============================================================ */

import {
    initializeDatabase
} from './database.js';

import {
    initializeSalesScreen
} from './sales.js';

import {
    initializeProductsScreen
} from './products.js';

import {
    initializeReportsScreen
} from './reports.js';


/* ============================================================
   Application State
============================================================ */

const APP_STATE = {

    initialized: false,

    databaseReady: false,

    currentScreen: 'home',

    salesInitialized: false,

    productsInitialized: false,

    reportsInitialized: false

};


/* ============================================================
   DOM
============================================================ */

const DOM = {

    app: null,

    main: null,

    home: null,

    sales: null,

    products: null,

    reports: null

};


/* ============================================================
   Utility
============================================================ */

function escapeHTML(value) {

    return String(value ?? '')

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
   DOM Cache
============================================================ */

function cacheDOM() {

    DOM.app =
        document.querySelector(
            '#app'
        );

    DOM.main =
        document.querySelector(
            'main'
        );

    DOM.home =
        document.querySelector(
            '.home-screen'
        );

    DOM.sales =
        document.getElementById(
            'sales-screen'
        );

    DOM.products =
        document.getElementById(
            'products-screen'
        );

    DOM.reports =
        document.getElementById(
            'reports-screen'
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


        if (DOM.home) {

            DOM.home.appendChild(
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
   Screen Getters
============================================================ */

function getHomeScreen() {

    if (!DOM.home) {

        DOM.home =
            document.querySelector(
                '.home-screen'
            );

    }


    return DOM.home;

}


function getSalesScreen() {

    return DOM.sales;

}


function getProductsScreen() {

    return DOM.products;

}


function getReportsScreen() {

    return DOM.reports;

}


/* ============================================================
   Create Screen
============================================================ */

function createScreen(
    id,
    className
) {

    if (!DOM.main) {
        return null;
    }


    let screen =
        document.getElementById(
            id
        );


    if (screen) {
        return screen;
    }


    screen =
        document.createElement(
            'section'
        );


    screen.id =
        id;


    screen.className =
        className;


    screen.style.display =
        'none';


    DOM.main.appendChild(
        screen
    );


    if (id === 'sales-screen') {

        DOM.sales =
            screen;

    }


    if (id === 'products-screen') {

        DOM.products =
            screen;

    }


    if (id === 'reports-screen') {

        DOM.reports =
            screen;

    }


    return screen;

}


/* ============================================================
   Ensure Screens
============================================================ */

function ensureScreens() {

    if (!DOM.main) {
        return;
    }


    if (!getSalesScreen()) {

        createScreen(
            'sales-screen',
            'sales-screen'
        );

    }


    if (!getProductsScreen()) {

        createScreen(
            'products-screen',
            'products-screen'
        );

    }


    if (!getReportsScreen()) {

        createScreen(
            'reports-screen',
            'reports-screen'
        );

    }

}


/* ============================================================
   Hide All Screens
============================================================ */

function hideAllScreens() {

    const home =
        getHomeScreen();


    const sales =
        getSalesScreen();


    const products =
        getProductsScreen();


    const reports =
        getReportsScreen();


    if (home) {

        home.style.display =
            'none';

    }


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
   Show Home
============================================================ */

function showHomeScreen() {

    hideAllScreens();


    const home =
        getHomeScreen();


    if (home) {

        home.style.display =
            '';

    }


    APP_STATE.currentScreen =
        'home';

}


/* ============================================================
   Open Sales
============================================================ */

async function openSalesScreen() {

    if (!DOM.main) {
        return;
    }


    ensureScreens();


    hideAllScreens();


    const screen =
        getSalesScreen();


    if (!screen) {

        showAppMessage(
            'خطا در ایجاد بخش فروش.',
            'danger'
        );

        return;

    }


    screen.style.display =
        'block';


    APP_STATE.currentScreen =
        'sales';


    try {

        await initializeSalesScreen(
            screen,
            {

                databaseReady:
                    APP_STATE.databaseReady,

                onBack:
                    showHomeScreen

            }
        );


        APP_STATE.salesInitialized =
            true;


    } catch (error) {

        console.error(
            'SupermarketPOS: Sales initialization error',
            error
        );


        showAppMessage(
            'خطا در باز کردن بخش فروش.',
            'danger'
        );

    }

}


/* ============================================================
   Open Products
============================================================ */

async function openProductsScreen() {

    if (!DOM.main) {
        return;
    }


    ensureScreens();


    hideAllScreens();


    const screen =
        getProductsScreen();


    if (!screen) {

        showAppMessage(
            'خطا در ایجاد بخش کالاها.',
            'danger'
        );

        return;

    }


    screen.style.display =
        'block';


    APP_STATE.currentScreen =
        'products';


    try {

        await initializeProductsScreen(
            screen,
            {

                databaseReady:
                    APP_STATE.databaseReady,

                onBack:
                    showHomeScreen

            }
        );


        APP_STATE.productsInitialized =
            true;


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
   Open Reports
============================================================ */

async function openReportsScreen() {

    if (!DOM.main) {
        return;
    }


    ensureScreens();


    hideAllScreens();


    const screen =
        getReportsScreen();


    if (!screen) {

        showAppMessage(
            'خطا در ایجاد بخش گزارش‌ها.',
            'danger'
        );

        return;

    }


    screen.style.display =
        'block';


    APP_STATE.currentScreen =
        'reports';


    try {

        await initializeReportsScreen(
            screen,
            {

                databaseReady:
                    APP_STATE.databaseReady,

                onBack:
                    showHomeScreen

            }
        );


        APP_STATE.reportsInitialized =
            true;


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


    if (!cards.length) {

        console.warn(
            'SupermarketPOS: No menu cards found.'
        );

        return;

    }


    cards.forEach(
        card => {

            if (
                card.dataset.appNavigationBound ===
                'true'
            ) {

                return;

            }


            card.dataset.appNavigationBound =
                'true';


            card.addEventListener(
                'click',
                async event => {

                    event.preventDefault();


                    const action =
                        card.getAttribute(
                            'data-action'
                        );


                    if (
                        action ===
                        'sales'
                    ) {

                        await openSalesScreen();

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

                        return;

                    }


                    console.warn(
                        'SupermarketPOS: Unknown menu action:',
                        action
                    );

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
            'SupermarketPOS: Database initialization error',
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
   Global Error Protection
============================================================ */

function setupGlobalErrorProtection() {

    window.addEventListener(
        'error',
        event => {

            console.error(
                'SupermarketPOS: Global error',
                event.error ||
                event.message
            );

        }
    );


    window.addEventListener(
        'unhandledrejection',
        event => {

            console.error(
                'SupermarketPOS: Unhandled promise rejection',
                event.reason
            );

        }
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


    cacheDOM();


    if (!DOM.app) {

        console.error(
            'SupermarketPOS: #app not found.'
        );

        return;

    }


    if (!DOM.main) {

        console.error(
            'SupermarketPOS: <main> not found.'
        );

        return;

    }


    setupGlobalErrorProtection();


    setupHeaderStatus();


    ensureScreens();


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
