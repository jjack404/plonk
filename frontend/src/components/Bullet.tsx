import React from 'react';

interface BulletProps {
  icon: React.ReactNode;
  color: string;
  size?: 'small' | 'medium' | 'large';
}

const Bullet: React.FC<BulletProps> = ({ icon, color, size = 'medium' }) => {
  const sizeMap = {
    small: '24px',
    medium: '32px',
    large: '48px'
  };

  return (
    <div 
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        border: `1px solid ${color}`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'small' ? '16px' : size === 'medium' ? '24px' : '32px',
        borderRadius: '50%'
      }}
    >
      {icon}
    </div>
  );
};

export default Bullet; 