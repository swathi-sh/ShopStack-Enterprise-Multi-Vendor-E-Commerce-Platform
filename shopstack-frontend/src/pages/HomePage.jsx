import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { fetchCategories, fetchFeaturedProducts, fetchNewArrivals, fetchBestSellers } from '../store/slices/productSlice';
import { setCartItems } from '../store/slices/cartSlice';
import { setWishlistItems } from '../store/slices/wishlistSlice';
import ProductCard from '../components/ProductCard';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Award,
  Zap,
  ShieldCheck,
  CreditCard,
  Truck,
  Headphones,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Layers,
  Store
} from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Enterprise Multi-Vendor Marketplace',
    subtitle: 'Discover top-tier electronics, fashion, home decor, and lifestyle goods directly from verified vendors worldwide.',
    tag: 'Next-Gen Commerce',
    ctaText: 'Explore Catalog',
    ctaLink: '/products',
    badge: 'Verified Sellers',
    bgGradient: 'from-indigo-950 via-slate-900 to-purple-950',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    title: 'Smart Real-Time Stock & Instant Checkout',
    subtitle: 'Shop with full transparency. Automated inventory tracking ensures products are available and dispatched without delay.',
    tag: 'Automated Inventory',
    ctaText: 'Shop New Arrivals',
    ctaLink: '/products?sort=newest',
    badge: 'Fast Delivery',
    bgGradient: 'from-purple-950 via-slate-900 to-indigo-950',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    title: 'Verified Vendor Quality Guarantee',
    subtitle: 'All vendor products undergo strict quality checks with 256-bit encrypted secure payment protection.',
    tag: 'Guaranteed Quality',
    ctaText: 'Browse Best Sellers',
    ctaLink: '/products?sort=rating_desc',
    badge: '24/7 Support',
    bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80'
  }
];

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories, featuredProducts, newArrivals, bestSellers } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Auto-rotate Hero Carousel every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Fetch landing page data dynamically from backend APIs
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFeaturedProducts());
    dispatch(fetchNewArrivals());
    dispatch(fetchBestSellers());
  }, [dispatch]);

  const wishlistedIds = new Set(wishlistItems.map((item) => item.product?.id));

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAddToCart = async (productId) => {
    try {
      await axiosClient.post('/cart', { productId, quantity: 1 });
      const cartRes = await axiosClient.get('/cart');
      dispatch(setCartItems(cartRes.data));
      showToast('Product added to cart successfully!');
    } catch (err) {
      showToast('Please sign in as a customer to add items to cart.');
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

  const currentHero = HERO_SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 space-y-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-medium text-sm flex items-center space-x-2 animate-bounce">
          <ShoppingBag className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Carousel Section */}
      <section
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`relative overflow-hidden rounded-3xl border border-indigo-500/20 shadow-2xl bg-gradient-to-r ${currentHero.bgGradient} min-h-[460px] sm:min-h-[500px] flex items-center transition-all duration-700`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 sm:p-12 items-center relative z-10 w-full">
            {/* Slide Text Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentHero.tag}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {currentHero.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                {currentHero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate(currentHero.ctaLink)}
                  className="flex items-center space-x-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer active:scale-95"
                >
                  <span>{currentHero.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-2 px-4 py-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{currentHero.badge}</span>
                </div>
              </div>
            </div>

            {/* Slide Image Preview */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl group h-80">
                <img
                  src={currentHero.image}
                  alt={currentHero.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
              </div>
            </div>
          </div>

          {/* Carousel Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-indigo-600 text-white border border-slate-700 backdrop-blur-md transition-all cursor-pointer shadow-lg"
            title="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-indigo-600 text-white border border-slate-700 backdrop-blur-md transition-all cursor-pointer shadow-lg"
            title="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-indigo-500' : 'w-2.5 bg-slate-600/80 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Explore Marketplaces</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Featured Categories</h2>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/products?category=${cat.id}`)}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 hover:scale-105 group shadow-md flex flex-col items-center justify-between"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-slate-800 group-hover:border-indigo-500/40">
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 line-clamp-1">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Featured Products</h2>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Explore Catalog &rarr;
          </button>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Loading featured products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
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
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Best Sellers</h2>
          </div>
          <button
            onClick={() => navigate('/products?sort=rating_desc')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            View Top Rated &rarr;
          </button>
        </div>

        {bestSellers.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Loading best selling products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((product) => (
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
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">New Arrivals</h2>
          </div>
          <button
            onClick={() => navigate('/products?sort=newest')}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            View Newest &rarr;
          </button>
        </div>

        {newArrivals.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Loading new arrivals...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((product) => (
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
      </section>

      {/* Why ShopStack Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Enterprise Standard</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Why ShopStack?</h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              We empower buyers and multi-vendor sellers with transparent inventory management, secure payments, and reliable delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Verified Vendors</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All vendors undergo strict verification to ensure product quality, seller authenticity, and fast fulfillment.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Secure Payments</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                End-to-end encrypted checkout with Spring Security and JWT authentication protecting your sensitive account details.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Fast Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct dispatch from verified vendor hubs ensures your package is delivered safely and on schedule.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">24/7 Support</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our support team is available around the clock to answer your queries and assist with order tracking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
