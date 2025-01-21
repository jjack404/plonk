import React from 'react';
import './PanelStyles.css';

export const ActivityPanel: React.FC = () => {
  return (
    <div className="panel-section">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        <div className="activity-item">
          <span className="activity-text">Claimed drop at Central Park</span>
          <span className="activity-time">2m ago</span>
        </div>
        <div className="activity-item">
          <span className="activity-text">Connected wallet</span>
          <span className="activity-time">10m ago</span>
        </div>
        <div className="activity-item">
          <span className="activity-text">Enabled location services</span>
          <span className="activity-time">15m ago</span>
        </div>
      </div>
    </div>
  );
}; 