import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User, Package, MapPin, Heart, Shield, Bell, HelpCircle,
  LogOut, Plus, Edit2, Trash2, Check, CheckCircle, AlertCircle,
  ChevronRight, ArrowRight, Eye, EyeOff, Loader, MessageCircle,
  ExternalLink, Sparkles, X, Phone, Mail, Calendar, Home, Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { useQuickView } from '../contexts/useQuickView';
import { API_BASE_URL, orders as ordersApi, products as productsApi } from '../services/api';

const AccountCenter = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const {
    user,
    token,
    isAuthenticated,
    loading: authLoading,
    logout,
    updateProfile,
    changePassword,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    updatePreferences,
    deleteAccount,
    wishlist,
    toggleSavedGift
  } = useAuth();

  const { openQuickView } = useQuickView();

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Keep tab synced with query param
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // State: Orders
  const [ordersList, setOrdersList] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State: Saved Items (Wishlist)
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // State: Personal Information Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: ''
  });
  const [profileModified, setProfileModified] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // State: Security / Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // State: Address Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    label: 'Home',
    isDefault: false
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // State: Preferences
  const [preferences, setPreferences] = useState({
    orderUpdatesWhatsApp: true,
    orderUpdatesEmail: true,
    offersWhatsApp: false,
    offersEmail: false
  });
  const [, setPreferencesSaving] = useState(false);

  // State: Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Populate profile form whenever user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || ''
      });
      if (user.preferences) {
        setPreferences({
          orderUpdatesWhatsApp: user.preferences.orderUpdatesWhatsApp ?? true,
          orderUpdatesEmail: user.preferences.orderUpdatesEmail ?? true,
          offersWhatsApp: user.preferences.offersWhatsApp ?? false,
          offersEmail: user.preferences.offersEmail ?? false
        });
      }
    }
  }, [user]);

  // Load Orders when orders tab is active
  useEffect(() => {
    if (!isAuthenticated || !token || activeTab !== 'orders') return;
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await ordersApi.getMyOrders(token);
        if (cancelled) return;
        if (Array.isArray(res)) {
          setOrdersList(res);
        } else if (res && res.orders) {
          setOrdersList(res.orders);
        } else {
          setOrdersList([]);
        }
      } catch {
        if (!cancelled) setOrdersList([]);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };

    fetchOrders();
    return () => { cancelled = true; };
  }, [isAuthenticated, token, activeTab]);

  // Load Wishlist when saved tab is active
  useEffect(() => {
    if (activeTab !== 'saved') return;
    let cancelled = false;

    const loadWishlist = async () => {
      try {
        setWishlistLoading(true);
        const ids = wishlist;
        if (ids.length === 0) {
          setWishlistProducts([]);
          setWishlistLoading(false);
          return;
        }

        const all = await productsApi.getAll();
        if (cancelled) return;
        const allList = Array.isArray(all) ? all : [];
        const matches = allList.filter(p => ids.includes(p.id) || ids.includes(p._id));
        setWishlistProducts(matches);
      } catch {
        if (!cancelled) setWishlistProducts([]);
      } finally {
        if (!cancelled) setWishlistLoading(false);
      }
    };

    loadWishlist();
    return () => { cancelled = true; };
  }, [activeTab, wishlist]);

  const removeWishlistItem = async (productId) => {
    try {
      await toggleSavedGift(productId);
      setWishlistProducts(prev => prev.filter(p => (p.id || p._id) !== productId));
      window.dispatchEvent(new Event('storage'));
      showToast('Item removed from saved list');
    } catch { showToast('Could not remove this gift. Please try again.', 'error'); }
  };

  // Profile Change Handler
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => {
      const updated = { ...prev, [name]: value };
      const hasChanged = 
        updated.name !== (user?.name || '') ||
        updated.email !== (user?.email || '') ||
        updated.phoneNumber !== (user?.phoneNumber || '') ||
        updated.dateOfBirth !== (user?.dateOfBirth || '');
      setProfileModified(hasChanged);
      return updated;
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileModified) return;

    try {
      setProfileSaving(true);
      const res = await updateProfile(profileForm);
      if (res.success) {
        setProfileModified(false);
        showToast('Profile updated successfully ✓');
      } else {
        showToast(res.error || 'Failed to update profile', 'error');
      }
    } catch {
      showToast('Error updating profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (res.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showToast('Password changed successfully ✓');
      } else {
        showToast(res.error || 'Failed to change password', 'error');
      }
    } catch {
      showToast('Error updating password', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Address Handlers
  const openNewAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      label: 'Home',
      isDefault: (user?.addresses || []).length === 0
    });
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName || '',
      phoneNumber: addr.phoneNumber || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      label: addr.label || 'Home',
      isDefault: Boolean(addr.isDefault)
    });
    setAddressModalOpen(true);
  };

  const handleAddressSave = async (e) => {
    e.preventDefault();
    try {
      setAddressSaving(true);
      let res;
      if (editingAddressId) {
        res = await updateAddress(editingAddressId, addressForm);
      } else {
        res = await addAddress(addressForm);
      }

      if (res.success) {
        setAddressModalOpen(false);
        showToast(editingAddressId ? 'Address updated ✓' : 'Address added ✓');
      } else {
        showToast(res.error || 'Failed to save address', 'error');
      }
    } catch {
      showToast('Error saving address', 'error');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;
    const res = await deleteAddress(addressId);
    if (res.success) {
      showToast('Address removed ✓');
    } else {
      showToast(res.error || 'Failed to remove address', 'error');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    const res = await setDefaultAddress(addressId);
    if (res.success) {
      showToast('Default address updated ✓');
    } else {
      showToast(res.error || 'Failed to set default address', 'error');
    }
  };

  // Preferences Handler
  const handleTogglePreference = async (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    try {
      setPreferencesSaving(true);
      const res = await updatePreferences(updated);
      if (res.success) {
        showToast('Preference saved ✓');
      }
    } catch {
      showToast('Failed to update preference', 'error');
    } finally {
      setPreferencesSaving(false);
    }
  };

  // Delete Account Handler
  const handleDeleteAccountSubmit = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error');
      return;
    }
    try {
      setDeletingAccount(true);
      const res = await deleteAccount();
      if (res.success) {
        navigate('/', { replace: true });
      } else {
        showToast(res.error || 'Failed to deactivate account', 'error');
      }
    } catch {
      showToast('Error deactivating account', 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  // ==========================================
  // 1. UNAUTHENTICATED GATEWAY (Section 39)
  // ==========================================
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#071A2F]/8 shadow-[0_12px_44px_rgba(7,26,47,0.06)] text-center">
          
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#071A2F] text-white flex items-center justify-center shadow-lg">
            <Sparkles size={28} className="text-[#C5A46D]" />
          </div>

          <span className="text-[10px] font-bold tracking-[0.28em] text-[#C5A46D] uppercase block mb-1">
            INFINITY CUSTOMIZATIONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#071A2F] tracking-tight">
            Welcome to Infinity
          </h1>
          <p className="text-xs sm:text-sm text-[#687386] mt-2 leading-relaxed">
            Sign in to track your personalized parcels, manage delivery addresses, and save your favourite memories.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              to="/login"
              state={{ from: '/account' }}
              className="w-full h-[50px] rounded-xl bg-[#071A2F] hover:bg-[#03101D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>SIGN IN</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/signup"
              state={{ from: '/account' }}
              className="w-full h-[48px] rounded-xl border-2 border-[#071A2F] text-[#071A2F] hover:bg-[#FAF8F4] font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all"
            >
              CREATE AN ACCOUNT
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <Link to="/" className="text-xs text-[#687386] hover:text-[#071A2F] transition-colors">
              ← Return to Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Initials Avatar helper
  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'IN';

  const firstName = user?.name ? user.name.split(' ')[0] : 'friend';

  return (
    <div className="film-account min-h-screen bg-[#FAF8F4] py-6 sm:py-10 px-3 sm:px-6 font-sans">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold text-white transition-all animate-fadeIn ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-[#071A2F]'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} className="text-[#C5A46D]" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        
        {/* Header Profile Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#071A2F]/8 shadow-[0_4px_24px_rgba(7,26,47,0.03)] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#071A2F] text-[#FAF8F4] font-black text-xl flex items-center justify-center border-2 border-[#C5A46D]/40 shadow-inner flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#071A2F] tracking-tight">
                  Hello, {firstName}
                </h1>
                {Number(user?.loyaltyPoints || 0) > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C5A46D]/15 text-[#071A2F] font-bold text-[10px] uppercase tracking-wider">
                    <Sparkles size={10} className="text-[#C5A46D]" />
                    {user.loyaltyPoints} Rewards
                  </span>
                )}
              </div>
              <p className="text-xs text-[#687386] mt-0.5">
                {user?.email || `+91 ${user?.phoneNumber}`} • Your Infinity Customer Account
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="h-10 px-4 rounded-xl border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Quick Action Strip (Compact Horizontal Pills) */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
            { id: 'saved', label: 'Saved', icon: Heart },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'preferences', label: 'Preferences', icon: Bell },
            { id: 'privacy', label: 'Support', icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#071A2F] text-white shadow-sm'
                    : 'bg-white border border-[#071A2F]/10 text-[#071A2F] hover:bg-[#FAF8F4]'
                }`}
              >
                <Icon size={14} className={active ? 'text-[#C5A46D]' : 'text-[#687386]'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Grid: Desktop Left Sidebar + Right Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* DESKTOP SIDEBAR */}
          <div className="hidden lg:block lg:col-span-4 bg-white rounded-3xl p-5 border border-[#071A2F]/8 shadow-[0_4px_24px_rgba(7,26,47,0.03)] space-y-6">
            
            {/* SHOPPING GROUP */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687386] px-3 block mb-2">
                Shopping
              </span>
              <div className="space-y-1">
                <button type="button" onClick={() => switchTab('overview')} className={`w-full h-11 px-3.5 rounded-xl flex items-center gap-3 text-xs font-bold ${activeTab === 'overview' ? 'bg-[#071A2F] text-white' : 'text-[#071A2F]'}`}><Home size={16} />Overview</button>
                <button
                  onClick={() => switchTab('orders')}
                  className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'orders' ? 'bg-[#071A2F] text-white' : 'text-[#071A2F] hover:bg-[#FAF8F4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package size={16} className={activeTab === 'orders' ? 'text-[#C5A46D]' : 'text-[#687386]'} />
                    <span>Your Orders</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>

                <button
                  onClick={() => switchTab('saved')}
                  className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'saved' ? 'bg-[#071A2F] text-white' : 'text-[#071A2F] hover:bg-[#FAF8F4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart size={16} className={activeTab === 'saved' ? 'text-[#C5A46D]' : 'text-[#687386]'} />
                    <span>Saved Gifts</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>
              </div>
            </div>

            {/* PERSONAL GROUP */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687386] px-3 block mb-2">
                Personal
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('profile')}
                  className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'profile' ? 'bg-[#071A2F] text-white' : 'text-[#071A2F] hover:bg-[#FAF8F4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User size={16} className={activeTab === 'profile' ? 'text-[#C5A46D]' : 'text-[#687386]'} />
                    <span>Personal Information</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>

                <button
                  onClick={() => switchTab('addresses')}
                  className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'addresses' ? 'bg-[#071A2F] text-white' : 'text-[#071A2F] hover:bg-[#FAF8F4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className={activeTab === 'addresses' ? 'text-[#C5A46D]' : 'text-[#687386]'} />
                    <span>Your Addresses</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>

                <button
                  onClick={() => switchTab('security')}
                  className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'security' ? 'bg-[#071A2F] text-white' : 'text-[#071A2F] hover:bg-[#FAF8F4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield size={16} className={activeTab === 'security' ? 'text-[#C5A46D]' : 'text-[#687386]'} />
                    <span>Login & Security</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>
              </div>
            </div>

            {/* PREFERENCES GROUP */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687386] px-3 block mb-2">
                Preferences & Support
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => switchTab('preferences')}
                  className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'preferences' ? 'bg-[#071A2F] text-white' : 'text-[#071A2F] hover:bg-[#FAF8F4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell size={16} className={activeTab === 'preferences' ? 'text-[#C5A46D]' : 'text-[#687386]'} />
                    <span>Notifications</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>

                <button
                  onClick={() => switchTab('privacy')}
                  className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'privacy' ? 'bg-[#071A2F] text-white' : 'text-[#071A2F] hover:bg-[#FAF8F4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={16} className={activeTab === 'privacy' ? 'text-[#C5A46D]' : 'text-[#687386]'} />
                    <span>Support & Privacy</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT CONTENT PANEL */}
          <div className="col-span-1 lg:col-span-8 bg-white rounded-3xl p-5 sm:p-8 border border-[#071A2F]/8 shadow-[0_4px_24px_rgba(7,26,47,0.03)] min-h-[460px]">
            {activeTab === 'overview' && <div className="film-account-overview">
              <p className="film-eyebrow">YOUR LITTLE CORNER OF INFINITY</p>
              <h2>Your gifts.<br /><em>Your memories.</em></h2>
              <p>Keep track of your orders, save the gifts you love and make your next memory personal.</p>
              <div>{[[Package, 'orders', 'Your orders'], [MapPin, 'addresses', 'Delivery addresses'], [Heart, 'saved', 'Saved gifts'], [User, 'profile', 'Your profile']].map(action => { const [Icon, key, title] = action; return <button key={key} type="button" onClick={() => switchTab(key)}><Icon size={20} /><span>{title}</span><ArrowRight size={17} /></button>; })}</div>
              {typeof user?.loyaltyPoints === 'number' && <aside><Sparkles size={19} /><div><span>INFINITY REWARDS</span><strong>{user.loyaltyPoints.toLocaleString('en-IN')} points</strong><p>₹{user.loyaltyPoints.toLocaleString('en-IN')} value</p></div></aside>}
            </div>}
            
            {/* TAB 1: YOUR ORDERS */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#071A2F]">
                      Your Orders
                    </h2>
                    <p className="text-xs text-[#687386] mt-0.5">
                      Review status, track shipping and send personalization notes
                    </p>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="space-y-4 py-6">
                    {[1, 2].map(n => (
                      <div key={n} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : ordersList.length === 0 ? (
                  <div className="text-center py-14 px-4">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#FAF8F4] flex items-center justify-center text-[#071A2F]">
                      <Package size={26} />
                    </div>
                    <h3 className="text-lg font-bold text-[#071A2F]">No orders yet</h3>
                    <p className="text-xs text-[#687386] mt-1 max-w-sm mx-auto">
                      When you customize and place an order, your details and tracking updates will appear here.
                    </p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 mt-5 px-6 h-11 rounded-xl bg-[#071A2F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#03101D] transition-colors"
                    >
                      <span>START SHOPPING</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ordersList.map(order => {
                      const orderRef = order.orderId || (order._id ? `#${order._id.slice(-6)}` : 'ORDER');
                      const dateStr = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : '';
                      const itemsCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
                      const totalAmt = order.totalAmount || order.total || 0;

                      return (
                        <div
                          key={order._id}
                          className="p-4 sm:p-5 rounded-2xl border border-gray-200/80 hover:border-[#071A2F]/20 transition-all bg-[#FAF8F4]/30"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-[#071A2F]">{orderRef}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-[#687386]">{dateStr}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {order.status || 'Processing'}
                              </span>
                            </div>
                          </div>

                          {/* Items Preview */}
                          <div className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 p-1">
                                <Package size={20} className="text-[#071A2F]" />
                              </div>
                              <div className="truncate">
                                <p className="text-xs sm:text-sm font-bold text-[#071A2F] truncate">
                                  {order.items?.[0]?.productName || order.items?.[0]?.name || `${itemsCount} item(s)`}
                                </p>
                                <p className="text-[11px] text-[#687386]">
                                  {itemsCount} {itemsCount === 1 ? 'item' : 'items'} • ₹{totalAmt.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="px-3.5 h-9 rounded-xl bg-white border border-[#071A2F]/20 hover:bg-[#071A2F] hover:text-white text-[#071A2F] text-xs font-bold uppercase tracking-wider transition-colors flex-shrink-0 cursor-pointer"
                            >
                              VIEW DETAILS
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ADDRESSES */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#071A2F]">
                      Your Addresses
                    </h2>
                    <p className="text-xs text-[#687386] mt-0.5">
                      Manage delivery destinations for faster, 1-click checkout
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openNewAddressModal}
                    className="h-10 px-4 rounded-xl bg-[#071A2F] text-white hover:bg-[#03101D] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>ADD ADDRESS</span>
                  </button>
                </div>

                {(!user?.addresses || user.addresses.length === 0) ? (
                  <div className="text-center py-14 px-4">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#FAF8F4] flex items-center justify-center text-[#071A2F]">
                      <MapPin size={26} />
                    </div>
                    <h3 className="text-lg font-bold text-[#071A2F]">No saved addresses yet</h3>
                    <p className="text-xs text-[#687386] mt-1 max-w-sm mx-auto">
                      Save your home, office or gifting destination to speed up checkout on your next personalized order.
                    </p>
                    <button
                      type="button"
                      onClick={openNewAddressModal}
                      className="inline-flex items-center gap-2 mt-5 px-6 h-11 rounded-xl bg-[#071A2F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#03101D] transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>ADD ADDRESS NOW</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map(addr => (
                      <div
                        key={addr._id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          addr.isDefault 
                            ? 'border-[#071A2F] bg-[#FAF8F4]/40 shadow-xs' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#071A2F]/8 text-[#071A2F] text-[10px] font-bold uppercase tracking-wider">
                              {addr.label === 'Work' ? <Briefcase size={10} /> : <Home size={10} />}
                              {addr.label || 'Home'}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#C5A46D] bg-[#071A2F] px-2 py-0.5 rounded-md">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm font-bold text-[#071A2F]">{addr.fullName}</p>
                          <p className="text-xs text-[#687386] mt-1 leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                            {addr.landmark ? ` (Near ${addr.landmark})` : ''}
                            <br />
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                          <p className="text-xs text-[#687386] mt-2 font-medium">
                            Phone: +91 {addr.phoneNumber}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditAddressModal(addr)}
                              className="text-[#071A2F] hover:underline cursor-pointer"
                            >
                              EDIT
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr._id)}
                              className="text-red-600 hover:underline cursor-pointer"
                            >
                              REMOVE
                            </button>
                          </div>

                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              className="text-xs text-[#687386] hover:text-[#071A2F] cursor-pointer"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SAVED ITEMS (WISHLIST) */}
            {activeTab === 'saved' && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#071A2F]">
                      Saved Items
                    </h2>
                    <p className="text-xs text-[#687386] mt-0.5">
                      Your wishlisted personalized gifts and memory concepts
                    </p>
                  </div>
                </div>

                {wishlistLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="text-center py-14 px-4">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#FAF8F4] flex items-center justify-center text-[#071A2F]">
                      <Heart size={26} />
                    </div>
                    <h3 className="text-lg font-bold text-[#071A2F]">No saved gifts yet</h3>
                    <p className="text-xs text-[#687386] mt-1 max-w-sm mx-auto">
                      Tap the heart icon on any personalized product while browsing to save it here for upcoming birthdays and anniversaries.
                    </p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 mt-5 px-6 h-11 rounded-xl bg-[#071A2F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#03101D] transition-colors"
                    >
                      <span>EXPLORE GIFTS</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlistProducts.map(prod => {
                      const prodId = prod.id || prod._id;
                      return (
                        <div
                          key={prodId}
                          className="rounded-2xl border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="relative aspect-square overflow-hidden bg-[#FAF8F4]">
                            <img
                              src={prod.image || prod.imageUrl || '/images/4 x 6 black frame 199.jpg'}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeWishlistItem(prodId)}
                              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-xs hover:bg-white transition-colors cursor-pointer"
                              title="Remove from saved"
                            >
                              <Heart size={14} className="fill-red-500" />
                            </button>
                          </div>

                          <div className="p-3.5 flex flex-col justify-between flex-1">
                            <div>
                              <p className="text-[10px] font-bold text-[#C5A46D] uppercase tracking-wider">
                                {prod.category || 'Customized'}
                              </p>
                              <h4 className="text-xs sm:text-sm font-bold text-[#071A2F] line-clamp-1 mt-0.5">
                                {prod.name}
                              </h4>
                              <p className="text-xs sm:text-sm font-black text-[#071A2F] mt-1">
                                ₹{prod.price}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => openQuickView(prod)}
                              className="mt-3 w-full h-8 rounded-lg bg-[#071A2F] hover:bg-[#03101D] text-white font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              CUSTOMIZE & BUY
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PERSONAL INFORMATION */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#071A2F]">
                      Personal Information
                    </h2>
                    <p className="text-xs text-[#687386] mt-0.5">
                      Update your account details and contact preferences
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="e.g. Rahul Sharma"
                      autoComplete="name"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] focus:outline-none focus:border-[#071A2F] focus:ring-1 focus:ring-[#071A2F] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      placeholder="e.g. rahul@example.com"
                      autoComplete="email"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] focus:outline-none focus:border-[#071A2F] focus:ring-1 focus:ring-[#071A2F] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1.5">
                      Mobile Number (WhatsApp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={profileForm.phoneNumber}
                        onChange={handleProfileChange}
                        placeholder="98765 43210"
                        maxLength={10}
                        autoComplete="tel"
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] focus:outline-none focus:border-[#071A2F] focus:ring-1 focus:ring-[#071A2F] transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-[#071A2F] uppercase tracking-wider mb-1.5">
                      Date of Birth (Optional)
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profileForm.dateOfBirth}
                      onChange={handleProfileChange}
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] focus:outline-none focus:border-[#071A2F] focus:ring-1 focus:ring-[#071A2F] transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!profileModified || profileSaving}
                      className="h-11 px-6 rounded-xl bg-[#071A2F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#03101D] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                    >
                      {profileSaving && <Loader size={14} className="animate-spin text-[#C5A46D]" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 5: LOGIN & SECURITY */}
            {activeTab === 'security' && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#071A2F]">
                      Login & Security
                    </h2>
                    <p className="text-xs text-[#687386] mt-0.5">
                      Manage password and security credentials
                    </p>
                  </div>
                </div>

                <div className="max-w-lg space-y-6">
                  <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#071A2F]/10 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#071A2F]">Mobile Number Verified</p>
                      <p className="text-[#687386] mt-0.5">+91 {user?.phoneNumber}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                      ACTIVE
                    </span>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <h3 className="text-sm font-bold text-[#071A2F] uppercase tracking-wider">
                      Change Password
                    </h3>

                    <div>
                      <label className="block text-[11px] font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                          placeholder="Enter your current password"
                          autoComplete="current-password"
                          className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] focus:outline-none focus:border-[#071A2F]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                        New Password (Min 6 characters)
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] focus:outline-none focus:border-[#071A2F]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-sm font-medium text-[#071A2F] focus:outline-none focus:border-[#071A2F]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="h-11 px-6 rounded-xl bg-[#071A2F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#03101D] transition-all cursor-pointer flex items-center gap-2"
                    >
                      {passwordSaving && <Loader size={14} className="animate-spin text-[#C5A46D]" />}
                      <span>Update Password</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 6: PREFERENCES */}
            {activeTab === 'preferences' && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#071A2F]">
                      Communication Preferences
                    </h2>
                    <p className="text-xs text-[#687386] mt-0.5">
                      Choose how you receive order milestones and seasonal inspirations
                    </p>
                  </div>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#071A2F]">WhatsApp Order Milestones</p>
                      <p className="text-[11px] text-[#687386] mt-0.5">
                        Receive confirmation and preview links directly on WhatsApp
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.orderUpdatesWhatsApp}
                      onChange={() => handleTogglePreference('orderUpdatesWhatsApp')}
                      className="w-5 h-5 accent-[#071A2F] cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#071A2F]">Email Order Receipts</p>
                      <p className="text-[11px] text-[#687386] mt-0.5">
                        Receive digital tax invoices and dispatch confirmations via email
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.orderUpdatesEmail}
                      onChange={() => handleTogglePreference('orderUpdatesEmail')}
                      className="w-5 h-5 accent-[#071A2F] cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#071A2F]">Offers & Gifting Highlights</p>
                      <p className="text-[11px] text-[#687386] mt-0.5">
                        Occasional discount announcements for festivals and occasions
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.offersWhatsApp}
                      onChange={() => handleTogglePreference('offersWhatsApp')}
                      className="w-5 h-5 accent-[#071A2F] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: SUPPORT & PRIVACY */}
            {activeTab === 'privacy' && (
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#071A2F]">
                      Support & Privacy
                    </h2>
                    <p className="text-xs text-[#687386] mt-0.5">
                      Assistance, studio policies, and data controls
                    </p>
                  </div>
                </div>

                <div className="max-w-lg space-y-6">
                  {/* Studio Concierge */}
                  <div className="p-5 rounded-2xl bg-[#071A2F] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#C5A46D]/15 rounded-full blur-2xl pointer-events-none" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A46D]">
                      Direct Support
                    </span>
                    <h3 className="text-base font-bold mt-1">Need help with an order?</h3>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      Our customer team is available on WhatsApp daily (9 AM - 9 PM) to answer queries.
                    </p>
                    <a
                      href="https://wa.me/918985993948"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 px-4 h-9 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1EBE5D] transition-colors"
                    >
                      <MessageCircle size={14} />
                      <span>CHAT ON WHATSAPP</span>
                    </a>
                  </div>

                  {/* Legal Links */}
                  <div className="space-y-2 text-xs font-bold text-[#071A2F]">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                      Studio Policies
                    </p>
                    {[
                      { title: 'Shipping & Delivery Policy', path: '/shipping-policy' },
                      { title: 'Refund & Cancellation Policy', path: '/refund-cancellation-policy' },
                      { title: 'Privacy Policy', path: '/privacy-policy' },
                      { title: 'Terms & Conditions', path: '/terms-and-conditions' }
                    ].map(link => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-[#FAF8F4] transition-colors"
                      >
                        <span>{link.title}</span>
                        <ChevronRight size={14} className="text-gray-400" />
                      </Link>
                    ))}
                  </div>

                  {/* Deactivate Account */}
                  <div className="pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">
                      Looking to close your account? Your historical invoice records will be safely archived for tax compliance while personal details are anonymized.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Request Account Deactivation
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ADDRESS MODAL (Add / Edit) */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#03101D]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#071A2F]/10 shadow-2xl relative animate-fadeIn my-8">
            <button
              onClick={() => setAddressModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-[#071A2F] p-1 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg sm:text-xl font-black text-[#071A2F] mb-4">
              {editingAddressId ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleAddressSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm(f => ({ ...f, fullName: e.target.value }))}
                    placeholder="Rahul Sharma"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phoneNumber}
                    onChange={(e) => setAddressForm(f => ({ ...f, phoneNumber: e.target.value }))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                  Address Line 1 (Flat, House No, Building) *
                </label>
                <input
                  type="text"
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm(f => ({ ...f, addressLine1: e.target.value }))}
                  placeholder="Flat 402, Lotus Apartments"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                  Address Line 2 (Area, Street)
                </label>
                <input
                  type="text"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm(f => ({ ...f, addressLine2: e.target.value }))}
                  placeholder="Main Road, Indiranagar"
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm(f => ({ ...f, landmark: e.target.value }))}
                    placeholder="Near Metro Station"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm(f => ({ ...f, pincode: e.target.value }))}
                    placeholder="500081"
                    maxLength={6}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="Hyderabad"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#071A2F] uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(f => ({ ...f, state: e.target.value }))}
                    placeholder="Telangana"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-[#FAF8F4] focus:bg-white text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <span className="font-bold text-[#071A2F] uppercase tracking-wider">Address Type:</span>
                {['Home', 'Work', 'Other'].map(type => (
                  <label key={type} className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="label"
                      value={type}
                      checked={addressForm.label === type}
                      onChange={(e) => setAddressForm(f => ({ ...f, label: e.target.value }))}
                      className="accent-[#071A2F]"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm(f => ({ ...f, isDefault: e.target.checked }))}
                    className="w-4 h-4 accent-[#071A2F]"
                  />
                  <span className="font-medium text-gray-700">Make this my default delivery address</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 h-10 rounded-xl border border-gray-200 text-gray-700 font-bold uppercase tracking-wider hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="px-6 h-10 rounded-xl bg-[#071A2F] text-white font-bold uppercase tracking-wider hover:bg-[#03101D] disabled:opacity-50"
                >
                  {addressSaving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL (Section 19) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#03101D]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#071A2F]/10 shadow-2xl relative animate-fadeIn my-8">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-[#071A2F] p-1 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A46D]">
                Order Details
              </span>
            </div>

            <h3 className="text-xl font-black text-[#071A2F]">
              {selectedOrder.orderId || `#${selectedOrder._id?.slice(-6)}`}
            </h3>

            <p className="text-xs text-[#687386] mt-0.5">
              Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>

            {/* Order Items */}
            <div className="my-5 divide-y divide-gray-100 border-y border-gray-100 max-h-60 overflow-y-auto pr-1">
              {(selectedOrder.items || []).map((it, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-[#071A2F]">{it.productName || it.name}</p>
                    <p className="text-[11px] text-[#687386]">Qty: {it.quantity || 1} • ₹{it.price} each</p>
                  </div>
                  <span className="font-bold text-[#071A2F]">
                    ₹{((it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="space-y-1.5 text-xs text-[#687386] pb-4 border-b border-gray-100">
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="font-bold text-[#071A2F] uppercase">{selectedOrder.paymentMethod || 'UPI'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span className="font-bold text-emerald-700 uppercase">{selectedOrder.paymentStatus || 'Pending'}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#071A2F] pt-2">
                <span>Order Total</span>
                <span>₹{(selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.address && (
              <div className="pt-3 text-xs text-[#687386]">
                <p className="font-bold text-[#071A2F] uppercase text-[10px] tracking-wider mb-1">Delivery Destination</p>
                <p>{selectedOrder.customerName}</p>
                <p>{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} — {selectedOrder.pincode}</p>
              </div>
            )}

            {/* WHATSAPP ACTION BUTTON (Section 19) */}
            <div className="mt-6 pt-4 flex flex-col gap-2">
              <a
                href={`https://wa.me/918985993948?text=${encodeURIComponent(
                  `Hi Infinity Customizations! Here are the photos & personalization details for Order ${
                    selectedOrder.orderId || selectedOrder._id?.slice(-6)
                  }:\n\nProducts: ${(selectedOrder.items || [])
                    .map(it => `${it.productName || it.name} (Qty: ${it.quantity || 1})`)
                    .join(', ')}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageCircle size={16} />
                <span>SEND PHOTOS ON WHATSAPP</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full h-10 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#03101D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-200 shadow-2xl relative animate-fadeIn">
            <h3 className="text-lg font-black text-red-600 mb-2">
              Deactivate Account?
            </h3>
            <p className="text-xs text-[#687386] leading-relaxed">
              This action will deactivate your Infinity login and clear saved preferences. Your financial order history is preserved for statutory invoice records. Type <strong>DELETE</strong> below to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="mt-4 w-full h-11 px-3.5 rounded-xl border border-gray-300 text-xs font-bold uppercase tracking-wider"
            />

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 h-10 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccountSubmit}
                disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                className="px-5 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40"
              >
                {deletingAccount ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountCenter;
