const mongoose = require('mongoose');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const Category = require('../models/category');
require('dotenv').config();

const resetBrandNew = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set in environment');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const ordersResult = await Order.deleteMany({});
    const productsResult = await Product.deleteMany({});

    const usersResult = await User.updateMany(
      {},
      { $set: { loyaltyPoints: 0, loyaltyHistory: [] } }
    );

    const categoriesResult = await Category.updateMany(
      {},
      { $set: { products: [], showcaseProducts: [] } }
    );

    console.log(`Orders deleted: ${ordersResult.deletedCount}`);
    console.log(`Products deleted: ${productsResult.deletedCount}`);
    console.log(`Users loyalty reset: ${usersResult.modifiedCount}`);
    console.log(`Categories cleared: ${categoriesResult.modifiedCount}`);
    console.log('Brand-new reset complete.');
  } catch (error) {
    console.error('Failed to reset DB to brand-new state:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

resetBrandNew();
