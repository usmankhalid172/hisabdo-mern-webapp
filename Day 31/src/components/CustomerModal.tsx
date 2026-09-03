"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  phone: z.string().min(10, "Phone number must be at least 10 digits"),

  type: z.enum(["Customer", "Supplier"]),

  openingBalance: z.coerce
    .number()
    .min(0, "Balance cannot be negative"),
});

// Input type = what React Hook Form receives
export type CustomerFormInput = z.input<typeof customerSchema>;

// Output type = validated data returned by Zod
export type CustomerFormData = z.output<typeof customerSchema>;

export interface CustomerItem extends CustomerFormData {
  id: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
  initialData?: CustomerItem | null;
}

export function CustomerModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormInput, any, CustomerFormData>({
    resolver: zodResolver(customerSchema),

    defaultValues: {
      name: "",
      phone: "",
      type: "Customer",
      openingBalance: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name);
      setValue("phone", initialData.phone);
      setValue("type", initialData.type);
      setValue("openingBalance", initialData.openingBalance);
    } else {
      reset({
        name: "",
        phone: "",
        type: "Customer",
        openingBalance: 0,
      });
    }
  }, [initialData, setValue, reset, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleFormSubmit = (data: CustomerFormData) => {
    onSubmit(data);

    reset({
      name: "",
      phone: "",
      type: "Customer",
      openingBalance: 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-4">
          {initialData
            ? "Edit Party Contact"
            : "Add New Customer / Supplier"}
        </h2>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Full Name / Business Name
            </label>

            <input
              {...register("name")}
              placeholder="e.g. Ali Traders"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />

            {errors.name && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Phone Number
            </label>

            <input
              {...register("phone")}
              placeholder="e.g. 03001234567"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />

            {errors.phone && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Party Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Party Type
            </label>

            <select
              {...register("type")}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="Customer">
                Customer (Gives Money)
              </option>

              <option value="Supplier">
                Supplier (Takes Money)
              </option>
            </select>
          </div>

          {/* Opening Balance */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Opening Balance (Rs.)
            </label>

            <input
              type="number"
              step="0.01"
              {...register("openingBalance")}
              placeholder="0.00"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />

            {errors.openingBalance && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.openingBalance.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {initialData ? "Update Party" : "Save Party"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}