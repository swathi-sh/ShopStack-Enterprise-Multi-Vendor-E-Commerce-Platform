import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { setCartItems, setCartLoading } from '../store/slices/cartSlice';
import {
  CreditCard, ShoppingBag, MapPin, ShieldCheck, CheckCircle,
  Package, Zap, ArrowLeft, Loader2, AlertTriangle, Lock
} from 'lucide-react';

// Load Razorpay SDK script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

  const fetchCart = async () => {
    dispatch(setCartLoading(true));
    try {
      const res = await axiosClient.get('/cart');
      dispatch(setCartItems(res.data));
    } catch (err) {
      setErrorMsg('Failed to load cart. Please go back and try again.');
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate totals using finalPrice
  const totals = cartItems.reduce((acc, item) => {
    const original = Number(item.product?.price || 0);
    const final = Number(item.product?.finalPrice || item.product?.price || 0);
    const qty = item.quantity || 1;
    acc.originalTotal += original * qty;
    acc.finalTotal += final * qty;
    acc.discount += (original - final) * qty;
    return acc;
  }, { originalTotal: 0, finalTotal: 0, discount: 0 });

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setErrorMsg('Please enter a delivery address.');
      return;
    }
    setErrorMsg('');
    setPaying(true);

    try {
      // 1. Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setErrorMsg('Failed to load payment gateway. Please try again.');
        setPaying(false);
        return;
      }

      // 2. Create payment order on backend
      const orderRes = await axiosClient.post('/payment/create-order', {
        amount: totals.finalTotal,
        currency: 'INR'
      });

      const { key, amount, razorpay_order_id } = orderRes.data;

      // 3. Open Razorpay modal
      const options = {
        key: key,
        amount: amount,
        currency: 'INR',
        name: 'ShopStack',
        description: `Order of ${cartItems.length} item(s)`,
        order_id: razorpay_order_id,
        prefill: {
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email,
          email: user?.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async (response) => {
          // 4. Verify payment + place order
          try {
            const verifyRes = await axiosClient.post('/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: shippingAddress,
            });

            dispatch(setCartItems([]));
            setOrderSuccess(`Order #${verifyRes.data.id} confirmed! 🎉 Payment successful.`);
            setTimeout(() => navigate('/orders'), 3000);
          } catch (verifyErr) {
            setErrorMsg(verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.');
          }
          setPaying(false);
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      // Fallback for test/placeholder keys: simulate direct checkout
      if (key === 'rzp_test_placeholder' || key.includes('placeholder')) {
        // Simulate payment for demo mode — calls checkout directly
        try {
          const verifyRes = await axiosClient.post('/payment/verify', {
            razorpay_payment_id: `demo_pay_${Date.now()}`,
            razorpay_order_id: razorpay_order_id,
            razorpay_signature: 'demo_signature',
            shippingAddress: shippingAddress,
          });
          dispatch(setCartItems([]));
          setOrderSuccess(`Order #${verifyRes.data.id} confirmed! ✅ (Demo mode — add real Razorpay keys for live payments)`);
          setTimeout(() => navigate('/orders'), 4000);
        } catch (demoErr) {
          setErrorMsg(demoErr.response?.data?.message || 'Order placement failed. Please try again.');
        }
        setPaying(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payment initialization failed. Please try again.');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto" />
          <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <CreditCard className="w-7 h-7 mr-3 text-indigo-400" /> Secure Checkout
            </h1>
            <p className="text-xs text-slate-400">Review your order and complete payment via Razorpay</p>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </button>
        </div>

        {/* Success message */}
        {orderSuccess && (
          <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">{orderSuccess}</p>
              <p className="text-xs text-emerald-300 mt-0.5">Redirecting to order tracking...</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!orderSuccess && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Items + Address */}
            <div className="lg:col-span-3 space-y-6">
              {/* Order Items */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-400" />
                    Your Order ({cartItems.length} items)
                  </h2>
                </div>
                <div className="divide-y divide-slate-800">
                  {cartItems.map((item) => {
                    const originalPrice = Number(item.product?.price || 0);
                    const finalPrice = Number(item.product?.finalPrice || item.product?.price || 0);
                    const discountPct = Number(item.product?.discountPercentage || 0);
                    const hasItemDiscount = discountPct > 0;
                    const qty = item.quantity || 1;

                    return (
                      <div key={item.id} className="p-4 flex items-center gap-4">
                        <img
                          src={
                            item.product?.images?.length > 0
                              ? item.product.images[0]
                              : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'
                          }
                          alt={item.product?.name}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-white line-clamp-1">{item.product?.name}</h3>
                          <p className="text-xs text-slate-400">{item.product?.vendor?.businessName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-indigo-300">₹{finalPrice.toFixed(2)}</span>
                            {hasItemDiscount && (
                              <span className="text-[10px] text-slate-500 line-through">₹{originalPrice.toFixed(2)}</span>
                            )}
                            {hasItemDiscount && (
                              <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                                <Zap className="w-2.5 h-2.5" />{discountPct.toFixed(0)}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-slate-400">Qty: {qty}</p>
                          <p className="text-sm font-extrabold text-white">₹{(finalPrice * qty).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-400" /> Delivery Address
                </h2>
                <textarea
                  rows="3"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your full delivery address (house no, street, city, state, pincode)"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Right: Price Summary + Pay */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
                <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                  Price Details
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Price ({cartItems.length} items)</span>
                    <span className="text-slate-200">₹{totals.originalTotal.toFixed(2)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> Discount
                      </span>
                      <span className="font-bold">− ₹{totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery</span>
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-white text-base">Total Amount</span>
                    <span className="text-2xl font-black text-indigo-400">₹{totals.finalTotal.toFixed(2)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                      <p className="text-emerald-400 text-xs font-semibold">
                        🎉 You save ₹{totals.discount.toFixed(2)} on this order!
                      </p>
                    </div>
                  )}
                </div>

                {/* Pay Button */}
                <button
                  onClick={handleRazorpayPayment}
                  disabled={paying || cartItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{totals.finalTotal.toFixed(2)} via Razorpay</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Secure Payments · SSL Encrypted</span>
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {['UPI', 'Cards', 'Net Banking', 'Wallets'].map((m) => (
                    <span key={m} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
