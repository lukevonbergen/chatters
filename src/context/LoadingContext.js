import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const showLoading = (duration = 500) => {
    setIsLoading(true);
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIsLoading(false);
      }, 200); // Wait for fade-out animation to complete
    }, duration);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading }}>
      {children}
      {isLoading && (
        <div className={`fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-200 ease-in-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className={`bg-white rounded-xl p-6 shadow-2xl flex flex-col items-center space-y-3 transform transition-all duration-200 ease-in-out ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
            <div className="text-sm font-medium text-gray-700">Loading...</div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};