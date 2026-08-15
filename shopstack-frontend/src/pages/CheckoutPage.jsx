import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { setCartItems, setCartLoading } from '../store/slices/cartSlice';
import {
  CreditCard, ShoppingBag, MapPin, ShieldCheck, CheckCircle,
  Package, Zap, ArrowLeft, Loader2, AlertTriangle, Lock, RefreshCw,
  User, Phone, Home, Building2, Map, Hash
} from 'lucide-react';

// Load official Razorpay SDK script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If already loaded and Razorpay is available, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById('razorpay-sdk');
    if (existing) {
      // Script tag exists but Razorpay may not be ready yet — wait for it
      existing.onload = () => resolve(true);
      existing.onerror = () => resolve(false);
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

  // Delivery Address Form Fields
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name ? user.name : (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''),
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const [paymentFailed, setPaymentFailed] = useState(false);

  // Ref to track if payment was successfully completed — prevents ondismiss from
  // overriding the success state (Razorpay closes the modal after handler is called,
  // which also triggers ondismiss).
  const paymentSucceeded = useRef(false);

  const fetchCart = async () => {
    dispatch(setCartLoading(true));
    try {
      const res = await axiosClient.get('/cart');
      dispatch(setCartItems(res.data));
    } catch (err) {
      setErrorMsg('Failed to load shopping cart. Please try refreshing.');
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate totals using finalPrice (discounted price)
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
    if (e) e.preventDefault();

    // Validate delivery address fields
    const { fullName, phone, address, city, state, pincode } = addressForm;
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setErrorMsg('Please complete all delivery address fields before proceeding.');
      return;
    }

    // Capture the shipping address at call time to avoid stale closure issues
    const shippingAddr = `${fullName.trim()}, Phone: ${phone.trim()}, ${address.trim()}, ${city.trim()}, ${state.trim()} - ${pincode.trim()}`;

    setErrorMsg('');
    setPaymentFailed(false);
    setPaying(true);
    paymentSucceeded.current = false;

    try {
      // 1. Load official Razorpay JS SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        setErrorMsg('Unable to load Razorpay payment gateway. Please check your internet connection.');
        setPaying(false);
        return;
      }

      // 2. Request Spring Boot backend to create Razorpay Order
      // Total amount is calculated on the backend for security
      const orderRes = await axiosClient.post('/payment/create-order');
      const { key, amount, razorpay_order_id, razorpayOrderId } = orderRes.data;
      const rzpOrderId = razorpay_order_id || razorpayOrderId;

      if (!key) {
        throw new Error('Razorpay API key was not returned by the backend server.');
      }
      if (!rzpOrderId) {
        throw new Error('Failed to obtain Razorpay order ID from backend.');
      }

      // 3. Format phone for Razorpay prefill (10 digits Indian format)
      const cleanedPhone = phone ? phone.replace(/[^\d]/g, '') : '';
      const validContact = cleanedPhone.length >= 10 ? cleanedPhone.slice(-10) : '9876543210';

      const options = {
        key: key,
        amount: amount,
        currency: 'INR',
        name: 'ShopStack',
        description: `Order of ${cartItems.length} item(s)`,
        order_id: rzpOrderId,
        remember_customer: false,
        prefill: {
          name: fullName.trim(),
          email: user?.email || 'customer@shopstack.com',
          contact: validContact,
        },
        notes: {
          shippingAddress: shippingAddr,
        },
        theme: {
          color: '#6366f1',
        },

        // 4. This handler fires ONLY on successful payment
        handler: async (response) => {
          // Mark payment as succeeded BEFORE anything else to prevent
          // ondismiss from overriding the success state
          paymentSucceeded.current = true;
          try {
            const verifyRes = await axiosClient.post('/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: shippingAddr,
            });

            // On SUCCESS: Clear cart state, show success message, redirect to orders
            dispatch(setCartItems([]));
            setPaymentFailed(false);
            setErrorMsg('');
            setOrderSuccess(`Order #${verifyRes.data.id} confirmed! 🎉 Payment verified successfully.`);
            setTimeout(() => navigate('/orders'), 2500);
          } catch (verifyErr) {
            // Payment was captured by Razorpay, but our backend verify failed
            // This is rare — the payment is captured but order not created
            paymentSucceeded.current = false;
            setPaymentFailed(true);
            setErrorMsg(
              verifyErr.response?.data?.message ||
              'Payment was received but order creation failed. Please contact support with your payment ID: ' +
              response.razorpay_payment_id
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          // ondismiss fires when modal is closed — either by user OR after handler completes.
          // We use paymentSucceeded.current to distinguish the two cases.
          ondismiss: () => {
            if (paymentSucceeded.current) {
              // Modal closed naturally after successful payment — do nothing
              return;
            }
            setPaying(false);
            setPaymentFailed(true);
            setErrorMsg('Payment was cancelled. Your cart items remain safe. You can retry anytime.');
            // Record cancellation in backend (best-effort, ignore errors)
            axiosClient.post('/payment/cancel', { razorpay_order_id: rzpOrderId }).catch(() => {});
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      // payment.failed fires for declined cards, insufficient funds, etc.
      razorpayInstance.on('payment.failed', function (response) {
        if (paymentSucceeded.current) return; // Ignore if success already triggered
        setPaying(false);
        setPaymentFailed(true);
        const errDesc = response?.error?.description || response?.error?.reason || 'Transaction declined.';
        const errCode = response?.error?.code ? ` (${response.error.code})` : '';
        setErrorMsg(`Payment failed: ${errDesc}${errCode} Please try a different payment method.`);
      });

      razorpayInstance.open();

    } catch (err) {
      setPaying(false);
      setPaymentFailed(true);
      setErrorMsg(err.response?.data?.message || err.message || 'Payment initialization failed. Please try again.');
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
          <p className="text-xs text-slate-400">Add products to your cart before proceeding to checkout.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
          >
            Browse Catalog
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
            <p className="text-xs text-slate-400">Review your order details and pay via Razorpay</p>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </button>
        </div>

        {/* Success message banner */}
        {orderSuccess && (
          <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-5 rounded-2xl text-sm shadow-lg">
            <CheckCircle className="w-6 h-6 flex-shrink-0 text-emerald-400" />
            <div>
              <p className="font-bold text-base">{orderSuccess}</p>
              <p className="text-xs text-emerald-300 mt-0.5">Redirecting to order tracking...</p>
            </div>
          </div>
        )}

        {/* Failure / Cancelled alert banner */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-sm space-y-2">
            <div className="flex items-center space-x-2 font-bold text-rose-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{paymentFailed ? 'Payment Issue' : 'Notice'}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">{errorMsg}</p>
            {paymentFailed && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleRazorpayPayment}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Payment
                </button>
              </div>
            )}
          </div>
        )}

        {!orderSuccess && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column: Delivery Address Form + Order Items Summary */}
            <div className="lg:col-span-3 space-y-6">

              {/* Delivery Address Section */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <MapPin className="w-5 h-5 text-indigo-400" /> Delivery Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={addressForm.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 text-indigo-400" /> Street Address / House No *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={addressForm.address}
                      onChange={handleInputChange}
                      placeholder="e.g. House 42, Green Park Main Road"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" /> City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Mumbai"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <Map className="w-3.5 h-3.5 text-indigo-400" /> State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={addressForm.state}
                      onChange={handleInputChange}
                      placeholder="e.g. Maharashtra"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-indigo-400" /> Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={addressForm.pincode}
                      onChange={handleInputChange}
                      placeholder="e.g. 400001"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-400" />
                    Order Items ({cartItems.length})
                  </h2>
                </div>
                <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
                  {cartItems.map((item) => {
                    const originalPrice = Number(item.product?.price || 0);
                    const finalPrice = Number(item.product?.finalPrice || item.product?.price || 0);
                    const discountPct = Number(item.product?.discountPercentage || 0);
                    const hasItemDiscount = discountPct > 0;
                    const qty = item.quantity || 1;

                    return (
                      <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-all">
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

            </div>

            {/* Right Column: Price Summary + Pay Button */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5 sticky top-6">
                <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                  Payment Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="text-slate-200">₹{totals.originalTotal.toFixed(2)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> Discount Savings
                      </span>
                      <span className="font-bold">− ₹{totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Charge</span>
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-white text-base">Total Amount</span>
                    <span className="text-2xl font-black text-indigo-400">₹{totals.finalTotal.toFixed(2)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                      <p className="text-emerald-400 text-xs font-semibold">
                        🎉 Total savings of ₹{totals.discount.toFixed(2)} on this order!
                      </p>
                    </div>
                  )}
                </div>

                {/* Pay with Razorpay Button */}
                <button
                  onClick={handleRazorpayPayment}
                  disabled={paying || cartItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Razorpay Popup...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay with Razorpay</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Razorpay Official Checkout · SSL Encrypted</span>
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap pt-2 border-t border-slate-800/80">
                  {['NetBanking (SBI/HDFC)', 'UPI (success@razorpay)', 'Domestic Cards'].map((m) => (
                    <span key={m} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      {m}
                    </span>
                  ))}
                </div>

                {/* Razorpay Test Mode Guidance Helper 
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Test Payment Flow Guide</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    To complete a successful test payment in Razorpay Test Mode:
                  </p>
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-emerald-400 block">1. Netbanking (Instant Test)</span>
                      <span className="text-slate-400">Choose <strong className="text-white">SBI or HDFC</strong> in popup → click <strong className="text-emerald-400">Success</strong> on test bank page.</span>
                    </div>
                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-indigo-400 block">2. UPI / QR</span>
                      <span className="text-slate-400">Enter UPI ID: <code className="text-indigo-300 font-mono">success@razorpay</code></span>
                    </div>
                    <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-purple-400 block">3. Domestic Test Cards</span>
                      <span className="text-slate-400">Mastercard: <code className="text-purple-300 font-mono">5123 4567 8901 2345</code> or Visa: <code className="text-purple-300 font-mono">4000 0000 0000 0002</code> (Expiry: 12/30, CVV: 123)</span>
                    </div>
                  </div>
                </div>
                */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
