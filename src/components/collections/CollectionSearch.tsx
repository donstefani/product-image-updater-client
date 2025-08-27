import React, { useState, useEffect } from 'react';
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
    if (!searchQuery.trim()) {
      setCollections([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await serverApiService.searchCollections(searchQuery);
      setCollections(response.collections);
    } catch (err) {
      console.error('Error searching collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to search collections');
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Text variant="headingMd" as="h2">
            Search Collections
          </Text>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <TextField
                label="Collection name"
                value={searchQuery}
                onChange={setSearchQuery}
                onKeyPress={handleKeyPress}
                placeholder="Enter collection name to search..."
                autoComplete="off"
              />
            </div>
            <Button 
              primary 
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
              <Text variant="bodyMd" as="p" style={{ marginTop: '0.5rem' }}>
                Searching collections...
              </Text>
            </div>
          )}

          {!isLoading && collections.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Text variant="bodySm" as="p" color="subdued">
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
                  onClick={() => onCollectionSelect(collection)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text variant="bodyMd" as="p" fontWeight="bold">
                        {collection.title}
                      </Text>
                      <Text variant="bodySm" as="p" color="subdued">
                        {collection.products_count} products
                      </Text>
                    </div>
                    <Button size="slim">
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && searchQuery && collections.length === 0 && !error && (
            <div style={{ 
              padding: '1rem', 
              textAlign: 'center',
              color: '#637381'
            }}>
              <Text variant="bodyMd" as="p">
                No collections found matching "{searchQuery}"
              </Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
