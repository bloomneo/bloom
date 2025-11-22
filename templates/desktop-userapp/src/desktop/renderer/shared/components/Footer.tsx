import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer as UIFooter } from '@voilajsx/uikit/footer';
import type { NavigationItem } from '@voilajsx/uikit';

// Footer navigation - FBCA routes
const footerNavigation: NavigationItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'terms', label: 'Terms of Service', href: '/terms' },
  { key: 'privacy', label: 'Privacy Policy', href: '/privacy' },
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
              U
            </div>
            <span className="font-semibold text-foreground">UserApp</span>
          </div>

          {/* Copyright */}
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} UserApp • All rights reserved
            </p>
          </div>
        </div>
      </div>
    </UIFooter>
  );
};