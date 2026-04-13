const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://nallamilliramacharanreddy_db_user:Reddy12345@cluster0.hmnikk3.mongodb.net/9nutzz?retryWrites=true&w=majority";

async function updateCatalog() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    const productSchema = new mongoose.Schema({
      name: String,
      category: String,
      images: [String]
    });

    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

    const allProducts = await Product.find({});
    console.log(`Found ${allProducts.length} products to evaluate.`);

    let updatedCount = 0;

    for (const product of allProducts) {
      const name = product.name.toLowerCase();
      const category = (product.category || "").toLowerCase();
      let newImage = null;

      if (name.includes('laddu') || name.includes('sunnundalu') || name.includes('ariselu')) {
        newImage = '/images/products/laddus.png';
      } else if (name.includes('murukulu') || name.includes('snack') || name.includes('corn')) {
        newImage = '/images/products/murukulu.png';
      } else if (name.includes('rotti') || name.includes('biscuit') || name.includes('bellam') || name.includes('dry fruit') || name.includes('pala')) {
        newImage = '/images/products/rotti.png';
      } else if (name.includes('pindi') || name.includes('powder') || name.includes('mix') || category.includes('ready-to-mix')) {
        newImage = '/images/products/powders.png';
      }

      if (newImage) {
        await Product.findByIdAndUpdate(product._id, { images: [newImage] });
        updatedCount++;
      }
    }

    console.log(`SUCCESS: Updated ${updatedCount} products with representative images.`);
    process.exit(0);
  } catch (err) {
    console.error('ERROR during migration:', err);
    process.exit(1);
  }
}

updateCatalog();
