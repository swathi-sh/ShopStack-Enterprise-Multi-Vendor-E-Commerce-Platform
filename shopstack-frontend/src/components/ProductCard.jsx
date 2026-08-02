import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Tag, Store } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onAddToWishlist, isWishlisted }) => {
  const navigate = useNavigate();

  const primaryImage = product?.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500/40 hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col group">
      {/* Image Preview Container */}
      <div
        className="relative h-48 sm:h-52 bg-slate-950 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Category & Wishlist Badge Overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-indigo-300 border border-slate-700/80 flex items-center">
          <Tag className="w-3 h-3 mr-1" />
          <span>{product?.category?.name || 'General'}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToWishlist && onAddToWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-rose-400'
          }`}
          title="Add to Wishlist"
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-indigo-400">{product.brand || 'ShopStack'}</span>
            <div className="flex items-center text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
              <span>{product.rating || '4.5'}</span>
              <span className="text-slate-500 font-normal ml-1">({product.reviewCount || 0})</span>
            </div>
          </div>

          <h3
            onClick={() => navigate(`/products/${product.id}`)}
            className="text-base font-bold text-white tracking-tight hover:text-indigo-400 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description || 'Enterprise multi-vendor quality product with full guarantee.'}
          </p>

          <div className="flex items-center text-[11px] text-slate-400 pt-1">
            <Store className="w-3 h-3 mr-1 text-purple-400" />
            <span className="truncate">Sold by {product?.vendor?.businessName || 'Verified Vendor'}</span>
          </div>
        </div>

        {/* Footer: Price & Add to Cart */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Price</span>
            <span className="text-lg font-extrabold text-white">${Number(product.price).toFixed(2)}</span>
          </div>

          <button
            onClick={() => onAddToCart && onAddToCart(product.id)}
            disabled={product.stockQuantity <= 0}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
