import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { ShoppingBag, Truck, CheckCircle2, Clock, MapPin, RefreshCw, DollarSign } from 'lucide-react';

const VendorOrdersPage = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const vendorHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('shopstack_vendor_token')}`,
    },
  };

  const fetchVendorOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/vendor/orders', vendorHeaders);
      setSalesOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch vendor sales orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosClient.put(`/orders/${orderId}/status`, { status: newStatus }, vendorHeaders);
      showMessage(`Order #${orderId} status updated to ${newStatus}!`);
      fetchVendorOrders();
    } catch (err) {
      showMessage('Failed to update order status.');
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
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <ShoppingBag className="w-7 h-7 mr-3 text-purple-400" /> Merchant Sales Orders
            </h1>
            <p className="text-xs text-slate-400">Monitor customer purchases, verify fulfillment, and update shipment status</p>
          </div>

          <button
            onClick={fetchVendorOrders}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all cursor-pointer"
            title="Refresh Sales"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-purple-500/20 border border-purple-500/40 text-purple-300 p-4 rounded-2xl text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Loading sales order activity...</p>
          </div>
        ) : salesOrders.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto" />
            <h2 className="text-xl font-bold text-white">No sales orders received yet</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When customers purchase items from your store, the order line items and shipping addresses will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Price / Unit</th>
                    <th className="p-4">Subtotal</th>
                    <th className="p-4 text-right">Update Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {salesOrders.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              item.product?.images && item.product.images.length > 0
                                ? item.product.images[0]
                                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={item.product?.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white line-clamp-1">{item.product?.name}</div>
                            <div className="text-xs text-purple-400 font-semibold">Order Item #{item.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-bold text-slate-200">{item.quantity} units</td>

                      <td className="p-4 text-slate-300">${Number(item.priceAtPurchase).toFixed(2)}</td>

                      <td className="p-4 font-black text-indigo-400">
                        ${(item.quantity * Number(item.priceAtPurchase)).toFixed(2)}
                      </td>

                      <td className="p-4 text-right">
                        <div className="inline-flex space-x-2">
                          <button
                            onClick={() => handleUpdateOrderStatus(item.id, 'PROCESSING')}
                            className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 rounded-lg text-xs font-semibold border border-amber-500/30"
                          >
                            Processing
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(item.id, 'SHIPPED')}
                            className="px-2.5 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 rounded-lg text-xs font-semibold border border-blue-500/30"
                          >
                            Mark Shipped
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(item.id, 'DELIVERED')}
                            className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 rounded-lg text-xs font-semibold border border-emerald-500/30"
                          >
                            Delivered
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrdersPage;
