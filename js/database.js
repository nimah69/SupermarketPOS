// js/database.js
// SupermarketPOS
// IndexedDB Database Layer
// Complete Replacement

'use strict';

const DB_NAME = 'SupermarketPOS';
const DB_VERSION = 1;

const STORE_PRODUCTS = 'products';
const STORE_SALES = 'sales';
const STORE_SALE_ITEMS = 'saleItems';

let databasePromise = null;


/* ============================================================
   Open Database
   ============================================================ */

export function openDatabase() {

    if (databasePromise) {
        return databasePromise;
    }

    databasePromise = new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );

            request.onupgradeneeded =
                event => {

                    const db =
                        event.target.result;


                    /* PRODUCTS */

                    let products;

                    if (
                        !db.objectStoreNames.contains(
                            STORE_PRODUCTS
                        )
                    ) {

                        products =
                            db.createObjectStore(
                                STORE_PRODUCTS,
                                {
                                    keyPath: 'id',
                                    autoIncrement: true
                                }
                            );

                    } else {

                        products =
                            event.target.transaction.objectStore(
                                STORE_PRODUCTS
                            );
                    }


                    if (
                        !products.indexNames.contains(
                            'barcode'
                        )
                    ) {

                        products.createIndex(
                            'barcode',
                            'barcode',
                            {
                                unique: true
                            }
                        );
                    }


                    if (
                        !products.indexNames.contains(
                            'name'
                        )
                    ) {

                        products.createIndex(
                            'name',
                            'name',
                            {
                                unique: false
                            }
                        );
                    }


                    if (
                        !products.indexNames.contains(
                            'category'
                        )
                    ) {

                        products.createIndex(
                            'category',
                            'category',
                            {
                                unique: false
                            }
                        );
                    }


                    /* SALES */

                    let sales;

                    if (
                        !db.objectStoreNames.contains(
                            STORE_SALES
                        )
                    ) {

                        sales =
                            db.createObjectStore(
                                STORE_SALES,
                                {
                                    keyPath: 'id',
                                    autoIncrement: true
                                }
                            );

                    } else {

                        sales =
                            event.target.transaction.objectStore(
                                STORE_SALES
                            );
                    }


                    if (
                        !sales.indexNames.contains(
                            'timestamp'
                        )
                    ) {

                        sales.createIndex(
                            'timestamp',
                            'timestamp',
                            {
                                unique: false
                            }
                        );
                    }


                    /* SALE ITEMS */

                    let saleItems;

                    if (
                        !db.objectStoreNames.contains(
                            STORE_SALE_ITEMS
                        )
                    ) {

                        saleItems =
                            db.createObjectStore(
                                STORE_SALE_ITEMS,
                                {
                                    keyPath: 'id',
                                    autoIncrement: true
                                }
                            );

                    } else {

                        saleItems =
                            event.target.transaction.objectStore(
                                STORE_SALE_ITEMS
                            );
                    }


                    if (
                        !saleItems.indexNames.contains(
                            'saleId'
                        )
                    ) {

                        saleItems.createIndex(
                            'saleId',
                            'saleId',
                            {
                                unique: false
                            }
                        );
                    }

                };


            request.onsuccess =
                event => {

                    resolve(
                        event.target.result
                    );
                };


            request.onerror =
                () => {

                    databasePromise = null;

                    reject(
                        request.error
                    );
                };

        }
    );

    return databasePromise;
}


/* ============================================================
   Initialize
   ============================================================ */

export async function initializeDatabase() {

    const db =
        await openDatabase();

    return db;
}


/* ============================================================
   Request Promise
   ============================================================ */

function requestToPromise(request) {

    return new Promise(
        (resolve, reject) => {

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

        }
    );
}


/* ============================================================
   Add Product
   ============================================================ */

export async function addProduct(product) {

    const db =
        await openDatabase();

    const transaction =
        db.transaction(
            STORE_PRODUCTS,
            'readwrite'
        );

    const store =
        transaction.objectStore(
            STORE_PRODUCTS
        );

    const request =
        store.add({
            ...product,

            barcode:
                String(
                    product.barcode || ''
                ).trim(),

            name:
                String(
                    product.name || ''
                ).trim(),

            category:
                String(
                    product.category || ''
                ).trim(),

            salePrice:
                Number(
                    product.salePrice
                ) || 0,

            stock:
                Number(
                    product.stock
                ) || 0
        });

    return requestToPromise(request);
}


