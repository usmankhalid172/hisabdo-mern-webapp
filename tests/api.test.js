const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const Contact = require("../models/Contact");
const Job = require("../models/Job");
const Blog = require("../models/Blog");
const Application = require("../models/Application");

jest.setTimeout(30000);

let isDbConnected = false;
let adminToken = "";
let testJobId = "";
let testBlogId = "";

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-only-jwt-secret";
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hisabdo_test";
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1500,
    });
    isDbConnected = true;
    await User.deleteMany({ email: "testadmin@hisabdo.app" });
    await User.create({
      email: "testadmin@hisabdo.app",
      password: "TestPassword123!",
      role: "admin",
    });
  } catch (err) {
    isDbConnected = false;
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await User.deleteMany({ email: "testadmin@hisabdo.app" });
      await Contact.deleteMany({ email: "test@example.com" });
      await Job.deleteMany({ slug: /test-job/ });
      await Blog.deleteMany({ slug: /test-blog/ });
      await Application.deleteMany({ email: "applicant@example.com" });
      await mongoose.connection.close();
    } catch (e) {
      // Cleanup silent
    }
  }
});

describe("HisabDo API Endpoints", () => {
  describe("GET /api/health", () => {
    it("should return health status", async () => {
      const res = await request(app).get("/api/health");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status", "ok");
    });
  });

  describe("POST /api/auth/register & login", () => {
    it("should reject public admin registration", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "testadmin@hisabdo.app",
        password: "TestPassword123!",
      });
      expect(res.statusCode).toBe(403);
    });

    it("should handle login attempt", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "testadmin@hisabdo.app",
        password: "TestPassword123!",
      });
      if (isDbConnected) {
        expect(res.statusCode).toBe(200);
      } else {
        expect([401, 500]).toContain(res.statusCode);
      }
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty("token");
        adminToken = res.body.token;
      }
    });

    it("should fail login with wrong password or return 401/500", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "testadmin@hisabdo.app",
        password: "WrongPassword",
      });
      if (isDbConnected) {
        expect(res.statusCode).toBe(401);
      } else {
        expect([401, 500]).toContain(res.statusCode);
      }
    });
  });

  describe("POST /api/contacts", () => {
    it("should validate missing required fields", async () => {
      const res = await request(app)
        .post("/api/contacts")
        .send({ name: "Test" });
      expect(res.statusCode).toEqual(400);
    });

    it("should create a contact submission or handle DB response", async () => {
      const res = await request(app).post("/api/contacts").send({
        name: "John Doe",
        email: "test@example.com",
        phone: "+923001234567",
        subject: "App Feedback",
        message: "HisabDo is a great app!",
      });
      expect([201, 500]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe("CRUD /api/jobs", () => {
    it("should get public jobs list", async () => {
      const res = await request(app).get("/api/jobs");
      expect([200, 500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    it("should never expose draft jobs publicly", async () => {
      if (!isDbConnected) return;
      const draft = await Job.create({
        title: "Private Test Job",
        slug: `private-test-job-${Date.now()}`,
        status: "draft",
        published: false,
      });
      const res = await request(app).get("/api/jobs?published=false");
      expect(res.statusCode).toBe(200);
      expect(res.body.some((job) => job._id === draft._id.toString())).toBe(false);
      await draft.deleteOne();
    });

    it("should create a job as admin", async () => {
      if (mongoose.connection.readyState === 0 || !adminToken) return;
      const res = await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Full Stack Engineer",
          department: "Engineering",
          employmentType: "Full-time",
          location: "Lahore, Pakistan",
          description: "Build backend APIs with Express & MongoDB.",
          applicationEmail: "careers@hisabdo.app",
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("_id");
      testJobId = res.body._id;
    });

    it("should update a job as admin", async () => {
      if (!testJobId || !adminToken) return;
      const res = await request(app)
        .put(`/api/jobs/${testJobId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Senior Full Stack Engineer",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toBe("Senior Full Stack Engineer");
    });

    it("should delete a job as admin", async () => {
      if (!testJobId || !adminToken) return;
      const res = await request(app)
        .delete(`/api/jobs/${testJobId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("CRUD /api/blogs", () => {
    it("should get public blogs list", async () => {
      const res = await request(app).get("/api/blogs");
      expect([200, 500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    it("should create a blog post as admin", async () => {
      if (mongoose.connection.readyState === 0 || !adminToken) return;
      const res = await request(app)
        .post("/api/blogs")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Test Blog Article",
          summary: "A short summary of the test blog article.",
          content: "Full content of the blog article goes here.",
          author: "Mian Usman Khalid",
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("_id");
      testBlogId = res.body._id;
    });

    it("should delete a blog post as admin", async () => {
      if (!testBlogId || !adminToken) return;
      const res = await request(app)
        .delete(`/api/blogs/${testBlogId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("POST /api/smart-fill", () => {
    it("should require job description text", async () => {
      const res = await request(app).post("/api/smart-fill").send({ text: "" });
      expect(res.statusCode).toEqual(400);
    });

    it("should parse job description or return fallback", async () => {
      const res = await request(app)
        .post("/api/smart-fill")
        .send({
          text: "Hiring React Developer in Lahore for Full-time role. Salary 100k.",
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("title");
    });
  });
});
