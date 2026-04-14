const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb+srv://nallamilliramacharanreddy_db_user:Venkata%40Nutzz%232026%21@cluster0.hmnikk3.mongodb.net/9nutzz?retryWrites=true&w=majority";

async function run() {
  try {
    console.log('Connecting to Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const adminEmail = '9nutzmilletsgmd@gmail.com';
    const adminPassword = 'Reddy@3377';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Schema definition for the script
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phone: { type: String, required: true },
      password: { type: String, required: true },
      role: { type: String, default: 'user' },
      isVerified: { type: Boolean, default: false }
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const user = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        name: '9 Nutzz Admin',
        email: adminEmail,
        phone: '9949131747',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      },
      { upsert: true, new: true }
    );

    console.log('SUCCESS: Admin user verified/reseeded:', user.email, 'Role:', user.role);
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
}

run();
