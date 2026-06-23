

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './AuthPages.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle(credentialResponse.credential);
            navigate('/dashboard');
        } catch (err) {
            setError(err || 'Google sign-in failed. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google authentication failed. Please try again.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!email || !password) {
                setError('Email and password are required');
                setLoading(false);
                return;
            }

            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>UMT Smart Campus Support System</h1>
                    <p>Welcome!</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="s12345@ocean.umt.edu.my"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="oauth-divider">or continue with Google</div>

                <div className="google-btn-container">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        width="338"
                    />
                </div>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
