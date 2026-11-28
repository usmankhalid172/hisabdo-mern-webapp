import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "jspdf" || specifier === "jspdf-autotable" || specifier === "@/lib/supabase/client") {
      return {
        shortCircuit: true,
        url: `mock:${specifier}`,
      };
    }
    if (specifier.startsWith("@/")) {
      const basePath = path.resolve(process.cwd(), "src", specifier.slice(2));
      const candidates = [
        basePath,
        `${basePath}.ts`,
        `${basePath}.tsx`,
        `${basePath}.js`,
        path.join(basePath, "index.ts"),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return {
            shortCircuit: true,
            url: pathToFileURL(candidate).href,
          };
        }
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === "mock:jspdf") {
      return {
        shortCircuit: true,
        format: "module",
        source: "export default class jsPDF {}",
      };
    }
    if (url === "mock:jspdf-autotable") {
      return {
        shortCircuit: true,
        format: "module",
        source: "export default function autoTable() {}",
      };
    }
    if (url === "mock:@/lib/supabase/client") {
      return {
        shortCircuit: true,
        format: "module",
        source: `export function createClient() {
          return {
            from() {
              const chain = {
                select() { return chain; },
                insert() { return chain; },
                update() { return chain; },
                eq() { return chain; },
                is() { return chain; },
                order() { return Promise.resolve({ data: null, error: new Error("Mocked offline Supabase") }); },
                single() { return Promise.resolve({ data: null, error: new Error("Mocked offline Supabase") }); },
                maybeSingle() { return Promise.resolve({ data: null, error: new Error("Mocked offline Supabase") }); },
              };
              return chain;
            }
          };
        }`,
      };
    }
    return nextLoad(url, context);
  },
});

const {
  BASE_CURRENCY,
  SUPPORTED_CURRENCIES,
  clearExchangeRateCache,
  configureExchangeRateProvider,
  convertFromPKR,
  convertToPKR,
  getExchangeRates,
  getUserCurrency,
  resetExchangeRateProvider,
} = await import("../src/services/currencyService.ts");
const { hisabDoService } = await import("../src/services/hisabdoService.ts");

function installMockStorage() {
  const store = new Map();
  const mockLocalStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };

  globalThis.window = { localStorage: mockLocalStorage };
  globalThis.localStorage = mockLocalStorage;
  return store;
}

function makeRatesPayload(overrides = {}) {
  return {
    result: "success",
    base_code: "PKR",
    time_next_update_unix: Math.floor(Date.now() / 1000) + 3600,
    rates: {
      PKR: 1,
      USD: 0.0036,
      AED: 0.0132,
      SAR: 0.0135,
      INR: 0.305,
      EUR: 0.0033,
      GBP: 0.0028,
    },
    ...overrides,
  };
}

