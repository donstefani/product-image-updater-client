import React, { useEffect, useState } from 'react';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';

interface AppBridgeProviderProps {
  children: React.ReactNode;
}

export function AppBridgeProviderWrapper({ children }: AppBridgeProviderProps) {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log('App Bridge configured for embedded app');
      } else {
        // No API key available
        setError('Shopify API key not configured. Please check your environment variables.');
        console.error('VITE_SHOPIFY_API_KEY is not set in environment variables');
      }
    } else {
      // Localhost development scenario - no App Bridge needed
      console.log('Running in localhost mode - App Bridge not required');
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

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fef7f7', 
          border: '1px solid #d82c0d', 
          borderRadius: '4px',
          color: '#d82c0d',
          maxWidth: '500px'
        }}>
          <h3>Configuration Error</h3>
          <p>{error}</p>
          <p>Please ensure VITE_SHOPIFY_API_KEY is set in your .env file.</p>
        </div>
      </div>
    );
  }

  // For localhost development, render without App Bridge
  if (config?.isLocalhost) {
    return <>{children}</>;
  }

  // For Shopify embedded app, use App Bridge
  return (
    <AppBridgeProvider config={config}>
      {children}
    </AppBridgeProvider>
  );
}
