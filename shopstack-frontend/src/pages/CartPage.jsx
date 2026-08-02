import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { setCartItems, setCartLoading } from '../store/slices/cartSlice';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, ShoppingBag, MapPin, CheckCircle } from 'lucide-react';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCart = async () => {
    dispatch(setCartLoading(true));
    try {
      const res = await axiosClient.get('/cart');
      dispatch(setCartItems(res.data));
    } catch (err) {
      setErrorMsg('Failed to load cart items. Please make sure you are logged in.');
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, newQty) => {
    try {
      await axiosClient.put(`/cart/items/${itemId}`, { quantity: newQty });
      fetchCart();
    } catch (err) {
      console.error('Failed to update cart quantity', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axiosClient.delete(`/cart/items/${itemId}`);
      fetchCart();
    } catch (err) {
      console.error('Failed to remove cart item', err);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckingOut(true);
    setErrorMsg('');
    try {
      const res = await axiosClient.post('/orders/checkout', { shippingAddress });
      dispatch(setCartItems([]));
      setOrderSuccess(`Order #${res.data.id} placed successfully! Standard delivery initiated.`);
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Checkout failed. Please check your stock or address.');
    } finally {
      setCheckingOut(false);
    }
  };

  const totalAmount = cartItems.reduce((acc, item) => {
    const price = item.product ? Number(item.product.price) : 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <ShoppingCart className="w-7 h-7 mr-3 text-indigo-400" /> Shopping Cart
            </h1>
            <p className="text-xs text-slate-400">Review items before placing multi-vendor order</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="text-xs font-semibold text-indigo-400 hover:underline flex items-center"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Continue Shopping
          </button>
        </div>

        {/* Alerts */}
        {orderSuccess && (
          <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{orderSuccess}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Updating cart details...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto" />
            <h2 className="text-xl font-bold text-white">Your cart is currently empty</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore our marketplace catalog and discover products from verified merchants.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md"
                >
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <img
                      src={
                        item.product?.images && item.product.images.length > 0
                          ? item.product.images[0]
                          : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'
                      }
                      alt={item.product?.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                    />
                    <div>
                      <h3
                        onClick={() => navigate(`/products/${item.product?.id}`)}
                        className="font-bold text-sm text-white hover:text-indigo-400 cursor-pointer line-clamp-1"
                      >
                        {item.product?.name}
                      </h3>
                      <p className="text-xs text-slate-400">Merchant: {item.product?.vendor?.businessName || 'Merchant'}</p>
                      <span className="text-sm font-extrabold text-indigo-300 mt-1 block">
                        ${Number(item.product?.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                    <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Subtotal</span>
                      <span className="text-sm font-extrabold text-white">
                        ${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary & Checkout Card */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl h-fit space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold text-slate-200">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Standard Shipping</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxes</span>
                  <span className="text-slate-300 font-semibold">$0.00</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white">Total</span>
                  <span className="text-2xl font-black text-indigo-400">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Address Input */}
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Delivery Address
                  </label>
                  <textarea
                    rows="3"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter full delivery address"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={checkingOut}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <span>{checkingOut ? 'Processing Order...' : 'Proceed to Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by ShopStack Guaranteed Delivery</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
