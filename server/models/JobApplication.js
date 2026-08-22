const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  resumeUrl: { type: String, trim: true, maxlength: 2048 },
  message: { type: String, trim: true, maxlength: 5000 },
  status: { type: String, enum: ['new', 'reviewing', 'rejected', 'accepted'], default: 'new', index: true },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.models.JobApplication || mongoose.model('JobApplication', jobApplicationSchema);
