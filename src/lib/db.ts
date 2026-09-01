import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/hisabdo";

let cached = (global as typeof globalThis & {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}).mongoose;

if (!cached) {
  cached = (global as typeof globalThis & {
    mongoose?: {
      conn: typeof mongoose | null;
      promise: Promise<typeof mongoose> | null;
    };
  }).mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGO_URI!);
  }

  cached!.conn = await cached!.promise;

  return cached!.conn;
}