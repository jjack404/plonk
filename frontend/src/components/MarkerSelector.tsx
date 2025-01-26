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
  { id: 'pin-cream', icon: 'pin', color: 'var(--manilla)' },
  { id: 'pin-green', icon: 'pin', color: 'var(--green)' },
  { id: 'pin-blue', icon: 'pin', color: '#61dafb' },
  { id: 'gift-cream', icon: 'gift', color: 'var(--manilla)' },
  { id: 'gift-green', icon: 'gift', color: 'var(--green)' },
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