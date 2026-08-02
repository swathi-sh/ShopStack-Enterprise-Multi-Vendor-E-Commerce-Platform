import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Package, DollarSign, ShoppingBag, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Layers } from 'lucide-react';

const VendorDashboardPage = () => {
  const navigate = useNavigate();
  const { vendor } = useSelector((state) => state.vendorAuth);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/vendor/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('shopstack_vendor_token')}`,
        },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch vendor analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Merchant Control Panel</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, <span className="text-purple-400">{vendor?.businessName || 'Vendor Merchant'}</span>!
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Monitor overall sales revenue, manage product pricing & inventory stock, track customer sales orders, and add new products.
            </p>
          </div>
        </div>

        {/* Quick Refresh */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Layers className="w-5 h-5 mr-2 text-purple-400" /> Merchant Performance Metrics
          </h2>
          <button
            onClick={fetchAnalytics}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-md hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Revenue</p>
                <h3 className="text-2xl font-black text-white mt-1">
                  ${analytics?.totalRevenue ? Number(analytics.totalRevenue).toFixed(2) : '0.00'}
                </h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Earned across completed orders</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-md hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</p>
                <h3 className="text-2xl font-black text-white mt-1">{analytics?.totalProducts || 0}</h3>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Active inventory listings</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-md hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Items Sold</p>
                <h3 className="text-2xl font-black text-white mt-1">{analytics?.totalSalesCount || 0}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Total product units delivered</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-md hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
                <h3 className="text-2xl font-black text-amber-400 mt-1">{analytics?.lowStockProducts || 0}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Items with stock &lt; 5 units</p>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-400" /> Inventory & Price Management
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add new products with categories, brand, description, and multi-image gallery. Modify prices and stock quantities in real time.
            </p>
            <button
              onClick={() => navigate('/vendor/products')}
              className="w-full flex items-center justify-between p-3.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-2xl transition-all cursor-pointer font-semibold text-xs"
            >
              <span>Manage Products & Stock</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-indigo-400" /> Merchant Order Monitoring
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              View customer orders placed for your vendor items, track delivery fulfillment status, and monitor sales activity.
            </p>
            <button
              onClick={() => navigate('/vendor/orders')}
              className="w-full flex items-center justify-between p-3.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-2xl transition-all cursor-pointer font-semibold text-xs"
            >
              <span>View Customer Sales Orders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
