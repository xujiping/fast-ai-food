import React from 'react';
import { SpinLoading } from 'antd-mobile';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'small', color = '#1677ff' }) => {
  return (
    <div className="loading-spinner">
      <SpinLoading color={color} />
    </div>
  );
};

export default LoadingSpinner;