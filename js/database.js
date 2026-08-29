// js/database.js
// SupermarketPOS
// Database Layer
// Products + Sales + Sale Items
// Backup / Restore
// Version: 1.1

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


            db.onversionchange = () => {

                db.close();
            };


            resolve(db);
        };


        request.onerror = () => {

            reject(
                request.error ||
                new Error(
                    'خطا در باز کردن پایگاه داده.'
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

    db.close();

    return true;
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


                    transaction.onerror =
                        () => {

                            reject(
                                transaction.error
                            );
                        };


                    transaction.onabort =
                        () => {

                            reject(
                                transaction.error ||
                                new Error(
                                    'عملیات ذخیره کالا لغو شد.'
                                )
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

    const normalizedBarcode =
        String(
            barcode || ''
        ).trim();


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
                        index.get(
                            normalizedBarcode
                        );


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


                    transaction.onerror =
                        () => {

                            reject(
                                transaction.error
                            );
                        };


                    transaction.onabort =
                        () => {

                            reject(
                                transaction.error ||
                                new Error(
                                    'به‌روزرسانی کالا لغو شد.'
                                )
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


                    transaction.onerror =
                        () => {

                            reject(
                                transaction.error
                            );
                        };


                    transaction.onabort =
                        () => {

                            reject(
                                transaction.error ||
                                new Error(
                                    'حذف کالا لغو شد.'
                                )
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
// Register Sale
// ============================================================================
//
// این تابع:
// 1. موجودی واقعی کالاها را دوباره بررسی می‌کند.
// 2. فروش را در sales ذخیره می‌کند.
// 3. اقلام فروش را در saleItems ذخیره می‌کند.
// 4. موجودی products را کاهش می‌دهد.
// 5. همه عملیات را داخل یک Transaction انجام می‌دهد.
//
// اگر یکی از مراحل شکست بخورد، کل Transaction لغو می‌شود.
//
// ============================================================================

export function registerSale(
    cartItems
) {

    if (
        !Array.isArray(cartItems) ||
        cartItems.length === 0
    ) {

        return Promise.reject(
            new Error(
                'سبد خرید خالی است.'
            )
        );
    }


    return openDatabase()
        .then(db => {

            return new Promise(
                (resolve, reject) => {

                    const transaction =
                        db.transaction(
                            [
                                'products',
                                'sales',
                                'saleItems'
                            ],
                            'readwrite'
                        );


                    const productsStore =
                        transaction.objectStore(
                            'products'
                        );


                    const salesStore =
                        transaction.objectStore(
                            'sales'
                        );


                    const saleItemsStore =
                        transaction.objectStore(
                            'saleItems'
                        );


                    let saleRecord = null;

                    let saleId = null;


                    const preparedItems = [];


                    // --------------------------------------------------------
                    // Validation
                    // --------------------------------------------------------

                    try {

                        cartItems.forEach(
                            item => {

                                if (
                                    !item ||
                                    item.productId === undefined ||
                                    item.productId === null
                                ) {

                                    throw new Error(
                                        'اطلاعات یکی از کالاهای سبد معتبر نیست.'
                                    );
                                }


                                const quantity =
                                    Number(
                                        item.quantity
                                    );


                                if (
                                    !Number.isInteger(
                                        quantity
                                    ) ||
                                    quantity <= 0
                                ) {

                                    throw new Error(
                                        'تعداد یکی از کالاهای سبد معتبر نیست.'
                                    );
                                }


                                preparedItems.push({

                                    productId:
                                        item.productId,

                                    barcode:
                                        String(
                                            item.barcode || ''
                                        ).trim(),

                                    name:
                                        String(
                                            item.name || 'بدون نام'
                                        ),

                                    quantity:
                                        quantity,

                                    salePrice:
                                        Number(
                                            item.salePrice
                                        ) || 0,

                                    total:
                                        (
                                            Number(
                                                item.salePrice
                                            ) || 0
                                        ) * quantity
                                });
                            }
                        );


                        if (
                            preparedItems.length === 0
                        ) {

                            throw new Error(
                                'سبد خرید خالی است.'
                            );
                        }


                        // ----------------------------------------------------
                        // Create Sale
                        // ----------------------------------------------------

                        const timestamp =
                            new Date().toISOString();


                        const total =
                            preparedItems.reduce(
                                (
                                    sum,
                                    item
                                ) => {

                                    return sum +
                                        item.total;

                                },
                                0
                            );


                        saleRecord = {

                            timestamp:
                                timestamp,

                            total:
                                total,

                            itemCount:
                                preparedItems.reduce(
                                    (
                                        sum,
                                        item
                                    ) => {

                                        return sum +
                                            item.quantity;

                                    },
                                    0
                                ),

                            status:
                                'completed'
                        };


                        const saleRequest =
                            salesStore.add(
                                saleRecord
                            );


                        saleRequest.onsuccess =
                            () => {

                                saleId =
                                    saleRequest.result;


                                preparedItems.forEach(
                                    item => {

                                        const productRequest =
                                            productsStore.get(
                                                item.productId
                                            );


                                        productRequest.onsuccess =
                                            () => {

                                                const product =
                                                    productRequest.result;


                                                if (
                                                    !product
                                                ) {

                                                    transaction.abort();

                                                    return;
                                                }


                                                const currentStock =
                                                    Number(
                                                        product.stock
                                                    ) || 0;


                                                if (
                                                    currentStock <
                                                    item.quantity
                                                ) {

                                                    transaction.abort();

                                                    return;
                                                }


                                                const newStock =
                                                    currentStock -
                                                    item.quantity;


                                                product.stock =
                                                    newStock;


                                                product.updatedAt =
                                                    timestamp;


                                                const updateRequest =
                                                    productsStore.put(
                                                        product
                                                    );


                                                updateRequest.onsuccess =
                                                    () => {

                                                        const saleItem = {

                                                            saleId:
                                                                saleId,

                                                            productId:
                                                                item.productId,

                                                            barcode:
                                                                item.barcode,

                                                            name:
                                                                item.name,

                                                            quantity:
                                                                item.quantity,

                                                            salePrice:
                                                                item.salePrice,

                                                            total:
                                                                item.total
                                                        };


                                                        saleItemsStore.add(
                                                            saleItem
                                                        );
                                                    };


                                                updateRequest.onerror =
                                                    () => {

                                                        transaction.abort();
                                                    };
                                            };


                                        productRequest.onerror =
                                            () => {

                                                transaction.abort();
                                            };
                                    }
                                );
                            };


                        saleRequest.onerror =
                            () => {

                                transaction.abort();
                            };


                    } catch (error) {

                        transaction.abort();


                        reject(error);

                        return;
                    }


                    // --------------------------------------------------------
                    // Transaction Complete
                    // --------------------------------------------------------

                    transaction.oncomplete =
                        () => {

                            db.close();


                            resolve({

                                success:
                                    true,

                                saleId:
                                    saleId,

                                total:
                                    saleRecord.total,

                                itemCount:
                                    saleRecord.itemCount,

                                timestamp:
                                    saleRecord.timestamp
                            });
                        };


                    transaction.onerror =
                        () => {

                            db.close();


                            reject(
                                transaction.error ||
                                new Error(
                                    'ثبت فروش انجام نشد.'
                                )
                            );
                        };


                    transaction.onabort =
                        () => {

                            db.close();


                            reject(
                                transaction.error ||
                                new Error(
                                    'ثبت فروش لغو شد. موجودی کالا ممکن است کافی نباشد.'
                                )
                            );
                        };
                }
            );
        });
}


// ============================================================================
// Get All Sales
// ============================================================================

export function getAllSales() {

    return openDatabase()
        .then(db => {

            return new Promise(
                (resolve, reject) => {

                    const transaction =
                        db.transaction(
                            'sales',
                            'readonly'
                        );


                    const store =
                        transaction.objectStore(
                            'sales'
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
// Get Sale Items
// ============================================================================

export function getSaleItems(
    saleId
) {

    return openDatabase()
        .then(db => {

            return new Promise(
                (resolve, reject) => {

                    const transaction =
                        db.transaction(
                            'saleItems',
                            'readonly'
                        );


                    const store =
                        transaction.objectStore(
                            'saleItems'
                        );


                    const index =
                        store.index(
                            'saleId'
                        );


                    const request =
                        index.getAll(
                            saleId
                        );


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
// BACKUP
// ============================================================================

export async function getProductsForBackup() {

    const products =
        await getAllProducts();


    return {

        version: 1,

        type:
            'SupermarketPOS',

        createdAt:
            new Date().toISOString(),

        products:
            products
    };
}


// ============================================================================
// RESTORE - MERGE
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


            const index =
                store.index(
                    'barcode'
                );


            let added = 0;

            let updated = 0;

            let skipped = 0;


            backupProducts.forEach(
                backupProduct => {

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


                                updateRequest.onerror =
                                    () => {

                                        skipped++;
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


                                addRequest.onerror =
                                    () => {

                                        skipped++;
                                    };
                            }
                        };


                    request.onerror =
                        () => {

                            skipped++;
                        };
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
