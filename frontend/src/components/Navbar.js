import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StethoscopeIcon, UsersIcon, UserIcon, ChartIcon, PowerIcon } from './Icons';
import './Navbar.css';

const Navbar = ({ user }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const links = [
    { label: 'Dashboard', path: '/dashboard', icon: <ChartIcon /> },
    { label: 'Register Patient', path: '/register', icon: <UserIcon /> },
    { label: 'Patients List', path: '/patients', icon: <UsersIcon /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate('/')}>
        <div className="sidebar-logo"><StethoscopeIcon /></div>
        <span className="sidebar-name">Intake</span>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ label, path, icon }) => (
          <Link key={path} to={path} className={`sidebar-link ${pathname === path ? 'active' : ''}`}>
            <span className="sidebar-icon">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.full_name}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout"><PowerIcon /></button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Navbar;