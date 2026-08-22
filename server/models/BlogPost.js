const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  excerpt: { type: String, required: true, trim: true, maxlength: 500 },
  content: { type: String, required: true, trim: true, maxlength: 50000 },
  published: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
