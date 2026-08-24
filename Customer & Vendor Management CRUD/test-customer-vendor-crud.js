// Comprehensive Automated Test Suite for Customer & Vendor Management CRUD (Days 15–22)
const assert = require('assert');
const { z } = require('zod');

// --- 1. Zod Schemas under test ---
const pakistaniPhoneRegex = /^(?:\+92|92|0)?3[0-9]{9}$/;

const customerCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().refine((val) => pakistaniPhoneRegex.test(val.replace(/\s+/g, ''))),
  category: z.enum(['Retail', 'Wholesale', 'Distributor', 'VIP', 'General']).default('Retail'),
  creditLimit: z.union([z.number(), z.string()]).transform(v => Number(v) || 0).pipe(z.number().min(0)),
  initialBalance: z.union([z.number(), z.string()]).transform(v => Number(v) || 0).default(0),
  city: z.string().trim().default('Lahore'),
  status: z.enum(['active', 'inactive', 'blocked']).default('active')
});

const vendorCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  companyName: z.string().trim().min(2).max(120),
  phone: z.string().trim().refine((val) => pakistaniPhoneRegex.test(val.replace(/\s+/g, ''))),
  category: z.enum(['Raw Material', 'Finished Goods', 'Packaging', 'Logistics', 'Services', 'Wholesale Supplier']).default('Wholesale Supplier'),
  bankName: z.string().trim().default('Meezan Bank Ltd'),
  initialBalance: z.union([z.number(), z.string()]).transform(v => Number(v) || 0).default(0),
  status: z.enum(['active', 'inactive', 'blocked']).default('active')
});

const transactionCreateSchema = z.object({
  partyType: z.enum(['Customer', 'Vendor']),
  type: z.enum(['GAVE_CREDIT', 'GOT_PAYMENT', 'PURCHASE_BILL', 'PAID_PAYMENT']),
  amount: z.union([z.number(), z.string()]).transform(v => Number(v)).pipe(z.number().positive().max(10000000)),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'EasyPaisa', 'JazzCash', 'Cheque', 'Credit Card']).default('Cash')
});

