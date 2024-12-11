import React from 'react';
import './Notification.css';

interface NotificationProps {
  type: 'pending' | 'success';
  message: string;
  txId?: string;
}

const Notification: React.FC<NotificationProps> = ({ type, message, txId }) => {
  return (
    <div className={`notification ${type}`}>
      {type === 'pending' && <div className="loading-spinner" />}
      <span>{message}</span>
      {txId && (
        <a 
          href={`https://solscan.io/tx/${txId}?cluster=devnet`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          View Transaction
        </a>
      )}
    </div>
  );
};

export default Notification;
