// SupermarketPOS
// UI Module
// Stage 4

'use strict';

export function showWelcomeMessage() {
    const app = document.getElementById('app');

    if (!app) {
        console.error('App container not found.');
        return;
    }

    const message = document.createElement('div');

    message.className = 'welcome-message';

    message.textContent = 'سیستم مدیریت فروشگاه آماده است.';

    app.appendChild(message);
}
