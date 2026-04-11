import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is missing in environment variables");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // ✅ FIX: force TypeScript to treat as string
    cached.promise = mongoose.connect(MONGODB_URI as string, opts);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
