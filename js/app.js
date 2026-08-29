// SupermarketPOS
// Application Entry Point
// Stage 4 Test

'use strict';

import { showWelcomeMessage } from './ui.js';

console.log('SupermarketPOS: app.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('SupermarketPOS: DOM loaded');

    showWelcomeMessage();

    console.log('SupermarketPOS: UI module executed');
});
