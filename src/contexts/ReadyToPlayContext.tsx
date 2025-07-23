import React, { createContext, useContext, useState, useCallback } from 'react';

interface ReadyToPlayContextType {
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
}

const ReadyToPlayContext = createContext<ReadyToPlayContextType | undefined>(undefined);

export const ReadyToPlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReadyState] = useState(false);

  const setIsReady = useCallback((ready: boolean) => {
    setIsReadyState(ready);
  }, []);

  return (
    <ReadyToPlayContext.Provider value={{ isReady, setIsReady }}>
      {children}
    </ReadyToPlayContext.Provider>
  );
};

export const useReadyToPlay = () => {
  const context = useContext(ReadyToPlayContext);
  if (context === undefined) {
    throw new Error('useReadyToPlay must be used within a ReadyToPlayProvider');
  }
  return context;
};