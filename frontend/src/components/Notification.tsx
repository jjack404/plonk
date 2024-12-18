import React, { useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type: 'pending' | 'success';
  txId?: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, txId, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="notification">
      {type === 'pending' && <div className="loading-spinner" />}
      <span>{message}</span>
      {txId && (
        <a
          href={`https://solscan.io/tx/${txId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Transaction
        </a>
      )}
      <button className="close-button" onClick={onClose}>✕</button>
    </div>
  );
};

export default Notification;
