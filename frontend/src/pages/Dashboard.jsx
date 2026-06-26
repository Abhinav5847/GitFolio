import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './Dashboard.css';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, checkSession } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleConnectGitHub = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/login-url`);
      if (!response.ok) {
        throw new Error('Failed to get GitHub authorization URL');
      }
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Connection Failed',
        text: 'Failed to connect to GitHub. Please check if backend is running.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-logo">
          <span className="logo-icon">⚡</span>
          <span>GitFolio Dashboard</span>
        </div>
        <div className="nav-profile">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="nav-avatar" />
          ) : (
            <div className="nav-avatar-placeholder">{user?.username?.[0]?.toUpperCase()}</div>
          )}
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
            
            {!user?.github_connected ? (
              <div className="github-connect-section">
                <p>To automatically sync your repositories, you need to connect your GitHub account.</p>
                <button 
                  className={`connect-github-btn ${loading ? 'loading' : ''}`}
                  onClick={handleConnectGitHub}
                  disabled={loading}
                >
                  {loading ? 'Connecting...' : 'Connect GitHub'}
                </button>
              </div>
            ) : (
              <div>
                <p>✅ GitHub Connected Successfully!</p>
                <ul className="todo-list">
                  <li className="todo-item pending">⏱ Phase 2: Repository Sync Engine (Next)</li>
                  <li className="todo-item pending">⏱ Phase 3: Premium Customizable Portfolio Themes</li>
                </ul>
              </div>
            )}
            
          </div>
        </section>
      </main>
    </div>
  );
}
