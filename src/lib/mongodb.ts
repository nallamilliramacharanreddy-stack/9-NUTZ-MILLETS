import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, memoryServer: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 5000, // 5s timeout for fast failover
    };

    console.log('📡 Attempting MongoDB Connection...');
    
    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then(async (mongoose) => {
        console.log('✅ Connected to MongoDB');
        await seedAdmin(); // Ensure admin exists
        return mongoose;
      })
      .catch(async (error) => {
        console.warn('⚠️ Primary Database Connection Failed:', error.message);
        console.log('🚀 FALLBACK: Starting In-Memory MongoDB Server...');

        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          if (!cached.memoryServer) {
             cached.memoryServer = await MongoMemoryServer.create();
          }
          const uri = cached.memoryServer.getUri();
          
          console.log('💾 In-Memory DB Started at:', uri);
          const conn = await mongoose.connect(uri, opts);
          
          // Auto-seed in memory
          await seedAdmin();
          
          return conn;
        } catch (memError: any) {
          console.error('❌ Memory Server Error:', memError.message);
          throw error; // throw original Atlas error if fallback also fails
        }
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

async function seedAdmin() {
  try {
     const User = (await import('@/models/User')).default;
     const bcrypt = (await import('bcryptjs')).default;
     
     const adminEmail = '9NUTZMILLETSGMD@gmail.com';
     const existingAdmin = await User.findOne({ email: adminEmail });
     
     if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Admin@123', 12);
        await User.create({
           name: '9 Nutzz Admin (Memory)',
           email: adminEmail,
           phone: '9999999999',
           password: hashedPassword,
           role: 'admin',
         });
        console.log('👤 Admin user seeded in memory: 9NUTZMILLETSGMD@gmail.com / Admin@123');
     }
  } catch (error) {
     console.error('❌ Failed to seed memory admin:', error);
  }
}

// Product auto-seeding removed per user request

export default connectDB;
