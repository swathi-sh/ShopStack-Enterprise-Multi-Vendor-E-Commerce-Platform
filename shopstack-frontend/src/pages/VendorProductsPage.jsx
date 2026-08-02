import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Package, Plus, Edit2, Trash2, Tag, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';

const VendorProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Fashion' },
  { id: 3, name: 'Footwear' },
  { id: 4, name: 'Home & Kitchen' },
  { id: 5, name: 'Beauty & Personal Care' },
  { id: 6, name: 'Grocery' },
  { id: 7, name: 'Books & Stationery' },
  { id: 8, name: 'Sports & Fitness' },
  { id: 9, name: 'Jewelry & Accessories' },
  { id: 10, name: 'Toys & Games' }
]);
  
  const [loading, setLoading] = useState(true);

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    imageUrl: '',
  });

  // Inline edit state
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStock, setNewStock] = useState('');

  const [message, setMessage] = useState('');

  const vendorHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('shopstack_vendor_token')}`,
    },
  };

  const fetchVendorProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/vendor/products', vendorHeaders);
      setProducts(res.data);
      const catRes = await axiosClient.get('/categories');
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to fetch vendor products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProducts();
  }, []);

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const images = formData.imageUrl ? [formData.imageUrl] : [];
      await axiosClient.post(
        '/vendor/products',
        {
          name: formData.name,
          brand: formData.brand,
          description: formData.description,
          price: Number(formData.price),
          stockQuantity: Number(formData.stockQuantity),
          categoryId: Number(formData.categoryId),
          images,
        },
        vendorHeaders
      );

      setShowAddModal(false);
      setFormData({
        name: '',
        brand: '',
        description: '',
        price: '',
        stockQuantity: '',
        categoryId: '',
        imageUrl: '',
      });
      showMessage('Product successfully created & added to inventory!');
      fetchVendorProducts();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to create product.');
    }
  };

  const handleUpdatePrice = async (id) => {
    try {
      await axiosClient.patch(`/vendor/products/${id}/price`, { price: Number(newPrice) }, vendorHeaders);
      setEditingPriceId(null);
      showMessage('Product price updated!');
      fetchVendorProducts();
    } catch (err) {
      showMessage('Failed to update price.');
    }
  };

  const handleUpdateStock = async (id) => {
    try {
      await axiosClient.patch(`/vendor/products/${id}/stock`, { stockQuantity: Number(newStock) }, vendorHeaders);
      setEditingStockId(null);
      showMessage('Inventory stock updated!');
      fetchVendorProducts();
    } catch (err) {
      showMessage('Failed to update stock quantity.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;
    try {
      await axiosClient.delete(`/vendor/products/${id}`, vendorHeaders);
      showMessage('Product removed from inventory.');
      fetchVendorProducts();
    } catch (err) {
      showMessage('Failed to delete product.');
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <Package className="w-7 h-7 mr-3 text-purple-400" /> Vendor Inventory & Price Management
            </h1>
            <p className="text-xs text-slate-400">List new products, manage stock levels, and update catalog pricing</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchVendorProducts}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {message && (
          <div className="bg-purple-500/20 border border-purple-500/40 text-purple-300 p-4 rounded-2xl text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Loading merchant inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Package className="w-16 h-16 text-slate-700 mx-auto" />
            <h2 className="text-xl font-bold text-white">No items in your vendor inventory</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Start selling on ShopStack by adding your first product to our multi-vendor marketplace.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price ($)</th>
                    <th className="p-4">Stock Quantity</th>
                    <th className="p-4">Approval Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              item.images && item.images.length > 0
                                ? item.images[0]
                                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white line-clamp-1">{item.name}</div>
                            <div className="text-xs text-slate-400">{item.brand || 'ShopStack'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-slate-950 text-indigo-300 rounded-full text-xs font-semibold border border-slate-800">
                          <Tag className="w-3 h-3 mr-1" />
                          {item.category?.name || 'General'}
                        </span>
                      </td>

                      {/* Price Column */}
                      <td className="p-4">
                        {editingPriceId === item.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.01"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-20 bg-slate-950 border border-purple-500 rounded-lg px-2 py-1 text-xs text-white"
                            />
                            <button
                              onClick={() => handleUpdatePrice(item.id)}
                              className="px-2 py-1 bg-purple-600 text-white rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-white">${Number(item.price).toFixed(2)}</span>
                            <button
                              onClick={() => {
                                setEditingPriceId(item.id);
                                setNewPrice(item.price);
                              }}
                              className="text-slate-500 hover:text-purple-400 p-1"
                              title="Edit Price"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Stock Column */}
                      <td className="p-4">
                        {editingStockId === item.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={newStock}
                              onChange={(e) => setNewStock(e.target.value)}
                              className="w-16 bg-slate-950 border border-purple-500 rounded-lg px-2 py-1 text-xs text-white"
                            />
                            <button
                              onClick={() => handleUpdateStock(item.id)}
                              className="px-2 py-1 bg-purple-600 text-white rounded text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${item.stockQuantity < 5 ? 'text-amber-400' : 'text-slate-200'}`}>
                              {item.stockQuantity} units
                            </span>
                            <button
                              onClick={() => {
                                setEditingStockId(item.id);
                                setNewStock(item.stockQuantity);
                              }}
                              className="text-slate-500 hover:text-purple-400 p-1"
                              title="Edit Stock"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Approval Status */}
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {item.approvalStatus || 'APPROVED'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-purple-900/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-400" /> Add Product to Vendor Inventory
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Product Title</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">Brand Name</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. Sony, Apple, Nike"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="99.99"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">Initial Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      placeholder="50"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Product Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Product Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe product specifications, features, warranty..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProductsPage;
