## Transaction Form – Date Handling & Validation

### 1. Overview

Implemented date formatting, calendar validation, date-range restrictions, confirmation warnings, and service-side validation for the shared `TransactionModal` component.

### 2. Key Changes

- Replaced the native date input with a custom text input.
- Implemented automatic dash insertion after the second and fourth digits.
- Added support for numeric-only input and pasted dates.
- Standardized the visible date format to `dd-mm-yyyy`.
- Added Zod schema validation using `refine()` and `transform()`.
- Added utility functions:
  - `isValidDateString` – validates actual calendar dates, including leap years.
  - `formatVisibleDate` – converts ISO dates into `dd-mm-yyyy`.
  - `toISODate` – converts visible dates into `yyyy-mm-dd`.
  - `dateWithinLimits` – validates date restrictions and confirmation warnings.
- Added confirmation prompts before saving dates that are more than 90 days in the past or more than one year in the future.
- Added service-side date validation in `hisabdoService.ts` for both `addIncome` and `addExpense`.
- Added descriptive error handling through the existing error banner.

### 3. Date Validation Rules

| Validation | Expected Behavior |
|---|---|
| Date format | Must follow `dd-mm-yyyy`. |
| Invalid dates | Rejects impossible calendar dates. |
| Leap years | Accepts valid leap-year dates and rejects invalid ones. |
| Past date limit | Rejects dates older than five years. |
| Future date limit | Rejects dates more than three years ahead. |
| Past confirmation | Requires confirmation for dates more than 90 days in the past. |
| Future confirmation | Requires confirmation for dates more than one year ahead. |
| Service validation | Applies date validation independently of the UI. |

### 4. Backward Compatibility

- Preserved existing component props and usages.
- Kept original props optional.
- Maintained existing transaction creation behavior.
- Preserved default date initialization.
- No changes to API contracts or database schema.

### 5. Verification Results

| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | Passed |
| Lint (`npm run lint`) | Completed successfully; automatic Next.js TypeScript setup notice appeared. |
| Manual date validation | Valid and invalid dates tested. |
| Date range validation | Confirmation and rejection behavior tested. |
| Service validation | Invalid dates correctly throw descriptive errors. |
| Existing form usages | Dashboard and Customers pages tested without observed regressions. |

### 6. Files Modified

- `src/components/TransactionModal.tsx`
- `src/services/hisabdoService.ts`

### 7. Scope

Changes are limited to the existing shared transaction form and required service-side validation. No additional transaction form or database changes were introduced.