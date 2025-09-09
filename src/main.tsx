import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import { HomePage } from '@/pages/HomePage';
import { AppBridgeProviderWrapper } from '@/components/common/AppBridgeProvider';
import { PasswordProvider, usePasswordAuth } from '@/contexts/PasswordContext';
import { PasswordPage } from '@/components/auth/PasswordPage';

// Global styles to ensure full width
const globalStyles = `
  body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    max-width: 100%;
  }
  
  #root {
    min-height: 100vh;
  }
`;

// Inject global styles
const styleSheet = document.createElement('style');
styleSheet.textContent = globalStyles;
document.head.appendChild(styleSheet);

// Main App Component that handles authentication
function App() {
  const { isAuthenticated, setIsAuthenticated } = usePasswordAuth();

  if (!isAuthenticated) {
    return <PasswordPage onPasswordCorrect={() => setIsAuthenticated(true)} />;
  }

  return (
    <AppBridgeProviderWrapper>
      <HomePage />
    </AppBridgeProviderWrapper>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider i18n={{}}>
      <PasswordProvider>
        <App />
      </PasswordProvider>
    </AppProvider>
  </React.StrictMode>,
);
