import React from 'react';

interface MobileFormWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileFormWrapper({ children, className = '' }: MobileFormWrapperProps) {
  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {children}
    </div>
  );
} 