/* ============================================================
   Get Product
   ============================================================ */

export async function getProduct(id) {

    const db =
        await openDatabase();

    const transaction =
        db.transaction(
            STORE_PRODUCTS,
            'readonly'
        );

    const store =
        transaction.objectStore(
            STORE_PRODUCTS
        );

    return requestToPromise(
        store.get(id)
    );
}


/* ============================================================
   Get Product By Barcode
   ============================================================ */

export async function getProductByBarcode(
    barcode
) {

    const db =
        await openDatabase();

    const transaction =
        db.transaction(
            STORE_PRODUCTS,
            'readonly'
        );

    const store =
        transaction.objectStore(
            STORE_PRODUCTS
        );

    const index =
        store.index(
            'barcode'
        );

    return requestToPromise(
        index.get(
            String(barcode).trim()
        )
    );
}


/* ============================================================
   Get All Products
   ============================================================ */

export async function getAllProducts() {

    const db =
        await openDatabase();

    const transaction =
        db.transaction(
            STORE_PRODUCTS,
            'readonly'
        );

    const store =
        transaction.objectStore(
            STORE_PRODUCTS
        );

    return requestToPromise(
        store.getAll()
    );
}


/* ============================================================
   Update Product
   ============================================================ */

export async function updateProduct(
    product
) {

    if (
        !product ||
        product.id === undefined
    ) {

        throw new Error(
            'Invalid product'
        );
    }

    const db =
        await openDatabase();

    const transaction =
        db.transaction(
            STORE_PRODUCTS,
            'readwrite'
        );

    const store =
        transaction.objectStore(
            STORE_PRODUCTS
        );

    const request =
        store.put(product);

    return requestToPromise(request);
}


/* ============================================================
   Delete Product
   ============================================================ */

export async function deleteProduct(id) {

    const db =
        await openDatabase();

    const transaction =
        db.transaction(
            STORE_PRODUCTS,
            'readwrite'
        );

    const store =
        transaction.objectStore(
            STORE_PRODUCTS
        );

    return requestToPromise(
        store.delete(id)
    );
}


/* ============================================================
   Create Sale
   ============================================================ */

export async function createSale(
    sale,
    items
) {

    if (
        !sale ||
        !Array.isArray(items) ||
        items.length === 0
    ) {

        throw new Error(
            'Invalid sale'
        );
    }

    const db =
        await openDatabase();

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    [
                        STORE_PRODUCTS,
                        STORE_SALES,
                        STORE_SALE_ITEMS
                    ],
                    'readwrite'
                );

            const productsStore =
                transaction.objectStore(
                    STORE_PRODUCTS
                );

            const salesStore =
                transaction.objectStore(
                    STORE_SALES
                );

            const saleItemsStore =
                transaction.objectStore(
                    STORE_SALE_ITEMS
                );


            const saleRequest =
                salesStore.add({
                    ...sale,

                    timestamp:
                        sale.timestamp ||
                        new Date().toISOString()
                });


            saleRequest.onsuccess =
                () => {

                    const saleId =
                        saleRequest.result;


                    for (
                        const item of items
                    ) {

                        const quantity =
                            Number(
                                item.quantity
                            ) || 0;


                        if (
                            quantity <= 0
                        ) {

                            transaction.abort();

                            return;
                        }


                        const itemRequest =
                            saleItemsStore.add({

                                saleId,

                                productId:
                                    item.productId,

                                barcode:
                                    item.barcode,

                                name:
                                    item.name,

                                salePrice:
                                    Number(
                                        item.salePrice
                                    ) || 0,

                                quantity,

                                lineTotal:
                                    quantity *
                                    (
                                        Number(
                                            item.salePrice
                                        ) || 0
                                    )
                            });


                        itemRequest.onerror =
                            () => {

                                try {
                                    transaction.abort();
                                } catch {}
                            };


                        const productRequest =
                            productsStore.get(
                                item.productId
                            );


                        productRequest.onsuccess =
                            () => {

                                const product =
                                    productRequest.result;


                                if (!product) {

                                    transaction.abort();

                                    return;
                                }


                                const currentStock =
                                    Number(
                                        product.stock
                                    ) || 0;


                                if (
                                    currentStock <
                                    quantity
                                ) {

                                    transaction.abort();

                                    return;
                                }


                                product.stock =
                                    currentStock -
                                    quantity;


                                product.updatedAt =
                                    new Date().toISOString();


                                productsStore.put(
                                    product
                                );

                            };


                        productRequest.onerror =
                            () => {

                                try {
                                    transaction.abort();
                                } catch {}
                            };

                    }

                };


            saleRequest.onerror =
                () => {

                    try {
                        transaction.abort();
                    } catch {}

                };


            transaction.oncomplete =
                () => {

                    resolve({
                        ...sale,
                        id: saleRequest.result
                    });

                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error ||
                        new Error(
                            'ثبت فروش انجام نشد.'
                        )
                    );

                };


            transaction.onabort =
                () => {

                    reject(
                        transaction.error ||
                        new Error(
                            'عملیات فروش لغو شد.'
                        )
                    );

                };

        }
    );
}


