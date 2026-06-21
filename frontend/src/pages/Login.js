import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StethoscopeIcon } from '../components/Icons';
import './Login.css';

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', form);
      const { access_token, user } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo"><StethoscopeIcon /></div>
        <h1>Patient Intake</h1>
        <p className="login-sub">Sign in to your clinic account</p>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>EMAIL</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@clinic.com"
              required
            />
          </div>
          <div className="login-field">
            <label>PASSWORD</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="login-switch">
          Don't have an account?{' '}
          <span onClick={() => navigate('/register-user')} className="login-link">Create one</span>
        </p>
      </div>
    </div>
  );
};

export default Login;