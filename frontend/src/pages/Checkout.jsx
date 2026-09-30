import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle, CheckCircle, Copy, Truck, MapPin, Phone, Mail } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import BackButton from '../components/BackButton';
import UpiPaymentView from '../components/UpiPaymentView';
import { getWhatsAppUrl, buildOrderSuccessWhatsAppMessage } from '../utils/whatsapp';

const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.1 1.29 4.74 1.29 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm0 18.06c-1.47 0-2.93-.39-4.25-1.17l-.3-.18-3.15.83.84-3.07-.19-.3c-.88-1.39-1.35-2.98-1.35-4.63 0-4.7 3.82-8.52 8.52-8.52 4.7 0 8.52 3.82 8.52 8.52 0 4.7-3.82 8.52-8.52 8.52zm4.22-6.38c-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.51.11-.15.23-.59.75-.72.9-.14.15-.27.17-.5.06-.23-.11-.97-.36-1.84-1.14-.68-.61-1.14-1.36-1.27-1.59-.14-.23-.02-.35.1-.46.1-.09.23-.23.35-.35.11-.11.15-.19.23-.31.08-.11.04-.21-.02-.33-.06-.11-.51-1.23-.7-1.68-.19-.45-.38-.38-.52-.39-.14-.01-.3-.01-.45-.01-.15 0-.41.06-.62.29-.21.23-.81.79-.81 1.93 0 1.14.83 2.24.95 2.39.11.15 1.63 2.49 3.95 3.49 1.55.67 2.15.54 2.94.46.88-.09 1.36-.67 1.55-1.32.19-.64.19-1.19.14-1.29-.05-.1-.19-.17-.42-.29z"/>
  </svg>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, token, isAuthenticated, updateProfile, logout, refreshLoyalty } = useAuth();

  // Checkout states
  const [step, setStep] = useState('details'); // details, payment, success
  const [completedOrderItems, setCompletedOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    freeDeliveryZone: '',
    paymentMethod: 'upi',
    customerNotes: '',
    acceptedTerms: false
  });

  const [orderDetails, setOrderDetails] = useState(null);
  const [upiData, setUpiData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [availableLoyaltyPoints, setAvailableLoyaltyPoints] = useState(0);
  const [redeemPointsInput, setRedeemPointsInput] = useState('0');

  const shouldShowLoginRequired = !isAuthenticated;
  const shouldShowEmptyCart = cart.length === 0 && step !== 'success';

  const subtotal = getTotalPrice();
  const hamperItemsTotal = cart.reduce((sum, item) => sum + (Number(item.hamperItemTotal) || 0), 0);
  const subtotalWithHamper = subtotal + hamperItemsTotal;
  
  const isDigitalVideoInvitation = (item) => String(item.id || item._id || '') === 'd4';
  const isPolaroid = (item) => ['pol1', 'pol2', 'pol3'].includes(String(item.id || item._id || ''));
  const calcShippingForItems = (items) => {
    let totalShipping = 0;
    let hasPolaroids = false;
    let totalQty = 0;
    items.forEach((item) => {
      if (isDigitalVideoInvitation(item)) return;
      totalQty += Math.max(1, Number(item.quantity || 1));
      if (isPolaroid(item)) {
        hasPolaroids = true;
        return;
      }
      const price = Number(item.price || 0);
      const quantity = Math.max(1, Number(item.quantity || 1));
      let perItemShipping = 150;
      if (price < 300) perItemShipping = 69;
      else if (price <= 500) perItemShipping = 99;
      else {
        const extra = Math.min(30, Math.max(0, Math.floor((price - 500) / 100) * 10));
        perItemShipping = 150 + extra;
      }
      const discountedShipping = perItemShipping + (Math.max(0, quantity - 1) * perItemShipping * 0.5);
      totalShipping += Math.round(discountedShipping);
    });
    if (totalQty >= 30) return 399;
    if (totalQty >= 20) return 199;
    if (hasPolaroids) {
      totalShipping += 69;
    }
    return totalShipping;
  };
  
  const isFreeDeliverySelected = ['shankarpally', 'bvrit'].includes(String(orderData.freeDeliveryZone || '').toLowerCase());
  const shipping = isFreeDeliverySelected ? 0 : calcShippingForItems(cart);
  const tax = 0;
  const grossTotal = subtotalWithHamper + shipping + tax;
  const redeemPointsRequested = Math.max(0, Math.floor(Number(redeemPointsInput || 0)));
  const maxRedeemableByPolicy = availableLoyaltyPoints < 50
    ? Math.floor(availableLoyaltyPoints)
    : Math.floor(availableLoyaltyPoints * 0.30);
  const redeemPointsApplied = Math.min(redeemPointsRequested, maxRedeemableByPolicy, Math.floor(grossTotal));
  const total = grossTotal - redeemPointsApplied;

  useEffect(() => {
    if (step === 'payment' || step === 'success') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  useEffect(() => {
    let cancelled = false;
    const loadLoyalty = async () => {
      if (!token) return;
      try {
        const data = await api.loyalty.get(token);
        if (cancelled) return;
        setAvailableLoyaltyPoints(Number(data?.loyaltyPoints || 0));
      } catch (err) {
        if (!cancelled) {
          setAvailableLoyaltyPoints(Number(user?.loyaltyPoints || 0));
        }
      }
    };
    loadLoyalty();
    return () => { cancelled = true; };
  }, [token, user?.loyaltyPoints]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleFreeDeliveryZoneToggle = (zone) => {
    setOrderData((prev) => ({
      ...prev,
      freeDeliveryZone: prev.freeDeliveryZone === zone ? '' : zone
    }));
  };

  const validateForm = () => {
    if (!orderData.customerName.trim()) return 'Name is required';
    if (!orderData.phoneNumber.trim()) return 'Phone is required';
    if (!orderData.email.trim()) return 'Email is required';
    if (!orderData.address.trim()) return 'Address is required';
    if (!orderData.city.trim()) return 'City is required';
    if (!orderData.state.trim()) return 'State is required';
    if (!orderData.pincode.trim()) return 'Pincode is required';
    if (!orderData.acceptedTerms) return 'You must accept the Return & Refund Policy to proceed';
    if (redeemPointsRequested > maxRedeemableByPolicy) {
      if (availableLoyaltyPoints < 50) {
        return `You can redeem up to ${maxRedeemableByPolicy} Infinity Reward Points`;
      }
      return `You can redeem up to 30% of your Infinity Reward Points (${maxRedeemableByPolicy})`;
    }
    if (redeemPointsRequested < 0) return 'Infinity Reward Points to redeem cannot be negative';
    return null;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const profilePayload = {
        name: orderData.customerName,
        email: orderData.email,
        address: orderData.address,
        city: orderData.city,
        state: orderData.state,
        pincode: orderData.pincode
      };
      const needsProfileUpdate = !user
        || user.name !== profilePayload.name
        || user.email !== profilePayload.email
        || user.address !== profilePayload.address
        || user.city !== profilePayload.city
        || user.state !== profilePayload.state
        || user.pincode !== profilePayload.pincode;
      if (needsProfileUpdate) {
        const profileResult = await updateProfile(profilePayload);
        if (!profileResult?.success) {
          const msg = profileResult?.error || 'Failed to save address to your profile';
          if (String(msg).toLowerCase().includes('session expired') || String(msg).toLowerCase().includes('token')) {
            setError('Session expired. Please log in again.');
            navigate('/login', { state: { from: '/checkout' } });
            return;
          }
          throw new Error(msg);
        }
      }

      // Create order with UPI payment
      const response = await api.orders.create({
        items: cart.map(item => ({
          productId: item.id || item._id,
          quantity: item.quantity,
          customizationDetails: item.customizationDetails || '',
          hamperItems: Array.isArray(item.hamperItems) ? item.hamperItems : [],
          addOnType: String(item?.addOn?.type || ''),
          addOnPrice: Number(item?.addOn?.price || 0),
          price: Number(item.price || 0)
        })),
        redeemedPoints: redeemPointsApplied,
        ...orderData
      }, token);

      console.log('Order created:', response);

      setOrderDetails(response.order);
      setCompletedOrderItems([...cart]);
      setUpiData({
        orderId: response.orderId,
        upiLink: response.upiDeepLink,
        amount: response.order?.totalAmount ?? total
      });

      if (redeemPointsApplied > 0) {
        setAvailableLoyaltyPoints(prev => Math.max(0, prev - redeemPointsApplied));
      }
      await refreshLoyalty();

      setStep('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Checkout error:', err);
      if (err?.status === 401 || String(err?.message || '').toLowerCase().includes('invalid token')) {
        logout();
        setError('Session expired. Please log in again.');
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirmed = () => {
    if (cart.length > 0) {
      setCompletedOrderItems([...cart]);
    }
    clearCart();
    setStep('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (step !== 'success') return;
    const purchasedProductId = orderDetails?.items?.[0]?.productId;
    if (!purchasedProductId) {
      setRelatedProducts([]);
      return;
    }
    let cancelled = false;
    const loadRelated = async () => {
      setRelatedLoading(true);
      try {
        const product = await api.products.getById(purchasedProductId);
        if (!product?.categoryId) throw new Error('Missing category');
        const categoryProducts = await api.products.getByCategory(product.categoryId);
        const list = Array.isArray(categoryProducts) ? categoryProducts : [];
        const currentId = String(purchasedProductId);
        const filtered = list.filter(p => String(p._id || p.id || '') !== currentId).slice(0, 4);
        if (!cancelled) setRelatedProducts(filtered);
      } catch (err) {
        if (!cancelled) setRelatedProducts([]);
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    };
    loadRelated();
    return () => { cancelled = true; };
  }, [step, orderDetails?.items]);

  const generateInvoice = () => {
    const od = orderDetails || {};
    const id = od.orderId || upiData?.orderId || 'order';
    const createdAt = od.createdAt ? new Date(od.createdAt).toLocaleString() : new Date().toLocaleString();
    const items = (od.items || []).map(i => ({
      name: i.productName || i.name || 'Item',
      qty: i.quantity || 1,
      price: i.price || 0,
      hamperItems: Array.isArray(i.hamperItems) ? i.hamperItems : []
    }));
    const subtotalLocal = od.subtotal || subtotalWithHamper;
    const shippingLocal = (typeof od.shippingCost === 'number') ? od.shippingCost : shipping;
    const taxLocal = od.tax || tax;
    const totalLocal = od.totalAmount || total;

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${id}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111}h1{color:#0b63a7}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:8px;border:1px solid #ddd;text-align:left}tfoot td{font-weight:bold}.sub{background:#f9fafb}</style></head><body><h1>Infinity Customizations — Invoice</h1><p>Order ID: <strong>${id}</strong></p><p>Date: ${createdAt}</p><h3>Billing / Shipping</h3><p>${orderData.customerName}<br/>${orderData.address}<br/>${orderData.city}, ${orderData.state} ${orderData.pincode}<br/>Phone: ${orderData.phoneNumber}<br/>Email: ${orderData.email}</p><h3>Items</h3><table><thead><tr><th>Item</th><th>Qty</th><th>Price (₹)</th><th>Line Total (₹)</th></tr></thead><tbody>${items.map(it=>{
      let rows = `<tr><td>${it.name}</td><td>${it.qty}</td><td>${Number(it.price).toLocaleString('en-IN')}</td><td>${(Number(it.price)*it.qty).toLocaleString('en-IN')}</td></tr>`;
      if (it.hamperItems && it.hamperItems.length > 0) {
        it.hamperItems.forEach(h => {
          const label = h.name ? `${h.name} — ${h.link || ''}` : (h.link || 'Added Product');
          rows += `<tr class="sub"><td style="padding-left:20px;">-> ${label}</td><td>1</td><td>${Number(h.price || 0).toLocaleString('en-IN')}</td><td>${Number(h.price || 0).toLocaleString('en-IN')}</td></tr>`;
        });
      }
      return rows;
    }).join('')}</tbody><tfoot><tr><td colspan="3">Subtotal</td><td>₹${Number(subtotalLocal).toLocaleString('en-IN')}</td></tr><tr><td colspan="3">Shipping</td><td>₹${Number(shippingLocal).toLocaleString('en-IN')}</td></tr><tr><td colspan="3">Taxes</td><td>₹${Number(taxLocal).toLocaleString('en-IN')}</td></tr><tr><td colspan="3">Total</td><td>₹${Number(totalLocal).toLocaleString('en-IN')}</td></tr></tfoot></table><p style="margin-top:18px;font-size:12px;color:#555">Thank you for your order. For support, contact infinitycustomizations@gmail.com or WhatsApp +91 89859 93948.</p></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${id}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (shouldShowLoginRequired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-[#071A2F] mb-2">Login Required</h2>
        <p className="text-brand-primary/70 mb-6">Please log in to proceed with checkout</p>
        <button
          onClick={() => navigate('/login', { state: { from: '/checkout' } })}
          className="bg-brand-secondary hover:bg-brand-secondary/90 text-white px-8 py-3 rounded-lg font-bold transition-colors duration-200"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (shouldShowEmptyCart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-[#071A2F] mb-2">Your Cart is Empty</h2>
        <p className="text-brand-primary/70 mb-6">Add products to your cart before checking out</p>
        <button
          onClick={() => navigate('/')}
          className="bg-brand-secondary hover:bg-brand-secondary/90 text-white px-8 py-3 rounded-lg font-bold transition-colors duration-200"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // ===== STEP 1: DELIVERY DETAILS =====
  if (step === 'details') {
    return (
      <div className="min-h-screen bg-[#F7F8FA] py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Top Header & Breadcrumb */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#071A2F]/10">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 text-xs font-bold text-[#071A2F] hover:text-[#123C69] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Bag</span>
            </button>
            <div className="text-xs text-[#687386]">
              Secure Checkout • 256-Bit Encryption
            </div>
          </div>

          {/* 3-Step Checkout Progress Bar */}
          <div className="max-w-md mx-auto mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200 -translate-y-1/2 z-0" />
              
              <div className="relative z-10 flex flex-col items-center bg-[#F7F8FA] px-2">
                <div className="w-8 h-8 rounded-full bg-[#071A2F] text-white flex items-center justify-center font-bold text-xs ring-4 ring-[#071A2F]/10">
                  1
                </div>
                <span className="text-[11px] font-bold mt-1 text-[#071A2F]">Information</span>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-[#F7F8FA] px-2">
                <div className="w-8 h-8 rounded-full bg-white text-[#687386] border border-gray-300 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <span className="text-[11px] font-medium mt-1 text-[#687386]">Payment</span>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-[#F7F8FA] px-2">
                <div className="w-8 h-8 rounded-full bg-white text-[#687386] border border-gray-300 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <span className="text-[11px] font-medium mt-1 text-[#687386]">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xs p-6 sm:p-8 border border-[#071A2F]/8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071A2F] mb-6">
                  Delivery Information
                </h1>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl mb-6 flex gap-3 text-xs sm:text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCheckout} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-base font-bold text-[#071A2F] mb-4 pb-2 border-b border-gray-100">
                      1. Contact Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F] mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="customerName"
                          placeholder="e.g. Rahul Sharma"
                          value={orderData.customerName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#071A2F] focus:ring-1 focus:ring-[#071A2F] text-sm text-[#071A2F]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F] mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          placeholder="e.g. rahul@example.com"
                          value={orderData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#071A2F] focus:ring-1 focus:ring-[#071A2F] text-sm text-[#071A2F]"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F] mb-1.5">
                        WhatsApp Phone Number (For order & preview updates) *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="e.g. 9876543210"
                        value={orderData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#071A2F] focus:ring-1 focus:ring-[#071A2F] text-sm text-[#071A2F]"
                        required
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="text-base font-bold text-[#071A2F] mb-4 pb-2 border-b border-gray-100">
                      2. Shipping Address
                    </h3>
                    <div className="mb-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F] mb-1.5">
                        Street Address & House / Flat No. *
                      </label>
                      <textarea
                        name="address"
                        placeholder="House / Flat number, building name, street, landmark"
                        value={orderData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#071A2F] focus:ring-1 focus:ring-[#071A2F] h-24 text-sm text-[#071A2F]"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F] mb-1.5">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={orderData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#071A2F] focus:ring-1 focus:ring-[#071A2F] text-sm text-[#071A2F]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F] mb-1.5">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          placeholder="State"
                          value={orderData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#071A2F] focus:ring-1 focus:ring-[#071A2F] text-sm text-[#071A2F]"
                          required
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#071A2F] mb-1.5">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          placeholder="6-digit Pincode"
                          value={orderData.pincode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#071A2F] focus:ring-1 focus:ring-[#071A2F] text-sm text-[#071A2F]"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50">
                      <p className="text-sm font-semibold text-green-900 mb-2">Free Delivery Zones (No Shipping Charges)</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <label className="flex items-center gap-2 text-sm text-green-900">
                          <input
                            type="checkbox"
                            checked={orderData.freeDeliveryZone === 'shankarpally'}
                            onChange={() => handleFreeDeliveryZoneToggle('shankarpally')}
                            className="w-4 h-4"
                          />
                          Shankarpally
                        </label>
                        <label className="flex items-center gap-2 text-sm text-green-900">
                          <input
                            type="checkbox"
                            checked={orderData.freeDeliveryZone === 'bvrit'}
                            onChange={() => handleFreeDeliveryZoneToggle('bvrit')}
                            className="w-4 h-4"
                          />
                          BVRIT
                        </label>
                      </div>
                      {isFreeDeliverySelected && (
                        <p className="text-xs text-green-800 mt-2 font-medium">Shipping charge will be ₹0 for this order.</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-primary mb-4">Additional Notes (Optional)</h3>
                    <textarea
                      name="customerNotes"
                      placeholder="Any special instructions or requests for your order"
                      value={orderData.customerNotes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 transition-all duration-200 h-20 text-sm placeholder:text-brand-primary/40"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-amber-900">Infinity Reward Points</h3>
                      <span className="text-sm font-bold text-amber-700">Available: {Math.floor(availableLoyaltyPoints)}</span>
                    </div>
                    <div className="mb-3 text-xs text-amber-800 bg-white/70 border border-amber-200 rounded-lg p-3">
                      <p className="font-semibold mb-1">Reward Redemption Policy</p>
                      <p>1. If your points are below 50, you can redeem any amount up to your available points.</p>
                      <p>2. If your points are 50 or above, you can redeem only 30% of your available points.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-amber-800 block mb-1">Redeem Infinity Reward Points (1 point = ₹1)</label>
                        <input
                          type="number"
                          min="0"
                          max={Math.floor(maxRedeemableByPolicy)}
                          value={redeemPointsInput}
                          onChange={(e) => setRedeemPointsInput(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all duration-200 text-sm"
                          placeholder="Enter Infinity Reward Points to redeem"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setRedeemPointsInput(String(Math.floor(Math.min(maxRedeemableByPolicy, grossTotal))))}
                        className="px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors"
                      >
                        Use Max
                      </button>
                    </div>
                    <p className="text-xs text-amber-700 mt-2">
                      Max redeem allowed now: {Math.floor(maxRedeemableByPolicy)} points
                      {availableLoyaltyPoints >= 50 ? ' (30% rule applied)' : ''}
                    </p>
                    <p className="text-xs text-amber-700 mt-2">
                      Discount applied: ₹{redeemPointsApplied.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Terms & Refund Policy */}
                  <div>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="acceptedTerms"
                        checked={orderData.acceptedTerms}
                        onChange={(e) => setOrderData(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
                        className="mt-1 w-4 h-4"
                      />
                      <div>
                        <div className="text-sm">
                          I agree to the{' '}
                          <Link to="/refund-cancellation-policy" target="_blank" className="text-brand-secondary hover:text-brand-secondary/80 underline font-medium transition-colors duration-200">Return & Refund Policy</Link>
                          {' '}and{' '}
                          <Link to="/terms-and-conditions" target="_blank" className="text-brand-secondary hover:text-brand-secondary/80 underline font-medium transition-colors duration-200">Terms & Conditions</Link>.
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-primary mb-4">Payment Method</h3>
                    <div className="space-y-3">
                      <label className={`flex items-start gap-4 p-4 sm:p-5 border-2 ${orderData.paymentMethod === 'upi' ? 'border-[#071A2F] bg-[#FAF8F4]' : 'border-gray-200 bg-white'} rounded-2xl cursor-pointer transition-all duration-200`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={orderData.paymentMethod === 'upi'}
                          onChange={handleInputChange}
                          className="w-4 h-4 mt-1 accent-[#071A2F]"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-[#071A2F] text-base tracking-wide">PAY WITH UPI</span>
                              <p className="text-xs text-[#687386] mt-0.5">Fast &amp; secure payment using any UPI app</p>
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#071A2F] text-white">
                              <span className="text-[11px] font-black tracking-wider">UPI</span>
                            </div>
                          </div>

                          {orderData.paymentMethod === 'upi' && (
                            <div className="mt-3 pt-3 border-t border-[#071A2F]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                PAY USING ANY UPI APP
                              </span>
                              <span className="text-[#687386]">
                                PhonePe • GPay • Paytm • BHIM
                              </span>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !orderData.acceptedTerms}
                    className={`w-full bg-[#071A2F] hover:bg-[#123C69] ${(!orderData.acceptedTerms && !loading) ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'} disabled:bg-gray-400 text-white py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#071A2F]/15 transition-all duration-200 cursor-pointer`}
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <span>PAY ₹{total.toLocaleString('en-IN')} WITH UPI</span>
                        <span className="text-white/60">→</span>
                      </>
                    )}
                  </button>

                  {/* Reassurance Note */}
                  <p className="text-xs text-[#687386] text-center mt-3 font-medium">
                    After placing your order, we'll guide you to WhatsApp to send your personalization photos.
                  </p>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 border border-border-light sticky top-24">
                <h3 className="text-lg font-bold text-[#071A2F] mb-6">Order Summary</h3>

                {/* Items */}
                <div className="space-y-4 mb-6 pb-6 border-b border-border-light">
                  {cart.map((item) => (
                    <div key={item.id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-brand-primary/70">{item.name} x {item.quantity}</span>
                        <span className="font-semibold text-brand-primary">₹{item.price * item.quantity}</span>
                      </div>
                      {item.addOn && item.addOn.price ? (
                        <div className="text-sm font-semibold text-brand-primary/80 mt-1">({item.addOn.type || 'Add-on'}) ₹{item.addOn.price} x {item.quantity} = ₹{item.addOn.price * item.quantity}</div>
                      ) : null}
                      {item.hamperItems && item.hamperItems.length > 0 ? (
                        <div className="mt-2 pl-2 border-l-2 border-brand-secondary/30 space-y-1 text-xs">
                          <p className="font-semibold text-brand-secondary">Added Products:</p>
                          {item.hamperItems.map((hamper, idx) => (
                            <div key={idx} className="flex justify-between text-brand-primary/60">
                              <span>{hamper.name || 'Product'}{hamper.link ? ` — ${hamper.link}` : ''}</span>
                              <span className="font-semibold">₹{hamper.price}</span>
                            </div>
                          ))}
                          {item.hamperItemTotal > 0 && <p className="font-semibold text-brand-secondary/80 pt-1">Total Add-on Price: ₹{item.hamperItemTotal}</p>}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Subtotal</span>
                    <span className="text-brand-primary">₹{subtotalWithHamper.toLocaleString('en-IN')}</span>
                  </div>
                  {redeemPointsApplied > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-primary/70">Infinity Reward Points Discount</span>
                      <span className="text-green-600 font-semibold">-₹{redeemPointsApplied.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Shipping</span>
                    <span className={shipping === 0 ? 'text-brand-secondary font-semibold' : 'text-brand-primary'}>
                      {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Taxes</span>
                    <span className="text-brand-primary">₹0</span>
                  </div>
                  <div className="flex justify-between border-t border-border-light pt-3 font-bold text-lg">
                    <span className="text-brand-primary">Total</span>
                    <span className="text-brand-secondary">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg font-medium">
                  Shipping is calculated per item based on price.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== STEP 2: UPI PAYMENT PAGE =====
  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-[#F7F8FA] py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* 3-Step Checkout Progress Bar */}
          <div className="max-w-md mx-auto mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-emerald-500 -translate-y-1/2 z-0" />
              
              <div className="relative z-10 flex flex-col items-center bg-[#F7F8FA] px-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-emerald-600/10">
                  ✓
                </div>
                <span className="text-[11px] font-bold mt-1 text-emerald-700">Information</span>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-[#F7F8FA] px-2">
                <div className="w-8 h-8 rounded-full bg-[#071A2F] text-white flex items-center justify-center font-bold text-xs ring-4 ring-[#071A2F]/10">
                  2
                </div>
                <span className="text-[11px] font-bold mt-1 text-[#071A2F]">Payment</span>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-[#F7F8FA] px-2">
                <div className="w-8 h-8 rounded-full bg-white text-[#687386] border border-gray-300 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <span className="text-[11px] font-medium mt-1 text-[#687386]">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Section */}
            <div className="lg:col-span-2">
              <UpiPaymentView
                orderId={upiData?.orderId || orderDetails?.orderId || 'INF-ORDER'}
                amount={upiData?.amount || orderDetails?.totalAmount || total}
                serverUpiLink={upiData?.upiLink || orderDetails?.upiDeepLink}
                onConfirmPayment={handlePaymentConfirmed}
                onChangePaymentMethod={() => setStep('details')}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 border border-border-light sticky top-24">
                <h3 className="text-lg font-bold text-[#071A2F] mb-6">Order Summary</h3>

                {/* Items */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border-light">
                  {cart.map((item) => (
                    <div key={item.id || item._id} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-brand-primary">{item.name}</span>
                        <span className="font-bold text-brand-primary">₹{item.price * item.quantity}</span>
                      </div>
                      <span className="text-xs text-brand-primary/60">Quantity: {item.quantity}</span>
                      {item.addOn && item.addOn.price ? (
                        <div className="text-xs text-brand-primary/60 mt-1">Add-on ({item.addOn.type || 'Custom'}) ₹{item.addOn.price} x {item.quantity} = ₹{item.addOn.price * item.quantity}</div>
                      ) : null}
                      {item.hamperItems && item.hamperItems.length > 0 ? (
                        <div className="mt-2 pl-2 border-l-2 border-brand-secondary/30 space-y-1 text-xs">
                          <p className="font-semibold text-brand-secondary">Added Products:</p>
                          {item.hamperItems.map((hamper, idx) => (
                            <div key={idx} className="flex justify-between text-brand-primary/60">
                              <span>{hamper.name || 'Product'}{hamper.link ? ` — ${hamper.link}` : ''}</span>
                              <span className="font-semibold">₹{hamper.price}</span>
                            </div>
                          ))}
                          {item.hamperItemTotal > 0 && <p className="font-semibold text-brand-secondary/80 pt-1">Total Add-on: ₹{item.hamperItemTotal}</p>}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Subtotal</span>
                    <span className="text-brand-primary">₹{subtotalWithHamper.toLocaleString('en-IN')}</span>
                  </div>
                  {redeemPointsApplied > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-primary/70">Infinity Reward Points Discount</span>
                      <span className="text-green-600 font-semibold">-₹{redeemPointsApplied.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Shipping</span>
                    <span className={shipping === 0 ? 'text-brand-secondary font-semibold' : 'text-brand-primary'}>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Taxes</span>
                    <span className="text-brand-primary">₹0</span>
                  </div>
                  <div className="flex justify-between border-t border-border-light pt-2 font-bold text-lg">
                    <span className="text-brand-primary">Total</span>
                    <span className="text-brand-secondary">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-gradient-to-br from-brand-secondary/5 to-brand-secondary/10 border border-brand-secondary/30 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-brand-primary mb-2">Delivery Address</p>
                  <p className="text-xs text-brand-primary/80">{orderData.customerName}</p>
                  <p className="text-xs text-brand-primary/80">{orderData.address}</p>
                  <p className="text-xs text-brand-primary/80">{orderData.city}, {orderData.state} {orderData.pincode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== STEP 3: SUCCESS PAGE =====
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#F7F8FA] py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          
          {/* 3-Step Checkout Progress Bar: All Complete */}
          <div className="max-w-md mx-auto mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-emerald-500 -translate-y-1/2 z-0" />
              
              <div className="relative z-10 flex flex-col items-center bg-[#F7F8FA] px-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-emerald-600/10">
                  ✓
                </div>
                <span className="text-[11px] font-bold mt-1 text-emerald-700">Information</span>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-[#F7F8FA] px-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-emerald-600/10">
                  ✓
                </div>
                <span className="text-[11px] font-bold mt-1 text-emerald-700">Payment</span>
              </div>

              <div className="relative z-10 flex flex-col items-center bg-[#F7F8FA] px-2">
                <div className="w-8 h-8 rounded-full bg-[#071A2F] text-white flex items-center justify-center font-bold text-xs ring-4 ring-[#071A2F]/10">
                  ✓
                </div>
                <span className="text-[11px] font-bold mt-1 text-[#071A2F]">Confirmed</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-10 border border-[#071A2F]/10">
            {/* Header: ORDER PLACED ✓ */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle className="w-9 h-9" />
              </div>
              <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
                ORDER PLACED ✓
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071A2F] mb-2 tracking-tight">
                Order #{upiData?.orderId || orderDetails?.orderId || 'INF-ORDER'}
              </h1>
              <p className="text-xs sm:text-sm text-[#687386]">
                Thank you! Your personalized order has been placed and is being prepared by our studio.
              </p>
            </div>

            {/* ONE LAST STEP — THE PRIMARY WHATSAPP CTA PANEL */}
            <div className="bg-[#FAF8F4] border-2 border-[#071A2F]/15 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto mb-8 shadow-sm text-center">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#C5A46D] block mb-1.5">
                ONE LAST STEP
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#071A2F] mb-2">
                Send us your photos/details on WhatsApp so we can start personalizing your order.
              </h2>
              <p className="text-xs text-[#687386] mb-6 leading-relaxed">
                Click below to open WhatsApp with your order details pre-filled. You can then attach your photos directly in the chat for our design team to start crafting your digital preview.
              </p>

              {(() => {
                const orderRef = upiData?.orderId || orderDetails?.orderId || 'INF-ORDER';
                const itemsList = completedOrderItems.length > 0 ? completedOrderItems : (orderDetails?.items || []);
                const prefilledMessage = buildOrderSuccessWhatsAppMessage({
                  orderReference: orderRef,
                  items: itemsList
                });
                const whatsappUrl = getWhatsAppUrl(prefilledMessage);

                return (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#20ba5c] text-white py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base shadow-lg shadow-[#25D366]/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <WhatsAppIcon size={20} />
                    <span>SEND PHOTOS ON WHATSAPP</span>
                  </a>
                );
              })()}

              <p className="text-[11px] text-[#687386] mt-3">
                Business WhatsApp: <strong className="font-mono text-[#071A2F]">+91 89859 93948</strong> • We send a digital proof before printing
              </p>
            </div>

            {/* Order Reference Card */}
            <div className="bg-[#F7F8FA] border border-[#071A2F]/8 p-5 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-[#687386] font-bold uppercase tracking-wider">Order Reference</p>
                <code className="text-lg font-mono font-extrabold text-[#071A2F]">
                  {upiData?.orderId || orderDetails?.orderId}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(upiData?.orderId || orderDetails?.orderId || '');
                    alert('Order ID copied to clipboard');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#071A2F] text-xs font-bold text-[#071A2F] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  <Copy size={14} />
                  <span>Copy ID</span>
                </button>
                <button
                  type="button"
                  onClick={generateInvoice}
                  className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#071A2F] text-xs font-bold text-[#071A2F] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Download Invoice
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl mb-8 text-left">
              <h3 className="text-sm font-bold text-amber-900 mb-1">Payment Verification Pending</h3>
              <p className="text-amber-900/80 text-xs leading-relaxed">
                Your payment reference has been recorded. Our team verifies UPI UTRs within 1–2 hours and will confirm the digital proof with you on WhatsApp.
              </p>
            </div>

            {/* Order Products & Delivery Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              {/* Ordered Items */}
              <div className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#071A2F]/8">
                <h3 className="text-xs font-bold text-[#071A2F] mb-3 pb-2 border-b border-gray-200/60 uppercase tracking-wider">
                  Ordered Products
                </h3>
                <div className="space-y-3 text-xs">
                  {(completedOrderItems.length > 0 ? completedOrderItems : (orderDetails?.items || [])).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-semibold text-[#071A2F]">{item.name || item.productName || 'Keepsake'}</span>
                        <span className="text-[#687386] ml-1">x{item.quantity || 1}</span>
                        {item.customizationDetails && (
                          <p className="text-[10px] text-[#C5A46D] line-clamp-1 mt-0.5">{item.customizationDetails}</p>
                        )}
                      </div>
                      <span className="font-bold text-[#071A2F]">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200/60 flex justify-between font-bold text-xs text-[#071A2F]">
                    <span>Total Paid</span>
                    <span className="text-[#123C69] font-extrabold">₹{(upiData?.amount || orderDetails?.totalAmount || total).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#071A2F]/8">
                <h3 className="text-xs font-bold text-[#071A2F] mb-3 pb-2 border-b border-gray-200/60 uppercase tracking-wider">
                  Delivery Details
                </h3>
                <div className="space-y-1.5 text-xs text-[#071A2F]">
                  <p className="font-bold text-sm">{orderData.customerName}</p>
                  <p className="text-[#687386]">{orderData.address}</p>
                  <p className="text-[#687386]">{orderData.city}, {orderData.state} {orderData.pincode}</p>
                  <p className="text-[#687386] pt-1">Phone: <span className="font-semibold text-[#071A2F]">{orderData.phoneNumber}</span></p>
                  <p className="text-[#687386]">Email: <span className="font-semibold text-[#071A2F]">{orderData.email}</span></p>
                </div>
              </div>
            </div>

            {/* Continue Shopping Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-[#071A2F] hover:bg-[#0B2748] text-white py-3.5 px-8 rounded-full font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
              >
                CONTINUE SHOPPING
              </button>
            </div>

            {/* Related Products Section */}
            {!relatedLoading && relatedProducts && relatedProducts.length > 0 && (
              <div className="mt-12 text-left pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-[#071A2F]">Related Products</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {relatedProducts.map(p => (
                    <a
                      href={`/product/${p._id || p.id}`}
                      key={p._id || p.id}
                      className="block group"
                    >
                      <div className="rounded-lg overflow-hidden aspect-[4/5] bg-surface-light shadow-sm hover:shadow-md transition-shadow duration-200">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <h4 className="font-semibold text-[#071A2F] text-sm mt-3 truncate">{p.name}</h4>
                      {p.description && (
                        <p className="text-xs text-gray-600 mt-1 leading-snug max-h-8 overflow-hidden">{p.description}</p>
                      )}
                      <p className="text-brand-secondary font-bold text-sm mt-1">₹{p.price}</p>
                    </a>
                  ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }
};

export default Checkout;

