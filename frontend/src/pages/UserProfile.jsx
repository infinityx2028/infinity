import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, LogOut, Edit2, Save, X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, token, logout, updateProfile, isAuthenticated, loading: authLoading, refreshLoyalty } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [earnedPopupValue, setEarnedPopupValue] = useState(0);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!token) return;
    refreshLoyalty();
  }, [token, refreshLoyalty]);

  useEffect(() => {
    const target = Math.max(0, Number(user?.loyaltyPoints || 0));
    const start = animatedPoints;
    if (target === start) return;
    const duration = 700;
    const startedAt = performance.now();
    let rafId;
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const value = Math.round(start + ((target - start) * progress));
      setAnimatedPoints(value);
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [user?.loyaltyPoints]);

  useEffect(() => {
    const current = Math.max(0, Number(user?.loyaltyPoints || 0));
    const previous = Number(localStorage.getItem('lastSeenLoyaltyPoints') || 0);
    if (current > previous) {
      const delta = current - previous;
      setEarnedPopupValue(delta);
      setShowPointsPopup(true);
      setTimeout(() => setShowPointsPopup(false), 2200);
    }
    localStorage.setItem('lastSeenLoyaltyPoints', String(current));
  }, [user?.loyaltyPoints]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const response = await updateProfile(formData);

      if (response.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-light to-surface-elevated">
        <Loader className="w-8 h-8 animate-spin text-brand-secondary" />
      </div>
    );
  }

  const loyaltyPoints = Math.max(0, Number(user?.loyaltyPoints || 0));
  const loyaltyHistory = Array.isArray(user?.loyaltyHistory) ? user.loyaltyHistory : [];
  const pointsToNextReward = 100 - (loyaltyPoints % 100 || 0);
  const progressPercent = Math.min(100, (loyaltyPoints % 100) || (loyaltyPoints > 0 ? 100 : 0));
  const latestEarned = loyaltyHistory.find((entry) => entry?.type === 'earned');

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-light to-surface-elevated py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="mb-2"><BackButton to="/" /></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-primary">
            Account Settings
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border-light">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{formData.name || 'User'}</h2>
                <p className="text-white/80 text-sm">+91 {formData.phoneNumber}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-auto bg-white text-brand-secondary hover:bg-surface-light font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-b border-green-200 p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
          )}

          <div className="px-8 pt-8">
            <div className="relative bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border border-amber-200 rounded-xl p-6 overflow-hidden">
              {showPointsPopup && (
                <div className="absolute right-4 top-4 text-green-600 font-bold animate-float-points">
                  +{earnedPopupValue} Points
                </div>
              )}
              <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">Infinity Reward Points</p>
              <p className="text-4xl font-bold text-amber-900 mt-1">{animatedPoints}</p>
              <p className="text-sm text-amber-800 mt-1">1 point = ₹1 reward value</p>
              <div className="mt-3 text-xs bg-white/80 border border-amber-200 rounded-lg px-3 py-2 text-amber-900">
                <p className="font-semibold mb-1">Redemption Policy</p>
                <p>1. Below 50 points: redeem any amount up to available points.</p>
                <p>2. 50 points or above: redeem only 30% of available points.</p>
                <p className="mt-1 font-semibold">
                  Your current max redeemable points: {loyaltyPoints < 50 ? loyaltyPoints : Math.floor(loyaltyPoints * 0.30)}
                </p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-amber-700 mb-1">
                  <span>Earn 100 Infinity Reward Points to unlock ₹100 reward</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-amber-200/80 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-amber-700 mt-2">{pointsToNextReward} Infinity Reward Points to next ₹100 reward step</p>
              </div>
              {latestEarned && (
                <div className="mt-4 text-xs bg-white/70 border border-amber-200 rounded-lg px-3 py-2 text-amber-800">
                  You earned {latestEarned.points} Infinity Reward Points from this order.
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave} className="p-8">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 disabled:bg-surface-elevated disabled:text-brand-primary/50 transition-all duration-200 text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-secondary" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 disabled:bg-surface-elevated disabled:text-brand-primary/50 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            {/* Phone Number (Read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-brand-primary mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-secondary" />
                Phone Number
              </label>
              <input
                type="text"
                value={`+91 ${formData.phoneNumber}`}
                disabled
                className="w-full px-4 py-3 border-2 border-border-light rounded-lg bg-surface-elevated text-brand-primary/50 text-sm"
              />
              <p className="text-xs text-brand-primary/50 mt-2">Phone number is fixed to your account</p>
            </div>

            {/* Address */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-brand-primary mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-secondary" />
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="123 Main Street"
                className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 disabled:bg-surface-elevated disabled:text-brand-primary/50 transition-all duration-200 text-sm"
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Mumbai"
                  className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 disabled:bg-surface-elevated disabled:text-brand-primary/50 transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Maharashtra"
                  className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 disabled:bg-surface-elevated disabled:text-brand-primary/50 transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2">Postal Code</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="400001"
                  className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 disabled:bg-surface-elevated disabled:text-brand-primary/50 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            {/* Buttons */}
            {isEditing && (
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:flex-1 bg-brand-secondary hover:bg-brand-secondary/90 disabled:bg-border-light text-white font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phoneNumber: user?.phoneNumber || '',
                      address: user?.address || '',
                      city: user?.city || '',
                      state: user?.state || '',
                      pincode: user?.pincode || '',
                    });
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full md:flex-1 bg-border-light hover:bg-border-dark text-brand-primary font-semibold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </form>

          {/* Account Info */}
          <div className="bg-surface-elevated border-t border-border-light p-8">
            <h3 className="font-semibold text-brand-primary mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-brand-primary/60 mb-1 text-xs uppercase tracking-wide font-semibold">Account Type</p>
                <p className="font-semibold text-brand-primary capitalize">{user?.role || 'Customer'}</p>
              </div>
              <div>
                <p className="text-brand-primary/60 mb-1 text-xs uppercase tracking-wide font-semibold">Verification Status</p>
                <p className="font-semibold text-green-600">{user?.isVerified ? 'Verified' : 'Pending Verification'}</p>
              </div>
              <div>
                <p className="text-brand-primary/60 mb-1 text-xs uppercase tracking-wide font-semibold">Member Since</p>
                <p className="font-semibold text-brand-primary">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border-light p-8">
            <h3 className="font-semibold text-brand-primary mb-4">Infinity Reward Points History</h3>
            {loyaltyHistory.length === 0 ? (
              <p className="text-sm text-brand-primary/60">No Infinity Reward Points activity yet.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {loyaltyHistory.slice(0, 20).map((entry, idx) => (
                  <div key={`${entry.orderId || 'loy'}-${entry.createdAt || idx}-${idx}`} className="bg-surface-elevated border border-border-light rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${entry.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.type === 'earned' ? `+${entry.points}` : `-${entry.points}`} Infinity Reward Points
                      </span>
                      <span className="text-xs text-brand-primary/60">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-primary/70 mt-1">Order ID: {entry.orderId || 'N/A'}</p>
                    <p className="text-xs text-brand-primary/70 mt-1">{entry.description || (entry.type === 'earned' ? 'Infinity Reward Points earned' : 'Infinity Reward Points redeemed')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/orders"
            className="bg-white border-2 border-border-light hover:border-brand-secondary rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200"
          >
            <div className="text-3xl mb-2 select-none">📋</div>
            <p className="text-sm font-semibold text-brand-primary">My Orders</p>
          </Link>
          <Link
            to="/cart"
            className="bg-white border-2 border-border-light hover:border-brand-secondary rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200"
          >
            <div className="text-3xl mb-2 select-none">🛒</div>
            <p className="text-sm font-semibold text-brand-primary">Shopping Cart</p>
          </Link>
            <Link
              to="/"
              className="bg-white border-2 border-border-light hover:border-brand-secondary rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200"
            >
            <div className="text-3xl mb-2 select-none">🏪</div>
            <p className="text-sm font-semibold text-brand-primary">Browse Store</p>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-50 border-2 border-red-200 hover:border-red-400 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200"
          >
            <div className="text-3xl mb-2 select-none">🚪</div>
            <p className="text-sm font-semibold text-red-600">Sign Out</p>
          </button>
        </div>
        <style>{`
          .animate-float-points {
            animation: floatPoints 2.2s ease-out forwards;
          }
          @keyframes floatPoints {
            0% { opacity: 0; transform: translateY(8px) scale(0.95); }
            20% { opacity: 1; transform: translateY(0) scale(1.05); }
            100% { opacity: 0; transform: translateY(-30px) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default UserProfile;
