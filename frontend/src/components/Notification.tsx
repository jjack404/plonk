import React, { useEffect } from 'react';
import './Notification.css';
import { TxStatusType } from '../types';
import { PiXDuotone } from 'react-icons/pi';
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
    // Only auto-close success notifications
    if (type === 'success') {
      const timer = setTimeout(onClose, 6000);
      return () => clearTimeout(timer);
    }
  }, [onClose, type]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    onClose();
  };

  return (
    <div className={`notification notification-${type}`}>
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
      {type === 'error' && (
        <button className="close-button" onClick={handleClose}><PiXDuotone /></button>
      )}
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
