import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Drop } from '../types';

interface DropsContextType {
  drops: Drop[];
  setDrops: React.Dispatch<React.SetStateAction<Drop[]>>;
  addDrop: (drop: Drop) => void;
  updateDrop: (dropId: string, updates: Partial<Drop>) => void;
  fetchDrops: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const DropsContext = createContext<DropsContextType | undefined>(undefined);

export const DropsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrops = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<Drop[]>(`${import.meta.env.VITE_BACKEND_URL}/api/drops`);
      setDrops(response.data);
    } catch (error) {
      console.error('Error fetching drops:', error);
      setError('Failed to load drops');
      setDrops([]);
    } finally {
      setIsLoading(false);
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
    <DropsContext.Provider value={{ 
      drops, 
      setDrops, 
      addDrop, 
      updateDrop, 
      fetchDrops,
      isLoading,
      error 
    }}>
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
