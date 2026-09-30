import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Plus, Trash2, Edit2, X, Save, ChevronRight, Check, Package, Pencil } from 'lucide-react';
// Import the centralized API service
import api from '../services/api';
import { getImageSrc } from '../utils/imageUtils';
import BackButton from '../components/BackButton'; 

const AdminCategories = () => {
  // Use environment variable for API base URL, fallback to localhost for dev
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const { admin, adminToken } = useAuth();
  const [categories, setCategories] = useState([]);
  // cache products per category to avoid fetching all products upfront
  const [productsByCategory, setProductsByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    desc: '',
    emoji: '',
    subCategories: [],
    showcaseProducts: []
  });
  const [allProductsList, setAllProductsList] = useState([]);

  useEffect(() => {
    if (!admin) {
      // No authentication check needed - allow access to admin categories
    }
    fetchCategories();
    fetchAllProducts();
  }, [admin]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.categories.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const products = await api.products.getAll();
      setAllProductsList(products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let saved;
      if (editingCategory) {
        saved = await api.categories.update(editingCategory._id, formData, adminToken);
      } else {
        saved = await api.categories.create(formData, adminToken);
      }
      
      setSuccess(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchCategories();
      resetForm();
    } catch (err) {
      console.error('Failed to save category:', err);
      setError(err.message || 'Failed to save category');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      _id: category._id,
      title: category.title,
      desc: category.desc,
      emoji: category.emoji || '',
      subCategories: category.subCategories || [],
      showcaseProducts: category.showcaseProducts || []
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This cannot be undone.')) return;
    try {
      await api.categories.delete(categoryId, adminToken);
      setSuccess('Category deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError(err.message || 'Failed to delete category');
      setTimeout(() => setError(''), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      _id: '',
      title: '',
      desc: '',
      emoji: '',
      subCategories: [],
      showcaseProducts: []
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const addProductToCategory = async (categoryId, productId) => {
    try {
      await api.categories.addProduct(categoryId, productId, adminToken);
      setSuccess('Product added to category successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchCategories();
    } catch (err) {
      console.error('Failed to add product to category:', err);
      setError(err.message || 'Failed to add product to category');
      setTimeout(() => setError(''), 5000);
    }
  };

  const removeProductFromCategory = async (categoryId, productId) => {
    if (!window.confirm('Remove this product from category?')) return;
    try {
      await api.categories.removeProduct(categoryId, productId, adminToken);
      setSuccess('Product removed from category successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchCategories();
    } catch (err) {
      console.error('Failed to remove product from category:', err);
      setError(err.message || 'Failed to remove product from category');
      setTimeout(() => setError(''), 5000);
    }
  };

  const loadCategoryProducts = async (categoryId) => {
    if (productsByCategory[categoryId]) return;
    
    try {
      setProductLoading(true);
      const products = await api.products.getByCategory(categoryId);
      setProductsByCategory(prev => ({
        ...prev,
        [categoryId]: products || []
      }));
    } catch (err) {
      console.error('Failed to load category products:', err);
    } finally {
      setProductLoading(false);
    }
  };

  const filteredProducts = allProductsList.filter(product => 
    !selectedCategory?.showcaseProducts?.includes(product._id || product.id)
  );

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <BackButton />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">Categories Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage product categories and showcase products</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check size={20} />
            {success}
          </div>
        </div>
      )}
      
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
          </div>
        ) : (
          <>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {categories.map((category) => (
                <div key={category._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {category.emoji && (
                          <span className="text-2xl">{category.emoji}</span>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{category.desc}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit category"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Sub-categories */}
                    {category.subCategories && category.subCategories.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Sub-categories:</h4>
                        <div className="flex flex-wrap gap-2">
                          {category.subCategories.map((sub, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Showcase Products */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Showcase Products:</h4>
                        <button
                          onClick={() => loadCategoryProducts(category._id)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Package size={14} />
                          Load Products
                        </button>
                      </div>
                      
                      {category.showcaseProducts && category.showcaseProducts.length > 0 ? (
                        <div className="space-y-2">
                          {category.showcaseProducts.map((productId, index) => {
                            const product = allProductsList.find(p => (p._id || p.id) === productId);
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  {product?.image && (
                                    <img 
                                      src={getImageSrc(product.image)} 
                                      alt={product.name}
                                      className="w-8 h-8 object-cover rounded"
                                    />
                                  )}
                                  <span className="text-sm text-gray-700">{product?.name || 'Unknown Product'}</span>
                                </div>
                                <button
                                  onClick={() => removeProductFromCategory(category._id, productId)}
                                  className="text-red-600 hover:bg-red-50 p-1 rounded"
                                  title="Remove from showcase"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No showcase products assigned</p>
                      )}
                    </div>

                    {/* Add Product Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Add Product to Category
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Product Selection Modal */}
            {selectedCategory && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Add Product to "{selectedCategory.title}"
                    </h3>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {productLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredProducts.map((product) => (
                        <button
                          key={product._id || product.id}
                          onClick={() => addProductToCategory(selectedCategory._id, product._id || product.id)}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            {product.image && (
                              <img 
                                src={getImageSrc(product.image)} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                              <div className="text-gray-600 text-xs">₹{product.price}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Photo Frames"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={formData.desc}
                  onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this category..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji (optional)</label>
                <input
                  type="text"
                  value={formData.emoji}
                  onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional emoji"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-categories (comma-separated)</label>
                <input
                  type="text"
                  value={formData.subCategories.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    subCategories: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Small, Medium, Large"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

