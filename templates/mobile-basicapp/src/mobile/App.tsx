/**
 * Main App Component - Mobile FBCA Architecture
 * Feature-Based Component Architecture with MobileLayout
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import { MobileLayout, SafeArea, TabBar, ThemeProvider } from '@bloomneo/uikit';
import { PageRouter } from './lib/page-router';
import { Home, Settings } from 'lucide-react';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  // Sync active tab with current route
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('home');
    } else if (location.pathname === '/settings') {
      setActiveTab('settings');
    }
  }, [location.pathname]);

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
    if (tabKey === 'home') {
      navigate('/');
    } else if (tabKey === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <SafeArea edges={['top', 'bottom']} tone="clean">
      <MobileLayout scheme="tabbed" tone="clean" size="lg">
        <MobileLayout.Content>
          <PageRouter />
        </MobileLayout.Content>
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          tone="clean"
          size="md"
          variant="default"
        />
      </MobileLayout>
    </SafeArea>
  );
}

function App() {
  return (
    <ThemeProvider theme="base" mode="light" forceConfig={true}>
      <Router basename="/">
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;