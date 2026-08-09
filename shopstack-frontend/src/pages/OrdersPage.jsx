import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { setCustomerOrders, setOrderLoading } from '../store/slices/orderSlice';
import {
  Package, Clock, Truck, CheckCircle2, MapPin, Store,
  RefreshCw, RotateCcw, Banknote, ShieldCheck, CircleDot, CheckCheck
} from 'lucide-react';

// Full order status pipeline
const STATUS_STEPS = [
  { key: 'PENDING',    label: 'Ordered',    icon: Package,      color: 'text-slate-400',   bg: 'bg-slate-700' },
  { key: 'CONFIRMED',  label: 'Confirmed',  icon: CheckCircle2, color: 'text-indigo-400',  bg: 'bg-indigo-600' },
  { key: 'PROCESSING', label: 'Processing', icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500' },
  { key: 'SHIPPED',    label: 'Shipped',    icon: Truck,        color: 'text-blue-400',    bg: 'bg-blue-600' },
  { key: 'DELIVERED',  label: 'Delivered',  icon: CheckCheck,   color: 'text-emerald-400', bg: 'bg-emerald-600' },
];

const EXCEPTION_STATUSES = {
  RETURNED:  { label: 'Returned',  icon: RotateCcw,  color: 'text-orange-400', bg: 'bg-orange-600/10 border border-orange-500/30' },
  REFUNDED:  { label: 'Refunded',  icon: Banknote,   color: 'text-teal-400',   bg: 'bg-teal-600/10 border border-teal-500/30' },
  CANCELLED: { label: 'Cancelled', icon: CircleDot,  color: 'text-rose-400',   bg: 'bg-rose-600/10 border border-rose-500/30' },
};

const getStatusBadge = (status) => {
  const exception = EXCEPTION_STATUSES[status];
  if (exception) {
    const Icon = exception.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${exception.bg} ${exception.color}`}>
        <Icon className="w-3.5 h-3.5 mr-1" /> {exception.label}
      </span>
    );
  }
  const step = STATUS_STEPS.find(s => s.key === status);
  if (!step) return null;
  const Icon = step.icon;
  const colorMap = {
    PENDING: 'bg-slate-700/50 text-slate-300 border border-slate-600',
    CONFIRMED: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
    PROCESSING: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    SHIPPED: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    DELIVERED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colorMap[status] || ''}`}>
      <Icon className="w-3.5 h-3.5 mr-1" /> {step.label}
    </span>
  );
};

const OrderTimeline = ({ status }) => {
  // Only render the standard pipeline; exceptions shown as badge
  if (EXCEPTION_STATUSES[status]) return null;

  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {STATUS_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        const isPending = idx > currentIdx;

        return (
          <React.Fragment key={step.key}>
            {/* Step node */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                isDone
                  ? 'bg-emerald-600 border-emerald-500'
                  : isActive
                  ? `${step.bg} border-transparent`
                  : 'bg-slate-800 border-slate-700'
              }`}>
                <Icon className={`w-3.5 h-3.5 ${isDone || isActive ? 'text-white' : 'text-slate-600'}`} />
              </div>
              <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
                isDone ? 'text-emerald-400' : isActive ? step.color : 'text-slate-600'
              }`}>
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last) */}
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 min-w-[1.5rem] ${idx < currentIdx ? 'bg-emerald-600' : 'bg-slate-700'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <Package className="w-7 h-7 mr-3 text-indigo-400" /> My Orders
            </h1>
            <p className="text-xs text-slate-400">Track all your orders with live status updates</p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 hover:border-slate-700 transition-all"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-extrabold text-lg text-white">Order #{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Order Total</span>
                    <span className="text-2xl font-black text-indigo-400">
                      ₹{Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order Timeline */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Delivery Timeline
                  </h3>
                  <OrderTimeline status={order.status} />
                  {EXCEPTION_STATUSES[order.status] && (
                    <div className={`mt-2 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${EXCEPTION_STATUSES[order.status].bg} ${EXCEPTION_STATUSES[order.status].color}`}>
                      {React.createElement(EXCEPTION_STATUSES[order.status].icon, { className: 'w-4 h-4' })}
                      This order has been {order.status.toLowerCase()}.
                      {order.status === 'REFUNDED' && ' Refund will be credited within 5-7 business days.'}
                    </div>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="flex items-start text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-200">Delivery to:</strong> {order.shippingAddress}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</h3>
                  <div className="divide-y divide-slate-800/60 border border-slate-800/80 rounded-2xl bg-slate-950/40 overflow-hidden">
                    {order.items.map((item) => {
                      const priceAtPurchase = Number(item.priceAtPurchase || 0);
                      const qty = item.quantity || 1;
                      return (
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
                              <div className="flex items-center text-[11px] text-slate-400 gap-1">
                                <Store className="w-3 h-3 text-purple-400" />
                                <span>{item.vendor?.businessName || 'Verified Merchant'}</span>
                              </div>
                              {item.product?.category?.name && (
                                <span className="text-[10px] text-indigo-400">{item.product.category.name}</span>
                              )}
                            </div>
                          </div>

                          <div className="text-right text-xs flex-shrink-0">
                            <span className="text-slate-400 block">
                              {qty} × ₹{priceAtPurchase.toFixed(2)}
                            </span>
                            <span className="font-extrabold text-white text-sm">
                              ₹{(qty * priceAtPurchase).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shield/Protected footer */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Protected by ShopStack Buyer Protection</span>
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
