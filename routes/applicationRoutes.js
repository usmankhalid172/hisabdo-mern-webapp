const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Application = require("../models/Application");
const Job = require("../models/Job");
const { protect, admin } = require("../middleware/auth");
const validate = require("../middleware/validate");

// @route   POST /api/applications
// @desc    Submit job application
// @access  Public
router.post(
  "/",
  [
    body("jobId").notEmpty().withMessage("Job ID is required"),
    body("candidateName")
      .trim()
      .notEmpty()
      .withMessage("Candidate name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { jobId, candidateName, email, phone, coverLetter, resumeUrl } =
        req.body;

      const job = await Job.findById(jobId);
      if (!job || !job.published || job.status !== "published") {
        return res.status(404).json({ error: "Job not found" });
      }

      const application = await Application.create({
        jobId,
        candidateName,
        email,
        phone: phone || "",
        coverLetter: coverLetter || "",
        resumeUrl: resumeUrl || "",
      });

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: application,
      });
    } catch (err) {
      next(err);
    }
  },
);

// @route   GET /api/applications
// @desc    Get all applications (Admin)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate("jobId", "title department")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/applications/:id
// @desc    Delete application (Admin)
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }
    await app.deleteOne();
    res.json({ success: true, message: "Application deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
