require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function diagnose() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI missing in .env.local");
    process.exit(1);
  }

  console.log("📡 Attempting to connect to MongoDB...");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Database connected successfully.");

    const userSchema = new mongoose.Schema({
      email: String,
      role: String,
      isVerified: Boolean
    }, { collection: 'users' });

    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    const count = await User.countDocuments();
    console.log(`📊 Total users found: ${count}`);

    if (count > 0) {
      const users = await User.find({}).limit(5);
      console.log("🔍 Sample users:");
      users.forEach(u => console.log(` - ${u.email} (${u.role}) ${u.isVerified ? '✅' : '❌'}`));
    } else {
      console.log("⚠️ No users found in database. Did you seed it?");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Diagnostic failed:");
    console.error(err.message);
    if (err.message.includes("IP") || err.message.includes("whitelist")) {
      console.error("👉 TIP: This is an IP Whitelist issue. You need to allow access from '0.0.0.0/0' in MongoDB Atlas.");
    }
    process.exit(1);
  }
}

diagnose();
