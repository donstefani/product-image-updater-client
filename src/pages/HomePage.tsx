import { useState } from 'react';
import { Card, Text, Modal } from '@shopify/polaris';
import { AppLayout } from '@/components/layout/AppLayout';
import { CollectionSearch } from '@/components/collections/CollectionSearch';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ImageUpdatePanel } from '@/components/image-update/ImageUpdatePanel';
import { ShopifyCollection, ShopifyProduct } from '@/types/shopify';
import { useShopifyAuth } from '@/hooks/useShopifyAuth';

export function HomePage() {
  const { shop, serverApiService } = useShopifyAuth();
  const [selectedCollection, setSelectedCollection] = useState<ShopifyCollection | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ShopifyProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  
  // Information dialog state
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const handleCollectionSelect = async (collection: ShopifyCollection) => {
    if (!shop || !serverApiService) {
      setProductError('Shop or API service not available');
      return;
    }

    setSelectedCollection(collection);
    setIsLoadingProducts(true);
    setProductError(null);
    setSelectedProducts([]); // Clear selections when changing collection
    
    try {
      console.log('Fetching products from collection:', collection.id);
      
      // Use the server API service to get products from the collection
      const response = await serverApiService.getProductsFromCollection(collection.id, 50);
      setProducts(response.products);
      
      console.log('Products loaded:', response.products.length);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProductError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleProductsSelect = (products: ShopifyProduct[]) => {
    console.log('Selected products:', products);
    setSelectedProducts(products);
  };

  const handleProductSelect = (product: ShopifyProduct) => {
    console.log('Selected product:', product);
    // Toggle selection for single product
    const isSelected = selectedProducts.some(p => p.id === product.id);
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleImageUpdateComplete = () => {
    // Refresh products after image update
    if (selectedCollection) {
      handleCollectionSelect(selectedCollection);
    }
  };

  return (
    <AppLayout title="Product Image Updater">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <CollectionSearch onCollectionSelect={handleCollectionSelect} />
        
        {selectedCollection && (
          <>
            {/* Image Update Panel */}
            <ImageUpdatePanel
              products={products}
              selectedProducts={selectedProducts}
              onProductSelect={handleProductSelect}
              onProductsSelect={handleProductsSelect}
              onImageUpdateComplete={handleImageUpdateComplete}
              serverApiService={serverApiService}
              collectionName={selectedCollection.title}
              collectionId={selectedCollection.id}
            />
            
            {/* Products Display */}
            <Card>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <Text variant="headingMd" as="h2">
                      Products in "{selectedCollection.title}"
                    </Text>
                    
                    <button
                      onClick={() => setShowInfoDialog(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Image update help"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="10" cy="10" r="9" stroke="#d82c0d" strokeWidth="2" fill="none"/>
                        <path d="M10 6v4M10 14h.01" stroke="#d82c0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  {productError && (
                    <div style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#fef7f7', 
                      border: '1px solid #d82c0d', 
                      borderRadius: '4px',
                      color: '#d82c0d'
                    }}>
                      <Text variant="bodySm" as="p">{productError}</Text>
                    </div>
                  )}
                  
                  {isLoadingProducts ? (
                    <div style={{ 
                      padding: '2rem', 
                      textAlign: 'center',
                      color: '#637381'
                    }}>
                      <Text variant="bodyMd" as="p">Loading products...</Text>
                    </div>
                  ) : (
                    <ProductGrid 
                      products={products}
                      selectedProducts={selectedProducts}
                      onProductSelect={handleProductSelect}
                      onProductsSelect={handleProductsSelect}
                    />
                  )}
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
      
      {/* Information Dialog */}
      <Modal
        open={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
        title="Image Update Help"
        primaryAction={{
          content: 'Got it',
          onAction: () => setShowInfoDialog(false),
        }}
      >
        <Modal.Section>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <Text variant="headingSm" as="h4" fontWeight="bold">
                How to Use Image Update Operations
              </Text>
              <Text variant="bodyMd" as="p">
                1. <strong>Select a Collection:</strong> Choose the collection containing products you want to update.
              </Text>
              <Text variant="bodyMd" as="p">
                2. <strong>Select Products:</strong> Use the "Select All" button or individually select products from the list.
              </Text>
              <Text variant="bodyMd" as="p">
                3. <strong>Create Operation:</strong> Click "Create Image Update Operation" to generate a CSV template.
              </Text>
              <Text variant="bodyMd" as="p">
                4. <strong>Download CSV:</strong> Get the template with current image information and IDs.
              </Text>
              <Text variant="bodyMd" as="p">
                5. <strong>Update URLs:</strong> Edit the "New Image URL" column in the CSV file with your new image URLs.
              </Text>
              <Text variant="bodyMd" as="p">
                6. <strong>Upload & Process:</strong> Upload the updated CSV and process the image changes.
              </Text>
            </div>
            
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f6f6f7', 
              borderRadius: '4px',
              border: '1px solid #e1e3e5'
            }}>
              <Text variant="bodySm" as="p" fontWeight="bold">
                Important Notes:
              </Text>
              <Text variant="bodySm" as="p">
                • The CSV includes current image IDs to handle variant-image relationships
                • New image URLs must be publicly accessible
                • Images are processed in order (first image becomes the main product image)
                • Operation history tracks all changes with rollback capability
                • Rate limiting is applied to respect Shopify API limits
              </Text>
            </div>
          </div>
        </Modal.Section>
      </Modal>
    </AppLayout>
  );
}
