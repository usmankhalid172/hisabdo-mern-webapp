import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
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
    min: [1, 'Amount must be at least Rs. 1']
  },
  date: {
    type: Date,
    default: Date.now
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
