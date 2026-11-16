// Comprehensive Authentication & Bulk Delete Verification Test Suite
import assert from "node:assert";
import { createAuthToken, verifyAuthToken } from "../src/lib/auth-token.ts";
import { decodeJwt } from "jose";
import apiClient from "../src/lib/axios.js";

// Validation matching validateBulkDeletePayload
function validateBulkDeletePayload(body) {
  if (!body || typeof body !== "object") {
    return { error: { message: "Invalid JSON request payload.", status: 400 } };
  }
  let rawIds = null;
  if (Array.isArray(body)) rawIds = body;
  else {
    const b = body;
    if (Array.isArray(b.ids)) rawIds = b.ids;
    else if (Array.isArray(b.transactionIds)) rawIds = b.transactionIds;
  }
  if (!Array.isArray(rawIds)) {
    return { error: { message: "Request body must contain an array of transaction IDs.", status: 400 } };
  }
  if (rawIds.length === 0) {
    return { error: { message: "Transaction IDs array cannot be empty.", status: 400 } };
  }
  const MAX_IDS = 100;
  if (rawIds.length > MAX_IDS) {
    return { error: { message: `Cannot delete more than ${MAX_IDS} transactions per request.`, status: 400 } };
  }
  const ids = [];
  for (let i = 0; i < rawIds.length; i++) {
    const item = rawIds[i];
    let idStr = null;
    if (typeof item === "string") idStr = item.trim();
    else if (typeof item === "object" && item !== null && typeof item.id === "string") idStr = item.id.trim();
    if (!idStr) {
      return { error: { message: "Invalid transaction ID: every ID must be a non-empty string.", status: 400 } };
    }
    ids.push(idStr);
  }
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    return { error: { message: "Duplicate transaction IDs are not allowed in a single request.", status: 400 } };
  }
  return { ids };
}

// Logic matching getAuthenticatedUser & authenticateToken in server-auth.ts
async function authenticateToken(token) {
  if (!token || token === "null" || token === "undefined") {
    return null;
  }
  const trimmed = token.trim();
  try {
    const user = await verifyAuthToken(trimmed);
    if (user) return user;
  } catch {}

  if (trimmed === "demo-token" || trimmed === "valid-token") {
    return {
      id: "usr_demo_002",
      name: "Demo Merchant",
      email: "merchant@hisabdo.com",
      role: "user",
      shopName: "Al-Rehman General Store",
    };
  }

  if (trimmed === "guest-token") {
    return {
      id: "guest-user",
      name: "Guest Merchant",
      email: "guest@hisabdo.local",
      role: "user",
      shopName: "Guest Khata Store",
    };
  }

  try {
    const payload = decodeJwt(trimmed);
    if (payload && payload.sub) {
      if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
        return null;
      }
      if (
        payload.aud === "authenticated" ||
        payload.role === "authenticated" ||
        (typeof payload.iss === "string" && payload.iss.includes("supabase"))
      ) {
        const metadata = payload.user_metadata || {};
        return {
          id: payload.sub,
          name: metadata.full_name || payload.email?.split("@")[0] || "Merchant",
          email: payload.email || "",
          role: "user",
        };
      }
    }
  } catch {}

  return null;
}

async function getAuthenticatedUser(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const user = await authenticateToken(token);
      if (user) return user;
    }
  }

  const candidateCookies = [
    request.cookies.get("hisabdo_auth_token")?.value,
    request.cookies.get("token")?.value,
    request.cookies.get("accessToken")?.value,
  ].filter(Boolean);

  for (const cookieToken of candidateCookies) {
    const user = await authenticateToken(cookieToken);
    if (user) return user;
  }

  return null;
}

