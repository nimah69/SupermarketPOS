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

function normalizeAndValidateProduct(product) {
    if (!product || typeof product !== 'object') {
        throw new Error('اطلاعات کالا نامعتبر است.');
    }

    const barcode = String(product.barcode ?? '').trim();
    const name = String(product.name ?? '').trim();
    const category = String(product.category ?? '').trim();
    // Reject missing values before numeric conversion: Number(null) and
    // Number('') both become 0 and could otherwise silently accept bad input.
    if (
        product.salePrice === null ||
        product.salePrice === undefined ||
        String(product.salePrice).trim() === ''
    ) {
        throw new Error('قیمت فروش الزامی است.');
    }
    if (
        product.stock === null ||
        product.stock === undefined ||
        String(product.stock).trim() === ''
    ) {
        throw new Error('موجودی الزامی است.');
    }

    const salePrice = Number(product.salePrice);
    const stock = Number(product.stock);

    if (!barcode) {
        throw new Error('بارکد کالا الزامی است.');
    }
    if (!name) {
        throw new Error('نام کالا الزامی است.');
    }
    if (!Number.isFinite(salePrice) || salePrice < 0) {
        throw new Error('قیمت فروش باید عددی معتبر و غیرمنفی باشد.');
    }
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
        throw new Error('موجودی باید عدد صحیح و غیرمنفی باشد.');
    }

    return {
        ...product,
        barcode,
        name,
        category,
        salePrice,
        stock
    };
}

export async function addProduct(product) {
    const cleanProduct = normalizeAndValidateProduct(product);
    const db = await openDatabase();
    const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
    const store = transaction.objectStore(STORE_PRODUCTS);
    const request = store.add(cleanProduct);
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

export async function updateProduct(product) {
    if (!product || product.id === undefined || product.id === null) {
        throw new Error('شناسه کالا نامعتبر است.');
    }

    const cleanProduct = normalizeAndValidateProduct(product);
    const db = await openDatabase();
    const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
    const store = transaction.objectStore(STORE_PRODUCTS);
    const request = store.put(cleanProduct);
    return requestToPromise(request);
}


/* ============================================================
   Delete Product
   ============================================================ */

export async function deleteProduct(id) {
    if (id === undefined || id === null) {
        throw new Error('شناسه کالا نامعتبر است.');
    }

    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
        const store = transaction.objectStore(STORE_PRODUCTS);
        let failure = null;

        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const product = getRequest.result;

            if (!product) {
                failure = new Error('کالا پیدا نشد.');
                failure.name = 'ProductNotFoundError';
                transaction.abort();
                return;
            }

            const stock = Number(product.stock);
            // Only allow deletion when stock is explicitly a valid zero.
            // Missing, blank, fractional, negative, or positive stock must be reviewed first.
            if (
                product.stock === null ||
                product.stock === undefined ||
                String(product.stock).trim() === '' ||
                !Number.isFinite(stock) ||
                stock !== 0
            ) {
                failure = new Error('برای حذف، ابتدا موجودی معتبر کالا را صفر کنید.');
                failure.name = 'ProductHasStockError';
                transaction.abort();
                return;
            }

            store.delete(id);
        };

        getRequest.onerror = () => {
            failure = getRequest.error || new Error('خواندن کالا برای حذف ناموفق بود.');
            try { transaction.abort(); } catch {}
        };

        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(failure || transaction.error || new Error('حذف کالا انجام نشد.'));
        transaction.onabort = () => reject(failure || transaction.error || new Error('حذف کالا لغو شد.'));
    });
}


/* ============================================================
   Create Sale
   ============================================================ */

