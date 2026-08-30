// js/app.js
// SupermarketPOS
// Main Application
// Complete Replacement
// Architecture: App + Sales + Products + Database

'use strict';

import {
    initializeDatabase
} from './database.js';

import {
    initializeSalesScreen
} from './sales.js';

import {
    initializeProductsScreen
} from './products.js';


/* ============================================================
   Application State
============================================================ */

const APP_STATE = {

    initialized: false,

    databaseReady: false,

    activeScreen: 'home'

};


/* ============================================================
   DOM
============================================================ */

const DOM = {

    app: null,

    main: null

};


/* ============================================================
   Utility
============================================================ */

function escapeHTML(value) {

    return String(value)

        .replaceAll('&', '&amp;')

        .replaceAll('<', '&lt;')

        .replaceAll('>', '&gt;')

        .replaceAll('"', '&quot;')

        .replaceAll("'", '&#039;');

}


/* ============================================================
   Toast
============================================================ */

export function showAppMessage(
    message,
    type = 'success'
) {

    let toast =
        document.getElementById('app-toast');


    if (!toast) {

        toast =
            document.createElement('div');

        toast.id =
            'app-toast';

        document.body.appendChild(toast);

    }


    toast.className =
        `app-toast app-toast-${type}`;


    toast.textContent =
        message;


    requestAnimationFrame(() => {

        toast.classList.add(
            'app-toast-visible'
        );

    });


    clearTimeout(
        toast._hideTimer
    );


    toast._hideTimer =
        setTimeout(() => {

            toast.classList.remove(
                'app-toast-visible'
            );

        }, 2800);

}


/* ============================================================
   Confirmation Modal
============================================================ */

export function showAppConfirm(
    options = {}
) {

    return new Promise(resolve => {

        const oldModal =
            document.getElementById(
                'app-confirm-modal'
            );


        if (oldModal) {

            oldModal.remove();

        }


        const modal =
            document.createElement('div');


        modal.id =
            'app-confirm-modal';


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
                aria-labelledby="app-confirm-title"
            >

                <div class="app-confirm-icon ${type}">
                    ${options.icon || '❔'}
                </div>


                <div class="app-confirm-content">

                    <h2 id="app-confirm-title">
                        ${escapeHTML(
                            options.title ||
                            'تأیید عملیات'
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            options.message ||
                            ''
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
                        id="app-confirm-cancel"
                    >
                        ${escapeHTML(
                            options.cancelText ||
                            'انصراف'
                        )}
                    </button>


                    <button
                        type="button"
                        class="app-confirm-submit ${type}"
                        id="app-confirm-submit"
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
                '#app-confirm-cancel'
            );


        const confirm =
            modal.querySelector(
                '#app-confirm-submit'
            );


        let closed = false;


        function close(result) {

            if (closed) {
                return;
            }


            closed = true;


            modal.classList.add(
                'app-confirm-closing'
            );


            setTimeout(() => {

                modal.remove();

                resolve(result);

            }, 160);

        }


        cancel.addEventListener(
            'click',
            () => close(false)
        );


        confirm.addEventListener(
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


        function escapeHandler(event) {

            if (
                event.key === 'Escape'
            ) {

                document.removeEventListener(
                    'keydown',
                    escapeHandler
                );

                close(false);

            }

        }


        document.addEventListener(
            'keydown',
            escapeHandler
        );


        requestAnimationFrame(() => {

            modal.classList.add(
                'app-confirm-visible'
            );


            setTimeout(() => {

                if (confirm) {
                    confirm.focus();
                }

            }, 80);

        });

    });

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
            document.createElement('div');


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


function hideSecondaryScreens() {

    const sales =
        getSalesScreen();


    const products =
        getProductsScreen();


    if (sales) {

        sales.style.display =
            'none';

    }


    if (products) {

        products.style.display =
            'none';

    }

}


function showHomeScreen() {

    hideSecondaryScreens();


    const home =
        getHomeScreen();


    if (home) {

        home.style.display =
            '';

    }


    APP_STATE.activeScreen =
        'home';

}


/* ============================================================
   Sales Screen
============================================================ */

function openSalesScreen() {

    if (!DOM.main) {
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


        DOM.main.appendChild(
            sales
        );

    }


    sales.style.display =
        'block';


    APP_STATE.activeScreen =
        'sales';


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

    if (!DOM.main) {
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


        DOM.main.appendChild(
            products
        );

    }


    products.style.display =
        'block';


    APP_STATE.activeScreen =
        'products';


    try {

        await initializeProductsScreen(
            products,
            {
                databaseReady:
                    APP_STATE.databaseReady,

                onBack:
                    showHomeScreen,

                showMessage:
                    showAppMessage,

                showConfirm:
                    showAppConfirm
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
   Navigation
============================================================ */

function setupNavigation() {

    const cards =
        document.querySelectorAll(
            '.menu-card'
        );


    cards.forEach(card => {

        card.addEventListener(
            'click',
            () => {

                const action =
                    card.getAttribute(
                        'data-action'
                    );


                switch (action) {

                    case 'sales':

                        openSalesScreen();

                        break;


                    case 'products':

                        openProductsScreen();

                        break;


                    case 'reports':

                        showAppMessage(
                            'بخش گزارش‌ها در مرحله بعد فعال می‌شود.',
                            'info'
                        );

                        break;


                    case 'settings':

                        showAppMessage(
                            'بخش تنظیمات در مرحله بعد فعال می‌شود.',
                            'info'
                        );

                        break;


                    default:

                        break;

                }

            }
        );

    });

}


/* ============================================================
   Keyboard Navigation
============================================================ */

function setupKeyboardNavigation() {

    document.addEventListener(
        'keydown',
        event => {

            if (
                event.key !== 'Escape'
            ) {
                return;
            }


            const modal =
                document.getElementById(
                    'app-confirm-modal'
                );


            if (modal) {
                return;
            }


            if (
                APP_STATE.activeScreen ===
                'sales' ||
                APP_STATE.activeScreen ===
                'products'
            ) {

                showHomeScreen();

            }

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


        showAppMessage(
            'پایگاه داده راه‌اندازی نشد.',
            'danger'
        );

    }

}


/* ============================================================
   Application Initialization
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


    DOM.main =
        document.querySelector(
            'main'
        );


    if (!DOM.app) {

        console.error(
            'SupermarketPOS: #app not found.'
        );

        return;

    }


    if (!DOM.main) {

        console.error(
            'SupermarketPOS: main element not found.'
        );

        return;

    }


    setupHeaderStatus();

    setupNavigation();

    setupKeyboardNavigation();


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
