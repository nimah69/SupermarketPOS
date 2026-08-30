// js/app.js
// SupermarketPOS
// Main Application - Navigation & Orchestration
// Version: 9.2 - Mobile-Friendly Event Delegation

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
   DOM Caching
============================================================ */
const DOM = {
    app: null,
    main: null,
    home: null,
    sales: null,
    products: null,
    reports: null
};

function cacheDOM() {
    DOM.app = document.querySelector('#app');
    DOM.main = document.querySelector('main');
    DOM.home = document.querySelector('.home-screen');
    DOM.sales = document.getElementById('sales-screen');
    DOM.products = document.getElementById('products-screen');
    DOM.reports = document.getElementById('reports-screen');
}

/* ============================================================
   Screen Management
============================================================ */
function getHomeScreen() {
    if (!DOM.home) {
        DOM.home = document.querySelector('.home-screen');
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

function createScreen(id, className) {
    if (!DOM.main) return null;
    let screen = document.getElementById(id);
    if (screen) return screen;
    screen = document.createElement('section');
    screen.id = id;
    screen.className = className;
    screen.style.display = 'none';
    DOM.main.appendChild(screen);
    if (id === 'sales-screen') DOM.sales = screen;
    if (id === 'products-screen') DOM.products = screen;
    if (id === 'reports-screen') DOM.reports = screen;
    return screen;
}

function ensureScreens() {
    if (!DOM.main) return;
    if (!getSalesScreen()) createScreen('sales-screen', 'sales-screen');
    if (!getProductsScreen()) createScreen('products-screen', 'products-screen');
    if (!getReportsScreen()) createScreen('reports-screen', 'reports-screen');
}

function hideAllScreens() {
    const screens = [getHomeScreen(), getSalesScreen(), getProductsScreen(), getReportsScreen()];
    screens.forEach(el => { if (el) el.style.display = 'none'; });
}

function showHomeScreen() {
    hideAllScreens();
    const home = getHomeScreen();
    if (home) home.style.display = '';
    APP_STATE.currentScreen = 'home';
}

/* ============================================================
   Screen Openers
============================================================ */
async function openSalesScreen() {
    if (!DOM.main) return;
    ensureScreens();
    hideAllScreens();
    const screen = getSalesScreen();
    if (!screen) {
        showAppMessage('خطا در ایجاد بخش فروش.', 'danger');
        return;
    }
    screen.style.display = 'block';
    APP_STATE.currentScreen = 'sales';
    try {
        await initializeSalesScreen(screen, {
            databaseReady: APP_STATE.databaseReady,
            onBack: showHomeScreen
        });
        APP_STATE.salesInitialized = true;
    } catch (error) {
        console.error('Sales init error:', error);
        showAppMessage('خطا در باز کردن بخش فروش.', 'danger');
    }
}

async function openProductsScreen() {
    if (!DOM.main) return;
    ensureScreens();
    hideAllScreens();
    const screen = getProductsScreen();
    if (!screen) {
        showAppMessage('خطا در ایجاد بخش کالاها.', 'danger');
        return;
    }
    screen.style.display = 'block';
    APP_STATE.currentScreen = 'products';
    try {
        await initializeProductsScreen(screen, {
            databaseReady: APP_STATE.databaseReady,
            onBack: showHomeScreen
        });
        APP_STATE.productsInitialized = true;
    } catch (error) {
        console.error('Products init error:', error);
        showAppMessage('خطا در باز کردن بخش کالاها.', 'danger');
    }
}

async function openReportsScreen() {
    if (!DOM.main) return;
    ensureScreens();
    hideAllScreens();
    const screen = getReportsScreen();
    if (!screen) {
        showAppMessage('خطا در ایجاد بخش گزارش‌ها.', 'danger');
        return;
    }
    screen.style.display = 'block';
    APP_STATE.currentScreen = 'reports';
    try {
        await initializeReportsScreen(screen, {
            databaseReady: APP_STATE.databaseReady,
            onBack: showHomeScreen
        });
        APP_STATE.reportsInitialized = true;
    } catch (error) {
        console.error('Reports init error:', error);
        showAppMessage('خطا در باز کردن بخش گزارش‌ها.', 'danger');
    }
}

/* ============================================================
   Navigation via Event Delegation
============================================================ */
function setupNavigation() {
    // Use event delegation on the whole document
    const handler = function (event) {
        // Find the closest element with data-action attribute
        const target = event.target.closest('[data-action]');
        if (!target) return;

        // Prevent default action (especially for touch)
        event.preventDefault();

        const action = target.getAttribute('data-action');
        if (!action) return;

        // Execute the appropriate action
        switch (action) {
            case 'sales':
                openSalesScreen();
                break;
            case 'products':
                openProductsScreen();
                break;
            case 'reports':
                openReportsScreen();
                break;
            case 'settings':
                showAppMessage('بخش تنظیمات در مرحله بعد فعال می‌شود.', 'info');
                break;
            default:
                console.warn('Unknown action:', action);
        }
    };

    // Remove any previous listeners to avoid duplicates
    document.removeEventListener('click', handler);
    document.removeEventListener('touchstart', handler);

    // Attach both click and touchstart for mobile support
    document.addEventListener('click', handler);
    document.addEventListener('touchstart', handler, { passive: false });

    // Also, verify that at least one menu item exists, else warn the user
    const menuItems = document.querySelectorAll('[data-action]');
    if (menuItems.length === 0) {
        // Fallback: show an alert to help debug
        alert('⚠️ هیچ المان با data-action در صفحه یافت نشد. لطفاً index.html را بررسی کنید.');
    } else {
        console.log(`✅ ${menuItems.length} منوی فعال پیدا شد.`);
    }
}

/* ============================================================
   Database
============================================================ */
function showDatabaseStatus(message, success = true) {
    let status = document.getElementById('database-test-status');
    if (!status) {
        status = document.createElement('div');
        status.id = 'database-test-status';
        const home = getHomeScreen();
        if (home) home.appendChild(status);
    }
    if (!status) return;
    status.className = `database-status ${success ? 'database-status-success' : 'database-status-danger'}`;
    status.textContent = message;
}

async function setupDatabase() {
    try {
        await initializeDatabase();
        APP_STATE.databaseReady = true;
        showDatabaseStatus('✓ پایگاه داده آماده است', true);
    } catch (error) {
        APP_STATE.databaseReady = false;
        showDatabaseStatus('✕ خطا در راه‌اندازی پایگاه داده', false);
        console.error('Database error:', error);
    }
}

/* ============================================================
   Toast / Message
============================================================ */
function showAppMessage(message, type = 'success') {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.className = `app-toast app-toast-${type}`;
    toast.textContent = message;
    requestAnimationFrame(() => {
        toast.classList.add('app-toast-visible');
    });
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.remove('app-toast-visible');
    }, 2800);
}

