// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import styles from './AuthPage.module.css';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
      // Validate confirm password on client side
      if (formData.password !== formData.confirmPassword) {
        setValidationError('Passwords do not match. Please try again.');
        return;
      }

      try {
        await axiosClient.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        setSuccessMessage('Account created successfully! Please sign in with your credentials.');
        setIsSignUp(false);
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Registration failed. Check connection or credentials.';
        dispatch(loginFailure(errorMessage));
      }
    } else {
      dispatch(loginStart());
      try {
        const response = await axiosClient.post('/auth/login', {
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        });

        dispatch(loginSuccess(response.data));
        navigate('/dashboard');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Sign in failed. Check connection or credentials.';
        dispatch(loginFailure(errorMessage));
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Left Brand Bar */}
      <div className={styles.brandCorner}>
        <span className={styles.brandIcon}>❖</span>
        <span className={styles.brandName}>ShopStack</span>
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <h2>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
          <p>{isSignUp ? 'Sign up to get started' : 'Enter your details to access your portal'}</p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className={styles.successBanner}>
            <span className={styles.bannerIcon}>✓</span> {successMessage}
          </div>
        )}

        {/* Error Alert (API or Validation) */}
        {(error || validationError) && (
          <div className={styles.errorBanner}>
            <span className={styles.bannerIcon}>✕</span> {validationError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {isSignUp && (
            <div className={styles.inputGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. John Doe"
                required
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Confirm Password Field (Sign Up Only) */}
          {isSignUp && (
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {/* Remember Me Checkbox (Sign In Only) */}
          {!isSignUp && (
            <div className={styles.optionsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className={styles.forgotLink}>
                Forgot password?
              </a>
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner}></span>
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => {
              setIsSignUp(!isSignUp);
              setSuccessMessage('');
              setValidationError('');
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;