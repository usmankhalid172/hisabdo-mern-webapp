const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 10000 },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], required: true },
  isOpen: { type: Boolean, default: true, index: true },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);