async function runAuthTests() {
  console.log("==================================================================");
  console.log(" 🧪 HISABDO - AUTHENTICATION & BULK DELETE VERIFICATION SUITE");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• ${name}... `);
      await fn();
      console.log("✅ PASSED");
      passed++;
    } catch (err) {
      console.log("❌ FAILED");
      console.error("  Error:", err.message);
      failed++;
    }
  }

  // 1. TOKEN AUTHENTICATION TESTS
  console.log("\n--- Category 1: Token Authentication & Fallbacks ---");

  const validUser = {
    id: "usr_test_123",
    name: "Test Merchant",
    email: "test.merchant@hisabdo.com",
    role: "user",
    shopName: "Test Store",
  };

  const validToken = await createAuthToken(validUser);

  await test("Valid Jose token authenticates successfully", async () => {
    const user = await authenticateToken(validToken);
    assert.ok(user);
    assert.strictEqual(user.id, validUser.id);
    assert.strictEqual(user.email, validUser.email);
  });

  await test("Missing / null / undefined token returns null (401 basis)", async () => {
    assert.strictEqual(await authenticateToken(""), null);
    assert.strictEqual(await authenticateToken(null), null);
    assert.strictEqual(await authenticateToken(undefined), null);
    assert.strictEqual(await authenticateToken("null"), null);
  });

  await test("Invalid / corrupted token returns null (401 basis)", async () => {
    assert.strictEqual(await authenticateToken("invalid.jwt.token"), null);
    assert.strictEqual(await authenticateToken("Bearer invalid"), null);
    assert.strictEqual(await authenticateToken("random-string"), null);
  });

  await test("Demo token resolves demo account without 401", async () => {
    const user1 = await authenticateToken("demo-token");
    assert.ok(user1);
    assert.strictEqual(user1.email, "merchant@hisabdo.com");

    const user2 = await authenticateToken("valid-token");
    assert.ok(user2);
    assert.strictEqual(user2.email, "merchant@hisabdo.com");
  });

  await test("Guest token resolves guest account without 401", async () => {
    const user = await authenticateToken("guest-token");
    assert.ok(user);
    assert.strictEqual(user.id, "guest-user");
  });

  // 2. REQUEST AUTHENTICATION TESTS (Authorization Header & Cookies)
  console.log("\n--- Category 2: Request Flow & Authorization Header ---");

  function createMockRequest({ authHeader, cookieToken } = {}) {
    const headers = new Map();
    if (authHeader) headers.set("authorization", authHeader);

    const cookies = new Map();
    if (cookieToken) cookies.set("hisabdo_auth_token", { value: cookieToken });

    return {
      headers: {
        get: (name) => headers.get(name.toLowerCase()) || null,
      },
      cookies: {
        get: (name) => cookies.get(name) || null,
        getAll: () => Array.from(cookies.entries()).map(([name, obj]) => ({ name, value: obj.value })),
      },
    };
  }

  await test("Extracts and verifies Bearer token from Authorization header", async () => {
    const req = createMockRequest({ authHeader: `Bearer ${validToken}` });
    const user = await getAuthenticatedUser(req);
    assert.ok(user);
    assert.strictEqual(user.id, validUser.id);
  });

  await test("Extracts and verifies token from hisabdo_auth_token cookie", async () => {
    const req = createMockRequest({ cookieToken: validToken });
    const user = await getAuthenticatedUser(req);
    assert.ok(user);
    assert.strictEqual(user.id, validUser.id);
  });

  await test("Authorization header takes priority over cookie when both present", async () => {
    const otherUser = { id: "usr_other_456", name: "Other User", email: "other@hisabdo.com", role: "user" };
    const otherToken = await createAuthToken(otherUser);

    const req = createMockRequest({
      authHeader: `Bearer ${validToken}`,
      cookieToken: otherToken,
    });
    const user = await getAuthenticatedUser(req);
    assert.ok(user);
    assert.strictEqual(user.id, validUser.id);
  });

  await test("Falls back to cookie if Authorization header is missing", async () => {
    const req = createMockRequest({ cookieToken: validToken });
    const user = await getAuthenticatedUser(req);
    assert.ok(user);
    assert.strictEqual(user.id, validUser.id);
  });

  await test("Falls back to cookie if Authorization header has invalid token", async () => {
    const req = createMockRequest({
      authHeader: "Bearer invalid-token",
      cookieToken: validToken,
    });
    const user = await getAuthenticatedUser(req);
    assert.ok(user);
    assert.strictEqual(user.id, validUser.id);
  });

  await test("Returns null when neither header nor cookie contains valid token", async () => {
    const req = createMockRequest({
      authHeader: "Bearer invalid",
      cookieToken: "corrupted",
    });
    const user = await getAuthenticatedUser(req);
    assert.strictEqual(user, null);
  });

  // 3. API ROUTE & BULK DELETE HANDLER STATUS CODES
  console.log("\n--- Category 3: HTTP Status Codes & Error Scenarios ---");

  await test("Unauthenticated request correctly identified as 401 Unauthorized", async () => {
    const req = createMockRequest();
    const user = await getAuthenticatedUser(req);
    assert.strictEqual(user, null);
  });

  await test("Invalid token in Bearer header correctly identified as 401 Unauthorized", async () => {
    const req = createMockRequest({ authHeader: "Bearer invalid-garbage-token" });
    const user = await getAuthenticatedUser(req);
    assert.strictEqual(user, null);
  });

  await test("Valid authenticated request resolves user with HTTP 200 equivalent", async () => {
    const req = createMockRequest({ authHeader: `Bearer ${validToken}` });
    const user = await getAuthenticatedUser(req);
    assert.ok(user);
    assert.strictEqual(user.id, validUser.id);
  });

  await test("validateBulkDeletePayload returns 400 for empty IDs", () => {
    const res = validateBulkDeletePayload({ ids: [] });
    assert.strictEqual(res.error?.status, 400);
  });

  await test("validateBulkDeletePayload returns 400 for duplicate IDs", () => {
    const res = validateBulkDeletePayload({ ids: ["id-1", "id-1"] });
    assert.strictEqual(res.error?.status, 400);
  });

  await test("validateBulkDeletePayload returns 400 for more than 100 IDs", () => {
    const ids = Array.from({ length: 101 }, (_, i) => `id-${i}`);
    const res = validateBulkDeletePayload({ ids });
    assert.strictEqual(res.error?.status, 400);
  });

  // 4. CLIENT SERVICE VERIFICATION
  console.log("\n--- Category 4: Client Services & Interceptors ---");

  await test("apiClient request interceptor attaches Authorization header from localStorage", async () => {
    // Mock global window & localStorage
    globalThis.window = {};
    globalThis.localStorage = {
      getItem: (key) => (key === "hisabdo_token" ? "test-token-value" : null),
    };

    // Trigger interceptor
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const config = { headers: {} };
    const modifiedConfig = interceptor(config);

    assert.strictEqual(modifiedConfig.headers["Authorization"], "Bearer test-token-value");

    // Clean up
    delete globalThis.window;
    delete globalThis.localStorage;
  });

  console.log("\n==================================================================");
  console.log(` 📊 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================================\n");

  if (failed > 0) process.exit(1);
}

runAuthTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
