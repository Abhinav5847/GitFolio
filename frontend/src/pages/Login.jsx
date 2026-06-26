import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import Swal from 'sweetalert2';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { checkSession } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleOAuth = async (provider) => {
    setOauthLoading(true);
    try {
      const endpoint = provider === 'github' ? '/auth/login-url' : '/auth/google/login-url';
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(`Error redirecting to ${provider}:`, error);
      setOauthLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      await checkSession(); // Update AuthContext state
      
      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#ffffff',
        color: '#111827',
      });
      
      navigate('/dashboard');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        background: '#ffffff',
        color: '#111827',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        
        <div className="auth-info">
          <div className="logo">
            <svg className="logo-icon" style={{width: '24px', height: '24px', stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}} viewBox="0 0 24 24"><path d="m13 2-2 9h9l-9 11 2-9H4l9-11z"/></svg>
            <span className="logo-text">GitFolio</span>
          </div>
          <h1>Welcome Back to GitFolio.</h1>
          <p>
            Log in to manage your portfolio, connect new repositories, and customize your personal developer brand. Your stunning portfolio is just a click away.
          </p>
          <ul className="features-list">
            <li>
              <svg className="feature-icon" style={{width: '20px', height: '20px', stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}} viewBox="0 0 24 24"><path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.87-11.45L2 6"/><path d="M2.5 22v-6h6"/></svg>
              <span><strong>Stay Synced:</strong> Keep your portfolio up to date with your latest GitHub contributions.</span>
            </li>
            <li>
              <svg className="feature-icon" style={{width: '20px', height: '20px', stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              <span><strong>Always Beautiful:</strong> Effortlessly switch themes anytime without touching CSS.</span>
            </li>
          </ul>
        </div>

        <div className="auth-card-wrapper">
          <header className="auth-header">
            <div className="logo">
              <svg className="logo-icon" style={{width: '24px', height: '24px', stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}} viewBox="0 0 24 24"><path d="m13 2-2 9h9l-9 11 2-9H4l9-11z"/></svg>
              <span className="logo-text">GitFolio</span>
            </div>
          </header>

          <div className="auth-card">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to manage your portfolio</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <button type="submit" className="auth-btn" disabled={loading || oauthLoading}>
                {loading ? <span className="spinner"></span> : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider">OR</div>

            <div className="oauth-buttons">
              <button 
                className="oauth-btn github" 
                onClick={() => handleOAuth('github')}
                disabled={loading || oauthLoading}
                type="button"
              >
                <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                Sign in with GitHub
              </button>
              
              <button 
                className="oauth-btn google" 
                onClick={() => handleOAuth('google')}
                disabled={loading || oauthLoading}
                type="button"
              >
                <svg height="20" width="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>

            <div className="auth-footer">
              <p>
                Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
