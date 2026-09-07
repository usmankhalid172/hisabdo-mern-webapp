import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, details?: Record<string, string[]>) {
  return NextResponse.json<ApiResponse>({ success: false, error: message, details }, { status });
}

export async function validateBody<T>(request: Request, schema: ZodSchema<T>) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    return { data: parsed, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.flatten().fieldErrors };
    }
    return { data: null, error: { _global: ['Invalid JSON payload'] } };
  }
}