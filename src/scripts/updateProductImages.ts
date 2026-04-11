import mongoose from 'mongoose';
import connectDB from './src/lib/mongodb';
import Product from './src/models/Product';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function updateImages() {
  try {
    await connectDB();
    console.log('Connected to DB');

    // Update Chocolate Mix Powder
    const res1 = await Product.updateOne(
      { name: "CHOCOLATE MIX POWDER" },
      { $set: { images: ["/chocolate-mix.png"] } }
    );
    console.log('Updated CHOCOLATE MIX:', res1);

    // Update Soya Noodles
    const res2 = await Product.updateOne(
      { name: "SOYA NOODLES" },
      { $set: { images: ["/soya-noodles.png"] } }
    );
    console.log('Updated SOYA NOODLES:', res2);

    process.exit(0);
  } catch (err) {
    console.error('Update Error:', err);
    process.exit(1);
  }
}

updateImages();
