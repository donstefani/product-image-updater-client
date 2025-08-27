import React from 'react';
import { Page } from '@shopify/polaris';

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AppLayout({ title, children }: AppLayoutProps) {
  return (
    <Page
      title={title}
      subtitle="Update product images by collection"
      backAction={{
        content: 'Back',
        onAction: () => window.history.back(),
      }}
    >
      <div style={{ padding: '1rem 0' }}>
        {children}
      </div>
    </Page>
  );
}
