// src/services/subscriptionService.ts
// Handles Free vs Pro entitlements: 5 free daily invoices and 5 free daily PDF exports.

export type SubscriptionPlan = "free" | "pro";

export type EntitlementFeature = "invoice_create" | "invoice_pdf" | "ledger_pdf" | "summary_pdf";

export interface EntitlementUsage {
  feature: EntitlementFeature;
  plan: SubscriptionPlan;
  used: number;
  limit: number;
  remaining: number | null; // null if unlimited
  isUnlimited: boolean;
}

const DEFAULT_DAILY_LIMIT = 5;

class SubscriptionService {
  private getStorageKey(userId: string, key: string): string {
    return `hisabdo_${userId || "guest"}_${key}`;
  }

  private getTodayDateKey(): string {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  }

  // Get current active plan
  getPlan(userId: string): SubscriptionPlan {
    if (typeof window === "undefined") return "free";
    try {
      const stored = localStorage.getItem(this.getStorageKey(userId, "plan"));
      return stored === "pro" ? "pro" : "free";
    } catch {
      return "free";
    }
  }

  // Set / Upgrade plan
  setPlan(userId: string, plan: SubscriptionPlan): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.getStorageKey(userId, "plan"), plan);
    } catch (e) {
      console.warn("Error setting plan:", e);
    }
  }

  isPro(userId: string): boolean {
    return this.getPlan(userId) === "pro";
  }

  // Get daily usage for a feature
  getUsage(userId: string, feature: EntitlementFeature): EntitlementUsage {
    const plan = this.getPlan(userId);
    if (plan === "pro") {
      return {
        feature,
        plan: "pro",
        used: 0,
        limit: Infinity,
        remaining: null,
        isUnlimited: true,
      };
    }

    if (typeof window === "undefined") {
      return {
        feature,
        plan: "free",
        used: 0,
        limit: DEFAULT_DAILY_LIMIT,
        remaining: DEFAULT_DAILY_LIMIT,
        isUnlimited: false,
      };
    }

    try {
      const today = this.getTodayDateKey();
      const dateStored = localStorage.getItem(this.getStorageKey(userId, "usage_date"));

      // Reset counters if new day
      if (dateStored !== today) {
        localStorage.setItem(this.getStorageKey(userId, "usage_date"), today);
        this.resetDailyUsage(userId);
      }

      const count = parseInt(localStorage.getItem(this.getStorageKey(userId, `usage_${feature}`)) || "0", 10);
      const remaining = Math.max(0, DEFAULT_DAILY_LIMIT - count);

      return {
        feature,
        plan: "free",
        used: count,
        limit: DEFAULT_DAILY_LIMIT,
        remaining,
        isUnlimited: false,
      };
    } catch {
      return {
        feature,
        plan: "free",
        used: 0,
        limit: DEFAULT_DAILY_LIMIT,
        remaining: DEFAULT_DAILY_LIMIT,
        isUnlimited: false,
      };
    }
  }

  // Check if an action can be performed
  canPerform(userId: string, feature: EntitlementFeature): boolean {
    const usage = this.getUsage(userId, feature);
    if (usage.isUnlimited) return true;
    return (usage.remaining ?? 0) > 0;
  }

  // Increment usage after generating invoice or exporting PDF
  incrementUsage(userId: string, feature: EntitlementFeature): EntitlementUsage {
    const plan = this.getPlan(userId);
    if (plan === "pro") {
      return this.getUsage(userId, feature);
    }

    if (typeof window !== "undefined") {
      try {
        const today = this.getTodayDateKey();
        localStorage.setItem(this.getStorageKey(userId, "usage_date"), today);
        const current = parseInt(localStorage.getItem(this.getStorageKey(userId, `usage_${feature}`)) || "0", 10);
        localStorage.setItem(this.getStorageKey(userId, `usage_${feature}`), String(current + 1));
      } catch (e) {
        console.warn("Error incrementing usage:", e);
      }
    }

    return this.getUsage(userId, feature);
  }

  private resetDailyUsage(userId: string): void {
    const features: EntitlementFeature[] = ["invoice_create", "invoice_pdf", "ledger_pdf", "summary_pdf"];
    for (const f of features) {
      localStorage.removeItem(this.getStorageKey(userId, `usage_${f}`));
    }
  }
}

export const subscriptionService = new SubscriptionService();