test("================ CENTRALIZED CURRENCY CONVERSION TESTS ================", async (t) => {
  await t.test("1. getUserCurrency defaults to PKR and validates Settings storage", () => {
    installMockStorage();
    assert.equal(getUserCurrency(), BASE_CURRENCY);

    localStorage.setItem("hisabdo_curr", "USD");
    assert.equal(getUserCurrency(), "USD");

    localStorage.setItem("hisabdo_curr", "INVALID_CODE");
    assert.equal(getUserCurrency(), "PKR");
  });

  await t.test("2. convertFromPKR and convertToPKR handle PKR, null, undefined, and invalid inputs", async () => {
    installMockStorage();
    clearExchangeRateCache();
    let fetchCount = 0;
    configureExchangeRateProvider({
      name: "Mock FX",
      async fetchRates() {
        fetchCount += 1;
        return makeRatesPayload();
      },
    });

    assert.equal(await convertFromPKR(7000, "PKR"), 7000);
    assert.equal(await convertToPKR(7000, "PKR"), 7000);
    assert.equal(fetchCount, 0, "PKR conversions must not fetch external rates");

    assert.equal(await convertFromPKR(null, "USD"), 0);
    assert.equal(await convertFromPKR(undefined, "USD"), 0);
    assert.equal(await convertFromPKR("not-a-number", "USD"), 0);
    assert.equal(await convertToPKR(null, "USD"), 0);
    assert.equal(await convertToPKR(undefined, "USD"), 0);
    assert.equal(await convertToPKR("invalid", "USD"), 0);
  });

  await t.test("3. Exchange-rate caching respects time_next_update_unix and avoids repeated calls", async () => {
    installMockStorage();
    clearExchangeRateCache();
    let fetchCount = 0;
    configureExchangeRateProvider({
      name: "Mock FX",
      async fetchRates() {
        fetchCount += 1;
        return makeRatesPayload();
      },
    });

    await Promise.all([
      getExchangeRates(),
      getExchangeRates(),
      convertFromPKR(7000, "USD"),
    ]);
    assert.equal(fetchCount, 1, "Concurrent and cached requests should hit provider only once");

    // Simulate expired cache
    const cached = JSON.parse(localStorage.getItem("hisabdo_fx_rates_v1"));
    cached.nextUpdateAt = Date.now() - 1000;
    localStorage.setItem("hisabdo_fx_rates_v1", JSON.stringify(cached));
    // Clear in-memory cache by re-configuring or calling after expiry
    configureExchangeRateProvider({
      name: "Mock FX Refresh",
      async fetchRates() {
        fetchCount += 1;
        return makeRatesPayload();
      },
    });
    await getExchangeRates();
    assert.equal(fetchCount, 2, "Expired cache should trigger refresh");
  });

  await t.test("4. Invalid or unavailable provider throws clear error and does not save corrupt data", async () => {
    installMockStorage();
    clearExchangeRateCache();
    localStorage.setItem("hisabdo_curr", "USD");

    configureExchangeRateProvider({
      name: "Broken FX",
      async fetchRates() {
        throw new Error("Network timeout");
      },
    });

    await assert.rejects(
      () =>
        hisabDoService.addIncome("guest", {
          amount: 25,
          category_id: "Sales",
          income_date: "2026-11-25",
          description: "Should fail safely",
          payment_method: "cash",
        }),
      /Currency conversion unavailable/
    );
    assert.equal(localStorage.getItem("hisabdo_guest_incomes"), null);

    // Missing required currency rate in payload
    configureExchangeRateProvider({
      name: "Incomplete FX",
      async fetchRates() {
        const payload = makeRatesPayload();
        delete payload.rates.GBP;
        return payload;
      },
    });

    await assert.rejects(
      () => convertFromPKR(1000, "GBP"),
      /missing a valid positive rate for GBP/
    );
  });

  await t.test("5. Full QA workflow (Tests A-G): PKR storage, USD display/add/edit, accounts, totals & no double conversion", async () => {
    installMockStorage();
    clearExchangeRateCache();
    configureExchangeRateProvider({
      name: "Mock FX",
      async fetchRates() {
        return makeRatesPayload();
      },
    });

    // Test A: Default PKR - add Rs. 7,000
    localStorage.setItem("hisabdo_curr", "PKR");
    await hisabDoService.addIncome("guest", {
      amount: 7000,
      category_id: "Sales",
      income_date: "2026-11-25",
      description: "Test A Income",
      payment_method: "cash",
    });

    const rawAfterA = JSON.parse(localStorage.getItem("hisabdo_guest_incomes"));
    assert.equal(rawAfterA[0].amount, 7000);
    const fetchedA = await hisabDoService.getIncomes("guest");
    assert.equal(fetchedA[0].amount, 7000);

    // Test B: Change to USD - retrieve Rs. 7,000 -> converted, DB remains 7,000 PKR
    localStorage.setItem("hisabdo_curr", "USD");
    const fetchedB = await hisabDoService.getIncomes("guest");
    assert.equal(fetchedB[0].amount, 25.2); // 7000 * 0.0036 = 25.20
    const rawAfterB = JSON.parse(localStorage.getItem("hisabdo_guest_incomes"));
    assert.equal(rawAfterB[0].amount, 7000);

    // Test C: Add transaction in USD ($25) -> saved as PKR (~6944.44), retrieved as ~$25
    await hisabDoService.addIncome("guest", {
      amount: 25,
      category_id: "Sales",
      income_date: "2026-11-25",
      description: "Test C USD Income",
      payment_method: "cash",
    });
    const rawAfterC = JSON.parse(localStorage.getItem("hisabdo_guest_incomes"));
    assert.equal(rawAfterC[0].amount, 6944.44); // 25 / 0.0036 = 6944.44
    const fetchedC = await hisabDoService.getIncomes("guest");
    assert.equal(fetchedC[0].amount, 25); // 6944.44 * 0.0036 = 25.00

    // Test D: Change back to PKR -> original PKR values display accurately
    localStorage.setItem("hisabdo_curr", "PKR");
    const fetchedD = await hisabDoService.getIncomes("guest");
    assert.equal(fetchedD[0].amount, 6944.44);
    assert.equal(fetchedD[1].amount, 7000);

    // Test E: Edit existing transaction while USD is selected -> no double conversion
    localStorage.setItem("hisabdo_curr", "USD");
    const targetId = fetchedD[1].id;
    await hisabDoService.updateIncome("guest", targetId, { amount: 50 });
    const rawAfterE = JSON.parse(localStorage.getItem("hisabdo_guest_incomes"));
    const editedRaw = rawAfterE.find((i) => i.id === targetId);
    assert.equal(editedRaw.amount, 13888.89); // 50 / 0.0036 = 13888.89 PKR
    const fetchedE = await hisabDoService.getIncomes("guest");
    const editedDisplay = fetchedE.find((i) => i.id === targetId);
    assert.equal(editedDisplay.amount, 50);

    // Test F & G: Demo account & Customer/Expense/Ledger/Dashboard totals consistency
    const demoUserId = "demo-user-1";
    localStorage.setItem("hisabdo_curr", "USD");
    const cust = await hisabDoService.addCustomer(demoUserId, {
      name: "Ali Traders",
      phone: "+923001234567",
      opening_balance: 10, // $10 USD
      currency: "PKR",
    });
    await hisabDoService.addIncome(demoUserId, {
      amount: 20, // $20 USD
      customer_id: cust.id,
      category_id: "Sales",
      income_date: "2026-11-25",
      description: "Credit sale",
      payment_method: "cash",
    });
    await hisabDoService.addExpense(demoUserId, {
      amount: 5, // $5 USD
      customer_id: cust.id,
      category_id: "Supplies",
      expense_date: "2026-11-25",
      description: "Return",
      payment_method: "cash",
    });
    await hisabDoService.addLedgerTransaction(demoUserId, {
      customerId: cust.id,
      amount: 5, // $5 USD
      type: "received",
      category: "Cash",
      date: "2026-11-25",
      note: "Payment",
    });

    const timeline = await hisabDoService.getCustomerLedgerTimeline(demoUserId, cust.id);
    // Opening 10 + Purchase 20 - Expense 5 - Payment Received 5 = 20 USD
    assert.equal(timeline.summary.netBalance, 20);
    assert.equal(timeline.summary.totalPurchases, 20);
    assert.equal(timeline.summary.totalPaymentsReceived, 5);

    const metrics = await hisabDoService.getDashboardMetrics(demoUserId);
    assert.equal(metrics.totalReceivable, 20);
    assert.equal(metrics.monthlyIncome, 20);
    assert.equal(metrics.monthlyExpenses, 5);
    assert.equal(metrics.cashFlowProfit, 15);
    assert.equal(metrics.totalCustomers, 1);
    assert.equal(metrics.totalTransactions, 3);

    // Verify Demo account raw localStorage stayed in PKR
    const rawDemoCusts = JSON.parse(localStorage.getItem("hisabdo_demo-user-1_customers"));
    assert.equal(rawDemoCusts[0].opening_balance, 2777.78); // 10 / 0.0036

    // Verify all 7 settings currencies are supported
    assert.deepEqual(SUPPORTED_CURRENCIES, ["PKR", "USD", "AED", "SAR", "INR", "EUR", "GBP"]);

    resetExchangeRateProvider();
  });
});
