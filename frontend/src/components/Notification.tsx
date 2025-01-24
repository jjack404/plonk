import React, { useEffect } from 'react';
import './Notification.css';
import { TxStatusType } from '../types';

interface NotificationProps {
  message: string;
  type: TxStatusType;
  txId?: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = React.memo(({
  message,
  type,
  txId,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
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
          View Tx
        </a>
      )}
      <button className="close-button" onClick={onClose}>✕</button>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.message === nextProps.message &&
    prevProps.type === nextProps.type &&
    prevProps.txId === nextProps.txId
  );
});

export default Notification;
