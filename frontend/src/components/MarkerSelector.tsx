import React from 'react';
import { PiMapPinDuotone, PiGiftDuotone } from "react-icons/pi";
import Bullet from './Bullet';
import './MarkerSelector.css';

export interface MarkerOption {
  id: string;
  icon: 'pin' | 'gift';
  color: string;
}

interface MarkerSelectorProps {
  value: MarkerOption;
  onChange: (option: MarkerOption) => void;
  small?: boolean;
}

const MARKER_OPTIONS: MarkerOption[] = [
  { id: 'pin-cream', icon: 'pin', color: '#fffbbd' },
  { id: 'pin-green', icon: 'pin', color: '#5bef6a' },
  { id: 'pin-blue', icon: 'pin', color: '#61dafb' },
  { id: 'gift-cream', icon: 'gift', color: '#fffbbd' },
  { id: 'gift-green', icon: 'gift', color: '#5bef6a' },
  { id: 'gift-blue', icon: 'gift', color: '#61dafb' },
];

const MarkerSelector: React.FC<MarkerSelectorProps> = ({ value, onChange, small }) => {
  const getIcon = (type: 'pin' | 'gift') => {
    return type === 'pin' ? <PiMapPinDuotone /> : <PiGiftDuotone />;
  };

  return (
    <div className={`marker-selector ${small ? 'small' : ''}`}>
      <div className="marker-grid">
        {MARKER_OPTIONS.map((option) => (
          <button
            key={option.id}
            className={`marker-option ${value.id === option.id ? 'selected' : ''}`}
            onClick={() => onChange(option)}
          >
            <Bullet 
              icon={getIcon(option.icon)} 
              color={option.color}
              size="small"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MarkerSelector; 