/* ============================================================
   Global Error Protection (with alert for mobile)
============================================================ */
function setupGlobalErrorProtection() {
    window.addEventListener('error', function (event) {
        const msg = `❌ خطا: ${event.message || event.error?.message || 'ناشناخته'}`;
        console.error(msg, event);
        // Show alert for mobile users
        alert(msg + '\nدر: ' + (event.filename || '') + ':' + (event.lineno || ''));
    });

    window.addEventListener('unhandledrejection', function (event) {
        const msg = '❌ وعده رد شده: ' + (event.reason?.message || event.reason || '');
        console.error(msg, event.reason);
        alert(msg);
    });
}

/* ============================================================
   Header Status
============================================================ */
function setupHeaderStatus() {
    const headerStatus = document.querySelector('.header-status');
    if (!headerStatus) return;
    const ready = headerStatus.querySelector('.status-ready');
    const online = headerStatus.querySelector('.status-online');
    if (ready) {
        ready.innerHTML = `
            <span class="status-icon">✓</span>
            <div class="status-info">
                <span class="status-label">وضعیت</span>
                <strong>آماده به کار</strong>
            </div>
        `;
    }
    if (online) {
        online.innerHTML = `
            <span class="status-icon">●</span>
            <div class="status-info">
                <span class="status-label">اتصال</span>
                <strong>محلی</strong>
            </div>
        `;
    }
}

/* ============================================================
   Initialize Application
============================================================ */
async function initializeApp() {
    if (APP_STATE.initialized) return;

    cacheDOM();

    if (!DOM.app) {
        alert('❌ عنصر #app در صفحه یافت نشد!');
        console.error('#app not found');
        return;
    }
    if (!DOM.main) {
        alert('❌ عنصر <main> در صفحه یافت نشد!');
        console.error('<main> not found');
        return;
    }

    setupGlobalErrorProtection();
    setupHeaderStatus();
    ensureScreens();
    setupNavigation();

    APP_STATE.initialized = true;
    await setupDatabase();

    console.log('✅ برنامه با موفقیت راه‌اندازی شد.');
}

/* ============================================================
   Bootstrap
============================================================ */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp, { once: true });
} else {
    initializeApp();
}
