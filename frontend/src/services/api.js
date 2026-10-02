// Central API base URL: Always use relative '/api' on web clients so requests route through
// Vercel's serverless reverse-proxy, ensuring same-origin execution and 100% immunity from Render CORS issues
export const API_BASE_URL = '/api';
const DIRECT_RENDER_URL = 'https://infinity-customizations.onrender.com/api';

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } catch (networkErr) {
      // If primary failed (e.g. cold start or transient glitch), retry once after a brief pause
      try {
        await new Promise(r => setTimeout(r, 600));
        response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      } catch {
        throw networkErr;
      }
    }
    const responseText = await response.text();
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('JSON Parse Error - Response is not valid JSON:', {
        endpoint,
        status: response.status,
        responseText: responseText.substring(0, 200),
        error: e.message
      });
      throw {
        status: response.status,
        message: `Server error: ${response.statusText || 'Unknown error'}`,
        data: { error: 'Invalid JSON response' }
      };
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: result.message || 'Something went wrong',
        data: result
      };
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    if (error && error.message === 'Failed to fetch') {
      throw { message: 'Network error. Check your connection and that the API server is running.', status: 0, data: error };
    }
    throw error;
  }
};

// Known directory mapping for existing registered accounts (email -> phone)
const KNOWN_EMAIL_DIRECTORY = {
  'infinitycustomizations@gmail.com': '9632588855',
  'jashwanthreddysingireddy@gmail.com': '8525852855',
  'sjashwanthreddy948@gmail.com': '9585568248',
  'h@gmail.com': '7777786474',
  'velgasnehareddy@gmail.com': '9177631176',
  'karriveeraveni3@gmail.com': '7893391748',
  'sriniketh2002@gmail.com': '8688912605',
  'sanjana3646@gmail.com': '9059673704',
  'kosuriomkar@gmail.com': '9505317596',
  'pulimamidipreetham@gmail.com': '6300376157',
  'gudururishika08@gmail.com': '9110576243',
  'mythri347@gmail.com': '6281816611',
  'sourabhi.manu.potti948@gmail.com': '8019312948',
  'vaggusowmyasri2005@gmail.com': '9392505765',
  'bharathgopavaram2005@gmail.com': '7995732446',
  'vyshali13neela@gmail.com': '9553763852',
  'test@infinity.com': '9123456780'
};

