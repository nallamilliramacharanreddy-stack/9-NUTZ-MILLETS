const { connectDB } = require('../src/lib/mongodb');
const User = require('../src/models/User');

async function test() {
  try {
    console.log('Testing connectDB...');
    await connectDB();
    console.log('✅ Connected.');
    
    console.log('Testing User.findOne...');
    const user = await User.findOne({ email: '9NUTZMILLETSGMD@gmail.com' });
    console.log('✅ Found user:', user ? user.email : 'null');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

test();
