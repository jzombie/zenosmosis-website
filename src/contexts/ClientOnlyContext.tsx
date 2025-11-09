import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ClientOnlyContextValue {
  isClient: boolean;
}

const ClientOnlyContext = createContext<ClientOnlyContextValue>({ isClient: false });

export function ClientOnlyProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This only runs in the browser after hydration
    setIsClient(true);
  }, []);

  return (
    <ClientOnlyContext.Provider value={{ isClient }}>
      {children}
    </ClientOnlyContext.Provider>
  );
}

export function useClientOnly() {
  return useContext(ClientOnlyContext);
}

// Wrapper component that only renders children on the client
export function ClientOnly({ children }: { children: ReactNode }) {
  const { isClient } = useClientOnly();
  
  if (!isClient) {
    return null;
  }
  
  return <>{children}</>;
}
