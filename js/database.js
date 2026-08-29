// js/database.js
// SupermarketPOS
// Database Layer
// Backup / Restore Preparation
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
            // ----------------------------------------------------------------

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
            // ----------------------------------------------------------------

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
            // ----------------------------------------------------------------

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


// ============================================================================
// Add Product
// ============================================================================

export function addProduct(product) {

    return openDatabase()
        .then(db => {

            return new Promise(
                (resolve, reject) => {

                    const transaction =
                        db.transaction(
                            'products',
                            'readwrite'
                        );

                    const store =
                        transaction.objectStore(
                            'products'
                        );

                    const request =
                        store.add(product);


                    request.onsuccess =
                        () => {

                            resolve(
                                request.result
                            );
                        };


                    request.onerror =
                        () => {

                            reject(
                                request.error
                            );
                        };


                    transaction.oncomplete =
                        () => {

                            db.close();
                        };


                    transaction.onerror =
                        () => {

                            reject(
                                transaction.error
                            );
                        };
                }
            );
        });
}


// ============================================================================
// Get Product
// ============================================================================

export function getProduct(id) {

    return openDatabase()
        .then(db => {

            return new Promise(
                (resolve, reject) => {

                    const transaction =
                        db.transaction(
                            'products',
                            'readonly'
                        );

                    const store =
                        transaction.objectStore(
                            'products'
                        );

                    const request =
                        store.get(id);


                    request.onsuccess =
                        () => {

                            resolve(
                                request.result
                            );
                        };


                    request.onerror =
                        () => {

                            reject(
                                request.error
                            );
                        };


                    transaction.oncomplete =
                        () => {

                            db.close();
                        };
                }
            );
        });
}


// ============================================================================
// Get Product By Barcode
// ============================================================================

export function getProductByBarcode(
    barcode
) {

    return openDatabase()
        .then(db => {

            return new Promise(
                (resolve, reject) => {

                    const transaction =
                        db.transaction(
                            'products',
                            'readonly'
                        );

                    const store =
                        transaction.objectStore(
                            'products'
                        );

                    const index =
                        store.index(
                            'barcode'
                        );

                    const request =
                        index.get(barcode);


                    request.onsuccess =
                        () => {

                            resolve(
                                request.result
                            );
                        };


                    request.onerror =
                        () => {

                            reject(
                                request.error
                            );
                        };


                    transaction.oncomplete =
                        () => {

                            db.close();
                        };
                }
            );
        });
}


// ============================================================================
// Get All Products
// ============================================================================

export function getAllProducts() {

    return openDatabase()
        .then(db => {

            return new Promise(
                (resolve, reject) => {

                    const transaction =
                        db.transaction(
                            'products',
                            'readonly'
                        );

                    const store =
                        transaction.objectStore(
                            'products'
                        );

                    const request =
                        store.getAll();


                    request.onsuccess =
                        () => {

                            resolve(
                                request.result
                            );
                        };


                    request.onerror =
                        () => {

                            reject(
                                request.error
                            );
                        };


                    transaction.oncomplete =
                        () => {

                            db.close();
                        };
                }
            );
        });
}


// ============================================================================
// Update Product
// ============================================================================

export function updateProduct(
    product
) {

    return openDatabase()
        .then(db => {

            return new Promise(
                (resolve, reject) => {

                    const transaction =
                        db.transaction(
                            'products',
                            'readwrite'
                        );

                    const store =
                        transaction.objectStore(
                            'products'
                        );

                    const request =
                        store.put(product);


                    request.onsuccess =
                        () => {

                            resolve(
                                request.result
                            );
                        };


                    request.onerror =
                        () => {

                            reject(
                                request.error
                            );
                        };


                    transaction.oncomplete =
                        () => {

                            db.close();
                        };


                    transaction.onerror =
                        () => {

                            reject(
                                transaction.error
                            );
                        };
                }
            );
        });
}


// ============================================================================
// Delete Product
// ============================================================================

export function deleteProduct(
    id
) {

    return openDatabase()
        .then(db => {

            return new Promise(
                (resolve, reject) => {

                    const transaction =
                        db.transaction(
                            'products',
                            'readwrite'
                        );

                    const store =
                        transaction.objectStore(
                            'products'
                        );

                    const request =
                        store.delete(id);


                    request.onsuccess =
                        () => {

                            resolve(
                                true
                            );
                        };


                    request.onerror =
                        () => {

                            reject(
                                request.error
                            );
                        };


                    transaction.oncomplete =
                        () => {

                            db.close();
                        };


                    transaction.onerror =
                        () => {

                            reject(
                                transaction.error
                            );
                        };
                }
            );
        });
}


// ============================================================================
// BACKUP - Get All Products
// ============================================================================
//
// این تابع فعلاً فقط داده‌های کالاها را برای سیستم Backup آماده می‌کند.
// هیچ اطلاعاتی را حذف یا تغییر نمی‌دهد.
//

export async function getProductsForBackup() {

    const products =
        await getAllProducts();


    return {
        version: 1,

        type: 'SupermarketPOS',

        createdAt:
            new Date().toISOString(),

        products: products
    };
}
