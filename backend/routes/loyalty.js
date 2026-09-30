const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Order = require('../models/order');
const { authUser } = require('../middleware/auth');

const calculateLoyaltyBaseFromItems = (items = []) => {
  return items.reduce((sum, item) => {
    const price = Number(item.price || 0);
    const addOnPrice = Number(item.addOnPrice || 0);
    const qty = Math.max(1, Number(item.quantity || 1));
    const hamperTotal = Array.isArray(item.hamperItems)
      ? item.hamperItems.reduce((hamperSum, hamperItem) => hamperSum + Number(hamperItem?.price || 0), 0)
      : 0;
    return sum + ((price + addOnPrice) * qty) + hamperTotal;
  }, 0);
};

const calculateLoyaltyEarned = (order) => {
  const base = calculateLoyaltyBaseFromItems(order?.items || []);
  return Math.max(0, Math.floor(base * 0.10));
};

const syncPendingLoyaltyCredits = async (userId) => {
  const pendingOrders = await Order.find({
    userId,
    loyaltyCredited: { $ne: true },
    $or: [
      { status: 'delivered' },
      { status: 'confirmed', paymentStatus: 'completed' }
    ]
  }).sort({ createdAt: 1 });

  if (!pendingOrders.length) return 0;

  let totalCredited = 0;

  for (const order of pendingOrders) {
    const earned = calculateLoyaltyEarned(order);
    order.loyaltyPointsEarned = earned;
    order.loyaltyCredited = true;
    await order.save();

    if (earned > 0) {
      totalCredited += earned;
      await User.findByIdAndUpdate(userId, {
        $inc: { loyaltyPoints: earned },
        $push: {
          loyaltyHistory: {
            type: 'earned',
            points: earned,
            orderId: order.orderId || String(order._id),
            description: order.status === 'delivered' ? 'Backfilled loyalty on delivered order' : 'Backfilled loyalty on confirmed paid order'
          }
        }
      });
    }
  }

  return totalCredited;
};

router.get('/loyalty', authUser, async (req, res) => {
  try {
    await syncPendingLoyaltyCredits(req.userId);

    const user = await User.findById(req.userId).select('loyaltyPoints loyaltyHistory');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const history = Array.isArray(user.loyaltyHistory)
      ? [...user.loyaltyHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : [];

    res.json({
      loyaltyPoints: Number(user.loyaltyPoints || 0),
      history
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/redeem', authUser, async (req, res) => {
  try {
    const requestedPoints = Math.max(0, Math.floor(Number(req.body?.points || 0)));
    const orderId = String(req.body?.orderId || '').trim();

    if (!requestedPoints) {
      return res.status(400).json({ message: 'Valid points value is required' });
    }

    const user = await User.findById(req.userId).select('loyaltyPoints');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const availablePoints = Math.max(0, Math.floor(Number(user.loyaltyPoints || 0)));
    const maxRedeemableByPolicy = availablePoints < 50
      ? availablePoints
      : Math.floor(availablePoints * 0.30);

    if (requestedPoints > maxRedeemableByPolicy) {
      return res.status(400).json({
        message: availablePoints < 50
          ? `You can redeem up to ${maxRedeemableByPolicy} points`
          : `You can redeem up to 30% of your points (${maxRedeemableByPolicy})`
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.userId, loyaltyPoints: { $gte: requestedPoints } },
      {
        $inc: { loyaltyPoints: -requestedPoints },
        $push: {
          loyaltyHistory: {
            type: 'redeemed',
            points: requestedPoints,
            orderId,
            description: orderId ? 'Redeemed against order' : 'Manual redemption'
          }
        }
      },
      { new: true }
    ).select('loyaltyPoints loyaltyHistory');

    if (!updatedUser) {
      return res.status(400).json({ message: 'Insufficient loyalty points' });
    }

    res.json({
      message: 'Loyalty points redeemed successfully',
      redeemedPoints: requestedPoints,
      loyaltyPoints: Number(updatedUser.loyaltyPoints || 0)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
