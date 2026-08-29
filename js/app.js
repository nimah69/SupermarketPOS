// SupermarketPOS
// Application Entry Point
// Stage 4

'use strict';

import { showWelcomeMessage } from './ui.js';

console.log('SupermarketPOS application started successfully.');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded successfully.');

    showWelcomeMessage();
});
