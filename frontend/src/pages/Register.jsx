import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import Swal from 'sweetalert2';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'You can now sign in.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#ffffff',
        color: '#111827',
      });
      
      navigate('/login');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
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
            <span className="logo-icon">⚡</span>
            <span className="logo-text">GitFolio</span>
          </div>
          <h1>Turn Your GitHub Into a Beautiful Portfolio.</h1>
          <p>
            GitFolio automatically syncs with your GitHub account to generate a stunning, professional developer portfolio in seconds. Show off your best work without writing a single line of extra code.
          </p>
          <ul className="features-list">
            <li>
              <span className="feature-icon">🚀</span>
              <span><strong>Instant Sync:</strong> Connect your GitHub and we'll automatically pull in your top repositories.</span>
            </li>
            <li>
              <span className="feature-icon">🎨</span>
              <span><strong>Beautiful Themes:</strong> Choose from a variety of premium, modern UI themes.</span>
            </li>
            <li>
              <span className="feature-icon">⚡</span>
              <span><strong>Lightning Fast:</strong> Optimized for speed and built with modern web technologies.</span>
            </li>
          </ul>
        </div>

        <div className="auth-card-wrapper">
          <header className="auth-header">
            <div className="logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">GitFolio</span>
            </div>
          </header>

          <div className="auth-card">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join us to build your ultimate portfolio</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={`form-input ${errors.username ? 'is-invalid' : ''}`}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="devninja"
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>

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
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? <span className="spinner"></span> : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
