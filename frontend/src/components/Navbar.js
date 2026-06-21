import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StethoscopeIcon, UserIcon, UsersIcon } from './Icons';
import './Navbar.css';

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const links = [
    { label: 'Dashboard', path: '/dashboard', icon: <StethoscopeIcon /> },
    { label: 'Register Patient', path: '/register', icon: <UserIcon /> },
    { label: 'Patients List', path: '/patients', icon: <UsersIcon /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate('/')}> 
        <div className="sidebar-logo">
          <StethoscopeIcon />
        </div>
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
    </aside>
  );
};

export default Navbar;