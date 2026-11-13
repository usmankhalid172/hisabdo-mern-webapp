import { z } from "zod";

// ===== SHARED VALIDATORS =====

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailValidator = z
  .string()
  .trim()
  .min(1, "Email is required")
  .refine((email) => emailRegex.test(email), {
    message: "Please enter a valid email address",
  });

const passwordValidator = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long (max 128 characters)")
  .refine((pwd) => !/^\d+$/.test(pwd), {
    message: "Password cannot be only numbers",
  });

// ===== LOGIN SCHEMA =====

export const loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, "Password is required"),
});

// ===== REGISTER SCHEMA =====

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Full Name must be at least 2 characters")
      .max(100, "Full Name is too long (max 100 characters)"),

    email: emailValidator,

    phone: z.string().trim().optional(),
    shopName: z.string().trim().optional(),

    password: passwordValidator,

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => data.password.toLowerCase() !== data.email.toLowerCase(),
    {
      message: "Password cannot be same as email",
      path: ["password"],
    }
  );

// ===== FORGOT PASSWORD SCHEMA =====

export const forgotSchema = z.object({
  email: emailValidator,
});

// ===== RESET PASSWORD SCHEMA =====

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordValidator,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ===== PROFILE UPDATE SCHEMA =====

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full Name must be at least 2 characters")
    .max(100, "Full Name is too long (max 100 characters)")
    .optional(),
  phone: z.string().trim().optional(),
  shopName: z.string().trim().optional(),
});

// ===== TYPES =====

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotFormData = z.infer<typeof forgotSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;