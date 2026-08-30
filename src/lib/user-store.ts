import { hashPassword, AuthUser } from "@/lib/auth";

export interface StoredUser extends AuthUser {
  passwordHash: string;
  phone?: string;
  shopName?: string;
  createdAt: string;
}

// Global in-memory storage persisted across hot-reloads in Next.js development
declare global {
  var __hisabdo_users: Map<string, StoredUser> | undefined;
}

const users: Map<string, StoredUser> =
  globalThis.__hisabdo_users || new Map<string, StoredUser>();

if (process.env.NODE_ENV !== "production") {
  globalThis.__hisabdo_users = users;
}

// Seed default accounts if empty
let isInitialized = false;

export async function initUserStore(): Promise<void> {
  if (isInitialized && users.size > 0) return;

  if (users.size === 0) {
    const demoPasswordHash = await hashPassword("password123");

    const defaultMerchant: StoredUser = {
      id: "usr_hamza_001",
      name: "Muhammad Hamza Arif",
      email: "hamza.merchant@hisabdo.com",
      role: "admin",
      passwordHash: demoPasswordHash,
      phone: "+923001234567",
      shopName: "Hamza Traders & Supplier Enterprise",
      createdAt: new Date().toISOString(),
    };

    const demoUser: StoredUser = {
      id: "usr_demo_002",
      name: "Demo Merchant",
      email: "merchant@hisabdo.com",
      role: "user",
      passwordHash: demoPasswordHash,
      phone: "+923219876543",
      shopName: "Al-Rehman General Store",
      createdAt: new Date().toISOString(),
    };

    users.set(defaultMerchant.email.toLowerCase(), defaultMerchant);
    users.set(demoUser.email.toLowerCase(), demoUser);
  }

  isInitialized = true;
}

export const userStore = {
  async findByEmail(email: string): Promise<StoredUser | null> {
    await initUserStore();
    return users.get(email.toLowerCase()) || null;
  },

  async findById(id: string): Promise<StoredUser | null> {
    await initUserStore();
    for (const user of users.values()) {
      if (user.id === id) return user;
    }
    return null;
  },

  async createUser(userData: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    shopName?: string;
    role?: "user" | "admin";
  }): Promise<StoredUser> {
    await initUserStore();
    const emailKey = userData.email.toLowerCase();

    if (users.has(emailKey)) {
      throw new Error("An account with this email address already exists.");
    }

    const newUser: StoredUser = {
      id: "usr_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      role: userData.role || "user",
      passwordHash: userData.passwordHash,
      phone: userData.phone?.trim() || "",
      shopName: userData.shopName?.trim() || `${userData.name}'s Khata Store`,
      createdAt: new Date().toISOString(),
    };

    users.set(emailKey, newUser);
    return newUser;
  },

  async updateUser(
    id: string,
    updates: Partial<Omit<StoredUser, "id" | "email" | "createdAt">>
  ): Promise<StoredUser | null> {
    await initUserStore();
    const user = await this.findById(id);
    if (!user) return null;

    const updatedUser: StoredUser = {
      ...user,
      ...updates,
      name: updates.name ? updates.name.trim() : user.name,
      shopName: updates.shopName !== undefined ? updates.shopName.trim() : user.shopName,
      phone: updates.phone !== undefined ? updates.phone.trim() : user.phone,
    };

    users.set(user.email.toLowerCase(), updatedUser);
    return updatedUser;
  },

  async getAll(): Promise<StoredUser[]> {
    await initUserStore();
    return Array.from(users.values());
  },
};
