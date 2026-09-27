"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode = "en" | "ur" | "ur_roman" | "hi" | "ar";
export type CurrencyCode = "PKR" | "USD" | "AED" | "SAR" | "INR" | "EUR" | "GBP";

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  email: string;
  logoUrl?: string;
  taxNumber?: string;
}

export interface SettingsContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currency: CurrencyCode;
  currencySymbol: string;
  setCurrency: (curr: CurrencyCode) => void;
  formatMoney: (amount: number) => string;
  businessProfile: BusinessProfile;
  updateBusinessProfile: (updates: Partial<BusinessProfile>) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  PKR: "Rs.",
  USD: "$",
  AED: "AED",
  SAR: "SAR",
  INR: "₹",
  EUR: "€",
  GBP: "£",
};

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    dashboard: "Dashboard",
    customers: "Customers & Khata",
    transactions: "Transactions",
    income: "Income",
    expenses: "Expenses",
    reports: "Reports & Analytics",
    settings: "Settings",
    totalReceivable: "Total Receivable (Lene)",
    totalPayable: "Total Payable (Dene)",
    netBalance: "Net Balance",
    monthlyIncome: "Monthly Income",
    monthlyExpenses: "Monthly Expenses",
    quickActions: "Quick Actions",
    addIncome: "Add Income",
    addExpense: "Add Expense",
    addCustomer: "Add Customer",
    recordPayment: "Record Payment",
    recentTransactions: "Recent Transactions",
    searchCustomer: "Search by customer name or phone...",
    all: "All",
    paymentReceived: "Payment Received",
    paymentSent: "Payment Sent",
    downloadPdf: "Download Statement PDF",
    whatsappReminder: "WhatsApp Reminder",
    runningBalance: "Running Balance",
    outstanding: "Outstanding Balance",
    save: "Save",
    cancel: "Cancel",
    notes: "Notes",
    date: "Date",
    amount: "Amount",
    category: "Category",
    customer: "Customer",
    paymentMethod: "Payment Method",
    businessProfile: "Business Profile",
    appearance: "Appearance",
    language: "Language",
    currency: "Currency",
    cash: "Cash",
    bankTransfer: "Bank Transfer",
    easypaisa: "Easypaisa",
    jazzcash: "JazzCash",
    cheque: "Cheque",
    guestMode: "Guest Mode",
    welcome: "Welcome",
    logout: "Log Out",
  },
  ur: {
    dashboard: "ڈیش بورڈ",
    customers: "گاہک اور کھاتہ",
    transactions: "لین دین",
    income: "آمدن",
    expenses: "اخراجات",
    reports: "رپورٹس اور تجزیات",
    settings: "ترتیبات",
    totalReceivable: "کل وصولی (لینے ہیں)",
    totalPayable: "کل ادائیگی (دینے ہیں)",
    netBalance: "خالص بیلنس",
    monthlyIncome: "ماہانہ آمدن",
    monthlyExpenses: "ماہانہ اخراجات",
    quickActions: "فوری اقدامات",
    addIncome: "آمدن درج کریں",
    addExpense: "خرچہ درج کریں",
    addCustomer: "نیا گاہک شامل کریں",
    recordPayment: "رقم وصول/ادا کریں",
    recentTransactions: "حالیہ لین دین",
    searchCustomer: "گاہک کا نام یا فون نمبر تلاش کریں...",
    all: "تمام",
    paymentReceived: "رقم وصول ہوئی (جمع)",
    paymentSent: "رقم ادا کی (بنام)",
    downloadPdf: "کھاتہ پی ڈی ایف ڈاؤنلوڈ",
    whatsappReminder: "واٹس ایپ یاد دہانی",
    runningBalance: "رواں بیلنس",
    outstanding: "بقایا رقم",
    save: "محفوظ کریں",
    cancel: "منسوخ",
    notes: "تفصیل / نوٹ",
    date: "تاریخ",
    amount: "رقم",
    category: "کیٹیگری",
    customer: "گاہک",
    paymentMethod: "طریقہ ادائیگی",
    businessProfile: "کاروباری معلومات",
    appearance: "طرز / تھیم",
    language: "زبان",
    currency: "کرنسی",
    cash: "نقد (کیش)",
    bankTransfer: "بینک ٹرانسفر",
    easypaisa: "ایزی پیسہ",
    jazzcash: "جاز کیش",
    cheque: "چیک",
    guestMode: "مہمان موڈ",
    welcome: "خوش آمدید",
    logout: "لاگ آؤٹ",
  },
  ur_roman: {
    dashboard: "Dashboard",
    customers: "Customer Aur Khata",
    transactions: "Len Den",
    income: "Aamdan",
    expenses: "Kharcha",
    reports: "Reports & Analytics",
    settings: "Settings",
    totalReceivable: "Total Lene Hain (Wasooli)",
    totalPayable: "Total Dene Hain (Adaigi)",
    netBalance: "Net Balance",
    monthlyIncome: "Mahana Aamdan",
    monthlyExpenses: "Mahana Kharchay",
    quickActions: "Quick Actions",
    addIncome: "Aamdan Likhein",
    addExpense: "Kharcha Likhein",
    addCustomer: "Naya Customer Banayein",
    recordPayment: "Payment Record Karein",
    recentTransactions: "Taza Tareen Entryan",
    searchCustomer: "Customer ka naam ya number likhein...",
    all: "Sab",
    paymentReceived: "Raqam Wasool Hui",
    paymentSent: "Raqam Ada Ki",
    downloadPdf: "Khata PDF Download",
    whatsappReminder: "WhatsApp Reminder",
    runningBalance: "Running Balance",
    outstanding: "Baqaya Balance",
    save: "Save Karein",
    cancel: "Cancel",
    notes: "Tafseel",
    date: "Tareekh",
    amount: "Raqam",
    category: "Category",
    customer: "Customer",
    paymentMethod: "Tariqa-e-Adaigi",
    businessProfile: "Dukaan / Business Info",
    appearance: "Theme",
    language: "Zaban",
    currency: "Currency",
    cash: "Naqad (Cash)",
    bankTransfer: "Bank Transfer",
    easypaisa: "Easypaisa",
    jazzcash: "JazzCash",
    cheque: "Cheque",
    guestMode: "Guest Mode",
    welcome: "Khush Amdeed",
    logout: "Logout",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    customers: "ग्राहक और खाता",
    transactions: "लेन-देन",
    income: "आय (आमदनी)",
    expenses: "व्यय (खर्च)",
    reports: "रिपोर्ट और विश्लेषण",
    settings: "सेटिंग्स",
    totalReceivable: "कुल लेना है",
    totalPayable: "कुल देना है",
    netBalance: "शुद्ध शेष (नेट बैलेंस)",
    monthlyIncome: "मासिक आय",
    monthlyExpenses: "मासिक खर्च",
    quickActions: "त्वरित कार्रवाई",
    addIncome: "आय जोड़ें",
    addExpense: "खर्च जोड़ें",
    addCustomer: "ग्राहक जोड़ें",
    recordPayment: "भुगतान दर्ज करें",
    recentTransactions: "हालिया लेन-देन",
    searchCustomer: "ग्राहक का नाम या फोन खोजें...",
    all: "सभी",
    paymentReceived: "भुगतान प्राप्त हुआ",
    paymentSent: "भुगतान दिया गया",
    downloadPdf: "खाता पीडीएफ डाउनलोड",
    whatsappReminder: "व्हाट्सएप रिमाइंडर",
    runningBalance: "रनिंग बैलेंस",
    outstanding: "बकाया राशि",
    save: "सहेजें",
    cancel: "रद्द करें",
    notes: "विवरण",
    date: "तारीख",
    amount: "राशि",
    category: "श्रेणी",
    customer: "ग्राहक",
    paymentMethod: "भुगतान विधि",
    businessProfile: "व्यापार प्रोफ़ाइल",
    appearance: "थीम",
    language: "भाषा",
    currency: "मुद्रा",
    cash: "नकद",
    bankTransfer: "बैंक ट्रांसफर",
    easypaisa: "इजीपैसा",
    jazzcash: "जैज़कैश",
    cheque: "चेक",
    guestMode: "गेस्ट मोड",
    welcome: "स्वागत है",
    logout: "लॉग आउट",
  },
  ar: {
    dashboard: "لوحة التحكم",
    customers: "العملاء ودفتر الحسابات",
    transactions: "المعاملات",
    income: "الدخل",
    expenses: "المصروفات",
    reports: "التقارير والتحليلات",
    settings: "الإعدادات",
    totalReceivable: "إجمالي المستحقات (لنا)",
    totalPayable: "إجمالي المستحقات (علينا)",
    netBalance: "صافي الرصيد",
    monthlyIncome: "الدخل الشهري",
    monthlyExpenses: "المصروفات الشهرية",
    quickActions: "إجراءات سريعة",
    addIncome: "إضافة دخل",
    addExpense: "إضافة مصروف",
    addCustomer: "إضافة عميل",
    recordPayment: "تسجيل دفعة",
    recentTransactions: "المعاملات الأخيرة",
    searchCustomer: "ابحث بالاسم أو الهاتف...",
    all: "الكل",
    paymentReceived: "دفعة مستلمة",
    paymentSent: "دفعة مدفوعة",
    downloadPdf: "تحميل كشف الحساب PDF",
    whatsappReminder: "تذكير عبر واتساب",
    runningBalance: "الرصيد التراكمي",
    outstanding: "الرصيد المتبقي",
    save: "حفظ",
    cancel: "إلغاء",
    notes: "ملاحظات",
    date: "التاريخ",
    amount: "المبلغ",
    category: "الفئة",
    customer: "العميل",
    paymentMethod: "طريقة الدفع",
    businessProfile: "الملف التجاري",
    appearance: "المظهر والسمة",
    language: "اللغة",
    currency: "العملة",
    cash: "نقداً",
    bankTransfer: "تحويل بنكي",
    easypaisa: "إيزي بيسا",
    jazzcash: "جاز كاش",
    cheque: "شيك",
    guestMode: "وضع الزائر",
    welcome: "أهلاً بك",
    logout: "تسجيل الخروج",
  },
};

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: "HisabDo Enterprise",
  ownerName: "Hamza Merchant",
  phone: "+92 300 1234567",
  address: "Main Commercial Market, Lahore, Pakistan",
  email: "contact@hisabdo.com",
};

