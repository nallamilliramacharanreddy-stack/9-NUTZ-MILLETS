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
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    };

    console.log("📡 Attempting to connect to MongoDB...");

    // ✅ FIX: force TypeScript to treat as string
    cached.promise = mongoose.connect(MONGODB_URI as string, opts)
      .then((m) => {
        console.log("✅ MongoDB Connected Successfully.");
        return m;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Error:");
        if (err.message.includes("ETIMEOUT") || err.message.includes("Could not connect to any servers")) {
          console.error("👉 TIP: This is likely an IP Whitelist issue in MongoDB Atlas.");
        } else if (err.message.includes("authentication failed") || err.message.includes("bad auth")) {
          console.error("👉 TIP: This is a Database Authentication Failure. Please check your username and password in Atlas Database Access.");
        }
        console.error(err.message);
        cached.promise = null; // Don't cache a failed promise
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

export default connectDB;
