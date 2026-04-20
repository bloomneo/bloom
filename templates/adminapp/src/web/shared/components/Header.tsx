import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Header as UIHeader, HeaderLogo, HeaderNav, type NavigationItem } from '@bloomneo/uikit';
import { useAuth } from '../../features/auth';
import { hasRole, route } from '../utils';
import {
  LayoutDashboard,
  User,
  LogOut,
  Shield,
  LogIn,
  UserPlus,
} from 'lucide-react';

// Logo component. Wrapped in a <Link> so clicking the brand mark
// returns to the home page — universal expectation on any SaaS site.
// Using react-router <Link> so the click is a SPA navigation, not a
// full-page reload.
const Logo: React.FC = () => (
  <Link to="/" className="flex items-center gap-3 no-underline">
    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-secondary-foreground font-bold text-sm">
      UI
    </div>
    <div>
      <h3 className="voila-brand-logo text-xl font-bold">MyApp</h3>
      <p className="text-xs text-background">Feature-Based Architecture</p>
    </div>
  </Link>
);

// Unified Header Component that handles both authenticated and public states
// Theme + mode switcher moved to /admin/settings so the public header
// stays brand-focused. Add it back here if you want per-visitor theme
// control on the marketing site.
export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Build navigation items based on authentication state
  const navigationItems: NavigationItem[] = [];

  if (isAuthenticated) {
    // Authenticated navigation
    navigationItems.push(
      { key: 'dashboard', label: 'Dashboard', href: route('/dashboard'), icon: LayoutDashboard },
      { key: 'profile', label: 'Profile', href: route('/profile'), icon: User }
    );

    // Add admin menu items based on role
    if (user && hasRole(user, ['admin.tenant', 'admin.org', 'admin.system'])) {
      navigationItems.push({
        key: 'admin',
        label: 'Admin',
        href: route('/admin'),
        icon: Shield
      });
    }

    // Always add logout for authenticated users
    navigationItems.push({
      key: 'logout',
      label: 'Sign Out',
      href: route('/logout'),
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

    </UIHeader>
  );
};

// Export PublicHeader as alias for backward compatibility
export const PublicHeader = Header;