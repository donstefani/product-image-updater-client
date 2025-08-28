import React, { useState } from 'react';
import { Card, Text, Button, Modal, Banner } from '@shopify/polaris';
import { ShopifyProduct, ShopifyCollection, ImageUpdateOperation } from '@/types/shopify';
import { ServerApiService } from '@/services/serverApiService';

interface ImageUpdatePanelProps {
  selectedProducts: ShopifyProduct[];
  selectedCollection: ShopifyCollection;
  onOperationComplete?: (operation: ImageUpdateOperation) => void;
}

export function ImageUpdatePanel({ 
  selectedProducts, 
  selectedCollection,
  onOperationComplete 
}: ImageUpdatePanelProps) {
  const [currentOperation, setCurrentOperation] = useState<ImageUpdateOperation | null>(null);
  const [isCreatingOperation, setIsCreatingOperation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [serverApiService] = useState(() => new ServerApiService());

  // Computed properties for UI state
  const canCreateOperation = selectedProducts.length > 0 && !currentOperation;
  const canDownloadCSV = currentOperation && currentOperation.status === 'pending';
  const canUploadCSV = currentOperation && currentOperation.status === 'pending';
  const canProcessUpdates = currentOperation && currentOperation.status === 'pending';

  const handleCreateOperation = async () => {
    if (selectedProducts.length === 0) return;

    setIsCreatingOperation(true);
    setProcessingError(null);

    try {
      console.log('Creating image update operation for', selectedProducts.length, 'products');
      
      // Call the real server API to create an operation
      const response = await serverApiService.createImageUpdateOperation(
        selectedCollection.id,
        selectedProducts.map(p => p.id)
      );
      
      console.log('Full response from create operation:', response);
      setCurrentOperation(response.operation);
      setProcessingSuccess('Operation created successfully!');
      console.log('Operation created:', response.operation);
    } catch (error) {
      setProcessingError('Failed to create operation. Please try again.');
      console.error('Create operation error:', error);
    } finally {
      setIsCreatingOperation(false);
    }
  };

  const handleDownloadCSV = async () => {
    console.log('handleDownloadCSV called, currentOperation:', currentOperation);
    if (!currentOperation) {
      console.error('No current operation available');
      return;
    }

    try {
      console.log('Downloading CSV for operation:', currentOperation.operationId);
      
      // Call the real server API to download CSV
      const csvBlob = await serverApiService.downloadImageUpdateCSV(currentOperation.operationId);
      
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-updates-${currentOperation.operationId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setProcessingSuccess('CSV template downloaded successfully!');
    } catch (error) {
      setProcessingError('Failed to download CSV template. Please try again.');
      console.error('Download CSV error:', error);
    }
  };

  const handleUploadCSV = async (file: File) => {
    if (!currentOperation) return;

    try {
      console.log('Uploading CSV for operation:', currentOperation.operationId);
      
      // Call the real server API to upload CSV
      const response = await serverApiService.uploadImageUpdateCSV(currentOperation.operationId, file);
      
      setUploadedFile(file);
      setShowUploadModal(false);
      setProcessingSuccess(response.message || 'CSV file uploaded successfully!');
    } catch (error) {
      setProcessingError('Failed to upload CSV file. Please try again.');
      console.error('Upload CSV error:', error);
    }
  };

  const handleProcessUpdates = async () => {
    if (!currentOperation || !uploadedFile) return;

    setIsProcessing(true);
    setProcessingError(null);

    try {
      console.log('Processing image updates for operation:', currentOperation.operationId);
      
      // Call the real server API to process updates
      const response = await serverApiService.processImageUpdates(currentOperation.operationId);
      
      // Get the updated operation status
      const operationResponse = await serverApiService.getImageUpdateOperation(currentOperation.operationId);
      const updatedOperation = operationResponse.operation;

      setCurrentOperation(updatedOperation);
      setProcessingSuccess(response.message || 'Image updates processed successfully!');
      
      if (onOperationComplete) {
        onOperationComplete(updatedOperation);
      }
    } catch (error) {
      setProcessingError('Failed to process image updates. Please try again.');
      console.error('Process updates error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      handleUploadCSV(file);
    } else {
      setProcessingError('Please select a valid CSV file.');
    }
  };

  return (
    <Card>
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <Text variant="headingMd" as="h2">
              Image Update Operations
            </Text>
            <Text variant="bodyMd" as="p">
              Manage image update operations for selected products
            </Text>
          </div>

          {/* Error Messages */}
          {processingError && (
            <Banner tone="critical">
              <p>{processingError}</p>
            </Banner>
          )}

          {/* Success Messages */}
          {processingSuccess && (
            <Banner tone="success">
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
              <Text variant="bodyMd" as="h3" fontWeight="bold">
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
                <Text variant="bodySm" as="span">Products: {currentOperation.productsCount}</Text>
                <Text variant="bodySm" as="span">Created: {new Date(currentOperation.timestamp).toLocaleString()}</Text>
                <Text variant="bodySm" as="span">Status: {currentOperation.status}</Text>
                <Text variant="bodySm" as="span">Images Updated: {currentOperation.imagesUpdated}</Text>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {canCreateOperation && (
              <Button 
                variant="primary"
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
                variant="primary"
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
              <Text variant="bodyMd" as="h4" fontWeight="bold">
                Next Steps
              </Text>
              <Text variant="bodyMd" as="p">
                1. Create an image update operation for {selectedProducts.length} selected product{selectedProducts.length !== 1 ? 's' : ''}
              </Text>
              <Text variant="bodyMd" as="p">
                2. Download the CSV template and fill in the new image URLs
              </Text>
              <Text variant="bodyMd" as="p">
                3. Upload the updated CSV and process the changes
              </Text>
            </div>
          )}

          {/* Upload Modal */}
          <Modal
            open={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            title="Upload CSV File"
            primaryAction={{
              content: 'Upload',
              onAction: () => {
                const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
                if (fileInput?.files?.[0]) {
                  handleFileChange({ target: { files: fileInput.files } } as any);
                }
              },
            }}
            secondaryActions={[
              {
                content: 'Cancel',
                onAction: () => setShowUploadModal(false),
              },
            ]}
          >
            <Modal.Section>
              <Text variant="bodyMd" as="p">
                Select a CSV file with updated image URLs:
              </Text>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ marginTop: '1rem' }}
              />
            </Modal.Section>
          </Modal>
        </div>
      </div>
    </Card>
  );
}
