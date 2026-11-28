# Implementation Report: Centralized Currency Conversion

## 1. Files Inspected

- `SettingsContext.tsx`
- `AuthContext.tsx`
- `settings/page.tsx`
- `layout.tsx`
- `dashboard/page.tsx`
- `transactions/page.tsx`
- `customers/page.tsx`
- `customers/[id]/page.tsx`
- `reports/page.tsx`
- `cashbook/page.jsx`
- `hisabdoService.ts`
- `mobileDataParityService.ts`
- `dashboardService.js`
- `transactionService.js`
- `customerService.js`

## 2. Files Created

- **`currencyService.ts`** — Centralized currency helpers, exchange-rate fetching, validation, caching, and configurable provider support.
- **`test-currency-conversion.mjs`** — Automated unit and workflow tests for `currencyService` and `hisabDoService` (Tests A–G).

## 3. Files Modified

- **`hisabdoService.ts`** — Separated raw PKR reads (`getRaw*` and `computeRawCustomerLedgerTimeline`) from converted display reads. Converts entered foreign-currency amounts to PKR before saving.
- **`dashboardService.js`** — Integrated `convertFromPKR` into `getSummary`.
- **`transactionService.js`** — Integrated `convertFromPKR` into `getAll` and `convertToPKR` into `create` and `update`.
- **`customerService.js`** — Integrated `convertFromPKR` into `getAll` and `getById`, and `convertToPKR` into `create` and `update`.
- **`settings/page.tsx`** — Added the required ExchangeRate-API attribution link beneath the currency selector.
- **`layout.tsx`** — Added the ExchangeRate-API attribution link in the dashboard `<main>` footer.
- **`dashboard/page.tsx`** — Replaced the hardcoded `(PKR)` label with the dynamically selected currency label `({currency})`.

## 4. Currency Helper Functions Implemented

Implemented in `currencyService.ts`:

- **`getUserCurrency()`** — Reads `hisabdo_curr` from `localStorage`, shared across Guest, Demo, and Authenticated accounts. Defaults to `PKR` if the stored value is missing or invalid.
- **`convertFromPKR(amount, targetCurrency?)`** — Converts PKR amounts into the selected currency. Handles null, undefined, and non-finite values, preserves PKR values without conversion, and rounds converted values to two decimal places using `roundCurrencyAmount`.
- **`convertToPKR(amount, sourceCurrency?)`** — Converts user-entered amounts from the selected currency into PKR before persistence. Preserves amounts unchanged when PKR is selected.
- **`getExchangeRates()` / `getExchangeRate()`** — Fetches and provides validated exchange rates.
- **`configureExchangeRateProvider()` / `resetExchangeRateProvider()`** — Supports configurable exchange-rate provider setup and reset.
- **`clearExchangeRateCache()`** — Clears cached exchange-rate data.

### Exchange-Rate Validation and Caching

- Uses in-memory and `localStorage` caching under `hisabdo_fx_rates_v1`.
- Cache validity is determined using `time_next_update_unix`.
- Deduplicates concurrent requests using an in-flight request mechanism.
- Validates the provider response:
  - `result === "success"`
  - `base_code === "PKR"`
  - All seven supported currency rates are positive, finite numbers.
- Throws explicit errors when the provider is unavailable or returns invalid data.

## 5. Retrieval Services Integrated

### Primary `hisabDoService`

The following methods retrieve raw PKR values and convert them once at the service boundary:

- `getCustomers`
- `getIncomes`
- `getExpenses`
- `getLedgerTransactions`
- `getCustomerLedgerTimeline`
- `getDashboardMetrics`

Raw retrieval helpers prevent double conversion in nested operations, particularly `getCustomerLedgerTimeline` and `getDashboardMetrics`.

### Secondary Services

- `dashboardService.getSummary`
- `transactionService.getAll`
- `customerService.getAll`
- `customerService.getById`

## 6. Saving and Updating Services Integrated

The following methods convert entered amounts into PKR before writing to Supabase or `localStorage`:

### Primary `hisabDoService`

- `addCustomer`
- `updateCustomer`
- `addIncome`
- `updateIncome`
- `addExpense`
- `updateExpense`
- `addLedgerTransaction`
- `updateLedgerTransaction`

### Secondary Services

