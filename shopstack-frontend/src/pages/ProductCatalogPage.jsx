import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { setProducts, setCategories, setLoading, setError } from '../store/slices/productSlice';
import { setCartItems } from '../store/slices/cartSlice';
import { setWishlistItems } from '../store/slices/wishlistSlice';
import ProductCard from '../components/ProductCard';
import { Search, Filter, RefreshCw, ShoppingBag, Layers, SlidersHorizontal } from 'lucide-react';

const ProductCatalogPage = () => {
  const dispatch = useDispatch();
  const { products, categories, loading } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get('/categories');
      dispatch(setCategories(response.data));
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    dispatch(setLoading(true));
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCat) params.categoryId = selectedCat;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const response = await axiosClient.get('/products', { params });
      dispatch(setProducts(response.data));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to fetch product catalog'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = async (productId) => {
    try {
      await axiosClient.post('/cart', { productId, quantity: 1 });
      const cartRes = await axiosClient.get('/cart');
      dispatch(setCartItems(cartRes.data));
      showToast('Product added to cart!');
    } catch (err) {
      showToast('Please sign in as customer to add items to cart.');
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      await axiosClient.post(`/wishlist/${productId}`);
      const wishRes = await axiosClient.get('/wishlist');
      dispatch(setWishlistItems(wishRes.data));
      showToast('Saved to your wishlist!');
    } catch (err) {
      showToast('Please sign in to manage wishlist.');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const wishlistedIds = new Set(wishlistItems.map((item) => item.product?.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-medium text-sm flex items-center space-x-2 animate-bounce">
            <ShoppingBag className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Catalog Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 rounded-3xl border border-indigo-500/20 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Vendor Marketplace Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Explore Premium <span className="text-indigo-400">Products</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Browse verified items from trusted vendors with real-time stock management, transparent pricing, and instant checkout.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by title or brand..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-3">
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div className="lg:col-span-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min Price ($)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Max Price */}
            <div className="lg:col-span-2">
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max Price ($)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Submit Filter Button */}
            <div className="lg:col-span-12 flex items-center justify-end space-x-3 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCat('');
                  setMinPrice('');
                  setMaxPrice('');
                  fetchProducts();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Reset Filters
              </button>

              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Apply Filters</span>
              </button>
            </div>
          </form>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <SlidersHorizontal className="w-5 h-5 mr-2 text-indigo-400" />
              Available Products ({products.length})
            </h2>

            <button
              onClick={fetchProducts}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all cursor-pointer"
              title="Refresh Products"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-sm">Loading multi-vendor product catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No products found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                No items match your search or filter criteria. Try adjusting your search keywords or resetting price range filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  isWishlisted={wishlistedIds.has(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalogPage;
