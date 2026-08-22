const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  company: { type: String, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['new', 'read', 'archived'], default: 'new', index: true },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
