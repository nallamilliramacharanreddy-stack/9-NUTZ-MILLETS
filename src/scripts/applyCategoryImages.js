const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually read .env.local to get MONGODB_URI
let MONGODB_URI = 'mongodb://localhost:27017/9nutzz';
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=["']?([^"'\n]+)["']?/);
    if (match) {
      MONGODB_URI = match[1];
    }
  }
} catch (err) {
  console.warn('Could not read .env.local, using default localhost URI');
}

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  images: [String],
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const categoryImageMap = {
  'laddus': '/laddus.png',
  'cookies': '/cookies.png',
  'snacks': '/snacks.png',
  'ready-to-mix': '/mix-powder.png',
  'others': '/podi.png',
  'grains': '/podi.png',
  'flours': '/podi.png',
  'flakes': '/podi.png',
  'noodles-pasta': '/mix-powder.png'
};

async function update() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const products = await Product.find({});
    console.log(`Checking ${products.length} products...`);

    let updatedCount = 0;
    for (const prod of products) {
      const newImage = categoryImageMap[prod.category] || '/snacks.png';
      
      // Update if current image matches the old Unsplash placeholder or is empty
      if (prod.images.length === 0 || prod.images[0].includes('unsplash.com')) {
        prod.images = [newImage];
        await prod.save();
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} products with new category images.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

update();
