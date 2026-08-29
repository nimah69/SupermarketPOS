// js/sales.js
// SupermarketPOS
// Sales Screen - Stage 1
// Version: 0.1

'use strict';

// ============================================================================
// Sales Screen
// ============================================================================

function createSalesScreen() {

    const existingScreen =
        document.getElementById('sales-screen');

    if (existingScreen) {
        return existingScreen;
    }

    const screen =
        document.createElement('section');

    screen.id = 'sales-screen';

    screen.className = 'sales-screen';

    screen.setAttribute(
        'aria-hidden',
        'false'
    );


    // ------------------------------------------------------------------------
    // Header
    // ------------------------------------------------------------------------

    const header =
        document.createElement('div');

    header.className = 'sales-header';


    const title =
        document.createElement('h2');

    title.textContent =
        '🛒 فروش و صندوق';


    const description =
        document.createElement('p');

    description.textContent =
        'این بخش برای ثبت فروش فروشگاه آماده می‌شود.';


    header.appendChild(title);
    header.appendChild(description);


    // ------------------------------------------------------------------------
    // Barcode
    // ------------------------------------------------------------------------

    const barcodeBox =
        document.createElement('div');

    barcodeBox.className =
        'sales-placeholder';

    barcodeBox.innerHTML = `
        <div class="placeholder-icon">
            ▣
        </div>

        <h3>
            اسکن یا ورود بارکد
        </h3>

        <p>
            سیستم بارکد در مرحله بعد فعال خواهد شد.
        </p>
    `;


    // ------------------------------------------------------------------------
    // Cart
    // ------------------------------------------------------------------------

    const cartBox =
        document.createElement('div');

    cartBox.className =
        'sales-placeholder';

    cartBox.innerHTML = `
        <div class="placeholder-icon">
            🛍️
        </div>

        <h3>
            سبد خرید
        </h3>

        <p>
            هنوز کالایی به سبد اضافه نشده است.
        </p>
    `;


    // ------------------------------------------------------------------------
    // Back Button
    // ------------------------------------------------------------------------

    const backButton =
        document.createElement('button');

    backButton.type =
        'button';

    backButton.className =
        'sales-back-button';

    backButton.textContent =
        '← بازگشت به صفحه اصلی';


    backButton.addEventListener(
        'click',
        () => {

            screen.style.display =
                'none';

            const homeScreen =
                document.querySelector(
                    '.home-screen'
                );

            if (homeScreen) {
                homeScreen.style.display =
                    '';
            }

        }
    );


    // ------------------------------------------------------------------------
    // Assemble
    // ------------------------------------------------------------------------

    screen.appendChild(header);

    screen.appendChild(barcodeBox);

    screen.appendChild(cartBox);

    screen.appendChild(backButton);


    return screen;
}


// ============================================================================
// Open Sales
// ============================================================================

function openSalesScreen() {

    const main =
        document.querySelector('main');

    if (!main) {
        console.error(
            'SupermarketPOS: عنصر main پیدا نشد.'
        );

        return;
    }


    const homeScreen =
        document.querySelector(
            '.home-screen'
        );

    if (homeScreen) {
        homeScreen.style.display =
            'none';
    }


    let salesScreen =
        document.getElementById(
            'sales-screen'
        );


    if (!salesScreen) {

        salesScreen =
            createSalesScreen();

        main.appendChild(
            salesScreen
        );
    }


    salesScreen.style.display =
        'block';

    salesScreen.setAttribute(
        'aria-hidden',
        'false'
    );
}


// ============================================================================
// Connect Sales Button
// ============================================================================

function setupSalesButton() {

    const salesButton =
        document.querySelector(
            '.menu-card[data-action="sales"]'
        );

    if (!salesButton) {
        return;
    }


    salesButton.addEventListener(
        'click',
        openSalesScreen
    );
}


// ============================================================================
// Initialize
// ============================================================================

function initializeSalesModule() {

    setupSalesButton();

    console.log(
        'SupermarketPOS: ماژول فروش آماده است.'
    );
}


// ============================================================================
// Bootstrap
// ============================================================================

if (document.readyState === 'loading') {

    document.addEventListener(
        'DOMContentLoaded',
        initializeSalesModule,
        { once: true }
    );

} else {

    initializeSalesModule();

}
