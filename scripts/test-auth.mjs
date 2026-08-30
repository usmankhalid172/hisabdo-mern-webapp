// Automated Auth Flow E2E Test Suite for HisabDo Web App

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function runAuthTests() {
  console.log("=================================================");
  console.log(" 🧪 HISABDO CAPSTONE - AUTH FLOW INTEGRATION TESTS");
  console.log(` Target Server: ${BASE_URL}`);
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• Testing: ${name}... `);
      await fn();
      console.log("✅ PASSED");
      passed++;
    } catch (err) {
      console.log("❌ FAILED");
      console.error("  Error:", err.message);
      failed++;
    }
  }

  const testUser = {
    name: "Automation Tester",
    email: `test_${Date.now()}@hisabdo-test.com`,
    password: "Password123!",
    confirmPassword: "Password123!",
    phone: "03001234567",
    shopName: "Tester Automated Khata Store",
  };

  let testAuthCookie = "";
  let testBearerToken = "";

  // 1. Test Demo User Login
  await test("Demo Merchant Login (/api/auth/login)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "merchant@hisabdo.com",
        password: "password123",
      }),
    });

    const data = await res.json();
    if (res.status !== 200 || !data.success || !data.token) {
      throw new Error(`Expected 200 & token, got status ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 2. Test Invalid Password Login
  await test("Invalid Password Login Rejection (/api/auth/login)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "merchant@hisabdo.com",
        password: "wrongpassword999",
      }),
    });

    const data = await res.json();
    if (res.status !== 401 || data.success) {
      throw new Error(`Expected 401 Unauthorized, got status ${res.status}`);
    }
  });

  // 3. Test New User Registration
  await test("New User Registration Flow (/api/auth/register)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    const data = await res.json();
    if (res.status !== 201 || !data.success || !data.token) {
      throw new Error(`Expected 201 Created, got status ${res.status}: ${JSON.stringify(data)}`);
    }

    testBearerToken = data.token;
    const cookieHeader = res.headers.get("set-cookie");
    if (cookieHeader) {
      testAuthCookie = cookieHeader;
    }
  });

  // 4. Test Duplicate Email Registration Prevention
  await test("Duplicate Email Rejection (/api/auth/register)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    const data = await res.json();
    if (res.status !== 400 || data.success) {
      throw new Error(`Expected 400 Bad Request on duplicate, got status ${res.status}`);
    }
  });

  // 5. Test Authenticated Profile Route (/api/auth/me) with Bearer token
  await test("Get Authenticated User Profile (/api/auth/me)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testBearerToken}`,
      },
    });

    const data = await res.json();
    if (res.status !== 200 || !data.success || data.user.email !== testUser.email) {
      throw new Error(`Expected 200 with user profile, got status ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 6. Test Update Profile (/api/auth/profile)
  await test("Update User Profile (/api/auth/profile)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testBearerToken}`,
      },
      body: JSON.stringify({
        name: "Automation Tester Updated",
        shopName: "Updated Tester Khata Enterprise",
      }),
    });

    const data = await res.json();
    if (res.status !== 200 || !data.success || data.user.name !== "Automation Tester Updated") {
      throw new Error(`Expected 200 with updated name, got status ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 7. Test Forgot Password Recovery (/api/auth/forgot-password)
  await test("Forgot Password Recovery Dispatch (/api/auth/forgot-password)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUser.email }),
    });

    const data = await res.json();
    if (res.status !== 200 || !data.success) {
      throw new Error(`Expected 200 with success confirmation, got status ${res.status}`);
    }
  });

  // 8. Test Logout Route (/api/auth/logout)
  await test("User Logout & Cookie Invalidation (/api/auth/logout)", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.status !== 200 || !data.success) {
      throw new Error(`Expected 200 with logout confirmation, got status ${res.status}`);
    }
  });

  console.log("\n=================================================");
  console.log(` 📊 SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests().catch((err) => {
  console.error("Test runner failure:", err);
  process.exit(1);
});
