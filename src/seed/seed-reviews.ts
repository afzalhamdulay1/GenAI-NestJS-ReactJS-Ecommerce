import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DB_URI = process.env.DB_URI || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const categoryFallbackReviews: Record<string, any[]> = {
  Laptop: [
    { name: 'David K.', rating: 5, comment: 'Lightning fast boot times! The display is crisp and keyboard typing feel is super comfortable for long coding sessions.' },
    { name: 'Elena R.', rating: 5, comment: 'Battery easily lasts 8+ hours of continuous work. Build quality feels sturdy and premium.' },
    { name: 'Marcus B.', rating: 4, comment: 'Great performance for multitasking. Trackpad is responsive, though fan gets slightly warm under heavy load.' },
    { name: 'Sophia T.', rating: 4, comment: 'Sleek design and very portable. Speakers are clear and webcam quality is surprisingly good.' },
    { name: 'Ryan M.', rating: 3, comment: 'Decent laptop for price, but wish it had one more USB-C port.' },
  ],
  SmartPhones: [
    { name: 'Alex M.', rating: 5, comment: 'Camera quality is mind-blowing! Low light photos come out vivid and 120Hz display is butter smooth.' },
    { name: 'Jessica P.', rating: 5, comment: 'Super fast charging and smooth UI performance. Easily gets through a full heavy usage day.' },
    { name: 'Daniel K.', rating: 4, comment: 'Sleek glass back and comfortable in hand. App opening times are instant.' },
    { name: 'Priya S.', rating: 4, comment: 'Great screen brightness under direct sunlight. Fingerprint scanner is fast.' },
    { name: 'Kevin L.', rating: 3, comment: 'Overall great phone, but gets slightly warm while playing high-end 3D games.' },
  ],
  Attire: [
    { name: 'Hannah S.', rating: 5, comment: 'Fabric is incredibly soft and high quality! Stitches are neat and colour didn’t fade after washing.' },
    { name: 'Carlos E.', rating: 5, comment: 'Fits true to size! Very comfortable for all-day wear and looks stylish.' },
    { name: 'Aisha N.', rating: 4, comment: 'Material feels premium and lightweight. Great addition to everyday wardrobe.' },
    { name: 'James W.', rating: 4, comment: 'Clean cut and comfortable fit. Recommended!' },
    { name: 'Liam O.', rating: 3, comment: 'Nice garment, but note that the shade is slightly darker than pictured.' },
  ],
  Footwear: [
    { name: 'Michael C.', rating: 5, comment: 'Super comfortable cushioning! Perfect arch support for running and long walks.' },
    { name: 'Rachel G.', rating: 5, comment: 'Trendy design and lightweight. True to size with great traction on slippery surfaces.' },
    { name: 'Omar F.', rating: 4, comment: 'Good quality build and breathable upper mesh. Takes a day to break in.' },
    { name: 'Chloe D.', rating: 4, comment: 'Stylish sneakers, looks awesome with casual jeans.' },
    { name: 'Brian P.', rating: 3, comment: 'Comfortable, but fits a little snug on wide feet. Consider sizing up 0.5 size.' },
  ],
  Default: [
    { name: 'Sarah J.', rating: 5, comment: 'Exceeded my expectations! High build quality and fast shipping.' },
    { name: 'Vikram R.', rating: 5, comment: 'Very satisfied with this purchase. Premium finish and great utility.' },
    { name: 'Emily T.', rating: 4, comment: 'Solid product for the price. Works as advertised.' },
    { name: 'Chris M.', rating: 4, comment: 'Good quality overall. Sleek packaging and easy setup.' },
    { name: 'Nicole K.', rating: 3, comment: 'Fair value, minor room for improvement but good for daily use.' },
  ]
};

async function generateReviewsForProduct(genAI: GoogleGenerativeAI, productName: string, category: string) {
  const prompt = `Generate 5 realistic customer reviews for "${productName}" (Category: "${category}").
Return strictly JSON array:
[{"name": "Customer", "rating": 5, "comment": "Feedback..."}]`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = (await result.response).text();
    if (text) {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err: any) {
    // Silent fallback to category template if rate-limited
  }
  return null;
}

async function seedReviews() {
  if (!DB_URI) {
    console.error('❌ DB_URI missing in .env');
    process.exit(1);
  }

  const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection failed');

    const productsCollection = db.collection('products');
    const usersCollection = db.collection('users');

    const dummyUser = await usersCollection.findOne({});
    const userId = dummyUser ? dummyUser._id : new mongoose.Types.ObjectId();

    const products = await productsCollection.find({}).toArray();
    console.log(`📦 Found ${products.length} products in database. Updating to category-aware reviews...`);

    for (const product of products) {
      const catKey = Object.keys(categoryFallbackReviews).find(k => 
        (product.category || '').toLowerCase().includes(k.toLowerCase()) || 
        (product.name || '').toLowerCase().includes(k.toLowerCase())
      ) || 'Default';

      let reviewsToUse: any[] | null = null;
      if (genAI) {
        reviewsToUse = await generateReviewsForProduct(genAI, product.name, product.category || 'General');
        // Sleep 1.5s to respect Gemini API rate limits
        await new Promise((res) => setTimeout(res, 1500));
      }

      if (!reviewsToUse) {
        const pool = categoryFallbackReviews[catKey] || categoryFallbackReviews.Default;
        reviewsToUse = pool;
      }

      const seededReviews = reviewsToUse.map((rev) => ({
        _id: new mongoose.Types.ObjectId(),
        user: userId,
        name: rev.name,
        rating: Number(rev.rating) || 5,
        comment: rev.comment,
        isVerifiedPurchase: true,
        createdAt: new Date(),
      }));

      const totalRating = seededReviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = Number((totalRating / seededReviews.length).toFixed(1));

      await productsCollection.updateOne(
        { _id: product._id },
        {
          $set: {
            reviews: seededReviews,
            numOfReviews: seededReviews.length,
            ratings: avgRating,
          },
        },
      );

      console.log(`  └─ "${product.name}" (${catKey}): Seeded ${seededReviews.length} relevant reviews (${avgRating}⭐)`);
    }

    console.log('\n🎉 Category-Accurate Review Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    process.exit(1);
  }
}

seedReviews();
