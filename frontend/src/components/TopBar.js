import React from 'react';
import './TopBar.css';

const TopBar = ({ action }) => (
  <div className="topbar">
    <div className="topbar-clinic">
      <div className="topbar-clinic-label">Clinic</div>
      <div className="topbar-clinic-name">Greenleaf Health Center</div>
    </div>
    <div className="topbar-right">
      {action}
      {/* <div className="topbar-bell">🔔</div>
      <div className="topbar-avatar">DR</div>*/}
    </div>
  </div> 
);

export default TopBar;