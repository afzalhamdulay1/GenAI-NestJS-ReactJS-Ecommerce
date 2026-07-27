const mongoose = require('./node_modules/mongoose');

mongoose.connect('mongodb://localhost:27017/ecom').then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({ ratings: mongoose.Schema.Types.Mixed, name: String }, { strict: false }));
  const allProducts = await Product.find({});
  let bad = false;
  allProducts.forEach(p => {
    if (typeof p.ratings !== 'number') {
      console.log('Bad product ID:', p._id, 'Name:', p.name, 'Ratings Type:', typeof p.ratings, 'Value:', p.ratings);
      bad = true;
    }
  });
  if (!bad) console.log('No bad products found.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
