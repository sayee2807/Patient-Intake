import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PatientsList from './pages/PatientsList';
import './index.css';

const AppLayout = ({ children }) => {
  const { pathname } = useLocation();
  if (pathname === '/') return children;
  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<PatientsList />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;