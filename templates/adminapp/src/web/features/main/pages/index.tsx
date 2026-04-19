import React from 'react';
import { useAuth } from '../../auth';
import LoginPage from '../../auth/pages/login';
import Dashboard from './dashboard';

const MainPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if authenticated
  if (isAuthenticated) {
    return <Dashboard />;
  }

  // Show login page if not authenticated
  return <LoginPage />;
};

export default MainPage;