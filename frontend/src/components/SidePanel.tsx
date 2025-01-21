import React, { useEffect } from 'react';
import './SidePanel.css';
import { 
  PiSealQuestionDuotone,
  PiBellDuotone,
  PiClockCounterClockwiseDuotone,
} from "react-icons/pi";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    document.documentElement.classList.toggle('panel-open', isOpen);
    return () => {
      document.documentElement.classList.remove('panel-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (title.toLowerCase()) {
      case 'activity':
        return <PiClockCounterClockwiseDuotone />;
      case 'notifications':
        return <PiBellDuotone />;
      case 'help':
        return <PiSealQuestionDuotone />;
      default:
        return null;
    }
  };

  return (
    <div className="panel-overlay">
      <div className="side-panel">
        <div className="panel-header">
          <div className="header-content">
            {getIcon()}
            <h2>{title}</h2>
          </div>
        </div>
        <div className="panel-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidePanel; 