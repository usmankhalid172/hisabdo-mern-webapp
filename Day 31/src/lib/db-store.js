// High-Reliability In-Memory & Persistent Database Store for Customers, Vendors, and Transactions

const initialCustomers = [
  {
    _id: 'cust-1',
    name: 'Ali Traders (Retailer)',
    phone: '+923001234567',
    email: 'ali.traders@gmail.com',
    address: 'Shop 42, Shah Alam Market',
    city: 'Lahore',
    category: 'Wholesale',
    creditLimit: 150000,
    initialBalance: 25000,
    netBalance: 32000,
    status: 'active',
    paymentTermsDays: 15,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-18T14:30:00.000Z'
  },
  {
    _id: 'cust-2',
    name: 'Usman Retailer Store',
    phone: '03219876543',
    email: 'usman.retail@yahoo.com',
    address: 'Plot 12, Commercial Area, Saddar',
    city: 'Karachi',
    category: 'Retail',
    creditLimit: 50000,
    initialBalance: 0,
    netBalance: 14500,
    status: 'active',
    paymentTermsDays: 7,
    createdAt: '2026-08-05T11:00:00.000Z',
    updatedAt: '2026-08-19T09:15:00.000Z'
  },
  {
    _id: 'cust-3',
    name: 'Khan Electronics & Parts',
    phone: '+923335558899',
    email: 'khan.elec@gmail.com',
    address: 'Karkhano Market, Ring Road',
    city: 'Peshawar',
    category: 'Distributor',
    creditLimit: 300000,
    initialBalance: 10000,
    netBalance: -5200, // Negative means customer gave advance payment (merchant owes customer)
    status: 'active',
    paymentTermsDays: 30,
    createdAt: '2026-08-08T12:00:00.000Z',
    updatedAt: '2026-08-17T16:45:00.000Z'
  },
  {
    _id: 'cust-4',
    name: 'Fatima Boutique & Fabric',
    phone: '03451122334',
    email: 'fatima.textiles@outlook.com',
    address: 'Liberty Roundabout, Gulberg III',
    city: 'Lahore',
    category: 'VIP',
    creditLimit: 200000,
    initialBalance: 0,
    netBalance: 18000,
    status: 'active',
    paymentTermsDays: 14,
    createdAt: '2026-08-10T14:00:00.000Z',
    updatedAt: '2026-08-18T18:20:00.000Z'
  },
  {
    _id: 'cust-5',
    name: 'Bismillah Autos & Accessories',
    phone: '+923124455667',
    email: 'bismillah.autos@gmail.com',
    address: 'Chowk Shaheedan, Bahawalpur Road',
    city: 'Multan',
    category: 'Retail',
    creditLimit: 75000,
    initialBalance: 5000,
    netBalance: 0, // Settled
    status: 'active',
    paymentTermsDays: 10,
    createdAt: '2026-08-12T09:30:00.000Z',
    updatedAt: '2026-08-19T11:00:00.000Z'
  }
];

