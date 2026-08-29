// js/database.js
// SupermarketPOS
// Database Layer
// Backup / Restore
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

        request.onupgradeneeded = event => {

            const db =
                event.target.result;


            // ----------------------------------------------------------------
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


            // ----------------------------------------------------------------
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


            // ----------------------------------------------------------------
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


        request.onsuccess = event => {

            const db =
                event.target.result;


            resolve(db);
        };


        request.onerror = () => {

            reject(
                request.error ||
                new Error(
                    'خطا در باز کردن پایگاه داده'
                )
            );
        };


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

                            resolve(true);
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
// BACKUP
// ============================================================================

export async function getProductsForBackup() {

    const products =
        await getAllProducts();


    return {

        version: 1,

        type: 'SupermarketPOS',

        createdAt:
            new Date().toISOString(),

        products:
            products
    };
}


// ============================================================================
// RESTORE - MERGE
// ============================================================================
//
// کالاهای موجود در فایل Backup با کالاهای فعلی ادغام می‌شوند.
//
// قانون:
// - اگر بارکد وجود نداشته باشد → کالا اضافه می‌شود.
// - اگر بارکد وجود داشته باشد → اطلاعات کالا به‌روزرسانی می‌شود.
// - کالاهای فعلی که در Backup نیستند → حذف نمی‌شوند.
//
// ============================================================================

export async function restoreProductsMerge(
    backupProducts
) {

    if (
        !Array.isArray(
            backupProducts
        )
    ) {

        throw new Error(
            'فایل پشتیبان معتبر نیست.'
        );
    }


    const db =
        await openDatabase();


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


            let added = 0;

            let updated = 0;

            let skipped = 0;


            backupProducts.forEach(
                backupProduct => {

                    try {

                        if (
                            !backupProduct ||
                            !backupProduct.barcode
                        ) {

                            skipped++;

                            return;
                        }


                        const barcode =
                            String(
                                backupProduct.barcode
                            ).trim();


                        if (!barcode) {

                            skipped++;

                            return;
                        }


                        const index =
                            store.index(
                                'barcode'
                            );


                        const request =
                            index.get(
                                barcode
                            );


                        request.onsuccess =
                            () => {

                                const existing =
                                    request.result;


                                const now =
                                    new Date()
                                        .toISOString();


                                const product = {

                                    barcode:
                                        barcode,

                                    name:
                                        backupProduct.name ||
                                        'بدون نام',

                                    category:
                                        backupProduct.category ||
                                        '',

                                    salePrice:
                                        Number(
                                            backupProduct.salePrice
                                        ) || 0,

                                    stock:
                                        Number(
                                            backupProduct.stock
                                        ) || 0,

                                    createdAt:
                                        existing &&
                                        existing.createdAt
                                            ? existing.createdAt
                                            : (
                                                backupProduct.createdAt ||
                                                now
                                            ),

                                    updatedAt:
                                        now
                                };


                                if (existing) {

                                    product.id =
                                        existing.id;


                                    const updateRequest =
                                        store.put(
                                            product
                                        );


                                    updateRequest.onsuccess =
                                        () => {

                                            updated++;
                                        };


                                } else {

                                    const addRequest =
                                        store.add(
                                            product
                                        );


                                    addRequest.onsuccess =
                                        () => {

                                            added++;
                                        };
                                }
                            };


                        request.onerror =
                            () => {

                                skipped++;
                            };


                    } catch (error) {

                        skipped++;
                    }
                }
            );


            transaction.oncomplete =
                () => {

                    db.close();


                    resolve({

                        added:
                            added,

                        updated:
                            updated,

                        skipped:
                            skipped,

                        total:
                            backupProducts.length
                    });
                };


            transaction.onerror =
                () => {

                    db.close();


                    reject(
                        transaction.error ||
                        new Error(
                            'خطا در بازیابی اطلاعات.'
                        )
                    );
                };


            transaction.onabort =
                () => {

                    db.close();


                    reject(
                        transaction.error ||
                        new Error(
                            'عملیات بازیابی لغو شد.'
                        )
                    );
                };
        }
    );
}
