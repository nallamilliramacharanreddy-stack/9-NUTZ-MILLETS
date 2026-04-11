import connectDB from '../lib/mongodb';
import User from '../models/User';

async function listUsr() {
  await connectDB();
  const users = await User.find({}, 'email role password');
  console.log(users);
  process.exit();
}
listUsr();
