import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  AlertTriangle,
  Filter,
  Eye,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  ChevronDown,
} from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'CONFIRMED': return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    case 'PROCESSING': return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30';
    case 'SHIPPED': return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
    case 'DELIVERED': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'CANCELLED': return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    default: return 'bg-slate-700 text-slate-300';
  }
};

const AdminOrderMonitoringPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchOrders = async (status) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = status && status !== 'ALL' ? { status } : {};
      const res = await axiosClient.get('/admin/orders', { params });
      setOrders(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter !== 'ALL' ? statusFilter : null);
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      await axiosClient.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update order status.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(o.id).includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Orders...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 text-center max-w-lg space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Error Loading Orders</h2>
          <p className="text-xs text-rose-300">{errorMsg}</p>
          <button onClick={() => fetchOrders(statusFilter !== 'ALL' ? statusFilter : null)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <ShoppingBag className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Order Monitoring</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Monitor and manage all marketplace orders in real-time</p>
          </div>
          <button
            onClick={() => fetchOrders(statusFilter !== 'ALL' ? statusFilter : null)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  statusFilter === s
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Orders Summary */}
        <p className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> orders
          {statusFilter !== 'ALL' && <span className="text-amber-400"> — filtered by: {statusFilter}</span>}
        </p>

        {/* Orders Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Update Status</th>
                <th className="py-3 px-3 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-400">#{o.id}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white">{o.customer?.name || 'N/A'}</p>
                      <p className="text-slate-400 text-[10px]">{o.customer?.email}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <p className="font-bold text-white">₹{Number(o.totalAmount || 0).toFixed(2)}</p>
                      {o.discountAmount > 0 && (
                        <p className="text-[10px] text-rose-400">−₹{Number(o.discountAmount || 0).toFixed(2)} off</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        disabled={updatingStatus === o.id}
                        className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.filter((s) => s !== 'ALL').map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="flex items-center gap-1 px-2 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg text-[10px] font-bold hover:bg-indigo-500/20 transition-all cursor-pointer mx-auto"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Order #{selectedOrder.id}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-slate-950 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</p>
              <p className="text-sm font-bold text-white">{selectedOrder.customer?.name}</p>
              <p className="text-xs text-slate-400">{selectedOrder.customer?.email}</p>
              <p className="text-xs text-slate-400">
                Shipping: <span className="text-slate-200">{selectedOrder.shippingAddress}</span>
              </p>
              {selectedOrder.couponCode && (
                <p className="text-xs text-amber-400">Coupon used: <span className="font-bold">{selectedOrder.couponCode}</span></p>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Items</p>
              <div className="divide-y divide-slate-800">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{item.product?.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Vendor: {item.vendor?.businessName} · Qty: {item.quantity} · @₹{Number(item.priceAtPurchase).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-amber-400">
                        Commission: {item.commissionRate}% (₹{Number(item.commissionAmount || 0).toFixed(2)}) · Vendor Earning: ₹{Number(item.vendorEarning || 0).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-white flex-shrink-0">
                      ₹{(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-slate-950 rounded-2xl p-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Amount</span>
                <span className="font-bold text-white">₹{Number(selectedOrder.grossAmount || 0).toFixed(2)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Discount ({selectedOrder.couponCode})</span>
                  <span className="font-bold text-rose-400">−₹{Number(selectedOrder.discountAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="font-bold text-white">Total Paid</span>
                <span className="font-black text-emerald-400 text-sm">₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Update Status */}
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-400">Update Status:</p>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                disabled={updatingStatus === selectedOrder.id}
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-50"
              >
                {STATUS_OPTIONS.filter((s) => s !== 'ALL').map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderMonitoringPage;
