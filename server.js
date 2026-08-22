const app = require("./app");
const connectDB = require("./config/db");
const User = require("./models/User");

const PORT = process.env.PORT || 5000;

// Connect DB and start server
connectDB()
  .then(async () => {
    // Seed an admin only when deployment credentials are explicitly configured.
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        const { ADMIN_EMAIL: adminEmail, ADMIN_PASSWORD: adminPassword } = process.env;
        if (adminEmail && adminPassword) {
          await User.create({ email: adminEmail, password: adminPassword, role: "admin" });
          console.log(`Default admin seeded: ${adminEmail}`);
        } else {
          console.warn("No admin seeded: ADMIN_EMAIL and ADMIN_PASSWORD are required.");
        }
      }
    } catch (err) {
      console.error("Error seeding admin user:", err.message);
    }

    app.listen(PORT, () => {
      console.log(`HisabDo Backend Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
  });
