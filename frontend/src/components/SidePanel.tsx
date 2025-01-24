import React, { useEffect, useState } from 'react';
import './SidePanel.css';
import { 
  PiSealQuestionDuotone,
  PiBellDuotone,
  PiClockCounterClockwiseDuotone,
  PiXDuotone,
  PiMapPinDuotone,
} from "react-icons/pi";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, title, children }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.documentElement.classList.add('panel-open');
    }
    return () => {
      document.documentElement.classList.remove('panel-open');
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Match this with CSS transition duration
  };

  const getIcon = () => {
    switch (title.toLowerCase()) {
      case 'help':
        return <PiSealQuestionDuotone />;
      case 'notifications':
        return <PiBellDuotone />;
      case 'activity':
        return <PiClockCounterClockwiseDuotone />;
      default:
        return <PiMapPinDuotone />;
    }
  };

  const getFormattedTitle = (title: string): string => {
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`panel-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`side-panel ${isClosing ? 'closing' : ''}`}>
        <div className="panel-header">
          <div className="header-content">
            {getIcon()}
            <h2>{getFormattedTitle(title)}</h2>
          </div>
          <button className="panel-control-button" onClick={handleClose}>
            <PiXDuotone />
          </button>
        </div>
        <div className="panel-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidePanel; 