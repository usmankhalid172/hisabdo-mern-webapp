const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors
        .array()
        .map((err) => err.msg)
        .join(", "),
      details: errors.array(),
    });
  }
  next();
};

module.exports = validate;
