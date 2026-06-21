import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RegisterUser from './pages/RegisterUser';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PatientsList from './pages/PatientsList';
import './index.css';

const AppLayout = ({ children, user }) => {
  const { pathname } = useLocation();
  const noSidebar = ['/', '/login', '/register-user'].includes(pathname);
  if (noSidebar) return children;
  return (
    <div style={{ display: 'flex' }}>
      <Navbar user={user} />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
};

const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setChecking(false);
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (checking) return null;

  return (
    <Router>
      <AppLayout user={user}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
          <Route path="/register-user" element={<RegisterUser />} />
          <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard user={user} /></ProtectedRoute>} />
          <Route path="/register" element={<ProtectedRoute user={user}><Register /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute user={user}><PatientsList /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;