# 🚀 Customer & Vendor Management CRUD Module (Days 15–22)

Welcome to the **Customer & Vendor Management CRUD Module (Days 15–22)** for the **HisabDo Financial Management Application**. This module delivers a complete full-stack dual-party financial ledger system for managing both **Customer Credit Accounts (Receivables / Udhar)** and **Vendor / Supplier Accounts (Payables / Wasooli & Adaigi)**.

---

## 📋 Comprehensive Feature Breakdown

### 1. Database Models & Persistence Layer (Days 15–16)
- **Customer Model (`src/models/Customer.js`)**: Name, Pakistani phone (`+923xxxxxxxxx`), email, address, city, category (Retail, Wholesale, Distributor, VIP), credit limit, net balance, and payment terms.
- **Vendor Model (`src/models/Vendor.js`)**: Contact name, company/shop name, phone, email, address, city, category (Raw Material, Finished Goods, Packaging, Logistics), bank details (Bank name, Account title, IBAN), and payable balance.
- **Transaction Model (`src/models/Transaction.js`)**: Party type (`Customer` / `Vendor`), directional transaction types (`GAVE_CREDIT`, `GOT_PAYMENT`, `PURCHASE_BILL`, `PAID_PAYMENT`), amounts, dates, payment methods, bill numbers, and running balance tracking.
- **Resilient Store (`src/lib/db-store.js`)**: In-memory and Mongoose persistent database engine with initial seeds for Pakistani merchants and suppliers.

### 2. Complete CRUD Views & Profile Modals (Days 17–18)
- **Customer Management Workspace (`src/app/dashboard/customers/page.jsx`)**: Master-detail two-column directory, search and status filters (*You Will Get*, *You Give*, *Settled*), credit limits, and full transaction history.
- **Vendor / Supplier Management Workspace (`src/app/dashboard/vendors/page.jsx`)**: Supplier directory, purchase bill tracking, bank transfer details, and filter tabs (*Payables*, *Settled*, *Advance Paid*).
- **Interactive Modals**:
  - `AddCustomerModal.jsx`, `EditCustomerModal.jsx`, `DeleteCustomerModal.jsx`
  - `AddVendorModal.jsx`, `EditVendorModal.jsx`, `DeleteVendorModal.jsx`

### 3. Transaction Entry Connections & Running Balances (Days 19–20)
- **Customer Ledger (`AddCustomerTransactionModal.jsx`)**:
  - `🔴 You Gave (Udhar / Credit)`: Increases customer receivable.
  - `🟢 You Got (Wasooli / Payment)`: Decreases customer receivable.
- **Vendor Ledger (`AddVendorTransactionModal.jsx`)**:
  - `📦 Purchase Bill (Payable +)`: Increases payable dues to supplier.
  - `💸 Paid to Supplier (Adaigi -)`: Decreases payable dues to supplier.
- **Chronological Recalculation**: Running balance is automatically re-computed on any addition, update, or deletion.

### 4. Validations, Statements & Automated Testing (Days 21–22)
- **Zod Schema Engine**: Enforces valid Pakistani telecommunication regex (`/^(?:\+92|92|0)?3[0-9]{9}$/`), strictly positive numbers, and returns standardized 400 Bad Request error payloads.
- **WhatsApp Dues & Payment Voucher Generator (`WhatsAppReminderModal.jsx`)**: Pre-filled friendly, overdue, and formal statements in Urdu & English with 1-click WhatsApp Web launch.
- **Official Ledger Statements (`StatementModal.jsx`)**: Verified merchant statement preview and CSV data exporter.
- **Automated Test Suite (`test-customer-vendor-crud.js`)**: Unit and integration tests covering validations, balance math, and cascade deletions.

---

## 🏃 Quick Start Guide

### 1. Install Dependencies
```bash
cd "Customer & Vendor Management CRUD"
npm install
```

### 2. Run Automated Test Suite
```bash
npm test
# or
node test-customer-vendor-crud.js
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to explore the full Customer and Vendor CRUD workspaces.

---

## 📁 Directory Structure

```text
Customer & Vendor Management CRUD/
├── package.json
├── next.config.js
├── test-customer-vendor-crud.js
├── README.md
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── customers/          # Customer GET, POST, PUT, DELETE, Transactions
    │   │   ├── vendors/            # Vendor GET, POST, PUT, DELETE, Transactions
    │   │   ├── transactions/       # Transaction PUT, DELETE
    │   │   ├── stats/              # Overall Financial Stats
    │   │   └── seed/               # Demo Merchant Seeder
    │   ├── dashboard/
    │   │   ├── layout.jsx
    │   │   ├── page.jsx            # Financial Overview
    │   │   ├── customers/page.jsx  # Customer Workspace
    │   │   └── vendors/page.jsx    # Vendor Workspace
    │   ├── globals.css
    │   ├── layout.jsx
    │   └── page.jsx
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── Sidebar.jsx
    │   ├── ui/                     # Button, Input, Modal, Select, Table, Badge, Card, Alerts
    │   ├── customers/              # Add, Edit, Delete Customer Modals
    │   ├── vendors/                # Add, Edit, Delete Vendor Modals
    │   ├── transactions/           # Add Customer Tx, Add Vendor Tx, Edit Tx Modals
    │   └── statements/             # WhatsApp Reminder & Printable Statement Modals
    ├── context/
    │   └── AuthContext.jsx
    ├── lib/
    │   ├── db.js
    │   ├── db-store.js
    │   └── validations/            # Zod Customer, Vendor, and Transaction Schemas
    └── models/
        ├── Customer.js
        ├── Vendor.js
        └── Transaction.js
```
