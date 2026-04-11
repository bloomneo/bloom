/**
 * Main App Component - FBCA Architecture
 * Feature-Based Component Architecture with auto-discovery routing
 */

import { HashRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@bloomneo/uikit';
import { PageRouter } from './lib/page-router';
import { ErrorBoundary } from './shared/components';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme="base" mode="light" forceConfig={true}>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <PageRouter />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;