import React, { useEffect, useState } from 'react';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import { Banner, Layout } from '@shopify/polaris';
import { APP_CONFIG } from '@/constants/app';

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
      setConfig({ 
        isShopify: true, 
        shop: shop,
        host: host,
        apiKey: APP_CONFIG.shopifyApiKey
      });
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

  // For localhost development, render without App Bridge
  if (config?.isLocalhost) {
    return <>{children}</>;
  }

  // For Shopify embedded app, render with App Bridge
  if (config?.isShopify) {
    if (!config.apiKey || config.apiKey === 'your-api-key') {
      return (
        <Layout>
          <Layout.Section>
            <Banner tone="critical" title="Configuration Error">
              <p>Shopify API key is not configured. Please set VITE_SHOPIFY_API_KEY in your environment variables.</p>
            </Banner>
          </Layout.Section>
        </Layout>
      );
    }

    return (
      <AppBridgeProvider
        config={{
          apiKey: config.apiKey,
          host: config.host,
          forceRedirect: true,
        }}
      >
        {children}
      </AppBridgeProvider>
    );
  }

  // Fallback: render without App Bridge
  return <>{children}</>;
}
