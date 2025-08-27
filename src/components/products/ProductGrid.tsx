import { useState } from 'react';
import { Card, Text, Badge, Thumbnail, Button } from '@shopify/polaris';
import { ShopifyProduct } from '@/types/shopify';

interface ProductGridProps {
  products: ShopifyProduct[];
  selectedProducts: Set<string>;
  onProductSelect?: (productId: string) => void;
  onProductsSelect?: (productIds: string[]) => void;
}

export function ProductGrid({ 
  products, 
  selectedProducts, 
  onProductSelect,
  onProductsSelect 
}: ProductGridProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const toggleProductSelection = (productId: string) => {
    if (onProductSelect) {
      onProductSelect(productId);
    }
  };

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const openProductInStorefront = (product: ShopifyProduct) => {
    const shop = new URLSearchParams(window.location.search).get('shop');
    if (shop) {
      const storefrontUrl = `https://${shop}/products/${product.handle}`;
      window.open(storefrontUrl, '_blank');
    }
  };

  const selectAllProducts = () => {
    if (onProductsSelect) {
      const allProductIds = products.map(p => p.id);
      onProductsSelect(allProductIds);
    }
  };

  const clearAllProducts = () => {
    if (onProductsSelect) {
      onProductsSelect([]);
    }
  };

  const selectedCount = selectedProducts.size;
  const totalCount = products.length;

  return (
    <Card>
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text variant="headingMd" as="h2">
                Products ({totalCount})
              </Text>
              <Text variant="bodyMd" as="p">
                Select products to update images
              </Text>
            </div>
            
            {onProductsSelect && totalCount > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button 
                  size="slim"
                  onClick={selectAllProducts}
                  disabled={selectedCount === totalCount}
                >
                  Select All
                </Button>
                <Button 
                  size="slim"
                  onClick={clearAllProducts}
                  disabled={selectedCount === 0}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Selection Summary */}
          {selectedCount > 0 && (
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: '#f0f9ff', 
              border: '1px solid #0ea5e9', 
              borderRadius: '4px'
            }}>
              <Text variant="bodyMd" as="p" fontWeight="bold">
                {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
              </Text>
            </div>
          )}

          {/* Products List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {products.map((product) => {
              const isSelected = selectedProducts.has(product.id);
              const isExpanded = expandedProducts.has(product.id);
              const imageCount = product.images.length;

              return (
                <div key={product.id}>
                  {/* Product Card */}
                  <div
                    style={{
                      padding: '1rem',
                      border: '1px solid #e1e3e5',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? '#f0f9ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => toggleProductSelection(product.id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isSelected ? '#e0f2fe' : '#f6f6f7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isSelected ? '#f0f9ff' : 'white';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      
                      {/* Product Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                     {isSelected && (
                             <Badge tone="success">Selected</Badge>
                           )}
                          <Text variant="bodyMd" as="h3" fontWeight="bold">
                            {product.title}
                          </Text>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <Text variant="bodySm" as="span">
                            {imageCount} image{imageCount !== 1 ? 's' : ''}
                          </Text>
                          
                          {/* Details Link */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProductExpansion(product.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#008060',
                              fontSize: '12px',
                              textDecoration: 'underline',
                              padding: '0'
                            }}
                          >
                            {isExpanded ? 'Hide details' : 'Show details'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {onProductSelect && (
                          <Button 
                            size="slim"
                            onClick={() => toggleProductSelection(product.id)}
                          >
                            {isSelected ? 'Clear' : 'Select'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details View */}
                  {isExpanded && (
                    <div style={{ 
                      padding: '1rem', 
                      borderTop: '1px solid #e1e3e5',
                      backgroundColor: '#f6f6f7'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        {/* Product Images Grid */}
                        {product.images.length > 0 && (
                          <div>
                            <Text variant="bodyMd" as="h4" fontWeight="bold">
                              Product Images ({product.images.length})
                            </Text>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                              gap: '0.5rem'
                            }}>
                              {product.images.map((image, index) => (
                                <div key={image.id} style={{ textAlign: 'center' }}>
                                  <Thumbnail
                                    source={image.src}
                                    alt={image.alt}
                                    size="small"
                                  />
                                  <Text variant="bodySm" as="p">
                                    Image {index + 1}
                                  </Text>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Storefront Link */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <Button 
                            size="slim"
                            variant="secondary"
                            onClick={() => openProductInStorefront(product)}
                          >
                            View in Store
                          </Button>
                          <Text variant="bodySm" as="span">
                            Opens in new window
                          </Text>
                        </div>

                        {/* Product Details */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '1rem',
                          fontSize: '12px'
                        }}>
                          <div>
                            <Text variant="bodySm" as="span" fontWeight="bold">Vendor:</Text>
                            <Text variant="bodySm" as="span">
                              {product.vendor}
                            </Text>
                          </div>
                          <div>
                            <Text variant="bodySm" as="span" fontWeight="bold">Type:</Text>
                            <Text variant="bodySm" as="span">
                              {product.product_type}
                            </Text>
                          </div>
                          <div>
                            <Text variant="bodySm" as="span" fontWeight="bold">Status:</Text>
                            <Text variant="bodySm" as="span">
                              {product.status}
                            </Text>
                          </div>
                          <div>
                            <Text variant="bodySm" as="span" fontWeight="bold">Variants:</Text>
                            <Text variant="bodySm" as="span">
                              {product.variants.length}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {products.length === 0 && (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center',
              color: '#637381'
            }}>
              <Text variant="bodyMd" as="p">
                No products found. Please search for a collection first.
              </Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
