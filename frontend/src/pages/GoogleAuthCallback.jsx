import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import './AuthCallback.css';

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('authenticating'); // authenticating, syncing, error
  const [errorMsg, setErrorMsg] = useState('');
  const callbackProcessed = useRef(false);

  useEffect(() => {
    // Avoid double processing in React strict mode
    if (callbackProcessed.current) return;
    callbackProcessed.current = true;

    const code = searchParams.get('code');
    if (!code) {
      setStatus('error');
      setErrorMsg('No authorization code was found in the URL.');
      return;
    }

    const processCallback = async () => {
      try {
        setStatus('authenticating');
        const response = await fetch(`${API_BASE_URL}/auth/google/callback?code=${code}`);
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || 'Authentication failed');
        }

        const data = await response.json();
        
        // Save auth data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        login(data.user);

        setStatus('syncing');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);

      } catch (err) {
        console.error(err);
        setStatus('error');
        setErrorMsg(err.message || 'An unexpected error occurred during login.');
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="callback-container">
      <div className="callback-card">
        {status === 'authenticating' && (
          <div className="status-loader">
            <div className="glowing-spinner"></div>
            <h2>Connecting to Google</h2>
            <p>We are establishing a secure connection to authenticate your profile...</p>
          </div>
        )}

        {status === 'syncing' && (
          <div className="status-loader">
            <div className="glowing-spinner success"></div>
            <h2>Authentication Successful</h2>
            <p>Setting up your personal dashboard space...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="status-error">
            <div className="error-icon"><svg style={{width: '48px', height: '48px', stroke: 'var(--error)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round'}} viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>
            <h2>Login Failed</h2>
            <p>{errorMsg}</p>
            <button className="back-btn" onClick={() => navigate('/login')}>
              Go Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
