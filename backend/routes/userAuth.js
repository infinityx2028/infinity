const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { generateToken } = require('../services/tokenService');
const { authUser } = require('../middleware/auth');

// Helper to sanitize and format Indian phone number
const normalizePhoneNumber = (raw) => {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
};

// Helper to build safe user payload for responses
const buildUserPayload = (user) => ({
  id: user._id,
  _id: user._id,
  phoneNumber: user.phoneNumber,
  name: user.name || '',
  email: user.email || '',
  dateOfBirth: user.dateOfBirth || '',
  address: user.address || '',
  city: user.city || '',
  state: user.state || '',
  pincode: user.pincode || '',
  addresses: user.addresses || [],
  wishlist: user.wishlist || [],
  preferences: user.preferences || {
    orderUpdatesWhatsApp: true,
    orderUpdatesEmail: true,
    offersWhatsApp: false,
    offersEmail: false,
  },
  loyaltyPoints: user.loyaltyPoints || 0,
  loyaltyHistory: user.loyaltyHistory || [],
  role: user.role || 'user'
});

// ==========================================
// 1. DEDICATED LOGIN (Email OR Phone + Password)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, email, phoneNumber, password } = req.body;
    const identifier = (emailOrPhone || email || phoneNumber || '').trim();

    if (!identifier) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please enter your email or 10-digit mobile number' 
      });
    }

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please enter your password' 
      });
    }

    let user = null;
    const isEmail = identifier.includes('@');

    if (isEmail) {
      user = await User.findOne({ 
        email: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') 
      });
    } else {
      const cleanPhone = normalizePhoneNumber(identifier);
      if (/^[6-9]\d{9}$/.test(cleanPhone)) {
        user = await User.findOne({ phoneNumber: cleanPhone });
      }
    }

    // Fallback: if not found by primary detection, search across both
    if (!user) {
      const cleanPhone = normalizePhoneNumber(identifier);
      user = await User.findOne({
        $or: [
          { email: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          ...(cleanPhone ? [{ phoneNumber: cleanPhone }] : [])
        ]
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'No account found with these details. Please check your credentials or create an account.' 
      });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        error: 'This account has been deactivated. Please contact support.'
      });
    }

    if (!user.password) {
      return res.status(401).json({ 
        success: false, 
        error: 'Account exists without a password. Please sign up or contact support.' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Incorrect password. Please try again.' 
      });
    }

    const token = generateToken(user._id, user.role);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: buildUserPayload(user)
    });
  } catch (err) {
    console.error('User login error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'An internal error occurred during login. Please try again.' 
    });
  }
});

// ==========================================
// 2. DEDICATED SIGNUP / REGISTER
// ==========================================
router.post(['/signup', '/register'], async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please enter your full name (minimum 2 characters)' 
      });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please enter a valid email address' 
      });
    }

    const cleanPhone = normalizePhoneNumber(phoneNumber);
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please enter a valid 10-digit Indian mobile number' 
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if phone already registered
    const existingPhone = await User.findOne({ phoneNumber: cleanPhone });
    if (existingPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'An account with this mobile number already exists. Please sign in.' 
      });
    }

    // Check if email already registered
    const existingEmail = await User.findOne({ 
      email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') 
    });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'An account with this email address already exists. Please sign in.' 
      });
    }

    // Create new customer
    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      phoneNumber: cleanPhone,
      password,
      role: 'user',
      isVerified: true,
      preferences: {
        orderUpdatesWhatsApp: true,
        orderUpdatesEmail: true,
        offersWhatsApp: false,
        offersEmail: false
      }
    });

    await user.save();
    console.log(`✅ New user registered: ${cleanEmail} (${cleanPhone})`);

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: buildUserPayload(user)
    });
  } catch (err) {
    console.error('User registration error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to create account. Please try again.' 
    });
  }
});

