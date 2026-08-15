import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { vendorLogout } from '../store/slices/vendorAuthSlice';
import { LayoutDashboard, Package, ShoppingBag, LogOut, ArrowLeft } from 'lucide-react';

const VendorNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vendor } = useSelector((state) => state.vendorAuth);

  const handleVendorLogout = () => {
    dispatch(vendorLogout());
    navigate('/vendor/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-purple-900/40 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand & Vendor Badge */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/vendor/dashboard')}>
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">ShopStack</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                Vendor Hub
              </span>
            </div>
          </div>

          {/* Vendor Nav Links */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink
              to="/vendor/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/vendor/products"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <Package className="w-4 h-4" />
              <span>My Inventory</span>
            </NavLink>

            <NavLink
              to="/vendor/orders"
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
               <ShoppingBag className="w-4 h-4" /> 
              <span>Sales Orders</span> 
            </NavLink>
          </div>

          {/* Vendor Business Badge & Customer Store Switch */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </button>

            <div className="px-3 py-1.5 bg-purple-950/60 rounded-full border border-purple-800 text-xs text-purple-300 font-semibold truncate max-w-[150px]">
              {vendor?.businessName || vendor?.email || 'Vendor'}
            </div>

            <button
              onClick={handleVendorLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-medium transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default VendorNavbar;
