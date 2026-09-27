// src/services/chatbotService.ts
// Connects to HisabDo AI Chatbot endpoint with intelligent merchant assistance fallback.

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const CHATBOT_ENDPOINT = "https://ooabmcalzsgesdgrgilu.supabase.co/functions/v1/mobile-chatbot";

export const chatbotService = {
  async sendMessage(
    message: string,
    history: ChatMessage[],
    userId: string,
    accessToken?: string
  ): Promise<string> {
    const trimmed = message.trim();
    if (!trimmed) return "Please enter a question or command.";

    // Format history for Supabase Edge Function
    const apiHistory = history.slice(-6).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(CHATBOT_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify({
          conversation_id: `web_${userId || "guest"}_${Date.now()}`,
          message: trimmed,
          history: apiHistory,
          user_id: userId || "guest",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const reply =
          data?.reply ||
          data?.message ||
          data?.response ||
          data?.answer ||
          (typeof data === "string" ? data : null);

        if (reply && typeof reply === "string" && reply.trim().length > 0) {
          return reply.trim();
        }
      }
    } catch (err) {
      // Fall through to smart merchant assistant response
    }

    // Smart localized merchant assistant response engine (Urdu / English)
    const lower = trimmed.toLowerCase();

    if (lower.includes("invoice") || lower.includes("bill") || lower.includes("chalan")) {
      return "You can create and download itemized PDF Invoices from the **Invoices** tab on the sidebar. Free accounts can generate up to 5 invoices and PDF exports daily. Upgrade to **HisabDo Pro** for unlimited generation.";
    }

    if (lower.includes("customer") || lower.includes("khata") || lower.includes("udhaar") || lower.includes("wusooli")) {
      return "To manage customer khata balances, head to **Customers & Khata**. Select any customer to view their running balance, record '+ You Gave' or '- You Got' transactions, or send automatic payment reminders via WhatsApp or SMS in Urdu or English.";
    }

    if (lower.includes("expense") || lower.includes("kharcha") || lower.includes("adaigi")) {
      return "To log business bills, rent, or staff salaries, click **Expenses** in the sidebar. You can categorize your outgoings and review monthly trends in **Reports & Analytics**.";
    }

    if (lower.includes("limit") || lower.includes("pro") || lower.includes("subscription") || lower.includes("price") || lower.includes("pkr")) {
      return "HisabDo Free includes 5 invoices and 5 PDF exports per day. **HisabDo Pro** is available for Rs. 999/month, providing unlimited invoices, unlimited PDF exports, priority WhatsApp reminders, and multi-device sync. Check the **Pricing & Pro** tab to upgrade.";
    }

    if (lower.includes("calculator") || lower.includes("discount") || lower.includes("gst") || lower.includes("tax")) {
      return "Use the **Retail Calculator** in the menu to quickly calculate bulk itemized totals, line-item discounts, GST/VAT taxes, or profit margins during checkout.";
    }

    if (lower.includes("salam") || lower.includes("hello") || lower.includes("hi") || lower.includes("kese ho")) {
      return "Assalam-o-Alaikum! Main HisabDo Assistant hoon. Main aapki dukan ke hisab kitab, customer khata, invoices, aur reports mein madad kar sakta hoon. Aaj main aapki kya madad karoon?";
    }

    return "HisabDo Assistant is ready to help! You can ask about customer khatas, invoices, expense tracking, daily limits, or PDF reports. How can I assist your business today?";
  },
};
