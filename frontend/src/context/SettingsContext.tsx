import React, { createContext, useContext, useState, useEffect } from 'react';

type DistanceUnit = 'km' | 'mi';

interface SettingsContextType {
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(() => {
    const saved = localStorage.getItem('distanceUnit');
    return (saved as DistanceUnit) || 'km';
  });

  useEffect(() => {
    localStorage.setItem('distanceUnit', distanceUnit);
  }, [distanceUnit]);

  return (
    <SettingsContext.Provider value={{ distanceUnit, setDistanceUnit }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 