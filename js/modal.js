// js/modal.js
// SupermarketPOS
// Global Modal System
// Stage 5.1
// Version: 1

'use strict';

// ============================================================================
// Modal State
// ============================================================================

let activeModal = null;


// ============================================================================
// Create Modal System
// ============================================================================

function createModalSystem() {

    let overlay =
        document.getElementById(
            'supermarket-modal-overlay'
        );

    if (overlay) {
        return overlay;
    }


    overlay =
        document.createElement('div');

    overlay.id =
        'supermarket-modal-overlay';

    overlay.className =
        'supermarket-modal-overlay';

    overlay.setAttribute(
        'aria-hidden',
        'true'
    );


    overlay.innerHTML = `

        <div
            class="supermarket-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="supermarket-modal-title"
        >

            <button
                type="button"
                class="supermarket-modal-close"
                id="supermarket-modal-close"
                aria-label="بستن"
            >
                ×
            </button>


            <div
                class="supermarket-modal-icon"
                id="supermarket-modal-icon"
            >
                ℹ️
            </div>


            <div class="supermarket-modal-content">

                <h2
                    id="supermarket-modal-title"
                    class="supermarket-modal-title"
                >
                    پیام
                </h2>


                <div
                    id="supermarket-modal-message"
                    class="supermarket-modal-message"
                ></div>


                <div
                    id="supermarket-modal-actions"
                    class="supermarket-modal-actions"
                ></div>

            </div>

        </div>
    `;


    document.body.appendChild(
        overlay
    );


    const closeButton =
        overlay.querySelector(
            '#supermarket-modal-close'
        );


    if (closeButton) {

        closeButton.addEventListener(
            'click',
            () => {

                closeModal();

            }
        );
    }


    overlay.addEventListener(
        'click',
        event => {

            if (
                event.target === overlay &&
                activeModal &&
                activeModal.closeOnOverlay
            ) {

                closeModal();

            }

        }
    );


    document.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Escape' &&
                activeModal
            ) {

                if (
                    activeModal.closeOnEscape
                ) {

                    closeModal();

                }

            }

        }
    );


    return overlay;
}


// ============================================================================
// Open Modal
// ============================================================================

export function openModal(options = {}) {

    const overlay =
        createModalSystem();


    const modal =
        overlay.querySelector(
            '.supermarket-modal'
        );


    const icon =
        overlay.querySelector(
            '#supermarket-modal-icon'
        );


    const title =
        overlay.querySelector(
            '#supermarket-modal-title'
        );


    const message =
        overlay.querySelector(
            '#supermarket-modal-message'
        );


    const actions =
        overlay.querySelector(
            '#supermarket-modal-actions'
        );


    const closeButton =
        overlay.querySelector(
            '#supermarket-modal-close'
        );


    activeModal = {

        closeOnOverlay:
            options.closeOnOverlay !== false,

        closeOnEscape:
            options.closeOnEscape !== false,

        onClose:
            typeof options.onClose === 'function'
                ? options.onClose
                : null

    };


    // ------------------------------------------------------------------------
    // Type
    // ------------------------------------------------------------------------

    const type =
        options.type ||
        'info';


    modal.className =
        `supermarket-modal supermarket-modal-${type}`;


    // ------------------------------------------------------------------------
    // Icon
    // ------------------------------------------------------------------------

    const icons = {

        info: 'ℹ️',

        success: '✓',

        error: '⚠️',

        warning: '⚠️',

        confirm: '❔'

    };


    icon.textContent =
        options.icon ||
        icons[type] ||
        icons.info;


    // ------------------------------------------------------------------------
    // Title
    // ------------------------------------------------------------------------

    title.textContent =
        options.title ||
        'پیام';


    // ------------------------------------------------------------------------
    // Message
    // ------------------------------------------------------------------------

    message.innerHTML =
        '';


    if (
        options.message instanceof Node
    ) {

        message.appendChild(
            options.message
        );

    } else {

        const paragraph =
            document.createElement('p');

        paragraph.textContent =
            options.message ||
            '';

        message.appendChild(
            paragraph
        );
    }


    // ------------------------------------------------------------------------
    // Actions
    // ------------------------------------------------------------------------

    actions.innerHTML =
        '';


    if (
        Array.isArray(
            options.actions
        )
    ) {

        options.actions.forEach(
            action => {

                const button =
                    document.createElement(
                        'button'
                    );


                button.type =
                    'button';


                button.className =
                    'supermarket-modal-button';


                if (
                    action.variant
                ) {

                    button.classList.add(
                        `modal-button-${action.variant}`
                    );

                } else {

                    button.classList.add(
                        'modal-button-primary'
                    );
                }


                button.textContent =
                    action.label ||
                    'تأیید';


                if (
                    action.disabled
                ) {

                    button.disabled =
                        true;
                }


                button.addEventListener(
                    'click',
                    async () => {

                        if (
                            typeof action.onClick ===
                            'function'
                        ) {

                            await action.onClick();

                        }

                        if (
                            action.close !== false
                        ) {

                            closeModal();

                        }

                    }
                );


                actions.appendChild(
                    button
                );

            }
        );

    }


    // ------------------------------------------------------------------------
    // Close Button
    // ------------------------------------------------------------------------

    closeButton.style.display =
        options.showClose === false
            ? 'none'
            : 'flex';


    // ------------------------------------------------------------------------
    // Show
    // ------------------------------------------------------------------------

    overlay.setAttribute(
        'aria-hidden',
        'false'
    );


    document.body.classList.add(
        'modal-open'
    );


    requestAnimationFrame(
        () => {

            overlay.classList.add(
                'is-visible'
            );

        }
    );


    return overlay;
}


