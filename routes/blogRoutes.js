const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Blog = require("../models/Blog");
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
  "title", "slug", "summary", "content", "author", "category", "tags",
  "coverImage", "readTime", "published", "publishedAt",
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

// @route   GET /api/blogs
// @desc    Get all blog posts (Public gets published; filterable)
// @access  Public
router.get("/", optionalProtect, async (req, res, next) => {
  try {
    const { published, category, search } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    let query = {};

    const isAdmin = req.user && req.user.role === "admin";

    if (published === "true" || published === undefined || !isAdmin) {
      query.published = true;
    } else if (published === "false" && isAdmin) {
      query.published = false;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    res.set("X-Page", String(page));
    res.set("X-Page-Size", String(limit));
    res.json(blogs);
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/blogs/:idOrSlug
// @desc    Get single blog post
// @access  Public
router.get("/:idOrSlug", optionalProtect, async (req, res, next) => {
  try {
    const param = req.params.idOrSlug;
    let blog;

    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(param);
    }

    if (!blog) {
      blog = await Blog.findOne({ slug: param.toLowerCase() });
    }

    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    if (!blog.published && !(req.user && req.user.role === "admin")) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json(blog);
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/blogs
// @desc    Create a blog post (Admin)
// @access  Private/Admin
router.post(
  "/",
  protect,
  admin,
  [
    body("title").trim().notEmpty().withMessage("Blog title is required"),
    body("content").notEmpty().withMessage("Blog content is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const blogData = pickEditableFields(req.body);
      if (!blogData.slug) {
        blogData.slug =
          slugify(blogData.title) + "-" + Date.now().toString().slice(-4);
      }

      const blog = await Blog.create(blogData);
      res.status(201).json(blog);
    } catch (err) {
      next(err);
    }
  },
);

// @route   PUT /api/blogs/:id
// @desc    Update a blog post (Admin)
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const updateData = pickEditableFields(req.body);
    if (updateData.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(blog);
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog post (Admin)
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    await blog.deleteOne();
    res.json({ success: true, message: "Blog post deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