export async function createSale(
    sale,
    items
) {

    if (!sale || typeof sale !== 'object' || !Array.isArray(items) || items.length === 0) {
        throw new Error('اطلاعات فروش نامعتبر است.');
    }

    // Validate and normalize all line items before opening a transaction.
    // This prevents malformed prices/quantities from being written and avoids
    // duplicate product rows causing an incorrect stock decrement.
    const seenProductIds = new Set();
    const normalizedItems = items.map((item) => {
        if (!item || typeof item !== 'object') {
            throw new Error('اطلاعات یکی از اقلام فروش نامعتبر است.');
        }

        const productId = item.productId;
        const quantity = Number(item.quantity);

        if (
            item.salePrice === null ||
            item.salePrice === undefined ||
            String(item.salePrice).trim() === ''
        ) {
            throw new Error('قیمت ثبت‌شده برای یکی از اقلام فروش الزامی است.');
        }
        const salePrice = Number(item.salePrice);

        if (!Number.isInteger(productId) || productId <= 0 || seenProductIds.has(productId)) {
            throw new Error('شناسه کالا نامعتبر یا تکراری است.');
        }
        seenProductIds.add(productId);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error('تعداد هر کالا باید عدد صحیح و بیشتر از صفر باشد.');
        }
        if (!Number.isFinite(salePrice) || salePrice < 0) {
            throw new Error('قیمت ثبت‌شده برای یکی از کالاها نامعتبر است.');
        }

        const lineTotal = quantity * salePrice;
        if (!Number.isFinite(lineTotal)) {
            throw new Error('مبلغ یکی از اقلام فروش بیش از حد مجاز است.');
        }

        return {
            ...item,
            productId,
            quantity,
            salePrice,
            lineTotal
        };
    });

    const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    if (!Number.isSafeInteger(totalQuantity) || !Number.isFinite(totalPrice)) {
        throw new Error('جمع تعداد یا مبلغ فروش نامعتبر است.');
    }

    const normalizedSale = {
        ...sale,
        totalQuantity,
        totalPrice,
        timestamp: sale.timestamp || new Date().toISOString()
    };

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
                salesStore.add(normalizedSale);


            saleRequest.onsuccess =
                () => {

                    const saleId =
                        saleRequest.result;


                    for (
                        const item of normalizedItems
                    ) {

                        const quantity = item.quantity;


                        const itemRequest =
                            saleItemsStore.add({

                                saleId,

                                productId:
                                    item.productId,

                                barcode:
                                    item.barcode,

                                name:
                                    item.name,

                                salePrice: item.salePrice,

                                quantity,

                                lineTotal: item.lineTotal
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


                                const currentStock = Number(product.stock);

                                if (
                                    !Number.isInteger(currentStock) ||
                                    currentStock < quantity
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
                        ...normalizedSale,
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

export async function restoreProductsMerge(products) {
    if (!Array.isArray(products)) {
        throw new Error('فایل پشتیبان معتبر نیست؛ فهرست کالاها پیدا نشد.');
    }

    // Validate the entire backup before opening a write transaction. One bad
    // record must not result in a partial or silently corrupted restore.
    const seenBarcodes = new Set();
    const normalizedProducts = products.map((product) => {
        const clean = normalizeAndValidateProduct(product);

        if (seenBarcodes.has(clean.barcode)) {
            throw new Error('فایل پشتیبان دارای بارکد تکراری است: ' + clean.barcode);
        }
        seenBarcodes.add(clean.barcode);

        return {
            barcode: clean.barcode,
            name: clean.name,
            category: clean.category,
            salePrice: clean.salePrice,
            stock: clean.stock,
            createdAt: clean.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    });

    const db = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
        const store = transaction.objectStore(STORE_PRODUCTS);
        const index = store.index('barcode');
        let added = 0;
        let skippedExisting = 0;

        normalizedProducts.forEach((product) => {
            const request = index.get(product.barcode);

            request.onsuccess = () => {
                // Merge is deliberately additive: never overwrite current
                // names, prices, or live stock with potentially old backup data.
                if (request.result) {
                    skippedExisting += 1;
                    return;
                }

                store.add(product);
                added += 1;
            };
        });

        transaction.oncomplete = () => resolve({
            added,
            skippedExisting
        });

        transaction.onerror = () => reject(
            transaction.error || new Error('بازیابی فایل پشتیبان انجام نشد.')
        );

        transaction.onabort = () => reject(
            transaction.error || new Error('بازیابی فایل پشتیبان لغو شد.')
        );
    });
}
