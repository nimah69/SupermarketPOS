# SupermarketPOS — Project Checklist

Branch workflow: changes are made on a feature branch first. Do not merge into `main` until the checks below are reviewed.

## Phase 1 — Data and inventory safety
- [x] Review repository structure and current implementation.
- [x] Create feature branch `fix/phase-1-data-safety`.
- [x] Prevent deletion of products with positive stock.
- [x] Validate required barcode/name and non-negative price/whole-number stock in database product writes.
- [x] Avoid navigation touch handler interfering with non-navigation `data-action` controls.
- [x] Validate sale quantities/prices and calculate sale totals from line items in the database layer.
- [x] Repair the pre-existing truncated reports error handler found by automated syntax checks.
- [x] Reject duplicate product IDs within one sale to prevent incorrect stock decrement.
- [ ] Verify product deletion guard in a real browser.
- [ ] Verify product validation and duplicate-barcode behavior.
- [ ] Verify cart touch/click behavior on Android.
- [ ] Verify sale creation atomically decrements stock and reports the right totals.
- [ ] Verify malformed sale data is rejected without changing stock or sales history.
- [ ] Confirm the JavaScript syntax workflow passes on the latest commit.
- [ ] Review diff and merge only after verification.

## Phase 2 — Point-of-sale testing
- [ ] Add a test product and scan/type its barcode.
- [ ] Test duplicate and unknown barcodes.
- [ ] Test increasing/decreasing/removing cart items.
- [ ] Ensure checkout cannot exceed stock.
- [ ] Confirm stock decreases after a successful sale.
- [ ] Confirm failed sales leave stock and sales history unchanged.

## Phase 3 — Reports and backups
- [ ] Reconcile invoice total against line totals.
- [ ] Check daily and all-time sales summaries.
- [ ] Check top-selling products.
- [ ] Add a downloadable product backup.
- [ ] Validate backup files before restore and test restore/merge safely.

## Phase 4 — Complete features and usability
- [ ] Implement settings UI.
- [ ] Improve non-blocking error/status messages.
- [ ] Check Persian RTL layout on mobile.
- [ ] Improve mobile tap targets and visual hierarchy.

## Phase 5 — Release
- [ ] Run final end-to-end tests using test data.
- [ ] Verify GitHub Pages deployment.
- [ ] Write a short usage and backup guide.
- [ ] Tag/record a stable release and remaining limitations.

> Checked code changes are not the same as tested behavior. Mark a test complete only after actually running it.
