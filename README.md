# 🚀 HisabDo Web Application — Department 1 Capstone (Day 31)
## 🔐 Enterprise Authentication Flow & Session Management

**Developer:** Muhammad Hamza Arif  
**Assigned Module:** End-to-End Authentication Flow, Edge Route Protection & Session Management  
**Branch:** `feature/auth-flow-completion`  
**Upstream Target:** `main`

---

## 📌 1. Module Overview & Highlights

The Authentication Flow module delivers a robust, secure, production-ready authentication and authorization architecture for the HisabDo MERN/Next.js Web Application, aligning seamlessly with the **HisabDo Mobile App** security and user experience standards.

### ✨ Key Features Implemented:
1. **Edge-Compatible JWT Authentication:**
   * Utilizes `jose` (Web Crypto API standard) for HS256 JWT access and refresh token signing.
   * Runs natively on Next.js Edge Middleware with zero cold-start latency and zero unsupported Node runtime dependencies.
   * Rolling refresh tokens (`hisabdo_refresh_token` - 7 days) and secure access tokens (`hisabdo_auth_token` - 24 hours).

2. **Bidirectional Route Protection (`src/middleware.ts`):**
   * **Protected Routes:** Automatically intercepts unauthenticated requests to `/dashboard`, `/customers`, `/expenses`, `/reports`, `/profile`, `/settings`, `/businesses`, `/cashbook`, and `/transactions`, redirecting to `/login?redirect=<path>` while wiping stale cookies.
   * **Auth Route Interception:** Prevents logged-in merchants from seeing `/login`, `/register`, or `/forgot-password`, automatically routing them to `/dashboard`.

3. **Complete Auth API Suite (`src/app/api/auth/`):**
   * `POST /api/auth/register`: Validates payload with Zod, hashes passwords with bcrypt, checks for duplicate emails, creates user record, and issues HTTP-only auth cookies.
   * `POST /api/auth/login`: Authenticates credentials with bcrypt verification, returns JWT token, and sets secure HTTP-only cookies.
   * `POST /api/auth/logout`: Clears authentication and refresh cookies, invalidating the session.
   * `GET /api/auth/me`: Verifies active session token (via cookie or Bearer authorization header) and returns full merchant profile.
   * `PUT /api/auth/profile`: Updates merchant name, store/shop name, and contact phone number.
   * `POST /api/auth/refresh`: Re-issues fresh access tokens using the refresh token.
   * `POST /api/auth/forgot-password`: Dispatches password recovery link simulation.

4. **1-Click Evaluation Login:**
   * Includes instant 1-click test buttons on the login page for **Demo Merchant** and **Hamza Admin** for effortless evaluation and team review.

5. **Live Context & State Synchronization (`src/context/AuthContext.tsx`):**
   * Reactive `useAuth()` hook providing user state, authentication status, active store branch, profile management, and smooth login/register/logout actions.

---

## 🔑 2. Test Credentials

| Account Role | Email | Password | Shop / Business Name |
| :--- | :--- | :--- | :--- |
| **Demo Merchant** | `merchant@hisabdo.com` | `password123` | Al-Rehman General Store |
| **Admin Owner** | `hamza.merchant@hisabdo.com` | `password123` | Hamza Traders & Supplier Enterprise |
| **New Accounts** | *Self-register via `/register`* | *6+ characters* | *Customizable Store Name* |

---

## 🛠️ 3. Verification & Testing Instructions

### A. Run Automated Integration Tests:
The repository includes an end-to-end integration test script verifying all auth endpoints:
```bash
# Ensure server is running (npm run dev)
node scripts/test-auth.mjs
```
**Test Results:**
* `Demo Merchant Login (/api/auth/login)`: **PASSED**
* `Invalid Password Login Rejection (/api/auth/login)`: **PASSED**
* `New User Registration Flow (/api/auth/register)`: **PASSED**
* `Duplicate Email Rejection (/api/auth/register)`: **PASSED**
* `Get Authenticated User Profile (/api/auth/me)`: **PASSED**
* `Update User Profile (/api/auth/profile)`: **PASSED**
* `Forgot Password Recovery Dispatch (/api/auth/forgot-password)`: **PASSED**
* `User Logout & Cookie Invalidation (/api/auth/logout)`: **PASSED**

### B. Run TypeScript Type Check:
```bash
npx tsc --noEmit
# 0 errors
```

### C. Build Production Bundle:
```bash
npm run build
# Compiles all 29 routes with 0 errors
```

---

## 📁 4. Architecture & File Structure

```
Day 31/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # Login Page with 1-click demo login & validation
│   │   │   ├── register/page.tsx       # Merchant Registration with live matching & alerts
│   │   │   └── forgot-password/page.tsx# Password Recovery page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Sidebar with reactive user card & logout
│   │   │   ├── profile/page.tsx        # Merchant Profile & details editor
│   │   │   └── settings/page.tsx       # Application & Session Settings
│   │   └── api/
│   │       └── auth/
│   │           ├── login/route.ts      # Login endpoint
│   │           ├── register/route.ts   # Registration endpoint
│   │           ├── logout/route.ts     # Logout endpoint
│   │           ├── me/route.ts         # User session endpoint
│   │           ├── profile/route.ts    # Profile update endpoint
│   │           ├── refresh/route.ts    # Token refresh endpoint
│   │           └── forgot-password/route.ts # Recovery endpoint
│   ├── context/
│   │   └── AuthContext.tsx             # Unified Reactive Auth Context Provider
│   ├── hooks/
│   │   └── useAuth.ts                  # useAuth hook
│   ├── lib/
│   │   ├── auth-token.ts               # Edge-compliant Jose JWT verification
│   │   ├── auth.ts                     # Bcrypt hashing & token re-exports
│   │   ├── server-auth.ts              # Server-side auth helpers
│   │   ├── user-store.ts               # Resilient user persistence & seed store
│   │   └── validations/
│   │       └── auth.ts                 # Zod validation schemas
│   └── middleware.ts                   # Edge route protection & cookie handler
├── scripts/
│   └── test-auth.mjs                   # Automated E2E Auth Test Suite
├── .env.example                        # Clean environment template
└── README.md                           # Documentation
```
