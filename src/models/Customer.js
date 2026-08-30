import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
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
    default: 'Lahore'
  },
  category: {
    type: String,
    enum: ['Retail', 'Wholesale', 'Distributor', 'VIP', 'General'],
    default: 'Retail'
  },
  creditLimit: {
    type: Number,
    min: [0, 'Credit limit cannot be negative'],
    default: 50000
  },
  initialBalance: {
    type: Number,
    default: 0
  },
  netBalance: {
    type: Number,
    default: 0 // Positive = Customer owes merchant (You Will Get / Receivable), Negative = Advance (You Give / Payable)
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  paymentTermsDays: {
    type: Number,
    default: 15
  },
  branchId: {
    type: String,
    default: 'branch-1'
  }
}, {
  timestamps: true
});

CustomerSchema.index({ name: 'text', phone: 'text', city: 'text' });

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
