import { useState } from 'react';
import { Card, Text, Modal, Button } from '@shopify/polaris';
import { AppLayout } from '@/components/layout/AppLayout';
import { CollectionSearch } from '@/components/collections/CollectionSearch';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ImageUpdatePanel } from '@/components/image-update/ImageUpdatePanel';
import { ShopifyCollection, ShopifyProduct, ImageUpdateOperation } from '@/types/shopify';
import { useShopifyAuth } from '@/hooks/useShopifyAuth';

export function HomePage() {
  const { shop, serverApiService } = useShopifyAuth();
  const [selectedCollection, setSelectedCollection] = useState<ShopifyCollection | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
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
    setSelectedProductIds(new Set()); // Clear selections when changing collection
    
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

  const handleProductsSelect = (productIds: string[]) => {
    console.log('Selected product IDs:', productIds);
    setSelectedProductIds(new Set(productIds));
  };

  const handleProductSelect = (productId: string) => {
    console.log('Selected product ID:', productId);
    // Toggle selection for single product
    const newSelected = new Set(selectedProductIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProductIds(newSelected);
  };

  const handleImageUpdateComplete = (operation: ImageUpdateOperation) => {
    console.log('Image update completed:', operation);
    // Refresh products after image update
    if (selectedCollection) {
      handleCollectionSelect(selectedCollection);
    }
  };

  // Get selected products from IDs
  const selectedProducts = products.filter(product => selectedProductIds.has(product.id));

  return (
    <AppLayout title="Product Image Updater">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <CollectionSearch onCollectionSelect={handleCollectionSelect} />
        
        {selectedCollection && (
          <>
            {/* Image Update Panel */}
            <ImageUpdatePanel
              selectedProducts={selectedProducts}
              onOperationComplete={handleImageUpdateComplete}
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
                      Products in {selectedCollection.title}
                    </Text>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Button 
                        size="slim"
                        onClick={() => setShowInfoDialog(true)}
                      >
                        How it works
                      </Button>
                    </div>
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

                  {isLoadingProducts && (
                    <div style={{ 
                      padding: '1rem', 
                      textAlign: 'center',
                      color: '#637381'
                    }}>
                      <Text variant="bodyMd" as="p">Loading products...</Text>
                    </div>
                  )}

                  {!isLoadingProducts && products.length > 0 && (
                    <ProductGrid
                      products={products}
                      selectedProducts={selectedProductIds}
                      onProductSelect={handleProductSelect}
                      onProductsSelect={handleProductsSelect}
                    />
                  )}

                  {!isLoadingProducts && products.length === 0 && !productError && (
                    <div style={{ 
                      padding: '2rem', 
                      textAlign: 'center',
                      color: '#637381'
                    }}>
                      <Text variant="bodyMd" as="p">
                        No products found in this collection.
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Information Dialog */}
        <Modal
          open={showInfoDialog}
          onClose={() => setShowInfoDialog(false)}
          title="How Product Image Updater Works"
          primaryAction={{
            content: 'Got it',
            onAction: () => setShowInfoDialog(false),
          }}
        >
          <Modal.Section>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Text variant="bodyMd" as="p">
                The Product Image Updater helps you update product images in bulk:
              </Text>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Text variant="bodyMd" as="p" fontWeight="bold">1. Search Collections</Text>
                <Text variant="bodySm" as="p">
                  Find the collection containing products you want to update
                </Text>
                
                <Text variant="bodyMd" as="p" fontWeight="bold">2. Select Products</Text>
                <Text variant="bodySm" as="p">
                  Choose which products need image updates
                </Text>
                
                <Text variant="bodyMd" as="p" fontWeight="bold">3. Create Operation</Text>
                <Text variant="bodySm" as="p">
                  Generate a CSV template with current image information
                </Text>
                
                <Text variant="bodyMd" as="p" fontWeight="bold">4. Update CSV</Text>
                <Text variant="bodySm" as="p">
                  Fill in the new image URLs in the CSV file
                </Text>
                
                <Text variant="bodyMd" as="p" fontWeight="bold">5. Process Updates</Text>
                <Text variant="bodySm" as="p">
                  Upload the CSV and apply the image changes
                </Text>
              </div>
              
              <Text variant="bodyMd" as="p">
                This tool ensures that variant images are correctly updated and old images are cleaned up.
              </Text>
            </div>
          </Modal.Section>
        </Modal>
      </div>
    </AppLayout>
  );
}
