// js/database.js
// SupermarketPOS
// Database Layer - Stage 1
// Version: 1

'use strict';

// ============================================================================
// Database Configuration
// ============================================================================

const DB_NAME = 'SupermarketPOS';

const DB_VERSION = 1;


// ============================================================================
// Open Database
// ============================================================================

export function openDatabase() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );


        // --------------------------------------------------------------------
        // Database Upgrade / First Creation
        // --------------------------------------------------------------------

        request.onupgradeneeded = event => {

            const db =
                event.target.result;


            // Products
            // فعلاً فقط ساختار اولیه را ایجاد می‌کنیم.

            if (
                !db.objectStoreNames.contains(
                    'products'
                )
            ) {

                const products =
                    db.createObjectStore(
                        'products',
                        {
                            keyPath: 'id',
                            autoIncrement: true
                        }
                    );


                products.createIndex(
                    'barcode',
                    'barcode',
                    {
                        unique: true
                    }
                );


                products.createIndex(
                    'name',
                    'name',
                    {
                        unique: false
                    }
                );


                products.createIndex(
                    'category',
                    'category',
                    {
                        unique: false
                    }
                );
            }


            // Sales
            // برای مراحل بعدی آماده می‌شود.

            if (
                !db.objectStoreNames.contains(
                    'sales'
                )
            ) {

                const sales =
                    db.createObjectStore(
                        'sales',
                        {
                            keyPath: 'id',
                            autoIncrement: true
                        }
                    );


                sales.createIndex(
                    'timestamp',
                    'timestamp',
                    {
                        unique: false
                    }
                );
            }


            // Sale Items
            // برای مراحل بعدی آماده می‌شود.

            if (
                !db.objectStoreNames.contains(
                    'saleItems'
                )
            ) {

                const saleItems =
                    db.createObjectStore(
                        'saleItems',
                        {
                            keyPath: 'id',
                            autoIncrement: true
                        }
                    );


                saleItems.createIndex(
                    'saleId',
                    'saleId',
                    {
                        unique: false
                    }
                );


                saleItems.createIndex(
                    'barcode',
                    'barcode',
                    {
                        unique: false
                    }
                );


                saleItems.createIndex(
                    'productId',
                    'productId',
                    {
                        unique: false
                    }
                );
            }
        };


        // --------------------------------------------------------------------
        // Success
        // --------------------------------------------------------------------

        request.onsuccess = event => {

            const db =
                event.target.result;


            console.log(
                'SupermarketPOS: دیتابیس با موفقیت باز شد.'
            );


            resolve(db);
        };


        // --------------------------------------------------------------------
        // Error
        // --------------------------------------------------------------------

        request.onerror = () => {

            console.error(
                'SupermarketPOS: خطا در باز کردن دیتابیس.',
                request.error
            );


            reject(
                request.error ||
                new Error(
                    'خطا در باز کردن پایگاه داده'
                )
            );
        };


        // --------------------------------------------------------------------
        // Blocked
        // --------------------------------------------------------------------

        request.onblocked = () => {

            console.warn(
                'SupermarketPOS: باز کردن دیتابیس مسدود شده است.'
            );
        };
    });
}


// ============================================================================
// Initialize Database
// ============================================================================

export async function initializeDatabase() {

    const db =
        await openDatabase();


    console.log(
        'SupermarketPOS: دیتابیس آماده استفاده است.'
    );


    return db;
}
