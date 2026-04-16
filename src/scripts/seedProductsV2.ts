import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../models/Product';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const productsData = [
  // Sweets (Dry Items)
  { name: 'Jonna Laddu (Dry)', price: 65, category: 'laddus' },
  { name: 'Ragi Laddu (Dry)', price: 65, category: 'laddus' },
  { name: 'Ragi Biscuits (Dry)', price: 69, category: 'cookies' },
  { name: 'Kaju Laddu (Dry)', price: 89, category: 'laddus' },
  { name: 'Sunnundalu (Dry)', price: 99, category: 'laddus' },
  { name: 'Jonna Bellam Rotti', price: 69, category: 'snacks' },
  { name: 'Ragi Bellam Rotti', price: 79, category: 'snacks' },
  { name: 'Sajja Bellam Rotti', price: 69, category: 'snacks' },
  { name: 'Sajja Bellam Rotti (Special)', price: 109, category: 'snacks' },
  { name: 'Kaju Bellam Rotti', price: 99, category: 'snacks' },
  { name: 'Jonna Dry Fruit Rotti', price: 69, category: 'snacks' },
  { name: 'Ragi Dry Fruit Rotti', price: 79, category: 'snacks' },
  { name: 'Sajja Dry Fruit Rotti', price: 69, category: 'snacks' },
  { name: 'Sajja Special Rotti', price: 119, category: 'snacks' },
  { name: 'Jonna Peanut Rotti', price: 69, category: 'snacks' },
  { name: 'Sajja Peanut Rotti', price: 79, category: 'snacks' },
  { name: 'Jonna Pindi', price: 129, category: 'others' },
  { name: 'Ragi Pindi', price: 129, category: 'others' },
  { name: 'Sajja Pindi', price: 129, category: 'others' },
  { name: 'Kaju Pindi', price: 169, category: 'others' },
  { name: 'Sunnundalu (Special)', price: 199, category: 'laddus' },

  // Murukulu (Snacks)
  { name: 'Corn Murukulu', price: 59, category: 'snacks' },
  { name: 'Ragi Murukulu', price: 59, category: 'snacks' },
  { name: 'Jowar Murukulu', price: 59, category: 'snacks' },
  { name: 'Mixed Murukulu', price: 59, category: 'snacks' },

  // Laddus
  { name: 'Millet Laddu', price: 110, category: 'laddus' },
  { name: 'Kaju Laddu', price: 99, category: 'laddus' },
  { name: 'Ragi Laddu', price: 99, category: 'laddus' },
  { name: 'Anjeer Laddu', price: 99, category: 'laddus' },
  { name: 'Jonna Laddu', price: 99, category: 'laddus' },
  { name: 'Sunnundalu', price: 99, category: 'laddus' },
  { name: 'Nut Laddu', price: 99, category: 'laddus' },
  { name: 'Khajoor Laddu', price: 99, category: 'laddus' },
  { name: 'Dry Fruit Laddu', price: 99, category: 'laddus' },
  { name: 'Special Dry Fruit Laddu', price: 159, category: 'laddus' },

  // Biscuits (Packet)
  { name: 'Oats Millet Biscuits (Packet)', price: 70, category: 'cookies' },
  { name: 'Jeera Millet Biscuits (Packet)', price: 70, category: 'cookies' },
  { name: 'Chocolate Millet Biscuits (Packet)', price: 70, category: 'cookies' },
  { name: 'Badam Millet Biscuits (Packet)', price: 70, category: 'cookies' },
  { name: 'Ragi Millet Biscuits (Packet)', price: 70, category: 'cookies' },
  { name: 'Kaju Millet Biscuits (Packet)', price: 70, category: 'cookies' },
  { name: 'Multigrain Millet Biscuits (Packet)', price: 70, category: 'cookies' },

  // Biscuits (Small)
  { name: 'Oats Millet Biscuits (Small)', price: 20, category: 'cookies' },
  { name: 'Jeera Millet Biscuits (Small)', price: 20, category: 'cookies' },
  { name: 'Chocolate Millet Biscuits (Small)', price: 20, category: 'cookies' },
  { name: 'Badam Millet Biscuits (Small)', price: 20, category: 'cookies' },
  { name: 'Ragi Millet Biscuits (Small)', price: 20, category: 'cookies' },
  { name: 'Kaju Millet Biscuits (Small)', price: 20, category: 'cookies' },
  { name: 'Multigrain Millet Biscuits (Small)', price: 20, category: 'cookies' },

  // Chikkis
  { name: 'Peanut Chikki', price: 10, category: 'snacks' },
  { name: 'Sesame Chikki', price: 10, category: 'snacks' },
  { name: 'Millet Chikki', price: 10, category: 'snacks' },
  { name: 'Anjeer Chikki', price: 15, category: 'snacks' },
  { name: 'Dry Fruit Chikki', price: 20, category: 'snacks' },
  { name: 'Palli Chikki', price: 15, category: 'snacks' },
  { name: 'Special Chikki', price: 30, category: 'snacks' },

  // Pappu Chekkalu
  { name: 'Jonna Chekkalu', price: 55, category: 'snacks' },
  { name: 'Kaju Chekkalu', price: 55, category: 'snacks' },
  { name: 'Sajja Chekkalu', price: 55, category: 'snacks' },

  // Mixtures
  { name: 'Jowar Mixture', price: 80, category: 'snacks' },
  { name: 'Kaju Mixture', price: 80, category: 'snacks' },
  { name: 'Ragi Mixture', price: 80, category: 'snacks' },

  // Chaklis
  { name: 'Tomato Chakli', price: 30, category: 'snacks' },
  { name: 'Plain Chakli', price: 30, category: 'snacks' },
  { name: 'Badam Chakli', price: 80, category: 'snacks' },
  { name: 'Kaju Chakli', price: 80, category: 'snacks' },

  // Rusk
  { name: 'Millet Rusk', price: 39, category: 'snacks' },

  // Chocolates
  { name: 'Dry Fruit Bar', price: 99, category: 'snacks' },
  { name: 'Millet Chocolate Bite (Large)', price: 99, category: 'snacks' },
  { name: 'Dry Fruit Chocolate Bite', price: 10, category: 'snacks' },
  { name: 'Millet Chocolate Bite (Small)', price: 10, category: 'snacks' },
  { name: 'Hazelnut Chocolate Bite', price: 20, category: 'snacks' },
  { name: 'Ferrero Chocolate', price: 120, category: 'snacks' },
  { name: 'Chocolate Stick', price: 120, category: 'snacks' },

  // Karam Snacks
  { name: 'Rice Karam Podi', price: 39, category: 'others' },
  { name: 'Groundnut Karam Podi', price: 39, category: 'others' },
  { name: 'Curry Leaves Karam Podi', price: 39, category: 'others' },
  { name: 'Kobbari (Coconut) Karam Podi', price: 39, category: 'others' },
  { name: 'Idli Karam Podi', price: 39, category: 'others' },

  // Millet Mix Powder
  { name: 'Millet Chocolate Mix Powder', price: 59, category: 'ready-to-mix' },
  { name: 'Ragi Chocolate Mix Powder', price: 59, category: 'ready-to-mix' },
  { name: 'ABC Mix Powder', price: 59, category: 'ready-to-mix' },

  // Rose Milk Powder
  { name: 'Palakova Rose Milk Powder', price: 59, category: 'ready-to-mix' },
  { name: 'Beetroot Rose Milk Powder', price: 59, category: 'ready-to-mix' },
];

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected.');

    const placeholderImage = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2070&auto=format&fit=crop';

    const formattedProducts = productsData.map(p => {
      const slug = p.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      return {
        ...p,
        slug,
        description: `Premium healthy millet-based ${p.name}, 100% organic and traditionally prepared for maximum nutrition.`,
        images: [placeholderImage],
        stock: 100,
        featured: false,
        rating: 0,
        numReviews: 0
      };
    });

    console.log(`Seeding ${formattedProducts.length} products...`);

    // Using insertMany for efficiency
    // We use upsert logic if we want to avoid duplicates if rerun, but here we just insert
    // To handle potential duplicates in the script itself, we'll check slubs

    for (const prod of formattedProducts) {
      await Product.findOneAndUpdate(
        { slug: prod.slug },
        { $set: prod },
        { upsert: true, new: true }
      );
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
