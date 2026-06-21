import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StethoscopeIcon } from '../components/Icons';
import './Login.css';

const RegisterUser = () => {
  const [form, setForm] = useState({ email: '', full_name: '', password: '', role: 'receptionist' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:8000/api/auth/register', form);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo"><StethoscopeIcon /></div>
        <h1>Create Account</h1>
        <p className="login-sub">Register a new clinic staff account</p>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>FULL NAME</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Dr. Jane Smith"
              required
            />
          </div>

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
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
          </div>

          <div className="login-field">
            <label>ROLE</label>
            <select name="role" value={form.role} onChange={handleChange} className="login-select">
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="login-switch">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="login-link">Sign in</span>
        </p>
      </div>
    </div>
  );
};

export default RegisterUser;