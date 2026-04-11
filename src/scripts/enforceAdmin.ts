import connectDB from '../lib/mongodb';
import User from '../models/User';

async function enforceAdmin() {
  try {
    await connectDB();
    
    const result = await User.updateMany(
      { role: 'admin', email: { $ne: '9NUTZMILLETSGMD@gmail.com' } },
      { $set: { role: 'user' } }
    );
    
    console.log(`Enforced admin rule: downgraded ${result.modifiedCount} users to 'user'.`);
    process.exit(0);
  } catch (error) {
    console.error('Error enforcing admin:', error);
    process.exit(1);
  }
}

enforceAdmin();
