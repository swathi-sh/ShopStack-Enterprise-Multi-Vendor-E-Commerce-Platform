import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { setCustomerOrders, setOrderLoading } from '../store/slices/orderSlice';
import { Package, Clock, Truck, CheckCircle2, MapPin, Store } from 'lucide-react';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { customerOrders, loading } = useSelector((state) => state.order);

  const fetchOrders = async () => {
    dispatch(setOrderLoading(true));
    try {
      const res = await axiosClient.get('/orders/history');
      dispatch(setCustomerOrders(res.data));
    } catch (err) {
      console.error('Failed to load order history', err);
    } finally {
      dispatch(setOrderLoading(false));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold">
            <Truck className="w-3.5 h-3.5 mr-1" /> Shipped
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 mr-1" /> Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold">
            <Package className="w-3.5 h-3.5 mr-1" /> Order Placed
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
            <Package className="w-7 h-7 mr-3 text-indigo-400" /> Customer Order History
          </h1>
          <p className="text-xs text-slate-400">Track status and item details for all past orders</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Loading order history...</p>
          </div>
        ) : customerOrders.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Package className="w-16 h-16 text-slate-700 mx-auto" />
            <h2 className="text-xl font-bold text-white">No orders placed yet</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once you checkout items from your cart, your order tracking timeline will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {customerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6"
              >
                {/* Order Meta Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-extrabold text-lg text-white">Order #{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total Amount</span>
                    <span className="text-xl font-black text-indigo-400">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="flex items-center text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-400 flex-shrink-0" />
                  <span>
                    <strong>Delivery Address:</strong> {order.shippingAddress}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</h3>
                  <div className="divide-y divide-slate-800/60 border border-slate-800/80 rounded-2xl bg-slate-950/40 overflow-hidden">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              item.product?.images && item.product.images.length > 0
                                ? item.product.images[0]
                                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={item.product?.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-white line-clamp-1">{item.product?.name}</h4>
                            <div className="flex items-center text-[11px] text-slate-400">
                              <Store className="w-3 h-3 mr-1 text-purple-400" />
                              <span>{item.vendor?.businessName || 'Verified Merchant'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <span className="text-slate-400 block">
                            {item.quantity} x ${Number(item.priceAtPurchase).toFixed(2)}
                          </span>
                          <span className="font-extrabold text-white">
                            ${(item.quantity * Number(item.priceAtPurchase)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
