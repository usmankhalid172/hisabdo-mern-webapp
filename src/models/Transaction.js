import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  partyType: {
    type: String,
    enum: ['Customer', 'Vendor'],
    required: [true, 'Party type is required']
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  type: {
    type: String,
    enum: [
      'GAVE_CREDIT',    // Customer: Merchant gave goods on credit (Receivable +)
      'GOT_PAYMENT',    // Customer: Merchant received payment (Receivable -)
      'PURCHASE_BILL',  // Vendor: Merchant bought goods from supplier (Payable +)
      'PAID_PAYMENT'    // Vendor: Merchant paid supplier (Payable -)
    ],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be at least 1']
  },
  currency: {
    type: String,
    enum: ['PKR', 'USD', 'INR'],
    default: 'PKR',
    required: true
  },
  exchangeRateToDefault: {
    type: Number,
    default: 1.0 // AI reports aur multi-currency calculations ke liye
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'EasyPaisa', 'JazzCash', 'Cheque', 'Credit Card'],
    default: 'Cash'
  },
  billNumber: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  balanceAfter: {
    type: Number,
    default: 0
  },
  attachments: [{
    type: String
  }]
}, {
  timestamps: true
});

TransactionSchema.index({ customerId: 1, date: -1 });
TransactionSchema.index({ vendorId: 1, date: -1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);