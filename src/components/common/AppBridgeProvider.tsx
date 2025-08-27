import React, { useEffect, useState } from 'react';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';

interface AppBridgeProviderProps {
  children: React.ReactNode;
}

export function AppBridgeProviderWrapper({ children }: AppBridgeProviderProps) {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get shop from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get('shop');
    const host = urlParams.get('host');

    if (shop && host) {
      // Shopify embedded app scenario
      const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
      if (apiKey) {
        const appBridgeConfig = {
          apiKey: apiKey,
          host: host,
          forceRedirect: true,
        };
        setConfig(appBridgeConfig);
      } else {
        // No API key available, but we can still work with server API
        console.warn('Shopify API key not configured, using server-only mode');
        setConfig({ isServerOnly: true, shop, host });
      }
    } else {
      // Localhost development scenario - no App Bridge needed
      setConfig({ isLocalhost: true });
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Loading app...</div>
      </div>
    );
  }

  // For localhost development or server-only mode, render without App Bridge
  if (config?.isLocalhost || config?.isServerOnly) {
    return <>{children}</>;
  }

  // For Shopify embedded app, use App Bridge
  return (
    <AppBridgeProvider config={config}>
      {children}
    </AppBridgeProvider>
  );
}