// ==========================================
// 3. BACKWARD-COMPATIBLE VERIFY-CREDENTIALS
// ==========================================
router.post('/verify-credentials', async (req, res) => {
  try {
    const { phoneNumber, password, name } = req.body;
    const cleanPhone = normalizePhoneNumber(phoneNumber);
    
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number' });
    }
    
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password required' });
    }

    let user = await User.findOne({ phoneNumber: cleanPhone });
    
    if (!user) {
      // For first-time user via legacy endpoint, name is required
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ success: false, error: 'Name required for new registration' });
      }
      user = new User({
        phoneNumber: cleanPhone,
        password,
        name: name.trim(),
        role: 'user',
        isVerified: true
      });
      await user.save();
      console.log(`✅ New user created via verify-credentials: ${cleanPhone}`);
    } else {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Invalid password' });
      }
      if (name && name.trim().length >= 2 && !user.name) {
        user.name = name.trim();
        await user.save();
      }
      console.log(`✅ Login successful via verify-credentials for: ${cleanPhone}`);
    }
    
    const token = generateToken(user._id, user.role);
    
    return res.json({ 
      success: true,
      error: null,
      message: 'Login successful',
      token,
      user: buildUserPayload(user)
    });
  } catch (err) {
    console.error('verify-credentials error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal server error',
      message: err.message
    });
  }
});

// ==========================================
// 4. GET USER PROFILE
// ==========================================
router.get('/profile', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -otpExpiry');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json(buildUserPayload(user));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 5. UPDATE USER PROFILE (Personal Information)
// ==========================================
router.put('/profile', authUser, async (req, res) => {
  try {
    const { name, email, phoneNumber, dateOfBirth, address, city, state, pincode } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name && name.trim().length >= 2) {
      user.name = name.trim();
    }

    if (dateOfBirth !== undefined) {
      user.dateOfBirth = String(dateOfBirth).trim();
    }

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ success: false, error: 'Invalid email format' });
      }
      // Check if email taken by someone else
      const existing = await User.findOne({
        _id: { $ne: req.userId },
        email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });
      if (existing) {
        return res.status(400).json({ success: false, error: 'This email is already in use by another account' });
      }
      user.email = cleanEmail;
    }

    if (phoneNumber && phoneNumber.trim()) {
      const cleanPhone = normalizePhoneNumber(phoneNumber);
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.status(400).json({ success: false, error: 'Invalid 10-digit mobile number' });
      }
      const existing = await User.findOne({
        _id: { $ne: req.userId },
        phoneNumber: cleanPhone
      });
      if (existing) {
        return res.status(400).json({ success: false, error: 'This mobile number is already in use by another account' });
      }
      user.phoneNumber = cleanPhone;
    }

    // Sync legacy address fields if provided
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (pincode !== undefined) user.pincode = pincode;

    await user.save();

    res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      user: buildUserPayload(user) 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 6. CHANGE PASSWORD (Server-side validation)
// ==========================================
router.post('/change-password', authUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, error: 'Current password is required' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    console.log(`🔐 Password successfully changed for user: ${user.phoneNumber || user.email}`);
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update password' });
  }
});

// ==========================================
// 7. ADDRESS BOOK MANAGEMENT
// ==========================================