const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [currency, setCurrencyState] = useState<CurrencyCode>("PKR");
  const [businessProfile, setBusinessProfileState] = useState<BusinessProfile>(DEFAULT_PROFILE);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("hisabdo_theme") as "light" | "dark" | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme("dark"); // Default dark mode matching HisabDo mobile
      }

      const savedLang = localStorage.getItem("hisabdo_lang") as LanguageCode | null;
      if (savedLang && translations[savedLang]) {
        setLanguageState(savedLang);
      }

      const savedCurr = localStorage.getItem("hisabdo_curr") as CurrencyCode | null;
      if (savedCurr && CURRENCY_SYMBOLS[savedCurr]) {
        setCurrencyState(savedCurr);
      }

      const savedProfile = localStorage.getItem("hisabdo_profile");
      if (savedProfile) {
        setBusinessProfileState(JSON.parse(savedProfile));
      }
    } catch (e) {
      console.warn("Error loading settings from storage:", e);
    }
  }, []);

  // Sync theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("hisabdo_theme", theme);
  }, [theme]);

  // Sync RTL and lang attribute
  useEffect(() => {
    const isRtl = language === "ur" || language === "ar";
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", language);
    localStorage.setItem("hisabdo_lang", language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("hisabdo_lang", lang);
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    localStorage.setItem("hisabdo_curr", curr);
  };

  const updateBusinessProfile = (updates: Partial<BusinessProfile>) => {
    setBusinessProfileState((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("hisabdo_profile", JSON.stringify(updated));
      return updated;
    });
  };

  const formatMoney = (amount: number) => {
    const sym = CURRENCY_SYMBOLS[currency] || "Rs.";
    const absVal = Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${amount < 0 ? "-" : ""}${sym} ${absVal}`;
  };

  const t = (key: string): string => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  const isRTL = language === "ur" || language === "ar";

  return (
    <SettingsContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        currency,
        currencySymbol: CURRENCY_SYMBOLS[currency] || "Rs.",
        setCurrency,
        formatMoney,
        businessProfile,
        updateBusinessProfile,
        t,
        isRTL,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
