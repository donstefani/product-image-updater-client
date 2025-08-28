import { useState } from 'react';
import { Card, TextField, Button, Text, Spinner } from '@shopify/polaris';
import { ShopifyCollection } from '@/types/shopify';
import { ServerApiService } from '@/services/serverApiService';

interface CollectionSearchProps {
  onCollectionSelect: (collection: ShopifyCollection) => void;
}

export function CollectionSearch({ onCollectionSelect }: CollectionSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverApiService] = useState(() => new ServerApiService());

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Searching collections with query:', searchQuery);
      
      // Call the server API to search collections
      const response = await serverApiService.searchCollections(searchQuery);
      setCollections(response.collections);
      
      console.log('Collections found:', response.collections.length);
    } catch (err) {
      console.error('Collection search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search collections. Please try again.');
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Card>
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <Text variant="headingMd" as="h2">
              Search Collections
            </Text>
            <Text variant="bodyMd" as="p">
              Find a collection to update product images
            </Text>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <TextField
                label="Collection Name"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Enter collection name to search..."
                autoComplete="off"
              />
            </div>
            <Button 
              variant="primary" 
              onClick={handleSearch}
              loading={isLoading}
              disabled={!searchQuery.trim()}
            >
              Search
            </Button>
          </div>

          {error && (
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: '#fef7f7', 
              border: '1px solid #d82c0d', 
              borderRadius: '4px',
              color: '#d82c0d'
            }}>
              <Text variant="bodySm" as="p">{error}</Text>
            </div>
          )}

          {isLoading && (
            <div style={{ 
              padding: '1rem', 
              textAlign: 'center',
              color: '#637381'
            }}>
              <Spinner size="small" />
              <Text variant="bodyMd" as="p">
                Searching collections...
              </Text>
            </div>
          )}

          {!isLoading && collections.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Text variant="bodySm" as="p">
                Found {collections.length} collection{collections.length !== 1 ? 's' : ''}:
              </Text>
              
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #e1e3e5',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f6f6f7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                  onClick={() => {
                    console.log('Collection selected:', collection);
                    onCollectionSelect(collection);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="bold">
                        {collection.title}
                      </Text>
                      <Text variant="bodySm" as="p">
                        {collection.products_count} products
                      </Text>
                    </div>
                    <Button 
                      size="slim"
                      onClick={() => {
                        console.log('Select button clicked for collection:', collection);
                        onCollectionSelect(collection);
                      }}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