/* ============================================================
   Get All Sales
   ============================================================ */

export async function getAllSales() {

    const db =
        await openDatabase();

    const transaction =
        db.transaction(
            STORE_SALES,
            'readonly'
        );

    const store =
        transaction.objectStore(
            STORE_SALES
        );

    return requestToPromise(
        store.getAll()
    );
}


/* ============================================================
   Get Sale Items
   ============================================================ */

export async function getSaleItems(
    saleId
) {

    const db =
        await openDatabase();

    const transaction =
        db.transaction(
            STORE_SALE_ITEMS,
            'readonly'
        );

    const store =
        transaction.objectStore(
            STORE_SALE_ITEMS
        );

    const index =
        store.index(
            'saleId'
        );

    return requestToPromise(
        index.getAll(
            saleId
        )
    );
}


/* ============================================================
   Backup
   ============================================================ */

export async function getProductsForBackup() {

    const products =
        await getAllProducts();

    return {

        type:
            'SupermarketPOS',

        version:
            1,

        exportedAt:
            new Date().toISOString(),

        products

    };
}


/* ============================================================
   Restore / Merge
   ============================================================ */

export async function restoreProductsMerge(
    products
) {

    if (
        !Array.isArray(products)
    ) {

        throw new Error(
            'Invalid products'
        );
    }

    const db =
        await openDatabase();

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    STORE_PRODUCTS,
                    'readwrite'
                );

            const store =
                transaction.objectStore(
                    STORE_PRODUCTS
                );

            const index =
                store.index(
                    'barcode'
                );


            products.forEach(
                product => {

                    if (
                        !product ||
                        !product.barcode
                    ) {
                        return;
                    }


                    const barcode =
                        String(
                            product.barcode
                        ).trim();


                    const request =
                        index.get(
                            barcode
                        );


                    request.onsuccess =
                        () => {

                            const existing =
                                request.result;


                            const cleanProduct = {

                                barcode,

                                name:
                                    String(
                                        product.name || ''
                                    ).trim(),

                                category:
                                    String(
                                        product.category || ''
                                    ).trim(),

                                salePrice:
                                    Number(
                                        product.salePrice
                                    ) || 0,

                                stock:
                                    Number(
                                        product.stock
                                    ) || 0,

                                createdAt:
                                    product.createdAt ||
                                    new Date().toISOString(),

                                updatedAt:
                                    new Date().toISOString()

                            };


                            if (existing) {

                                cleanProduct.id =
                                    existing.id;

                            }


                            store.put(
                                cleanProduct
                            );

                        };

                }
            );


            transaction.oncomplete =
                () => {

                    resolve(true);

                };


            transaction.onerror =
                () => {

                    reject(
                        transaction.error
                    );

                };

        }
    );
}
