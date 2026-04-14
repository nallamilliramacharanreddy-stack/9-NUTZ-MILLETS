const mongoose = require('mongoose');

// Use the verified URI from the previous session
const MONGODB_URI = "mongodb+srv://nallamilliramacharanreddy_db_user:NutzzAtlas2026Reddy@cluster0.hmnikk3.mongodb.net/9nutzz?retryWrites=true&w=majority";

async function updateStock() {
  console.log("-----------------------------------------");
  console.log("🛠️  BULK STOCK INITIALIZER");
  console.log("-----------------------------------------");

  try {
    console.log("📡 Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully.");

    // Update all products to set stock to 100
    console.log("🔄 Updating all products stock to 100...");
    const result = await mongoose.connection.db.collection('products').updateMany(
      {}, 
      { $set: { stock: 100 } }
    );

    console.log(`✅ SUCCESS: Updated ${result.modifiedCount} products.`);
    console.log(`ℹ️  Matched ${result.matchedCount} products.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR during update:", err.message);
    process.exit(1);
  }
}

updateStock();
