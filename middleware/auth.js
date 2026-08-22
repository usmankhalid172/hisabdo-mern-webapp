const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        getJwtSecret(),
      );
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ error: "User no longer exists." });
      }
      next();
    } catch (error) {
      return res.status(401).json({ error: "Not authorized, token failed." });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ error: "Not authorized, no token provided." });
  }
};

const optionalProtect = async (req, res, next) => {
  if (!req.headers.authorization) {
    return next();
  }

  return protect(req, res, next);
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied: Admin role required." });
  }
};

module.exports = { protect, optionalProtect, admin };
