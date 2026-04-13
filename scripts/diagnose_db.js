const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local because dotenv might not be installed
function getEnvUri() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const match = envFile.match(/MONGODB_URI=(.*)/);
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

async function check() {
  const uri = getEnvUri();
  console.log("-----------------------------------------");
  console.log("🔍 DATABASE DIAGNOSTIC (STABLE VERSION)");
  console.log("-----------------------------------------");
  
  if (!uri) {
    console.log("❌ ERROR: MONGODB_URI missing or .env.local not found.");
    return;
  }

  try {
    console.log("📡 Attempting to connect...");
    await mongoose.connect(uri, { 
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000 
    });
    console.log("✅ SUCCESS: Successfully connected to MongoDB Atlas.");
    process.exit(0);
  } catch (err) {
    console.log("❌ CONNECTION FAILED!");
    console.log(`Message: ${err.message}`);
    
    if (err.message.toLowerCase().includes("auth")) {
      console.log("\n👉 THE PROBLEM IS: INCORRECT PASSWORD or USERNAME.");
      console.log("Atlas is rejecting your credentials. Please double-check the 'nallamilliramacharanreddy_db_user' password in Atlas.");
    } else if (err.message.includes("ENOTFOUND") || err.message.includes("TIMEOUT")) {
      console.log("\n👉 THE PROBLEM IS: NETWORK or FIREWALL.");
      console.log("Atlas cannot be reached. Make sure your IP is whitelisted (Allow Access from Anywhere: 0.0.0.0/0).");
    }
    process.exit(1);
  }
}

check();