const initialVendors = [
  {
    _id: 'vend-1',
    name: 'Haji Abdul Rehman',
    companyName: 'National Textiles & Fabric Mills',
    phone: '+923004455667',
    email: 'national.mills@gmail.com',
    address: 'Millat Industrial Estate, Sector 4',
    city: 'Faisalabad',
    category: 'Raw Material',
    bankName: 'Meezan Bank Ltd',
    accountTitle: 'National Textile Mills Pvt Ltd',
    accountNumber: '0204-0102998877',
    initialBalance: 50000,
    payableBalance: 85000, // Positive = Merchant owes Vendor (Payable)
    status: 'active',
    paymentTermsDays: 30,
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-19T14:00:00.000Z'
  },
  {
    _id: 'vend-2',
    name: 'Tariq Mehmood',
    companyName: 'Pak Packaging & Corrugated Boxes',
    phone: '03215566778',
    email: 'pak.packaging@yahoo.com',
    address: 'Korangi Industrial Area',
    city: 'Karachi',
    category: 'Packaging',
    bankName: 'Bank Alfalah Ltd',
    accountTitle: 'Pak Packaging Services',
    accountNumber: '5510-0010992233',
    initialBalance: 12000,
    payableBalance: 24000,
    status: 'active',
    paymentTermsDays: 15,
    createdAt: '2026-08-04T10:00:00.000Z',
    updatedAt: '2026-08-18T16:00:00.000Z'
  },
  {
    _id: 'vend-3',
    name: 'Sardar Gul Khan',
    companyName: 'Khyber Logistics & Goods Transport',
    phone: '+923337788990',
    email: 'khyber.transport@gmail.com',
    address: 'Truck Stand, GT Road',
    city: 'Peshawar',
    category: 'Logistics',
    bankName: 'Habib Bank Ltd (HBL)',
    accountTitle: 'Khyber Goods Forwarding',
    accountNumber: '0042-7900112233',
    initialBalance: 0,
    payableBalance: 15000,
    status: 'active',
    paymentTermsDays: 10,
    createdAt: '2026-08-07T11:30:00.000Z',
    updatedAt: '2026-08-17T15:20:00.000Z'
  },
  {
    _id: 'vend-4',
    name: 'Chaudhry Nadeem',
    companyName: 'Al-Madina Hardware & Tools Importers',
    phone: '03459988776',
    email: 'almadina.tools@outlook.com',
    address: 'Badami Bagh Wholesale Market',
    city: 'Lahore',
    category: 'Wholesale Supplier',
    bankName: 'MCB Bank Ltd',
    accountTitle: 'Al-Madina Hardware Traders',
    accountNumber: '1099-2233445566',
    initialBalance: 20000,
    payableBalance: 0, // Fully Paid
    status: 'active',
    paymentTermsDays: 20,
    createdAt: '2026-08-09T13:00:00.000Z',
    updatedAt: '2026-08-19T10:00:00.000Z'
  }
];

