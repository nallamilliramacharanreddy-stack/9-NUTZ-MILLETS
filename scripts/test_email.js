const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local 
function getEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const config = {};
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length === 2) config[parts[0].trim()] = parts[1].trim();
    });
    return config;
  } catch (e) {
    return {};
  }
}

async function testEmail() {
  const env = getEnv();
  const user = env.EMAIL_USER;
  const pass = env.EMAIL_PASSWORD;

  console.log("-----------------------------------------");
  console.log("🔍 EMAIL (SMTP) DIAGNOSTIC");
  console.log("-----------------------------------------");
  console.log("User:", user);
  
  if (!user || !pass) {
    console.log("❌ ERROR: EMAIL_USER or EMAIL_PASSWORD missing in .env.local");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  try {
    console.log("📡 Attempting to verify SMTP connection...");
    await transporter.verify();
    console.log("✅ SUCCESS: Connected to Gmail SMTP server.");

    console.log("📧 Attempting to send a test email to yourself...");
    await transporter.sendMail({
      from: `"9 Nutzz Test" <${user}>`,
      to: user,
      subject: '9 Nutzz SMTP Diagnostic Test',
      text: 'If you see this, your email configuration is WORKING!',
      html: '<b>If you see this, your email configuration is WORKING!</b>',
    });
    console.log("✅ SUCCESS: Test email sent successfully.");
    process.exit(0);
  } catch (err) {
    console.log("❌ FAILURE: Email delivery failed!");
    console.log(`Message: ${err.message}`);
    
    if (err.message.includes("Invalid login")) {
      console.log("\n👉 CAUSE: The 'EMAIL_PASSWORD' is incorrect.");
      console.log("Ensure you are using a GMAIL APP PASSWORD, not your regular password.");
    } else if (err.message.includes("ETIMEDOUT")) {
      console.log("\n👉 CAUSE: Network connection timed out. Check your firewall/VPN.");
    }
    process.exit(1);
  }
}

testEmail();
