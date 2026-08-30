import type { Metadata } from "next";
import "./globals.css";
import ChatbotWidget from "../components/ChatbotWidget";

export const metadata: Metadata = {
  title: "HisabDo — Digital Ledger & Expense Tracker",
  description: "Local-first digital ledger, Khata, and daily expense management for businesses and individuals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}