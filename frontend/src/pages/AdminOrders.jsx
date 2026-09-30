import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, ChevronDown, Save, Phone, MapPin, Mail, Package, Download, Trash2 } from 'lucide-react';
import { orders as ordersApi } from '../services/api';

const AdminOrders = () => {
  const { admin, adminToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editStatus, setEditStatus] = useState({});
  const copyText = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard');
      setTimeout(() => setSuccess(''), 1500);
    } catch {
      setError('Failed to copy');
      setTimeout(() => setError(''), 1500);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  const extractHamperItems = (item) => {
    if (Array.isArray(item?.hamperItems) && item.hamperItems.length) {
      return item.hamperItems;
    }
    try {
      if (item?.customizationDetails) {
        const parsed = JSON.parse(item.customizationDetails);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      return [];
    }
    return [];
  };

  const getOrderPricing = (order) => {
    const subtotal = Number(order?.subtotal || 0);
    const shipping = Number(
      typeof order?.shippingCost === 'number'
        ? order.shippingCost
        : computeShipping(order?.items || [])
    ) || 0;
    const tax = Number(order?.tax || 0);
    const loyaltyDiscount = Number(order?.loyaltyDiscount || 0);
    const fallbackTotal = subtotal + shipping + tax - loyaltyDiscount;
    const total = Number(order?.totalAmount || fallbackTotal);
    return { subtotal, shipping, tax, loyaltyDiscount, total };
  };

  const computeShipping = (items = []) => {
    let totalShipping = 0;
    let hasPolaroids = false;
    let totalQty = 0;
    items.forEach((item) => {
      const productId = String(item.productId || '');
      const productName = String(item.productName || item.name || '').toLowerCase();
      if (productId === 'd4' || productName.includes('digital video invitation')) return;
      const qty = Math.max(1, Number(item.quantity || 1));
      totalQty += qty;
      if (['pol1', 'pol2', 'pol3'].includes(productId)) {
        hasPolaroids = true;
        return;
      }
      const price = Number(item.price || 0);
      let perItemShipping = 150;
      if (price < 300) perItemShipping = 69;
      else if (price <= 500) perItemShipping = 99;
      else {
        const extra = Math.min(30, Math.max(0, Math.floor((price - 500) / 100) * 10));
        perItemShipping = 150 + extra;
      }
      const discountedShipping = perItemShipping + (Math.max(0, qty - 1) * perItemShipping * 0.5);
      totalShipping += Math.round(discountedShipping);
    });
    if (totalQty >= 30) return 399;
    if (totalQty >= 20) return 199;
    if (hasPolaroids) totalShipping += 69;
    return totalShipping;
  };

  useEffect(() => {
    if (!admin || admin.role !== 'super_admin') return;
    fetchOrders();
  }, [admin, adminToken]);

  useEffect(() => {
    filterOrders();
  }, [orders, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await ordersApi.getAll({}, adminToken);
      // API might return an array or an object with a property like `orders`
      if (Array.isArray(result)) {
        setOrders(result);
      } else if (result && result.orders) {
        setOrders(result.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (filterStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === filterStatus));
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const result = await ordersApi.updateStatus(orderId, { status: newStatus }, adminToken);

      // result may contain the updated order under `order` or be the order itself
      const updatedOrder = result?.order || result;

      setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
      setSuccess(`Order marked as ${newStatus}`);
      setEditingOrderId(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update order');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const ok = window.confirm('Are you sure you want to delete this order? This cannot be undone.');
    if (!ok) return;
    try {
      await ordersApi.deleteAdmin(orderId, adminToken);
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setSuccess('Order deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete order');
      setTimeout(() => setError(''), 3000);
    }
  };

  const generateInvoice = (order) => {
    // Generate item rows including hamper items if they exist
    let itemsHTML = (order.items || []).map(it => {
      const hamperItems = extractHamperItems(it);
      const basePrice = Number(it.price || 0);
      const qty = Math.max(1, Number(it.quantity || 1));
      const addOnPrice = Number(it.addOnPrice || 0);
      const addOnType = String(it.addOnType || '');
      let rowHTML = `<tr><td>${it.productName}</td><td>${qty}</td><td>${basePrice.toLocaleString('en-IN')}</td><td>${(basePrice * qty).toLocaleString('en-IN')}</td></tr>`;
      
      const isHamper = hamperItems.length > 0;
      if (addOnPrice > 0 || addOnType) {
        rowHTML += `<tr style="background:#f9fafb;"><td style="padding-left:20px;">+ ${addOnType || 'Add-on'}</td><td>${qty}</td><td>${addOnPrice.toLocaleString('en-IN')}</td><td>${(addOnPrice * qty).toLocaleString('en-IN')}</td></tr>`;
      }
      // Add hamper items as sub-rows
      if (isHamper) {
        hamperItems.forEach(h => {
          const label = h.name ? `${h.name} - ${h.link || ''}` : (h.link || 'Added Product');
          rowHTML += `<tr style="background:#f9fafb;"><td style="padding-left:20px;">-> ${label}</td><td>1</td><td>${Number(h.price || 0).toLocaleString('en-IN')}</td><td>${Number(h.price || 0).toLocaleString('en-IN')}</td></tr>`;
        });
      }

      if (!isHamper && it.customizationDetails) {
        rowHTML += `<tr style="background:#f9fafb;"><td colspan="4" style="padding-left:20px;">Customization: ${it.customizationDetails}</td></tr>`;
      }
      
      return rowHTML;
    }).join('');

    const { subtotal, shipping, tax, loyaltyDiscount, total } = getOrderPricing(order);

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order.orderId}</title><style>@page{size:A4;margin:14mm}body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0}h1{color:#0b63a7;margin:0 0 8px 0}h3{margin:18px 0 8px 0}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{padding:8px;border:1px solid #ddd;text-align:left;font-size:12px}tfoot td{font-weight:bold}.meta{font-size:13px;line-height:1.5}.note{margin-top:14px;font-size:11px;color:#555}.top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.badge{font-size:11px;background:#eef6ff;color:#0b63a7;padding:4px 8px;border-radius:999px;border:1px solid #d7e9ff}</style></head><body><div class="top"><h1>Infinity Customizations - Invoice</h1><div class="badge">PDF Invoice</div></div><div class="meta"><p>Order ID: <strong>${order.orderId}</strong></p><p>Date: ${new Date(order.createdAt).toLocaleString()}</p></div><h3>Billing / Shipping</h3><p class="meta"><strong>${order.customerName}</strong><br/>${order.address}<br/>${order.city}, ${order.state} ${order.pincode}<br/>Phone: ${order.phoneNumber}<br/>Email: ${order.email}</p><h3>Items</h3><table><thead><tr><th>Product</th><th>Qty</th><th>Price (INR)</th><th>Line Total (INR)</th></tr></thead><tbody>${itemsHTML}</tbody><tfoot><tr><td colspan="3">Subtotal</td><td>INR ${Number(subtotal).toLocaleString('en-IN')}</td></tr><tr><td colspan="3">Shipping</td><td>INR ${Number(shipping).toLocaleString('en-IN')}</td></tr>${loyaltyDiscount > 0 ? `<tr><td colspan="3">Infinity Reward Points Discount</td><td>-INR ${Number(loyaltyDiscount).toLocaleString('en-IN')}</td></tr>` : ''}<tr><td colspan="3">Taxes</td><td>INR ${Number(tax).toLocaleString('en-IN')}</td></tr><tr><td colspan="3">Total</td><td>INR ${Number(total).toLocaleString('en-IN')}</td></tr></tfoot></table><p class="note">Thank you for your order. For support, contact infinitycustomizations@gmail.com or WhatsApp +91 89859 93948.</p></body></html>`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('Unable to open invoice window. Please allow popups.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  if (!admin || admin.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <AlertCircle className="mx-auto mb-4" size={48} />
          <p>Unauthorized access</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading orders...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage customer orders and delivery status</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {statusSteps.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
              }`}
            >
              {status} ({orders.filter(o => o.status === status).length})
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const { subtotal, shipping, tax, loyaltyDiscount, total } = getOrderPricing(order);

              return (
              <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                {/* Order Header */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Order ID: {order._id}</p>
                      <h3 className="text-xl font-bold text-gray-900 mt-1">
                        {order.customerName || 'Unknown Customer'}
                      </h3>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${statusColors[order.status]}`}>
                        {order.status?.toUpperCase()}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">₹{total}</p>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-sm font-semibold"
                        title="Delete Order"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="font-semibold">{order.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={18} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="font-semibold text-sm">{order.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">City</p>
                        <p className="font-semibold">{order.city}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Order Date & Time</p>
                      <p className="font-semibold">{new Date(order.createdAt).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}</p>
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                <div
                  onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                  className="p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition flex justify-between items-center"
                >
                  <span className="font-semibold text-gray-900">
                    {order.items?.length || 0} Items • View Details
                  </span>
                  <ChevronDown
                    size={20}
                    className={`transition ${expandedOrderId === order._id ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Expanded Content */}
                {expandedOrderId === order._id && (
                  <div className="p-6 border-t space-y-6">
                    {/* Customer Details */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Customer Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-semibold text-gray-900">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-900">{order.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{order.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-semibold text-gray-900 capitalize">{order.paymentMethod}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Shipping Address</h4>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="font-semibold text-gray-900 mb-2">{order.address}</p>
                        {order.freeDeliveryZone && (
                          <p className="text-sm text-green-700 font-semibold mb-2">
                            Free Delivery Zone: {String(order.freeDeliveryZone).toUpperCase()}
                          </p>
                        )}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">City</p>
                            <p className="font-semibold">{order.city}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">State</p>
                            <p className="font-semibold">{order.state}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Pincode</p>
                            <p className="font-semibold">{order.pincode}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Package Contents</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => {
                          const hamperItems = extractHamperItems(item);
                          const hamperItemTotal = hamperItems.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
                          const quantity = Math.max(1, Number(item.quantity || 1));
                          const addOnPrice = Number(item.addOnPrice || 0);
                          const addOnType = String(item.addOnType || '');
                          const baseLineTotal = Number(item.price || 0) * quantity;
                          const addOnLineTotal = addOnPrice > 0 ? addOnPrice * quantity : 0;
                          const itemGrandTotal = baseLineTotal + addOnLineTotal + hamperItemTotal;
                          
                          return (
                            <div key={idx} className="bg-gray-50 rounded overflow-hidden">
                              <div className="p-3 flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{item.productName}</p>
                                  <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                                  {(addOnPrice > 0 || addOnType) && (
                                    <p className="text-sm text-green-700 mt-1">
                                      Add-on: {addOnType || 'Add-on'} {addOnPrice > 0 ? `(₹${addOnPrice} x ${quantity})` : ''}
                                    </p>
                                  )}
                                  {item.customizationDetails && !hamperItems.length && (
                                    <p className="text-sm text-blue-600 mt-1">Customization: {item.customizationDetails}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">₹{itemGrandTotal}</p>
                                  <p className="text-sm text-gray-600">₹{item.price} each</p>
                                  {(addOnLineTotal > 0 || hamperItemTotal > 0) && (
                                    <p className="text-xs text-gray-600 mt-1">
                                      Base ₹{baseLineTotal}
                                      {addOnLineTotal > 0 ? ` + Wrap/Add-on ₹${addOnLineTotal}` : ''}
                                      {hamperItemTotal > 0 ? ` + Hamper ₹${hamperItemTotal}` : ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Show hamper items if they exist */}
                              {hamperItems.length > 0 && (
                                <div className="bg-blue-50 border-t border-blue-200 p-3">
                                  <p className="text-sm font-semibold text-blue-900 mb-2">Added Products:</p>
                                  <div className="space-y-1">
                                    {hamperItems.map((h, hIdx) => (
                                      <div key={hIdx} className="flex justify-between text-sm">
                                        <span className="text-blue-800">{h.name ? `${h.name}${h.link ? ` - ${h.link}` : ''}` : (h.link || `Added Product ${hIdx + 1}`)}<button type="button" onClick={() => copyText((h.name ? `${h.name} ` : '') + (h.link || ''))} className="text-xs text-blue-600 hover:text-blue-800 underline ml-2">Copy</button></span>
                                        <span className="font-semibold text-blue-900">₹{h.price}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-semibold text-sm text-blue-900">
                                    <span>Total Added Products:</span>
                                    <span>₹{hamperItemTotal}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-gray-900">Pricing</h4>
                        <button
                          onClick={() => generateInvoice(order)}
                          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 text-sm font-semibold"
                        >
                          <Download size={16} /> Download PDF Invoice
                        </button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold">₹{subtotal}</span>
                        </div>
                        {shipping > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-semibold">₹{shipping}</span>
                          </div>
                        )}
                        {loyaltyDiscount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Infinity Reward Points Discount</span>
                            <span className="font-semibold text-green-600">-₹{loyaltyDiscount}</span>
                          </div>
                        )}
                        {tax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-semibold">₹{tax}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-bold">Total</span>
                          <span className="font-bold text-lg text-blue-600">₹{total}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Update Status</h4>
                      {editingOrderId === order._id ? (
                        <div className="flex gap-2">
                          <select
                            value={editStatus[order._id] || order.status}
                            onChange={(e) => setEditStatus({ ...editStatus, [order._id]: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {statusSteps.map(s => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleStatusChange(order._id, editStatus[order._id] || order.status)}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            <Save size={18} /> Save
                          </button>
                          <button
                            onClick={() => setEditingOrderId(null)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingOrderId(order._id);
                            setEditStatus({ [order._id]: order.status });
                          }}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                          Update Status
                        </button>
                      )}
                    </div>

                    {/* Admin Notes */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Admin Notes</h4>
                      <textarea
                        defaultValue={order.adminNotes || ''}
                        placeholder="Add internal notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;

