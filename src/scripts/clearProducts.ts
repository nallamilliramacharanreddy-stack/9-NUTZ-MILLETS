import connectDB from '../lib/mongodb';
import Product from '../models/Product';

async function clearProducts() {
  try {
    await connectDB();
    console.log('Connecting to database...');
    
    const result = await Product.deleteMany({});
    console.log(`✅ successfully removed ${result.deletedCount} products from the database.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error deleting products:', error);
    process.exit(1);
  }
}

clearProducts();