// ============================================================================
// Close Modal
// ============================================================================

export function closeModal() {

    const overlay =
        document.getElementById(
            'supermarket-modal-overlay'
        );


    if (!overlay) {
        return;
    }


    const callback =
        activeModal &&
        activeModal.onClose;


    activeModal =
        null;


    overlay.classList.remove(
        'is-visible'
    );


    overlay.setAttribute(
        'aria-hidden',
        'true'
    );


    document.body.classList.remove(
        'modal-open'
    );


    if (
        typeof callback ===
        'function'
    ) {

        callback();

    }
}


// ============================================================================
// Confirm Modal
// ============================================================================

export function confirmModal({

    title =
        'تأیید عملیات',

    message =
        'آیا از انجام این عملیات مطمئن هستید؟',

    confirmText =
        'تأیید',

    cancelText =
        'انصراف',

    type =
        'confirm',

    icon =
        '❔',

    onConfirm =
        null

} = {}) {

    return new Promise(
        resolve => {

            let finished =
                false;


            const finish =
                result => {

                    if (finished) {
                        return;
                    }

                    finished = true;

                    resolve(result);
                };


            openModal({

                type,

                icon,

                title,

                message,

                closeOnOverlay: false,

                actions: [

                    {

                        label:
                            cancelText,

                        variant:
                            'secondary',

                        onClick:
                            () => {

                                finish(false);

                            }

                    },

                    {

                        label:
                            confirmText,

                        variant:
                            'primary',

                        onClick:
                            async () => {

                                try {

                                    if (
                                        typeof onConfirm ===
                                        'function'
                                    ) {

                                        await onConfirm();

                                    }

                                    finish(true);

                                } catch (
                                    error
                                ) {

                                    console.error(
                                        'SupermarketPOS: خطا در تأیید عملیات.',
                                        error
                                    );

                                    finish(false);

                                }

                            }

                    }

                ],

                onClose:
                    () => {

                        finish(false);

                    }

            });

        }
    );
}


// ============================================================================
// Alert Modal
// ============================================================================

export function alertModal({

    title =
        'پیام',

    message =
        '',

    type =
        'info',

    icon =
        null,

    buttonText =
        'متوجه شدم'

} = {}) {

    return new Promise(
        resolve => {

            let finished =
                false;


            const finish =
                () => {

                    if (finished) {
                        return;
                    }

                    finished = true;

                    resolve();

                };


            openModal({

                type,

                icon,

                title,

                message,

                actions: [

                    {

                        label:
                            buttonText,

                        variant:
                            'primary',

                        onClick:
                            finish

                    }

                ],

                onClose:
                    finish

            });

        }
    );
}


// ============================================================================
// Initialize
// ============================================================================

export function initializeModalSystem() {

    createModalSystem();

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
        initializeModalSystem,
        {
            once: true
        }
    );

} else {

    initializeModalSystem();

}
