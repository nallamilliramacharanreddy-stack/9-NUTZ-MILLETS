import mongoose from "mongoose";
import connectDB from "./src/lib/mongodb";
import Product from "./src/models/Product";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function updateImages() {
  try {
    // ✅ Check if env is loaded
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    // ✅ Connect DB
    await connectDB();
    console.log("✅ Connected to DB");

    // ✅ Update Chocolate Mix Powder
    const res1 = await Product.updateOne(
      { name: "CHOCOLATE MIX POWDER" },
      { $set: { images: ["/chocolate-mix.png"] } }
    );
    console.log("✅ Updated CHOCOLATE MIX:", res1);

    // ✅ Update Soya Noodles
    const res2 = await Product.updateOne(
      { name: "SOYA NOODLES" },
      { $set: { images: ["/soya-noodles.png"] } }
    );
    console.log("✅ Updated SOYA NOODLES:", res2);

    console.log("🎉 All updates completed");
    process.exit(0);

  } catch (err) {
    console.error("❌ Update Error:", err);
    process.exit(1);
  }
}

updateImages();
