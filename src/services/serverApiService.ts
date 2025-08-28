import { APP_CONFIG, API_ENDPOINTS } from '@/constants/app';
import { ShopifyCollection, ShopifyProduct, ImageUpdateOperation } from '@/types/shopify';

export class ServerApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = APP_CONFIG.apiBaseUrl;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Collection operations
  async searchCollections(query: string): Promise<{ collections: ShopifyCollection[] }> {
    // The server doesn't have a search endpoint, so we get all collections and filter client-side
    const response = await this.makeRequest<{ collections: ShopifyCollection[] }>(`${API_ENDPOINTS.collections}`);
    
    // Filter collections based on the search query
    const filteredCollections = response.collections.filter((collection: ShopifyCollection) =>
      collection.title.toLowerCase().includes(query.toLowerCase()) ||
      collection.handle.toLowerCase().includes(query.toLowerCase())
    );
    
    return { collections: filteredCollections };
  }

  async getCollection(id: string): Promise<{ collection: ShopifyCollection }> {
    return this.makeRequest(`${API_ENDPOINTS.collections}/${id}`);
  }

  // Product operations
  async getProductsFromCollection(collectionId: string, limit: number = 50): Promise<{ products: ShopifyProduct[] }> {
    console.log('Getting products from collection:', collectionId, 'limit:', limit);
    const response = await this.makeRequest<{ products: ShopifyProduct[] }>(`${API_ENDPOINTS.products}?collection_id=${collectionId}&limit=${limit}`);
    console.log('Products response:', response);
    return response;
  }

  // Image update operations
  async createImageUpdateOperation(collectionId: string, productIds: string[]): Promise<{ operation: ImageUpdateOperation }> {
    return this.makeRequest(`${API_ENDPOINTS.imageUpdates}/operation`, {
      method: 'POST',
      body: JSON.stringify({
        collection_id: collectionId,
        product_ids: productIds,
      }),
    });
  }

  async getImageUpdateOperation(operationId: string): Promise<{ operation: ImageUpdateOperation }> {
    return this.makeRequest(`${API_ENDPOINTS.imageUpdates}/operation/${operationId}`);
  }

  async downloadImageUpdateCSV(operationId: string): Promise<Blob> {
    const url = `${this.baseUrl}${API_ENDPOINTS.imageUpdates}/operation/${operationId}/csv`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download CSV: ${response.status} ${response.statusText}`);
    }
    
    return response.blob();
  }

  async uploadImageUpdateCSV(operationId: string, csvFile: File): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('csv', csvFile);

    const url = `${this.baseUrl}${API_ENDPOINTS.imageUpdates}/operation/${operationId}/upload`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload CSV: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async processImageUpdates(operationId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`${API_ENDPOINTS.imageUpdates}/operation/${operationId}/process`, {
      method: 'POST',
    });
  }

  // Operation history
  async getOperationHistory(): Promise<{ operations: ImageUpdateOperation[] }> {
    return this.makeRequest(`${API_ENDPOINTS.operations}/history`);
  }

  async rollbackOperation(operationId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`${API_ENDPOINTS.operations}/${operationId}/rollback`, {
      method: 'POST',
    });
  }

  async repeatOperation(operationId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`${API_ENDPOINTS.operations}/${operationId}/repeat`, {
      method: 'POST',
    });
  }
}
