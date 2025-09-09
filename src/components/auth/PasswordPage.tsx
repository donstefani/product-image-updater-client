import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  TextField, 
  Button, 
  Banner,
  BlockStack
} from '@shopify/polaris';
import { APP_CONFIG } from '@/constants/app';

interface PasswordPageProps {
  onPasswordCorrect: () => void;
}

export function PasswordPage({ onPasswordCorrect }: PasswordPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password from app config
  const correctPassword = APP_CONFIG.password;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === correctPassword) {
      // Store authentication in session storage
      sessionStorage.setItem('piu-authenticated', 'true');
      onPasswordCorrect();
    } else {
      setError('Incorrect password. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f6f6f7',
      padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Card>
          <div style={{ padding: '2rem' }}>
            <BlockStack gap="500">
              <div style={{ textAlign: 'center' }}>
                <Text variant="headingLg" as="h1">
                  Product Image Updater
                </Text>
                <div style={{ marginTop: '0.5rem' }}>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    Enter password to access the application
                  </Text>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <BlockStack gap="400">
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />

                  {error && (
                    <Banner tone="critical">
                      <Text variant="bodySm" as="p">{error}</Text>
                    </Banner>
                  )}

                  <Button
                    submit
                    variant="primary"
                    size="large"
                    loading={isLoading}
                    disabled={!password.trim()}
                  >
                    Enter Application
                  </Button>
                </BlockStack>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Text variant="bodySm" as="p" tone="subdued">
                  This application is password protected for security.
                </Text>
              </div>
            </BlockStack>
          </div>
        </Card>
      </div>
    </div>
  );
}
