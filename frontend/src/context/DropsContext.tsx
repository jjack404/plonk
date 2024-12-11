import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Drop } from '../types';

interface DropsContextType {
  drops: Drop[];
  setDrops: React.Dispatch<React.SetStateAction<Drop[]>>;
  addDrop: (drop: Drop) => void;
  updateDrop: (dropId: string, updates: Partial<Drop>) => void;
  fetchDrops: () => Promise<void>;
}

const DropsContext = createContext<DropsContextType | undefined>(undefined);

export const DropsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drops, setDrops] = useState<Drop[]>([]);

  const fetchDrops = async (): Promise<void> => {
    try {
      const response = await axios.get<Drop[]>(`${import.meta.env.VITE_BACKEND_URL}/api/drops`);
      setDrops(response.data);
    } catch (error) {
      console.error('Error fetching drops:', error);
    }
  };

  const addDrop = (drop: Drop): void => {
    setDrops(prevDrops => [...prevDrops, drop]);
  };

  const updateDrop = (dropId: string, updates: Partial<Drop>): void => {
    setDrops(prevDrops => 
      prevDrops.map(drop => 
        drop._id === dropId ? { ...drop, ...updates } : drop
      )
    );
  };

  useEffect(() => {
    fetchDrops();
  }, []);

  return (
    <DropsContext.Provider value={{ drops, setDrops, addDrop, updateDrop, fetchDrops }}>
      {children}
    </DropsContext.Provider>
  );
};

export const useDrops = (): DropsContextType => {
  const context = useContext(DropsContext);
  if (context === undefined) {
    throw new Error('useDrops must be used within a DropsProvider');
  }
  return context;
};
