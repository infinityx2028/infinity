const mongoose = require('mongoose');
const User = require('../models/user');
const Order = require('../models/order');
require('dotenv').config();

const resetLaunchLoyalty = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set in environment');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const userResult = await User.updateMany(
      {},
      { $set: { loyaltyPoints: 0, loyaltyHistory: [] } }
    );

    const orderResult = await Order.updateMany(
      {},
      {
        $set: {
          loyaltyDiscount: 0,
          loyaltyPointsRedeemed: 0,
          loyaltyPointsEarned: 0,
          loyaltyCredited: false
        }
      }
    );

    console.log(`Users updated: ${userResult.modifiedCount}`);
    console.log(`Orders updated: ${orderResult.modifiedCount}`);
    console.log('Launch loyalty reset complete.');
  } catch (error) {
    console.error('Failed to reset launch loyalty data:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

resetLaunchLoyalty();
