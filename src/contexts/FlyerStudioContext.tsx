import { createContext, useContext, useState, ReactNode } from 'react';

interface FlyerStudioContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const FlyerStudioContext = createContext<FlyerStudioContextType>({
  isOpen: false,
  setIsOpen: () => {},
});

export function FlyerStudioProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <FlyerStudioContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </FlyerStudioContext.Provider>
  );
}

export function useFlyerStudio() {
  return useContext(FlyerStudioContext);
}
