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
  async searchCollections(
    query: string, 
    limit: number = 10, 
    after?: string
  ): Promise<{ 
    collections: ShopifyCollection[], 
    pageInfo: { hasNextPage: boolean, endCursor?: string } 
  }> {
    // For search functionality, we need to get all collections first, then filter and paginate
    // This is because server-side pagination happens before client-side filtering
    if (query.trim()) {
      // Get all collections for search (we'll implement proper server-side search later)
      const allCollections: ShopifyCollection[] = [];
      let hasMore = true;
      let cursor: string | undefined;
      
      while (hasMore) {
        const params = new URLSearchParams({
          limit: '50', // Get more per request to reduce API calls
          ...(cursor && { after: cursor })
        });
        
        const response = await this.makeRequest<{ 
          collections: ShopifyCollection[], 
          pageInfo: { hasNextPage: boolean, endCursor?: string } 
        }>(`${API_ENDPOINTS.collections}?${params}`);
        
        allCollections.push(...response.collections);
        hasMore = response.pageInfo.hasNextPage;
        cursor = response.pageInfo.endCursor;
      }
      
      // Filter collections based on the search query
      const filteredCollections = allCollections.filter((collection: ShopifyCollection) =>
        collection.title.toLowerCase().includes(query.toLowerCase()) ||
        collection.handle.toLowerCase().includes(query.toLowerCase())
      );
      
      // Implement client-side pagination
      const startIndex = after ? parseInt(after) : 0;
      const endIndex = startIndex + limit;
      const paginatedCollections = filteredCollections.slice(startIndex, endIndex);
      
      return {
        collections: paginatedCollections,
        pageInfo: {
          hasNextPage: endIndex < filteredCollections.length,
          endCursor: endIndex < filteredCollections.length ? endIndex.toString() : undefined
        }
      };
    } else {
      // For no search query, use server-side pagination directly
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(after && { after })
      });
      
      const response = await this.makeRequest<{ 
        collections: ShopifyCollection[], 
        pageInfo: { hasNextPage: boolean, endCursor?: string } 
      }>(`${API_ENDPOINTS.collections}?${params}`);
      
      return response;
    }
  }

  async getCollection(id: string): Promise<{ collection: ShopifyCollection }> {
    return this.makeRequest(`${API_ENDPOINTS.collections}/${id}`);
  }

  // Product operations
  async getProductsFromCollection(
    collectionId: string, 
    limit: number = 20, 
    after?: string
  ): Promise<{ 
    products: ShopifyProduct[], 
    pageInfo: { hasNextPage: boolean, endCursor?: string } 
  }> {
    console.log('Getting products from collection:', collectionId, 'limit:', limit, 'after:', after);
    
    const params = new URLSearchParams({
      collection_id: collectionId,
      limit: limit.toString(),
      ...(after && { after })
    });
    
    const response = await this.makeRequest<{ 
      products: ShopifyProduct[], 
      pageInfo: { hasNextPage: boolean, endCursor?: string } 
    }>(`${API_ENDPOINTS.products}?${params}`);
    
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
