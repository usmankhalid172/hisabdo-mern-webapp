# HisabDo Web Application — Analysis & Architecture Plan

## 1. Complete User Journey
1. **Landing & Onboarding:** Visitor lands on marketing pages -> Reviews features, local-first model, and target audience -> Clicks "Get Started" or "Go to App".
2. **Authentication / Local Setup:** User logs in/registers via Email/OTP, or opts for a local workspace sync.
3. **Dashboard Overview:** Views real-time summary cards: Total Receivables (Gave/Udhar), Total Payables (Got), Net Cash Flow, and Expense trends.
4. **Customer Ledger Management:** Selects or creates a customer profile -> Adds new transaction entry ("Gave Money" / "Got Money") -> Adds voice note, category, or receipt image.
5. **Expense Tracking:** Records business or personal daily expenses by category (Rent, Staff, Utilities).
6. **Reporting & Sharing:** Filters transaction history -> Generates PDF statement -> Direct export/share via WhatsApp or download.

---

## 2. Website Page List (Next.js Public Site)
* **`/` (Home):** Value proposition, hero banner, feature highlights, and app download links.
* **`/about`:** Company background, vision, and leadership profiles.
* **`/features`:** Detailed breakdown of Khata, Expense Tracker, PDF Export, Voice Entry, and Privacy features.
* **`/use-cases`:** Solutions catered to Shopkeepers, Freelancers, Small Businesses, and Personal Finance users.
* **`/pricing`:** Free tier vs Premium/Enterprise cloud sync features.
* **`/blog`:** Financial management guides and product updates.
* **`/contact`:** Support form, contact email (`hisabdo.app@gmail.com`), and help desk details.
* **`/privacy-policy` & `/terms`:** Legal compliance and local-first data protection disclosures.

---

## 3. Web Application Module List (Interactive Dashboard)
* **Auth & Security Module:** User Auth, PIN/Biometric lock, JWT/Session handling.
* **Smart Dashboard Module:** Top metric cards, monthly income vs. expense chart, quick actions.
* **Customer Ledger (Khata) Module:** Customer profile creation, Udhar/Receivable and Payable entry, balances.
* **Expense Manager Module:** Daily expense logger, custom categories (Utilities, Salary, Supplies).
* **Reports & Analytics Module:** PDF statement generator, date-range filters, voice entry parser.
* **Data Backup & Settings Module:** Local-first IndexedDB sync, cloud backup export/import (JSON/CSV), multi-currency & language toggles.

---

## 4. User Flow Diagram

```text
[ Visitor Landing Page ]
          │
          ├──> View Marketing Pages (About, Features, Pricing)
          │
          └──> [ Launch Web App Dashboard ]
                         │
                         ├──> Auth / PIN Verification
                         │
                         ├──> [ Dashboard ]
                         │       │
                         │       ├──> [ Customer Ledger Module ]
                         │       │       ├──> Add New Customer
                         │       │       ├──> Record Transaction ("Gave" / "Got")
                         │       │       └──> Generate & Share PDF Statement
                         │       │
                         │       ├──> [ Expense Manager Module ]
                         │       │       ├──> Log Daily Expense
                         │       │       └──> Filter by Category
                         │       │
                         │       └──> [ Reports & Settings ]
                         │               ├──> Export Backup (JSON/PDF)
                         │               └──> Change Currency / Language
```

## 5. Basic Next.js App Router Folder Structure

hisabdo-web/
├── src/
│   ├── app/
│   │   ├── (marketing)/           # Marketing Pages
│   │   │   ├── about/page.tsx
│   │   │   ├── features/page.tsx
│   │   │   ├── pricing/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── (dashboard)/           # Web Application Modules
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── expenses/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── types/
├── public/
├── package.json
└── README.md

## 6. Proposed Technology Stack

* **Framework:** Next.js 14+ (App Router, TypeScript)

* **Styling:** Tailwind CSS + Shadcn UI + Lucide Icons

* **Client Database (Offline-First):** Dexie.js      (IndexedDB wrapper)

* **Backend Database:** MongoDB Atlas + Mongoose

* **State Management:** Zustand / TanStack Query

* **Export Utilities:** @react-pdf/renderer

* **Voice Entry:** Web Speech API (webkitSpeechRecognition)

* **Authentication:** NextAuth.js / JWT

## 7. UI/UX Improvement Suggestions

* **Authentication:**
* **PWA Offline Mode:** Enable service workers so users can record ledger entries offline.

* **Keyboard-First Entry:** Hotkeys like Ctrl + N for fast  transactions.

* **Dual Dark/Light Theme:** Auto-detect dark mode for low-light shop environments.

* **WhatsApp Direct API Integration:** Single-click WhatsApp reminders for overdue balances (Udhar).

* **Multi-Currency Instant Toggle:** Visual currency indicators on main summary cards.

* **Smart Voice Input Visualizer:** Live visual feedback during voice-to-text input.

* **Batch Export Options:** Export all customer ledgers in a single zip file containing PDFs.

* **Interactive Calculator Widget:** Built-in drawer calculator for quick arithmetic.

