import React, { useEffect, useState } from 'react';
import './Loader.css';

interface LoaderProps {
  isLoading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
  const [activePixel, setActivePixel] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setActivePixel((prev) => (prev + 1) % 9);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="pixel-loader">
          {[...Array(9)].map((_, index) => (
            <div 
              key={index} 
              className={`pixel ${index === activePixel ? 'active' : ''}`}
            />
          ))}
        </div>
        <p>Loading drops...</p>
      </div>
    </div>
  );
};

export default Loader; 