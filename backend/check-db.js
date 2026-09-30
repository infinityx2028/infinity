const mongoose = require('mongoose');
require('dotenv').config();

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
    
    const Product = require('./models/product');
    const Category = require('./models/category');
    const Admin = require('./models/admin');
    
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const adminCount = await Admin.countDocuments();
    
    console.log('\n📊 DATABASE STATUS:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Admins: ${adminCount}\n`);
    
    if (productCount > 0) {
      const sample = await Product.findOne().select('name price').lean();
      console.log(`   Sample Product: ${sample?.name} - ₹${sample?.price}`);
    } else {
      console.log('   ⚠️  NO PRODUCTS FOUND - Database is empty!');
    }
    
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkDB();
