import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Tag, Store, PackageX } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onAddToWishlist, isWishlisted }) => {
  const navigate = useNavigate();

  const primaryImage = product?.images && product.images.length > 0 && product.images[0]
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  const isOutOfStock = !product || product.stockQuantity === undefined || product.stockQuantity <= 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500/40 hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col group relative">
      {/* Image Preview Container */}
      <div
        className="relative h-48 sm:h-52 bg-slate-950 overflow-hidden cursor-pointer"
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <img
          src={primaryImage}
          alt={product?.name || 'Product'}
          loading="lazy"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? 'grayscale opacity-75' : ''
          }`}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Out of Stock Overlay Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1.5 bg-rose-600/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg border border-rose-400/40 flex items-center space-x-1">
              <PackageX className="w-3.5 h-3.5 mr-1" />
              Out of Stock
            </span>
          </div>
        )}

        {/* Category Badge Overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-indigo-300 border border-slate-700/80 flex items-center">
          <Tag className="w-3 h-3 mr-1" />
          <span>{product?.category?.name || 'General'}</span>
        </div>

        {/* Wishlist Toggle Button */}
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
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
              {product?.brand || 'ShopStack'}
            </span>
            <div className="flex items-center text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
              <span>{product?.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
              <span className="text-slate-500 font-normal ml-1">({product?.reviewCount || 0})</span>
            </div>
          </div>

          <h3
            onClick={() => navigate(`/products/${product.id}`)}
            className="text-base font-bold text-white tracking-tight hover:text-indigo-400 transition-colors cursor-pointer line-clamp-1"
          >
            {product?.name}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product?.description || 'Enterprise multi-vendor quality product with full guarantee.'}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <div className="flex items-center">
              <Store className="w-3 h-3 mr-1 text-purple-400" />
              <span className="truncate max-w-[130px]">
                {product?.vendor?.businessName || 'Verified Vendor'}
              </span>
            </div>

            <span className={`font-semibold ${isOutOfStock ? 'text-rose-400' : 'text-slate-400'}`}>
              {isOutOfStock ? 'Stock: 0' : `In Stock (${product.stockQuantity})`}
            </span>
          </div>
        </div>

        {/* Footer: Price & Add to Cart */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-medium block">Price</span>
            <span className="text-lg font-extrabold text-white">${Number(product?.price || 0).toFixed(2)}</span>
          </div>

          <button
            onClick={() => onAddToCart && onAddToCart(product.id)}
            disabled={isOutOfStock}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
