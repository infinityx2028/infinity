const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const { authAdmin, authorize } = require('../middleware/auth');
const { authUser } = require('../middleware/auth');
const { generateOrderId, generateUpiDeepLink } = require('../services/upiService');

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

const creditLoyaltyForOrder = async (order, description) => {
  if (!order || order.loyaltyCredited) return 0;

  const earned = calculateLoyaltyEarned(order);
  order.loyaltyPointsEarned = earned;
  order.loyaltyCredited = true;

  if (earned <= 0) return 0;

  await User.findByIdAndUpdate(order.userId, {
    $inc: { loyaltyPoints: earned },
    $push: {
      loyaltyHistory: {
        type: 'earned',
        points: earned,
        orderId: order.orderId || String(order._id),
        description: description || 'Loyalty earned from order confirmation'
      }
    }
  });

  return earned;
};

// ========== ADMIN ROUTES ==========

// 1. Get All Orders (Admin)
router.get('/admin/orders', authAdmin, authorize(['view_orders']), async (req, res) => {
  try {
    const { status, phoneNumber, paymentStatus } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (phoneNumber) filter.phoneNumber = phoneNumber;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    const orders = await Order.find(filter)
      .populate('userId', 'name phoneNumber')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get Single Order (Admin)
router.get('/admin/orders/:id', authAdmin, authorize(['view_orders']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2.5. Delete Order (Admin)
router.delete('/admin/orders/:id', authAdmin, authorize(['update_orders']), async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Update Order Status (Admin)
router.put('/admin/orders/:id/status', authAdmin, authorize(['update_orders']), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const previousStatus = order.status;
    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;
    order.updatedAt = new Date();

    let loyaltyEarned = 0;
    const movedToConfirmedWithPayment = status === 'confirmed' && previousStatus !== 'confirmed' && order.paymentStatus === 'completed';
    const movedToDelivered = status === 'delivered' && previousStatus !== 'delivered';
    if (movedToConfirmedWithPayment || movedToDelivered) {
      loyaltyEarned = await creditLoyaltyForOrder(order, movedToDelivered ? 'Order delivered successfully' : 'Order confirmed by admin');
    }
    
    await order.save();
    
    res.json({ message: 'Order status updated', order, loyaltyEarned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. View Uploaded Images for Order (Admin)
router.get('/admin/orders/:id/images', authAdmin, authorize(['view_images']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id, 'uploadedImages');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ images: order.uploadedImages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Add Admin Notes to Order
router.put('/admin/orders/:id/notes', authAdmin, authorize(['update_orders']), async (req, res) => {
  try {
    const { notes } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { adminNotes: notes },
      { new: true }
    );
    
    res.json({ message: 'Notes added', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5.5. Confirm UPI Payment (Admin)
router.put('/admin/orders/:id/confirm-payment', authAdmin, authorize(['update_orders']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.paymentMethod !== 'upi_qr' || order.paymentStatus !== 'pending_confirmation') {
      return res.status(400).json({ message: 'This order is not waiting for UPI payment confirmation' });
    }
    
    // Update payment status
    order.paymentStatus = 'completed';
    order.paymentConfirmedBy = req.adminName || 'admin';
    order.paymentConfirmedAt = new Date();
    order.status = 'confirmed';  // Auto-confirm the order after payment

    const loyaltyEarned = await creditLoyaltyForOrder(order, 'Payment confirmed successfully');
    
    await order.save();
    
    res.json({ 
      message: 'Payment confirmed successfully',
      loyaltyEarned,
      order 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Trigger Shiprocket Shipment (Admin)
router.post('/admin/orders/:id/ship', authAdmin, authorize(['trigger_shipment']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.shiprocketOrderId) {
      return res.status(400).json({ message: 'Order already shipped' });
    }
    
    // TODO: Integrate with Shiprocket API
    // For now, just simulate
    const shiprocketOrderId = 'SRP-' + Date.now();
    
    order.shiprocketOrderId = shiprocketOrderId;
    order.status = 'shipped';
    order.shippedDate = new Date();
    await order.save();
    
    res.json({ 
      message: 'Shipment triggered',
      shiprocketOrderId,
      order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== USER ROUTES ==========

// 7. Create Order (User)
router.post('/create', authUser, async (req, res) => {
  try {
    const { items, phoneNumber, customerName, email, address, city, state, pincode, paymentMethod, customerNotes, freeDeliveryZone } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items required' });
    }
    
    let subtotal = 0;
    const processedItems = [];
    
    for (const item of items) {
      // Find product by name or string ID (no casting to ObjectId)
      let product = await Product.findOne({ 
        $or: [
          { name: item.productId }, 
          { _id: item.productId }
        ] 
      }).catch(() => null);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      
      const incomingPrice = Number(item.price);
      const finalPrice = Number.isFinite(incomingPrice) && incomingPrice > 0 ? incomingPrice : product.price;
      const incomingQty = Math.max(1, Number(item.quantity || 1));
      const addOnPrice = Math.max(0, Number(item.addOnPrice || item?.addOn?.price || 0));
      const addOnType = String(item.addOnType || item?.addOn?.type || '').trim();
      const hamperItems = Array.isArray(item.hamperItems)
        ? item.hamperItems.map((hamperItem) => ({
            name: String(hamperItem?.name || ''),
            link: String(hamperItem?.link || ''),
            price: Math.max(0, Number(hamperItem?.price || 0))
          }))
        : [];
      const hamperTotal = hamperItems.reduce((hamperSum, hamperItem) => hamperSum + Number(hamperItem.price || 0), 0);

      processedItems.push({
        productId: product._id || item.productId,
        productName: product.name,
        price: finalPrice,
        quantity: incomingQty,
        addOnType,
        addOnPrice,
        customizationDetails: item.customizationDetails || '',
        hamperItems
      });
      
      subtotal += ((finalPrice + addOnPrice) * incomingQty) + hamperTotal;
    }
    
    // Compute per-item shipping based on product price:
    // - price < 300 => ₹69
    // - 300 <= price <= 500 => ₹99
    // - price > 500 => ₹150 + (small surcharge capped at ₹30) => range ₹150-₹180
      let shippingCost = 0;
      let hasPolaroids = false;
      let totalQty = 0;
    for (const it of processedItems) {
      const productId = String(it.productId || '');
      const productName = String(it.productName || '').toLowerCase();
        if (productId === 'd4' || productName.includes('digital video invitation')) {
          continue;
        }
        const qty = Math.max(1, Number(it.quantity || 1));
        totalQty += qty;
        if (['pol1', 'pol2', 'pol3'].includes(productId)) {
          hasPolaroids = true;
          continue;
        }
      const price = Number(it.price || 0);
      let perItemShipping = 150; // default for >500
      if (price < 300) perItemShipping = 69;
      else if (price <= 500) perItemShipping = 99;
      else {
        const extra = Math.min(30, Math.floor((price - 500) / 100) * 10);
        perItemShipping = 150 + extra; // between 150 and 180
      }
        const discountedShipping = perItemShipping + (Math.max(0, qty - 1) * perItemShipping * 0.5);
        shippingCost += Math.round(discountedShipping);
      }
    if (totalQty >= 30) {
      shippingCost = 399;
    } else if (totalQty >= 20) {
      shippingCost = 199;
    } else if (hasPolaroids) {
      shippingCost += 69;
    }

    const normalizedFreeZone = String(freeDeliveryZone || '').trim().toLowerCase();
    const eligibleFreeZones = ['shankarpally', 'bvrit'];
    const isFreeZoneOrder = eligibleFreeZones.includes(normalizedFreeZone);
    if (isFreeZoneOrder) {
      shippingCost = 0;
    }

    // Taxes removed (set to zero)
    const tax = 0;
    const totalBeforeDiscount = subtotal + shippingCost + tax;
    
    // Generate order ID
    const orderId = generateOrderId();
    
    // Generate UPI deep link if payment method is UPI
    let upiDeepLink = '';
    let paymentStatus = 'pending';

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const availablePoints = Math.max(0, Math.floor(Number(user.loyaltyPoints || 0)));
    const maxRedeemableByPolicy = availablePoints < 50
      ? availablePoints
      : Math.floor(availablePoints * 0.30);
    const requestedRedeem = Math.max(0, Math.floor(Number(req.body.redeemedPoints || 0)));
    if (requestedRedeem > maxRedeemableByPolicy) {
      return res.status(400).json({
        message: availablePoints < 50
          ? `You can redeem up to ${maxRedeemableByPolicy} points`
          : `You can redeem up to 30% of your points (${maxRedeemableByPolicy})`
      });
    }
    const redeemedPoints = Math.min(requestedRedeem, maxRedeemableByPolicy, totalBeforeDiscount);
    const totalAmount = totalBeforeDiscount - redeemedPoints;

    if (paymentMethod === 'upi' || paymentMethod === 'upi_qr') {
      upiDeepLink = generateUpiDeepLink(orderId, totalAmount);
      paymentStatus = 'pending_confirmation';
    }

    if (redeemedPoints > 0) {
      const redemptionUpdate = await User.findOneAndUpdate(
        { _id: req.userId, loyaltyPoints: { $gte: redeemedPoints } },
        {
          $inc: { loyaltyPoints: -redeemedPoints },
          $push: {
            loyaltyHistory: {
              type: 'redeemed',
              points: redeemedPoints,
              orderId,
              description: 'Redeemed at checkout'
            }
          }
        },
        { new: true }
      );

      if (!redemptionUpdate) {
        return res.status(400).json({ message: 'Unable to redeem points. Please try again.' });
      }
    }
    
    const order = new Order({
      orderId,
      userId: req.userId,
      phoneNumber,
      customerName,
      email,
      address,
      city,
      state,
      pincode,
      freeDeliveryZone: isFreeZoneOrder ? normalizedFreeZone : '',
      items: processedItems,
      subtotal,
      shippingCost,
      tax,
      loyaltyDiscount: redeemedPoints,
      loyaltyPointsRedeemed: redeemedPoints,
      totalAmount,
      paymentMethod: paymentMethod === 'upi' || paymentMethod === 'upi_qr' ? 'upi_qr' : paymentMethod,
      paymentStatus,
      upiDeepLink,
      customerNotes
    });
    
    try {
      await order.save();
    } catch (saveErr) {
      if (redeemedPoints > 0) {
        await User.findByIdAndUpdate(req.userId, {
          $inc: { loyaltyPoints: redeemedPoints },
          $pull: { loyaltyHistory: { type: 'redeemed', points: redeemedPoints, orderId } }
        });
      }
      throw saveErr;
    }
    
    res.status(201).json({
      message: 'Order created successfully',
      order,
      _id: order._id,
      orderId: order.orderId,
      upiDeepLink: order.upiDeepLink,
      loyaltyRedeemed: redeemedPoints,
      loyaltyEarnPreview: calculateLoyaltyEarned(order)
    });
  } catch (err) {
    console.error('❌ Order creation error:', err);
    res.status(500).json({ message: err.message, error: err.toString() });
  }
});

// 8. Get User Orders
router.get('/my-orders', authUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 9. Get Single Order (User can only see their own)
router.get('/:id', authUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 10. Upload Images for Order (User)
router.post('/:id/upload-images', authUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // TODO: Handle file upload (multer)
    // For now, accept JSON with file URLs
    const { images } = req.body;
    
    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'Images required' });
    }
    
    images.forEach(img => {
      order.uploadedImages.push({
        fileName: img.name,
        fileUrl: img.url,
        uploadedAt: new Date()
      });
    });
    
    await order.save();
    
    res.json({ message: 'Images uploaded', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 11. Integrate Order with Shiprocket (Trigger Shipment)
router.post('/integrate-shiprocket', authUser, async (req, res) => {
  try {
    const { orderId, orderData } = req.body;
    const shiprocketService = require('../services/shiprocketService');

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if already integrated with Shiprocket
    if (order.shiprocketOrderId) {
      return res.status(400).json({ message: 'Order already integrated with Shiprocket' });
    }

    // Create order in Shiprocket
    const shiprocketResult = await shiprocketService.createShiprocketOrder(order);

    if (!shiprocketResult.success) {
      return res.status(400).json({
        message: 'Failed to integrate with Shiprocket',
        error: shiprocketResult.error
      });
    }

    // Update order with Shiprocket details
    order.shiprocketOrderId = shiprocketResult.shiprocketOrderId;
    order.shiprocketTrackingId = shiprocketResult.trackingNumber;
    order.status = 'confirmed';
    order.updatedAt = new Date();

    await order.save();

    res.json({
      message: 'Order integrated with Shiprocket',
      success: true,
      shiprocketOrderId: shiprocketResult.shiprocketOrderId,
      trackingNumber: shiprocketResult.trackingNumber,
      carrier: shiprocketResult.carrier || 'Multiple Carriers',
      order
    });
  } catch (err) {
    console.error('Shiprocket integration error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