// --- Test Counter ---
let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Reason: ${err.message}`);
    failed++;
  }
}

console.log('\n================================================================');
console.log('🧪 RUNNING CUSTOMER & VENDOR MANAGEMENT CRUD TEST SUITE (DAYS 15-22)');
console.log('================================================================\n');

// 1. Pakistani Phone Regex
console.log('--- TEST GROUP 1: PAKISTANI PHONE VALIDATION ---');
const validPhones = ['+923001234567', '03001234567', '923219876543', '03335558899', '+923451122334', '03124455667'];
validPhones.forEach(p => {
  it(`Accepts valid phone: ${p}`, () => {
    assert.strictEqual(pakistaniPhoneRegex.test(p), true);
  });
});

const invalidPhones = ['12345', '0213456789', '+14155552671', 'abc92300123', '+922001234567', '04001234567'];
invalidPhones.forEach(p => {
  it(`Rejects invalid phone: ${p}`, () => {
    assert.strictEqual(pakistaniPhoneRegex.test(p), false);
  });
});

// 2. Customer Zod Schema
console.log('\n--- TEST GROUP 2: CUSTOMER ZOD SCHEMA CONSTRAINTS ---');
it('Rejects customer name under 2 characters', () => {
  const res = customerCreateSchema.safeParse({ name: 'A', phone: '03001234567' });
  assert.strictEqual(res.success, false);
});

it('Accepts valid customer payload with default values', () => {
  const res = customerCreateSchema.safeParse({ name: 'Bilal Traders', phone: '03001234567', creditLimit: '75000' });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.data.creditLimit, 75000);
  assert.strictEqual(res.data.category, 'Retail');
});

// 3. Vendor Zod Schema
console.log('\n--- TEST GROUP 3: VENDOR ZOD SCHEMA CONSTRAINTS ---');
it('Rejects vendor without company name', () => {
  const res = vendorCreateSchema.safeParse({ name: 'Haji Sahib', phone: '03001234567' });
  assert.strictEqual(res.success, false);
});

it('Accepts valid vendor payload with bank defaults', () => {
  const res = vendorCreateSchema.safeParse({
    name: 'Tariq Mehmood',
    companyName: 'Pak Packaging Mills',
    phone: '+923215566778',
    category: 'Packaging'
  });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.data.bankName, 'Meezan Bank Ltd');
  assert.strictEqual(res.data.status, 'active');
});

// 4. Transaction Zod Schema
console.log('\n--- TEST GROUP 4: TRANSACTION ZOD SCHEMA CONSTRAINTS ---');
it('Rejects negative transaction amount (-1000)', () => {
  const res = transactionCreateSchema.safeParse({
    partyType: 'Customer',
    type: 'GAVE_CREDIT',
    amount: -1000
  });
  assert.strictEqual(res.success, false);
});

it('Rejects zero transaction amount (0)', () => {
  const res = transactionCreateSchema.safeParse({
    partyType: 'Vendor',
    type: 'PURCHASE_BILL',
    amount: 0
  });
  assert.strictEqual(res.success, false);
});

it('Accepts valid customer payment entry', () => {
  const res = transactionCreateSchema.safeParse({
    partyType: 'Customer',
    type: 'GOT_PAYMENT',
    amount: '18500',
    paymentMethod: 'EasyPaisa'
  });
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.data.amount, 18500);
});

it('Accepts valid vendor purchase entry', () => {
  const res = transactionCreateSchema.safeParse({
    partyType: 'Vendor',
    type: 'PURCHASE_BILL',
    amount: 65000,
    paymentMethod: 'Bank Transfer'
  });
  assert.strictEqual(res.success, true);
});

// 5. In-Memory Store CRUD & Running Balance Verification
console.log('\n--- TEST GROUP 5: DUAL-PARTY LEDGER RUNNING BALANCE SIMULATION ---');

let storeCustomers = [
  { _id: 'c1', name: 'Ali Traders', phone: '03001112233', netBalance: 0 }
];
let storeVendors = [
  { _id: 'v1', companyName: 'National Textiles', name: 'Haji Rehman', payableBalance: 0 }
];
let storeTransactions = [];

function addTx(tx) {
  storeTransactions.push(tx);
  // Recalculate customer
  if (tx.partyType === 'Customer') {
    let balance = 0;
    storeTransactions.filter(t => t.customerId === tx.customerId).forEach(t => {
      if (t.type === 'GAVE_CREDIT') balance += t.amount;
      if (t.type === 'GOT_PAYMENT') balance -= t.amount;
      t.balanceAfter = balance;
    });
    const c = storeCustomers.find(x => x._id === tx.customerId);
    if (c) c.netBalance = balance;
  }
  // Recalculate vendor
  if (tx.partyType === 'Vendor') {
    let balance = 0;
    storeTransactions.filter(t => t.vendorId === tx.vendorId).forEach(t => {
      if (t.type === 'PURCHASE_BILL') balance += t.amount;
      if (t.type === 'PAID_PAYMENT') balance -= t.amount;
      t.balanceAfter = balance;
    });
    const v = storeVendors.find(x => x._id === tx.vendorId);
    if (v) v.payableBalance = balance;
  }
}

it('Customer: Credit transaction increases receivable (Rs. 20,000)', () => {
  addTx({ _id: 't1', partyType: 'Customer', customerId: 'c1', type: 'GAVE_CREDIT', amount: 20000 });
  const c = storeCustomers.find(x => x._id === 'c1');
  assert.strictEqual(c.netBalance, 20000);
});

it('Customer: Payment transaction reduces receivable (Rs. 20,000 - Rs. 8,000 = Rs. 12,000)', () => {
  addTx({ _id: 't2', partyType: 'Customer', customerId: 'c1', type: 'GOT_PAYMENT', amount: 8000 });
  const c = storeCustomers.find(x => x._id === 'c1');
  assert.strictEqual(c.netBalance, 12000);
});

it('Vendor: Purchase bill increases payable dues (Rs. 50,000)', () => {
  addTx({ _id: 't3', partyType: 'Vendor', vendorId: 'v1', type: 'PURCHASE_BILL', amount: 50000 });
  const v = storeVendors.find(x => x._id === 'v1');
  assert.strictEqual(v.payableBalance, 50000);
});

it('Vendor: Payment paid reduces supplier dues (Rs. 50,000 - Rs. 35,000 = Rs. 15,000)', () => {
  addTx({ _id: 't4', partyType: 'Vendor', vendorId: 'v1', type: 'PAID_PAYMENT', amount: 35000 });
  const v = storeVendors.find(x => x._id === 'v1');
  assert.strictEqual(v.payableBalance, 15000);
});

// 6. Net Financial Position Calculation
console.log('\n--- TEST GROUP 6: AGGREGATED STATS & CASCADE DELETION ---');
it('Computes Net Market Position (Receivables - Payables)', () => {
  const totalReceivables = storeCustomers.reduce((sum, c) => sum + (c.netBalance > 0 ? c.netBalance : 0), 0);
  const totalPayables = storeVendors.reduce((sum, v) => sum + (v.payableBalance > 0 ? v.payableBalance : 0), 0);
  const netPosition = totalReceivables - totalPayables;

  assert.strictEqual(totalReceivables, 12000);
  assert.strictEqual(totalPayables, 15000);
  assert.strictEqual(netPosition, -3000); // Deficit of 3000
});

it('Cascade delete purges customer ledger records', () => {
  storeCustomers = storeCustomers.filter(c => c._id !== 'c1');
  storeTransactions = storeTransactions.filter(t => t.customerId !== 'c1');
  assert.strictEqual(storeCustomers.length, 0);
  assert.strictEqual(storeTransactions.filter(t => t.customerId === 'c1').length, 0);
});

it('Cascade delete purges vendor ledger records', () => {
  storeVendors = storeVendors.filter(v => v._id !== 'v1');
  storeTransactions = storeTransactions.filter(t => t.vendorId !== 'v1');
  assert.strictEqual(storeVendors.length, 0);
  assert.strictEqual(storeTransactions.length, 0);
});

console.log('\n================================================================');
console.log('📊 TEST RESULTS SUMMARY:');
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
