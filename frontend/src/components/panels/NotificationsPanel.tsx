import React from 'react';
import './PanelStyles.css';

export const NotificationsPanel: React.FC = () => {
  return (
    <div className="panel-section">
      <h3>Notifications</h3>
      <div className="notifications-list">
        <div className="notification-item">
          <span className="notification-text">New drop available nearby!</span>
          <span className="notification-time">5m ago</span>
        </div>
        <div className="notification-item">
          <span className="notification-text">Successfully claimed drop</span>
          <span className="notification-time">2h ago</span>
        </div>
        <div className="notification-item">
          <span className="notification-text">Welcome to Plonk!</span>
          <span className="notification-time">1d ago</span>
        </div>
      </div>
    </div>
  );
}; 