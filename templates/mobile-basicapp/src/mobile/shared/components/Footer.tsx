import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer as UIFooter } from '@voilajsx/uikit/footer';
import type { NavigationItem } from '@voilajsx/uikit';

// Footer navigation - FBCA routes
const footerNavigation: NavigationItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'about', label: 'About', href: '/about' },
  { key: 'gallery', label: 'Gallery', href: '/gallery' },
  { key: 'auth', label: 'Login', href: '/auth' },
];

// Configurable Footer Component using UIKit sections
export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <UIFooter tone="subtle" size="xl">
      <div className="flex flex-col space-y-6">
        {/* Footer Navigation */}
        <div className="flex flex-wrap justify-center gap-6">
          {footerNavigation.map((item) => (
            <button
              key={item.key}
              onClick={() => item.href && handleNavigation(item.href)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Branding Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs">
              UI
            </div>
            <span className="font-semibold text-foreground">UIKit FBCA</span>
          </div>

          {/* Copyright */}
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              © 2025 UIKit FBCA • Feature-Based Component Architecture with Page Router
            </p>
          </div>
        </div>
      </div>
    </UIFooter>
  );
};