// Get all addresses
router.get('/addresses', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, addresses: user.addresses || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new address
router.post('/addresses', authUser, async (req, res) => {
  try {
    const { fullName, phoneNumber, addressLine1, addressLine2, landmark, city, state, pincode, country, label, isDefault } = req.body;

    if (!fullName || !phoneNumber || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, error: 'Please fill all required address fields' });
    }

    const cleanPhone = normalizePhoneNumber(phoneNumber);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number' });
    }

    if (!/^\d{6}$/.test(String(pincode).trim())) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 6-digit PIN code' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.addresses = user.addresses || [];
    const makeDefault = isDefault || user.addresses.length === 0;

    if (makeDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
      user.address = addressLine1 + (addressLine2 ? `, ${addressLine2}` : '');
      user.city = city.trim();
      user.state = state.trim();
      user.pincode = String(pincode).trim();
    }

    user.addresses.push({
      fullName: fullName.trim(),
      phoneNumber: cleanPhone,
      addressLine1: addressLine1.trim(),
      addressLine2: (addressLine2 || '').trim(),
      landmark: (landmark || '').trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: String(pincode).trim(),
      country: country || 'India',
      label: ['Home', 'Work', 'Other'].includes(label) ? label : 'Home',
      isDefault: makeDefault
    });

    await user.save();
    res.status(201).json({ 
      success: true, 
      message: 'Address added successfully', 
      addresses: user.addresses 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update address
router.put('/addresses/:addressId', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const addr = user.addresses.id(req.params.addressId);
    if (!addr) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    const { fullName, phoneNumber, addressLine1, addressLine2, landmark, city, state, pincode, country, label, isDefault } = req.body;

    if (fullName) addr.fullName = fullName.trim();
    if (phoneNumber) {
      const cleanPhone = normalizePhoneNumber(phoneNumber);
      if (/^[6-9]\d{9}$/.test(cleanPhone)) addr.phoneNumber = cleanPhone;
    }
    if (addressLine1) addr.addressLine1 = addressLine1.trim();
    if (addressLine2 !== undefined) addr.addressLine2 = addressLine2.trim();
    if (landmark !== undefined) addr.landmark = landmark.trim();
    if (city) addr.city = city.trim();
    if (state) addr.state = state.trim();
    if (pincode) {
      const pinStr = String(pincode).trim();
      if (/^\d{6}$/.test(pinStr)) addr.pincode = pinStr;
    }
    if (country) addr.country = country;
    if (label && ['Home', 'Work', 'Other'].includes(label)) addr.label = label;

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
      addr.isDefault = true;
      user.address = addr.addressLine1 + (addr.addressLine2 ? `, ${addr.addressLine2}` : '');
      user.city = addr.city;
      user.state = addr.state;
      user.pincode = addr.pincode;
    }

    await user.save();
    res.json({ success: true, message: 'Address updated successfully', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Set address as default
router.put('/addresses/:addressId/default', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, error: 'Address not found' });

    user.addresses.forEach(a => { a.isDefault = false; });
    addr.isDefault = true;

    user.address = addr.addressLine1 + (addr.addressLine2 ? `, ${addr.addressLine2}` : '');
    user.city = addr.city;
    user.state = addr.state;
    user.pincode = addr.pincode;

    await user.save();
    res.json({ success: true, message: 'Default address updated', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete address
router.delete('/addresses/:addressId', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, error: 'Address not found' });

    const wasDefault = addr.isDefault;
    user.addresses.pull(req.params.addressId);

    // If removed default, make first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
      user.address = user.addresses[0].addressLine1;
      user.city = user.addresses[0].city;
      user.state = user.addresses[0].state;
      user.pincode = user.addresses[0].pincode;
    }

    await user.save();
    res.json({ success: true, message: 'Address removed', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 8. WISHLIST / SAVED ITEMS SYNC
// ==========================================
router.get('/wishlist', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/wishlist/toggle', authUser, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, error: 'Product ID required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.wishlist = user.wishlist || [];
    const index = user.wishlist.indexOf(String(productId));
    let isSaved = false;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      isSaved = false;
    } else {
      user.wishlist.push(String(productId));
      isSaved = true;
    }

    await user.save();
    res.json({ success: true, isSaved, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 9. PREFERENCES (Communication Preferences)
// ==========================================
router.get('/preferences', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ 
      success: true, 
      preferences: user.preferences || {
        orderUpdatesWhatsApp: true,
        orderUpdatesEmail: true,
        offersWhatsApp: false,
        offersEmail: false
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/preferences', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.preferences = {
      orderUpdatesWhatsApp: Boolean(req.body.orderUpdatesWhatsApp ?? user.preferences?.orderUpdatesWhatsApp ?? true),
      orderUpdatesEmail: Boolean(req.body.orderUpdatesEmail ?? user.preferences?.orderUpdatesEmail ?? true),
      offersWhatsApp: Boolean(req.body.offersWhatsApp ?? user.preferences?.offersWhatsApp ?? false),
      offersEmail: Boolean(req.body.offersEmail ?? user.preferences?.offersEmail ?? false)
    };

    await user.save();
    res.json({ success: true, message: 'Preferences updated', preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 10. PRIVACY / DEACTIVATE ACCOUNT
// ==========================================
router.post('/delete-account', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Safely deactivate account rather than wiping financial order audit records
    user.isDeactivated = true;
    user.name = `[Deactivated User ${user._id.toString().slice(-4)}]`;
    await user.save();

    console.log(`⚠️ User account marked deactivated: ${user._id}`);
    res.json({ success: true, message: 'Account deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 11. LEGACY OTP ENDPOINTS (Preserved for compatibility)
// ==========================================
router.post('/verify-otp', async (req, res) => {
  return res.status(200).json({ success: true, message: 'OTP system removed' });
});

router.post('/complete-registration', async (req, res) => {
  return res.status(200).json({ success: true, message: 'OTP system removed' });
});

module.exports = router;
