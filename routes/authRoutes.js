const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
};

const generateToken = (id) => {
  return jwt.sign(
    { id },
    getJwtSecret(),
    { expiresIn: "30d" },
  );
};

// @route   POST /api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.trim().toLowerCase() })
        .select("+password");

      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        });
      } else {
        return res.status(401).json({ error: "Invalid email or password" });
      }
    } catch (err) {
      next(err);
    }
  },
);

// @route   POST /api/auth/register
// @desc    Optional bootstrap endpoint, disabled by default
// @access  Public when explicitly enabled
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars"),
  ],
  validate,
  async (req, res, next) => {
    try {
      if (process.env.ALLOW_ADMIN_REGISTRATION !== "true") {
        return res.status(403).json({ error: "Admin registration is disabled" });
      }

      const { email, password } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: "User already exists" });
      }

      const user = await User.create({
        email,
        password,
        role: "admin",
      });

      return res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } catch (err) {
      next(err);
    }
  },
);

// @route   GET /api/auth/me
// @desc    Get logged in user details
// @access  Private
router.get("/me", protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = router;
