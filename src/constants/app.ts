export const APP_CONFIG = {
  title: 'Product Image Updater',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://h0bru07jm2.execute-api.us-east-2.amazonaws.com/production',
  password: import.meta.env.VITE_APP_PASSWORD || 'stefani',
  shopifyApiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
  appUrl: import.meta.env.VITE_APP_URL || 'https://product-image-updater.donstefani.com',
} as const;

export const API_ENDPOINTS = {
  collections: '/api/shopify/collections',
  products: '/api/shopify/products',
  imageUpdates: '/api/image-updates',
  operations: '/api/operations',
} as const;

export const CSV_HEADERS = {
  product_id: 'Product ID',
  product_handle: 'Product Handle',
  current_image_id: 'Current Image ID',
  collection_name: 'Collection Name',
  new_image_url: 'New Image URL',
} as const;
