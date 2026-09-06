import mongoose from 'mongoose';

const LedgerEntrySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true, 
    index: true 
  },
  netBalance: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  currency: { 
    type: String, 
    enum: ['PKR', 'USD', 'INR'], 
    required: true 
  },
  lastTransactionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Transaction' 
  }
}, { 
  timestamps: true 
});

LedgerEntrySchema.index({ userId: 1, customerId: 1, currency: 1 }, { unique: true });

export default mongoose.models.LedgerEntry || mongoose.model('LedgerEntry', LedgerEntrySchema);