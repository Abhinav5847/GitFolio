import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './Dashboard.css';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
        background: '#ffffff',
        color: '#111111',
      });
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-logo">
          GitFolio
        </div>
        <div className="nav-right-cluster">
          <div className="nav-profile-minimal">
            {user?.github_connected && user?.avatar_url ? (
               <img src={user.avatar_url} alt="Profile" className="nav-avatar" />
            ) : (
               <div className="nav-avatar-placeholder">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
            )}
            <div className="nav-user-details">
              <span className="nav-username">@{user?.username || 'Guest'}</span>
              {user?.github_connected && (
                <span className="git-synced-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Git Synced
                </span>
              )}
            </div>
            <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>
            Welcome back, <br />
            <span className="italic-serif text-accent">{user?.name || user?.username}</span>.
          </h1>
          <p>This is your control center. Customize your portfolio settings and manage repository synchronization in real-time.</p>
        </header>

        <section className="dashboard-main-section">
          <div className="dashboard-card">
            <h2>Authentication Status.</h2>
            
            {!user?.github_connected ? (
              <div className="github-connect-section">
                <p>To automatically sync your repositories, you need to connect your GitHub account.</p>
                <button 
                  className="connect-github-btn"
                  onClick={handleConnectGitHub}
                  disabled={loading}
                >
                  {loading ? 'Connecting...' : (
                    <>
                      <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                      </svg>
                      Connect GitHub Account
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="status-synced">
                <p className="success-text">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  GitHub Connected Successfully
                </p>
                <ul className="todo-list">
                  <li className="todo-item">
                    <strong>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Phase 2: Sync Engine
                    </strong>
                    <span>Repository synchronization is currently pending.</span>
                  </li>
                  <li className="todo-item">
                    <strong>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                      Phase 3: Custom Themes
                    </strong>
                    <span>Premium customizable portfolio themes coming soon.</span>
                  </li>
                </ul>
              </div>
            )}
            
          </div>

          <div className="dashboard-card">
            <h2>Platform Capabilities.</h2>
            <p>GitFolio operates as your all-in-one developer portfolio generator. The workflow is entirely automated:</p>
            <ul className="todo-list">
              <li className="todo-item">
                <strong>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 22v-6h6"></path></svg>
                  Sync Repositories
                </strong> 
                <span>We fetch your best GitHub projects and contributions instantly.</span>
              </li>
              <li className="todo-item">
                <strong>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
                  Customize Aesthetics
                </strong> 
                <span>Select from highly curated, print-quality design systems.</span>
              </li>
              <li className="todo-item">
                <strong>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  Publish
                </strong> 
                <span>Deploy a live portfolio link to share with recruiters and peers.</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
