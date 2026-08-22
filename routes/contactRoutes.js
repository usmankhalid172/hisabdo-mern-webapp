const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Contact = require("../models/Contact");
const { protect, admin } = require("../middleware/auth");
const validate = require("../middleware/validate");

const contactStatus = body("status")
  .isIn(["unread", "read", "replied", "archived"])
  .withMessage("Invalid contact status");

// @route   POST /api/contacts
// @desc    Submit a contact message
// @access  Public
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      const contact = await Contact.create({
        name,
        email,
        phone: phone || "",
        subject: subject || "General Inquiry",
        message,
      });

      res.status(201).json({
        success: true,
        message: "Message sent successfully. We will get back to you soon!",
        data: contact,
      });
    } catch (err) {
      next(err);
    }
  },
);

// @route   GET /api/contacts
// @desc    Get all contact messages (Admin)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res, next) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(contacts);
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/:id/status",
  protect,
  admin,
  [contactStatus],
  validate,
  async (req, res, next) => {
    try {
      const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true },
      );
      if (!contact) {
        return res.status(404).json({ error: "Contact message not found" });
      }
      res.json(contact);
    } catch (err) {
      next(err);
    }
  },
);

// @route   GET /api/contacts/:id
// @desc    Get contact message details (Admin)
// @access  Private/Admin
router.get("/:id", protect, admin, async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact message not found" });
    }
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete contact message (Admin)
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Contact message not found" });
    }
    await contact.deleteOne();
    res.json({ success: true, message: "Contact message deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
