import { useEffect, useState } from 'react';
import { ServerApiService } from '@/services/serverApiService';

export function useShopifyAuth() {
  const [shop, setShop] = useState<string | null>(null);
  const [serverApiService] = useState(() => new ServerApiService());

  useEffect(() => {
    // Extract shop from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const shopParam = urlParams.get('shop');
    
    if (shopParam) {
      setShop(shopParam);
    }
  }, []);

  return {
    shop,
    serverApiService,
  };
}
