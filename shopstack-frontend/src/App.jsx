import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Customer Components & Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';

// Vendor Components & Pages
import VendorAuthPage from './pages/VendorAuthPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorProductsPage from './pages/VendorProductsPage';
import VendorOrdersPage from './pages/VendorOrdersPage';

import ProtectedRoute from './components/ProtectedRoute';
import ProtectedVendorRoute from './components/ProtectedVendorRoute';
import Navbar from './components/Navbar';
import VendorNavbar from './components/VendorNavbar';
import Footer from './components/Footer';

// Layout wrapper for customer pages requiring top Navbar and Footer
const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Layout wrapper for vendor portal pages
const VendorLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <VendorNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Customer Authentication Routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* Public Vendor Authentication Routes */}
          <Route path="/vendor/login" element={<VendorAuthPage />} />
          <Route path="/vendor/register" element={<VendorAuthPage />} />

          {/* Public Customer & Catalog Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductCatalogPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
          </Route>

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<CustomerLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<ProfilePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Route>
          </Route>

          {/* Protected Vendor Routes */}
          <Route element={<ProtectedVendorRoute />}>
            <Route element={<VendorLayout />}>
              <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
              <Route path="/vendor/products" element={<VendorProductsPage />} />
              <Route path="/vendor/orders" element={<VendorOrdersPage />} />
            </Route>
          </Route>

          {/* Default Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;