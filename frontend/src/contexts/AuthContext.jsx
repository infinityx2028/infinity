import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { userAuth } from '../services/api';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize from localStorage on mount and sync with server
  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('user');
    const storedAdminToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('admin');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('userToken');
      }

      // Background fresh fetch from server
      userAuth.getProfile(storedToken)
        .then(profileData => {
          if (profileData && profileData.phoneNumber) {
            setUser(profileData);
            localStorage.setItem('user', JSON.stringify(profileData));
          }
        })
        .catch(err => {
          if (err?.status === 401) {
            logout();
          }
        });
    }

    if (storedAdminToken && storedAdmin) {
      setAdminToken(storedAdminToken);
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (e) {}
    }

    setLoading(false);
  }, []);

  // Dedicated Login with Email or Phone + Password
  const loginUser = async (emailOrPhone, password) => {
    try {
      setLoading(true);
      const response = await userAuth.login(emailOrPhone, password);

      const { token: newToken, user: userData } = response;
      localStorage.setItem('userToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error?.data?.error || error?.message || 'Login failed';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Dedicated Signup with Name, Email, Phone, Password
  const signupUser = async ({ name, email, phoneNumber, password }) => {
    try {
      setLoading(true);
      const response = await userAuth.signup({ name, email, phoneNumber, password });

      const { token: newToken, user: userData } = response;
      localStorage.setItem('userToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMsg = error?.data?.error || error?.message || 'Account creation failed';
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login with phone, password and name (Legacy Direct - No OTP)
  const verifyCredentials = async (phoneNumber, password, name) => {
    try {
      setLoading(true);
      const response = await userAuth.verifyCredentials(phoneNumber, password, name);

      const { token: newToken, user: userData } = response;

      localStorage.setItem('userToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Legacy endpoints (kept for compatibility, not used anymore)
  const verifyOTP = async (phoneNumber, otp) => {
    return { success: true, message: 'OTP system removed' };
  };

  const completeRegistration = async (phoneNumber, name) => {
    return { success: true, message: 'OTP system removed' };
  };

  const login = async (phoneNumber, otp) => {
    return verifyOTP(phoneNumber, otp);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Request OTP
  const requestOTP = async (phoneNumber) => {
    try {
      const response = await userAuth.requestOTP(phoneNumber);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('OTP request error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await userAuth.updateProfile(profileData, token);
      const updatedUser = response?.user || { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      if (error?.status === 401) {
        logout();
        return { success: false, error: 'Session expired. Please log in again.' };
      }
      return { success: false, error: error.data?.error || error.message };
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await userAuth.changePassword(currentPassword, newPassword, token);
      return { success: true, message: res.message };
    } catch (error) {
      return { success: false, error: error.data?.error || error.message || 'Failed to change password' };
    }
  };

  // Address Book helpers
  const getAddresses = async () => {
    try {
      const res = await userAuth.getAddresses(token);
      return res.addresses || [];
    } catch (err) {
      console.error('Failed to get addresses:', err);
      return user?.addresses || [];
    }
  };

  const addAddress = async (addressData) => {
    try {
      const res = await userAuth.addAddress(addressData, token);
      if (res.addresses) {
        const updated = { ...user, addresses: res.addresses };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return { success: true, addresses: res.addresses };
    } catch (err) {
      return { success: false, error: err.data?.error || err.message };
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      const res = await userAuth.updateAddress(addressId, addressData, token);
      if (res.addresses) {
        const updated = { ...user, addresses: res.addresses };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return { success: true, addresses: res.addresses };
    } catch (err) {
      return { success: false, error: err.data?.error || err.message };
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const res = await userAuth.deleteAddress(addressId, token);
      if (res.addresses) {
        const updated = { ...user, addresses: res.addresses };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return { success: true, addresses: res.addresses };
    } catch (err) {
      return { success: false, error: err.data?.error || err.message };
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const res = await userAuth.setDefaultAddress(addressId, token);
      if (res.addresses) {
        const updated = { ...user, addresses: res.addresses };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return { success: true, addresses: res.addresses };
    } catch (err) {
      return { success: false, error: err.data?.error || err.message };
    }
  };

  // Preferences helper
  const updatePreferences = async (preferencesData) => {
    try {
      const res = await userAuth.updatePreferences(preferencesData, token);
      if (res.preferences) {
        const updated = { ...user, preferences: res.preferences };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return { success: true, preferences: res.preferences };
    } catch (err) {
      return { success: false, error: err.data?.error || err.message };
    }
  };

  // Delete account helper
  const deleteAccount = async () => {
    try {
      await userAuth.deleteAccount(token);
      logout();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.data?.error || err.message };
    }
  };

  const refreshLoyalty = async () => {
    try {
      if (!token) return null;
      const result = await api.loyalty.get(token);
      const points = Number(result?.loyaltyPoints || 0);
      const history = Array.isArray(result?.history) ? result.history : [];
      const updatedUser = { ...(user || {}), loyaltyPoints: points, loyaltyHistory: history };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { loyaltyPoints: points, history };
    } catch (error) {
      console.error('Failed to refresh loyalty:', error);
      return null;
    }
  };

  // Admin Login
  const loginAdmin = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔑 Starting admin login for:', email);
      const response = await userAuth.adminLogin(email, password);
      console.log('✅ Admin login response:', response);

      const { token: newAdminToken, admin: adminData } = response;

      if (!newAdminToken || !adminData) {
        console.error('❌ Missing token or admin data in response:', { newAdminToken, adminData });
        return { success: false, error: 'Invalid response from server' };
      }

      // Store in localStorage
      localStorage.setItem('adminToken', newAdminToken);
      localStorage.setItem('admin', JSON.stringify(adminData));

      // Update state
      setAdminToken(newAdminToken);
      setAdmin(adminData);

      return { success: true, admin: adminData };
    } catch (error) {
      console.error('❌ Admin login error:', error);
      return { success: false, error: error.message || 'Invalid credentials' };
    } finally {
      setLoading(false);
    }
  };

  // Admin Logout
  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdminToken(null);
    setAdmin(null);
  };

  const value = {
    user,
    admin,
    token,
    adminToken,
    loading,
    isAuthenticated,
    login,
    logout,
    loginUser,
    signupUser,
    loginAdmin,
    logoutAdmin,
    requestOTP,
    updateProfile,
    changePassword,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    updatePreferences,
    deleteAccount,
    refreshLoyalty,
    verifyCredentials,
    verifyOTP,
    completeRegistration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
