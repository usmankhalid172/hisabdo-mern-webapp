const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname), {
  maxAge: "1d",
  setHeaders: (res, filePath) => {
    if (/\.(?:js|css|webp|avif|png|jpe?g|svg|woff2?)$/i.test(filePath)) {
      res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    }
  },
}));

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/smart-fill", require("./routes/smartFillRoutes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "HisabDo API is running" });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
