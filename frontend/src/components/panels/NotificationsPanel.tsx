import React from 'react';
import './PanelStyles.css';

export const NotificationsPanel: React.FC = () => {
  return (
    <div className="panel-section">
      <div className="notifications-list">
        <div className="notification-item">
          <span className="notification-text">No notifications yet</span>
          <span className="notification-time">-</span>
        </div>
      </div>
    </div>
  );
}; 