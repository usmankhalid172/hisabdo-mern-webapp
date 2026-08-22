const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    employmentType: {
      type: String,
      trim: true,
      default: "Full-time",
    },
    location: {
      type: String,
      trim: true,
      default: "Lahore, Pakistan / Remote",
    },
    workplaceType: {
      type: String,
      trim: true,
      default: "On-site",
    },
    experience: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    salary: {
      type: String,
      trim: true,
      default: "",
    },
    openings: {
      type: String,
      trim: true,
      default: "1",
    },
    applicationUrl: {
      type: String,
      trim: true,
      default: "",
    },
    applicationEmail: {
      type: String,
      trim: true,
      default: "",
    },
    applicationPhone: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["published", "draft", "closed"],
      default: "published",
    },
    published: {
      type: Boolean,
      default: true,
    },
    openStatus: {
      type: String,
      default: "Open",
    },
    closingDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

jobSchema.index({ published: 1, status: 1, createdAt: -1 });
jobSchema.index({ department: 1, published: 1, status: 1 });

module.exports = mongoose.model("Job", jobSchema);
