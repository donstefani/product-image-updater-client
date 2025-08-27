import React, { useState } from 'react';
import { Card, Text, Button, Modal, Banner, Spinner } from '@shopify/polaris';
import { ShopifyProduct, ImageUpdateOperation } from '@/types/shopify';
import { ServerApiService } from '@/services/serverApiService';
import { CSV_HEADERS } from '@/constants/app';

interface ImageUpdatePanelProps {
  products: ShopifyProduct[];
  selectedProducts: ShopifyProduct[];
  onProductSelect: (product: ShopifyProduct) => void;
  onProductsSelect: (products: ShopifyProduct[]) => void;
  onImageUpdateComplete: () => void;
  serverApiService: ServerApiService;
  collectionName: string;
  collectionId: string;
}

export function ImageUpdatePanel({
  products,
  selectedProducts,
  onProductSelect,
  onProductsSelect,
  onImageUpdateComplete,
  serverApiService,
  collectionName,
  collectionId
}: ImageUpdatePanelProps) {
  const [currentOperation, setCurrentOperation] = useState<ImageUpdateOperation | null>(null);
  const [isCreatingOperation, setIsCreatingOperation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState<string | null>(null);

  const handleCreateOperation = async () => {
    if (selectedProducts.length === 0) {
      return;
    }

    setIsCreatingOperation(true);
    setProcessingError(null);
    setProcessingSuccess(null);

    try {
      const productIds = selectedProducts.map(p => p.id);
      const response = await serverApiService.createImageUpdateOperation(collectionId, productIds);
      setCurrentOperation(response.operation);
    } catch (err) {
      console.error('Error creating operation:', err);
      setProcessingError(err instanceof Error ? err.message : 'Failed to create operation');
    } finally {
      setIsCreatingOperation(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!currentOperation) return;

    try {
      const blob = await serverApiService.downloadImageUpdateCSV(currentOperation.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-updates-${collectionName}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setProcessingError(err instanceof Error ? err.message : 'Failed to download CSV');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setUploadedFile(file);
      setUploadError(null);
    } else {
      setUploadError('Please select a valid CSV file');
      setUploadedFile(null);
    }
  };

  const handleUploadCSV = async () => {
    if (!currentOperation || !uploadedFile) return;

    try {
      const response = await serverApiService.uploadImageUpdateCSV(currentOperation.id, uploadedFile);
      if (response.success) {
        setShowUploadModal(false);
        setUploadedFile(null);
        setUploadError(null);
        // Refresh operation status
        const updatedOperation = await serverApiService.getImageUpdateOperation(currentOperation.id);
        setCurrentOperation(updatedOperation.operation);
      } else {
        setUploadError(response.message);
      }
    } catch (err) {
      console.error('Error uploading CSV:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload CSV');
    }
  };

  const handleProcessUpdates = async () => {
    if (!currentOperation) return;

    setIsProcessing(true);
    setProcessingError(null);
    setProcessingSuccess(null);

    try {
      const response = await serverApiService.processImageUpdates(currentOperation.id);
      if (response.success) {
        setProcessingSuccess(response.message);
        onImageUpdateComplete();
        // Refresh operation status
        const updatedOperation = await serverApiService.getImageUpdateOperation(currentOperation.id);
        setCurrentOperation(updatedOperation.operation);
      } else {
        setProcessingError(response.message);
      }
    } catch (err) {
      console.error('Error processing updates:', err);
      setProcessingError(err instanceof Error ? err.message : 'Failed to process updates');
    } finally {
      setIsProcessing(false);
    }
  };

  const canCreateOperation = selectedProducts.length > 0 && !currentOperation;
  const canDownloadCSV = currentOperation && currentOperation.status === 'pending';
  const canUploadCSV = currentOperation && currentOperation.status === 'pending';
  const canProcessUpdates = currentOperation && currentOperation.status === 'pending';

  return (
    <Card>
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Text variant="headingMd" as="h2">
            Image Update Operations
          </Text>

          {/* Error Messages */}
          {processingError && (
            <Banner status="critical">
              <p>{processingError}</p>
            </Banner>
          )}

          {/* Success Messages */}
          {processingSuccess && (
            <Banner status="success">
              <p>{processingSuccess}</p>
            </Banner>
          )}

          {/* Operation Status */}
          {currentOperation && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f6f6f7', 
              borderRadius: '4px',
              border: '1px solid #e1e3e5'
            }}>
              <Text variant="bodyMd" as="h3" fontWeight="bold" style={{ marginBottom: '0.5rem' }}>
                Operation Status
              </Text>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Text variant="bodySm" as="span" fontWeight="bold">Status:</Text>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: 
                    currentOperation.status === 'completed' ? '#d4edda' :
                    currentOperation.status === 'failed' ? '#f8d7da' :
                    currentOperation.status === 'processing' ? '#fff3cd' : '#d1ecf1',
                  color: 
                    currentOperation.status === 'completed' ? '#155724' :
                    currentOperation.status === 'failed' ? '#721c24' :
                    currentOperation.status === 'processing' ? '#856404' : '#0c5460'
                }}>
                  {currentOperation.status.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '12px' }}>
                <Text variant="bodySm" as="span">Products: {currentOperation.products_count}</Text>
                <Text variant="bodySm" as="span">Created: {new Date(currentOperation.created_at).toLocaleString()}</Text>
                {currentOperation.completed_at && (
                  <Text variant="bodySm" as="span">Completed: {new Date(currentOperation.completed_at).toLocaleString()}</Text>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {canCreateOperation && (
              <Button 
                primary
                onClick={handleCreateOperation}
                loading={isCreatingOperation}
              >
                Create Image Update Operation
              </Button>
            )}

            {canDownloadCSV && (
              <Button 
                onClick={handleDownloadCSV}
              >
                Download CSV Template
              </Button>
            )}

            {canUploadCSV && (
              <Button 
                onClick={() => setShowUploadModal(true)}
              >
                Upload Updated CSV
              </Button>
            )}

            {canProcessUpdates && (
              <Button 
                primary
                onClick={handleProcessUpdates}
                loading={isProcessing}
              >
                Process Image Updates
              </Button>
            )}
          </div>

          {/* Instructions */}
          {!currentOperation && selectedProducts.length > 0 && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e1e3e5'
            }}>
              <Text variant="bodyMd" as="h4" fontWeight="bold" style={{ marginBottom: '0.5rem' }}>
                How to Update Images
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '14px' }}>
                <Text variant="bodySm" as="p">1. <strong>Create Operation:</strong> Click "Create Image Update Operation" to generate a CSV template</Text>
                <Text variant="bodySm" as="p">2. <strong>Download CSV:</strong> Get the template with current image information</Text>
                <Text variant="bodySm" as="p">3. <strong>Update URLs:</strong> Edit the "New Image URL" column in the CSV file</Text>
                <Text variant="bodySm" as="p">4. <strong>Upload CSV:</strong> Upload the updated CSV file</Text>
                <Text variant="bodySm" as="p">5. <strong>Process Updates:</strong> Apply the image changes to your products</Text>
              </div>
            </div>
          )}

          {/* CSV Headers Info */}
          {currentOperation && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '4px',
              border: '1px solid #e1e3e5'
            }}>
              <Text variant="bodyMd" as="h4" fontWeight="bold" style={{ marginBottom: '0.5rem' }}>
                CSV File Format
              </Text>
              <div style={{ fontSize: '12px' }}>
                <Text variant="bodySm" as="p">The CSV file contains these columns:</Text>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {Object.entries(CSV_HEADERS).map(([key, label]) => (
                    <li key={key}>
                      <Text variant="bodySm" as="span" fontWeight="bold">{label}:</Text>
                      <Text variant="bodySm" as="span"> {key}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Updated CSV"
        primaryAction={{
          content: 'Upload',
          onAction: handleUploadCSV,
          disabled: !uploadedFile,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setShowUploadModal(false),
          },
        ]}
      >
        <Modal.Section>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Text variant="bodyMd" as="p">
              Select the updated CSV file with your new image URLs:
            </Text>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{
                padding: '0.5rem',
                border: '1px solid #e1e3e5',
                borderRadius: '4px',
                width: '100%'
              }}
            />

            {uploadError && (
              <Banner status="critical">
                <p>{uploadError}</p>
              </Banner>
            )}

            {uploadedFile && (
              <Banner status="success">
                <p>File selected: {uploadedFile.name}</p>
              </Banner>
            )}
          </div>
        </Modal.Section>
      </Modal>
    </Card>
  );
}
