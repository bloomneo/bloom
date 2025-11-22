import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header as UIHeader, HeaderLogo, HeaderNav } from '@voilajsx/uikit/header';
import { Button } from '@voilajsx/uikit/button';
import { useTheme } from '@voilajsx/uikit/theme-provider';
import { useAuth } from '../../features/auth';
import { hasRole, route } from '../utils';
import type { NavigationItem } from '@voilajsx/uikit';
import {
  LayoutDashboard,
  User,
  LogOut,
  Sun,
  Moon,
  Shield,
  LogIn,
  UserPlus,
} from 'lucide-react';

// Logo component
const Logo: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-secondary-foreground font-bold text-sm">
      UA
    </div>
    <div>
      <h3 className="voila-brand-logo text-xl font-bold">UserApp</h3>
      <p className="text-xs text-background">User Management</p>
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

// Unified Header Component that handles both authenticated and public states
export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Build navigation items based on authentication state
  const navigationItems: NavigationItem[] = [];

  if (isAuthenticated) {
    // Authenticated navigation
    navigationItems.push(
      { key: 'dashboard', label: 'Dashboard', href: route('/'), icon: LayoutDashboard },
      { key: 'profile', label: 'Profile', href: route('/user'), icon: User }
    );

    // Add admin menu items based on role
    if (user && hasRole(user, ['admin.tenant', 'admin.org', 'admin.system'])) {
      navigationItems.push({
        key: 'admin',
        label: 'Admin',
        href: route('/user/admin'),
        icon: Shield
      });
    }

    // Always add logout for authenticated users
    navigationItems.push({
      key: 'logout',
      label: 'Sign Out',
      href: route('/auth/logout'),
      icon: LogOut
    });
  } else {
    // Public navigation
    navigationItems.push(
      {
        key: 'login',
        label: 'Sign In',
        href: route('/auth/login'),
        icon: LogIn
      },
      {
        key: 'register',
        label: 'Sign Up',
        href: route('/auth/register'),
        icon: UserPlus
      }
    );
  }

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

      <div className="flex items-center ml-2">
        <ThemeActions />
      </div>
    </UIHeader>
  );
};

// Export PublicHeader as alias for backward compatibility
export const PublicHeader = Header;