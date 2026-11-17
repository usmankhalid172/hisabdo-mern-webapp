"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Store,
  Phone,
  Save,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Key,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile, activeBranch } = useAuth();
  const { theme } = useSettings();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    shopName: user?.shopName || "",
    phone: user?.phone || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync state if user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        shopName: user.shopName || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setStatusMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setIsEditing(false);
      } else {
        setStatusMessage({
          type: "error",
          text: result.message || "Failed to update profile.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Network error occurred.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Merchant Profile</h1>
          <p className="text-slate-400 text-sm">
            Manage your personal merchant identity, store details, and security credentials
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setStatusMessage(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition self-start sm:self-auto border ${theme === "dark" ? "bg-slate-900 hover:bg-slate-800 border-slate-700 text-white" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm"}`}
        >
          {isEditing ? "Cancel Editing" : "Edit Profile Details"}
        </button>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className={`rounded-2xl border p-6 space-y-6 ${theme === "dark" ? "bg-[#1E1E1E] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-800/80">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl font-extrabold shadow-inner">
            {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{user?.name || "Merchant Owner"}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" /> {user?.role || "user"} Account
              </span>
            </div>
            <p className="text-slate-400 text-xs flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-500" />
              <span>{user?.shopName || "HisabDo Registered Merchant"}</span>
            </p>
            <p className="text-slate-500 text-[11px]">
              Active Branch: <strong className="text-slate-300">{activeBranch?.name}</strong>
            </p>
          </div>
        </div>

        {/* Profile Details or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm border focus:outline-none focus:border-emerald-500 ${theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business / Store Name
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={formData.shopName}
                    onChange={(e) =>
                      setFormData({ ...formData, shopName: e.target.value })
                    }
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm border focus:outline-none focus:border-emerald-500 ${theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="03001234567"
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm border focus:outline-none focus:border-emerald-500 ${theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    disabled
                    value={user?.email || ""}
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm border cursor-not-allowed ${theme === "dark" ? "bg-slate-950/50 border-slate-800 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-400"}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`border rounded-xl p-3.5 space-y-1 ${theme === "dark" ? "bg-slate-950/60 border-slate-800/80" : "bg-slate-50 border-slate-200"}`}>
              <span className="text-[11px] font-semibold text-slate-400 block">Full Name</span>
              <p className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                <User className="w-4 h-4 text-emerald-400" /> {user?.name || "N/A"}
              </p>
            </div>

            <div className={`border rounded-xl p-3.5 space-y-1 ${theme === "dark" ? "bg-slate-950/60 border-slate-800/80" : "bg-slate-50 border-slate-200"}`}>
              <span className="text-[11px] font-semibold text-slate-400 block">Email Address</span>
              <p className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                <Mail className="w-4 h-4 text-emerald-400" /> {user?.email || "N/A"}
              </p>
            </div>

            <div className={`border rounded-xl p-3.5 space-y-1 ${theme === "dark" ? "bg-slate-950/60 border-slate-800/80" : "bg-slate-50 border-slate-200"}`}>
              <span className="text-[11px] font-semibold text-slate-400 block">Shop / Business</span>
              <p className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                <Store className="w-4 h-4 text-emerald-400" /> {user?.shopName || "Merchant Store"}
              </p>
            </div>

            <div className={`border rounded-xl p-3.5 space-y-1 ${theme === "dark" ? "bg-slate-950/60 border-slate-800/80" : "bg-slate-50 border-slate-200"}`}>
              <span className="text-[11px] font-semibold text-slate-400 block">Phone Number</span>
              <p className={`text-sm font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                <Phone className="w-4 h-4 text-emerald-400" /> {user?.phone || "Not Set"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Security & Authentication Tokens Card */}
      <div className={`rounded-2xl border p-6 space-y-4 ${theme === "dark" ? "bg-[#1E1E1E] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
        <h2 className={`text-base font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
          <Key className="w-4 h-4 text-emerald-400" />
          Security & Session Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className={`p-3 border rounded-xl ${theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Session Security</span>
            <span className="font-semibold text-emerald-400 mt-1 block">
              HTTP-Only JWT Cookie
            </span>
          </div>

          <div className={`p-3 border rounded-xl ${theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Access Token Lifetime</span>
            <span className={`font-semibold mt-1 block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>24 Hours (Rolling Refresh)</span>
          </div>

          <div className={`p-3 border rounded-xl ${theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Authentication Engine</span>
            <span className={`font-semibold mt-1 block ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Jose HS256 Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
}