import React, { useState, useEffect } from 'react';
import { Card, Text, Badge, Thumbnail, Button } from '@shopify/polaris';
import { ShopifyProduct } from '@/types/shopify';

interface ProductGridProps {
  products: ShopifyProduct[];
  selectedProducts: ShopifyProduct[];
  onProductSelect?: (product: ShopifyProduct) => void;
  onProductsSelect?: (products: ShopifyProduct[]) => void;
}

export function ProductGrid({ 
  products, 
  selectedProducts: parentSelectedProducts, 
  onProductSelect, 
  onProductsSelect 
}: ProductGridProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const selectedProducts = new Set(parentSelectedProducts.map(p => p.id));

  // Reset expanded products when products change (new collection selected)
  useEffect(() => {
    setExpandedProducts(new Set());
  }, [products]);

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    
    // Notify parent of selection change
    if (onProductsSelect) {
      const selectedProductList = products.filter(p => newSelected.has(p.id));
      onProductsSelect(selectedProductList);
    }
  };

  const selectAllProducts = () => {
    if (onProductsSelect) {
      onProductsSelect(products);
    }
  };

  const clearAllSelections = () => {
    if (onProductsSelect) {
      onProductsSelect([]);
    }
  };

  const openProductInStorefront = (product: ShopifyProduct) => {
    const shop = new URLSearchParams(window.location.search).get('shop');
    if (shop) {
      const storefrontUrl = `https://${shop}/products/${product.handle}`;
      window.open(storefrontUrl, '_blank');
    }
  };

  if (products.length === 0) {
    return (
      <Card>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Text variant="bodyMd" as="p">
            No products found in this collection.
          </Text>
        </div>
      </Card>
    );
  }

  const renderProductItem = (product: ShopifyProduct) => {
    const isSelected = selectedProducts.has(product.id);
    const isExpanded = expandedProducts.has(product.id);
    const imageCount = product.images.length;

    return (
      <div
        key={product.id}
        style={{
          backgroundColor: isSelected ? '#e6faf4' : 'white',
          border: isSelected ? '2px solid #008060' : '1px solid #e1e3e5',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
          overflow: 'visible',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
          marginBottom: '0.5rem'
        }}
      >
        {/* Minimal Detail View */}
        <div 
          style={{ 
            padding: '0.75rem',
            backgroundColor: isSelected ? '#e6faf4' : 'white'
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Product Image Thumbnail */}
            {product.images.length > 0 && (
              <Thumbnail
                source={product.images[0].src}
                alt={product.images[0].alt}
                size="small"
              />
            )}
            
            {/* Product Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                <Badge tone="success">
                  {product.status}
                </Badge>
                <Text variant="headingSm" as="h3">
                  {product.title}
                </Text>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Text variant="bodySm" as="span" color="subdued">
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
                  {selectedProducts.has(product.id) ? 'Clear' : 'Select'}
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
                  <Text variant="bodyMd" as="h4" fontWeight="bold" style={{ marginBottom: '0.5rem' }}>
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
                        <Text variant="bodySm" as="p" color="subdued" style={{ marginTop: '0.25rem' }}>
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
                <Text variant="bodySm" as="span" color="subdued">
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
                  <Text variant="bodySm" as="span" fontWeight="bold">Handle:</Text>
                  <Text variant="bodySm" as="span" style={{ marginLeft: '0.5rem' }}>
                    {product.handle}
                  </Text>
                </div>
                <div>
                  <Text variant="bodySm" as="span" fontWeight="bold">Vendor:</Text>
                  <Text variant="bodySm" as="span" style={{ marginLeft: '0.5rem' }}>
                    {product.vendor}
                  </Text>
                </div>
                <div>
                  <Text variant="bodySm" as="span" fontWeight="bold">Type:</Text>
                  <Text variant="bodySm" as="span" style={{ marginLeft: '0.5rem' }}>
                    {product.product_type}
                  </Text>
                </div>
                <div>
                  <Text variant="bodySm" as="span" fontWeight="bold">Variants:</Text>
                  <Text variant="bodySm" as="span" style={{ marginLeft: '0.5rem' }}>
                    {product.variants.length}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Product Count and Selection Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0.5rem 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ color: '#637381' }}>
            <Text variant="bodySm" as="span">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </Text>
          </div>
          {selectedProducts.size > 0 && (
            <div style={{ color: '#008060' }}>
              <Text variant="bodySm" as="span">
                ({selectedProducts.size} selected)
              </Text>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {selectedProducts.size > 0 && (
            <Button 
              size="slim"
              variant="secondary"
              onClick={clearAllSelections}
            >
              Clear All
            </Button>
          )}
          <Button 
            size="slim"
            variant="primary"
            onClick={selectAllProducts}
          >
            Select All
          </Button>
        </div>
      </div>

      {/* Product List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {products.map(renderProductItem)}
      </div>
    </div>
  );
}