// --- USER AUTHENTICATION API ---
export const userAuth = {
  login: async (emailOrPhone, password) => {
    const rawInput = String(emailOrPhone || '').trim();
    let targetPhone = '';

    // If identifier is an Indian phone number (with or without +91 / country code / spaces)
    const digitsOnly = rawInput.replace(/\D/g, '');
    const cleanPhone = digitsOnly.slice(-10);
    if (/^[6-9]\d{9}$/.test(cleanPhone)) {
      targetPhone = cleanPhone;
    } else if (rawInput.includes('@')) {
      // Check known email directory
      const cleanEmail = rawInput.toLowerCase();
      if (KNOWN_EMAIL_DIRECTORY[cleanEmail]) {
        targetPhone = KNOWN_EMAIL_DIRECTORY[cleanEmail];
      } else {
        // Check client localStorage
        const stored = localStorage.getItem(`infinity_phone_${cleanEmail}`);
        if (stored && /^[6-9]\d{9}$/.test(stored)) {
          targetPhone = stored;
        }
      }
    }

    // 1. Try dedicated /auth/user/login first
    try {
      return await apiCall('/auth/user/login', 'POST', { emailOrPhone: rawInput, password });
    } catch {
      // If endpoint doesn't exist on backend (404 / Invalid JSON response / Cannot POST)
      if (targetPhone && /^[6-9]\d{9}$/.test(targetPhone)) {
        return await apiCall('/auth/user/verify-credentials', 'POST', {
          phoneNumber: targetPhone,
          password,
          name: 'Infinity Member'
        });
      }

      if (rawInput.includes('@')) {
        throw {
          status: 404,
          message: `Account with email "${rawInput}" not found. Please sign in with your registered 10-digit mobile number, or create an account.`,
          data: { error: `Account with email "${rawInput}" not found. Please sign in with your registered 10-digit mobile number, or create an account.` }
        };
      }

      throw {
        status: 400,
        message: 'Please enter a valid 10-digit Indian mobile number or registered email.',
        data: { error: 'Please enter a valid 10-digit Indian mobile number or registered email.' }
      };
    }
  },
  signup: async ({ name, email, phoneNumber, password }) => {
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // Remember phone mapping for email logins on this client
    if (cleanEmail && cleanPhone) {
      try {
        localStorage.setItem(`infinity_phone_${cleanEmail}`, cleanPhone);
      } catch { /* Preserve the existing optional fallback. */ }
    }

    try {
      return await apiCall('/auth/user/signup', 'POST', { name, email: cleanEmail, phoneNumber: cleanPhone, password });
    } catch (err) {
      // If 404 or backend is on verify-credentials
      if (err.status === 404 || (err.data && err.data.error === 'Invalid JSON response') || err.message?.includes('Cannot POST') || err.message?.includes('404')) {
        if (/^[6-9]\d{9}$/.test(cleanPhone)) {
          try {
            const res = await apiCall('/auth/user/verify-credentials', 'POST', {
              phoneNumber: cleanPhone,
              password,
              name: name.trim()
            });
            // Update email in profile if token returned
            if (res.token && cleanEmail) {
              try {
                await apiCall('/auth/user/profile', 'PUT', { email: cleanEmail }, res.token);
                if (res.user) res.user.email = cleanEmail;
              } catch (e) {
                console.warn('Failed to update email in profile:', e);
              }
            }
            return res;
          } catch (vcErr) {
            // If verify-credentials returned "Invalid password", user already exists with different password!
            if (vcErr.data?.error === 'Invalid password' || vcErr.message?.includes('Invalid password') || vcErr.status === 401) {
              throw {
                status: 409,
                message: `An account with mobile number ${cleanPhone} already exists. Please sign in with your existing password, or click Forgot Password.`,
                data: { error: `An account with mobile number ${cleanPhone} already exists. Please sign in with your existing password, or click Forgot Password.` }
              };
            }
            throw vcErr;
          }
        }
      }
      throw err;
    }
  },
  verifyCredentials: async (phoneNumber, password, name = 'Infinity Member') => {
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);
    return apiCall('/auth/user/verify-credentials', 'POST', { phoneNumber: cleanPhone, password, name });
  },
  verifyOTP: async () => {
    return { success: true, message: 'OTP system removed' };
  },
  completeRegistration: async () => {
    return { success: true, message: 'OTP system removed' };
  },
  requestOTP: async (phoneNumber) => {
    const cleanPhone = String(phoneNumber || '').replace(/\D/g, '').slice(-10);
    return apiCall('/auth/user/verify-credentials', 'POST', { phoneNumber: cleanPhone, password: '', name: 'Member' });
  },
  getProfile: async (token) => {
    return apiCall('/auth/user/profile', 'GET', null, token);
  },
  updateProfile: async (profileData, token) => {
    return apiCall('/auth/user/profile', 'PUT', profileData, token);
  },
  changePassword: async (currentPassword, newPassword, token) => {
    return apiCall('/auth/user/change-password', 'POST', { currentPassword, newPassword }, token);
  },
  getAddresses: async (token) => {
    return apiCall('/auth/user/addresses', 'GET', null, token);
  },
  addAddress: async (addressData, token) => {
    return apiCall('/auth/user/addresses', 'POST', addressData, token);
  },
  updateAddress: async (addressId, addressData, token) => {
    return apiCall(`/auth/user/addresses/${addressId}`, 'PUT', addressData, token);
  },
  deleteAddress: async (addressId, token) => {
    return apiCall(`/auth/user/addresses/${addressId}`, 'DELETE', null, token);
  },
  setDefaultAddress: async (addressId, token) => {
    return apiCall(`/auth/user/addresses/${addressId}/default`, 'PUT', {}, token);
  },
  getPreferences: async (token) => {
    return apiCall('/auth/user/preferences', 'GET', null, token);
  },
  updatePreferences: async (preferencesData, token) => {
    return apiCall('/auth/user/preferences', 'PUT', preferencesData, token);
  },
  getWishlist: async (token) => {
    return apiCall('/auth/user/wishlist', 'GET', null, token);
  },
  toggleWishlist: async (productId, token) => {
    return apiCall('/auth/user/wishlist/toggle', 'POST', { productId }, token);
  },
  deleteAccount: async (token) => {
    return apiCall('/auth/user/delete-account', 'POST', {}, token);
  },
  adminLogin: async (email, password) => {
    return apiCall('/auth/admin/login', 'POST', { email, password });
  },
};

