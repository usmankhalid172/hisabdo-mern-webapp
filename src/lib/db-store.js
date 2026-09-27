// High-Reliability In-Memory & Persistent Database Store for Customers, Vendors, and Transactions

const initialCustomers = [];

const initialVendors = [];

const initialTransactions = [];


class DatabaseStore {
  constructor() {
    this.customers = JSON.parse(JSON.stringify(initialCustomers));
    this.vendors = JSON.parse(JSON.stringify(initialVendors));
    this.transactions = JSON.parse(JSON.stringify(initialTransactions));
  }

  // --- CUSTOMER METHODS ---
  async getCustomers({ search, category, balanceType, sortBy = 'updatedAt', sortOrder = 'desc' } = {}) {
    let result = [...this.customers];

    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      result = result.filter(c => c.category === category);
    }

    if (balanceType) {
      if (balanceType === 'receivable') result = result.filter(c => c.netBalance > 0);
      else if (balanceType === 'payable') result = result.filter(c => c.netBalance < 0);
      else if (balanceType === 'settled') result = result.filter(c => c.netBalance === 0);
    }

    result.sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (sortBy === 'netBalance' || sortBy === 'creditLimit') {
        valA = Number(valA);
        valB = Number(valB);
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc' 
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return result;
  }

  async getCustomerById(id) {
    const customer = this.customers.find(c => c._id === id);
    if (!customer) return null;
    const txs = this.transactions.filter(t => t.customerId === id);
    return {
      ...customer,
      transactionsCount: txs.length,
      recentTransactions: txs.slice(-5).reverse()
    };
  }

  async createCustomer(data) {
    const now = new Date().toISOString();
    const id = 'cust-' + Date.now();
    const initialBalance = Number(data.initialBalance || 0);

    const newCustomer = {
      _id: id,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: (data.email || '').trim().toLowerCase(),
      address: (data.address || '').trim(),
      city: (data.city || 'Lahore').trim(),
      category: data.category || 'Retail',
      creditLimit: Number(data.creditLimit || 50000),
      initialBalance: initialBalance,
      netBalance: initialBalance,
      status: data.status || 'active',
      paymentTermsDays: Number(data.paymentTermsDays || 15),
      createdAt: now,
      updatedAt: now
    };

    this.customers.unshift(newCustomer);

    if (initialBalance !== 0) {
      const txType = initialBalance > 0 ? 'GAVE_CREDIT' : 'GOT_PAYMENT';
      this.transactions.push({
        _id: 'tx-' + Date.now(),
        partyType: 'Customer',
        customerId: id,
        vendorId: null,
        type: txType,
        amount: Math.abs(initialBalance),
        date: now,
        paymentMethod: 'Cash',
        billNumber: 'OPENING',
        description: 'Opening balance registration',
        balanceAfter: initialBalance,
        createdAt: now
      });
    }

    return newCustomer;
  }

  async updateCustomer(id, data) {
    const index = this.customers.findIndex(c => c._id === id);
    if (index === -1) return null;

    const existing = this.customers[index];
    const updated = {
      ...existing,
      ...data,
      creditLimit: data.creditLimit !== undefined ? Number(data.creditLimit) : existing.creditLimit,
      updatedAt: new Date().toISOString()
    };

    this.customers[index] = updated;
    return updated;
  }

  async deleteCustomer(id) {
    const index = this.customers.findIndex(c => c._id === id);
    if (index === -1) return false;

    this.customers.splice(index, 1);
    // Cascade delete customer transactions
    this.transactions = this.transactions.filter(t => t.customerId !== id);
    return true;
  }

