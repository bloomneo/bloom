/**
 * Main App Component - FBCA Architecture
 * Feature-Based Component Architecture with auto-discovery routing
 */

import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './features/auth';
import { UserProvider } from './features/user';
import { PageRouter } from './lib/page-router';

function App() {
  return (
    <Router basename="/">
      <AuthProvider>
        <UserProvider>
          <PageRouter />
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;