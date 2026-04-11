import connectDB from '../lib/mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  try {
    await connectDB();
    
    const adminEmail = '9NUTZMILLETSGMD@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    await User.create({
      name: '9 Nutzz Admin',
      email: adminEmail,
      phone: '9949131747',
      password: hashedPassword,
      role: 'admin',
    });
    
    console.log('Admin user created successfully!');
    console.log('Email: 9NUTZMILLETSGMD@gmail.com');
    console.log('Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
