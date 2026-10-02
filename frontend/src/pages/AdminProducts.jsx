import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Search, X, Upload } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import api, { API_BASE_URL } from '../services/api';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const editIdFromUrl = searchParams.get('edit');
  const { admin, adminToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    name: '',
    price: '',
    description: '',
    categoryId: '',
    weight: '',
    dimensions: '',
    image: '', // Stores the image URL/path (primary)
    images: [], // dynamic list of product images
    inStock: true,
    isBestSeller: false, // Add best seller flag
    pricingType: 'standard', // standard or quantity-based
    pricing: { "1-4": 199, "5-10": 189, "11-20": 179, "21-100": 169 }, // for signature day tshirts
    colorPriceDiff: 0, // no neck/color surcharge for signature day tshirts
    instagramLinks: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsProductName, setReviewsProductName] = useState('');

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();

    // Load categories for the category select so admin can change product category reliably
    (async () => {
      try {
        const cats = await api.categories.getAll();
        setCategories(cats || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    })();
  }, [admin, navigate]);

  // When coming from Categories page with ?category=xxx, open Add form with category pre-selected
  useEffect(() => {
    if (categoryFromUrl && categories.length > 0) {
      setFormData(prev => ({ ...prev, categoryId: categoryFromUrl }));
      setShowAddForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [categoryFromUrl, categories.length]);

  // When coming from Categories page with ?edit=productId, open Edit form for that product
  useEffect(() => {
    if (!editIdFromUrl || !adminToken) return;
    const openEdit = async () => {
      try {
        const product = await api.products.getById(editIdFromUrl);
        if (product) {
          setEditingId(product._id);
          setFormData({
            name: product.name,
            price: product.price,
            description: product.description || '',
            categoryId: product.categoryId,
            weight: product.weight || '',
            dimensions: product.dimensions || '',
            image: product.image || '',
            images: product.images || [],
            instagramLinks: product.instagramLinks || [],
            inStock: product.inStock,
            isBestSeller: product.isBestSeller || false,
            pricingType: product.pricingType || 'standard',
            pricing: product.pricing || { "1-4": 199, "5-10": 189, "11-20": 179, "21-100": 169 },
            colorPriceDiff: product.colorPriceDiff || 0
          });
          setPreviewImage(product.image || '');
          setShowAddForm(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (err) {
        console.error('Failed to load product for edit:', err);
      }
    };
    openEdit();
  }, [editIdFromUrl, adminToken]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.products.getAll();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // show a local preview immediately so admin gets instant feedback
    const tempUrl = URL.createObjectURL(file);
    setPreviewImage(tempUrl);

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const headers = {};
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      const backendBase = API_BASE_URL.replace(/\/api$/, '');
      const fileUrl = data.url && data.url.startsWith('http') ? data.url : (data.filePath && data.filePath.startsWith('http') ? data.filePath : (data.filePath ? `${backendBase}${data.filePath}` : null));
      if (fileUrl) {
        setFormData(prev => ({ ...prev, image: fileUrl }));
        setPreviewImage(fileUrl);
      }
      try { URL.revokeObjectURL(tempUrl); } catch { /* Preserve the existing optional fallback. */ }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminToken) {
      alert('Not authenticated');
      return;
    }

    try {
      const url = editingId ? `${API_BASE_URL}/products/${editingId}` : `${API_BASE_URL}/products`;
      const method = editingId ? 'PUT' : 'POST';

      // Ensure images array has no empty slots at the end
      const imagesToSend = (formData.images || []).filter(img => img);
      const payload = { ...formData, images: imagesToSend };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Operation failed');
      }

      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      categoryId: product.categoryId,
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      image: product.image || '',
      images: product.images || [],
      instagramLinks: product.instagramLinks || [],
      inStock: product.inStock,
      isBestSeller: product.isBestSeller || false,
      pricingType: product.pricingType || 'standard',
      pricing: product.pricing || { "40": 179, "50": 169, "60-70": 159, "70+": 149 },
      colorPriceDiff: product.colorPriceDiff || 50
    });
    setPreviewImage(product.image || '');
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!res.ok) throw new Error('Delete failed');

      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowAddForm(false);
    setPreviewImage('');
  };

  const openReviews = async (product) => {
    try {
      setReviewsLoading(true);
      setReviewsProductName(product.name || 'Product Reviews');
      const res = await fetch(`${API_BASE_URL}/products/${product._id}/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviewsList(Array.isArray(data) ? data : []);
      setReviewsModalOpen(true);
    } catch (err) {
      console.error('Error loading reviews:', err);
      alert('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const closeReviews = () => {
    setReviewsModalOpen(false);
    setReviewsList([]);
    setReviewsProductName('');
  };

  const handleDeleteReview = async (reviewIndex) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const productId = products.find(p => p.name === reviewsProductName)?._id;
      if (!productId) throw new Error('Product not found');
      
      const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews/${reviewIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!res.ok) throw new Error('Delete failed');
      const data = await res.json();
      setReviewsList(data.reviews);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };


  const handleMultiImageUpload = async (index, file) => {
    if (!file) return;

    // show a local preview immediately for the specific slot
    const tempUrl = URL.createObjectURL(file);
    const currentImgs = [...(formData.images || [])];
    currentImgs[index] = tempUrl;
    setFormData(prev => ({ ...prev, images: currentImgs }));

    const fd = new FormData();
    fd.append('image', file);

    try {
      setUploading(true);
      const headers = {};
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: fd
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      const backendBase = API_BASE_URL.replace(/\/api$/, '');
      const fileUrl = data.url && data.url.startsWith('http') ? data.url : (data.filePath && data.filePath.startsWith('http') ? data.filePath : (data.filePath ? `${backendBase}${data.filePath}` : null));
      const imgs = [...(formData.images || [])];
      // replace temporary preview with final server URL
      if (fileUrl) imgs[index] = fileUrl;
      setFormData(prev => ({ ...prev, images: imgs }));
      try { URL.revokeObjectURL(tempUrl); } catch { /* Preserve the existing optional fallback. */ }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFromUrl || product.categoryId === categoryFromUrl;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-brand-blue hover:text-brand-dark mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">Products Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                {categoryFromUrl ? `Filtered: ${categories.find(c => c._id === categoryFromUrl)?.title || categoryFromUrl}` : 'Add, edit, or delete products'}
              </p>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg transition-colors"
              >
                <Plus size={18} />
                Add Product
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        {!showAddForm && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-brand-dark">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="mr-2"
                    />
                    In Stock
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData(prev => ({ ...prev, isBestSeller: e.target.checked }))}
                      className="mr-2"
                    />
                    Best Seller
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload size={18} />
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </label>
                  {previewImage && (
                    <img src={previewImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              {/* Multiple Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleMultiImageUpload(index, e.target.files[0])}
                        className="hidden"
                        id={`multi-image-${index}`}
                      />
                      <label
                        htmlFor={`multi-image-${index}`}
                        className="block w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-blue transition-colors"
                      >
                        {formData.images?.[index] ? (
                          <img
                            src={formData.images[index]}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Plus size={20} />
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 disabled:opacity-50"
                >
                  {uploading ? 'Saving...' : (editingId ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        {!showAddForm && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-brand-dark">Products ({filteredProducts.length})</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              {product.isBestSeller && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Best Seller
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {categories.find(c => c._id === product.categoryId)?.title || product.categoryId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{product.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-brand-blue hover:text-brand-dark"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => openReviews(product)}
                              className="text-gray-600 hover:text-gray-900"
                              title="View Reviews"
                            >
                              <span className="text-xs">Reviews</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviews Modal */}
      {reviewsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {reviewsProductName}
              </h3>
              <button
                onClick={closeReviews}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {reviewsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewsList.length > 0 ? (
                  reviewsList.map((review, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-gray-900">{review.name}</span>
                            <span className="ml-2 text-yellow-500">
                              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(review.createdAt || review.date || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(index)}
                          className="ml-4 text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

