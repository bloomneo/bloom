import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header as UIHeader, HeaderLogo, HeaderNav } from '@voilajsx/uikit/header';
import { Button } from '@voilajsx/uikit/button';
import { useTheme } from '@voilajsx/uikit/theme-provider';
import type { NavigationItem } from '@voilajsx/uikit';
import {
  Home,
  Images,
  LogIn,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';

// Navigation configuration - FBCA routes
const navigationItems: NavigationItem[] = [
  { key: 'home', label: 'Home', href: '/', icon: Home },
  { key: 'about', label: 'About', href: '/about', icon: BookOpen },
  { key: 'gallery', label: 'Gallery', href: '/gallery', icon: Images },
  { key: 'auth', label: 'Login', href: '/auth', icon: LogIn },
];

// Logo component
const Logo: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-secondary-foreground font-bold text-sm">
      UI
    </div>
    <div>
      <h3 className="voila-brand-logo text-xl font-bold">UIKit FBCA</h3>
      <p className="text-xs text-background">Feature-Based Architecture</p>
    </div>
  </div>
);

// Theme actions component
const ThemeActions: React.FC = () => {
  const { theme, mode, setTheme, availableThemes, toggleMode } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as any)}
        className=" border  border-input rounded px-3 py-2 text-sm focus:outline-none"
      >
        {availableThemes.map(themeId => (
          <option key={themeId} value={themeId}>
            {themeId.charAt(0).toUpperCase() + themeId.slice(1)}
          </option>
        ))}
      </select>

      <Button onClick={toggleMode} variant="secondary" size="sm">
        {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="ml-2 hidden sm:inline">
          {mode === 'dark' ? 'Light' : 'Dark'}
        </span>
      </Button>
    </div>
  );
};

// Configurable Header Component using UIKit sections
export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <UIHeader tone="brand" size="xl" position="sticky">
      <HeaderLogo>
        <Logo />
      </HeaderLogo>

      <HeaderNav
        navigation={navigationItems}
        currentPath={location.pathname}
        onNavigate={handleNavigation}
      />

      <div className="flex items-center">
        <ThemeActions />
      </div>
    </UIHeader>
  );
};