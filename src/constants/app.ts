export const APP_CONFIG = {
  title: 'Product Image Updater',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
} as const;

export const API_ENDPOINTS = {
  collections: '/api/collections',
  products: '/api/products',
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