const initialTransactions = [
  // Ali Traders transactions
  {
    _id: 'tx-1',
    partyType: 'Customer',
    customerId: 'cust-1',
    vendorId: null,
    type: 'GAVE_CREDIT',
    amount: 25000,
    date: '2026-08-01T10:00:00.000Z',
    paymentMethod: 'Cash',
    billNumber: 'INV-1001',
    description: 'Opening balance credit',
    balanceAfter: 25000,
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    _id: 'tx-2',
    partyType: 'Customer',
    customerId: 'cust-1',
    vendorId: null,
    type: 'GAVE_CREDIT',
    amount: 15000,
    date: '2026-08-10T14:30:00.000Z',
    paymentMethod: 'Bank Transfer',
    billNumber: 'INV-1045',
    description: 'Wholesale textile consignment',
    balanceAfter: 40000,
    createdAt: '2026-08-10T14:30:00.000Z'
  },
  {
    _id: 'tx-3',
    partyType: 'Customer',
    customerId: 'cust-1',
    vendorId: null,
    type: 'GOT_PAYMENT',
    amount: 8000,
    date: '2026-08-18T14:30:00.000Z',
    paymentMethod: 'EasyPaisa',
    billNumber: 'REC-2021',
    description: 'Partial payment received via EasyPaisa',
    balanceAfter: 32000,
    createdAt: '2026-08-18T14:30:00.000Z'
  },
  // Usman Retailer transactions
  {
    _id: 'tx-4',
    partyType: 'Customer',
    customerId: 'cust-2',
    vendorId: null,
    type: 'GAVE_CREDIT',
    amount: 14500,
    date: '2026-08-05T11:00:00.000Z',
    paymentMethod: 'Cash',
    billNumber: 'INV-1012',
    description: 'Retail stock order',
    balanceAfter: 14500,
    createdAt: '2026-08-05T11:00:00.000Z'
  },
  // Khan Electronics transactions
  {
    _id: 'tx-5',
    partyType: 'Customer',
    customerId: 'cust-3',
    vendorId: null,
    type: 'GAVE_CREDIT',
    amount: 10000,
    date: '2026-08-08T12:00:00.000Z',
    paymentMethod: 'Bank Transfer',
    billNumber: 'INV-1025',
    description: 'Component parts supply',
    balanceAfter: 10000,
    createdAt: '2026-08-08T12:00:00.000Z'
  },
  {
    _id: 'tx-6',
    partyType: 'Customer',
    customerId: 'cust-3',
    vendorId: null,
    type: 'GOT_PAYMENT',
    amount: 15200,
    date: '2026-08-17T16:45:00.000Z',
    paymentMethod: 'Bank Transfer',
    billNumber: 'REC-2030',
    description: 'Advance payment received',
    balanceAfter: -5200,
    createdAt: '2026-08-17T16:45:00.000Z'
  },
  // Fatima Boutique
  {
    _id: 'tx-7',
    partyType: 'Customer',
    customerId: 'cust-4',
    vendorId: null,
    type: 'GAVE_CREDIT',
    amount: 18000,
    date: '2026-08-10T14:00:00.000Z',
    paymentMethod: 'JazzCash',
    billNumber: 'INV-1060',
    description: 'Designer lawn suits wholesale order',
    balanceAfter: 18000,
    createdAt: '2026-08-10T14:00:00.000Z'
  },
  // Bismillah Autos
  {
    _id: 'tx-8',
    partyType: 'Customer',
    customerId: 'cust-5',
    vendorId: null,
    type: 'GAVE_CREDIT',
    amount: 5000,
    date: '2026-08-12T09:30:00.000Z',
    paymentMethod: 'Cash',
    billNumber: 'INV-1075',
    description: 'Accessories shipment',
    balanceAfter: 5000,
    createdAt: '2026-08-12T09:30:00.000Z'
  },
  {
    _id: 'tx-9',
    partyType: 'Customer',
    customerId: 'cust-5',
    vendorId: null,
    type: 'GOT_PAYMENT',
    amount: 5000,
    date: '2026-08-19T11:00:00.000Z',
    paymentMethod: 'Cash',
    billNumber: 'REC-2045',
    description: 'Full account clearance',
    balanceAfter: 0,
    createdAt: '2026-08-19T11:00:00.000Z'
  },
  // Vendor 1: National Mills
  {
    _id: 'tx-10',
    partyType: 'Vendor',
    customerId: null,
    vendorId: 'vend-1',
    type: 'PURCHASE_BILL',
    amount: 50000,
    date: '2026-08-01T09:00:00.000Z',
    paymentMethod: 'Bank Transfer',
    billNumber: 'BILL-801',
    description: 'Raw cotton yarns batch 1',
    balanceAfter: 50000,
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    _id: 'tx-11',
    partyType: 'Vendor',
    customerId: null,
    vendorId: 'vend-1',
    type: 'PURCHASE_BILL',
    amount: 55000,
    date: '2026-08-12T11:00:00.000Z',
    paymentMethod: 'Bank Transfer',
    billNumber: 'BILL-845',
    description: 'Loom fabric rolls 1000m',
    balanceAfter: 105000,
    createdAt: '2026-08-12T11:00:00.000Z'
  },
  {
    _id: 'tx-12',
    partyType: 'Vendor',
    customerId: null,
    vendorId: 'vend-1',
    type: 'PAID_PAYMENT',
    amount: 20000,
    date: '2026-08-19T14:00:00.000Z',
    paymentMethod: 'Bank Transfer',
    billNumber: 'VOUCHER-501',
    description: 'Supplier payment installment via Meezan Bank',
    balanceAfter: 85000,
    createdAt: '2026-08-19T14:00:00.000Z'
  },
  // Vendor 2: Pak Packaging
  {
    _id: 'tx-13',
    partyType: 'Vendor',
    customerId: null,
    vendorId: 'vend-2',
    type: 'PURCHASE_BILL',
    amount: 24000,
    date: '2026-08-04T10:00:00.000Z',
    paymentMethod: 'Cheque',
    billNumber: 'BILL-902',
    description: 'Printed corrugated master boxes 500 pcs',
    balanceAfter: 24000,
    createdAt: '2026-08-04T10:00:00.000Z'
  },
  // Vendor 3: Khyber Logistics
  {
    _id: 'tx-14',
    partyType: 'Vendor',
    customerId: null,
    vendorId: 'vend-3',
    type: 'PURCHASE_BILL',
    amount: 15000,
    date: '2026-08-07T11:30:00.000Z',
    paymentMethod: 'Cash',
    billNumber: 'BILL-441',
    description: 'Inter-city cargo shipping bill Peshawar-Lahore',
    balanceAfter: 15000,
    createdAt: '2026-08-07T11:30:00.000Z'
  }
];

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
