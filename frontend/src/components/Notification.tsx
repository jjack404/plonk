import React from 'react';
import './Notification.css';

interface NotificationProps {
  type: 'pending' | 'success';
  message?: string;
  txId?: string;
  action?: 'drop' | 'claim';
}

const Notification: React.FC<NotificationProps> = ({ type, message, txId, action }) => {
  const getMessage = () => {
    if (!message) {
      if (type === 'pending') {
        return action === 'drop' ? 'Creating drop...' : 'Claiming drop...';
      }
      return action === 'drop' ? 'Drop successful!' : 'Claim successful!';
    }
    return message;
  };

  return (
    <div className={`notification ${type}`}>
      {type === 'pending' && <div className="loading-spinner" />}
      <span>{getMessage()}</span>
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
