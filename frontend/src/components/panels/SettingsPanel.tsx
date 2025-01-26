import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { PiRulerDuotone } from "react-icons/pi";
import CustomSelect from '../common/CustomSelect';
import './PanelStyles.css';

const SettingsPanel: React.FC = () => {
  const { distanceUnit, setDistanceUnit } = useSettings();

  const distanceOptions = [
    { value: 'km', label: 'Kilometers (km)' },
    { value: 'mi', label: 'Miles (mi)' }
  ];

  return (
    <div className="panel-section">
      <div className="settings-group">
        <div className="settings-section">
          <div className="settings-header">
            <PiRulerDuotone />
            <h3>Display</h3>
          </div>
          
          <div className="setting-item">
            <div className="setting-label">
              <label>Distance Unit</label>
              <span className="setting-description">Choose how distances are displayed</span>
            </div>
            <CustomSelect
              value={distanceUnit}
              onChange={(value) => setDistanceUnit(value as 'km' | 'mi')}
              options={distanceOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 