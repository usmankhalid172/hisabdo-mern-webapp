const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Job = require("../models/Job");
const { protect, optionalProtect, admin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const MAX_PAGE_SIZE = 50;

const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const requestedLimit = Number.parseInt(query.limit, 10) || 20;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE);
  return { page, limit, skip: (page - 1) * limit };
};

const editableFields = [
  "title", "slug", "department", "employmentType", "location",
  "workplaceType", "experience", "description", "responsibilities",
  "requirements", "skills", "salary", "openings", "applicationUrl",
  "applicationEmail", "applicationPhone", "status", "published",
  "openStatus", "closingDate",
];

const pickEditableFields = (source) =>
  Object.fromEntries(
    editableFields
      .filter((field) => Object.prototype.hasOwnProperty.call(source, field))
      .map((field) => [field, source[field]]),
  );

const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// @route   GET /api/jobs
// @desc    Get all jobs (Public gets published; Admin gets all if query status or auth token)
// @access  Public
router.get("/", optionalProtect, async (req, res, next) => {
  try {
    const { status, published, search } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const isAdmin = req.user && req.user.role === "admin";
    let query = isAdmin ? {} : { published: true, status: "published" };

    if (isAdmin) {
      if (published === "true") {
        query.published = true;
      } else if (published === "false") {
        query.published = false;
      }

      if (status) {
        query.status = status;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    res.set("X-Page", String(page));
    res.set("X-Page-Size", String(limit));
    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/jobs/:id
// @desc    Get job by ID or slug
// @access  Public
router.get("/:idOrSlug", optionalProtect, async (req, res, next) => {
  try {
    const param = req.params.idOrSlug;
    let job;

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      job = await Job.findById(param);
    }

    if (!job) {
      job = await Job.findOne({ slug: param.toLowerCase() });
    }

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (!(req.user && req.user.role === "admin") &&
        (!job.published || job.status !== "published")) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/jobs
// @desc    Create a job (Admin)
// @access  Private/Admin
router.post(
  "/",
  protect,
  admin,
  [body("title").trim().notEmpty().withMessage("Job title is required")],
  validate,
  async (req, res, next) => {
    try {
      const jobData = pickEditableFields(req.body);
      if (!jobData.slug) {
        jobData.slug =
          slugify(jobData.title) + "-" + Date.now().toString().slice(-4);
      }

      const job = await Job.create(jobData);
      res.status(201).json(job);
    } catch (err) {
      next(err);
    }
  },
);

// @route   PUT /api/jobs/:id
// @desc    Update a job (Admin)
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const updateData = pickEditableFields(req.body);
    if (updateData.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    }

    job = await Job.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(job);
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job (Admin)
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    await job.deleteOne();
    res.json({ success: true, message: "Job deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