  // --- VENDOR METHODS ---
  async getVendors({ search, category, status, sortBy = 'updatedAt', sortOrder = 'desc' } = {}) {
    let result = [...this.vendors];

    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(v =>
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.companyName && v.companyName.toLowerCase().includes(q)) ||
        (v.phone && v.phone.includes(q)) ||
        (v.city && v.city.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      result = result.filter(v => v.category === category);
    }

    if (status && status !== 'All') {
      if (status === 'payable') result = result.filter(v => v.payableBalance > 0);
      else if (status === 'paid') result = result.filter(v => v.payableBalance === 0);
      else if (status === 'advance') result = result.filter(v => v.payableBalance < 0);
    }

    result.sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (sortBy === 'payableBalance') {
        valA = Number(valA);
        valB = Number(valB);
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc' 
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return result;
  }

  async getVendorById(id) {
    const vendor = this.vendors.find(v => v._id === id);
    if (!vendor) return null;
    const txs = this.transactions.filter(t => t.vendorId === id);
    return {
      ...vendor,
      transactionsCount: txs.length,
      recentTransactions: txs.slice(-5).reverse()
    };
  }

  async createVendor(data) {
    const now = new Date().toISOString();
    const id = 'vend-' + Date.now();
    const initialBalance = Number(data.initialBalance || 0);

    const newVendor = {
      _id: id,
      name: data.name.trim(),
      companyName: data.companyName.trim(),
      phone: data.phone.trim(),
      email: (data.email || '').trim().toLowerCase(),
      address: (data.address || '').trim(),
      city: (data.city || 'Karachi').trim(),
      category: data.category || 'Wholesale Supplier',
      bankName: data.bankName || 'Meezan Bank Ltd',
      accountTitle: (data.accountTitle || '').trim(),
      accountNumber: (data.accountNumber || '').trim(),
      initialBalance: initialBalance,
      payableBalance: initialBalance,
      status: data.status || 'active',
      paymentTermsDays: Number(data.paymentTermsDays || 30),
      createdAt: now,
      updatedAt: now
    };

    this.vendors.unshift(newVendor);

    if (initialBalance !== 0) {
      const txType = initialBalance > 0 ? 'PURCHASE_BILL' : 'PAID_PAYMENT';
      this.transactions.push({
        _id: 'tx-' + Date.now(),
        partyType: 'Vendor',
        customerId: null,
        vendorId: id,
        type: txType,
        amount: Math.abs(initialBalance),
        date: now,
        paymentMethod: 'Bank Transfer',
        billNumber: 'OPENING-BILL',
        description: 'Opening vendor balance registration',
        balanceAfter: initialBalance,
        createdAt: now
      });
    }

    return newVendor;
  }

  async updateVendor(id, data) {
    const index = this.vendors.findIndex(v => v._id === id);
    if (index === -1) return null;

    const existing = this.vendors[index];
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.vendors[index] = updated;
    return updated;
  }

  async deleteVendor(id) {
    const index = this.vendors.findIndex(v => v._id === id);
    if (index === -1) return false;

    this.vendors.splice(index, 1);
    // Cascade delete vendor transactions
    this.transactions = this.transactions.filter(t => t.vendorId !== id);
    return true;
  }

  // --- TRANSACTIONS & RUNNING BALANCES ---
  async getTransactionsByCustomer(customerId) {
    const txs = this.transactions.filter(t => t.customerId === customerId);
    return this.recalculateCustomerBalances(customerId, txs);
  }

  async getTransactionsByVendor(vendorId) {
    const txs = this.transactions.filter(t => t.vendorId === vendorId);
    return this.recalculateVendorBalances(vendorId, txs);
  }

  recalculateCustomerBalances(customerId, txList) {
    const sorted = [...txList].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = 0;

    sorted.forEach(entry => {
      if (entry.type === 'GAVE_CREDIT') {
        running += Number(entry.amount);
      } else if (entry.type === 'GOT_PAYMENT') {
        running -= Number(entry.amount);
      }
      entry.balanceAfter = running;
    });

    const customer = this.customers.find(c => c._id === customerId);
    if (customer) {
      customer.netBalance = running;
      customer.updatedAt = new Date().toISOString();
    }

    return sorted;
  }

  recalculateVendorBalances(vendorId, txList) {
    const sorted = [...txList].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = 0;

    sorted.forEach(entry => {
      if (entry.type === 'PURCHASE_BILL') {
        running += Number(entry.amount);
      } else if (entry.type === 'PAID_PAYMENT') {
        running -= Number(entry.amount);
      }
      entry.balanceAfter = running;
    });

    const vendor = this.vendors.find(v => v._id === vendorId);
    if (vendor) {
      vendor.payableBalance = running;
      vendor.updatedAt = new Date().toISOString();
    }

    return sorted;
  }

  async addTransaction(payload) {
    const now = new Date().toISOString();
    const newTx = {
      _id: 'tx-' + Date.now(),
      partyType: payload.partyType,
      customerId: payload.customerId || null,
      vendorId: payload.vendorId || null,
      type: payload.type,
      amount: Number(payload.amount),
      date: payload.date || now,
      paymentMethod: payload.paymentMethod || 'Cash',
      billNumber: (payload.billNumber || '').trim(),
      description: (payload.description || '').trim(),
      balanceAfter: 0,
      createdAt: now
    };

    this.transactions.push(newTx);

    if (payload.customerId) {
      const allTx = this.transactions.filter(t => t.customerId === payload.customerId);
      this.recalculateCustomerBalances(payload.customerId, allTx);
    } else if (payload.vendorId) {
      const allTx = this.transactions.filter(t => t.vendorId === payload.vendorId);
      this.recalculateVendorBalances(payload.vendorId, allTx);
    }

    return newTx;
  }

  async updateTransaction(txId, updates) {
    const index = this.transactions.findIndex(t => t._id === txId);
    if (index === -1) return null;

    const existing = this.transactions[index];
    const updated = {
      ...existing,
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : existing.amount
    };

    this.transactions[index] = updated;

    if (updated.customerId) {
      const allTx = this.transactions.filter(t => t.customerId === updated.customerId);
      this.recalculateCustomerBalances(updated.customerId, allTx);
    } else if (updated.vendorId) {
      const allTx = this.transactions.filter(t => t.vendorId === updated.vendorId);
      this.recalculateVendorBalances(updated.vendorId, allTx);
    }

    return updated;
  }

  async deleteTransaction(txId) {
    const index = this.transactions.findIndex(t => t._id === txId);
    if (index === -1) return false;

    const tx = this.transactions[index];
    this.transactions.splice(index, 1);

    if (tx.customerId) {
      const allTx = this.transactions.filter(t => t.customerId === tx.customerId);
      this.recalculateCustomerBalances(tx.customerId, allTx);
    } else if (tx.vendorId) {
      const allTx = this.transactions.filter(t => t.vendorId === tx.vendorId);
      this.recalculateVendorBalances(tx.vendorId, allTx);
    }

    return true;
  }

  // --- COMBINED STATS ---
  async getOverallStats() {
    const totalCustomers = this.customers.length;
    const totalVendors = this.vendors.length;

    let totalReceivable = 0; // Money market owes you (Customers)
    let totalCustomerAdvance = 0;
    this.customers.forEach(c => {
      if (c.netBalance > 0) totalReceivable += c.netBalance;
      else if (c.netBalance < 0) totalCustomerAdvance += Math.abs(c.netBalance);
    });

    let totalPayable = 0; // Money you owe suppliers (Vendors)
    let totalVendorAdvance = 0;
    this.vendors.forEach(v => {
      if (v.payableBalance > 0) totalPayable += v.payableBalance;
      else if (v.payableBalance < 0) totalVendorAdvance += Math.abs(v.payableBalance);
    });

    const netMarketPosition = totalReceivable - totalPayable;

    return {
      totalCustomers,
      totalVendors,
      totalReceivable,
      totalCustomerAdvance,
      totalPayable,
      totalVendorAdvance,
      netMarketPosition,
      totalTransactions: this.transactions.length
    };
  }

  resetToInitial() {
    this.customers = JSON.parse(JSON.stringify(initialCustomers));
    this.vendors = JSON.parse(JSON.stringify(initialVendors));
    this.transactions = JSON.parse(JSON.stringify(initialTransactions));
  }
}

// Global singleton instance
const globalStore = global.dbStoreCustomerVendor || new DatabaseStore();
if (process.env.NODE_ENV !== 'production') {
  global.dbStoreCustomerVendor = globalStore;
}

export default globalStore;
