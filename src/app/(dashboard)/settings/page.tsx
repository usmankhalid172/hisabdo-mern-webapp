"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Globe,
  DollarSign,
  Store,
  Save,
  Check,
  Shield,
  Trash2,
  LogOut,
  Sun,
  Moon,
  User,
  Phone,
  MapPin,
  Mail,
  FileText,
  RotateCcw,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings, LanguageCode, CurrencyCode, BusinessProfile } from "@/context/SettingsContext";
import { mobileDataParityService } from "@/services/mobileDataParityService";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/design-system/Card";
import { PageHeading } from "@/components/ui/design-system/PageHeading";
import { LoadingState } from "@/components/ui/design-system/LoadingState";
import { ErrorState } from "@/components/ui/design-system/ErrorState";
import { Input } from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function SettingsPage() {
  const { user, logout, isGuest } = useAuth();
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    currency,
    currencySymbol,
    setCurrency,
    formatMoney,
    businessProfile,
    updateBusinessProfile,
    isRTL,
    t,
  } = useSettings();

  // Loading & Error States
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);

  // User Feedback state
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Dialog state for Cache Reset / Logout
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Business Profile Form State
  const [businessForm, setBusinessForm] = useState({
    businessName: businessProfile.businessName || "",
    ownerName: businessProfile.ownerName || "",
    taxNumber: businessProfile.taxNumber || "",
    address: businessProfile.address || "",
  });

  // Contact Details Form State
  const [contactForm, setContactForm] = useState({
    phone: businessProfile.phone || "",
    email: businessProfile.email || "",
  });

  // Sync state with context when businessProfile changes (e.g. initial remote load)
  useEffect(() => {
    setBusinessForm({
      businessName: businessProfile.businessName || "",
      ownerName: businessProfile.ownerName || "",
      taxNumber: businessProfile.taxNumber || "",
      address: businessProfile.address || "",
    });
    setContactForm({
      phone: businessProfile.phone || "",
      email: businessProfile.email || "",
    });
  }, [businessProfile]);

  // Languages supported by HisabDo
  const languages: { code: LanguageCode; label: string; nativeName: string; desc: string; rtl?: boolean }[] = [
    { code: "en", label: "English", nativeName: "English", desc: "Default international format", rtl: false },
    { code: "ur", label: "Urdu", nativeName: "اردو", desc: "مکمل اردو ترجمہ اور دائیں سے بائیں (RTL)", rtl: true },
    { code: "ur_roman", label: "Roman Urdu", nativeName: "Roman Urdu", desc: "Aasan Roman Urdu me hisab kitab", rtl: false },
    { code: "hi", label: "Hindi", nativeName: "हिंदी", desc: "हिंदी भाषा और भारतीय संदर्भ", rtl: false },
    { code: "ar", label: "Arabic", nativeName: "العربية", desc: "اللغة العربية ودعم RTL الكامل", rtl: true },
  ];

  // Currencies supported by HisabDo
  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: "PKR", label: "Pakistani Rupee", symbol: "Rs." },
    { code: "USD", label: "United States Dollar", symbol: "$" },
    { code: "AED", label: "UAE Dirham", symbol: "AED" },
    { code: "SAR", label: "Saudi Riyal", symbol: "SAR" },
    { code: "INR", label: "Indian Rupee", symbol: "₹" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "GBP", label: "British Pound", symbol: "£" },
  ];

  // Save Business Profile
  const handleSaveBusinessProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessForm.businessName.trim()) {
      setFeedback({
        type: "error",
        message: "Business name is required.",
      });
      return;
    }

    setIsSavingProfile(true);
    setFeedback(null);

    try {
      const updates: Partial<BusinessProfile> = {
        businessName: businessForm.businessName.trim(),
        ownerName: businessForm.ownerName.trim(),
        taxNumber: businessForm.taxNumber.trim(),
        address: businessForm.address.trim(),
      };

      // 1. Update Context and Local Storage
      updateBusinessProfile(updates);

      // 2. Persist to Backend if Authenticated
      if (user?.id && !isGuest) {
        await mobileDataParityService.saveBusinessProfile(user.id, {
          business_name: updates.businessName || businessProfile.businessName,
          phone: contactForm.phone || businessProfile.phone,
          email: contactForm.email || businessProfile.email,
          metadata: {
            owner_name: updates.ownerName,
            address: updates.address,
            tax_number: updates.taxNumber,
          },
        });
      }

      setFeedback({
        type: "success",
        message: "Business profile saved successfully!",
      });
    } catch (err: any) {
      console.error("Save business profile error:", err);
      setFeedback({
        type: "error",
        message: err?.message || "Failed to save business profile. Please check your network connection.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Reset Business Profile Form
  const handleResetBusinessForm = () => {
    setBusinessForm({
      businessName: businessProfile.businessName || "",
      ownerName: businessProfile.ownerName || "",
      taxNumber: businessProfile.taxNumber || "",
      address: businessProfile.address || "",
    });
    setFeedback(null);
  };

  // Save Contact Details
  const handleSaveContactDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContact(true);
    setFeedback(null);

    try {
      const updates: Partial<BusinessProfile> = {
        phone: contactForm.phone.trim(),
        email: contactForm.email.trim(),
      };

      // 1. Update Context and Local Storage
      updateBusinessProfile(updates);

      // 2. Persist to Backend if Authenticated
      if (user?.id && !isGuest) {
        await mobileDataParityService.saveBusinessProfile(user.id, {
          business_name: businessForm.businessName || businessProfile.businessName,
          phone: updates.phone,
          email: updates.email,
          metadata: {
            owner_name: businessForm.ownerName || businessProfile.ownerName,
            address: businessForm.address || businessProfile.address,
            tax_number: businessForm.taxNumber || businessProfile.taxNumber,
          },
        });
      }

      setFeedback({
        type: "success",
        message: "Contact details updated successfully!",
      });
    } catch (err: any) {
      console.error("Save contact details error:", err);
      setFeedback({
        type: "error",
        message: err?.message || "Failed to update contact details. Please check your network connection.",
      });
    } finally {
      setIsSavingContact(false);
    }
  };

  // Reset Contact Details Form
  const handleResetContactForm = () => {
    setContactForm({
      phone: businessProfile.phone || "",
      email: businessProfile.email || "",
    });
    setFeedback(null);
  };

  // Reset Application Cache and Sign Out
  const handleConfirmResetCache = () => {
    setIsResetDialogOpen(false);
    localStorage.clear();
    logout();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* ================= 1. PAGE HEADING ================= */}
      <div className="pb-2 border-b border-border">
        <PageHeading
          title={t("settings") || "Settings"}
          description="Customize your business identity, contact details, regional preferences, and application settings."
          action={
            <div className="flex items-center gap-2">
              <Badge variant={user && !isGuest ? "green" : "amber"}>
                {user && !isGuest ? "Cloud Synced" : "Guest Mode"}
              </Badge>
              {isRTL && (
                <Badge variant="purple">
                  RTL Mode Active
                </Badge>
              )}
            </div>
          }
        />
      </div>

      {/* ================= 2. ACTION FEEDBACK BANNER ================= */}
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-control text-sm font-semibold flex items-center justify-between border shadow-card transition-all ${
            feedback.type === "success"
              ? "bg-success/10 text-success border-success/30"
              : "bg-danger/10 text-danger border-danger/30"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <Check className="w-5 h-5 shrink-0" />
            ) : (
              <Info className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-control hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ms-2"
            aria-label="Dismiss feedback message"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= 3. BUSINESS PROFILE SECTION ================= */}
      <Card className="p-6 rounded-card shadow-card space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-control bg-primary/10 text-primary">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {t("businessProfile") || "Business Profile"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Official shop or business identity printed on customer statements and khata receipts
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveBusinessProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business / Shop Name *"
              required
              value={businessForm.businessName}
              onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
              placeholder="e.g. Hamza Traders Enterprise"
              helperText="The primary commercial title for your ledger."
            />

            <Input
              label="Owner / Merchant Name"
              value={businessForm.ownerName}
              onChange={(e) => setBusinessForm({ ...businessForm, ownerName: e.target.value })}
              placeholder="e.g. Hamza Merchant"
              helperText="Proprietor or primary merchant name."
            />

            <Input
              label="Tax / NTN / Registration Number"
              value={businessForm.taxNumber}
              onChange={(e) => setBusinessForm({ ...businessForm, taxNumber: e.target.value })}
              placeholder="e.g. 1234567-8"
              helperText="Optional business tax identifier."
            />

            <div className="sm:col-span-2">
              <Input
                label="Business Address & Market"
                value={businessForm.address}
                onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
                placeholder="Shop #, Plaza / Market Name, City, Country"
                helperText="Physical shop or warehouse location."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={RotateCcw}
              onClick={handleResetBusinessForm}
              disabled={isSavingProfile}
            >
              Cancel / Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              disabled={isSavingProfile}
              loading={isSavingProfile}
            >
              Save Business Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* ================= 4. PERSONAL PROFILE & CONTACT DETAILS ================= */}
      <Card className="p-6 rounded-card shadow-card space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-control bg-primary/10 text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Personal Account & Contact Details
              </h2>
              <p className="text-xs text-muted-foreground">
                Direct phone number for customer WhatsApp reminders and account communications
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveContactDetails} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone (for WhatsApp Reminders)"
              type="tel"
              value={contactForm.phone}
              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              placeholder="+92 300 1234567"
              helperText="Included in WhatsApp Khata payment reminders."
            />

            <Input
              label="Official Account Email"
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              placeholder="merchant@hisabdo.com"
              helperText="Used for statements, invoices, and audit reports."
            />
          </div>

          {/* Account Mode Info Banner */}
          <div className="p-3.5 rounded-control bg-surface-muted border border-border flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">
                Session Mode: {user && !isGuest ? "Authenticated User" : "Local Guest Storage"}
              </span>
              <span className="text-muted-foreground block">
                {user?.id ? `User ID: ${user.id}` : "Data is stored securely in your browser's local sandbox."}
              </span>
            </div>
            <Badge variant={user && !isGuest ? "green" : "amber"}>
              {user && !isGuest ? "Cloud Active" : "Local Mode"}
            </Badge>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={RotateCcw}
              onClick={handleResetContactForm}
              disabled={isSavingContact}
            >
              Cancel / Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              disabled={isSavingContact}
              loading={isSavingContact}
            >
              Save Contact Details
            </Button>
          </div>
        </form>
      </Card>

      {/* ================= 5. REGIONAL PREFERENCES (LANGUAGE & CURRENCY) ================= */}
      <Card className="p-6 rounded-card shadow-card space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="p-2 rounded-control bg-primary/10 text-primary">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {t("language") || "Language"} &amp; Regional Formatting
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose your preferred interface language, text direction, and accounting currency
            </p>
          </div>
        </div>

        {/* 5A. Language Selection Grid */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
            Display Language &amp; Direction
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {languages.map((l) => {
              const isSelected = language === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`p-4 rounded-card border text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground shadow-card"
                      : "bg-surface-muted border-border hover:bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">
                      {l.label} <span className="text-xs opacity-75 font-normal">({l.nativeName})</span>
                    </span>
                    {isSelected && (
                      <Badge variant="green">
                        <Check className="w-3 h-3 me-0.5" />
                        <span>Active</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">
                    {l.desc}
                  </p>
                  {l.rtl && (
                    <span className="inline-block mt-2 text-[10px] font-semibold text-primary">
                      &bull; RTL Layout Supported
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5B. Currency Selection Grid */}
        <div className="space-y-2.5 pt-4 border-t border-border">
          <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
            Accounting Currency Symbol ({currencySymbol})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {currencies.map((c) => {
              const isSelected = currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={`p-3 rounded-card border text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? "bg-success/10 border-success text-success shadow-card font-bold"
                      : "bg-surface-muted border-border hover:bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-lg font-black block text-foreground">
                    {c.symbol}
                  </span>
                  <span className="text-xs font-bold block mt-0.5">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Currency formatting live preview */}
          <div className="mt-3 p-3 rounded-control bg-surface-muted border border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Currency Preview (Positive &amp; Negative):</span>
            <div className="flex items-center gap-3 font-mono font-bold">
              <span className="text-success">{formatMoney(12500.5)}</span>
              <span className="text-danger">{formatMoney(-4200.75)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ================= 6. APPEARANCE & THEME ================= */}
      <Card className="p-6 rounded-card shadow-card space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="p-2 rounded-control bg-primary/10 text-primary">
            {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {t("appearance") || "Appearance"} &amp; Theme Mode
            </h2>
            <p className="text-xs text-muted-foreground">
              Toggle between high-contrast dark theme and clean light theme
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-control bg-surface-muted border border-border">
          <div>
            <p className="text-sm font-bold text-foreground">
              Current Theme: {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </p>
            <p className="text-xs text-muted-foreground">
              Theme preference is saved locally and applies instantly across all dashboard pages.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={theme === "dark" ? Sun : Moon}
            onClick={toggleTheme}
          >
            {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </Button>
        </div>
      </Card>

      {/* ================= 7. DATA, CACHE & SECURITY ================= */}
      <Card className="p-6 rounded-card shadow-card space-y-5 border-danger/20">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <div className="p-2 rounded-control bg-danger/10 text-danger">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Data, Cache &amp; Account Session
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage locally cached settings and sign out of your session
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-control bg-danger/5 border border-danger/20">
          <div>
            <p className="text-sm font-bold text-danger">
              Clear Application Cache &amp; Sign Out
            </p>
            <p className="text-xs text-muted-foreground">
              Clears local offline storage, cached preferences, and logs out of the current session.
            </p>
          </div>

          <Button
            type="button"
            variant="danger"
            size="md"
            icon={Trash2}
            onClick={() => setIsResetDialogOpen(true)}
          >
            Reset Cache &amp; Sign Out
          </Button>
        </div>
      </Card>

      {/* ================= 8. CONFIRM RESET DIALOG ================= */}
      <ConfirmDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleConfirmResetCache}
        title="Clear Local Cache & Sign Out?"
        message="Are you sure you want to clear your local session cache and sign out? Any unsaved local changes will be cleared."
        confirmText="Reset & Sign Out"
        cancelText="Keep My Session"
      />
    </div>
  );
}
