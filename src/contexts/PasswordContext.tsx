import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PasswordContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (authenticated: boolean) => void;
}

const PasswordContext = createContext<PasswordContextType | undefined>(undefined);

interface PasswordProviderProps {
  children: ReactNode;
}

export function PasswordProvider({ children }: PasswordProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated from session storage
    const authenticated = sessionStorage.getItem('piu-authenticated') === 'true';
    setIsAuthenticated(authenticated);
  }, []);

  const handleSetAuthenticated = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
    if (!authenticated) {
      // Clear session storage when logging out
      sessionStorage.removeItem('piu-authenticated');
    }
  };

  return (
    <PasswordContext.Provider 
      value={{ 
        isAuthenticated, 
        setIsAuthenticated: handleSetAuthenticated 
      }}
    >
      {children}
    </PasswordContext.Provider>
  );
}

export function usePasswordAuth() {
  const context = useContext(PasswordContext);
  if (context === undefined) {
    throw new Error('usePasswordAuth must be used within a PasswordProvider');
  }
  return context;
}
