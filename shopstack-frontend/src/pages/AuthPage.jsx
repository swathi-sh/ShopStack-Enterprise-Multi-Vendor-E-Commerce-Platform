import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { ShoppingBag, CheckCircle, AlertCircle, Lock, Mail, User, Phone, MapPin } from 'lucide-react';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    rememberMe: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setValidationError('');

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setValidationError('Passwords do not match. Please verify your passwords.');
        return;
      }

      dispatch(loginStart());
      try {
        const response = await axiosClient.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
        });

        dispatch(loginSuccess(response.data));
        navigate('/dashboard');
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          (err.response?.data?.errors
            ? Object.values(err.response.data.errors).join(', ')
            : 'Registration failed. Please check your credentials.');
        dispatch(loginFailure(errorMessage));
      }
    } else {
      dispatch(loginStart());
      try {
        const response = await axiosClient.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        dispatch(loginSuccess(response.data));
        navigate('/dashboard');
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || 'Sign in failed. Invalid email or password.';
        dispatch(loginFailure(errorMessage));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      {/* Brand Corner */}
      <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => navigate('/login')}>
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-2xl text-white shadow-xl">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="text-left">
          <h1 className="font-extrabold text-2xl tracking-tight text-white font-sans">ShopStack</h1>
          <p className="text-xs text-indigo-400 font-medium">Enterprise Multi-Vendor E-Commerce</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp
              ? 'Join ShopStack as a Customer to start shopping'
              : 'Enter your credentials to access your Customer Portal'}
          </p>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Banner */}
        {(error || validationError) && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {isSignUp && (
            <>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Phone Number (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Address (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setSuccessMessage('');
              setValidationError('');
            }}
            className="text-indigo-400 font-semibold hover:underline cursor-pointer"
          >
            {isSignUp ? 'Sign In' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;