- `transactionService.create`
- `transactionService.update`
- `customerService.create`
- `customerService.update`

## 7. Exchange-Rate Source and Attribution

- **Provider:** ExchangeRate-API Open Access
- **Endpoint:** `https://open.er-api.com/v6/latest/PKR`
- **Configuration:** Supports `NEXT_PUBLIC_EXCHANGE_RATE_API_URL` or `configureExchangeRateProvider`.
- **Attribution:** Added the required ExchangeRate-API attribution link in:
  - `settings/page.tsx`
  - `layout.tsx`

## 8. Test Cases and Results

### Currency Conversion Tests

Command:

`node --experimental-strip-types scripts/test-currency-conversion.mjs`

<badge color="success">6/6 passed</badge>

1. `getUserCurrency` defaults to PKR and validates the `hisabdo_curr` setting.
2. `convertFromPKR` and `convertToPKR` handle PKR passthrough, null, undefined, and invalid inputs without unnecessary requests.
3. Exchange-rate caching respects `time_next_update_unix` and deduplicates concurrent requests.
4. An unavailable or invalid provider produces a clear error and aborts saving before writing to `localStorage`.
5. PKR add/read workflow preserves the stored value of `7000`.
6. Full currency workflow verifies USD display, saving, editing, switching back to PKR, and Demo account calculations without double conversion.

### Full QA Workflow Details

- PKR amount `7000` displays as `7000` when PKR is selected.
- Switching to USD displays the converted amount as `$25.20`, while storage retains `7000` PKR.
- Adding `$25` in USD stores approximately `6944.44` PKR and displays `$25`.
- Editing the amount to `$50` in USD stores approximately `13888.89` PKR and displays `$50`, without double conversion.
- Switching back to PKR displays the stored PKR amount.
- Demo account (`demo-user-1`) workflow verifies:
  - Receivable: `20`
  - Income: `20`
  - Expense: `5`
  - Profit: `15`
  - A `$10` opening balance stores approximately `2777.78` PKR.

Tests use mocked `localStorage`, an offline Supabase client, and a mock exchange-rate provider returning PKR-based rates.

### Existing Test Suite

Command:

`npm test`

<badge color="danger">6/8 checks failed</badge>

The pre-existing standardized forms test suite reported six failures unrelated to currency conversion, including the assertion:

`Dashboard page must import and use both AddIncomeForm and AddExpenseForm`.

### Build Verification

Command:

`npm run build`

<badge color="warning">Not executed</badge>

The build could not run because `node_modules` is not installed in the workspace root. Next.js was unavailable:

`'next' is not recognized as an internal or external command`.

## 9. Confirmation: Database Values Remain in PKR

Database and local cache values remain in PKR.

- Supabase insert/update payloads store monetary amounts in PKR.
- Local storage caches retain PKR values:
  - `hisabdo_<userId>_customers`
  - `hisabdo_<userId>_incomes`
  - `hisabdo_<userId>_expenses`
  - `hisabdo_<userId>_ledger_txs`
- Metadata uses:
  - `currency: "PKR"`
  - `base_currency: "PKR"`

Conversion is applied to returned display data and does not overwrite the original PKR values in Supabase or local storage.

## 10. Limitations and Remaining Issues

1. **Build and browser verification:** `node_modules` is not installed, so `npm run build` and live browser/Supabase verification could not be completed.
2. **Legacy API routes:** Legacy `/api/vendors` and `/api/customers` routes under `src/app/api/*`, which use `db-store.js`, are not integrated with `hisabDoService`.
3. **Legacy page coverage:** Since `vendors/page.jsx` and some legacy components call `/api/vendors`, `/api/customers`, and `/api/transactions` directly, those paths may still display or process raw amounts rather than converted amounts.

## 11. Final Summary

Centralized currency conversion has been implemented across the primary `hisabDoService` and the identified secondary dashboard, transaction, and customer services.

The implementation keeps database and local cache monetary values in PKR, converts amounts for the selected display currency, converts entered foreign-currency amounts back to PKR before saving, and includes centralized exchange-rate validation and caching.

The dedicated currency test suite passed all 6 tests. Full build and live browser verification remain outstanding because the required dependencies are not installed. Legacy API routes also remain outside the conversion integration scope.