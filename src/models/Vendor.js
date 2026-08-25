import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vendor / Contact person name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  companyName: {
    type: String,
    required: [true, 'Company / Shop name is required'],
    trim: true,
    minlength: [2, 'Company name must be at least 2 characters'],
    maxlength: [120, 'Company name cannot exceed 120 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^(?:\+92|92|0)?3[0-9]{9}$/, 'Please enter a valid Pakistani mobile number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: 'Karachi'
  },
  category: {
    type: String,
    enum: ['Raw Material', 'Finished Goods', 'Packaging', 'Logistics', 'Services', 'Wholesale Supplier'],
    default: 'Wholesale Supplier'
  },
  bankName: {
    type: String,
    trim: true,
    default: 'Meezan Bank Ltd'
  },
  accountTitle: {
    type: String,
    trim: true,
    default: ''
  },
  accountNumber: {
    type: String,
    trim: true,
    default: ''
  },
  initialBalance: {
    type: Number,
    default: 0
  },
  payableBalance: {
    type: Number,
    default: 0 // Positive = Merchant owes Vendor (Payable / Bill Dues), Negative = Advance Paid to Vendor
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  paymentTermsDays: {
    type: Number,
    default: 30
  },
  branchId: {
    type: String,
    default: 'branch-1'
  }
}, {
  timestamps: true
});

VendorSchema.index({ name: 'text', companyName: 'text', phone: 'text', city: 'text' });

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
