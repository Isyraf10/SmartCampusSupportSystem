

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        matricNumber: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validation
            if (!formData.name || !formData.email || !formData.password) {
                setError('Name,email and password are required');
                setLoading(false);
                return;
            }

            // Trim passwords and check match
            const password = formData.password.trim();
            const confirmPassword = formData.confirmPassword.trim();

            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            if (password.length < 3) {
                setError('Password must be at least 3 characters');
                setLoading(false);
                return;
            }

            await register({
                name: formData.name,
                email: formData.email,
                password: password,
                confirmPassword: confirmPassword,
                matricNumber: formData.matricNumber || undefined,
                role: formData.role
            });
            navigate('/dashboard');

        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card auth-card-large">
                <div className="auth-header">
                    <h1>UMT Smart Campus Support System</h1>
                    <p>Create Your Account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Nickname</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Isyraf Aiman"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="s12345@ocean.umt.edu.my"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="matricNumber">Matric Number (Optional)</label>
                            <input
                                id="matricNumber"
                                type="text"
                                name="matricNumber"
                                value={formData.matricNumber}
                                onChange={handleChange}
                                placeholder="S12345"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">User Type</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="student">Student</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    {error && <div className="error-message"> {error}</div>}

                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
