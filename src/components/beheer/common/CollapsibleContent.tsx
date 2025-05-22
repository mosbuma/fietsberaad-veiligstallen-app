import React, { useState } from 'react';

interface CollapsibleContentProps {
  children: React.ReactNode;
  buttonText?: string;
  className?: string;
}

const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  buttonText = 'Toggle Content',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={className}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-full px-4 py-2 text-left bg-gray-100 hover:bg-gray-200 rounded-md mb-2"
      >
        {buttonText} {isVisible ? '▼' : '▶'}
      </button>
      <div className={`${isVisible ? 'block' : 'hidden'}`}>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleContent; 