// --- ADMIN AUTHENTICATION API ---
export const adminAuth = {
  login: async (email, password) => {
    return apiCall('/auth/admin/login', 'POST', { email, password });
  },
  createAdmin: async (adminData, token) => {
    return apiCall('/auth/admin/create', 'POST', adminData, token);
  },
  getProfile: async (token) => {
    return apiCall('/auth/admin/profile', 'GET', null, token);
  },
  updateProfile: async (profileData, token) => {
    return apiCall('/auth/admin/profile', 'PUT', profileData, token);
  },
  changePassword: async (passwords, token) => {
    return apiCall('/auth/admin/change-password', 'POST', passwords, token);
  },
};

// --- PRODUCTS API ---
export const products = {
  getAll: async () => {
    return apiCall('/products', 'GET');
  },
  getByCategory: async (categoryId) => {
    return apiCall(`/products/category/${categoryId}`, 'GET');
  },
  getById: async (id) => {
    return apiCall(`/products/${id}`, 'GET');
  },
  create: async (productData, token) => {
    return apiCall('/products', 'POST', productData, token);
  },
  update: async (id, productData, token) => {
    return apiCall(`/products/${id}`, 'PUT', productData, token);
  },
  delete: async (id, token) => {
    return apiCall(`/products/${id}`, 'DELETE', null, token);
  },
  // Reviews
  getReviews: async (productId) => {
    return apiCall(`/products/${productId}/reviews`, 'GET');
  },
  addReview: async (productId, review) => {
    return apiCall(`/products/${productId}/reviews`, 'POST', review);
  },
};

// --- CATEGORIES API ---
export const categories = {
  getAll: async () => {
    return apiCall('/categories', 'GET');
  },
  getById: async (categoryId) => {
    return apiCall(`/categories/${categoryId}`, 'GET');
  },
  create: async (categoryData, token) => {
    return apiCall('/categories', 'POST', categoryData, token);
  },
  update: async (categoryId, categoryData, token) => {
    return apiCall(`/categories/${categoryId}`, 'PUT', categoryData, token);
  },
  delete: async (categoryId, token) => {
    return apiCall(`/categories/${categoryId}`, 'DELETE', null, token);
  },
  addToShowcase: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/showcase/${productId}`, 'POST', {}, token);
  },
  removeFromShowcase: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/showcase/${productId}`, 'DELETE', null, token);
  },
  addProduct: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/products/${productId}`, 'POST', {}, token);
  },
  removeProduct: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/products/${productId}`, 'DELETE', null, token);
  },
  updateShowcaseImages: async (categoryId, images, token) => {
    return apiCall(`/categories/${categoryId}/showcase-images`, 'PUT', { images }, token);
  },
};

// --- ORDERS API ---
export const orders = {
  create: async (orderData, token) => {
    return apiCall('/orders/create', 'POST', orderData, token);
  },
  getMyOrders: async (token) => {
    return apiCall('/orders/my-orders', 'GET', null, token);
  },
  getById: async (id, token) => {
    return apiCall(`/orders/${id}`, 'GET', null, token);
  },
  uploadImages: async (orderId, images, token) => {
    return apiCall(`/orders/${orderId}/upload-images`, 'POST', { images }, token);
  },
  getAll: async (filters, token) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/orders/admin/orders?${params}`, 'GET', null, token);
  },
  getAdminById: async (id, token) => {
    return apiCall(`/orders/admin/orders/${id}`, 'GET', null, token);
  },
  deleteAdmin: async (id, token) => {
    return apiCall(`/orders/admin/orders/${id}`, 'DELETE', null, token);
  },
  updateStatus: async (id, statusData, token) => {
    return apiCall(`/orders/admin/orders/${id}/status`, 'PUT', statusData, token);
  },
  getImages: async (id, token) => {
    return apiCall(`/orders/admin/orders/${id}/images`, 'GET', null, token);
  },
  addNotes: async (id, notes, token) => {
    return apiCall(`/orders/admin/orders/${id}/notes`, 'PUT', { notes }, token);
  },
  triggerShipment: async (id, token) => {
    return apiCall(`/orders/admin/orders/${id}/ship`, 'POST', {}, token);
  },
};

export const loyalty = {
  get: async (token) => {
    return apiCall('/user/loyalty', 'GET', null, token);
  },
  redeem: async (points, orderId, token) => {
    return apiCall('/user/redeem', 'POST', { points, orderId }, token);
  },
};

export default { userAuth, adminAuth, products, categories, orders, loyalty };
