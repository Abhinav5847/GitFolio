import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user details from session endpoint to verify token validity
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Session invalid');
        }
        const data = await response.json();
        setUser(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-logo">
          <span className="logo-icon">⚡</span>
          <span>GitFolio Dashboard</span>
        </div>
        <div className="nav-profile">
          <img src={user?.avatar_url} alt={user?.username} className="nav-avatar" />
          <span className="nav-username">@{user?.username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>Welcome, <span className="gradient-text">{user?.name || user?.username}</span>!</h1>
          <p>This is your control center. Customize your portfolio settings and manage repository synchronization.</p>
        </header>

        <section className="dashboard-main-section">
          <div className="card welcome-card">
            <h2>Authentication Completed Successfully! 🚀</h2>
            <p>Your account is registered. We are ready to build the next phases:</p>
            <ul className="todo-list">
              <li className="todo-item done">✓ Phase 1: Authentication Loop</li>
              <li className="todo-item pending">⏱ Phase 2: Repository Sync Engine (Next)</li>
              <li className="todo-item pending">⏱ Phase 3: Premium Customizable Portfolio Themes</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
